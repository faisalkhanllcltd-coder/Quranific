# Owner Actions & Pre-Launch Verification Checklist: Quranific.com

> **Purpose:** Single consolidated, authoritative runbook for all manual tasks that require Cloudflare dashboard access, registrar management, business decisions, external credentials, or third-party platform configuration.  
> **Authoritative Source:** This document is the single source of truth for owner-level operational actions. `PENDING-TASKS.md` defers to this file for all owner items.  
> **Branch:** `staging/security-and-arch-fixes`  
> **Last Audited & Probed:** 2026-10-08  
> **Methodology:** Every checkable item was verified against live production (`quranific.com`), Google Public DNS-over-HTTPS, and Cloudflare Wrangler APIs.

---

## Executive Status Dashboard

| Category / Urgency                                   | Total Items | ✅ Done | ❌ Still Open | ⚠️ Owner-Only to Verify |
| :--------------------------------------------------- | :---------: | :-----: | :-----------: | :---------------------: |
| **Tier 1: Blocks Going Live (Pre-Deploy / Pre-Ads)** |      8      |    1    |       4       |            2            |
| **Tier 2: Do Soon (First 48h / Pre-Scale)**          |      7      |    2    |       3       |            2            |
| **Tier 3: Later (Hygiene, Monitoring & Governance)** |     10      |    1    |       0       |            9            |
| **Total**                                            |   **25**    |  **4**  |     **7**     |         **13**          |

_(Note: OA-03 Meta CAPI is obsolete/purged, bringing actionable items to 24)_

---

## Quick Reference Status Matrix

