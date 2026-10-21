import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction as SequelizeTransaction, UniqueConstraintError } from 'sequelize';
import type { Transaction } from '../../business/domain/entities/transaction.js';
import type {
  CreateTransactionInput,
  TransactionRepository,
} from '../../business/repositories/transaction.repository.js';
import { TransactionModel } from '../database/models/index.js';
import { toTransactionEntity } from './mappers.js';

@Injectable()
export class SequelizeTransactionRepository implements TransactionRepository {
  constructor(
    @InjectModel(TransactionModel)
    private readonly transactions: typeof TransactionModel,
  ) {}

  async findByIdempotencyKey(
    accountId: string,
    idempotencyKey: string,
  ): Promise<Transaction | null> {
    const row = await this.transactions.findOne({
      where: { accountId, idempotencyKey },
    });
    return row ? toTransactionEntity(row) : null;
  }

  async findByIdForUpdate(id: string, tx: unknown): Promise<Transaction | null> {
    const row = await this.transactions.findOne({
      where: { id },
      transaction: tx as SequelizeTransaction,
      lock: SequelizeTransaction.LOCK.UPDATE,
    });
    return row ? toTransactionEntity(row) : null;
  }

  async create(
    input: CreateTransactionInput,
    tx?: unknown,
  ): Promise<Transaction> {
    try {
      const row = await this.transactions.create(
        { ...input },
        { transaction: tx as SequelizeTransaction | undefined },
      );
      return toTransactionEntity(row);
    } catch (error) {
      if (error instanceof UniqueConstraintError && input.idempotencyKey) {
        const existing = await this.findByIdempotencyKey(
          input.accountId,
          input.idempotencyKey,
        );
        if (existing) return existing;
      }
      throw error;
    }
  }

  async save(transaction: Transaction, tx?: unknown): Promise<void> {
    const props = transaction.props;
    await this.transactions.update(
      {
        status: props.status,
        balanceAfterKobo: props.balanceAfterKobo,
        completedAt: props.completedAt,
      },
      {
        where: { id: props.id },
        transaction: tx as SequelizeTransaction | undefined,
      },
    );
  }
}
