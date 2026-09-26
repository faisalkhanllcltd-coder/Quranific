# Closeout Reconciliation Report: Quranific.com

**Branch:** `staging/audit-fixes-batch-a`  
**Base Commit / Audited Commit:** `0214e44cf2531d23d8b96d1aedc44460b41e19ed`  
**Current HEAD Commit:** `e0764005471090734361878d1b01b9d05798f2cb`  
**Working Tree Status:** Clean (`git status --porcelain` empty)  
**Date:** 2026-09-24  
**Auditor:** Antigravity AI (Fix Batch L — Final Ground-Truth Reconciliation)

---

## 1. Executive Summary & Reconciliation Ledger

Across Batches A through K, the staging branch (`staging/audit-fixes-batch-a`) addressed the critical architectural, security, performance, SEO, and accessibility gaps uncovered during the comprehensive September 2026 audit (`docs/audit/`).

### Overall Audit Status Breakdown

- **Total Original Audit Findings:** 185 rows across 4 domain files (`01-cloudflare.md`, `02-astro.md`, `03-svelte.md`, `04-adjacent.md`)
- **Original ✅ DONE Findings:** 113 rows
- **Original Non-DONE Findings Extracted (L1):** 72 rows
  - ⚠️ PARTIAL: 40
  - ❌ MISSING: 12
  - ❓ CANNOT VERIFY: 11
  - ➖ N/A: 9
- **Current Ground-Truth Re-Verification (L2):**
  - **RESOLVED in Code (Batches A–K):** 16 items
  - **STILL OPEN, FIXABLE IN CODE:** 28 items
  - **STILL OPEN, OWNER ACTION ONLY:** 19 items
  - **SUPERSEDED / CONFIRMED N/A:** 9 items
  - **Total Reconciled:** 72 items (100% accounted for)

---

## 2. Complete L1 / L2 Master Reconciliation Table

Every row below represents an item from the original audit that was NOT marked `✅ DONE`. Each item was re-verified against the active codebase on `staging/audit-fixes-batch-a` at commit `e076400`.

