# File Upload System - Best Practices Guide

## Overview

This project implements a **production-ready file upload system** with the following features:

✅ **Unified Interceptor** - Handles single, multiple, and multi-field uploads
✅ **Automatic Cleanup** - Deletes uploaded files when requests fail  
✅ **Type Safety** - Full TypeScript support  
✅ **Validation** - File size and type validation  
✅ **Flexible Configuration** - Decorator-based configuration

---

## Architecture

### Core Components

1. **FileUploadInterceptor** - Processes and validates uploaded files
2. **FileCleanupInterceptor** - Automatically deletes files on request failure
3. **UploadConfig Decorator** - Configures upload behavior per route
4. **UploadService** - Utility methods for file management

---

## How It Works

### Request Flow

```
1. Client uploads file(s)
   ↓
2. Multer saves to temp directory
   ↓
3. FileUploadInterceptor:
   - Validates file size/type
   - Moves file to final location
   - Stores file URLs in req.fileData
   - Tracks files in req.uploadedFiles
   ↓
4. Controller handler executes
   - Accesses uploaded files via req.fileData
   - Performs business logic
   - Saves to database
   ↓
5. Success Path:
   ✅ Files remain on disk
   ✅ Response sent to client

   OR

   Failure Path (Exception thrown):
   ❌ FileCleanupInterceptor catches error
   ❌ Deletes ALL uploaded files
   ❌ Re-throws error to error handler
```

### Why This Approach?

**Problem:** If a request uploads files but then fails (validation error, database error, etc.), files remain orphaned on disk.

**Solution:** The `FileCleanupInterceptor` uses RxJS operators to catch any error during request processing and automatically delete uploaded files before re-throwing the error.

---

## Usage Examples

### Example 1: Single File Upload (Required)

```typescript
@Post('products')
@UseInterceptors(
  FileInterceptor('image', getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({
  bucket: 'products',
  fieldName: 'image',
  required: true,
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: /\.(jpg|jpeg|png|gif|webp)$/i,
})
async create(
  @Body() dto: CreateProductDto,
  @Req() req: Request,
): Promise<any> {
  // File URL available in req.fileData.image
  const imageUrl = req.fileData.image;

  return this.service.create(dto, imageUrl);
}
```

### Example 2: Single File Upload (Optional)

```typescript
@Put('products/:id')
@UseInterceptors(
  FileInterceptor('image', getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({
  bucket: 'products',
  fieldName: 'image',
  required: false, // File is optional
})
async update(
  @Param('id') id: number,
  @Body() dto: UpdateProductDto,
  @Req() req: Request,
): Promise<any> {
  // File may or may not be present
  const imageUrl = req.fileData?.image;

  return this.service.update(id, dto, imageUrl);
}
```

### Example 3: Multiple Files (Same Field)

```typescript
@Post('gallery')
@UseInterceptors(
  FilesInterceptor('images', 10, getMulterOptions()), // Max 10 files
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({
  bucket: 'gallery',
  fieldName: 'images',
  maxCount: 10,
  maxSize: 3 * 1024 * 1024, // 3MB each
})
async uploadGallery(
  @Body() dto: CreateGalleryDto,
  @Req() req: Request,
): Promise<any> {
  // Array of image URLs
  const imageUrls = req.fileData.images; // string[]

  return this.service.createGallery(dto, imageUrls);
}
```

### Example 4: Multiple Fields

```typescript
@Post('posts')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'cover', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'attachments', maxCount: 5 },
  ], getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({
  bucket: 'posts',
  fieldName: ['cover', 'thumbnail', 'attachments'],
})
async createPost(
  @Body() dto: CreatePostDto,
  @Req() req: Request,
): Promise<any> {
  const coverUrl = req.fileData.cover; // string
  const thumbnailUrl = req.fileData.thumbnail; // string
  const attachmentUrls = req.fileData.attachments; // string[]

  return this.service.createPost(dto, {
    cover: coverUrl,
    thumbnail: thumbnailUrl,
    attachments: attachmentUrls,
  });
}
```

### Example 5: Custom File Types (Documents)

```typescript
@Post('documents')
@UseInterceptors(
  FileInterceptor('document', getMulterOptions(10 * 1024 * 1024)), // 10MB
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({
  bucket: 'documents',
  fieldName: 'document',
  required: true,
  maxSize: 10 * 1024 * 1024,
  allowedTypes: /\.(pdf|doc|docx|xls|xlsx)$/i,
})
async uploadDocument(
  @Body() dto: UploadDocumentDto,
  @Req() req: Request,
): Promise<any> {
  const documentUrl = req.fileData.document;

  return this.service.saveDocument(dto, documentUrl);
}
```

---

## Service Layer Integration

### Handling File Updates

When updating a resource with a new file, delete the old file:

