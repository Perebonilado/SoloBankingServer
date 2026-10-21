import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountNotFoundError } from '../business/domain/errors/errors.js';
import { AccountModel, UserModel } from '../web/database/models/index.js';

@Injectable()
export class AccountLookupQuery {
  constructor(
    @InjectModel(AccountModel) private readonly accounts: typeof AccountModel,
  ) {}

  async execute(accountNumber: string) {
    const row = await this.accounts.findOne({
      where: { accountNumber },
      include: [{ model: UserModel, attributes: ['firstName', 'lastName'] }],
    });
    if (!row?.user) throw new AccountNotFoundError();

    return {
      customer_name: `${row.user.firstName} ${row.user.lastName}`,
      account_number: row.accountNumber,
    };
  }
}
