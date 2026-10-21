import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import type { Beneficiary } from '../../business/domain/entities/beneficiary.js';
import { BeneficiaryExistsError } from '../../business/domain/errors/errors.js';
import type {
  BeneficiaryRepository,
  CreateBeneficiaryInput,
} from '../../business/repositories/beneficiary.repository.js';
import { BeneficiaryModel } from '../database/models/index.js';
import { toBeneficiaryEntity } from './mappers.js';

@Injectable()
export class SequelizeBeneficiaryRepository implements BeneficiaryRepository {
  constructor(
    @InjectModel(BeneficiaryModel)
    private readonly beneficiaries: typeof BeneficiaryModel,
  ) {}

  async exists(
    userId: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<boolean> {
    const count = await this.beneficiaries.count({
      where: { userId, accountNumber, bankCode },
    });
    return count > 0;
  }

  async create(input: CreateBeneficiaryInput): Promise<Beneficiary> {
    try {
      const row = await this.beneficiaries.create({ ...input });
      return toBeneficiaryEntity(row);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new BeneficiaryExistsError();
      }
      throw error;
    }
  }
}