| ID        | Item Description                                    | Urgency Tier     |        Status        | Verification Method / Proof                                                                |
| :-------- | :-------------------------------------------------- | :--------------- | :------------------: | :----------------------------------------------------------------------------------------- |
| **OA-01** | Provision `INTERNAL_WORKER_SECRET`                  | Tier 1 (Blocker) |    ❌ Still Open     | `wrangler secret list` (missing on both root and alarm workers)                            |
| **OA-02** | Provision `ALARM_ADMIN_TOKEN`                       | Tier 1 (Blocker) |    ❌ Still Open     | `wrangler secret list -c alarm-worker/wrangler.toml` (missing)                             |
| **OA-03** | Server-Side Ad Secrets (`META_CAPI`, GA4)           | N/A (Purged/Opt) |     ➖ Obsolete      | Meta CAPI purged from codebase; GA4 measurement secrets optional for server telemetry      |
| **OA-04** | Update Root SPF DNS Record for Resend               | Tier 1 (Blocker) |    ❌ Still Open     | DNS TXT: `v=spf1 include:_spf.mx.cloudflare.net ~all` (missing Resend)                     |
| **OA-05** | Add Universal SSL CAA DNS Records                   | Tier 1 (Blocker) |    ❌ Still Open     | DNS CAA: 0 records returned via DoH                                                        |
| **OA-06** | Verify Resend DKIM DNS Record                       | Tier 1 (Blocker) |       ✅ Done        | DNS TXT `resend._domainkey.quranific.com`: `p=MIGf...` active                              |
| **OA-07** | GTM Tag Consent Settings (`GTM-5CJMMJ29`)           | Tier 1 (Blocker) | ⚠️ Owner Must Check  | GTM Dashboard: `https://tagmanager.google.com`                                             |
| **OA-08** | Verify No Overriding Zone Cache Rules               | Tier 1 (Blocker) | ⚠️ Owner Must Check  | Cloudflare Dashboard: Rules → Cache Rules                                                  |
| **OA-09** | **Disable Public `workers.dev` on Alarm Worker**    | Tier 2 (Do Soon) |    ❌ Still Open     | `curl.exe -sI https://quranific-alarm...workers.dev` returns HTTP 200 (Requires Dashboard) |
| **OA-10** | Verify Root Worker `workers.dev` Disabled           | Tier 2 (Do Soon) |       ✅ Done        | `curl.exe -sI https://quranific...workers.dev` returns HTTP 404                            |
| **OA-11** | Configure DLQ `ALERT_WEBHOOK_URL` Secret            | Tier 2 (Do Soon) |    ❌ Still Open     | `wrangler secret list -c alarm-worker/wrangler.toml` (missing)                             |
| **OA-12** | Enable DNSSEC Signing & Submit DS Record            | Tier 2 (Do Soon) | ⚠️ Owner Must Check  | DNS DS: 0 records. Requires Cloudflare DNS + Hostinger Registrar                           |
| **OA-13** | Verify SSL/TLS Encryption Mode (Full Strict)        | Tier 2 (Do Soon) | ⚠️ Owner Must Check  | Cloudflare Dashboard: SSL/TLS Overview                                                     |
| **OA-14** | Verify Cloudflare WAF & Bot Fight Mode              | Tier 2 (Do Soon) | ⚠️ Owner Must Check  | Cloudflare Dashboard: Security → WAF / Bots                                                |
| **OA-15** | Verify Canonical HTTPS & www Redirects              | Tier 2 (Do Soon) |       ✅ Done        | HTTP 301 to `https://quranific.com/`; HSTS + HTTP/3 verified                               |
| **OA-16** | Account 2FA & Secondary Emergency Admin             | Tier 3 (Later)   | ⚠️ Owner Must Check  | Cloudflare Dashboard: Manage Account → Members / 2FA                                       |
| **OA-17** | Scoped Cloudflare API Tokens (No Global Key)        | Tier 3 (Later)   | ⚠️ Owner Must Check  | Cloudflare Dashboard: My Profile → API Tokens                                              |
| **OA-18** | GitHub `main` Branch Protection Rules               | Tier 3 (Later)   | ⚠️ Owner Must Check  | GitHub: `github.com/faisalkhanllcltd-coder/Quranific/settings/branches`                    |
| **OA-19** | DMARC Policy Progression (`p=none` to `quarantine`) | Tier 3 (Later)   | ✅ Done (Monitoring) | DNS TXT `_dmarc.quranific.com`: `v=DMARC1; p=none` active                                  |
| **OA-20** | External Synthetic Uptime Monitor                   | Tier 3 (Later)   | ⚠️ Owner Must Check  | Better Uptime / UptimeRobot setup pinging `/` and `/robots.txt`                            |
| **OA-21** | Legal Counsel Review: Children's Data / COPPA       | Tier 3 (Later)   | ⚠️ Owner Must Check  | External legal review of `/getting-started/signup` funnel                                  |
| **OA-22** | Submit Domain to HSTS Preload List                  | Tier 3 (Later)   | ⚠️ Owner Must Check  | `https://hstspreload.org/?domain=quranific.com`                                            |
| **OA-23** | Cloudflare Pages Preview Edge Validation            | Tier 3 (Later)   | ⚠️ Owner Must Check  | Cloudflare Pages Preview URL (Quebec VPN + GPC validation)                                 |
| **OA-24** | Core Web Vitals & Live Conversion Attribution       | Tier 3 (Later)   | ⚠️ Owner Must Check  | Google Search Console + GA4 DebugView / Tag Assistant                                      |
| **OA-25** | Homepage Edge Cache Hit Rate Monitoring             | Tier 3 (Later)   | ⚠️ Owner Must Check  | Cloudflare Workers Analytics post-launch observation                                       |

---

# Detailed Action Items Grouped by Urgency

---

## Tier 1 — Critical Pre-Deploy Blockers (Must Do Before First Live Ad Dollar)

### OA-01 — Provision `INTERNAL_WORKER_SECRET` on Both Workers

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare CLI (`wrangler secret put`) or Cloudflare Dashboard
- **Empirical Proof:** `npx wrangler secret list` on root worker shows only `[JWT_SECRET, RESEND_API_KEY, TURNSTILE_SECRET_KEY]`. `alarm-worker` shows only `[JWT_SECRET]`.
- **Risk:** Without this secret, `src/pages/api/internal/retry-queue.ts` and `alarm-worker` fall back to comparing against `JWT_SECRET` (secret reuse vulnerability across different operational trust boundaries).
- **Exact Steps:**
  1. Generate a cryptographically secure 64-character random hex string:
     ```powershell
     node -e "console.log(crypto.randomBytes(32).toString('hex'))"
     ```
  2. Set the secret on the root Cloudflare Pages/Worker project:
     ```powershell
     npx wrangler secret put INTERNAL_WORKER_SECRET
     ```
  3. Set the identical secret on the alarm worker:
     ```powershell
     npx wrangler secret put INTERNAL_WORKER_SECRET -c alarm-worker/wrangler.toml
     ```
  4. Verify both show `INTERNAL_WORKER_SECRET` in their secret lists.

