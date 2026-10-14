# PENDING-TASKS — Quranific.com

**Live branch:** `staging/security-and-arch-fixes`  
**Base commit:** `af40495`  
**Audit date:** 2026-10-09  
**Architecture Context:** `staging/security-and-arch-fixes` contains the final security hardening, newsletter double opt-in, layout consistency, and documentation fixes preparing for production deployment.

---

## SECTION A: OPEN ITEMS & BACKLOG

### 1. Production Deployment Status

- **Status:** ✅ **DEPLOYED 2026-10-12, main 154c8ef, root version 845c4fe7-b81d-49ce-8b33-15dc5b1795ec, alarm version ba2677fe-86ea-4b04-a911-e0985e00b8c5**
- **Remaining Owner Items:**
  - `OA-07`: GTM Tag Consent Settings (`GTM-5CJMMJ29`)
  - `OA-11`: Configure DLQ `ALERT_WEBHOOK_URL` Secret on `alarm-worker`
  - `OA-19`: DMARC Policy Progression (`p=none` to `quarantine`)
  - `OA-36`: Impressum Registration Text
  - Owner signup test: verify customer mail from `support@quranific.com` and notification to personal Gmail `faisalkhan.llc.ltd@gmail.com`

---

### 2. Owner Action Items (Authoritative Runbook Pointer)

All owner-managed configuration, Cloudflare dashboard operations, registrar DNS records, secret provisioning procedures, and post-deployment live verifications are maintained exclusively in [`owner-actions.md`](./owner-actions.md).

To mechanically recount and audit the status matrix without manual counting or numbers from memory, run:

```powershell
# Parse Quick Reference Matrix in owner-actions.md to recount all items dynamically:
$lines = Get-Content owner-actions.md
$matrix = @()
$inMatrix = $false
foreach ($line in $lines) {
    if ($line -match '^## Quick Reference Status Matrix') { $inMatrix = $true; continue }
    if ($inMatrix -and $line -match '^---') { if ($matrix.Count -gt 0) { break } }
    if ($inMatrix -and $line -match '^\| \*\*OA-(\d+)\*\*') {
        $cols = $line.Split('|') | ForEach-Object { $_.Trim() }
        $matrix += [PSCustomObject]@{ ID = $cols[1]; Desc = $cols[2]; Urgency = $cols[3]; Status = $cols[4] }
    }
}
$dashboard = [ordered]@{
    "Tier 1 (Blocker)" = @{ Total = ($matrix | ? { $_.Urgency -match 'Tier 1' }).Count; Done = ($matrix | ? { $_.Urgency -match 'Tier 1' -and $_.Status -match 'Done' }).Count; Open = ($matrix | ? { $_.Urgency -match 'Tier 1' -and $_.Status -match 'Still Open' }).Count; Owner = ($matrix | ? { $_.Urgency -match 'Tier 1' -and $_.Status -notmatch 'Done|Still Open' }).Count }
    "Tier 2 (Do Soon)" = @{ Total = ($matrix | ? { $_.Urgency -match 'Tier 2' }).Count; Done = ($matrix | ? { $_.Urgency -match 'Tier 2' -and $_.Status -match 'Done' }).Count; Open = ($matrix | ? { $_.Urgency -match 'Tier 2' -and $_.Status -match 'Still Open' }).Count; Owner = ($matrix | ? { $_.Urgency -match 'Tier 2' -and $_.Status -notmatch 'Done|Still Open' }).Count }
    "Tier 3 (Later)" = @{ Total = ($matrix | ? { $_.Urgency -match 'Tier 3' }).Count; Done = ($matrix | ? { $_.Urgency -match 'Tier 3' -and $_.Status -match 'Done' }).Count; Open = ($matrix | ? { $_.Urgency -match 'Tier 3' -and $_.Status -match 'Still Open' }).Count; Owner = ($matrix | ? { $_.Urgency -match 'Tier 3' -and $_.Status -notmatch 'Done|Still Open' }).Count }
    "Obsolete / Merged" = @{ Total = ($matrix | ? { $_.Urgency -match 'N/A' }).Count; Merged = ($matrix | ? { $_.Urgency -match 'N/A' }).Count }
}
$dashboard.GetEnumerator() | ForEach-Object { "{0,-20} : Total={1} Done={2} Open={3} Owner={4}" -f $_.Key, $_.Value.Total, $_.Value.Done, $_.Value.Open, $_.Value.Owner }
$actionable = $matrix | ? { $_.Urgency -notmatch 'N/A' }
Write-Host ("Total Actionable : Total={0} Done={1} Open={2} Owner={3}" -f $actionable.Count, ($actionable | ? { $_.Status -match 'Done' }).Count, ($actionable | ? { $_.Status -match 'Still Open' }).Count, ($actionable | ? { $_.Status -notmatch 'Done|Still Open' }).Count)
```

