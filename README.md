# Quranific

> **Online Quran Academy** — Private 1-on-1 Quran classes, live at [quranific.com](https://quranific.com)

A fully server-rendered, Cloudflare-native web application built with Astro 7, Svelte 5, and Tailwind CSS v4. Every page is SSR'd at the Cloudflare edge; static prerender is used only for routes that carry zero per-user data.

---

## Tech Stack Matrix

| Layer           | Technology                | Version        | Role                                                     |
| --------------- | ------------------------- | -------------- | -------------------------------------------------------- |
| Framework       | Astro                     | `^7.2.0`       | SSR orchestration, routing, content collections          |
| UI Components   | Svelte                    | `^5.0.0`       | Interactive islands (runes syntax)                       |
| Styling         | Tailwind CSS              | `^4.0.0`       | Utility-first CSS via `@tailwindcss/vite` (Oxide engine) |
| Runtime Adapter | `@astrojs/cloudflare`     | `^14.2.0`      | Cloudflare Workers edge adapter                          |
| Deployment      | Cloudflare Pages          | —              | Edge hosting with Workers runtime                        |
| Email           | Resend                    | REST API       | Transactional email (`api.resend.com`)                   |
| Bot Protection  | Cloudflare Turnstile      | v0             | CAPTCHA-free human verification on all forms             |
| Analytics       | Google Tag Manager        | `GTM-5CJMMJ29` | Container for GA4, ads; fires under Consent Mode v2      |
| Validation      | Zod                       | `^4.4.3`       | Runtime schema validation for all form payloads          |
| JWT             | jose                      | `^6.2.1`       | Stateless HS256 session tokens for the signup funnel     |
| Icons           | lucide-svelte             | `^1.0.1`       | SVG icon set                                             |
| Sitemap         | `@astrojs/sitemap`        | `^3.7.1`       | Auto-generated XML sitemap                               |
| Analytics relay | `@astrojs/partytown`      | `^2.1.7`       | `dataLayer.push` forwarding                              |
| KV Storage      | Cloudflare KV (`SESSION`) | —              | Rate limiting, idempotency, dead-letter queue            |
| Node version    | Node.js                   | `>=20.0.0`     | Required for local dev                                   |

---

## Architecture Map

```
quranific.com (Cloudflare Pages)
│
├── Cloudflare Edge (smart placement, global PoP routing)
│   ├── src/middleware.ts        ← runs on every request
│   │   ├── www → apex redirect (301)
│   │   ├── CF geo extraction   → context.locals (userCountry, userCity, userRegionCode, hasGPC)
│   │   ├── Sec-GPC header read → context.locals.hasGPC
│   │   ├── Consent bucket      → context.locals.consentBucket (via lib/consent.ts)
│   │   ├── Security headers    → X-Frame-Options, CSP, HSTS, etc.
│   │   └── Edge SSR cache      → CDN-Cache-Control: 1h for GET non-API, no-store for /api/*
│   │
│   ├── SSR Pages (output: server, prerender = false)
│   │   ├── /getting-started/complete   ← session-gated (q_session cookie required)
│   │   ├── /getting-started/success    ← session-gated, JWT decoded server-side
│   │   └── /api/*                      ← all API routes are SSR-only
│   │
│   └── Static Pages (prerender = true, served from Cloudflare CDN)
│       ├── / (home)
│       ├── /courses, /tuition-fee, /teachers, /faq, /about, /contact
│       ├── /getting-started/signup     ← prerendered shell; JS hydrates forms
│       ├── /[intent]/for-kids|for-adults|for-women
│       ├── /blog/*, /legal/*, /testimonials, /portals, /safeguarding
│       ├── /robots.txt, /rss.xml, /llms.txt, /sitemap-index.xml
│       └── 404.astro, 500.astro
│
├── KV Namespace: SESSION (binding: SESSION, id: 14eab319d57e4c58b5f903bce3eb3931)
│   ├── RL:REGISTER:{ip}         TTL 60s  — rate limit counter (max 4/60s)
│   ├── RL:CONTACT:{ip}          TTL 60s  — rate limit counter
│   ├── RL:NEWSLETTER:{ip}       TTL 60s  — rate limit counter
│   ├── RL:TEACHER:{ip}          TTL 60s  — rate limit counter
│   ├── IDEMPOTENCY:{jti}        TTL 960s — duplicate submission prevention
│   ├── FAILED_LEAD_STEP1:{id}   TTL 30d  — dead-letter: step 1 email failures
│   ├── FAILED_LEAD_STEP2:{id}   TTL 30d  — dead-letter: step 2 admin email failures
│   ├── FAILED_LEAD_WELCOME:{id} TTL 30d  — dead-letter: welcome email failures
│   ├── FAILED_CONTACT_ADMIN:{ts}  TTL 30d
│   ├── FAILED_CONTACT_USER:{ts}   TTL 30d
│   ├── FAILED_NEWSLETTER_ADMIN:{ts} TTL 30d
│   ├── FAILED_NEWSLETTER_USER:{ts}  TTL 30d
│   └── FAILED_TEACHER:{ts}        TTL 30d
│
└── alarm-worker/ (separate Cloudflare Worker — quranific-alarm)
    ├── Cron: "0 * * * *" (every hour)
    └── POSTs Bearer-authed request to /api/internal/retry-queue
        to drain and re-send all FAILED_* KV dead-letter entries
```

---

## Permanent Redirects

Defined in `astro.config.mjs` (301, handled at build time):

| From          | To                          |
| ------------- | --------------------------- |
| `/ads/kids`   | `/quran-classes/for-kids`   |
| `/ads/adults` | `/quran-classes/for-adults` |
| `/ads/ladies` | `/quran-classes/for-women`  |

`www.quranific.com` → `quranific.com` is enforced via both `src/middleware.ts` (SSR) and an injected Vite plugin in `astro.config.mjs` (edge handler shim).

---

## Core Mechanisms

### 1. Consent Mode v2 System

The consent pipeline is a three-phase server + client coordination:

**Phase 1 — SSR: Consent Bucket Determination**

`src/middleware.ts` calls `getConsentBucket(country, regionCode, hasGPC)` from `src/lib/consent.ts` on every request. The bucket is attached to `context.locals.consentBucket`.

Decision rules (evaluated in order, first match wins):

| Priority | Condition                                      | Bucket                 |
| -------- | ---------------------------------------------- | ---------------------- |
| 1        | `Sec-GPC: 1` header present                    | `STRICT`               |
| 2        | Country in EU/UK/CH/EEA set                    | `STRICT`               |
| 3        | Canada + region QC, or Canada + unknown region | `STRICT`               |
| 4        | Canada + known non-QC province                 | `MODERATE`             |
| 5        | US or AU                                       | `MODERATE`             |
| 6        | Country missing / empty / "Unknown"            | `STRICT` (fail-closed) |
| 7        | All other countries                            | `NONE`                 |

**Phase 2 — HTML `<head>`: Universal Deny Default**

`src/layouts/Base.astro` injects a static deny-all `gtag('consent','default',...)` snippet before GTM loads. This is byte-identical for every visitor and safe under shared edge cache.

**Phase 3 — Client-side Upgrade Script (async, non-blocking)**

An inline IIFE in `Base.astro` runs after page load:

- **Returning visitor** (`cf_consent_v1` cookie present): reads cookie, applies stored `gtag('consent','update',...)` immediately. No fetch.
- **First visit** (no cookie): fetches `/api/consent-bucket` (no-store, credentials: omit). Then:
  - `NONE` + no GPC: silent `GRANT_ALL`, no banner shown
  - `MODERATE` + no GPC: `GRANT_MODERATE` (analytics granted, ads denied), banner revealed
  - `STRICT` or GPC: leave denied, banner revealed for user choice
  - Fetch error: fail-closed — banner revealed with STRICT defaults

**CookieBanner.svelte** (Svelte 5, `client:idle`): listens for `consent-bucket` CustomEvent from the Phase 3 script. Writes `cf_consent_v1=BUCKET:choice` (SameSite=Lax, Secure, 1-year) on user action. Calls `gtag('consent','update',...)` on accept/reject.

Cookie format: `cf_consent_v1=<STRICT|MODERATE|NONE>:<accepted|rejected>`

---

### 2. Geo-Based Pricing Engine

**Static pricing table** in `src/constants/pricing.ts` — no live exchange rate API, no cron refresh.

Supported currencies: `USD`, `AED`, `SAR`, `GBP`, `EUR`, `SGD`, `CAD`, `AUD`

Pricing dimensions:

- **Duration**: `30` min or `40` min per session
- **Sessions per week**: `2`, `3`, `4`, or `5`

Example price matrix (USD):

| Duration | 2x/week | 3x/week | 4x/week | 5x/week |
| -------- | ------- | ------- | ------- | ------- |
| 30 min   | $40     | $50     | $55     | $60     |
| 40 min   | $56     | $66     | $73     | $80     |

**Currency resolution flow:**

1. `PricingCalculator.svelte` mounts — fetches `/api/geo-currency`
2. `/api/geo-currency` reads `context.locals.userCountry` (set by middleware from `cf.country`)
3. `getCurrencyForCountry(countryCode)` in `pricing.ts` maps ISO country to currency (falls back to USD for unmapped countries)
4. Calculator updates `currency` reactive state — price display re-renders

EUR is the only currency formatted with 2 decimal places; all others show whole numbers.

---

### 3. Two-Step Lead Funnel

The signup funnel uses a **stateless JWT session** to bridge Step 1 and Step 2 without a database.

```
/getting-started/signup (prerendered shell, client:load SignupForm.svelte)
    │
    ├── User fills: name, email, whatsapp, country, source
    ├── Cloudflare Turnstile widget token captured
    ├── Optional calculator context: enrollType, duration, sessions, currency, billing, price, course
    ├── Ad attribution: fbclid, gclid, ttclid, utm_source, utm_campaign, utm_medium, utm_content
    │
    └── POST /api/register (FormData)
            ├── KV rate limit: RL:REGISTER:{CF-Connecting-IP} — max 4 per 60s
            ├── Zod validation (signupSchema)
            ├── Honeypot check (silent 200 for bots)
            ├── Turnstile server-side verify (challenges.cloudflare.com/turnstile/v0/siteverify)
            ├── JWT HS256 signed: { n, e, w, c, s, lid, et, dur, ses, cur, bil, prc, crs, not, fb, gc, tt, us, uc, um }
            │   expires: 15 minutes
            ├── waitUntil(): sendStep1AdminNotification() via Resend
            │   └── failure → FAILED_LEAD_STEP1:{leadId} written to KV (TTL 30d)
            └── Response: Set-Cookie: q_session={JWT}; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/

/getting-started/complete (SSR, q_session cookie required or redirect to /signup)
    │
    ├── User fills: course, gender, teacherGender, level, days, schedule
    │
    └── POST /api/complete (FormData)
            ├── Zod validation (completeSchema)
            ├── Reads q_session cookie (NOT form body)
            ├── JWT verification (15-minute window)
            ├── KV idempotency check: IDEMPOTENCY:{jti} — duplicate blocked, returns 200
            ├── waitUntil(): Promise.allSettled([sendFullAdminNotification(), sendWelcomeEmail(), dispatchWebhookTask()])
            │   └── failures: FAILED_LEAD_STEP2 / FAILED_LEAD_WELCOME written to KV (TTL 30d)
            ├── KV idempotency write: IDEMPOTENCY:{jti} TTL 960s
            └── Response: { success: true } (session cookie NOT cleared — success.astro needs it)

/getting-started/success (SSR, q_session cookie required or redirect to /signup)
    └── JWT decoded server-side to personalise confirmation page (student name, course, lead ID, WhatsApp link)
```

---

## Page & Route Catalog

### Public Pages

| Route                  | Prerender | Description                                             |
| ---------------------- | --------- | ------------------------------------------------------- |
| `/`                    | yes       | Home — hero, testimonials, pricing CTA, FAQ             |
| `/courses`             | yes       | Course catalog grid                                     |
| `/tuition-fee`         | yes       | Pricing plans + interactive PricingCalculator.svelte    |
| `/teachers`            | yes       | Teacher profiles and vetting section                    |
| `/faq`                 | yes       | Accordion FAQ                                           |
| `/about`               | yes       | About page                                              |
| `/contact`             | yes       | Contact form (Turnstile protected)                      |
| `/testimonials`        | yes       | Testimonials page                                       |
| `/portals`             | yes       | Student portals (Zoom, WhatsApp)                        |
| `/safeguarding`        | yes       | Safeguarding policy                                     |
| `/blog`                | yes       | Blog index                                              |
| `/blog/[slug]`         | yes       | Individual blog posts (Markdown/MDX content collection) |
| `/legal/privacy`       | yes       | Privacy Policy                                          |
| `/legal/terms`         | yes       | Terms of Service                                        |
| `/legal/refund`        | yes       | Refund Policy                                           |
| `/legal/cookies`       | yes       | Cookie Policy                                           |
| `/legal/impressum`     | yes       | Impressum (GDPR legal notice)                           |
| `/[intent]/for-kids`   | yes       | Intent landing page — kids                              |
| `/[intent]/for-adults` | yes       | Intent landing page — adults                            |
| `/[intent]/for-women`  | yes       | Intent landing page — women                             |
| `/robots.txt`          | yes       | robots.txt (generated)                                  |
| `/rss.xml`             | yes       | RSS feed                                                |
| `/llms.txt`            | yes       | LLM-friendly site summary                               |
| `/sitemap-index.xml`   | yes       | Sitemap (excludes /api/, /getting-started/, /ads/)      |

### Funnel Pages (SSR)

| Route                       | Prerender   | Guard                       |
| --------------------------- | ----------- | --------------------------- |
| `/getting-started/signup`   | yes (shell) | None                        |
| `/getting-started/complete` | no (SSR)    | `q_session` cookie required |
| `/getting-started/success`  | no (SSR)    | `q_session` cookie required |

### API Endpoints (all SSR, prerender = false)

| Method     | Endpoint                    | Auth              | Description                                       |
| ---------- | --------------------------- | ----------------- | ------------------------------------------------- |
| `POST`     | `/api/register`             | Turnstile         | Step 1: validate, mint JWT, fire Step 1 email     |
| `POST`     | `/api/complete`             | JWT cookie        | Step 2: validate, send admin + welcome email      |
| `GET/HEAD` | `/api/complete`             | JWT cookie        | Pre-flight session validity check                 |
| `POST`     | `/api/contact`              | Turnstile         | Contact form submission                           |
| `POST`     | `/api/newsletter`           | Turnstile         | Newsletter subscription                           |
| `POST`     | `/api/apply-teacher`        | Turnstile         | Teacher job application                           |
| `GET`      | `/api/consent-bucket`       | None              | Per-visitor consent bucket (no-store)             |
| `GET`      | `/api/geo-currency`         | None              | Per-visitor currency from CF geo (no-store)       |
| `POST`     | `/api/internal/retry-queue` | Bearer JWT_SECRET | Drain KV dead-letter queue, re-send failed emails |
| `GET`      | `/api/internal/retry-queue` | Bearer JWT_SECRET | Proxy Resend email log audit                      |

---

## Component Architecture

### Layouts

| Layout          | Description                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------- |
| `Base.astro`    | Root HTML shell: SEO tags, fonts, GTM, Consent Mode, Turnstile, ViewTransitions, CookieBanner |
| `Funnel.astro`  | Two-column signup layout: brand panel (dark) + form panel. robots: noindex, nofollow          |
| `Landing.astro` | Thin wrapper around Base for intent landing pages                                             |
| `Page.astro`    | Standard content page wrapper                                                                 |

### Svelte Islands (Svelte 5 runes syntax)

| Component                  | Hydration        | Description                                                      |
| -------------------------- | ---------------- | ---------------------------------------------------------------- |
| `CookieBanner.svelte`      | `client:idle`    | GDPR/CCPA consent banner; reads bucket from CustomEvent          |
| `PricingCalculator.svelte` | `client:visible` | Interactive price calculator; fetches geo-currency on mount      |
| `SignupForm.svelte`        | `client:load`    | Step 1 form; submits to `/api/register`                          |
| `CompleteForm.svelte`      | `client:load`    | Step 2 form; validates session via `HEAD /api/complete` on mount |
| `StepIndicator.svelte`     | `client:idle`    | Visual step progress (purely decorative)                         |

### Astro Block Components

`CourseCard`, `CourseGrid`, `CoursesFAQ`, `FAQAccordion`, `FinalCTA`, `LandingCTA`, `LandingFAQ`, `LandingFooter`, `LandingOnboarding`, `LandingOutcome`, `LandingPreview`, `LandingPricing`, `LandingProblem`, `LandingTestimonials`, `LandingTrust`, `LandingVetting`, `PageHero`, `StickyMobileCTA`, `TeacherTeaserBanner`

### Astro UI Primitives

`Button`, `EyebrowBadge`, `EyebrowText`, `MicroTag`, `Note`, `Section`

---

## Data Sources

| File                            | Description                                                               |
| ------------------------------- | ------------------------------------------------------------------------- |
| `src/constants/site.ts`         | Site metadata, navigation, social links, stats, Turnstile public site key |
| `src/constants/pricing.ts`      | Static pricing table (8 currencies x 2 durations x 4 session counts)      |
| `src/constants/courses.ts`      | Course catalog — single source of truth                                   |
| `src/constants/testimonials.ts` | Testimonial data                                                          |
| `src/data/faqs.ts`              | FAQ entries                                                               |
| `src/content/blog/`             | Markdown/MDX blog posts (Astro content collection, glob loader)           |

---

## Font System

Three self-hosted fonts, zero Google Fonts CDN dependency:

| Font                               | Package                      | Usage                   |
| ---------------------------------- | ---------------------------- | ----------------------- |
| Inter Variable (Latin)             | `@fontsource-variable/inter` | Body / UI sans-serif    |
| Merriweather (Latin 400, 700, 900) | `@fontsource/merriweather`   | Headings, serif display |
| Amiri (Arabic + Latin 400, 700)    | `@fontsource/amiri`          | Arabic script text      |

Inter Variable woff2, Merriweather 400 and 700 woff2 are `<link rel="preload">` in every page head (content-hashed URLs resolved by Vite `?url` import).

---

## Security Headers

Applied by `src/middleware.ts` to every response:

| Header                      | Value                                                        |
| --------------------------- | ------------------------------------------------------------ |
| `X-Frame-Options`           | `DENY`                                                       |
| `X-Content-Type-Options`    | `nosniff`                                                    |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                            |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), payment=()`       |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                        |
| `Content-Security-Policy`   | See `src/middleware.ts` — allows Turnstile, GTM, GA4, Resend |

---

## Local Development Setup

### Prerequisites

- Node.js `>=20.0.0` (see `.nvmrc` / `.node-version`)
- npm (bundled with Node)
- A Cloudflare account (free tier sufficient for local dev)

### 1. Clone and Install

```bash
git clone <repo-url>
cd quranific
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and populate:

