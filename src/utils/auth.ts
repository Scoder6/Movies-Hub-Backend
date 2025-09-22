import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, config.SALT_ROUNDS);
}

export async function comparePasswords(
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, hashedPassword);
}
