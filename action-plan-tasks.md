# 🛠️ TECHNICAL ACTION PLAN & EXECUTION ROADMAP

**Document Purpose:** Prioritized, step-by-step engineering plan to resolve all broken items, data fractures, attribution gaps, and design debt identified in the forensic audit.  
**Companion Document:** [`audit-leftovers.md`](file:///d:/Live%20Web/Quranific-live/audit-leftovers.md)

---

## 🚦 PRIORITY MATRIX

| Priority      | Focus Area                                                                                     | Impact                                        | Estimated Tasks |
| :------------ | :--------------------------------------------------------------------------------------------- | :-------------------------------------------- | :-------------: |
| 🔴 **HIGH**   | Broken Links (404s), Encoding Corruption, Attribution Loss, DLQ Failure, Policy Contradictions | Immediate conversion & compliance risk        |   Tasks 1 – 6   |
| 🟡 **MEDIUM** | Data Store Consolidation, Dead Code Purge, Social Images, KV Bindings, Brand Accuracy          | Single source of truth, SEO & maintainability |  Tasks 7 – 14   |
| 🟢 **LOW**    | Design Tokens, Typography Scaling, Container Standardization, Monolith Componentization        | Code hygiene & WCAG perfection                |  Tasks 15 – 20  |

---

## 🔴 HIGH PRIORITY: CRITICAL BUGS, BROKEN UI & RUNTIME DEFECTS

### TASK 1: Fix Careers Page UTF-8 Encoding & Role Selection JS

- **Target File:** [`src/pages/careers.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/careers.astro)
- **Problem:** Over 30 lines contain Windows-1252 corrupted mojibake (`â€”`, `â€“`, `ðŸ’°`). On line 1588, `fullTitle.split('â€”')[0]` breaks dynamic role auto-selection when users click "Apply now".
- **Required Changes:**
  1. Replace all corrupted characters with clean UTF-8 literals:
     - `â€”` → `—` (em dash)
     - `â€“` → `–` (en dash)
     - `â†’` → `→` (arrow)
     - `Â·` → `·` (middle dot)
     - `ðŸ’°` → SVG or clean text
  2. Refactor line 1588 to safe regex or standard delimiter:
     ```javascript
     const baseTitle = fullTitle.split(/\s*[\u2014\u2013-]\s*/)[0].trim();
     ```

---

### TASK 2: Fix Broken Legal Route Links in `LandingFooter.astro` (Eliminate 404s)

- **Target File:** [`src/components/landing/LandingFooter.astro:13-48`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingFooter.astro)
- **Problem:** Links point to `/privacy`, `/terms`, `/refund`, `/cookies`, `/impressum` instead of `/legal/*`.
- **Required Changes:**
  Update the link `href` attributes to prepend `/legal`:
  ```astro
  <a href="/legal/privacy" class="...">Privacy Policy</a>
  <a href="/legal/terms" class="...">Terms of Service</a>
  <a href="/legal/refund" class="...">Refund Policy</a>
  <a href="/legal/cookies" class="...">Cookie Policy</a>
  <a href="/legal/impressum" class="...">Impressum</a>
  ```

---

### TASK 3: Fix Broken `/partners` Link in Site Navigation (Eliminate 404)

- **Target File:** [`src/constants/site.ts:107`](file:///d:/Live%20Web/Quranific-live/src/constants/site.ts)
- **Problem:** `FOOTER_NAVIGATION.academy` links to non-existent `/partners`.
- **Required Changes:**
  Remove the `{ label: 'Partners', href: '/partners' }` entry from `FOOTER_NAVIGATION.academy` in `src/constants/site.ts` (or point to `/careers` / `/contact` if a partner contact route is intended).

---

### TASK 4: Restore Ad Campaign Attribution on Landing Page CTAs

- **Target Files:**
  - [`src/components/landing/LandingCTA.astro:36`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingCTA.astro)
  - [`src/components/landing/LandingGuarantee.astro:75`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingGuarantee.astro)
  - [`src/components/landing/LandingOnboarding.astro:87`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingOnboarding.astro)
  - [`src/components/landing/LandingPreview.astro:58,91`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingPreview.astro)
  - [`src/components/landing/LandingTrust.astro:63`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingTrust.astro)
  - [`src/components/landing/LandingProblem.astro:92`](file:///d:/Live%20Web/Quranific-live/src/components/landing/LandingProblem.astro)
- **Problem:** `a[data-track-cta]` is required for the client attribution script to forward `gclid`, `utm_*`, and `fbclid` query params into the signup flow. Several extracted landing components invoke `<Button>` without `data-track-cta`.
- **Required Changes:**
  Add `data-track-cta` attribute to `<Button>` and anchor elements linking to `/funnel/signup` or `/enroll/step-1` across all landing section components.

---

### TASK 5: Fix Dead-Letter Queue (DLQ) Recovery in `retry-queue.ts`

- **Target Files:**
  - [`src/pages/api/internal/retry-queue.ts:36-55`](file:///d:/Live%20Web/Quranific-live/src/pages/api/internal/retry-queue.ts)
  - [`src/pages/api/register.ts:114`](file:///d:/Live%20Web/Quranific-live/src/pages/api/register.ts)
  - [`src/pages/api/complete.ts:145`](file:///d:/Live%20Web/Quranific-live/src/pages/api/complete.ts)
- **Problem:** `register.ts` writes `FAILED_LEAD_STEP1:*` and `complete.ts` writes `FAILED_LEAD_STEP2:*`. `retry-queue.ts` lists `FAILED_LEAD:` and expects a legacy `data.taskIndex` property, causing retry logic to fail.
- **Required Changes:**
  Refactor `retry-queue.ts` to inspect keys by sub-prefix (`FAILED_LEAD_STEP1:`, `FAILED_LEAD_STEP2:`, `FAILED_CONTACT_ADMIN:`, `FAILED_NEWSLETTER_ADMIN:`), decode the specific step payload, and re-invoke the appropriate email template functions in `src/lib/email.ts`.

---

### TASK 6: Reconcile Legal Refund Policy Contradiction

- **Target Files:**
  - [`src/pages/legal/refund.astro:120-133`](file:///d:/Live%20Web/Quranific-live/src/pages/legal/refund.astro)
  - [`src/data/faqs.ts:92-95`](file:///d:/Live%20Web/Quranific-live/src/data/faqs.ts)
  - [`src/pages/features.astro:270`](file:///d:/Live%20Web/Quranific-live/src/pages/features.astro)
- **Problem:** `refund.astro` specifies 7 days; `faqs.ts` and `features.astro` advertise a "1 full month 100% money-back guarantee".
- **Required Changes:**
  Align `refund.astro` Section 3 to explicitly state the 30-day money-back guarantee matching marketing promises:
  _"If you are not completely satisfied within your first 30 days (first full month) of paid classes, we will refund 100% of your tuition."_

---

## 🟡 MEDIUM PRIORITY: DATA CONSOLIDATION, ASSETS & SCHEMA HYGIENE

### TASK 7: Consolidate Testimonials into Single Source of Truth

- **Target Files:**
  - [`src/data/testimonials.ts`](file:///d:/Live%20Web/Quranific-live/src/data/testimonials.ts) (Master source)
  - [`src/constants/testimonials.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/testimonials.ts) (Deprecate or re-export)
  - [`src/pages/[intent]/for-women.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/%5Bintent%5D/for-women.astro)
  - [`src/pages/testimonials.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/testimonials.astro)
- **Required Changes:**
  1. Expand `src/data/testimonials.ts` with typed categories (`kids`, `adults`, `women`, `general`).
  2. Populate all genuine reviews (Amna, Fatima, Sarah, Khalid, Nadia, Saleem, Naseerullah, Usama) into `src/data/testimonials.ts`.
  3. Re-export `testimonials` from `src/constants/testimonials.ts` for backward compatibility.
  4. Update `for-women.astro` and `testimonials.astro` to import from `src/data/testimonials.ts`.

---

### TASK 8: Consolidate Teachers Data into Single Source of Truth

- **Target Files:**
  - [`src/constants/teachers.ts`](file:///d:/Live%20Web/Quranific-live/src/constants/teachers.ts)
  - [`src/pages/teachers.astro`](file:///d:/Live%20Web/Quranific-live/src/pages/teachers.astro)
- **Required Changes:**
  1. Define complete teacher profiles in `src/constants/teachers.ts` (Ustadha Fatima, Sheikh Ahmed, Ustadha Maryam, Sheikh Tariq, Hafiz Haseeb, Sheikh Imran).
  2. Refactor `teachers.astro` to consume `TEACHERS_LIST` from `src/constants/teachers.ts`.

---

### TASK 9: Purge 7 Dead Component Files Under `src/components/sections/`

- **Target Files to Delete:**
  1. `src/components/sections/AdEntryPoints.astro`
  2. `src/components/sections/BlogGrid.astro`
  3. `src/components/sections/ContactForm.astro`
  4. `src/components/sections/CourseGrid.astro`
  5. `src/components/sections/PricingTable.astro`
  6. `src/components/sections/TeacherGrid.astro`
  7. `src/components/sections/ValuePillars.astro`
- **Verification:** Run `npx astro check && npm run build` to confirm zero broken import references.

---

### TASK 10: Fix Founder Avatar Initials & Arabic Accessibility on About Page

- **Target File:** [`src/pages/about.astro:164,880`](file:///d:/Live%20Web/Quranific-live/src/pages/about.astro)
- **Required Changes:**
  1. Line 164: Replace Arabic `ع` with `ف` (or English `F`) and add `aria-hidden="true"`:
     ```astro
     <div class="... font-serif" aria-hidden="true">ف</div>
     ```
  2. Line 880: Replace `OF` initials badge with `FK` (Faisal Khan).

---

### TASK 11: Remove Unverified "Al-Azhar Scholars" Claim from Courses Data

- **Target File:** [`src/constants/courses.ts:93`](file:///d:/Live%20Web/Quranific-live/src/constants/courses.ts)
- **Required Changes:**
  Update Quran Reading course description:
  - _From:_ `"Taught by certified Al-Azhar scholars, we offer..."`
  - _To:_ `"Taught by certified, verified Quran scholars, we offer..."`

---

### TASK 12: Add Dynamic Per-Course OpenGraph Social Sharing Images

- **Target File:** [`src/pages/courses/[slug].astro:67-68`](file:///d:/Live%20Web/Quranific-live/src/pages/courses/[slug].astro)
- **Required Changes:**
  Pass the course-specific image to `<Page>`:
  ```astro
  <Page
    title={`${course.title} | Quranific`}
    description={course.shortDesc}
    image={`/images/${course.slug}.webp`}
  />
  ```

---

### TASK 13: Add Missing `FX_RATES` KV Binding in `wrangler.toml`

- **Target File:** [`wrangler.toml`](file:///d:/Live%20Web/Quranific-live/wrangler.toml)
- **Required Changes:**
  Add optional `FX_RATES` binding or remove dead references in `env.d.ts` and `courses/[slug].astro` to ensure 1:1 parity between local simulation and Cloudflare production.

---

### TASK 14: Harmonize Cloudflare Turnstile Public Site Key

- **Target Files:**
  - [`src/constants/site.ts:18`](file:///d:/Live%20Web/Quranific-live/src/constants/site.ts)
  - [`src/components/global/Footer.astro:164`](file:///d:/Live%20Web/Quranific-live/src/components/global/Footer.astro)
  - [`src/pages/funnel/signup.astro:35`](file:///d:/Live%20Web/Quranific-live/src/pages/funnel/signup.astro)
  - [`src/pages/contact.astro:119`](file:///d:/Live%20Web/Quranific-live/src/pages/contact.astro)
- **Required Changes:**
  Reference `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? SITE.turnstileSiteKey` to allow seamless environment switching between Cloudflare Turnstile test keys and production keys.

---

## 🟢 LOW PRIORITY: DESIGN TOKEN HYGIENE, TYPOGRAPHY & MONOLITHS

### TASK 15: Migrate Raw `<a>` CTAs to Standard `<Button>` Component

- **Target Files:**
  - [`src/components/sections/HomeHero.astro:75-87`](file:///d:/Live%20Web/Quranific-live/src/components/sections/HomeHero.astro)
  - [`src/components/sections/FinalCTA.astro:39-75`](file:///d:/Live%20Web/Quranific-live/src/components/sections/FinalCTA.astro)
  - [`src/components/courses/TeacherTeaserBanner.astro:78,95`](file:///d:/Live%20Web/Quranific-live/src/components/courses/TeacherTeaserBanner.astro)
  - [`src/components/courses/CourseCard.astro:93-117`](file:///d:/Live%20Web/Quranific-live/src/components/courses/CourseCard.astro)
- **Required Changes:**
  Replace hardcoded anchor tags with `<Button href="..." variant="primary">`.

---

### TASK 16: Standardize Containers to `@utility quranific-container`

- **Target Files:** 30+ pages and components (`about.astro`, `careers.astro`, `contact.astro`, `how-it-works.astro`, etc.)
- **Required Changes:**
  Replace `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` with `quranific-container`.

---

### TASK 17: Replace 40+ Residual Hardcoded Hex Color Literals

- **Target Files:** `contact.astro`, `FinalCTA.astro`, `TestimonialGrid.astro`, `Header.astro`, `MobileMenu.astro`, `Base.astro`, `Funnel.astro`.
- **Required Changes:**
  - `#022c22` → `bg-emerald-950`
  - `#fefdf9` → `bg-cream-50`
  - `#047857` → `bg-emerald-700`

---

### TASK 18: Normalize Arbitrary Typography Declarations (`text-[10px]`, `text-[11px]`)

- **Target Files:** `CourseCard.astro`, `CoursesFAQ.astro`, `TeacherTeaserBanner.astro`, `PricingGrid.svelte`, `AdultCTA.astro`, `HowItWorks.astro`.
- **Required Changes:**
  - `text-[9px]`, `text-[10px]`, `text-[11px]` → `text-xs font-semibold`
  - `text-[13px]`, `text-[14px]` → `text-sm`
  - `text-[15px]` → `text-sm font-medium` or `text-base`

---

### TASK 19: Componentize 4 Monolithic Pages (>50 KB)

- **Target Files:**
  - `src/pages/how-it-works.astro` (86 KB) → Extract Step cards and comparison table into `src/components/how-it-works/`.
  - `src/pages/careers.astro` (77 KB) → Extract Job Opening cards and application form into `src/components/careers/`.
  - `src/pages/contact.astro` (70 KB) → Extract interactive Contact form into `src/components/contact/`.
  - `src/pages/about.astro` (54 KB) → Extract Story timeline and Founder card into `src/components/about/`.

---

### TASK 20: Reconcile and Sync `AUDIT-LEDGER.md` and `audits/FIX-LOG.md`

- **Target Files:**
  - [`AUDIT-LEDGER.md`](file:///d:/Live%20Web/Quranific-live/AUDIT-LEDGER.md)
  - [`audits/FIX-LOG.md`](file:///d:/Live%20Web/Quranific-live/audits/FIX-LOG.md)
- **Required Changes:**
  Update all historical rows from `PENDING` to `DONE`, recording accurate dates and files modified to bring project ledger into 100% parity with live repository reality.
