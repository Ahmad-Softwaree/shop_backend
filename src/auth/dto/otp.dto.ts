import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
