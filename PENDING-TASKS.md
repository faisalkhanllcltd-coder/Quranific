# PENDING-TASKS — Quranific.com

**Branch analyzed:** `pending_tasks_consolidation`  
**Current HEAD commit (at time of generation):** `70d3a36` ("fix(queue): add circuit breaker to retry-queue")  
**Generated:** 2026-09-25  
**Note on branches:** `staging/audit-fixes-batch-a` is ahead of `main` by 20+ commits and has NOT been merged. That branch contains completed code fixes. This branch (`pending_tasks_consolidation`) tracks `main`-level code. Where a fix exists in `staging/audit-fixes-batch-a` but not yet in `main`, this is noted as "DONE IN STAGING — merge pending."

---

## Legend

- **Blocks going live:** YES = do not deploy to production until resolved | NO = safe to go live without
- **Who does it:** CODE = future code PR | OWNER = owner in Cloudflare dashboard / DNS registrar / third-party platform

---

## INFRASTRUCTURE & SECRETS (Cloudflare Dashboard / Wrangler)

---

### PT-01 — Cloudflare Worker Secrets: Main Worker (INTERNAL_WORKER_SECRET, META_CAPI_TOKEN)

**Blocks going live:** YES (META_CAPI_TOKEN: no, conversion tracking dead | INTERNAL_WORKER_SECRET: yes, retry-queue auth depends on it)  
**Who does it:** OWNER (Cloudflare Dashboard)

**Current state (fresh evidence):**  
`npx wrangler secret list` on the main worker failed with auth error (no `CLOUDFLARE_API_TOKEN` in CI env), so cannot verify locally. However:
- `01-cloudflare.md` (CF-04, last committed `b55388c` 2026-09-22) documents `JWT_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` confirmed present; `META_CAPI_TOKEN` confirmed ABSENT.
- `staging/audit-fixes-batch-a:src/pages/api/internal/retry-queue.ts` (line confirmed present) now reads `INTERNAL_WORKER_SECRET` from `runtimeEnv`; if not set, it falls back to `JWT_SECRET` for backward compatibility. Code is ready; secret still needs to be set.
- `src/pages/api/complete.ts:236` reads `META_CAPI_TOKEN` from `runtimeEnv`; lines 243–247 safely skip CAPI if unset.

**What to do:**  
1. `npx wrangler secret put INTERNAL_WORKER_SECRET` — generate a random 32-byte hex token, distinct from `JWT_SECRET`.  
2. `npx wrangler secret put META_CAPI_TOKEN` — paste System User access token from Facebook Events Manager → Settings → Generate Access Token.  
3. Add `META_PIXEL_ID` to `[vars]` in `wrangler.toml` (it is public; does not need to be a secret).

---

### PT-02 — Cloudflare Worker Secrets: Alarm-Worker (INTERNAL_WORKER_SECRET, ALARM_ADMIN_TOKEN)

**Blocks going live:** YES — `alarm-worker/src/index.ts` lines 33 and 56 expose `/force-run` and `/resend-log` HTTP endpoints. On the current `main`-branch code these have zero authentication. On `staging/audit-fixes-batch-a`, authentication uses `ALARM_ADMIN_TOKEN`; the `Env` interface declares both `ALARM_ADMIN_TOKEN` and `INTERNAL_WORKER_SECRET`.  
**Who does it:** OWNER (Cloudflare Dashboard) + CODE (merge staging branch first)

**Current state (fresh evidence):**  
`npx wrangler secret list -c alarm-worker/wrangler.toml` returned: `[{"name":"JWT_SECRET","type":"secret_text"}]` — only `JWT_SECRET` present. `INTERNAL_WORKER_SECRET` and `ALARM_ADMIN_TOKEN` are **ABSENT**.  
`alarm-worker/src/index.ts` (current branch, read lines 1–80): `/force-run` (line 33) and `/resend-log` (line 56) have NO auth check. `env.JWT_SECRET` is forwarded as an outbound bearer token to the main worker, reusing the cookie-signing secret across trust domains.

