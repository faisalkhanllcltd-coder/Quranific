# Quranific — Deployment Guide

> Infrastructure reference for deploying and operating the Quranific platform on Cloudflare Pages + Workers.

---

## Infrastructure Overview

The platform consists of **two independently deployed Cloudflare resources**:

| Resource    | Name              | Type                               | Description                      |
| ----------- | ----------------- | ---------------------------------- | -------------------------------- |
| Main site   | `quranific`       | Cloudflare Pages (Workers runtime) | SSR web application              |
| Cron daemon | `quranific-alarm` | Cloudflare Worker                  | Hourly dead-letter queue drainer |

Both share the `JWT_SECRET` secret for Bearer-token authentication on the internal retry endpoint.

### Cloudflare Configuration (`wrangler.toml`)

```toml
name = "quranific"
compatibility_date = "2026-03-25"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "dist"
run_worker_first = true

[placement]
mode = "smart"           # Global smart placement — routes requests to nearest PoP

[cache]
enabled = true           # Edge fetch cache

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "SESSION"
id = "14eab319d57e4c58b5f903bce3eb3931"

[observability]
enabled = false          # Worker observability dashboard (disabled; logs enabled)

[observability.logs]
enabled = true
head_sampling_rate = 1
persist = true
invocation_logs = true

[observability.traces]
enabled = false
persist = true
head_sampling_rate = 1

[[routes]]
pattern = "quranific.com"
custom_domain = true

[[routes]]
pattern = "www.quranific.com"
custom_domain = true
```

---

## Secrets Reference

### Main Site Secrets

Set via Cloudflare Pages dashboard: **Settings → Environment Variables → Secrets** (or `wrangler secret put`).

| Secret / Variable      | Required               | Description                                                                                             |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`       | **Required**           | Resend API key (format: `re_...`). Used by all email dispatch functions.                                |
| `TURNSTILE_SECRET_KEY` | **Required**           | Cloudflare Turnstile **secret** key. Server-side bot verification for all forms.                        |
| `TURNSTILE_SECRET`     | Optional               | Legacy alias for `TURNSTILE_SECRET_KEY`. Code reads whichever is present (`??` fallback).               |
| `JWT_SECRET`           | **Required**           | Random 256-bit string. Signs and verifies HS256 session JWTs. Must match `alarm-worker`'s `JWT_SECRET`. |
| `ADMIN_EMAIL`          | **Required**           | Destination email for all admin notifications. Defaults to `faisalkhan.llc.ltd@gmail.com` if missing.   |
| `ENVIRONMENT`          | Set in `wrangler.toml` | `"production"` — declared as a plain var, not a secret.                                                 |
| `SITE`                 | Optional               | Base URL for the site. Used as a hint; canonical URLs are derived from `Astro.site`.                    |
| `GA_ID`                | Optional               | Google Analytics tracking ID (if using direct gtag without GTM). Currently GTM handles this.            |
| `SHEET_WEBHOOK_URL`    | Optional               | Legacy Google Sheets webhook. Not used in current code paths.                                           |
| `ZAPIER_WEBHOOK_URL`   | Optional               | If set, `/api/complete` posts a `Lead_Complete` JSON payload to this URL on each Step 2 submission.     |

> **Critical:** `TURNSTILE_SITE_KEY` (the public key `0x4AAAAAAD-QWQWhupcuvhbK`) is hardcoded in `src/constants/site.ts` and **must not** be added as a secret. Only the `TURNSTILE_SECRET_KEY` is private.

### KV Namespace Binding

| Binding   | KV Namespace ID                    | Declared In                         |
| --------- | ---------------------------------- | ----------------------------------- |
| `SESSION` | `14eab319d57e4c58b5f903bce3eb3931` | `wrangler.toml` `[[kv_namespaces]]` |

This single KV namespace serves four purposes:

1. **Distributed rate limiting** — per-IP counters for all form endpoints (TTL 60s)
2. **Idempotency keys** — prevent double-processing of Step 2 JWT submissions (TTL 960s)
3. **Dead-letter queue** — failed Resend email payloads stored for hourly retry (TTL 30d)
4. **Lead dead-letter archival** — FAILED_LEAD, FAILED_CONTACT, FAILED_NEWSLETTER, FAILED_TEACHER prefixes

### Alarm Worker Secrets

Set in the `quranific-alarm` Worker's environment (separate from the Pages project):

| Secret       | Required     | Description                                                                                                                               |
| ------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `JWT_SECRET` | **Required** | Must be **identical** to the main site's `JWT_SECRET`. Used as `Bearer <JWT_SECRET>` to authenticate POST to `/api/internal/retry-queue`. |

`TARGET_URL` is a plain var in `alarm-worker/wrangler.toml`, defaulting to `https://quranific.com/api/internal/retry-queue`.

