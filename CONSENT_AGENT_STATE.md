# Consent Agent State

Last updated: 2026-09-02T06:29:00+05:00
Current phase: R0 (DONE) — R1 IN PROGRESS
Last gate PASSED (verified, not claimed): R0 (protected surface audited, snapshots taken, stale claims corrected)
Last gate IN PROGRESS: R1
Branch: feat/cookie-consent

## Phase status

- [x] Phase 0 — Preflight (evidence valid — cache=CACHED, no conflicts)
- [x] Phase 1 — Cache-safety decision (CACHED confirmed) — DECISION WAS WRONG: SSR cache posture identified but prerender not checked
- [x] Phase 2 — Server bucketing logic (19/19 unit tests pass — consent.ts logic is CORRECT and reusable)
- [~] Phase 3 — Consent Mode snippet — STALE. Built HTML has `const consentBucket = "STRICT"` hardcoded. Gate 3 checked one artifact once, not 3 simulated regions. Snippet is NOT bucket-agnostic. REMEDIATION REQUIRED (Phase R1).
- [~] Phase 4 — Client-side banner visibility — design is sound, but relies on `window.__consentBucket` which is also baked in from build-time STRICT. Must be sourced from async API fetch after R1. Partial credit only.
- [x] Phase 5 — Svelte banner structure — component is sound, accepts `bucket` prop, needs to source from fetch result instead of server prop after R1.
- [~] Phase 6 — consent-unit.test.ts: 19/19 PASS (real). consent.spec.ts: WRITTEN BUT NEVER RUN. Gate 6 was marked ✅ without evidence. FALSE.
- [~] Phase 7 — Checklist delivered. Content valid. Business impact of async fetch NOT yet documented (to be added in R1).

## STALE DECISIONS — corrected here

- ~~Phase 1 said "server injects bucket-specific value, safe for cached routes"~~ → WRONG. Cache key is URL-only. Bucket-specific value in cached HTML = cross-user leak. Additionally, most routes including [intent] and courses/[slug] have `export const prerender = true` — middleware NEVER RUNS for them. "Server-computed bucket" was a build-time STRICT default, not per-user.
- Gate 3 was verified against ONE static artifact ONCE. Not three simulated regions. NOT VALID.
- Gates 4, 5, 6 (Playwright): NOT RUN. Marked complete without evidence. Corrected here.
- Commit discipline violated: phases 0–5 batched into one commit. One of two commits total. State file updated once at the very end.

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

### Pre-fix snapshots (on disk, do not commit):

- Route manifest: `scratch/route-manifest-pre-fix.txt` — 31 routes
- Page titles/meta: captured inline above for homepage and 6 course pages
- Current built consent snippet: `const consentBucket = "STRICT"` hardcoded in ALL prerendered pages

## Key decisions locked in

- Cache posture: CACHED (CDN-Cache-Control: max-age=3600 via middleware.ts:64-70 for GET non-API)
- API exclusion: confirmed — middleware line 59: `!context.url.pathname.startsWith('/api/')` → `/api/consent-bucket` will NOT get CDN-Cache-Control header → Cloudflare will not cache it
- Middleware locals: populated for ALL routes BEFORE `await next()` (line 45) — but for prerendered routes, this middleware run only happens at build time, not per visitor request. For SSR routes (complete, success, api/\*), middleware runs per request.
- Fix approach: bucket-agnostic universal STRICT default in Base.astro (safe for cache + prerender), async client fetch to `/api/consent-bucket` for grant upgrades
- GTM container ID: GTM-5CJMMJ29
- Consent cookie name: cf_consent_v1
- src/lib/consent.ts: CORRECT and REUSABLE — do not modify bucketing logic

## Next action (R1 — IMMEDIATE)

1. `src/layouts/Base.astro` — strip all server-side bucket branching from the consent snippet. Replace with unconditional STRICT-denied defaults + `wait_for_update: 500`. Remove `define:vars`, `consentDefaultsJson`, `consentBucket` from the template variable injection. Remove imports of `getConsentDefaults`, `ConsentBucket` from frontmatter (they are no longer used in Base.astro). Keep `Astro.locals.consentBucket` reading ONLY if needed by the banner — which after R1 it won't be, since the banner sources bucket from fetch result.

2. `src/pages/api/consent-bucket.ts` — new SSR API endpoint. Reads cf object + GPC from request directly (since this is an SSR route, middleware DOES run). Returns `{ bucket, hasGPC }`. Set `Cache-Control: no-store` explicitly.

3. `src/layouts/Base.astro` inline script (Phase 4) — amend to: (a) check cf_consent_v1 cookie first — if present, apply stored choice via gtag update, reveal/hide banner accordingly; (b) if absent, fetch `/api/consent-bucket`, on response: STRICT/GPC → leave denied, reveal banner; MODERATE/NONE → call gtag update with grants, hide banner.

4. `src/components/blocks/CookieBanner.svelte` — change `bucket` prop from server-passed to be sourced from the fetch result stored in a module-level writable. The banner receives the bucket via a custom event or a shared store after the fetch resolves.

## Blockers / open questions for human

- cf.regionCode availability on Cloudflare Edge real deployment: still provisional, not yet real-edge tested. CA-QC real-edge test requires a Cloudflare Pages preview with Canadian Quebec VPN — flagged to user.
- Partytown is configured in astro.config.mjs for `dataLayer.push` forwarding — this could interfere with synchronous consent default firing since Partytown runs in a worker. MUST VERIFY that the consent snippet runs on main thread and is not intercepted by Partytown. Flagged as new stop condition to check in R1.
- Business impact accepted (per R1 directive): grant-by-default visitors (US/AU/PK/etc.) will have their tags fire after async fetch (~sub-200ms on good connections, more on slow). This is the necessary trade for correctness without disabling the edge cache.
