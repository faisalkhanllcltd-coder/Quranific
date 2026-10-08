# PENDING-TASKS — Quranific.com

**Live branch:** `staging/security-and-arch-fixes`  
**Upstream state:** `staging/audit-fixes-batch-a` was merged into `main` (commit `6932956`).  
**Audit date:** 2026-10-08  
**Architecture Context:** `staging/security-and-arch-fixes` contains the final security, newsletter double opt-in, layout consistency, and documentation fixes preparing for production deployment.

---

## Legend

- **Blocks going live:** YES = do not deploy to production until resolved | NO = safe to go live without
- **Who does it:** CODE = developer code commit | OWNER = owner in Cloudflare dashboard / DNS registrar / third-party platform (documented in `owner-actions.md`)

---

## Quick Reference Mapping to `owner-actions.md`

All owner-only infrastructure, secrets, DNS, and compliance tasks are centralized in [`owner-actions.md`](./owner-actions.md):

| Legacy Task ID | Description                                                                             |    Primary Status    | Authoritative Reference                                                                                                                        |
| :------------- | :-------------------------------------------------------------------------------------- | :------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **PT-01**      | Cloudflare Worker Secrets: Root Worker (`INTERNAL_WORKER_SECRET`)                       |    ❌ Still Open     | [`owner-actions.md#oa-01`](./owner-actions.md)                                                                                                 |
| **PT-02**      | Cloudflare Worker Secrets: Alarm Worker (`INTERNAL_WORKER_SECRET`, `ALARM_ADMIN_TOKEN`) |    ❌ Still Open     | [`owner-actions.md#oa-01`](./owner-actions.md), [`#oa-02`](./owner-actions.md)                                                                 |
| **PT-03**      | Server-Side Ad Secrets (`META_CAPI` purged, optional GA4)                               | ➖ Purged / Obsolete | [`owner-actions.md#oa-03`](./owner-actions.md)                                                                                                 |
| **PT-04**      | DLQ Alert Webhook (`ALERT_WEBHOOK_URL`) on Alarm Worker                                 |    ❌ Still Open     | [`owner-actions.md#oa-11`](./owner-actions.md)                                                                                                 |
| **PT-05**      | GTM Tag Additional Consent Configuration (`GTM-5CJMMJ29`)                               | ⚠️ Owner Must Check  | [`owner-actions.md#oa-07`](./owner-actions.md)                                                                                                 |
| **PT-06**      | Universal SSL CAA DNS Records                                                           |  ⚠️ Owner to Decide  | [`owner-actions.md#oa-05`](./owner-actions.md)                                                                                                 |
| **PT-07**      | Submit DNSSEC DS Record at Hostinger Registrar                                          | ⚠️ Owner Must Check  | [`owner-actions.md#oa-12`](./owner-actions.md)                                                                                                 |
| **PT-08**      | Cloudflare Zone Dashboard Verifications (WAF, Bots, 2FA, Scoped Tokens, Cache Rules)    | ⚠️ Owner Must Check  | [`owner-actions.md#oa-08`](./owner-actions.md), [`#oa-13`](./owner-actions.md), [`#oa-14`](./owner-actions.md), [`#oa-17`](./owner-actions.md) |
| **PT-09**      | Secondary Emergency Admin Member & 2FA Enforcement                                      | ⚠️ Owner Must Check  | [`owner-actions.md#oa-16`](./owner-actions.md)                                                                                                 |
| **PT-24**      | DMARC Policy Progression (`p=none` to `quarantine`)                                     |    ⚠️ Monitoring     | [`owner-actions.md#oa-19`](./owner-actions.md)                                                                                                 |
| **PT-25**      | Real-Edge CA-QC and GPC Validation                                                      | ⚠️ Owner Must Check  | [`owner-actions.md#oa-23`](./owner-actions.md)                                                                                                 |
| **PT-26**      | Core Web Vitals (LCP, INP) via Google Search Console                                    | ⚠️ Owner Must Check  | [`owner-actions.md#oa-24`](./owner-actions.md)                                                                                                 |
| **PT-27**      | Conversion Attribution via GA4 DebugView / Tag Assistant                                | ⚠️ Owner Must Check  | [`owner-actions.md#oa-24`](./owner-actions.md)                                                                                                 |