---

## Environment Variable Setup

### Local Development (`.env` file)

```env
RESEND_API_KEY="re_<your-key>"
TURNSTILE_SECRET_KEY="0x<your-turnstile-secret>"
ADMIN_EMAIL="admin@quranific.com"
JWT_SECRET="<random-256-bit-string>"
SITE="http://localhost:4321"
PROD=false
```

Copy `.env.example` to `.env` and populate. Never commit `.env`.

For local KV simulation, `wrangler pages dev ./dist` uses the Wrangler KV preview store automatically. No additional setup is needed.

### Production (Cloudflare Dashboard)

Navigate to: **Cloudflare Dashboard → Pages → quranific → Settings → Environment Variables**

Add each secret under the **Production** environment. Use "Encrypt" for all sensitive values (API keys, secrets).

---

## Cloudflare Edge Requirements

### Runtime

- `compatibility_date`: `2026-03-25`
- `compatibility_flags`: `["nodejs_compat"]` — required for Node.js built-ins used by the Workers runtime
- `run_worker_first = true` — the Worker runs before static asset serving. Ensures all requests (including for static files) pass through the middleware for header injection.

### Smart Placement

`[placement] mode = "smart"` enables Cloudflare's global smart placement algorithm. Requests are routed to the optimal PoP based on origin affinity, not just geographic proximity. This is critical for minimising Resend API and Turnstile verification latency from the edge.

### Edge Caching Strategy

Defined in `src/middleware.ts`:

| Route type                                             | Browser cache                                           | CDN (Cloudflare)                                     |
| ------------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------- |
| `GET` non-API pages                                    | `public, max-age=0, must-revalidate`                    | `public, max-age=3600, stale-while-revalidate=86400` |
| `/api/*` routes                                        | `no-store` (set in each endpoint)                       | No CDN caching (middleware excludes `/api/`)         |
| Funnel pages (`/getting-started/complete`, `/success`) | `no-store, no-cache, must-revalidate, proxy-revalidate` | Not cached                                           |

### Custom Domains

Both apex and www are registered as custom domains in `wrangler.toml`. The `www` → apex redirect is handled in two places:

1. `src/middleware.ts` — catches SSR requests and issues a `301` redirect
2. A Vite plugin in `astro.config.mjs` — injects redirect logic into the compiled edge handler for any requests that bypass the middleware path

### Required Cloudflare Features

| Feature              | Required           | Notes                                                  |
| -------------------- | ------------------ | ------------------------------------------------------ |
| Cloudflare Turnstile | Yes                | Create widget at dash.cloudflare.com → Turnstile       |
| Cloudflare KV        | Yes                | Create namespace; bind as `SESSION` in `wrangler.toml` |
| Cloudflare Pages     | Yes                | Deploy target                                          |
| Cloudflare Workers   | Yes (alarm-worker) | Separate worker for cron                               |
| Custom Domains       | Yes                | `quranific.com` and `www.quranific.com`                |
| Smart Placement      | Yes                | Enabled in `wrangler.toml`                             |

---

## Deployment Pipeline

### Main Site

#### Option A: CLI Deploy (Recommended)

```bash
# 1. Install dependencies (CI: use npm ci)
npm install

# 2. Build (type-checks then builds to dist/)
npm run build

# 3. Deploy to Cloudflare Pages
wrangler pages deploy ./dist
```

