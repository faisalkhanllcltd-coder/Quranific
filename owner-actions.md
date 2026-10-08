# Owner Actions & Pre-Launch Verification Checklist: Quranific.com

> **Purpose:** Single consolidated, authoritative runbook for all manual tasks that require Cloudflare dashboard access, registrar management, business decisions, external credentials, or third-party platform configuration.  
> **Authoritative Source:** This document is the single source of truth for owner-level operational actions. `PENDING-TASKS.md` defers to this file for all owner items.  
> **Branch:** `staging/security-and-arch-fixes`  
> **Last Audited & Probed:** 2026-10-08T12:21:00Z  
> **Methodology:** Every checkable item was verified against live production (`quranific.com`), Google Public DNS-over-HTTPS (DoH), live HTTP probes (`curl.exe -sI`), and local Cloudflare Wrangler dry-run tooling.

---

## Live Probe Baseline (Recorded 2026-10-08 12:21 UTC)

The following empirical baseline was probed live and directly informs the statuses in this runbook:

```text
1. DNS TXT quranific.com:
   quranific.com. IN TXT "v=spf1 include:_spf.mx.cloudflare.net ~all"

2. DNS TXT & MX send.quranific.com (Resend sending subdomain):
   send.quranific.com. IN TXT "v=spf1 include:amazonses.com ~all"
   send.quranific.com. IN MX 10 feedback-smtp.us-east-1.amazonses.com.

3. DNS TXT resend._domainkey.quranific.com (Resend DKIM):
   resend._domainkey.quranific.com. IN TXT "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD3MVXo+TwMmAGKtjMMGLoeV6WXkSphCYVv5LUxgYGue7hOmUCJ60NBNnjZpSBSNkHkFoUvijB2S+cSexCBnpxX2Ln5eya9svO4LUVnDy6uq8XvXXTnkIMYNKdiEaZWZLKDVuxS/yfXX30r/DzT+AsgB2EV4DMunitR/MMjtmsxHQIDAQAB"

4. DNS TXT _dmarc.quranific.com (DMARC policy):
   _dmarc.quranific.com. IN TXT "v=DMARC1; p=none"

5. DNS CAA quranific.com:
   NO ANSWER (Status: 0, no custom CAA records)

6. DNS DS quranific.com:
   NO ANSWER (Status: 0, DNSSEC not signed at registrar)

7. Workers.dev Endpoints:
   https://quranific-alarm.faisalkhan-llc-ltd.workers.dev -> HTTP/1.1 200 OK (Active; pending redeploy)
   https://quranific.faisalkhan-llc-ltd.workers.dev -> HTTP/1.1 404 Not Found (Disabled)

8. Live Homepage Client Assets (https://quranific.com):
   /_astro/ClientRouter.astro_astro_type_script_index_0_lang.Ddni20hm.js
   /_astro/page.eOC-22qK.js
   /_astro/PricingCalculator.BCEDN8Rl.js
   /_astro/client.svelte.gKcWRDkc.js
   /_astro/CookieBanner.lWit89v_.js
```

---

## Executive Status Dashboard

| Category / Urgency                                   | Total Items | ✅ Done | ❌ Still Open | ⚠️ Owner Action / Monitoring |
| :--------------------------------------------------- | :---------: | :-----: | :-----------: | :--------------------------: |
| **Tier 1: Critical Pre-Deploy Blockers**             |      9      |    1    |       5       |              3               |
| **Tier 2: Do Soon (First 48h / Pre-Scale)**          |     10      |    2    |       2       |              6               |
| **Tier 3: Later (Hygiene, Monitoring & Governance)** |     14      |    0    |       0       |              14              |
| **Obsolete / Purged Items**                          |      1      |    0    |       0       |       1 (➖ Obsolete)        |
| **Total Actionable Items**                           |   **33**    |  **3**  |     **7**     |            **23**            |

---

## Quick Reference Status Matrix

