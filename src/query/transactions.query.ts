import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountNotFoundError } from '../business/domain/errors/errors.js';
import { toKobo } from '../business/domain/values/money.js';
import { TransactionStatus } from '../business/domain/values/transaction-status.js';
import { AccountModel, TransactionModel } from '../web/database/models/index.js';
import { buildPagination, clampPagination } from './shared/pagination.js';

export interface TransactionFilters {
  userId: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TransactionsQuery {
  constructor(
    @InjectModel(AccountModel) private readonly accounts: typeof AccountModel,
    @InjectModel(TransactionModel)
    private readonly transactions: typeof TransactionModel,
  ) {}

  async execute(filters: TransactionFilters) {
    const account = await this.accounts.findOne({
      where: { userId: filters.userId },
    });
    if (!account) throw new AccountNotFoundError();

    const { page, limit, offset } = clampPagination(filters);
    const { rows, count } = await this.transactions.findAndCountAll({
      where: { accountId: account.id, status: TransactionStatus.COMPLETED },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      transactions: rows.map((row) => ({
        reference: row.id,
        type: row.type,
        amountKobo: toKobo(row.amountKobo),
        counterpartyName: row.counterpartyName,
        description: row.description,
        createdAt: row.createdAt as Date,
      })),
      pagination: buildPagination(page, limit, count),
    };
  }
}
