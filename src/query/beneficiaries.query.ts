import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { WhereOptions } from 'sequelize';
import { BeneficiaryModel } from '../web/database/models/index.js';
import { rankByName } from './shared/name-match.js';
import { buildPagination, clampPagination } from './shared/pagination.js';

const NAME_SEARCH_LIMIT = 5;

export interface BeneficiaryFilters {
  userId: string;
  name?: string;
  accountNumber?: string;
  page?: number;
  limit?: number;
}

function toView(row: BeneficiaryModel) {
  return {
    id: row.id,
    accountName: row.accountName,
    accountNumber: row.accountNumber,
    bankCode: row.bankCode,
    bankName: row.bankName,
  };
}

@Injectable()
export class BeneficiariesQuery {
  constructor(
    @InjectModel(BeneficiaryModel)
    private readonly beneficiaries: typeof BeneficiaryModel,
  ) {}

  async execute(filters: BeneficiaryFilters) {
    const where: WhereOptions<BeneficiaryModel> = filters.accountNumber
      ? { userId: filters.userId, accountNumber: filters.accountNumber }
      : { userId: filters.userId };

    if (filters.name) {
      const rows = await this.beneficiaries.findAll({
        where,
        order: [['createdAt', 'DESC']],
      });
      const ranked = rankByName(filters.name, rows, (row) => row.accountName);
      return {
        beneficiaries: ranked
          .slice(0, NAME_SEARCH_LIMIT)
          .map(({ item, match }) => ({ ...toView(item), match })),
        pagination: buildPagination(1, NAME_SEARCH_LIMIT, ranked.length),
      };
    }

    const { page, limit, offset } = clampPagination(filters);
    const { rows, count } = await this.beneficiaries.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return {
      beneficiaries: rows.map(toView),
      pagination: buildPagination(page, limit, count),
    };
  }
}
