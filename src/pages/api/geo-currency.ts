// src/pages/api/geo-currency.ts
// SSR-only endpoint — never prerendered, never edge-cached.
// Returns the per-visitor currency computed from the CF geo data.

import type { APIRoute } from 'astro';
import { getCurrencyForCountry } from '../../constants/pricing';

export const prerender = false;

export const GET: APIRoute = (context) => {
  // Query param allows local/QA override, falling back to middleware locals (CF country or X-Debug-Country in dev)
  const queryCountry = context.url.searchParams.get('country');
  const cfCountry =
    context.locals.userCountry && context.locals.userCountry !== 'Unknown'
      ? context.locals.userCountry
      : context.request.headers.get('cf-ipcountry');
  const userCountry = queryCountry || cfCountry || 'Unknown';
  const currency = getCurrencyForCountry(userCountry);

  const body = JSON.stringify({
    country: userCountry,
    currency,
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
