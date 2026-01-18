import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

class GlobalDto {
  @IsString({ message: 'validation.global.name.isString' })
  @IsNotEmpty({ message: 'validation.global.name.isNotEmpty' })
  @MaxLength(100, { message: 'validation.global.name.maxLength' })
  name: string;

  @IsString({ message: 'validation.global.username.isString' })
  @IsNotEmpty({ message: 'validation.global.username.isNotEmpty' })
  @MinLength(3, { message: 'validation.global.username.minLength' })
  @MaxLength(20, { message: 'validation.global.username.maxLength' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'validation.global.username.pattern' })
  username: string;

  @IsString({ message: 'validation.global.email.isString' })
  @IsNotEmpty({ message: 'validation.global.email.isNotEmpty' })
  @IsEmail({}, { message: 'validation.global.email.isEmail' })
  @MaxLength(100, { message: 'validation.global.email.maxLength' })
  email: string;

  @IsString({ message: 'validation.global.phone.isString' })
  @IsNotEmpty({ message: 'validation.global.phone.isNotEmpty' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'validation.global.phone.pattern' })
  @MinLength(10, { message: 'validation.global.phone.minLength' })
  @MaxLength(20, { message: 'validation.global.phone.maxLength' })
  phone: string;

  @IsString({ message: 'validation.global.password.isString' })
  @IsNotEmpty({ message: 'validation.global.password.isNotEmpty' })
  @MinLength(8, { message: 'validation.global.password.minLength' })
  @MaxLength(300, { message: 'validation.global.password.maxLength' })
  password: string;
}

export { GlobalDto };
