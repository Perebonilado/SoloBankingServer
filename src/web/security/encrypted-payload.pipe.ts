import {
  BadRequestException,
  Inject,
  Injectable,
  mixin,
  type PipeTransform,
  type Type,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  constants,
  createPrivateKey,
  privateDecrypt,
  type KeyObject,
} from 'node:crypto';
import { ReplayDetectedError } from '../../business/domain/errors/errors.js';
import type { ClockPort } from '../../business/ports/clock.port.js';
import { CLOCK_PORT } from '../../business/ports/tokens.js';
import { NonceStore } from './nonce-store.js';

const MAX_CLOCK_SKEW_MS = 60_000;

export function loadPrivateKey(config: ConfigService): KeyObject {
  return createPrivateKey(
    config.getOrThrow<string>('RSA_PRIVATE_KEY').replace(/\\n/g, '\n'),
  );
}

export function EncryptedPayloadPipe<T extends object>(
  dto: new () => T,
): Type<PipeTransform> {
  @Injectable()
  class EncryptedPayloadPipeMixin implements PipeTransform {
    private readonly privateKey: KeyObject;
    private readonly keyId: string;

    constructor(
      config: ConfigService,
      private readonly nonces: NonceStore,
      @Inject(CLOCK_PORT) private readonly clock: ClockPort,
    ) {
      this.privateKey = loadPrivateKey(config);
      this.keyId = config.getOrThrow<string>('RSA_KEY_ID');
    }

    async transform(body: unknown): Promise<T> {
      const envelope = (body ?? {}) as { keyId?: unknown; payload?: unknown };
      if (
        typeof envelope.keyId !== 'string' ||
        typeof envelope.payload !== 'string'
      ) {
        throw new BadRequestException('keyId and payload are required');
      }
      if (envelope.keyId !== this.keyId) {
        throw new BadRequestException('Unknown keyId');
      }

      const { nonce, timestamp, ...fields } = this.decrypt(envelope.payload);
      if (typeof nonce !== 'string' || !nonce || typeof timestamp !== 'number') {
        throw new BadRequestException('nonce and timestamp are required');
      }
      const skew = Math.abs(this.clock.now().getTime() - timestamp);
      if (skew > MAX_CLOCK_SKEW_MS || !this.nonces.remember(nonce)) {
        throw new ReplayDetectedError();
      }

      const instance = plainToInstance(dto, fields);
      const errors = await validate(instance, { whitelist: true });
      if (errors.length > 0) {
        throw new BadRequestException(
          errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join('; '),
        );
      }
      return instance;
    }

    private decrypt(payload: string): Record<string, unknown> {
      try {
        const plaintext = privateDecrypt(
          {
            key: this.privateKey,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
          },
          Buffer.from(payload, 'base64'),
        );
        const parsed: unknown = JSON.parse(plaintext.toString('utf8'));
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Payload is not an object');
        }
        return parsed as Record<string, unknown>;
      } catch {
        throw new BadRequestException('payload could not be decrypted');
      }
    }
  }

  return mixin(EncryptedPayloadPipeMixin);
}
