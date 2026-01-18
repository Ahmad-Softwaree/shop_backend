import { SetMetadata } from '@nestjs/common';

export const UPLOAD_CONFIG_KEY = 'uploadConfig';

export interface UploadConfigOptions {
  bucket: string;
  fieldName: string | string[];
  maxCount?: number;
  maxSize?: number;
  allowedTypes?: RegExp;
  required?: boolean;
}

export const UploadConfig = (config: UploadConfigOptions) =>
  SetMetadata(UPLOAD_CONFIG_KEY, config);
