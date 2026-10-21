import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { TokenService } from '../../auth/token.service.js';

export interface AuthenticatedUser {
  id: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const userId = this.tokens.verify(header.slice('Bearer '.length));
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.user = { id: userId };
    return true;
  }
}
