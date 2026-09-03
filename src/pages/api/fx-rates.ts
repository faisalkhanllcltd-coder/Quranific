// src/pages/api/fx-rates.ts
// SSR-only endpoint — never prerendered, excluded from Edge CDN cache.
// Returns latest exchange rates from Cloudflare KV (populated by fx-updater cron).

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
}

export const GET: APIRoute = async () => {
  try {
    const runtimeEnv = env as unknown as Record<string, unknown>;
    const kv = runtimeEnv?.FX_RATES as KVNamespaceLike | undefined;

    if (!kv) {
      return new Response(JSON.stringify({ rates: null, error: 'KV Binding Missing' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const raw = await kv.get('LATEST_RATES');
    if (!raw) {
      return new Response(JSON.stringify({ rates: null, message: 'No rates stored' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const parsed = JSON.parse(raw) as { rates?: Record<string, number>; fetchedAt?: string };

    return new Response(
      JSON.stringify({ rates: parsed.rates ?? null, fetchedAt: parsed.fetchedAt }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ rates: null, error: message }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