**What to do (after merging staging branch):**  
1. `npx wrangler secret put ALARM_ADMIN_TOKEN -c alarm-worker/wrangler.toml` — separate token for HTTP trigger auth on the alarm worker.  
2. `npx wrangler secret put INTERNAL_WORKER_SECRET -c alarm-worker/wrangler.toml` — same value as PT-01's `INTERNAL_WORKER_SECRET` (used for outbound calls to `/api/internal/retry-queue`).  
3. Optionally add `workers_dev = false` to `alarm-worker/wrangler.toml` to prevent public `.workers.dev` exposure (confirmed absent in current `alarm-worker/wrangler.toml` read from staging).

---

### PT-03 — Owner Action: Configure GA4 Server-Side Tracking Secrets

**Blocks going live:** NO (degrades analytics accuracy but does not break the site)  
**Who does it:** OWNER (Cloudflare Pages / GA4 Admin)

**Current state:** `src/pages/api/complete.ts` sends GA4 Measurement Protocol events when `GA4_MEASUREMENT_ID` and `GA4_API_SECRET` are set. These are NOT confirmed present in secrets (same verification gap as PT-01).

**What to do:**  
1. In GA4 Admin → Data Streams → your stream → Measurement Protocol API secrets → Create.  
2. `npx wrangler secret put GA4_MEASUREMENT_ID` (format: `G-XXXXXXXXXX`).  
3. `npx wrangler secret put GA4_API_SECRET`.

---

### PT-04 — Owner Action: Configure DLQ Alert Webhook

**Blocks going live:** NO  
**Who does it:** OWNER (Cloudflare Dashboard)

**Current state:** `src/pages/api/complete.ts` references `ALERT_WEBHOOK_URL` for Dead Letter Queue failure alerts. Not confirmed set.

**What to do:**  
Create a Discord/Slack webhook URL and run: `npx wrangler secret put ALERT_WEBHOOK_URL`.

---

### PT-05 — Owner Action: GTM Tag Consent Configuration

**Blocks going live:** YES (legal/GDPR — ad tags fire for all visitors without this)  
**Who does it:** OWNER (Google Tag Manager dashboard)

**Current state:** `src/components/blocks/CookieBanner.svelte` correctly fires `gtag('consent','update',...)`. GTM container `GTM-5CJMMJ29` must be configured to gate each tag on these signals. No code change needed — pure GTM dashboard work. Documented in `owner-actions.md` OA-1.

**What to do:**  
Log into GTM → Container `GTM-5CJMMJ29` → For every non-Google tag, enable "Require additional consent checks" with the appropriate consent types per the table in `owner-actions.md:OA-1`.

---

### PT-06 — DNS: Add CAA Records for Universal SSL

**Blocks going live:** NO (current SSL works; CAA prevents future mis-issuance and mis-renewal)  
**Who does it:** OWNER (Cloudflare DNS dashboard)

**Current state (fresh live DNS evidence):**  
`Invoke-RestMethod "https://dns.google/resolve?name=quranific.com&type=CAA"` returned zero `Answer` records — only an `Authority` SOA. **Zero CAA records exist as of 2026-09-25.**

**What to do:**  
In Cloudflare DNS for `quranific.com`, add 4 CAA records (type CAA, name `@`):  
- `0 issue "letsencrypt.org"`  
- `0 issue "digicert.com"`  
- `0 issue "sectigo.com"`  
- `0 issue "pki.goog"`

---

### PT-07 — DNS: Submit DNSSEC DS Record at Hostinger

**Blocks going live:** NO (DNSSEC is defense-in-depth; site works without it)  
**Who does it:** OWNER (Cloudflare Dashboard + Hostinger Registrar)

**Current state (fresh live DNS evidence):**  
`Invoke-RestMethod "https://dns.google/resolve?name=quranific.com&type=DS"` returned zero `Answer` records — the `AD` (Authenticated Data) flag is `false`. **DNSSEC DS record is not delegated at the registrar.**

**What to do:**  
1. Cloudflare Dashboard → DNS → DNSSEC → Enable → Copy DS record values.  
2. Log into Hostinger domain control panel → DNS / DNSSEC → Paste DS record.

---

### PT-08 — Owner Action: Cloudflare Zone Dashboard Verifications

