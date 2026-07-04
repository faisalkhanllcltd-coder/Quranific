/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    userCountry: string;
    userCity: string;
    isSlowConnection?: boolean;
  }
}

interface Env {
  // Email provider
  RESEND_API_KEY: string;

  // Cloudflare Turnstile — both names accepted for backwards compat
  TURNSTILE_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY: string;

  // Admin
  ADMIN_EMAIL: string;

  // JWT signing secret
  JWT_SECRET: string;

  // Site configuration
  SITE: string;

  // GA tracking ID (optional)
  GA_ID?: string;

  // Optional legacy webhook
  SHEET_WEBHOOK_URL?: string;

  // Cloudflare environment tag
  ENVIRONMENT: 'development' | 'production';

  // Cloudflare KV namespace binding for sessions and dead-letter queue
  // Must be declared in wrangler.toml as [[kv_namespaces]] binding = "SESSION"
  SESSION: KVNamespace;
}