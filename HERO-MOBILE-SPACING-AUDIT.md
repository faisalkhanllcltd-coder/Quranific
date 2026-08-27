# Mobile Hero Spacing & Clearance Audit

**Auditor:** AntiGravity World-Class Auditor (Automated Inspection Suite)  
**Date:** 2026-08-27  
**Viewport Evaluated:** 375px × 812px (Mobile Default Breakpoint)  
**Repo:** `Quranific-live`  
**Status:** READ-ONLY AUDIT COMPLETE

---

## Executive Summary

A comprehensive, deterministic audit was performed across all routes and hero components in `src/pages/` and `src/components/` at a mobile viewport width of **375px**.

- **Total Hero Types / Components Analyzed:** 6 categories (22 distinct page routes audited).
- **Header Position & Mobile Height:** Sticky wrapper `position: sticky; top: 0; height: 72px`. With announcement promo bar active at 375px (`47.42px` due to text wrapping), total header stack height is `119.42px`. When dismissed, header stack is `72.00px`.
- **Pages Flagged as `TOO TIGHT` (< 12px gap):** **3 pages** (`/`, `/about`, `/contact`) with a measured gap of **8.00px**.
- **Primary Root Cause:** `PageHero.astro` line 38 uses `-mt-[72px] pt-[80px]` (providing only 8px net clearance). Non-visual pages receive an additional `pt-2` (8px) on their inner container (`total 16px`), whereas visual variants lack this inner container padding and remain at 8px.

---

## TASK 1 — Full Inventory of Hero Components & Routes

All routes rendering hero or top-of-page badge/H1 patterns across the codebase:

| Hero Component / Pattern                      | File Path                                         | Rendered Route(s)                                                                                                                                                                                                                                 | Layout Used                             |
| --------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **`PageHero.astro`** (Visual Variant)         | `src/components/blocks/PageHero.astro`            | `/`<br>`/about`<br>`/contact`                                                                                                                                                                                                                     | `Base.astro` + `Header.astro`           |
| **`PageHero.astro`** (Non-Visual Variant)     | `src/components/blocks/PageHero.astro`            | `/courses`<br>`/faq`<br>`/teachers`<br>`/testimonials`<br>`/tuition-fee`                                                                                                                                                                          | `Base.astro` + `Header.astro`           |
| **`CourseHero.astro`** (Dynamic Overlay Hero) | `src/pages/courses/_components/CourseHero.astro`  | `/courses/[slug]` (6 routes:<br>`/courses/basic-qaida`<br>`/courses/quran-reading-with-tajweed`<br>`/courses/quran-memorization`<br>`/courses/quran-translation-with-tafsir`<br>`/courses/advanced-tajweed-ijazah`<br>`/courses/arabic-language`) | `Page.astro` (`Base` + `Header`)        |
| **`HeroKids.astro`** (Ad-Lander Hero)         | `src/pages/[intent]/_components/HeroKids.astro`   | `/quran-classes/for-kids`<br>`/quran-teacher/for-kids`                                                                                                                                                                                            | `Landing.astro` (Dedicated Logo Header) |
| **`HeroAdults.astro`** (Ad-Lander Hero)       | `src/pages/[intent]/_components/HeroAdults.astro` | `/quran-classes/for-adults`<br>`/quran-teacher/for-adults`                                                                                                                                                                                        | `Landing.astro` (Dedicated Logo Header) |
| **`HeroWomen.astro`** (Ad-Lander Hero)        | `src/pages/[intent]/_components/HeroWomen.astro`  | `/quran-classes/for-women`<br>`/quran-teacher/for-women`                                                                                                                                                                                          | `Landing.astro` (Dedicated Logo Header) |
| **Safeguarding Hero** (Inline Hero)           | `src/pages/safeguarding/index.astro`              | `/safeguarding`                                                                                                                                                                                                                                   | `Page.astro` (`Base` + `Header`)        |
| **Legal Suite Heroes** (Inline Hero)          | `src/pages/legal/*.astro`                         | `/legal/terms`<br>`/legal/privacy`<br>`/legal/refund`<br>`/legal/impressum`<br>`/legal/cookies`                                                                                                                                                   | `Base.astro` + `Header.astro`           |
| **Blog Index / Slug Headers**                 | `src/pages/blog/*.astro`                          | `/blog`<br>`/blog/[slug]`                                                                                                                                                                                                                         | `Base.astro` + `Header.astro`           |
| **Portals Hub Header**                        | `src/pages/portals/index.astro`                   | `/portals`                                                                                                                                                                                                                                        | `Base.astro` + `Header.astro`           |
| **Funnel Flow Headers**                       | `src/pages/getting-started/*.astro`               | `/getting-started/signup`<br>`/getting-started/complete`<br>`/getting-started/success`                                                                                                                                                            | `Funnel.astro` (Brand Panel)            |
| **Error Page Heroes**                         | `src/pages/404.astro`, `500.astro`                | `/404`<br>`/500`                                                                                                                                                                                                                                  | `Base.astro` + `Header.astro`           |

