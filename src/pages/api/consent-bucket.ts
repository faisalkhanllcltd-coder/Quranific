// src/pages/api/consent-bucket.ts
// SSR-only endpoint — never prerendered, never edge-cached (see Cache-Control below).
// Returns the per-visitor consent bucket computed from the real CF geo data.
//
// Middleware runs for this route (no prerender override) so context.locals.consentBucket
// is populated. We read it from locals rather than re-computing, keeping the single
// source of truth in src/lib/consent.ts.
//
// Cache-Control: no-store is set explicitly as defence in depth — not relying
// solely on the middleware's "startsWith('/api/')" exclusion persisting forever.

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = (context) => {
  const bucket = context.locals.consentBucket ?? 'STRICT';
  const hasGPC = context.locals.hasGPC ?? false;

  const body = JSON.stringify({ bucket, hasGPC });

  // Smart CORS: allow localhost strictly for local dev, lock to production origin otherwise
  const origin = context.request.headers.get('origin') ?? '';
  const isDev = import.meta.env.DEV;
  const isLocalhost = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const allowedOrigin = isDev && isLocalhost ? origin : 'https://quranific.com';

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Defence in depth — never serve a stale or cached bucket to the wrong visitor.
      // The middleware CDN-Cache-Control rule already excludes /api/* routes,
      // but this header is an explicit no-store as additional protection.
      'Cache-Control': 'no-store',
      // Smart CORS: localhost allowed for dev, production locked to quranific.com only.
      'Access-Control-Allow-Origin': allowedOrigin,
      Vary: 'Origin',
    },
  });
};