| ID        | Original File      | Practice / Finding                                                     | Original Status  | Current Status                                  | Current Ground-Truth Evidence / Proof & Notes                                                                                                                                                                                              |
| :-------- | :----------------- | :--------------------------------------------------------------------- | :--------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CF-04** | `01-cloudflare.md` | Secrets vs Vars: sensitive values (`META_PIXEL_ID`, `META_CAPI_TOKEN`) | ⚠️ PARTIAL       | **STILL OPEN, OWNER ACTION ONLY**               | Code safely skips when missing (`complete.ts:248-285`). Requires site owner to run `wrangler secret put META_CAPI_TOKEN` and set `META_PIXEL_ID`.                                                                                          |
| **CF-05** | `01-cloudflare.md` | `wrangler types` generated (`worker-configuration.d.ts`)               | ❌ MISSING       | **STILL OPEN, FIXABLE IN CODE**                 | `worker-configuration.d.ts` not present in repository. Can be generated directly via `npx wrangler types` and referenced in `src/env.d.ts`.                                                                                                |
| **CF-06** | `01-cloudflare.md` | KV consistency model awareness (idempotency & rate limiting)           | ⚠️ PARTIAL       | **STILL OPEN, OWNER ACTION ONLY**               | KV used for idempotency (`complete.ts:166-176`) and rate limiting. Primary defense requires Cloudflare edge WAF Rate Limiting rules.                                                                                                       |
| **CF-07** | `01-cloudflare.md` | Observability / logs enabled (`wrangler.toml`)                         | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `wrangler.toml:24` sets `enabled = false` under `[observability]`. Can be toggled to `enabled = true` directly in code.                                                                                                                    |
| **CF-09** | `01-cloudflare.md` | HTML caching strategy (Worker SSR edge caching)                        | ⚠️ PARTIAL       | **RESOLVED**                                    | `src/middleware.ts:83-109, 161-194` implements Workers Cache API caching (`caches.default.match`/`put`) for homepage `/` with 300s edge TTL. Marketing routes converted to prerendered static HTML. (Batch D, G).                          |
| **CF-11** | `01-cloudflare.md` | Security headers: HSTS (`preload` token)                               | ⚠️ PARTIAL       | **RESOLVED (Code) / OWNER ACTION (Submission)** | `src/middleware.ts:10` and `public/_headers:6` include `; preload`. Code is resolved (Batch B, `e28e9ff`). Submission to `hstspreload.org` is an owner action.                                                                             |
| **CF-12** | `01-cloudflare.md` | Security headers: COOP/COEP (`same-origin-allow-popups`)               | ❌ MISSING       | **RESOLVED**                                    | `src/middleware.ts:11` and `public/_headers:7` set `'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'`. (Batch B, `e28e9ff`).                                                                                                       |
| **CF-13** | `01-cloudflare.md` | CSP: `unsafe-eval` absent on live site                                 | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `src/middleware.ts:15` omits `unsafe-eval`. `public/_headers:9` retains `unsafe-eval`. Endpoint `/api/csp-report.ts` deployed for monitoring; once verified clean, remove from `public/_headers:9`.                                        |
| **CF-14** | `01-cloudflare.md` | CSP: `unsafe-inline` in `script-src`                                   | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | Both `src/middleware.ts:15` and `public/_headers:9` retain `unsafe-inline` for Partytown and inline scripts. Requires transitioning to SHA-256 script hashes.                                                                              |
| **CF-15** | `01-cloudflare.md` | Turnstile on form endpoints (missing on `/api/newsletter`)             | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `/api/register`, `/api/contact`, and `/api/apply-teacher` have Turnstile. `src/pages/api/newsletter.ts:1-45` still lacks Turnstile verification.                                                                                           |
| **CF-16** | `01-cloudflare.md` | Rate limiting via KV (eventual consistency / fail-open)                | ⚠️ PARTIAL       | **STILL OPEN, OWNER ACTION ONLY**               | In-code KV rate limiting active (4 req/60s). Edge-level pre-Worker rate limiting requires Cloudflare WAF configuration in dashboard.                                                                                                       |
| **CF-22** | `01-cloudflare.md` | `*.workers.dev` preview indexation (`workers_dev = false`)             | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `wrangler.toml` and `alarm-worker/wrangler.toml` lack explicit `workers_dev = false`. Can be added directly in code.                                                                                                                       |
| **CF-27** | `01-cloudflare.md` | Cloudflare WAF managed rules                                           | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires Cloudflare dashboard or API token (`GET /zones/{zone_id}/rulesets`).                                                                                                                                                              |
| **CF-28** | `01-cloudflare.md` | Bot Fight Mode                                                         | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires Cloudflare dashboard or API token (`GET /zones/{zone_id}/bot_management`).                                                                                                                                                        |
| **CF-29** | `01-cloudflare.md` | Account 2FA                                                            | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires owner verification at `dash.cloudflare.com/profile/authentication`.                                                                                                                                                               |
| **CF-30** | `01-cloudflare.md` | Scoped API tokens (not Global API Key)                                 | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires owner verification at `dash.cloudflare.com/profile/api-tokens`.                                                                                                                                                                   |
| **CF-33** | `01-cloudflare.md` | Email DNS: DMARC policy (`p=none`)                                     | ⚠️ PARTIAL       | **STILL OPEN, OWNER ACTION ONLY**               | `_dmarc.quranific.com` has `v=DMARC1; p=none`. Advancing to `p=quarantine` requires creating `compliance@quranific.com` in Hostinger and adding `rua` in Cloudflare DNS.                                                                   |
| **CF-36** | `01-cloudflare.md` | Auto Minify status (deprecated)                                        | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires Cloudflare API verification (`GET /zones/{zone_id}/settings/minify`).                                                                                                                                                             |
| **CF-37** | `01-cloudflare.md` | CI: npm audit and Deploy Guard                                         | ❌ MISSING       | **RESOLVED**                                    | `package.json:22` includes `deploy:prod`, `scripts/deploy-guard.mjs:1-35` guards dirty workstation deploys, and `.github/workflows/ci.yml:30` runs ungated `npm audit --omit=dev --audit-level=critical`. (Batch A, `77090e6`, `a1f217d`). |
| **CF-38** | `01-cloudflare.md` | CI: Production branch protection                                       | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires GitHub repo admin access at `github.com/faisalkhanllcltd-coder/Quranific/settings/branches`.                                                                                                                                      |
| **CF-39** | `01-cloudflare.md` | Logpush for production logs                                            | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | Cloudflare Workers Logpush requires Paid ($5/mo) or Enterprise tier; real-time Workers Logs active via `wrangler.toml:28`.                                                                                                                 |
| **CF-40** | `01-cloudflare.md` | `Pragma: no-cache` on `complete.astro`                                 | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `src/pages/getting-started/complete.astro:13-14` still sets legacy `Pragma: no-cache` and `Expires: 0`. Can be deleted directly.                                                                                                           |
| **CF-41** | `01-cloudflare.md` | DNSSEC validation & signing                                            | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires enabling DNSSEC in Cloudflare DNS and submitting the DS record at Hostinger registrar console.                                                                                                                                    |
| **CF-42** | `01-cloudflare.md` | CAA DNS records for Universal SSL                                      | ❌ MISSING       | **STILL OPEN, OWNER ACTION ONLY**               | Requires adding 4 CAA records (`letsencrypt.org`, `digicert.com`, `sectigo.com`, `pki.goog`) in Cloudflare DNS dashboard.                                                                                                                  |
| **CF-43** | `01-cloudflare.md` | SSL/TLS encryption mode (Full Strict)                                  | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires verifying SSL/TLS encryption mode is set to "Full (strict)" in Cloudflare Dashboard -> SSL/TLS.                                                                                                                                   |
| **CF-46** | `01-cloudflare.md` | Early Hints (103)                                                      | ❌ MISSING       | **STILL OPEN, OWNER ACTION ONLY**               | Requires enabling Early Hints in Cloudflare Speed -> Optimization -> Content Optimization.                                                                                                                                                 |
| **CF-47** | `01-cloudflare.md` | Workers plan execution limits (CPU quota risk)                         | ⚠️ PARTIAL       | **RESOLVED**                                    | All static marketing routes prerendered (`prerender = true`); homepage cached via Workers Cache API (`src/middleware.ts:83-109`). (Batches D, G).                                                                                          |
| **CF-48** | `01-cloudflare.md` | Alarm-Worker HTTP endpoint exposure & Secret Reuse                     | ❌ MISSING       | **RESOLVED**                                    | `alarm-worker/src/index.ts:8-55, 63, 91` requires `Authorization: Bearer` with `timingSafeEqual`. Uses separate `INTERNAL_WORKER_SECRET`. `retry-queue.ts:7-25` uses constant-time secret check. (Batch C, M, `d6d0ca2`, `33166a0`).       |
| **CF-50** | `01-cloudflare.md` | Page Shield & Hotlink Protection                                       | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Requires dashboard activation in Cloudflare Security -> Page Shield / Scrape Shield.                                                                                                                                                       |
| **A-01**  | `02-astro.md`      | Astro dependency vulnerability audit (GHSA-26w7-cxv4-gfx2)             | ⚠️ PARTIAL       | **RESOLVED**                                    | `package.json:36, 39` upgraded `astro` to `^7.2.10` and `sharp` to `^0.35.4`. (Batch A, `26553af`).                                                                                                                                        |
| **A-02**  | `02-astro.md`      | `output: 'server'` with strategic prerendering                         | ⚠️ PARTIAL       | **RESOLVED**                                    | 19 static routes and `courses/[slug].astro:19` declare `export const prerender = true;`. Dynamic homepage `/` edge-cached via Workers Cache API (`src/middleware.ts:83-109`). (Batches D, G).                                              |
| **A-06**  | `02-astro.md`      | Image: `astro:assets` Image component used for hero                    | ⚠️ PARTIAL       | **RESOLVED**                                    | `src/pages/index.astro:91` uses `<Image>` with local asset. Logo `<Image>` in `Header.astro:83-92` and `Footer.astro:74` declare explicit `width={128} height={32}`.                                                                       |
| **A-09**  | `02-astro.md`      | Content Collections: Zod schema with required fields                   | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `src/content.config.ts:7-16` omits optional `canonical: z.string().url().optional()` and `ogImage: z.string().optional()`.                                                                                                                 |
| **A-13**  | `02-astro.md`      | ClientRouter (View Transitions) in use (script idempotency)            | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `src/layouts/Base.astro:150` listens on `astro:page-load`. Inline scripts on landing pages lack idempotency guard flags.                                                                                                                   |
| **A-18**  | `02-astro.md`      | JSON-LD structured data (Course & FAQPage schema)                      | ⚠️ PARTIAL       | **RESOLVED**                                    | `src/pages/courses/[slug].astro:51-100` generates complete `Course` schema with real metadata and dynamic `FAQPage` schema. (Batch E, `668043e`).                                                                                          |
| **A-19**  | `02-astro.md`      | hreflang / i18n routing                                                | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | Single-language English site (`lang="en"`). Arabic verses use per-element `<span dir="rtl" lang="ar">`. No multilingual routing required.                                                                                                  |
| **A-20**  | `02-astro.md`      | Font preload links in `<head>` (Amiri Arabic preload)                  | ⚠️ PARTIAL       | **RESOLVED**                                    | `src/layouts/Base.astro:160` preloads only critical Inter Latin font. Amiri Arabic preloads removed; `src/styles/fonts.css:50-75` configured with `unicode-range` for on-demand loading. (Batch F, `bf87eb9`).                             |
| **A-27**  | `02-astro.md`      | `optimizeDeps.exclude` duplication                                     | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `astro.config.mjs:76, 94, 106, 120, 133` duplicates exclusion array across 5 configuration blocks. Can be extracted to a shared constant.                                                                                                  |
| **A-28**  | `02-astro.md`      | `astro:env` schema for typed environment variables                     | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | Cloudflare Workers runtime bindings (`env` from `cloudflare:workers`) used directly; typed via `src/env.d.ts`.                                                                                                                             |
| **A-30**  | `02-astro.md`      | CSRF / origin check on API endpoints (JSON POST)                       | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | All 5 API endpoints accept JSON without explicit `Origin` or `Sec-Fetch-Site` validation. Can be added via helper.                                                                                                                         |
| **A-35**  | `02-astro.md`      | Speculationrules API for prerender                                     | ⚠️ PARTIAL       | **RESOLVED**                                    | `src/layouts/Base.astro:225` lists `["/getting-started/signup", "/courses", "/tuition-fee"]`. All three are now 100% static prerendered routes (`prerender = true`). (Batch G).                                                            |
| **A-43**  | `02-astro.md`      | Server Islands (`server:defer`) evaluation                             | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | No logged-in dynamic user profile on public pages. Static prerendering with client Svelte islands fulfills all requirements.                                                                                                               |
| **A-44**  | `02-astro.md`      | Astro Actions (`astro:actions`) evaluation                             | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | Optional architectural refactor; current manual `APIRoute` + Zod handlers are operational.                                                                                                                                                 |
| **A-45**  | `02-astro.md`      | Astro native CSP support (`security.csp`)                              | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | Optional architectural refactor; current HTTP header CSP via `src/middleware.ts` and `public/_headers` is operational.                                                                                                                     |
| **A-46**  | `02-astro.md`      | Astro Fonts API evaluation                                             | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | Experimental Astro feature. Local Fontsource woff2 imports and CSS `unicode-range` are stable and production-proven.                                                                                                                       |
| **A-48**  | `02-astro.md`      | Responsive image optimization (`widths` & `sizes`)                     | ❌ MISSING       | **STILL OPEN, FIXABLE IN CODE**                 | `src/pages/index.astro:91-100` hero `<Image>` uses fixed `width={1000} height={625}` without responsive `widths` or `sizes`.                                                                                                               |
| **S-03**  | `03-svelte.md`     | Runes syntax: `$derived.by` wrapping a function call                   | ❌ MISSING       | **STILL OPEN, FIXABLE IN CODE**                 | `src/components/blocks/PricingCalculator.svelte:114` still declares `let billingContext = $derived(() => {...})`. Requires refactoring to `$derived.by(...)`.                                                                              |
| **S-20**  | `03-svelte.md`     | Focus management in cookie banner (`role="dialog"`)                    | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `src/components/blocks/CookieBanner.svelte:200` has `role="dialog"` on outer backdrop container instead of inner card `<div>` (line 205).                                                                                                  |
| **S-22**  | `03-svelte.md`     | Cookie banner preference inputs label association                      | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `src/components/blocks/CookieBanner.svelte:233-250` disabled category checkboxes lack explicit `id` and `for` attributes.                                                                                                                  |
| **S-26**  | `03-svelte.md`     | `<svelte:boundary>` error boundary implementation                      | ❌ MISSING       | **STILL OPEN, FIXABLE IN CODE**                 | Verified: 0 matches for `<svelte:boundary` across `src/`. Islands can be wrapped with fallback error cards.                                                                                                                                |
| **S-28**  | `03-svelte.md`     | `svelte-check` validation in CI                                        | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `package.json:13` runs `astro check && astro build`. `svelte-check` is not in CI; reports 21 errors and 16 warnings across 7 files.                                                                                                        |
| **S-33**  | `03-svelte.md`     | `$state.raw` for static data structures                                | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | Static lookup tables in Svelte components (`COURSE_LIST`, `CURRENCY_RATES`) can be annotated with `$state.raw`.                                                                                                                            |
| **S-34**  | `03-svelte.md`     | `$bindable()` runes for two-way component props                        | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | Multi-step forms use explicit event/callback passing rather than two-way prop bindings.                                                                                                                                                    |
| **S-37**  | `03-svelte.md`     | Svelte component unit testing suite                                    | ❌ MISSING       | **STILL OPEN, FIXABLE IN CODE**                 | Playwright E2E suite exists; Vitest unit tests for pricing calculator and cookie banner can be added.                                                                                                                                      |
| **T-07**  | `04-adjacent.md`   | Logical properties / RTL utilities                                     | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | Shared components use physical margin/padding (`ml-`, `mr-`). Can be migrated to logical CSS (`ms-`, `me-`).                                                                                                                               |
| **T-08**  | `04-adjacent.md`   | Dark mode                                                              | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | Light mode only (`meta name="color-scheme" content="light"`). No dark mode required.                                                                                                                                                       |
| **R-03**  | `04-adjacent.md`   | `from` domain matches verified Resend domain                           | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `src/pages/api/contact.ts:126` uses hardcoded `'System <onboarding@quranific.com>'` while `email.ts:97` uses `SITE.emails.support`.                                                                                                        |
| **R-06**  | `04-adjacent.md`   | No PII in console.error logs                                           | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | Full unencrypted PII is written to KV dead-letter queue keys upon delivery failure (`FAILED_*` keys in `SESSION`). Sensitive fields should be encrypted/hashed.                                                                            |
| **Q-01**  | `04-adjacent.md`   | Arabic text: `lang="ar"` and `dir="rtl"` on Quranic elements           | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | 14 Arabic character occurrences across 7 files (e.g. `about/index.astro:144`) lack enclosing `<span dir="rtl" lang="ar">`.                                                                                                                 |
| **Q-05**  | `04-adjacent.md`   | Hardcoded WhatsApp number: single source of truth                      | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | 2 hardcoded URLs (`CourseHero.astro:92`, `cookies.astro:240`) and 2 fallback literals (`contact/index.astro:81`, `SmartContactForm.astro:9`) should be unified to `SITE.whatsappLink` / `SITE.whatsappNumber`.                             |
| **Q-07**  | `04-adjacent.md`   | Children's data minimization (COPPA / Children's Code)                 | ⚠️ PARTIAL       | **STILL OPEN, OWNER ACTION ONLY**               | Parental consent checkbox enforced in code (`schema.ts:17-21`). Full compliance requires qualified legal counsel review.                                                                                                                   |
| **Q-08**  | `04-adjacent.md`   | Core Web Vitals: LCP image above fold                                  | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Unverified due to PageSpeed API rate limits. Requires live field measurement via Google Search Console Core Web Vitals report.                                                                                                             |
| **Q-09**  | `04-adjacent.md`   | CLS: hero animation and layout shift (`will-change`)                   | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | `src/pages/index.astro:135` declares `will-change: transform, filter;`. Remove `filter` to eliminate paint overhead on low-end mobile.                                                                                                     |
| **Q-10**  | `04-adjacent.md`   | INP: Svelte event handlers execution time                              | ❓ CANNOT VERIFY | **STILL OPEN, OWNER ACTION ONLY**               | Handlers are lightweight in code; live real-user INP must be observed via Search Console CrUX report.                                                                                                                                      |
| **Q-13**  | `04-adjacent.md`   | GA4/GTM container ID environment isolation                             | ⚠️ PARTIAL       | **RESOLVED**                                    | `src/layouts/Base.astro:132-144` isolates GTM execution with runtime check: `if (window.location.hostname === 'quranific.com')`. (Batch E, `3057e40`).                                                                                     |
| **Q-15**  | `04-adjacent.md`   | Course schema on individual course pages                               | ⚠️ PARTIAL       | **RESOLVED**                                    | `src/pages/courses/[slug].astro:51-100` generates full `Course` schema with real metadata. (Batch E, `668043e`).                                                                                                                           |
| **Q-17**  | `04-adjacent.md`   | WCAG 2.2: Focus Not Obscured (Minimum) (SC 2.4.11)                     | ⚠️ PARTIAL       | **STILL OPEN, FIXABLE IN CODE**                 | Add `scroll-padding-top: 5rem` and `scroll-padding-bottom: 5rem` to `html` in `src/styles/global.css`.                                                                                                                                     |
| **Q-18**  | `04-adjacent.md`   | Color contrast: emerald-700 and amber-600 tokens                       | ⚠️ PARTIAL       | **RESOLVED**                                    | `src/pages/about/_components/AboutTeam.astro:22` updated to `text-amber-700` (`#b45309`, 5.02:1 contrast). Global CSS audited. (Batch F, `fec5347`).                                                                                       |
| **Q-22**  | `04-adjacent.md`   | Preview deployment analytics isolation                                 | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | Duplicate of Q-13. Resolved under Q-13 via `src/layouts/Base.astro:132`.                                                                                                                                                                   |
| **Q-23**  | `04-adjacent.md`   | Uptime & synthetic health monitoring                                   | ❌ MISSING       | **STILL OPEN, OWNER ACTION ONLY**               | Requires owner setup of free external synthetic ping (Better Uptime, UptimeRobot, or Cloudflare Health Checks).                                                                                                                            |
| **Q-24**  | `04-adjacent.md`   | `npm audit` vulnerability remediation                                  | ➖ N/A           | **SUPERSEDED / CONFIRMED N/A**                  | Duplicate of A-01 and CF-37. Resolved under A-01 and CF-37 via `package.json:36, 39` and `ci.yml:30`.                                                                                                                                      |
| **Q-25**  | `04-adjacent.md`   | Meta CAPI Graph API version currency (`v26.0`)                         | ❌ MISSING       | **RESOLVED (Code) / OWNER ACTION (Secrets)**    | `src/pages/api/complete.ts:274` updated to `v26.0`. (Batch E, `924dc85`). Owner must set `META_CAPI_TOKEN` secret in Cloudflare.                                                                                                           |

