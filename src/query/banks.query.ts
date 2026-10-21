import { Inject, Injectable } from '@nestjs/common';
import type { BankDirectoryPort } from '../business/ports/bank-directory.port.js';
import { BANK_DIRECTORY_PORT } from '../business/ports/tokens.js';

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

@Injectable()
export class BanksQuery {
  constructor(
    @Inject(BANK_DIRECTORY_PORT) private readonly directory: BankDirectoryPort,
  ) {}

  async execute(search?: string) {
    const banks = await this.directory.listBanks();
    const term = search ? compact(search) : '';
    const matches = term
      ? banks.filter(
          (bank) =>
            compact(bank.name).includes(term) || compact(bank.slug).includes(term),
        )
      : banks;
    return { banks: matches.map((bank) => ({ code: bank.code, name: bank.name })) };
  }
}
