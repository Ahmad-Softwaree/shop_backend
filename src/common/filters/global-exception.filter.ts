import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as Error).message || 'Internal server error';

    const logEntry = {
      status,
      path: request.url,
      error: this.deepFormat(message),
      timestamp: new Date().toISOString(),
    };
    console.dir(logEntry, { depth: null, colors: true });

    const responseBody = {
      statusCode: status,
      ...(typeof message === 'string' ? { message } : message),
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    console.dir(responseBody, { depth: null, colors: true });

    response.status(status).json(responseBody);
  }

  private deepFormat(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepFormat(item));
    }
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          this.deepFormat(value),
        ]),
      );
    }
    return obj;
  }
}
