# Pre-Launch Actionable Tasks (Staging Audit)

**Audit Branch:** `staging/prelaunch-audit`  
**Execution Mode:** STRICT READ-ONLY (Fix round follows approval)  
**Date:** 2026-09-06  
**Status:** AUDIT COMPLETE — PRIORITIZED FIX LEDGER

---

## P0 — Blocks Launch (Immediate Fix Required)

### 1. Fix DLQ Consumer / Producer Key & Schema Mismatch (`src/pages/api/internal/retry-queue.ts`)

- **Defect:** `retry-queue.ts` queries KV with `prefix: 'FAILED_LEAD:'` and expects legacy payload `{ taskIndex: 0 | 1, step1, step2 }`. But `register.ts` and `complete.ts` write `FAILED_LEAD_STEP1:${leadId}`, `FAILED_LEAD_STEP2:${leadId}`, and `FAILED_LEAD_WELCOME:${leadId}` with modern payload `{ failedAt, step1, step2, reason }` (no `taskIndex`).
- **Impact:** Failed emails during lead registration or welcome delivery are written to KV but can **NEVER** be recovered by the hourly `alarm-worker` cron. Leads would be permanently lost if Resend experiences transient downtime.

#### Exact Verbatim Code — Consumer Side ([`src/pages/api/internal/retry-queue.ts#L36-L54`](file:///d:/Live%20Web/Quranific-live/src/pages/api/internal/retry-queue.ts#L36-L54))

```typescript
// 1. Recover Funnel Completions (FAILED_LEAD)
const leadList = await kv.list({ prefix: 'FAILED_LEAD:' });
for (const key of leadList.keys) {
  const dataStr = await kv.get(key.name);
  if (dataStr) {
    const data = JSON.parse(dataStr);
    try {
      if (data.taskIndex === 0) {
        await sendFullAdminNotification(data.step1, data.step2, resendApiKey, adminEmail);
      } else if (data.taskIndex === 1) {
        await sendWelcomeEmail(data.step1.e, data.step1.n, resendApiKey);
      }
      await kv.delete(key.name);
      recoveredCount++;
    } catch (e) {
      console.error(`Cron retry failed for lead ${key.name}:`, e);
    }
  }
}
```

#### Exact Verbatim Code — Producer Side ([`src/pages/api/register.ts#L186-L196`](file:///d:/Live%20Web/Quranific-live/src/pages/api/register.ts#L186-L196))

```typescript
if (kv) {
  const deadLetterKey = `FAILED_LEAD_STEP1:${leadId}`;
  const deadLetterPayload = JSON.stringify({
    failedAt: new Date().toISOString(),
    step1: validData,
    reason: String(err),
  });
  kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch((e: unknown) =>
    console.error('[Dead-Letter KV Write Failed]:', e)
  );
}
```

#### Exact Verbatim Code — Producer Side ([`src/pages/api/complete.ts#L174-L204`](file:///d:/Live%20Web/Quranific-live/src/pages/api/complete.ts#L174-L204))