---

### 3. Open Developer Items & Known Architectural Limitations

The following developer items and edge architectural trade-offs remain open on branch `staging/security-and-arch-fixes`:

- **Developer Task — Regenerate Cloudflare Ambient Types (`npx wrangler types`):**  
  Old legacy task `PT-23`. If Cloudflare binding definitions, KV namespaces, or environment variables in `wrangler.toml` diverge from ambient TypeScript definitions, run:

  ```powershell
  npx wrangler types
  ```

  _(Note: Run in development only when bindings change; do not commit broken type files without testing)._

- **Known Architectural Limitation 1 — Retry Queue May Skip Welcome Email on Subsequent Failures:**  
  In `src/pages/api/internal/retry-queue.ts`, if Resend successfully creates/verifies the contact but subsequently encounters an API error while dispatching the welcome email, a later retry by the queue will detect that the contact is already created and subscribed, which can skip re-dispatching the welcome email to avoid duplicate welcome dispatches.

- **Known Architectural Limitation 2 — Segment Attached on Initial Contact Creation Only:**  
  In `src/lib/resend-contacts.ts`, `segments: [audienceId]` is passed during the initial `POST /contacts` creation call. If the contact already exists in Resend, subsequent `PATCH /contacts/{id}` update calls do not re-attach or mutate segment membership.

- **Known Architectural Limitation 3 — Concurrent Submissions Race Window:**  
  The newsletter subscription endpoint enforces a 10-minute rate limit via Cloudflare KV key `NL_REQ:<email>`. In the event of two simultaneous HTTP requests submitted within the same millisecond window before KV commits the key, both requests can pass validation and send duplicate confirmation emails.

---

### 4. Honest Backlog (compare.md Items 1–52)

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
- **Item 23: Resend Edge Integration & Cloudflare Best Practices** — **PARTIAL**: proven by Section E checklist commands #19, #20, #21, #25, #34, #35 (`ensureSubscribed`, RFC 8058, double opt-in); unproven / not covered: apply-teacher waitUntil and Gmail fallbacks
- **Item 24: Full SEO Architecture** — UNVERIFIED `[SEO]` (JSON-LD Course and Organization schemas unverified)
- **Item 25: AI Optimization** — UNVERIFIED `[SEO]` (GEO / AI search citation readiness unverified)
- **Item 26: Internal Linking Mesh** — UNVERIFIED `[SEO]` (Cross-page contextual linking density unverified)
- **Item 27: Edge Security, Dynamic Consent & Alarm Worker Logic** — UNVERIFIED `[product]` (TimingSafeEqual verified on internal endpoints, but HSTS preload and site-wide CSP require post-deploy verification)
- **Item 28: Rocket Performance** — UNVERIFIED `[SEO]` (Lighthouse mobile 95+ score unverified on live edge)
- **Item 29: Edge Security, Dynamic Consent & Alarm Worker Logic** — UNVERIFIED `[product]` (Consent engine unit tested, but live regional banner firing unverified)
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
- **Item 47: Edge Security, Dynamic Consent & Alarm Worker Logic** — UNVERIFIED `[product]` (Headers configured in public/\_headers and middleware, but live production response headers unverified)
- **Item 48: Edge Logic Audit** — UNVERIFIED `[product]` (Geo-currency resolution edge logic unverified)
- **Item 49: Edge Security, Dynamic Consent & Alarm Worker Logic** — **PARTIAL**: proven by Section E checklist commands #11, #13 (`ALARM_ADMIN_TOKEN` timingSafeEqual auth and cron dispatch); unproven / not covered: live probe #28 shows workers.dev still returns HTTP 200 until the alarm worker is redeployed
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
- **Description:** Replaced low-contrast `text-amber-600` with `text-amber-700` in `src/pages/about/_components/AboutTeam.astro` to meet WCAG AA contrast requirements (verified via `git log -S` / `git show fec5347`).
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

