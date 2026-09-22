# 00 — Master Audit Report: Quranific.com

**Audit Date:** 2026-09-21  
**Auditor:** Antigravity AI (Second Auditor — Pass 4 Ground-Truth Pass)  
**Audited Commit:** `0214e44cf2531d23d8b96d1aedc44460b41e19ed` ("Merge: Phase 9 Web Vitals and Image Architecture Strike") on branch `main`  
**Working Tree State:** Clean outside `docs/audit/` (`git status --porcelain` shows modifications strictly inside `docs/audit/`). Note: Working tree did change externally during Pass 3 (merge commit was committed into HEAD by user; `git rev-parse MERGE_HEAD` returned none).  
**Clean Temp Export Verification:** HEAD extracted via `git archive HEAD` to external temporary path `C:\Users\pak\AppData\Local\Temp\quranific-audit-head` with junctioned `node_modules`. Verified via `npx astro check` (0 errors, 0 warnings, 15 hints across 138 files), `npx svelte-check` (21 errors, 16 warnings across 7 files), and `npx astro build` (32 routes compiled successfully in 53.92s; CSS: 131,572 bytes; JS: 167,133 bytes across 18 chunks; Fonts: 984,184 bytes across 16 files; 0 leaked secrets).  
**Live Site Verified:** `https://quranific.com` deployed 2026-09-20T13:08:14Z by `faisalkhan.llc.ltd@gmail.com` (deployment version `370ce871-0f87-481e-91ed-d4bda48547bd`, source: `Upload (wrangler)`). Provenance: **Unproven**. Hashed asset filenames referenced in live HTML (`CookieBanner.lWit89v_.js`, `PricingCalculator.BCEDN8Rl.js`) differ from HEAD export build hashes (`CookieBanner.Bdhk_saq.js`, `PricingCalculator.DZZTzO7T.js`); deployment timestamp (2026-09-20) precedes HEAD commits (2026-09-21).

---

## 1. Scope, Versions, and Docs Access

### Stack Versions (from package-lock.json & installed node_modules)

| Package               | Declared            | Installed Lockfile | Verified in node_modules | Notes                                                                                            |
| --------------------- | ------------------- | ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------ |
| `astro`               | `^7.2.0`            | **7.2.0**          | 7.2.0                    | Production uses `cloudflare` image service (`env.IMAGES`); Sharp not executed in Workers runtime |
| `@astrojs/cloudflare` | `^14.2.0`           | 14.2.0             | 14.2.0                   | Cloudflare Workers runtime, uses `locals.cfContext`                                              |
| `@astrojs/svelte`     | `^9.0.1`            | 9.0.1              | 9.0.1                    | Svelte 5 compilation support                                                                     |
| `@astrojs/sitemap`    | `^3.7.1`            | 3.7.2              | 3.7.2                    | Canonical sitemap generator with regex exclusion                                                 |
| `@astrojs/partytown`  | `^2.1.7`            | 2.1.7              | 2.1.7                    | Off-main-thread Web Worker execution for GTM                                                     |
| `svelte`              | `^5.0.0`            | 5.57.0             | 5.57.0                   | 100% Runes syntax across all 9 components                                                        |
| `tailwindcss`         | `^4.0.0`            | 4.2.4              | 4.2.4                    | Tailwind v4 Oxide engine with `@theme`                                                           |
| `@tailwindcss/vite`   | `^4.0.0`            | 4.2.4              | 4.2.4                    | Native Vite plugin integration                                                                   |
| `wrangler`            | `^4.131.2`          | 4.131.2            | 4.131.2                  | Cloudflare CLI / workerd runtime                                                                 |
| `zod`                 | `^4.4.3`            | 4.4.3              | 4.4.3                    | Server-side schema validation                                                                    |
| `jose`                | `^6.2.1`            | 6.2.3              | 6.2.3                    | Stateless JWT verification for session funnel                                                    |
| `sharp`               | `^0.35.2`           | 0.35.2             | 0.35.2                   | Build-time dependency (not executed in Workers runtime)                                          |
| TypeScript            | `^5.9.3`            | 5.9.3              | 5.9.3                    | Strict typechecking enabled                                                                      |
| Node.js               | required `>=20.0.0` | CI: Node 20        | Local: Node v22.14.0     | Fully compatible                                                                                 |

**Platform:** Cloudflare **Workers** with Static Assets (`wrangler.toml` `[assets]` block + `custom_domain = true` routes). Worker handles SSR dynamic requests; static assets and prerendered HTML are served directly from Cloudflare's global edge network without invoking the Worker.

**Output Mode:** `server` (on-demand rendering with selective `prerender = true`).

### Official Documentation Fetched Live (Zero Web Snippets)

Every external citation in this report was verified against live official vendor documentation:

1. `https://docs.astro.build/en/guides/upgrade-to/v7/` (Astro v7 Upgrade Guide)
2. `https://docs.astro.build/en/reference/configuration-reference/` (Astro config reference: `security.csp`, `security.checkOrigin`, `build.inlineStylesheets`)
3. `https://docs.astro.build/en/guides/integrations-guide/cloudflare/` (Cloudflare adapter v14, `env.IMAGES`, image services)
4. `https://svelte.dev/docs/svelte/overview` & `https://svelte.dev/docs/svelte/svelte-boundary` (Svelte 5 runes, boundary scope)
5. `https://www.w3.org/WAI/WCAG22/quickref/` (WCAG 2.2 SC 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8)
6. `https://resend.com/docs/dashboard/domains/introduction` (Resend SPF, DKIM, MX setup)
7. `https://developers.facebook.com/docs/graph-api/changelog/` (Meta Graph API changelog & sunset schedules: v26.0 current, v19.0 expired May 21, 2026, v21.0 expires Jan 21, 2027, v22.0 expires May 20, 2027)
8. `https://developers.cloudflare.com/ssl/edge-certificates/caa-records/` (Cloudflare Universal SSL CAs: `letsencrypt.org`, `digicert.com`, `sectigo.com`, `pki.goog`)
9. `https://developers.cloudflare.com/dns/dnssec/` (Cloudflare DNSSEC & DS record delegation)
10. `https://developers.cloudflare.com/turnstile/get-started/server-side-validation/` (Turnstile siteverify API)
11. `https://developers.cloudflare.com/kv/platform/limits/` (Workers KV daily quotas: 1,000 writes/day Free tier)
12. `https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/` (Workers Rate Limiting API binding)
13. `https://developers.cloudflare.com/workers/configuration/deployments/` (Workers Deployments & Rollbacks runbook)
14. `https://hstspreload.org/` (HSTS Preload requirements: valid HTTPS on all subdomains)
15. `https://tailwindcss.com/docs/guides/astro` (Tailwind v4 integration)
16. `https://docs.astro.build/en/guides/integrations-guide/partytown/` (Partytown integration caveats)
17. `https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS` (MDN CORS preflight and simple requests specification)

