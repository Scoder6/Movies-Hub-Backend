import mongoose from 'mongoose';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

// Enable debug mode in development
if (config.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

export const connectDB = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    } as any);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Log MongoDB connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from DB');
    });
    
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Close the Mongoose connection when the Node process ends
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed through app termination');
  process.exit(0);
});