| Legacy ID | Original Description                                                 | Final Status                      | Current Tracking Location                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :-------- | :------------------------------------------------------------------- | :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PT-01** | Root Worker Secrets (`INTERNAL_WORKER_SECRET`)                       | ❌ OPEN (Owner)                   | [`owner-actions.md#oa-01`](./owner-actions.md) (OA-01: Provision `INTERNAL_WORKER_SECRET` on Both Workers)                                                                                                                                                                                                                                                                                                                                 |
| **PT-02** | Alarm Worker Secrets (`INTERNAL_WORKER_SECRET`, `ALARM_ADMIN_TOKEN`) | ❌ OPEN (Owner)                   | [`owner-actions.md#oa-01`](./owner-actions.md), [`#oa-02`](./owner-actions.md) (OA-01: Provision `INTERNAL_WORKER_SECRET` on Both Workers; OA-02: Provision `ALARM_ADMIN_TOKEN` on Alarm Worker)                                                                                                                                                                                                                                           |
| **PT-03** | Server-Side Ad Secrets (`META_CAPI` purged, optional GA4)            | ➖ PURGED / OPTIONAL              | [`owner-actions.md#oa-03`](./owner-actions.md) (OA-03: Server-Side Ad Secrets (`META_CAPI` purged))                                                                                                                                                                                                                                                                                                                                        |
| **PT-04** | DLQ Alert Webhook (`ALERT_WEBHOOK_URL`) on Alarm Worker              | ❌ OPEN (Owner)                   | [`owner-actions.md#oa-11`](./owner-actions.md) (OA-11: Configure DLQ `ALERT_WEBHOOK_URL` Secret)                                                                                                                                                                                                                                                                                                                                           |
| **PT-05** | GTM Tag Additional Consent Configuration                             | ⚠️ OWNER CHECK                    | [`owner-actions.md#oa-07`](./owner-actions.md) (OA-07: GTM Tag Consent Settings (`GTM-5CJMMJ29`))                                                                                                                                                                                                                                                                                                                                          |
| **PT-06** | Universal SSL CAA DNS Records                                        | ⚠️ OWNER DECISION                 | [`owner-actions.md#oa-05`](./owner-actions.md) (OA-05: Universal SSL CAA DNS Records)                                                                                                                                                                                                                                                                                                                                                      |
| **PT-07** | Submit DNSSEC DS Record at Hostinger Registrar                       | ⚠️ OWNER CHECK                    | [`owner-actions.md#oa-12`](./owner-actions.md) (OA-12: Enable DNSSEC Signing & Submit DS Record)                                                                                                                                                                                                                                                                                                                                           |
| **PT-08** | Cloudflare Zone Dashboard Verifications (WAF, Bots, 2FA, Cache)      | ⚠️ OWNER CHECK                    | [`owner-actions.md#oa-08`](./owner-actions.md) (OA-08: Verify No Overriding Zone Cache Rules), [`#oa-13`](./owner-actions.md) (OA-13: Verify SSL/TLS Encryption Mode (Full Strict)), [`#oa-14`](./owner-actions.md) (OA-14: Verify Cloudflare WAF & Bot Fight Mode), [`#oa-16`](./owner-actions.md) (OA-16: Account 2FA & Secondary Emergency Admin), [`#oa-17`](./owner-actions.md) (OA-17: Scoped Cloudflare API Tokens (No Global Key)) |
| **PT-09** | Secondary Emergency Admin Member & 2FA Enforcement                   | ⚠️ OWNER CHECK                    | [`owner-actions.md#oa-16`](./owner-actions.md) (OA-16: Account 2FA & Secondary Emergency Admin)                                                                                                                                                                                                                                                                                                                                            |
| **PT-10** | Alarm-Worker Endpoint Auth & Secret Separation                       | ✅ DONE IN CODE                   | Section B: PT-01 / Section E: Command #13 (Deploy in [`owner-actions.md#oa-26`](./owner-actions.md): OA-26)                                                                                                                                                                                                                                                                                                                                |
| **PT-11** | npm Dependency Vulnerabilities (Astro RCE & Sharp Patched)           | ✅ DONE IN CODE                   | Section B: PT-02                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **PT-12** | CI: npm Audit Bypass Removed                                         | ✅ DONE IN CODE                   | Section B: PT-03                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **PT-13** | Security: HSTS `preload` + COOP Header Enforced                      | ✅ DONE IN CODE                   | Section B: PT-04                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **PT-14** | Meta CAPI: Graph API Dead Code Purged                                | ✅ DONE IN CODE                   | Section B: PT-05 / Section E: Command #2                                                                                                                                                                                                                                                                                                                                                                                                   |
| **PT-15** | Retry-Queue: Timing-Safe Auth Comparison & Secret Separation         | ✅ DONE IN CODE                   | Section B: PT-06 / Section E: Command #12                                                                                                                                                                                                                                                                                                                                                                                                  |
| **PT-16** | WCAG AA: Amber Text Contrast Fixed in AboutTeam.astro                | ✅ DONE IN CODE                   | Section B: PT-08 (`text-amber-600` to `text-amber-700`; verified via `git log -S` / `git show fec5347`)                                                                                                                                                                                                                                                                                                                                    |
| **PT-17** | success.astro: Dangerous `JWT_SECRET` Fallback Removed               | ✅ DONE IN CODE                   | Section B: PT-09                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **PT-18** | Wrangler Observability: alarm-worker Enabled                         | ✅ DONE IN CODE                   | Evidence: `alarm-worker/wrangler.toml:9` (`[observability]` enabled; deployed via [`owner-actions.md#oa-26`](./owner-actions.md): OA-26)                                                                                                                                                                                                                                                                                                   |
| **PT-19** | Newsletter Double Opt-In & Contacts Sync                             | ✅ DONE IN CODE                   | Section B: PT-10 / Section E: Commands #19, #20, #21, #25, #34, #35                                                                                                                                                                                                                                                                                                                                                                        |
| **PT-20** | Homepage Edge Cache Hit Rate Monitoring                              | ⚠️ MONITORING                     | [`owner-actions.md#oa-25`](./owner-actions.md) (OA-25: Homepage Edge Cache Hit Rate Monitoring)                                                                                                                                                                                                                                                                                                                                            |
| **PT-21** | GTM: Hostname Guard Enforced                                         | ✅ DONE IN CODE                   | Section E: Command #27                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **PT-22** | CSP: Removal of `unsafe-eval` from Enforced Policy                   | ⚠️ CODE DONE; VERIFY AFTER DEPLOY | Section B: PT-07 / [`owner-actions.md#oa-28`](./owner-actions.md) (OA-28: Post-Deploy CSP & GTM Console Verification)                                                                                                                                                                                                                                                                                                                      |
| **PT-23** | `wrangler types` Generated Types Missing                             | ❌ OPEN (Dev)                     | Section A.3: Developer Action (`npx wrangler types`)                                                                                                                                                                                                                                                                                                                                                                                       |
| **PT-24** | DMARC: Advance from `p=none` Monitoring to `p=quarantine`            | ⚠️ MONITORING                     | [`owner-actions.md#oa-19`](./owner-actions.md) (OA-19: DMARC Policy Progression (`p=none` to `quarantine`))                                                                                                                                                                                                                                                                                                                                |
| **PT-25** | Real-Edge CA-QC and GPC Validation                                   | ⚠️ POST-DEPLOY                    | [`owner-actions.md#oa-23`](./owner-actions.md) (OA-23: Cloudflare Worker Preview & Edge Validation)                                                                                                                                                                                                                                                                                                                                        |
| **PT-26** | Core Web Vitals (LCP, INP) via Google Search Console                 | ⚠️ POST-DEPLOY                    | [`owner-actions.md#oa-24`](./owner-actions.md) (OA-24: Core Web Vitals & Live Conversion Attribution)                                                                                                                                                                                                                                                                                                                                      |
| **PT-27** | Partytown/GTM Conversion Attribution via Live Tag Assistant          | ⚠️ POST-DEPLOY                    | [`owner-actions.md#oa-07`](./owner-actions.md) (OA-07), [`#oa-28`](./owner-actions.md) (OA-28)                                                                                                                                                                                                                                                                                                                                             |
| **PT-28** | Content: Real Blog Article Published                                 | ✅ DONE IN CODE                   | Evidence: `draft: false` in `src/content/blog/hello-world.md:8` / Section E: Commands #16, #17, #18                                                                                                                                                                                                                                                                                                                                        |
| **PT-29** | Data: Consolidated Testimonials Single Source of Truth               | ⚠️ UNVERIFIED [product]           | Section A.4: Backlog Item 2 (`src/data/testimonials.ts` populated; site-wide dynamic adoption unverified)                                                                                                                                                                                                                                                                                                                                  |
| **PT-30** | Data: Team & Teacher Data Layer                                      | ⚠️ UNVERIFIED [product]           | Section A.4: Backlog Items 3, 11 (`src/data/team.ts` populated; site-wide dynamic adoption unverified)                                                                                                                                                                                                                                                                                                                                     |
| **PT-31** | UX/Code: Conversion Funnel Engine Sub-Items                          | ⚠️ UNVERIFIED [product]           | Section A.4: Backlog Items 8, 10, 14, 15, 18, 19, 48                                                                                                                                                                                                                                                                                                                                                                                       |
| **PT-32** | CourseHero WhatsApp Coupling                                         | ✅ DONE IN CODE                   | Section E: Command #4 (`SITE.whatsappLink`)                                                                                                                                                                                                                                                                                                                                                                                                |
| **PT-33** | Additional Architectural & Consistency Items                         | ⚠️ UNVERIFIED [product]           | Section A.4: Backlog Items 1, 9, 12, 16, 17, 36, 42, 44, 52                                                                                                                                                                                                                                                                                                                                                                                |

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
# Baseline: Commit 578e604 returns 1 (src/pages/api/newsletter/unsubscribe.ts); main returns 0 (unproven on main)