_Note on legacy/prompt references_: `HomeHero.astro` and `ContactHero.astro` were consolidated into `PageHero.astro`. Dedicated landing heroes reside under `src/pages/[intent]/_components/`.

---

## TASK 2 — Header Behavior & Document Flow

### Architecture in `src/components/global/Header.astro`:

1. **Position:** Sticky. Outer container is `<div class="sticky top-0 z-50 w-full h-[72px]">`.
2. **Layout Space Reservation:** In CSS, `position: sticky` participates in normal document flow. The 72px wrapper reserves 72px of vertical layout space.
3. **Announcement Bar (`#promo-bar`):** Sits directly above the sticky wrapper in normal flow (`position: relative; display: flex`).
   - At desktop (≥768px), rendered height is `~28px`.
   - At 375px mobile viewport, two-line text wrapping increases rendered height to **`47.42px`**.
   - Total document flow height occupied by Header stack at top of page: **`119.42px`** (47.42px + 72.00px).
   - If promo bar is dismissed, Header stack is **`72.00px`**.
4. **Content Overlap Mechanism:**
   - Downstream components that want a seamless background behind the transparent sticky header deliberately apply a negative margin `-mt-[72px]`.
   - Components that do not use negative margins (e.g. `CourseHero`, `safeguarding`, `legal/*`) begin rendering immediately below the 72px sticky header space in standard document flow.

---

## TASK 3 — Per-Hero Raw Spacing Classes (Mobile Default)