---

### OA-02 — Provision `ALARM_ADMIN_TOKEN` on Alarm Worker

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare CLI (`wrangler secret put`) or Cloudflare Dashboard
- **Empirical Proof:** `npx wrangler secret list -c alarm-worker/wrangler.toml` returns only `JWT_SECRET`.
- **Risk:** Endpoints `/force-run` and `/resend-log` in `alarm-worker/src/index.ts` require admin authentication. If unset, fallback logic or unauthorized invocations can degrade DLQ operations.
- **Exact Steps:**
  1. Generate an admin token string:
     ```powershell
     node -e "console.log(crypto.randomBytes(32).toString('hex'))"
     ```
  2. Set the secret on the alarm worker:
     ```powershell
     npx wrangler secret put ALARM_ADMIN_TOKEN -c alarm-worker/wrangler.toml
     ```
  3. Store this token securely in your password manager for triggering manual DLQ retries or reading worker logs.

---

### OA-03 — Server-Side Ad Secrets (`META_CAPI` & `GA4`)

- **Status:** ➖ **Obsolete / Optional**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Details:**
  - `META_CAPI_TOKEN` & `META_PIXEL_ID`: **Purged from codebase.** Server-side Meta CAPI requests have been completely eliminated. No secret setup is needed.
  - Optional GA4 Server Secrets: If server-side GA4 Measurement Protocol is desired for `/api/complete.ts`, provision:
    ```powershell
    npx wrangler secret put GA4_MEASUREMENT_ID
    npx wrangler secret put GA4_API_SECRET
    ```
    _(If omitted, `complete.ts` safely skips server-side GA4 dispatch without error)._

---

### OA-04 — Update Root Domain SPF Record to Include Resend

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare Dashboard → `quranific.com` zone → DNS → Records
- **Dashboard URL:** `https://dash.cloudflare.com/?to=/:account/:zone/dns`
- **Empirical Proof:** Live Google DoH query for TXT on `quranific.com` returned:
  ```text
  v=spf1 include:_spf.mx.cloudflare.net ~all
  ```
  `include:resend.com` is completely **missing**!
- **Risk:** Transactional emails sent from `@quranific.com` via Resend will fail SPF alignment and land in recipient Spam/Junk folders.
- **Exact Steps:**
  1. Navigate to Cloudflare DNS: `https://dash.cloudflare.com/?to=/:account/:zone/dns`.
  2. Locate the existing root TXT record for `quranific.com` containing `v=spf1`.
  3. Edit the value to include `include:resend.com` before `~all`:
     ```text
     v=spf1 include:_spf.mx.cloudflare.net include:resend.com ~all
     ```
  4. Save the record. Re-query after 60 seconds to confirm:
     ```powershell
     node -e "const https = require('https'); https.get('https://dns.google/resolve?name=quranific.com&type=TXT', r => { let d = ''; r.on('data', c => d += c); r.on('end', () => console.log(JSON.parse(d).Answer.map(a => a.data))); });"
     ```

---

### OA-05 — Add Universal SSL Certification Authority Authorization (CAA) Records

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare Dashboard → `quranific.com` zone → DNS → Records
- **Dashboard URL:** `https://dash.cloudflare.com/?to=/:account/:zone/dns`
- **Empirical Proof:** Live Google DoH query for CAA on `quranific.com` returned:
  ```text
  No Answer (0 CAA records found). Status: 0
  ```
