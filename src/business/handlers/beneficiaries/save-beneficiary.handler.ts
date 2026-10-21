import { Injectable } from '@nestjs/common';
import {
  BankAccountNotFoundError,
  BeneficiaryExistsError,
} from '../../domain/errors/errors.js';
import type { AccountResolverPort } from '../../ports/account-resolver.port.js';
import type { BankDirectoryPort } from '../../ports/bank-directory.port.js';
import type { BeneficiaryRepository } from '../../repositories/beneficiary.repository.js';
import AbstractRequestHandlerTemplate from '../AbstractRequestHandlerTemplate.js';
import { CommandResponse } from '../response/CommandResponse.js';

export interface SaveBeneficiaryRequest {
  userId: string;
  accountNumber: string;
  bankCode: string;
}

export interface SaveBeneficiaryResult {
  id: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
}

@Injectable()
export class SaveBeneficiaryHandler extends AbstractRequestHandlerTemplate<
  SaveBeneficiaryRequest,
  SaveBeneficiaryResult
> {
  constructor(
    private readonly beneficiaries: BeneficiaryRepository,
    private readonly resolver: AccountResolverPort,
    private readonly bankDirectory: BankDirectoryPort,
  ) {
    super();
  }

  protected async handleRequest(
    request: SaveBeneficiaryRequest,
  ): Promise<CommandResponse<SaveBeneficiaryResult>> {
    const resolved = await this.resolver.resolve(
      request.accountNumber,
      request.bankCode,
    );
    const banks = await this.bankDirectory.listBanks();
    const bank = banks.find((candidate) => candidate.code === request.bankCode);

    const alreadySaved = await this.beneficiaries.exists(
      request.userId,
      request.accountNumber,
      request.bankCode,
    );
    if (alreadySaved) throw new BeneficiaryExistsError();
    if (!resolved || !bank) throw new BankAccountNotFoundError();

    const beneficiary = await this.beneficiaries.create({
      userId: request.userId,
      accountName: resolved.accountName,
      accountNumber: request.accountNumber,
      bankCode: request.bankCode,
      bankName: bank.name,
    });

    return CommandResponse.of({
      id: beneficiary.id,
      accountName: beneficiary.props.accountName,
      accountNumber: beneficiary.props.accountNumber,
      bankCode: beneficiary.props.bankCode,
      bankName: beneficiary.props.bankName,
    });
  }
}
