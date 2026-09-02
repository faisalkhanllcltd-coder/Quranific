# Consent Agent State

Last updated: 2026-09-02T11:45:00+05:00
Current phase: ALL GATES COMPLETE — READY TO PUSH
Last gate PASSED (verified, with real evidence): SEO protected surface diff — CLEAN (0 diffs across 13 pages)
Branch: feat/cookie-consent
Last commit: `d81c08c` — consent: add SEO snapshot + diff scripts to tests/ for protected surface regression testing

---

## Phase status

- [x] Phase 0 — Preflight (evidence valid — cache=CACHED, no conflicts)
- [x] Phase 1 — Cache-safety decision (CACHED confirmed). Original decision was wrong (SSR cache posture identified but prerender not checked) — STALE CLAIM CORRECTED in R0.
- [x] Phase 2 — Server bucketing logic (19/19 unit tests pass — consent.ts logic is CORRECT and reusable)
- [x] Phase 3 — Consent Mode snippet — REMEDIATED in R1. Built HTML no longer contains `const consentBucket` or `window.__consentBucket`. Universal STRICT-denied defaults + `wait_for_update: 500`. Snippet byte-identical across all prerendered pages.
- [x] Phase 4 — Client-side banner visibility — REMEDIATED in R1. Async fetch to `/api/consent-bucket` on PATH B (new visitor); cookie read on PATH A (returning visitor). Playwright tests 5–11 PASS.
- [x] Phase 5 — Svelte banner structure — REMEDIATED in R1. `bucket` prop removed, sourced from async fetch event. Hydration correct.
- [x] Phase 6 — Playwright tests — 16/16 PASS. Evidence: task-6320.log (2026-09-02T07:17:29+05:00). All gates verified with real browser execution.
- [x] Phase 7 — Checklist delivered. Business impact of async fetch documented in Section G of CONSENT_MANUAL_CHECKLIST.md.
- [x] Phase R0 — Pre-fix snapshots taken, stale state claims corrected. `.gitignore` updated.
- [x] Phase R1 — Base.astro, CookieBanner.svelte, consent-bucket.ts rewritten. 16/16 Playwright tests green.
- [x] Phase R2 — Playwright Gates 4/5/6 verified with real evidence (16/16 PASS).
- [x] Phase R3 — State file corrected. No stale claims remain.
- [x] Geo integration test — 7/7 PASS via DEV-only debug override in middleware. Real HTTP responses from live dev endpoint.
- [x] SEO protected surface diff — CLEAN DIFF (exit 0). All 13 pages: 0 title/meta/JSON-LD differences between pre-fix (7cfd340 worktree build) and post-fix builds. Same script, same command for both captures.

---

## Commit log (this branch, consent-related)

| Commit    | Message                                                                                             | What it did                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `7cfd340` | consent: phase R0 gate passed — protected surface audited and snapshotted                           | Corrected state file, .gitignore                                                                |
| `5dd2b95` | consent: phase R1 gate passed -- bucket-agnostic default, async upgrade endpoint, 16/16 tests green | Base.astro, CookieBanner.svelte, consent-bucket.ts, tests/consent.spec.ts, playwright.config.ts |
| `f8f2c13` | consent: state file updated -- R1+R2 gates marked complete, 16/16 Playwright evidence recorded      | State file update                                                                               |
| `88c9761` | consent: add DEV-only geo debug override to middleware for integration testing                      | `import.meta.env.DEV`-gated X-Debug-Country/Region headers in middleware.ts                     |
| `d81c08c` | consent: add SEO snapshot + diff scripts to tests/ for protected surface regression testing         | tests/seo-snapshot.mjs + tests/seo-diff.mjs                                                     |

---

## Gate evidence

### Gate R1.1 — No server-injected bucket

- Test 1: `built page consent snippet has no server-injected bucket variable` → **PASS** (602ms)
- HTML does not contain `consentDefaultsJson`, `const consentBucket =`, `window.__consentBucket`
- HTML DOES contain `ad_storage: 'denied'`, `analytics_storage: 'denied'`, `wait_for_update: 500`, `/api/consent-bucket`

### Gate R1.2 — Byte-identical snippet across pages

- Test 2: `homepage and course page have byte-identical consent snippets` → **PASS**

### Gate R1.3 — /api/consent-bucket endpoint

- Test 3: Endpoint returns JSON with `{bucket, hasGPC}`, `Cache-Control: no-store` → **PASS** (148ms)
- Test 4: Two rapid requests both no-store, no age header → **PASS** (390ms)

### Gate R1.4 — Route manifest unchanged

- Pre-fix snapshot: 31 directories (`scratch/route-manifest-pre-fix.txt`)
- Post-fix build log: 33 HTML files (same routes — `/404.html`, `/500.html`, root `index.html` listed as files not dirs in build output)
- `consentBucket` / `consentDefaultsJson` scan across ALL built HTML: CLEAN (zero matches)

### Gate 4 — Banner visibility

- Test 5: STRICT, no cookie → banner appears → **PASS** (3.3s)
- Test 6: NONE, no cookie → banner stays hidden → **PASS** (5.6s)
- Test 7: STRICT:accepted cookie → banner stays hidden → **PASS** (4.2s)
- Test 8: STRICT:rejected cookie → banner stays hidden → **PASS** (3.4s)
- Test 9: fetch failure → fail-safe banner shown → **PASS** (3.1s)
- Test 10: `consent-banner-hidden` in SSR HTML → **PASS** (2.6s)

### Gate 5 — Banner interaction

- Test 11: Accept button appears and enabled after hydration → **PASS** (3.2s)

### Gate 6 — Banner actions

