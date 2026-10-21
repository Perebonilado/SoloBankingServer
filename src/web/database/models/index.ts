import type { ModelCtor } from 'sequelize-typescript';
import { AccountModel } from './account.model.js';
import { BeneficiaryModel } from './beneficiary.model.js';
import { TransactionModel } from './transaction.model.js';
import { UserModel } from './user.model.js';

export { AccountModel, BeneficiaryModel, TransactionModel, UserModel };

export const ALL_MODELS: ModelCtor[] = [
  UserModel,
  AccountModel,
  BeneficiaryModel,
  TransactionModel,
];
