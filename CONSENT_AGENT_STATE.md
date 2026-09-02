# Consent Agent State

Last updated: 2026-09-02T07:20:00+05:00
Current phase: R2 DONE — R3 PENDING (correct the record)
Last gate PASSED (verified, with real evidence): R2 — 16/16 Playwright tests green
Branch: feat/cookie-consent
Last commit: `5dd2b95` — consent: phase R1 gate passed -- bucket-agnostic default, async upgrade endpoint, 16/16 tests green

---

## Phase status

- [x] Phase 0 — Preflight (evidence valid — cache=CACHED, no conflicts)
- [x] Phase 1 — Cache-safety decision (CACHED confirmed) — DECISION WAS WRONG: SSR cache posture identified but prerender not checked
- [x] Phase 2 — Server bucketing logic (19/19 unit tests pass — consent.ts logic is CORRECT and reusable)
- [~] Phase 3 — Consent Mode snippet — STALE. Built HTML had `const consentBucket = "STRICT"` hardcoded. Gate 3 checked one artifact once, not 3 simulated regions. REMEDIATED in Phase R1.
- [~] Phase 4 — Client-side banner visibility — REMEDIATED in Phase R1. Snippet is now bucket-agnostic (verified by test 1). Async fetch upgrade in place (verified by tests 3-9). Playwright tests 5–11 PASS.
- [x] Phase 5 — Svelte banner structure — REMEDIATED in Phase R1. `bucket` prop removed, sourced from async fetch event. Hydration correct.
- [x] Phase 6 — Playwright tests — 16/16 PASS. Evidence: task-6320.log (2026-09-02T07:17:29+05:00). All gates verified with real browser execution.
- [x] Phase 7 — Checklist delivered. Business impact of async fetch documented in Section G of CONSENT_MANUAL_CHECKLIST.md.

---

## Commit log (this branch, consent-related)

| Commit    | Message                                                                                             | What it did                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `7cfd340` | consent: phase R0 gate passed — protected surface audited                                           | Corrected state file, .gitignore                                                                       |
| `5dd2b95` | consent: phase R1 gate passed -- bucket-agnostic default, async upgrade endpoint, 16/16 tests green | R1+R2: Base.astro, CookieBanner.svelte, consent-bucket.ts, tests/consent.spec.ts, playwright.config.ts |

---

## Gate evidence (R1 + R2)

### Gate R1.1 — No server-injected bucket

- Test 1: `built page consent snippet has no server-injected bucket variable` → **PASS** (602ms)
- Verified: HTML does not contain `consentDefaultsJson`, `const consentBucket =`, or `window.__consentBucket`
- Verified: HTML DOES contain `ad_storage: 'denied'`, `analytics_storage: 'denied'`, `wait_for_update: 500`, `/api/consent-bucket`

### Gate R1.2 — Byte-identical snippet across pages

- Test 2: `homepage and course page have byte-identical consent snippets` → **PASS**

### Gate R1.3 — /api/consent-bucket endpoint

- Test 3: Endpoint returns JSON with `{bucket, hasGPC}`, `Cache-Control: no-store` → **PASS** (148ms)
- Test 4: Two rapid requests both no-store, no age header → **PASS** (390ms)

### Gate R1.4 — Route manifest unchanged

- Pre-fix snapshot: 31 routes (`scratch/route-manifest-pre-fix.txt`)
- Build after R1: 31 routes unchanged (verified in session)

### Gate 4 — Banner visibility (5 sub-tests)

- Test 5: STRICT, no cookie → banner appears → **PASS** (3.3s)
- Test 6: NONE, no cookie → banner stays hidden → **PASS** (5.6s)
- Test 7: STRICT:accepted cookie → banner stays hidden → **PASS** (4.2s)
- Test 8: STRICT:rejected cookie → banner stays hidden → **PASS** (3.4s)
- Test 9: fetch failure → fail-safe banner shown → **PASS** (3.1s)

### Gate 4 — No flash of banner

- Test 10: `consent-banner-hidden` in SSR HTML → **PASS** (2.6s)

### Gate 5 — Banner interaction

- Test 11: Accept button appears and enabled after hydration → **PASS** (3.2s)

### Gate 6 — Banner actions (4 sub-tests)