```env
RESEND_API_KEY="re_..."            # From resend.com dashboard
TURNSTILE_SECRET_KEY="0x..."       # From Cloudflare Turnstile (secret key)
ADMIN_EMAIL="admin@quranific.com"
JWT_SECRET="<random-256-bit-string>"
SITE="http://localhost:4321"
PROD=false
```

> **Note:** `TURNSTILE_SITE_KEY` is the public key hardcoded in `src/constants/site.ts`. Only the `TURNSTILE_SECRET_KEY` (private server-side key) goes in `.env`.

### 3. Start the Dev Server

```bash
npm run dev
```

Runs `astro dev`. Cloudflare `platformProxy` is enabled in `astro.config.mjs`, providing 1:1 local simulation of the Cloudflare edge runtime including `cf` geo object data.

**Dev Geo Override:** In development, simulate specific countries by adding request headers:

- `X-Debug-Country: DE` — simulates Germany (STRICT bucket)
- `X-Debug-Region: QC` — simulates Quebec region
- `X-Debug-Country: _MISSING_` — simulates unknown country (STRICT, fail-closed)

These headers are tree-shaken out of production builds by Vite (`import.meta.env.DEV` guard in `middleware.ts`).

### 4. Preview the Production Build Locally

```bash
npm run build    # astro check + astro build
npm run preview  # wrangler pages dev ./dist
```

