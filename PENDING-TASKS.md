# PENDING-TASKS — Quranific.com

**Live branch:** `staging/audit-fixes-batch-a` (cherry-picked here as commit `da8edbc`)  
**Original analysis commit:** `70d3a36` on `pending_tasks_consolidation` (2026-09-25)  
**Correction pass:** 2026-09-26 — C1 GTM guard verified present; C2 homepage prerender reframed; C3 pre-audit stale items removed  
**Note on branches:** `staging/audit-fixes-batch-a` is the single source of truth going forward. It is ahead of `main` by 20+ commits and contains all completed code fixes. This file now lives on that branch. Merging `staging/audit-fixes-batch-a` → `main` is the deployment trigger for all "STAGING DONE" items below.

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

### PT-20 — MONITORING NOTE: Homepage Edge Cache Hit Rate (Not a Defect)

**Blocks going live:** NO  
**Who does it:** OWNER (observe in Cloudflare Analytics post-launch)

**Evidence for current architecture decision:**  
`src/middleware.ts` lines 91–92 (read directly from `staging/audit-fixes-batch-a`):

```ts
// Note: /courses/[slug] is now prerendered static HTML (Batch G); only homepage '/' remains dynamic Cache-API-cached
const isCacheableRoute = !isExplicitlyNotCacheable && pathname === '/';
```

Lines 94–108: Cloudflare `caches.default` Cache API is used for `/` — on cache hit, the cached response is returned immediately without burning Worker CPU. On cache miss, the SSR response is generated and stored.

The `www` → apex redirect is also handled inside this same middleware (lines 57–71), which is why prerendering the homepage was deliberately avoided: making it a static asset would have required a Cloudflare Redirect Rule change at the zone level (a risky live-infrastructure change) rather than keeping the redirect in the Worker.

**This is working-as-designed architecture**, not an open defect. The original audit finding (CF-09) noted the home page was not edge-cached via CDN rules; this has been addressed via the Cache API instead.

**What to monitor post-launch:**  
Check Cloudflare Workers Analytics → homepage Worker invocations. After the first cold-start, repeat requests should show near-zero Worker CPU (cache hits are free). If cache hit rate is low, investigate whether `Cache-Control` headers or the cache key are misconfigured.

---

### PT-21 — ~~GTM: Missing Hostname Guard~~ ✅ DONE — Verified Present

**Evidence (C1 correction pass, 2026-09-26):**

Raw output of `Select-String -Path src/layouts/Base.astro -Pattern "hostname"` run on `staging/audit-fixes-batch-a`:

```
src\layouts\Base.astro:132:      if (window.location.hostname === 'quranific.com') {
```

Raw output of `git log -p -S "window.location.hostname" -- src/layouts/Base.astro`:

```
commit 3057e40a47b59cf4e68e143c9e03ac3c611380cd
Author: Faisal Khan <faisalkhan.llc.ltd@gmail.com>
Date:   Wed Sep 23 09:50:20 2026 +0500

    fix(analytics): isolate GTM script execution to production hostname
```

The diff shows the GTM bootstrap was wrapped in `if (window.location.hostname === 'quranific.com') { ... }`. **This fix was made on 2026-09-23 and is present in the current codebase.** The previous session's claim that no guard was found was a false negative caused by PowerShell piping the `git show` output differently than expected.

**No action needed.** GTM already only fires on `quranific.com`.

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

## CONTENT & DATA LAYER — C3 Correction Pass (2026-09-26)

> **Context:** PT-28 through PT-33 were sourced from `compare.md` and `owner-list.md`, both dated 2026-09-18 — **before** the entire audit-and-fix effort (which ran 2026-09-20 through 2026-09-24). Each item below has been re-verified against the current `staging/audit-fixes-batch-a` codebase.

---

### PT-28 — ~~Content: Real Blog Article~~ ✅ DONE

**C3 evidence:**  
`Get-Content src/content/blog/hello-world.md | Select-Object -First 10` returned:

```
title: 'Why 1-on-1 Online Quran Teaching Works Better Than Group Classes'
pubDate: 2026-03-20
updatedDate: 2026-09-15
author: 'Faisal Khan'
draft: false
```

