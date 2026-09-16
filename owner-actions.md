# Owner Actions

> Manual tasks that require Cloudflare dashboard access, business decisions, DNS changes, or third-party platform configuration. These cannot be executed by an AI agent.
> Last audited: 2026-09-16.

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

## OA-3 — Decide: Consent Record Logging to KV

**Priority:** Low (regulatory defensibility, not a legal block today)  
**Background:** GDPR technically requires demonstrating that consent was given (timestamp, what was consented to, which policy version). The current implementation stores consent only in a client-side browser cookie — no server-side record exists.

**Decision required:**

- **Yes → implement:** Agent will add a `POST /api/consent-record` endpoint that writes a minimal record `{ timestamp, bucket, choice }` to KV (2-year TTL). Low-effort addition. → See `pending-tasks.md` PT-4.
- **No → document:** Accept the risk; note in Privacy Policy that consent records are stored client-side only.

---

## OA-4 — Decide: Server-Side Conversion Tracking (GA4 MAPI / Meta CAPI)

**Priority:** Medium (revenue attribution gap)  
**Background:** EU/UK STRICT-bucket visitors who decline consent have **zero** client-side conversion tracking. This means registrations from EU/UK are invisible in GA4 and Meta Pixel.

A compliant alternative — server-side conversion tracking — requires no consent because no client-side cookie is set:

- **GA4 Measurement Protocol:** Send `sign_up` events from `api/complete.ts` directly to Google's MP API using the JWT `jti` as `client_id`
- **Meta Conversion API (CAPI):** Send `CompleteRegistration` events using hashed email/phone from signup data

**Decision required:**

- **Yes → implement:** Provide GA4 Measurement Protocol API secret and (if needed) Meta Pixel ID + CAPI token. Agent will implement in `api/complete.ts` via `waitUntil()`. → See `pending-tasks.md` PT-5.
- **No → accept:** EU/UK conversions remain untracked in ad platforms.

---

## OA-5 — Add Secondary Emergency Admin Account to Cloudflare

**Platform:** Cloudflare Dashboard → Manage Account → Members  
**Priority:** Medium (single point of failure risk)  
**Source:** PRELAUNCH_AUDIT_REPORT §53

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
**Source:** CONSENT_AGENT_STATE §"Open items for human", CONSENT_MANUAL_CHECKLIST §C

Local unit tests (7/7 PASS) and Playwright E2E tests (17/17 PASS) confirm correct bucket logic. However, `cf.regionCode` in `wrangler pages dev` may not be populated from real Cloudflare CF headers.

**Steps:**

1. Deploy to a named Cloudflare Pages preview branch (not production)
2. **CA-QC test:** Use a Canadian VPN set to Quebec province; navigate to the preview URL; verify consent banner appears in STRICT mode (open DevTools → Application → Cookies → verify no `cf_consent_v1` cookie written without user action)
3. **GPC test:** Use Firefox with "Tell websites I do not want to be tracked" enabled (or browser extension that sets `Sec-GPC: 1`); use a PK-geolocated IP; verify STRICT banner appears despite PK being a NONE bucket

---

## OA-7 — DLQ Alert Webhook: Provide Destination URL

**Priority:** Medium  
**Source:** `pending-tasks.md` PT-6  
**Background:** The agent can implement `ALERT_WEBHOOK_URL` support in the retry-queue endpoint (PT-6), but the destination URL is a business decision.

**Action:** Choose one:

- Discord: Create a webhook in your Discord server (Server Settings → Integrations → Webhooks) and provide the URL
- Slack: Create an Incoming Webhook app in your workspace and provide the URL
- Email: Any service with a `POST` webhook → email relay (e.g., Zapier, Make.com)

Then set `ALERT_WEBHOOK_URL` as a secret in the Cloudflare Pages dashboard after PT-6 is implemented.
