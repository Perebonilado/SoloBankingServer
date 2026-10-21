import { Account } from '../../business/domain/entities/account.js';
import { Beneficiary } from '../../business/domain/entities/beneficiary.js';
import { Transaction } from '../../business/domain/entities/transaction.js';
import { User } from '../../business/domain/entities/user.js';
import { toKobo } from '../../business/domain/values/money.js';
import type {
  AccountModel,
  BeneficiaryModel,
  TransactionModel,
  UserModel,
} from '../database/models/index.js';

export function toUserEntity(row: UserModel): User {
  return new User({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
  });
}

export function toAccountEntity(row: AccountModel): Account {
  return new Account({
    id: row.id,
    userId: row.userId,
    accountNumber: row.accountNumber,
    balanceKobo: toKobo(row.balanceKobo),
  });
}

export function toBeneficiaryEntity(row: BeneficiaryModel): Beneficiary {
  return new Beneficiary({
    id: row.id,
    userId: row.userId,
    accountName: row.accountName,
    accountNumber: row.accountNumber,
    bankCode: row.bankCode,
    bankName: row.bankName,
    createdAt: row.createdAt as Date,
  });
}

export function toTransactionEntity(row: TransactionModel): Transaction {
  return new Transaction({
    id: row.id,
    accountId: row.accountId,
    type: row.type,
    status: row.status,
    amountKobo: toKobo(row.amountKobo),
    balanceAfterKobo:
      row.balanceAfterKobo === null ? null : toKobo(row.balanceAfterKobo),
    description: row.description,
    counterpartyName: row.counterpartyName,
    counterpartyAccountNumber: row.counterpartyAccountNumber,
    bankCode: row.bankCode,
    idempotencyKey: row.idempotencyKey,
    relatedTransactionId: row.relatedTransactionId,
    expiresAt: row.expiresAt,
    completedAt: row.completedAt,
    createdAt: row.createdAt as Date,
  });
}
