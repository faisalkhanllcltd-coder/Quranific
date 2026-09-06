# Full Pre-Launch Audit Report (Corner to Corner)

**Repository:** `Quranific`  
**Audit Branch:** `staging/prelaunch-audit`  
**Execution Mode:** STRICT READ-ONLY (Fix nothing, report with real live evidence)  
**Date:** 2026-09-06  
**Account:** `a4fa216703f27e36d764375a879e75c4` (`faisalkhan.llc.ltd@gmail.com`)  
**Main Deployed Version:** `58d7bc57-dc89-40c2-8de5-8e05efef0db8`  
**Alarm Worker Version:** `97e2b6e4-d703-4bab-9d56-2650ff70274c`

---

## Executive Summary & Gate Status

_Auditing in progress across Sections 0 through 55._

---

## 0. Release Gate

- [ ] Correct commit/branch is what's being released
- [ ] Working tree clean
- [ ] No uncommitted production changes
- [ ] No known launch-blocking issue outstanding
- [ ] Production environment correctly identified
- [ ] Rollback path known
- [ ] Release owner and recovery contact known

---

## 1. Architecture & Framework

- [ ] Astro server-output configuration correct
- [ ] Every page that should be prerendered genuinely is
- [ ] Every page that should be SSR genuinely is (not accidentally prerendered)
- [ ] API routes never accidentally prerendered
- [ ] Cloudflare adapter configuration correct
- [ ] Workerd compatibility verified
- [ ] Any Node-compat usage is justified, not accidental
- [ ] No Node-only dependency running in edge-critical code
- [ ] Server/client boundaries clean — no server secret importable by client code
- [ ] No unnecessary middleware work, SSR, or hydration
- [ ] Architecture actually matches deployment topology, not just documentation

---

## 2. Astro Islands & Svelte 5 Runes

- [ ] Every `client:load` genuinely needs to be that eager
- [ ] Every `client:idle` genuinely can wait
- [ ] Every `client:visible` genuinely is below-fold/conditional
- [ ] No hydration that server HTML could have eliminated
- [ ] No hydration mismatch (server HTML vs. client render diverge)
- [ ] No duplicated state between server and client
- [ ] No unnecessary `$state`
- [ ] `$derived` used for derivation, not as duplicated state
- [ ] `$effect` doesn't create runaway network calls or render loops
- [ ] `$props` properly typed
- [ ] `$bindable` genuinely necessary where used
- [ ] Browser-only APIs (window, document, localStorage) properly guarded
- [ ] Listeners/timers/observers actually cleaned up on unmount
- [ ] Loading/error/success states all functional, not just the happy path
- [ ] Keyboard and focus behavior correct per island

---

## 3. TypeScript / Code Quality

- [ ] `npm run check` — zero errors
- [ ] `npm run typecheck` — passes
- [ ] `npm run lint` — passes
- [ ] No unsafe `any` hiding a real type problem
- [ ] No dangerous casts
- [ ] No ignored compiler errors
- [ ] No disabled lint rules masking a real defect
- [ ] No dead code, dead exports, or duplicate utilities/constants
- [ ] No stale comments contradicting actual behavior
- [ ] No debug code or accidental console logging left in
- [ ] No unfinished TODO/FIXME that affects launch
- [ ] Error handling explicit, not swallowed
- [ ] Async failure paths actually handled
- [ ] Run the project's own dead-code scanner, not just static analysis

---

## 4. Dependency / Supply-Chain Audit

- [ ] Actually used somewhere in the codebase
- [ ] Actually required
- [ ] Running in the correct environment (build/server/client)
- [ ] Edge/Workerd compatible
- [ ] No unnecessary transitive weight
- [ ] No known critical vulnerability (run an actual audit tool)
- [ ] Versions pinned intentionally, not drifted
- [ ] Lockfile committed and reproducible
- [ ] No abandoned/unmaintained package doing load-bearing work

---

## 5. Production Environment & Secrets

- [ ] `SITE`
- [ ] `PROD`
- [ ] `ENVIRONMENT`
- [ ] `ADMIN_EMAIL`
- [ ] `RESEND_API_KEY`
- [ ] `TURNSTILE_SECRET_KEY`
- [ ] `JWT_SECRET` — confirm it matches exactly between the main Pages project and `alarm-worker`
- [ ] `SESSION` KV binding present and correct
- [ ] `GA_ID`, if intentionally enabled
- [ ] Any legacy `SHEET_WEBHOOK_URL` is either deliberately still used or fully removed
- [ ] No development-only value leaking into production
- [ ] No secret present in client JS, HTML, source maps, logs, or URLs

---

## 6. Build & Artifact Audit