This is equivalent to running `npm run deploy` which executes both steps.

#### Option B: Git-Connected Pages (CI/CD)

Connect the repository to Cloudflare Pages via the dashboard:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js version:** `20` (matches `.nvmrc`)

Pushes to the connected branch trigger automatic builds and deploys.

#### Build Output

`npm run build` runs `astro check && astro build`:

1. `astro check` — TypeScript + Astro diagnostics. Fails build on type errors.
2. `astro build` — compiles to `dist/`. SSR routes become Cloudflare Worker scripts; prerendered pages become static HTML assets in `dist/_astro/`.

### Alarm Worker

```bash
cd alarm-worker

# Deploy the hourly cron worker
wrangler deploy

# Add the JWT_SECRET secret (must match the main site)
wrangler secret put JWT_SECRET
```

The `TARGET_URL` is defined as a plain var in `alarm-worker/wrangler.toml` — no secret needed for it.

---

## First-Time Setup Checklist

```
[ ] 1. Create Cloudflare account and add quranific.com domain
[ ] 2. Create Cloudflare Turnstile widget — copy site key and secret key
[ ] 3. Create Cloudflare KV namespace
        - Name it anything (e.g. "quranific-session")
        - Copy the KV ID into wrangler.toml [[kv_namespaces]] id
[ ] 4. Create Resend account, verify quranific.com sending domain
        - Generate API key with Send access
[ ] 5. Create Pages project (connect git repo or use wrangler pages deploy)
[ ] 6. Set all production secrets in Cloudflare Pages dashboard:
        - RESEND_API_KEY
        - TURNSTILE_SECRET_KEY
        - JWT_SECRET
        - ADMIN_EMAIL
[ ] 7. Add custom domains: quranific.com and www.quranific.com
[ ] 8. Deploy alarm-worker:
        cd alarm-worker && wrangler deploy
        wrangler secret put JWT_SECRET   (same value as main site JWT_SECRET)
[ ] 9. Verify cron trigger is active in alarm-worker dashboard
```

---

## Smoke Testing

After each production deployment, verify the following:

### Critical Path Tests

#### 1. Apex and www Redirect

```bash
curl -I https://www.quranific.com/
# Expect: HTTP/2 301, Location: https://quranific.com/
```

#### 2. Home Page SSR

```bash
curl -I https://quranific.com/
# Expect: HTTP/2 200, Content-Type: text/html
# Expect: CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=86400
# Expect: X-Frame-Options: DENY
# Expect: Strict-Transport-Security: max-age=31536000; includeSubDomains
```

#### 3. Consent Bucket Endpoint

```bash
# From a known US IP:
curl https://quranific.com/api/consent-bucket
# Expect: { "bucket": "MODERATE", "hasGPC": false }
# Expect: Cache-Control: no-store

# From a known EU IP (or with VPN):
curl https://quranific.com/api/consent-bucket
# Expect: { "bucket": "STRICT", "hasGPC": false }
```

#### 4. Geo Currency Endpoint

```bash
curl "https://quranific.com/api/geo-currency"
# Expect: { "country": "<ISO-code>", "currency": "USD"|"GBP"|"EUR"|... }
# Expect: Cache-Control: no-store

# Override test:
curl "https://quranific.com/api/geo-currency?country=GB"
# Expect: { "country": "GB", "currency": "GBP" }
```

#### 5. Session Guard (Funnel)

```bash
curl -I https://quranific.com/getting-started/complete
# Expect: HTTP/2 302, Location: /getting-started/signup
# (no q_session cookie = redirect to signup)
```

#### 6. API Rate Limiting

```bash
# Hit /api/contact 5 times rapidly from the same IP
for i in {1..5}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST \
    https://quranific.com/api/contact \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","lastName":"User","email":"t@t.com","message":"test","cf-turnstile-response":"test"}'
done
# First 4: 400 (Turnstile failure, not rate limited)
# 5th: 429 (rate limited)
```

#### 7. Security Headers Verification

