import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../../auth/token.service.js';
import { SaveBeneficiaryHandler } from '../../business/handlers/beneficiaries/save-beneficiary.handler.js';
import { LoginHandler } from '../../business/handlers/identity/login.handler.js';
import { LogoutHandler } from '../../business/handlers/identity/logout.handler.js';
import { ConfirmTransferHandler } from '../../business/handlers/transfers/confirm-transfer.handler.js';
import { InitiateTransferHandler } from '../../business/handlers/transfers/initiate-transfer.handler.js';
import type { AccountResolverPort } from '../../business/ports/account-resolver.port.js';
import type { BankDirectoryPort } from '../../business/ports/bank-directory.port.js';
import type { ClockPort } from '../../business/ports/clock.port.js';
import type { PasskeyVerifierPort } from '../../business/ports/passkey-verifier.port.js';
import {
  ACCOUNT_RESOLVER_PORT,
  BANK_DIRECTORY_PORT,
  CLOCK_PORT,
  PASSKEY_VERIFIER_PORT,
  UNIT_OF_WORK_PORT,
} from '../../business/ports/tokens.js';
import type { UnitOfWorkPort } from '../../business/ports/unit-of-work.port.js';
import type { AccountRepository } from '../../business/repositories/account.repository.js';
import type { BeneficiaryRepository } from '../../business/repositories/beneficiary.repository.js';
import type { RevokedTokenRepository } from '../../business/repositories/revoked-token.repository.js';
import {
  ACCOUNT_REPOSITORY,
  BENEFICIARY_REPOSITORY,
  REVOKED_TOKEN_REPOSITORY,
  TRANSACTION_REPOSITORY,
  USER_REPOSITORY,
} from '../../business/repositories/tokens.js';
import type { TransactionRepository } from '../../business/repositories/transaction.repository.js';
import type { UserRepository } from '../../business/repositories/user.repository.js';

export const handlerProviders: Provider[] = [
  {
    provide: LoginHandler,
    useFactory: (
      accounts: AccountRepository,
      passkeys: PasskeyVerifierPort,
      tokens: TokenService,
    ) => new LoginHandler(accounts, passkeys, tokens),
    inject: [ACCOUNT_REPOSITORY, PASSKEY_VERIFIER_PORT, TokenService],
  },
  {
    provide: LogoutHandler,
    useFactory: (revokedTokens: RevokedTokenRepository, clock: ClockPort) =>
      new LogoutHandler(revokedTokens, clock),
    inject: [REVOKED_TOKEN_REPOSITORY, CLOCK_PORT],
  },
  {
    provide: SaveBeneficiaryHandler,
    useFactory: (
      beneficiaries: BeneficiaryRepository,
      resolver: AccountResolverPort,
      bankDirectory: BankDirectoryPort,
    ) => new SaveBeneficiaryHandler(beneficiaries, resolver, bankDirectory),
    inject: [BENEFICIARY_REPOSITORY, ACCOUNT_RESOLVER_PORT, BANK_DIRECTORY_PORT],
  },
  {
    provide: InitiateTransferHandler,
    useFactory: (
      accounts: AccountRepository,
      users: UserRepository,
      transactions: TransactionRepository,
      resolver: AccountResolverPort,
      clock: ClockPort,
      config: ConfigService,
    ) =>
      new InitiateTransferHandler(
        accounts,
        users,
        transactions,
        resolver,
        clock,
        config.getOrThrow<string>('SOLOBANKING_BANK_CODE'),
      ),
    inject: [
      ACCOUNT_REPOSITORY,
      USER_REPOSITORY,
      TRANSACTION_REPOSITORY,
      ACCOUNT_RESOLVER_PORT,
      CLOCK_PORT,
      ConfigService,
    ],
  },
  {
    provide: ConfirmTransferHandler,
    useFactory: (
      unitOfWork: UnitOfWorkPort,
      accounts: AccountRepository,
      users: UserRepository,
      transactions: TransactionRepository,
      passkeys: PasskeyVerifierPort,
      bankDirectory: BankDirectoryPort,
      clock: ClockPort,
      config: ConfigService,
    ) =>
      new ConfirmTransferHandler(
        unitOfWork,
        accounts,
        users,
        transactions,
        passkeys,
        bankDirectory,
        clock,
        config.getOrThrow<string>('SOLOBANKING_BANK_CODE'),
      ),
    inject: [
      UNIT_OF_WORK_PORT,
      ACCOUNT_REPOSITORY,
      USER_REPOSITORY,
      TRANSACTION_REPOSITORY,
      PASSKEY_VERIFIER_PORT,
      BANK_DIRECTORY_PORT,
      CLOCK_PORT,
      ConfigService,
    ],
  },
];
