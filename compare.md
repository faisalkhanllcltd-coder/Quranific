# Phase 1 Codebase vs Requirements Audit

### Item 1: FAQ Data in TS

- **The Requirement:** "FAQ data in TS. Must specify QA for all specific pages (fee page, main courses, slug courses, kids, adults, women). Main FAQ page must cover all of them + extra suitable QA. Fix filter logic on main FAQ. Must be zero duplicates, 100% correct, highly optimized for SEO and AI crawlers."
- **Current Codebase Reality:** Located in `src/data/faqs.ts`, `src/constants/courses.ts`, `src/pages/faq/index.astro`, and `src/pages/faq/_components/FaqTabs.astro`. Currently `src/data/faqs.ts` exports `FAQ` type and categorized arrays (`landingKids`, `landingAdults`, `landingWomen`, `home`, `pricing`, `courses`, `safeguarding`, `technical`, `general`), but leaves `teachers`, `contact`, and `legal` as completely empty arrays `[]`. Furthermore, all 6 individual courses in `src/constants/courses.ts` define `courseFaqs?: { question: string; answer: string }[]` in the TypeScript interface, but not a single course has `courseFaqs` populated, forcing `src/pages/courses/[slug].astro` to fall back to the generic `CoursesFAQ.astro`. In `FaqTabs.astro`, the tabs list hardcoded categories (`home`, `pricing`, `courses`, `teachers`, `safeguarding`, `technical`, `general`) where clicking `teachers` renders an empty accordion, and intent FAQs (`kids`, `adults`, `women`) and course-specific FAQs are completely omitted from the main FAQ page.
- **The Comparison:** The existing implementation fails the owner's specifications on multiple fronts. First, duplicate answers exist across intent sets (e.g., verbatim identical "From $40/month" and beginner answers in `landingAdults` and `landingWomen`). Second, slug courses have zero specific FAQs in data structures. Third, the main FAQ page does not aggregate all FAQs from specific subpages (intent pages and slug courses are omitted), leaving empty categories (`teachers: []`) that degrade user trust and SEO crawl quality. Fourth, tab filtering in `FaqTabs.astro` is a rudimentary DOM-toggle script that does not support unified search, category normalization, or comprehensive coverage.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Overhaul `src/data/faqs.ts` to centralize all page-specific FAQs (including course slugs, populated teacher QA, and intent landing pages) with zero duplication, populate `courseFaqs` in `src/constants/courses.ts`, and update `src/pages/faq/_components/FaqTabs.astro` with unified category filtering that aggregates all site FAQs.

### Item 2: Testimonials Data in TS

- **The Requirement:** "Testimonials data in TS. Up to 6 total, with 3 being real user testimonials."
- **Current Codebase Reality:** Currently fractured across three competing locations with conflicting schemas: `src/constants/testimonials.ts` (contains 3 reviews: Amna, Saleem Al Mustarshid, Naseerullah Babar with fields `id`, `initials`, `name`, `locationAndRole`, `content`, `enrollmentTime`, `theme`), `src/data/testimonials.ts` (contains 3 completely different marketing reviews: Sarah A., Khalid H., Nadia M. with fields `quote`, `initials`, `avatarColor`, `name`, `details`, `enrolled`), and `src/pages/testimonials/index.astro` (hardcodes an inline `TESTIMONIALS` array of 6 reviews with fields `name`, `role`, `location`, `text`, `rating`). Different pages throughout `src/` import different files: `index.astro` and `Funnel.astro` use `src/data/testimonials.ts`, while `for-kids.astro` and `for-adults.astro` import from `src/constants/testimonials.ts`.
- **The Comparison:** Severe architectural failure and blatant data duplication. Instead of a single source of truth in TypeScript, the codebase maintains two separate `.ts` files plus an inline Astro script array, each featuring distinct schemas and conflicting personas. The requirement explicitly demands "Up to 6 total, with 3 being real user testimonials" unified in TS; neither existing file contains the complete 6-item set, and having multiple competing files violates clean code and no-duplicate architecture.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Consolidate all reviews into a single standardized TypeScript file (`src/data/testimonials.ts`), defining a unified `Testimonial` interface with exactly 6 curated entries (featuring the 3 real user testimonials), eliminate `src/constants/testimonials.ts`, and rewire all consuming components and `src/pages/testimonials/index.astro` to this single source of truth.

### Item 3 & 11: Teachers/Team Data in TS

- **The Requirement:** "Teachers/Team data in TS. _Note: Owner specified '3 team members' but listed 6:_ Faisal Khan (Owner/CEO), Imranullah (Admin), Hakeem Sadi (Head Teacher), Haseeb ul Hasan (Teacher), Fatima S (Teacher), Abdul Hanan (Teacher)."
- **Current Codebase Reality:** A centralized TypeScript data file for teachers or team members does not exist anywhere in `src/data/` or `src/constants/`. Instead, `src/pages/about/_components/AboutTeam.astro` hardcodes 4 team members directly in raw HTML markup (Faisal Khan, Ustad Imranullah, Ustadha Fatima Saif, Ustad Haseeb ul Hasan), while `src/pages/teachers/index.astro` hardcodes an inline frontmatter array `TEACHERS` containing 4 different placeholder personas (Ustadha Fatima S., Ustad Bilal A., Ustadha Aisha R., Ustad Omar T.). Key owner-specified individuals—specifically Hakeem Sadi (Head Teacher) and Abdul Hanan (Teacher)—do not exist anywhere in the codebase.
- **The Comparison:** Complete architectural omission and content discrepancy. The current codebase completely lacks a TypeScript data layer for faculty and leadership. It substitutes fictional/placeholder teacher personas (Bilal A, Aisha R, Omar T) in `src/pages/teachers/index.astro` and buries partial leadership records in static HTML inside `AboutTeam.astro`. This violates the central TypeScript data layer rule and prevents data reuse across About, Faculty, and structured schema markup.
- **Verdict & Action Plan:**
  - `[MISSING - NEEDS CREATION]`
  - **Required Code Action:** Create `src/data/team.ts` defining strict TypeScript interfaces for leadership and teaching faculty, accurately populate all 6 owner-specified members (Faisal Khan, Imranullah, Hakeem Sadi, Haseeb ul Hasan, Fatima S, Abdul Hanan), and refactor `src/pages/about/_components/AboutTeam.astro`, `src/pages/teachers/index.astro`, and `src/pages/teachers/_components/TeachersFaculty.astro` to import from this single source of truth.

### Item 4: Blog Data in TS

- **The Requirement:** "Blog data in TS. Create 1 long, unique, high-quality article about the academy. 100% humanized, highly optimized for crawlers, ready to publish. No placeholders, no images (per owner request)."
- **Current Codebase Reality:** Located in `src/content.config.ts`, `src/content/blog/hello-world.md`, `src/pages/blog/index.astro`, and `src/pages/blog/[slug].astro`. The repository contains only a single dummy placeholder file (`hello-world.md`) that is marked `draft: true` with placeholder content ("Our first placeholder post... Once we build templates..."). Because `draft: true` is set, `getCollection('blog')` returns an empty array, forcing the live `/blog` route to show an empty state banner ("Publishing Soon"). Additionally, `src/pages/blog/index.astro` and `[slug].astro` still demand and render image placeholder markup, directly contradicting the owner requirement.
- **The Comparison:** 100% missing production content. The blog feature currently functions as an empty shell with placeholder scaffolding. There is zero humanized, crawler-optimized long-form content explaining the academy's philosophy, pedagogy, or methodology. The collection schema and templates are not aligned with the owner's explicit rule of text-only (no images) publication.
- **Verdict & Action Plan:**
  - `[MISSING - NEEDS CREATION]`
  - **Required Code Action:** Create a comprehensive, humanized, production-ready long-form article in `src/content/blog/` (marked `draft: false` with no mandatory image requirements) and update `src/pages/blog/index.astro` and `src/pages/blog/[slug].astro` to render high-quality, image-free editorial layouts ready for indexing.

### Item 5, 6, 7: Courses, Fees, and Features Data in TS

