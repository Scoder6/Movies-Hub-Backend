// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { authRoutes } from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import commentRoutes from './routes/comments.js';
import voteRoutes from './routes/votes.js';
import adminRoutes from './routes/admin.js';
import { config } from './config/config.js';
import { ensureUploadDirExists } from './utils/storage.js';

// Recreate __dirname for ESM environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Ensure upload directory exists
ensureUploadDirExists();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
    },
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
  })
);

// Apply CORS with simplified configuration
app.use((req, res, next) => {
  const allowedOrigins = [config.CORS_ORIGIN];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
  }

  next();
});

// Trust first proxy (if behind a proxy like Nginx)
app.set('trust proxy', 1);

// Cookie parser middleware
app.use(cookieParser());

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging middleware
app.use(morgan('dev'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rate limiting
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/auth')) {
    return generalLimiter(req, res, next);
  }
  next();
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'OK' });
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API endpoint not found: ${req.originalUrl}` });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../../dist');

  // Serve static files from the React app
  app.use(express.static(clientPath, {
    index: false, // Don't serve index.html for directories
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache for static assets
    }
  }));

  // Handle React routing - return all other requests to React app
  app.get('*', (_, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// 404 handler for non-API routes
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Error handling - must be the last middleware
app.use(errorHandler);

// Also export default (makes consumers tolerant of either import style)
export default app;
