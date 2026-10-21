import type {
  Transaction,
  TransactionProps,
} from '../domain/entities/transaction.js';

export type CreateTransactionInput = Omit<TransactionProps, 'id' | 'createdAt'>;

export interface TransactionRepository {
  findByIdempotencyKey(
    accountId: string,
    idempotencyKey: string,
  ): Promise<Transaction | null>;
  findByIdForUpdate(id: string, tx: unknown): Promise<Transaction | null>;
  create(input: CreateTransactionInput, tx?: unknown): Promise<Transaction>;
  save(transaction: Transaction, tx?: unknown): Promise<void>;
}
