# Course Detail Page Audit

**File:** `src/pages/courses/[slug].astro`
**Date:** 2026-08-09
**Mode:** Read-only forensic audit — no edits made.

---

## TASK 1 — DATA LAYER

### `Course` Interface (complete)

```typescript
export interface Course {
  // Identity
  slug: CourseSlug; // union of 6 literal string values
  title: string;
  shortTitle: string; // tight-space UI (dropdowns, mobile headers)

  // Copy
  shortDesc: string; // card previews, meta description source
  longDesc: string; // hero paragraph on the detail page

  // Visual
  icon: string; // SVG path data (Heroicons stroke-1.5)

  // Classification
  level: CourseLevel; // 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  category: CourseCategory; // 'Kids' | 'Adult' | 'All Ages' | 'Specialist'

  // Scheduling
  duration: string; // human-readable e.g. "Avg. 2–3 Months"
  durationMinutes: 30 | 45 | 60;
  ageRange: string;
  frequency: string; // e.g. "2–3 sessions/week"

  // Pricing (display label only — not used for calculation)
  price: string; // e.g. "From $39/mo" — suppressed on detail page

  // Page content
  features: string[]; // 4 bullet points for "What You Will Learn"

  // Assets
  riveFile: string; // animation filename (not rendered anywhere yet)

  // Optional flags
  highlight?: string; // badge text e.g. "Most Popular"
  nooraniQaida?: boolean;
  hifzIncluded?: 'full' | 'partial' | 'none';
  senAdapted?: boolean;
  groupSize?: string; // declared but never populated in any entry
}
```

### Example entry — `quran-reading-with-tajweed`

```typescript
{
  slug: 'quran-reading-with-tajweed',
  title: 'Quran Reading with Tajweed',
  shortTitle: 'Tajweed',
  shortDesc: 'Read the Quran fluently with correct Tajweed rules. Ideal for all ages.',
  longDesc: 'Transition from basic reading to beautiful, fluent Quranic recitation...',
  icon: 'M12 14l9-5-9-5-9 5 9 5z ...',
  level: 'All Levels',
  category: 'All Ages',
  duration: 'Avg. 4–6 Months',
  durationMinutes: 45,
  ageRange: 'Ages 8+',
  frequency: '2–4 sessions/week',
  price: 'From $49/mo',
  features: [
    '1-on-1 personalized learning pace',
    'Focus on practical, beautiful Tajweed application',
    'Audio recording analysis for pronunciation correction',
    'Secure, monitored virtual classrooms',
  ],
  riveFile: 'tajweed.riv',
  highlight: 'Most Popular',
}
```

### Schema assessment

**The schema does NOT support real per-course content depth.** Every course currently has 4 features max. There is no data field for:

- Curriculum breakdown / module structure
- "Who this course is for" (distinct from ageRange — narrative form)
- "Why this course" / unique differentiator copy
- Teacher-specific info (qualification detail, speciality match per course)
- Prerequisites / "what you need before starting"
- Typical lesson structure
- Assessment / certification path

**Verdict:** New rich content requires a schema change. The four fields that come closest — `longDesc`, `features[]`, `level`, `category` — are thin shells. `features[]` maxes out at 4 short bullets. A `sections?: CourseSection[]` or `curriculum?: string[]` field would be the minimal addition. `groupSize` is declared but null in every record — either populate or drop.

---

## TASK 2 — COMPONENT INVENTORY

Render order (top → bottom):