**Blocks going live:** NO (cannot be verified locally; best-practice checks)  
**Who does it:** OWNER (Cloudflare Dashboard)

**Current state:** Cannot verify locally without `CF_API_TOKEN`. See `00-MASTER-REPORT.md §10` for exact API commands.

**What to do (verify in Cloudflare Dashboard):**  
- **CF-27:** Security → WAF → confirm Managed Ruleset is active.  
- **CF-28:** Security → Bots → confirm Bot Fight Mode is enabled.  
- **CF-29:** My Profile → Authentication → confirm 2FA is enforced.  
- **CF-30:** API Tokens → confirm CI/wrangler token is scoped (not Global API Key).  
- **OA-2:** Rules → Cache Rules → confirm no zone-level "Cache Everything" rule overrides `no-store` on HTML routes.

---

### PT-09 — Owner Action: Add Secondary Emergency Admin Account

**Blocks going live:** NO  
**Who does it:** OWNER (Cloudflare Dashboard)

**Current state:** Single account `faisalkhan.llc.ltd@gmail.com` controls all Cloudflare infrastructure. Documented in `owner-actions.md:OA-5`.

**What to do:**  
Cloudflare Dashboard → Manage Account → Members → Invite recovery email with Administrator role.

---

## CODE FIXES — Merge `staging/audit-fixes-batch-a` to Resolve

The following items are already **fixed in code on `staging/audit-fixes-batch-a`** but not yet merged to `main`.

---

### PT-10 — [STAGING DONE] Security: Alarm-Worker Unauthenticated HTTP Endpoints + JWT Secret Reuse

**Blocks going live:** YES  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`alarm-worker/src/index.ts` lines 1–80 (read directly from current branch):  
- Line 33: `/force-run` POST handler — **zero auth check**  
- Line 56: `/resend-log` GET handler — **zero auth check**  
- Line 14: forwards `env.JWT_SECRET` as outbound bearer token (secret reuse across trust domains)

`staging/audit-fixes-batch-a:alarm-worker/src/index.ts` (verified via `git show`):  
- `Env` interface now declares `ALARM_ADMIN_TOKEN` and `INTERNAL_WORKER_SECRET` (line confirmed)  
- `timingSafeEqual()` function is present  
- Auth is enforced on HTTP endpoints

**What to do:**  
1. Merge `staging/audit-fixes-batch-a` → `main`.  
2. Then set secrets per PT-02.

---

### PT-11 — [STAGING DONE] Security: npm Dependency Vulnerabilities (astro RCE + auth bypass)

**Blocks going live:** YES  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`package.json` on current branch declares: `"astro": "^7.2.0"`, `"sharp": "^0.35.2"`.  
Audit report `00-MASTER-REPORT.md §3 #3` documents: `astro <= 7.2.7` has GHSA-26w7-cxv4-gfx2 (RCE via AVIF) and GHSA-376h-93r7-7g6f (auth bypass).  
`staging/audit-fixes-batch-a:package.json` (verified via `git show`): `"astro": "^7.2.10"`, `"sharp": "^0.35.4"` — **both vulnerabilities patched**.

**What to do:**  
Merge `staging/audit-fixes-batch-a` (includes the upgrade).

---

### PT-12 — [STAGING DONE] CI: npm Audit Bypass Removed

**Blocks going live:** YES (CI currently silently passes with known RCE vulnerability)  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`.github/workflows/ci.yml` line from current branch: `npm audit --audit-level=critical || true` — `|| true` silently swallows ALL audit failures.  
`staging/audit-fixes-batch-a:.github/workflows/ci.yml` (verified via `git show`): `npm audit --omit=dev --audit-level=critical` — suppression removed.

**What to do:**  
Merge `staging/audit-fixes-batch-a`.

---

### PT-13 — [STAGING DONE] Security: HSTS `preload` + COOP Header Added

**Blocks going live:** NO (hardening; site functions without it)  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`staging/audit-fixes-batch-a:src/middleware.ts` (verified via `git show`):  
- Line 10: `'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'` ✅  
- Line 11: `'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'` ✅  
- `staging/audit-fixes-batch-a:public/_headers` (verified): `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` and `Cross-Origin-Opener-Policy: same-origin-allow-popups` ✅

