# REVISION-LOG — Second Auditor Re-Verification

This document logs all corrections made by the Second Auditor to the initial draft audit documents (`00-MASTER-REPORT.md`, `01-cloudflare.md`, `02-astro.md`, `03-svelte.md`, `04-adjacent.md`).

---

## 1. Suspects & Hypotheses Verdicts (S1 to S25)

| Suspect | Hypothesis / Concern                                                                                                             | Auditor Verdict                        | Evidence & Real Impact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------ | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1**  | **RCE finding (A-01/Q-24/master #1)**: Libheif flaw in Sharp (GHSA-26w7-cxv4-gfx2). Real exposure vs exaggerated CVSS 9.8 panic. | **REFUTED / RE-SCOPED**                | Production uses `@astrojs/cloudflare` with `imageService: 'cloudflare'`. Sharp is NOT executed at runtime in Cloudflare Workers. `/_image` endpoint returns 500 (`Cannot read properties of undefined (reading 'info')`) because `env.IMAGES` is unbound. Zero user image upload functionality exists. Real production exposure is **ZERO**. Framework upgrade to `astro >= 7.2.8` (requiring `sharp >= 0.35.4`) is recommended as standard dependency hygiene, but removed from critical RCE emergency ranking. GHSA-376h-93r7-7g6f also has zero exposure (`base` is `/`, no pathname auth in middleware). |
| **S2**  | **Header architecture parity**: Middleware headers do not run for prerendered HTML served via Static Assets CDN.                 | **CONFIRMED**                          | In Workers with `[assets]`, static/prerendered HTML bypasses Worker execution when `run_worker_first` is absent. Prerendered pages (`/courses/`) receive headers strictly from `public/_headers` (which includes `unsafe-eval` and `preload`), whereas SSR pages (`/`) receive headers from `middleware.ts` (which lacks `unsafe-eval` and lacks `preload`). Pre-requisite: header parity must be established in `_headers` before prerendering any additional routes.                                                                                                                                       |
| **S3**  | **HTML edge caching on Workers**: CDN-Cache-Control claims in draft.                                                             | **CONFIRMED (DRAFT REFUTED)**          | Live measurement with `curl.exe -sI` demonstrates that Worker-generated SSR responses on `quranific.com` return NO `cf-cache-status` header; `Date` changes on every request. Cloudflare CDN does NOT edge-cache Worker dynamic responses on custom domains by default without Cache API implementation or a Cloudflare Cache Rule (Cache Everything). Draft claim that edge caching prevents per-user branching was factually invalid for SSR.                                                                                                                                                              |
| **S4**  | **GTM environment gate**: Build-time vs runtime isolation.                                                                       | **CONFIRMED**                          | `ENVIRONMENT` in `Base.astro` is evaluated at build time. For prerendered pages, the build output is static HTML. If preview and production share a build or are generated without build-time env overrides, `GTM-5CJMMJ29` will fire on preview. Recommended solution: runtime client-side hostname gate (`window.location.hostname === 'quranific.com'`) or GTM trigger-side hostname filter.                                                                                                                                                                                                              |
| **S5**  | **CSP nonces vs hashes**: Conflict with prerendered/cached HTML.                                                                 | **CONFIRMED**                          | Cryptographic nonces must be generated uniquely per HTTP request and cannot be used on prerendered or CDN-cached HTML without edge HTML rewriting. Static inline scripts and snippets must use SHA-256 script hashes. Astro 7 natively supports hash-based CSP via `security.csp`.                                                                                                                                                                                                                                                                                                                           |
| **S6**  | **Public POST endpoints inventory & rate limiting**: Draft claimed 4 endpoints.                                                  | **CONFIRMED (5 ENDPOINTS IDENTIFIED)** | Exactly 5 public POST endpoints exist: `/api/register`, `/api/complete`, `/api/contact`, `/api/apply-teacher`, and `/api/newsletter`. Only `/api/register` checks request body size (10KB limit). Newsletter lacks Turnstile verification. Astro `security.checkOrigin` only protects form-urlencoded/multipart/text, NOT JSON. KV rate limiter is non-atomic, fails open on error, and risks exhausting the 1,000 writes/day Free quota under sustained traffic.                                                                                                                                            |
| **S7**  | **Resend SDK & DNS configuration**: Draft claimed SDK incompatible with Workers and recommended overwriting root SPF.            | **REFUTED (DRAFT ERRORS)**             | (a) Resend officially supports Cloudflare Workers via SDK or direct fetch; draft claim of incompatibility was false. Direct fetch is a valid zero-dependency choice. (b) DNS measurement via `Resolve-DnsName` confirms root TXT already has `v=spf1 include:_spf.mail.hostinger.com include:resend.com ~all`. Overwriting root SPF as draft suggested would break Hostinger email! Resend DKIM is verified at `resend._domainkey.quranific.com`, and `send.quranific.com` handles Resend mail. `_dmarc.quranific.com` is active at `p=none` (monitoring phase).                                             |
| **S8**  | **Speculation rules & prerender overhead**: Unconditional speculation rules on SSR routes.                                       | **CONFIRMED**                          | `Base.astro` injects speculation rules prerendering `/courses` and `/tuition-fee`. Because these routes are currently SSR, speculative loading executes full Worker invocations in the background, consuming edge CPU time and firing un-gated analytics.                                                                                                                                                                                                                                                                                                                                                    |
| **S9**  | **Fonts payload & tashkeel coverage**: 346 KB preloaded fonts.                                                                   | **CONFIRMED**                          | 5 font files preloaded unconditionally totaling 346.2 KB (Amiri Arabic 400 = 106 KB, 700 = 97.6 KB). Amiri Arabic is preloaded even on English-only pages. Verified: Fontsource Amiri package includes `U+0600-06FF` which preserves Quranic tashkeel (U+064B–065F).                                                                                                                                                                                                                                                                                                                                         |
| **S10** | **Core Web Vitals unmeasured claims**: Draft asserted ✅ without live measurement.                                               | **CONFIRMED**                          | Draft gave ✅ to Q-08, Q-09, Q-10, T-09 without measurement. Live PageSpeed API was rate-limited (429 `RESOURCE_EXHAUSTED`). Re-labeled unmeasured items to ❓ CANNOT VERIFY with reproduction steps. Identified that `will-change: transform, filter` creates heavy rasterization cost on low-end mobile devices; recommended removing `filter`.                                                                                                                                                                                                                                                            |
| **S11** | **`imageService: 'cloudflare'` semantics**: Adapter 14.2.0 behavior.                                                             | **CONFIRMED**                          | `@astrojs/cloudflare` 14.2.0 delegates image resizing to Cloudflare Images (`env.IMAGES`). Since `env.IMAGES` is unbound, `/_image` fails with 500. Live hero image is served static at `/images/quranific-hero.webp` (HTTP 200, `image/webp`).                                                                                                                                                                                                                                                                                                                                                              |
| **S12** | **`build.inlineStylesheets` default in Astro 7**: Draft claimed `'never'`.                                                       | **REFUTED (DRAFT ERROR)**              | Astro 7 configuration types (`node_modules/astro/dist/types/public/config.d.ts` line 1333) confirm `@default 'auto'`. Small stylesheets are inlined automatically by Astro.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **S13** | **`waitUntil` accessor in `@astrojs/cloudflare` v14**: Draft claimed `locals.runtime.ctx.waitUntil`.                             | **REFUTED (DRAFT ERROR)**              | In adapter v14, `locals.runtime.ctx` throws a runtime error. `locals.cfContext.waitUntil` IS the official API (`cf-helpers.js` line 14). Code correctly uses `locals.cfContext?.waitUntil(...)`.                                                                                                                                                                                                                                                                                                                                                                                                             |
| **S14** | **Observability config**: `enabled = false` vs `[observability.logs]`.                                                           | **CONFIRMED**                          | Cloudflare docs confirm `[observability.logs] enabled = true` independently controls Workers Logs streaming. Top-level `enabled = true` is needed for Tracing/Metrics.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **S15** | **Cloudflare Free plan constraints**: Plan dependencies.                                                                         | **CONFIRMED**                          | Workers Free plan has 10ms CPU limit, 100k requests/day, 1k KV writes/day. Logpush requires Workers Paid ($5/mo). Free Cloudflare Health Checks are origin-focused. Static prerendering is essential to protect Free tier CPU quotas.                                                                                                                                                                                                                                                                                                                                                                        |
| **S16** | **Scorecard row count discrepancy**: Draft master reported 139 rows vs 157 actual.                                               | **CONFIRMED**                          | Draft master was out of sync with domain files. Recount script `_recount.mjs` implemented and verified: exactly 185 rows across all 4 domain files after gap additions, 0 unhandled duplicates, 0 NONE.                                                                                                                                                                                                                                                                                                                                                                                                      |
| **S17** | **Status-logic errors in draft**: Q-11, S-17, Q-01, Q-05, A-29.                                                                  | **CORRECTED**                          | Q-11 was ❌ in draft: verified `[intent]/for-kids.astro` has `prerender = true`; changed to ✅. S-17 was ❓: verified `PricingCalculator.svelte` is actively used on 4 pages with `client:visible`; changed to ✅. Q-05 verified: uses `SITE.whatsappNumber`; no hardcoded numbers exist in landing pages.                                                                                                                                                                                                                                                                                                   |
| **S18** | **CI security audit suppression**: `                                                                                             |                                        | true`on`npm audit`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **CONFIRMED** | `.github/workflows/ci.yml` line 29 suppresses audit failures via ` |     | true`. 7 vulnerabilities currently in lockfile. Recommended `npm audit --omit=dev --audit-level=high` with Dependabot/Renovate automated PR workflow. |
| **S19** | **HSTS preload & COOP risk assessment**: Master Top 10 ranking.                                                                  | **CONFIRMED**                          | HSTS `preload` token submission on hstspreload.org is hard-to-reverse and binds all future subdomains. COOP `same-origin` risks breaking external popup flows (WhatsApp, payment gateways). Downgraded from indiscriminate Top 10 to calibrated configuration with `same-origin-allow-popups`.                                                                                                                                                                                                                                                                                                               |
| **S20** | **Meta CAPI Graph API version currency**: `v19.0` status and secrets.                                                            | **CONFIRMED**                          | Graph API `v19.0` expired on May 21, 2026. Target is `v21.0` or `v22.0`. Furthermore, `META_PIXEL_ID` and `META_CAPI_TOKEN` are completely absent from Cloudflare Worker secrets, rendering Meta CAPI dead code in production.                                                                                                                                                                                                                                                                                                                                                                               |
| **S21** | **Consent pipeline execution order & ClientRouter**: Idempotency and latency.                                                    | **CONFIRMED**                          | Default Consent Mode fires synchronously in `<head>` before GTM. Verified `wait_for_update: 500` is adequate for KV consent bucket endpoint. ClientRouter `astro:page-load` handlers require idempotency guards to prevent duplicate event pushes.                                                                                                                                                                                                                                                                                                                                                           |
| **S22** | **WCAG 2.2 Success Criteria errors in draft**: SC 2.4.11 conflation & contrast ratio inaccuracies.                               | **CORRECTED**                          | Draft linked SC 2.4.11 to Focus Appearance (AAA 2.4.13). Corrected to Focus Not Obscured (Minimum) (AA). Contrast ratio of emerald-700 on white is 5.40:1 (draft claimed ~5.8:1). Amber-600 on white is 3.19:1 (FAILS WCAG AA for normal body text). Added gap rows for 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8.                                                                                                                                                                                                                                                                                                   |
| **S23** | **Partytown + GTM worker caveats**: Off-thread event attribution.                                                                | **CONFIRMED**                          | Partytown executes GTM inside a Web Worker. Third-party ad conversion linkers requiring DOM access can fail or lose cookies. Added manual verification instructions via Tag Assistant / GA4 DebugView.                                                                                                                                                                                                                                                                                                                                                                                                       |
| **S24** | **Robots.txt & Google Ads crawler**: `Disallow: /ads/`.                                                                          | **CONFIRMED**                          | `/ads/*` routes are 301 redirects to `/quran-classes/*`. Google Ads landing pages point to `/quran-classes/for-*`, which are allowed in `robots.txt`. AdsBot-Google can crawl destination pages without hindrance.                                                                                                                                                                                                                                                                                                                                                                                           |
| **S25** | **CSRF & `security.checkOrigin`**: Protection scope on JSON APIs.                                                                | **CONFIRMED**                          | Astro's native `checkOrigin` only checks form post types (`form-urlencoded`, `multipart`, `text/plain`). All 5 API endpoints accept `application/json`, which bypasses `checkOrigin`. Explicit origin checks required in endpoint handlers.                                                                                                                                                                                                                                                                                                                                                                  |

---

## 2. Row-by-Row Re-Verification Log

| ID           | Field                 | Old Value (Draft)                                             | New Value (Auditor 2)                                                                              | Evidence / Rationale                                                                                                                                                      |
| ------------ | --------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CF-04**    | Status / Evidence     | ✅ DONE (Inference)                                           | ⚠️ PARTIAL                                                                                         | `wrangler secret list` confirms `JWT_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` exist, but `META_PIXEL_ID` and `META_CAPI_TOKEN` are ABSENT.                       |
| **CF-05**    | Status / Evidence     | ❓ CANNOT VERIFY                                              | ❌ MISSING                                                                                         | `worker-configuration.d.ts` is absent from repo; `src/env.d.ts` uses manual `Env` types prone to drift.                                                                   |
| **CF-07**    | Evidence              | `top-level enabled = false may suppress tail-worker features` | Verified: Workers Logs works independently per Cloudflare docs; top-level enables Tracing/Metrics. | Official Cloudflare Workers Observability docs fetched.                                                                                                                   |
| **CF-09**    | Status / Evidence     | ✅ DONE (`CDN-Cache-Control` correct)                         | ⚠️ PARTIAL                                                                                         | Measured live: No `cf-cache-status` on SSR responses; `Date` increments on every request. CDN does not cache Worker responses without Cache API or Cache Everything rule. |
| **CF-11**    | Evidence / How to fix | Middleware lacks `preload`                                    | Disparity: SSR lacks `preload`; static `_headers` has `preload`. Note hstspreload.org requirement. | Measured live via `curl.exe -sI`.                                                                                                                                         |
| **CF-12**    | How to fix            | `same-origin`                                                 | `same-origin-allow-popups`                                                                         | Plain `same-origin` breaks WhatsApp web links and OAuth/payment popup redirects.                                                                                          |
| **CF-13**    | Status / Evidence     | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | Live static assets (`/courses/`) served from `_headers` contain `unsafe-eval` in CSP.                                                                                     |
| **CF-14**    | How to fix            | Nonce-based CSP                                               | SHA-256 script hashes                                                                              | Nonces break on cached and prerendered HTML; hashes are static and compatible.                                                                                            |
| **CF-15**    | Status / Evidence     | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | `/api/newsletter` lacks Turnstile verification entirely.                                                                                                                  |
| **CF-16**    | Evidence / How to fix | ✅ DONE (4 endpoints)                                         | ⚠️ PARTIAL (5 endpoints)                                                                           | 5 POST endpoints exist. KV rate limiter is non-atomic and risks 1,000 write/day quota on Free plan.                                                                       |
| **CF-22**    | Status / Evidence     | ❓ CANNOT VERIFY                                              | ⚠️ PARTIAL                                                                                         | `quranific.workers.dev` returns 404; `wrangler.toml` lacks explicit `workers_dev = false`.                                                                                |
| **CF-26**    | Status / Evidence     | ⚠️ PARTIAL (claimed `runtime.ctx.waitUntil`)                  | ✅ DONE                                                                                            | In `@astrojs/cloudflare` v14, `locals.cfContext.waitUntil` IS the official API. Code is correct.                                                                          |
| **CF-31**    | Status / Evidence     | ❓ CANNOT VERIFY                                              | ✅ DONE                                                                                            | Measured live: Root TXT already has `v=spf1 include:_spf.mail.hostinger.com include:resend.com ~all`.                                                                     |
| **CF-32**    | Status / Evidence     | ❓ CANNOT VERIFY                                              | ✅ DONE                                                                                            | Measured live: `resend._domainkey.quranific.com` CNAME resolves to `dkim.resend.com`.                                                                                     |
| **CF-33**    | Status / Evidence     | ❓ CANNOT VERIFY (asked p=quarantine)                         | ⚠️ PARTIAL                                                                                         | Measured live: `_dmarc.quranific.com` has `v=DMARC1; p=none`. Monitoring mode is standard phase 1.                                                                        |
| **CF-35**    | Status / Evidence     | ❓ CANNOT VERIFY                                              | ✅ DONE                                                                                            | Measured live: Inspection of HTML confirms Rocket Loader is disabled (no `rocket-loader` marker).                                                                         |
| **CF-36**    | Status / Evidence     | ❓ CANNOT VERIFY                                              | ✅ DONE                                                                                            | Measured live: HTML output cleanly minified by Astro; no double-minification errors observed.                                                                             |
| **CF-37**    | Evidence / How to fix | Change to `--audit-level=high`                                | Change to `--omit=dev --audit-level=high` + Dependabot                                             | Plain `--audit-level=high` fails builds on unfixable dev-only vulnerabilities.                                                                                            |
| **CF-39**    | Status / Evidence     | ❌ MISSING                                                    | ➖ N/A                                                                                             | Logpush requires Workers Paid ($5/mo); unavailable on Workers Free plan.                                                                                                  |
| **A-01**     | Status / Evidence     | ❌ MISSING (CVSS 9.8 RCE)                                     | ⚠️ PARTIAL (Zero real exposure)                                                                    | Production uses `@astrojs/cloudflare` with `imageService: 'cloudflare'`; Sharp not executed on Workers.                                                                   |
| **A-06**     | Status / Evidence     | ⚠️ PARTIAL                                                    | ⚠️ PARTIAL                                                                                         | Working tree uncommitted edit broke build due to missing `../assets/` file. Layouts use raw `<img>`.                                                                      |
| **A-09**     | Status                | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | `canonical` and `ogImage` fields missing from content collection schema.                                                                                                  |
| **A-13**     | Status / Evidence     | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | Inline scripts in landing pages lack idempotency guards against double-firing on `astro:page-load`.                                                                       |
| **A-18**     | Status / Evidence     | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | Committed course pages under `/courses/[slug].astro` lack `Course` schema.                                                                                                |
| **A-20**     | Status / Evidence     | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | 5 fonts preloaded unconditionally (346.2 KB); Amiri Arabic (203.6 KB) preloaded on English pages.                                                                         |
| **A-28**     | Status / Evidence     | ❌ MISSING                                                    | ➖ N/A                                                                                             | `astro:env` has low value for Cloudflare Worker runtime secret bindings.                                                                                                  |
| **A-30**     | Status / Evidence     | ⚠️ PARTIAL                                                    | ⚠️ PARTIAL                                                                                         | Astro native `checkOrigin` skips `application/json`; all 5 API endpoints accept JSON.                                                                                     |
| **A-35**     | Status / Evidence     | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | Client speculation rules prerender SSR routes (`/courses`, `/tuition-fee`), burning Worker CPU.                                                                           |
| **A-37**     | Status / Evidence     | ⚠️ PARTIAL (claimed default 'never')                          | ✅ DONE                                                                                            | Verified in Astro 7 configuration types: `@default 'auto'`. Draft claim refuted.                                                                                          |
| **S-03**     | Evidence / How to fix | Syntax error                                                  | `$derived.by` pattern                                                                              | `let billingContext = $derived(() => {...})` creates a function reference; use `$derived.by`.                                                                             |
| **S-07..11** | Status / Evidence     | ❓ Unaudited components                                       | ✅ DONE                                                                                            | AST scan across all 9 `.svelte` files in repo confirmed 0 instances of any legacy Svelte syntax.                                                                          |
| **S-17**     | Status / Evidence     | ❓ CANNOT VERIFY                                              | ✅ DONE                                                                                            | Confirmed actively mounted on 4 pages (`index`, `courses/[slug]`, `for-adults`, `tuition-fee`) with `client:visible`.                                                     |
| **S-20**     | Evidence / How to fix | Container accessibility                                       | Move `role="dialog"` to inner card                                                                 | `role="dialog"` is currently on the outer full-screen pointer-events container.                                                                                           |
| **S-26**     | Evidence / How to fix | Generic error boundary                                        | Svelte 5 boundary scope                                                                            | `<svelte:boundary>` catches render/effect errors, but NOT event handler exceptions.                                                                                       |
| **S-28**     | Status / Evidence     | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | Measured live: `svelte-check` identified 21 errors and 16 warnings across 7 files.                                                                                        |
| **R-02**     | Evidence / How to fix | SDK incompatible with Workers                                 | Official SDK compatible; fetch is zero-dep choice                                                  | Resend officially supports Workers runtime; direct fetch is a valid design choice.                                                                                        |
| **R-03**     | Status / Evidence     | ⚠️ PARTIAL                                                    | ⚠️ PARTIAL                                                                                         | `contact.ts` uses hardcoded `onboarding@quranific.com` instead of verified `SITE.emails.support`.                                                                         |
| **Q-01**     | Status / Evidence     | ⚠️ PARTIAL                                                    | ✅ DONE                                                                                            | Verified: Quranic text snippets declare `lang="ar"` and `dir="rtl"`.                                                                                                      |
| **Q-04**     | Status / Evidence     | ✅ DONE (Unverified)                                          | ✅ DONE (Verified)                                                                                 | Verified via `@fontsource/amiri/unicode.json`: includes `U+0600-06FF` covering tashkeel (U+064B–065F).                                                                    |
| **Q-05**     | Status / Evidence     | ✅ DONE (Unverified)                                          | ✅ DONE (Verified)                                                                                 | Verified: Landing pages use `generateWhatsAppLink()` with `SITE.whatsappNumber`; no hardcoded numbers.                                                                    |
| **Q-08**     | Status / Evidence     | ✅ DONE                                                       | ❓ CANNOT VERIFY                                                                                   | PageSpeed Insights API returned HTTP 429 quota exceeded during audit run.                                                                                                 |
| **Q-09**     | Status / Evidence     | ✅ DONE                                                       | ⚠️ PARTIAL                                                                                         | `will-change: transform, filter` promotes heavy rasterization on mobile GPU; remove `filter`.                                                                             |
| **Q-10**     | Status / Evidence     | ✅ DONE                                                       | ❓ CANNOT VERIFY                                                                                   | PageSpeed API 429 prevented live field INP observation.                                                                                                                   |
| **Q-11**     | Status / Evidence     | ❌ MISSING                                                    | ✅ DONE                                                                                            | Verified: `[intent]/for-kids.astro`, `for-adults.astro`, `for-women.astro` all declare `prerender = true`.                                                                |
| **Q-12**     | Status / Evidence     | ❓ CANNOT VERIFY                                              | ✅ DONE                                                                                            | Verified: Landing pages define unique title, description, and canonical targeting each segment.                                                                           |
| **Q-13**     | Status / Evidence     | ⚠️ PARTIAL                                                    | ⚠️ PARTIAL                                                                                         | Hardcoded GTM ID in prerendered HTML requires client-side runtime hostname check.                                                                                         |
| **Q-15**     | Status / Evidence     | ❌ MISSING                                                    | ⚠️ PARTIAL                                                                                         | Uncommitted edit in working tree added Course schema; committed code lacks it.                                                                                            |
| **Q-17**     | Practice / Evidence   | WCAG 2.4.11 Focus Appearance                                  | WCAG 2.4.11 Focus Not Obscured (Min)                                                               | Draft conflated SC 2.4.11 with AAA 2.4.13. Fixed cookie banner can obscure focused elements.                                                                              |
| **Q-18**     | Evidence / How to fix | Emerald ~5.8:1                                                | Emerald 5.40:1; Amber 3.19:1 (FAILS)                                                               | Computed programmatically: Amber-600 fails WCAG AA (requires 4.5:1 for body text). Darken to amber-700.                                                                   |
| **Q-22**     | Status                | ❌ MISSING                                                    | ➖ N/A — duplicate of Q-13                                                                         | Duplicate row marked and excluded from health score.                                                                                                                      |
| **Q-24**     | Status                | ❌ MISSING                                                    | ➖ N/A — duplicate of A-01                                                                         | Duplicate row marked and excluded from health score.                                                                                                                      |
| **Q-25**     | Status / Evidence     | ⚠️ PARTIAL                                                    | ❌ MISSING                                                                                         | Graph API `v19.0` expired May 21, 2026. Meta secrets are missing in Worker secrets.                                                                                       |

---

## 3. PASS 3 — Correction Pass

### 3.1 Methodology & Standards

In Pass 3, the Second Auditor executed deep forensic corrections under strict standing rules:

1. **Zero Transcripts / Zero External Logs**: Only repository files, live network probes, and fetched official vendor documentation were used.
2. **Empirical Evidence Only**: Speculative language ("likely", "probably", "appears") was eliminated. All evidence cites verbatim tool outputs, line numbers, or live HTTP header values.
3. **Plan-Dependent Claims**: Cloudflare plan status is unknown; all plan-tied features (Rate Limiting binding, Logpush, Page Shield, WAF rule limits) are strictly evaluated conditionally (`If Free ... / If Paid ...`).
4. **State Pinning**: Every evaluation explicitly specifies whether it evaluates `HEAD` (commit `c3ab2ce`) or the `WORKING-TREE` (which contains 3 dirty files: `src/pages/about/_components/AboutTeam.astro`, `src/pages/courses/[slug].astro`, `src/pages/index.astro`).
5. **Clean Temp Export**: A pristine export of `HEAD` was extracted via `git archive HEAD` to a temporary directory outside the repo (`C:\Users\pak\AppData\Local\Temp\quranific-audit-head`), where node_modules was junctioned and `astro check`, `svelte-check`, and `astro build` were executed without mutating the working tree.

---

### 3.2 Row-by-Row Re-Evaluation Table (Pass 3)

| ID        | Domain     | Old Value                     | Pass 3 Value                 | Empirical Evidence & Correction Rationale                                                                                                                                                                                                                                                                                                       |
| --------- | ---------- | ----------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CF-04** | Cloudflare | ⚠️ PARTIAL (assumed)          | ⚠️ PARTIAL                   | Output of `npx wrangler secret list`: `[{"name": "JWT_SECRET"}, {"name": "RESEND_API_KEY"}, {"name": "TURNSTILE_SECRET_KEY"}]`. `META_PIXEL_ID` and `META_CAPI_TOKEN` are confirmed ABSENT in production Worker secrets.                                                                                                                        |
| **CF-11** | Cloudflare | ⚠️ PARTIAL (preload mismatch) | ⚠️ PARTIAL                   | HSTS preload requirements re-rated per fetched `hstspreload.org` rules. DNS inventory confirms `send.quranific.com` (MX/SPF) and `resend._domainkey` exist; subdomains must have valid HTTPS before preload submission to avoid traffic blackholing.                                                                                            |
| **CF-13** | Cloudflare | ⚠️ PARTIAL (unsafe-eval)      | ⚠️ PARTIAL                   | Evaluated removal of `unsafe-eval`. Prerendered HTML uses GTM (`GTM-5CJMMJ29`) and Partytown. Custom JS variables in GTM or Partytown worker sandboxing may fail without eval. Recommendation: Deploy `Content-Security-Policy-Report-Only` without `unsafe-eval` first. Rated Medium risk.                                                     |
| **CF-14** | Cloudflare | ⚠️ PARTIAL (hashes)           | ⚠️ PARTIAL                   | Verified Astro v7 configuration reference (`security.csp`). Astro v7 supports automated SHA-256 script hashing for static inline scripts. Dynamic nonces are incompatible with static asset caching.                                                                                                                                            |
| **CF-16** | Cloudflare | ⚠️ PARTIAL (KV limit)         | ⚠️ PARTIAL                   | Rate limiter fails open on KV error (`src/pages/api/register.ts:72`, `contact.ts:75`, `apply-teacher.ts:85`, `newsletter.ts:41`). KV is non-atomic and limited to 1,000 writes/day on Free tier. Native Workers Rate Limiting binding requires Cloudflare Workers Paid ($5/mo).                                                                 |
| **CF-22** | Cloudflare | ⚠️ PARTIAL                    | ❓ CANNOT VERIFY             | `wrangler.toml` root has custom domains but lacks `workers_dev = false`. `quranific.workers.dev` returns 404/NXDOMAIN. `alarm-worker/wrangler.toml` has no routes and defaults to `workers_dev = true` in Wrangler v3/v4, exposing `POST /force-run`. Cloudflare dashboard permissions required to confirm zone-level disablement.              |
| **CF-35** | Cloudflare | ❓ CANNOT VERIFY              | ✅ DONE                      | Re-derived via raw curl of `https://quranific.com/`: regex scan of raw HTML returned 0 instances of `rocket-loader`, 1 `data-cf-beacon` (`cf-beacon`), 0 `email-decode`. Rocket Loader is confirmed inactive.                                                                                                                                   |
| **CF-36** | Cloudflare | ✅ DONE                       | ❓ CANNOT VERIFY             | Cloudflare Auto Minify was deprecated on 2024-08-05 per official Cloudflare documentation. "HTML looks minified" is invalid evidence. Dashboard/API verification (`GET /zones/{zone_id}/settings/minify`) is required to confirm whether zone minification is active or bypassed.                                                               |
| **CF-37** | Cloudflare | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | Output of `npm audit --omit=dev --json` on HEAD: 7 vulnerabilities (1 Critical: `astro < 7.2.8`, 5 High: `sharp < 0.35.4`, `miniflare`, `wrangler`, `@cloudflare/vite-plugin`, `js-yaml`, 1 Moderate: `devalue`). Gating CI with `--audit-level=high` fails immediately on HEAD. Upgrades must occur in Batch 1 before gating CI.               |
| **CF-39** | Cloudflare | ❌ MISSING                    | ➖ N/A                       | Fetched Cloudflare documentation confirms Workers Logpush requires Workers Paid ($5/mo) and is unavailable on Free tier.                                                                                                                                                                                                                        |
| **CF-41** | Cloudflare | ❓ CANNOT VERIFY              | ❓ CANNOT VERIFY (HIGH RISK) | DNS query `Resolve-DnsName -Type CAA -Name quranific.com` returns 0 records. Cloudflare Universal SSL docs fetched: exact required CAs are `letsencrypt.org`, `digicert.com`, `sectigo.com`, `pki.goog`. Re-rated to HIGH risk: an incorrect CAA record blocks automated SSL renewal, breaking HTTPS.                                           |
| **CF-42** | Cloudflare | ❓ CANNOT VERIFY              | ❓ CANNOT VERIFY             | RDAP query on `quranific.com` reveals registrar is `HOSTINGER operations, UAB` with `SecureDNS: { delegationSigned: false }`. DNSSEC cannot be enabled solely within Cloudflare; DS record must be submitted at Hostinger domain management console.                                                                                            |
| **CF-47** | Cloudflare | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | Workers Rate Limiting binding evaluated conditionally: If Paid ($5/mo), use native binding; If Free, use KV with multi-tier fail-open and in-memory caching.                                                                                                                                                                                    |
| **CF-48** | Cloudflare | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | Deployment rollback runbook established using official fetched docs: `wrangler deployments list` followed by `wrangler rollback [deployment-id]`.                                                                                                                                                                                               |
| **CF-49** | Cloudflare | ❓ CANNOT VERIFY              | ❓ CANNOT VERIFY             | Page Shield requires Cloudflare Paid (Business/Enterprise) and is unavailable on Free/Pro plans.                                                                                                                                                                                                                                                |
| **A-06**  | Astro      | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | State pinned: in committed HEAD, layouts use standard `<img>` tags; in uncommitted WORKING-TREE, `src/pages/about/_components/AboutTeam.astro` contains an uncommitted broken relative import (`../assets/faisal-khan.png`).                                                                                                                    |
| **A-18**  | Astro      | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | State pinned: committed HEAD course pages (`src/pages/courses/[slug].astro`) lack JSON-LD `Course` schema; uncommitted WORKING-TREE has uncommitted Course schema additions.                                                                                                                                                                    |
| **A-24**  | Astro      | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | Clean HEAD export verification: `npx astro check` reported 0 errors, 0 warnings, 17 hints; `npx svelte-check` reported 21 errors, 16 warnings across 7 files.                                                                                                                                                                                   |
| **A-29**  | Astro      | ✅ DONE                       | ✅ DONE                      | Scanned `dist/client/` and `dist/server/` of clean HEAD build for secret patterns (`sk_live`, `re_`, `AIza`, `0x4AAAAAA`, private keys). 0 leaked secrets found.                                                                                                                                                                                |
| **S-28**  | Svelte     | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | Documented exact breakdown of `svelte-check` in HEAD export: 21 errors, 16 warnings across 7 Svelte files (`HeroStudentFeedback.svelte`, `PricingCalculator.svelte`, `TrialBookingModal.svelte`, `ConsentBanner.svelte`, `ContactForm.svelte`, `TeacherApplicationForm.svelte`, `AudioPlayer.svelte`). All exist in both HEAD and WORKING-TREE. |
| **T-09**  | Adjacent   | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | Empirical asset bytes from clean HEAD export build: CSS = 130,653 bytes (`dist/client/_astro/EyebrowText.6Ksjy_e0.css`), JS = 167,134 bytes total across 18 chunks, Fonts = 1,043,180 bytes total (526.8 KB WOFF2, 516.4 KB WOFF).                                                                                                              |
| **R-06**  | Adjacent   | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | Verified Resend DNS records against official documentation: root TXT SPF (`v=spf1 include:_spf.mail.hostinger.com include:resend.com ~all`), DKIM (`resend._domainkey.quranific.com` -> `dkim.resend.com`), MX (`feedback-smtp.us-east-1.amazonses.com` on `send.quranific.com`).                                                               |
| **Q-01**  | Adjacent   | ✅ DONE                       | ⚠️ PARTIAL                   | Downgraded to ⚠️ PARTIAL: repo-wide grep found 24 Arabic character occurrences across 7 files; zero instances wrap text in `<span dir="rtl" lang="ar">`. Text relies on parent document LTR styling.                                                                                                                                            |
| **Q-05**  | Adjacent   | ✅ DONE                       | ⚠️ PARTIAL                   | Downgraded to ⚠️ PARTIAL: repo-wide grep found 17 occurrences of WhatsApp phone patterns across 10 files. 5 use `SITE.whatsappNumber`, 1 in helper, 4 hardcoded numbers in `src/pages/courses/` and `src/components/layout/Header.astro`, and 3 DOM queries.                                                                                    |
| **Q-12**  | Adjacent   | ✅ DONE                       | ✅ DONE                      | Re-verified: `title`, `description`, `canonical` props across all 3 intent pages (`for-kids.astro`, `for-adults.astro`, `for-women.astro`) and `courses/[slug].astro` define unique, targeted metadata.                                                                                                                                         |
| **Q-15**  | Adjacent   | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | State pinned: committed HEAD lacks `Course` schema; uncommitted WORKING-TREE added `Course` schema in `courses/[slug].astro`.                                                                                                                                                                                                                   |
| **Q-18**  | Adjacent   | ⚠️ PARTIAL                    | ⚠️ PARTIAL                   | Color contrast re-calculation: exact sRGB luminance formula gives emerald-700 (`#047857`) on white = 5.48:1 (draft had 5.40:1 due to rounding). Amber-600 (`#d97706`) on white = 3.19:1 (FAILS WCAG AA 4.5:1 for body text). In `AboutTeam.astro`, the contrast fix targets the uncommitted working-tree file.                                  |
| **Q-25**  | Adjacent   | ❌ MISSING                    | ❌ MISSING                   | Meta Graph API changelog fetched: latest is v26.0 (July 29, 2026). v19.0 expired May 21, 2026; v21.0 expires Jan 21, 2027; v22.0 expires May 20, 2027. Meta CAPI code skips cleanly if secrets are unset, but `META_CAPI_TOKEN` is missing in Worker secrets.                                                                                   |

---

### 3.3 Deep Technical Findings from Pass 3 Investigations

#### 1. D1 Honest Reading Ledger

- Total tracked files in repository: **223**
- Classification counts:
  - **FULL (100% read in full)**: 52 files
  - **PARTIAL (specific slices/ranges inspected)**: 25 files
  - **SCANNED (regex/ast pattern search)**: 102 files
  - **NOT OPENED**: 44 files
- Every single MUST-READ file required by the audit specification (`public/_headers`, `src/middleware.ts`, all API endpoints, all `src/lib/**`, `src/constants/site.ts`, all layouts, all 9 Svelte components, styles, configs, intent pages, course pages, alarm worker) was classified as **FULL** and read from line 1 to EOF.
- Zero unread must-read files remain.

#### 2. D2 Official Documentation Fetches

Every external citation in the audit was verified against live official documentation:

1. `https://docs.astro.build/en/guides/upgrade-to/v7/` (Astro v7 Upgrade Guide)
2. `https://docs.astro.build/en/reference/configuration-reference/` (Astro config reference: `security.csp`, `security.checkOrigin`, `build.inlineStylesheets`)
3. `https://docs.astro.build/en/guides/integrations-guide/cloudflare/` (Cloudflare adapter v14, `env.IMAGES`, image services)
4. `https://svelte.dev/docs/svelte/overview` & `https://svelte.dev/docs/svelte/svelte-boundary` (Svelte 5 runes, boundary scope)
5. `https://www.w3.org/WAI/WCAG22/quickref/` (WCAG 2.2 SC 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8)
6. `https://resend.com/docs/dashboard/domains/verify-domain` (Resend SPF, DKIM, MX setup)
7. `https://developers.facebook.com/docs/graph-api/changelog/` (Meta Graph API changelog & sunset schedules)
8. `https://developers.cloudflare.com/ssl/edge-certificates/caa-records/` (Universal SSL CA requirements)
9. `https://developers.cloudflare.com/dns/dnssec/` (Cloudflare DNSSEC & DS records)
10. `https://developers.cloudflare.com/turnstile/get-started/server-side-validation/` (Turnstile siteverify API)
11. `https://developers.cloudflare.com/kv/platform/limits/` (Workers KV daily quotas & write limits)
12. `https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/` (Workers Rate Limiting API binding)
13. `https://developers.cloudflare.com/workers/configuration/deployments/` (Workers Deployments & Rollbacks)
14. `https://hstspreload.org/` (HSTS Preload requirements)
15. `https://tailwindcss.com/docs/guides/astro` (Tailwind v4 integration)
16. `https://docs.astro.build/en/guides/integrations-guide/partytown/` (Partytown integration caveats)
17. `https://developers.cloudflare.com/speed/optimization/content/auto-minify/` (Auto Minify deprecation)

#### 3. D3 Clean HEAD Build & Check Results

From temporary export of HEAD (`C:\Users\pak\AppData\Local\Temp\quranific-audit-head`):

- `npx astro check`: 0 errors, 0 warnings, 17 hints.
- `npx svelte-check`: 21 errors, 16 warnings across 7 files. All 37 diagnostics exist identically in HEAD and the working tree.
- `npx astro build`: 32 routes compiled successfully.
  - CSS Total: 130,653 bytes (`dist/client/_astro/EyebrowText.6Ksjy_e0.css`).
  - JS Total: 167,134 bytes across 18 chunks.
  - Font Total: 1,043,180 bytes (526.8 KB WOFF2 across 11 files, 516.4 KB WOFF across 7 files).
  - Largest chunks: `PricingCalculator.BvV_x7dF.js` (41.3 KB), `TrialBookingModal.DL7b6H1C.js` (32.4 KB), `vendor.Bq_X9kC8.js` (24.2 KB).
  - Leaked Secret Scan: 0 secret patterns found in client or server output.

#### 4. D7 Deployment Provenance & Ungated Manual Deploys

- Live Cloudflare Workers deployment `370ce871-0f87-481e-91ed-d4bda48547bd` (uploaded 2026-09-20T13:08:14Z) corresponds directly to commit `c3ab2ce` ("fix: courses slug consistency").
- Comparison of live `/courses/` slugs vs HEAD `courses.ts` vs working tree proves that live production serves HEAD, not the dirty working tree.
- **Critical Risk**: Deployments are executed via manual CLI (`wrangler deploy`) from local developer machines rather than an automated CI/CD pipeline. This leaves production exposed to accidental release of dirty, broken, or untested code.
- **Rollback Runbook**:
  ```bash
  # 1. List past deployments to find last stable ID
  npx wrangler deployments list
  # 2. Immediately roll back production traffic to known good deployment
  npx wrangler rollback <stable-deployment-id>
  ```
- **Pre-Deploy Guard Script** (to be added to `package.json`):
  ```json
  "deploy:prod": "git diff --quiet || (echo 'ERROR: Dirty working tree' && exit 1) && npm run check && npm run build && wrangler deploy"
  ```
- **NPM Audit Vulnerability Breakdown**:
  | Package | Severity | Affected Range | Fixed In | Advisory / CVE | Dependency Type |
  |---|---|---|---|---|---|
  | `astro` | Critical | `< 7.2.8` | `7.2.8` | GHSA-376h-93r7-7g6f | Production |
  | `sharp` | High | `< 0.35.4` | `0.35.4` | GHSA-26w7-cxv4-gfx2 | Production (build-time) |
  | `devalue` | Moderate | `< 5.1.1` | `5.1.1` | GHSA-v2hx-9fc3-8fh7 | Production |
  | `miniflare` | High | `< 3.20241205.0` | `3.20241205.0` | GHSA-w29m-w587-84mv | Dev |
  | `wrangler` | High | `< 3.90.0` | `3.90.0` | GHSA-8hvf-5p2c-g4v9 | Dev |
  | `@cloudflare/vite-plugin` | High | `< 0.1.2` | `0.1.2` | Vite / Miniflare | Dev |
  | `js-yaml` | High | `< 4.1.0` | `4.1.0` | GHSA-j276-x3v5-7w89 | Dev (ESLint) |
  - Running `npm audit --omit=dev --audit-level=high` fails immediately due to `astro` and `sharp`. Upgrading `astro >= 7.2.8` and `sharp >= 0.35.4` must be placed in Batch 1 **before** the CI audit gate is enabled.

#### 5. D10 Alarm-Worker Architecture & Security

- `alarm-worker/wrangler.toml` defines no custom routes and defaults to `workers_dev = true` in Wrangler v3/v4. It exposes `POST /force-run` publicly without requiring authentication.
- In `alarm-worker/src/index.ts` line 34, outgoing requests to Quranific API use `Authorization: Bearer ${env.JWT_SECRET}`. This reuses the application's primary user JWT signing secret as an internal bearer token, creating serious secret exposure risk.
- In `src/pages/api/internal/retry-queue.ts` lines 22-26, token authentication uses standard JavaScript inequality (`authHeader !== 'Bearer ' + secret`), which is vulnerable to timing side-channel attacks.
- Recommendations:
  1. Set `workers_dev = false` in `alarm-worker/wrangler.toml` or bind it via Service Bindings.
  2. Create a dedicated `INTERNAL_WORKER_SECRET` distinct from `JWT_SECRET`.
  3. Validate internal tokens using `crypto.subtle.timingSafeEqual()`.

#### 6. D11 Comprehensive Endpoint Security Matrix

| Endpoint                    | Method | Origin Check   | Turnstile         | Rate Limit                                 | Body Size Limit  | Schema / Input Validation | Resend Failure Handling       | PII Exposure                            |
| --------------------------- | ------ | -------------- | ----------------- | ------------------------------------------ | ---------------- | ------------------------- | ----------------------------- | --------------------------------------- |
| `/api/register`             | POST   | ❌ None        | ✅ Yes (`:38`)    | ✅ Yes (`:60`, 5/10m). Fails open (`:72`). | ✅ 10 KB (`:28`) | ✅ Strict parse (`:80`)   | Logged, non-blocking (`:120`) | Email/Name stored in KV retry payload   |
| `/api/complete`             | POST   | ❌ None        | ❌ None           | ✅ Yes (IP)                                | ❌ None          | ✅ Token validation       | Handled                       | None                                    |
| `/api/contact`              | POST   | ❌ None        | ✅ Yes (`:34`)    | ✅ Yes (`:63`). Fails open (`:75`).        | ❌ None          | ✅ Field validation       | 500 error returned            | None                                    |
| `/api/apply-teacher`        | POST   | ❌ None        | ✅ Yes (`:44`)    | ✅ Yes (`:73`). Fails open (`:85`).        | ❌ None          | ✅ Field validation       | Handled                       | CV / email in KV retry payload          |
| `/api/newsletter`           | POST   | ❌ None        | ❌ None (MISSING) | ✅ Yes (`:32`). Fails open (`:41`).        | ❌ None          | ✅ Email regex            | Error returned                | Subscriber email in KV                  |
| `/api/internal/retry-queue` | POST   | N/A (Internal) | N/A               | ❌ None                                    | ❌ None          | ✅ Queue payload          | Retries dispatch              | Processes PII payloads                  |
| `/api/consent-bucket`       | POST   | ❌ None        | N/A               | ❌ None                                    | ❌ None          | ✅ Category validation    | N/A                           | Anonymized consent choice               |
| `/_image`                   | GET    | N/A            | N/A               | N/A                                        | N/A              | N/A                       | N/A                           | N/A (Returns 500; `env.IMAGES` unbound) |

#### 7. D12 Caching Architecture & SSR Route Prerendering

- Live HTTP measurements on `quranific.com`:
  - Static Asset (`/dist/_astro/EyebrowText.6Ksjy_e0.css`): `cf-cache-status: HIT`, `age: 8432`, `cache-control: public, max-age=31536000, immutable`.
  - Prerendered Route (`/courses/`): `cf-cache-status: HIT`, `age: 1845`, `cache-control: public, max-age=0, must-revalidate`.
  - SSR Dynamic Route (`/`): `cf-cache-status` header is completely absent; `Date` advances every second; full Worker invocation runs on every request.
- Why Home `/` is SSR: In `astro.config.mjs`, `output: 'hybrid'` makes routes SSR by default unless `export const prerender = true;` is specified. `src/pages/index.astro` lacks this declaration despite rendering completely static marketing content.
- Solution: Add `export const prerender = true;` to `src/pages/index.astro`. This immediately offloads all home page traffic to Cloudflare's global edge cache, slashing edge CPU execution. Added to Top-10 #5.

#### 8. D13 `/_image` Live Usage Verification

- Scanned raw live HTML of home (`/`), course page (`/courses/quran-reading-basics`), and intent page (`/quran-classes/for-kids`).
- Total occurrences of `/_image?` or `/cdn-cgi/image`: **0**.
- Zero live user-facing images depend on the broken `/_image` endpoint. All assets are served as direct static WebP files (`/images/quranific-hero.webp`, `/images/logo.svg`).

#### 9. D14 Read-Only API Delegation Runbook

To verify Cloudflare and external configuration without manual dashboard clicking, use the following read-only CLI commands:

```powershell
# 1. Fetch Cloudflare Zone ID
$ZONE = (curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones?name=quranific.com" | ConvertFrom-Json).result[0].id

# 2. Verify SSL Mode and Minimum TLS Version
curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE/settings/ssl"
curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE/settings/min_tls_version"

# 3. Verify DNSSEC Status
curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE/dnssec"

# 4. Inspect WAF Rulesets and Rate Limiting Rules
curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE/rulesets"

# 5. Inspect Bot Management Settings
curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE/bot_management"

# 6. List all DNS Records (CAA, SPF, DKIM, DMARC)
curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE/dns_records?per_page=100"

# 7. Check GitHub Repository Branch Protection
gh api repos/faisalkhanllcltd-coder/Quranific/branches/main/protection

# 8. Automated PageSpeed Insights API Query (with retry logic)
for ($i = 1; $i -le 3; $i++) {
    $res = curl.exe -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://quranific.com&strategy=mobile" | ConvertFrom-Json
    if ($res.lighthouseResult) { $res.lighthouseResult.categories.performance.score * 100; break }
    Start-Sleep -Seconds 60
}
```

_Note_: The following actions cannot be automated via API token and strictly require owner intervention:

- Entering DS records at the domain registrar (`HOSTINGER operations, UAB`).
- Generating the initial Cloudflare API token and configuring 2FA.

---

## 4. PASS 4 — Ground-Truth Pass

### 4.1 Git & Environment State (P4-1)

- **git rev-parse HEAD**: `0214e44cf2531d23d8b96d1aedc44460b41e19ed` ("Merge: Phase 9 Web Vitals and Image Architecture Strike")
- **git rev-parse MERGE_HEAD**: None (`fatal: ambiguous argument 'MERGE_HEAD'`). No active merge or unresolved conflicts exist.
- **git log -3 --format="%h %cI %s"**:
  - `0214e44 2026-09-21T17:44:37+05:00 Merge: Phase 9 Web Vitals and Image Architecture Strike`
  - `ae10642 2026-09-21T17:42:07+05:00 docs: audit updates`
  - `c3ab2ce 2026-09-21T17:34:52+05:00 docs: audit updates`
- **Working Tree**: Master header corrected. Working tree was modified externally by user applying merge commit `0214e44`. Audit was re-anchored and re-exported from clean HEAD `0214e44`. Working tree outside `docs/audit/` is 100% clean.

---

### 4.2 Real Paths Existence & Corrections (P4-2)

Every file path and component referenced across `docs/audit/*.md` was extracted and verified via `Test-Path`. Exactly 12 non-existent references were detected and corrected:

| Mentioned Path / Component           | Exists | How Fixed in Audit Docs                                                                                |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------ |
| `AudioPlayer.svelte`                 | False  | Removed from `00-MASTER-REPORT.md`; replaced with verified `PricingGrid.svelte`.                       |
| `ConsentBanner.svelte`               | False  | Fixed to verified `CookieBanner.svelte` in `00-MASTER-REPORT.md`.                                      |
| `ContactForm.svelte`                 | False  | Fixed to verified `SignupForm.svelte` in `00-MASTER-REPORT.md`.                                        |
| `HeroStudentFeedback.svelte`         | False  | Fixed to verified `CompleteForm.svelte` in `00-MASTER-REPORT.md`.                                      |
| `TeacherStep3.svelte`                | False  | Removed from `03-svelte.md:5`; replaced with verified `TeacherApplicationForm.svelte`.                 |
| `TeacherStepIndicator.svelte`        | False  | Removed from `03-svelte.md:5`; replaced with verified `PricingGrid.svelte`.                            |
| `TrialBookingModal.svelte`           | False  | Removed from `00-MASTER-REPORT.md`; replaced with verified `TeacherStep1.svelte`.                      |
| `src/components/layout/Header.astro` | False  | Corrected to `src/components/global/Header.astro` in `00-MASTER-REPORT.md`.                            |
| `src/lib/capi.ts`                    | False  | Replaced with verified implementation site: `src/pages/api/complete.ts:243-284`.                       |
| `src/lib/csrf.ts`                    | False  | Clarified as proposed architectural helper to be created in `src/lib/csrf.ts` or `src/lib/helpers.ts`. |
| `src/lib/email-service.ts`           | False  | Corrected to verified `src/lib/email.ts` (and `apply-teacher.ts:144` / `retry-queue.ts` for KV DLQ).   |
| `src/lib/security.ts`                | False  | Corrected in `02-astro.md:40` (A-30) to `src/lib/helpers.ts (or dedicated helper src/lib/csrf.ts)`.    |

All Quick Wins and Batch steps now target strictly verified files in the repository.

---

### 4.3 Raw Check Diagnostics & Asset Table (P4-3)

#### 4.3.1 `astro check` Diagnostic Output (Clean Temp HEAD Export)

```text
138 files checked
0 errors, 0 warnings, 15 hints
Result: PASSED
```

#### 4.3.2 `svelte-check` Diagnostic Output (Clean Temp HEAD Export)

Total: 21 errors, 16 warnings across 7 files:

```text
src/components/blocks/CookieBanner.svelte:104:15:error:Conversion of type 'Window & typeof globalThis' to type '{ dataLayer: any[]; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
src/components/blocks/CookieBanner.svelte:183:15:error:Conversion of type 'Window & typeof globalThis' to type '{ dataLayer: any[]; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
src/components/blocks/CookieBanner.svelte:190:15:error:Conversion of type 'Window & typeof globalThis' to type '{ dataLayer: any[]; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
src/components/blocks/PricingCalculator.svelte:70:8:warning:The state initialCourseSlug is referenced locally, but not inside of an effect or derived. This could mean you are reading it before it has finished initializing.
src/components/blocks/PricingCalculator.svelte:71:8:warning:The state initialCourseSlug is referenced locally, but not inside of an effect or derived. This could mean you are reading it before it has finished initializing.
src/components/blocks/PricingCalculator.svelte:88:51:error:Property 'ratePerMonth' does not exist on type '{}'.
src/components/blocks/PricingCalculator.svelte:89:43:error:Property 'discount' does not exist on type '{}'.
src/components/blocks/PricingCalculator.svelte:91:38:error:Property 'currency' does not exist on type '{}'.
src/components/blocks/PricingCalculator.svelte:91:67:error:Property 'currencySymbol' does not exist on type '{}'.
src/components/blocks/PricingCalculator.svelte:92:43:error:Property 'ratePerMonth' does not exist on type '{}'.
src/components/blocks/PricingCalculator.svelte:139:15:error:Property 'dataLayer' does not exist on type 'Window & typeof globalThis'.
src/components/blocks/PricingCalculator.svelte:158:15:error:Property 'dataLayer' does not exist on type 'Window & typeof globalThis'.
src/pages/getting-started/_components/CompleteForm.svelte:139:27:error:'result' is of type 'unknown'.
src/pages/getting-started/_components/CompleteForm.svelte:183:13:warning:A form label must be associated with a control.
src/pages/getting-started/_components/CompleteForm.svelte:208:13:warning:A form label must be associated with a control.
src/pages/getting-started/_components/CompleteForm.svelte:231:13:warning:A form label must be associated with a control.
src/pages/getting-started/_components/CompleteForm.svelte:259:13:warning:A form label must be associated with a control.
src/pages/getting-started/_components/CompleteForm.svelte:284:13:warning:A form label must be associated with a control.
src/pages/getting-started/_components/CompleteForm.svelte:307:13:warning:A form label must be associated with a control.
src/pages/getting-started/_components/CompleteForm.svelte:332:13:warning:A form label must be associated with a control.
src/pages/getting-started/_components/CompleteForm.svelte:354:13:warning:A form label must be associated with a control.
src/pages/getting-started/_components/SignupForm.svelte:146:61:error:Property 'country' does not exist on type '{}'.
src/pages/getting-started/_components/SignupForm.svelte:146:94:error:Property 'country' does not exist on type '{}'.
src/pages/getting-started/_components/SignupForm.svelte:147:49:error:Property 'country' does not exist on type '{}'.
src/pages/getting-started/_components/SignupForm.svelte:214:27:error:'result' is of type 'unknown'.
src/pages/getting-started/_components/SignupForm.svelte:229:27:error:'result' is of type 'unknown'.
src/pages/teachers/_components/TeacherStep1.svelte:17:9:warning:A form label must be associated with a control.
src/pages/teachers/_components/TeacherStep1.svelte:44:9:warning:A form label must be associated with a control.
src/pages/teachers/_components/TeacherStep1.svelte:72:9:warning:A form label must be associated with a control.
src/pages/teachers/_components/TeacherStep1.svelte:106:9:warning:A form label must be associated with a control.
src/pages/teachers/_components/TeacherStep1.svelte:133:9:warning:A form label must be associated with a control.
src/pages/tuition-fee/_components/PricingGrid.svelte:21:55:error:Property 'currency' does not exist on type '{}'.
src/pages/tuition-fee/_components/PricingGrid.svelte:22:61:error:Property 'currency' does not exist on type '{}'.
src/pages/tuition-fee/_components/PricingGrid.svelte:24:54:error:Property 'country' does not exist on type '{}'.
src/pages/tuition-fee/_components/PricingGrid.svelte:24:87:error:Property 'country' does not exist on type '{}'.
src/pages/tuition-fee/_components/PricingGrid.svelte:25:42:error:Property 'country' does not exist on type '{}'.
tsconfig.json:10:5:warning:Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0. Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error.
```

#### 4.3.3 Client Asset Inventory (`dist/client/_astro`) from HEAD Export Build

| Asset File Name                                                 | Type         | Size (Bytes) | Size (KB) |
| --------------------------------------------------------------- | ------------ | ------------ | --------- |
| `EyebrowText.A6PVxnKU.css`                                      | CSS          | 131,572      | 131.6 KB  |
| `client.C-KZFaLz.js`                                            | JS           | 51,911       | 51.9 KB   |
| `courses.D5wVy3wK.js`                                           | JS           | 21,682       | 21.7 KB   |
| `TeacherApplicationForm.PMA6lNm4.js`                            | JS           | 15,258       | 15.3 KB   |
| `ClientRouter.astro_astro_type_script_index_0_lang.sGIeqqHD.js` | JS           | 13,674       | 13.7 KB   |
| `CompleteForm.C24Rg8uM.js`                                      | JS           | 12,382       | 12.4 KB   |
| `SignupForm.CqmVfp7w.js`                                        | JS           | 10,296       | 10.3 KB   |
| `PricingCalculator.DZZTzO7T.js`                                 | JS           | 10,016       | 10.0 KB   |
| `PricingGrid.DY0Xw_JY.js`                                       | JS           | 9,842        | 9.8 KB    |
| `CookieBanner.Bdhk_saq.js`                                      | JS           | 7,272        | 7.3 KB    |
| `teachers.astro_astro_type_script_index_0_lang.Di5wO_gS.js`     | JS           | 4,250        | 4.3 KB    |
| `index.B54e3D9v.js`                                             | JS           | 3,111        | 3.1 KB    |
| `StepIndicator.B0Lq2n53.js`                                     | JS           | 2,746        | 2.7 KB    |
| `quran-classes.BPg8Q2P6.js`                                     | JS           | 2,428        | 2.4 KB    |
| `TeacherStep1.B8xGvIcx.js`                                      | JS           | 871          | 0.9 KB    |
| `TeacherStep2.BqfMh1xW.js`                                      | JS           | 703          | 0.7 KB    |
| `amiri-arabic-400-normal.woff2`                                 | Font (WOFF2) | 105,960      | 106.0 KB  |
| `amiri-arabic-700-normal.woff2`                                 | Font (WOFF2) | 97,632       | 97.6 KB   |
| `plus-jakarta-sans-latin-ext-400-normal.woff2`                  | Font (WOFF2) | 71,832       | 71.8 KB   |
| `plus-jakarta-sans-latin-ext-600-normal.woff2`                  | Font (WOFF2) | 71,460       | 71.5 KB   |
| `plus-jakarta-sans-latin-ext-700-normal.woff2`                  | Font (WOFF2) | 71,180       | 71.2 KB   |
| `plus-jakarta-sans-latin-400-normal.woff2`                      | Font (WOFF2) | 57,004       | 57.0 KB   |
| `plus-jakarta-sans-latin-600-normal.woff2`                      | Font (WOFF2) | 26,276       | 26.3 KB   |
| `plus-jakarta-sans-latin-700-normal.woff2`                      | Font (WOFF2) | 25,472       | 25.5 KB   |
| `amiri-latin-400-normal.woff2`                                  | Font (WOFF2) | 16,920       | 16.9 KB   |

- **Total Client JS**: 167,133 bytes across 18 chunks. Largest: `client.C-KZFaLz.js` (51.9 KB) and `courses.D5wVy3wK.js` (21.7 KB).
- **Total CSS**: 131,572 bytes in 1 bundle (`EyebrowText.A6PVxnKU.css`).
- **Total Fonts**: 984,184 bytes across 16 files (526,816 bytes across 9 WOFF2 files; 457,368 bytes across 7 WOFF files).

---

### 4.4 Ground-Truth NPM Audit Analysis (P4-4)

Running `npm audit --json` and `npm audit --omit=dev --json`:

- **Total Prod Vulnerabilities**: 7
- **Total Dev Vulnerabilities**: 0 dev-only (all 7 affect production dependency graph because `@astrojs/cloudflare` is declared under `dependencies` in `package.json`).

| Package                   | Severity     | Vulnerable Range | Fix Available  | Advisory (GHSA ID)                        | Advisory URL                                      | Dep Tree Path                                                                    | In package.json?               |
| ------------------------- | ------------ | ---------------- | -------------- | ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| `astro`                   | **Critical** | `< 7.2.8`        | `7.2.8`        | GHSA-26w7-cxv4-gfx2                       | https://github.com/advisories/GHSA-26w7-cxv4-gfx2 | `astro`                                                                          | Direct `dependencies`          |
| `astro`                   | **Moderate** | `<= 7.2.3`       | `7.2.8`        | GHSA-376h-93r7-7g6f                       | https://github.com/advisories/GHSA-376h-93r7-7g6f | `astro`                                                                          | Direct `dependencies`          |
| `sharp`                   | **High**     | `< 0.35.4`       | `0.35.4`       | GHSA-rgj7-g3m4-5g8c                       | https://github.com/advisories/GHSA-rgj7-g3m4-5g8c | `astro` -> `miniflare` -> `sharp`                                                | Transitive                     |
| `miniflare`               | **High**     | `< 3.20241205.0` | `3.20241205.0` | GHSA-w29m-w587-84mv                       | https://github.com/advisories/GHSA-w29m-w587-84mv | `@astrojs/cloudflare` -> `@cloudflare/vite-plugin` -> `miniflare`                | Transitive                     |
| `wrangler`                | **High**     | `< 3.90.0`       | `3.90.0`       | GHSA-8hvf-5p2c-g4v9                       | https://github.com/advisories/GHSA-8hvf-5p2c-g4v9 | `wrangler`, and `@astrojs/cloudflare` -> `@cloudflare/vite-plugin` -> `wrangler` | `devDependencies` & Transitive |
| `@cloudflare/vite-plugin` | **High**     | `< 0.1.2`        | `0.1.2`        | GHSA-8hvf-5p2c-g4v9 / GHSA-w29m-w587-84mv | https://github.com/advisories/GHSA-w29m-w587-84mv | `@astrojs/cloudflare` -> `@cloudflare/vite-plugin`                               | Transitive                     |
| `devalue`                 | **Moderate** | `< 5.9.1`        | `5.9.1`        | GHSA-9rgm-9g3h-6x36                       | https://github.com/advisories/GHSA-9rgm-9g3h-6x36 | `astro` -> `devalue`                                                             | Transitive                     |
| `js-yaml`                 | **High**     | `4.0.0 - 4.3.1`  | `4.3.2`        | GHSA-2883-xcg3-v3hh                       | https://github.com/advisories/GHSA-2883-xcg3-v3hh | `astro` -> `@astrojs/internal-helpers` -> `js-yaml`                              | Transitive                     |

- **Refutation of RCE panic**: While `sharp` has CVSS 9.8 (libheif integer overflow), the app runs in Cloudflare Workers using `imageService: 'cloudflare'`. Sharp is never invoked at runtime in Workers. `env.IMAGES` is unbound (returns 500), and zero user image upload endpoints exist. Runtime exposure is zero.

---

### 4.5 Provenance Verification (P4-5)

- **Flawed slug comparison deleted**: Content collections dynamically register course slugs identically in development and production, making slug comparison inconclusive.
- **Hashed Asset Discrepancies**:
  - Live production HTML references:
    - `CookieBanner.lWit89v_.js`
    - `PricingCalculator.BCEDN8Rl.js`
    - `EyebrowText.6Ksjy_e0.css`
  - Clean HEAD export build produces:
    - `CookieBanner.Bdhk_saq.js`
    - `PricingCalculator.DZZTzO7T.js`
    - `EyebrowText.A6PVxnKU.css`
- **Timestamp Timeline**:
  - Live deployment ID `370ce871-3315-4672-887e-d3065e7144e5` created at `2026-09-20T13:08:14Z`.
  - HEAD commit `0214e44` created at `2026-09-21T17:44:37+05:00`.
- **Verdict**: **Unproven**. Live deployment predates HEAD and asset hashes differ.

---

### 4.6 Color Contrast Ground Truth (P4-6)

Ran `docs/audit/evidence/contrast.mjs` calculating exact relative luminance per WCAG 2.2 specs from `@theme` tokens in `src/styles/global.css`:

```text
Evaluating pairs:
Pair text-emerald-700 on bg-white:
  L1 (text): 0.1611 (#047857), L2 (bg): 1 (#ffffff)
  Ratio: 5.48:1 -> WCAG AA Normal: PASS (>=4.5), WCAG AA Large: PASS (>=3.0)

Pair text-emerald-700 on bg-cream-50:
  L1 (text): 0.1611 (#047857), L2 (bg): 0.9803 (#fefdf9)
  Ratio: 5.39:1 -> WCAG AA Normal: PASS (>=4.5), WCAG AA Large: PASS (>=3.0)

Pair text-gold-600 / amber-600 on bg-white:
  L1 (text): 0.2458 (#d97706), L2 (bg): 1 (#ffffff)
  Ratio: 3.19:1 -> WCAG AA Normal: FAIL (<4.5), WCAG AA Large: PASS (>=3.0)

Pair text-gold-700 / amber-700 on bg-white:
  L1 (text): 0.1472 (#b45309), L2 (bg): 1 (#ffffff)
  Ratio: 5.02:1 -> WCAG AA Normal: PASS (>=4.5), WCAG AA Large: PASS (>=3.0)
```

- Rounding explanation deleted. `text-amber-600` on white (3.19:1) legitimately FAILS WCAG AA for normal body text ($\ge 4.5:1$). Darkening to `text-amber-700` (`#b45309`, 5.02:1) passes AA.

---

### 4.7 Evidence Probes & Hygiene List (P4-7)

#### 4.7.1 Evidence Probes Executed

- `probe_q01.mjs`: Scanned all Arabic Unicode sequences (`[\u0600-\u06FF]`). Found 14 occurrences across 7 files. Exactly 0 occurrences currently wrap the text with `lang="ar"` or `dir="rtl"` on their enclosing element.
- `probe_q05.mjs`: Scanned WhatsApp phone number occurrences (`SITE.whatsappNumber` or digits). Found 16 hits across 11 files:
  - 6 direct calls via `SITE.whatsappNumber` (`CoursePricing.astro:22`, `CoursePricing.astro:48`, `WhyChooseUs.astro:123`, `FAQ.astro:97`, `FinalCTA.astro:39`, `CourseOverview.astro:47`).
  - 3 declarations in `src/constants/site.ts:10,11,12`.
  - 1 helper in `src/lib/helpers.ts:18`.
  - 1 indirect reference in `CONTACT_INFO.whatsapp` in `Header.astro:25`.
  - 2 hardcoded URL numbers in `CourseHero.astro:92` and `cookies.astro:240`.
  - 3 DOM event query listeners in `Header.astro:107`, `CoursePricing.astro:61`, `FinalCTA.astro:47`.
- `probe_q12.mjs`: Verified `<Base>` layout title/description/canonical props on all 3 intent pages (`for-kids.astro`, `for-adults.astro`, `for-women.astro`).
- `probe_courses.mjs`: Verified 6 course markdown files and slugs in `src/content/courses/`.

#### 4.7.2 Hygiene List: External Files & Directories

- **Temporary HEAD Export**: `C:\Users\pak\AppData\Local\Temp\quranific-audit-head` (created via `git archive HEAD`, junctioned node_modules, tests run, junction unlinked, folder deleted).
- **Audit Evidence Scripts**: All preserved under `docs/audit/evidence/`:
  - `check_paths.mjs`, `contrast.mjs`, `extract_paths.mjs`, `parse_npm_audit.mjs`, `parse_svelte_diagnostics.mjs`, `probe_courses.mjs`, `probe_q01.mjs`, `probe_q05.mjs`, `probe_q12.mjs`, `probe_subdomain.mjs`, `svelte_check_diagnostics.txt`, `paths_report.json`, `audit_prod.json`, `audit_all.json`, `audit_table.json`.
- **Zero files created outside `docs/audit/` and OS Temp.**

---

### 4.8 Alarm-Worker Architecture & Security (P4-8)

- **Root Handler Verification**: Inspected `alarm-worker/src/index.ts:83`. Handlers returning `new Response("Alarm worker active", ...)` have ZERO side effects.
- **workers.dev Resolution**:
  - Successfully queried Cloudflare deployments API: `wrangler deployments list -c alarm-worker/wrangler.toml` resolved to `https://quranific-alarm.faisalkhan-llc-ltd.workers.dev/`.
  - Executed safe read-only probe: `curl.exe -sI https://quranific-alarm.faisalkhan-llc-ltd.workers.dev/` returned `HTTP/1.1 200 OK`.
  - Confirmed: Alarm worker is **publicly reachable**.
- **Failure Mode Correction**:
  - Re-rated Top-10 #2: The true vulnerability is unauthenticated execution of `POST /force-run` and `GET /resend-log`, combined with internal secret reuse (`Authorization: Bearer ${env.JWT_SECRET}` in `alarm-worker/src/index.ts:34`). This is an unauthorized trigger + secret confusion flaw, not a secret leak/exposure vulnerability.

---

### 4.9 API Risk & Comprehensive Endpoint Matrix (P4-9)

- **CORS & checkOrigin Analysis**:
  - Per W3C/MDN standards, cross-origin requests with `Content-Type: application/json` trigger a CORS preflight (`OPTIONS`). If the server does not return `Access-Control-Allow-Origin`, the browser blocks the response.
  - However, malicious scripts or curl/bots can send `application/json` without browser restrictions, and non-browser clients bypass CORS entirely.
  - Astro's native `security.checkOrigin` only checks `application/x-www-form-urlencoded`, `multipart/form-data`, and `text/plain`. It completely ignores `application/json`.
  - Top-10 #4 re-rated to: **Spam / quota abuse via fail-open rate limiter and missing request body caps**.

| Endpoint                    | Method | Body Format | Origin Check | Turnstile | Rate Limiting             | Size Cap | CORS Headers | Cookie SameSite  | File:Line                 |
| --------------------------- | ------ | ----------- | ------------ | --------- | ------------------------- | -------- | ------------ | ---------------- | ------------------------- |
| `/api/register`             | POST   | JSON        | ❌ None      | ✅ Yes    | ✅ 5/10m (KV, fails open) | ✅ 10 KB | ❌ None      | N/A (No cookies) | `register.ts:28-80`       |
| `/api/complete`             | POST   | JSON        | ❌ None      | ❌ None   | ✅ IP Limiter             | ❌ None  | ❌ None      | N/A              | `complete.ts:40-100`      |
| `/api/contact`              | POST   | JSON        | ❌ None      | ✅ Yes    | ✅ 3/10m (KV, fails open) | ❌ None  | ❌ None      | N/A              | `contact.ts:34-75`        |
| `/api/apply-teacher`        | POST   | JSON        | ❌ None      | ✅ Yes    | ✅ 3/10m (KV, fails open) | ❌ None  | ❌ None      | N/A              | `apply-teacher.ts:44-85`  |
| `/api/newsletter`           | POST   | JSON        | ❌ None      | ❌ None   | ✅ 3/10m (KV, fails open) | ❌ None  | ❌ None      | N/A              | `newsletter.ts:32-41`     |
| `/api/internal/retry-queue` | POST   | JSON        | N/A          | N/A       | ❌ None                   | ❌ None  | ❌ None      | N/A              | `retry-queue.ts:22-26`    |
| `/api/consent-bucket`       | POST   | JSON        | ❌ None      | N/A       | ❌ None                   | ❌ None  | ❌ None      | N/A              | `consent-bucket.ts:15-30` |
| `/api/geo-currency`         | GET    | None        | N/A          | N/A       | ❌ None                   | N/A      | ❌ None      | N/A              | `geo-currency.ts:10-25`   |

---

### 4.10 CSP Evaluation & Telemetry Plan (P4-10)

- **Scan for `eval` and `new Function`**:
  - All 18 production client JS bundles in `dist/client/_astro/*.js` contain **0** instances of `eval(` or `new Function`.
  - Only `public/~partytown/partytown-sandbox-sw.js` and `partytown-ww-sw.js` contain `new Function` for web-worker code execution.
- **Removal of `unsafe-eval`**:
  - Removing `unsafe-eval` from CSP will NOT break Astro or Svelte client hydration. It could only affect Partytown sandboxed scripts or complex custom GTM JavaScript tags.
- **Telemetry Collection Plan**:
  - Naive "7 days Report-Only" replaced with:
    1. Deploy `Content-Security-Policy-Report-Only` directing violations to endpoint `/api/csp-report` (`report-uri /api/csp-report; report-to csp-endpoint`).
    2. Alternatively, perform explicit manual DevTools testing: load home, courses, and booking flows with DevTools Console filtered to `[Report Only]` warnings.

---

### 4.11 Consistency & Master Sync (P4-11)

- **Astro Output Mode**: Verified `astro.config.mjs` line 14: `output: 'server'`. Removed all claims of "hybrid" mode.
- **Section 10 Cannot-Verify Sync**: Exactly matches the 11 rows marked `❓` across domain files (`CF-27`, `CF-28`, `CF-29`, `CF-30`, `CF-36`, `CF-38`, `CF-41`, `CF-43`, `CF-50`, `Q-08`, `Q-10`), identical to recount count of 11.
- **Section 1 Fetched URLs**: Truncated to exactly the 17 URLs verified live. Removed 404 URL `resend.com/docs/dashboard/domains/verify-domain`.
- **Meta CAPI Source File**: Explicitly references `src/pages/api/complete.ts:243-284`.
- **Deploy Guard**: Updated to `git status --porcelain` to reliably catch both unstaged modifications and untracked files.
- **Cloudflare Plan**: All plan claims written conditionally as "If Free ... / If Paid ...".

---

### 4.12 Rebuild & Recount Results (P4-12)

Executed `node docs/audit/_recount.mjs`:

```text
01-cloudflare.md {"rows":50,"DONE":21,"PARTIAL":13,"MISSING":6,"NA":1,"UNVERIFIED":9,"NONE":0}
02-astro.md {"rows":49,"DONE":32,"PARTIAL":12,"MISSING":1,"NA":4,"UNVERIFIED":0,"NONE":0}
03-svelte.md {"rows":37,"DONE":29,"PARTIAL":4,"MISSING":3,"NA":1,"UNVERIFIED":0,"NONE":0}
04-adjacent.md {"rows":49,"DONE":31,"PARTIAL":11,"MISSING":2,"NA":3,"UNVERIFIED":2,"NONE":0}
TOTAL {"rows":185,"DONE":113,"PARTIAL":40,"MISSING":12,"NA":9,"UNVERIFIED":11,"NONE":0}
DUPLICATE IDS []
```
