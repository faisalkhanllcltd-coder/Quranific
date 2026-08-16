# Landing Pages UI Audit

**Scope:** `src/pages/[intent]/for-kids.astro`, `for-adults.astro`, `for-women.astro`
**Date:** 2026-08-12
**Mode:** Read-only. No files were modified, no build was triggered during research.

---

## TASK 1 — RAW CODE: FILE PRESENCE & STRUCTURE

**All 3 files confirmed present:**

| File               | Lines | Bytes  |
| ------------------ | ----- | ------ |
| `for-kids.astro`   | 751   | 37,009 |
| `for-adults.astro` | 800   | 38,833 |
| `for-women.astro`  | 838   | 40,599 |

**Structure:** The three files are NOT identical copies with only copy differing. They share the same 11-section scaffold and frontmatter pattern, but differ meaningfully in:

- Hero background approach (kids: light `bg-cream-50`; adults/women: dark `bg-emerald-950`)
- Hero right-card content (kids: stats card; adults: credential card; women: privacy card)
- Vetting step 3 copy (kids: child methodology; adults: adult pedagogy; women: Ustadha empathy)
- Vetting step 4 (kids: safeguarding; adults: professional conduct; women: privacy & professional conduct)
- 1-on-1 callout copy and accent colours (kids: gold/amber callout; adults/women: dark emerald callout)
- Testimonial filter (kids: all 3; adults: Amna + NB; women: Amna + NB)
- Attribution script selector (kids/adults: `a[data-track-cta]` only; women: `a[data-track-cta], a.cta-booking-btn`)
- Women adds purple accent throughout (badge, vetting icons, onboarding numbers, trust list icons)

Given significant structural divergence between kids (light hero) and adults/women (dark hero), the full raw code of each file is viewable in the repository directly. Pasting one in full + diffing the other two is not meaningful given different hero DOM structures.

---

## TASK 2 — CANONICAL / NOINDEX: REAL CODE

All three files pass these props to `<Base>`:

```astro
<!-- for-kids.astro L138-143 -->
<Base
  title={copy.seoTitle}
  description={copy.seoDesc}
  robots="noindex, follow"
  canonical={canonicalUrl}
>
  <!-- for-adults.astro L138-143 — identical prop names/values pattern -->
  <!-- for-women.astro L138-143 — identical prop names/values pattern --></Base
>
```

**Canonical URLs set at build-time:**

```ts
// for-kids   L44:  const canonicalUrl = `${SITE.url}/quran-classes/for-kids`;
// for-adults  L44:  const canonicalUrl = `${SITE.url}/quran-classes/for-adults`;
// for-women   L44:  const canonicalUrl = `${SITE.url}/quran-classes/for-women`;
```

**Verdict:**

- `robots` prop value in the code: **`"noindex, follow"`** — exactly as originally specified.
- Canonical strategy in the code: **canonical-back-to-quran-classes** — the canonical always points to the master `quran-classes` variant regardless of intent. Both `quran-classes/for-kids` and `quran-teacher/for-kids` render with canonical pointing to `quran-classes/for-kids`.
- **Both things are simultaneously true.** The code does `noindex, follow` AND uses a canonical-back approach.
- Whether `Base.astro` actually emits these as `<meta>` and `<link rel="canonical">` tags was not verified in this audit (out of scope), but the props are passed correctly.

---

## TASK 3 — GCLID/UTM MERGE: REAL CODE

### CTA href-building logic

**Frontmatter (server-side / build-time):** The `intent` string is baked into the href at build time:

```ts
// for-kids L214:
href={`/funnel/signup?source=ad_kids_${intent}`}
// produces: /funnel/signup?source=ad_kids_quran-classes  OR  /funnel/signup?source=ad_kids_quran-teacher

// for-adults L214:  source=ad_adults_${intent}
// for-women  L233:  source=ad_women_${intent}
```

This is correct. `intent` is known at build-time via `getStaticPaths()` + `prerender = true`.

### Client-side script (runtime, SSG-safe)