# 2. Verify no Meta CAPI or graph.facebook references in source code
(git grep -nE "graph\.facebook|META_CAPI|fbq" -- src public).Count
# Expected: 0
# Baseline: Commit main returns 7

# 3. Verify no unsafe-eval in enforced CSP headers
(git grep -nF "unsafe-eval" -- public/_headers src/middleware.ts).Count
# Expected: 0
# Baseline: Commit main returns 1

# 4. Verify CourseHero uses centralized SITE.whatsappLink
git grep -nF "SITE.whatsappLink" -- src/pages/courses/_components/CourseHero.astro
# Expected: Match present (href={SITE.whatsappLink})

# 5. Verify no hardcoded 447477 UK phone numbers in src
(git grep -nF "447477" -- src).Count
# Expected: 0
# Baseline: Commit 0a67560 returns 6; main returns 0 (unproven on main)

# 6. Verify legacy SITE.email field is removed from constants
(git grep -nE "^\s*email\s*:" -- src/constants/site.ts).Count
# Expected: 0
# Baseline: Commit d25b8e4 returns 1

# 7. Verify approved correspondence mailboxes and personal Gmail exist in site constants
git grep -nE "support@|compliance@|contact@|faisalkhan\.llc\.ltd@gmail\.com" -- src/constants/site.ts
# Expected: Matches present for correspondence emails and SITE.emails.admin

