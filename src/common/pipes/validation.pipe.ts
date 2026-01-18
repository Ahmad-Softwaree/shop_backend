import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LanguageService } from 'src/language/language.service';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  constructor(private readonly languageService: LanguageService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    //value => data body
    //metatype => DTO class
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);

    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      enableImplicitConversion: true,
    });
    //forbidNonWhitelisted will throw error if extra fields are present
    //enableImplicitConversion will convert types automatically (e.g., string to number)

    if (errors.length > 0) {
      const formattedErrors = this.flattenErrors(errors);
      throw new UnprocessableEntityException({
        statusCode: 422,
        message: formattedErrors,
      });
    }

    // 👇 Important: return the transformed object!
    return object;
  }
  private flattenErrors(
    errors: any[],
    parentPath: string = '',
  ): { field: string; messages: string[] }[] {
    const resultMap: Record<string, Set<string>> = {};

    for (const error of errors) {
      const fieldPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        for (const message of Object.values(error.constraints)) {
          const translated = this.languageService.getValidationMessage(
            message as string,
          );
          const finalMessage =
            translated !== message
              ? translated
              : `${fieldPath} validation failed`;

          if (!resultMap[fieldPath]) {
            resultMap[fieldPath] = new Set();
          }
          resultMap[fieldPath].add(finalMessage);
        }
      }

      if (error.children && error.children.length > 0) {
        const nested = this.flattenErrors(error.children, fieldPath);
        for (const { field, messages } of nested) {
          if (!resultMap[field]) resultMap[field] = new Set();
          messages.forEach((m) => resultMap[field].add(m));
        }
      }
    }

    return Object.entries(resultMap).map(([field, messages]) => ({
      field,
      messages: Array.from(messages),
    }));
  }

  private toValidate(metatype: Function): boolean {
    // this function checks if the metatype is one of the primitive types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