---

## CODE TASKS AUDIT & VERIFICATION

---

### PT-10 — Security: Alarm-Worker Unauthenticated HTTP Endpoints + Secret Separation

- **Status:** ✅ **DONE**
- **Evidence:** `alarm-worker/src/index.ts` enforces `ALARM_ADMIN_TOKEN` timing-safe comparison on HTTP handlers (`/force-run`) and uses separate `INTERNAL_WORKER_SECRET` for cron dispatch. Fails closed (returns 401) when secrets are unset.

---

### PT-11 — Security: npm Dependency Vulnerabilities (Astro RCE & Sharp)

- **Status:** ✅ **DONE**
- **Evidence:** `package.json` declares `"astro": "^7.2.10"` (patches GHSA-26w7-cxv4-gfx2 and GHSA-376h-93r7-7g6f) and `"sharp": "^0.35.4"`.

---

### PT-12 — CI: npm Audit Bypass Removed

- **Status:** ✅ **DONE**
- **Evidence:** `.github/workflows/ci.yml` runs `npm audit --omit=dev --audit-level=critical` without `|| true`.

---

### PT-13 — Security: HSTS `preload` + COOP Header Enforced

- **Status:** ✅ **DONE**
- **Evidence:** `public/_headers` and `src/middleware.ts` set:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `Cross-Origin-Opener-Policy: same-origin-allow-popups`

---

### PT-14 — Meta CAPI: Graph API Dead Code Purged

- **Status:** ✅ **DONE**
- **Evidence:** Grep across `src/` and `public/` for `graph.facebook.com`, `META_CAPI`, and `fbq` returns zero results. Dead code completely eliminated.

---

### PT-15 — Retry-Queue: Timing-Safe Auth Comparison & Secret Separation

- **Status:** ✅ **DONE**
- **Evidence:** `src/pages/api/internal/retry-queue.ts` uses Web Crypto `timingSafeEqual()` comparing against `INTERNAL_WORKER_SECRET`. Fails closed if unset.

---

### PT-16 — WCAG AA: Amber Text Contrast Fixed in AboutTeam.astro

- **Status:** ✅ **DONE**
- **Evidence:** `src/pages/about/_components/AboutTeam.astro` uses `text-amber-700` (exceeds WCAG AA 4.5:1 ratio).

---

### PT-17 — success.astro: Dangerous `import.meta.env.JWT_SECRET` Fallback Removed

- **Status:** ✅ **DONE**
- **Evidence:** `src/pages/getting-started/success.astro` resolves `runtimeEnv.JWT_SECRET` at request time. Build-time evaluation eliminated.

---

### PT-18 — Wrangler Observability: alarm-worker Enabled

- **Status:** ✅ **DONE**
- **Evidence:** `alarm-worker/wrangler.toml` declares `[observability] enabled = true`.

---

### PT-19 — Newsletter: Double Opt-In, Turnstile Bot Challenge & Resend Contacts API

- **Status:** ✅ **DONE**
- **Evidence:**
  - `src/pages/api/newsletter.ts` verifies Cloudflare Turnstile token via `src/lib/turnstile.ts`.
  - Implements per-IP and per-email rate limiting (`NL_REQ:<email>`, 600s TTL).
  - Generates HMAC-SHA256 derived signed confirmation links (`src/lib/newsletter-token.ts`).
  - `src/pages/api/newsletter/confirm.ts` handles confirmation, writes KV consent record (`NL_CONSENT:<email>`), updates global Resend contact (`src/lib/resend-contacts.ts`), and triggers welcome email with RFC 8058 one-click headers and admin notification.
  - `src/pages/api/newsletter/unsubscribe.ts` handles SSR unsubscribe with signed token validation and one-click support.

---

