# 🔎 THE BRUTAL AUDIT LEFTOVERS: QURANIFIC CODEBASE

**Audit Date:** August 24, 2026  
**Auditor:** Principal Release Architect & Code Forensic Specialist  
**Methodology:** 100% automated cross-examination across all 20 historical audit files, blueprints, and live source code in `src/`.

---

## 📊 EXECUTIVE AUDIT SCORECARD

Across all **20 audit files and blueprints** containing **188 discrete audit checkpoints**:

- 🟢 **[VERIFIED DONE]: 119 items (63.3%)** — Fully implemented and verified in the live source tree.
- 🟡 **[PARTIALLY DONE]: 39 items (20.7%)** — Implemented in parts or with edge-case regressions and omissions.
- 🔴 **[PENDING / BROKEN]: 30 items (16.0%)** — Critical defects, broken links/404s, data fractures, or unaddressed owner items.

---

## 🚨 SECTION 1: CRITICAL RUNTIME DEFECTS, 404s & BROKEN JAVASCRIPT

### 1.1 Careers Page UTF-8 / Mojibake Corruption & Broken Role Selector

- **Original Audit File:** `Quranific-agent-constitution.md`, `audits/AUDIT-01-UI.md`
- **Target Source File:** [`src/pages/careers.astro:60,90,102,178,563,569,819,1131,1236,1588`](file:///d:/Live%20Web/Quranific-live/src/pages/careers.astro)
- **The Brutal Truth:** The file suffered heavy Windows-1252/UTF-8 encoding corruption across 30+ lines, resulting in strings like `â€”` (em dash), `â€“` (en dash), `â±` (clock), `ðŸ’°` (money bag), and `Â·` (dot).
- **Functional Breakage:** On line 1588, client JavaScript executes:
  ```javascript
  const baseTitle = fullTitle.split('â€”')[0].trim();
  ```
  Because the select option text contains corrupted `â€”`, if encoding drifts, `baseTitle` fails to extract the role, completely breaking the auto-select dropdown behavior when candidates click "Apply now".

### 1.2 Broken Legal Links in Ad-Lander Footer (Production 404s)

- **Original Audit File:** `LANDING-COMPONENTIZATION-AUDIT.md` (Check 2.6)
- **Target Source File:** [`src/components/landing/LandingFooter.astro:13-48`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingFooter.astro)
- **The Brutal Truth:** `LandingFooter.astro` hardcodes relative links to `/privacy`, `/terms`, `/refund`, `/cookies`, `/impressum`. All legal routes in this application live under `src/pages/legal/` (`/legal/privacy`, `/legal/terms`, `/legal/refund`, `/legal/cookies`, `/legal/impressum`). Every legal link in the Women, Kids, and Adults landing page footer currently triggers an immediate **404 Page Not Found**.

### 1.3 Broken `/partners` Link in Global Footer (Production 404)

- **Original Audit File:** `AUDIT-LEDGER.md`, `SRC-STRUCTURE-AUDIT.md`
- **Target Source File:** [`src/constants/site.ts:107`](file:///d:/Live%20Web/Quranific-live/src/constants/site.ts)
- **The Brutal Truth:** `FOOTER_NAVIGATION.academy` in `site.ts` links to `/partners`. However, `src/pages/partners.astro` does not exist in the repository. Clicking "Partners" in the main footer triggers an immediate **404 Page Not Found**.

### 1.4 Dead-Letter Queue (DLQ) Recovery Logic Mismatch

- **Original Audit File:** `DEPLOYMENT.md`, `quranific_edge_security_audit.md`
- **Target Source Files:** [`src/pages/api/internal/retry-queue.ts:36-55`](file:///d:/Live%20Web/Quranific-live/src/pages/api/internal/retry-queue.ts), [`src/pages/api/register.ts:114`](file:///d:/Live%20Web/Quranific-live/src/pages/api/register.ts), [`src/pages/api/complete.ts:145`](file:///d:/Live%20Web/Quranific-live/src/pages/api/complete.ts)
- **The Brutal Truth:**
  - `register.ts` writes failed leads to KV as `FAILED_LEAD_STEP1:${leadId}` with payload `{ step1: validData }`.
  - `complete.ts` writes failed leads to KV as `FAILED_LEAD_STEP2:${lid}` with payload `{ step1, step2 }`.
  - `retry-queue.ts` queries `kv.list({ prefix: 'FAILED_LEAD:' })` and checks `if (data.taskIndex === 0)` / `else if (data.taskIndex === 1)`.
  - Because `taskIndex` is undefined and key prefixes do not match, the cron alarm worker will **never retry dropped lead emails**, resulting in silent lead loss upon Resend API hiccups.

### 1.5 Missing Cloudflare KV Binding: `FX_RATES`

- **Original Audit File:** `DEPLOYMENT.md`, `STACK-UPGRADE-AUDIT.md`
- **Target Source Files:** [`wrangler.toml`](file:///d:/Live%20Web/Quranific-live/wrangler.toml), [`src/env.d.ts:46,51`](file:///d:/Live%20Web/Quranific-live/src/env.d.ts), [`src/pages/courses/[slug].astro:22-26`](file:///d:/Live%20Web/Quranific-live/src/pages/courses/[slug].astro)
- **The Brutal Truth:** `env.d.ts` and `courses/[slug].astro` expect a Cloudflare KV namespace binding named `FX_RATES`. However, `wrangler.toml` only binds `SESSION`. In production on Cloudflare Pages, `Astro.locals.runtime.env.FX_RATES` resolves to `undefined` and dynamic currency lookup silently falls back to static USD rates.

---

## 📈 SECTION 2: MARKETING ATTRIBUTION, TRACKING & SEO DEFECTS

### 2.1 Ad Campaign Attribution Parameter Loss on Landing Page CTAs

- **Original Audit File:** `LANDING-PAGES-UI-AUDIT.md` (Check 1.3), `ADS-AUDIENCE-AUDIT.md`
- **Target Source Files:**
  - [`src/components/landing/LandingCTA.astro:36`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingCTA.astro)
  - [`src/components/landing/LandingGuarantee.astro:75`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingGuarantee.astro)
  - [`src/components/landing/LandingOnboarding.astro:87`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingOnboarding.astro)
  - [`src/components/landing/LandingPreview.astro:58,91`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingPreview.astro)
  - [`src/components/landing/LandingTrust.astro:63`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingTrust.astro)
  - [`src/components/landing/LandingProblem.astro:92`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingProblem.astro)
- **The Brutal Truth:** Client-side tracking scripts in `for-kids.astro`, `for-adults.astro`, and `for-women.astro` forward URL parameters (`gclid`, `utm_campaign`, `utm_source`, `fbclid`) to buttons matching `a[data-track-cta]`. Because intermediate section CTAs and Section 12 Final CTAs invoke `<Button>` without `data-track-cta`, the script ignores them. **Users converting on mid-page or final CTA buttons lose all Google/Meta ad tracking attribution.**

### 2.2 Course Detail Social Preview Image Fallback (Generic OG Thumbnail)

- **Original Audit File:** `COURSE-DETAIL-AUDIT.md` (Check 4.10)
- **Target Source File:** [`src/pages/courses/[slug].astro:67-68`](file:///d:/Live%20Web/Quranific-live/src/pages/courses/[slug].astro)
- **The Brutal Truth:** `[slug].astro` invokes `<Page description={course.shortDesc} title={`${course.title} | Quranific`}>` without passing an `image` prop. `Base.astro` falls back to `SITE.defaultImage` (`/images/og/default.webp`). All course URLs shared on social media, iMessage, and WhatsApp render the exact same generic site thumbnail instead of course-specific OG assets.

### 2.3 Dummy GA4 Placeholder & Missing Conversion Events

- **Original Audit File:** `STACK-UPGRADE-AUDIT.md`, `quranific_edge_security_audit.md`
- **Target Source Files:** [`src/layouts/Base.astro:174,185`](file:///d:/Live%20Web/Quranific-live/src/layouts/Base.astro), [`src/components/funnel/CompleteForm.svelte`](file:///d:/Live%20Web/Quranific-live/src/components/funnel/CompleteForm.svelte), [`src/pages/funnel/success.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/funnel/success.astro)
- **The Brutal Truth:** `Base.astro` has Partytown enabled with a dummy measurement ID `G-XXXXXXXXXX`. No Google Ads conversion tag or GA4 custom conversion events (`gtag('event', 'lead_conversion', ...)`) fire upon completing Step 2 registration.

---

## 🗄️ SECTION 3: DATA FRACTURES & SINGLE SOURCE OF TRUTH VIOLATIONS

### 3.1 Testimonials 3-Way Data Fork

- **Original Audit File:** `SRC-STRUCTURE-AUDIT.md` (Step 3), `Quranific-agent-constitution.md` (Section G)
- **Target Source Files:**
  - [`src/data/testimonials.ts`](file:///d:/Live%20Web/Quranific-live/src/data/testimonials.ts) (Sarah A., Khalid H., Nadia M.) — consumed by `index.astro` and `Funnel.astro`.
  - [`src/constants/testimonials.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/testimonials.ts) (Amna, Saleem Al Mustarshid, Naseerullah Babar) — consumed by `for-adults.astro` and `for-kids.astro`.
  - [`src/pages/[intent]/for-women.astro:61-83`](file:///d:/Live%20Web/Quranific-live/src/pages/%5Bintent%5D/for-women.astro) (Amna, Fatima, Sarah) — isolated inline array.
  - [`src/pages/testimonials.astro:70,130`](file:///d:/Live%20Web/Quranific-live/src/pages/testimonials.astro) (6 different inline reviews: Usama, Amna, Saleem, Omar & Fatima, Dr. Ahmed, Zainab).
- **The Brutal Truth:** There is no single source of truth for testimonials. Adding or editing a testimonial requires modifying 4 disparate files.

### 3.2 Teachers Data Disconnect

- **Original Audit File:** `SRC-STRUCTURE-AUDIT.md` (Step 3), `Quranific-agent-constitution.md` (Section G)
- **Target Source Files:** [`src/constants/teachers.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/teachers.ts) vs [`src/pages/teachers.astro:54-88`](file:///d:/Live%20Web/Quranific-live/src/pages/teachers.astro)
- **The Brutal Truth:** `src/constants/teachers.ts` defines `TEACHERS_LIST` with 3 teachers (Hafiz Haseeb, Ustadha Fatima, Sheikh Imran), but `src/pages/teachers.astro` completely ignores `teachers.ts` and declares its own `TEACHERS` array with 4 different teacher profiles (Ustadha Fatima M., Sheikh Ahmed A., Ustadha Maryam K., Sheikh Tariq H.).

### 3.3 Founder Avatar & Initials Mismatch on About Page

- **Original Audit File:** `QURANIFIC_OWNER_ACTIONS.md`, `summary.md`
- **Target Source File:** [`src/pages/about.astro:164,880`](file:///d:/Live%20Web/Quranific-live/src/pages/about.astro)
- **The Brutal Truth:** The founder text name was updated to "Faisal Khan" (`about.astro:23,167,882`), but the avatar visual badges were missed:
  - Line 164: Founder hero quote avatar displays the Arabic letter `ع` (Ayn for Omar) instead of `ف` (Fa for Faisal) or `F`.
  - Line 880: Founder team card avatar displays `OF` (Omar Farooq) instead of `FK` (Faisal Khan).
  - Accessibility issue: The decorative Arabic letter `ع` lacks `aria-hidden="true"`, causing screen readers to mispronounce it.

### 3.4 Al-Azhar Scholars Claim Residual in Courses Data

- **Original Audit File:** `QURANIFIC_OWNER_ACTIONS.md` (Item 1)
- **Target Source File:** [`src/constants/courses.ts:93`](file:///d:/Live%20Web/Quranific-live/src/constants/courses.ts)
- **The Brutal Truth:** While the unverified claim was removed from `Footer.astro`, it remains in `courses.ts` (Quran Reading with Tajweed description): _"Taught by certified Al-Azhar scholars, we offer personalized pacing..."_.

---

## 🎨 SECTION 4: UI DISCIPLINE, SPACING & COMPONENTIZATION GAPS

### 4.1 Incomplete Container Standard (`@utility quranific-container`)

- **Original Audit File:** `audits/AUDIT-01-UI.md` (UI-01), `RECONCILIATION.md`
- **Target Source Files:** 30+ pages and components including `about.astro`, `careers.astro`, `contact.astro`, `how-it-works.astro`, `CoursesFAQ.astro`, `Header.astro`, `Footer.astro`, `HomeHero.astro`, `HowItWorks.astro`.
- **The Brutal Truth:** `@utility quranific-container` exists in `global.css`, but over 30 core templates still hardcode `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` inline.

### 4.2 Raw `<a>` CTAs vs Standard `<Button>` Component

- **Original Audit File:** `audits/AUDIT-01-UI.md` (UI-03), `COURSE-DETAIL-AUDIT.md` (Check 4.8)
- **Target Source Files:**
  - [`src/components/sections/HomeHero.astro:75-87`](file:///d:/Live%20Web/Quranific-live/src/components/sections/HomeHero.astro)
  - [`src/components/sections/FinalCTA.astro:39-75`](file:///d:/Live%20Web/Quranific-live/src/components/sections/FinalCTA.astro)
  - [`src/components/courses/TeacherTeaserBanner.astro:78,95`](file:///d:/Live%20Web/Quranific-live/src/components/courses/TeacherTeaserBanner.astro)
  - [`src/components/courses/CourseCard.astro:93-117`](file:///d:/Live%20Web/Quranific-live/src/components/courses/CourseCard.astro)
- **The Brutal Truth:** Key marketing and conversion surfaces continue to use raw `<a>` tags with inline classes instead of `<Button>`.

### 4.3 40+ Residual Hardcoded Hex Color Literals

- **Original Audit File:** `audits/AUDIT-01-UI.md` (UI-04), `RECONCILIATION.md`
- **Target Source Files:** `src/pages/contact.astro`, `src/components/sections/FinalCTA.astro`, `src/components/sections/TestimonialGrid.astro`, `src/components/global/Header.astro`, `src/components/global/MobileMenu.astro`, `src/layouts/Base.astro`, `src/layouts/Funnel.astro`.
- **The Brutal Truth:** Over 40 raw hex codes (`#25D366`, `#128C7E`, `#022c22`, `#fefdf9`, `#047857`) bypass the `@theme` design tokens in `global.css`.

### 4.4 280+ Arbitrary Font Size Declarations

- **Original Audit File:** `audits/AUDIT-01-UI.md` (UI-05), `RECONCILIATION.md`
- **Target Source Files:** `CourseCard.astro`, `CoursesFAQ.astro`, `TeacherTeaserBanner.astro`, `PricingGrid.svelte`, `PricingCalculator.svelte`, `AdultCTA.astro`, `FAQAccordion.astro`, `HowItWorks.astro`, `QuranificDifference.astro`, `how-it-works.astro`.
- **The Brutal Truth:** Over 280 instances of arbitrary pixel font sizes (`text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]`, `text-[17px]`) exist across 20+ components, with `text-[9px]` and `text-[10px]` creating accessibility legibility warnings.

---

## 🗑️ SECTION 5: DEAD CODE, ORPHANED COMPONENTS & MONOLITHS

### 5.1 7 Orphaned Components Under `src/components/sections/`

- **Original Audit File:** `SRC-STRUCTURE-AUDIT.md` (Step 2)
- **Target Source Files:**
  1. `src/components/sections/AdEntryPoints.astro` (0 imports)
  2. `src/components/sections/BlogGrid.astro` (0 imports)
  3. `src/components/sections/ContactForm.astro` (0 imports; `contact.astro` inlines its form)
  4. `src/components/sections/CourseGrid.astro` (0 imports; `courses/index.astro` imports `courses/CourseGrid.astro`)
  5. `src/components/sections/PricingTable.astro` (0 imports; superseded by `PricingGrid.svelte`)
  6. `src/components/sections/TeacherGrid.astro` (0 imports; `teachers.astro` inlines teacher cards)
  7. `src/components/sections/ValuePillars.astro` (0 imports)
- **The Brutal Truth:** All 7 files remain on disk despite being marked for deletion in structural audit documents.

### 5.2 Dead Schema Fields in `src/constants/courses.ts`

- **Original Audit File:** `COURSE-DETAIL-AUDIT.md` (Check 4.9)
- **Target Source File:** [`src/constants/courses.ts:32-37,82-85,133-136`](file:///d:/Live%20Web/Quranific-live/src/constants/courses.ts)
- **The Brutal Truth:** `riveFile` is declared and populated for all 6 courses (`qaida.riv`, etc.), but there is zero Rive runtime integration in the project. `senAdapted` and `nooraniQaida` boolean flags are also populated but never rendered.

### 5.3 4 Monolithic Uncomponentized Page Files (>50 KB)

- **Original Audit File:** `SRC-STRUCTURE-AUDIT.md` (Step 4)
- **Target Source Files:**
  - `src/pages/how-it-works.astro` (86.6 KB, 1,708 lines)
  - `src/pages/careers.astro` (77.5 KB, ~800 lines)
  - `src/pages/contact.astro` (70.1 KB, 1,398 lines)
  - `src/pages/about.astro` (54.5 KB, ~600 lines)
- **The Brutal Truth:** While `index.astro` and `tuition-fee.astro` were decomposed cleanly, these 4 pages remain unwieldy monoliths containing inline SVGs, hardcoded styles, and embedded script tags.

### 5.4 Stale Audit Ledgers

- **Original Audit Files:** [`audits/FIX-LOG.md`](file:///d:/Live%20Web/Quranific-live/audits/FIX-LOG.md), [`AUDIT-LEDGER.md`](file:///d:/Live%20Web/Quranific-live/AUDIT-LEDGER.md)
- **The Brutal Truth:** Both files show all findings and phases as `Not Started` or `PENDING`, completely out of sync with actual codebase reality.

---

## ⚖️ SECTION 6: POLICY CONTRADICTIONS & OWNER DECISIONS

### 6.1 Refund Guarantee Policy Contradiction (7 Days vs 1 Full Month)

- **Original Audit File:** `QURANIFIC_OWNER_ACTIONS.md`, `Quranific-agent-constitution.md`
- **Target Source Files:** [`src/pages/legal/refund.astro:120-133`](file:///d:/Live%20Web/Quranific-live/src/pages/legal/refund.astro) vs [`src/data/faqs.ts:92-95`](file:///d:/Live%20Web/Quranific-live/src/data/faqs.ts) vs [`src/pages/features.astro:270`](file:///d:/Live%20Web/Quranific-live/src/pages/features.astro)
- **The Brutal Truth:**
  - `refund.astro` legally restricts refunds to the **first 7 days**.
  - `faqs.ts`, `faq.astro`, `features.astro`, and `TuitionPlans.astro` advertise a **1-month money-back guarantee ("first full paid month")**.
  - **Compliance Risk:** High consumer protection vulnerability under UK Consumer Rights Act and Advertising Standards Authority (ASA).

### 6.2 Unverified Specificity Claims in Site Constants

- **Original Audit File:** `audits/AUDIT-03-CONTENT.md` (CON-02), `QURANIFIC_OWNER_ACTIONS.md`
- **Target Source Files:** [`src/constants/site.ts:54-59`](file:///d:/Live%20Web/Quranific-live/src/constants/site.ts), [`src/pages/testimonials.astro:70,130`](file:///d:/Live%20Web/Quranific-live/src/pages/testimonials.astro)
- **The Brutal Truth:** `site.ts` still exports `stats` with `'22 Countries'`, `'3,000+ Students'`, `'94% Retention'`, and `'4.9 Rating'`, and `testimonials.astro` injects `reviewCount: '542'` in JSON-LD.

### 6.3 Placeholder Staff Profiles on About Page

- **Original Audit File:** `QURANIFIC_OWNER_ACTIONS.md` (Item 3)
- **Target Source File:** [`src/pages/about.astro:893-929`](file:///d:/Live%20Web/Quranific-live/src/pages/about.astro)
- **The Brutal Truth:** "Sara Ahmed" (Head of Education) and "Khaled Rashid" (Head of Teachers) remain unverified placeholder profiles.
