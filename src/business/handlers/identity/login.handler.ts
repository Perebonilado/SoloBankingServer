import { Injectable } from '@nestjs/common';
import type { TokenService } from '../../../auth/token.service.js';
import {
  AccountNotFoundError,
  InvalidCredentialsError,
} from '../../domain/errors/errors.js';
import type { PasskeyVerifierPort } from '../../ports/passkey-verifier.port.js';
import type { AccountRepository } from '../../repositories/account.repository.js';
import AbstractRequestHandlerTemplate from '../AbstractRequestHandlerTemplate.js';
import { CommandResponse } from '../response/CommandResponse.js';

export interface LoginRequest {
  accountNumber: string;
  passKey: string;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
}

@Injectable()
export class LoginHandler extends AbstractRequestHandlerTemplate<
  LoginRequest,
  LoginResult
> {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly passkeys: PasskeyVerifierPort,
    private readonly tokens: TokenService,
  ) {
    super();
  }

  protected async handleRequest(
    request: LoginRequest,
  ): Promise<CommandResponse<LoginResult>> {
    const account = await this.accounts.findByAccountNumber(
      request.accountNumber,
    );
    if (!account) throw new AccountNotFoundError();

    const verified = await this.passkeys.verify(account.userId, request.passKey);
    if (!verified) throw new InvalidCredentialsError();

    const { token, expiresIn } = this.tokens.issue(account.userId);
    return CommandResponse.of({ accessToken: token, expiresIn });
  }
}