# 8. Verify admin@quranific.com is intentionally not present in code
(git grep -nF "admin@quranific.com" -- src).Count
# Expected: 0
# Baseline: Commit 01fad8e~1 returns 7

# 9. Verify deploy:alarm npm script exists in package.json
git grep -nF '"deploy:alarm"' -- package.json
# Expected: Match present ("deploy:alarm": "wrangler deploy -c alarm-worker/wrangler.toml")

# 10. Verify deploy:prod npm script exists in package.json
git grep -nF '"deploy:prod"' -- package.json
# Expected: Match present ("deploy:prod": "node scripts/deploy-guard.mjs && npm run check && npm run build && wrangler deploy")

# 11. Verify dry-run deployment for alarm-worker succeeds
npx wrangler deploy -c alarm-worker/wrangler.toml --dry-run
# Expected: Total Upload reported, bindings list, exit code 0

# 12. Verify retry-queue timing-safe comparison exists
git grep -nF "timingSafeEqual" -- src/pages/api/internal/retry-queue.ts
# Expected: Match present (crypto.subtle.timingSafeEqual)

# 13. Verify alarm-worker timing-safe comparison exists
git grep -nF "timingSafeEqual" -- alarm-worker/src/index.ts
# Expected: Match present (timingSafeEqual)