Also confirmed in `_headers`: `Content-Security-Policy-Report-Only` header is deployed (CSP report-only mode active — safe precursor before removing `unsafe-eval`).

**What to do:**  
Merge `staging/audit-fixes-batch-a`. Note: HSTS preload registry submission at `hstspreload.org` is a separate owner action — only submit after confirming all subdomains (`send.quranific.com`, `resend._domainkey`) serve valid HTTPS.

---

### PT-14 — [STAGING DONE] Meta CAPI: Graph API version updated from expired v19.0 to v26.0

**Blocks going live:** NO (CAPI silently skips when secrets missing; v19.0 expired May 21 2026)  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`src/pages/api/complete.ts:274` on current branch: `https://graph.facebook.com/v19.0/${metaPixel}/events` — **v19.0 expired May 21, 2026**.  
`staging/audit-fixes-batch-a:src/pages/api/complete.ts:274` (verified via `git show`): `https://graph.facebook.com/v26.0/` — **updated**.

**What to do:**  
Merge `staging/audit-fixes-batch-a`. Then set `META_CAPI_TOKEN` secret per PT-01.

---

### PT-15 — [STAGING DONE] Retry-Queue: Timing-Safe Auth Comparison

**Blocks going live:** YES (timing side-channel on secret comparison)  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`staging/audit-fixes-batch-a:src/pages/api/internal/retry-queue.ts` (read lines 1–80 directly): `timingSafeEqual()` function is present using `crypto.subtle.digest('SHA-256', ...)` with constant-time byte comparison. `INTERNAL_WORKER_SECRET` is read from `runtimeEnv` and preferred over `JWT_SECRET`. **Fixed in staging.**

**What to do:**  
Merge `staging/audit-fixes-batch-a`.

---

### PT-16 — [STAGING DONE] WCAG AA: Amber Text Contrast Fixed in AboutTeam.astro

**Blocks going live:** NO  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`staging/audit-fixes-batch-a:src/pages/about/_components/AboutTeam.astro` (verified via `git show`): `textClass: 'text-amber-700'` — **darkened from amber-600 (3.19:1 FAIL) to amber-700 (5.02:1 PASS)**.

**What to do:**  
Merge `staging/audit-fixes-batch-a`.

---

### PT-17 — [STAGING DONE] success.astro: Removed Dangerous `import.meta.env.JWT_SECRET` Fallback

**Blocks going live:** YES (in production would silently resolve to `undefined` and throw HTTP 500 on all success page loads)  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`src/pages/getting-started/success.astro` on current branch (verified via `git show`):  
Line 34: `// DO NOT fall back to import.meta.env.JWT_SECRET — it is resolved at build time`  
Line 38: `const jwtSecret = runtimeEnv.JWT_SECRET as string;`  
The dangerous fallback has already been removed on this branch. **ALREADY DONE** on current branch.

---

### PT-18 — [STAGING DONE] Wrangler Observability: alarm-worker enabled

**Blocks going live:** NO  
**Who does it:** CODE (merge `staging/audit-fixes-batch-a`)

**Current state (fresh evidence):**  
`staging/audit-fixes-batch-a:alarm-worker/wrangler.toml` (verified via `git show`): `[observability] enabled = true`. Main `wrangler.toml` still has `enabled = false` at top level but `[observability.logs] enabled = true`.

**What to do:**  
Merge `staging/audit-fixes-batch-a`.

---

## CODE FIXES — Still Open (Not Fixed in Staging)

---

### PT-19 — Newsletter: Turnstile Bot Challenge Missing

**Blocks going live:** NO (spam risk; not a blocker)  
**Who does it:** CODE

**Current state (fresh evidence):**  
`staging/audit-fixes-batch-a:src/pages/api/newsletter.ts` (read directly lines 1–60): **No Turnstile verification present**. The current newsletter endpoint has KV rate limiting but no Cloudflare Turnstile bot challenge. `01-cloudflare.md:CF-15` documents this as PARTIAL.

**What to do:**  
Add Turnstile challenge verification to `src/pages/api/newsletter.ts` (same pattern as `/api/register.ts`).

