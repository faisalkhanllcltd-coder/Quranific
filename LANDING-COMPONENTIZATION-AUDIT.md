# LANDING-COMPONENTIZATION-AUDIT.md

_Read-only audit — 2026-08-17_
_Scope: src/pages/[intent]/for-kids.astro, for-adults.astro, for-women.astro_

---

## TASK 1 — STATUS OF PREVIOUSLY FLAGGED ISSUES

### [ASSET: ...] placeholder strings visible in rendered output

- for-kids.astro §5 Video Preview: FIXED — real img + play overlay, no placeholder text
- for-adults.astro §5 Look Inside L479: STILL PRESENT — "[ASSET: 30s adult portal screen recording — shared Mushaf, distraction-free UI]" inside bg-slate-200 div, will render in production
- for-women.astro §3 Outcome L406: STILL PRESENT — "[ASSET: Sister reading Quran peacefully — warm, aspirational lifestyle photo]" inside bg-slate-200 div
- for-women.astro §5 Look Inside L488: STILL PRESENT — "[ASSET: 30s portal screen recording — Ustadha session, distraction-free, shared Mushaf]" inside bg-slate-200 div

### Dead-space sections layout

- Problem §2 all 3 files: max-w-3xl single-column prose only, no empty column. Intentional.
- Guarantee §9: Kids=dark single-col text+grid+CTA, no dead space. Adults/Women=light 2-col, text+CTA left, checkmark list right, no empty column. FIXED / was never actually empty-column.
- FAQ §10 all 3: max-w-3xl single-col dl divide-y. No empty column.

### CTA button color consistency — Guarantee vs Final CTA

- Kids: Guarantee CTA = raw <a> bg-emerald-600 (green). Final CTA = Button secondary (orange). INCONSISTENT. Guarantee also bypasses Button.astro entirely.
- Adults: Guarantee CTA = raw <a> bg-emerald-600 (green). Final CTA = Button secondary (orange). INCONSISTENT — same label "Book Your Free Class", two different colors.
- Women: Guarantee CTA = Button variant="primary" (green). Final CTA = Button variant="secondary" (orange). INCONSISTENT — still two colors for same label.

### Unverified numeric stats

- for-kids.astro hero: FIXED — replaced with qualitative "Trusted by families worldwide" block
- for-adults.astro hero: FIXED — replaced with qualitative trust text
- for-women.astro hero: FIXED — replaced with qualitative trust text

### Emoji in Adults/Women hero cards

- for-adults.astro: FIXED — all 4 emoji replaced with inline SVG stroke icons (stroke-width="2")
- for-women.astro: FIXED — all 4 emoji replaced with inline SVG stroke icons (stroke-width="2")

### CTA sizing — current actual values

- Kids/Adults hero primary CTA: raw <a> px-8 py-4 rounded-xl font-bold text-lg (NOT through Button.astro — also missing data-track-cta)
- Kids/Adults guarantee CTA: same raw <a> pattern
- Women hero primary CTA: Button px-6 py-3 text-sm (correct)
- All pages final CTA: Button secondary px-8 py-4 text-base font-bold (correct)
- FINDING: Kids and Adults hero+guarantee CTAs still use raw <a> tags with rounded-xl and text-lg, bypassing Button.astro and the attribution script. The earlier sizing patch only caught Button-wrapped CTAs.

---

## TASK 2 — SECTION-BY-SECTION STRUCTURAL MAP

§1 HERO: FUNDAMENTALLY DIFFERENT per audience
Kids: light bg-cream-50 + dot-grid, split layout with real image right
Adults: dark bg-emerald-950 + grid-line texture, floating credential card right
Women: dark bg-emerald-950 + purple dot-grid + purple glow, privacy card right with purple icon
-> 3 distinct designs. Cannot share one component.

§2 PROBLEM: STRUCTURALLY IDENTICAL, copy-only diff
Same max-w-3xl prose, eyebrow, H2, 2xp body across all 3. Safe to extract.

§3 OUTCOME: STRUCTURALLY SIMILAR, 1 layout divergence
Same 2-col grid + left copy. Right col: Kids=real img, Adults=real img, Women=placeholder div.
Divergence is a content gap (missing asset), not a design difference.

