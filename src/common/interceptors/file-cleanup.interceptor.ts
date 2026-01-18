import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as fs from 'fs/promises';

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      catchError(async (error) => {
        // If request has uploaded files, clean them up
        if (req.uploadedFiles && Array.isArray(req.uploadedFiles)) {
          await this.cleanupFiles(req.uploadedFiles);
        }

        // Re-throw the error to maintain error handling flow
        return throwError(() => error);
      }),
    );
  }

  private async cleanupFiles(
    files: Array<{ path: string; url: string; fieldName: string }>,
  ): Promise<void> {
    const deletePromises = files.map(async (file) => {
      try {
        await fs.unlink(file.path);
        console.log(`[FileCleanup] Deleted file: ${file.path}`);
      } catch (error) {
        console.error(
          `[FileCleanup] Failed to delete file: ${file.path}`,
          error,
        );
      }
    });

    await Promise.allSettled(deletePromises);
  }
}