- **Risk:** Without explicit CAA records, rogue CAs could misissue certificates. Furthermore, if Cloudflare Universal SSL rotates to an unlisted CA by default, automated renewals can fail.
- **Exact Steps:**
  1. Navigate to Cloudflare DNS: `https://dash.cloudflare.com/?to=/:account/:zone/dns`.
  2. Add four `CAA` records for apex `quranific.com` with Flag `0` and Tag `issue`:
     - `letsencrypt.org`
     - `digicert.com`
     - `sectigo.com`
     - `pki.goog`
  3. Add one `CAA` record with Tag `issuewild` set to `;` (or identical CAs if wildcards are needed).

---

### OA-06 — Verify Resend DKIM DNS Record

- **Status:** ✅ **Done**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare DNS
- **Empirical Proof:** Live DNS query for TXT on `resend._domainkey.quranific.com` returned:
  ```text
  p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD3MVXo+TwMmAGKtjMMGLoeV6WXkSphCYVv5LUxgYGue7hOmUCJ60NBNnjZpSBSNkHkFoUvijB2S+cSexCBnpxX2Ln5eya9svO4LUVnDy6uq8XvXXTnkIMYNKdiEaZWZLKDVuxS/yfXX30r/DzT+AsgB2EV4DMunitR/MMjtmsxHQIDAQAB
  ```
- **Result:** DKIM public key is active, published, and cryptographically valid. No owner action required.

---

### OA-07 — GTM Tag Consent Settings (`GTM-5CJMMJ29`)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Google Tag Manager UI
- **Dashboard URL:** `https://tagmanager.google.com` (Container: `GTM-5CJMMJ29`)
- **Why It Matters:** Codebase sends `gtag('consent', 'update', ...)` signals from `CookieBanner.svelte`. However, in GTM, tags will fire unconditionally regardless of user consent unless individual tags have "Additional Consent Checks" configured.
- **Exact Steps:**
  1. Open `https://tagmanager.google.com` → Container `GTM-5CJMMJ29`.
  2. For every marketing/tracking tag, navigate to **Tag Configuration** → **Advanced Settings** → **Consent Settings**.
  3. Select **"Require additional consent for tag to fire"** and add:
     - Meta Pixel / TikTok Pixel: `ad_storage` AND `ad_user_data`
     - Google Ads Conversion / Remarketing: `ad_storage`, `ad_user_data`, `ad_personalization`
     - Hotjar / Clarity / Analytics: `analytics_storage`
  4. Test in GTM Preview mode with clean storage: verify tags remain in "Blocked by Consent" state until user accepts the banner.

---

### OA-08 — Verify No Overriding Cloudflare Cache Rules at Zone Level

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare Dashboard → `quranific.com` zone → Rules → Cache Rules
- **Dashboard URL:** `https://dash.cloudflare.com/?to=/:account/:zone/rules/cache-rules`
- **Why It Matters:** Edge caching uses `CDN-Cache-Control` headers set by `src/middleware.ts` and the Workers Cache API. If a dashboard rule specifies `Cache Everything` on HTML routes, it could cache user-specific responses, CSRF tokens, or bypass middleware security.
- **Exact Steps:**
  1. Navigate to Rules → Cache Rules in Cloudflare Dashboard.
  2. Verify: **no rule** applies `Cache Everything` or overrides Edge Cache TTL on `/`, `/courses/*`, `/tuition-fee`, or any `/api/*` endpoints.

---

## Tier 2 — High Priority Pre-Scale Actions (First 48 Hours)

### OA-09 — Disable Public `workers.dev` Route on Alarm Worker

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare Dashboard (Workers & Pages)
- **Dashboard URL:** `https://dash.cloudflare.com/?to=/:account/workers/services/view/quranific-alarm/settings/triggers`
- **Empirical Proof:** Live probe executed:
  ```powershell
  curl.exe -sI https://quranific-alarm.faisalkhan-llc-ltd.workers.dev
  ```
  returned:
  ```text
  HTTP/1.1 200 OK
  ```
