import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../db/schema.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header or cookie
    let token: string | undefined;
    
    const authHeader = req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Check for token in cookies
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string; role: string };
    
    // Get user from the token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Add user to request object
    req.user = {
      id: (user as any)._id.toString(),
      role: (user as any).role
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorizeAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  next();
};