| Component                                                                                                   | Outer Section / Wrapper Classes                                                                                                                                   | Eyebrow / Badge Classes                                                                                                                                                                                    | Unprefixed Spacing Values                                                                                            |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **`PageHero.astro` (Visual Variant: `/`, `/about`, `/contact`)**                                            | `relative bg-cream-50 overflow-hidden selection:bg-emerald-200 selection:text-emerald-950 -mt-[72px] pt-[80px] md:pt-[84px] lg:pt-[88px] pb-16 md:pb-24 lg:pb-32` | `inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full bg-white border border-emerald-200/60 text-emerald-800 mb-6 lg:mb-8 shadow-sm` | Section: `margin-top: -72px`, `padding-top: 80px`<br>Inner Grid: `padding-top: 0px`<br>**Net Clearance: 8px**        |
| **`PageHero.astro` (Non-Visual Variant: `/courses`, `/faq`, `/teachers`, `/testimonials`, `/tuition-fee`)** | `relative bg-cream-50 overflow-hidden selection:bg-emerald-200 selection:text-emerald-950 -mt-[72px] pt-[80px] md:pt-[84px] lg:pt-[88px] pb-16 md:pb-24 lg:pb-32` | `inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full bg-white border border-emerald-200/60 text-emerald-800 mb-6 lg:mb-8 shadow-sm` | Section: `margin-top: -72px`, `padding-top: 80px`<br>Inner Div: `padding-top: pt-2 (8px)`<br>**Net Clearance: 16px** |
| **`CourseHero.astro` (`/courses/[slug]`)**                                                                  | `relative bg-slate-950 pt-[92px] pb-24 md:pt-[96px] md:pb-28 overflow-hidden w-full max-w-[100vw]`                                                                | `inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-4 shadow-sm` | Section: `margin-top: 0px`, `padding-top: 92px`<br>**Net Clearance: 92px**                                           |
| **`HeroKids.astro` (`/quran-classes/for-kids`, `/quran-teacher/for-kids`)**                                 | `relative overflow-hidden border-b border-emerald-100` (Inner: `quranific-container relative z-10 py-8`)                                                          | `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-emerald-100 shadow-sm mb-6`                                                                                              | Header: `margin-bottom: 32px (mb-8)`<br>Inner: `padding-top: 32px (py-8)`<br>**Net Clearance: 32px**                 |
| **`HeroAdults.astro` (`/quran-classes/for-adults`, `/quran-teacher/for-adults`)**                           | `relative overflow-hidden bg-emerald-950` (Inner: `quranific-container relative z-10 py-8`)                                                                       | `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 shadow-sm mb-6`                                                                                  | Header: `margin-bottom: 32px (mb-8)`<br>Inner: `padding-top: 32px (py-8)`<br>**Net Clearance: 32px**                 |
| **`HeroWomen.astro` (`/quran-classes/for-women`, `/quran-teacher/for-women`)**                              | `relative overflow-hidden bg-emerald-950` (Inner: `quranific-container relative z-10 py-8`)                                                                       | `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 shadow-sm mb-6`                                                                                  | Header: `margin-bottom: 32px (mb-8)`<br>Inner: `padding-top: 32px (py-8)`<br>**Net Clearance: 32px**                 |
| **`safeguarding/index.astro`**                                                                              | `pt-8 sm:pt-12 md:pt-16 pb-12 px-4 sm:px-6 border-b border-emerald-100 bg-white`                                                                                  | `inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 mb-6`                 | Wrapper: `margin-top: 0px`, `padding-top: 32px (pt-8)`<br>**Net Clearance: 32px**                                    |
| **`legal/*.astro` (`terms`, `privacy`, `refund`, `impressum`, `cookies`)**                                  | `pt-8 md:pt-12 pb-10 lg:pt-14 lg:pb-14 px-4 sm:px-6 border-b border-emerald-100 bg-white`                                                                         | `inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 mb-6`                 | Wrapper: `margin-top: 0px`, `padding-top: 32px (pt-8)`<br>**Net Clearance: 32px**                                    |

---

## TASK 4 — Real Rendered Measurements at 375px Mobile Viewport

All values measured via browser DOM `getBoundingClientRect()` at viewport dimensions `375px × 812px`:

