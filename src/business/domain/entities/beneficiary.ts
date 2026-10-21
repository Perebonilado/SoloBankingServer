export interface BeneficiaryProps {
  id: string;
  userId: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  createdAt: Date;
}

export class Beneficiary {
  constructor(public readonly props: BeneficiaryProps) {}

  get id() {
    return this.props.id;
  }
}
