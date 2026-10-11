# Owner Actions & Pre-Launch Verification Checklist: Quranific.com

> **Purpose:** Single consolidated, authoritative runbook for all manual tasks that require Cloudflare dashboard access, registrar management, business decisions, external credentials, or third-party platform configuration.  
> **Authoritative Source:** This document is the single source of truth for owner-level operational actions. `PENDING-TASKS.md` defers to this file for all owner items.  
> **Branch:** `staging/security-and-arch-fixes`  
> **Last Audited & Probed:** 2026-10-10T17:03:44Z  
> **Methodology:** Every checkable item was verified against live production (`quranific.com`), Google Public DNS-over-HTTPS (DoH), live HTTP probes (`curl.exe -sI`), and local Cloudflare Wrangler dry-run tooling.

---

## Live Probe Baseline (Recorded 2026-10-10 17:03 UTC)

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
   _dmarc.quranific.com. IN TXT "v=DMARC1; p=none" (no rua configured)

5. DNS CAA quranific.com:
   NO ANSWER (Status: 0, no custom CAA records)

6. DNS DS quranific.com:
   NO ANSWER (Status: 0, DNSSEC not signed at registrar)

7. Workers.dev Endpoints:
   https://quranific-alarm.faisalkhan-llc-ltd.workers.dev -> HTTP/1.1 200 OK (Active; pending redeploy)
   https://quranific.faisalkhan-llc-ltd.workers.dev -> HTTP/1.1 404 Not Found (Disabled)
