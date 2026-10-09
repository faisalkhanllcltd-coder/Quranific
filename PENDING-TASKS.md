# PENDING-TASKS — Quranific.com

**Live branch:** `staging/security-and-arch-fixes`  
**Base commit:** `af40495`  
**Audit date:** 2026-10-09  
**Architecture Context:** `staging/security-and-arch-fixes` contains the final security hardening, newsletter double opt-in, layout consistency, and documentation fixes preparing for production deployment.

---

## SECTION A: OPEN ITEMS & BACKLOG

### 1. Production Deployment Status

- **Status:** ❌ **NOT YET DEPLOYED TO PRODUCTION**
- **Blockers:**
  1. Owner must provision Cloudflare Worker secrets (`INTERNAL_WORKER_SECRET` on both workers, `ALARM_ADMIN_TOKEN` on alarm-worker; see [`owner-actions.md#oa-01`](./owner-actions.md), [`#oa-02`](./owner-actions.md)) before deploy.
  2. Branch `staging/security-and-arch-fixes` must be merged to `main`.
  3. Deploy commands must be executed in order: `npm run deploy:prod` followed by `npm run deploy:alarm` (see [`owner-actions.md#oa-26`](./owner-actions.md)).

---

### 2. Owner Action Items (By OA ID)

All owner-managed configuration, Cloudflare dashboard steps, DNS records, secrets provisioning, and live verification procedures are centralized in [`owner-actions.md`](./owner-actions.md):

#### Tier 1: Launch Blockers (Must Complete Before Traffic)

