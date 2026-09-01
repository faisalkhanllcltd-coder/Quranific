// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { getConsentBucket } from './lib/consent';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://tagassistant.google.com 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.resend.com https://challenges.cloudflare.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
    "frame-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; '),
};

export const onRequest = defineMiddleware(async (context, next) => {
  const cf = (context.request as Request & { cf?: Record<string, unknown> }).cf;

  const userCountry = (cf?.country as string) || 'Unknown';
  const userRegionCode = (cf?.regionCode as string) || '';

  // Sec-GPC: Global Privacy Control — a legally binding opt-out signal in CA/CO/CT/etc.
  // Read from request header. Treat '1' as present.
  const hasGPC = context.request.headers.get('Sec-GPC') === '1';

  context.locals.isSlowConnection =
    cf?.httpProtocol === 'HTTP/1.1' || cf?.asOrganization === 'Cellular';
  context.locals.userCountry = userCountry;
  context.locals.userCity = (cf?.city as string) || 'Unknown';
  context.locals.userRegionCode = userRegionCode;
  context.locals.hasGPC = hasGPC;
  context.locals.consentBucket = getConsentBucket(userCountry, userRegionCode, hasGPC);

  const response = await next();

  if (cf?.colo) {
    response.headers.set('X-Edge-Location', cf.colo as string);
  }

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }

  // ─── Edge SSR Caching (Mandate 5) ─────────────────────────────────────────
  // Cache HTML responses at Cloudflare's Edge, but force browsers to revalidate.
  if (context.request.method === 'GET' && !context.url.pathname.startsWith('/api/')) {
    if (!response.headers.has('Cache-Control')) {
      // Prevents the user's browser from caching stale data
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    if (!response.headers.has('CDN-Cache-Control')) {
      // Tells Cloudflare to cache the SSR render for 1 hour at the edge nodes
      response.headers.set(
        'CDN-Cache-Control',
        'public, max-age=3600, stale-while-revalidate=86400'
      );
    }
  }

  return response;
});
