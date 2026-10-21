import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SaveBeneficiaryHandler } from '../../business/handlers/beneficiaries/save-beneficiary.handler.js';
import { BeneficiariesQuery } from '../../query/beneficiaries.query.js';
import { CurrentUser } from '../security/current-user.decorator.js';
import {
  type AuthenticatedUser,
  JwtAuthGuard,
} from '../security/jwt-auth.guard.js';
import {
  BeneficiaryDto,
  FindBeneficiariesDto,
} from '../validation/beneficiary.dto.js';

@Controller('beneficiaries')
@UseGuards(JwtAuthGuard)
export class BeneficiariesController {
  constructor(
    private readonly beneficiaries: BeneficiariesQuery,
    private readonly saveBeneficiaryHandler: SaveBeneficiaryHandler,
  ) {}

  @Get()
  find(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindBeneficiariesDto,
  ) {
    return this.beneficiaries.execute({
      userId: user.id,
      name: query.name,
      accountNumber: query.accountNumber,
      page: query.page,
      limit: query.limit,
    });
  }

  @Post()
  async save(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BeneficiaryDto,
  ) {
    const response = await this.saveBeneficiaryHandler.handle({
      userId: user.id,
      accountNumber: dto.accountNumber,
      bankCode: dto.bankCode,
    });
    return response.data;
  }
}