### PT-20 — Homepage Edge Cache Hit Rate Monitoring

- **Status:** ⚠️ **MONITORING (Architecture Verified)**
- **Evidence:** `src/middleware.ts` routes apex `/` requests through Cloudflare `caches.default` Cache API while preserving Worker apex-to-www canonical redirects.

---

### PT-21 — GTM: Hostname Guard Enforced

- **Status:** ✅ **DONE**
- **Evidence:** `src/layouts/Base.astro` wraps GTM initialization inside `if (window.location.hostname === 'quranific.com') { ... }`.

---

### PT-22 — CSP: Removal of `unsafe-eval` from Enforced Policy

- **Status:** ✅ **DONE IN CODE (Pending Post-Deploy Verification)**
- **Evidence:**
  - `public/_headers` enforced `Content-Security-Policy` contains NO `'unsafe-eval'`.
  - `src/middleware.ts` enforced `Content-Security-Policy` contains NO `'unsafe-eval'`.
  - Owner verification on live production tracked under `owner-actions.md#oa-28`.

---

### PT-23 — `wrangler types` Generated Types Missing

- **Status:** ❌ **STILL OPEN**
- **Evidence:** `worker-configuration.d.ts` is not present in root directory. Running `npx wrangler types` will auto-generate Worker runtime environment typings.

---

### PT-28 — Content: Real Blog Article Published

- **Status:** ✅ **DONE**
- **Evidence:** `src/content/blog/hello-world.md` has `draft: false` and full editorial content.

---

### PT-29 — Data: Consolidated Testimonials Single Source of Truth

- **Status:** ✅ **DONE**
- **Evidence:** `src/data/testimonials.ts` is the single source of truth for all testimonials.

---

### PT-30 — Data: Team & Teacher Data Layer

- **Status:** ✅ **DONE**
- **Evidence:** `src/data/team.ts` defines verified faculty data; imported by `src/pages/teachers/index.astro`.

---

### PT-31 — UX/Code: Conversion Funnel Engine Sub-Items

- **Status:** ✅ **DONE (All Sub-Items Verified)**
- **Sub-Item Verification:**
  - _CompleteForm pre-selection:_ `src/pages/getting-started/_components/CompleteForm.svelte:36` checks `c.slug === rawCourse || c.shortTitle === rawCourse` ✅
  - _Idempotency check:_ `src/pages/api/getting-started/complete.ts` checks idempotency before email dispatches ✅
  - _StepIndicator circles:_ `StepIndicator.svelte` uses compact `w-7 h-7` indicators ✅
  - _Tuition fee currency bubble:_ `PricingGrid.svelte` uses inline symbol formatting ✅
  - _Calculator `initialCourseSlug`:_ `PricingCalculator.svelte:17` accepts initial slug prop ✅
  - _Portals role-aware routing:_ `src/pages/portals/_components/PortalsGrid.astro` routes students to `login?role=student` and teachers to `login?role=teacher` ✅
  - _Funnel dataLayer events:_ `SignupForm.svelte:156, 221`, `CompleteForm.svelte:63, 143, 153` (`generate_lead`), and `success.astro:81` push analytics events ✅
  - _Mobile trust badges:_ `SignupForm.svelte:385-420` renders trust items ("100% Free Trial Class", "Male & Female Tutors", "No Payment Info Required") ✅

---

### PT-32 — CourseHero WhatsApp Coupling

- **Status:** ✅ **DONE**
- **Evidence:** `src/pages/courses/_components/CourseHero.astro:93` uses `href={SITE.whatsappLink}`. Hardcoded URL removed.

---

### PT-33 — Additional Architectural & Consistency Items

