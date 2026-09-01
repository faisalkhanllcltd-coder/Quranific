Searched for "eyebrow"
Searched for "tracking-"
Ran command: `Get-ChildItem -Path "src" -Recurse -File | Select-Object -ExpandProperty FullName`
Searched for "uppercase"
Viewed PageHero.astro:1-164
Viewed LandingFAQ.astro:1-91
Viewed LandingCTA.astro:1-61
Viewed LandingOnboarding.astro:1-93
Viewed LandingOutcome.astro:1-105
Viewed LandingPreview.astro:1-101
Viewed LandingPricing.astro:1-49
Viewed LandingProblem.astro:1-104
Viewed LandingTestimonials.astro:1-115
Viewed LandingTrust.astro:1-99
Viewed LandingVetting.astro:1-108
Viewed FinalCTA.astro:1-94
Viewed FAQAccordion.astro:1-133
Viewed CoursesFAQ.astro:1-124
Viewed TeacherTeaserBanner.astro:1-134
Viewed StickyMobileCTA.astro:1-40
Viewed Note.astro:1-66
Viewed Section.astro:1-19
Viewed HowItWorks.astro:1-106
Viewed PainPoints.astro:1-91
Viewed QuranificDifference.astro:1-289
Viewed TestimonialGrid.astro:1-106
Viewed HeroKids.astro:1-142
Viewed HeroAdults.astro:1-163
Viewed HeroWomen.astro:1-186
Viewed LandingGuarantee.astro:1-146
Viewed for-kids.astro:1-100
Viewed for-kids.astro:140-300
Viewed index.astro:1-159
Viewed AboutMission.astro:1-116
Viewed AboutOriginStory.astro:1-94
Viewed AboutPrinciples.astro:1-149
Viewed AboutTeachers.astro:1-233
Viewed AboutTeam.astro:1-104
Viewed AboutVision.astro:1-38
Viewed index.astro:1-200
Viewed %5Bslug%5D.astro:1-216
Viewed index.astro:1-183
Viewed AvailabilityTable.astro:1-221
Viewed ContactFaq.astro:1-5
Viewed SmartContactForm.astro:1-100
Searched for "tracking-"
Searched for "uppercase"
Viewed index.astro:1-215
Ran command: `Get-ChildItem -Path "src" -Filter "*Course*" -Recurse`
Viewed CourseGrid.astro:1-22
Viewed CourseCard.astro:1-144
Viewed %5Bslug%5D.astro:1-87
Viewed CourseHero.astro:1-104
Viewed CourseBentoFacts.astro:1-116
Viewed CourseWhyWho.astro:1-163
Viewed CourseCurriculum.astro:1-64
Viewed CoursePricingSection.astro:1-37
Viewed index.astro:1-66
Viewed FaqTabs.astro:1-91
Viewed FaqSupportCard.astro:1-49
Viewed signup.astro:1-46
Viewed complete.astro:1-46
Viewed success.astro:1-177
Viewed terms.astro:1-311
Viewed cookies.astro:30-60
Viewed impressum.astro:30-60
Viewed privacy.astro:30-60
Viewed refund.astro:30-60
Viewed index.astro:1-48
Viewed PortalsGrid.astro:1-106
Viewed index.astro:1-309
Viewed index.astro:1-135
Viewed TeachersIjazah.astro:1-33
Viewed TeachersVetting.astro:1-77
Viewed TeachersGenderPrivacy.astro:1-79
Viewed TeachersFaculty.astro:1-107
Viewed TeachersCta.astro:1-38
Viewed index.astro:1-124
Viewed TestimonialsVideoCard.astro:1-63
Viewed TestimonialsGrid.astro:1-91
Viewed TestimonialsCta.astro:1-38
Viewed index.astro:1-73
Viewed SiblingDiscount.astro:1-44
Viewed TuitionPlans.astro:1-65
Viewed WhatsIncluded.astro:1-46
Viewed index.astro:1-100
Viewed index.astro:100-147
Viewed 404.astro:1-90
Viewed 500.astro:1-88
Viewed Page.astro:1-25
Viewed Landing.astro:1-19
Viewed LandingFooter.astro:1-51
Viewed PricingCalculator.svelte:1-100
Viewed PricingCalculator.svelte:100-200
Viewed PricingGrid.svelte:1-100
Viewed for-adults.astro:140-300
Viewed for-women.astro:160-320
Viewed Header.astro:1-100
Viewed Footer.astro:1-100
Viewed MobileMenu.astro:1-100
Viewed Breadcrumb.astro:1-117
Viewed Accordion.astro:1-56
Viewed Card.astro:1-23
Viewed Button.astro:1-56

# Global UI Typography Audit: "Eyebrow" Elements