```typescript
async update(
  id: number,
  dto: UpdateProductDto,
  fileData?: any,
): Promise<any> {
  const product = await this.prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // If new image uploaded, delete old image
  if (fileData?.image && product.image) {
    await this.uploadService.deleteFileByUrl(product.image);
  }

  return this.prisma.product.update({
    where: { id },
    data: {
      ...dto,
      image: fileData?.image || product.image,
    },
  });
}
```

### Handling File Deletion

When deleting a resource, also delete its files:

```typescript
async delete(id: number): Promise<any> {
  const product = await this.prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // Delete product image
  if (product.image) {
    await this.uploadService.deleteFileByUrl(product.image);
  }

  return this.prisma.product.delete({ where: { id } });
}
```

---

## Error Scenarios & Cleanup

### Scenario 1: Validation Error After Upload

```typescript
@Post('products')
@UseInterceptors(
  FileInterceptor('image', getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor, // ← Handles cleanup
)
@UploadConfig({ bucket: 'products', fieldName: 'image' })
async create(@Body() dto: CreateProductDto, @Req() req: Request) {
  // File is uploaded and stored in req.fileData.image

  // Validation error thrown
  if (dto.price < 0) {
    throw new BadRequestException('Price cannot be negative');
    // ✅ FileCleanupInterceptor automatically deletes the uploaded file
  }

  return this.service.create(dto, req.fileData.image);
}
```

### Scenario 2: Database Error After Upload

```typescript
async create(dto: CreateProductDto, imageUrl: string) {
  try {
    return await this.prisma.product.create({
      data: { ...dto, image: imageUrl },
    });
  } catch (error) {
    // Database error occurs
    // ✅ FileCleanupInterceptor catches this and deletes the file
    throw error;
  }
}
```

### Scenario 3: Business Logic Error

```typescript
async create(dto: CreateProductDto, imageUrl: string) {
  const existingProduct = await this.prisma.product.findFirst({
    where: { enName: dto.enName },
  });

  if (existingProduct) {
    throw new ConflictException('Product already exists');
    // ✅ FileCleanupInterceptor deletes the uploaded file
  }

  return this.prisma.product.create({
    data: { ...dto, image: imageUrl },
  });
}
```

---

## Upload Service Utilities

```typescript
// Delete single file
await this.uploadService.deleteFileByUrl('/uploads/products/image.jpg');

// Delete multiple files
await this.uploadService.deleteMultipleFiles([
  '/uploads/products/img1.jpg',
  '/uploads/products/img2.jpg',
]);

// Replace file (delete old, keep new)
await this.uploadService.replaceFile(oldImageUrl, newImageUrl);

// Check if file exists
const exists = await this.uploadService.fileExists(imageUrl);

// Get file size
const size = await this.uploadService.getFileSize(imageUrl);
```

---

## Configuration Options

| Option         | Type               | Default     | Description                |
| -------------- | ------------------ | ----------- | -------------------------- |
| `bucket`       | string             | Required    | Folder name under uploads/ |
| `fieldName`    | string \| string[] | Required    | Form field name(s)         |
| `maxCount`     | number             | undefined   | Max files per field        |
| `maxSize`      | number             | 5MB         | Max file size in bytes     |
| `allowedTypes` | RegExp             | images only | File type pattern          |
| `required`     | boolean            | false       | Whether file is required   |

---

## Best Practices

### ✅ DO

- Always use `FileCleanupInterceptor` after `FileUploadInterceptor`
- Delete old files when updating resources
- Delete files when deleting resources
- Use appropriate bucket names for organization
- Set reasonable file size limits
- Validate file types

### ❌ DON'T

- Don't forget to add `FileCleanupInterceptor`
- Don't leave orphaned files on disk
- Don't allow unlimited file sizes
- Don't accept any file type without validation
- Don't store file paths in code (use configuration)

---

## Global Configuration (Optional)

Apply interceptors globally in `main.ts`:

```typescript
import { FileCleanupInterceptor } from './common/interceptors/file-cleanup.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply cleanup interceptor globally
  app.useGlobalInterceptors(new FileCleanupInterceptor());

  await app.listen(3000);
}
```

---

## Troubleshooting

### Files not being deleted on error

**Check:** Ensure `FileCleanupInterceptor` is applied after `FileUploadInterceptor` in the decorator chain.

### Files deleted even on success

**Check:** Ensure you're not throwing errors after successful operations.

### Type errors with req.fileData

**Check:** Ensure `src/types/express.d.ts` is included in your `tsconfig.json`.

---

## Summary

This file upload system provides:

1. **Unified handling** for all upload scenarios
2. **Automatic cleanup** prevents orphaned files
3. **Production-ready** error handling
4. **Type-safe** TypeScript support
5. **Flexible configuration** via decorators

The key innovation is the `FileCleanupInterceptor`, which ensures uploaded files are automatically deleted if any error occurs during request processing, keeping your uploads directory clean and preventing storage bloat.
