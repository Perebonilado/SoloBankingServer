import type { Provider } from '@nestjs/common';
import { AccountLookupQuery } from '../../query/account-lookup.query.js';
import { BalanceQuery } from '../../query/balance.query.js';
import { BankAccountQuery } from '../../query/bank-account.query.js';
import { BanksQuery } from '../../query/banks.query.js';
import { BeneficiariesQuery } from '../../query/beneficiaries.query.js';
import { TransactionsQuery } from '../../query/transactions.query.js';

export const queryProviders: Provider[] = [
  AccountLookupQuery,
  BeneficiariesQuery,
  BanksQuery,
  BankAccountQuery,
  BalanceQuery,
  TransactionsQuery,
];
