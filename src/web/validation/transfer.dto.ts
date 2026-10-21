import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class InitiateTransferDto {
  @Matches(/^\d{10}$/, { message: 'toAccountNumber must be 10 digits' })
  toAccountNumber: string;

  @Matches(/^\d+$/, { message: 'bankCode must be numeric' })
  @MaxLength(10)
  bankCode: string;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountKobo: number;

  @IsUUID()
  idempotencyKey: string;
}

export class ConfirmTransferDto {
  @IsString()
  @IsNotEmpty()
  passKey: string;
}

export class TransactionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
