export interface Env {
  TARGET_URL: string;
  JWT_SECRET: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const request = fetch(env.TARGET_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.JWT_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    // Ensure the execution context stays alive until the Astro endpoint replies
    ctx.waitUntil(request);
  },
};
