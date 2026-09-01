# Consent Agent State

Last updated: 2026-09-01T20:21:00+05:00
Current phase: 1
Last gate PASSED (verified, not claimed): 0
Last gate IN PROGRESS: none
Branch: feat/cookie-consent

## Phase status

- [x] Phase 0 — Preflight
- [ ] Phase 1 — Cache-safety decision
- [ ] Phase 2 — Server bucketing
- [ ] Phase 3 — Consent Mode snippet
- [ ] Phase 4 — Client-side visibility (REQUIRED — routes ARE cached)
- [ ] Phase 5 — Svelte banner
- [ ] Phase 6 — Automated test
- [ ] Phase 7 — Manual checklist output

## Key decisions locked in (do not re-litigate on resume)

- Cache posture: CACHED — middleware.ts:55-58 sets CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=86400 on all GET non-API routes. Phase 4 (client-side banner visibility) IS required.
- GTM container ID: GTM-5CJMMJ29 (Base.astro:106)
- Consent cookie name: cf_consent_v1
- regionCode: NOT yet read in middleware — will add cf.regionCode extraction. Available on real Cloudflare edge but NOT in wrangler local emulation (treat local as provisional).
- GPC: Sec-GPC header not yet read — will add in middleware.
- Existing consent code: NONE found. Clean slate.
- Conflicting code: NONE found. Safe to proceed.

## Gate 0 evidence

- Cache: middleware.ts lines 53-58 — CDN-Cache-Control public, max-age=3600
- \_headers: public/\_headers line 24 — /\* Cache-Control: public, max-age=0, must-revalidate (browser) + stale-while-revalidate=86400 (Cloudflare SWR)
- regionCode: zero matches in entire src/ tree for "regionCode"
- GPC: zero matches for Sec-GPC in entire src/ tree
- Consent code: zero matches for consent/gdpr/ccpa/gtag-consent in src/

## Next action

Phase 1 decision: routes ARE cached (confirmed). Architecture = server injects country-bucket only into Consent Mode default snippet. Banner visibility decided client-side by reading cf_consent_v1 cookie. Begin Phase 2 (bucketing logic in middleware.ts) then Phase 3 (snippet in Base.astro), then Phase 4 (client-side banner show/hide inline script).

Files to create/modify:

1. src/middleware.ts — add regionCode, GPC extraction, consentBucket to locals
2. src/env.d.ts — add consentBucket, regionCode to App.Locals
3. src/lib/consent.ts — bucket logic (pure function, unit-testable)
4. src/layouts/Base.astro — inject Consent Mode default snippet before GTM
5. src/components/blocks/CookieBanner.svelte — Svelte 5 runes banner
6. tests/consent.spec.ts — Playwright tests

## Blockers / open questions for human

- STOP CONDITION NOTE: cf.regionCode local emulation is not reliable — treat Gate 2 CA-QC result from local wrangler as provisional. Requires a real Cloudflare Pages preview deployment to fully validate. Flagged per directive.
- GTM container is UI-managed (not in repo) — Phase 7 tag list will be generic instructions, not enumerated actual tags.
- Server-side conversion tracking (GA4 Measurement Protocol / Meta CAPI) is flagged as an open decision in Phase 7 output — NOT building without explicit go-ahead.