# 14. Verify quranific-container utility in global.css drops xl:px-12
git grep -nF "@utility quranific-container" -- src/styles/global.css
# Expected: Match present (@utility quranific-container)

# 15. Verify container class definition is unique across src (exactly 1 match)
(git grep -nF "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" -- src).Count
# Expected: 1 (only the @apply definition in src/styles/global.css)

# 16. Verify blog slug filters tags < 3 characters
git grep -nF "t.length >= 3" -- "src/pages/blog/[slug].astro"
# Expected: Match present (t.length >= 3)

# 17. Verify blog slug matches whole words with word boundary regex
git grep -nF '\b${escapeRegex' -- 'src/pages/blog/[slug].astro'
# Expected: Match present (\b${escapeRegex)

# 18. Verify no stone- color classes in blog slug
(git grep -nF "stone-" -- "src/pages/blog/[slug].astro").Count
# Expected: 0
# Baseline: unproven (stone- color classes were never present in blog slug history)

# 19. Verify Turnstile verification function imported and called in newsletter API
git grep -nF "verifyTurnstile" -- src/pages/api/newsletter.ts
# Expected: Matches present (import verifyTurnstile and function call)

# 20. Verify double opt-in confirm endpoint exists and prerender = false
git grep -nF "prerender = false" -- src/pages/api/newsletter/confirm.ts
# Expected: Match present (export const prerender = false)

# 21. Verify unsubscribe endpoint exists and prerender = false
git grep -nF "prerender = false" -- src/pages/api/newsletter/unsubscribe.ts
# Expected: Match present (export const prerender = false)

# 22. Verify old KV key UNSUBSCRIBED:NEWSLETTER is no longer written
(git grep -nF "UNSUBSCRIBED:NEWSLETTER" -- src).Count
# Expected: 0
# Baseline: Commit d25b8e4 returns 1

# 23. Verify footer button text updates to 'Check your inbox'
git grep -nF "btn.innerText = 'Check your inbox';" -- src/components/global/Footer.astro
# Expected: Match present (btn.innerText = 'Check your inbox';)

# 24. Verify footer success message prompts inbox confirmation
git grep -nF "Check your inbox to confirm your subscription." -- src/components/global/Footer.astro
# Expected: Match present (Check your inbox to confirm your subscription.)

# 25. Verify RFC 8058 one-click headers in welcome email
git grep -nF "List-Unsubscribe-Post" -- src/lib/email.ts
# Expected: Match present (List-Unsubscribe-Post)

# 26. Verify generate_lead dataLayer event in CompleteForm
git grep -nF "generate_lead" -- src/pages/getting-started/_components/CompleteForm.svelte
# Expected: Match present (event: 'generate_lead')

# 27. Verify GTM production hostname guard in Base.astro
git grep -nF "window.location.hostname === 'quranific.com'" -- src/layouts/Base.astro
# Expected: Match present (window.location.hostname === 'quranific.com')

