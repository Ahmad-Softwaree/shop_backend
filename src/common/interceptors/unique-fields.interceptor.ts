import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  InternalServerErrorException,
  Global,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { Observable } from 'rxjs';
import { LanguageService } from 'src/language/language.service';

export const CHECK_UNIQUE_FIELDS_KEY = 'uniqueFields';
export const UniqueFields = (table: string, fields: string[]) =>
  SetMetadata(CHECK_UNIQUE_FIELDS_KEY, { table, fields });

@Global()
@Injectable()
export class UniqueFieldsInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly languageService: LanguageService,
    private readonly prisma: PrismaService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { table, fields } =
      this.reflector.get<{ table: string; fields: string[] }>(
        CHECK_UNIQUE_FIELDS_KEY,
        context.getHandler(),
      ) ||
      this.reflector.get<{ table: string; fields: string[] }>(
        CHECK_UNIQUE_FIELDS_KEY,
        context.getClass(),
      );

    if (!table || !fields) {
      throw new InternalServerErrorException(
        this.languageService.getText().interceptors.unique_fields,
      );
    }

    const id = request.params?.id;

    for (const field of fields) {
      const newValue = request.body?.[field];
      if (newValue) {
        const where: any = { [field]: newValue, deleted: false };
        if (id) {
          where.id = { not: Number(id) };
        }

        const exists = await this.prisma[table].findFirst({ where });

        if (exists) {
          throw new BadRequestException(
            `${field} ${this.languageService.getText().interceptors.must_be_unique}`,
          );
        }
      }
    }

    return next.handle();
  }
}
