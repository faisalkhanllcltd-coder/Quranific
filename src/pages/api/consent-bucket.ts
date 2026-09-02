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

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Defence in depth — never serve a stale or cached bucket to the wrong visitor.
      // The middleware CDN-Cache-Control rule already excludes /api/* routes,
      // but this header is an explicit no-store as additional protection.
      'Cache-Control': 'no-store',
      // Allow all origins to fetch this — it returns no sensitive user data,
      // only a derived compliance bucket string ("STRICT"/"MODERATE"/"NONE").
      'Access-Control-Allow-Origin': '*',
    },
  });
};
