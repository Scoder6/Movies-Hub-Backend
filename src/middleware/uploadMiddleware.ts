// src/middleware/uploadMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { upload } from '../utils/upload.js';
import { AppError } from './errorHandler.js';

/**
 * Returns an express RequestHandler that processes a single image upload
 * using the provided multer instance (`upload`) and the given field name.
 *
 * Usage:
 *   router.post('/movies', authenticate, uploadSingleImage('image'), controller.addMovie)
 */
const uploadSingleImage = (fieldName: string): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      // No error -> continue
      if (!err) return next();

      // normalize properties
      const code = err?.code;
      const message = (err?.message ?? '').toString().toLowerCase();

      // Multer limit errors
      if (code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File size too large. Max allowed is 5MB.', 400));
      }
      if (code === 'LIMIT_FILE_COUNT' || code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Too many files uploaded or unexpected file field.', 400));
      }

      // File filter error (custom message from fileFilter)
      if (message && /only.*(jpeg|png|webp|image)|only.*image/.test(message)) {
        return next(new AppError('Only image files are allowed (jpeg, png, webp).', 400));
      }

      // Fallback
      return next(new AppError('File upload failed.', 400));
    });
  };
};

export { uploadSingleImage };
