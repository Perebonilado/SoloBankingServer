import { BadGatewayException } from '@nestjs/common';
import type {
  AccountResolverPort,
  ResolvedBankAccount,
} from '../../business/ports/account-resolver.port.js';

const RESOLVE_URL = 'https://api.paystack.co/bank/resolve';
const REQUEST_TIMEOUT_MS = 10_000;
const NOT_FOUND_STATUSES = new Set([400, 404, 422]);

interface PaystackResolvedAccount {
  account_number: string;
  account_name: string;
}

export class PaystackAccountResolver implements AccountResolverPort {
  constructor(private readonly secretKey: string) {}

  async resolve(
    accountNumber: string,
    bankCode: string,
  ): Promise<ResolvedBankAccount | null> {
    const url = new URL(RESOLVE_URL);
    url.searchParams.set('account_number', accountNumber);
    url.searchParams.set('bank_code', bankCode);

    let response: globalThis.Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new BadGatewayException('The account lookup is unavailable');
    }
    if (NOT_FOUND_STATUSES.has(response.status)) return null;
    if (!response.ok) {
      throw new BadGatewayException('The account lookup is unavailable');
    }

    const body = (await response.json()) as { data?: PaystackResolvedAccount };
    if (!body.data) return null;
    return {
      accountNumber: body.data.account_number,
      accountName: body.data.account_name,
      bankCode,
    };
  }
}
