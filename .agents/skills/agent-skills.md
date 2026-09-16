# Agent Skills: Quranific Codebase Operating Rules

> Strict technical operating rules for any AI agent working on this codebase.
> Derived from: actual source audit (2026-09-15), prelaunch verification (2026-09-07), and all consent/worker remediations.
> DO NOT deviate from these rules. Every rule has a verified production reason.

---

## 1. Runtime: Cloudflare Workerd (NOT Node.js)

The adapter is `@astrojs/cloudflare` with `output: 'server'`. All server-side code runs inside **Cloudflare Workerd**, not Node.js.

**Rules:**

- **NEVER** use `import.meta.env.` to access runtime secrets in API routes or middleware. This is a build-time constant — secrets are NOT available at `import.meta.env` at edge runtime.
- **ALWAYS** access runtime secrets via `env` from `cloudflare:workers`:
  ```ts
  import { env } from 'cloudflare:workers';
  const apiKey = env.RESEND_API_KEY;
  ```
- **NEVER** use `process.env`. It does not exist in Workerd.
- `import.meta.env.DEV` is a build-time constant (Vite). It IS safe to use for dev-only code branches (they are dead-code-eliminated in production builds).
- `compatibility_flags = ["nodejs_compat"]` is active. Node built-ins are available via their `node:` prefix (e.g., `import crypto from 'node:crypto'`).

---

## 2. Astro 7 Output Mode and Prerender Rules

`output: 'server'` is the global default. Every page is SSR unless explicitly opted out.

**Rules:**

- Any page that must be static (prerendered at build time) MUST declare: `export const prerender = true;` at the top of the frontmatter.
- Any page that must be SSR (session-gated, per-user data) MUST declare: `export const prerender = false;`
- All API routes (`src/pages/api/**`) are SSR by definition — they do not need `prerender = false` but must not accidentally declare `prerender = true`.
- Middleware does NOT run on prerendered pages at request time. If a page is `prerender = true`, `context.locals` is NOT available at runtime. Design accordingly.
- Session-gated pages (`/getting-started/complete`, `/getting-started/success`) MUST remain `prerender = false`.

---

## 3. Svelte 5 Runes — Mandatory Syntax

All Svelte components in this project use Svelte 5 runes. There is zero legacy Svelte 4 syntax remaining.

**Rules:**

- **NEVER** use `export let propName` — use `const { propName } = $props();`
- **NEVER** use `$: ` reactive statements — use `$derived()` or `$effect()`
- **NEVER** use `on:click={handler}` — use `onclick={handler}` (Svelte 5 event syntax)
- **ALWAYS** use `$state()` for reactive variables: `let count = $state(0);`
- **ALWAYS** use `$derived()` for computed values: `let doubled = $derived(count * 2);`
- **ALWAYS** use `$effect()` for side effects with cleanup:
  ```svelte
  $effect(() => {
    const handler = () => { ... };
    window.addEventListener('event', handler);
    return () => window.removeEventListener('event', handler);
  });
  ```
- **ALWAYS** guard browser-only APIs: `if (typeof window !== 'undefined') { ... }`
- **ALWAYS** guard `localStorage`/`sessionStorage`: `if (typeof localStorage !== 'undefined') { ... }`

---

## 4. Hydration Directives — Locked Assignments

Do not change hydration strategies without explicit justification. Each assignment was chosen for a specific performance or correctness reason:

| Component                  | Directive        | Reason                                                                |
| -------------------------- | ---------------- | --------------------------------------------------------------------- |
| `CookieBanner.svelte`      | `client:idle`    | Non-blocking; consent banner must not delay LCP                       |
| `PricingCalculator.svelte` | `client:visible` | Below fold; deferred until in viewport                                |
| `SignupForm.svelte`        | `client:load`    | Must be immediately interactive; user intent is active                |
| `CompleteForm.svelte`      | `client:load`    | Session validation runs on mount; delay would expose redirect flicker |
| `StepIndicator.svelte`     | `client:idle`    | Purely decorative; zero interaction needed                            |

---

## 5. Edge Secrets — Access Pattern