---

## 2. Scorecard

The following scorecard is derived strictly from the output of `node docs/audit/_recount.mjs`:

```
01-cloudflare.md {"rows":50,"DONE":21,"PARTIAL":13,"MISSING":6,"NA":1,"UNVERIFIED":9,"NONE":0}
02-astro.md {"rows":49,"DONE":32,"PARTIAL":12,"MISSING":1,"NA":4,"UNVERIFIED":0,"NONE":0}
03-svelte.md {"rows":37,"DONE":29,"PARTIAL":4,"MISSING":3,"NA":1,"UNVERIFIED":0,"NONE":0}
04-adjacent.md {"rows":49,"DONE":31,"PARTIAL":11,"MISSING":2,"NA":3,"UNVERIFIED":2,"NONE":0}
TOTAL {"rows":185,"DONE":113,"PARTIAL":40,"MISSING":12,"NA":9,"UNVERIFIED":11,"NONE":0}
DUPLICATE IDS []
```

### Consolidated Table

| Domain File         | Total Rows | ✅ DONE | ⚠️ PARTIAL | ❌ MISSING | ➖ N/A | ❓ CANNOT VERIFY | Health Ratio (DONE / Active) |
| ------------------- | ---------- | ------- | ---------- | ---------- | ------ | ---------------- | ---------------------------- |
| **01 — Cloudflare** | 50         | 21      | 13         | 6          | 1      | 9                | 21 / 49 (42.9%)              |
| **02 — Astro**      | 49         | 32      | 12         | 1          | 4      | 0                | 32 / 45 (71.1%)              |
| **03 — Svelte 5**   | 37         | 29      | 4          | 3          | 1      | 0                | 29 / 36 (80.6%)              |
| **04 — Adjacent**   | 49         | 31      | 11         | 2          | 3      | 2                | 31 / 46 (67.4%)              |
| **GRAND TOTAL**     | **185**    | **113** | **40**     | **12**     | **9**  | **11**           | **113 / 176 (64.2%)**        |

_(Note: Active items = Total rows (185) - N/A (9) = 176. Svelte health ratio is 29/36 = 80.6%)._

---

## 3. Top 10 Critical Findings

Ranked strictly by the Priority Ladder: **Correctness → Reliability → Security → Performance → Maintainability → Business Value**.

### 🔴 #1 — Security Header Architecture Parity Disparity (`unsafe-eval` in `_headers` vs `middleware.ts`)

- **ID:** CF-11, CF-13, S2
- **Domain:** Cloudflare / Astro Middleware
- **Priority Ladder:** Correctness & Security
- **Real Exposure for Quranific:** Cloudflare Workers Static Assets serves static and prerendered HTML directly from edge storage without executing `src/middleware.ts`. Prerendered routes (`/courses/`) receive headers strictly from `public/_headers` (which includes `'unsafe-eval'` in CSP), whereas SSR routes (`/`) receive headers from `src/middleware.ts` (which omits `'unsafe-eval'`). Prerendering additional routes before aligning headers will expose weaker CSP site-wide.
- **Client Build Evaluation:** Codebase AST scan of `dist/client` confirmed that zero application bundles in `dist/client/_astro/*.js` use `eval` or `new Function`. Only Partytown worker scripts (`dist/client/~partytown/partytown-atomics.js`, `partytown-sw.js`) utilize `new Function` to execute third-party scripts off-thread. Live SSR pages currently run without `'unsafe-eval'` in `src/middleware.ts` without errors.
- **Failure Mode:** XSS exposure on prerendered assets, or tracking breakdown if `'unsafe-eval'` is removed without verifying Partytown worker requirements.
- **Fix:** Deploy `Content-Security-Policy-Report-Only` with a report collector endpoint (`report-uri /api/csp-report` or manual DevTools console validation across all forms, GTM tags, and calculator interactions). Once verified clean, remove `'unsafe-eval'` from `public/_headers` line 10. Add `; preload` to HSTS in `src/middleware.ts` line 10.
- **Effort:** S | **Impact:** H | **Risk:** Low (with manual/collector verification)

---

### 🔴 #2 — Alarm-Worker Unauthenticated HTTP Triggers & Secret Reuse

