# Pending Tasks

> Strictly verified open engineering tasks. Every item cross-referenced against the current codebase (`src/`, `astro.config.mjs`, `wrangler.toml`) and confirmed NOT yet implemented.
> Last audited: 2026-09-16. All P0, P1, P2 prelaunch items are CLOSED and excluded.

---

## PT-1 — Add Automated API Tests for `/api/contact` and `/api/apply-teacher`

**Priority:** Medium  
**Source:** PRELAUNCH_AUDIT_REPORT §49 (unclosed `[ ]` item)  
**Status:** No test files exist for these endpoints. `tests/` only contains `consent.spec.ts` and `consent-unit.test.ts`.

**What is missing:**  
`/api/contact` and `/api/apply-teacher` have zero automated test coverage. All security properties (rate limiting, Turnstile rejection, Zod validation, DLQ write) were manually verified via `curl` during the audit but are not regression-protected.

**What to build:**  
Create `tests/api-contact.spec.ts` and `tests/api-teacher.spec.ts` (Playwright or a dedicated HTTP test runner). Each test file must cover:

1. `POST` with missing required fields → expect `400` + Zod error message
2. `POST` with invalid Turnstile token → expect `400` + `"Security check failed"`
3. `POST` 5× rapid from same IP → expect `429` on 5th request
4. `POST` with valid payload + valid Turnstile (use test token `1x00000000000000000000AA`) → expect `200`

**Files to create:**

- `tests/api-contact.spec.ts`
- `tests/api-teacher.spec.ts`

---

## PT-2 — Add `window.__reopenConsentBanner()` and "Manage Cookies" Button on `/legal/cookies`

**Priority:** High (EU/GDPR legal requirement)  
**Source:** CONSENT_MANUAL_CHECKLIST §E  
**Status:** Not implemented. `src/pages/legal/cookies.astro` describes cookies but provides no mechanism to change a previously made consent decision.

**What is missing:**  
GDPR Article 7(3) requires that consent can be withdrawn as easily as it was granted. Users who accepted cookies cannot currently revoke that decision without manually clearing browser cookies.

**What to build:**

1. **`CookieBanner.svelte`** — Expose a global function in an `$effect` block:
   ```js
   $effect(() => {
     if (typeof window !== 'undefined') {
       window.__reopenConsentBanner = () => {
         document.cookie = 'cf_consent_v1=; Max-Age=0; Path=/';
         open = true;
       };
     }
   });
   ```
2. **`src/pages/legal/cookies.astro`** — Add a "Manage Cookie Preferences" section with a button:
   ```html
   <button onclick="window.__reopenConsentBanner?.()">Manage Cookie Preferences</button>
   ```
   Include a note that preferences can also be reset by clearing browser cookies.

---

## PT-3 — Standardise Eyebrow Typography Tokens

**Priority:** Low (visual consistency, non-blocking)  
**Source:** audits/Global UI Typography Audit.md  
**Status:** Not implemented. The typography audit identified three divergent eyebrow patterns across 30+ components with no shared token.

**What is missing:**  
Eyebrow elements use 3+ different font sizes (text-[11px], text-xs, text-sm), 3+ weights (font-bold, font-black, font-semibold), and 3+ tracking values (tracking-widest, tracking-wider, tracking-[0.2em]) with no centralised token. The existing EyebrowText.astro UI primitive exists but is not consistently used across landing and block components.

**What to build:**  
Define canonical CSS utility classes in `src/styles/global.css` using Tailwind v4 `@layer components`:

```css
@layer components {
  .eyebrow-pill {
    @apply text-[11px] font-bold uppercase tracking-widest;
  }
  .eyebrow-text {
    @apply text-xs font-bold uppercase tracking-widest block mb-3;
  }
  .eyebrow-micro {
    @apply text-[9px] font-bold uppercase tracking-wider;
  }
}
```

Then migrate the 30+ hardcoded instances identified in the typography audit to use these classes. Priority order: LandingProblem, LandingOutcome, LandingTrust, LandingFAQ, LandingPricing, LandingCTA, then homepage blocks.

---

## PT-4 — Consent Record Logging to KV (Optional, GDPR Defence)

**Priority:** Low (regulatory defensibility, not a legal block)  
**Source:** CONSENT_MANUAL_CHECKLIST §F  
**Status:** Not built. Decision still open.

**What to build (if approved by owner):**  
In `CookieBanner.svelte`, after writing the `cf_consent_v1` cookie on accept/reject, dispatch a fire-and-forget `POST /api/consent-record` with `{ timestamp, bucket, choice, sessionId }`. The endpoint writes a minimal record to the `SESSION` KV namespace under key `CONSENT_RECORD:{timestamp}:{sessionId}` with a 2-year TTL.

This gives demonstrable proof of consent records should a regulator request them.

Owner decision required before implementing — see `owner-actions.md` OA-3.

---

## PT-5 — Server-Side Conversion Tracking (GA4 Measurement Protocol / Meta CAPI)

**Priority:** Medium (revenue attribution gap for EU STRICT visitors)  
**Source:** CONSENT_MANUAL_CHECKLIST §D  
**Status:** Not built. Decision still open.

**What to build (if approved by owner):**  
In `src/pages/api/complete.ts`, after the idempotency guard passes, add a `waitUntil()`-wrapped call to:

- **GA4 Measurement Protocol** — POST to `https://www.google-analytics.com/mp/collect` with `client_id` (derived from `q_session` JWT `jti`), event name `purchase` or `sign_up`, and revenue value from step2 pricing data.
- **Meta CAPI** — POST to `https://graph.facebook.com/{pixel_id}/events` with hashed email/phone from step1 data, event `CompleteRegistration`.

These calls are consent-independent (server-side, no cookies set) and do not require GDPR consent.

Owner decision required before implementing — see `owner-actions.md` OA-4.

---

## PT-6 — DLQ Alerting: Discord/Email Webhook on Non-Zero Recovery

**Priority:** Medium (ops visibility)  
**Source:** PRELAUNCH_AUDIT_REPORT §54  
**Status:** Not built. Currently the only way to know the DLQ had failures is to manually inspect the alarm-worker logs in Cloudflare dashboard.

**What to build:**  
In `src/pages/api/internal/retry-queue.ts`, after the recovery loop completes, if `recoveredCount > 0`:

```ts
if (recoveredCount > 0 && env.ALERT_WEBHOOK_URL) {
  await fetch(env.ALERT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `[Quranific DLQ] Recovered ${recoveredCount} failed email(s). ${failedCount} still failing.`,
    }),
  });
}
```

Add `ALERT_WEBHOOK_URL` as an optional secret in `src/env.d.ts` and `.env.example`. Works with Discord (`/api/webhooks/...`), Slack incoming webhooks, or any POST-accepting endpoint.
