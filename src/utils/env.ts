// src/utils/env.ts
import { z } from 'zod';

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is missing'),
  TURNSTILE_SECRET: z.string().optional(),
  ADMIN_EMAIL: z.string().email().default('admin@quranific.com'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  SITE_URL: z.string().url().default('http://localhost:4321'),
  GA_ID: z.string().optional(),
  IS_PROD: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === 'true')
    .default(false),
});

type Env = z.infer<typeof envSchema>;

// Lazy singleton — does NOT throw at module scope (would crash the V8 isolate).
// Throws on first access within a request handler instead, producing a proper 500.
let _env: Env | null = null;

function buildEnv(): Env {
  const raw = {
    RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
    TURNSTILE_SECRET: import.meta.env.TURNSTILE_SECRET,
    ADMIN_EMAIL: import.meta.env.ADMIN_EMAIL,
    JWT_SECRET:
      import.meta.env.JWT_SECRET || 'dev_secret_key_that_is_long_enough_12345!',
    SITE_URL: import.meta.env.SITE,
    GA_ID: import.meta.env.GA_ID,
    IS_PROD: import.meta.env.PROD,
  };

  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('❌ FATAL: Invalid or missing environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Server configuration error. Check environment variables.');
  }
  return parsed.data;
}

export function getEnv(): Env {
  if (!_env) _env = buildEnv();
  return _env;
}

// Convenience re-export for code that already uses ENV directly.
// The Proxy defers evaluation to first property access, keeping module scope clean.
export const ENV: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});