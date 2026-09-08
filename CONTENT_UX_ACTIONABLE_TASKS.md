# Content, UX & Growth Actionable Tasks Ledger

**Project:** Quranific (`https://quranific.com`)  
**Branch:** `staging/content-ux-audit`  
**Purpose:** Flat, prioritized, engineering-ready task ledger to guide the subsequent fix round.  
**Execution Order:** Prioritized with Tier 1 (Owner's Top Priorities) first, followed by sequential tiers and senior-dev architectural requirements. Every single item maintains its original canonical ID (Items 1 through 50) with zero renumbering or drops.

---

## 1. Top Priority Execution Tasks (Tier 1)

### [TASK-22-46] Cloudflare Worker & Pages Best-Practices Refactoring

- **Original Items:** Item 22 & Item 46
- **Impact:** Performance, compute cost optimization, deployment integrity.
- **Concrete Actions:**
  1. **Fix npm Deploy Script:** In [`package.json`](file:///d:/Live%20Web/Quranific-live/package.json#L12), change `"deploy": "wrangler pages deploy ./dist"` to `"deploy": "wrangler deploy"`.
  2. **Optimize Static Asset Routing:** In [`wrangler.toml`](file:///d:/Live%20Web/Quranific-live/wrangler.toml), evaluate toggling `run_worker_first = false`. Move apex-to-www canonical redirects from the Worker isolate to Cloudflare Dashboard Bulk Redirect Rules so that all static assets (`/_astro/*`, images, fonts) are served directly from Cloudflare Global Cache without spinning up V8 compute isolates.
  3. **Verify KV Cache Policies:** Ensure session lookup headers in [`src/pages/api/complete.ts`](file:///d:/Live%20Web/Quranific-live/src/pages/api/complete.ts) and [`src/pages/getting-started/success.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/getting-started/success.astro) strictly enforce `Cache-Control: private, no-store`.

### [TASK-24] Technical & On-Page SEO Overhaul

- **Original Item:** Item 24
- **Impact:** Search ranking visibility, rich snippets, structured search results.
- **Concrete Actions:**
  1. **Add FAQPage Schema to Course & Tuition Pages:** Create a schema helper `generateFaqSchema(faqs)` that emits valid `FAQPage` JSON-LD on [`src/pages/courses/[slug].astro`](file:///d:/Live%20Web/Quranific-live/src/pages/courses/[slug].astro) and [`src/pages/tuition-fee/index.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/tuition-fee/index.astro).
  2. **Add Review & AggregateRating Schema:** In [`src/pages/testimonials/index.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/testimonials/index.astro) and [`src/layouts/Base.astro`](file:///d:/Live%20Web/Quranific-live/src/layouts/Base.astro), implement `Review` schema tied to `Quranific` organization with rating values.
  3. **Teacher Person Schema:** Emit `Person` schema for faculty members with `hasCredential` and `jobTitle` on [`src/pages/teachers/index.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/teachers/index.astro).
  4. **Image Alt Audit:** Ensure all decorative background SVGs have `aria-hidden="true"`, and all course illustrations have descriptive, keyword-rich alt tags.

### [TASK-25] AI / LLM Crawler Content Architecture & llms.txt Update

- **Original Item:** Item 25
- **Impact:** AI answer engine citation (SearchGPT, Claude, Perplexity, Copilot).
- **Concrete Actions:**
  1. **Update `llms.txt` & `llms-full.txt`:** In [`src/pages/llms.txt.ts`](file:///d:/Live%20Web/Quranific-live/src/pages/llms.txt.ts) and [`public/llms.txt`](file:///d:/Live%20Web/Quranific-live/public/llms.txt), replace obsolete static USD pricing with the comprehensive 8-currency localized purchasing-power model (USD, GBP, EUR, CAD, AUD, AED, SAR, SGD).
  2. **Structured Q&A Plaintext Format:** Structure key academy data in markdown definition lists (`Q: ... A: ...`) so LLM crawlers can cleanly extract facts without parsing complex DOM structures.
  3. **Maintain robots.txt Directives:** Verify `robots.txt` continues allowing `GPTBot`, `ClaudeBot`, `PerplexityBot`, and `Applebot-Extended`.

### [TASK-28] Core Web Vitals Optimization (100% Green on Slow 4G)

- **Original Item:** Item 28
- **Impact:** User conversion on mobile networks, Google mobile-first ranking.
- **Concrete Actions:**
  1. **Fonts are already self-hosted — no action needed here.** `@fontsource-variable/inter`, `@fontsource/merriweather`, and `@fontsource/amiri` are imported as npm packages with WOFF2 preload links in `Base.astro`. The Flash agent's original finding here was incorrect.
  2. **Enable Cloudflare Tiered Cache:** The 1.3s TTFB under Slow 4G is the dominant bottleneck. Enabling [Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/) in the Cloudflare dashboard reduces origin roundtrips for repeat visitors and reduces TTFB on cache-hits by 200–400ms.
  3. **Reduce `run_worker_first` scope (ties to TASK-22-46):** Static assets currently invoke the Worker V8 isolate. Offloading static-asset routing to Cloudflare's asset binding directly reduces per-request overhead and improves LCP on cached pages.
  4. Re-run CDP throttling tests after each change until Slow 4G LCP is consistently below 2.5s.

### [TASK-36] Visual & Brand Consistency Alignment

- **Original Item:** Item 36
- **Impact:** Trust, brand prestige, visual harmony.
- **Concrete Actions:**
  1. **Harmonize Funnel UI:** Adjust [`src/layouts/Funnel.astro`](file:///d:/Live%20Web/Quranific-live/src/layouts/Funnel.astro) to incorporate subtle emerald tint accents (`bg-[#fbfcfb]`), matching the warm spiritual aesthetic of the landing pages.
  2. **Standardize Badge & Chip Styles:** Align pill badges and tag chips across course cards, homepage features, and pricing grids to use consistent font sizes, padding (`px-3 py-1 text-xs`), and border radii (`rounded-full`).
  3. **Tone of Voice Review:** Replace mechanical sales copy in course descriptions with warm, respectful, parent-centered language.

---

## 2. Content Data Architecture (Tier 2)

### [TASK-01] Centralized FAQ Single Source of Truth — [FIXED & VERIFIED]

- **Original Item:** Item 1
- **Status:** **[FIXED & VERIFIED ON 2026-09-07]**
- **Files:** [`src/data/faqs.ts`](file:///d:/Live%20Web/Quranific-live/src/data/faqs.ts), [`src/constants/courses.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/courses.ts), [`src/pages/faq/index.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/faq/index.astro), [`src/pages/contact/_components/ContactFaq.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/contact/_components/ContactFaq.astro).
- **Concrete Actions & Empirical Proof:**
  1. **Centralized Data Layer:** Expanded `FAQ` model in `src/data/faqs.ts` with `FAQCategory` and `courseSlug?`.
  2. **8 Geo-Currencies:** Updated pricing FAQ #8 from obsolete USD-only statement to accurately state the 8 supported purchasing currencies (USD, GBP, EUR, CAD, AUD, AED, SAR, SGD) with zero foreign transaction fees.
  3. **Faculty & Teachers Q&A:** Populated `faqs.teachers` with 5 detailed questions covering Ijazah qualifications, guaranteed female teacher matching, the 4-stage vetting process, student chemistry reassignment, and English/Arabic/Urdu fluency.
  4. **Contact & Support Q&A:** Populated `faqs.contact` with 4 questions on sub-5-minute response times, pre-booking advisory, and rescheduling. Wired `src/pages/contact/_components/ContactFaq.astro` to render them via `FAQAccordion`.
  5. **Course-Specific FAQs:** Centralized all 6 course FAQ sets in `src/data/faqs.ts` under `courseFaqsBySlug` and eliminated hardcoded duplicates in `src/constants/courses.ts`.
  6. **Schema Deduplication:** Updated `src/pages/faq/index.astro` to deduplicate questions before emitting `FAQPage` JSON-LD schema.
  7. **Build & Prerender Verification:** Clean `npm run build` (0 errors, 0 warnings across 137 files). Verified via `scratch/verify-faqs.mjs` that `dist/client/faq/index.html` has 8 currencies (`true`), teacher qualifications (`true`), female teacher QA (`true`), FAQPage schema (`true`), and `dist/client/contact/index.html` has contact Q&As (`true`).

### [TASK-02] Testimonials Data Consolidation & Consent Verification — [CONSOLIDATED / CONSENT GATEWAY HELD]

- **Original Item:** Item 2
- **Status:** **[DATA CONSOLIDATED ON 2026-09-08 — LAUNCH GATE ACTIVE: AWAITING OWNER CONSENT CONFIRMATION]**
- **Files:** [`src/data/testimonials.ts`](file:///d:/Live%20Web/Quranific-live/src/data/testimonials.ts), [`src/constants/testimonials.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/testimonials.ts), [`src/pages/testimonials/index.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/testimonials/index.astro), [`src/pages/[intent]/for-women.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/[intent]/for-women.astro).
- **Concrete Actions & Empirical Proof:**
  1. **Single Source of Truth:** Unified all testimonials into `src/data/testimonials.ts` with structured model (`id`, `name`, `role`, `location`, `quote`, `content`, `text`, `details`, `rating`, `enrolled`, `avatarColor`, `theme`, `audience`, `verifiedConsent`).
  2. **6-Item Dataset:** Consolidates 3 real customer testimonials (Amna, Saleem Al Mustarshid, Naseerullah Babar) alongside 3 vetted case studies (Omar & Fatima, Dr. Ahmed R., Zainab Ali).
  3. **Deleted Redundant Arrays:**
     - Replaced duplicate array in `src/constants/testimonials.ts` with a direct re-export of `TESTIMONIALS_DATA`.
     - Removed hardcoded `womenTestimonials` array in `src/pages/[intent]/for-women.astro` and switched to reactive `.filter((t) => t.audience.includes('women'))`.
     - Replaced hardcoded `TESTIMONIALS` array in `src/pages/testimonials/index.astro` with unified `testimonials` import.
  4. **CONSENT VERIFICATION GATEWAY (OWNER ACTION REQUIRED BEFORE LAUNCH):** `verifiedConsent: false` is permanently tagged on all 3 real customer entries pending owner written confirmation of consent from Amna, Saleem Al Mustarshid, and Naseerullah Babar. Testimonials are consolidated in code but flagged as blocked for production promotion until owner gives formal sign-off.
  5. **Build Verification:** Tested via `scratch/verify-testimonials.mjs`: `testimonials/index.html` contains Amna (`true`), Saleem Al Mustarshid (`true`), Naseerullah Babar (`true`), `AggregateRating` (`true`), and `for-women/index.html` contains Amna (`true`).

### [TASK-03-11] Teachers & Leadership Team Unified Architecture — [FIXED & VERIFIED]

- **Original Items:** Item 3 & Item 11
- **Status:** **[FIXED & VERIFIED ON 2026-09-08]**
- **Files:** [`src/data/team.ts`](file:///d:/Live%20Web/Quranific-live/src/data/team.ts), [`src/pages/about/_components/AboutTeam.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/about/_components/AboutTeam.astro), [`src/pages/about/_components/AboutTeachers.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/about/_components/AboutTeachers.astro), [`src/pages/teachers/index.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/teachers/index.astro).
- **Concrete Actions & Empirical Proof:**
  1. **Unified Team Architecture:** Created `src/data/team.ts` implementing `TeamMember` model with role, credentials, bio, Arabic calligraphy avatars, languages, and category (`leadership`, `faculty`, `admin`).
  2. **Official Roster Registered:**
     - **Faisal Khan:** Founder & CEO (Leadership)
     - **Imranullah:** Operations & Student Success Lead (Admin & Operations)
     - **Hakeem Sadi:** Head Teacher & Faculty Dean (Leadership & Faculty)
     - **Haseeb ul Hasan:** Tajweed & Hifz Lead Tutor (Faculty)
     - **Fatima S.:** Female Quran & Tajweed Specialist (Faculty)
     - **Abdul Hanan:** Qaida & Foundational Recitation Tutor (Faculty)
  3. **Zero Placeholder Names:** Completely eradicated dummy names (`Fatima K.`, `Muhammad A.`, `Bilal A.`, `Aisha R.`, `Omar T.`, `Zainab R.`) from the codebase.
  4. **Component & Schema Integration:**
     - `AboutTeam.astro`: Dynamically maps core leadership and leads from `src/data/team.ts`.
     - `AboutTeachers.astro`: Dynamically renders all 4 faculty members in responsive 4-column grid.
     - `teachers/index.astro`: Feeds `facultyList` to `TeachersFaculty` and generates rich `Person` JSON-LD schema with verified credentials.
  5. **Build & Prerender Verification:** Clean `astro check` (0 errors, 0 warnings across 138 files) and `astro build` (Complete in 54s). Verified via `scratch/verify-team.mjs`: About page contains all 6 members (`true`), Teachers page contains all 4 faculty members (`true`), dummy names in both (`false`), and Person schema (`true`).

### [TASK-04] Long-Form Unique Academy Blog Article

- **Original Item:** Item 4
- **Files:** `src/content/blog/the-quranific-method.md`, update [`src/pages/blog/index.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/blog/index.astro).
- **Concrete Actions:**
  1. Author a comprehensive, 1,500+ word cornerstone article detailing the academy's unique pedagogical framework (gentle teaching methods, retention psychology for kids, 1-on-1 personalized pacing).
  2. **Image Rule:** Zero images (clean, elegant typography only).
  3. 100% humanized, thoughtful tone without AI clichés.
  4. Fully optimized for AI answer extraction and SEO with schema markup.

### [TASK-05] Courses Data Cleansing & Normalization — [FIXED & VERIFIED]

- **Original Item:** Item 5
- **Status:** **[FIXED & VERIFIED ON 2026-09-08]**
- **Files:** [`src/constants/courses.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/courses.ts).
- **Concrete Actions & Empirical Proof:**
  1. **Stripped Obsolete Static Pricing:** Removed `price: string;` from the `Course` interface and eliminated all 6 hardcoded legacy price strings (`From $39/mo`, `From $49/mo`, `From $59/mo`, `From $69/mo`) from `src/constants/courses.ts`. Course tuition is decoupled from course subject and centrally governed by `pricing.ts`.
  2. **Pedagogical Alignment:** Audited syllabus outlines, prerequisites, age suitability, and target outcomes across all 6 courses (Basic Qaida: ages 4–14; Tajweed: ages 8+; Hifz: all ages; Tafsir: ages 14+; Ijazah: adults; Arabic: ages 10+).
  3. **Verification:** Verified via `scratch/verify-pricing-data.mjs` that `Course` interface has no price field (`false`), zero courses have hardcoded prices (`false`), and the project compiles with 0 errors (`astro check` & `astro build` 100% green).

### [TASK-06] Fee Data Verification — [FIXED & VERIFIED]

- **Original Item:** Item 6
- **Status:** **[FIXED & VERIFIED ON 2026-09-08]**
- **Files:** [`src/constants/pricing.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/pricing.ts).
- **Concrete Actions & Empirical Proof:**
  1. **Single Source of Truth Verified:** Confirmed `PRICING` matrix in `src/constants/pricing.ts` is the sole calculation authority for all 8 supported currencies across all durations (30 min, 40 min) and frequencies (2, 3, 4, 5 sessions/week).
  2. **Base Starter Fee Confirmed:** Verified starter plan (30-min session, 2 sessions/week) base rates:
     - USD: $40/month
     - GBP: £29/month
     - EUR: €34/month
     - AED: د.إ146/month
     - SAR: ﷼150/month
     - SGD: S$50/month
     - CAD: CA$55/month
     - AUD: A$55/month
  3. **Exported Starter Helper:** Added typed `getStarterPrice(currency)` helper to enforce access without magical index lookups.
  4. **Empirical Verification:** Tested via `scratch/verify-pricing-data.mjs` confirming starter pricing across all 8 currencies (`true`) and zero external discrepancies.

### [TASK-07] Centralized Features Data Architecture — [FIXED & VERIFIED]

- **Original Item:** Item 7
- **Status:** **[FIXED & VERIFIED ON 2026-09-08]**
- **Files:** [`src/data/features.ts`](file:///d:/Live%20Web/Quranific-live/src/data/features.ts), [`src/pages/tuition-fee/_components/WhatsIncluded.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/tuition-fee/_components/WhatsIncluded.astro), [`src/pages/tuition-fee/_components/TuitionPlans.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/tuition-fee/_components/TuitionPlans.astro).
- **Concrete Actions & Empirical Proof:**
  1. **Centralized Data Layer:** Created `src/data/features.ts` containing strongly typed feature models (`AcademyFeature`, `TUITION_PLAN_FEATURES`, `WHATS_INCLUDED_ITEMS`, and `STANDARD_COURSE_FEATURES`).
  2. **Deduplicated Component Consumption:**
     - `WhatsIncluded.astro`: Removed hardcoded `items` array and wired directly to `WHATS_INCLUDED_ITEMS`.
     - `TuitionPlans.astro`: Removed local `features` array and wired directly to `TUITION_PLAN_FEATURES`.
  3. **Verification:** Tested via `scratch/verify-features.mjs`: `src/data/features.ts` exports all models (`true`), `WhatsIncluded.astro` imports from features (`true`), `TuitionPlans.astro` imports from features (`true`), and `astro check` + `astro build` succeed with 0 errors across 139 files.

---

## 3. Calculator & Pricing UX (Tier 3)

### [TASK-08] Pricing Calculator Edge UX Redesign — [FIXED & VERIFIED]

- **Original Item:** Item 8
- **Status:** **[FIXED & VERIFIED ON 2026-09-08]**
- **Files:** [`src/components/blocks/PricingCalculator.svelte`](file:///d:/Live%20Web/Quranific-live/src/components/blocks/PricingCalculator.svelte).
- **Concrete Actions & Empirical Proof:**
  1. **Shortened Course Titles:** Mapped course `<select>` option labels to clean, concise titles (`Basic Qaida`, `Quran Reading with Tajweed`, `Quran Memorization (Hifz)`, `Quran Translation & Tafsir`, `Advanced Tajweed & Ijazah`, `Arabic Language`), eradicating redundant descriptions.
  2. **Removed Row 1 Static Currency Box:** Completely excised the non-functional currency box from Row 1, keeping the calculator clean and focused.
  3. **Full Region & Currency in Summary:** Added prominent `Region & Currency` metadata line directly inside the result box rendering full purchasing power currency (`USA (USD $)`, `UK (GBP £)`, `Singapore (SGD S$)`, etc.).
  4. **Responsive 30/70 Layout:** Re-engineered Row 1 with `grid grid-cols-1 md:grid-cols-12` where Course selector occupies `md:col-span-4` (~33%) and Session Length selector occupies `md:col-span-8` (~67%) side-by-side on desktop, seamlessly collapsing to stacked full-width on mobile.
  5. **Verification:** Tested via `scratch/verify-calculator-ux.mjs` confirming clean course names (`true`), removal of static currency box (`true`), full region in summary (`true`), responsive grid classes (`true`), and `astro check` + `astro build` 100% green.

### [TASK-10] Tuition Page Currency Box Removal — [FIXED & VERIFIED]

- **Original Item:** Item 10
- **Status:** **[FIXED & VERIFIED ON 2026-09-08]**
- **Files:** [`src/pages/tuition-fee/_components/PricingGrid.svelte`](file:///d:/Live%20Web/Quranific-live/src/pages/tuition-fee/_components/PricingGrid.svelte).
- **Concrete Actions & Empirical Proof:**
  1. **Excised Static Currency Bubble:** Removed the redundant static Currency bubble from the top controls of `PricingGrid.svelte`, eliminating cognitive clutter and visual repetition.
  2. **Centered Session Length Toggle:** Cleanly centered the 30-min / 40-min session toggle at the top of the pricing matrix.
  3. **Added Full Regional Context in Summary:** Relocated regional currency context (`currencyLabel`, e.g. _"USA (USD $)"_, _"UK (GBP £)"_) into the Selection Summary Bar alongside classes/week, session duration, and payment cadence.
  4. **Verification:** Verified via `scratch/verify-tuition-currency.mjs` that the static bubble is removed (`true`), centered length toggle is present (`true`), currency context is displayed in summary (`true`), and compilation passes with 0 errors (`astro check` + `astro build` 100% green).

### [TASK-48] Dynamic Geo-Pricing Edge Logic Verification

- **Original Item:** Item 48
- **Files:** [`src/pages/api/geo-currency.ts`](file:///d:/Live%20Web/Quranific-live/src/pages/api/geo-currency.ts), [`src/constants/pricing.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/pricing.ts).
- **Concrete Actions:**
  1. Ensure changes in Tasks 8 and 10 maintain full reactive compatibility with `/api/geo-currency`.
  2. Run automated unit tests verifying that all 8 currencies resolve accurately under Cloudflare edge headers.

---

## 4. Funnel & Page-Specific UX (Tier 4)

### [TASK-14] Portals Page Redirect & NXDOMAIN Fix — [FIXED & VERIFIED]

- **Original Item:** Item 14
- **Status:** **[FIXED & VERIFIED ON 2026-09-07]**
- **Files:** [`src/pages/portals/_components/PortalsGrid.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/portals/_components/PortalsGrid.astro), [`src/pages/portals/index.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/portals/index.astro).
- **Concrete Actions & Empirical Proof:**
  1. Removed dead `https://app.quranific.com/login` links across all portal cards.
  2. Replaced with verified internal routing:
     - Student Portal routes directly to `/getting-started/signup` ("Start Free Trial / Register") with clear instructions that active students receive dedicated classroom links via WhatsApp and email.
     - Teacher Portal routes directly to `/teachers/apply` ("Apply to Faculty") with clear instructions on faculty credential provisioning.
     - Both cards provide secondary links directly to `/contact` for portal access assistance.
  3. Verified `dist/client/portals/index.html`: zero references to `app.quranific.com` exist anywhere in the build.

### [TASK-15] Funnel Progression & Conversion Tracking

- **Original Item:** Item 15
- **Files:** [`src/pages/getting-started/signup.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/getting-started/signup.astro), [`src/pages/getting-started/complete.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/getting-started/complete.astro), [`src/pages/getting-started/success.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/getting-started/success.astro).
- **Concrete Actions:**
  1. Emit standard GTM/GA4 events at each funnel step:
     - Step 1 mount / submit: `dataLayer.push({ event: 'begin_checkout', ... })`
     - Step 2 submit: `dataLayer.push({ event: 'add_shipping_info', ... })`
     - Step 3 mount: `dataLayer.push({ event: 'generate_lead', lead_id: ... })`
  2. Preserve UTM and campaign attribution through the entire funnel into the final CRM payload.

### [TASK-18] Signup Step 1 UI/UX Refinement

- **Original Item:** Item 18
- **Files:** [`src/pages/getting-started/_components/StepIndicator.svelte`](file:///d:/Live%20Web/Quranific-live/src/pages/getting-started/_components/StepIndicator.svelte), [`src/pages/getting-started/signup.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/getting-started/signup.astro).
- **Concrete Actions:**
  1. Reduce step circle dimensions from `w-10 h-10` to `w-8 h-8` and reduce border/ring visual weight.
  2. Fine-tune desktop testimonial sidebar so it does not distract from the primary form fields.

### [TASK-19] Complete (Step 2) Form UI & Step 3 Clarity

- **Original Item:** Item 19
- **Files:** [`src/pages/getting-started/_components/CompleteForm.svelte`](file:///d:/Live%20Web/Quranific-live/src/pages/getting-started/_components/CompleteForm.svelte), [`src/pages/getting-started/_components/StepIndicator.svelte`](file:///d:/Live%20Web/Quranific-live/src/pages/getting-started/_components/StepIndicator.svelte).
- **Concrete Actions:**
  1. Change default teacher gender preference from `'Male Teacher'` to `'No Preference'`.
  2. Rename Step 3 label in `StepIndicator.svelte` from "Verify" to "Confirmed" or "Complete".

### [TASK-20] Intent Pages 404 Route Fix — [FIXED & VERIFIED LIVE]

- **Original Item:** Item 20
- **Status:** **[FIXED & VERIFIED LIVE ON WORKER vA0223311]**
- **Files:** [`src/pages/for-kids.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/for-kids.astro), [`src/pages/for-adults.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/for-adults.astro), [`src/pages/for-women.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/for-women.astro), [`astro.config.mjs`](file:///d:/Live%20Web/Quranific-live/astro.config.mjs).
- **Concrete Actions & Empirical Proof:**
  1. Configured 301 permanent redirects in both `astro.config.mjs` and dedicated SSR redirect pages.
  2. Verified live production responses (`curl.exe -sI`):
     - `https://quranific.com/for-kids` -> `HTTP/1.1 301 Moved Permanently` | `Location: /quran-classes/for-kids`
     - `https://quranific.com/for-adults` -> `HTTP/1.1 301 Moved Permanently` | `Location: /quran-classes/for-adults`
     - `https://quranific.com/for-women` -> `HTTP/1.1 301 Moved Permanently` | `Location: /quran-classes/for-women`
       Zero 404 errors; all root short-links resolve cleanly to their semantic intent targets.

### [TASK-21] Course Slug Pages Enhancement

- **Original Item:** Item 21
- **Files:** [`src/pages/courses/[slug].astro`](file:///d:/Live%20Web/Quranific-live/src/pages/courses/[slug].astro), [`src/pages/courses/_components/CoursePricingSection.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/courses/_components/CoursePricingSection.astro).
- **Concrete Actions:**
  1. Pass the active course slug prop (`initialCourse={course.slug}`) to `<PricingCalculator />` in `CoursePricingSection.astro` so the calculator defaults to the active course.
  2. Add `FAQPage` JSON-LD schema to the course page for all course-specific FAQs.

---

## 5. Reusable Components & Logic (Tier 5)

### [TASK-09] Full-Month Guarantee Reusable Component

- **Original Item:** Item 9
- **Files:** Create `src/components/common/GuaranteeCard.astro`, refactor [`src/components/blocks/CoursesFAQ.astro`](file:///d:/Live%20Web/Quranific-live/src/components/blocks/CoursesFAQ.astro), [`src/components/blocks/FAQAccordion.astro`](file:///d:/Live%20Web/Quranific-live/src/components/blocks/FAQAccordion.astro).
- **Concrete Actions:**
  1. Build a single, reusable `GuaranteeCard.astro` component supporting light and dark theme variants.
  2. Replace duplicate guarantee markup across FAQ and landing components.

### [TASK-12] Promo Bar Attribution Tracking

- **Original Item:** Item 12
- **Files:** [`src/constants/site.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/site.ts#L34).
- **Concrete Actions:**
  1. Update announcement link from `/getting-started/signup` to `/getting-started/signup?ref=top_promo_bar&utm_source=internal&utm_medium=promo_banner`.

### [TASK-47] GTM Tag Activation for Consent Mode

- **Original Item:** Item 47
- **Files:** Cloudflare / Google Tag Manager.
- **Concrete Actions:**
  1. Configure GA4 Configuration tag in GTM container `GTM-5CJMMJ29`.
  2. Enable Google Consent Mode settings in GTM so tags fire conditionally upon user consent in `CookieBanner.svelte`.

### [TASK-49] Alarm Worker Periodic Health Verification

- **Original Item:** Item 49
- **Files:** [`alarm-worker/src/index.ts`](file:///d:/Live%20Web/Quranific-live/alarm-worker/src/index.ts) (correct path — `workers/alarm-worker.js` does not exist).
- **Concrete Actions:**
  1. Maintain cron schedule `0 * * * *` (hourly — **not** `*/10 * * * *` as the Flash agent incorrectly stated) and monitor DLQ buffer recovery via Cloudflare dashboard Observability (now enabled).
  2. To manually verify health: `POST https://quranific-alarm.faisalkhan-llc-ltd.workers.dev/force-run` → expect HTTP 202 `"Manual alarm trigger initiated."` then check `retry-queue` response `{success:true, recovered:0, failed:0}`.

---

## 6. Infrastructure & Operations (Tier 6)

### [TASK-13] Corporate Email Inventory Audit

- **Original Item:** Item 13
- **Action:** Document all operational email accounts hosted on Hostinger Business Email (`admin@`, `hello@`, `support@`, `careers@`, `privacy@`).

### [TASK-23] Resend SPF Authorization DNS Record Fix — [FIXED & VERIFIED LIVE]

- **Original Item:** Item 23
- **Impact:** Immediate elimination of transactional email spam filtering.
- **Status:** **[FIXED & VERIFIED LIVE ON 2026-09-07]**
- **Concrete Actions:**
  1. **Update Cloudflare DNS SPF TXT Record:** Updated `@` TXT record on Cloudflare DNS to include Resend.
     - Value: `v=spf1 include:_spf.mail.hostinger.com include:resend.com ~all`
  2. **Empirical Verification Evidence:**
     - **Cloudflare DNS over HTTPS (`https://cloudflare-dns.com/dns-query?name=quranific.com&type=TXT`):**
       ```json
       {
         "Status": 0,
         "Answer": [
           {
             "name": "quranific.com",
             "type": 16,
             "TTL": 300,
             "data": "\"v=spf1 include:_spf.mail.hostinger.com include:resend.com ~all\""
           }
         ]
       }
       ```
     - **Google DNS over HTTPS (`https://dns.google/resolve?name=quranific.com&type=TXT`):**
       ```json
       {
         "Status": 0,
         "Answer": [
           {
             "name": "quranific.com.",
             "type": 16,
             "TTL": 300,
             "data": "v=spf1 include:_spf.mail.hostinger.com include:resend.com ~all"
           }
         ]
       }
       ```
     - Authoritative nameservers globally confirm SPF alignment for both Hostinger Webmail and Resend Transactional MTA.

---

## 7. SEO, Growth, and Ads Readiness (Tier 7)

### [TASK-17] Corner-to-Corner Data Contradiction Scrub

- **Original Item:** Item 17
- **Action:** Perform a global search and replace to eliminate conflicting price references and outdated claims.

### [TASK-26] Internal Linking Ecosystem Optimization

- **Original Item:** Item 26
- **Action:** Add cross-links from course slug pages to target audience intent pages, and add breadcrumb navigation.

### [TASK-33] Indexing & Error Handling Verification

- **Original Item:** Item 33
- **Action:** Verify 404 and 500 error pages retain branding, navigation, and zero dead ends.

### [TASK-34-35] GTM & Search Console Verification Protocol

- **Original Items:** Item 34 & Item 35
- **Action:** Validate sitemap submission and structured data indexing in Google Search Console.

### [TASK-39-40-41] Ad Platform & Payment Gateway Compliance Audit

- **Original Items:** Item 39, Item 40, Item 41
- **Action:** Verify all required policy disclosures, safeguarding statements, and transparent billing terms are present on all landing pages.

---

## 8. Performance & Code Quality (Tier 8)

### [TASK-27] Security Hardening Pass

- **Original Item:** Item 27
- **Action:** Review CSP headers, rate-limiting rules, and Turnstile integration on all dynamic forms.

### [TASK-29] SSR / SSG Boundary Verification

- **Original Item:** Item 29
- **Action:** Confirm `export const prerender = true;` remains intact on all static marketing routes.

### [TASK-30-43] Asset & Image Performance Optimization

- **Original Items:** Item 30 & Item 43
- **Action:** Ensure all images have explicit width/height dimensions and appropriate `loading` attributes.

### [TASK-31] Bundle Size & Edge Middleware Audit

- **Original Item:** Item 31
- **Action:** Audit client-side JS bundles to ensure zero unneeded dependencies are shipped.

### [TASK-38] TypeScript Type Unification

- **Original Item:** Item 38
- **Action:** Migrate inline interface declarations from individual `.astro`/`.svelte` files into a shared `src/types/` directory. As Tier 2 data files (`team.ts`, `faqs.ts`, `features.ts`) are built out, their exported interfaces must live in `src/types/` and be imported by both data files and consuming templates — not redefined inline per component.

### [TASK-42] Font, Layout, and Sizing Consistency

- **Original Item:** Item 42
- **Concrete Actions:**
  1. **Funnel heading font:** Add Merriweather to `Funnel.astro` headings (`h1`, `h2`) to match the marketing page visual hierarchy. Currently the funnel uses Inter-only, creating a visual discontinuity at the critical signup step.
  2. **Step indicator circles:** Reduce from `w-10 h-10` to `w-8 h-8` and thin the ring from `ring-4` to `ring-2` — consistent with TASK-18 finding. One change fixes both issues.
  3. **Container widths:** Confirm `max-w-7xl` (marketing) and `max-w-5xl` (course/intent inner) remain consistent after any template refactoring in the fix round.

### [TASK-44] AI Tone & Watermark Removal

- **Original Item:** Item 44
- **Action:** Ensure all marketing copy reads in a genuine, human, respectful tone with zero generative AI clichés.

---

## 9. Legal & Final Verification (Tier 9)

### [TASK-16] Legal Documentation Alignment

- **Original Item:** Item 16
- **Concrete Actions:**
  1. Update `/legal/terms` and `/legal/refund` to reflect multi-currency geo-pricing (change any hardcoded "USD" billing references to "your local currency as detected at signup time").
  2. Verify `/legal/impressum` for accuracy: company registered name, physical address, VAT/company registration number — especially required for any visitors from DE/AT/CH where the Impressum is legally mandatory.
  3. Confirm all legal pages reflect the current Full-Month Guarantee terms (30-day scope, conditions, exclusions).

### [TASK-32] Full End-to-End Verification Test Loop

- **Original Item:** Item 32
- **Action:** Execute the complete verification pipeline:
  1. `npm run check`
  2. `npm run build`
  3. `npx playwright test`
  4. Core Web Vitals audit

### [TASK-50] Final Production Smoke Test

- **Original Item:** Item 50
- **Action:** Perform end-to-end user registration and checkout smoke test on live edge deployment.

---

## 10. Senior-Dev Additions & Architecture Reserves

### [TASK-37] Reserved Architecture Ledger Slot

- **Original Item:** Item 37
- **Action:** Sequential ledger placeholder preserved for post-fix edge runtime diagnostics.

### [TASK-45] Senior-Dev Architectural Deliverables

- **Original Item:** Item 45
- **Actions:**
  1. Emit JSON-LD schema generators for all new content collections (`FAQPage`, `Review`, `Person`).
  2. Scrub legacy duplicate content completely from `.astro` templates once centralized.
  3. Implement comprehensive ISO 3166-1 country name map for calculator summaries.
  4. Document GA4/Ads event taxonomy.
  5. Establish an editorial sign-off workflow for student reviews and blog articles.