| #   | Component             | File                                           | Hydration                      | Notes                                                                    |
| --- | --------------------- | ---------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| 1   | `Page`                | `layouts/Page.astro`                           | none (SSR layout)              | Wraps full page; delegates to Base.astro                                 |
| 2   | `Breadcrumb`          | `components/seo/Breadcrumb.astro`              | none                           | Renders BreadcrumbList JSON-LD + visual nav                              |
| 3   | Inline hero markup    | `[slug].astro` L69–154                         | none                           | Raw `<div>`, `<h1>`, `<a>` tags directly in page                         |
| 4   | Quick Facts strip     | `[slug].astro` L157–193                        | none                           | Raw `<div>` grid                                                         |
| 5   | Features section      | `[slug].astro` L196–225                        | none                           | `course.features.map(...)` — raw markup                                  |
| 6   | `PricingCalculator`   | `components/fees/PricingCalculator.svelte`     | **`client:visible`** ✅        | liveRates prop correctly wired                                           |
| 7   | `TeacherTeaserBanner` | `components/courses/TeacherTeaserBanner.astro` | none                           | Static, no interactivity needed                                          |
| 8   | `CoursesFAQ`          | `components/courses/CoursesFAQ.astro`          | none (progressive `<details>`) | Uses `faqs.courses` — same FAQ set on every course page (not per-course) |
| 9   | `FinalCTA`            | `components/sections/FinalCTA.astro`           | none                           | Static                                                                   |

**Flag:** No `client:load` directives present anywhere on this page — no urgency issue.