- **ID:** CF-22, CF-48, D10
- **Domain:** Cloudflare Workers (`alarm-worker`)
- **Priority Ladder:** Correctness & Security
- **Real Exposure for Quranific:** `alarm-worker` is publicly reachable on `https://quranific-alarm.faisalkhan-llc-ltd.workers.dev` (verified via HEAD probe returning HTTP 200 OK; the root handler returns status 200 text with zero side effects). However, `alarm-worker/src/index.ts` lines 33 and 56 expose `/force-run` (POST) and `/resend-log` (GET) with NO authentication check whatsoever. An external caller can trigger arbitrary batch runs of the retry queue or query Resend logs. Furthermore, line 38 forwards `Authorization: Bearer ${env.JWT_SECRET}`, creating dangerous secret reuse across separate trust domains (the cookie-signing secret is reused as an internal service bearer token). In `src/pages/api/internal/retry-queue.ts` line 67, token comparison uses standard JavaScript `!==` (non-constant-time equality).
- **Failure Mode:** Unauthenticated trigger + secret reuse. An external attacker can exhaust Resend sending quotas, flush dead-letter queues prematurely, or trigger timing side-channel attacks against the shared secret. (Note: the secret is not exposed in the response payload).
- **Fix:** (1) Set `workers_dev = false` in `alarm-worker/wrangler.toml`. (2) Require an incoming `Authorization: Bearer <token>` check in `alarm-worker/src/index.ts`. (3) Introduce a separate, dedicated `INTERNAL_WORKER_SECRET` distinct from `JWT_SECRET`. (4) Compare bearer tokens in `retry-queue.ts` using `crypto.subtle.timingSafeEqual()`.
- **Effort:** S | **Impact:** H | **Risk:** Low

---

### 🔴 #3 — Ungated Manual Deploys via Workstation CLI & Silent CI Audit Suppression

- **ID:** CF-37, CF-48, S18, D7
- **Domain:** CI/CD & Deployment Provenance
- **Priority Ladder:** Reliability & Supply Chain
- **Real Exposure for Quranific:** Live deployment `370ce871-0f87-481e-91ed-d4bda48547bd` was deployed manually via `Upload (wrangler)` from a developer workstation. Manual deploys bypass CI entirely. Furthermore, `.github/workflows/ci.yml` line 29 runs `npm audit --audit-level=critical || true`, where `|| true` silently suppresses all vulnerability failures.
- **Empirical NPM Audit Breakdown:** Both `npm audit --json` and `npm audit --omit=dev --json` report exactly 7 vulnerabilities (1 Critical, 5 High, 1 Moderate). Because `@astrojs/cloudflare` is in production `dependencies` in `package.json`, its entire dependency tree sits in the production dependency graph:
  | Package | Severity | Range | Dependency Location | Vulnerability / Advisory | Fix Available |
  | --- | --- | --- | --- | --- | --- |
  | `astro` | Critical | `<=7.2.7` | `dependencies` (direct) | GHSA-26w7-cxv4-gfx2 (RCE via AVIF `<7.2.8`) & GHSA-376h-93r7-7g6f (Auth bypass `<=7.2.3`) | Yes (`>=7.2.8`) |
  | `sharp` | High | `<0.35.4` | Transitive (via `miniflare`) | GHSA-rgj7-g3m4-5g8c (libheif vulnerabilities `<0.35.4`) | Yes (`>=0.35.4`) |
  | `miniflare` | High | `<=0.0.0-fec45ed61 \|\| 4.20250508.3 - 5.20260908.0-alpha` | Transitive (via `@cloudflare/vite-plugin`) | High via `sharp` | Yes |
  | `wrangler` | High | `<=0.0.0-7ae5dd357 \|\| 4.16.0 - 4.130.0` | `devDependencies` & Transitive under vite-plugin | High via `miniflare` | Yes |
  | `@cloudflare/vite-plugin` | High | `<=0.0.0-fff677e35 \|\| 1.2.3 - 1.54.6` | Transitive (via `@astrojs/cloudflare`) | High via `miniflare` and `wrangler` | Yes |
  | `devalue` | Moderate | `<5.9.1` | Transitive (via `astro`) | GHSA-9rgm-9g3h-6x36 (DoS via malformed input `<5.9.1`) | Yes |
  | `js-yaml` | High | `4.0.0 - 4.3.1` | Transitive (via `astro` & `@astrojs/internal-helpers`) | GHSA-2883-xcg3-v3hh (CPU DoS on empty merge sources) | Yes |
- **Failure Mode:** Gating CI with `--audit-level=high` fails immediately on HEAD; uncommitted local edits can be deployed directly to production.
- **Fix:** (1) Upgrade `astro >= 7.2.8` and `sharp >= 0.35.4` in `package.json`. (2) Add pre-deploy guard script to `package.json`: `"deploy:prod": "git status --porcelain | grep -q . && (echo 'ERROR: Dirty tree' && exit 1) || (npm run check && npm run build && wrangler deploy)"`. (3) Update CI command to `npm audit --omit=dev --audit-level=high`.
- **Effort:** M | **Impact:** H | **Risk:** Low

---

### 🟠 #4 — Missing Turnstile, Weak Bot Challenges & Fail-Open Rate Limiting on Public APIs

- **ID:** CF-15, CF-16, A-30, S6, D11
- **Domain:** Cloudflare / Astro API Security
- **Priority Ladder:** Reliability & Security
- **Real Exposure for Quranific:** Per official MDN CORS specifications, requests with `Content-Type: application/json` trigger browser CORS preflights (`OPTIONS`). However, server endpoints calling `request.json()` parse incoming bodies as JSON regardless of the declared `Content-Type` header (e.g. `text/plain` bypasses simple request preflights). Furthermore, `/api/newsletter.ts` has ZERO bot challenge (Turnstile is not verified).
- **Ground-Truth Endpoint Audit (All 8 Endpoints from Code):**
  | Endpoint | Method | Body Format | Authentication | Bot / Turnstile | Rate Limiter | CORS Headers | Cookie SameSite |
  | --- | --- | --- | --- | --- | --- | --- | --- |
  | `src/pages/api/register.ts` | POST | `request.formData()` L41 | None | Turnstile L57 | KV 4/60s (fails open L72) | None | `SameSite=Strict; HttpOnly; Secure` L127 |
  | `src/pages/api/complete.ts` | HEAD, GET, POST | `request.formData()` L108 | JWT (`q_session` L110) | None (session gated) | None | None | `SameSite=Strict; HttpOnly; Secure` |
  | `src/pages/api/contact.ts` | POST | `request.json()` L35 | None | Turnstile L60 | KV 4/60s (fails open L75) | None | None |
  | `src/pages/api/apply-teacher.ts` | POST | `request.json()` L43 | None | Turnstile L70 | KV 4/60s (fails open L85) | None | None |
  | `src/pages/api/newsletter.ts` | POST | `request.json()` L21 | None | **NONE** | KV 4/60s (fails open L41) | None | None |
  | `src/pages/api/internal/retry-queue.ts` | GET, POST | `request.json()` L14 | Bearer (`JWT_SECRET` L67 `!==`) | None (internal) | None | None | None |
  | `src/pages/api/consent-bucket.ts` | GET | None | None | None | None | `Access-Control-Allow-Origin: allowedOrigin` L35 | None |
  | `src/pages/api/geo-currency.ts` | GET | None | None | None | None | `Access-Control-Allow-Origin: allowedOrigin` L42 | None |
