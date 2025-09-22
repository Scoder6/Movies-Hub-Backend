import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config/config.js';

interface TokenPayload extends JwtPayload {
  id: string | number;
  role?: string;
}

export function generateAuthToken(userId: string | number, role?: string): string {
  const payload: TokenPayload = { id: userId };
  if (role) {
    payload.role = role;
  }
  
  // Use type assertion to handle the expiresIn type
  const options = {
    expiresIn: config.JWT_EXPIRES_IN as string,
  } as SignOptions;
  
  return jwt.sign(payload, config.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.JWT_SECRET) as { id: number };
  } catch (error) {
    return null;
  }
}