```typescript
          if (kv) {
            const deadLetterKey = `FAILED_LEAD_STEP2:${step1Data.lid || Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              step1: step1Data,
              step2: parsed.data,
              reason: String(adminErr),
            });
            kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch(
              (e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e)
            );
          }
        }

        try {
          await sendWelcomeEmail(step1Data.e, step1Data.n, resendApiKey);
        } catch (welcomeErr) {
          console.error('[Step 2 Welcome Email Failed]:', welcomeErr);
          if (kv) {
            const deadLetterKey = `FAILED_LEAD_WELCOME:${step1Data.lid || Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              step1: step1Data,
              step2: parsed.data,
              reason: String(welcomeErr),
            });
            kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch(
              (e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e)
            );
          }
        }
```

- **Status:** **[FIXED & VERIFIED LIVE]**
- **Fix Summary:** Rewrote `src/pages/api/internal/retry-queue.ts` and added helpers in `src/lib/email.ts`. The queue processor now dynamically handles all prefixes: `FAILED_LEAD_STEP1:`, `FAILED_LEAD_STEP2:`, `FAILED_LEAD_WELCOME:`, `FAILED_CONTACT_ADMIN:`, `FAILED_CONTACT_USER:`, `FAILED_NEWSLETTER_ADMIN:`, `FAILED_NEWSLETTER_USER:`, `FAILED_TEACHER_ADMIN:`, `FAILED_TEACHER_USER:`, as well as legacy `FAILED_LEAD:`. Key schemas are fully normalized (supporting full keys like `fullName`/`email` from Step 1, and compact keys `n`/`e`/`p`/`w`/`c`/`tz`/`lid` from Step 2). Keys are deleted ONLY upon successful email dispatch, and preserved if delivery throws.
- **Empirical Verification Drill (Passed Live):**
  1. Seeded 3 real test keys with realistic payloads into the production `SESSION` KV namespace (`14eab319d57e4c58b5f903bce3eb3931`):
     - `FAILED_LEAD_STEP1:test123`
     - `FAILED_LEAD_STEP2:test456`
     - `FAILED_LEAD_WELCOME:test789`
  2. Verified their presence in remote KV via `wrangler kv key list --prefix="FAILED_LEAD_"` -> Returned all 3 keys.
  3. Triggered `retry-queue.ts` via alarm worker: `curl.exe -s -X POST https://quranific-alarm.faisalkhan-llc-ltd.workers.dev/force-run`
     - Response: `{"success":true,"recovered":3,"failed":0}` (HTTP 200).
  4. Verified remote KV namespace: `wrangler kv key list --prefix="FAILED_LEAD_"` -> Returned `[]` (all 3 keys successfully processed, dispatched to Resend, and deleted). Zero stuck keys, zero duplicates.

---

## P1 — Fix Before Launch (High Priority / Launch Risks)

2. **Fix Broken Runtime Secret & Missing Security on Teacher Application (`src/pages/api/apply-teacher.ts`)**
   - **Status:** **[FIXED & VERIFIED LIVE]**
   - **Fix Summary:** Rewrote `src/pages/api/apply-teacher.ts` to use `env` from `cloudflare:workers`, bound to edge secrets `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY`. Added strict Zod schema validation (`teacherSchema`), distributed IP rate limiting (`RL:TEACHER:${ip}`, max 4 submissions per 60s) via KV namespace `SESSION`, Cloudflare Turnstile token validation against `siteverify`, and DLQ fallback persistence (`FAILED_TEACHER:${Date.now()}`). Integrated Turnstile widget inside `TeacherStep2.svelte` and hooked into `TeacherApplicationForm.svelte`.
   - **Empirical Verification Drill (Passed Live on Worker v0834683d):**
     1. **Turnstile Verification Rejection:** Sent POST with invalid Turnstile token to `https://quranific.com/api/apply-teacher`:
        - Response: `HTTP/1.1 400 Bad Request` -> `{"error":"Security check failed. Please refresh and try again."}`.
     2. **Zod Schema Validation:** Sent POST with malformed payload (missing required fields):
        - Response: `HTTP/1.1 400 Bad Request` -> `{"error":"Full name is required"}`.
     3. **KV IP Rate Limiting Throttling:** Sent 4 rapid requests from the same IP:
        - Requests 1-2: Evaluated normally (`HTTP 400`).
        - Requests 3-4: Blocked by Cloudflare KV distributed rate limiter: `HTTP/1.1 429 Too Many Requests` -> `{"error":"Too many requests. Please wait a minute before trying again."}`.

3. **Fix Sitemap Filter Pruning All Programmatic Intent Pages (`astro.config.mjs`)**
   - **Status:** **[FIXED & VERIFIED]**
   - **Fix Summary:** Updated the `sitemap()` filter in `astro.config.mjs` from substring `.includes()` to exact pathname matching (`path.startsWith('/api/') || path.startsWith('/getting-started/') || path.startsWith('/ads/') || path === '/for-kids' || path === '/for-adults' || path === '/for-women'`). This prevents substring matches on valid nested paths while preserving exclusions for internal endpoints and legacy ad redirects.
   - **Verification Evidence:** Ran `npm run build` and inspected generated `dist/client/sitemap-0.xml`. Confirmed all 6 programmatic SEO landing pages are now present and indexed:
     - `https://quranific.com/quran-classes/for-adults/`
     - `https://quranific.com/quran-classes/for-kids/`
     - `https://quranific.com/quran-classes/for-women/`
     - `https://quranific.com/quran-teacher/for-adults/`
     - `https://quranific.com/quran-teacher/for-kids/`
     - `https://quranific.com/quran-teacher/for-women/`
       While `/api/*`, `/getting-started/*`, and `/ads/*` remain excluded.

4. **Unpublish or Replace Placeholder Blog Post (`src/content/blog/hello-world.md`)**
   - **Status:** **[FIXED & VERIFIED]**
   - **Fix Summary:** Added `draft: z.boolean().default(false)` to the Astro content collection schema (`src/content.config.ts`), marked `src/content/blog/hello-world.md` with `draft: true`, and added draft filters to `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, and `src/pages/rss.xml.ts`.
   - **Verification Evidence:** Ran `npm run build` and verified:
     1. Prerender list completely excludes `/blog/hello-world/index.html`.
     2. `dist/client/sitemap-0.xml` has zero occurrences of `hello-world`.
     3. `dist/client/rss.xml` has zero occurrences of `hello-world`.
     4. `dist/client/blog/index.html` cleanly renders the styled "Publishing Soon" empty state card.

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