- **Failure Mode:** Spam / quota abuse + fail-open limiter. Malicious bots can flood `/api/newsletter` and contact endpoints, exhausting Resend email quotas and Cloudflare KV daily write limits (1,000 writes/day on Free tier).
- **Fix:** (1) Add Turnstile challenge to `/api/newsletter.ts`. (2) Add explicit `Origin` validation helper in `src/lib/helpers.ts` (or `src/lib/csrf.ts`). (3) If on Paid plan ($5/mo), configure native Workers Rate Limiting binding; if on Free plan, implement an in-memory sliding window fallback that fails closed on persistent abuse.
- **Effort:** S | **Impact:** H | **Risk:** Low

---

### 🟠 #5 — Outdated Meta CAPI Endpoint Version (`v19.0`) in `complete.ts`

- **ID:** Q-25, CF-04, S20, D9
- **Domain:** Cloudflare Secrets / Meta Tracking
- **Priority Ladder:** Business Value & Reliability
- **Real Exposure for Quranific:** `src/pages/api/complete.ts` line 273 targets Meta Graph API `v19.0`, which officially expired on May 21, 2026 per official Meta changelog (latest version is `v26.0`, released July 29, 2026; `v21.0` expires Jan 21, 2027; `v22.0` expires May 20, 2027). Furthermore, `npx wrangler secret list` confirms that `META_PIXEL_ID` and `META_CAPI_TOKEN` are ABSENT from Worker secrets. `complete.ts` lines 243–247 cleanly skip execution when secrets are unset (`console.log('[CAPI] Missing credentials, skipping...')`), making it safe from runtime crashes but 100% dead code in production.
- **Failure Mode:** Server-side conversion tracking is non-functional; Meta ad attribution and ROAS measurement are degraded.
- **Fix:** Update endpoint in `src/pages/api/complete.ts` line 273 to `v26.0` (or `v22.0`). Run `npx wrangler secret put META_CAPI_TOKEN` with a valid System User access token. Note: Pixel ID is public client metadata; only `META_CAPI_TOKEN` must be secret.
- **Effort:** S | **Impact:** M | **Risk:** Low

---

### 🟠 #6 — Unprerendered Dynamic Home Page `/` Burning Worker CPU Quotas

- **ID:** A-02, CF-47, S15, D12
- **Domain:** Astro / Cloudflare Platform Performance
- **Priority Ladder:** Reliability & Performance
- **Real Exposure for Quranific:** `src/pages/index.astro` lacks `export const prerender = true;`. In `output: 'server'`, any page without this declaration executes Worker SSR on every request. Live measurement confirms `/` returns NO `cf-cache-status` header; `Date` advances every second. Home contains zero dynamic user data, zero cookies, and zero session logic. Cloudflare Free plan caps CPU time at 10ms per request and 100,000 requests/day. Uncached home page traffic burns Worker CPU and risks HTTP 1102 quota exhaustion during ad campaigns. (If Free plan: 10ms CPU limit risks Worker exceptions; if Paid plan: CPU limits are up to 30s wall time).
- **Failure Mode:** Edge worker downtime and HTTP 1102 errors during traffic spikes.
- **Fix:** Add `export const prerender = true;` to `src/pages/index.astro` and static marketing pages (`/about`, `/faq`, `/testimonials`, `/teachers`, `/tuition-fee`, `/legal/*`) after confirming Header Parity.
- **Effort:** S | **Impact:** H | **Risk:** Low

---

### 🟠 #7 — GTM Analytics Firing from Preview & Staging Deployments

- **ID:** Q-13, S4
- **Domain:** Tracking & Business Value
- **Priority Ladder:** Business Value & Maintainability
- **Real Exposure for Quranific:** GTM container `GTM-5CJMMJ29` is hardcoded in `src/layouts/Base.astro`. On prerendered static pages, environment variables are evaluated at build time. Preview deployments generated from the same build will send tracking beacons, corrupting Google Ads conversion optimization and GA4 metrics.
- **Failure Mode:** Skewed conversion signals and wasted ad spend.
- **Fix:** Add a client-side runtime hostname check (`window.location.hostname === 'quranific.com'`) before bootstrapping GTM, or configure a hostname exception rule inside the GTM container.
- **Effort:** S | **Impact:** M | **Risk:** Low

---

### 🟡 #8 — Missing Universal SSL CAA Records & Incomplete DNSSEC

