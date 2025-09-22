import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode?: string;

  constructor(message: string, statusCode: number, options: { isOperational?: boolean; errorCode?: string } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = options.isOperational ?? true;
    this.errorCode = options.errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DuplicateUserError extends AppError {
  constructor(message = 'A user with this email already exists') {
    super(message, 400, { 
      isOperational: true,
      errorCode: 'DUPLICATE_EMAIL'
    });
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error stack for development
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: err.message,
      type: 'VALIDATION_ERROR'
    });
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A user with this email already exists',
      type: 'DUPLICATE_EMAIL',
      error: 'Email is already in use'
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Please login',
      type: 'AUTH_ERROR',
      error: 'Authentication required'
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      type: err.errorCode || 'APP_ERROR',
      error: err.message
    });
  }

  // Handle rate limiting errors
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later',
      type: 'RATE_LIMIT_ERROR'
    });
  }

  // Generic error handler
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong',
    type: 'SERVER_ERROR'
  });
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
