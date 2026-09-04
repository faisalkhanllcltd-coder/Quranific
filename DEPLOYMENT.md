# Quranific — Production Deployment Playbook & Operations Guide

> **Target Platform:** Cloudflare Pages & Cloudflare Workers (Global Anycast Edge Network)  
> **Primary Domains:** `quranific.com`, `www.quranific.com`  
> **Runtime Environment:** Cloudflare Workerd (Edge Isolate, Node.js Compatibility Mode)

---

## 1. Infrastructure Overview

The Quranific production architecture is deployed across Cloudflare's serverless edge infrastructure using two integrated tiers:

```mermaid
graph TD
    User([Global User / Client]) -->|HTTPS / Anycast DNS| CF_Edge[Cloudflare Edge Network]

    subgraph Cloudflare Pages / Workers
        CF_Edge -->|Static Assets / Prerendered HTML| EdgeCache[Edge Cache CDN]
        CF_Edge -->|Dynamic /api/* & SSR Requests| AstroSSR[Astro Edge Adapter (Workerd)]

        AstroSSR -->|Rate Limiting & Dead-Letter Queue| KV_Session[(Cloudflare KV: SESSION)]
        AstroSSR -->|Bot Verification| TurnstileAPI[Cloudflare Turnstile API]
        AstroSSR -->|Transactional Emails| ResendAPI[Resend REST API]
    end

    subgraph Scheduled Services
        CronWorker[Alarm Worker (quranific-alarm)] -->|Hourly Cron: 0 * * * *| InternalAPI[POST /api/internal/retry-queue]
        InternalAPI --> KV_Session
        InternalAPI --> ResendAPI
    end
```

### 1.1 Core Infrastructure Components

1. **Cloudflare Pages (Primary Web App):**
   - Executes the compiled Astro bundle via `@astrojs/cloudflare`.
   - Automatically serves static assets from `dist/` and routes server endpoints to edge worker isolates.
   - `compatibility_date`: `2026-03-25` with `compatibility_flags = ["nodejs_compat"]`.
   - Smart placement mode enabled (`mode = "smart"` in `wrangler.toml`) to minimize backend latency.
2. **Cloudflare KV Namespace (`SESSION`):**
   - Namespace ID: `14eab319d57e4c58b5f903bce3eb3931`.
   - Manages distributed IP rate limits (`RL:REGISTER:<IP>`, `RL:CONTACT:<IP>`, `RL:NEWSLETTER:<IP>`).
   - Ensures form submission idempotency (`IDEM:COMPLETE:<LeadID>`).
   - Persists dead-letter failed outbound requests (`FAILED_LEAD:<LeadID>`, `FAILED_CONTACT:<UUID>`).
3. **Cloudflare Cron Worker (`alarm-worker`):**
   - Standalone Worker defined in `alarm-worker/wrangler.toml`.
   - Executes every hour (`0 * * * *`) to trigger the `/api/internal/retry-queue` endpoint with Bearer authentication (`JWT_SECRET`) to process any queued dead-letter items in KV.

---

## 2. Environment Variables & Secrets Reference

All environment variables are validated at runtime using Zod in `src/lib/env.ts`.

### 2.1 Production Secrets & Configuration Table

| Key                         | Sensitivity    | Required | Target System                   | Description & Default Value                                                                                             |
| :-------------------------- | :------------- | :------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`            | **Secret**     | **YES**  | Cloudflare Pages Secret         | API Key from [Resend](https://resend.com) (`re_...`) for transactional notifications and autoresponders.                |
| `TURNSTILE_SECRET_KEY`      | **Secret**     | **YES**  | Cloudflare Pages Secret         | Cloudflare Turnstile private secret key for server-side siteverify validation.                                          |
| `TURNSTILE_SITE_KEY`        | Public / Plain | **YES**  | Cloudflare Pages / Env          | Cloudflare Turnstile public site key rendered in client forms.                                                          |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public / Plain | **YES**  | Cloudflare Pages / Env          | Mirrors `TURNSTILE_SITE_KEY` for client-side Vite/Astro component injection.                                            |
| `JWT_SECRET`                | **Secret**     | **YES**  | Cloudflare Pages & Alarm Worker | Cryptographic key (min 32 characters) used to sign/verify HS256 session tokens and authenticate internal cron requests. |
| `ADMIN_EMAIL`               | Plain          | **YES**  | Cloudflare Pages Env            | Email destination for new student lead alerts and faculty job applications (e.g., `admin@quranific.com`).               |
| `SITE`                      | Plain          | **YES**  | Cloudflare Pages Env            | Canonical origin URL (Production: `https://quranific.com`). Validated as `SITE_URL` in `src/lib/env.ts`.                |
| `PROD`                      | Plain          | Optional | Cloudflare Pages Env            | Boolean flag indicating production environment (`true` in production).                                                  |
| `ENVIRONMENT`               | Plain          | Optional | `wrangler.toml` vars            | Environment identifier (defined as `"production"` in `wrangler.toml`).                                                  |
| `GA_ID`                     | Plain          | Optional | Cloudflare Pages Env            | Google Analytics 4 measurement ID (e.g., `G-XXXXXXXXXX`).                                                               |

---

## 3. Step-by-Step Deployment Pipeline

Deployments can be executed directly via Git push or manually using the Wrangler CLI.

### 3.1 Pre-Deployment Verification

Before deploying to production, always verify zero diagnostics errors, type safety, and linting compliance locally:

