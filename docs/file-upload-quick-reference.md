# File Upload Quick Reference

## Basic Setup

```typescript
@Post('endpoint')
@UseInterceptors(
  FileInterceptor('fieldName', getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({
  bucket: 'folder-name',
  fieldName: 'fieldName',
  required: true,
})
async handler(@Body() dto: DTO, @Req() req: Request) {
  const fileUrl = req.fileData.fieldName;
  return this.service.method(dto, fileUrl);
}
```

## Common Patterns

### Single Required File

```typescript
@UseInterceptors(
  FileInterceptor('image', getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({ bucket: 'products', fieldName: 'image', required: true })
```

### Single Optional File

```typescript
@UseInterceptors(
  FileInterceptor('image', getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({ bucket: 'products', fieldName: 'image', required: false })
```

### Multiple Files (Same Field)

```typescript
@UseInterceptors(
  FilesInterceptor('images', 5, getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({ bucket: 'gallery', fieldName: 'images', maxCount: 5 })
```

### Multiple Fields

```typescript
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ], getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({ bucket: 'products', fieldName: ['image', 'thumbnail'] })
```

## Service Methods

```typescript
// Create with file
async create(dto: DTO, fileData?: any) {
  return this.prisma.model.create({
    data: {
      ...dto,
      image: fileData?.image,
    },
  });
}

// Update with file (delete old)
async update(id: number, dto: DTO, fileData?: any) {
  const record = await this.prisma.model.findUnique({ where: { id } });

  if (fileData?.image && record.image) {
    await this.uploadService.deleteFileByUrl(record.image);
  }

  return this.prisma.model.update({
    where: { id },
    data: {
      ...dto,
      image: fileData?.image || record.image,
    },
  });
}

// Delete with file cleanup
async delete(id: number) {
  const record = await this.prisma.model.findUnique({ where: { id } });

  if (record.image) {
    await this.uploadService.deleteFileByUrl(record.image);
  }

  return this.prisma.model.delete({ where: { id } });
}
```

## File Type Configurations

### Images

```typescript
allowedTypes: /\.(jpg|jpeg|png|gif|webp)$/i;
maxSize: 5 * 1024 * 1024; // 5MB
```

### Documents

```typescript
allowedTypes: /\.(pdf|doc|docx)$/i;
maxSize: 10 * 1024 * 1024; // 10MB
```

### Videos

```typescript
allowedTypes: /\.(mp4|avi|mov)$/i;
maxSize: 100 * 1024 * 1024; // 100MB
```

### Archives

```typescript
allowedTypes: /\.(zip|rar|7z)$/i;
maxSize: 50 * 1024 * 1024; // 50MB
```

## Imports Reference

```typescript
// Controller
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileUploadInterceptor } from 'src/common/interceptors/file-upload.interceptor';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';
import { UploadConfig } from 'src/decorators/upload-config.decorator';
import { getMulterOptions } from 'src/common/config/multer.config';
import { Request } from 'express';

// Service
import { UploadService } from 'src/upload/upload.service';

// Module
providers: [..., UploadService]
```

## Remember

1. Always use `FileCleanupInterceptor` after `FileUploadInterceptor`
2. Delete old files when updating
3. Delete files when deleting resources
4. Access uploaded files via `req.fileData`
5. Make image optional in DTO (handled by fileData)
