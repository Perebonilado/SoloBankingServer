import { Injectable } from '@nestjs/common';
import type { Transaction } from '../../domain/entities/transaction.js';
import {
  AccountNotFoundError,
  BankAccountNotFoundError,
  InsufficientFundsError,
} from '../../domain/errors/errors.js';
import { TransactionStatus } from '../../domain/values/transaction-status.js';
import { TransactionType } from '../../domain/values/transaction-type.js';
import type { AccountResolverPort } from '../../ports/account-resolver.port.js';
import type { ClockPort } from '../../ports/clock.port.js';
import type { AccountRepository } from '../../repositories/account.repository.js';
import type { TransactionRepository } from '../../repositories/transaction.repository.js';
import type { UserRepository } from '../../repositories/user.repository.js';
import AbstractRequestHandlerTemplate from '../AbstractRequestHandlerTemplate.js';
import { CommandResponse } from '../response/CommandResponse.js';

const PENDING_TRANSFER_TTL_MS = 5 * 60 * 1000;

export interface InitiateTransferRequest {
  userId: string;
  toAccountNumber: string;
  bankCode: string;
  amountKobo: number;
  idempotencyKey: string;
}

export interface InitiateTransferResult {
  transactionId: string;
  recipientName: string;
  amountKobo: number;
  expiresAt: Date;
}

@Injectable()
export class InitiateTransferHandler extends AbstractRequestHandlerTemplate<
  InitiateTransferRequest,
  InitiateTransferResult
> {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly users: UserRepository,
    private readonly transactions: TransactionRepository,
    private readonly resolver: AccountResolverPort,
    private readonly clock: ClockPort,
    private readonly soloBankingBankCode: string,
  ) {
    super();
  }

  protected async handleRequest(
    request: InitiateTransferRequest,
  ): Promise<CommandResponse<InitiateTransferResult>> {
    const account = await this.accounts.findByUserId(request.userId);
    if (!account) throw new AccountNotFoundError();

    const existing = await this.transactions.findByIdempotencyKey(
      account.id,
      request.idempotencyKey,
    );
    if (existing) return CommandResponse.of(toResult(existing));

    if (!account.canCover(request.amountKobo)) {
      throw new InsufficientFundsError();
    }

    const recipientName = await this.findRecipientName(
      request.toAccountNumber,
      request.bankCode,
    );

    const now = this.clock.now();
    const debit = await this.transactions.create({
      accountId: account.id,
      type: TransactionType.DEBIT,
      status: TransactionStatus.PENDING,
      amountKobo: request.amountKobo,
      balanceAfterKobo: null,
      description: null,
      counterpartyName: recipientName,
      counterpartyAccountNumber: request.toAccountNumber,
      bankCode: request.bankCode,
      idempotencyKey: request.idempotencyKey,
      relatedTransactionId: null,
      expiresAt: new Date(now.getTime() + PENDING_TRANSFER_TTL_MS),
      completedAt: null,
    });

    return CommandResponse.of(toResult(debit));
  }

  private async findRecipientName(
    accountNumber: string,
    bankCode: string,
  ): Promise<string> {
    if (bankCode === this.soloBankingBankCode) {
      const recipient = await this.accounts.findByAccountNumber(accountNumber);
      const user = recipient ? await this.users.findById(recipient.userId) : null;
      if (!user) throw new BankAccountNotFoundError();
      return user.fullName();
    }

    const resolved = await this.resolver.resolve(accountNumber, bankCode);
    if (!resolved) throw new BankAccountNotFoundError();
    return resolved.accountName;
  }
}

function toResult(debit: Transaction): InitiateTransferResult {
  return {
    transactionId: debit.id,
    recipientName: debit.props.counterpartyName ?? '',
    amountKobo: debit.props.amountKobo,
    expiresAt: debit.props.expiresAt ?? debit.props.createdAt,
  };
}
