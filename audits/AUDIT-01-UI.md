# PHASE 1: UI AUDIT FINDINGS

### [UI-01] Container/Layout consistency
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/styles/global.css` (lines 62-64), `src/pages/index.astro` (lines 148, 196, etc.)
- Issue: `quranific-container` utility is defined globally (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) but many files still write out the inline classes explicitly instead of using the unified `@apply` utility class.
- Why it matters: Redundant classes increase bundle size and make global layout width/padding updates error-prone.
- Suggested direction: Standardize all major sections to use the utility class directly.

### [UI-02] Spacing scale discipline
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/pages/tuition-fee.astro` (line 580), `src/pages/how-it-works.astro` (lines 143, 564), `src/pages/courses/index.astro` (lines 369, 392), `src/pages/careers.astro` (line 504)
- Issue: Arbitrary Tailwind positioning and padding values are widespread (e.g., `left-[17px]`, `top-[30px]`, `ml-[68px]`, `left-[45px]`).
- Why it matters: Breaks the grid and spacing system, showing lack of systematic design and undermining premium positioning.
- Suggested direction: Snap arbitrary values to the closest Tailwind spacing scale (e.g., `ml-[68px]` → `ml-16`).

### [UI-03] Button componentization gaps
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/components/global/Header.astro` (line 81), `src/pages/index.astro` (line 393)
- Issue: Raw anchor tags (e.g., `<a class="px-6 py-3 text-sm font-bold text-white bg-emerald-700...">`) are used for primary CTAs instead of the standardized `Button.astro` component.
- Why it matters: Leads to inconsistent button sizes, hover states, and tap targets across the site.
- Suggested direction: Replace raw anchor CTAs with the `<Button>` component utilizing its `variant` props.

### [UI-04] Color token discipline
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/pages/legal/terms.astro` (lines 23-175) and widespread across the site (>510 instances)
- Issue: Hardcoded hex colors (e.g., `text-[#047857]`, `bg-[#022c22]`, `bg-[#fefdf9]`) are used extensively, bypassing the defined Tailwind v4 variables (`--color-emerald-700`, `--color-emerald-950`).
- Why it matters: Undermines the premium/edge-modern consistency claim and makes global theme updates impossible without manual find-and-replace.
- Suggested direction: Replace hardcoded hex values with the semantic Tailwind color classes defined in `global.css`.

### [UI-05] Typography scale
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/pages/tuition-fee.astro` (lines 278, 522), `src/pages/teachers.astro` (line 291), `src/pages/contact.astro` (lines 83, 84, 123)
- Issue: Arbitrary font sizes like `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]`, `text-[17px]` are heavily used instead of Tailwind's semantic scales (`text-xs`, `text-sm`, `text-base`).
- Why it matters: Inconsistent typography breaks vertical rhythm and introduces accessibility issues (e.g., `text-[10px]` is below legibility floor).
- Suggested direction: Enforce Tailwind's typography scale and replace all arbitrary values.
