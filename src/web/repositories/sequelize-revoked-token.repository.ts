import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type {
  RevokedTokenRepository,
  RevokeTokenInput,
} from '../../business/repositories/revoked-token.repository.js';
import { RevokedTokenModel } from '../database/models/index.js';

@Injectable()
export class SequelizeRevokedTokenRepository implements RevokedTokenRepository {
  constructor(
    @InjectModel(RevokedTokenModel)
    private readonly tokens: typeof RevokedTokenModel,
  ) {}

  async revoke(input: RevokeTokenInput): Promise<void> {
    await this.tokens.findOrCreate({
      where: { tokenId: input.tokenId },
      defaults: { ...input },
    });
  }

  async isRevoked(tokenId: string): Promise<boolean> {
    const count = await this.tokens.count({ where: { tokenId } });
    return count > 0;
  }

  async deleteExpired(now: Date): Promise<void> {
    await this.tokens.destroy({ where: { expiresAt: { [Op.lt]: now } } });
  }
}
