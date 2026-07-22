# PHASE 2: UX AUDIT FINDINGS

### [UX-01] Navigation Logic Disparity
- Severity: Critical
- Confidence: [CODE-VERIFIED]
- File(s): `src/constants/site.ts` (lines 81-97), `src/components/global/Header.astro`, `src/components/global/MobileMenu.astro`
- Issue: The `MAIN_NAVIGATION` (desktop) has 4 items, while `MOBILE_NAVIGATION` has 8 items (adding Teachers, About, FAQ, Contact).
- Why it matters: Mobile users get a fundamentally different navigation architecture than desktop users, leading to inconsistent discovery paths.
- Suggested direction: Align desktop and mobile navigation hierarchies so core pages are discoverable on both platforms.

### [UX-02] Competing CTA Hierarchy
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/pages/index.astro` (lines 389-397)
- Issue: The Adult CTA section presents "Book Adult Trial Class" (white variant) and "Ask a Question" (transparent bordered variant) buttons side-by-side with competing visual weight.
- Why it matters: Competes for user attention and dilutes the primary conversion goal.
- Suggested direction: Ensure the primary action is visually dominant and the secondary action is visually recessed.

### [UX-03] Form UX - Missing Inline Error States
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/components/sections/ContactForm.astro` (lines 24-40)
- Issue: The form inputs (`firstName`, `lastName`, `email`, `message`) lack explicit inline error states or `aria-invalid` toggling for individual fields upon failed submission.
- Why it matters: Users must rely on a single generic message box at the top instead of contextual field-level feedback.
- Suggested direction: Add dynamic error state classes and `aria-describedby` error text per input field.

### [UX-04] Undersized Mobile Interaction Targets
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/components/global/Header.astro` (line 30)
- Issue: The promo bar close button uses `p-3` (12px) with a `14px` SVG, computing to roughly 38px tap target.
- Why it matters: Fails the 44px minimum touch target guideline, causing friction for mobile users attempting to dismiss the banner.
- Suggested direction: Increase the padding or set a strict `min-w-[44px] min-h-[44px]` on the button.
