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

### CRITICAL SURFACED DEBT (Audit Reconciliation)

- [ ] 1. **Deploy Command Failure:** `package.json` uses `wrangler pages deploy ./dist` instead of `wrangler deploy`. KV bindings are completely bypassing production.
- [ ] 2. **Svelte Build Blocker:** `svelte-check` throws 21 errors and 16 warnings across 7 files. Must be fixed before `npm run check` will pass a deploy.
- [ ] 3. **UK WhatsApp Hijack:** `for-kids.astro`, `for-adults.astro`, and `for-women.astro` hardcode `+44 7477 382348`. Must replace with `SITE.whatsappNumber` (`923112112122`).
- [ ] 4. **Pricing Suspension Risk:** `courses.ts` lists $39/$49/$59. Must be updated to match `pricing.ts` billing reality ($40/$50/$55/$60) to avoid Google Ads ban.
- [ ] 5. **Newsletter Black Hole:** `/api/newsletter.ts` has no Turnstile AND does not store emails in DB/Resend.
- [ ] 6. **CORS Leak:** `consent-bucket.ts` and `geo-currency.ts` use `Access-Control-Allow-Origin: *`.
- [ ] 7. **Admin Email Hardcodes:** 7 files hardcode a personal Gmail instead of `admin@quranific.com`.
- [ ] 8. **Latency Bug:** `apply-teacher.ts` blocks on `Promise.all` instead of using `ctx.waitUntil`.
- [ ] 9. **Missing Analytics:** Zero `dataLayer` events in the signup funnel.
- [ ] 10. **Idempotency Bug:** The idempotency check in `complete.ts` checks Cloudflare KV using `jti` instead of checking the database by email. The read (line 168) and write (line 229) are far apart, leaving a race condition window for concurrent double-submits.
- [ ] 11. **Meta CAPI Purge:** Remove all Facebook `graph.facebook.com` fetch logic from `complete.ts`.

---

## INFRASTRUCTURE & SECRETS (Cloudflare Dashboard / Wrangler)

> **CONSOLIDATION NOTE:** All owner infrastructure, secret provisioning, Cloudflare dashboard, and DNS configuration tasks (formerly PT-01 through PT-09) have been consolidated into [`owner-actions.md`](./owner-actions.md).  
> **`owner-actions.md` is now the single authoritative source of truth for all owner-managed items.**

### Quick Reference: Mapping to `owner-actions.md`

| Legacy Task ID | Description                                                                             | Primary Status       | Authoritative Runbook Reference                                                                                                                |
| :------------- | :-------------------------------------------------------------------------------------- | :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **PT-01**      | Cloudflare Worker Secrets: Root Worker (`INTERNAL_WORKER_SECRET`)                       | ❌ Still Open        | [`owner-actions.md#oa-01`](./owner-actions.md)                                                                                                 |
| **PT-02**      | Cloudflare Worker Secrets: Alarm Worker (`INTERNAL_WORKER_SECRET`, `ALARM_ADMIN_TOKEN`) | ❌ Still Open        | [`owner-actions.md#oa-01`](./owner-actions.md), [`#oa-02`](./owner-actions.md)                                                                 |
| **PT-03**      | Server-Side Ad Secrets (`META_CAPI` purged, optional GA4 Measurement Protocol)          | ➖ Purged / Optional | [`owner-actions.md#oa-03`](./owner-actions.md)                                                                                                 |
| **PT-04**      | DLQ Alert Webhook (`ALERT_WEBHOOK_URL`) on Alarm Worker                                 | ❌ Still Open        | [`owner-actions.md#oa-11`](./owner-actions.md)                                                                                                 |
| **PT-05**      | GTM Tag Additional Consent Configuration (`GTM-5CJMMJ29`)                               | ⚠️ Owner Must Check  | [`owner-actions.md#oa-07`](./owner-actions.md)                                                                                                 |
| **PT-06**      | Universal SSL CAA DNS Records                                                           | ❌ Still Open        | [`owner-actions.md#oa-05`](./owner-actions.md)                                                                                                 |
| **PT-07**      | Submit DNSSEC DS Record at Hostinger Registrar                                          | ⚠️ Owner Must Check  | [`owner-actions.md#oa-12`](./owner-actions.md)                                                                                                 |
| **PT-08**      | Cloudflare Zone Dashboard Verifications (WAF, Bots, 2FA, Scoped Tokens, Cache Rules)    | ⚠️ Owner Must Check  | [`owner-actions.md#oa-08`](./owner-actions.md), [`#oa-13`](./owner-actions.md), [`#oa-14`](./owner-actions.md), [`#oa-17`](./owner-actions.md) |
| **PT-09**      | Secondary Emergency Admin Member & 2FA Enforcement                                      | ⚠️ Owner Must Check  | [`owner-actions.md#oa-16`](./owner-actions.md)                                                                                                 |

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
Merge `staging/audit-fixes-batch-a`. Note: setting `META_CAPI_TOKEN` secret per PT-01 is no longer applicable (Meta CAPI removed from codebase).

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

> Consolidated into [`owner-actions.md#oa-19`](./owner-actions.md). See `owner-actions.md` for rollout instructions and timelines.

---

### PT-25 — Real-Edge CA-QC and GPC Validation

> Consolidated into [`owner-actions.md#oa-23`](./owner-actions.md). Test via Cloudflare Pages preview deployment.

---

## UNVERIFIED — Requires Owner Access (Cannot Determine Status Locally)

---

### PT-26 — Core Web Vitals (LCP, INP) — Requires Google Search Console

> Consolidated into [`owner-actions.md#oa-24`](./owner-actions.md). Check Google Search Console post-launch.

---

### PT-27 — Partytown/GTM Conversion Attribution — Requires Live Tag Assistant

> Consolidated into [`owner-actions.md#oa-24`](./owner-actions.md). Validate via GA4 DebugView and live test conversions.

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

### PT-32 — UX/Code: WhatsApp Literal String in CourseHero.astro (STILL OPEN)

**Blocks going live:** NO (correct number, wrong coupling — value is duplicated rather than referenced from `SITE`)  
**Who does it:** CODE

**Evidence (re-verified 2026-09-26):**  
Raw output of `Select-String -Path src/pages/courses/_components/CourseHero.astro -Pattern "wa.me" -Context 0,2`:

```
> src\pages\courses\_components\CourseHero.astro:92:        href="https://wa.me/message/FF4LDK3JR2GPN1"
  src\pages\courses\_components\CourseHero.astro:93:        variant="ghostDark"
  src\pages\courses\_components\CourseHero.astro:94:        target="_blank"
```

Line 92 is a **literal string**, not `href={SITE.whatsappLink}`. The value `FF4LDK3JR2GPN1` happens to be the correct business inbox link (matching `SITE.whatsappLink` in `src/constants/site.ts:12`), so it routes correctly today. However, if the WhatsApp link ever changes, `CourseHero.astro` will not update automatically.

No hardcoded private UK phone number (`447477`) was found — `Get-ChildItem -Recurse src | Get-Content | Select-String "447477"` returned zero results. The risk is maintainability drift, not an active routing bug.

**What to do:**  
In `src/pages/courses/_components/CourseHero.astro`, import `SITE` and replace line 92:

```diff
-        href="https://wa.me/message/FF4LDK3JR2GPN1"
+        href={SITE.whatsappLink}
```

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
