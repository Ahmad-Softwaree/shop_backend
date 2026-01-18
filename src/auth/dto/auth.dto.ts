import { PickType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { GlobalDto } from 'src/common/dto/global.dto';

export class LoginDto extends PickType(GlobalDto, [
  'email',
  'password',
] as const) {}

export class RegisterDto extends PickType(GlobalDto, [
  'name',
  'username',
  'email',
  'phone',
  'password',
] as const) {
  @IsString({ message: 'validation.auth.confirmPassword.isString' })
  @IsNotEmpty({ message: 'validation.auth.confirmPassword.isNotEmpty' })
  confirmPassword: string;
}

export class CheckLoginOtpDto {
  @IsString({ message: 'validation.auth.code.isString' })
  @IsNotEmpty({ message: 'validation.auth.code.isNotEmpty' })
  @MinLength(6, { message: 'validation.auth.code.minLength' })
  @MaxLength(6, { message: 'validation.auth.code.maxLength' })
  code: string;

  @IsString({ message: 'validation.auth.email.isString' })
  @IsNotEmpty({ message: 'validation.auth.email.isNotEmpty' })
  email: string;

  @IsString({ message: 'validation.auth.password.isString' })
  @IsNotEmpty({ message: 'validation.auth.password.isNotEmpty' })
  password: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'validation.auth.currentPassword.isString' })
  @IsNotEmpty({ message: 'validation.auth.currentPassword.isNotEmpty' })
  currentPassword: string;

  @IsString({ message: 'validation.auth.password.isString' })
  @IsNotEmpty({ message: 'validation.auth.password.isNotEmpty' })
  @MinLength(8, { message: 'validation.auth.password.minLength' })
  password: string;

  @IsString({ message: 'validation.auth.confirmPassword.isString' })
  @IsNotEmpty({ message: 'validation.auth.confirmPassword.isNotEmpty' })
  confirmPassword: string;
}

export class PasswordResetDto {
  @IsString({ message: 'validation.auth.email.isString' })
  @IsNotEmpty({ message: 'validation.auth.email.isNotEmpty' })
  email: string;
}

export class UpdatePasswordDto {
  @IsString({ message: 'validation.auth.token.isString' })
  @IsNotEmpty({ message: 'validation.auth.token.isNotEmpty' })
  token: string;

  @IsString({ message: 'validation.auth.password.isString' })
  @IsNotEmpty({ message: 'validation.auth.password.isNotEmpty' })
  @MinLength(8, { message: 'validation.auth.password.minLength' })
  password: string;

  @IsString({ message: 'validation.auth.confirmPassword.isString' })
  @IsNotEmpty({ message: 'validation.auth.confirmPassword.isNotEmpty' })
  confirmPassword: string;
}

export class Activate2FADto {
  @IsString({ message: 'validation.auth.code.isString' })
  @IsNotEmpty({ message: 'validation.auth.code.isNotEmpty' })
  @MinLength(6, { message: 'validation.auth.code.minLength' })
  @MaxLength(6, { message: 'validation.auth.code.maxLength' })
  code: string;
}
