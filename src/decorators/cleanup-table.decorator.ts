// src/decorators/cleanup-table.decorator.ts
import { applyDecorators, SetMetadata } from '@nestjs/common';

export const CLEANUP_TABLE = 'cleanupTable';
export function CleanupTable(tableName: string) {
  return applyDecorators(SetMetadata(CLEANUP_TABLE, tableName));
}