§4 MECHANISM/VETTING: STRUCTURALLY SIMILAR, accent-color diff
Same ol sm:grid-cols-2 + 1-on-1 callout. Callout: Kids=gold, Adults/Women=dark glass.
Icon accent: Kids/Adults=emerald, Women=purple. Step 3 body copy is audience-specific.

§5 LOOK INSIDE: FUNDAMENTALLY DIFFERENT per audience (content gap)
Kids: real image in dark section. Adults/Women: bg-slate-200 placeholder stubs in light section.
Cannot share until assets exist. Kids and Adults/Women are also different background colors.

§6 TRUST: STRUCTURALLY IDENTICAL, accent-color diff
Same 2-col layout, same checkmark SVG (stroke-width="2.5").
Col order: Kids=text-left/list-right; Adults/Women=list-left/text-right.
Accent: Kids/Adults=text-emerald-600, Women=text-purple-600. Copy only diff. Extractable with props.

§7 ONBOARDING: STRUCTURALLY SIMILAR, background + accent diff
Same md:grid-cols-3 ol. Step circle: Kids/Adults=bg-emerald-600, Women=bg-purple-700/60.
Background: Kids=bg-emerald-50, Adults/Women=bg-emerald-950. Extractable with theme prop.

§8 TESTIMONIALS: STRUCTURALLY SIMILAR, grid/count diff
Identical card markup. Grid: Kids=md:grid-cols-3 max-w-5xl, Adults=md:grid-cols-2 max-w-4xl, Women=max-w-xl (single card).
Avatar accent: Women light cards use purple-100/purple-700, others use emerald. Extractable with cols+testimonials props.

§9 GUARANTEE: STRUCTURALLY SIMILAR but large layout divergence
Kids: dark bg-emerald-950, single-col text block + 3-col card grid + raw <a> CTA below.
Adults/Women: light bg-cream-50, 2-col grid, text+CTA left, checkmark list right.
Button type divergence (raw <a>, Button primary, Button secondary) must be resolved before safe extraction.

§10 FAQ: STRUCTURALLY IDENTICAL, copy-only diff
Same max-w-3xl dl divide-y, same py-7 item, same optional link field. Safe to extract.

§11 FINAL CTA: STRUCTURALLY SIMILAR, alignment + WA-button diff
Same bg-emerald-950 H2. Kids=text-center, single Button secondary. Adults/Women=left-aligned + Button secondary + Button ghost WA.
Eyebrow: Kids/Adults=text-emerald-400, Women=text-purple-300. Extractable with props.

SUMMARY: 2 identical (Problem, FAQ) | 5 similar (Outcome, Trust, Onboarding, Testimonials, Final CTA) | 2 layout-divergent (Mechanism callout, Guarantee) | 1 fundamentally different (Hero) | 1 divergent due to content gap not design (Look Inside)

---

## TASK 3 — EXISTING COMPONENT INVENTORY

Section -> Existing component -> Verdict:

- Hero: HomeHero.astro, PageHero.astro -> Neither usable (no intent routing, no ad-lander mode). New per-audience heroes or highly-configurable LandingHero.astro needed.
- Problem: PainPoints.astro -> Reuse candidate — verify prop shape (eyebrow/headline/body[])
- Outcome: none -> New LandingOutcome.astro needed
- Mechanism/Vetting: QuranificDifference.astro -> Different purpose; card pattern similar but not directly reusable
- Look Inside: HowItWorks.astro -> Wrong purpose. New LandingPreview.astro needed
- Trust: ValuePillars.astro -> Possible reuse — verify. Landing uses 2-col checkmark layout.
- Onboarding: HowItWorks.astro -> Direct reuse candidate — verify steps[] prop support and bg theming
- Testimonials: TestimonialGrid.astro -> Direct reuse candidate — verify testimonials[] prop and variable grid cols
- Guarantee: none -> New LandingGuarantee.astro needed
- FAQ: FAQAccordion.astro -> Exists but landing uses plain dl/divide-y not accordion. Extract LandingFAQ.astro or migrate to accordion.
- Final CTA: FinalCTA.astro (8.5kb), AdultCTA.astro -> Direct reuse candidate — verify headline/subhead/ctaHref/ctaLabel/whatsapp props and dark bg support
- UI primitives: Button.astro (used), Section.astro (unused on landers), Badge.astro (unused)

---