**Auditor:** Lead UI Auditor  
**Scope:** `src/` directory (Read-Only Scan)  
**Target:** All eyebrow text instances (props, hardcoded section tags, pill badges, and tracking-wide uppercase typography)

---

### Core Reusable & Shared Block Components

**File Path:** `src/components/blocks/PageHero.astro`
**Current Classes:** `text-[11px] font-bold uppercase tracking-widest text-emerald-800` (within container: `inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-emerald-200/60 rounded-full mb-6 lg:mb-8 shadow-sm`)
**Context:** Main page-level hero eyebrow pill badge rendered directly above the primary `<h1>` heading (used across Home, About, Contact, Courses, FAQ, Teachers, Testimonials, and Tuition Fee pages).

---

**File Path:** `src/components/blocks/FAQAccordion.astro`
**Current Classes:** `text-[11px] font-bold uppercase tracking-widest text-emerald-800` (within container: `inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Sticky left-column pill badge eyebrow placed directly above the FAQ section `<h2>` heading.

---

**File Path:** `src/components/blocks/CoursesFAQ.astro`
**Current Classes:** `text-[11px] font-bold uppercase tracking-widest text-emerald-800` (within container: `inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Left-column pill badge eyebrow placed above the "Course Questions" FAQ `<h2>` heading.

---

**File Path:** `src/components/blocks/FinalCTA.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-white` (within container: `inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-8 backdrop-blur-sm`)
**Context:** Dark-theme pill badge eyebrow placed above the final conversion `<h2>` heading across marketing pages.

---

**File Path:** `src/components/blocks/TeacherTeaserBanner.astro`
**Current Classes:** `text-[11px] font-bold uppercase tracking-widest text-emerald-300` (within container: `inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-900/60 border border-emerald-800 rounded-full mb-6`)
**Context:** Section pill badge eyebrow placed above the "Learn from globally certified scholars" `<h2>` heading.

---

### Landing & Funnel Block Components (`src/components/blocks/`)

**File Path:** `src/components/blocks/LandingProblem.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest mb-4` + `text-emerald-600` (or `text-purple-700` with purple accent)
**Context:** Text eyebrow placed directly above the problem/pain points `<h2>` heading.

---

**File Path:** `src/components/blocks/LandingOutcome.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest mb-4` + `text-emerald-400` (dark theme) / `text-emerald-600` (light theme) / `text-purple-300` (purple accent) / dynamic `eyebrowClass`
**Context:** Text eyebrow placed above the 6-month transformation outcome `<h2>` heading.

---

**File Path:** `src/components/blocks/LandingVetting.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest mb-4` + `text-emerald-600` (or `text-purple-600` with purple accent)
**Context:** Text eyebrow placed above the 4-stage teacher vetting mechanism `<h2>` heading.

---

**File Path:** `src/components/blocks/LandingPreview.astro`
**Current Classes:** `text-sm font-bold uppercase tracking-widest mb-4` + `text-emerald-400` (dark theme) / `text-emerald-600` (light theme)
**Context:** Text eyebrow placed above the classroom preview / virtual interface `<h2>` heading in both 50-50 and stacked layouts.

---

**File Path:** `src/components/blocks/LandingTrust.astro`
**Current Classes:** `font-bold tracking-widest text-sm uppercase mb-3 block` + `text-emerald-500` (or `text-purple-700` with purple accent)
**Context:** Text eyebrow placed above the transparency & parent rights `<h2>` heading.

---

**File Path:** `src/components/blocks/LandingOnboarding.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest mb-4` + `text-emerald-600` (light theme) / `text-emerald-400` (dark theme) / `text-purple-600` / `text-purple-300`
**Context:** Centered text eyebrow placed above the 3-step onboarding `<h2>` heading.

---

**File Path:** `src/components/blocks/LandingTestimonials.astro`
**Current Classes:** `text-sm font-bold tracking-widest uppercase mb-4` + `text-emerald-600` (or `text-purple-600` with purple accent)
**Context:** Text eyebrow placed above the testimonials section `<h2>` heading.

---

**File Path:** `src/components/blocks/LandingPricing.astro`
**Current Classes:** `font-bold tracking-widest text-sm uppercase mb-3 block` + `text-emerald-600` (or `text-purple-600` with purple accent)
**Context:** Sticky column text eyebrow placed above the pricing calculator `<h2>` headline.

---

**File Path:** `src/components/blocks/LandingFAQ.astro`
**Current Classes:** `font-bold tracking-widest text-sm uppercase mb-3 block` + `text-emerald-600` (or `text-purple-600` with purple accent)
**Context:** Sticky sidebar text eyebrow placed above the landing FAQ `<h2>` headline.

---

**File Path:** `src/components/blocks/LandingCTA.astro`
**Current Classes:** `text-emerald-500 font-bold tracking-widest text-sm uppercase mb-4 block`
**Context:** Centered text eyebrow placed above the final booking `<h2>` headline in landing funnels.

---

### Homepage Components (`src/pages/_home-components/`)

**File Path:** `src/pages/_home-components/PainPoints.astro`
**Current Classes:** `text-[11px] font-bold uppercase tracking-widest text-emerald-300` (within container: `inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm`)
**Context:** Pill badge eyebrow placed above the "We know exactly how you feel" `<h2>` heading.

---

**File Path:** `src/pages/_home-components/QuranificDifference.astro`
**Current Classes:** `text-[11px] font-bold uppercase tracking-widest text-emerald-700` (within container: `inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Pill badge eyebrow placed above the "This isn't how it used to be taught" `<h2>` heading.

---

**File Path:** `src/pages/_home-components/HowItWorks.astro`
**Current Classes:** `text-[11px] font-bold uppercase tracking-widest text-emerald-700` (within container: `inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Pill badge eyebrow placed above the "Starting is simpler than you think" `<h2>` heading.

---

**File Path:** `src/pages/_home-components/TestimonialGrid.astro`
**Current Classes:** `text-xs font-black tracking-widest uppercase text-emerald-400 block mb-3`
**Context:** Text eyebrow placed above the "Don't take our word for it" `<h2>` heading.

---

### Intent Landing Subcomponents (`src/pages/[intent]/_components/`)

**File Path:** `src/pages/[intent]/_components/LandingGuarantee.astro`
**Current Classes:** `font-bold tracking-widest text-sm uppercase mb-3 block` + `text-emerald-400` (or `text-purple-400` with purple accent)
**Context:** Text eyebrow placed above the "We carry all the risk. You carry none." `<h2>` heading on intent landers.

---

**File Path:** `src/pages/[intent]/_components/HeroAdults.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-emerald-400 mb-8`
**Context:** Eyebrow header placed above the feature list inside the hero credential card.

---

**File Path:** `src/pages/[intent]/_components/HeroWomen.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-emerald-300`
**Context:** Eyebrow header placed next to the shield icon inside the hero credential card.

---

### About Page Subcomponents (`src/pages/about/_components/`)

**File Path:** `src/pages/about/_components/AboutOriginStory.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-amber-700` (within container: `inline-flex items-center bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full mb-6`)
**Context:** Pill badge eyebrow placed above the "How We Started and why we grew" `<h2>` heading.

---

**File Path:** `src/pages/about/_components/AboutMission.astro`
**Current Classes:** `text-xs font-bold tracking-[0.2em] uppercase text-amber-500 block mb-8`
**Context:** Text eyebrow placed above the core mission statement heading.

---

**File Path:** `src/pages/about/_components/AboutPrinciples.astro`
**Current Classes:** `text-xs font-black tracking-widest uppercase text-emerald-700 block mb-3`
**Context:** Text eyebrow placed above the "The principles behind every decision we make" `<h2>` heading.

---

**File Path:** `src/pages/about/_components/AboutTeachers.astro`
**Current Classes:** `text-xs font-black tracking-widest uppercase text-emerald-700 block mb-3`
**Context:** Text eyebrow placed above the "Every teacher holds a chain back to the Prophet ﷺ" `<h2>` heading.

---

**File Path:** `src/pages/about/_components/AboutTeam.astro`
**Current Classes:** `text-xs font-black tracking-widest uppercase text-emerald-700 block mb-3`
**Context:** Text eyebrow placed above the "A community of leaders, educators, and scholars" `<h2>` heading.

---

**File Path:** `src/pages/about/_components/AboutVision.astro`
**Current Classes:** `text-xs font-bold tracking-[0.2em] uppercase text-emerald-400 block mb-4`
**Context:** Text eyebrow placed above the "Every Muslim child, reciting with love" `<h2>` heading.

---

### Course Components (`src/pages/courses/` & `src/components/blocks/`)

**File Path:** `src/pages/courses/_components/CourseHero.astro`
**Current Classes:** `text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white` (within container: `inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full mb-4 shadow-sm`)
**Context:** Pill badge eyebrow placed directly above the course title `<h1>` heading.

---

**File Path:** `src/pages/courses/_components/CourseWhyWho.astro`
**Current Classes:**

1. `text-[11px] font-bold text-emerald-900/50 uppercase tracking-widest mb-1.5 block` (Target Outcome label)
2. `text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-4` ("Ideal For" sub-eyebrow `<h3>`)
3. `text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-4` ("Not For" sub-eyebrow `<h3>`)
   **Context:** Micro-eyebrow section headers inside the Course Why & Who bento card.

---

**File Path:** `src/components/blocks/CourseCard.astro`
**Current Classes:** `text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-gold-700` (within container: `bg-gold-50/95 border border-gold-200 px-2.5 py-1 rounded-full shadow-sm`)
**Context:** Course card header pill badge indicating target student qualification / difficulty level.

---

### Contact & Teachers Subcomponents

**File Path:** `src/pages/contact/_components/SmartContactForm.astro`
**Current Classes:** `text-xs font-black tracking-widest uppercase text-emerald-700 block mb-3`
**Context:** Left-column text eyebrow placed above the "Tell us what you need. We will sort it." `<h2>` heading.

---

**File Path:** `src/pages/contact/_components/AvailabilityTable.astro`
**Current Classes:** `text-xs font-black tracking-widest uppercase text-emerald-700 block mb-3`
**Context:** Left-column text eyebrow placed above the "When you can expect a reply" `<h2>` heading.

---

**File Path:** `src/pages/teachers/_components/TeachersGenderPrivacy.astro`
**Current Classes:** `text-sm font-bold tracking-widest uppercase text-emerald-700 mb-2 block`
**Context:** Text eyebrow placed above the "Dedicated Male & Female Instructors" `<h2>` heading.

---

### Testimonials & Tuition Fee Subcomponents

**File Path:** `src/pages/testimonials/_components/TestimonialsVideoCard.astro`
**Current Classes:**

1. `text-xs font-black uppercase tracking-wider text-emerald-950` (within container: `bg-amber-400 px-3 py-1.5 rounded-md shadow-sm`)
2. `text-sm font-bold tracking-widest uppercase text-white drop-shadow-md mt-6`
   **Context:** "Featured Story" pill badge and "Watch The Parent Experience" action eyebrow inside the video card.

---

**File Path:** `src/pages/tuition-fee/_components/SiblingDiscount.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-wider text-emerald-200` (within container: `inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 mb-6`)
**Context:** Section pill badge eyebrow placed above the "Sibling Discounts" `<h2>` heading.

---

### Legal & Compliance Pages

**File Path:** `src/pages/legal/terms.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-emerald-700` (within container: `inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Hero pill badge eyebrow placed above the "Terms of Service & Safeguarding" `<h1>` heading.

---

**File Path:** `src/pages/legal/cookies.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-emerald-700` (within container: `inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Hero pill badge eyebrow placed above the "Cookie Policy" `<h1>` heading.

---

**File Path:** `src/pages/legal/impressum.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-emerald-700` (within container: `inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Hero pill badge eyebrow placed above the "Legal Notice (Impressum)" `<h1>` heading.

---

**File Path:** `src/pages/legal/privacy.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-emerald-700` (within container: `inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Hero pill badge eyebrow placed above the "Privacy Policy" `<h1>` heading.

---

**File Path:** `src/pages/legal/refund.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-emerald-700` (within container: `inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Hero pill badge eyebrow placed above the "Refund & Tuition Policy" `<h1>` heading.

---

**File Path:** `src/pages/safeguarding/index.astro`
**Current Classes:** `text-xs font-bold uppercase tracking-widest text-emerald-700` (within container: `inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6`)
**Context:** Hero pill badge eyebrow placed above the "Safeguarding & Child Protection Policy" `<h1>` heading.

---

### Global Components

**File Path:** `src/components/global/Footer.astro`
**Current Classes:** `text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-500 mb-5`
**Context:** Heading label applied to every column header in the global footer navigation grid.

---

## Audit Summary: Identified Inconsistencies for Lead Engineer

| Element Style Category       | Sizes in Use                                             | Weights in Use               | Trackings in Use                                        | Typical Containers                                    |
| :--------------------------- | :------------------------------------------------------- | :--------------------------- | :------------------------------------------------------ | :---------------------------------------------------- |
| **Pill Badge Eyebrows**      | `text-[11px]`, `text-xs`, `text-[11px] sm:text-xs`       | `font-bold`                  | `tracking-widest`, `tracking-wider`                     | `inline-flex ... rounded-full px-3/px-4 py-1/py-1.5`  |
| **Standalone Text Eyebrows** | `text-[11px]`, `text-xs`, `text-sm`                      | `font-bold`, `font-black`    | `tracking-widest`, `tracking-wider`, `tracking-[0.2em]` | `<p>` or `<span>` block with `mb-3` / `mb-4` / `mb-8` |
| **Micro Labels / Card Tags** | `text-[8px] sm:text-[9px]`, `text-[10px]`, `text-[11px]` | `font-bold`, `font-semibold` | `tracking-wide`, `tracking-wider`, `tracking-widest`    | Inline tags within bento/cards                        |
