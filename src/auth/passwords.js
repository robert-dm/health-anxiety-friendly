import crypto from 'node:crypto';
import { scryptAsync } from '@noble/hashes/scrypt.js';
const encoder = new TextEncoder();
const options = { N: 16384, r: 8, p: 1, dkLen: 64 };
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scryptAsync(encoder.encode(password), salt, options);
  return `scrypt$${salt.toString('base64')}$${Buffer.from(hash).toString('base64')}`;
}
export async function verifyPassword(password, storedHash) {
  const [algorithm,salt,hash] = String(storedHash || '').split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash,'base64');
  const saltBytes = Buffer.from(salt,'base64');
  if (expected.length !== 64 || saltBytes.length !== 16) return false;
  const actual = await scryptAsync(encoder.encode(String(password || '')),saltBytes,options);
  return crypto.timingSafeEqual(actual,expected);
}