- [ ] Full build sequence passes cleanly
- [ ] No secrets present in built files
- [ ] No `localhost` or test-domain references
- [ ] No debug strings
- [ ] No unexpected JS bundled in
- [ ] No unexpectedly large assets
- [ ] No broken routes or missing assets in the build output
- [ ] No accidental development configuration shipped

---

## 7. JavaScript / Bundle Audit

- [ ] Identify source island for every bundle
- [ ] Confirm hydration is necessary
- [ ] Inspect real bundle sizes
- [ ] Inspect dependencies for duplication across bundles
- [ ] Tree-shaking and code-splitting active
- [ ] No server-only library leaked into client bundles
- [ ] No unnecessary analytics payload
- [ ] No unnecessary polyfills

---

## 8. Core Web Vitals / Real Performance

- [ ] Cold cache vs warm cache performance
- [ ] Throttled slow connection & high latency
- [ ] Low CPU & mobile simulation
- [ ] No render-blocking JS / unnecessary CSS
- [ ] Layout stability & zero CLS

---

## 9. Images / Fonts / Media

- [ ] Image dimensions & modern formats (WebP/AVIF)
- [ ] Responsive loading & proper LCP prioritization
- [ ] Font subsets & display properties (Inter, Merriweather, Amiri)
- [ ] Arabic typography & font rendering verified
- [ ] Media optimization

---

## 10. Responsive / Mobile

- [ ] Viewport testing (320px, 360px, 375px, 390px, 414px, 768px, 1024px, 1280px, 1440px+)
- [ ] No horizontal overflow or clipping
- [ ] Sticky CTA & Mobile navigation behavior
- [ ] Form and keyboard interactions on mobile

---

## 11. Accessibility

- [ ] Semantic HTML and landmark structure
- [ ] Single H1 per page and heading hierarchy
- [ ] Keyboard navigation and visible focus states
- [ ] Dialog focus trap & escape handling (cookie banner)
- [ ] Color contrast & text scaling up to 200%

---

## 12. SEO Surface (site-wide)

- [ ] Unique titles, descriptions, canonicals, robots
- [ ] Sitemap.xml, robots.txt, llms.txt, RSS
- [ ] 404 and 500 error pages
- [ ] Apex vs WWW redirects & trailing slash consistency

---

## 13. Programmatic SEO

- [ ] `/courses/[slug]`, `/[intent]`, `/blog/[slug]` uniqueness & value
- [ ] Internal linking & breadcrumbs
- [ ] Zero thin/duplicate or cannibalized pages

---

## 14. SEO Regression Protection

- [ ] `node tests/seo-snapshot.mjs` & `node tests/seo-diff.mjs` clean diff

---

## 15. Structured Data

- [ ] Schema validation (Organization, WebSite, WebPage, Course, FAQ, BreadcrumbList)
- [ ] No conflicting JSON-LD blocks

---

## 16. Link & Route Integrity

- [ ] `node link_check.cjs` execution & status
- [ ] Zero broken internal links or dead redirects

---

## 17. Consent Mode v2 / Privacy Architecture (Tier 2)

- [ ] STRICT, MODERATE, NONE bucketing logic
- [ ] Cache safety: static denied baseline with wait_for_update: 500
- [ ] Cookie path (returning) vs async API path (new visitor)
- [ ] GPC binding override

---

## 18. Consent Endpoint (Tier 2)

- [ ] `GET /api/consent-bucket` functionality, no-store headers, bypass cache

---

## 19. Geo-Currency / Pricing (Tier 2)

- [ ] `GET /api/geo-currency` functionality & country mapping
- [ ] Exact price matrix matching `pricing.ts`
- [ ] AED & SAR bidi layout isolation confirmed in DOM layout

---

## 20. Student Funnel — Full State-Machine Audit (Tier 1)

- [ ] Step 1 (`/getting-started/signup` -> `/api/register` -> `q_session`)
- [ ] Step 2 (`/getting-started/complete` -> `/api/complete` -> `/getting-started/success`)
- [ ] Edge cases: invalid data, expired session, missing token, tampered token, refresh, back button, double submission, partial completion
- [ ] **Can a customer get permanently stuck or a lead be silently lost?**

---

## 21. JWT / Session (Tier 1)

- [ ] HS256 algorithm & secret strength
- [ ] Expiration, signature enforcement, tampering resistance
- [ ] Cookie security attributes: HttpOnly, Secure, SameSite=Lax

---

## 22. Turnstile (Tier 1)

- [ ] Widget rendering & token verification on all form endpoints
- [ ] Replay prevention & failure UX

---

## 23. API Security (Tier 1)

- [ ] Method restrictions, payload limits, content-type checks
- [ ] Input schemas & error disclosures

---

## 24. Input / Data Validation (Tier 1)

- [ ] Server-side Zod validation across all user inputs
- [ ] Unicode, Arabic, emoji, script/HTML injection, malformed email/phone

---

## 25. Rate Limiting (Tier 1)