| ID        | Item Description                                    | Urgency Tier     |       Status        | Verification Method / Proof                                           |
| :-------- | :-------------------------------------------------- | :--------------- | :-----------------: | :-------------------------------------------------------------------- |
| **OA-01** | Provision `INTERNAL_WORKER_SECRET` on Both Workers  | Tier 1 (Blocker) |    ❌ Still Open    | Code fail-closed; secrets must be set before deploy                   |
| **OA-02** | Provision `ALARM_ADMIN_TOKEN` on Alarm Worker       | Tier 1 (Blocker) |    ❌ Still Open    | Code fail-closed (returns 401); must set before deploy                |
| **OA-03** | Server-Side Ad Secrets (`META_CAPI` purged)         | N/A (Purged)     |     ➖ Obsolete     | Meta CAPI completely purged from codebase                             |
| **OA-04** | Confirm Resend Dashboard Domain Verification        | Tier 1 (Blocker) | ⚠️ Owner Must Check | SPF on `send.quranific.com` & DKIM verified; do NOT edit root SPF     |
| **OA-05** | Universal SSL CAA DNS Records                       | Tier 3 (Later)   | ⚠️ Owner to Decide  | Optional hardening; Cloudflare auto-manages SSL CAs                   |
| **OA-06** | Verify Resend DKIM DNS Record                       | Tier 1 (Blocker) |       ✅ Done       | Probed: `resend._domainkey.quranific.com` TXT active                  |
| **OA-07** | GTM Tag Consent Settings (`GTM-5CJMMJ29`)           | Tier 1 (Blocker) | ⚠️ Owner Must Check | Verify tag triggers in Google Tag Manager container                   |
| **OA-08** | Verify No Overriding Zone Cache Rules               | Tier 1 (Blocker) | ⚠️ Owner Must Check | Check Cloudflare Rules → Cache Rules                                  |
| **OA-09** | Disable Public `workers.dev` on Alarm Worker        | Tier 2 (Do Soon) |    ❌ Still Open    | Live returns HTTP 200; redeploy alarm worker with `workers_dev=false` |
| **OA-10** | Verify Root Worker `workers.dev` Disabled           | Tier 2 (Do Soon) |       ✅ Done       | Probed: returns HTTP 404 Not Found                                    |
| **OA-11** | Configure DLQ `ALERT_WEBHOOK_URL` Secret            | Tier 2 (Do Soon) |    ❌ Still Open    | Missing on `alarm-worker`                                             |
| **OA-12** | Enable DNSSEC Signing & Submit DS Record            | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Probed: 0 DS records at registrar                                     |
| **OA-13** | Verify SSL/TLS Encryption Mode (Full Strict)        | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Check Cloudflare Dashboard: SSL/TLS Overview                          |
| **OA-14** | Verify Cloudflare WAF & Bot Fight Mode              | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Check Cloudflare Security → WAF / Bot Fight Mode                      |
| **OA-15** | Verify Canonical HTTPS & www Redirects              | Tier 2 (Do Soon) |       ✅ Done       | Verified: HTTP 301 to `https://quranific.com/`                        |
| **OA-16** | Account 2FA & Secondary Emergency Admin             | Tier 3 (Later)   | ⚠️ Owner Must Check | Check Cloudflare Dashboard: Manage Account → Members                  |
| **OA-17** | Scoped Cloudflare API Tokens (No Global Key)        | Tier 3 (Later)   | ⚠️ Owner Must Check | Check Cloudflare Dashboard: API Tokens                                |
| **OA-18** | GitHub `main` Branch Protection Rules               | Tier 3 (Later)   | ⚠️ Owner Must Check | Check GitHub repository settings                                      |
| **OA-19** | DMARC Policy Progression (`p=none` to `quarantine`) | Tier 3 (Later)   |    ⚠️ Monitoring    | Probed: `p=none`; reports go to `compliance@quranific.com`            |
| **OA-20** | External Synthetic Uptime Monitor                   | Tier 3 (Later)   | ⚠️ Owner Must Check | Set up third-party uptime ping                                        |
| **OA-21** | Legal Counsel Review: Children's Data / COPPA       | Tier 3 (Later)   | ⚠️ Owner Must Check | Review student onboarding flow                                        |
| **OA-22** | Submit Domain to HSTS Preload List                  | Tier 3 (Later)   | ⚠️ Owner to Decide  | Proceed only after all subdomains are verified HTTPS                  |
| **OA-23** | Cloudflare Worker Preview & Edge Validation         | Tier 3 (Later)   | ⚠️ Owner Must Check | Validate Worker preview deployment                                    |
| **OA-24** | Core Web Vitals & Live Conversion Attribution       | Tier 3 (Later)   | ⚠️ Owner Must Check | Check GSC and GA4 DebugView                                           |
| **OA-25** | Homepage Edge Cache Hit Rate Monitoring             | Tier 3 (Later)   | ⚠️ Owner Must Check | Inspect Cloudflare Workers Analytics                                  |
| **OA-26** | Production Deployment Order Execution               | Tier 1 (Blocker) |    ❌ Still Open    | Run order: secrets -> merge -> root worker -> alarm worker            |
| **OA-27** | Confirm `ADMIN_EMAIL` Cloudflare Variable           | Tier 1 (Blocker) |    ❌ Still Open    | Verify equals personal Gmail, never `admin@`                          |
| **OA-28** | Post-Deploy CSP & GTM Console Verification          | Tier 1 (Blocker) |    ❌ Still Open    | Test `/courses/` & `/` in DevTools for zero CSP errors                |
| **OA-29** | Geo-Pricing Display Verification (UK vs PK)         | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Verify GBP (£) in UK vs USD ($40 floor) in Pakistan                   |
| **OA-30** | Container Padding Visual Inspection (1280+)         | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Check 20 pages at 1280px / 1440px / 1920px                            |
| **OA-31** | Newsletter Double Opt-In End-to-End Live Test       | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Test plus-alias subscribe -> confirm -> welcome -> unsubscribe        |
| **OA-32** | Legal Review: Consent Records & Footer Address      | Tier 3 (Later)   | ⚠️ Owner Must Check | Review KV consent log and marketing physical address                  |
| **OA-33** | HSTS Preload Caution & Readiness Checklist          | Tier 3 (Later)   | ⚠️ Owner to Decide  | Verify subdomains before binary lock-in                               |
| **OA-34** | SEO Track Owner Inputs (Branch `seo_audit_staging`) | Tier 3 (Later)   | ⚠️ Owner Must Check | Pointer to content/credential tasks on SEO branch                     |

