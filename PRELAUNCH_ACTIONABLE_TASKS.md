# Pre-Launch Actionable Tasks (Staging Audit)

**Audit Branch:** `staging/prelaunch-audit`  
**Execution Mode:** STRICT READ-ONLY (Fix round follows approval)  
**Date:** 2026-09-06  
**Status:** AUDIT COMPLETE — PRIORITIZED FIX LEDGER

---

## P0 — Blocks Launch (Immediate Fix Required)

1. **Fix DLQ Consumer / Producer Key & Schema Mismatch (`src/pages/api/internal/retry-queue.ts`)**
   - **Defect:** `retry-queue.ts` queries KV with `prefix: 'FAILED_LEAD:'` and expects legacy payload `{ taskIndex: 0 | 1, step1, step2 }`. But `register.ts` and `complete.ts` write `FAILED_LEAD_STEP1:${leadId}`, `FAILED_LEAD_STEP2:${leadId}`, and `FAILED_LEAD_WELCOME:${leadId}` with modern payload `{ failedAt, step1, step2, reason }` (no `taskIndex`).
   - **Impact:** Failed emails during lead registration or welcome delivery are written to KV but can **NEVER** be recovered by the hourly `alarm-worker` cron. Leads would be permanently lost if Resend experiences transient downtime.
   - **Fix Required:** Update `retry-queue.ts` to scan prefixes `FAILED_LEAD_STEP1:`, `FAILED_LEAD_STEP2:`, and `FAILED_LEAD_WELCOME:` (plus `FAILED_NEWSLETTER:` and `FAILED_CONTACT:`), inspect the actual modern payload structure, dispatch appropriate Resend emails, and delete processed keys.

---

## P1 — Fix Before Launch (High Priority / Launch Risks)

2. **Fix Broken Runtime Secret & Missing Security on Teacher Application (`src/pages/api/apply-teacher.ts`)**
   - **Defect:** Accesses `import.meta.env.RESEND_API_KEY` instead of `env` from `cloudflare:workers` (which is `undefined` at the Cloudflare edge runtime). Has zero Turnstile verification, zero rate limiting, zero Zod validation, and zero DLQ fallback.
   - **Impact:** Teacher application submissions will silently fail or warn in production; form is completely unprotected against bot flooding and abuse.
   - **Fix Required:** Port standard edge security architecture from `contact.ts`: use `cloudflare:workers` `env`, add Turnstile siteverify, KV rate limiting (`RL:TEACHER:${ip}`), Zod validation schema, and KV DLQ persistence (`FAILED_TEACHER:`).

3. **Fix Sitemap Filter Pruning All Programmatic Intent Pages (`astro.config.mjs`)**
   - **Defect:** `sitemap()` filter in `astro.config.mjs` excludes `'/for-kids'`, `'/for-adults'`, `'/for-women'`.
   - **Impact:** All 6 high-value SEO programmatic intent landing pages (`/quran-classes/for-kids`, `/quran-classes/for-adults`, `/quran-classes/for-women`, `/quran-teacher/for-kids`, `/quran-teacher/for-adults`, `/quran-teacher/for-women`) are pruned from `sitemap-0.xml`!
   - **Fix Required:** Refine filter to strictly match legacy ad paths (`page === '/for-kids'` or `page.startsWith('/ads/')`) instead of a broad `includes()`.

4. **Unpublish or Replace Placeholder Blog Post (`src/content/blog/hello-world.md`)**
   - **Defect:** Placeholder post titled "Welcome to the Quranific Blog" with body text _"This is a placeholder post. Once we build..."_ is prerendered to `/blog/hello-world/index.html` and listed in `sitemap-0.xml`.
   - **Impact:** Search engines index incomplete draft copy, degrading Google site quality scoring.
   - **Fix Required:** Set `draft: true` or replace with a polished launch announcement article.

5. **Fix German/EU Statutory Impressum Address (`src/constants/site.ts` & `src/pages/legal/impressum.astro`)**
   - **Defect:** `SITE.address` is set to `'Karachi, Pakistan'`, which overrides the fallback full street address in `impressum.astro`.
   - **Impact:** Under German TMG § 5 and EU digital transparency rules, an Impressum must state a full street address, not just city/country.
   - **Fix Required:** Set full street address in `SITE.address`.

6. **Add Cloudflare 301 Redirect Rule for `www.quranific.com` -> `quranific.com`**
   - **Defect:** `https://www.quranific.com/` returns `200 OK` directly rather than a 301 redirect to apex.
   - **Impact:** While canonical tags exist, serving 200 on both domains risks splitting link authority and crawler budget across hostnames.
   - **Fix Required:** Configure Cloudflare Single Redirect rule (301 Permanent Redirect) from `www.quranific.com/*` to `https://quranific.com/$1`.

7. **Add Parent/Guardian Declaration to Student Signup (`src/lib/schema.ts` & `SignupForm.svelte`)**
   - **Defect:** No parental consent confirmation checkbox or declaration in Step 1.
   - **Impact:** Compliance risk under COPPA / UK Children's Code / GDPR-K when parents register on behalf of minor children.
   - **Fix Required:** Add parent/guardian consent confirmation checkbox or explicit clarifying microcopy above submit button.

8. **Update Dependency Vulnerabilities (`npm audit`)**
   - **Defect:** 9 vulnerabilities reported by `npm audit` (3 high, 5 moderate, 1 low), including `svelte <= 5.55.6` XSS/DOM clobbering advisory and `fast-uri` / `brace-expansion` DoS advisories.
   - **Impact:** Security hygiene and automated security scanner flags.
   - **Fix Required:** Run `npm audit fix` and verify tests.

---

## P2 — Post-Launch / Quality Refinements (Non-Blocking)

9. **Fix Eslint Configuration for Root Utility Scripts (`eslint.config.mjs`)**
   - **Defect:** Root scripts `dead_code.cjs` and `link_check.cjs` trigger 7 lint errors (`@typescript-eslint/no-require-imports`, `no-useless-assignment`). `src/` has 0 errors.
   - **Fix Required:** Add ignore or cjs overrides for `*.cjs` in `eslint.config.mjs`.

10. **Fix Playwright Test 15 Flakiness (`tests/consent.spec.ts`)**
    - **Defect:** Test 15 clicks the "Accept All" button before waiting for `toBeEnabled()`, causing occasional failures if Svelte hydration is still finalizing.
    - **Fix Required:** Add `await expect(acceptBtn).toBeEnabled({ timeout: BANNER_WAIT });` before `.click()`.

11. **Enhance `CookieBanner.svelte` Accessibility Focus & Keyboard Trap**
    - **Defect:** Modal dialog does not trap keyboard focus or dismiss on `Escape`.
    - **Fix Required:** Add `keydown` Escape handler and focus containment within the dialog container.

12. **Purge Unused Font Subsets (Cyrillic, Vietnamese, Greek)**
    - **Defect:** Font packages bundle unused Cyrillic/Vietnamese font files in `dist/client/_astro/`.
    - **Fix Required:** Prune unused font imports from `@fontsource/merriweather` and `@fontsource-variable/inter` to optimize bundle payload.
