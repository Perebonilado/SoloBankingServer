export interface Bank {
  code: string;
  name: string;
  slug: string;
}

export interface BankDirectoryPort {
  listBanks(): Promise<Bank[]>;
}

export const SOLOBANKING_BANK_NAME = 'SoloBanking';

export async function findBankName(
  directory: BankDirectoryPort,
  soloBankingBankCode: string,
  bankCode: string,
): Promise<string | null> {
  if (bankCode === soloBankingBankCode) return SOLOBANKING_BANK_NAME;
  try {
    const banks = await directory.listBanks();
    return banks.find((bank) => bank.code === bankCode)?.name ?? null;
  } catch {
    return null;
  }
}