---

## 3. Specific In-Depth Probe Results (L3)

### a) S-03: PricingCalculator.svelte `billingContext` Declaration

- **Target File:** `src/components/blocks/PricingCalculator.svelte`
- **Current Lines 114–120:**
  ```svelte
  let billingContext = $derived(() => {
    const meta = CURRENCY_META.find((c) => c.code === currency);
    const sym_ = meta?.symbol ?? currency;
    const parts = [`Billed in ${currency} (${sym_})`];
    if (detectedCountry) parts.push(detectedCountry);
    return parts.join(' • ');
  });
  ```
- **Current Lines 363–365:**
  ```svelte
  {#if billingContext()}
    <p class="text-xs text-emerald-800/80 font-medium">
      {billingContext()}
    </p>
  {/if}
  ```
- **Conclusion:** It is **STILL** declared as `$derived(() => {...})`. It was **NEVER** refactored to `$derived.by(...)`. In markup, it is evaluated by invoking the function (`billingContext()`). This remains an open code fix.

### b) S-26: Repo-Wide Grep for `<svelte:boundary>`

- **Command Executed:** AST recursive search across all files in `src/` for `svelte:boundary`.
- **Result:** **0 matches found**. `<svelte:boundary>` does not exist anywhere in the codebase.
- **Conclusion:** Remains an open code enhancement (islands can be wrapped in `<svelte:boundary>` with accessible fallback cards).

