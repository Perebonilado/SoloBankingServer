import { TransactionStatus } from '../values/transaction-status.js';
import type { TransactionType } from '../values/transaction-type.js';

export interface TransactionProps {
  id: string;
  accountId: string;
  type: TransactionType;
  status: TransactionStatus;
  amountKobo: number;
  balanceAfterKobo: number | null;
  description: string | null;
  counterpartyName: string | null;
  counterpartyAccountNumber: string | null;
  bankCode: string | null;
  idempotencyKey: string | null;
  relatedTransactionId: string | null;
  expiresAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export class Transaction {
  constructor(public readonly props: TransactionProps) {}

  get id() {
    return this.props.id;
  }
  get accountId() {
    return this.props.accountId;
  }
  get status() {
    return this.props.status;
  }

  isPending(): boolean {
    return this.props.status === TransactionStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.props.status === TransactionStatus.COMPLETED;
  }

  isExpired(now: Date): boolean {
    return (
      this.props.expiresAt !== null &&
      now.getTime() > this.props.expiresAt.getTime()
    );
  }

  complete(balanceAfterKobo: number, now: Date): void {
    this.props.status = TransactionStatus.COMPLETED;
    this.props.balanceAfterKobo = balanceAfterKobo;
    this.props.completedAt = now;
  }

  expire(): void {
    this.props.status = TransactionStatus.EXPIRED;
  }
}