- **CRITICAL NOTE:** Even though `workers_dev = false` is defined in `alarm-worker/wrangler.toml`, Cloudflare does **not** automatically unbind an existing `.workers.dev` route once it has previously been published with `workers.dev` enabled. It remains publicly accessible until explicitly disabled in the Cloudflare dashboard.
- **Risk:** The alarm worker is exposed to public probing, vulnerability scanners, and automated bots.
- **Exact Steps:**
  1. Navigate to Cloudflare Dashboard → **Workers & Pages** → **`quranific-alarm`** → **Settings** → **Triggers**.
  2. Locate the route under **`*.workers.dev`**.
  3. Click **Disable** or toggle off the `workers.dev` route manually.
  4. Verify via terminal: `curl.exe -sI https://quranific-alarm.faisalkhan-llc-ltd.workers.dev` should return HTTP 404 or connection refused.

---

### OA-10 — Verify Root Worker `workers.dev` Route Disabled

- **Status:** ✅ **Done**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare Workers
- **Empirical Proof:** `curl.exe -sI https://quranific.faisalkhan-llc-ltd.workers.dev` returned:
  ```text
  HTTP/1.1 404 Not Found
  ```
- **Result:** Root worker is not exposed via `workers.dev`. Only the apex custom domain `quranific.com` is active.

---

### OA-11 — Configure Dead-Letter Queue (DLQ) Alert Webhook URL

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare CLI or Dashboard
- **Empirical Proof:** `ALERT_WEBHOOK_URL` is missing from `npx wrangler secret list -c alarm-worker/wrangler.toml`.
- **Why It Matters:** When lead delivery fails repeatedly after exponential retries, `alarm-worker` posts an alert notification to this webhook. Without it, failed leads remain silent in the dead-letter KV queue.
- **Exact Steps:**
  1. Create an Incoming Webhook in Slack (Channel Settings → Integrations), Discord (Server Settings → Integrations → Webhooks), or Make/Zapier.
  2. Set the secret on `alarm-worker`:
     ```powershell
     npx wrangler secret put ALERT_WEBHOOK_URL -c alarm-worker/wrangler.toml
     ```

---

### OA-12 — Enable DNSSEC Signing & Submit DS Record to Registrar

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare DNS Settings + Hostinger Registrar Console
- **Dashboard URL (Cloudflare):** `https://dash.cloudflare.com/?to=/:account/:zone/dns/settings`
- **Dashboard URL (Hostinger):** `https://hpanel.hostinger.com/` → Domains → `quranific.com` → DNS / DNSSEC
- **Empirical Proof:** Live Google DoH query for DS record on `quranific.com` returned:
  ```text
  No Answer (0 DS records found). Status: 0
  ```
- **Exact Steps:**
  1. In Cloudflare Dashboard → DNS → Settings, click **"Enable DNSSEC"**.
  2. Copy the DS record values (Key Tag, Algorithm, Digest Type, Digest).
  3. Log into Hostinger hPanel → Domains → `quranific.com` → DNSSEC.
  4. Paste the DS record values and save. Verify after 1-2 hours:
     ```powershell
     node -e "const https = require('https'); https.get('https://dns.google/resolve?name=quranific.com&type=DS', r => { let d = ''; r.on('data', c => d += c); r.on('end', () => console.log(JSON.parse(d))); });"
     ```

---

### OA-13 — Verify SSL/TLS Encryption Mode is Set to "Full (Strict)"

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare Dashboard → `quranific.com` zone → SSL/TLS
- **Dashboard URL:** `https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls`
- **Why It Matters:** Setting to "Full (strict)" prevents man-in-the-middle attacks between Cloudflare edge and origins.
- **Exact Steps:**
  1. Open Cloudflare Dashboard → `quranific.com` → SSL/TLS Overview.
  2. Confirm the encryption mode radio button is set to **Full (strict)**.

---

### OA-14 — Verify Cloudflare WAF Managed Rules & Bot Fight Mode

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare Dashboard → `quranific.com` zone → Security → WAF / Bots
- **Dashboard URL (WAF):** `https://dash.cloudflare.com/?to=/:account/:zone/security/waf`
- **Dashboard URL (Bots):** `https://dash.cloudflare.com/?to=/:account/:zone/security/bots`
- **Why It Matters:** In-code KV rate limiting is a secondary defense. Cloudflare Bot Fight Mode and WAF Managed Rules filter malicious traffic and automated scrapers at the edge before Worker invocation costs are incurred.
- **Exact Steps:**
  1. Navigate to Security → Bots: Ensure **Bot Fight Mode** is toggled ON.
  2. Navigate to Security → WAF: Verify **Cloudflare Managed Ruleset** is deployed.