---

# Detailed Action Items Grouped by Urgency

---

## Tier 1 — Critical Pre-Deploy Blockers (Must Do Before First Live Ad Dollar)

### OA-01 — Provision `INTERNAL_WORKER_SECRET` on Both Workers

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare CLI (`wrangler secret put`) or Cloudflare Dashboard
- **Context & Architecture:** Fallback to `JWT_SECRET` was intentionally removed in commit `6932956`. After deployment, retries cannot authenticate until `INTERNAL_WORKER_SECRET` is provisioned on **both** workers. If missing, both workers fail closed (return 401 Unauthorized). Secrets must be set **BEFORE** deploying workers.
- **Exact Steps:**
  1. Generate a cryptographically secure 64-character random hex string:
     ```powershell
     node -e "console.log(crypto.randomBytes(32).toString('hex'))"
     ```
  2. Set the secret on the root Worker:
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
- **Context & Architecture:** Endpoints `/force-run` and `/resend-log` in `alarm-worker/src/index.ts` require admin authentication. If `ALARM_ADMIN_TOKEN` is missing, the worker returns 401 Unauthorized to all callers (fails closed, no security hole). Must be set before manual administrative triggers can be performed.
- **Exact Steps:**
  1. Generate an admin token string:
     ```powershell
     node -e "console.log(crypto.randomBytes(32).toString('hex'))"
     ```
  2. Set the secret on the alarm worker:
     ```powershell
     npx wrangler secret put ALARM_ADMIN_TOKEN -c alarm-worker/wrangler.toml
     ```

---

### OA-04 — Confirm Resend Dashboard Shows Domain "Verified" (Do NOT Edit Root SPF)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Resend Dashboard (`https://resend.com/domains`) & Cloudflare DNS
- **Context & Architecture:** Resend routes all transactional emails through its dedicated sending subdomain `send.quranific.com`. Live DoH probing confirms:
  - Subdomain SPF: `send.quranific.com IN TXT "v=spf1 include:amazonses.com ~all"` ✅
  - Subdomain MX: `send.quranific.com IN MX 10 feedback-smtp.us-east-1.amazonses.com.` ✅
  - Subdomain DKIM: `resend._domainkey.quranific.com IN TXT "p=MIGf..."` ✅
  - Root Domain SPF: `quranific.com IN TXT "v=spf1 include:_spf.mx.cloudflare.net ~all"` ✅
    **DO NOT modify root SPF.** Adding `include:resend.com` to apex `quranific.com` is unnecessary and risks SPF 10-lookup exhaustion.
- **Exact Steps:**
  1. Log in to `https://resend.com/domains`.
  2. Confirm domain `send.quranific.com` displays green checkmark: **"Verified"**.
  3. Leave apex root SPF records unchanged.

---

### OA-06 — Verify Resend DKIM DNS Record