- [ ] Distributed KV rate limiting (`RL:*`) by CF-Connecting-IP
- [ ] IPv4/IPv6 support, TTL compliance, abuse resistance

---

## 26. Idempotency (Tier 1)

- [ ] Completion step idempotency key (`IDEM:COMPLETE:*`)
- [ ] Protection against double clicks, concurrent tabs, retry re-fires

---

## 27. KV Audit (Tier 1)

- [ ] Namespace binding & permissions (`SESSION`)
- [ ] Key prefixes (`RL:*`, `IDEM:*`, `FAILED_*`) & TTL management
- [ ] Storage growth & failure resilience

---

## 28. Resend / Email (Tier 1)

- [ ] Delivery pipelines for leads, welcomes, teacher applications, inquiries
- [ ] Failure simulation: timeout, 4xx/5xx, rate limits, outage handling
- [ ] Domain auth: SPF, DKIM, DMARC

---

## 29. Dead-Letter Queue (Tier 1)

- [ ] Persistence of failed sends in `SESSION` KV
- [ ] Recovery loop & poison-pill prevention
- [ ] Observability & alerting

---

## 30. Alarm Worker (Tier 1 / Tier 2)

- [ ] Cron schedule (`0 * * * *`) & active state
- [ ] JWT authentication to `/api/internal/retry-queue`
- [ ] Live execution verification

---

## 31. Internal Endpoint Security (Tier 1)

- [ ] `/api/internal/retry-queue` authentication & method gating
- [ ] Public disclosure protection

---

## 32. Caching Architecture (Tier 1)

- [ ] Edge caching (`CDN-Cache-Control`) vs Browser caching (`Cache-Control`)
- [ ] Guarantee: Can one visitor's geo/consent/session response leak to another?

---

## 33. Cloudflare / DNS / TLS (Tier 1)

- [ ] DNS, apex/www canonical redirection, HTTPS enforcement, TLS 1.3

---

## 34. Security Headers / CSP (Tier 1)

- [ ] Real response header audit: CSP, HSTS, X-Frame-Options, Permissions-Policy

---

## 35. Partytown / Analytics (Tier 1)

- [ ] Worker proxy, consent enforcement, dataLayer bridging

---

## 36. Attribution & Campaign Tracking (Tier 1)

- [ ] Ad click IDs (`gclid`, `fbclid`, `ttclid`) & UTM parameters persistence
- [ ] Calculator context preservation into signup/session

---

## 37. Privacy & Data Minimization (Tier 1)

- [ ] Data inventory & minimization audit for leads, students, and applicants

---

## 38. Content / Trust / Legal (Tier 1)

- [ ] Verification of claims, guarantees, testimonials, contact details, policies

---

## 39. Conversion / CRO (Tier 1)

- [ ] Friction analysis, CTA accessibility, mobile conversion journey

---

## 40. Error & Failure-State QA (Tier 1)

- [ ] Systematic verification of error states (404, 500, network, KV, API failures)

---

## 41. Browser & Device Matrix (Tier 1)

- [ ] Compatibility across Chrome, Firefox, Safari, Edge, iOS, Android

---

## 42. Production Smoke Test (Tier 1)

- [ ] Real-time verification sequence on live deployment

---

## 43. Production Route Inventory (Tier 1)

- [ ] Full reconciliation of public and API routes against live production

---

## 44. Deployment Configuration (Tier 1)

- [ ] Cloudflare Pages & Workers deployment topology verification

---

## 45. Post-Deploy Verification (Tier 1)

- [ ] Production verification protocol & error log analysis

---

## 46. Operational Readiness (Tier 1)

- [ ] Incident response runbooks & disaster recovery validation

---

## 47. Rollback & Recovery (Tier 1)

- [ ] Rollback procedures, deployment pinning, state preservation

---

## 48. Automated Regression Gate (Tier 1)

- [ ] Comprehensive verification of pre-commit & CI gates

---

## 49. Automated Coverage Gaps (Tier 1)

- [ ] Transparent audit of untested flows and missing unit/integration tests

---

## 50. Payment / Billing Architecture (New)

- [ ] Investigation of payment gateways, checkout references, PCI scope

---

## 51. Child-Safety & Signup Appropriateness (New)

- [ ] Guardian verification, child data collection, COPPA/UK Children's Code posture

---

## 52. GDPR Data-Subject Rights (New)

- [ ] Operational workflow for Articles 15 & 17 access/deletion requests

---

## 53. Disaster Recovery for Infrastructure Access (New)

- [ ] Single point of failure assessment for Cloudflare, GitHub, and KV

---

## 54. Post-Launch Monitoring (New)

- [ ] Uptime monitoring, DLQ threshold alerting, error tracking

---

## 55. Business Continuity (New)

- [ ] Emergency access procedures & operational redundancy
