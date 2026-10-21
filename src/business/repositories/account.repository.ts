import type { Account } from '../domain/entities/account.js';

export interface AccountRepository {
  findByUserId(userId: string, tx?: unknown): Promise<Account | null>;
  findByAccountNumber(
    accountNumber: string,
    tx?: unknown,
  ): Promise<Account | null>;
  findByIdForUpdate(id: string, tx: unknown): Promise<Account | null>;
  save(account: Account, tx?: unknown): Promise<void>;
}