### c) Q-05: Fresh Repo-Wide Grep for WhatsApp Links and Numbers

A full scan of `src/` for `wa.me`, `api.whatsapp.com`, and digit pattern `923112112122` returned **22 occurrences across 11 files**:

| File                                                   | Line | Usage Pattern                                                                              | Category                                                |
| :----------------------------------------------------- | :--- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| `src/components/blocks/FinalCTA.astro`                 | 77   | `href={SITE.whatsappLink}`                                                                 | Centralized (`SITE.whatsappLink`)                       |
| `src/components/global/Header.astro`                   | 110  | `href={SITE.whatsappLink}`                                                                 | Centralized (`SITE.whatsappLink`)                       |
| `src/components/global/MobileMenu.astro`               | 146  | `href={SITE.whatsappLink}`                                                                 | Centralized (`SITE.whatsappLink`)                       |
| `src/constants/site.ts`                                | 11   | `whatsappNumber: '923112112122'`                                                           | Single Source of Truth Definition                       |
| `src/constants/site.ts`                                | 12   | `whatsappLink: 'https://wa.me/message/FF4LDK3JR2GPN1'`                                     | Single Source of Truth Definition                       |
| `src/constants/site.ts`                                | 57   | `whatsapp: 'https://wa.me/message/FF4LDK3JR2GPN1'`                                         | Single Source of Truth Definition                       |
| `src/lib/helpers.ts`                                   | 39   | `const targetNumber = customNumber \|\| SITE?.whatsappNumber \|\| '1234567890'`            | Helper referencing `SITE.whatsappNumber`                |
| `src/lib/helpers.ts`                                   | 44   | `return \`https://wa.me/${cleanNumber}?text=${encodedMessage}\``                           | Central URL Builder Helper                              |
| `src/pages/contact/index.astro`                        | 81   | `href={\`https://wa.me/${(SITE.whatsappNumber \|\| '923112112122').replace(/\D/g, '')}\`}` | References `SITE.whatsappNumber` (has fallback literal) |
| `src/pages/contact/_components/SmartContactForm.astro` | 9    | `whatsapp: SITE.whatsappNumber \|\| '923112112122'`                                        | References `SITE.whatsappNumber` (has fallback literal) |
| `src/pages/contact/_components/SmartContactForm.astro` | 328  | `href={\`https://wa.me/${CONTACT_INFO.whatsapp.replace(/\D/g, '')}\`}`                     | Indirect via `CONTACT_INFO.whatsapp`                    |
| `src/pages/courses/_components/CourseHero.astro`       | 92   | `href="https://wa.me/message/FF4LDK3JR2GPN1"`                                              | **HARDCODED URL**                                       |
| `src/pages/index.astro`                                | 39   | `url: SITE.whatsappLink`                                                                   | Centralized (`SITE.whatsappLink`)                       |
| `src/pages/legal/cookies.astro`                        | 240  | `href="https://wa.me/923112112122"`                                                        | **HARDCODED URL & DIGITS**                              |
| `src/pages/legal/impressum.astro`                      | 216  | `href={\`https://wa.me/${SITE.whatsappNumber.replace(/\D/g, '')}\`}`                       | Centralized (`SITE.whatsappNumber`)                     |
| `src/pages/legal/impressum.astro`                      | 220  | `>{SITE.phone \|\| SITE.whatsappNumber}</a>`                                               | Centralized (`SITE.whatsappNumber`)                     |
| `src/pages/legal/privacy.astro`                        | 302  | `href={\`https://wa.me/${SITE.whatsappNumber}\`}`                                          | Centralized (`SITE.whatsappNumber`)                     |
| `src/pages/legal/refund.astro`                         | 451  | `href={\`https://wa.me/${SITE.whatsappNumber}\`}`                                          | Centralized (`SITE.whatsappNumber`)                     |
| `src/pages/legal/terms.astro`                          | 357  | `href={\`https://wa.me/${SITE.whatsappNumber}\`}`                                          | Centralized (`SITE.whatsappNumber`)                     |
| `src/pages/[intent]/for-adults.astro`                  | 308  | `document.querySelectorAll('a[href*="wa.me"]').forEach(...)`                               | DOM Query Selector                                      |
| `src/pages/[intent]/for-kids.astro`                    | 293  | `document.querySelectorAll('a[href*="wa.me"]').forEach(...)`                               | DOM Query Selector                                      |
| `src/pages/[intent]/for-women.astro`                   | 302  | `document.querySelectorAll('a[href*="wa.me"]').forEach(...)`                               | DOM Query Selector                                      |

