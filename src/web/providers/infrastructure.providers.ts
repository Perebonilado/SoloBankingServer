import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../../auth/token.service.js';
import type { ClockPort } from '../../business/ports/clock.port.js';
import {
  ACCOUNT_RESOLVER_PORT,
  BANK_DIRECTORY_PORT,
  CLOCK_PORT,
  PASSKEY_VERIFIER_PORT,
  UNIT_OF_WORK_PORT,
} from '../../business/ports/tokens.js';
import {
  ACCOUNT_REPOSITORY,
  BENEFICIARY_REPOSITORY,
  REVOKED_TOKEN_REPOSITORY,
  TRANSACTION_REPOSITORY,
  USER_REPOSITORY,
} from '../../business/repositories/tokens.js';
import { AesFieldCipher } from '../adapters/aes-field-cipher.js';
import { MockAccountResolver } from '../adapters/mock-account-resolver.js';
import { MockPasskeyVerifier } from '../adapters/mock-passkey-verifier.js';
import { PaystackAccountResolver } from '../adapters/paystack-account-resolver.js';
import { PaystackBankDirectory } from '../adapters/paystack-bank-directory.js';
import { SystemClock } from '../adapters/system-clock.js';
import { SequelizeAccountRepository } from '../repositories/sequelize-account.repository.js';
import { SequelizeBeneficiaryRepository } from '../repositories/sequelize-beneficiary.repository.js';
import { SequelizeRevokedTokenRepository } from '../repositories/sequelize-revoked-token.repository.js';
import { SequelizeTransactionRepository } from '../repositories/sequelize-transaction.repository.js';
import { SequelizeUnitOfWork } from '../repositories/sequelize-unit-of-work.js';
import { SequelizeUserRepository } from '../repositories/sequelize-user.repository.js';
import { JwtAuthGuard } from '../security/jwt-auth.guard.js';
import { NonceStore } from '../security/nonce-store.js';

export const repositoryProviders: Provider[] = [
  { provide: UNIT_OF_WORK_PORT, useClass: SequelizeUnitOfWork },
  { provide: USER_REPOSITORY, useClass: SequelizeUserRepository },
  { provide: ACCOUNT_REPOSITORY, useClass: SequelizeAccountRepository },
  { provide: BENEFICIARY_REPOSITORY, useClass: SequelizeBeneficiaryRepository },
  { provide: TRANSACTION_REPOSITORY, useClass: SequelizeTransactionRepository },
  { provide: REVOKED_TOKEN_REPOSITORY, useClass: SequelizeRevokedTokenRepository },
];

export const adapterProviders: Provider[] = [
  { provide: CLOCK_PORT, useValue: new SystemClock() },
  {
    provide: BANK_DIRECTORY_PORT,
    useFactory: (clock: ClockPort) => new PaystackBankDirectory(clock),
    inject: [CLOCK_PORT],
  },
  {
    provide: ACCOUNT_RESOLVER_PORT,
    useFactory: (config: ConfigService) => {
      const resolver = config.getOrThrow<string>('ACCOUNT_RESOLVER');
      if (resolver === 'mock') return new MockAccountResolver();
      if (resolver === 'paystack') {
        return new PaystackAccountResolver(
          config.getOrThrow<string>('PAYSTACK_SECRET_KEY'),
        );
      }
      throw new Error(`Unsupported ACCOUNT_RESOLVER: ${resolver}`);
    },
    inject: [ConfigService],
  },
  {
    provide: PASSKEY_VERIFIER_PORT,
    useFactory: (config: ConfigService) => {
      const verifier = config.getOrThrow<string>('PASSKEY_VERIFIER');
      if (verifier !== 'mock') {
        throw new Error(`Unsupported PASSKEY_VERIFIER: ${verifier}`);
      }
      if (config.get<string>('NODE_ENV') === 'production') {
        throw new Error('The mock passkey verifier cannot run in production');
      }
      return new MockPasskeyVerifier();
    },
    inject: [ConfigService],
  },
  {
    provide: AesFieldCipher,
    useFactory: (config: ConfigService) =>
      new AesFieldCipher(config.getOrThrow<string>('BVN_ENCRYPTION_KEY')),
    inject: [ConfigService],
  },
];

export const authProviders: Provider[] = [
  {
    provide: TokenService,
    useFactory: (config: ConfigService) =>
      new TokenService(
        config.getOrThrow<string>('JWT_SECRET'),
        config.getOrThrow<string>('JWT_TTL'),
      ),
    inject: [ConfigService],
  },
  NonceStore,
  JwtAuthGuard,
];