# 28. Verify alarm workers.dev domain probe (Before deploy: 200, After deploy: 404)
curl.exe -s -o NUL -w "%{http_code}" https://quranific-alarm.faisalkhan-llc-ltd.workers.dev
# Expected: 200 (current live state before deploy); 404 (after deploy with workers_dev=false)

# 29. Verify main site workers.dev domain is disabled
curl.exe -s -o NUL -w "%{http_code}" https://quranific.faisalkhan-llc-ltd.workers.dev
# Expected: 404

# 30. Verify DEPLOYMENT.md mentions INTERNAL_WORKER_SECRET
git grep -nF "INTERNAL_WORKER_SECRET" -- DEPLOYMENT.md
# Expected: Matches present (INTERNAL_WORKER_SECRET documented)

# 31. Verify stale phrase 'must match the main site' is absent from DEPLOYMENT.md
(git grep -nF "must match the main site" -- DEPLOYMENT.md).Count
# Expected: 0
# Baseline: Commit af40495 returns 1

# 32. Verify no openssl rand instructions remain in any markdown file
(git grep -nF "openssl rand" -- "*.md" ":(exclude)PENDING-TASKS.md").Count
# Expected: 0
# Baseline: unproven (openssl rand was never present in repo on af40495 or 795f773; git grep -nF returns 0)

# 33. Verify 'System Crash' wording is absent from newsletter.ts
(git grep -nF "System Crash" -- src/pages/api/newsletter.ts).Count
# Expected: 0
# Baseline: Commit af40495 returns 1

# 34. Verify NL_CONSENT is written before ensureSubscribed in confirm.ts
git grep -nF -e "NL_CONSENT:" -e "ensureSubscribed" -- src/pages/api/newsletter/confirm.ts
# Expected: Matches present (NL_CONSENT written before ensureSubscribed)

# 35. Verify ensureSubscribed function in resend-contacts.ts
git grep -nF "ensureSubscribed" -- src/lib/resend-contacts.ts
# Expected: Match present (export async function ensureSubscribed)

# 36. Verify RESEND_AUDIENCE_ID is documented in .env.example
git grep -nF "RESEND_AUDIENCE_ID" -- .env.example
# Expected: Match present (RESEND_AUDIENCE_ID=)

# 37. Verify ALARM_ADMIN_TOKEN is documented in DEPLOYMENT.md
git grep -nF "ALARM_ADMIN_TOKEN" -- DEPLOYMENT.md
# Expected: Matches present (ALARM_ADMIN_TOKEN documented in deployment runbook)

# 38. Run newsletter token unit tests
npx tsx tests/newsletter-token.test.ts
# Expected: 14 passing

# 39. Run consent engine unit tests
npx tsx tests/consent-unit.test.ts
# Expected: 19 passing

# 40. Production build verification (run once)
npm run build
# Expected: Astro check and production build complete with exit code 0 (run once in Phase 5)
```

---

## E2E Suite

- **Location:** `tests/e2e/` (isolated subproject with independent `package.json` and dependencies)
- **Commands:**
  - `cd tests/e2e; npm ci` — Install Playwright and test runner dependencies
  - `npm run test:prod` — Production Tier A core suite on Desktop Chrome
  - `npm run test:cross` — Cross-browser matrix (Mobile Chrome, Mobile Safari, Desktop Firefox)
  - `npm run test:local` — Builds production bundle and starts local edge Worker via Wrangler on port 8787 for Tier B tests
  - `npm run summarize <run.json>` — Attribute and summarize Playwright JSON output against classification rules
  - `npm run review-sheet` — Full site visual review sheet generation (`D:\Live Web\quranific-review`)

---

## Decisions Log

- **2026-10-14: Consent Architecture:** Consent mode is advanced everywhere (MODERATE and NONE buckets load GTM on page load with default or granted consent in dataLayer) EXCEPT for the STRICT bucket (EU/UK/CH/QC, unknown country fallback, and `Sec-GPC: 1`), where GTM is completely gated and will not make any network request until the user explicitly grants consent via Accept All or Customization (analytics/marketing). Returning visitors with stored accepted consent load GTM immediately after consent defaults.
