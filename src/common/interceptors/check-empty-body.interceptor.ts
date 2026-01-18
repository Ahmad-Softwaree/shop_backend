import {
  Injectable,
  ExecutionContext,
  BadRequestException,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LanguageService } from 'src/language/language.service';

@Injectable()
export class EmptyBodyInterceptor implements NestInterceptor {
  constructor(private readonly languageService: LanguageService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (!request.body || Object.keys(request.body).length === 0) {
      throw new BadRequestException(
        this.languageService.getText().interceptors.empty_body,
      );
    }

    return next.handle();
  }
}
