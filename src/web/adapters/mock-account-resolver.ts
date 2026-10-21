import type {
  AccountResolverPort,
  ResolvedBankAccount,
} from '../../business/ports/account-resolver.port.js';

const MOCK_ACCOUNT_NAME = 'OBI ADA CHIOMA';

export class MockAccountResolver implements AccountResolverPort {
  async resolve(
    accountNumber: string,
    bankCode: string,
  ): Promise<ResolvedBankAccount | null> {
    if (!/^\d{10}$/.test(accountNumber) || accountNumber.endsWith('0000')) {
      return null;
    }
    return { accountNumber, accountName: MOCK_ACCOUNT_NAME, bankCode };
  }
}