- **Summary:** Exactly **2 hardcoded URLs** exist (`CourseHero.astro:92` and `cookies.astro:240`), plus **2 inline fallback string literals** (`contact/index.astro:81` and `SmartContactForm.astro:9`). All other 18 occurrences route through `SITE.whatsappLink` / `SITE.whatsappNumber` or are DOM event query selectors.

### d) Q-06 / Q-07: Children's Data / COPPA / UK Children's Code Compliance

- **Current Reality:** `src/lib/schema.ts:17-21` enforces `guardianConsent: z.boolean().refine(v => v === true)` on the server for all signups.
- **Plain Statement:** This was **NEVER** purely a code fix and remains an **OWNER ACTION / LEGAL REVIEW** item. Technical verification cannot substitute for qualified legal review of parental consent mechanisms, privacy notices, data minimization, and retention policies under COPPA (16 CFR Part 312) and the UK Age Appropriate Design Code.

### e) R-01 through R-09: Resend Integration Correctness

- **R-01 (API Key Server-Only):** ✅ DONE. Declared in `src/env.d.ts:19`; 0 leaks into client bundles.
- **R-02 (Direct Fetch Approach):** ✅ DONE. `src/lib/email.ts:2` uses lightweight zero-dependency `fetch`.
- **R-03 (`from` Domain Match):** ⚠️ PARTIAL (STILL OPEN, FIXABLE IN CODE). `src/pages/api/contact.ts:126` uses hardcoded `'System <onboarding@quranific.com>'`, while `email.ts:97` uses `SITE.emails.support` (`support@quranific.com`).
- **R-04 (API Key Validity Check):** ✅ DONE. `src/lib/email.ts:62` mocks safely in dev mode.
- **R-05 (Dead-Letter Queue Pattern):** ✅ DONE. Failed email dispatches are persisted to Cloudflare KV with 30-day TTL (`expirationTtl: 2592000`).
- **R-06 (No PII in Logs / DLQ Encryption):** ⚠️ PARTIAL (STILL OPEN, FIXABLE IN CODE). Console logs omit plain emails (`complete.ts` logs JTI only). However, full unencrypted PII is written to KV dead-letter queue keys upon delivery failure (`FAILED_*` keys in `SESSION`).
- **R-07 (Rate Limiting before Send):** ✅ DONE. KV rate limiting (4 req/60s per IP) runs before Resend dispatches.
- **R-08 (Resend Audiences Integration):** ✅ DONE. `src/pages/api/newsletter.ts:67-95` correctly registers subscribers to Resend Audiences.
- **R-09 (HTML Escaping in Templates):** ✅ DONE. `src/lib/email.ts:6-13` custom `esc()` function sanitizes all template interpolation fields.

