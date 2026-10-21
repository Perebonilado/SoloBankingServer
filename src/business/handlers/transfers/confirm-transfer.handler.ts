import { Injectable } from '@nestjs/common';
import type { Account } from '../../domain/entities/account.js';
import {
  AccountNotFoundError,
  BankAccountNotFoundError,
  InvalidCredentialsError,
  TransferExpiredError,
  TransferNotFoundError,
  TransferNotPendingError,
} from '../../domain/errors/errors.js';
import { TransactionStatus } from '../../domain/values/transaction-status.js';
import { TransactionType } from '../../domain/values/transaction-type.js';
import type { ClockPort } from '../../ports/clock.port.js';
import type { PasskeyVerifierPort } from '../../ports/passkey-verifier.port.js';
import type { UnitOfWorkPort } from '../../ports/unit-of-work.port.js';
import type { AccountRepository } from '../../repositories/account.repository.js';
import type { TransactionRepository } from '../../repositories/transaction.repository.js';
import type { UserRepository } from '../../repositories/user.repository.js';
import AbstractRequestHandlerTemplate from '../AbstractRequestHandlerTemplate.js';
import { CommandResponse } from '../response/CommandResponse.js';

export interface ConfirmTransferRequest {
  userId: string;
  transactionId: string;
  passKey: string;
}

export interface ConfirmTransferResult {
  reference: string;
  balanceKobo: number;
}

type Outcome =
  | { kind: 'completed'; result: ConfirmTransferResult }
  | { kind: 'expired' };

@Injectable()
export class ConfirmTransferHandler extends AbstractRequestHandlerTemplate<
  ConfirmTransferRequest,
  ConfirmTransferResult
> {
  constructor(
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly accounts: AccountRepository,
    private readonly users: UserRepository,
    private readonly transactions: TransactionRepository,
    private readonly passkeys: PasskeyVerifierPort,
    private readonly clock: ClockPort,
    private readonly soloBankingBankCode: string,
  ) {
    super();
  }

  protected async handleRequest(
    request: ConfirmTransferRequest,
  ): Promise<CommandResponse<ConfirmTransferResult>> {
    const outcome = await this.unitOfWork.runInTransaction((tx) =>
      this.confirm(request, tx),
    );
    if (outcome.kind === 'expired') throw new TransferExpiredError();
    return CommandResponse.of(outcome.result);
  }

  private async confirm(
    request: ConfirmTransferRequest,
    tx: unknown,
  ): Promise<Outcome> {
    const sender = await this.accounts.findByUserId(request.userId, tx);
    if (!sender) throw new AccountNotFoundError();

    const debit = await this.transactions.findByIdForUpdate(
      request.transactionId,
      tx,
    );
    if (
      !debit ||
      debit.accountId !== sender.id ||
      debit.props.type !== TransactionType.DEBIT
    ) {
      throw new TransferNotFoundError();
    }

    if (debit.isCompleted()) {
      return {
        kind: 'completed',
        result: {
          reference: debit.id,
          balanceKobo: debit.props.balanceAfterKobo ?? sender.balanceKobo,
        },
      };
    }
    if (!debit.isPending()) throw new TransferNotPendingError();

    const now = this.clock.now();
    if (debit.isExpired(now)) {
      debit.expire();
      await this.transactions.save(debit, tx);
      return { kind: 'expired' };
    }

    const verified = await this.passkeys.verify(request.userId, request.passKey);
    if (!verified) throw new InvalidCredentialsError();

    const recipient = await this.findSoloBankingRecipient(
      debit.props.bankCode,
      debit.props.counterpartyAccountNumber,
      tx,
    );

    const lockedIds = [...new Set([sender.id, recipient?.id])]
      .filter((id): id is string => Boolean(id))
      .sort();
    const locked = new Map<string, Account>();
    for (const id of lockedIds) {
      const account = await this.accounts.findByIdForUpdate(id, tx);
      if (!account) throw new AccountNotFoundError();
      locked.set(id, account);
    }

    const lockedSender = locked.get(sender.id) as Account;
    lockedSender.debit(debit.props.amountKobo);
    await this.accounts.save(lockedSender, tx);
    debit.complete(lockedSender.balanceKobo, now);
    await this.transactions.save(debit, tx);

    if (recipient) {
      const lockedRecipient = locked.get(recipient.id) as Account;
      lockedRecipient.credit(debit.props.amountKobo);
      await this.accounts.save(lockedRecipient, tx);
      const senderUser = await this.users.findById(request.userId, tx);
      await this.transactions.create(
        {
          accountId: lockedRecipient.id,
          type: TransactionType.CREDIT,
          status: TransactionStatus.COMPLETED,
          amountKobo: debit.props.amountKobo,
          balanceAfterKobo: lockedRecipient.balanceKobo,
          description: null,
          counterpartyName: senderUser ? senderUser.fullName() : null,
          counterpartyAccountNumber: lockedSender.accountNumber,
          bankCode: this.soloBankingBankCode,
          idempotencyKey: null,
          relatedTransactionId: debit.id,
          expiresAt: null,
          completedAt: now,
        },
        tx,
      );
    }

    return {
      kind: 'completed',
      result: { reference: debit.id, balanceKobo: lockedSender.balanceKobo },
    };
  }

  private async findSoloBankingRecipient(
    bankCode: string | null,
    accountNumber: string | null,
    tx: unknown,
  ): Promise<Account | null> {
    if (bankCode !== this.soloBankingBankCode) return null;
    const recipient = accountNumber
      ? await this.accounts.findByAccountNumber(accountNumber, tx)
      : null;
    if (!recipient) throw new BankAccountNotFoundError();
    return recipient;
  }
}
