import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export type UploadResult = {
  url: string;
  path: string;
};

/**
 * Upload Service
 *
 * Provides utility methods for file management:
 * - Delete files from disk
 * - Delete multiple files
 * - Manage file storage
 */
@Injectable()
export class UploadService {
  /**
   * Delete a file by its full path
   *
   * @param fullPath - Relative path from uploads directory (e.g., 'products/image.jpg')
   * @returns Promise<boolean> - true if deleted, false otherwise
   */
  async deleteFile(fullPath: string): Promise<boolean> {
    try {
      const absolutePath = path.join(process.cwd(), 'uploads', fullPath);
      await fs.unlink(absolutePath);
      console.log(`[UploadService] Deleted file: ${absolutePath}`);
      return true;
    } catch (error) {
      console.error(`[UploadService] Error deleting file: ${fullPath}`, error);
      return false;
    }
  }

  /**
   * Delete a file by its URL
   *
   * @param fileUrl - File URL (e.g., '/uploads/products/image.jpg')
   * @returns Promise<boolean> - true if deleted, false otherwise
   */
  async deleteFileByUrl(fileUrl: string): Promise<boolean> {
    try {
      // Extract path from URL
      const urlPath = fileUrl.replace(/^\/uploads\//, '');
      return await this.deleteFile(urlPath);
    } catch (error) {
      console.error(
        `[UploadService] Error deleting file by URL: ${fileUrl}`,
        error,
      );
      return false;
    }
  }

  /**
   * Delete multiple files
   *
   * @param fileUrls - Array of file URLs
   * @returns Promise<void>
   */
  async deleteMultipleFiles(fileUrls: string[]): Promise<void> {
    const deletePromises = fileUrls.map((url) => this.deleteFileByUrl(url));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Delete old file and replace with new one
   * Useful for update operations where you want to remove the old image
   *
   * @param oldFileUrl - URL of the old file to delete
   * @param newFileUrl - URL of the new file (just for logging)
   * @returns Promise<boolean>
   */
  async replaceFile(oldFileUrl: string, newFileUrl?: string): Promise<boolean> {
    if (oldFileUrl && oldFileUrl !== newFileUrl) {
      return await this.deleteFileByUrl(oldFileUrl);
    }
    return false;
  }

  /**
   * Check if file exists
   *
   * @param fileUrl - File URL
   * @returns Promise<boolean>
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const urlPath = fileUrl.replace(/^\/uploads\//, '');
      const absolutePath = path.join(process.cwd(), 'uploads', urlPath);
      await fs.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file size
   *
   * @param fileUrl - File URL
   * @returns Promise<number> - File size in bytes, or 0 if file doesn't exist
   */
  async getFileSize(fileUrl: string): Promise<number> {
    try {
      const urlPath = fileUrl.replace(/^\/uploads\//, '');
      const absolutePath = path.join(process.cwd(), 'uploads', urlPath);
      const stats = await fs.stat(absolutePath);
      return stats.size;
    } catch {
      return 0;
    }
  }
}
