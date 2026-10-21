import type {
  Beneficiary,
  BeneficiaryProps,
} from '../domain/entities/beneficiary.js';

export type CreateBeneficiaryInput = Omit<BeneficiaryProps, 'id' | 'createdAt'>;

export interface BeneficiaryRepository {
  exists(
    userId: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<boolean>;
  create(input: CreateBeneficiaryInput): Promise<Beneficiary>;
}