### f) Cloudflare Dashboard / API Unverified Items (CF-XX)

The following items remain unverified locally because they require Cloudflare account credentials, dashboard permissions, or registrar access. Use the provided commands and URLs to verify them:

| ID        | Practice              | How to Verify via Cloudflare API / Command                                                                                       | Dashboard URL                                                              |
| :-------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **CF-27** | WAF Managed Rules     | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets"`        | `dash.cloudflare.com/?to=/:account/:zone/security/waf`                     |
| **CF-28** | Bot Fight Mode        | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/bot_management"`  | `dash.cloudflare.com/?to=/:account/:zone/security/bots`                    |
| **CF-29** | Account 2FA           | Check user profile security                                                                                                      | `dash.cloudflare.com/profile/authentication`                               |
| **CF-30** | Scoped API Tokens     | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/user/tokens/verify"`             | `dash.cloudflare.com/profile/api-tokens`                                   |
| **CF-36** | Auto Minify Status    | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/minify"` | `dash.cloudflare.com/?to=/:account/:zone/speed/optimization/content`       |
| **CF-38** | Branch Protection     | `gh api repos/faisalkhanllcltd-coder/Quranific/branches/main/protection`                                                         | `github.com/faisalkhanllcltd-coder/Quranific/settings/branches`            |
| **CF-41** | DNSSEC Delegation     | `Resolve-DnsName -Type DS -Name quranific.com` or `curl.exe -s "https://dns.google/resolve?name=quranific.com&type=DS"`          | `dash.cloudflare.com/?to=/:account/:zone/dns/settings` + Hostinger Console |
| **CF-42** | Universal SSL CAA     | `Resolve-DnsName -Type CAA -Name quranific.com`                                                                                  | `dash.cloudflare.com/?to=/:account/:zone/dns`                              |
| **CF-43** | SSL Mode Full Strict  | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl"`    | `dash.cloudflare.com/?to=/:account/:zone/ssl-tls`                          |
| **CF-50** | Page Shield & Hotlink | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/page_shield"`     | `dash.cloudflare.com/?to=/:account/:zone/security/page-shield`             |
| **Q-08**  | CWV: LCP Field Data   | Check Google Search Console Core Web Vitals report                                                                               | `search.google.com/search-console/core-web-vitals`                         |
| **Q-10**  | CWV: INP Field Data   | Check GA4 or Search Console CrUX report                                                                                          | `search.google.com/search-console/core-web-vitals`                         |

