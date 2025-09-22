import app from './app.js';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { connectDB } from './db/connection.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err);
  // Close server & exit process
  process.exit(1);
});

// Start server
const PORT = config.PORT || 5000;
const server = app.listen(PORT, async () => {
  try {
    await connectDB();
    logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err);
  
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (For Docker/Kubernetes)
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

// Handle SIGINT (For nodemon restarts)
process.on('SIGINT', () => {
  logger.info('👋 SIGINT RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
    process.exit(0);
  });
});

// Handle process warnings
process.on('warning', (warning) => {
  logger.warn(`Process Warning: ${warning.name} - ${warning.message}`);
  logger.warn(warning.stack);
});

// Handle process exit
process.on('exit', (code) => {
  logger.info(`Process exiting with code: ${code}`);
});
