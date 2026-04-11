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
  RESEND_API_KEY: string;
  TURNSTILE_SECRET: string;
  ADMIN_EMAIL: string;
  SHEET_WEBHOOK_URL?: string;
  ENVIRONMENT: 'development' | 'production';
}