```js
// for-kids / for-adults (L728-749 / L777-798):
const attachAttribution = () => {
  const ctaButtons = document.querySelectorAll('a[data-track-cta]');
  if (!ctaButtons.length) return;
  const currentParams = new URLSearchParams(window.location.search);
  ctaButtons.forEach((button) => {
    try {
      const targetUrl = new URL(button.getAttribute('href'), window.location.origin);
      currentParams.forEach((value, key) => {
        if (!targetUrl.searchParams.has(key)) {
          targetUrl.searchParams.set(key, value);
        }
      });
      button.setAttribute('href', targetUrl.toString());
    } catch {
      // Non-fatal: attribution best-effort only
    }
  });
};
attachAttribution();
document.addEventListener('astro:page-load', attachAttribution);

// for-women (L815-836): identical logic but selector is:
const ctaButtons = document.querySelectorAll('a[data-track-cta], a.cta-booking-btn');
```

### Behaviour trace

1. Visitor: `/quran-classes/for-kids?gclid=abc123&utm_campaign=kids_search&utm_source=google`
2. Prerendered HTML. CTA hrefs: `/funnel/signup?source=ad_kids_quran-classes`
3. `attachAttribution()` runs. `currentParams` = `{gclid, utm_campaign, utm_source}`
4. For each `a[data-track-cta]`: builds `URL`, iterates `currentParams`, sets each key only if not already present (`has(key)` guard prevents overwriting `source=`)
5. Final href: `/funnel/signup?source=ad_kids_quran-classes&gclid=abc123&utm_campaign=kids_search&utm_source=google`
6. `astro:page-load` listener re-runs on view transitions.

**gclid and utm\_\* are preserved correctly alongside `source=`.**

### "Prevents Astro build crash" — is the justification real?

Yes. If `Astro.url.searchParams.get('gclid')` were called in the frontmatter of a prerendered page, Astro throws at build time — `Astro.url` only has static path params, not query strings. Client-side script is the correct SSG pattern. **Justification is real, not invented.**

**Build pass/fail:** Last verified build (2026-08-12 19:33:22, task-4796) exited code 0, 0 errors, all 6 routes prerendered. This audit did not re-trigger a build (read-only mandate).

---

## TASK 4 — VISUAL WEIGHT / SIZING AUDIT

### Established sitewide baseline

