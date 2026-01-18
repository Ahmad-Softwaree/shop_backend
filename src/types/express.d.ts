import { Request as ExpressRequest } from 'express';

/**
 * Extended Request interface with custom properties
 * for file upload handling
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * File data processed by FileUploadInterceptor
       * Contains URLs of uploaded files
       *
       * Example for single file:
       * { image: '/uploads/products/image_123456.jpg' }
       *
       * Example for multiple files:
       * { images: ['/uploads/products/img1.jpg', '/uploads/products/img2.jpg'] }
       *
       * Example for multiple fields:
       * {
       *   image: '/uploads/products/main.jpg',
       *   thumbnail: '/uploads/products/thumb.jpg'
       * }
       */
      fileData?: Record<string, string | string[]>;

      /**
       * Array of uploaded files tracked for cleanup
       * Automatically populated by FileUploadInterceptor
       */
      uploadedFiles?: Array<{
        path: string;
        url: string;
        fieldName: string;
      }>;
    }
  }
}

export {};
