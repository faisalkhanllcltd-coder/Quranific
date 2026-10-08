// src/lib/newsletter-token.ts
import { SignJWT, jwtVerify } from 'jose';
import { SITE } from '../constants/site';

export type NewsletterTokenAction = 'newsletter_confirm' | 'newsletter_unsubscribe';

export interface NewsletterTokenPayload {
  email: string;
  action: NewsletterTokenAction;
}

/**
 * Derives a dedicated HMAC-SHA256 signing key from JWT_SECRET using crypto.subtle.
 * Domain separation string: "quranific-newsletter-v1"
 */
export async function deriveNewsletterKey(jwtSecret: string): Promise<Uint8Array> {
  if (!jwtSecret || typeof jwtSecret !== 'string' || !jwtSecret.trim()) {
    console.error('[Configuration Error]: Missing JWT_SECRET for newsletter token generation');
    throw new Error('MISSING_JWT_SECRET');
  }

  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const derivedSig = await crypto.subtle.sign(
    'HMAC',
    baseKey,
    enc.encode('quranific-newsletter-v1')
  );

  return new Uint8Array(derivedSig);
}

/**
 * Generates a signed JWT token.
 * - newsletter_confirm: expires in 48 hours.
 * - newsletter_unsubscribe: no expiration (legal best practice so unsubscribe links keep working).
 */
export async function generateNewsletterToken(
  email: string,
  action: NewsletterTokenAction,
  jwtSecret: string
): Promise<string> {
  const derivedKey = await deriveNewsletterKey(jwtSecret);
  const cleanEmail = email.toLowerCase().trim();

  let jwt = new SignJWT({ email: cleanEmail, action })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt();

  if (action === 'newsletter_confirm') {
    jwt = jwt.setExpirationTime('48h');
  }

  return await jwt.sign(derivedKey);
}

/**
 * Verifies a newsletter token, checking both cryptographic signature and expected action claim.
 */
export async function verifyNewsletterToken(
  token: string,
  expectedAction: NewsletterTokenAction,
  jwtSecret: string
): Promise<NewsletterTokenPayload> {
  const derivedKey = await deriveNewsletterKey(jwtSecret);
  const { payload } = await jwtVerify(token, derivedKey, {
    algorithms: ['HS256'],
  });

  if (payload.action !== expectedAction) {
    throw new Error(`Invalid token action: expected ${expectedAction}, got ${payload.action}`);
  }

  if (typeof payload.email !== 'string' || !payload.email) {
    throw new Error('Invalid token payload: missing email claim');
  }

  return {
    email: payload.email.toLowerCase().trim(),
    action: payload.action as NewsletterTokenAction,
  };
}

/**
 * Generates the full confirmation link using SITE.url.
 */
export async function createNewsletterConfirmUrl(
  email: string,
  jwtSecret: string
): Promise<string> {
  const token = await generateNewsletterToken(email, 'newsletter_confirm', jwtSecret);
  return `${SITE.url}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

/**
 * Generates the full unsubscribe link using SITE.url.
 */
export async function createNewsletterUnsubscribeUrl(
  email: string,
  jwtSecret: string
): Promise<string> {
  const token = await generateNewsletterToken(email, 'newsletter_unsubscribe', jwtSecret);
  return `${SITE.url}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
