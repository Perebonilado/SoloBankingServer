import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @Matches(/^\d{10}$/, { message: 'accountNumber must be 10 digits' })
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  passKey: string;
}
