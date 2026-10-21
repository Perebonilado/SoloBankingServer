export interface Bank {
  code: string;
  name: string;
  slug: string;
}

export interface BankDirectoryPort {
  listBanks(): Promise<Bank[]>;
}
