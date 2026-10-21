import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import type { Account } from '../../business/domain/entities/account.js';
import type { AccountRepository } from '../../business/repositories/account.repository.js';
import { AccountModel } from '../database/models/index.js';
import { toAccountEntity } from './mappers.js';

@Injectable()
export class SequelizeAccountRepository implements AccountRepository {
  constructor(
    @InjectModel(AccountModel) private readonly accounts: typeof AccountModel,
  ) {}

  async findByUserId(userId: string, tx?: unknown): Promise<Account | null> {
    const row = await this.accounts.findOne({
      where: { userId },
      transaction: tx as Transaction | undefined,
    });
    return row ? toAccountEntity(row) : null;
  }

  async findByAccountNumber(
    accountNumber: string,
    tx?: unknown,
  ): Promise<Account | null> {
    const row = await this.accounts.findOne({
      where: { accountNumber },
      transaction: tx as Transaction | undefined,
    });
    return row ? toAccountEntity(row) : null;
  }

  async findByIdForUpdate(id: string, tx: unknown): Promise<Account | null> {
    const row = await this.accounts.findOne({
      where: { id },
      transaction: tx as Transaction,
      lock: Transaction.LOCK.UPDATE,
    });
    return row ? toAccountEntity(row) : null;
  }

  async save(account: Account, tx?: unknown): Promise<void> {
    await this.accounts.update(
      { balanceKobo: account.balanceKobo },
      { where: { id: account.id }, transaction: tx as Transaction | undefined },
    );
  }
}