---

### OA-15 — Verify Canonical HTTPS and www Redirects

- **Status:** ✅ **Done**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare Edge Routing
- **Empirical Proof:** Live probes executed:
  - `http://quranific.com/` → `HTTP/1.1 301 Moved Permanently` → `Location: https://quranific.com/`
  - `https://www.quranific.com/` → `HTTP/1.1 301 Moved Permanently` → `Location: https://quranific.com/`
  - `https://quranific.com/` → `HTTP/1.1 200 OK`, `alt-svc: h3=":443"` (HTTP/3), `strict-transport-security: max-age=31536000; includeSubDomains; preload`
- **Result:** Canonical, secure HTTPS routing is operational and verified.

---

## Tier 3 — Later (Hygiene, Monitoring & Governance)

### OA-16 — Account 2FA & Secondary Emergency Admin Member

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** Cloudflare Dashboard → Manage Account → Members
- **Dashboard URL (Members):** `https://dash.cloudflare.com/manage-account/members`
- **Dashboard URL (2FA):** `https://dash.cloudflare.com/profile/authentication`
- **Why It Matters:** The entire infrastructure is under `faisalkhan.llc.ltd@gmail.com`. A single compromised or locked Google account could result in total infrastructure lockout.
- **Exact Steps:**
  1. Go to Manage Account → Members → Invite a trusted secondary recovery email as `Administrator`.
  2. Go to My Profile → Authentication → Ensure Two-Factor Authentication (Hardware Key or TOTP App) is active.

---

### OA-17 — Scoped Cloudflare API Tokens (Replace Global API Key)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** Cloudflare Dashboard → My Profile → API Tokens
- **Dashboard URL:** `https://dash.cloudflare.com/profile/api-tokens`
- **Why It Matters:** Global API keys provide unlimited administrative power across all zones and services. CI/CD and developer workstations should strictly use restricted tokens (e.g. `Cloudflare Pages:Edit`, `Workers Scripts:Edit`, `Zone:DNS:Edit`).
- **Exact Steps:**
  1. In API Tokens, click "Create Token" using the "Edit Cloudflare Workers" template.
  2. Restrict permissions to the specific account and zone `quranific.com`.

---

### OA-18 — GitHub `main` Branch Protection Rules

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** GitHub Repository Settings
- **Dashboard URL:** `https://github.com/faisalkhanllcltd-coder/Quranific/settings/branches`
- **Why It Matters:** Protects `main` against direct accidental pushes, force pushes, or unreviewed breaking changes.
- **Exact Steps:**
  1. Open repo settings → Branches → Add branch protection rule for pattern `main`.
  2. Enable "Require a pull request before merging".
  3. Enable "Require status checks to pass before merging" (e.g. CI workflow: `Lint, Typecheck & Security Audit`).

---

### OA-19 — DMARC Policy Progression (`p=none` to `p=quarantine`)

- **Status:** ✅ **Done (Monitoring Mode Active)**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** Cloudflare DNS
- **Empirical Proof:** Live Google DoH query for TXT on `_dmarc.quranific.com` returned:
  ```text
  v=DMARC1; p=none
  ```
- **Next Step for Owner:**
  1. Once SPF (`include:resend.com`) is added (OA-04) and transactional email flow is confirmed clean for 14 days without delivery failures, update policy from `p=none` to `p=quarantine`:
     ```text
     v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@quranific.com; pct=100
     ```

---

### OA-20 — Setup External Synthetic Uptime Monitor

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** Better Uptime (`https://betteruptime.com`) or UptimeRobot (`https://uptimerobot.com`)
- **Why It Matters:** Provides immediate external alerts if DNS resolves incorrectly, SSL certificates expire, or edge workers encounter fatal unhandled runtime exceptions.
- **Exact Steps:**
  1. Create an HTTP monitor pinging `https://quranific.com/` every 3 minutes.
  2. Add a secondary check pinging `https://quranific.com/robots.txt`.
  3. Route alert notifications to emergency email or SMS.

