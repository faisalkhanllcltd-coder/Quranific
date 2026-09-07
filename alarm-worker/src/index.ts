export interface Env {
  TARGET_URL: string;
  JWT_SECRET: string;
}

export default {
  // 1. The Cron Handler (Executes hourly)
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const handleRetry = async () => {
      try {
        const response = await fetch(env.TARGET_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.JWT_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        const resultText = await response.text();
        console.log(`[alarm-worker] Cron retry-queue response: ${response.status} - ${resultText}`);
      } catch (err) {
        console.error('[alarm-worker] Cron retry-queue fetch failed:', err);
      }
    };

    ctx.waitUntil(handleRetry());
  },

  // 2. The HTTP Handler (Prevents "No fetch handler" 1101 errors & enables testing)
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // Allow manual triggering via HTTP POST for testing
    if (url.pathname === '/force-run' && request.method === 'POST') {
      try {
        const response = await fetch(env.TARGET_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.JWT_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        const resultText = await response.text();
        return new Response(resultText, {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Allow querying Resend log via HTTP GET for audit verification
    if (url.pathname === '/resend-log' && request.method === 'GET') {
      try {
        const idParam = url.searchParams.get('id');
        const target = idParam
          ? `${env.TARGET_URL}?id=${encodeURIComponent(idParam)}`
          : env.TARGET_URL;

        const response = await fetch(target, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${env.JWT_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        const resultText = await response.text();
        return new Response(resultText, {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Quranific Alarm Worker Active', { status: 200 });
  },
};
