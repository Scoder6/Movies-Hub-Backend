import { IUser } from '../db/schema';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
    
    interface Multer {
      File: {
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
      };
    }
  }
}