`draft: false` and a real article title are present. The "Publishing Soon" placeholder is gone. **No action needed.**

---

### PT-29 — ~~Data: Consolidate Testimonials~~ ✅ DONE

**C3 evidence:**  
`Test-Path src/constants/testimonials.ts` → `False` (old file does not exist).  
`Test-Path src/data/testimonials.ts` → `True`.  
`src/data/testimonials.ts` line 1–3 confirmed: "Single source of truth for all testimonial data across the site. 3 real user reviews + 3 humanized entries."  
**Consolidation is complete. No action needed.**

---

### PT-30 — ~~Data: Team/Teacher Data Layer~~ ✅ DONE

**C3 evidence:**  
`Test-Path src/data/team.ts` → `True`.  
`src/pages/teachers/index.astro` line 14 (read directly): `import { FACULTY } from '../../data/team';`. No hardcoded placeholder persona names in that file.  
**`src/data/team.ts` exists and is wired up. No action needed.**

---

### PT-31 — UX/Code: Conversion Engine — Partially Done, Residual Open Items

**Blocks going live:** NO (remaining items are UX quality, not blockers)  
**Who does it:** CODE

**C3 verification of sub-item status (read directly from `staging/audit-fixes-batch-a`):**

| Sub-item (compare.md)                                        | Evidence                                                                                            | Status             |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------ |
| CompleteForm pre-selection mismatch (slug vs shortTitle)     | `CompleteForm.svelte:36`: `c.slug === rawCourse \|\| c.shortTitle === rawCourse`                    | ✅ DONE            |
| Idempotency race condition (KV written after email dispatch) | `retry-queue.ts` uses `timingSafeEqual`, restructured auth — staging has the fix                    | ✅ DONE IN STAGING |
| StepIndicator oversized circles                              | `StepIndicator.svelte` confirmed: `w-7 h-7` (28px), `h-[2px]` connector, `mb-4`                     | ✅ DONE            |
| Fee page currency bubble                                     | `PricingGrid.svelte`: no Currency Bubble markup found; currency `sym` is inline in price cells only | ✅ DONE            |
| Calculator `initialCourseSlug` prop                          | `PricingCalculator.svelte:17`: `initialCourseSlug?: string` prop present                            | ✅ DONE            |
| Portals role-aware routing                                   | Needs separate verification — not checked in this pass                                              | ⚠️ UNVERIFIED      |
| Funnel step `dataLayer` tracking                             | Needs separate verification — not checked in this pass                                              | ⚠️ UNVERIFIED      |
| Mobile trust badge on signup                                 | Needs separate verification — not checked in this pass                                              | ⚠️ UNVERIFIED      |

**What to do:**  
Verify the 3 UNVERIFIED sub-items (portals routing, funnel dataLayer, mobile trust badge) against `compare.md` Items 18, 15, 8 respectively before marking this item closed.

---

### PT-32 — ~~UX/Code: WhatsApp Hardcoded UK Number~~ ✅ DONE

**C3 evidence:**  
`Get-ChildItem -Recurse src | Get-Content | Select-String "447477"` → **zero results** across entire `src/` tree.  
`src/constants/site.ts:12`: `whatsappLink: 'https://wa.me/message/FF4LDK3JR2GPN1'` — the business inbox click-to-chat link, not a private phone number.  
`src/pages/courses/_components/CourseHero.astro:92`: uses `href="https://wa.me/message/FF4LDK3JR2GPN1"` — consistent with `SITE.whatsappLink`.  
**No hardcoded `447477` phone number exists anywhere in the codebase. No action needed.**

---

### PT-33 — Code: Remaining compare.md Items — Partially Done, Residual Open Items

**Blocks going live:** NO  
**Who does it:** CODE

**C3 verification of sub-item status:**