## TASK 4 — DATA MODEL VERDICT

CLEAN. All per-audience copy is already structured as typed config objects or arrays in frontmatter.
No inline string literals scattered in JSX markup.

Shape per file:
intentCopy: Record<Intent, { h1, subhead, seoTitle, seoDesc }> <- hero copy
vettingSteps: Array<{ n, title, body, icon: string }> <- SVG icon as template literal
trustPoints: string[]
onboardingSteps: Array<{ n, title, body }>
guaranteeCards: Array<{ label, sub }>
faqItems: Array<{ q, a, link?: { text, href } }>
xTestimonials = TESTIMONIALS_DATA.filter(...)

Componentization = extract markup + pass content object as props. No data restructuring needed.
One friction: vettingSteps[].icon is an inline SVG string requiring Fragment set:html in any child component.

---

## TASK 5 — CRITICAL LOGIC PRESERVATION NOTES

### getStaticPaths() / intent routing

Must stay page-level. Cannot be moved into a component.
Components receive `intent` as a prop from the page.

### noindex/canonical Base props

Must remain on <Base> at page level. Never inside a section component.
Pattern: robots="noindex, follow" + canonical = ${SITE.url}/quran-classes/for-[audience]

### Attribution script

<script is:inline> — must stay inline (not bundled by Vite).
Must remain at page level after all CTA elements in DOM.
All CTAs must use data-track-cta attribute.
PRE-EXISTING BUG: Kids and Adults hero+guarantee CTAs are raw <a> tags WITHOUT data-track-cta -> attribution script cannot see them.
Women comment at L808 says "Targets both data-track-cta and .cta-booking-btn" but code is correct (data-track-cta only) — stale comment only.

### TESTIMONIALS_DATA import
Filter must stay at page level or pre-filtered array passed to TestimonialGrid as prop.
Do not duplicate or hardcode testimonials inside any component.
t.theme field drives dark/light card styling — must survive extraction.

### JSON-LD
Must stay at page level, slot="head". Do not move to any section component.

---

## TASK 6 — HYDRATION RISK

Zero client-side hydration on all 3 pages. No client:* directives anywhere.
Single <script is:inline> is vanilla JS, not a framework component.
Risk from componentization: LOW if all components remain .astro files.
Risk becomes HIGH if any component is accidentally implemented as Svelte/React and given a client:* directive.
set:html nuance: vettingSteps icon strings passed as props to child components must use <Fragment set:html={icon}> not {icon} (which would escape SVG). Easy to get wrong silently.

---

## TASK 7 — RECOMMENDED EXTRACTION ORDER (report only, do not execute)

1. FAQ §10 (lowest risk) — identical markup, no images/icons, pure dl+copy props
2. Problem §2 — identical structure, verify PainPoints.astro reuse first
3. Onboarding §7 — same card grid, verify HowItWorks.astro reuse first
4. Trust §6 — identical structure, accent-color + col-order props
5. Testimonials §8 — identical card markup, verify TestimonialGrid.astro reuse first
6. Final CTA §11 — similar structure, verify FinalCTA.astro reuse first
7. Outcome §3 — same grid, right col is image vs placeholder (content gap)
8. Mechanism/Vetting §4 — per-audience step copy + 3 callout color variants + set:html icons
9. Guarantee §9 — large dark/light layout divergence + CTA button type inconsistency must be resolved first
10. Look Inside §5 — unresolved asset stubs (adults/women); cannot extract until real assets exist
11. Hero §1 (highest risk, last) — 3 fundamentally different designs; keep page-specific or create 3 separate hero components

---

## ADDITIONAL FINDINGS

### Raw <a> CTAs bypassing Button.astro on Kids + Adults
Hero primary CTA and Guarantee CTA on kids and adults are raw <a> tags:
- Missing data-track-cta -> attribution script ignores them (pre-existing bug)
- Use rounded-xl (banned by audit)
- Use text-lg (oversized)
- Hover shimmer is copy-pasted inline, not from Button.astro

### Women outer wrapper still bg-white (Step 7 incomplete)
for-women.astro L146: <div class="bg-white antialiased"> — opening class is still bg-white.
Close comment at L802 says /bg-cream-50 (patched) but opening tag was not updated.
Kids and Adults correctly have bg-cream-50. One-line fix needed.