---

## 4. Unaudited Additions Introduced in Batches A–K (L4)

During Batches A through K, several critical architectural improvements and safeguards were introduced that were not part of the original audit rows. The site owner must be aware of these before deploying:

1. **Two Mandatory Cloudflare Secrets (`INTERNAL_WORKER_SECRET` & `ALARM_ADMIN_TOKEN`):**
   - **Where:** `alarm-worker/src/index.ts:5-6, 29, 52, 63, 91` and `src/pages/api/internal/retry-queue.ts:11`.
   - **Why:** Protects internal worker communications and stops secret reuse of `JWT_SECRET`.
   - **Action Required Before Deploy:** Run `wrangler secret put INTERNAL_WORKER_SECRET` on both workers (`quranific` and `alarm-worker`), and `wrangler secret put ALARM_ADMIN_TOKEN` on `alarm-worker`.
2. **Temporary Fallback in `retry-queue.ts` (Marked `TODO: remove fallback`):**
   - **Where:** `src/pages/api/internal/retry-queue.ts:11`:
     ```ts
     const expectedSecret = runtimeEnv.INTERNAL_WORKER_SECRET || runtimeEnv.JWT_SECRET; // TODO: remove fallback once secret is provisioned
     ```
   - **Why:** Prevents the retry queue from immediately breaking in staging before the owner provisions the secret. Once `INTERNAL_WORKER_SECRET` is provisioned, this fallback must be deleted.
3. **CSP Report-Only Monitoring Step (`Content-Security-Policy-Report-Only`):**
   - **Where:** `src/middleware.ts:27-42` and `src/pages/api/csp-report.ts:1-45`.
   - **Why:** Before removing `'unsafe-eval'` from `public/_headers:9`, browsers report violations to `/api/csp-report`. The owner should inspect logs to verify Partytown and GTM scripts trigger zero violations under real user conditions.
4. **Workstation Pre-Deploy Guard Script:**
   - **Where:** `scripts/deploy-guard.mjs` and `package.json:22` (`"deploy:prod"`).
   - **Why:** Prevents accidental deployments of uncommitted changes or dirty working trees from developer machines. Replaces raw `wrangler deploy` with `npm run deploy:prod`.