- Test 12: Accept All → cookie `STRICT:accepted`, banner hides → **PASS** (2.5s)
- Test 13: Reject Non-Essential → cookie `STRICT:rejected`, banner hides → **PASS** (3.3s)
- Test 14: Got It (MODERATE) → cookie `MODERATE:accepted`, banner hides → **PASS** (3.0s)
- Test 15: Accept + reload → banner does NOT reappear → **PASS** (7.1s)
- Test 16: Protected surface snippet identical across pages → **PASS** (5.3s)

**Total: 16/16 PASS. Elapsed: 53.3s.**

---

## STALE DECISIONS — corrected here

- ~~Phase 1 said "server injects bucket-specific value, safe for cached routes"~~ → WRONG. Cache key is URL-only. Bucket-specific value in cached HTML = cross-user leak. Additionally, most routes including [intent] and courses/[slug] have `export const prerender = true` — middleware NEVER RUNS for them. "Server-computed bucket" was a build-time STRICT default, not per-user.
- Gate 3 was verified against ONE static artifact ONCE. Not three simulated regions. NOT VALID. — REMEDIATED in R1.
- Gates 4, 5, 6 (Playwright): NOT RUN originally. Marked complete without evidence. Corrected here — now have 16/16 real Playwright evidence.
- Commit discipline violated in original session: phases 0–5 batched into one commit. — Corrected: R0 and R1+R2 are separate commits now.

---

## Protected Surface (Phase R0 — verified from actual files)

Dynamic route files in src/pages/:

1. `src/pages/blog/[slug].astro` — `prerender = true` (line 11)
2. `src/pages/courses/[slug].astro` — `prerender = true` (line 2 equivalent)
3. `src/pages/[intent]/for-adults.astro` — `prerender = true` (line 22); getStaticPaths → intents: quran-classes, quran-teacher
4. `src/pages/[intent]/for-kids.astro` — `prerender = true` (line 22); getStaticPaths → intents: quran-classes, quran-teacher
5. `src/pages/[intent]/for-women.astro` — `prerender = true` (line 21); getStaticPaths → intents: quran-classes, quran-teacher

All three [intent] pages:

- Use `Astro.params.intent` for copy variation
- Do NOT read `Astro.locals.consentBucket` — they have their own inline copy data
- Use `Base.astro` layout (which DOES read consentBucket — but at prerender time, always gets build-context bucket = STRICT)
- No middleware-dependent features (they pre-bake copy + SEO at build time)
- No route-specific data that would be corrupted by consent changes

Course pages ([slug].astro):

- Use `Astro.params.slug` to look up COURSES array
- No middleware-dependent features
- prerender = true confirmed

Global output mode: `output: 'server'` in astro.config.mjs — but per-file prerender overrides apply.

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

- Cache posture: CACHED (CDN-Cache-Control: max-age=3600 via middleware.ts:64-70 for GET non-API)
- API exclusion: confirmed — middleware line 59: `!context.url.pathname.startsWith('/api/')` → `/api/consent-bucket` will NOT get CDN-Cache-Control header → Cloudflare will not cache it
- `/api/consent-bucket` also sets `Cache-Control: no-store` explicitly as defence-in-depth
- Middleware locals: populated for ALL routes BEFORE `await next()` (line 45) — but for prerendered routes, this middleware run only happens at build time, not per visitor request. For SSR routes (complete, success, api/\*), middleware runs per request.
- Fix approach: bucket-agnostic universal STRICT default in Base.astro (safe for cache + prerender), async client fetch to `/api/consent-bucket` for grant upgrades — IMPLEMENTED AND TESTED.
- GTM container ID: GTM-5CJMMJ29
- Consent cookie name: cf_consent_v1
- src/lib/consent.ts: CORRECT and REUSABLE — do not modify bucketing logic
- Partytown: confirmed SAFE — consent snippet is `is:inline` at char ~1000, before Partytown initializes at char ~11458. Consent gtag('consent','default',...) runs on main thread synchronously BEFORE Partytown proxy installs.

## Blockers / open questions for human

- cf.regionCode availability on Cloudflare Edge real deployment: still provisional, not yet real-edge tested. CA-QC real-edge test requires a Cloudflare Pages preview with Canadian Quebec VPN — flagged to user.
- Business impact accepted (per R1 directive): grant-by-default visitors (US/AU/PK/etc.) will have their tags fire after async fetch (~sub-200ms on good connections). This is the necessary trade for correctness without disabling the edge cache. Documented in CONSENT_MANUAL_CHECKLIST.md Section G.

## Next action (R3 — phase complete)

R3: State file is now correct. No further corrections needed. Ready to push when user gives go-ahead.
