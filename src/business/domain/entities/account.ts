import { InsufficientFundsError } from '../errors/errors.js';

export interface AccountProps {
  id: string;
  userId: string;
  accountNumber: string;
  balanceKobo: number;
}

export class Account {
  constructor(public readonly props: AccountProps) {}

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get accountNumber() {
    return this.props.accountNumber;
  }
  get balanceKobo() {
    return this.props.balanceKobo;
  }

  canCover(amountKobo: number): boolean {
    return this.props.balanceKobo >= amountKobo;
  }

  debit(amountKobo: number): void {
    if (!this.canCover(amountKobo)) {
      throw new InsufficientFundsError();
    }
    this.props.balanceKobo -= amountKobo;
  }

  credit(amountKobo: number): void {
    this.props.balanceKobo += amountKobo;
  }
}