```

---

## Executive Status Dashboard

| Category / Urgency                                   | Total Items | ✅ Done | ❌ Still Open | ⚠️ Owner Action / Monitoring |
| :--------------------------------------------------- | :---------: | :-----: | :-----------: | :--------------------------: |
| **Tier 1: Critical Pre-Deploy Blockers**             |     10      |    1    |       5       |              4               |
| **Tier 2: Do Soon (First 48h / Pre-Scale)**          |     11      |    2    |       2       |              7               |
| **Tier 3: Later (Hygiene, Monitoring & Governance)** |     13      |    0    |       0       |              13              |
| **Obsolete / Merged Items**                          |      2      |    0    |       0       |    2 (➖ Excluded/Merged)    |
| **Total Actionable Items**                           |   **34**    |  **3**  |     **7**     |            **24**            |

---

## Quick Reference Status Matrix

| ID        | Item Description                                    | Urgency Tier     |       Status        | Verification Method / Proof                                                                           |
| :-------- | :-------------------------------------------------- | :--------------- | :-----------------: | :---------------------------------------------------------------------------------------------------- |
| **OA-01** | Provision `INTERNAL_WORKER_SECRET` on Both Workers  | Tier 1 (Blocker) |    ❌ Still Open    | Code fail-closed; secrets must be set before deploy                                                   |
| **OA-02** | Provision `ALARM_ADMIN_TOKEN` on Alarm Worker       | Tier 1 (Blocker) |    ❌ Still Open    | Code fail-closed (returns 401); must set before deploy                                                |
| **OA-03** | Server-Side Ad Secrets (`META_CAPI` purged)         | N/A (Purged)     |     ➖ Obsolete     | Meta CAPI completely purged. Optional GA4 note. Deploys as Worker.                                    |
| **OA-04** | Confirm Resend Domain Verification ("Verified")     | Tier 1 (Blocker) | ⚠️ Owner Must Check | Resend dashboard > Domains > quranific.com must show Verified; do NOT edit root SPF                   |
| **OA-05** | Universal SSL CAA DNS Records                       | Tier 3 (Later)   | ⚠️ Owner to Decide  | Optional hardening; Cloudflare auto-manages SSL CAs                                                   |
| **OA-06** | Verify Resend DKIM DNS Record                       | Tier 1 (Blocker) |       ✅ Done       | Probed: `resend._domainkey.quranific.com` TXT active                                                  |
| **OA-07** | GTM Tag Consent Settings (`GTM-5CJMMJ29`)           | Tier 1 (Blocker) | ⚠️ Owner Must Check | Verify tag triggers in Google Tag Manager container                                                   |
| **OA-08** | Verify No Overriding Zone Cache Rules               | Tier 1 (Blocker) | ⚠️ Owner Must Check | Check Cloudflare Rules → Cache Rules                                                                  |
| **OA-09** | Disable Public `workers.dev` on Alarm Worker        | Tier 2 (Do Soon) |    ❌ Still Open    | Live returns HTTP 200; redeploy alarm worker with `workers_dev=false`                                 |
| **OA-10** | Verify Root Worker `workers.dev` Disabled           | Tier 2 (Do Soon) |       ✅ Done       | Probed: returns HTTP 404 Not Found                                                                    |
| **OA-11** | Configure DLQ `ALERT_WEBHOOK_URL` Secret            | Tier 2 (Do Soon) |    ❌ Still Open    | Missing on `alarm-worker`                                                                             |
| **OA-12** | Enable DNSSEC Signing & Submit DS Record            | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Probed: 0 DS records at registrar                                                                     |
| **OA-13** | Verify SSL/TLS Encryption Mode (Full Strict)        | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Check Cloudflare Dashboard: SSL/TLS Overview                                                          |
| **OA-14** | Verify Cloudflare WAF & Bot Fight Mode              | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Check Cloudflare Security → WAF / Bot Fight Mode                                                      |
| **OA-15** | Verify Canonical HTTPS & www Redirects              | Tier 2 (Do Soon) |       ✅ Done       | Verified: HTTP 301 to `https://quranific.com/`                                                        |
| **OA-16** | Account 2FA & Secondary Emergency Admin             | Tier 3 (Later)   | ⚠️ Owner Must Check | Check Cloudflare Dashboard: Manage Account → Members                                                  |
| **OA-17** | Scoped Cloudflare API Tokens (No Global Key)        | Tier 3 (Later)   | ⚠️ Owner Must Check | Check Cloudflare Dashboard: API Tokens                                                                |
| **OA-18** | GitHub `main` Branch Protection Rules               | Tier 3 (Later)   | ⚠️ Owner Must Check | Check GitHub repository settings                                                                      |
| **OA-19** | DMARC Policy Progression (`p=none` to `quarantine`) | Tier 3 (Later)   |    ⚠️ Monitoring    | Probed: `p=none`; add `rua=mailto:compliance@quranific.com`; watch reports                            |
| **OA-20** | External Synthetic Uptime Monitor                   | Tier 3 (Later)   | ⚠️ Owner Must Check | Set up third-party uptime ping                                                                        |
| **OA-21** | Legal Counsel Review: Children's Data / COPPA       | Tier 3 (Later)   | ⚠️ Owner Must Check | Review student onboarding flow                                                                        |
| **OA-22** | Submit Domain to HSTS Preload List                  | Tier 3 (Later)   | ⚠️ Owner to Decide  | Proceed only after all subdomains are verified HTTPS (includes OA-33 checklist)                       |
| **OA-23** | Cloudflare Worker Preview & Edge Validation         | Tier 3 (Later)   | ⚠️ Owner Must Check | Validate Worker preview deployment (deploys as Worker)                                                |
| **OA-24** | Core Web Vitals & Live Conversion Attribution       | Tier 3 (Later)   | ⚠️ Owner Must Check | Check GSC and GA4 DebugView                                                                           |
| **OA-25** | Homepage Edge Cache Hit Rate Monitoring             | Tier 3 (Later)   | ⚠️ Owner Must Check | Inspect Cloudflare Workers Analytics                                                                  |
| **OA-26** | Production Deployment Order Execution               | Tier 1 (Blocker) |    ❌ Still Open    | Run order: secrets -> merge -> deploy:prod -> deploy:alarm -> OA-09 -> OA-28 -> OA-31 -> signup test  |
| **OA-27** | Confirm `ADMIN_EMAIL` Cloudflare Variable           | Tier 1 (Blocker) |    ❌ Still Open    | Verify equals personal Gmail, never `admin@` (Worker deploy)                                          |
| **OA-28** | Post-Deploy CSP & GTM Console Verification          | Tier 1 (Blocker) |    ❌ Still Open    | Test `/courses/` & `/` in DevTools for zero CSP errors                                                |
| **OA-29** | Geo-Pricing Display Verification (UK vs PK)         | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Verify GBP (£) in UK vs USD ($40 floor) in Pakistan                                                   |
| **OA-30** | Container Padding Visual Inspection (1280+)         | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Check 21 URLs (intent, courses, legal, home, faq, tuition) at 1280px+; converted px-8 pages unchanged |
| **OA-31** | Newsletter Double Opt-In End-to-End Live Test       | Tier 2 (Do Soon) | ⚠️ Owner Must Check | Test 10-min throttle, "Check your inbox", confirm, welcome, legal 2b check                            |
| **OA-32** | Legal Review: Consent Records & Footer Address      | Tier 3 (Later)   | ⚠️ Owner Must Check | Review KV consent log and marketing physical address                                                  |
| **OA-33** | [Merged into OA-22]                                 | N/A              |      ➖ Merged      | See OA-22 (excluded from counts)                                                                      |
| **OA-34** | SEO Track Owner Inputs (Branch `seo_audit_staging`) | Tier 3 (Later)   | ⚠️ Owner Must Check | Pointer to content/credential tasks on SEO branch                                                     |
| **OA-35** | Confirm Resend Contacts API Access & Segment ID     | Tier 1 (Blocker) | ⚠️ Owner Must Check | Confirm Contacts API access and copy Segment ID for `RESEND_AUDIENCE_ID`                              |
| **OA-36** | Impressum Registration Text                         | Tier 2 (Do Soon) | ⚠️ Owner to Decide  | Legal counsel & owner decision on sole proprietor registration text in impressum.astro lines 94, 100  |

