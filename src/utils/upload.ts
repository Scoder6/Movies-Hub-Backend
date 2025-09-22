import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

// Configure storage
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .png, and .webp formats allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Max 10 files
  },
});

export const getImageUrl = (filename: string) => {
  return `${config.BASE_URL}/uploads/${filename}`;
};
