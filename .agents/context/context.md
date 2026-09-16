# Active Working Context

> Current state of the Quranific application as of 2026-09-16.
> This is the ground truth for any new AI session picking up work on this codebase.

---

## Repository State

- **Branch:** `main`
- **Last significant merge:** `staging/prelaunch-audit` merged to `main` on 2026-09-07 at commit `2cf8de3`
- **Branch `staging/content-ux-audit`:** was reverted and deleted. `main` is authoritative.
- **Working tree:** clean (no uncommitted changes at time of audit close)
- **Live production:** quranific.com is live and serving from the audited, merged state

---

## Cloudflare Production Environment

| Resource          | Name                               | Version (at close of audit)        | Status                         |
| ----------------- | ---------------------------------- | ---------------------------------- | ------------------------------ |
| Main Pages Worker | `quranific`                        | Various post-audit versions        | Live                           |
| Alarm Worker      | `quranific-alarm`                  | Various post-audit versions        | Live, cron active              |
| CF Account        | `a4fa216703f27e36d764375a879e75c4` | —                                  | `faisalkhan.llc.ltd@gmail.com` |
| KV Namespace      | `SESSION`                          | `14eab319d57e4c58b5f903bce3eb3931` | Active, empty queue            |
| KV Namespace      | `FX_RATES`                         | DELETED                            | Decommissioned                 |

**Alarm worker cron:** `0 * * * *` — fires every hour, POSTs Bearer-authed request to `https://quranific.com/api/internal/retry-queue`. Last verified: `{"success":true,"recovered":0}`.

---

## What Was Recently Fixed (Post-Audit — All CLOSED)

All items below are CLOSED, verified live, and DO NOT require further action:

1. **DLQ producer/consumer key mismatch** — `retry-queue.ts` fully rewritten, handles 9+ prefix types, empirically verified with live seed drill (3/3 emails delivered, keys purged)
2. **`/api/apply-teacher` security** — rewritten with `env` from `cloudflare:workers`, Zod schema (`teacherSchema`), rate limiting, Turnstile, DLQ
3. **Sitemap intent page exclusion bug** — fixed from `.includes()` to `path.startsWith()` / `path === '/for-*'`; all 6 intent pages in sitemap
4. **Draft blog post `hello-world.md`** — marked `draft: true`, excluded from build, sitemap, RSS
5. **Impressum address** — updated to full street address in `SITE.address`
6. **www → apex redirect** — live, HTTP 301, path+query preserved, `run_worker_first = true`
7. **Guardian consent checkbox** — added to `SignupForm.svelte` + `signupSchema`; verified live
8. **npm vulnerabilities** — 0 remaining (svelte 5.57.0, brace-expansion, etc.)
9. **ESLint CJS config** — flat override for `*.cjs` files; 0 lint errors
10. **Playwright test 15 flakiness** — fixed with `toBeEnabled()` assertion before click
11. **CookieBanner accessibility** — focus trap, `Escape` key handler, initial focus on mount; Gate 7 added (17/17 Playwright tests pass)
12. **Font subset pruning** — 9 font files (was 28), ~270 KB saved; Latin + Arabic only
13. **Consent Mode v2** — universal deny-all default, async `/api/consent-bucket` upgrade, 17/17 Playwright tests, 7/7 geo integration tests
14. **Geo-based static pricing** — `fx-updater` Worker + `FX_RATES` KV permanently deleted; `src/constants/pricing.ts` is the SSOT; Bidi fix (dir+bdi) for AED/SAR

---

## Current Architecture Snapshot

```text
quranific.com
├── Cloudflare Pages (Workers runtime, smart placement)
│   ├── middleware.ts → geo + consent bucket + security headers + edge cache
│   ├── SSR routes: /getting-started/complete, /getting-started/success, /api/*
│   └── Static prerendered: everything else (33 pages)
├── KV: SESSION
│   ├── RL:* (rate limits, 60s TTL)
│   ├── IDEMPOTENCY:* (960s TTL)
│   └── FAILED_* (dead-letter, 30d TTL)
└── alarm-worker (quranific-alarm)
    └── cron 0 * * * * → POST /api/internal/retry-queue (Bearer JWT_SECRET)
```

