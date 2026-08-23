import bcrypt from 'bcrypt';
import { ENV } from '../config/env';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ENV.BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
