# Phase 7 — Manual GTM & Compliance Checklist

# For: Quranific Cookie Consent System

# Date: 2026-09-01 (Updated: 2026-09-02 — Phase R1 remediation)

# Author: Consent Agent

---

## ⚠️ G. Architecture Change — Accepted Business Impact (Phase R1 Remediation)

**This section documents an understood, intentional trade-off. It is not a bug.**

### What changed and why

The original implementation baked a server-computed country-bucket value into the cached
HTML (`const consentBucket = "STRICT"`). This was a compliance failure: Cloudflare's
default cache key is URL-only, meaning the first visitor's response is served to all
subsequent visitors at that edge PoP, regardless of their country. Additionally, the
`[intent]` landing pages and all `/courses/[slug]/` pages are statically prerendered
(`export const prerender = true`), so middleware never runs per-visitor — there was no
"per-request bucket" at all for those pages.

The fix (Phase R1): the consent default snippet is now **unconditionally denied** for all
visitors — safe to cache, safe for prerendered pages. The per-visitor bucket upgrade
is fetched asynchronously from `/api/consent-bucket` after page load.

### Accepted trade-off

**Grant-by-default visitors** (US, CA non-QC, AU, and rest-of-world NONE-bucket regions)
now have their analytics/ad tags fire **after an async fetch resolves**, not at initial
page load. Timeline:

- Default: all denied (fires synchronously in `<head>`, char ~1000)
- `wait_for_update: 500ms` tells Consent Mode to hold tag execution for 500ms
- `/api/consent-bucket` fetch: typically **< 50ms** on Cloudflare edge (SSR worker, same PoP)
- On grant: `gtag('consent','update', {...granted})` fires, GTM tags execute
- Worst case on slow connections (> 500ms fetch): first pageview/conversion tag fires
  with denied defaults, then fires again with granted on next fetch cycle

**For returning visitors** (cookie present): PATH A applies — no fetch, instant gtag
update from stored cookie. No performance impact for repeat visitors.

**EU/UK/STRICT visitors**: unaffected — were already denied-by-default, no change.

**This trade-off is accepted, documented, and understood.** It is the necessary cost
of compliance given the shared edge cache without disabling caching or flipping
prerendered pages to SSR. Neither of those alternatives was within the scope of
this change per the Phase R1 directive.

---

## A. GTM Tag Consent Configuration (MUST DO IN GTM UI)

The GTM container (ID: GTM-5CJMMJ29) is UI-managed and not in this repository.
Log into https://tagmanager.google.com and perform the following for EVERY
non-Google tag in the container.

### For each tag:

1. Open the tag
2. Click **Advanced Settings**
3. Expand **Consent Settings**
4. Under "Require additional consent checks for this tag," enable it
5. Set the required consent type(s) based on the table below:

| Tag Type                         | Required Consent Types                             |
| -------------------------------- | -------------------------------------------------- |
| Meta Pixel / Facebook Pixel      | `ad_storage` AND `ad_user_data`                    |
| TikTok Pixel                     | `ad_storage` AND `ad_user_data`                    |
| Google Ads Conversion Tracking   | `ad_storage` AND `ad_user_data`                    |
| Google Ads Remarketing           | `ad_storage`, `ad_user_data`, `ad_personalization` |
| Google Analytics 4 (GA4)         | `analytics_storage`                                |
| Any custom conversion pixel      | `ad_storage`                                       |
| Hotjar / Clarity / heatmap tools | `analytics_storage`                                |

> ⚠️ **Critical:** If a tag does not have consent requirements configured, it
> will fire in ALL buckets regardless of what this consent system sets. The
> GTM UI consent settings are the enforcement layer — the code in this repo
> only sets the signal. GTM must check it.

### After configuring tags:

- Preview the container in GTM Preview mode
- With browser cookies cleared, simulate a page load
- Verify in the GTM Preview panel that ad tags show "Blocked by Consent" status
- Accept consent in the banner, verify tags fire after gtag('consent','update') call

---

## B. Cloudflare Dashboard Cache Rules (VERIFY MANUALLY)

The `_headers` file sets `CDN-Cache-Control` via middleware. However, if any
**Cloudflare Dashboard Cache Rules** override this at the zone level, they
could cache personalized HTML (e.g., a user's `cf.country` STRICT decision)
and serve it to another user in a different country.

1. Log into the Cloudflare dashboard → quranific.com zone
2. Go to **Rules → Cache Rules**
3. Verify NO rule sets `Cache Everything` or `Edge Cache TTL` for HTML routes
   (especially `/`, `/courses/*`, `/about`, etc.)
4. The only caching happening should be via the `CDN-Cache-Control` header
   set in `middleware.ts` (which caches the whole-page SSR output — this is
   SAFE because the country bucket is NOT baked into the cached HTML;
   banner visibility is always decided client-side)

---

## C. CA-QC and GPC — Real Edge Validation (PROVISIONAL until done)

The unit tests confirm local logic is correct. However:

- `cf.regionCode` in wrangler local dev may not be populated. In production on
  Cloudflare Edge it IS available. **Before going live**, deploy to a Cloudflare
  Pages preview environment and use a Canadian VPN set to Quebec to verify the
  banner shows in STRICT mode for CA-QC users.

- Similarly, test with a browser that sends `Sec-GPC: 1` (Firefox with
  "Do Not Track" enabled, or manually set via browser extension) on a page
  that would otherwise be NONE-bucket (e.g., PK IP). Verify the STRICT
  consent defaults fire in the browser console.

---

## D. Open Decision — Server-Side Conversion Tracking

**This is NOT built and requires explicit go-ahead before implementing.**

The current consent architecture means EU/UK/STRICT-bucket users who decline
consent will have ZERO client-side conversion tracking (GA4, Meta Pixel, etc.).
This is legally correct, but means a reporting gap for that segment.

A compliant alternative is **server-side conversion tracking**:

- **GA4 Measurement Protocol**: Send conversion events directly from your API
  routes (e.g., when `api/register.ts` or `api/complete.ts` succeeds) to GA4,
  keyed on the `q_session` cookie (already present as an HttpOnly cookie).
  This does not require consent because no client-side tracking cookie is set.
- **Meta Conversion API (CAPI)**: Same pattern — send conversion events from
  the server on successful signup, using hashed email/phone from the form data.

**Decision required:** Is server-side conversion tracking in scope now?
If yes, this should be a separate feature branch. The existing `q_session`
JWT cookie infrastructure already provides the session ID needed to deduplicate
events between client and server.

---

## E. Cookie Policy Page Update

The existing `/legal/cookies` page (`src/pages/legal/cookies.astro`) describes
cookie categories but does not reference the consent banner or provide a mechanism
to change consent choices after the initial decision.

**Action required (human):**

1. Add a section to the cookies page: "Manage Your Cookie Preferences"
2. Add a button that re-opens the consent banner (clear `cf_consent_v1` cookie
   and reload, or expose a `window.__reopenConsentBanner()` global from the
   Svelte component)
3. This is a legal requirement in EU/UK — users must be able to withdraw consent
   as easily as they gave it (GDPR Article 7(3))

---

## F. Consent Record Keeping (Future, Not Built)

GDPR and PECR technically require that you can demonstrate consent was given
(when, what was consented to, which version of the privacy notice was shown).
The current implementation stores consent only in a client-side cookie.

**Decision required:** If regulators request consent records, the current
implementation cannot produce them. Consider logging a minimal consent record
(timestamp, bucket, choice, session ID) to Cloudflare KV on each consent
decision. The `SESSION` KV namespace is already wired. This is a low-effort
addition to the banner's `acceptAll`/`rejectAll` API calls.
