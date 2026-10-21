import { Inject, Injectable } from '@nestjs/common';
import type { ClockPort } from '../../business/ports/clock.port.js';
import { CLOCK_PORT } from '../../business/ports/tokens.js';

const NONCE_TTL_MS = 2 * 60 * 1000;

@Injectable()
export class NonceStore {
  private readonly seen = new Map<string, number>();

  constructor(@Inject(CLOCK_PORT) private readonly clock: ClockPort) {}

  remember(nonce: string): boolean {
    const now = this.clock.now().getTime();
    for (const [stored, expiresAt] of this.seen) {
      if (expiresAt <= now) this.seen.delete(stored);
    }
    if (this.seen.has(nonce)) return false;
    this.seen.set(nonce, now + NONCE_TTL_MS);
    return true;
  }
}