| Element                   | Standard                                                    |
| ------------------------- | ----------------------------------------------------------- |
| Button base               | `px-4 py-2.5 text-sm font-semibold rounded-lg min-h-[44px]` |
| HomeHero CTA              | `px-4 py-2.5 text-sm font-semibold` (raw `<a>`)             |
| HomeHero badge            | `px-3 py-1.5`                                               |
| HomeHero trust mini-cards | `px-4 py-3.5`                                               |
| Section padding           | `py-16 sm:py-20 lg:py-24` (via `quranific-section`)         |
| Container                 | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12`           |

### CTA buttons — MAJOR OUTLIER (all 3 pages)

`Button.astro` uses `class:list=[baseStyle, variants[variant], className]`. Override `className` is appended and generally wins for layout utilities since it appears later in the merged string.

| Location             | Override classes passed                                   | vs baseline                                    |
| -------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| Hero primary CTAs    | `px-8 py-4 text-base font-bold rounded-xl shadow-xl`      | px: 2×, py: 1.6×, text +1 step, radius wider   |
| Mid-page CTAs        | `px-8 py-4 text-base font-bold rounded-xl`                | Same                                           |
| Guarantee CTA (kids) | `px-10 py-4 text-base font-bold rounded-xl`               | px: 2.5×                                       |
| Final CTA (all)      | `px-12 py-5 text-lg font-extrabold rounded-xl shadow-2xl` | px: 3×, py: 2×, text +2 steps, shadow heaviest |

`px-12 py-5 text-lg font-extrabold` final CTAs are ~3× the Button.astro baseline footprint. This is the primary source of the "heavy UI" complaint.

### Section padding

All body sections use `quranific-section` (`py-16 sm:py-20 lg:py-24`). **Matches sitewide — not an outlier.**

### Container max-width

All sections: `quranific-container` (`max-w-7xl`). **Matches sitewide.**

### Hero section padding

All 3 pages: `quranific-container py-8` + grid `pb-16 sm:pb-20 lg:pb-24`. HomeHero: `pt-8 pb-16 md:pb-24 lg:pb-32`. **Comparable.**

### Arbitrary pixel values

| File                | Arbitrary value                              | Justified?                                             |
| ------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Kids hero glow blob | `w-[700px] h-[500px]`                        | Yes — HomeHero uses `w-[800px]` same pattern           |
| Adults hero glow    | `w-[600px] h-[400px]`                        | Yes                                                    |
| Women hero glows    | `w-[500px] h-[500px]`, `w-[300px] h-[300px]` | Yes                                                    |
| Kids hero grid col  | `lg:grid-cols-[1fr_400px]`                   | Yes — grid template                                    |
| Adults/women H1     | `lg:text-[3.5rem]`                           | Minor — between text-5xl (3rem) and text-6xl (3.75rem) |

### Border-radius

Cards: `rounded-2xl` (16px). Button overrides: `rounded-xl` (12px). Button base: `rounded-lg` (8px). Cards are rounder than baseline buttons — architecturally fine, but inconsistent with Button's own radius.

### Shadow

Final CTAs: `shadow-2xl`. HomeHero CTA: `shadow-lg shadow-emerald-900/10`. Minor outlier.

### Emoji usage

| File               | Emoji count       | Location             |
| ------------------ | ----------------- | -------------------- |
| `for-kids.astro`   | 0                 | —                    |
| `for-adults.astro` | 4 (`🔒 🕐 ↩ ♾`)   | Hero right-card list |
| `for-women.astro`  | 4 (`👩‍🏫 🔒 🏠 🕐`) | Hero right-card list |

HomeHero and all sitewide components: **zero emoji**. Adults and women diverge here.

### Hex colors

All 3 files: `text-[#25D366]` on WhatsApp icon only. HomeHero: zero hex. `#25D366` is WhatsApp's brand color — reasonable exception, but not sitewide pattern.

### Vetting card padding

`p-7` (28px). HomeHero trust mini-cards: `px-4 py-3.5`. Moderately heavier than site baseline for card internals.

### Top 3 sizing outliers

1. **Final CTA: `px-12 py-5 text-lg font-extrabold shadow-2xl`** — 3× standard. Primary heavy element.
2. **Hero CTAs: `px-8 py-4 text-base font-bold rounded-xl`** — 2× standard. Above the fold on every page.
3. **`rounded-xl` on all button overrides** — Button base is `rounded-lg`; these force `rounded-xl`. Minor but inconsistent.

---

## TASK 5 — CONSISTENCY AGAINST ESTABLISHED SITEWIDE PATTERNS

### Hero background

| Component          | Pattern                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `HomeHero.astro`   | `bg-cream-50` + radial dot grid (#d1fae5, 24px, 40% opacity) + emerald+amber gradient glow                               |
| `for-kids.astro`   | `bg-cream-50` + radial dot grid (#d1fae5, 20px, 50% opacity) + emerald glow — **close match to HomeHero**                |
| `for-adults.astro` | `bg-emerald-950` + linear-gradient grid lines (3% opacity) + emerald glow — **intentional dark variant**                 |
| `for-women.astro`  | `bg-emerald-950` + radial dot grid (purple rgba, 8% opacity) + purple+emerald glow — **intentional dark+purple variant** |

Kids matches HomeHero closely. Adults uses a linear grid instead of radial dots — minor inconsistency vs women's radial dots.

### CTAs: `<Button>` vs raw `<a>`

All landing page CTAs use `<Button href={...}>`. Consistent. (HomeHero predates the Button component refactor and uses raw `<a>` — the landing pages are actually more consistent.)

### Icon style

All pages: inline SVG stroke icons, `stroke-width="2"`, Lucide-style. HomeHero: same. **Consistent.**

### Badge style

Kids/adults: `<span aria-hidden="true">★</span>` inside badge. Women: inline SVG shield icon. Minor inconsistency.

### Emoji

Adults/women use emoji as decorative list icons in hero right-card. No equivalent in HomeHero or PageHero. **Sitewide divergence.**

### Outer div background

Kids: `bg-cream-50`. Adults/women: `bg-white`. Minor inconsistency between the three.

---

## TASK 6 — REAL CONTENT VERIFICATION

### Testimonial verbatim check

Source (`src/constants/testimonials.ts`, verbatim):

```
Amna | Germany | 14 months | light:
"Studying at Quranific has been a profound experience. With the guidance of my dedicated teacher,
I have enhanced my Quran recitation and memorized significant portions. Additionally, I have
learned about Islamic Studies, fiqah, Salah."

Saleem Al Mustarshid | UAE | 8 months | dark:
"Our son has been making steady progress with his teacher. He has learnt to pray too alhamdulillah.
The teacher also knows when to be firm with our son and when he needs to be gentle, really glad he
understands our son's needs and helping him through the Qaida."

Naseerullah Babar | UK | 11 months | light:
"We're very pleased with the quality of teaching. The instructors are dedicated, and the lessons are
engaging, which my daughters enjoy a lot. The teacher and admin are very friendly and supportive.
The online format is convenient for us and makes learning easy and flexible."
```

All landing pages render `{t.content}` directly from the imported array — no hardcoded quote strings. **Cannot diverge from source. Content verified accurate.**

### Testimonial filter

| Page       | Filter names                                  | Count rendered |
| ---------- | --------------------------------------------- | -------------- |
| for-kids   | Amna, Saleem Al Mustarshid, Naseerullah Babar | 3              |
| for-adults | Amna, Naseerullah Babar                       | 2              |
| for-women  | Amna, Naseerullah Babar                       | 2              |

**Content judgment flag (women):** Naseerullah Babar is a male parent speaking about his daughters — not a female student's direct voice. On-strategy for a women's page (daughters reference), but the voice is paternal/male. Not a data issue; a content strategy issue.

### Stats and claims

| Claim                    | In code                           | Source of truth file         | Verdict                            |
| ------------------------ | --------------------------------- | ---------------------------- | ---------------------------------- |
| "4-stage vetting"        | 4 entries in `vettingSteps` array | N/A (self-contained)         | Accurate                           |
| "From $40/month"         | Hardcoded string in all 3         | `/tuition-fee` link provided | Not cross-checked vs `pricing.ts`  |
| "3,000+ active students" | Kids hero right-card              | No constants file            | **Hardcoded — no source of truth** |
| "22 countries served"    | Kids hero right-card              | No constants file            | **Hardcoded — no source of truth** |
| "94% retention rate"     | Kids hero right-card              | No constants file            | **Hardcoded — no source of truth** |
| "4.9 / 5"                | All 3 hero right-cards            | No constants file            | **Hardcoded — no source of truth** |

Stats in the kids card (`3,000+`, `22`, `94%`, `4.9/5`) are hardcoded strings with no import. Risk of stale data over time.

---

## TASK 7 — STRUCTURAL / DEAD CODE CHECK

### `/ads/` directory

`directory src/pages/ads does not exist` — **deleted outright. No redirect, no orphan. Confirmed.**

### Unused imports

All 4 imports (`Base`, `Button`, `SITE`, `TESTIMONIALS_DATA`) are used in all 3 files. No dead imports.

### Duplicate sections

No duplicate sections. Each of the 11 section comment markers maps to exactly one `<section>` element.

### CTA variant inconsistency

`for-kids.astro` hero primary CTA: `variant="primary"` (green). `for-adults.astro` + `for-women.astro` hero primary CTAs: `variant="secondary"` (amber). Intentional design decision (amber = high-contrast on dark hero). Not dead code, but cross-file inconsistency in naming.

### `data-track-cta` vs `cta-booking-btn` redundancy

- Kids/adults: `data-track-cta` only; script selects `a[data-track-cta]`
- Women: `data-track-cta` + `class="cta-booking-btn"` on some CTAs; script selects `a[data-track-cta], a.cta-booking-btn`

Buttons with both attributes are caught by the first selector, processed, then caught again by the second. The `has(key)` guard makes the second pass idempotent. **Not a bug, but unnecessary complexity introduced by the women page spec. Kids and adults don't need the dual-selector.**

---

## TASK 8 — SECTION-BY-SECTION HEAVY vs LEAN VERDICT

### § 1 HERO

**Kids:** Logo header + badge + H1 + subhead + price anchor + 2 CTAs + trust strip + right stats card. **Proportionate** — each element earns its space.

**Adults:** Same structure, dark bg. Right card: emoji list + star rating stacked. **Slightly over-built** — two trust mechanisms in one card.

**Women:** Same structure, purple accent. Right card: header label+icon row + emoji list + star rating — three layers. **Over-built.** Two layers would suffice.

### § 2 PROBLEM

All 3: `max-w-3xl` wrapper, eyebrow, H2, 2 body paragraphs. **Lean. No excess decoration.**

### § 3 OUTCOME

All 3: 2-col grid, eyebrow, H2, body text, image placeholder. **Proportionate. Clean.**

### § 4 MECHANISM (Vetting)

All 3: 2×2 card grid. Each card: `flex` row with icon circle (`w-10 h-10`) + floating step number (`text-xs mt-3`) + title + body.

**Moderately over-built.** Icon circle and step number are redundant decorative layers before the actual content. The `mt-3` float on the step number is a layout hack to align it with the icon center — a symptom of trying to fit two decorative elements in one row. Drop the step number (sequence is implied by the grid order) OR drop the icon.

### § 5 VIDEO PREVIEW

All 3: eyebrow, H2, `aspect-video` placeholder div, caption. **Lean. Correctly sized and labelled.**

### § 6 TRUST

All 3: 2-col grid. Each trust point is its own card with `rounded-xl border bg-cream-50 px-6 py-4 flex items-start gap-4` + icon circle + text span. **Slightly over-built for 4 short strings** — a simple checkmark list would render lighter. Not egregious, but each card adds 4 Tailwind classes of decoration to 1 sentence.

### § 7 ONBOARDING

All 3: eyebrow, H2, 3-col step card grid. `p-7`, numbered circle, title, body. **Proportionate. Standard pattern.**

### § 8 PROOF (Testimonials)

Kids: 3-col grid, `p-7` cards. Adults/women: 2-col grid, `p-8` cards. Stars + blockquote + figcaption. **Proportionate. Industry standard layout.**

### § 9 GUARANTEE

**Kids:** Text block + 3-col mini-cards (text-only, center-aligned in `bg-emerald-900/60 p-5`) + single CTA. **Lean.**

**Adults/Women:** 2-col layout. Left: eyebrow+H2+3 paras+CTA. Right: 3 cards each with `w-10 h-10` icon circle + label + subtext. **Moderately over-built.** The right-side guarantee cards add significant DOM for 3 items that could be a simple checkmark list.

### § 10 FAQ

All 3: `<dl>` with `divide-y`, `py-7` per item, bold `<dt>` + `<dd>`. **Lean. Correct semantic pattern.**

### § 11 FINAL CTA

All 3: eyebrow, H2 at `text-3xl md:text-5xl`, subhead `text-xl`, price anchor, 1-2 oversized CTAs, fine-print.

**Over-built in two ways:**

1. `text-5xl` H2 for 4-word content ("One free class. No card. No risk.") — the font size outweighs the copy weight.
2. Final CTA button at `px-12 py-5 text-lg font-extrabold shadow-2xl` is the heaviest element on any of the three pages. This single element is the most visible manifestation of the "heavy UI" complaint.

---

## SUMMARY

### Issues by severity

| #   | Issue                                                                          | Files         | Action                                                                        |
| --- | ------------------------------------------------------------------------------ | ------------- | ----------------------------------------------------------------------------- |
| 1   | CTA button sizing 2-3× baseline everywhere                                     | All 3         | Reduce: `px-6 py-3 text-sm` for mid-page; `px-8 py-4 text-base` max for final |
| 2   | Hero right-card over-stacked (adults: emoji+rating; women: label+emoji+rating) | Adults, Women | Flatten to 1 mechanism per card                                               |
| 3   | Vetting card: icon+number redundancy + `mt-3` layout hack                      | All 3         | Keep icon, remove step number (or vice versa)                                 |
| 4   | Emoji in hero right-card (`🔒 🕐 👩‍🏫 🏠 ↩ ♾`)                                   | Adults, Women | Replace with inline SVG stroke icons                                          |
| 5   | Stats hardcoded (`3000+`, `22 countries`, `94%`, `4.9/5`)                      | Kids          | Move to shared constants file                                                 |
| 6   | Women testimonials: NB is male parent voice                                    | Women         | Add a female-voice testimonial when available                                 |
| 7   | `cta-booking-btn` dual-selector redundancy                                     | Women         | Remove `cta-booking-btn` class; `data-track-cta` sufficient                   |

### What is verified correct

- `robots="noindex, follow"` + canonical-back: both in code, correct.
- `gclid`/`utm_*` client-side merge: works correctly, SSG-safe, justification is real.
- `/ads/` directory: deleted outright.
- All imports used; no dead code; no duplicate sections.
- Build: 0 errors, 6 routes prerendered (last verified run).
- Testimonial content: renders from source array directly — cannot be altered in transit.
- `quranific-section` / `quranific-container`: matches sitewide.
- Inline SVG stroke icons: matches sitewide.
- `<Button>` component used on all CTAs (more consistent than HomeHero which uses raw `<a>`).