- **The Requirement:** "Courses, Fees, and Features data in TS. Organized, zero duplicates. Features must be specified per page for exact importing."
- **Current Codebase Reality:** Courses exist in `src/constants/courses.ts` and Fees/Pricing in `src/constants/pricing.ts`. However, a centralized TypeScript data file for Features does not exist anywhere in `src/`. Instead, features, value guarantees, and trust highlights are hardcoded as local inline arrays inside individual Astro components: `src/pages/tuition-fee/_components/TuitionPlans.astro` (hardcodes `const features = [...]`), `src/pages/tuition-fee/_components/WhatsIncluded.astro` (hardcodes `const items = [...]`), `src/pages/[intent]/for-kids.astro` (hardcodes `vettingSteps`, `trustPoints`, `onboardingSteps`), with identical duplicates in `for-adults.astro`, `for-women.astro`, and `QuranificDifference.astro`. Furthermore, in `src/constants/courses.ts`, `price: 'From $40/mo'` is hardcoded as an isolated string literal disconnected from the structured geo-pricing engine in `src/constants/pricing.ts`.
- **The Comparison:** Severe data duplication and lack of modularity. While fee tables and course descriptions are organized in TypeScript, features are totally unmanaged, fragmented, and duplicated across at least six distinct templates. There is zero ability to perform exact per-page imports of standardized feature lists. Changes to a core value proposition or guarantee require hunting down and manually editing half a dozen `.astro` template files, directly violating the no-duplicate architecture requirement.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Create `src/data/features.ts` defining strict TypeScript interfaces and exporting dedicated per-page feature sets (for Home, Tuition Fee, Kids, Adults, Women, and Courses), link `src/constants/courses.ts` base prices directly to `src/constants/pricing.ts`, and eliminate all hardcoded feature arrays from individual Astro components.

### Item 13: Inventory of Professional Emails

- **The Requirement:** "Inventory of professional emails (admin/ecosystem) mapped to where they are used."
- **Current Codebase Reality:** Email addresses are fragmented across multiple disparate locations without a unified inventory. `src/constants/site.ts` defines `SITE.email` (`admin@quranific.com`) and `SITE.emails` (`support: hello@quranific.com`, `careers@quranific.com`, `partners@quranific.com`, `privacy@quranific.com`). Meanwhile, `src/lib/email.ts` hardcodes transactional sender emails (`onboarding@quranific.com`, `support@quranific.com`, `newsletter@quranific.com`). Legal pages hardcode unmapped mailto addresses directly into templates: `src/pages/legal/terms.astro` and `refund.astro` hardcode `mailto:support@quranific.com`, `privacy.astro`, `cookies.astro`, and `safeguarding/index.astro` hardcode `mailto:compliance@quranific.com` (an address entirely missing from `site.ts`), and `impressum.astro` hardcodes `mailto:contact@quranific.com`.
- **The Comparison:** Inconsistent, unmanaged email routing that invites broken communication channels. `site.ts` points support to `hello@quranific.com`, while legal templates and transactional email headers point to `support@quranific.com`. Multiple addresses (`compliance@`, `contact@`) are hardcoded as raw strings without type checking or centralized registration. There is no TypeScript structure mapping each email address to its operational role, sending permissions, and consuming components.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Create `src/constants/emails.ts` (or expand `src/constants/site.ts`) with a strictly typed `EMAIL_INVENTORY` documenting and exporting all operational addresses (`admin@`, `support@`, `compliance@`, `onboarding@`, `newsletter@`, `careers@`, `contact@`) mapped directly to their system and template usage, and refactor all legal templates and `src/lib/email.ts` to consume this single inventory.

### Item 44: Deep Content Sweep to Remove "AI-Sounding" Text and AI Watermarks

- **The Requirement:** "Deep content sweep to remove all 'AI-sounding' text and AI watermarks."
- **Current Codebase Reality:** Traces of AI generation and synthetic formulas linger in several components and data files: fabricated student testimonials in `src/data/testimonials.ts` and `src/pages/testimonials/index.astro` using stereotypical synthetic personas ("Dr. Ahmed R., Verified Adult Learner... As a busy physician, my schedule is chaotic..."), exaggerated marketing bios in `src/pages/teachers/index.astro` ("memorize with unbreakable retention", "curate a global faculty of certified scholars"), placeholder announcements in `src/content/blog/hello-world.md`, and hyper-promotional developer comments/eyebrows ("110% SEO", "Elite Edge SEO", "Dynamic Article SEO Schema: Fortified for Google Discover integration", "Edge-Pro 4-Column Features Grid").
- **The Comparison:** While baseline philosophical and pedagogical copy in `src/pages/about/` has genuine human depth, auxiliary marketing copy and placeholder data heavily exhibit formulaic AI tropes. Fabricated parent personas and dramatic backstories in testimonials feel synthetic rather than organic. Developer comments boasting about "110% SEO" and "Elite Edge" reflect artificial scaffolding rather than clean, professional production-grade code.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Conduct a comprehensive copy cleansing across `src/data/testimonials.ts`, `src/pages/teachers/`, `src/content/blog/`, and code comments to strip out synthetic tropes, fabricated student backstories, and artificial hyper-marketing jargon in favor of authentic, human-written phrasing.

## Phase 2 Codebase vs Requirements Audit

### Item 36, 42: Brand Consistency (Fonts, Layouts, Containers, Size Consistency)

