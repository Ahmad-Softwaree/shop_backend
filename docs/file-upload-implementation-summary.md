# File Upload System - Implementation Summary

## What Was Improved

### ❌ Old Approach (Problems)

1. **Separate interceptor for each upload type** - Had to create different interceptors for single vs multiple files
2. **No automatic cleanup** - Uploaded files stayed on disk even when requests failed
3. **Manual file handling** - Had to manually handle file paths and validation
4. **Tight coupling** - Upload logic mixed with business logic
5. **No type safety** - No TypeScript types for file data

### ✅ New Approach (Solutions)

1. **Unified interceptor** - One `FileUploadInterceptor` handles all scenarios
2. **Automatic cleanup** - `FileCleanupInterceptor` deletes files on error
3. **Declarative configuration** - `@UploadConfig()` decorator for easy setup
4. **Separation of concerns** - Upload logic separated from business logic
5. **Full type safety** - TypeScript declarations for `req.fileData`

---

## How Automatic Cleanup Works

### The Problem

```
User uploads image → Validation fails → Image remains on disk 🔴
User uploads image → Database error → Image remains on disk 🔴
User uploads image → Business logic error → Image remains on disk 🔴
```

### The Solution

```typescript
@UseInterceptors(
  FileInterceptor('image', getMulterOptions()),
  FileUploadInterceptor,      // ← Uploads and tracks file
  FileCleanupInterceptor,      // ← Cleans up on error
)
```

### What Happens Behind the Scenes

1. **File Upload Phase** (FileUploadInterceptor)

   ```
   - Multer saves file to temp directory
   - FileUploadInterceptor validates file (size, type)
   - Moves file to final location (e.g., uploads/products/)
   - Stores file info in req.uploadedFiles[] for tracking
   - Adds file URL to req.fileData for easy access
   ```

2. **Request Processing Phase**

   ```
   - Controller method executes
   - Validation runs on DTO
   - Service method executes
   - Database operations run
   ```

3. **Cleanup Phase** (FileCleanupInterceptor)

   **If Success:**

   ```
   ✅ Request completes successfully
   ✅ Files remain on disk
   ✅ Response sent to client
   ```

   **If Error (at ANY point):**

   ```
   ❌ Exception thrown (validation, database, business logic, etc.)
   ❌ FileCleanupInterceptor catches the error
   ❌ Iterates through req.uploadedFiles[]
   ❌ Deletes each uploaded file from disk
   ❌ Re-throws the error (maintains error handling flow)
   ```

### Code Example

```typescript
// FileCleanupInterceptor.ts
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  const req = context.switchToHttp().getRequest<Request>();

  return next.handle().pipe(
    catchError(async (error) => {
      // If ANY error occurs, clean up files
      if (req.uploadedFiles && Array.isArray(req.uploadedFiles)) {
        await this.cleanupFiles(req.uploadedFiles);
      }

      // Re-throw error to maintain normal error handling
      return throwError(() => error);
    }),
  );
}
```

---

## File Structure

```
server/src/
├── common/
│   ├── config/
│   │   └── multer.config.ts              # Multer configuration
│   ├── interceptors/
│   │   ├── file-upload.interceptor.ts    # Main upload handler
│   │   └── file-cleanup.interceptor.ts   # Automatic cleanup
│   └── pipes/
│       └── file-upload.pipe.ts           # (Can be removed, validation now in interceptor)
├── decorators/
│   └── upload-config.decorator.ts        # @UploadConfig() decorator
├── upload/
│   └── upload.service.ts                 # File management utilities
├── types/
│   └── express.d.ts                      # TypeScript type extensions
└── product/                              # Example usage
    ├── product.controller.ts
    ├── product.service.ts
    └── dto/product.dto.ts
```

---

## Migration Guide

### Old Code

```typescript
// Old way - manual file handling
@Post()
@UseInterceptors(SingleFileUploadInterceptor)
@BucketName('products')
async create(
  @Body() dto: CreateProductDto,
  @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
) {
  // Manual file path handling
  const imagePath = file.path;
  return this.service.create(dto, imagePath);
}
```

### New Code