| Route                                     | Hero Component                | Header Bottom           | Eyebrow Top           | Measured Gap (px) | Audit Verdict |
| ----------------------------------------- | ----------------------------- | ----------------------- | --------------------- | ----------------- | ------------- |
| **`/`**                                   | `PageHero.astro` (Visual)     | 119.42px                | 127.42px              | **8.00px**        | **TOO TIGHT** |
| **`/about`**                              | `PageHero.astro` (Visual)     | 119.42px                | 127.42px              | **8.00px**        | **TOO TIGHT** |
| **`/contact`**                            | `PageHero.astro` (Visual)     | 119.42px                | 127.42px              | **8.00px**        | **TOO TIGHT** |
| **`/courses`**                            | `PageHero.astro` (Non-Visual) | 119.42px                | 135.42px              | **16.00px**       | PASS          |
| **`/faq`**                                | `PageHero.astro` (Non-Visual) | 119.42px                | 135.42px              | **16.00px**       | PASS          |
| **`/teachers`**                           | `PageHero.astro` (Non-Visual) | 119.42px                | 135.42px              | **16.00px**       | PASS          |
| **`/testimonials`**                       | `PageHero.astro` (Non-Visual) | 119.42px                | 135.42px              | **16.00px**       | PASS          |
| **`/tuition-fee`**                        | `PageHero.astro` (Non-Visual) | 119.42px                | 135.42px              | **16.00px**       | PASS          |
| **`/courses/basic-qaida`**                | `CourseHero.astro`            | 119.42px                | 211.42px (breadcrumb) | **92.00px**       | PASS          |
| **`/courses/quran-reading-with-tajweed`** | `CourseHero.astro`            | 119.42px                | 299.42px (eyebrow)    | **180.00px**      | PASS          |
| **`/quran-classes/for-kids`**             | `HeroKids.astro`              | 64.00px (Lander header) | 96.00px               | **32.00px**       | PASS          |
| **`/quran-teacher/for-kids`**             | `HeroKids.astro`              | 64.00px (Lander header) | 96.00px               | **32.00px**       | PASS          |
| **`/quran-classes/for-adults`**           | `HeroAdults.astro`            | 64.00px (Lander header) | 96.00px               | **32.00px**       | PASS          |
| **`/quran-teacher/for-adults`**           | `HeroAdults.astro`            | 64.00px (Lander header) | 96.00px               | **32.00px**       | PASS          |
| **`/quran-classes/for-women`**            | `HeroWomen.astro`             | 64.00px (Lander header) | 96.00px               | **32.00px**       | PASS          |
| **`/quran-teacher/for-women`**            | `HeroWomen.astro`             | 64.00px (Lander header) | 96.00px               | **32.00px**       | PASS          |
| **`/safeguarding`**                       | Inline Hero                   | 119.42px                | 151.42px              | **32.00px**       | PASS          |
| **`/legal/terms`**                        | Inline Hero                   | 119.42px                | 151.42px              | **32.00px**       | PASS          |
| **`/legal/privacy`**                      | Inline Hero                   | 119.42px                | 151.42px              | **32.00px**       | PASS          |
| **`/legal/refund`**                       | Inline Hero                   | 119.42px                | 151.42px              | **32.00px**       | PASS          |
| **`/legal/impressum`**                    | Inline Hero                   | 119.42px                | 151.42px              | **32.00px**       | PASS          |
| **`/legal/cookies`**                      | Inline Hero                   | 119.42px                | 151.42px              | **32.00px**       | PASS          |

---

## TASK 5 — Root Cause Analysis for Flagged Pages

### Flagged Pages:

1. `/` (Homepage)
2. `/about` (About Us)
3. `/contact` (Contact)

### Exact Root Cause:

In `src/components/blocks/PageHero.astro`:

- **Line 38:**
  ```astro
  '-mt-[72px] pt-[80px] md:pt-[84px] lg:pt-[88px]', // SPACING-AUDIT: 8/12/16px net breathing room
  above content
  ```
  The section applies an unprefixed negative margin `-mt-[72px]` to offset the 72px sticky header. The mobile padding-top `pt-[80px]` mathematically leaves only `80px - 72px = 8px` of net top clearance.
- **Asymmetry between Visual and Non-Visual Hero Variants:**
  - In the **non-visual variant** (`hasVisual = false`), line 123 includes `pt-2 md:pt-4` (`<div class="... pt-2 md:pt-4">`), adding an extra 8px of top padding, resulting in `8px + 8px = 16px` net clearance (PASS).
  - In the **visual variant** (`hasVisual = true`), line 74 defines the container as `<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start lg:items-center">` without any `pt-*` padding, leaving the gap at exactly **8.00px**, which violates the 12px minimum spacing threshold.
