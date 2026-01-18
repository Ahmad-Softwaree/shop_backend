import { applyDecorators, SetMetadata } from '@nestjs/common';

export const BUCKET_NAME = 'bucketName';

export function BucketName(bucketName: string) {
  return applyDecorators(SetMetadata(BUCKET_NAME, bucketName));
}