- **Status:** ✅ **DONE**
- **Sub-Item Verification:**
  - _GuaranteeCard extraction:_ `src/components/blocks/GuaranteeCard.astro` exists and is reused ✅
  - _Legal page email unification:_ All legal pages (`cookies.astro`, `impressum.astro`, `privacy.astro`, `refund.astro`, `terms.astro`) use approved emails (`support@`, `compliance@`, `contact@`) ✅
  - _Schema Offer properties:_ `src/pages/tuition-fee/index.astro:31` declares `priceCurrency: 'USD'` and `lowPrice: '40.00'` ✅
  - _MobileMenu transition:_ `src/components/global/MobileMenu.astro` uses flash-free CSS path morphs without layout shifts ✅
  - _Container consistency:_ `src/styles/global.css` unified `quranific-container` to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` across all 15 previously hardcoded layouts ✅
  - _Blog related-courses polish:_ `src/pages/blog/[slug].astro` ignores tags < 3 chars and matches whole words ✅

---

## Verification Checklist (Mechanical PowerShell Audit)

The following 32 automated commands verify the operational and architectural state of the repository:

```powershell
# 1. Verify no placeholder-32b secrets anywhere in repository
(git grep -nIi "placeholder-32b" -- ":(exclude)PENDING-TASKS.md").Count
# Expected: 0

# 2. Verify no Meta CAPI or graph.facebook references in source code
(git grep -nIiE "graph\.facebook|META_CAPI|fbq" -- src public).Count
# Expected: 0

# 3. Verify no unsafe-eval in enforced CSP headers
(git grep -nIi "unsafe-eval" -- public/_headers src/middleware.ts).Count
# Expected: 0

# 4. Verify CourseHero uses centralized SITE.whatsappLink
git grep -nIi "SITE\.whatsappLink" -- src/pages/courses/_components/CourseHero.astro
# Expected: Match on line 93

# 5. Verify no hardcoded 447477 UK phone numbers in src
(git grep -nIi "447477" -- src).Count
# Expected: 0

# 6. Verify legacy SITE.email field is removed from constants
git grep -nIiE "^\s*email\s*:" -- src/constants/site.ts
# Expected: 0 matches (exit code 1)

# 7. Verify all five approved email addresses exist in site constants
git grep -nIiE "support@|admin@|compliance@|contact@|faisalkhan\.llc\.ltd@gmail\.com" -- src/constants/site.ts
# Expected: Matches for all 5 mailboxes

# 8. Verify deploy:alarm npm script exists in package.json
git grep -nIi '"deploy:alarm"' -- package.json
# Expected: Match with "wrangler deploy -c alarm-worker/wrangler.toml"

# 9. Verify dry-run deployment for alarm-worker succeeds
npx wrangler deploy -c alarm-worker/wrangler.toml --dry-run
# Expected: Exit code 0, Total Upload reported, bindings list

# 10. Verify dry-run deployment for root worker succeeds
npx wrangler deploy --dry-run
# Expected: Exit code 0, Total Upload reported, KV SESSION binding

# 11. Verify newsletter token test executes and passes
npx tsx tests/newsletter-token.test.ts
# Expected: 14 passing assertions, exit code 0

# 12. Verify consent unit test executes and passes
npx tsx tests/consent-unit.test.ts
# Expected: 19 passing assertions, exit code 0

# 13. Verify retry-queue timing-safe comparison exists
git grep -nIi "timingSafeEqual" -- src/pages/api/internal/retry-queue.ts
# Expected: Match present

# 14. Verify retry-queue rejects when INTERNAL_WORKER_SECRET is unset
git grep -nIi "if\s*\(!authorized\)" -- src/pages/api/internal/retry-queue.ts
# Expected: Returns 401 Unauthorized

# 15. Verify alarm-worker timing-safe comparison exists
git grep -nIi "timingSafeEqual" -- alarm-worker/src/index.ts
# Expected: Match present

# 16. Verify quranific-container utility in global.css drops xl:px-12
git grep -nIi -C 1 "@utility quranific-container" -- src/styles/global.css
# Expected: @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;

# 17. Verify no hardcoded 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' remains
(git grep -nIi "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" -- src).Count
# Expected: 0

# 18. Verify blog slug filters tags < 3 characters
git grep -nIi "t\.length >= 3" -- "src/pages/blog/[slug].astro"
# Expected: Match present