- **Status:** ✅ **Done**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Empirical Proof (Probed 2026-10-08 12:21 UTC):**
  - `resend._domainkey.quranific.com` TXT returned valid public key: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD3MVXo+TwMmAGKtjMMGLoeV6WXkSphCYVv5LUxgYGue7hOmUCJ60NBNnjZpSBSNkHkFoUvijB2S+cSexCBnpxX2Ln5eya9svO4LUVnDy6uq8XvXXTnkIMYNKdiEaZWZLKDVuxS/yfXX30r/DzT+AsgB2EV4DMunitR/MMjtmsxHQIDAQAB`.

---

### OA-07 — GTM Tag Consent Settings (`GTM-5CJMMJ29`)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Google Tag Manager Dashboard (`https://tagmanager.google.com`)
- **Context & Architecture:** The client banner manages `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`. GTM tags must respect these signals.
- **Exact Steps:**
  1. Open GTM container `GTM-5CJMMJ29`.
  2. Ensure tags require appropriate consent signals before firing.
  3. Verify in GTM Preview mode with consent toggle.

---

### OA-08 — Verify No Overriding Zone Cache Rules

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare Dashboard: Rules → Cache Rules
- **Context & Architecture:** The site relies on Worker-level caching (homepage Cache API) and exact `Cache-Control` response headers. Zone-level rules must not cache dynamic API routes (`/api/*`).
- **Exact Steps:**
  1. Open Cloudflare Dashboard → `quranific.com` → Caching → Cache Rules.
  2. Confirm no rule forces "Cache Everything" across all paths. Ensure `/api/*` and `/getting-started/*` bypass edge cache.

---

### OA-26 — Production Deployment Order Execution

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** GitHub & Cloudflare CLI
- **Strict Execution Order:**
  1. **Provision Secrets First:** Set `INTERNAL_WORKER_SECRET` on both workers and `ALARM_ADMIN_TOKEN` on alarm worker (OA-01, OA-02).
  2. **Merge PR:** Merge `staging/security-and-arch-fixes` into `main`.
  3. **Deploy Root Worker:** Run production deploy:
     ```powershell
     npm run deploy:prod
     ```
  4. **Deploy Alarm Worker:** Run alarm worker deploy:
     ```powershell
     npm run deploy:alarm
     ```
  5. **Verify:** Check live endpoint responses and health.

---

### OA-27 — Confirm `ADMIN_EMAIL` Cloudflare Variable

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare Dashboard → Workers & Pages → `quranific` → Settings → Variables
- **Context & Architecture:** `ADMIN_EMAIL` designates the destination inbox for all internal transactional notifications (contact form, newsletter, signup, teacher applications). Per locked architecture decisions, internal notifications go **ONLY** to the personal Gmail `faisalkhan.llc.ltd@gmail.com`. The mailbox `admin@quranific.com` is strictly a correspondence mailbox.
- **Exact Steps:**
  1. Inspect environment variable `ADMIN_EMAIL` in Cloudflare Worker settings.
  2. If set, confirm value is `faisalkhan.llc.ltd@gmail.com`. If unset, code defaults correctly to `SITE.emails.admin` (`faisalkhan.llc.ltd@gmail.com`).
  3. Ensure it is **never** set to `admin@quranific.com`.

---

### OA-28 — Post-Deploy CSP & GTM Console Verification

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Chrome / Firefox DevTools Console on Live Production
- **Context & Architecture:** The enforced Content-Security-Policy in `public/_headers` and `src/middleware.ts` contains no `'unsafe-eval'`. It now applies to prerendered static pages (such as `/courses/`) as well as dynamic SSR routes.
- **Exact Steps:**
  1. Open Chrome DevTools → Console tab.
  2. Navigate to `https://quranific.com/courses/` (prerendered).
  3. Navigate to `https://quranific.com/` (homepage).
  4. Confirm:
     - No CSP violation errors are logged.
     - Google Tag Manager container `GTM-5CJMMJ29` loads properly.
     - `dataLayer` events record cleanly without script rejection.

---

## Tier 2 — Do Soon (First 48h / Pre-Scale)

### OA-09 — Disable Public `workers.dev` Route on Alarm Worker

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 2 (Do Soon)**
- **Empirical Proof (Probed 2026-10-08 12:21 UTC):**
  - `curl.exe -sI https://quranific-alarm.faisalkhan-llc-ltd.workers.dev` returned `HTTP/1.1 200 OK`.
