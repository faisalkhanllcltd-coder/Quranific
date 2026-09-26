export interface Env {
  TARGET_URL: string;
  JWT_SECRET?: string;
  ALARM_ADMIN_TOKEN: string;
  INTERNAL_WORKER_SECRET: string;
}

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBuf = await crypto.subtle.digest('SHA-256', encoder.encode(a));
  const bBuf = await crypto.subtle.digest('SHA-256', encoder.encode(b));
  const aBytes = new Uint8Array(aBuf);
  const bBytes = new Uint8Array(bBuf);
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

export default {
  // 1. The Cron Handler (Executes hourly)
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const handleRetry = async () => {
      try {
        const response = await fetch(env.TARGET_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.INTERNAL_WORKER_SECRET}`,
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

    if (url.pathname === '/') {
      return new Response('Quranific Alarm Worker Active', { status: 200 });
    }

    const authHeader = request.headers.get('Authorization') || '';
    const expectedAuth = env.ALARM_ADMIN_TOKEN ? `Bearer ${env.ALARM_ADMIN_TOKEN}` : '';
    if (!expectedAuth || !(await timingSafeEqual(authHeader, expectedAuth))) {
      return new Response(null, { status: 401 });
    }

    // Allow manual triggering via HTTP POST for testing
    if (url.pathname === '/force-run' && request.method === 'POST') {
      try {
        const response = await fetch(env.TARGET_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.INTERNAL_WORKER_SECRET}`,
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
            Authorization: `Bearer ${env.INTERNAL_WORKER_SECRET}`,
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

    return new Response('Not Found', { status: 404 });
  },
};
