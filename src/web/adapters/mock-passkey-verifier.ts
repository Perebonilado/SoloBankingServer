import type { PasskeyVerifierPort } from '../../business/ports/passkey-verifier.port.js';

export class MockPasskeyVerifier implements PasskeyVerifierPort {
  async verify(): Promise<boolean> {
    return true;
  }
}