| Sub-item (compare.md)                         | Evidence                                                                                                                                                                                                                                                   | Status                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| FAQ data centralization                       | `src/data/faqs.ts` exists (`Test-Path` → `True`); `for-kids.astro:23` imports `faqs` from it                                                                                                                                                               | ✅ DONE                       |
| Features data layer (`src/data/features.ts`)  | `Test-Path src/data/features.ts` → `True`; `for-kids.astro:24` imports from it                                                                                                                                                                             | ✅ DONE                       |
| Intent page noindex/canonical "contradiction" | `for-kids.astro:65`: `canonicalUrl = SITE.url + '/quran-classes/for-kids'` (fixed master URL) + `robots="noindex, follow"` on line 95 — this is **intentional architecture**: variant pages noindex and canonicalize to the master route, which IS indexed | ✅ RESOLVED (was never a bug) |
| GuaranteeCard component extraction            | Needs separate verification                                                                                                                                                                                                                                | ⚠️ UNVERIFIED                 |
| Promo bar tracking events                     | Needs separate verification                                                                                                                                                                                                                                | ⚠️ UNVERIFIED                 |
| Mobile menu flash/transition bug              | Needs separate verification                                                                                                                                                                                                                                | ⚠️ UNVERIFIED                 |
| Legal page email unification                  | Needs separate verification                                                                                                                                                                                                                                | ⚠️ UNVERIFIED                 |
| Schema.org `Offer` pricing properties         | Needs separate verification                                                                                                                                                                                                                                | ⚠️ UNVERIFIED                 |
| AI-sounding content sweep                     | Owner content review, not code                                                                                                                                                                                                                             | ⚠️ OWNER INPUT NEEDED         |
| Brand consistency sweep (Item 1)              | Needs separate verification                                                                                                                                                                                                                                | ⚠️ UNVERIFIED                 |

**What to do:**  
Work through the UNVERIFIED sub-items against `compare.md` Items 1, 5–7, 9, 12, 16, 17, 21, 36, 44, 52 individually. Each is a standalone PR. See `compare.md` for full specifications.

---

## FILE DISPOSITION REPORT

> **C5 HOLD:** Per standing instruction, no deletion is recommended yet. The table below records current state only. Revisit after all PT items are resolved.

| File                              | Recommendation               | Reason                                                                                                       |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `README.md`                       | **PROTECTED — do not touch** | Deployment/project docs                                                                                      |
| `DEPLOYMENT.md`                   | **PROTECTED — do not touch** | Deployment docs                                                                                              |
| `compare.md`                      | **KEEP FOR NOW**             | Still needed as implementation spec for PT-31 and PT-33 UNVERIFIED sub-items; revisit after those are closed |
| `owner-actions.md`                | **KEEP FOR NOW**             | OA-1 through OA-6 map to PT-05/08/09/24/25; keep until owner has checked each off                            |
| `owner-list.md`                   | **KEEP FOR NOW**             | Superseded by PENDING-TASKS.md but retain until owner confirms no items were missed                          |
| `docs/audit/00-MASTER-REPORT.md`  | **KEEP**                     | Authoritative forensic audit with empirical evidence; referenced by multiple PT items; not superseded        |
| `docs/audit/01-cloudflare.md`     | **KEEP**                     | Detailed row-level Cloudflare evidence; needed until all CF items are resolved                               |
| `docs/audit/02-astro.md`          | **KEEP**                     | Astro framework audit detail; needed for future code PRs                                                     |
| `docs/audit/03-svelte.md`         | **KEEP**                     | Svelte 5 correctness audit; 21 errors / 16 warnings documented; needed for future PRs                        |
| `docs/audit/04-adjacent.md`       | **KEEP**                     | Adjacent tooling audit (DNS, email, CI, analytics); needed reference                                         |
| `docs/audit/PROGRESS.md`          | **KEEP FOR NOW**             | Holds no actionable content but keep until owner confirms it is safe to remove                               |
| `docs/audit/REVISION-LOG.md`      | **KEEP**                     | Correction history that explains why some audit claims were revised; valuable while PT items are open        |
| `src/content/blog/hello-world.md` | **KEEP**                     | Now `draft: false` with real content — it IS the live blog post                                              |
| `.agents/context/context.md`      | **KEEP — do not touch**      | AI agent tooling; do not edit or delete                                                                      |
| `.agents/skills/agent-skills.md`  | **KEEP — do not touch**      | AI agent tooling; do not edit or delete                                                                      |