---

# Detailed Action Items Grouped by Urgency

---

## Tier 1 — Critical Pre-Deploy Blockers (Must Do Before First Live Ad Dollar)

### OA-01 — Provision `INTERNAL_WORKER_SECRET` on Both Workers

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare CLI (`wrangler secret put`) or Cloudflare Dashboard
- **Context & Architecture:** Fallback to `JWT_SECRET` was intentionally removed in commit `6932956`. After deployment, retries cannot authenticate until `INTERNAL_WORKER_SECRET` is provisioned on **both** workers. If missing, both workers fail closed (return 401 Unauthorized). Secrets must be set **BEFORE** deploying workers.
  > **Critical:** Without INTERNAL_WORKER_SECRET on BOTH workers, retries cannot authenticate (secrets before deploy).
- **Exact Steps:**
  1. Generate a cryptographically secure 64-character random hex string:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
  2. Set the secret on the root Worker:
     ```powershell
     npx wrangler secret put INTERNAL_WORKER_SECRET
     ```
  3. Set the identical secret on the alarm worker:
     ```powershell
     npx wrangler secret put INTERNAL_WORKER_SECRET -c alarm-worker/wrangler.toml
     ```
  4. Verify both show `INTERNAL_WORKER_SECRET` in their secret lists:
     ```powershell
     npx wrangler secret list
     npx wrangler secret list -c alarm-worker/wrangler.toml
     ```

---

### OA-02 — Provision `ALARM_ADMIN_TOKEN` on Alarm Worker

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare CLI (`wrangler secret put`) or Cloudflare Dashboard
- **Context & Architecture:** Endpoints `/force-run` and `/resend-log` in `alarm-worker/src/index.ts` require admin authentication. If `ALARM_ADMIN_TOKEN` is missing, the worker returns 401 Unauthorized to all callers (fails closed, no security hole). Must be set before manual administrative triggers can be performed.
  > **Critical:** Without ALARM_ADMIN_TOKEN the alarm endpoints return 401 to everyone (safe, just unusable).
