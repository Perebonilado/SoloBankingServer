import { DomainError } from './domain-error.js';

export class AccountNotFoundError extends DomainError {
  constructor(message = 'Account not found') {
    super('ACCOUNT_NOT_FOUND', 404, message);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor(message = 'Invalid credentials') {
    super('INVALID_CREDENTIALS', 401, message);
  }
}

export class ReplayDetectedError extends DomainError {
  constructor(message = 'Request is stale or has already been used') {
    super('REPLAY_DETECTED', 401, message);
  }
}

export class BeneficiaryExistsError extends DomainError {
  constructor(message = 'Beneficiary is already saved') {
    super('BENEFICIARY_EXISTS', 409, message);
  }
}

export class BankAccountNotFoundError extends DomainError {
  constructor(message = 'Bank account not found') {
    super('BANK_ACCOUNT_NOT_FOUND', 400, message);
  }
}

export class InsufficientFundsError extends DomainError {
  constructor(message = 'Insufficient funds') {
    super('INSUFFICIENT_FUNDS', 422, message);
  }
}

export class TransferExpiredError extends DomainError {
  constructor(message = 'Transfer has expired') {
    super('TRANSFER_EXPIRED', 410, message);
  }
}

export class TransferNotPendingError extends DomainError {
  constructor(message = 'Transfer is no longer pending') {
    super('TRANSFER_NOT_PENDING', 409, message);
  }
}

export class TransactionNotFoundError extends DomainError {
  constructor(message = 'Transaction not found') {
    super('TRANSACTION_NOT_FOUND', 404, message);
  }
}

export class TransferNotFoundError extends DomainError {
  constructor(message = 'Transfer not found') {
    super('TRANSFER_NOT_FOUND', 404, message);
  }
}
