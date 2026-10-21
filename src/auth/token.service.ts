import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

export interface IssuedToken {
  token: string;
  expiresIn: number;
}

export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly ttl: string,
  ) {}

  issue(userId: string): IssuedToken {
    const token = jwt.sign({}, this.secret, {
      algorithm: 'HS256',
      subject: userId,
      jwtid: randomUUID(),
      expiresIn: this.ttl as jwt.SignOptions['expiresIn'],
    });
    const { iat, exp } = jwt.decode(token) as jwt.JwtPayload;
    return { token, expiresIn: (exp ?? 0) - (iat ?? 0) };
  }

  verify(token: string): string | null {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
      if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
        return null;
      }
      return decoded.sub;
    } catch {
      return null;
    }
  }
}