---

### PT-20 — Static Prerendering: Home Page and Marketing Routes

**Blocks going live:** NO (performance issue; Free plan Worker CPU risk during traffic spikes)  
**Who does it:** CODE

**Current state (fresh evidence):**  
`staging/audit-fixes-batch-a:src/pages/index.astro` (verified via `git show`): No `prerender = true` line in first 10 lines — home page remains SSR.  
`staging/audit-fixes-batch-a:src/pages/about/index.astro` and `src/pages/faq/index.astro` (verified): Both have `export const prerender = true`.  
`00-MASTER-REPORT.md §3 #6` documents this as a Worker CPU quota risk.

**Prerequisite:** Header parity between `middleware.ts` and `public/_headers` must be confirmed clean (CSP Report-Only mode validated) before prerendering additional routes. Report-Only is now deployed in staging (`_headers`). Merge staging, validate CSP Report-Only in DevTools/browser, then add `prerender = true` to `src/pages/index.astro`.

**What to do:**  
After merging staging and validating CSP Report-Only: Add `export const prerender = true;` to `src/pages/index.astro`.

---

### PT-21 — GTM: Missing Hostname Guard (Fires on Preview Deployments)

**Blocks going live:** YES (corrupts Google Ads conversion signals from staging/preview)  
**Who does it:** CODE

**Current state (fresh evidence):**  
`staging/audit-fixes-batch-a:src/layouts/Base.astro` (verified via `git show` search for "GTM", "hostname", "quranific.com"): **No hostname guard found**. GTM `GTM-5CJMMJ29` still fires unconditionally on all deployments including previews.

**What to do:**  
In `src/layouts/Base.astro`, wrap the GTM `<script>` bootstrap in a runtime client-side check:  
```js
if (window.location.hostname === 'quranific.com') { /* initialize GTM */ }
```

---

### PT-22 — CSP: Remove `unsafe-eval` from `public/_headers` (After Report-Only Validation)

**Blocks going live:** NO (CSP hardening; site functions with unsafe-eval present)  
**Who does it:** CODE (after owner validates Report-Only CSP in browser)

**Current state (fresh evidence):**  
`staging/audit-fixes-batch-a:public/_headers` (read directly): `Content-Security-Policy` header still contains `'unsafe-eval'` in `script-src`. The `Content-Security-Policy-Report-Only` without `unsafe-eval` is present alongside it. **Phase 1 (Report-Only) is deployed; Phase 2 (remove unsafe-eval from enforced CSP) is pending validation.**

**What to do:**  
1. Owner: Open DevTools → Console on production, look for CSP violation reports from the Report-Only policy for ~1 week.  
2. If no violations: Remove `'unsafe-eval'` from the enforced `Content-Security-Policy` line in `public/_headers`.

---

### PT-23 — `wrangler types` Generated Types Missing

**Blocks going live:** NO  
**Who does it:** CODE

**Current state (fresh evidence):**  
`01-cloudflare.md:CF-05` (last committed `b55388c` 2026-09-22): `worker-configuration.d.ts` is absent from repo; `src/env.d.ts` uses manually typed `Env` interface prone to drift.

**What to do:**  
Run `npx wrangler types` to auto-generate `worker-configuration.d.ts` and reference it from `src/env.d.ts`.

---

### PT-24 — DMARC: Advance from `p=none` Monitoring to `p=quarantine`

**Blocks going live:** NO (monitoring mode is safe; advancement improves email security posture)  
**Who does it:** OWNER (after reviewing DMARC aggregate reports)

**Current state (fresh evidence):**  
`01-cloudflare.md:CF-33` and `REVISION-LOG.md:S7` confirm live DNS TXT: `_dmarc.quranific.com` has `v=DMARC1; p=none`. This is the standard initial monitoring phase.

**What to do:**  
1. Create `compliance@quranific.com` mailbox.  
2. Add `rua=mailto:compliance@quranific.com` to DMARC record.  
3. After 2–4 weeks of monitoring reports with zero failures, advance to `p=quarantine`.

---

### PT-25 — Owner Actions: OA-6 Real-Edge CA-QC and GPC Validation