- **ID:** CF-41, CF-42, D8
- **Domain:** DNS & Domain Security
- **Priority Ladder:** Security & Reliability
- **Real Exposure for Quranific:** Live DNS probe `Resolve-DnsName -Type CAA -Name quranific.com` returns 0 records. Official Cloudflare documentation confirms Universal SSL certificates are issued by Let's Encrypt, DigiCert, Sectigo, or Google Trust Services. An incorrect CAA record blocks automated SSL renewal, taking down HTTPS site-wide. RDAP query reveals registrar is `HOSTINGER operations, UAB` with `SecureDNS: { delegationSigned: false }`. Cloudflare dashboard cannot enable DNSSEC alone; the DS record must be manually submitted at Hostinger domain control panel.
- **Failure Mode:** Failed automated TLS certificate renewal; vulnerability to DNS spoofing.
- **Fix:** (1) Add exact CAA records for Universal SSL: `issue "letsencrypt.org"`, `issue "digicert.com"`, `issue "sectigo.com"`, `issue "pki.goog"`. (2) Generate DS record in Cloudflare DNS and add it in Hostinger control panel.
- **Effort:** S | **Impact:** H | **Risk:** Low (if exact CAs used)

---

### 🟡 #9 — Color Contrast Failures on Badge & Avatar Accent Tokens

- **ID:** Q-18, A-31, D13
- **Domain:** Accessibility (WCAG 2.2 AA)
- **Priority Ladder:** Maintainability & Compliance
- **Real Exposure for Quranific:** Empirical measurement via `docs/audit/evidence/contrast.mjs`:
  - `#047857` (`emerald-700`) on `white` = **5.48:1** (PASSES WCAG AA normal text $\ge 4.5:1$).
  - `#047857` on `#fefdf9` (`cream-50`) = **5.39:1** (PASSES WCAG AA normal text $\ge 4.5:1$).
  - `#d97706` (`gold-600` / `amber-600`) on `white` = **3.19:1** (FAILS WCAG AA normal text $< 4.5:1$; PASSES large text $\ge 3.0:1$).
  - In `src/pages/about/_components/AboutTeam.astro` line 22, `text-amber-600` on white fails normal text contrast. Darkening to `text-amber-700` (`#b45309`) yields **5.02:1** (PASSES WCAG AA normal text $\ge 4.5:1$).
- **Failure Mode:** Non-compliance with WCAG 2.2 SC 1.4.3 (Contrast Minimum); low legibility for visually impaired users.
- **Fix:** Darken amber avatar initial token in `AboutTeam.astro` line 22 to `text-amber-700` (`#b45309`).
- **Effort:** S | **Impact:** M | **Risk:** Low

---

### 🟡 #10 — 346 KB Unconditional Font Preloads on Mobile Networks

- **ID:** A-20, S9, T-09, D3
- **Domain:** Performance / Core Web Vitals
- **Priority Ladder:** Performance
- **Real Exposure for Quranific:** `src/layouts/Base.astro` preloads 5 woff2 font files unconditionally (346.2 KB total). Amiri Arabic fonts (203.6 KB) are preloaded even on English-only marketing pages where no Arabic text is rendered. In the clean HEAD export build, fonts total 984,184 bytes across 16 files (526,816 bytes across 9 WOFF2 files, 457,368 bytes across 7 WOFF files). Preloading fonts unconditionally on mobile networks saturates bandwidth and delays critical LCP hero image rendering.
- **Failure Mode:** Degraded mobile LCP on Google Ads landing pages.
- **Fix:** Remove `<link rel="preload">` for Amiri Arabic fonts on English-only routes, allowing CSS `unicode-range` to fetch the font on demand only when Arabic glyphs exist in the DOM.
- **Effort:** S | **Impact:** M | **Risk:** Low

---

## 4. Backlog of Lower-Impact Items

Hygiene, maintenance, and minor syntax improvements moved out of the Top 10:

- **S-03 (`$derived.by` syntax):** `src/components/blocks/PricingCalculator.svelte` line 114 uses `let billingContext = $derived(() => {...})`. Refactor to `$derived.by()` pattern.
- **S-26 (`<svelte:boundary>`):** Absence of error boundary inside Svelte islands. Wrap island roots in `<svelte:boundary>` with accessible fallback cards.
- **CF-40 (Pragma headers):** Remove obsolete `Pragma: no-cache` and `Expires: 0` headers from `src/pages/getting-started/complete.astro`.
- **A-27 (Config cleanup):** Deduplicate `optimizeDeps.exclude` arrays in `astro.config.mjs`.
- **Q-01 (Arabic text wrapping):** `docs/audit/evidence/probe_q01.mjs` found 14 Arabic occurrences across 7 files; wrap Arabic text snippets in `<span dir="rtl" lang="ar">`.
- **Q-05 (Hardcoded WhatsApp links):** `docs/audit/evidence/probe_q05.mjs` found 16 occurrences across 11 files (6 direct via SITE, 3 definitions in `site.ts`, 1 helper, 1 indirect via `CONTACT_INFO`, 2 hardcoded URLs in `CourseHero.astro:92` and `cookies.astro:240`, 3 DOM event query listeners). Standardize on `SITE.whatsappNumber` / `SITE.whatsappLink`. Note: `src/components/global/Header.astro` contains zero WhatsApp links.

---

## 5. Quick Wins (≤30 minutes each)

| #   | Action                                                                           | Target File / Location                                    | ID    | Est. Time |
| --- | -------------------------------------------------------------------------------- | --------------------------------------------------------- | ----- | --------- |
| 1   | Remove `unsafe-eval` from static headers CSP (after Report-Only test)            | `public/_headers` line 10                                 | CF-13 | 2 min     |
| 2   | Add `; preload` to HSTS in middleware                                            | `src/middleware.ts` line 10                               | CF-11 | 2 min     |
| 3   | Add deploy guard script to `package.json` to prevent dirty workstation deploys   | `package.json`                                            | CF-48 | 5 min     |
| 4   | Fix `$derived.by()` in PricingCalculator                                         | `src/components/blocks/PricingCalculator.svelte` line 114 | S-03  | 5 min     |
| 5   | Remove legacy `Pragma` and `Expires` headers                                     | `src/pages/getting-started/complete.astro` lines 13–14    | CF-40 | 2 min     |
| 6   | Add explicit `workers_dev = false` to root and alarm-worker                      | `wrangler.toml` and `alarm-worker/wrangler.toml`          | CF-22 | 2 min     |
| 7   | Set top-level `[observability] enabled = true`                                   | `wrangler.toml` line 24                                   | CF-07 | 1 min     |
| 8   | Darken amber text from 600 (`#d97706`) to 700 (`#b45309`) for WCAG AA compliance | `src/pages/about/_components/AboutTeam.astro` line 22     | Q-18  | 5 min     |
| 9   | Add incoming auth check and separate internal secret in alarm-worker             | `alarm-worker/src/index.ts` lines 33, 56                  | CF-48 | 15 min    |
| 10  | Add Turnstile bot challenge to newsletter endpoint                               | `src/pages/api/newsletter.ts`                             | CF-15 | 20 min    |

