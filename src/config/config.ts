import dotenv from 'dotenv';

dotenv.config();

interface Config {
  PORT: string | number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  COOKIE_EXPIRES_IN: number;
  CORS_ORIGIN: string;
  NODE_ENV: string;
  MAX_FILE_SIZE: number;
  MAX_FILES: number;
  UPLOAD_DIR: string;
  BASE_URL: string;
  SALT_ROUNDS: number;
  mongo: {
    uri: string;
  };
}

export const config: Config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-maze',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  COOKIE_EXPIRES_IN: parseInt(process.env.COOKIE_EXPIRES_IN || '86400'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
  MAX_FILES: parseInt(process.env.MAX_FILES || '10'),
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'public/uploads',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10'),
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-maze'
  },
};

export type ConfigType = typeof config;