`npm run preview` uses Wrangler to serve the built `dist/` directory with full Cloudflare Workers runtime, KV bindings, and environment variable simulation.

### Available Scripts

| Script      | Command                                         | Description                                   |
| ----------- | ----------------------------------------------- | --------------------------------------------- |
| `dev`       | `astro dev`                                     | Local dev server with HMR                     |
| `build`     | `astro check && astro build`                    | Type-check then build to `dist/`              |
| `preview`   | `wrangler pages dev ./dist`                     | Local Cloudflare edge preview of built output |
| `clean`     | `rimraf dist .astro node_modules/.vite`         | Wipe build artifacts                          |
| `check`     | `astro check`                                   | TypeScript / Astro diagnostics                |
| `typecheck` | `tsc --noEmit`                                  | Strict TypeScript check only                  |
| `lint`      | `eslint .`                                      | Lint all source files                         |
| `lint:fix`  | `eslint . --fix`                                | Auto-fix linting issues                       |
| `format`    | `prettier --write .`                            | Format all files                              |
| `deploy`    | `npm run build && wrangler pages deploy ./dist` | Full build + deploy to Cloudflare Pages       |

---

## Alarm Worker (Dead-Letter Queue Daemon)

The `alarm-worker/` directory contains a **separate Cloudflare Worker** (`quranific-alarm`) deployed independently from the main Pages project.

