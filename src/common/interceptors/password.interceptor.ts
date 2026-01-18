import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { LanguageService } from 'src/language/language.service';
import { PrismaService } from 'src/prisma.service';

export const SAME_PASSWORD_OPTIONS = 'same_password_options';

export interface SameOldPasswordOptions {
  table: string; // Prisma model name
  identityField: string; // e.g., "id" or "email"
  passwordField?: string; // default "password"
  takeIdFrom?: 'params' | 'body' | 'auth'; // default is to check both
}

export function SameOldPasswordMetadata(options: SameOldPasswordOptions) {
  return SetMetadata(SAME_PASSWORD_OPTIONS, options);
}

@Injectable()
export class SameOldPasswordInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly languageService: LanguageService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const options = this.reflector.get<SameOldPasswordOptions>(
      SAME_PASSWORD_OPTIONS,
      context.getHandler(),
    );

    if (!options) {
      throw new Error(
        this.languageService.getText().interceptors.same_password_options,
      );
    }

    const {
      table,
      identityField,
      passwordField = 'password',
      takeIdFrom,
    } = options;
    let identityValue = 0;
    switch (takeIdFrom) {
      case 'params':
        identityValue = request.params?.[identityField];
        break;
      case 'body':
        identityValue = request.body?.[identityField];
        break;
      case 'auth':
        identityValue = request['user']?.[identityField];
        break;
      default:
        identityValue =
          request.params?.[identityField] ||
          request.body?.[identityField] ||
          request['user']?.[identityField];
    }

    const password = request.body?.password;

    if (!identityValue || !password) {
      return next.handle();
    }

    // Prisma dynamic model access: this.prisma[table]
    const model: any = (this.prisma as any)[table];
    if (!model || typeof model.findUnique !== 'function') {
      throw new BadRequestException(
        this.languageService.getText().interceptors.invalid_model,
      );
    }

    const data = await model.findFirst({
      where: { [identityField]: identityValue },
    });

    if (!data) {
      throw new BadRequestException(
        `${table} ${this.languageService.getText().interceptors.not_found}`,
      );
    }

    if (await bcrypt.compare(password, data[passwordField])) {
      throw new BadRequestException(
        this.languageService.getText().interceptors.same_password_error,
      );
    }

    return next.handle();
  }
}

@Injectable()
export class CheckBothPasswordInterceptor implements NestInterceptor {
  constructor(private readonly languageService: LanguageService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<any> {
    const request = context.switchToHttp().getRequest();

    const { password, confirmPassword } = request.body;

    if (password !== confirmPassword) {
      throw new BadRequestException(
        this.languageService.getText().interceptors.password_mismatch,
      );
    }
    return next.handle();
  }
}

@Injectable()
export class VerifyCurrentPasswordInterceptor implements NestInterceptor {
  constructor(private readonly languageService: LanguageService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const { currentPassword } = request.body;

    if (request.user && currentPassword) {
      const isMatch = await bcrypt.compare(
        currentPassword,
        request.user.password,
      );

      if (!isMatch) {
        throw new BadRequestException(
          this.languageService.getText().interceptors.incorrect_password,
        );
      }
    }

    return next.handle();
  }
}

@Injectable()
export class PasswordHashingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body?.password) {
      request.body.password = await bcrypt.hash(
        request.body.password,
        Number(process.env.PASSWORD_HASH_SALT) || 10,
      );
    }

    return next.handle();
  }
}