---

## 6. Source Conflicts and Resolutions

### 6A — Header Architecture: Middleware vs `_headers`

- **Conflict:** In Cloudflare Workers with Static Assets, `src/middleware.ts` sets security headers on SSR routes, while `public/_headers` sets headers on static assets. When assets bypass the Worker, `_headers` takes effect.
- **Resolution:** `_headers` line 10 contains `'unsafe-eval'` in CSP and includes `preload` in HSTS, whereas `middleware.ts` has NO `unsafe-eval` but lacks `preload`. To prevent security regression when converting SSR routes to static prerendered HTML, `_headers` must be tested in Report-Only mode and updated to match the strictness of `middleware.ts`.

### 6B — Edge Caching of Worker-Generated HTML

- **Conflict:** The initial draft claimed `CDN-Cache-Control` was working and prevented per-user server branching.
- **Resolution:** Live measurement with `curl.exe -sI` against SSR routes (`/`) proved that `cf-cache-status` is completely absent and `Date` updates on every request. Cloudflare CDN does NOT cache Worker dynamic responses on custom domains by default. Prerendering (`prerender = true`) is the only native mechanism that guarantees edge CDN caching without specialized Cache API code.

### 6C — CSP Implementation: Nonces vs Hashes

- **Conflict:** Previous recommendations suggested implementing dynamic CSP nonces.
- **Resolution:** Nonces require per-request random generation on the server, which breaks edge-cached and prerendered static HTML. Astro 7 natively supports hash-based CSP via `security.csp`. Static inline snippets and Partytown bootstrapping must use SHA-256 script hashes.

### 6D — Deployment Provenance: Live vs HEAD

- **Conflict:** The initial draft asserted that live production was proven identical to HEAD via slug comparison.
- **Resolution:** Course slugs are static business content that did not change across commits. In Pass 4, comparing empirical hashed asset filenames revealed that live production serves `CookieBanner.lWit89v_.js` and `PricingCalculator.BCEDN8Rl.js`, whereas the clean HEAD export build generates `CookieBanner.Bdhk_saq.js` and `PricingCalculator.DZZTzO7T.js`. Furthermore, Cloudflare API deployment timestamp (`2026-09-20T13:08:14Z`) precedes the commit timestamp of HEAD `0214e44` (`2026-09-21T17:44:37+05:00`). Therefore, live provenance is **Unproven** (live reflects an earlier build prior to recent commits).

---

## 7. Deliberate Deviations That Look Non-Standard But Are Justified

| Deviation                                                          | Official Justification                                                                                                                      | Documented Evidence                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Direct `fetch` to Resend API (no SDK)**                          | Zero external dependencies; avoids Node.js stream polyfills. (Resend supports Workers, but direct fetch is a clean, minimal design choice). | `src/lib/email.ts` L2                                           |
| **Asynchronous Consent Bucket Resolution (`/api/consent-bucket`)** | Ensures prerendered HTML remains 100% byte-identical across international visitors while dynamically applying GDPR/GPC compliance.          | `src/pages/api/consent-bucket.ts`                               |
| **`locals.cfContext.waitUntil` pattern**                           | Official `@astrojs/cloudflare` v14 accessor. The draft claim that `locals.runtime.ctx` should be used was refuted (it throws in v14).       | `node_modules/@astrojs/cloudflare/dist/utils/cf-helpers.js` L14 |
| **Cloudflare KV for Dead-Letter Queue**                            | Provides durable, zero-maintenance storage for failed email payloads without requiring external SQL databases or SQS queues.                | `src/pages/api/apply-teacher.ts` L144 & `retry-queue.ts`        |
| **GTM execution via Partytown Web Worker**                         | Offloads Google Tag Manager and tracking overhead from the main UI thread to prevent TBT/INP degradation on mobile devices.                 | `astro.config.mjs` L62                                          |

---

## 8. Implementation Roadmap

### Batch 1 — Immediate Security, Hygiene & Deploy Guard (Must Ship First)

_CRITICAL: Upgrade dependencies and establish deploy guard BEFORE gating CI._

1. Upgrade `astro >= 7.2.8` and `sharp >= 0.35.4` in `package.json` and run `npm install` (standard dependency hygiene).
2. Add deploy guard script to `package.json`:
   ```json
   "deploy:prod": "git status --porcelain | grep -q . && (echo 'ERROR: Dirty working tree' && exit 1) || (npm run check && npm run build && wrangler deploy)"
   ```
3. Update `.github/workflows/ci.yml` audit command to `npm audit --omit=dev --audit-level=high`.
4. Deploy `Content-Security-Policy-Report-Only` with report collector or manual DevTools verification before removing `'unsafe-eval'` in `public/_headers`.
5. Add `; preload` to HSTS in `src/middleware.ts` line 10.
6. Enforce incoming authentication on `alarm-worker/src/index.ts` and separate `INTERNAL_WORKER_SECRET` from `JWT_SECRET`. Use `crypto.subtle.timingSafeEqual()` in `retry-queue.ts`.
7. Add explicit `Origin` validation helper in `src/lib/helpers.ts` (or `src/lib/csrf.ts`) checking `request.headers.get('origin') === 'https://quranific.com'`.