```bash
# 1. Run Astro diagnostic checks
npm run check

# 2. Run TypeScript strict type-check
npm run typecheck

# 3. Run ESLint code inspection
npm run lint

# 4. Run production build
npm run build
```

---

### 3.2 Manual CLI Deployment (Primary Application)

1. **Authenticate Wrangler with Cloudflare:**

   ```bash
   npx wrangler login
   ```

2. **Provision the KV Namespace (If not already created):**

   ```bash
   npx wrangler kv:namespace create SESSION
   ```

   _Verify that the output ID matches the binding in `wrangler.toml`:_

   ```toml
   [[kv_namespaces]]
   binding = "SESSION"
   id = "14eab319d57e4c58b5f903bce3eb3931"
   ```

3. **Configure Production Secrets on Cloudflare Pages:**

   ```bash
   npx wrangler pages secret put RESEND_API_KEY
   npx wrangler pages secret put TURNSTILE_SECRET_KEY
   npx wrangler pages secret put JWT_SECRET
   npx wrangler pages secret put ADMIN_EMAIL
   ```

4. **Build and Deploy the Pages Project:**
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=quranific
   ```

---

### 3.3 Deploying the Scheduled Alarm Worker

The scheduled queue recovery service in `alarm-worker/` must be deployed to Cloudflare Workers independently:

1. **Navigate to the worker directory:**

   ```bash
   cd alarm-worker
   ```

2. **Set the worker secrets:**

   ```bash
   npx wrangler secret put JWT_SECRET
   ```

   _(Ensure this `JWT_SECRET` matches the `JWT_SECRET` configured on Cloudflare Pages)._

3. **Deploy the Worker:**

   ```bash
   npx wrangler deploy
   ```

4. **Return to the project root:**
   ```bash
   cd ..
   ```

---

## 4. Edge Storage & Dead-Letter Queue (KV) Operations

### 4.1 KV Key Architecture

| Key Pattern              | TTL / Expiry | Purpose                                                                     |
| :----------------------- | :----------- | :-------------------------------------------------------------------------- |
| `RL:REGISTER:<IP>`       | 60 seconds   | Rate limits registration endpoint to 4 submissions per minute per IP.       |
| `RL:CONTACT:<IP>`        | 60 seconds   | Rate limits contact submissions to 4 requests per minute per IP.            |
| `RL:NEWSLETTER:<IP>`     | 60 seconds   | Rate limits newsletter subscriptions to 4 requests per minute per IP.       |
| `IDEM:COMPLETE:<LeadID>` | 24 hours     | Prevents duplicate processing of Step 2 submissions.                        |
| `FAILED_LEAD:<LeadID>`   | Indefinite   | Dead-letter storage holding lead payloads when Resend API fails.            |
| `FAILED_CONTACT:<UUID>`  | Indefinite   | Dead-letter storage holding contact message payloads when Resend API fails. |

### 4.2 Inspecting and Purging the Dead-Letter Queue

To inspect failed lead deliveries directly via CLI:

```bash
# List all pending dead-letter leads
npx wrangler kv:key list --binding=SESSION --prefix="FAILED_LEAD:"

# Inspect a specific failed lead record
npx wrangler kv:key get --binding=SESSION "FAILED_LEAD:<LEAD_ID>"

# Manually trigger a recovery cycle via HTTP
curl -X POST https://quranific.com/api/internal/retry-queue \
  -H "Authorization: Bearer <YOUR_JWT_SECRET>"
```

---

## 5. Edge Performance, Caching & Security Policies

### 5.1 Edge & Browser Caching (`src/middleware.ts`)

For all non-API GET requests, the edge middleware applies dual-layer caching headers:

- **Browser Header (`Cache-Control`):** `public, max-age=0, must-revalidate` — Guarantees that client browsers always revalidate with the edge, preventing stale UI states.
- **Edge CDN Header (`CDN-Cache-Control`):** `public, max-age=3600, stale-while-revalidate=86400` — Instructs Cloudflare's global edge nodes to cache rendered SSR responses for 1 hour while serving stale content for up to 24 hours while revalidating in the background.

### 5.2 Content Security Policy (CSP)

The application enforces strict security headers on every response:

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

- **Turnstile Integration:** Allowed via `challenges.cloudflare.com` in `script-src`, `frame-src`, and `connect-src`.
- **Analytics Integration:** Allowed via `www.googletagmanager.com` and `www.google-analytics.com` routed through Partytown.
- **Email API:** Outbound HTTPS connections to `api.resend.com` permitted in `connect-src`.

---

## 6. Post-Deployment Verification Checklist

After deploying a new release to production, execute the following smoke tests:

- [ ] **Homepage & Core Routes:** Confirm `https://quranific.com`, `/courses`, `/teachers`, and `/tuition-fee` load with HTTP status `200` and header `X-Edge-Location` present.
- [ ] **Turnstile Verification:** Verify that the Turnstile widget renders on `/getting-started/signup` and `/contact`.
- [ ] **Funnel Step 1 Submission:** Complete a test submission on `/getting-started/signup`. Confirm receipt of `q_session` cookie and redirection to `/getting-started/complete`.
- [ ] **Funnel Step 2 Submission:** Submit course preferences on `/getting-started/complete`. Verify redirect to `/getting-started/success` and confirmation email arrival.
- [ ] **Teacher Application:** Submit a test application on `/teachers/apply` and verify email arrival at `ADMIN_EMAIL`.
- [ ] **Internal Retry Queue:** Test `/api/internal/retry-queue` returns `401 Unauthorized` without the Bearer token and `200 OK` with the valid `JWT_SECRET`.