```ts
// CORRECT — always use cloudflare:workers env binding
import { env } from 'cloudflare:workers';
const resendKey = env.RESEND_API_KEY;
const turnstileKey = env.TURNSTILE_SECRET_KEY ?? env.TURNSTILE_SECRET; // legacy alias
const jwtSecret = env.JWT_SECRET;
const adminEmail = env.ADMIN_EMAIL ?? 'faisalkhan.llc.ltd@gmail.com';

// WRONG — import.meta.env does NOT work at Workerd runtime for secrets
const key = import.meta.env.RESEND_API_KEY; // undefined at edge
```

All secrets are declared in `src/env.d.ts` interface `Env`. When adding a new secret:

1. Add to `src/env.d.ts` `Env` interface
2. Add to `.env.example` with description
3. Add to Cloudflare Pages dashboard secrets
4. Add to `alarm-worker/.dev.vars` if needed by the alarm worker

---

## 6. KV Operations — Binding and Pattern

The only KV namespace is `SESSION` (ID: `14eab319d57e4c58b5f903bce3eb3931`). Access via `context.locals` (in Astro routes/middleware) or `env` (in Workerd-native contexts).

```ts
// In Astro API route:
const kv = context.locals.runtime?.env?.SESSION;

// Always null-check before KV operations:
if (kv) {
  await kv.put('KEY', JSON.stringify(value), { expirationTtl: 60 });
  const raw = await kv.get('KEY');
}
```

**KV key naming convention — MUST follow exactly:**

- Rate limit: `RL:{ENDPOINT}:{ip}` (TTL 60s)
- Idempotency: `IDEMPOTENCY:{jti}` (TTL 960s)
- Dead-letter: `FAILED_{TYPE}_{SUBTYPE}:{identifier}` (TTL 2592000 — 30 days)

The `retry-queue.ts` consumer scans `prefix: 'FAILED'` — all dead-letter keys MUST start with `FAILED`.

---

## 7. Email Dispatch — Always waitUntil() and Always Dead-Letter

Never await Resend email calls directly in the critical path. Always use `context.locals.runtime.ctx.waitUntil()`:

```ts
context.locals.runtime.ctx.waitUntil(
  Promise.allSettled([
    sendAdminEmail(...).catch(async (err) => {
      if (kv) await kv.put(`FAILED_TYPE:${id}`, JSON.stringify(payload), { expirationTtl: 2592000 });
    }),
    sendUserEmail(...).catch(async (err) => {
      if (kv) await kv.put(`FAILED_TYPE_USER:${id}`, JSON.stringify(payload), { expirationTtl: 2592000 });
    }),
  ])
);
```

**Mock mode:** Email functions fall back to `console.log` when `RESEND_API_KEY` is absent, empty, or doesn't start with `re_`. This is the expected local dev behaviour. Do not add extra guards.

---

## 8. Rate Limiting Pattern

```ts
const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
const rlKey = `RL:ENDPOINT:${ip}`;
const rlRaw = await kv.get(rlKey);
const rlCount = rlRaw ? parseInt(rlRaw, 10) : 0;
if (rlCount >= 4) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please wait a minute before trying again.' }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
await kv.put(rlKey, String(rlCount + 1), { expirationTtl: 60 });
```

Max 4 attempts per 60 seconds per IP. This pattern is consistent across all 4 rate-limited endpoints.

---

## 9. Consent Architecture — Do Not Modify Without Full Understanding

The consent system is a 3-phase pipeline. Do not change any part without understanding all three phases.

| Phase   | Location                                         | Description                                                                                                            |
| ------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Phase 1 | `src/middleware.ts` → `src/lib/consent.ts`       | Server computes bucket from CF geo; stored in `context.locals.consentBucket`                                           |
| Phase 2 | `src/layouts/Base.astro` `<head>`                | Universal deny-all `gtag('consent','default',...)` injected — byte-identical, cache-safe                               |
| Phase 3 | `Base.astro` inline IIFE + `CookieBanner.svelte` | Client fetches `/api/consent-bucket` (PATH B, new visitor) or reads `cf_consent_v1` cookie (PATH A, returning visitor) |

**Rules:**

