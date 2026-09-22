import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export const SESSION_COOKIE = 'privy-token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error('AUTH_SECRET is not set');
  return value;
}

export type SessionClaims = { sub: string; email: string };

export function signSession(claims: SessionClaims) {
  return jwt.sign(claims, secret(), { expiresIn: SESSION_MAX_AGE });
}

export function verifySession(token: string): SessionClaims | null {
  try {
    const decoded = jwt.verify(token, secret()) as jwt.JwtPayload;
    if (typeof decoded.sub !== 'string' || typeof decoded.email !== 'string')
      return null;
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
}

export function clearedSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function checkPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