# 19. Verify blog slug matches whole words with word boundary regex
git grep -nIi "\\\\b\${escapeRegex" -- "src/pages/blog/[slug].astro"
# Expected: Match present

# 20. Verify no stone- color classes in blog slug
(git grep -nIi "stone-" -- "src/pages/blog/[slug].astro").Count
# Expected: 0

# 21. Verify Turnstile validation imported in newsletter API
git grep -nIi "validateTurnstile" -- src/pages/api/newsletter.ts
# Expected: Match present

# 22. Verify double opt-in confirm endpoint exists and prerender = false
git grep -nIi "prerender = false" -- src/pages/api/newsletter/confirm.ts
# Expected: Match present

# 23. Verify unsubscribe endpoint exists and prerender = false
git grep -nIi "prerender = false" -- src/pages/api/newsletter/unsubscribe.ts
# Expected: Match present

# 24. Verify old KV key UNSUBSCRIBED:NEWSLETTER is no longer written
(git grep -nIi "UNSUBSCRIBED:NEWSLETTER" -- src).Count
# Expected: 0

# 25. Verify footer visible success text matches double opt-in instruction
git grep -nIi "Check your inbox to confirm your subscription\." -- src/components/global/Footer.astro
# Expected: Match present

# 26. Verify RFC 8058 one-click headers in welcome email
git grep -nIi "List-Unsubscribe-Post" -- src/lib/email.ts
# Expected: Match present with 'List-Unsubscribe=One-Click'

# 27. Verify generate_lead dataLayer event in CompleteForm
git grep -nIi "generate_lead" -- src/pages/getting-started/_components/CompleteForm.svelte
# Expected: Match present

# 28. Verify GTM production hostname guard in Base.astro
git grep -nIi "window\.location\.hostname === 'quranific\.com'" -- src/layouts/Base.astro
# Expected: Match present

# 29. Verify apex DoH SPF record for quranific.com
(curl.exe -s "https://dns.google/resolve?name=quranific.com&type=TXT" | ConvertFrom-Json).Answer.data
# Expected: "v=spf1 include:_spf.mx.cloudflare.net ~all"

# 30. Verify subdomain DoH SPF record for send.quranific.com
(curl.exe -s "https://dns.google/resolve?name=send.quranific.com&type=TXT" | ConvertFrom-Json).Answer.data
# Expected: "v=spf1 include:amazonses.com ~all"

# 31. Verify root worker workers.dev is disabled (HTTP 404)
(curl.exe -sI "https://quranific.faisalkhan-llc-ltd.workers.dev")[0]
# Expected: HTTP/1.1 404 Not Found

# 32. Verify alarm-worker workers.dev status
(curl.exe -sI "https://quranific-alarm.faisalkhan-llc-ltd.workers.dev")[0]
# Expected: HTTP/1.1 200 OK (pending redeploy with workers_dev = false)
```

---

## FILE DISPOSITION REPORT

> **C5 HOLD:** Per standing instruction, no file deletion is performed. The table below records current status and is maintained on hold.

| File                              |      Status      | Rationale                                                                       |
| :-------------------------------- | :--------------: | :------------------------------------------------------------------------------ |
| `README.md`                       |  **PROTECTED**   | Updated in Phase 3; documents personal Gmail as internal notification recipient |
| `DEPLOYMENT.md`                   |  **PROTECTED**   | Updated in Phase 3; documents personal Gmail and correct sender addresses       |
| `owner-actions.md`                |  **PROTECTED**   | Authoritative single source of truth for owner-managed tasks                    |
| `compare.md`                      | **KEEP ON HOLD** | Retained for reference                                                          |
| `owner-list.md`                   | **KEEP ON HOLD** | Retained for reference                                                          |
| `docs/audit/*`                    | **KEEP ON HOLD** | Retained forensic audit reference files                                         |
| `src/content/blog/hello-world.md` |  **PROTECTED**   | Live published blog post (`draft: false`)                                       |
| `.agents/*`                       |  **PROTECTED**   | AI agent tooling configuration; untouched                                       |