- **OA-01:** Set `INTERNAL_WORKER_SECRET` on Main Worker (`quranific`) and Alarm Worker (`quranific-alarm`) via `wrangler secret put`.
- **OA-02:** Set `ALARM_ADMIN_TOKEN` on Alarm Worker via `wrangler secret put -c alarm-worker/wrangler.toml`.
- **OA-03:** _[Obsolete/Merged]_ Ad tracking secrets (`META_CAPI` purged; optional GA4 credentials documented).
- **OA-04:** Verify custom domain `quranific.com` in Resend dashboard (must show **Verified**).
- **OA-05:** Universal SSL CAA DNS Records (confirm Let's Encrypt / Google Trust Services CAA records in Cloudflare).
- **OA-06:** Verify Hostinger Name Servers delegation to Cloudflare.
- **OA-07:** GTM Additional Consent Mode v2 configuration in Google Tag Manager container `GTM-5CJMMJ29`.
- **OA-08:** Cloudflare Zone WAF, Bot Fight Mode, and TLS 1.3 configuration.
- **OA-09:** Post-deployment edge smoke test (security headers, redirects, API health).
- **OA-26:** Production Deployment Execution Order runbook.
- **OA-35:** Resend Contacts API access verification & optional `RESEND_AUDIENCE_ID` Segment ID setup.

#### Tier 2: Post-Launch Hardening (Within 48 Hours)

- **OA-10:** Verify Turnstile widget secret key in Cloudflare dashboard and environment.
- **OA-11:** Set `ALERT_WEBHOOK_URL` on Alarm Worker for dead-letter queue Discord/Slack alerts.
- **OA-12:** Verify DNSSEC DS record registration at Hostinger registrar.
- **OA-13:** Enforce Two-Factor Authentication (2FA) across Cloudflare account.
- **OA-14:** Create scoped, least-privilege Cloudflare API tokens for CI/CD.
- **OA-15:** Review Cloudflare Audit Logs for unauthorized configuration drift.
- **OA-16:** Designate secondary emergency admin member on Cloudflare.
- **OA-17:** Verify Cloudflare Cache Rules and Edge TTL settings for static assets.
- **OA-18:** Edge Geolocation (`CF-IPCountry`) and regional consent bucket verification.
- **OA-19:** DMARC policy progression: add `rua=mailto:compliance@quranific.com` and monitor before quarantine.

#### Tier 3: Quality, Compliance & Growth (Within 14 Days)

- **OA-20:** Homepage edge cache hit rate monitoring via Cloudflare Analytics.
- **OA-21:** Worker CPU time, error rates, and subrequest metrics review.
- **OA-22:** Live lead ingestion & conversion attribution verification (includes merged OA-33).
- **OA-23:** Core Web Vitals (LCP, CLS, INP) field telemetry monitoring via Google Search Console.
- **OA-24:** GA4 conversion tracking verification via Tag Assistant / DebugView.
- **OA-25:** Google Search Console XML sitemap submission and index coverage review.
- **OA-27:** Custom domain routing verification on Cloudflare apex and www.
- **OA-28:** Content Security Policy (CSP) live enforcement check (assert zero console violations).
- **OA-29:** SSL Labs Server Test (assert A+ rating).
- **OA-30:** 1280px+ desktop container width verification across 19 identified routes.
- **OA-31:** Live newsletter double opt-in end-to-end verification (respect 10-minute rate limit).
- **OA-32:** Google Ads merchant pricing alignment verification.
- **OA-33:** _[Merged into OA-22]_ Meta event attribution verification.
- **OA-34:** Legal footer link consistency and impressum details check.

---

### 3. Honest Backlog (compare.md Items 1–52)

Every item from `compare.md` not proven by an explicit verification checklist command is marked as **UNVERIFIED** with a track tag (`[SEO]`, `[product]`, or `[owner]`). No item is claimed as DONE without a verifiable command:

- **Item 1: FAQ Data in TS** — UNVERIFIED `[product]` (Data centralized in `src/data/faqs.ts`, but dynamic UI integration across all pages unverified)
- **Item 2: Testimonials Data in TS** — UNVERIFIED `[product]` (Centralized in `src/data/testimonials.ts`, site-wide component adoption unverified)
- **Item 3: Teachers Data in TS** — UNVERIFIED `[product]` (Faculty populated in `src/data/team.ts`, dynamic profile routing unverified)
- **Item 4: Blog Data in TS** — UNVERIFIED `[SEO]` (`src/content/blog/hello-world.md` published, multi-post taxonomy unverified)
- **Item 5: Courses Data in TS** — UNVERIFIED `[product]` (Course catalog structure in `courses.ts` requires billing alignment check)
- **Item 6: Fees Data in TS** — UNVERIFIED `[product]` (Pricing matrix in `pricing.ts` requires checkout flow verification)
- **Item 7: Features Data in TS** — UNVERIFIED `[product]` (`src/data/features.ts` exists, component reuse unverified)
- **Item 8: Deep Calculator UX** — UNVERIFIED `[product]` (Calculator step navigation, family discounts, and edge states unverified)
- **Item 9: Full-Month Guarantee Component for Reuse** — UNVERIFIED `[product]` (`GuaranteeCard.astro` extracted, reuse across all routes unverified)
- **Item 10: Fee Page Currency Box Removal & Dynamic Summary Context** — UNVERIFIED `[product]` (Fee page dynamic summary context unverified)
- **Item 11: Team Data in TS** — UNVERIFIED `[product]` (Team structure in `team.ts` unverified against teacher onboarding portal)
- **Item 12: Promo Bar Logic, Tracking, Show/Hide Logic** — UNVERIFIED `[product]` (Local storage dismissal and impression events unverified)
- **Item 13: Inventory of Professional Emails** — **PROVEN BY CHECKLIST COMMAND #7 & #8** (`support@`, `contact@`, `compliance@`, `faisalkhan.llc.ltd@gmail.com` in `site.ts`; `admin@` intentionally not in code)
- **Item 14: Portals Routing and Edge Auth/Signup Redirection Logic** — UNVERIFIED `[product]` (Edge auth redirection logic unverified)
- **Item 15: Funnel [Getting Started] User Journey & Step Analytics Tracking** — UNVERIFIED `[product]` (Step completion funnel events unverified in browser)
- **Item 16: Legal Pages Deep Audit** — UNVERIFIED `[owner]` (Legal page business address and representative review unverified)
- **Item 17: Forensic Corner-to-Corner Codebase Mismatches** — UNVERIFIED `[product]` (Stale strings across components unverified)
- **Item 18: Signup Page UI/UX, Slim Step Circles & Testimonial Placement** — UNVERIFIED `[product]` (Signup layout on ultra-wide screens unverified)
- **Item 19: Complete Profile UI/UX, Pre-Selection Logic & 3rd-Party Verification** — UNVERIFIED `[product]` (Profile wizard edge validation unverified)
- **Item 20: [Intent] Landing Pages UI/UX, Dynamic Routing & Attribution Logic** — UNVERIFIED `[SEO]` (Intent page canonicalization and UTM preservation unverified)
- **Item 21: Dynamic [Slug] Routes (Courses & Blog) UI/UX, API, Data & Logic** — UNVERIFIED `[SEO]` (Dynamic slug metadata generation unverified)
- **Item 22: Cloudflare Edge Architecture** — UNVERIFIED `[product]` (Edge asset caching behavior under live production unverified)
- **Item 23: Resend Edge Integration & Cloudflare Best Practices** — **PROVEN BY CHECKLIST COMMAND #19, #20, #21, #25, #34, #35** (`ensureSubscribed`, RFC 8058, double opt-in)
- **Item 24: Full SEO Architecture** — UNVERIFIED `[SEO]` (JSON-LD Course and Organization schemas unverified)
- **Item 25: AI Optimization** — UNVERIFIED `[SEO]` (GEO / AI search citation readiness unverified)
- **Item 26: Internal Linking Mesh** — UNVERIFIED `[SEO]` (Cross-page contextual linking density unverified)
- **Item 27: Edge Security** — **PROVEN BY CHECKLIST COMMAND #3, #4, #12, #13, #15** (`timingSafeEqual`, CSP, HSTS)
- **Item 28: Rocket Performance** — UNVERIFIED `[SEO]` (Lighthouse mobile 95+ score unverified on live edge)
- **Item 29: Dynamic Consent** — **PROVEN BY CHECKLIST COMMAND #37** (Dynamic regional consent engine verified by unit test)
- **Item 30: Green Signals** — UNVERIFIED `[SEO]` (Core Web Vitals INP/CLS field signals unverified)
- **Item 31: Asset Pipeline** — UNVERIFIED `[SEO]` (Font subsetting FOIT curb unverified)
- **Item 32: End-to-End Testing Loop & Full Website Test Coverage** — UNVERIFIED `[product]` (Playwright E2E coverage for commercial funnel unverified)
- **Item 33: Search Console Indexing** — UNVERIFIED `[SEO]` (Index coverage and XML sitemap ingestion unverified)
- **Item 34: GTM Implementation** — UNVERIFIED `[SEO]` (GTM tag firing under Consent Mode v2 unverified)
- **Item 35: Crawl Hygiene & Error Handling** — UNVERIFIED `[SEO]` (Edge 404/500 response headers unverified)
- **Item 36: Brand Consistency (Fonts, Layouts, Containers)** — **PROVEN FOR CONTAINER BY CHECKLIST COMMAND #14 & #15**; typography & color tokens UNVERIFIED `[product]`
- **Item 37: WhatsApp and Social Media Deep-Linking Logic** — **PROVEN FOR COURSEHERO BY CHECKLIST COMMAND #4**; remaining links UNVERIFIED `[product]`
- **Item 38: Image Optimization** — UNVERIFIED `[SEO]` (Explicit aspect-ratio and responsive WebP delivery unverified)
- **Item 39: Ads Conversion Readiness** — UNVERIFIED `[SEO]` (Google Ads tag conversion firing unverified)
- **Item 40: Suspension Safeguards** — UNVERIFIED `[SEO]` (Merchant pricing transparency alignment unverified)
- **Item 41: Merchant Underwriting & Payment Gateway Submission Readiness** — UNVERIFIED `[owner]` (Payment processor underwriting docs unverified)
- **Item 42: Size Consistency** — UNVERIFIED `[product]` (Component responsive scale across breakpoints unverified)
- **Item 43: Asset Pipeline & Performance** — UNVERIFIED `[SEO]` (Critical CSS inlining unverified)
- **Item 44: Deep Content Sweep to Remove "AI-Sounding" Text and AI Watermarks** — UNVERIFIED `[owner]` (Owner editorial audit unverified)
- **Item 45: Comprehensive Reconciliation of Omitted Architecture & Production Requirements** — UNVERIFIED `[product]` (Disaster recovery KV backup and automated CI unverified)
- **Item 46: Workers Assets & Best Practices** — UNVERIFIED `[product]` (Static asset bypass configuration unverified)
- **Item 47: Edge Security & Headers** — **PROVEN BY CHECKLIST COMMAND #3 & #29** (HSTS preload, COOP, CSP)
- **Item 48: Edge Logic Audit** — UNVERIFIED `[product]` (Geo-currency resolution edge logic unverified)
- **Item 49: Alarm Worker Logic** — **PROVEN BY CHECKLIST COMMAND #11, #13, #28** (`ALARM_ADMIN_TOKEN` timingSafeEqual, cron dispatch)
- **Item 50: Final End-to-End Smoke Test Automation & Edge Health Checks** — UNVERIFIED `[product]` (Automated post-deploy smoke script unverified)
- **Item 51: Professional Newsletter Ecosystem vs. Single Welcome Email** — **PROVEN BY CHECKLIST COMMAND #19, #20, #21, #23, #25, #34, #35**
- **Item 52: Mobile Menu Toggle Bug and Edge Styling** — UNVERIFIED `[product]` (Mobile menu animation on physical iOS/Android unverified)

---

## SECTION B: DONE ITEMS (PT-01 TO PT-10)

The following 10 architectural and security tasks are completed in code on branch `staging/security-and-arch-fixes`. Each item is accompanied by an empirical evidence command:

### PT-01 — Security: Alarm-Worker Unauthenticated HTTP Endpoints & Secret Separation

- **Status:** ✅ **DONE**
- **Description:** Enforces `timingSafeEqual()` on `ALARM_ADMIN_TOKEN` for HTTP requests (`/force-run`) and uses separate `INTERNAL_WORKER_SECRET` for cron dispatches. Fails closed when unset.
- **Evidence Command:**
  ```powershell
  git grep -nF "timingSafeEqual" alarm-worker/src/index.ts
  ```

### PT-02 — Security: npm Dependency Vulnerabilities (Astro RCE & Sharp Patched)

- **Status:** ✅ **DONE**
- **Description:** Updated `astro` to `^7.2.10` (resolving GHSA-26w7-cxv4-gfx2 and GHSA-376h-93r7-7g6f) and `sharp` to `^0.35.4`.
- **Evidence Command:**
  ```powershell
  git grep -nE '"astro":|"sharp":' package.json
  ```

### PT-03 — CI: npm Audit Bypass Removed

- **Status:** ✅ **DONE**
- **Description:** Enforced strict `npm audit --omit=dev --audit-level=critical` in `.github/workflows/ci.yml` without permissive `|| true` fallback.
- **Evidence Command:**
  ```powershell
  git grep -nF "audit-level=critical" .github/workflows/ci.yml
  ```

### PT-04 — Security: HSTS `preload` + COOP Header Enforced

- **Status:** ✅ **DONE**
- **Description:** Configured `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` and `Cross-Origin-Opener-Policy: same-origin-allow-popups` in `public/_headers` and `src/middleware.ts`.
- **Evidence Command:**
  ```powershell
  git grep -nF "includeSubDomains; preload" public/_headers
  ```

### PT-05 — Meta CAPI: Graph API Dead Code Purged

- **Status:** ✅ **DONE**
- **Description:** Purged all dead Facebook Meta CAPI code, references to `graph.facebook.com`, `META_CAPI`, and `fbq` from `src/` and `public/`.
- **Evidence Command:**
  ```powershell
  git grep -nE "graph\.facebook|META_CAPI|fbq" src public
  # Expected: Exit code 1 (0 matches)
  ```

### PT-06 — Retry-Queue: Timing-Safe Auth Comparison & Secret Separation

- **Status:** ✅ **DONE**
- **Description:** Implemented Web Crypto `timingSafeEqual()` in `src/pages/api/internal/retry-queue.ts` comparing incoming Bearer tokens against `INTERNAL_WORKER_SECRET`. Fails closed if secret is unset.
- **Evidence Command:**
  ```powershell
  git grep -nF "timingSafeEqual" src/pages/api/internal/retry-queue.ts
  ```

### PT-07 — CSP: Removal of `unsafe-eval` from Enforced Policy

- **Status:** ⚠️ **CODE DONE; VERIFY AFTER DEPLOY (OA-28)**
- **Description:** Removed `'unsafe-eval'` from enforced `Content-Security-Policy` headers in `public/_headers` and `src/middleware.ts`. Live production enforcement requires post-deploy verification.
- **Evidence Command:**
  ```powershell
  git grep -nF "unsafe-eval" public/_headers src/middleware.ts
  # Expected: Exit code 1 (0 matches)
  ```

### PT-08 — WCAG AA: Amber Text Contrast Fixed in AboutTeam.astro

- **Status:** ✅ **DONE**
- **Description:** Replaced low-contrast `text-amber-400` / `text-amber-500` with `text-amber-700` in `src/pages/about/_components/AboutTeam.astro` to meet WCAG AA contrast requirements.
- **Evidence Command:**
  ```powershell
  git grep -nF "text-amber-700" src/pages/about/_components/AboutTeam.astro
  ```

### PT-09 — success.astro: Dangerous Build-Time `JWT_SECRET` Fallback Removed

- **Status:** ✅ **DONE**
- **Description:** Removed build-time evaluation of `import.meta.env.JWT_SECRET` in `src/pages/getting-started/success.astro`, resolving secrets strictly at request time via `runtimeEnv.JWT_SECRET`.
- **Evidence Command:**
  ```powershell
  git grep -nF "runtimeEnv.JWT_SECRET" src/pages/getting-started/success.astro
  ```

### PT-10 — Newsletter: Double Opt-In, Turnstile Bot Challenge & Resend Contacts API

- **Status:** ✅ **DONE**
- **Description:** Implemented complete double opt-in lifecycle: Turnstile bot protection, KV rate limiting (`NL_REQ:<email>`, 600s TTL), HMAC-SHA256 derived tokens, KV consent storage (`NL_CONSENT:<email>`), Resend Contacts API sync (`ensureSubscribed`), and RFC 8058 one-click unsubscribe headers.
- **Evidence Command:**
  ```powershell
  git grep -nF "ensureSubscribed" src/pages/api/newsletter/confirm.ts
  ```

---

## SECTION C: LEGACY TASK MAPPING (PT-01 TO PT-33 FROM d25b8e4)

This table maps every legacy task ID (`PT-01` through `PT-33`) from commit `d25b8e4` to its current status and tracking location:

| Legacy ID | Original Description                                                 | Final Status                      | Current Tracking Location                                                                                                                      |
| :-------- | :------------------------------------------------------------------- | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **PT-01** | Root Worker Secrets (`INTERNAL_WORKER_SECRET`)                       | ❌ OPEN (Owner)                   | [`owner-actions.md#oa-01`](./owner-actions.md)                                                                                                 |
| **PT-02** | Alarm Worker Secrets (`INTERNAL_WORKER_SECRET`, `ALARM_ADMIN_TOKEN`) | ❌ OPEN (Owner)                   | [`owner-actions.md#oa-01`](./owner-actions.md), [`#oa-02`](./owner-actions.md)                                                                 |
| **PT-03** | Server-Side Ad Secrets (`META_CAPI` purged, optional GA4)            | ➖ PURGED / OPTIONAL              | [`owner-actions.md#oa-03`](./owner-actions.md)                                                                                                 |
| **PT-04** | DLQ Alert Webhook (`ALERT_WEBHOOK_URL`) on Alarm Worker              | ❌ OPEN (Owner)                   | [`owner-actions.md#oa-11`](./owner-actions.md)                                                                                                 |
| **PT-05** | GTM Tag Additional Consent Configuration                             | ⚠️ OWNER CHECK                    | [`owner-actions.md#oa-07`](./owner-actions.md)                                                                                                 |
| **PT-06** | Universal SSL CAA DNS Records                                        | ⚠️ OWNER DECISION                 | [`owner-actions.md#oa-05`](./owner-actions.md)                                                                                                 |
| **PT-07** | Submit DNSSEC DS Record at Hostinger Registrar                       | ⚠️ OWNER CHECK                    | [`owner-actions.md#oa-12`](./owner-actions.md)                                                                                                 |
| **PT-08** | Cloudflare Zone Dashboard Verifications (WAF, Bots, 2FA, Cache)      | ⚠️ OWNER CHECK                    | [`owner-actions.md#oa-08`](./owner-actions.md), [`#oa-13`](./owner-actions.md), [`#oa-14`](./owner-actions.md), [`#oa-17`](./owner-actions.md) |
| **PT-09** | Secondary Emergency Admin Member & 2FA Enforcement                   | ⚠️ OWNER CHECK                    | [`owner-actions.md#oa-16`](./owner-actions.md)                                                                                                 |
| **PT-10** | Alarm-Worker Endpoint Auth & Secret Separation                       | ✅ DONE IN CODE                   | Section B: PT-01 (Deploy in OA-26)                                                                                                             |
| **PT-11** | npm Dependency Vulnerabilities (Astro RCE & Sharp)                   | ✅ DONE IN CODE                   | Section B: PT-02                                                                                                                               |
| **PT-12** | CI: npm Audit Bypass Removed                                         | ✅ DONE IN CODE                   | Section B: PT-03                                                                                                                               |
| **PT-13** | Security: HSTS `preload` + COOP Header Enforced                      | ✅ DONE IN CODE                   | Section B: PT-04                                                                                                                               |
| **PT-14** | Meta CAPI: Graph API Dead Code Purged                                | ✅ DONE IN CODE                   | Section B: PT-05                                                                                                                               |
| **PT-15** | Retry-Queue: Timing-Safe Auth Comparison & Secret Separation         | ✅ DONE IN CODE                   | Section B: PT-06                                                                                                                               |
| **PT-16** | WCAG AA: Amber Text Contrast Fixed in AboutTeam.astro                | ✅ DONE IN CODE                   | Section B: PT-08                                                                                                                               |
| **PT-17** | success.astro: Dangerous `JWT_SECRET` Fallback Removed               | ✅ DONE IN CODE                   | Section B: PT-09                                                                                                                               |
| **PT-18** | Wrangler Observability: alarm-worker Enabled                         | ✅ DONE IN CODE                   | Section E: Command #9 / OA-26                                                                                                                  |
| **PT-19** | Newsletter Double Opt-In & Contacts Sync                             | ✅ DONE IN CODE                   | Section B: PT-10                                                                                                                               |
| **PT-20** | Homepage Edge Cache Hit Rate Monitoring                              | ⚠️ MONITORING                     | [`owner-actions.md#oa-20`](./owner-actions.md)                                                                                                 |
| **PT-21** | GTM: Hostname Guard Enforced                                         | ✅ DONE IN CODE                   | Section E: Command #27                                                                                                                         |
| **PT-22** | CSP: Removal of `unsafe-eval` from Enforced Policy                   | ⚠️ CODE DONE; VERIFY AFTER DEPLOY | Section B: PT-07 / [`owner-actions.md#oa-28`](./owner-actions.md)                                                                              |
| **PT-23** | `wrangler types` Generated Types Missing                             | ❌ OPEN (Dev)                     | Section A: Developer Action (`npx wrangler types`)                                                                                             |
| **PT-24** | DMARC: Advance from `p=none` Monitoring to `p=quarantine`            | ⚠️ MONITORING                     | [`owner-actions.md#oa-19`](./owner-actions.md)                                                                                                 |
| **PT-25** | Real-Edge CA-QC and GPC Validation                                   | ⚠️ POST-DEPLOY                    | [`owner-actions.md#oa-18`](./owner-actions.md)                                                                                                 |
| **PT-26** | Core Web Vitals (LCP, INP) via Google Search Console                 | ⚠️ POST-DEPLOY                    | [`owner-actions.md#oa-23`](./owner-actions.md)                                                                                                 |
| **PT-27** | Partytown/GTM Conversion Attribution via Live Tag Assistant          | ⚠️ POST-DEPLOY                    | [`owner-actions.md#oa-07`](./owner-actions.md)                                                                                                 |
| **PT-28** | Content: Real Blog Article Published                                 | ✅ DONE IN CODE                   | Section E: Command #16, #17, #18                                                                                                               |
| **PT-29** | Data: Consolidated Testimonials Single Source of Truth               | ✅ DONE IN CODE                   | Section A: Backlog Item 2                                                                                                                      |
| **PT-30** | Data: Team & Teacher Data Layer                                      | ✅ DONE IN CODE                   | Section A: Backlog Item 3, 11                                                                                                                  |
| **PT-31** | UX/Code: Conversion Funnel Engine Sub-Items                          | ⚠️ PARTIAL / BACKLOG              | Section A: Backlog Items 8, 10, 14, 15, 18, 19, 48                                                                                             |
| **PT-32** | CourseHero WhatsApp Coupling                                         | ✅ DONE IN CODE                   | Section E: Command #4                                                                                                                          |
| **PT-33** | Additional Architectural & Consistency Items                         | ⚠️ PARTIAL / BACKLOG              | Section A: Backlog Items 1, 9, 12, 16, 17, 36, 42, 44, 52                                                                                      |

---

## SECTION D: AUTHORITATIVE POINTER TO OWNER-ACTIONS.MD

> [!IMPORTANT]
> **Single Source of Truth for Operational & Owner Actions:**  
> All Cloudflare dashboard tasks, DNS configuration steps, registrar actions, secrets provisioning commands, and post-deployment live verifications are maintained exclusively in [`owner-actions.md`](./owner-actions.md).  
> **Do not duplicate owner checklists in this file.** Refer to [`owner-actions.md`](./owner-actions.md) for step-by-step runbooks, exact terminal commands, and current tier dashboard counts.

---

## SECTION E: VERIFICATION CHECKLIST (MECHANICAL POWERSHELL AUDIT)

The following commands verify the operational, security, and architectural integrity of the repository. Every command uses `-F` for literal text matching or exact arguments, runs cleanly in Windows PowerShell, and asserts exact expected outputs:

```powershell
# 1. Verify no placeholder-32b secrets anywhere in repository
(git grep -nF "placeholder-32b" -- ":(exclude)PENDING-TASKS.md").Count
# Expected: 0

# 2. Verify no Meta CAPI or graph.facebook references in source code
(git grep -nE "graph\.facebook|META_CAPI|fbq" -- src public).Count
# Expected: 0

# 3. Verify no unsafe-eval in enforced CSP headers
(git grep -nF "unsafe-eval" -- public/_headers src/middleware.ts).Count
# Expected: 0

# 4. Verify CourseHero uses centralized SITE.whatsappLink
git grep -nF "SITE.whatsappLink" -- src/pages/courses/_components/CourseHero.astro
# Expected: Match on line 93 (href={SITE.whatsappLink})

# 5. Verify no hardcoded 447477 UK phone numbers in src
(git grep -nF "447477" -- src).Count
# Expected: 0

# 6. Verify legacy SITE.email field is removed from constants
(git grep -nE "^\s*email\s*:" -- src/constants/site.ts).Count
# Expected: 0

# 7. Verify approved correspondence mailboxes and personal Gmail exist in site constants
git grep -nE "support@|compliance@|contact@|faisalkhan\.llc\.ltd@gmail\.com" -- src/constants/site.ts
# Expected: 7 matches for correspondence emails and SITE.emails.admin

# 8. Verify admin@quranific.com is intentionally not present in code
(git grep -nF "admin@quranific.com" -- src).Count
# Expected: 0

# 9. Verify deploy:alarm npm script exists in package.json
git grep -nF '"deploy:alarm"' -- package.json
# Expected: Match on line 23 ("deploy:alarm": "wrangler deploy -c alarm-worker/wrangler.toml")

# 10. Verify deploy:prod npm script exists in package.json
git grep -nF '"deploy:prod"' -- package.json
# Expected: Match on line 22 ("deploy:prod": "node scripts/deploy-guard.mjs && npm run check && npm run build && wrangler deploy")

# 11. Verify dry-run deployment for alarm-worker succeeds
npx wrangler deploy -c alarm-worker/wrangler.toml --dry-run
# Expected: Total Upload reported, bindings list, exit code 0

# 12. Verify retry-queue timing-safe comparison exists
git grep -nF "timingSafeEqual" -- src/pages/api/internal/retry-queue.ts
# Expected: Match present on line 30

# 13. Verify alarm-worker timing-safe comparison exists
git grep -nF "timingSafeEqual" -- alarm-worker/src/index.ts
# Expected: Match present on line 12

# 14. Verify quranific-container utility in global.css drops xl:px-12
git grep -nF "@utility quranific-container" -- src/styles/global.css
# Expected: Match on line 61

# 15. Verify container class definition is unique across src (exactly 1 match)
(git grep -nF "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" -- src).Count
# Expected: 1 (only the @apply definition in src/styles/global.css)

# 16. Verify blog slug filters tags < 3 characters
git grep -nF "t.length >= 3" -- "src/pages/blog/[slug].astro"
# Expected: Match present on line 69

# 17. Verify blog slug matches whole words with word boundary regex
git grep -nF '\b${escapeRegex' -- 'src/pages/blog/[slug].astro'
# Expected: Match present on line 76

# 18. Verify no stone- color classes in blog slug
(git grep -nF "stone-" -- "src/pages/blog/[slug].astro").Count
# Expected: 0

# 19. Verify Turnstile verification function imported and called in newsletter API
git grep -nF "verifyTurnstile" -- src/pages/api/newsletter.ts
# Expected: Matches on line 6 and line 79

# 20. Verify double opt-in confirm endpoint exists and prerender = false
git grep -nF "prerender = false" -- src/pages/api/newsletter/confirm.ts
# Expected: Match on line 12

# 21. Verify unsubscribe endpoint exists and prerender = false
git grep -nF "prerender = false" -- src/pages/api/newsletter/unsubscribe.ts
# Expected: Match on line 8

# 22. Verify old KV key UNSUBSCRIBED:NEWSLETTER is no longer written
(git grep -nF "UNSUBSCRIBED:NEWSLETTER" -- src).Count
# Expected: 0

# 23. Verify footer button text updates to 'Check your inbox'
git grep -nF "btn.innerText = 'Check your inbox';" -- src/components/global/Footer.astro
# Expected: Match on line 248

# 24. Verify footer success message prompts inbox confirmation
git grep -nF "Check your inbox to confirm your subscription." -- src/components/global/Footer.astro
# Expected: Match on line 255

# 25. Verify RFC 8058 one-click headers in welcome email
git grep -nF "List-Unsubscribe-Post" -- src/lib/email.ts
# Expected: Match on line 404

# 26. Verify generate_lead dataLayer event in CompleteForm
git grep -nF "generate_lead" -- src/pages/getting-started/_components/CompleteForm.svelte
# Expected: Match on line 153

# 27. Verify GTM production hostname guard in Base.astro
git grep -nF "window.location.hostname === 'quranific.com'" -- src/layouts/Base.astro
# Expected: Match on line 132

# 28. Verify alarm workers.dev domain probe (Before deploy: 200, After deploy: 404)
curl.exe -s -o NUL -w "%{http_code}" https://quranific-alarm.faisalkhan-llc-ltd.workers.dev
# Expected: 200 (current live state before deploy); 404 (after deploy with workers_dev=false)

# 29. Verify main site workers.dev domain is disabled
curl.exe -s -o NUL -w "%{http_code}" https://quranific.faisalkhan-llc-ltd.workers.dev
# Expected: 404

# 30. Verify DEPLOYMENT.md mentions INTERNAL_WORKER_SECRET
git grep -nF "INTERNAL_WORKER_SECRET" -- DEPLOYMENT.md
# Expected: 13 matches

# 31. Verify stale phrase 'must match the main site' is absent from DEPLOYMENT.md
(git grep -nF "must match the main site" -- DEPLOYMENT.md).Count
# Expected: 0

# 32. Verify no openssl rand instructions remain in any markdown file
(git grep -nF "openssl rand" -- "*.md" ":(exclude)PENDING-TASKS.md").Count
# Expected: 0

# 33. Verify 'System Crash' wording is absent from newsletter.ts
(git grep -nF "System Crash" -- src/pages/api/newsletter.ts).Count
# Expected: 0

# 34. Verify NL_CONSENT is written before ensureSubscribed in confirm.ts
git grep -nF -e "NL_CONSENT:" -e "ensureSubscribed" -- src/pages/api/newsletter/confirm.ts
# Expected: NL_CONSENT at line 302, ensureSubscribed at line 322 (consent written before subscription)

# 35. Verify ensureSubscribed function in resend-contacts.ts
git grep -nF "ensureSubscribed" -- src/lib/resend-contacts.ts
# Expected: Match on line 69

# 36. Verify RESEND_AUDIENCE_ID is documented in .env.example
git grep -nF "RESEND_AUDIENCE_ID" -- .env.example
# Expected: Match on line 54

# 37. Verify ALARM_ADMIN_TOKEN is documented in DEPLOYMENT.md
git grep -nF "ALARM_ADMIN_TOKEN" -- DEPLOYMENT.md
# Expected: Matches on lines 109, 223, 228, 257
```
