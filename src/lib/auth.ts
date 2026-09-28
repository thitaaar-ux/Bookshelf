import crypto from 'crypto';

export const TOKEN_EXPIRATION_DAYS = 14;
export const TOKEN_EXPIRATION_MS = TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // 14 days

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.LINE_CHANNEL_SECRET || 'bookshelf_secure_auth_token_key_14d';

/**
 * Hash password with random salt using native scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against stored salt:hash string
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  expiresAt: number; // Timestamp in ms
}

/**
 * Create a secure HMAC-signed session token valid for 14 days
 */
export function createSessionToken(data: Omit<SessionPayload, 'expiresAt'>): {
  token: string;
  expiresAt: number;
} {
  const expiresAt = Date.now() + TOKEN_EXPIRATION_MS;
  const payload: SessionPayload = { ...data, expiresAt };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  const token = `${payloadBase64}.${signature}`;
  return { token, expiresAt };
}

/**
 * Verify and decode an HMAC-signed session token
 */
export function verifySessionToken(token: string): {
  valid: boolean;
  expired: boolean;
  payload?: SessionPayload;
} {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) {
      return { valid: false, expired: false };
    }

    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, expired: false };
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8')
    );

    const isExpired = Date.now() > payload.expiresAt;
    return {
      valid: !isExpired,
      expired: isExpired,
      payload: isExpired ? undefined : payload,
    };
  } catch {
    return { valid: false, expired: false };
  }
}
