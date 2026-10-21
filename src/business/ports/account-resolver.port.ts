export interface ResolvedBankAccount {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface AccountResolverPort {
  resolve(
    accountNumber: string,
    bankCode: string,
  ): Promise<ResolvedBankAccount | null>;
}