---

### OA-21 — Legal Counsel Review: Children's Data Collection (COPPA & UK Children's Code)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** External Legal Consultation
- **Why It Matters:** Code enforces parental consent checkboxes (`schema.ts:17-21`). However, offering Quran courses to minors requires verified parental consent mechanisms, explicit privacy policies, and retention limits under COPPA (16 CFR Part 312) and the UK Age Appropriate Design Code.
- **Exact Steps:**
  1. Provide the `/getting-started/signup` funnel flow, privacy policy, and terms to qualified legal counsel specializing in online children's privacy.

---

### OA-22 — Submit Domain to HSTS Preload List

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** Chrome HSTS Preload Portal
- **Dashboard URL:** `https://hstspreload.org/?domain=quranific.com`
- **Empirical Proof:** Live response header contains `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`. The site satisfies all technical requirements.
- **Exact Steps:**
  1. Open `https://hstspreload.org/?domain=quranific.com`.
  2. Confirm status and submit the domain for inclusion in browser hardcoded HSTS preload lists.

---

### OA-23 — Real-Edge CA-QC and GPC Validation on Cloudflare Pages Preview

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** Cloudflare Pages Preview URL (not local dev, not production)
- **Why It Matters:** Local unit tests (7/7 PASS) and Playwright E2E tests (17/17 PASS) confirm correct consent bucket logic. Real Cloudflare CF headers (`cf.regionCode`) must be verified on a deployed edge instance.
- **Exact Steps:**
  1. Deploy a preview branch to Cloudflare Pages.
  2. **CA-QC test:** Connect via Canadian VPN to Quebec; visit preview URL; verify consent banner opens in STRICT mode (no cookies written without consent).
  3. **GPC test:** Open Firefox with "Tell websites I do not want to be tracked" enabled; verify STRICT mode banner displays.

---

### OA-24 — Core Web Vitals & Live Conversion Attribution

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** Google Search Console + GA4 DebugView / Tag Assistant
- **Why It Matters:** Core Web Vitals (LCP, INP) cannot be measured from CLI or emulated environments without real traffic. In addition, Partytown runs GTM in a web worker, which should be validated in live browser sessions to ensure conversion linkers pass parameters reliably.
- **Exact Steps:**
  1. Open Google Search Console → Experience → Core Web Vitals once search traffic begins.
  2. Open GA4 DebugView and submit a test signup on production to verify `generate_lead` events register cleanly.

---

### OA-25 — Homepage Edge Cache Hit Rate Monitoring

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** Cloudflare Workers Analytics
- **Why It Matters:** Homepage `/` uses Cloudflare's `caches.default` Cache API inside `src/middleware.ts` (lines 91–108). After cold start, repeat hits consume zero Worker CPU.
- **Exact Steps:**
  1. Post-launch, navigate to Cloudflare Dashboard → Workers & Pages → `quranific` → Analytics.
  2. Observe Worker CPU time and requests; confirm repeat visits to `/` are served from edge cache.

---

## 5-Line Plain-English Summary of What's Still Open

1. **Cloudflare Secrets to Provision:** `INTERNAL_WORKER_SECRET` (both workers) and `ALARM_ADMIN_TOKEN` (`alarm-worker`) must be set via `wrangler secret put`.
2. **DNS SPF Record Missing Resend:** The live root TXT record on `quranific.com` only permits Cloudflare MX; `include:resend.com` must be appended so emails do not land in spam.
3. **Universal SSL CAA Records Missing:** No CAA records exist in DNS; 4 records (`letsencrypt.org`, `digicert.com`, `sectigo.com`, `pki.goog`) must be added in Cloudflare DNS.
4. **Alarm Worker Public URL Open (Critical Action):** `quranific-alarm...workers.dev` is publicly reachable with HTTP 200; the owner must disable the `*.workers.dev` route trigger manually in the Cloudflare dashboard.
5. **DNSSEC & Dashboard Verifications Pending:** DNSSEC DS delegation at Hostinger, GTM tag consent gating (`GTM-5CJMMJ29`), and Cloudflare WAF/Bot settings require owner dashboard logins.
