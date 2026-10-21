import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicKey } from 'node:crypto';
import {
  LoginHandler,
  type LoginRequest,
} from '../../business/handlers/identity/login.handler.js';
import { LogoutHandler } from '../../business/handlers/identity/logout.handler.js';
import { CurrentUser } from '../security/current-user.decorator.js';
import {
  EncryptedPayloadPipe,
  loadPrivateKey,
} from '../security/encrypted-payload.pipe.js';
import {
  type AuthenticatedUser,
  JwtAuthGuard,
} from '../security/jwt-auth.guard.js';
import { LoginDto } from '../validation/auth.dto.js';

@Controller('auth')
export class AuthController {
  private readonly keyId: string;
  private readonly publicKey: string;

  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly logoutHandler: LogoutHandler,
    config: ConfigService,
  ) {
    this.keyId = config.getOrThrow<string>('RSA_KEY_ID');
    this.publicKey = createPublicKey(loadPrivateKey(config))
      .export({ type: 'spki', format: 'der' })
      .toString('base64');
  }

  @Get('public-key')
  getPublicKey() {
    return { keyId: this.keyId, publicKey: this.publicKey };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body(EncryptedPayloadPipe(LoginDto)) credentials: LoginRequest) {
    const response = await this.loginHandler.handle({
      accountNumber: credentials.accountNumber,
      passKey: credentials.passKey,
    });
    return response.data;
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: AuthenticatedUser) {
    await this.logoutHandler.handle({
      userId: user.id,
      tokenId: user.tokenId,
      expiresAt: user.tokenExpiresAt,
    });
  }
}
