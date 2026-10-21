import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import {
  AccountNotFoundError,
  TransactionNotFoundError,
} from '../business/domain/errors/errors.js';
import { toKobo } from '../business/domain/values/money.js';
import { TransactionStatus } from '../business/domain/values/transaction-status.js';
import {
  type BankDirectoryPort,
  findBankName,
} from '../business/ports/bank-directory.port.js';
import { BANK_DIRECTORY_PORT } from '../business/ports/tokens.js';
import { AccountModel, TransactionModel } from '../web/database/models/index.js';

@Injectable()
export class TransactionReceiptQuery {
  private readonly soloBankingBankCode: string;

  constructor(
    @InjectModel(AccountModel) private readonly accounts: typeof AccountModel,
    @InjectModel(TransactionModel)
    private readonly transactions: typeof TransactionModel,
    @Inject(BANK_DIRECTORY_PORT) private readonly directory: BankDirectoryPort,
    config: ConfigService,
  ) {
    this.soloBankingBankCode = config.getOrThrow<string>('SOLOBANKING_BANK_CODE');
  }

  async execute(userId: string, reference: string) {
    const account = await this.accounts.findOne({ where: { userId } });
    if (!account) throw new AccountNotFoundError();

    const row = await this.transactions.findOne({
      where: {
        id: reference,
        accountId: account.id,
        status: TransactionStatus.COMPLETED,
      },
    });
    if (!row) throw new TransactionNotFoundError();

    return {
      reference: row.id,
      type: row.type,
      amountKobo: toKobo(row.amountKobo),
      counterpartyName: row.counterpartyName,
      counterpartyAccountNumber: row.counterpartyAccountNumber,
      bankCode: row.bankCode,
      bankName: row.bankCode
        ? await findBankName(this.directory, this.soloBankingBankCode, row.bankCode)
        : null,
      completedAt: (row.completedAt ?? row.createdAt) as Date,
    };
  }
}