```typescript
// New way - automatic handling
@Post()
@UseInterceptors(
  FileInterceptor('image', getMulterOptions()),
  FileUploadInterceptor,
  FileCleanupInterceptor,
)
@UploadConfig({
  bucket: 'products',
  fieldName: 'image',
  required: true,
})
async create(
  @Body() dto: CreateProductDto,
  @Req() req: Request,
) {
  // File automatically processed and available
  return this.service.create(dto, req.fileData);
}
```

---

## Key Benefits

### 1. **Unified Interface**

One interceptor handles all scenarios:

- Single file ✅
- Multiple files (same field) ✅
- Multiple files (different fields) ✅
- Optional files ✅
- Required files ✅

### 2. **Automatic Cleanup**

Files are automatically deleted if:

- Validation fails ✅
- Database operations fail ✅
- Business logic throws errors ✅
- Any exception occurs ✅

### 3. **Type Safety**

```typescript
req.fileData.image; // string
req.fileData.images; // string[]
req.fileData?.image; // string | undefined (optional)
```

### 4. **Clean Service Layer**

```typescript
// Service doesn't know about file upload mechanics
async create(dto: DTO, fileData?: any) {
  return this.prisma.model.create({
    data: {
      ...dto,
      image: fileData?.image,
    },
  });
}
```

### 5. **Easy Configuration**

```typescript
@UploadConfig({
  bucket: 'products',           // Where to store
  fieldName: 'image',           // Form field name
  required: true,               // Is file required?
  maxSize: 5 * 1024 * 1024,    // 5MB limit
  allowedTypes: /\.(jpg|png)$/i // Only images
})
```

---

## Performance Considerations

### File Storage Strategy

- Files are first saved to temp directory (fast)
- Then moved to final location (atomic operation)
- Avoids partial uploads in production folders

### Cleanup Efficiency

- Cleanup runs in parallel (`Promise.allSettled`)
- Never blocks error response to client
- Logs success/failure for debugging

### Memory Usage

- Uses streaming for file operations
- No files loaded into memory
- Suitable for large files

---

## Security Features

1. **File Type Validation** - Only allowed extensions
2. **File Size Limits** - Configurable per route
3. **Unique Filenames** - Prevents overwriting
4. **Path Sanitization** - Prevents directory traversal
5. **Temp Directory** - Validation before final storage

---

## Testing

### Test File Upload

```bash
curl -X POST http://localhost:3000/product \
  -F "image=@/path/to/image.jpg" \
  -F "enName=Product Name" \
  -F "arName=اسم المنتج" \
  -F "ckbName=ناوی بەرهەم" \
  -F "price=100"
```

### Test Cleanup (Validation Error)

```bash
# Upload with invalid data - file should be deleted
curl -X POST http://localhost:3000/product \
  -F "image=@/path/to/image.jpg" \
  -F "price=-100"  # Invalid price

# Check uploads/products/ directory - should be empty
```

---

## Monitoring & Debugging

The system logs important events:

```
[FileUploadInterceptor] Processing file: image.jpg
[FileUploadInterceptor] Moved to: /uploads/products/image_123456.jpg
[FileCleanup] Deleted file: /uploads/products/image_123456.jpg
```

Enable in production to monitor:

- Upload success/failure rates
- Cleanup operations
- Storage usage

---

## Best Practices Summary

1. ✅ Always use `FileCleanupInterceptor` with `FileUploadInterceptor`
2. ✅ Delete old files when updating resources
3. ✅ Delete files when deleting resources
4. ✅ Use appropriate bucket names
5. ✅ Set reasonable file size limits
6. ✅ Validate file types
7. ✅ Make image field optional in DTOs
8. ✅ Access files via `req.fileData`
9. ✅ Handle file data in service layer
10. ✅ Log upload operations for debugging

---

## Next Steps

1. Review the full documentation: `docs/file-upload-system.md`
2. Check quick reference: `docs/file-upload-quick-reference.md`
3. Update existing controllers to use new system
4. Test upload and cleanup functionality
5. Monitor logs for any issues

---

## Questions?

Check the detailed documentation or examine the product controller/service for a complete working example.
