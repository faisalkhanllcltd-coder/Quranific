export interface Env {
  TARGET_URL: string;
  JWT_SECRET: string;
}

export default {
  // 1. The Cron Handler (Executes hourly)
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const request = fetch(env.TARGET_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.JWT_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    ctx.waitUntil(request);
  },

  // 2. The HTTP Handler (Prevents "No fetch handler" 1101 errors)
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Allow manual triggering via HTTP POST for testing
    if (url.pathname === '/force-run' && request.method === 'POST') {
      const retryRequest = fetch(env.TARGET_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.JWT_SECRET}`,
          'Content-Type': 'application/json',
        },
      });
      ctx.waitUntil(retryRequest);
      return new Response('Manual alarm trigger initiated.', { status: 202 });
    }

    return new Response('Quranific Alarm Worker Active', { status: 200 });
  },
};