- **Exact Steps:**
  1. Generate an admin token string:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
  2. Set the secret on the alarm worker:
     ```powershell
     npx wrangler secret put ALARM_ADMIN_TOKEN -c alarm-worker/wrangler.toml
     ```
  3. Verify `ALARM_ADMIN_TOKEN` is listed on the alarm worker:
     ```powershell
     npx wrangler secret list -c alarm-worker/wrangler.toml
     ```

---

### OA-03 — Server-Side Ad Secrets (`META_CAPI` Purged; Optional GA4)

- **Status:** ➖ **Obsolete / Optional**
- **Urgency:** **N/A (Purged)**
- **Platform:** N/A / Cloudflare Secrets
- **Context:** Meta CAPI (`graph.facebook.com`, `META_CAPI`, `fbq`) has been completely purged from the codebase. The site deploys as a Cloudflare Worker.
- **Optional Server-Side GA4:** `GA4_MEASUREMENT_ID` and `GA4_API_SECRET` enable server-side GA4 events in `src/pages/api/complete.ts`; skipped safely when unset.

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
  2. Confirm domain `send.quranific.com` and apex domain: **Resend dashboard > Domains > quranific.com must show Verified**.
  3. Leave apex root SPF records unchanged.

---

### OA-06 — Verify Resend DKIM DNS Record

- **Status:** ✅ **Done**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Empirical Proof (Probed 2026-10-10 17:03 UTC):**
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
  1. **Provision Secrets First:** Set `INTERNAL_WORKER_SECRET` on both workers and `ALARM_ADMIN_TOKEN` on alarm worker, plus `RESEND_AUDIENCE_ID` if configured (OA-01, OA-02, OA-35).
  2. **Merge PR & Prepare Local Main:**
     - Merge `staging/security-and-arch-fixes` into `main` on GitHub.
     - Switch local environment to updated `main`:
       ```powershell
       git checkout main
       git pull
       git status
       ```
     - `git status` must be completely clean with zero uncommitted or untracked changes.
     - _Deploy-Guard Enforcement:_ `scripts/deploy-guard.mjs` executes before every deployment command; it validates that the active branch is strictly `main` (`git branch --show-current === 'main'`) and that `git status --porcelain` is empty. The deployment script aborts immediately if any dirty files exist or if run on any other branch.
  3. **Deploy Root Worker:** Run production deploy:
     ```powershell
     npm run deploy:prod
     ```
  4. **Deploy Alarm Worker:** Run alarm worker deploy:
     ```powershell
     npm run deploy:alarm
     ```
  5. **Verify Alarm Worker Route:** Run OA-09 check (confirm `workers.dev` returns 404).
  6. **Verify CSP & GTM Console:** Run OA-28 check on `/` and `/courses/`.
  7. **Verify Newsletter Double Opt-In:** Run OA-31 live test.
  8. **Re-run Owner Signup Test:** Re-run the owner's own signup test (customer mail from `support@quranific.com`, notification to personal Gmail `faisalkhan.llc.ltd@gmail.com`).

---

### OA-27 — Confirm `ADMIN_EMAIL` Cloudflare Variable

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Cloudflare Dashboard → Workers & Pages → `quranific` (Worker) → Settings → Variables
- **Context & Architecture:** The site deploys as a Cloudflare Worker (not Pages). `ADMIN_EMAIL` designates the destination inbox for all internal transactional notifications (contact form, newsletter, signup, teacher applications). Per locked architecture decisions, internal notifications go **ONLY** to the personal Gmail `faisalkhan.llc.ltd@gmail.com`. The mailbox `admin@quranific.com` is strictly a correspondence mailbox.
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

### OA-35 — Confirm Resend Contacts API Access & Segment ID (`RESEND_AUDIENCE_ID`)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 1 (Blocks Going Live)**
- **Platform:** Resend Dashboard (`https://resend.com/contacts`) & Cloudflare Secrets
- **Context & Architecture:** The double opt-in newsletter confirmation flow calls Resend's Contacts API to manage subscriptions and assign contacts to a segment.
- **Where to Check the API Key:**
  - Navigate to **Resend > API Keys** (`https://resend.com/api-keys`).
  - The API key used by the Worker in Cloudflare must be configured with **Full access** (allowing management of Contacts and Audiences/Segments), not a restricted "Sending access" key.
  - Verify key permissions in the Resend documentation; if unsure whether the key has contacts permissions, run the OA-31 live test.