```bash
curl -I https://quranific.com/ | grep -E "x-frame|x-content|referrer|permissions|strict-transport|content-security"
# Expect all six headers present
```

#### 8. API No-Cache Enforcement

```bash
curl -I https://quranific.com/api/consent-bucket
# Expect: Cache-Control: no-store (NOT public or max-age)
```

#### 9. Sitemap

```bash
curl https://quranific.com/sitemap-index.xml
# Expect: valid XML, no /api/ paths, no /getting-started/ paths
```

#### 10. Alarm Worker Health

```bash
curl https://<alarm-worker-url>/
# Expect: "Quranific Alarm Worker Active" with HTTP 200
```

### Consent Mode v2 Smoke Test (Browser)

1. Open `https://quranific.com` in a new private window
2. Open DevTools → Network → filter `consent-bucket`
3. Verify the request fires and returns `STRICT` or `MODERATE` based on your location
4. Verify `gtag('consent','update',...)` is called in the console
5. For STRICT/MODERATE: verify the cookie banner appears
6. Accept cookies → verify `cf_consent_v1=STRICT:accepted` (or similar) written to cookies
7. Refresh → verify no second `/api/consent-bucket` fetch fires (PATH A: cookie read)

### Pricing Calculator Smoke Test (Browser)

1. Open `https://quranific.com/tuition-fee`
2. Open DevTools → Network → filter `geo-currency`
3. Verify the request fires and returns your regional currency
4. Verify price updates when toggling duration / sessions
5. Verify currency symbol and formatting are correct

---

## Operational Runbook

### Monitoring Failed Leads (Dead-Letter Queue)

The alarm-worker drains failed emails hourly. To inspect the current queue:

```bash
# Via alarm-worker HTTP endpoint
curl -H "Authorization: Bearer <JWT_SECRET>" \
  https://quranific.com/api/internal/retry-queue \
  -X POST
# Response: { success: true, recovered: N, failed: M }
```

To manually inspect a specific Resend email delivery:

```bash
curl -H "Authorization: Bearer <JWT_SECRET>" \
  "https://quranific.com/api/internal/retry-queue?id=<resend-email-id>"
```

### KV Key Prefixes Reference

| Prefix                         | Purpose                           | TTL  |
| ------------------------------ | --------------------------------- | ---- |
| `RL:REGISTER:{ip}`             | Rate limit — signup               | 60s  |
| `RL:CONTACT:{ip}`              | Rate limit — contact              | 60s  |
| `RL:NEWSLETTER:{ip}`           | Rate limit — newsletter           | 60s  |
| `RL:TEACHER:{ip}`              | Rate limit — teacher apply        | 60s  |
| `IDEMPOTENCY:{jti}`            | Prevents double-processing Step 2 | 960s |
| `FAILED_LEAD_STEP1:{leadId}`   | Step 1 email failed               | 30d  |
| `FAILED_LEAD_STEP2:{leadId}`   | Step 2 admin email failed         | 30d  |
| `FAILED_LEAD_WELCOME:{leadId}` | Welcome email failed              | 30d  |
| `FAILED_CONTACT_ADMIN:{ts}`    | Contact admin email failed        | 30d  |
| `FAILED_CONTACT_USER:{ts}`     | Contact auto-responder failed     | 30d  |
| `FAILED_NEWSLETTER_ADMIN:{ts}` | Newsletter admin notif failed     | 30d  |
| `FAILED_NEWSLETTER_USER:{ts}`  | Newsletter welcome failed         | 30d  |
| `FAILED_TEACHER:{ts}`          | Teacher application email failed  | 30d  |

### Rotating JWT_SECRET

If `JWT_SECRET` must be rotated:

1. All existing `q_session` cookies (15-minute TTL) and `IDEMPOTENCY:{jti}` KV keys (16-minute TTL) will be invalidated.
2. Users mid-funnel will be redirected back to `/getting-started/signup` on their next request.
3. The alarm-worker's `JWT_SECRET` must be updated to the same new value **simultaneously** to maintain dead-letter queue access.
4. Update in Cloudflare Pages secrets → redeploy.
5. Update alarm-worker: `wrangler secret put JWT_SECRET` in the `alarm-worker/` directory.