- **Context & Fix:** `alarm-worker/wrangler.toml` has `workers_dev = false`. Cloudflare documentation notes that redeploying the worker applies this configuration and deactivates the route. The live 200 confirms the worker has not yet been redeployed since that setting was configured.
- **Exact Steps:**
  1. Deploy alarm worker via `npm run deploy:alarm`.
  2. Run `curl.exe -sI https://quranific-alarm.faisalkhan-llc-ltd.workers.dev` and confirm it returns `HTTP 404`.
  3. If 200 persists, toggle off the `workers.dev` route manually in Cloudflare Dashboard: Workers & Pages → `quranific-alarm` → Settings → Triggers.

---

### OA-10 — Verify Root Worker `workers.dev` Disabled

- **Status:** ✅ **Done**
- **Urgency:** **Tier 2 (Do Soon)**
- **Empirical Proof (Probed 2026-10-08 12:21 UTC):**
  - `curl.exe -sI https://quranific.faisalkhan-llc-ltd.workers.dev` returned `HTTP/1.1 404 Not Found`. Apex custom domain routing is active.

---

### OA-11 — Configure DLQ `ALERT_WEBHOOK_URL` Secret

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare CLI or Dashboard on `quranific-alarm`
- **Context:** If a dead-letter queue recovery attempt fails repeatedly, alarm-worker dispatches an alert payload to `ALERT_WEBHOOK_URL` (e.g. Discord, Slack, or monitoring endpoint).
- **Steps:** Run `npx wrangler secret put ALERT_WEBHOOK_URL -c alarm-worker/wrangler.toml`.

---

### OA-12 — Enable DNSSEC Signing & Submit DS Record

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Empirical Proof (Probed 2026-10-08 12:21 UTC):**
  - `dns.google/resolve?name=quranific.com&type=DS` returned NO ANSWER.
- **Steps:**
  1. Enable DNSSEC in Cloudflare DNS dashboard.
  2. Copy DS record (Key Tag, Algorithm, Digest Type, Digest) and submit to Hostinger domain registrar.

---

### OA-13 — Verify SSL/TLS Encryption Mode (Full Strict)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare Dashboard → SSL/TLS Overview
- **Steps:** Ensure SSL/TLS encryption mode is set to **Full (strict)**.

---

### OA-14 — Verify Cloudflare WAF & Bot Fight Mode

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Cloudflare Dashboard → Security → WAF / Bots
- **Steps:** Enable Bot Fight Mode and review standard managed rulesets.

---

### OA-15 — Verify Canonical HTTPS & www Redirects

- **Status:** ✅ **Done**
- **Urgency:** **Tier 2 (Do Soon)**
- **Proof:** `curl.exe -sI https://www.quranific.com` returns HTTP 301 redirecting to `https://quranific.com/`.

---

### OA-29 — Geo-Pricing Display Verification (UK vs Pakistan)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Web Browser (direct from UK vantage / VPN vs Pakistan)
- **Context & Verification:**
  - In Pakistan / unmapped countries: verify baseline floor "$40/mo" displays cleanly.
  - In UK: verify currency displays in GBP (£) on tuition-fee calculator and pricing components.

---

### OA-30 — Container Padding Visual Inspection (1280px / 1440px / 1920px)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Desktop Browser DevTools Device Mode
- **Context:** `quranific-container` utility was unified to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (dropping `xl:px-12`).
- **Steps:** Visually inspect page layout at 1280px, 1440px, and 1920px on key pages:
  - Homepage (`/`)
  - About (`/about`)
  - Blog (`/blog`)
  - Tuition Fee (`/tuition-fee`)
  - Contact (`/contact`)

---

### OA-31 — Newsletter Double Opt-In End-to-End Live Validation

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Test Procedure:**
  1. Open footer on `https://quranific.com`. Enter `faisalkhan.llc.ltd+nltest@gmail.com` and submit.
  2. Confirm visible success text: _"Check your inbox to confirm your subscription."_
  3. Check inbox: confirmation email arrives from `support@quranific.com` with signed confirm link.
  4. Click link: confirm page displays with "Confirm subscription" button. Click button.
  5. Confirm success page displays.
  6. Check Resend dashboard: contact exists and is marked subscribed. If `RESEND_AUDIENCE_ID` is set, verify segment assignment.
  7. Check inbox: welcome email arrives with unsubscribe footer and RFC 8058 one-click headers.
  8. Check admin Gmail: admin alert notification received at `faisalkhan.llc.ltd@gmail.com`.
  9. Re-submit same email: confirm endpoint returns success without re-dispatching emails.
  10. Click unsubscribe link: confirm page unsubs contact and updates Resend dashboard.