- **Exact Steps:**
  1. In the Resend dashboard, confirm the API key used in Cloudflare has Full access permissions.
  2. Open **Audiences / Segments** (`https://resend.com/audiences`), copy the target Segment ID (e.g. `seg_...`).
  3. Set `RESEND_AUDIENCE_ID` in Cloudflare Worker secrets **before** receiving the first real subscribers:
     ```powershell
     npx wrangler secret put RESEND_AUDIENCE_ID
     ```
     Paste the Segment ID when prompted. (Set this before announcing or opening the newsletter to subscribers).
  4. **Symptom of a Problem:** If misconfigured or unauthorized, the newsletter confirmation page displays "We’ll Complete This Shortly" (deferred page) rather than instant confirmation.

---

## Tier 2 — Do Soon (First 48h / Pre-Scale)

### OA-09 — Disable Public `workers.dev` Route on Alarm Worker

- **Status:** ❌ **Still Open**
- **Urgency:** **Tier 2 (Do Soon)**
- **Empirical Proof (Probed 2026-10-10 17:03 UTC):**
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
- **Empirical Proof (Probed 2026-10-10 17:03 UTC):**
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
- **Empirical Proof (Probed 2026-10-10 17:03 UTC):**
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
- **Empirical Proof (Probed 2026-10-10 17:03 UTC):**
  - `curl.exe -sI https://www.quranific.com` returns HTTP 301 redirecting to `https://quranific.com/`.

---

### OA-29 — Geo-Pricing Display Verification (UK vs Pakistan)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Web Browser (direct from UK vantage / VPN vs Pakistan)
- **Context & Verification:**
  - In Pakistan / unmapped countries: verify baseline floor "$40/mo" displays cleanly.
  - In UK: verify currency displays in GBP (£) on tuition-fee calculator and pricing components.

---

### OA-30 — Container Padding Visual Inspection (21 URLs at 1280px+)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Desktop Browser DevTools Device Mode
- **Context:** The `quranific-container` utility (`@utility quranific-container` in `src/styles/global.css`) is unified to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`. Components utilizing `quranific-container` gain 16px per side above 1280px. Pages converted from hardcoded `px-8` do not visibly change.
- **Real URLs to Inspect (21 URLs):**
  - `/quran-classes/for-adults`
  - `/quran-teacher/for-adults`
  - `/quran-classes/for-kids`
  - `/quran-teacher/for-kids`
  - `/quran-classes/for-women`
  - `/quran-teacher/for-women`
  - `/courses/basic-qaida`
  - `/courses/quran-reading-with-tajweed`
  - `/courses/quran-memorization`
  - `/courses/quran-translation-with-tafsir`
  - `/courses/advanced-tajweed-ijazah`
  - `/courses/arabic-language`
  - `/courses`
  - `/faq`
  - `/`
  - `/legal/cookies`
  - `/legal/impressum`
  - `/legal/privacy`
  - `/legal/refund`
  - `/legal/terms`
  - `/tuition-fee`
- **Steps:** Visually inspect page layout at 1280px, 1440px, and 1920px across these 21 URLs to verify container margins remain balanced.

---

### OA-31 — Newsletter Double Opt-In End-to-End Live Validation

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 2 (Do Soon)**
- **Test Procedure:**
  1. Open footer on `https://quranific.com`. Enter `faisalkhan.llc.ltd+nltest@gmail.com` and submit.
  2. Confirm button text updates to **"Check your inbox"** and message displays: _"Check your inbox to confirm your subscription."_
  3. Check inbox: confirmation email arrives from `support@quranific.com` with signed confirm link.
  4. Click link: confirm page displays with "Confirm Subscription" button. Click button.
  5. Confirm success page displays.
  6. Check Resend dashboard: contact exists and is marked subscribed. If `RESEND_AUDIENCE_ID` is set, verify segment assignment.
  7. Check inbox: welcome email arrives with unsubscribe footer and RFC 8058 one-click headers.
  8. Check admin Gmail: admin alert notification received at `faisalkhan.llc.ltd@gmail.com`.
  9. **Rate Limit / Throttle Note:** There is a 10-minute per-email KV throttle (`NL_REQ:<email>`). Wait 10 minutes before re-testing duplicate submissions, otherwise the submission is throttled to prevent spam.
  10. Click unsubscribe link: confirm page displays; click the Unsubscribe button to unsubscribe contact and update Resend dashboard.