**Blocks going live:** YES (provisional — cookie consent bucket logic verified locally but not at real Cloudflare edge)  
**Who does it:** OWNER (Cloudflare Pages Preview URL)

**Current state:** Documented in `owner-actions.md:OA-6`. Local unit tests (7/7 PASS) and Playwright E2E (17/17 PASS) pass, but `cf.regionCode` in `wrangler pages dev` may not populate from real Cloudflare CF headers.

**What to do:**  
Deploy to a named Cloudflare Pages preview branch → test CA-QC consent with Canadian VPN (Quebec) → test GPC with Firefox `Sec-GPC: 1` header.

---

## UNVERIFIED — Requires Owner Access (Cannot Determine Status Locally)

---

### PT-26 — Core Web Vitals (LCP, INP) — Requires Google Search Console

**Blocks going live:** NO (cannot measure from CLI; must check Google Search Console → Core Web Vitals report)  
**Who does it:** OWNER

**Current state:** `00-MASTER-REPORT.md §9` and `REVISION-LOG.md:Q-08/Q-10` document PageSpeed API returned HTTP 429 during audit. Cannot verify LCP/INP from this environment.

---

### PT-27 — Partytown/GTM Conversion Attribution — Requires Live Tag Assistant

**Blocks going live:** NO (unverifiable without running ads)  
**Who does it:** OWNER

**Current state:** `REVISION-LOG.md:S23` notes Partytown executes GTM in a web worker and some ad platform conversion linkers may fail. Must verify via Google Tag Assistant / GA4 DebugView with live test conversions.

---

## CONTENT & DATA LAYER — Owner Input Required

These items from `owner-list.md` require content/decisions from the owner before a developer can build them. They are not yet started in code on any branch.

---

### PT-28 — Content: Real Blog Article (Item 4)

**Blocks going live:** NO (blog shows "Publishing Soon" with draft placeholder)  
**Who does it:** OWNER (writes content) + CODE (removes draft flag, image-free layout)

**Current state:** `src/content/blog/hello-world.md` has `draft: true`. No production article exists. Confirmed by reading `compare.md Item 4`.

---

### PT-29 — Data: Consolidate Testimonials to Single Source (Item 2)

**Blocks going live:** NO  
**Who does it:** OWNER (provides 3 real testimonials) + CODE (consolidation)

**Current state:** Three competing data sources exist (`src/constants/testimonials.ts`, `src/data/testimonials.ts`, inline in `src/pages/testimonials/index.astro`). Confirmed by `compare.md Item 2`.

---

### PT-30 — Data: Team/Teacher Data Layer (Item 3 & 11)

**Blocks going live:** NO (placeholder teachers currently shown)  
**Who does it:** OWNER (confirms final team details) + CODE (creates `src/data/team.ts`)

**Current state:** No `src/data/team.ts` exists. `src/pages/teachers/index.astro` uses hardcoded placeholder personas (Bilal A, Aisha R, Omar T). Confirmed by `compare.md Item 3`.

---

### PT-31 — UX/Code: Conversion Engine Fixes (Items 8, 10, 14, 15, 18, 19)

**Blocks going live:** YES (PT-19 compare.md Item 19 §5 — idempotency race condition and JWT fallback; JWT fallback is already fixed per PT-17. Race condition fix is in staging.)  
**Who does it:** CODE

**Current state:** Multiple UX/conversion issues documented in `compare.md` (Items 8, 10, 14, 15, 18, 19). These are detailed spec items:
- Calculator layout (30/70 desktop split, remove currency box, country in summary)
- Fee page currency bubble removal
- Portals role-aware routing
- Funnel step `dataLayer` tracking
- Signup step indicator sizing + mobile trust badge
- Complete form pre-selection + idempotency race condition (in staging)

Each requires its own focused PR. See `compare.md` for full specifications.

---

### PT-32 — UX/Code: WhatsApp Hardcoded Links (Items 37, 20)

**Blocks going live:** YES (leads routed to wrong number)  
**Who does it:** CODE