### Rotating RESEND_API_KEY

1. Generate new key in Resend dashboard.
2. Update in Cloudflare Pages secrets.
3. Redeploy (`npm run deploy`).
4. No downtime — new key takes effect on next Worker invocation.

### Rotating TURNSTILE_SECRET_KEY

1. Regenerate in Cloudflare Turnstile dashboard.
2. Update in Cloudflare Pages secrets.
3. Redeploy.
4. Note: The public `TURNSTILE_SITE_KEY` (`0x4AAAAAAD-QWQWhupcuvhbK`) is hardcoded in `src/constants/site.ts` — update it there if you regenerate a new widget with a different site key, then rebuild and redeploy.

---

## Email System Reference

All email is dispatched via Resend (`https://api.resend.com/emails`). The `src/lib/email.ts` module contains all email templates.

| Function                          | Trigger                      | Recipients       |
| --------------------------------- | ---------------------------- | ---------------- |
| `sendStep1AdminNotification`      | `/api/register` success      | `ADMIN_EMAIL`    |
| `sendFullAdminNotification`       | `/api/complete` success      | `ADMIN_EMAIL`    |
| `sendWelcomeEmail`                | `/api/complete` success      | Student email    |
| `sendContactAdminNotification`    | `/api/contact` success       | `ADMIN_EMAIL`    |
| `sendContactAutoResponder`        | `/api/contact` success       | Visitor email    |
| `sendNewsletterAdminNotification` | `/api/newsletter` success    | `ADMIN_EMAIL`    |
| `sendNewsletterWelcome`           | `/api/newsletter` success    | Subscriber email |
| `sendTeacherAdminNotification`    | `/api/apply-teacher` success | `ADMIN_EMAIL`    |
| `sendTeacherAutoResponder`        | `/api/apply-teacher` success | Applicant email  |

**From address:** `System <onboarding@quranific.com>` — the `onboarding@quranific.com` domain must be verified in Resend.

**Local mock mode:** When `RESEND_API_KEY` is absent, empty, not prefixed with `re_`, or equals `re_123456789`, all email functions fall back to `console.log` output. No actual emails are sent. This is the default local dev behaviour.

---

## Build & Deployment Notes

### Clean Build (Recommended Before Deploy)

```bash
npm run clean   # rimraf dist .astro node_modules/.vite
npm run build
```

### TypeScript Errors Block Build

`npm run build` runs `astro check` first. Any TypeScript or Astro type error will abort the build with a non-zero exit code. Resolve all type errors before deploying.

### Node.js Version

The project requires Node.js `>=20.0.0`. Both `.nvmrc` and `.node-version` pin this for nvm / fnm compatibility. Cloudflare Pages build environment should be configured to use Node 20.

### Vite Optimizations Active

- `build.target: 'esnext'` — modern output, no legacy transpilation
- `optimizeDeps.exclude` — prevents Cloudflare/Astro modules from being pre-bundled by Vite
- Tailwind v4 Oxide engine handles CSS natively via the Vite plugin — no separate PostCSS or LightningCSS configuration needed

---

## Content Security Policy

The CSP is set in `src/middleware.ts` and allows:

| Directive     | Allowed Origins                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `script-src`  | `self`, Cloudflare challenges, Google Tag Manager, Google Analytics, `unsafe-inline`, `unsafe-eval` |
| `style-src`   | `self`, `unsafe-inline`                                                                             |
| `img-src`     | `self`, `data:`, `https:`                                                                           |
| `font-src`    | `self`, `data:`                                                                                     |
| `connect-src` | `self`, Resend API, Cloudflare challenges, Google Analytics, DoubleClick                            |
| `frame-src`   | `self`, Cloudflare challenges, Google Tag Manager                                                   |
| `worker-src`  | `self`, `blob:`                                                                                     |
| `object-src`  | `none`                                                                                              |
| `base-uri`    | `self`                                                                                              |
| `form-action` | `self`                                                                                              |

`upgrade-insecure-requests` is included.