---

### OA-36 — Impressum Registration Text

- **Status:** ⚠️ **Owner to Decide**
- **Urgency:** **Tier 2 (Do Soon)**
- **Platform:** Legal Counsel & Site Content (`src/pages/legal/impressum.astro`)
- **Context & Problem:** The German Telemediengesetz (TMG) / Digitale-Dienste-Gesetz (DDG) requires a legally compliant Impressum for traffic targeted in DACH regions (e.g. running Google/Meta ads in Germany). In `src/pages/legal/impressum.astro`, placeholder-style legal text sits on a page used for German ads on lines 94 and 100:
  - Line 94:
    > `"Operating as a registered sole proprietor/entity in Pakistan."`
  - Line 100:
    > `"Provided upon formal request or during merchant underwriting."`
- **Owner & Legal Counsel Decisions:**
  1. **Option A (Real Details):** Replace line 100 with the real registration or tax identifier / NTN in Pakistan.
  2. **Option B (Remove the Row):** Remove the "Registration Number" list item from the Impressum table if not applicable to a sole proprietorship.
  3. **Option C (Wait for Quranific Ltd):** Leave sole proprietor disclosures until the UK entity (Quranific Ltd) formation is completed, then update with the UK Companies House registration number.
- **Action Required:** Business owner and counsel decide which option to implement before scaling German ad spend.

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
- **Empirical Proof (Probed 2026-10-10 17:03 UTC):**
  - `_dmarc.quranific.com IN TXT "v=DMARC1; p=none"` is active (currently has no `rua` configured).
- **Context & Architecture:** The DMARC record currently has no `rua` reporting tag. Without `rua`, mail receivers do not send aggregate reports, making it impossible to audit SPF/DKIM alignment.
- **Exact Steps:**
  1. Step 1: Add `rua=mailto:compliance@quranific.com` to the DNS TXT record for `_dmarc.quranific.com` (e.g. `v=DMARC1; p=none; rua=mailto:compliance@quranific.com`).
  2. _Note:_ The owner may prefer using a dedicated free DMARC report analysis service (such as Postmark DMARC, Valimail, or Dmarcian) instead of `compliance@quranific.com` to avoid inbox clutter.
  3. Watch aggregate reports for 2-4 weeks to ensure legitimate emails (from `send.quranific.com`) achieve 100% pass rates.
  4. Once confirmed, advance policy to `p=quarantine`.

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
- **Readiness Checklist (merged from OA-33):**
  - [ ] Apex `quranific.com` serves HTTPS with valid certificate
  - [ ] `www.quranific.com` redirects via HTTPS
  - [ ] `send.quranific.com` endpoints verified
  - [ ] Confirm no HTTP-only subdomains exist across DNS zone

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

### OA-33 — [Merged into OA-22]

See [OA-22](#oa-22--submit-domain-to-hsts-preload-list). (Excluded from action counts).

---

### OA-34 — SEO Track Owner Inputs (Branch `seo_audit_staging`)

- **Status:** ⚠️ **Owner Must Check**
- **Urgency:** **Tier 3 (Later)**
- **Reference:** Dedicated content and analytics requirements (GA4 measurement ID, SEMrush exports (keywords, competitors, backlinks), tutor credentials documentation, 4.9 rating source accreditation) are tracked on branch `seo_audit_staging`.
