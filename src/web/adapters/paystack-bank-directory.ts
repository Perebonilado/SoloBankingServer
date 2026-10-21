import { BadGatewayException } from '@nestjs/common';
import type {
  Bank,
  BankDirectoryPort,
} from '../../business/ports/bank-directory.port.js';
import type { ClockPort } from '../../business/ports/clock.port.js';

const BANKS_URL = 'https://api.paystack.co/bank?country=nigeria';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

interface PaystackBank {
  name: string;
  slug: string;
  code: string;
}

export class PaystackBankDirectory implements BankDirectoryPort {
  private cache: { banks: Bank[]; expiresAt: number } | null = null;

  constructor(private readonly clock: ClockPort) {}

  async listBanks(): Promise<Bank[]> {
    const now = this.clock.now().getTime();
    if (this.cache && this.cache.expiresAt > now) return this.cache.banks;

    const banks = await this.fetchBanks();
    this.cache = { banks, expiresAt: now + CACHE_TTL_MS };
    return banks;
  }

  private async fetchBanks(): Promise<Bank[]> {
    let response: globalThis.Response;
    try {
      response = await fetch(BANKS_URL, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new BadGatewayException('The bank list is unavailable');
    }
    if (!response.ok) {
      throw new BadGatewayException('The bank list is unavailable');
    }

    const body = (await response.json()) as { data?: PaystackBank[] };
    return (body.data ?? []).map((bank) => ({
      code: bank.code,
      name: bank.name,
      slug: bank.slug,
    }));
  }
}
