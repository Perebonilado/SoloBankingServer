import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BankAccountQuery } from '../../query/bank-account.query.js';
import { BanksQuery } from '../../query/banks.query.js';
import { JwtAuthGuard } from '../security/jwt-auth.guard.js';
import { BeneficiaryDto } from '../validation/beneficiary.dto.js';

@Controller('banks')
@UseGuards(JwtAuthGuard)
export class BanksController {
  constructor(
    private readonly banks: BanksQuery,
    private readonly bankAccount: BankAccountQuery,
  ) {}

  @Get()
  find(@Query('search') search?: string) {
    return this.banks.execute(search);
  }

  @Get('resolve')
  resolve(@Query() query: BeneficiaryDto) {
    return this.bankAccount.execute(query.accountNumber, query.bankCode);
  }
}
