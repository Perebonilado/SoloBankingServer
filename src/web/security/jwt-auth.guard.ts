import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { TokenService } from '../../auth/token.service.js';
import type { RevokedTokenRepository } from '../../business/repositories/revoked-token.repository.js';
import { REVOKED_TOKEN_REPOSITORY } from '../../business/repositories/tokens.js';

export interface AuthenticatedUser {
  id: string;
  tokenId: string;
  tokenExpiresAt: Date;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    @Inject(REVOKED_TOKEN_REPOSITORY)
    private readonly revokedTokens: RevokedTokenRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const verified = this.tokens.verify(header.slice('Bearer '.length));
    if (!verified || (await this.revokedTokens.isRevoked(verified.tokenId))) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.user = {
      id: verified.userId,
      tokenId: verified.tokenId,
      tokenExpiresAt: verified.expiresAt,
    };
    return true;
  }
}