- Test 12: Accept All → cookie `STRICT:accepted`, banner hides → **PASS** (2.5s)
- Test 13: Reject Non-Essential → cookie `STRICT:rejected`, banner hides → **PASS** (3.3s)
- Test 14: Got It (MODERATE) → cookie `MODERATE:accepted`, banner hides → **PASS** (3.0s)
- Test 15: Accept + reload → banner does NOT reappear → **PASS** (7.1s)
- Test 16: Protected surface snippet identical across pages → **PASS** (5.3s)

**Total: 16/16 PASS. Elapsed: 53.3s.**

### Geo integration test (endpoint correctness)

7 cases tested against live `/api/consent-bucket` via DEV-only debug override:

| Case                     | country   | region | GPC   | got      | expected | result  |
| ------------------------ | --------- | ------ | ----- | -------- | -------- | ------- |
| EU (DE)                  | DE        | —      | false | STRICT   | STRICT   | ✅ PASS |
| US                       | US        | —      | false | MODERATE | MODERATE | ✅ PASS |
| CA+QC                    | CA        | QC     | false | STRICT   | STRICT   | ✅ PASS |
| CA+ON                    | CA        | ON     | false | MODERATE | MODERATE | ✅ PASS |
| unknown/missing          | _MISSING_ | —      | false | STRICT   | STRICT   | ✅ PASS |
| GPC + PK (NONE-bucket)   | PK        | —      | true  | STRICT   | STRICT   | ✅ PASS |
| GPC + DE (STRICT-bucket) | DE        | —      | true  | STRICT   | STRICT   | ✅ PASS |

### SEO protected surface diff

- Tool: `tests/seo-snapshot.mjs` + `tests/seo-diff.mjs` (identical script, identical command for both runs)
- Pre-fix: built from commit `7cfd340` in a git worktree → `scratch/seo-snapshot-pre-fix.json` (801 lines, 32994 bytes)
- Post-fix: built from current committed state → `scratch/seo-snapshot-post-fix.json` (801 lines, 32994 bytes)
- Diff result: **CLEAN DIFF — exit 0. No title, meta description, or JSON-LD differences across all 13 protected pages.**

---

## Protected Surface (verified from actual files — Phase R0)

Dynamic route files in src/pages/:

1. `src/pages/blog/[slug].astro` — `prerender = true`
2. `src/pages/courses/[slug].astro` — `prerender = true`
3. `src/pages/[intent]/for-adults.astro` — `prerender = true`; getStaticPaths → intents: quran-classes, quran-teacher
4. `src/pages/[intent]/for-kids.astro` — `prerender = true`
5. `src/pages/[intent]/for-women.astro` — `prerender = true`

### Prerender status per route (complete):

| Route                       | Prerender | Middleware runs?                |
| --------------------------- | --------- | ------------------------------- |
| `/`                         | `true`    | NO                              |
| `/about`                    | `true`    | NO                              |
| `/blog`                     | `true`    | NO                              |
| `/blog/[slug]`              | `true`    | NO                              |
| `/contact`                  | `true`    | NO                              |
| `/courses`                  | `true`    | NO                              |
| `/courses/[slug]` (×6)      | `true`    | NO                              |
| `/faq`                      | `true`    | NO                              |
| `/getting-started/signup`   | `true`    | NO                              |
| `/getting-started/complete` | `false`   | YES                             |
| `/getting-started/success`  | `false`   | YES                             |
| `/legal/*`                  | `true`    | NO                              |
| `/portals`                  | `true`    | NO                              |
| `/safeguarding`             | `true`    | NO                              |
| `/teachers`                 | `true`    | NO                              |
| `/teachers/apply`           | `true`    | NO                              |
| `/testimonials`             | `true`    | NO                              |
| `/tuition-fee`              | `true`    | NO                              |
| `/[intent]/for-adults`      | `true`    | NO                              |
| `/[intent]/for-kids`        | `true`    | NO                              |
| `/[intent]/for-women`       | `true`    | NO                              |
| `/api/*`                    | SSR only  | YES (but cache header excluded) |

---

## Key decisions locked in

- Cache posture: CACHED (CDN-Cache-Control: max-age=3600 for GET non-API)
- API exclusion: `/api/consent-bucket` has `Cache-Control: no-store` explicitly + excluded from CDN-Cache-Control by middleware
- Fix approach: bucket-agnostic universal STRICT default in Base.astro (safe for cache + prerender), async client fetch to `/api/consent-bucket` for grant upgrades — IMPLEMENTED AND TESTED
- GTM container ID: GTM-5CJMMJ29
- Consent cookie name: cf_consent_v1
- `src/lib/consent.ts`: CORRECT and REUSABLE — do not modify bucketing logic
- Partytown: SAFE — consent snippet is `is:inline` at char ~1000, before Partytown at char ~11458
- DEV debug override in middleware: gated behind `import.meta.env.DEV` (build-time constant, dead code in production)

## Open items for human (accepted gaps)

- cf.regionCode real-edge test for CA-QC: verified via DEV debug override (7/7 PASS). Real-edge confirmation with Canadian VPN on Cloudflare Pages preview still provisional — not yet tested at actual edge.
- Business impact accepted: grant-by-default visitors (NONE bucket) will have tags fire after async fetch. Documented in CONSENT_MANUAL_CHECKLIST.md Section G.

## Unrelated dirty files (do NOT stage in consent commits)

7 files show as modified (CRLF line endings only, zero content changes):
`README.md`, `dead_code.cjs`, `link_check.cjs`, `src/content.config.ts`, `src/pages/blog/[slug].astro`, `src/pages/blog/index.astro`, `tsconfig.json`
