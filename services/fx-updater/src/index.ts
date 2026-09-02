export interface Env {
  FX_RATES: KVNamespace;
}

export async function fetchAndStoreRates(env: Env) {
  const response = await fetch(
    'https://api.frankfurter.app/latest?from=USD&to=GBP,EUR,SGD,CAD,AUD'
  );

  if (!response.ok) {
    throw new Error(`Frankfurter API error: ${response.status}`);
  }

  const data = (await response.json()) as { rates?: Record<string, number> };

  if (data && data.rates) {
    const payload = {
      rates: data.rates,
      fetchedAt: new Date().toISOString(),
    };

    await env.FX_RATES.put('LATEST_RATES', JSON.stringify(payload));
    return payload;
  }

  throw new Error('Malformed response from rate API');
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(fetchAndStoreRates(env));
  },

  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/force-update') {
      try {
        const payload = await fetchAndStoreRates(env);
        return new Response(JSON.stringify({ success: true, ...payload }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ success: false, error: message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('FX Updater Microservice Active', { status: 200 });
  },
};
