import { diskStorage, StorageEngine } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Configure Multer Storage
 *
 * This creates a temporary storage configuration for Multer.
 * Files are initially saved to a temp directory, then moved to their
 * final location by FileUploadInterceptor.
 *
 * This approach allows validation and business logic to run before
 * finalizing file storage.
 */
export function configureMulterStorage(
  tempDir = 'uploads/temp',
): StorageEngine {
  return diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), tempDir);

      // Ensure temp directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate temporary filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname);
      const tempName = `temp-${uniqueSuffix}${extension}`;
      cb(null, tempName);
    },
  });
}

/**
 * Get Multer options for file upload
 *
 * @param maxFileSize - Maximum file size in bytes (default: 5MB)
 * @returns Multer options object
 */
export function getMulterOptions(maxFileSize = 5 * 1024 * 1024) {
  return {
    storage: configureMulterStorage(),
    limits: {
      fileSize: maxFileSize,
    },
  };
}