- `src/lib/consent.ts` `getConsentBucket()` is pure (no side effects). Do NOT add I/O or async operations to it.
- The Phase 2 deny-all snippet must remain byte-identical across all prerendered pages — it cannot contain any per-request or per-country values. This is the cache-safety invariant.
- `/api/consent-bucket` MUST return `Cache-Control: no-store`. It serves per-visitor data.
- Cookie name: `cf_consent_v1`. Format: `BUCKET:choice` (e.g., `STRICT:accepted`). Do not change either.

---

## 10. Tailwind v4 — Oxide Engine Rules

```ts
// astro.config.mjs uses @tailwindcss/vite — no separate postcss.config or tailwind.config.js
import tailwindcss from '@tailwindcss/vite';
```

**Rules:**

- There is NO `tailwind.config.js`. Configuration is done in `src/styles/global.css` using native `@theme`, `@layer`, and CSS variable overrides.
- Use `@layer components {}` in `global.css` for reusable component classes.
- Arbitrary values like `text-[11px]`, `tracking-[0.2em]` are valid and used throughout — do not replace them with non-existent scale steps.
- Do NOT install `@tailwindcss/forms` or `@tailwindcss/typography` without checking they are v4 compatible.

---

## 11. Pricing System — Static Only, No Live APIs

`src/constants/pricing.ts` is the single source of truth. There is NO live exchange rate API, NO fx-updater Worker, NO `FX_RATES` KV binding. These were permanently decommissioned.

**Rules:**

- All prices are fixed integers (except EUR which is 2 decimal places: `€34.00`).
- Do not add any async fetch to pricing components. Currency is detected once via `/api/geo-currency` on component mount.
- To add a new currency: add to `PRICING` object in `pricing.ts`, add to `CURRENCY_META`, add ISO country codes to `COUNTRY_CURRENCY_MAP`.
- AED (`د.إ`) and SAR (`﷼`) MUST use `dir="ltr"` and `<bdi>` wrappers in all display contexts to prevent Arabic RTL reordering.

---

## 12. JWT Session — Exact Spec

```ts
// Mint (in register.ts)
const token = await new SignJWT({ ...claims })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('15m')
  .sign(TextEncoder().encode(env.JWT_SECRET));

// Cookie
Set-Cookie: q_session={token}; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/
```

- JWT algorithm: `HS256`. Do not change to `RS256` without updating both sign and verify.
- Expiry: 15 minutes (900 seconds). `Max-Age=900` matches.
- Cookie is `HttpOnly`, `Secure`, `SameSite=Strict`. Do not relax any attribute.
- Idempotency TTL (960s) is intentionally 60s longer than cookie TTL (900s) to prevent race conditions at expiry boundary.

---

## 13. alarm-worker/ — Separate Deployment

`alarm-worker/` is a separate Cloudflare Worker (`quranific-alarm`). It is NOT part of the Astro build.

**Rules:**

- Deploy separately: `cd alarm-worker && wrangler deploy`
- It shares `JWT_SECRET` with the main site — both must always have identical values.
- It has no KV binding of its own; it triggers the main site's `/api/internal/retry-queue` via HTTP.
- `TARGET_URL` is a plain var in `alarm-worker/wrangler.toml`. `JWT_SECRET` is a secret — set via `wrangler secret put JWT_SECRET --config alarm-worker/wrangler.toml`.

---

## 14. Do Not Delete Active Tooling

The following root-level files are active development utilities, not legacy artifacts:

- `dead_code.cjs` — import tracer for dead component detection (`node dead_code.cjs`)
- `link_check.cjs` — route/link integrity checker (`node link_check.cjs`)

The `tests/` directory contains active production test assets:

- `tests/consent.spec.ts` — 17-test Playwright E2E consent suite (must pass before any consent-related deploy)
- `tests/consent-unit.test.ts` — 19 unit tests for `src/lib/consent.ts`
- `tests/seo-snapshot.mjs` — SEO regression snapshot generator
- `tests/seo-diff.mjs` — SEO regression diff checker

Run consent tests: `npx playwright test tests/consent.spec.ts`  
Run unit tests: `npx vitest tests/consent-unit.test.ts` (or equivalent test runner in `package.json`)
