import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import { config } from '../config/config.js';

// Development vs production settings
const isDev = config.NODE_ENV === 'development';

// Rate limiter skip function
const shouldSkipRateLimit = (req: Request): boolean => {
  // Skip rate limiting for health checks and in development
  return req.path === '/api/health' || isDev;
};

// General rate limiter - more lenient in development
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 100, // Higher limit in development
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again after 15 minutes',
      type: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 15 * 60 // 15 minutes in seconds
    });
  }
});

// Auth-specific rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 20, // More lenient in development
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again after 15 minutes',
      type: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: 15 * 60 // 15 minutes in seconds
    });
  }
});

export { generalLimiter, authLimiter };