**Purpose:** Hourly cron that drains the KV dead-letter queue by POSTing to `/api/internal/retry-queue`. Recovers failed email deliveries automatically without manual intervention.

**Cron schedule:** `0 * * * *` (every hour, on the hour)

**Environment variables required (alarm-worker secrets):**

| Variable     | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `TARGET_URL` | `https://quranific.com/api/internal/retry-queue` (set in `alarm-worker/wrangler.toml`) |
| `JWT_SECRET` | Must match the main site's `JWT_SECRET` (used as Bearer token for auth)                |

**Manual trigger (for testing):**

```bash
# Force-run the retry cycle immediately
curl -X POST https://<alarm-worker-url>/force-run

# Audit recent Resend email log
curl https://<alarm-worker-url>/resend-log
curl "https://<alarm-worker-url>/resend-log?id=<email-id>"
```

---

## Project Structure

```
quranific/
├── alarm-worker/           # Separate hourly cron Worker
│   ├── src/index.ts        # Cron + HTTP handler
│   └── wrangler.toml       # Worker config (quranific-alarm)
├── src/
│   ├── components/
│   │   ├── blocks/         # Feature components (Svelte islands + Astro blocks)
│   │   ├── global/         # Header.astro, Footer.astro, MobileMenu.astro
│   │   ├── seo/            # SEO component(s)
│   │   └── ui/             # Primitive UI atoms
│   ├── constants/          # courses.ts, pricing.ts, site.ts, testimonials.ts
│   ├── content/
│   │   └── blog/           # Markdown/MDX blog posts
│   ├── content.config.ts   # Astro content collection schema (blog)
│   ├── data/               # faqs.ts, testimonials.ts (runtime data)
│   ├── env.d.ts            # Cloudflare Workers Env + App.Locals type declarations
│   ├── layouts/            # Base.astro, Funnel.astro, Landing.astro, Page.astro
│   ├── lib/
│   │   ├── consent.ts      # Pure consent bucketing + cookie parsing (no side effects)
│   │   ├── email.ts        # All Resend email dispatch functions
│   │   ├── helpers.ts      # WhatsApp link generator, form dropdown constants
│   │   └── schema.ts       # Zod schemas: signupSchema, completeSchema
│   ├── middleware.ts        # Edge middleware: geo, consent, security, caching
│   ├── pages/
│   │   ├── api/            # Edge API routes (all SSR)
│   │   │   ├── apply-teacher.ts
│   │   │   ├── complete.ts
│   │   │   ├── consent-bucket.ts
│   │   │   ├── contact.ts
│   │   │   ├── geo-currency.ts
│   │   │   ├── newsletter.ts
│   │   │   ├── register.ts
│   │   │   └── internal/
│   │   │       └── retry-queue.ts
│   │   ├── getting-started/ # Three-page signup funnel
│   │   ├── [intent]/        # Audience-specific landing pages
│   │   └── ...              # All other routes
│   └── styles/
│       └── global.css
├── public/                  # Static assets (images, icons, webmanifest)
├── tests/                   # Playwright E2E tests
├── astro.config.mjs         # Astro + Cloudflare adapter + Vite config
├── wrangler.toml            # Main Cloudflare Pages config (KV, routes, placement)
├── svelte.config.js
├── tsconfig.json
├── .env.example
└── package.json
```