---

## Tier 3 — Later (Hygiene, Monitoring & Governance)

### OA-05 — Universal SSL CAA DNS Records

- **Status:** ⚠️ **Owner to Decide (Later)**
- **Urgency:** **Tier 3 (Later)**
- **Context:** Optional DNS hardening. Cloudflare automatically handles CAA records for its Certificate Authorities (Google Trust Services, Let's Encrypt, SSL.com, Sectigo). If custom CAA records are added, all required Cloudflare CAs must be explicitly included.

---

### OA-16 — Account 2FA & Secondary Emergency Admin Member

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Steps:** Cloudflare Dashboard → Manage Account → Members: Add secondary admin email and enforce 2FA.

---

### OA-17 — Scoped Cloudflare API Tokens (No Global API Key)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Steps:** Ensure CI/CD uses minimally scoped tokens (Workers Deploy, DNS Edit) rather than Account Global API Key.

---

### OA-18 — GitHub `main` Branch Protection Rules

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Steps:** GitHub repo settings → Branches → Require PR reviews and passing CI checks before merging to `main`.

---

### OA-19 — DMARC Policy Progression (`p=none` to `quarantine`)

- **Status:** ⚠️ **Monitoring**
- **Urgency:** **Tier 3 (Later)**
- **Empirical Proof (Probed 2026-10-08 12:21 UTC):**
  - `_dmarc.quranific.com IN TXT "v=DMARC1; p=none"` is active.
- **Context:** `p=none` indicates active monitoring. DMARC aggregate and forensic reports must point only to authorized correspondence addresses (`mailto:compliance@quranific.com`). After monitoring for 30 days without illegitimate sending, advance to `p=quarantine`.

---

### OA-20 — External Synthetic Uptime Monitor

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Steps:** Configure Better Stack / UptimeRobot to ping `https://quranific.com/` every 60 seconds.

---

### OA-21 — Legal Counsel Review: Children's Data / COPPA

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Steps:** Legal review of student onboarding funnel (`/getting-started/signup` and `/getting-started/complete`) where parents register minor students.

---

### OA-22 — Submit Domain to HSTS Preload List

- **Status:** ⚠️ **Owner to Decide (Later)**
- **Urgency:** **Tier 3 (Later)**
- **Platform:** `https://hstspreload.org/?domain=quranific.com`
- **Caution:** HSTS preload is baked directly into browser binaries and is difficult and slow to reverse. Proceed only when 100% of subdomains (including all transactional mail subdomains) strictly enforce HTTPS.

---

### OA-23 — Cloudflare Worker Preview & Edge Validation

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Context:** The site deploys as a Cloudflare Worker (not Pages).
- **Steps:** Validate Worker preview deployments and test edge geo-routing using a Canadian / Quebec VPN vantage to ensure Bill 64 consent behavior operates as intended.

---

### OA-24 — Core Web Vitals & Live Conversion Attribution

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Steps:** Monitor LCP, INP, and CLS in Google Search Console; verify `generate_lead` events in GA4 DebugView.

---

### OA-25 — Homepage Edge Cache Hit Rate Monitoring

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Steps:** Inspect Cloudflare Workers Analytics for homepage `/` edge cache hit ratios via Cache API.

---

### OA-32 — Legal Review: Newsletter Consent Record & Physical Postal Address

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Context:** The newsletter double opt-in records consent in KV (`NL_CONSENT:<email>` with timestamp, IP, source). Legal review should confirm GDPR/CASL consent compliance and verify physical business address format in marketing email footers once Quranific Ltd legal entity formation is complete.

---

### OA-33 — HSTS Preload Caution & Readiness Checklist

- **Status:** ⚠️ **Owner to Decide (Later)**
- **Urgency:** **Tier 3 (Later)**
- **Checklist:**
  - [ ] Apex `quranific.com` serves HTTPS with valid certificate
  - [ ] `www.quranific.com` redirects via HTTPS
  - [ ] `send.quranific.com` endpoints verified
  - [ ] Confirm no HTTP-only subdomains exist across DNS zone

---

### OA-34 — SEO Track Owner Inputs (Branch `seo_audit_staging`)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Reference:** Dedicated content and analytics requirements (GA4 measurement ID, SEMrush search console exports, tutor credentials documentation, 4.9 rating source accreditation) are tracked on branch `seo_audit_staging`.