5. **Homepage 300s Edge-Cache TTL (Workers Cache API):**
   - **Where:** `src/middleware.ts:83-109, 161-194`.
   - **Why:** The dynamic SSR homepage (`/`) is cached across Cloudflare edge nodes for 300 seconds (`s-maxage=300, stale-while-revalidate=600`). Prevents Worker CPU exhaustion under ad traffic while guaranteeing updates propagate within 5 minutes.
6. **`X-Robots-Tag: noindex, nofollow` on Funnel & Session Routes:**
   - **Where:** `src/middleware.ts:120-134`.
   - **Why:** Dynamically sets `X-Robots-Tag: noindex, nofollow` on private and session-gated paths (`/getting-started/complete`, `/getting-started/success`, `/api/*`) at the edge, guaranteeing search engine exclusion even if crawlers bypass `robots.txt`.

---

## 5. Pre-Ads Live Launch Checklist

Prioritized checklist of every remaining open item before turning on Google Ads or Meta Ads campaigns:

### Tier 1 — Critical Pre-Deploy Blockers (Must Do Before First Live Ad Dollar)

- [ ] **Provision Cloudflare Secrets:**
  - `wrangler secret put INTERNAL_WORKER_SECRET` (on root worker & alarm-worker)
  - `wrangler secret put ALARM_ADMIN_TOKEN` (on alarm-worker)
  - `wrangler secret put META_CAPI_TOKEN` (on root worker for Meta conversion tracking)
  - Add `META_PIXEL_ID` to `[vars]` in `wrangler.toml`
- [ ] **Remove `TODO` Fallback in `retry-queue.ts:11`:** Delete `|| runtimeEnv.JWT_SECRET` once `INTERNAL_WORKER_SECRET` is active.
- [ ] **Configure Universal SSL CAA Records in Cloudflare DNS:**
  - Add CAA records for `letsencrypt.org`, `digicert.com`, `sectigo.com`, `pki.goog`.
- [ ] **Add Turnstile to Newsletter Form (`CF-15`):** Update `src/pages/api/newsletter.ts` to verify Turnstile tokens before accepting subscriptions.
- [ ] **Standardize Contact Form Outbound Email (`R-03`):** Change `src/pages/api/contact.ts:126` from `onboarding@quranific.com` to `SITE.emails.support`.

### Tier 2 — High Priority Pre-Scale Actions (First 48 Hours)

- [ ] **Monitor CSP Violations & Remove `unsafe-eval` (`CF-13`):** Inspect Cloudflare logs for `/api/csp-report`. Once clean, remove `'unsafe-eval'` from `public/_headers:9`.
- [ ] **Fix PricingCalculator Svelte 5 Rune (`S-03`):** Refactor `PricingCalculator.svelte:114` from `$derived(() => ...)` to `$derived.by(...)`.
- [ ] **Fix Cookie Banner Accessibility (`S-20` & `S-22`):** Move `role="dialog"` to inner card `<div>` and add `id`/`for` attributes to preference toggles.
- [ ] **Standardize Hardcoded WhatsApp URLs (`Q-05`):** Replace raw `wa.me` links in `CourseHero.astro:92` and `cookies.astro:240` with `SITE.whatsappLink` / `SITE.whatsappNumber`.
- [ ] **Remove Deprecated Headers (`CF-40`):** Delete `Pragma: no-cache` and `Expires: 0` from `src/pages/getting-started/complete.astro:13-14`.
- [ ] **Set `workers_dev = false` (`CF-22`):** Add explicit `workers_dev = false` to both `wrangler.toml` and `alarm-worker/wrangler.toml`.
- [ ] **Enable Top-Level Observability (`CF-07`):** Set `[observability] enabled = true` in `wrangler.toml:24`.

### Tier 3 — Domain, Infrastructure & Legal Hygiene

- [ ] **Enable DNSSEC Delegation (`CF-41`):** Enable DNSSEC in Cloudflare DNS and paste DS record into Hostinger registrar console.
- [ ] **Verify Cloudflare Security Settings:** Ensure Bot Fight Mode (`CF-28`), WAF Managed Rules (`CF-27`), and SSL Full Strict (`CF-43`) are enabled.
- [ ] **Set Up Free Synthetic Health Ping (`Q-23`):** Configure external monitor (Better Uptime or UptimeRobot) pinging `https://quranific.com/` and `/robots.txt`.
- [ ] **Legal Review of Children's Data Collection (`Q-06` / `Q-07`):** Submit signup funnel parental consent and privacy copy for qualified legal counsel sign-off.
- [ ] **Wrap Svelte Islands in `<svelte:boundary>` (`S-26`):** Add error boundaries with fallback cards to prevent island crash propagation.

---

## 6. Verification Diagnostics

The codebase on `staging/audit-fixes-batch-a` currently matches the verified baseline:

- `npx astro check`: **0 errors, 0 warnings, 15 hints** (across 149 files)
- `npx svelte-check --tsconfig ./tsconfig.json`: **21 errors, 16 warnings** (across 7 files — identical to pre-audit baseline)
- `git status --porcelain`: **Clean** (zero uncommitted code modifications)
