import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class BeneficiaryDto {
  @Matches(/^\d{10}$/, { message: 'accountNumber must be 10 digits' })
  accountNumber: string;

  @Matches(/^\d+$/, { message: 'bankCode must be numeric' })
  @MaxLength(10)
  bankCode: string;
}

export class FindBeneficiariesDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'accountNumber must be 10 digits' })
  accountNumber?: string;

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
