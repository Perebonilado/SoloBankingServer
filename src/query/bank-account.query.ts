import { Inject, Injectable } from '@nestjs/common';
import { BankAccountNotFoundError } from '../business/domain/errors/errors.js';
import type { AccountResolverPort } from '../business/ports/account-resolver.port.js';
import { ACCOUNT_RESOLVER_PORT } from '../business/ports/tokens.js';

@Injectable()
export class BankAccountQuery {
  constructor(
    @Inject(ACCOUNT_RESOLVER_PORT) private readonly resolver: AccountResolverPort,
  ) {}

  async execute(accountNumber: string, bankCode: string) {
    const resolved = await this.resolver.resolve(accountNumber, bankCode);
    if (!resolved) throw new BankAccountNotFoundError();
    return {
      accountNumber: resolved.accountNumber,
      accountName: resolved.accountName,
      bankCode: resolved.bankCode,
    };
  }
}
