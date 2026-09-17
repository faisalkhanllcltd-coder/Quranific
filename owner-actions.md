# Owner Actions

> Manual tasks that require Cloudflare dashboard access, business decisions, DNS changes, or third-party platform configuration. These cannot be executed by an AI agent.
> Last audited: 2026-09-18.

---

## OA-1 — GTM Tag Consent Configuration (MANDATORY before running paid ads)

**Platform:** Google Tag Manager UI (`tagmanager.google.com`)  
**Container:** `GTM-5CJMMJ29`  
**Priority:** Critical — without this, ad tags fire for ALL visitors regardless of consent bucket

The codebase correctly sets `gtag('consent','update',...)` signals via `CookieBanner.svelte` and the Phase 4 client script. However, **GTM must be configured to respect these signals** for each tag individually.

**Steps:**

1. Log into `https://tagmanager.google.com` → Container `GTM-5CJMMJ29`
2. For **every** non-Google tag, open tag → Advanced Settings → Consent Settings → enable "Require additional consent checks"
3. Apply consent types per the table below:

| Tag Type                         | Required Consent Types                             |
| -------------------------------- | -------------------------------------------------- |
| Meta Pixel / Facebook Pixel      | `ad_storage` AND `ad_user_data`                    |
| TikTok Pixel                     | `ad_storage` AND `ad_user_data`                    |
| Google Ads Conversion Tracking   | `ad_storage` AND `ad_user_data`                    |
| Google Ads Remarketing           | `ad_storage`, `ad_user_data`, `ad_personalization` |
| Google Analytics 4 (GA4)         | `analytics_storage`                                |
| Any custom conversion pixel      | `ad_storage`                                       |
| Hotjar / Clarity / heatmap tools | `analytics_storage`                                |

4. Use GTM Preview mode with cleared cookies → verify ad tags show "Blocked by Consent"
5. Accept the banner → verify tags fire after `gtag('consent','update')` in GTM preview log

---

## OA-2 — Verify No Overriding Cloudflare Cache Rules at Zone Level

**Platform:** Cloudflare Dashboard → `quranific.com` zone → Rules → Cache Rules  
**Priority:** High (compliance risk if cache rules override `no-store`)

The edge caching architecture relies exclusively on `CDN-Cache-Control` headers set in `src/middleware.ts`. If any zone-level Cache Rule sets `Cache Everything` or an `Edge Cache TTL` override on HTML routes, it would bypass these headers and could cache personalised API responses.

**Steps:**

1. Log into Cloudflare Dashboard → quranific.com zone
2. Navigate to Rules → Cache Rules
3. Verify: **no rule** applies `Cache Everything` or sets a custom `Edge Cache TTL` on `/`, `/courses/*`, `/tuition-fee`, `/about`, or any HTML route
4. The only caching source for HTML should be the `CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=86400` header set by `middleware.ts`

---

## OA-3 — Configure Server-Side Tracking Secrets (Meta CAPI & GA4)

**Platform:** Cloudflare Pages Dashboard  
**Priority:** Medium (required to activate the PT-5 server-side tracking deployed to `api/complete.ts`)  
**Background:** The code to bypass ad-blockers and send server-to-server conversions is live, but it will silently bypass until these encrypted secrets are provided.

**Steps:**

1. Go to Cloudflare Pages → Quranific Project → Settings → Environment variables
2. Add the following variables to the **Production** environment (mark them as Encrypted):
   - `META_PIXEL_ID` (Your Meta Pixel ID)
   - `META_CAPI_TOKEN` (Generated from Facebook Events Manager → Settings → Generate Access Token)
   - `GA4_MEASUREMENT_ID` (Format: G-XXXXXXXXXX)
   - `GA4_API_SECRET` (Generated from GA4 Admin → Data Streams → Measurement Protocol API secrets)

---

## OA-4 — Configure DLQ Alert Webhook Secret

**Platform:** Cloudflare Pages Dashboard  
**Priority:** Medium (required to receive failure alerts deployed in PT-6)  
**Background:** The Dead Letter Queue (DLQ) retry loop is live. If a lead fails to sync, it will try to alert you via webhook, but the URL is missing.

**Steps:**

1. Create a webhook URL in your preferred platform (Discord Server Settings → Webhooks, Slack Incoming Webhooks, or a Zapier/Make.com catch hook).
2. Go to Cloudflare Pages → Quranific Project → Settings → Environment variables.
3. Add `ALERT_WEBHOOK_URL` to the Production environment (mark as Encrypted) and paste your webhook URL.

---

## OA-5 — Add Secondary Emergency Admin Account to Cloudflare

**Platform:** Cloudflare Dashboard → Manage Account → Members  
**Priority:** Medium (single point of failure risk)

The entire Cloudflare infrastructure (Pages, Workers, KV, DNS, Turnstile) is administered under a single account: `faisalkhan.llc.ltd@gmail.com`. Loss of access to this Google account would lock out all infrastructure management.

**Steps:**

1. Create (or designate) a recovery email address that is stored separately from the primary
2. Log into Cloudflare Dashboard → Manage Account → Members
3. Invite the recovery email as an Account member with `Administrator` role
4. Alternatively: enable Cloudflare's Account recovery via a physical security key

---

## OA-6 — Real-Edge CA-QC and GPC Validation on Cloudflare Pages Preview

**Platform:** Cloudflare Pages Preview URL (not local dev, not production)  
**Priority:** Medium (provisional — verified locally, not at real Cloudflare edge)

Local unit tests (7/7 PASS) and Playwright E2E tests (17/17 PASS) confirm correct bucket logic. However, `cf.regionCode` in `wrangler pages dev` may not be populated from real Cloudflare CF headers.

**Steps:**

1. Deploy to a named Cloudflare Pages preview branch (not production)
2. **CA-QC test:** Use a Canadian VPN set to Quebec province; navigate to the preview URL; verify consent banner appears in STRICT mode (open DevTools → Application → Cookies → verify no `cf_consent_v1` cookie written without user action)
3. **GPC test:** Use Firefox with "Tell websites I do not want to be tracked" enabled (or browser extension that sets `Sec-GPC: 1`); use a PK-geolocated IP; verify STRICT banner appears despite PK being a NONE bucket
