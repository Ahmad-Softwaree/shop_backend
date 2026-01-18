import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  UPLOAD_CONFIG_KEY,
  UploadConfigOptions,
} from 'src/decorators/upload-config.decorator';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();

    // Get upload configuration from decorator
    const config =
      this.reflector.get<UploadConfigOptions>(
        UPLOAD_CONFIG_KEY,
        context.getHandler(),
      ) ||
      this.reflector.get<UploadConfigOptions>(
        UPLOAD_CONFIG_KEY,
        context.getClass(),
      );

    if (!config) {
      return next.handle();
    }

    const { bucket, required = false, allowedTypes, maxSize } = config;

    // Initialize uploaded files array for cleanup
    req.uploadedFiles = [];

    // Process files based on configuration
    const files = this.getFiles(req, config.fieldName);

    if (required && (!files || files.length === 0)) {
      throw new BadRequestException('File upload is required');
    }

    if (!files || files.length === 0) {
      return next.handle();
    }

    // Validate and process each file
    const processedFiles: any = {};

    for (const { fieldName, file } of files) {
      // Validate file
      this.validateFile(file, maxSize, allowedTypes);

      // Generate unique filename
      const uploadDir = path.join(process.cwd(), 'uploads', bucket);
      await this.ensureDirectoryExists(uploadDir);

      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      const baseName = file.originalname
        .replace(extension, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      const finalName = `${baseName}_${timestamp}-${random}${extension}`;
      const finalPath = path.join(uploadDir, finalName);

      // Move file to final destination
      await fs.rename(file.path, finalPath);

      const fileUrl = `/uploads/${bucket}/${finalName}`;

      // Track uploaded file for potential cleanup
      req.uploadedFiles.push({
        path: finalPath,
        url: fileUrl,
        fieldName,
      });

      // Attach to processed files
      if (!processedFiles[fieldName]) {
        processedFiles[fieldName] = [];
      }
      processedFiles[fieldName].push(fileUrl);
    }

    // Attach file data to request
    // If single file per field, unwrap array
    req.fileData = {};
    for (const [fieldName, urls] of Object.entries(processedFiles)) {
      const urlArray = urls as string[];
      req.fileData[fieldName] = urlArray.length === 1 ? urlArray[0] : urlArray;
    }

    return next.handle();
  }

  private getFiles(
    req: Request,
    fieldName: string | string[],
  ): Array<{ fieldName: string; file: Express.Multer.File }> {
    const files: Array<{ fieldName: string; file: Express.Multer.File }> = [];

    if (typeof fieldName === 'string') {
      // Single field - could be one or multiple files
      if (req.file) {
        files.push({ fieldName, file: req.file });
      } else if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => files.push({ fieldName, file }));
      } else if (req.files && req.files[fieldName]) {
        const fieldFiles = req.files[fieldName];
        if (Array.isArray(fieldFiles)) {
          fieldFiles.forEach((file) => files.push({ fieldName, file }));
        } else {
          files.push({ fieldName, file: fieldFiles });
        }
      }
    } else if (Array.isArray(fieldName)) {
      // Multiple fields
      if (req.files && typeof req.files === 'object') {
        fieldName.forEach((field) => {
          const fieldFiles = req.files[field];
          if (fieldFiles) {
            if (Array.isArray(fieldFiles)) {
              fieldFiles.forEach((file) =>
                files.push({ fieldName: field, file }),
              );
            } else {
              files.push({ fieldName: field, file: fieldFiles });
            }
          }
        });
      }
    }

    return files;
  }

  private validateFile(
    file: Express.Multer.File,
    maxSize?: number,
    allowedTypes?: RegExp,
  ): void {
    const defaultMaxSize = 5 * 1024 * 1024; // 5MB
    const defaultAllowedTypes = /\.(jpg|jpeg|png|gif|webp)$/i;

    const sizeLimit = maxSize || defaultMaxSize;
    const typePattern = allowedTypes || defaultAllowedTypes;

    if (file.size > sizeLimit) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${sizeLimit / 1024 / 1024}MB`,
      );
    }

    if (!typePattern.test(file.originalname)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${typePattern.source}`,
      );
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}