- **Verification:** Run `curl.exe -sI https://quranific.com/courses/` to verify headers. Verify `npm audit --omit=dev --audit-level=high` exits 0.

### Batch 2 — Svelte 5 Correctness & Diagnostics

1. Resolve 21 errors and 16 warnings identified by `npx svelte-check` across the real 6 Svelte files (`CookieBanner.svelte`, `PricingCalculator.svelte`, `CompleteForm.svelte`, `SignupForm.svelte`, `TeacherStep1.svelte`, `PricingGrid.svelte`) and `tsconfig.json`.
2. Refactor `PricingCalculator.svelte` line 114 to use `$derived.by()`.
3. Wrap Svelte island interiors in `<svelte:boundary>` with accessible fallback cards.
4. Move `role="dialog"` from outer overlay to inner card `<div>` in `src/components/blocks/CookieBanner.svelte`.
5. Remove legacy `Pragma` and `Expires` headers from `src/pages/getting-started/complete.astro`.
6. Deduplicate `optimizeDeps.exclude` in `astro.config.mjs`.

- **Verification:** Run `npx astro check` and `npx svelte-check` in working tree; verify 0 errors.

### Batch 3 — Static Prerendering (After Header Parity Confirmed)

1. Add `export const prerender = true;` to `src/pages/index.astro` (Home page) and marketing routes (`/about`, `/faq`, `/testimonials`, `/teachers`, `/tuition-fee`, `/legal/*`).
2. Commit validated `Course` and `FAQPage` JSON-LD schemas in `src/pages/courses/[slug].astro`.
3. Remove speculation rules for SSR routes in `src/layouts/Base.astro` (keep only for prerendered routes).

- **Verification:** Run `npx astro build`. Verify build output lists static HTML routes. Measure live responses for `cf-cache-status: HIT`.

### Batch 4 — SEO, Tracking & Compliance

1. Add runtime hostname guard (`window.location.hostname === 'quranific.com'`) to GTM snippet in `Base.astro`.
2. Add Turnstile bot verification to `src/pages/api/newsletter.ts`.
3. Darken amber text to `#b45309` in `AboutTeam.astro` line 22 for WCAG AA compliance.
4. Update Meta Graph API version to `v26.0` (or `v22.0`) in `src/pages/api/complete.ts` line 273 and set Worker secrets via `npx wrangler secret put META_CAPI_TOKEN`.
5. Remove unconditional `<link rel="preload">` for Amiri Arabic font on English-only pages.

- **Verification:** Inspect network panel on ad landing pages; verify font payload reduction. Test GTM isolation on preview deployments.

### Batch 5 — DNS & Edge Infrastructure (Dashboard / Registrar Actions)

1. Add Universal SSL CAA records in Cloudflare DNS (`letsencrypt.org`, `digicert.com`, `sectigo.com`, `pki.goog`).
2. Generate DS record in Cloudflare DNS and submit it at the domain registrar (`HOSTINGER operations, UAB`).
3. If on Workers Paid plan ($5/mo), configure native Workers Rate Limiting binding.
4. Configure synthetic uptime monitoring (Cloudflare Health Check or external monitor).

- **Verification:** Run `Resolve-DnsName -Name quranific.com -Type CAA` and `-Type DS`; verify records resolve cleanly.

---

## 9. [UNVERIFIED] List

The following items cannot be asserted as facts from local code inspection or allowed read-only commands:

1. **Real-User Field Core Web Vitals (LCP, INP):** Public PageSpeed Insights API returned HTTP 429 quota exhaustion. Real-user field metrics must be verified via Google Search Console Core Web Vitals report.
2. **Partytown GTM Conversion Tracking Attribution:** Third-party ad network conversion attribution in web workers can fail silently for certain platforms. Must be verified through live Google Tag Assistant and GA4 DebugView test conversions.
3. **Legal Compliance of Child Data Collection:** While parental consent checkboxes exist, full compliance with UK Age Appropriate Design Code (Children's Code) and US COPPA requires formal legal counsel review.

---

## 10. ❓ Cannot-Verify List (All 11 Items with Read-Only Automation)

The following 11 items correspond to the exact ❓ rows in the audit scorecard. Each item includes the automated read-only command using `$env:CF_API_TOKEN` or `gh api`:

| ID        | Domain     | Practice                    | Automated Read-Only Command                                                                                                      | Expected Output / Fallback          |
| --------- | ---------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **CF-27** | Cloudflare | WAF Managed Rules           | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets"`        | Managed Ruleset active              |
| **CF-28** | Cloudflare | Bot Fight Mode              | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/bot_management"`  | `{"fight_mode": true}`              |
| **CF-29** | Cloudflare | Account 2FA                 | Dashboard profile verification only (owner-only credentials)                                                                     | 2FA active on account               |
| **CF-30** | Cloudflare | Scoped API Tokens           | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/user/tokens/verify"`             | Token valid & scoped                |
| **CF-36** | Cloudflare | Auto Minify Status          | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/minify"` | `{"html": "off"}`                   |
| **CF-38** | Cloudflare | Branch Protection           | `gh api repos/faisalkhanllcltd-coder/Quranific/branches/main/protection`                                                         | PR reviews & status checks required |
| **CF-41** | Cloudflare | DNSSEC Validation & Signing | RDAP lookup / `Resolve-DnsName -Type DS -Name quranific.com`                                                                     | DS record delegated at Hostinger    |
| **CF-43** | Cloudflare | SSL Mode Full Strict        | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl"`    | `{"value": "strict"}`               |
| **CF-50** | Cloudflare | Page Shield & Hotlink       | `curl.exe -s -H "Authorization: Bearer $env:CF_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/page_shield"`     | Requires Paid (Business/Enterprise) |
| **Q-08**  | Adjacent   | Core Web Vitals LCP         | Automated PowerShell PSI retry loop (3 retries, 60s delay)                                                                       | Mobile LCP < 2.5s                   |
| **Q-10**  | Adjacent   | INP Event Handlers          | Automated PowerShell PSI retry loop (3 retries, 60s delay)                                                                       | Mobile INP < 200ms                  |

_Owner-Only Explanations_:

- CF-29 (Account 2FA) and initial CF_API_TOKEN generation strictly require owner authentication in Cloudflare Dashboard.
- CF-41 (DNSSEC DS Record) requires owner credentials at domain registrar (`HOSTINGER operations, UAB`) because Cloudflare cannot write to third-party registrar DNS registries.

---

## 11. Coverage Matrix, Reading Ledger & Corrections Summary

### Coverage Matrix

| Category                             | Checked Practice IDs                                                                                                     | Zero-Item Gaps |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------- |
| **Cloudflare Platform & Runtime**    | CF-01, CF-02, CF-03, CF-04, CF-05, CF-06, CF-07, CF-22, CF-23, CF-24, CF-26, CF-47, CF-48                                | None           |
| **Cloudflare Edge & Caching**        | CF-08, CF-09, CF-10, CF-18, CF-19, CF-34, CF-35, CF-36, CF-40, CF-46                                                     | None           |
| **Security & Headers**               | CF-11, CF-12, CF-13, CF-14, CF-15, CF-16, CF-27, CF-28, CF-29, CF-30, CF-49, CF-50, A-30                                 | None           |
| **DNS, TLS & Email**                 | CF-17, CF-31, CF-32, CF-33, CF-41, CF-42, CF-43, CF-44, CF-45, R-01 to R-09                                              | None           |
| **CI/CD & Monitoring**               | CF-37, CF-38, CF-39, Q-23, A-24, A-38, A-39                                                                              | None           |
| **Astro Framework & Config**         | A-01, A-02, A-03, A-04, A-05, A-06, A-07, A-10, A-11, A-12, A-23, A-25, A-26, A-27, A-28, A-29, A-36, A-37, A-42 to A-49 | None           |
| **Routing, SEO & Structured Data**   | A-08, A-09, A-14, A-15, A-16, A-17, A-18, A-19, A-40, A-41, Q-11, Q-12, Q-14, Q-15                                       | None           |
| **Svelte 5 Runes & Islands**         | S-01 to S-37                                                                                                             | None           |
| **Styling & Fonts (Tailwind/Amiri)** | T-01 to T-10, A-20, A-21, A-22, Q-01, Q-02, Q-03, Q-04, Q-18                                                             | None           |
| **Accessibility (WCAG 2.2 AA)**      | A-31, A-32, S-20, S-21, S-22, Q-16, Q-17, Q-18, Q-26, Q-27, Q-28, Q-29, Q-30                                             | None           |
| **Analytics, Consent & Privacy**     | A-13, A-33, A-34, A-35, Q-06, Q-07, Q-13, Q-19, Q-20, Q-21, Q-25, CF-20, CF-21, CF-49                                    | None           |

### Honest Reading Completeness Ledger

Replaces the inaccurate draft claim ("191/191 100%"). Every repository file was catalogued and classified:

- **Total Tracked Files:** 223
- **FULL (100% viewed from line 1 to EOF):** 52 files
- **PARTIAL (specific line ranges inspected):** 25 files
- **SCANNED (regex/AST pattern search):** 102 files
- **NOT OPENED:** 44 files
- **Must-Read Verification:** Every must-read file required by the audit specification (`public/_headers`, `src/middleware.ts`, all API endpoints, all `src/lib/**`, `src/constants/site.ts`, all layouts, all 9 Svelte components, styles, configs, intent pages, course pages, alarm worker) was viewed in full (FULL). Zero unread must-read files remain.

### Summary of Corrections vs Previous Draft (from `REVISION-LOG.md`)

1. **RCE Finding Demoted:** Proved that Sharp libheif flaw has zero exploitability in production because `@astrojs/cloudflare` uses `cloudflare` image service (`env.IMAGES`), Sharp is never executed at runtime in Workers, and no user uploads exist.
2. **Header Parity Gap Identified:** Demonstrated that static assets bypass middleware and inherit weaker CSP (`unsafe-eval`) from `_headers`. Prerendering static routes before fixing `_headers` introduces security regression.
3. **Draft's Resend Claims Corrected:** Refuted claim that Resend SDK is incompatible with Workers. Proved root DNS TXT already includes Resend SPF; overwriting root SPF would have broken Hostinger email.
4. **HTML Edge Caching Refuted:** Proved via live curl that Worker-generated SSR responses do NOT get cached by Cloudflare CDN without explicit Cache API or Cache Everything rules.
5. **Scorecard Re-Synchronized:** Rebuilt scorecard from scratch using automated `_recount.mjs` verification (185 rows verified, 0 NONE, 0 unhandled duplicates).
6. **False Statuses Corrected:** Q-11 (landing pages prerendered) corrected from ❌ to ✅; S-17 (PricingCalculator) corrected from ❓ to ✅; Q-05 (WhatsApp number) verified using `SITE.whatsappNumber`.
7. **WCAG Conflations Fixed:** Corrected SC 2.4.11 from Focus Appearance to Focus Not Obscured (Minimum). Measured true color contrast ratios (amber-600 fails at 3.19:1; emerald-700 passes at 5.48:1).
8. **Alarm-Worker Exposure Discovered:** Catalogued unauthenticated `/force-run` and `/resend-log` HTTP proxy endpoints in `alarm-worker`.
9. **Ungated Manual Deploys Risk Disclosed:** Identified that production was deployed via workstation `Upload (wrangler)` and established pre-deploy guard and rollback runbook.
