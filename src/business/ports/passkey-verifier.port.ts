export interface PasskeyVerifierPort {
  verify(userId: string, passKey: string): Promise<boolean>;
}