**Current state (fresh evidence):**  
`src/pages/[intent]/for-kids.astro` (read lines 1–50, 280–312): Imports `generateWhatsAppLink` from `../../lib/helpers` (line 25) and uses `SITE` (line 18). Lines 293 confirm GTM events fire on `a[href*="wa.me"]` clicks. However, `compare.md Item 37` and `00-MASTER-REPORT.md §4` document that **some intent pages hardcode `wa.me/447477382348`** (private UK number) bypassing `SITE.whatsappNumber` (`923112112122`). The `for-kids.astro` file on the current branch was partially cleaned but needs full audit of all 3 intent pages and `CourseHero.astro:92`, `cookies.astro:240`.

**What to do:**  
Run `Get-ChildItem -Recurse src | Get-Content | Select-String "447477"` to find all remaining hardcoded UK numbers and replace with `generateWhatsAppLink(SITE.whatsappNumber, ...)`.

---

### PT-33 — Code: Remaining `compare.md` Items (Brand, FAQ, Features, Mobile Menu, Legal, Intent SEO, Slug Routes)

**Blocks going live:** NO (quality/completeness issues)  
**Who does it:** CODE

**Current state:** Items 1, 5-7, 9, 12, 16, 17, 20 (SEO canonical/robots on intent pages), 21, 36, 44, 52 from `compare.md` are all `PARTIAL - NEEDS REFACTOR` or `MISSING - NEEDS CREATION`. These are the bulk of the remaining code quality work and include:
- FAQ data centralization and deduplication
- Features data layer creation (`src/data/features.ts`)
- GuaranteeCard component extraction
- Promo bar tracking events
- Mobile menu flash/transition bug
- Legal page email unification and WhatsApp link canonicalization
- Intent page `noindex`/canonical SEO contradiction
- Course calculator `defaultCourse` prop
- Schema.org Course `Offer` pricing properties
- AI-sounding content sweep

Each is a standalone PR. See `compare.md` for full specifications per item.

---

## FILE DISPOSITION REPORT

| File | Recommendation | Reason |
|------|---------------|--------|
| `README.md` | **PROTECTED — do not touch** | Deployment/project docs |
| `DEPLOYMENT.md` | **PROTECTED — do not touch** | Deployment docs |
| `compare.md` | **DELETE AFTER TASKS DONE** | Detailed specs for PT-31/32/33; still actively needed as implementation reference until all `compare.md` items are closed |
| `owner-actions.md` | **DELETE AFTER TASKS DONE** | OA-1 through OA-6 are superseded by PT-05/08/09/24/25; keep until owner has completed each action and checked it off |
| `owner-list.md` | **SAFE TO DELETE NOW** | 52-item master list fully superseded by this PENDING-TASKS.md; all open items represented here |
| `docs/audit/00-MASTER-REPORT.md` | **KEEP** | Authoritative forensic audit with empirical evidence; referenced by multiple PT items; not superseded |
| `docs/audit/01-cloudflare.md` | **KEEP** | Detailed row-level Cloudflare evidence; needed until all CF items are resolved |
| `docs/audit/02-astro.md` | **KEEP** | Astro framework audit detail; needed for future code PRs |
| `docs/audit/03-svelte.md` | **KEEP** | Svelte 5 correctness audit; 21 errors / 16 warnings documented; needed for future PRs |
| `docs/audit/04-adjacent.md` | **KEEP** | Adjacent tooling audit (DNS, email, CI, analytics); needed reference |
| `docs/audit/PROGRESS.md` | **SAFE TO DELETE NOW** | Audit process log; the audit is complete; no actionable content beyond what `00-MASTER-REPORT.md` captures |
| `docs/audit/REVISION-LOG.md` | **DELETE AFTER TASKS DONE** | Correction log valuable for understanding why previous draft claims were wrong; can be archived after all items close |
| `src/content/blog/hello-world.md` | **KEEP** | Placeholder blog post; needed as scaffold until real article (PT-28) is published |
| `.agents/context/context.md` | **UNSURE — ask owner** | Pattern suggests AI agent tooling context file; may be internal to the agent workflow; do not delete without owner confirmation |
| `.agents/skills/agent-skills.md` | **UNSURE — ask owner** | Same pattern; agent tooling; verify with owner before touching |