**No fx-updater. No FX_RATES KV. No live exchange rate API. Pricing is static.**

---

## Open Work (Not Yet Done)

See `pending-tasks.md` for full detail. Summary:
| ID | Task | Priority |
|---|---|---|
| PT-1 | Automated tests for `/api/contact` and `/api/apply-teacher` | Medium |
| PT-2 | `window.__reopenConsentBanner()` + "Manage Cookies" button on `/legal/cookies` | High (GDPR) |
| PT-3 | Eyebrow typography token standardisation (30+ components) | Low |
| PT-4 | Consent record logging to KV (owner decision pending) | Low |
| PT-5 | Server-side conversion tracking GA4/Meta CAPI (owner decision pending) | Medium |
| PT-6 | DLQ alert webhook for non-zero recovery events | Medium |

See `owner-actions.md` for dashboard/business tasks.

---

## Key Invariants — Never Break These

1. **`Base.astro` consent snippet is byte-identical across all pages.** It cannot contain country, bucket, or per-request values. This is the cache-safety guarantee.
2. **`/api/consent-bucket` must always return `Cache-Control: no-store`.** It serves per-visitor data.
3. **All dead-letter KV keys must start with `FAILED`.** The retry-queue consumer scans `prefix: 'FAILED'`.
4. **`alarm-worker` `JWT_SECRET` must always match the main site's `JWT_SECRET`.** If one rotates, both must rotate simultaneously.
5. **`src/constants/pricing.ts` is the SSOT for all pricing.** No component may fetch live exchange rates. The `FX_RATES` KV binding does not exist.
6. **AED and SAR display must use `dir="ltr"` and `<bdi>` wrappers.** Without this, Arabic RTL reorders the symbol to the right of the amount.
7. **`/getting-started/complete` and `/getting-started/success` must remain `prerender = false`.** These are session-gated SSR routes.

---

## Test Suite Status

| Suite                      | File                                            | Count    | Status                                    |
| -------------------------- | ----------------------------------------------- | -------- | ----------------------------------------- |
| Consent E2E (Playwright)   | `tests/consent.spec.ts`                         | 17 tests | All passing (3 consecutive runs verified) |
| Consent Unit (Vitest/Node) | `tests/consent-unit.test.ts`                    | 19 tests | All passing                               |
| SEO Regression Snapshot    | `tests/seo-snapshot.mjs` + `tests/seo-diff.mjs` | 13 pages | Clean diff (0 differences)                |

---

## Performance Baselines (Empirically Measured)

Measured via Chromium CDP on mobile viewport (390×844, DPR 3), median of 3 runs:
| Page | Profile | TTFB | FCP | LCP | CLS |
|---|---|---|---|---|---|
| Homepage | Broadband mobile | 199ms | 1,732ms | 1,732ms | 0.0004 |
| Homepage | Slow 4G + 4x CPU | 282ms | 3,140ms | 3,804ms | 0.0004 |
| Tuition Fee | Broadband mobile | 171ms | 1,628ms | 1,628ms | 0.0028 |
| Tuition Fee | Slow 4G + 4x CPU | 407ms | 4,004ms | 4,052ms | 0.0028 |

LCP is within Google's 2.5s "Good" threshold on broadband. CLS is negligible (<0.003 across all profiles).

---

## Island Bundle Sizes (Production Build)

| Component            | Size                                     |
| -------------------- | ---------------------------------------- |
| `CookieBanner`       | 6.48 KB                                  |
| `PricingCalculator`  | 8.84 KB                                  |
| `PricingGrid`        | 11.71 KB                                 |
| `SignupForm`         | 8.81 KB                                  |
| `CompleteForm`       | 12.18 KB                                 |
| `StepIndicator`      | 2.28 KB                                  |
| Svelte runtime chunk | 48.27 KB                                 |
| Total compiled CSS   | ~138.97 KB uncompressed (~24 KB gzipped) |