**Flag:** `CoursesFAQ` receives `faqs={faqs.courses}` but also re-imports `faqs` internally on L6-8 (double import; the prop is accepted but the component uses its own internal `const questions = faqs.courses` — the prop parameter is silently ignored. Dead prop passing.

---

## TASK 3 — SEO AUDIT

### Title & meta description

- **Title pattern:** `` `${course.title} | ${SITE.name}` `` — **unique per course** ✅
- **Meta description source:** `course.shortDesc` — **unique per course** ✅
- **Longest shortDesc:** "Achieve absolute mastery in recitation and earn a formally certified Ijazah." (73 chars) — within 160-char limit ✅
- **Shortest shortDesc:** "Structured Hifz program with expert guidance and continuous revision." (68 chars) — acceptable but generic

### Canonical URL

- **Present:** Yes — generated automatically in `Base.astro` L52–54 from `Astro.url.pathname`. No `canonical` prop override is passed from `[slug].astro`, so canonical resolves to the actual URL path. ✅

### OG / Twitter tags

All present via `Base.astro`:

- `og:title`, `og:description`, `og:url`, `og:image`, `og:image:width`, `og:image:height`, `og:image:alt` ✅
- `twitter:card`, `twitter:site`, `twitter:url`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt` ✅
- `og:image` resolves to `SITE.defaultImage` — **same social image for every course page** ⚠️ No per-course OG image.

### Course JSON-LD (`schema`)

Full schema as rendered (for `quran-reading-with-tajweed`):

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Quran Reading with Tajweed",
  "description": "Transition from basic reading...",
  "provider": {
    "@type": "Organization",
    "name": "Quranific",
    "sameAs": "https://quranific.com"
  },
  "typicalAgeRange": "Ages 8+",
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "Online",
    "courseWorkload": "Avg. 4–6 Months",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "url": "https://quranific.com/tuition-fee"
    }
  }
}
```

**Confirmed:** `price` and `priceCurrency` are NOT present in the schema. The earlier fix held. ✅

**Gap:** `offers` block has no `price` or `priceCurrency` (correct per policy), but also no `priceSpecification` or `priceRange` — Google's Course rich result validator may show a warning for a price-less offer. Low priority but worth noting.

### Breadcrumb JSON-LD

- **Present:** Yes — `Breadcrumb.astro` emits `BreadcrumbList` JSON-LD with 3 items: Home → Courses → {course.title}. ✅
- **Visual breadcrumb:** Also present, same component. ✅

### Heading hierarchy

For any course page:

```
H1: {course.title}                          [slug].astro L114
H2: What You Will Learn                     [slug].astro L199
H2: Calculate Your Monthly Fee              [slug].astro L231 (id="calc-heading-slug")
H2: Learn from globally certified scholars. TeacherTeaserBanner.astro L40 (id="teacher-teaser-heading")
H2: Everything you need to decide...        CoursesFAQ.astro L26 (id="courses-faq-heading")
H3: Our Full-Month Guarantee                CoursesFAQ.astro L61
H2: Your child's first class is free.       FinalCTA.astro L30 (id="final-cta-heading")
```

**Flag:** H2 → H3 → H2 — the heading hierarchy drops to H3 inside CoursesFAQ then jumps back to H2 for FinalCTA. Technically not an error (H3 is inside the FAQ section, H2 resumes for a new section), but H3 inside a section that already uses H2 could confuse screen reader outline. Low severity.

**Flag:** `id="calc-heading-slug"` — the `slug` suffix on this id is a literal string, not the dynamic course slug. Every course detail page therefore has an `id="calc-heading-slug"` anchor, which is fine (only one per page), but the name is misleading — it looks like it should be dynamic.

---

## TASK 4 — UI CONSISTENCY

### Hero background

- **This page:** `bg-emerald-950` with a single radial `bg-emerald-500/10 blur-[100px]` glow at top center. `pt-32 pb-32`.
- **Site-wide established pattern:** Dark hero with radial glow. `bg-emerald-950` is consistent.
- **Dot-grid:** Not present on this hero. The dot-grid texture (used on the home page hero) is **absent here**. Minor inconsistency — not catastrophic, but diverges from the site pattern.
- **`bg-cream-50`:** Used correctly on the Features section (`py-24 bg-cream-50`). ✅

### Button component usage

- `Button.astro` exists at `src/components/ui/Button.astro`. ✅
- **This page uses zero `<Button>` instances.** Both hero CTAs ("Start Free Trial" / "Ask a Question") are raw `<a>` tags with hand-rolled Tailwind classes. Same in `TeacherTeaserBanner.astro` and `FinalCTA.astro`.
- **Verdict:** Entire site appears to use raw `<a>` tags for buttons — `Button.astro` exists but is not used on this page (or in the components rendered here). Not a regression from the current standard, but `Button.astro` is dead.

### Arbitrary Tailwind values & raw hex colors (grepped from `[slug].astro`)

| Line | Value                              | Context                          |
| ---- | ---------------------------------- | -------------------------------- |
| L72  | `h-[400px]`                        | Background glow div height       |
| L93  | `text-[11px]`                      | Highlight ribbon text size       |
| L115 | `text-4xl md:text-5xl lg:text-6xl` | H1 (scale tokens, not arbitrary) |
| L129 | `text-[15px]`                      | CTA button text size             |
| L138 | `text-[15px]`                      | Secondary CTA text size          |
| L141 | `text-[#25D366]`                   | WhatsApp green icon color        |
| L163 | `text-[11px]`                      | Quick facts label                |
| L166 | `text-[15px]`                      | Quick facts value                |
| L187 | `text-[13px]`                      | "See pricing" link               |
| L219 | `text-[15px]`                      | Feature card text                |
| L228 | `bg-[#fefdf9]`                     | Pricing section background       |

**Raw hex colors:** `text-[#25D366]` (WhatsApp brand green — L141), `bg-[#fefdf9]` (cream — L228). Both are consistent with the same values used across the rest of the site.

**Arbitrary sizes:** `text-[11px]`, `text-[13px]`, `text-[15px]` appear throughout — these are sitewide conventions, not outliers.

### Icon pattern

- Hero icon: inline `<svg stroke="currentColor" stroke-width="1.5" ...>` — Heroicons pattern, `aria-hidden="true"`. ✅
- Feature bullet icons: inline `<svg stroke="currentColor" stroke-width="2.5" ...>` — stroke weight different from hero (1.5 vs 2.5). Inconsistency within same page.
- Highlight ribbon uses `★` emoji (L94). Mixed icon patterns on the same page.
- No emoji in positions carrying semantic meaning — the `★` is decorative alongside text. Acceptable.

---

## TASK 5 — CONTENT DEPTH AUDIT

### What the legacy site pattern requires vs what exists

| Section                  | Required                                                     | Currently exists                                                                                      | Gap                                                                                  |
| ------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Who it's for             | Narrative paragraph specifying target student profile        | `ageRange` string + `category` enum only                                                              | **MISSING** — no "who this is for" section                                           |
| Why this course          | Differentiator argument vs other courses/providers           | Not present anywhere                                                                                  | **MISSING** — no section                                                             |
| What's included          | Module/curriculum breakdown with sequencing                  | `features[]` — 4 bullets max, high-level                                                              | **THIN** — 4 bullets vs real curriculum depth                                        |
| Structure & flexibility  | Duration, group size, teacher matching, instruction language | Quick Facts strip: ageRange/frequency/duration only. No group size, no language, no teacher specialty | **PARTIAL** — group size and teacher-match fields absent from both data model and UI |
| Trust signals per course | Teacher qualifications specific to this subject              | `TeacherTeaserBanner` is generic — same for all 6 courses                                             | **GENERIC** — no per-course teacher context                                          |
| Prerequisites            | What student needs before starting                           | Absent                                                                                                | **MISSING**                                                                          |
| What happens after       | Progression path to next course                              | Absent — no cross-sell or pathway section                                                             | **MISSING**                                                                          |
| Student outcomes         | Specific, measurable outcomes                                | `features[]` touches this loosely                                                                     | **THIN**                                                                             |

---

## TASK 6 — UX / STRUCTURE

Section inventory (top → bottom):

| #   | Section               | Component/origin                                     | Purpose                                                   |
| --- | --------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| 1   | Hero                  | `[slug].astro` L68–154                               | Course identity: title, description, two CTAs             |
| 2   | Quick Facts strip     | `[slug].astro` L156–193                              | Scannable metadata: Age, Schedule, Duration, Tuition link |
| 3   | What You Will Learn   | `[slug].astro` L195–225                              | Feature bullet grid                                       |
| 4   | Pricing Calculator    | `[slug].astro` L227–243 + `PricingCalculator.svelte` | Fee estimation tool                                       |
| 5   | Teacher Teaser Banner | `TeacherTeaserBanner.astro`                          | Trust: scholar credentials + vetting CTA                  |
| 6   | Courses FAQ           | `CoursesFAQ.astro`                                   | Objection handling via accordion                          |
| 7   | Final CTA             | `FinalCTA.astro`                                     | Conversion: free trial booking                            |

**Flags:**

1. **Redundant restatement:** Hero shows `course.title` + `course.longDesc` (hero paragraph). Quick Facts immediately below shows `ageRange`, `frequency`, `duration` — these are partly redundant with what a user reads in `longDesc`. No unique new information in Quick Facts beyond what's in the hero paragraph.

2. **Calculator placement:** Pricing Calculator sits at position 4 of 7 — before the teacher trust section and FAQ. This places pricing friction BEFORE trust-building, which is a conversion sequence anti-pattern. Ideally: content → trust → pricing → CTA.

3. **No cross-sell / Related Courses section.** Dead end — after consuming the page, there is no pathway to other courses. A user who decides this course isn't right for them has no next step except the global nav.

4. **CoursesFAQ is identical across all 6 course pages** — same questions, same answers from `faqs.courses`. No per-course FAQ customization.

5. **Hero CTAs both proceed to the same funnel** — "Start Free Trial" → `/funnel/signup?course={slug}`, "Ask a Question" → WhatsApp. No secondary CTA that keeps the user on-site (e.g., "See all courses", "Compare courses").

---

## TASK 7 — ACCESSIBILITY

### Images

- **Zero `<img>` elements** on this page or in its direct components. All visuals are inline SVG or CSS. No alt-text issues.
- `TeacherTeaserBanner` L107: `<div class="text-5xl" aria-hidden="true">📜</div>` — emoji decorative, correctly hidden. ✅
- Breadcrumb SVG separator L94 in `Breadcrumb.astro`: no `aria-hidden="true"` — purely decorative chevron rendered with `fill="currentColor"`, no title/desc. **Minor gap** — should have `aria-hidden="true"`.

### Interactive elements

- Hero `<a>` buttons: no explicit `role`, no `aria-label`. "Start Free Trial" and "Ask a Question" have descriptive text — screen reader legible. ✅
- WhatsApp SVG inside CTA: `aria-hidden="true"` ✅
- Breadcrumb last item: uses `aria-current="page"` ✅
- CoursesFAQ `<summary>`: has `aria-expanded="false"` statically on L75, correctly updated via JS `toggle` event. ✅ However, `aria-expanded` initialized to `"false"` regardless of `open` attribute — acceptable.
- `<details>` accordion: natively keyboard-reachable via Space/Enter. ✅

### Focus states

- All `<a>` tags: no explicit `focus-visible` ring defined in `[slug].astro`. Relies on global CSS. Should verify `global.css` defines a global focus-visible style (not audited here — out of scope).
- Skip-to-content link in `Base.astro` L212–215: present, sr-only with `focus:not-sr-only`. ✅

### Color contrast

- `text-emerald-100/80` on `bg-emerald-950` (hero paragraph) — opacity-modified text on dark background. At 80% opacity of emerald-100 (#d1fae5) on emerald-950 (#022c22): estimated contrast ~8:1. ✅
- `text-amber-400` on `bg-amber-500/10` (highlight ribbon): amber-400 (#fbbf24) on near-transparent amber tint on emerald-950 — effectively amber on dark. Contrast ~4.5:1. Acceptable.
- `text-emerald-900/50` on `bg-white` (Quick Facts labels) — 50% opacity emerald-900: contrast may fall below 3:1 for UI components. **Potential contrast gap** for label text.

---

## TASK 8 — PERFORMANCE

### PricingCalculator hydration

- **Confirmed:** `client:visible` ✅ — deferred until the component enters the viewport. Correct.

### Images

- **No `<img>` elements** on this page. No width/height or lazy-loading concern. N/A.

### LCP candidate

- The `<h1>` (course title in the hero) is likely the LCP element. It's text-only — no image LCP. No action needed.

### Other performance notes

- Inline SVG icons render at parse time — no network requests. ✅
- `PricingCalculator.svelte` is the only client-side JS bundle loaded on this page. `TeacherTeaserBanner`, `CoursesFAQ`, `FinalCTA` are all zero-JS (except `CoursesFAQ`'s inline `<script>` for `aria-expanded` sync). ✅
- `CoursesFAQ`'s `<script>` tag has no `is:inline` — it will be bundled/deduped by Astro. Fine.
- `h-[400px]` glow div has no explicit `contain` or `will-change` — browser will handle the `blur-[100px]` filter. This is the expected sitewide pattern.

---

## TASK 9 — IMAGE / ILLUSTRATION PLACEHOLDER STATE

| Position                 | What renders                                                                                                                                          | Treatment                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Hero "illustration" area | None — the hero icon SVG (`course.icon` path) at `w-14 h-14` is the only visual above the H1                                                          | No placeholder — the icon doubles as the only graphic |
| Course card-level visual | `riveFile` field exists in data model but **nothing renders it** — zero Rive integration on the page                                                  | Silently absent                                       |
| Teacher photo area       | `TeacherTeaserBanner` right column (desktop): a text credential card (`bg-emerald-900/50 rounded-3xl`) with `📜` emoji + "100% Ijazah-Certified" stat | Styled placeholder card — no real photo               |
| Feature section          | Checklist bullets only — no illustration                                                                                                              | Intentional text-only treatment                       |
| Overall                  | No real photo/illustration assets anywhere on the page                                                                                                | Gradient + icon + emoji pattern throughout            |

**Verdict:** The page has no image placeholder gaps that need immediate treatment — the icon-based hero works. The gap is the missing Rive animation (entire `riveFile` field is dead infrastructure) and the teacher photo in `TeacherTeaserBanner`.

---

## TASK 10 — DEAD CODE / CONSISTENCY SWEEP

### Unused imports

None. All 9 imports in `[slug].astro` are rendered (verified against template).

### Orphaned props

- `CoursesFAQ` is called with `faqs={faqs.courses}` (L247) but the component ignores this prop — it re-imports `faqs` internally and uses `const questions = faqs.courses` directly. The prop accepted in the interface (`const questions = faqs.courses` on L8 ignores the interface — actually there is no Props interface declared). **The `faqs` prop passed from `[slug].astro` is silently discarded.** Dead prop passing.
- `Course.groupSize` — declared in interface, never populated in any of the 6 course entries. Dead field.
- `Course.riveFile` — declared and populated in every entry, but no component consumes it. Dead field.
- `Course.senAdapted` — declared, never populated. Dead field.

### Phantom course names

Grepped `[slug].astro` and all direct components for "Adult Tajweed", "Adult Hifz": **zero matches**. Clean. ✅

### 4-stage teacher vetting language

`TeacherTeaserBanner.astro` (the only place on this page that mentions vetting) uses:

```
'Ijazah verification', 'Live recitation test', 'Teaching methodology interview', 'Safeguarding check'
```

And the paragraph: _"each teacher passes a strict 4-stage vetting process before teaching a single student."_

This is the **canonical version** — verify it matches the sitewide standard established elsewhere. No third variant found on this page.

---

## FINDING SUMMARY

| Task              | Findings count                                                                                           | Severity                          |
| ----------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------- |
| T1 Data layer     | 7 missing schema fields                                                                                  | HIGH — blocks real content depth  |
| T2 Components     | 2 flags (dead prop, no client:load issue)                                                                | LOW                               |
| T3 SEO            | 3 gaps (generic OG image, price-less offer, non-dynamic calc id)                                         | MEDIUM                            |
| T4 UI Consistency | 5 findings (no dot-grid, Button.astro dead, icon weight inconsistency, star emoji, hex values)           | LOW–MEDIUM                        |
| T5 Content depth  | 7 missing/thin content areas                                                                             | HIGH — greatest conversion impact |
| T6 UX/Structure   | 5 findings (calculator placement, no cross-sell, generic FAQ, no pathway CTA)                            | HIGH                              |
| T7 Accessibility  | 3 findings (breadcrumb SVG no aria-hidden, potential contrast on opacity labels, no explicit focus ring) | MEDIUM                            |
| T8 Performance    | 0 blocking issues — all correct                                                                          | NONE                              |
| T9 Placeholders   | 2 findings (dead Rive, teacher photo card)                                                               | LOW                               |
| T10 Dead code     | 4 findings (dead prop on FAQ, 3 unused Course fields)                                                    | LOW                               |

---

## TOP 3 HIGHEST-IMPACT ISSUES

### 🔴 #1 — Content depth is critically thin (T5 + T6)

Each course page has only 4 bullet points and a single paragraph. The "who it's for," "why this course," prerequisites, curriculum structure, and post-course pathway sections are **entirely absent from both the data model and the UI**. This is the primary conversion barrier — a user considering enrolling their child in Hifz has no information to make the decision. This requires both a schema extension (`courses.ts`) and new page sections.

### 🔴 #2 — Pricing Calculator before trust-building (T6)

The calculator appears at position 4 (immediately after the feature list), before the teacher vetting section (position 5) and FAQ (position 6). A visitor who hasn't yet decided if they trust the teachers is being asked to engage with pricing. The established high-converting sequence for education products is: identity → curriculum → trust → pricing → commitment. Reordering: move `TeacherTeaserBanner` to position 3 (before features or immediately after), and `PricingCalculator` to position 5.

### 🟡 #3 — No cross-sell / pathway out of a dead end (T6 + T5)

After consuming the entire page, a visitor who decides this specific course isn't right for them has no site-guided next step. There is no "Related Courses," "You might also consider," or progression pathway ("After completing Basic Qaida, students move to Quran Reading with Tajweed"). This creates a bounce rather than a journey. Adding a `relatedSlugs?: CourseSlug[]` field to the data model and a 2–3 card cross-sell section above `FinalCTA` would solve this at low implementation cost.
