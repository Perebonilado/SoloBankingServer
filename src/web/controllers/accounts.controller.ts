import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AccountLookupQuery } from '../../query/account-lookup.query.js';
import { BalanceQuery } from '../../query/balance.query.js';
import { TransactionsQuery } from '../../query/transactions.query.js';
import { CurrentUser } from '../security/current-user.decorator.js';
import {
  type AuthenticatedUser,
  JwtAuthGuard,
} from '../security/jwt-auth.guard.js';
import { TransactionsQueryDto } from '../validation/transfer.dto.js';

@Controller()
export class AccountsController {
  constructor(
    private readonly accountLookup: AccountLookupQuery,
    private readonly balance: BalanceQuery,
    private readonly transactions: TransactionsQuery,
  ) {}

  @Get('accounts/me')
  @UseGuards(JwtAuthGuard)
  getBalance(@CurrentUser() user: AuthenticatedUser) {
    return this.balance.execute(user.id);
  }

  @Get('accounts/:accountNumber')
  lookupAccount(@Param('accountNumber') accountNumber: string) {
    return this.accountLookup.execute(accountNumber);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  getTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TransactionsQueryDto,
  ) {
    return this.transactions.execute({
      userId: user.id,
      page: query.page,
      limit: query.limit,
    });
  }
}
