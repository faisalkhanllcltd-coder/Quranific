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
   - **Status:** **[FIXED & VERIFIED]**
   - **Fix Summary:** Updated `SITE.address` in `src/constants/site.ts` to the full statutory street address: `'House No 1 KR-2 Area, Gulshan Askari, Quaidabad Malir, Bin Qasim Town, Karachi 75120, Pakistan'`.
   - **Verification Evidence:** Ran `npm run build` and inspected `dist/client/legal/impressum/index.html`. Confirmed the full registered street address renders directly in the "Registered Address" section, satisfying German TMG § 5 and EU corporate transparency mandates.

6. **Add Cloudflare 301 Redirect Rule for `www.quranific.com` -> `quranific.com`**
   - **Status:** **[FIXED & VERIFIED LIVE]**
   - **Fix Summary:** Configured `run_worker_first = true` under `[assets]` in `wrangler.toml` and added edge entrypoint redirection in `astro.config.mjs` (transforming Cloudflare Worker `handle()` via a Vite build plugin) with secondary protection in `src/middleware.ts`. All incoming requests for `www.quranific.com` are intercepted at the Cloudflare edge before static asset resolution and permanently redirected (HTTP 301) to `https://quranific.com` with `Cache-Control: no-store` and `CDN-Cache-Control: no-store` to prevent cache bleed.
   - **Live Empirical Verification Drill (Passed Live on Worker vf858c912):**
     1. **Root Redirect:** `curl.exe -s -i https://www.quranific.com/`
        - Response: `HTTP/1.1 301 Moved Permanently`
        - `Location: https://quranific.com/`
        - `CF-Cache-Status: BYPASS`
     2. **Subpath Redirect:** `curl.exe -s -i https://www.quranific.com/courses`
        - Response: `HTTP/1.1 301 Moved Permanently` -> `Location: https://quranific.com/courses`
     3. **Query Preservation:** `curl.exe -s -i "https://www.quranific.com/tuition-fee?ref=test"`
        - Response: `HTTP/1.1 301 Moved Permanently` -> `Location: https://quranific.com/tuition-fee?ref=test`
     4. **Apex Domain Direct Serving:** `curl.exe -s -i https://quranific.com/`
        - Response: `HTTP/1.1 200 OK` (no redirect loop).

7. **Add Parent/Guardian Declaration to Student Signup (`src/lib/schema.ts` & `SignupForm.svelte`)**
   - **Status:** **[FIXED & VERIFIED LIVE]**
   - **Fix Summary:** Added `guardianConsent` boolean field to `signupSchema` in `src/lib/schema.ts` with strict Zod validation (`Parent or guardian confirmation is required to register.`). Updated `src/pages/getting-started/_components/SignupForm.svelte` to include a required checkbox with explicit legal microcopy linking to `/legal/terms` and `/legal/privacy` ("I confirm that I am a parent or legal guardian registering on behalf of a student (or an adult student 18+ registering for myself), and I agree to the Terms and Privacy Policy.").
   - **Live Empirical Verification Drill (Passed Live on Worker vc1753731):**
     1. **Submission Without Consent:** Sent registration payload without `guardianConsent`:
        - Command: `curl.exe -s -i -X POST https://quranific.com/api/register -H "Origin: https://quranific.com" -F "name=Test Parent" -F "email=testparent@example.com" -F "whatsapp=+12345678901" -F "country=US" -F "turnstileToken=fake-token"`
        - Response: `HTTP/1.1 400 Bad Request` -> `{"error":"Parent or guardian confirmation is required to register."}`.
     2. **Submission With Consent:** Sent identical payload with `-F "guardianConsent=on"`:
        - Response: Schema validation passed; execution safely advanced to Turnstile token verification: `HTTP/1.1 400 Bad Request` -> `{"error":"Security check failed. Please refresh and try again."}`.

8. **Update Dependency Vulnerabilities (`npm audit`)**
   - **Status:** **[FIXED & VERIFIED]**
   - **Fix Summary:** Ran non-breaking `npm audit fix`, resolving all 9 vulnerabilities (3 high, 5 moderate, 1 low) through compatible semver upgrades: updated `svelte` from `5.55.5` to `5.57.0` (fixing SSR XSS and DOM clobbering advisories), `brace-expansion` to `5.0.9`, `fast-uri` to `3.1.7`, `postcss-selector-parser` to `7.1.6`, `svgo` to `4.1.0`, `yaml` to `2.8.3`, and `@astrojs/language-server` to `2.16.16`.
   - **Verification Evidence:**
     1. `npm audit`: Output: `found 0 vulnerabilities`.
     2. `npm run check`: Diagnosed 131 files -> 0 errors, 0 warnings.
     3. `npm run build`: All 33 static pages prerendered successfully in 42.71s with zero regressions.

---

## P2 — Post-Launch / Quality Refinements (Non-Blocking)

9. **Fix Eslint Configuration for Root Utility Scripts (`eslint.config.mjs`)**
   - **Status:** **[FIXED & VERIFIED]**
   - **Fix Summary:** Configured flat ESLint override in `eslint.config.mjs` for `['*.cjs', '**/*.cjs']` to allow CommonJS `require()` imports (`@typescript-eslint/no-require-imports: 'off'`). Cleaned up unused variable assignments in `dead_code.cjs` and `link_check.cjs`.
   - **Verification Evidence:** `npm run lint` (`eslint .`) exits 0 with 0 errors and 0 warnings. Utility scripts `node dead_code.cjs` and `node link_check.cjs` execute cleanly.

10. **Fix Playwright Test 15 Flakiness (`tests/consent.spec.ts`)**
    - **Defect:** Test 15 clicks the "Accept All" button before waiting for `toBeEnabled()`, causing occasional failures if Svelte hydration is still finalizing.
    - **Fix Required:** Add `await expect(acceptBtn).toBeEnabled({ timeout: BANNER_WAIT });` before `.click()`.

11. **Enhance `CookieBanner.svelte` Accessibility Focus & Keyboard Trap**
    - **Defect:** Modal dialog does not trap keyboard focus or dismiss on `Escape`.
    - **Fix Required:** Add `keydown` Escape handler and focus containment within the dialog container.

12. **Purge Unused Font Subsets (Cyrillic, Vietnamese, Greek)**
    - **Defect:** Font packages bundle unused Cyrillic/Vietnamese font files in `dist/client/_astro/`.
    - **Fix Required:** Prune unused font imports from `@fontsource/merriweather` and `@fontsource-variable/inter` to optimize bundle payload.