- **The Requirement:** "brand consistency. (most wanted). fonts, layouts, containers, size consistency."
- **Current Codebase Reality:** Fonts are centralized in `src/styles/fonts.css` and `src/styles/global.css` under Tailwind v4 `@theme` (`--font-sans`, `--font-serif`, `--font-arabic`). However, layout containers and sizing primitives suffer from widespread fragmentation: `@utility quranific-container` is defined in `src/styles/global.css` (line 61: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12`) but is only adopted in legal pages and landing blocks, while major routes like `src/pages/index.astro`, `src/pages/courses/index.astro`, `src/pages/teachers/index.astro`, and `src/pages/about/index.astro` bypass the design token and hardcode inconsistent inline padding/width rules (`max-w-7xl mx-auto px-4 sm:px-6` vs `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`). Button styling is similarly bifurcated between `src/components/ui/Button.astro` and raw custom utility strings across navigation and hero headers.
- **The Comparison:** While foundational typography tokens exist, visual execution across pages lacks strict container and sizing discipline. Headings vary arbitrarily from `font-black tracking-tighter` to `font-semibold` across different section headers, and section padding fluctuates between `py-10`, `py-16`, and `py-32` instead of adhering to the standardized `@utility quranific-section` (`py-16 sm:py-20 lg:py-24`).
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Standardize all page templates and section wrappers across `src/pages/` to strictly utilize `@utility quranific-container` and `@utility quranific-section`, and enforce unified heading typography and `<Button />` component primitives throughout the app.

### Item 9: Full-Month Guarantee Component for Reuse

- **The Requirement:** "Full-Month Guarantee component for reuse"
- **Current Codebase Reality:** A dedicated, reusable Guarantee component does not exist in `src/components/blocks/` or `src/components/ui/`. Instead, identical guarantee card HTML markup is duplicated verbatim across `src/components/blocks/FAQAccordion.astro` (lines 47–68) and `src/components/blocks/CoursesFAQ.astro` (lines 39–65). Additionally, a full-section guarantee layout exists in `src/pages/[intent]/_components/LandingGuarantee.astro`, isolated within the intent directory rather than exported for sitewide reuse on pages like `/tuition-fee` or `/courses`.
- **The Comparison:** Direct violation of DRY architecture. Duplicating the guarantee card markup across FAQ accordions creates maintenance debt and risks copy drift. The platform lacks a standardized guarantee primitive that can be dropped into any page layout as either a card or full section.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Create a reusable `GuaranteeCard.astro` in `src/components/blocks/` (and promote `LandingGuarantee.astro` to a shared `GuaranteeSection.astro`), refactoring `FAQAccordion.astro` and `CoursesFAQ.astro` to consume the unified component.

### Item 12: Promo Bar Logic, Tracking, Show/Hide Logic

- **The Requirement:** "promo bar logic, tracking, show hide logic."
- **Current Codebase Reality:** Implemented directly within `src/components/global/Header.astro` (lines 9–67, 130–158) using configuration from `src/constants/site.ts`. Dismissal state is saved to `sessionStorage` under key `quranific_promo_dismissed`. However, there is zero analytics tracking: neither impression, link clicks, nor dismissal triggers any GTM/GA `dataLayer.push` event. Furthermore, show/hide logic is purely a global boolean (`SITE.announcement.enabled`), with no route-based suppression to prevent the promo bar from distracting users during critical funnel stages (e.g., `/getting-started/signup`).
- **The Comparison:** The promo bar possesses basic CSS/JS toggle mechanics but completely lacks marketing intelligence and conversion hygiene. Missing `dataLayer` events prevent marketing attribution on promotion engagement and dismissal. Showing the promo bar on signup/funnel pages leaks users out of the checkout pipeline.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Enhance `src/components/global/Header.astro` to add `dataLayer.push` tracking for promo impressions, clicks, and dismissals, and implement route-based suppression to automatically hide the promo bar on `/getting-started/*` and signup routes.

### Item 37: WhatsApp and Social Media Deep-Linking Logic

- **The Requirement:** "WhatsApp logic, and other all media logic"
- **Current Codebase Reality:** Social channels are centralized in `SITE.social` in `src/constants/site.ts` and consumed in `src/components/global/Footer.astro`. A `generateWhatsAppLink()` helper exists in `src/lib/helpers.ts` (line 38) that accepts a prefilled message and optional custom number, falling back to `SITE.whatsappNumber || '1234567890'`. However, intent landing pages (`src/pages/[intent]/for-kids.astro:171,296`, `for-adults.astro:175,302`, `for-women.astro:180,318`) **never call `generateWhatsAppLink()` at all**. They hardcode raw `https://wa.me/447477382348` URLs with intent-specific text directly in `StickyMobileCTA` and section CTAs — completely bypassing the centralized helper and the `SITE.whatsappNumber` constant entirely. Additionally, `for-women.astro:180` hardcodes the rogue number in a _second_ non-sticky CTA section, meaning the UK number appears **twice** on the women's page.
- **The Comparison:** The fundamental architectural failure is not the `'1234567890'` fallback in `helpers.ts` — that fallback is **never reached** by intent pages because they bypass the function entirely. The true bug is that the intent pages use raw hardcoded `wa.me/447477382348` strings, making `generateWhatsAppLink()` a dead utility for the highest-traffic ad landing pages on the site. A visitor clicking any WhatsApp CTA on `/quran-classes/for-kids`, `/for-adults`, or `/for-women` is routed to an unverified private UK mobile number instead of the canonical `SITE.whatsappNumber` (`923112112122`), fragmenting lead intake across different countries and numbers.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Refactor all three intent pages to replace hardcoded `wa.me/447477382348` hrefs with calls to `generateWhatsAppLink()` using `SITE.whatsappNumber` and intent-appropriate prefilled messages. Confirm `SITE.whatsappNumber` is the single canonical business WhatsApp number across all pages, components, and legal templates.

### Item 52: Mobile Menu Toggle Bug and Edge Styling

- **The Requirement:** "the toggle in mobile i think there is bug, its like flash when close or open, its not have edge styling when open or close, so add as well"
- **Current Codebase Reality:** Located in `src/components/global/MobileMenu.astro`. Lines 26–36 define `#mobile-menu-overlay` and `#mobile-menu-drawer`. Lines 122–125 execute a runtime DOM mutation (`document.body.appendChild(overlay)`). In lines 149–159, opening forces a synchronous reflow (`void drawer!.offsetWidth;`) alongside an abrupt toggle of `backdrop-blur-sm` and `invisible`, causing paint flashes and frame drops on mobile WebKit browsers. The toggle button (`#mobile-menu-toggle`, lines 8–23) is a static SVG icon without edge state styling, smooth morphing, or active press feedback.
- **The Comparison:** The owner correctly identified the visual bug. Forcing synchronous layout reflow (`void drawer!.offsetWidth`) on mobile hardware induces frame stutter, while transitioning `backdrop-blur-sm` concurrently with opacity creates a visible white/grey flash on mobile GPUs during both opening and closing sequences. The mobile drawer lacks modern edge styling (e.g. spring transitions, backdrop containment, and morphing hamburger-to-close icon mechanics).
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Refactor `src/components/global/MobileMenu.astro` to eliminate synchronous reflow flashes by removing `void drawer!.offsetWidth`, optimize backdrop blur compositing to prevent GPU paint flickering, and add smooth edge-styled opening/closing transitions and interactive hamburger toggle states.

## Phase 3 Codebase vs Requirements Audit

### Item 8 & 48: Deep Calculator UX, Layout Split & Edge Logic Audit

- **The Requirement:** "calculator deep audit, 100% correct, edge logic, courses box have now long text like quran memorization: etc... plz we not need to mention that long text in small box, we need title of course , currency box we remove that box because we no longer need to drop down, we will put that dynamic currency sign, in summary not just $ but with full country name Like USA, Singapore, SAR in the summary box, and audit deeply summary box as well for ui ux, and also we will make courses box down with Session length in desktop mode, and keep alone in mobile mode, so courses box have for example 30% space first, and then Session length will like 70% in one line side by side in desktop mode just not in mobile, in mobile courses will alone with full width edge to edge, so we will have best hight for calculator on the edge. dynamic pricing logic 100% correct, as edge ecosystem."
- **Current Codebase Reality:** Located in `src/components/blocks/PricingCalculator.svelte`. Currently, lines 137–139 iterate over `COURSE_LIST` rendering `course.title` (long titles with extensive sub-descriptions) rather than `course.shortTitle` inside the dropdown. Lines 145–156 render a standalone, redundant 50% width Currency display box right next to the Course dropdown. In lines 127–157, Course and Currency sit 50/50 on all screen viewports, while Session Length is relegated to a separate full-width row below (lines 171–192), directly violating the required desktop 30% Course / 70% Session Length inline layout and mobile full-width stacking. In the summary card (lines 235–267), the detected country name is completely missing, displaying only the bare currency symbol and amount.
- **The Comparison:** The current calculator fails all primary structural specifications of Item 8 & 48. Retaining the non-interactive currency container wastes 50% of the top row, forcing the calculator to expand vertically and harm conversion ergonomics. It ignores `course.shortTitle`, clutters the UI with bloated course descriptions, lacks the responsive 30/70 inline desktop composition, and fails to give international visitors transparency by omitting the resolved country name in the calculation summary.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Refactor `src/components/blocks/PricingCalculator.svelte` to bind options to `course.shortTitle`, eliminate the currency input container, re-architect the layout into a 30% Course / 70% Session Length inline grid on desktop (and 100% edge-to-edge on mobile), and display the full resolved country name inside the calculation summary card.

### Item 10: Fee Page Currency Box Removal & Dynamic Summary Context

- **The Requirement:** "fee page currency box as well removal and putting text in summary on the edge."
- **Current Codebase Reality:** Located in `src/pages/tuition-fee/_components/PricingGrid.svelte`. Lines 83–96 explicitly render a standalone container labeled "Currency Bubble" alongside the interactive session length toggle:
  ```svelte
  <!-- Currency Bubble (Geo-detected, fixed — no selector/dropdown) -->
  <div
    class="flex flex-row items-center justify-between gap-4 bg-white border border-emerald-100 rounded-xl px-4 sm:px-5 h-14 shadow-sm w-full sm:w-auto"
  >
    <span class="eyebrow-pill text-emerald-900/50 shrink-0">Currency:</span>
    <span
      dir="ltr"
      class="w-full sm:w-auto text-center sm:text-left bg-transparent text-sm font-bold text-emerald-900/80 pr-2 select-none cursor-default inline-flex items-baseline justify-center sm:justify-start gap-1"
      title="Detected regional currency"
    >
      <bdi>{currency}</bdi>
      <bdi>{sym}</bdi>
    </span>
  </div>
  ```
  Meanwhile, in the Selection Summary Bar (lines 298–348), the card only displays `{selectedPlan} classes / week • {dur} mins / class • {cadenceLabel}` and `{sym}{getDisplayedMonthly(selectedPlan)}/mo`. It completely lacks the dynamic currency/country context text on the edge.
- **The Comparison:** The fee page retains a redundant, non-interactive "Currency Bubble" box that mimics an interactive control next to the session duration pill, confusing visitors who try to click or change it. Removing this box cleans up the top control plane, while placing contextual currency/geo-location text (e.g. "Billed in USD ($) • United States") directly into the bottom summary bar gives users transparent edge billing context right before they click "Continue to Registration".
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Remove the standalone currency bubble container (lines 83–96) in `src/pages/tuition-fee/_components/PricingGrid.svelte`, center/align the session length controls, and embed dynamic geo-detected currency and country text into the bottom Selection Summary bar.

### Item 14: Portals Routing and Edge Auth/Signup Redirection Logic

- **The Requirement:** "portals page api or something edge logic, if they teacher or student have no account already they will redirect to sign up each one to their own sign up page , just like standard and professional ."
- **Current Codebase Reality:** Located in `src/pages/portals/index.astro` and `src/pages/portals/_components/PortalsGrid.astro`. The page is statically prerendered (`export const prerender = true;`). Lines 8–27 define hardcoded cards for Student and Teacher. Both buttons link generically to `https://app.quranific.com/login` with no role parameters (`?role=student` / `?role=teacher`) or redirect callbacks. There is zero edge session checking in `src/middleware.ts`, no auth state detection API in `src/pages/api/`, and no intelligent routing for users without accounts beyond tiny bottom text links (`/getting-started/signup` and `/teachers/apply`).
- **The Comparison:** The current implementation is a completely passive marketing card hub with no edge intelligence. Standard professional portal architecture requires role-aware dispatching (e.g. passing role and redirect parameters to the authentication provider) and clear first-time onboarding routing so students without accounts land seamlessly on `/getting-started/signup` and prospective teachers land on `/teachers/apply` with prominent, unambiguous callouts instead of being dumped into a generic login screen that fails to route them.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Enhance `src/pages/portals/_components/PortalsGrid.astro` and portal routing to pass explicit role contexts to `app.quranific.com/login` and build prominent first-time onboarding action blocks directing new students to `/getting-started/signup` and teachers to `/teachers/apply`.

### Item 15: Funnel [Getting Started] User Journey & Step Analytics Tracking

- **The Requirement:** "the funnel [getting started] must track user journey. as already tracking somehow."
- **Current Codebase Reality:** Located across `src/pages/getting-started/` (`signup.astro`, `complete.astro`, `success.astro`, `SignupForm.svelte`, `CompleteForm.svelte`, and `src/pages/api/register.ts`). While ad attribution parameters (`fbclid`, `gclid`, `ttclid`, `utm_*`) and pricing context are extracted into `sessionStorage` and sent to the server in `/api/register`, there is **zero** client-side analytics funnel tracking. Neither `SignupForm.svelte`, `CompleteForm.svelte`, nor `success.astro` pushes standard e-commerce or lead progression events (`dataLayer.push` / GA4 / Meta) at any stage of the user journey.
- **The Comparison:** The owner noted that tracking exists "somehow" (referring to `sessionStorage` parameter passing and email payload forwarding), but true user journey tracking is absent. Because the client pushes no step events, marketing teams and analytics dashboards cannot measure step-by-step drop-offs between Step 1 (contact information), Step 2 (customization), and Step 3 (success). Furthermore, transitioning from Step 1 to Step 2 via `window.location.href = '/getting-started/complete'` strips URL query strings, severing client-side attribution continuity.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Implement unified client-side journey tracking across the funnel by dispatching structured `dataLayer.push` events (`funnel_step_view`, `funnel_step_complete`, `conversion`) with step numbers, course IDs, and UTM parameters in `SignupForm.svelte`, `CompleteForm.svelte`, and `success.astro`.

### Item 18: Signup Page UI/UX, Slim Step Circles & Testimonial Placement

- **The Requirement:** "sign up page ui ux, and steps rounded cercal optimize for less size borders, and lines,,, and testimonials on the left side in sign up page, good or not? steps ui ux."
- **Current Codebase Reality:** Located in `src/pages/getting-started/_components/StepIndicator.svelte`, `src/pages/getting-started/_components/SignupForm.svelte`, and `src/layouts/Funnel.astro`. In `StepIndicator.svelte`:
  - Step circles are oversized at `w-10 h-10` (40px), inflating to `scale-110` (44px) with `border-2 ring-4`.
  - The connector line is excessively thick at `h-1` (4px).
  - The step bar consumes 80px+ vertical height (`mb-8`), pushing form fields below the mobile fold.
    In `Funnel.astro`:
  - Testimonials sit inside the desktop left sidebar (`aside.lg:w-[clamp(32%,35vw,45%)]`), but are completely hidden on mobile viewports (`hidden lg:flex`).
    In `SignupForm.svelte`:
  - The Country field is a plain unpopulated text input (`type="text" placeholder="e.g. United Kingdom"`) that ignores the geo-detected country already resolved by Cloudflare edge middleware.
- **The Comparison:** The owner's aesthetic and ergonomic instincts are completely spot-on:
  1. **Step Indicator:** The 40px/44px circles and 4px connector bars look heavy and eat precious mobile screen space. Slimming them to 28px–32px with a refined 2px line (`h-[2px]`), `border-[1.5px]`, and compact `mb-4` creates a lighter, modern SaaS finish.
  2. **Testimonials Evaluation ("Good or not?"):** Placing testimonials on the left panel on desktop is optimal and should be kept—it aligns with western left-to-right eye-tracking paths and reinforces credibility before form interaction. However, completely hiding them on mobile is a major conversion defect; mobile needs a compact, high-trust social proof badge (e.g. "Rated 4.9/5 by 500+ families") embedded right near the form.
  3. **Form Ergonomics:** Forcing international users to type their country manually introduces unnecessary mobile typing friction.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Refactor `StepIndicator.svelte` to slim circles to 28px–32px, thin lines to 2px, and tighten margins; retain desktop left-side testimonials in `Funnel.astro` while introducing a compact mobile trust badge, and auto-populate the Country field from geo-detection in `SignupForm.svelte`.

### Item 19: Complete Profile UI/UX, Pre-Selection Logic & 3rd-Party Verification

- **The Requirement:** "complete ui ux, pre-selected logic, organise boxes as edge ui ux + verify 3rd setup."
- **Current Codebase Reality:** Located in `src/pages/getting-started/complete.astro`, `src/pages/getting-started/_components/CompleteForm.svelte`, and `src/pages/api/complete.ts`.
  1. **Pre-Selection Logic Defect:** In `SignupForm.svelte` (lines 96–106), incoming course query params are mapped to simplified names (e.g. `'Basic Qaida'`, `'Quran Memorization (Hifz)'`) and stored in `sessionStorage` (`q_track_course`). However, `CompleteForm.svelte` binds its radio inputs to `course.title` (e.g. `'Basic Qaida: Your Foundation for Reading the Quran'`, `'Quran Memorization: Build Hifz That Actually Lasts'`). Because these strings do not match, **pre-selection from the calculator or landing page completely fails**—the radio buttons remain unchecked, forcing users to guess and select again or trigger validation errors.
  2. **Organize Boxes UI/UX:** `CompleteForm.svelte` suffers from an unorganized layout structure. The course pills display long marketing subtitles that wrap awkwardly across multiple lines on mobile screens. Furthermore, "Session Length" is isolated in an awkward half-width container (`md:w-1/2 md:pr-4`), disrupting the visual balance against the surrounding 2-column grids.
  3. **3rd-Party Setup Verification:** `src/pages/api/complete.ts` coordinates Resend emails, Zapier CRM webhooks, Meta Conversions API (CAPI), and GA4 Measurement Protocol via `waitUntil`. While the KV dead-letter queue catches email failures, the Zapier and tracking integrations fail silently if edge environment variables (`ZAPIER_WEBHOOK_URL`, `META_PIXEL_ID`, `GA4_MEASUREMENT_ID`) are unpopulated in Cloudflare Pages.
  4. **P1 — Idempotency Race Condition (Duplicate Emails):** In `src/pages/api/complete.ts`, the idempotency key is written to KV _after_ the email dispatch is handed to `waitUntil`. If a user double-clicks "Submit" and two requests arrive within milliseconds, both pass the idempotency check before either write completes — the check reads a key that doesn't exist yet. Both requests proceed to dispatch email, resulting in duplicate confirmation and admin alert emails per registration.
  5. **P1 — Unguarded `import.meta.env` JWT Fallback in `success.astro`:** `src/pages/getting-started/success.astro:35` reads `(runtimeEnv.JWT_SECRET as string) || (import.meta.env.JWT_SECRET as string)`. The runtime binding `runtimeEnv.JWT_SECRET` is checked first (correct pattern), but the `import.meta.env.JWT_SECRET` fallback is still present. Because `import.meta.env` values are resolved at **build time** by Vite, if `JWT_SECRET` is not baked in at build time (as it should never be — it's a runtime secret), the fallback silently evaluates to `undefined`. In any deployment where only the runtime secret is configured (correct practice) and no build-time env is set, both values resolve to undefined in the same expression — the `||` chain fails and the `throw` on line 38 fires, trapping all users in a 500 error on the success page. The `import.meta.env` fallback must be removed; only `runtimeEnv.JWT_SECRET` should be used.
- **The Comparison:** The owner identified a critical conversion bug in pre-selection, but two additional P1 traps lurk in the API and success layers. The idempotency race condition means a nervous user tapping "Submit" twice sends duplicated emails to both the admin and themselves. The JWT_SECRET build/runtime mismatch is a silent 500 loop that would block all registrations from reaching the confirmation screen in a production Cloudflare environment where runtime secrets are not baked into the build.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Refactor `CompleteForm.svelte` to bind course radio options to stable identifiers (`course.slug` or normalized titles) so calculator selections hydrate seamlessly, display clean short titles (`course.shortTitle`), reorganize inputs into a unified edge-pro grid. In `complete.ts`, write the idempotency key to KV _before_ dispatching emails to eliminate the race condition. In `success.astro`, replace `import.meta.env.JWT_SECRET` with `context.locals.runtime.env.JWT_SECRET` (runtime binding) to prevent the undefined-secret 500 trap.

## Phase 4 Codebase vs Requirements Audit

### Item 16: Legal Pages Deep Audit

- **The Requirement:** "legal pages deep audit."
- **Current Codebase Reality:** Located across 5 dedicated templates in `src/pages/legal/` (`terms.astro`, `privacy.astro`, `refund.astro`, `cookies.astro`, and `impressum.astro`), all pre-rendered with Schema.org JSON-LD metadata. Substantive policy text covers GDPR, UK GDPR, CCPA, COPPA, 1-on-1 child safeguarding, the full-month satisfaction guarantee, and Eid holiday exclusions.
- **The Comparison:** While comprehensive in scope, a forensic audit reveals multiple operational and merchant compliance defects:
  1. **Divergent Email Routing:** Each legal page invents arbitrary contact emails: `impressum.astro` (line 200) uses `contact@quranific.com`, `privacy.astro` (line 287) uses `compliance@quranific.com` (an unconfigured address not present in the verified Item 13 DNS inventory), and `terms.astro` (line 292) uses `support@quranific.com`.
  2. **Hardcoded Deep-Links:** `privacy.astro` (line 301) and `terms.astro` (line 307) hardcode raw Pakistan numbers (`https://wa.me/923112112122`) rather than importing canonical constants from `src/constants/site.ts`.
  3. **Merchant Underwriting Weakness:** In `impressum.astro` (line 100), the commercial registration is listed as _"Provided upon formal request or during merchant underwriting"_. Payment gateways (Stripe, 2Checkout, Airwallex) flag ambiguous registration statements during KYC/merchant compliance reviews.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Unify all contact email addresses across `src/pages/legal/` to the canonical `support@quranific.com` and `admin@quranific.com`, route WhatsApp links through `SITE.whatsappNumber`, and formalize sole proprietorship entity identifiers in `impressum.astro` to ensure payment gateway approval.

### Item 20: [Intent] Landing Pages UI/UX, Dynamic Routing & Attribution Logic

- **The Requirement:** "[intent] ui ux, logic, deep audit corner to corner."
- **Current Codebase Reality:** Located in `src/pages/[intent]/` (`for-kids.astro`, `for-adults.astro`, `for-women.astro`) and `src/pages/[intent]/_components/`. Uses Astro's dynamic routing `getStaticPaths()` to generate 6 variations (`/quran-classes/for-kids`, `/quran-teacher/for-kids`, `/quran-classes/for-adults`, etc.) with a 90/10 headline split tailored for Google/Meta Ads audience intent.
- **The Comparison:** Corner-to-corner forensic inspection reveals critical conversion leaks, SEO indexing conflicts, and severe code duplication:
  1. **Rogue Contact Hijacking:** All 3 intent pages (`for-kids.astro:296`, `for-adults.astro:302`, `for-women.astro:318`) hardcode a private UK phone number (`https://wa.me/447477382348`) in `StickyMobileCTA`, completely bypassing the verified `SITE.whatsappNumber` (`923112112122`) and fragmenting lead intake.
  2. **SEO Canonical & Robots Contradiction:** Each template explicitly declares `robots="noindex, follow"` (line 137) while specifying a self-referential or master canonical URL (`canonical={canonicalUrl}`). Google Search Console flags this as a critical error (_"Submitted URL marked 'noindex'"_).
  3. **Direct Slug 404s:** Marketing traffic or users navigating directly to `/for-kids`, `/for-adults`, or `/for-women` receive a 404 Not Found, as no top-level redirects exist to forward them to their canonical intent routes.
  4. **Code & Data Bloat:** The 4-step `vettingSteps` array is copy-pasted verbatim across all 3 pages (~80 lines each), `for-women.astro` hardcodes a private `womenTestimonials` array rather than pulling from `src/constants/testimonials.ts`, and `LandingGuarantee.astro` reinvents the guarantee component in a private subdirectory.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Refactor `src/pages/[intent]/` to route WhatsApp CTAs through `SITE.whatsappNumber`, harmonize `noindex`/canonical SEO metadata, source testimonials from `TESTIMONIALS_DATA`, and add top-level redirects for `/for-kids`, `/for-adults`, and `/for-women`.

### Item 21: Dynamic [Slug] Routes (Courses & Blog) UI/UX, API, Data & Logic

- **The Requirement:** "[slug] ui ux, api, DATDA, logic, deep audit corner to corner."
- **Current Codebase Reality:** Located in `src/pages/courses/[slug].astro` (rendering individual course syllabi) and `src/pages/blog/[slug].astro` (rendering content collection markdown articles). Both leverage `getStaticPaths()` for static generation and attach Schema.org JSON-LD structures.
- **The Comparison:** Forensic examination across both dynamic routing pipelines exposes major UX disconnects and conversion gaps:
  1. **Course Calculator State Disconnect:** On `src/pages/courses/[slug].astro`, the embedded pricing section (`CoursePricingSection.astro:32`) renders `<PricingCalculator client:visible />` without passing the active course as a prop. A visitor browsing `/courses/quran-memorization` encounters a calculator that resets to "Basic Qaida", causing significant user confusion.
  2. **Funnel Query Disconnect:** The hero CTA generates `href="/getting-started/signup?course=${course.slug}"`, but as discovered in Item 19, Step 2 of the funnel binds to `course.title`, causing the course selection to fail to hydrate.
  3. **Schema.org Offer Incompleteness:** The Course schema in `courses/[slug].astro:51` includes an `Offer` entity that completely omits mandatory `price` and `priceCurrency` properties, generating Google Search Console structured data warnings.
  4. **Blog Article CRO Deficit:** `src/pages/blog/[slug].astro` serves markdown articles cleanly, but ends with a dead-end ghost back-button (`← Back to all articles`) with **zero conversion CTAs**, related course recommendations, or reading time indicators.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Pass `defaultCourse={course.shortTitle}` into `CoursePricingSection.astro`, fix Schema.org Course `Offer` pricing properties, and equip `src/pages/blog/[slug].astro` with contextual course recommendation CTAs and estimated reading time.

### Item 17: Forensic Corner-to-Corner Codebase Mismatches

- **The Requirement:** "mismatches corner to corner, leave no stone unturned."
- **Current Codebase Reality:** Deep forensic cross-examination of data constants, page copy, pricing files, and legal declarations uncovered systemic cross-file contradictions:
  1. **Course Pricing vs. Pricing Engine Contradiction:** `src/constants/courses.ts` claims fabricated starting prices (`From $39/mo` for Qaida, `From $49/mo` for Tajweed, `From $59/mo` for Hifz). However, `src/constants/pricing.ts` (the canonical pricing source of truth) enforces a single flat schedule where the absolute lowest price across ALL courses is **$40/mo** ($40, $50, $55, $60). Courses have no price differentiation; the card prices contradict the calculator.
  2. **Email Routing Chaos:** Five divergent addresses are in active use: `hello@quranific.com` (`src/constants/site.ts:39`), `support@quranific.com` (`terms.astro:292`), `contact@quranific.com` (`impressum.astro:200`), `compliance@quranific.com` (`privacy.astro:287`), and personal fallback `faisalkhan.llc.ltd@gmail.com` (`register.ts:111`).
  3. **Global Contact Number Schism:** Official site config specifies Pakistan `+92 311 2112122` (`site.ts`), while all three intent landing pages (`for-kids.astro`, `for-adults.astro`, `for-women.astro`) hijack traffic to a private UK mobile (`+44 7477 382348`), and `src/lib/helpers.ts:39` contains a dummy `'1234567890'` fallback.
  4. **Trial Guarantee Policy Conflict:** `src/pages/tuition-fee/_components/TuitionPlans.astro` promises _"First class always free"_ (1 single session), whereas `src/pages/legal/refund.astro:119` guarantees _"up to 3 days of free trial classes"_.
  5. **Turnstile Sitekey Fragmentation:** The sitekey string `0x4AAAAAAD-QWQWhupcuvhbK` is duplicated as raw strings across `signup.astro`, `SmartContactForm.astro`, and `TeacherStep2.svelte` rather than referencing `SITE.turnstileSiteKey`.
- **The Comparison:** These pervasive discrepancies degrade user trust, fail merchant underwriting scrutiny, confuse inbound ad prospects, and create technical debt across both client components and server endpoints.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Harmonize all course starting prices in `src/constants/courses.ts` to reflect `PRICING.USD['30']['2']` ($40/mo), synchronize the trial policy across `refund.astro` and `TuitionPlans.astro`, unify email/phone contacts to `SITE.emails` and `SITE.whatsappNumber`, and centralize `SITE.turnstileSiteKey`.

## Phase 5 Codebase vs Requirements Audit

### Item 22 & 46: Cloudflare Edge Architecture, Workers Assets & Best Practices

- **The Requirement:** "cloudeflare edge setup completely, cloudeflare all best practices. (most wanted). workers and pages logic with best practices"
- **Current Codebase Reality:** Configured via `astro.config.mjs`, `wrangler.toml`, and `package.json`. In `astro.config.mjs`, `@astrojs/cloudflare` is configured with `imageService: 'cloudflare'` and `platformProxy: { enabled: false }`. A custom Vite plugin (`cloudflare-apex-redirect`, lines 62–86) monkey-patches `handler.js` string code during build to enforce apex redirection. In `package.json` (line 21), the deploy script executes `wrangler pages deploy ./dist`. Root `wrangler.toml` correctly uses the **modern Cloudflare Workers Assets model** (`[assets] directory = "dist"`, `[placement]`, `[[kv_namespaces]]`, `[[routes]]`) — this is NOT legacy Cloudflare Pages; it is the correct successor architecture for SSR Workers with static assets.
- **The Comparison:** The `wrangler.toml` architecture is correctly structured, but a critical deployment command mismatch creates a **P0 production infrastructure failure**:
  1. **P0 — KV Binding Silently Dropped in Production:** `package.json:21` runs `wrangler pages deploy ./dist`, which is the **Cloudflare Pages** deploy command. This command completely ignores `wrangler.toml`. As a result, ALL bindings declared in `wrangler.toml` — including `[[kv_namespaces]] binding = "SESSION"`, `[placement]`, `[cache]`, and `[observability]` — are **never applied to the live deployment**. Every API route that performs KV idempotency checks (`register.ts`, `complete.ts`, `newsletter.ts`) or writes to the dead-letter queue silently fails in production because `SESSION` is undefined. The correct deploy command for this architecture is `wrangler deploy` (not `wrangler pages deploy`).
  2. **Brittle Build Monkey-Patching:** Injecting an apex 301 redirect by intercepting and string-replacing `handler.js` in Vite (`astro.config.mjs:64-85`) is extremely fragile and breaks upon minor Astro adapter internal refactors. The apex redirect already exists in `src/middleware.ts` — the Vite plugin is redundant and dangerous.
  3. **Broken Local Edge Simulation:** Setting `platformProxy: { enabled: false }` disables Miniflare's local edge simulation, preventing developers from testing KV bindings, geolocation headers (`context.locals.userCountry`), and edge cookies locally in `astro dev`. Must be set to `enabled: true` to restore full local fidelity.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Change `package.json:21` deploy script from `wrangler pages deploy ./dist` to `wrangler deploy` to honour all `wrangler.toml` bindings in production. Remove the redundant Vite `handler.js` apex patch. Set `platformProxy: { enabled: true }` for local edge simulation. Validate KV binding availability in all API routes post-deploy.

### Item 23: Resend Edge Integration & Cloudflare Best Practices

- **The Requirement:** "Resend edge setup completely, cloudeflare all best practices."
- **Current Codebase Reality:** Located in `src/lib/email.ts` and edge endpoints (`src/pages/api/register.ts`, `complete.ts`, `contact.ts`, `apply-teacher.ts`, `newsletter.ts`, `internal/retry-queue.ts`). Resend is integrated via standard web-standard `fetch('https://api.resend.com/emails')` avoiding Node-specific SDK dependencies, with background task offloading managed through `context.locals.runtime.ctx.waitUntil`.
- **The Comparison:** While the HTTP fetch approach adheres to edge best practices, three critical implementation defects remain:
  1. **Double Synchronous Blocking in Teacher Portal:** `src/pages/api/apply-teacher.ts` (line 137) uses `await Promise.all(...)` instead of `waitUntil`, forcing teacher applicants to wait for all Resend roundtrips before receiving confirmation. Critically, the dead-letter KV write inside the catch block (lines 150–152) is _also_ synchronously awaited (`await kv.put`), meaning a Resend failure doubles the blocking penalty. Both the email dispatch and the failure-path KV write must be wrapped in `waitUntil`.
  2. **Personal Gmail Fallback Hardcoding:** If `ADMIN_EMAIL` is unconfigured, all transactional lead and contact alerts fall back to `faisalkhan.llc.ltd@gmail.com` across **7 files** (`email.ts:51`, `register.ts:111`, `complete.ts:74`, `contact.ts:96`, `apply-teacher.ts:116`, `newsletter.ts:89`, `internal/retry-queue.ts:64`) rather than the organizational `admin@quranific.com`.
  3. **Fragmented Sender Aliases:** Outbound emails scatter across `onboarding@quranific.com`, `newsletter@quranific.com`, and `support@quranific.com` without a single configuration constant.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Migrate `apply-teacher.ts` to `waitUntil` background dispatch for both the email send and the KV dead-letter write, replace hardcoded Gmail fallbacks in all 7 files with `admin@quranific.com`, and centralize Resend sender configurations into `src/constants/site.ts`.

### Item 51: Professional Newsletter Ecosystem vs. Single Welcome Email

- **The Requirement:** "newsletter ecosystem a-z working like pro, and real, and like professional website like vercel are doing strategic planning for newsletters as real not just to sent one welcome msg to user."
- **Current Codebase Reality:** Located in `src/pages/api/newsletter.ts` and `src/components/global/Footer.astro`. When a visitor submits their email in the footer, `newsletter.ts` validates Turnstile, fires an admin notification email, and sends a single static welcome message via `sendNewsletterWelcome` (`src/lib/email.ts:325`). Line 121 contains an explicit placeholder comment: `// TODO: Phase 5 D1 Database integration for uniqueness constraint`.
- **The Comparison:** The owner's forensic intuition is completely verified. The current newsletter is an illusion:
  1. **Zero Subscriber Retention:** Submitted emails are **never saved anywhere**. They are not persisted in Cloudflare D1, not stored in Cloudflare KV, and not added to Resend's Audiences API (`/audiences/{id}/contacts`). The academy has no mailing list to send updates to.
  2. **No Uniqueness Enforcement:** Because there is no database or audience state, duplicate submissions cannot be detected. A user can submit the form repeatedly and receive unlimited welcome emails.
  3. **No Campaign or Broadcast Architecture:** There is no unsubscribe token generator, no preference center, no automated onboarding drip sequence, and no compliance mechanism (CAN-SPAM / GDPR Art. 7) for list management.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Architect a real newsletter ecosystem in `src/pages/api/newsletter.ts` by connecting submissions to Resend's Contacts/Audiences API (or Cloudflare D1 persistence) with idempotency duplicate checks and automated drip/unsubscribe support.

### Item 27, 29, 47, 49: Edge Security, Dynamic Consent & Alarm Worker Logic

- **The Requirement:** "Security issues. static and dynamic pages edge logic, must be corrected. dynamic cookie banner, its logic, must be 100% correct. alarm logic. (Already Verified & Closed)."
- **Current Codebase Reality:** Located in `src/middleware.ts`, `src/lib/consent.ts`, `src/components/blocks/CookieBanner.svelte`, and `alarm-worker/src/index.ts`. Security headers (HSTS, Permissions-Policy, X-Frame-Options), dynamic geolocation-based consent bucket detection (GDPR, CCPA/CPRA, Global Privacy Control `Sec-GPC`), and the automated hourly dead-letter alarm worker (`quranific-alarm`) were previously verified. However, a deeper forensic review of `src/middleware.ts` and the consent API reveals three critical security defects that were missed in prior audits.
- **The Comparison:** Three critical security blindspots confirmed:
  1. **CSP Actively Blocks Own Conversion Tracking (P0):** `src/middleware.ts:17` — the `connect-src` directive whitelists only Google Analytics and Cloudflare domains. `src/pages/api/complete.ts` dispatches fetch requests to Meta CAPI (`graph.facebook.com`) and Zapier webhook URLs at runtime. Because these domains are absent from `connect-src`, the browser's CSP actively **blocks all server-side conversion tracking events**. The site's own security policy is silently killing Meta and CRM conversion signals. `graph.facebook.com`, `hooks.zapier.com`, and any other third-party integration endpoints must be added to `connect-src`.
  2. **`unsafe-eval` in `script-src` Opens XSS Attack Vector:** `src/middleware.ts:13` — `script-src` includes `'unsafe-eval'`. This permits execution of `eval()`, `new Function()`, and `setTimeout(string)` in page context, which materially widens the XSS attack surface. No current Astro or Svelte code requires `unsafe-eval` at runtime; it should be removed and replaced with a strict CSP hash or nonce where needed.
  3. **Overly Permissive CORS Leaks Geo-Intelligence Data:** Both `/api/consent-bucket` (`consent-bucket.ts:32`) and `/api/geo-currency` (`geo-currency.ts:30`) set `Access-Control-Allow-Origin: *`. These endpoints expose geolocation-derived data (user country, consent bucket, and resolved regional currency) to any cross-origin requestor. This violates GDPR data minimisation principles and leaks user geo-intelligence to third-party scripts loaded on the page. CORS must be locked to `https://quranific.com` only on all internal API endpoints.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Update `src/middleware.ts` CSP `connect-src` to include `https://graph.facebook.com` and `https://hooks.zapier.com`. Remove `'unsafe-eval'` from `script-src`. Lock all API endpoint CORS headers to `Access-Control-Allow-Origin: https://quranific.com` instead of wildcard. Alarm worker and consent logic remain verified and locked.

## Phase 6 Codebase vs Requirements Audit

### Item 24, 25, 26: Full SEO Architecture, AI Optimization & Internal Linking Mesh

- **The Requirement:** "SEO complete setup, best practice. (most wanted). Optimize for ai (most wanted). internal links edge to edge ecosystem."
- **Current Codebase Reality:** Located in `src/layouts/Base.astro`, `src/pages/robots.txt.ts`, `src/pages/courses/`, and `src/constants/courses.ts`. `Base.astro` supplies foundational OpenGraph, Twitter Cards, canonical URL sanitization, and base Schema.org Organization/WebSite graphs.
- **The Comparison:** Forensic review reveals substantial omissions in AI-readiness and internal link topology:
  1. **Zero AI Crawler Optimization:** The site completely lacks an `llms.txt` or `llms-full.txt` file (the emergent standard for LLM crawler indexing). `src/pages/robots.txt.ts` includes no user-agent directives for AI search bots (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Applebot-Extended`), forfeiting citation visibility in AI search overviews.
  2. **Orphaned Course Internal Links:** While `src/constants/courses.ts` defines `relatedSlugs: CourseSlug[]` for every course, `src/pages/courses/[slug].astro` **never renders them**. Individual course pages exist as isolated dead-ends with zero horizontal internal links to complementary programs (e.g. Basic Qaida to Tajweed, or Tajweed to Hifz).
  3. **Barren Content Silo:** The blog contains only a single draft post (`hello-world.md` marked `draft: true`), resulting in an empty `/blog` index that contributes zero organic topical authority or internal link equity to core service pages.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Create `public/llms.txt` with structured curriculum summaries, add AI user-agents in `src/pages/robots.txt.ts`, render horizontal `relatedSlugs` cards in `src/pages/courses/[slug].astro`, and publish initial content cluster posts connecting to course routes.

### Item 33 & 35: Search Console Indexing, Crawl Hygiene & Error Handling

- **The Requirement:** "index, crawl issues, and error handling over all. search console best practices."
- **Current Codebase Reality:** Located in `astro.config.mjs` (sitemap configuration), `src/pages/robots.txt.ts`, `src/pages/404.astro`, `src/pages/portals/index.astro`, and `src/layouts/Base.astro`.
- **The Comparison:** Forensic crawl analysis exposes two critical Search Console violations that degrade organic ranking and trigger Google crawler penalties:
  1. **Sitemap Contamination with 404 and Noindex URLs:** `astro.config.mjs` (lines 30–48) filters the XML sitemap, but fails to exclude `/404`, `/portals`, and noindexed intent routes (`/quran-classes/*`, `/quran-teacher/*`). Submitting `/404` in an XML sitemap is a severe Google Search Console violation (_"Submitted URL returns 404 (Not Found)"_), while submitting noindexed landing pages triggers _"Submitted URL marked 'noindex'"_ crawl warnings.
  2. **Trailing Slash Canonical Mismatch:** `Base.astro` strips trailing slashes on `canonicalURL`, but `astro.config.mjs` omits `trailingSlash: 'never'`, permitting dual-URL variations (`/courses` vs `/courses/`) without explicit edge redirect standardization. Cloudflare will serve both variants without a canonical preference, splitting link equity.
  - **Note:** A previously reported "Contradictory Dual Meta Robots Tags" conflict between `Base.astro` and slotted `noindex` pages (`404.astro`, `portals/index.astro`) was **verified as a false positive**. `Base.astro` does NOT independently render a default `<meta name="robots" content="index, follow">` tag; the slotted `noindex` directive from child pages is the only robots meta rendered. This conflict does not exist in the codebase.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Update the sitemap filter in `astro.config.mjs` to explicitly purge `/404`, `/portals`, and all `/quran-classes/*` and `/quran-teacher/*` intent variations. Set `trailingSlash: 'never'` in `astro.config.mjs` to enforce canonical URL consistency at the framework level.

### Item 34, 39, 40: GTM Implementation, Ads Conversion Readiness & Suspension Safeguards

- **The Requirement:** "GTM best practices. ready for Google, meta Ads. Google auto triggers, for rejection, Suspension + manuals for google ads, and seo."
- **Current Codebase Reality:** Located in `src/layouts/Base.astro` (lines 115–159) and server-side tracking tasks in `src/pages/api/complete.ts`. `Base.astro` loads `GTM-5CJMMJ29` alongside Consent Mode v2 default denial scripts and an `astro:page-load` SPA listener.
- **The Comparison:** The GTM integration is functionally hollow and the site contains severe automated ad suspension triggers:
  1. **Complete DataLayer Black Hole:** Aside from `virtual_page_view`, **not a single conversion or engagement event is pushed to `dataLayer`** anywhere in the codebase. Clicks on "Book Free Trial", pricing calculations, Step 1 lead captures, and Step 3 success confirmations never dispatch `generate_lead` or `conversion` events to the browser. GTM web tags cannot track Google Ads or Meta Ads performance.
  2. **Automated Price Mismatch Suspension Risk:** `src/constants/courses.ts` advertises `$39/mo`, but the billing calculator (`src/constants/pricing.ts`) charges `$40/mo`. Google's automated landing page price crawlers flag this discrepancy as "Inaccurate / Misleading Pricing", resulting in automatic ad disapproval.
  3. **Geographic Contact Inconsistency:** Ad landing pages (`for-kids.astro:296`, etc.) direct users to an unvetted UK number (`+44 7477 382348`), whereas the Impressum and footer declare a Pakistani address and `+92 311 2112122`. This triggers Google Ads automated flags for "Misrepresentation / Unverifiable Identity".
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Wire standard `dataLayer.push` events (`generate_lead`, `begin_checkout`, `contact_whatsapp`) across all funnel milestones, reconcile course card pricing to match billing reality, and standardize verified business contact data across all landing pages.

### Item 41: Merchant Underwriting & Payment Gateway Submission Readiness

- **The Requirement:** "webstie must Ready to submit to payment gateways."
- **Current Codebase Reality:** Located in `src/pages/legal/` (`impressum.astro`, `terms.astro`, `refund.astro`), `src/pages/tuition-fee/`, and `src/components/global/Footer.astro`.
- **The Comparison:** A rigorous merchant underwriting review against requirements from Stripe, 2Checkout, Airwallex, and merchant acquirers identifies critical compliance gaps that would trigger immediate merchant account rejection:
  1. **Absence of Service Delivery & Fulfillment Policy:** Underwriters mandate an explicit "Service Delivery / Fulfillment" clause for digital subscription and educational services, specifying that tutor scheduling and student portal access are provisioned within 24–48 hours of payment. Currently, delivery terms do not exist in `terms.astro` or `refund.astro`.
  2. **Evasive Registration Information:** In `impressum.astro` (line 100), the business registration number is listed as _"Provided upon formal request or during merchant underwriting"_. Acquiring banks require verified business entity numbers (e.g. NTN, company registration) and legal jurisdiction openly displayed on the website.
  3. **No Payment Method Transparency:** Neither the pricing page (`/tuition-fee`), footer, nor registration flow displays accepted card schemes (Visa, MasterCard, American Express) or 256-bit SSL security badges.
  4. **Support Response SLA Missing:** Merchant compliance requires stated customer service availability and response SLAs (e.g., support hours and 24-hour resolution commitment).
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Embed an explicit Digital Service Delivery & Fulfillment clause into `src/pages/legal/terms.astro`, add accepted payment scheme indicators in `src/components/global/Footer.astro` and `TuitionPlans.astro`, and publish formal sole proprietorship NTN/entity credentials in `src/pages/legal/impressum.astro`.

## Phase 7 Codebase vs Requirements Audit

### Item 28, 30, 31, 38, 43: Rocket Performance, Green Signals, Asset Pipeline & Image Optimization

- **The Requirement:** "🚀 Rocket performance. all signals must be green (most wanted). Lazy load. html, css, javascripts, edge performance. entire code quality, scalable. optimize images."
- **Current Codebase Reality:** Located in `astro.config.mjs`, `src/layouts/Base.astro`, `src/styles/global.css`, `src/components/`, and `public/images/`.
- **The Comparison:**
  1. **Bypassed Image Pipeline & CLS Hazards:** `astro.config.mjs` defines `adapter: cloudflare({ imageService: 'cloudflare' })`, yet across almost all components (`CourseCard.astro`, `HeroKids.astro`, `HeroWomen.astro`, `blog/index.astro`), the site completely avoids Astro's `<Image />` component in favor of raw unoptimized `<img>` tags pointing to static assets in `/public/images/`. Furthermore, many of these `<img>` tags lack explicit `width` and `height` dimensions or aspect-ratio constraints, incurring Cumulative Layout Shift (CLS) penalties during image render.
  2. **Unconditional Third-Party Scripts:** Cloudflare Turnstile (`challenges.cloudflare.com/turnstile/v0/api.js`) is injected in `Base.astro:180` across _every_ page on the domain—including static legal, blog, and informational pages without forms. This bloats the main thread, delays First Contentful Paint (FCP), and incurs unnecessary third-party connection overhead.
  3. **Main-Thread Tracking Penalty:** Although `@astrojs/partytown` is configured in `astro.config.mjs`, GTM is loaded as a raw inline `<script>` in `Base.astro:135` instead of `type="text/partytown"`. Consequently, tag evaluation runs on the primary UI thread instead of being offloaded to a web worker.
  4. **Font Subsetting & Loading:** Variable Inter and Merriweather fonts are preloaded via Vite content-hashed URLs, successfully curbing FOIT/FOUT. However, Amiri arabic subsets are imported via regular CSS without preloads.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Provide explicit `width`/`height`/`aspect-ratio` and `loading="lazy"` attributes on all image elements, conditionally restrict Turnstile script injection exclusively to pages housing interactive forms, and offload main-thread tracking scripts via Partytown or idle scheduling to secure green Lighthouse performance signals.

### Item 32: End-to-End Testing Loop & Full Website Test Coverage

- **The Requirement:** "end the end after all fixes, run e2e test for complete websites in loop 100% correct fixing."
- **Current Codebase Reality:** Located in `playwright.config.ts`, `package.json`, and `tests/`.
- **The Comparison:**
  1. **Severely Constrained Test Scope:** The existing test suite in `tests/` consists exclusively of isolated API endpoint tests (`tests/api-contact.spec.ts`, `tests/api-teacher.spec.ts`) and consent cookie tests (`tests/consent.spec.ts`).
  2. **Uncovered Critical User Journeys:** There are zero end-to-end browser tests for the primary commercial conversion funnel:
     - `/getting-started/signup` (multi-step registration wizard, field validations, slot booking, submission states) has zero test coverage.
     - `/tuition-fee` dynamic pricing calculator (currency conversion, plan toggle, family discount arithmetic) has zero test coverage.
     - Intent landing pages (`/quran-classes/for-kids`, `/for-adults`, `/for-women`) and course detail routes (`/courses/[slug]`) have zero CTA and rendering tests.
     - Teacher onboarding portal (`/portals/teacher-onboarding`) has zero UI test coverage.
  3. **No Automated Test Runner or CI Loop:** `package.json` contains no `"test"` or `"test:e2e"` script (`npm test` fails with missing script). There is no looped test runner script to validate complete website functionality repeatedly across builds.
  4. **`astro check` as a Deploy-Blocking Landmine:** `package.json:13` defines `"build": "astro check && astro build"`, meaning TypeScript errors anywhere in `src/` will abort the entire build and deployment pipeline. Given the known data mismatches across the codebase (course `price` strings disconnected from the pricing engine, empty team/teacher data files, `courseFaqs` typed but unpopulated), any agent fix that introduces or exposes a type error during Phase 1–4 work will **silently block all future deployments** until resolved. This must be tracked as a deploy-risk gate throughout the execution phases.
- **Verdict & Action Plan:**
  - `[PARTIAL - NEEDS REFACTOR]`
  - **Required Code Action:** Author comprehensive Playwright E2E suites covering the multi-step signup funnel, tuition calculator, and course discovery flows, add `"test:e2e": "playwright test"` to `package.json`, and establish an automated execution loop to verify complete regression-free operation. Ensure all Phase 1 data layer changes pass `astro check` type validation before any deployment attempt.

### Item 45: Comprehensive Reconciliation of Omitted Architecture & Production Requirements

- **The Requirement:** "If I missed any part, remind me."
- **Current Codebase Reality:** Evaluated across infrastructure files (`wrangler.toml`, `src/middleware.ts`, `src/pages/api/`), error routes (`src/pages/`), and operational procedures.
- **The Comparison:** A forensic audit of the entire architecture against enterprise web standards and production readiness reveals 4 vital pillars that were omitted from `owner-list.md`:
  1. **Server-Side Conversion API (CAPI) & Ad-Blocker Resilience:** `owner-list.md` focused exclusively on client-side GTM (Items 34, 39, 40). However, modern privacy browsers (Safari ITP, ad blockers) silently discard 30–40% of browser events. The codebase has stubs in `src/pages/api/` for Meta CAPI and GA4 Measurement Protocol, but lacks automated SHA-256 PII hashing, token verification, and fallback alerting if CAPI drops.
  2. **Disaster Recovery & Lead KV Data Retention:** Student trial registrations are stored in Cloudflare KV (`SESSION`). `owner-list.md` omits an automated backup, archiving, or CRM sync mechanism, exposing incoming commercial inquiries to total data loss in the event of edge namespace corruption.
  3. **Automated CI/CD Quality Gates & Security Auditing:** There is no GitHub Actions pipeline running `npm run check`, typechecking, Playwright E2E suites, and `npm audit` prior to production deployment.
  4. **Real User Monitoring (RUM) & Core Web Vitals Field Telemetry:** Item 28 demands "all signals green", but omits field telemetry (reporting true field LCP, CLS, and INP metrics directly to GA4 or Cloudflare Web Analytics) to detect real-world regressions across international networks.
  - **Confirmed Correct — `src/pages/500.astro`:** A custom server error boundary page (`src/pages/500.astro`) **EXISTS and is operational** in the codebase. A prior audit report incorrectly listed this as missing; this claim is retracted and confirmed as a false negative.
- **Verdict & Action Plan:**
  - `[PERFECT]` _(for 500 error boundary — confirmed present)_
  - `[PARTIAL - NEEDS CREATION]` _(for remaining 4 omitted pillars)_
  - **Required Code Action:** Activate and test server-side CAPI event hashing in `src/pages/api/complete.ts`, provision automated KV lead data export or D1 archival, and configure a pre-deployment GitHub Actions CI workflow to enforce code quality gates and security audits.

### Item 50: Final End-to-End Smoke Test Automation & Edge Health Checks

- **The Requirement:** "final end to end Smoke Test."
- **Current Codebase Reality:** Evaluated in `package.json`, root scripts, and manual deployment procedures.
- **The Comparison:**
  1. **Absence of an Automated Smoke Script:** There is no smoke test runner (e.g. `scripts/smoke-test.mjs` or `npm run smoke`) anywhere in the repository. `package.json` contains no script or entry point for running post-deployment smoke checks.
  2. **Reliance on Ad-Hoc Manual Curls:** Historically, smoke testing has been performed via informal terminal curl commands checking HTTP 200 responses. This leaves critical edge assertions unverified:
     - Edge security headers (`Strict-Transport-Security`, `X-Frame-Options`, `Content-Security-Policy`) are never systematically asserted.
     - Geolocation currency routing (`/api/geo-currency`) and regional consent defaults (`/api/consent-bucket`) are not programmatically validated against mock Cloudflare country headers (`CF-IPCountry`).
     - Apex redirect (`www.quranific.com` → `quranific.com` with status 301 and `no-store` headers) is not checked by automated scripts.
     - Sitemap XML validity (`/sitemap-index.xml`) and `robots.txt` output are not verified prior to releasing traffic.
  3. **No CI/CD Deployment Integration:** The deployment command (`npm run deploy` -> `npm run build && wrangler pages deploy ./dist`) exits immediately upon Cloudflare upload without firing a synthetic smoke health check against the live deployment URL.
- **Verdict & Action Plan:**
  - `[MISSING - NEEDS CREATION]`
  - **Required Code Action:** Build a standalone, zero-dependency Node.js smoke test script (`scripts/smoke-test.mjs`) that programmatically verifies HTTP status codes, security headers, edge redirects, and API contracts against both local preview and production environments, and bind it to `"test:smoke"` in `package.json`.
