export interface RevokeTokenInput {
  tokenId: string;
  userId: string;
  expiresAt: Date;
}

export interface RevokedTokenRepository {
  revoke(input: RevokeTokenInput): Promise<void>;
  isRevoked(tokenId: string): Promise<boolean>;
  deleteExpired(now: Date): Promise<void>;
}
