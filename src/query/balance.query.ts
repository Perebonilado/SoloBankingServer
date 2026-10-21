import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountNotFoundError } from '../business/domain/errors/errors.js';
import { toKobo } from '../business/domain/values/money.js';
import { AccountModel } from '../web/database/models/index.js';

@Injectable()
export class BalanceQuery {
  constructor(
    @InjectModel(AccountModel) private readonly accounts: typeof AccountModel,
  ) {}

  async execute(userId: string) {
    const row = await this.accounts.findOne({ where: { userId } });
    if (!row) throw new AccountNotFoundError();
    return { accountNumber: row.accountNumber, balanceKobo: toKobo(row.balanceKobo) };
  }
}