---

## GTM & Analytics

- **GTM Container:** `GTM-5CJMMJ29`
- **SPA Transponder:** `astro:page-load` event fires `virtual_page_view` into `dataLayer` for ViewTransitions SPA navigation
- **Consent Mode v2:** All GTM tags are gated. Tags only fire after `gtag('consent','update',...)` is called — silently for NONE visitors, or after user interaction with the cookie banner for STRICT/MODERATE
- **Google Site Verification:** `OH8wACNBZwBOLjyKjNHeZwKNWZD8McISfhN9wpQu0aE`

---

## Speculation Rules (Browser-Native Prerendering)

On non-slow connections, the browser is instructed to prerender high-intent pages:

```json
{
  "prerender": [
    {
      "eagerness": "moderate",
      "source": "list",
      "urls": ["/getting-started/signup", "/courses", "/tuition-fee"]
    }
  ]
}
```

`isSlowConnection` is `true` when `cf.httpProtocol === 'HTTP/1.1'` or `cf.asOrganization === 'Cellular'`. Speculation rules are omitted entirely for slow-connection visitors.

---

## Cloudflare Turnstile

- **Public site key:** `0x4AAAAAAD-QWQWhupcuvhbK` (in `src/constants/site.ts` and inline in `signup.astro`)
- **Server-side verify URL:** `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- **Protected endpoints:** `/api/register`, `/api/contact`, `/api/newsletter`, `/api/apply-teacher`
- **Verification includes** `remoteip` (CF-Connecting-IP) when available, for additional bot signal

---

## Code Quality

| Tool                | Config                 | Scope                                  |
| ------------------- | ---------------------- | -------------------------------------- |
| ESLint              | `eslint.config.mjs`    | JS, TS, Astro, Svelte                  |
| Prettier            | `.prettierrc`          | JS, TS, Astro, Svelte, JSON, MD, CSS   |
| TypeScript          | `tsconfig.json`        | Strict mode                            |
| Husky + lint-staged | `package.json`         | Pre-commit: lint + format staged files |
| Playwright          | `playwright.config.ts` | E2E tests in `tests/`                  |
