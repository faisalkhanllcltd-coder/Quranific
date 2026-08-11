# ADS AUDIENCE PAGE AUDIT

**File:** `src/pages/ads/[audience].astro`  
**Date:** 2026-08-11  
**Mode:** Read-only. No edits made.

---

## TASK 1 — ROUTE + AUDIENCE DATA

**Audiences (3):** `kids`, `adults`, `ladies`  
Source: `getStaticPaths()` at line 6-12 — hardcoded directly in the file.

```ts
export function getStaticPaths() {
  return [
    { params: { audience: 'kids' } },
    { params: { audience: 'adults' } },
    { params: { audience: 'ladies' } },
  ];
}
```

**Content location:** All per-audience copy lives in `adCopy` object — lines 25–53 — hardcoded in the same file. No external data file. `constants/landing.ts` does NOT exist. Nothing is imported from external data sources.

---

## TASK 2 — HARDCODED VALUES CHECK

### WhatsApp Number — ⚠️ BUG STILL PRESENT

Line 113 uses a **raw hardcoded number** `wa.me/923112112122`, NOT `SITE.whatsappLink`:

```astro
<Button href="https://wa.me/923112112122" target="_blank" variant="ghost" ...>
  Chat on WhatsApp
</Button>
```

`SITE.whatsappLink` in `src/constants/site.ts` = `https://wa.me/message/FF4LDK3JR2GPN1` (different URL format — wa.me/message link vs raw phone number). Both exist. The ads page uses the wrong one — raw number, not the site constant.

### Raw Hex Colors — None found.

All colors use Tailwind utility classes via the `theme` object.

### Arbitrary Tailwind Values — Present (intentional):

- `w-[800px] h-[800px]` — glow blob, line 73
- `blur-[120px]` — glow blob, line 73
- `rounded-[3rem]` — card, lines 120–123

These appear intentional for the custom layout. No functional issue.

### Raw `<a>` tags where `<Button>` should be used:

Line 78 — logo link uses raw `<a>`:

```astro
<a
  href="/"
  class="inline-flex items-center gap-2 font-serif font-black text-2xl text-emerald-950 hover:opacity-80 transition-opacity"
>
  Quranific<span class="text-emerald-600">.</span>
</a>
```

Acceptable as a logo link — not a CTA. Not a real violation.

**Summary: 1 real bug** — hardcoded WhatsApp number on line 113.

---

## TASK 3 — SEO / SCHEMA / INDEXABILITY

### Title + Meta Description

Unique per audience — correct. Examples:

- kids: `"Quran Classes for Kids | Fun & Engaging Online Tutors"`
- adults: `"Quran Classes for Adults | Flexible 1-on-1 Online Tutors"`
- ladies: `"Quran Classes for Ladies | 100% Female Arab Tutors"`

### Schema.org JSON-LD

Type: `WebPage` only — minimal. Lines 57–62:

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: content.seoTitle,
  description: content.seoDesc,
};
```

No `Course`, `FAQPage`, or `HowTo` schema. Schema is correct but thin.

### Canonical URL

Not passed explicitly to `<Base>`. Base layout auto-derives canonical from `Astro.url.pathname`. So each audience gets a correct unique canonical (e.g. `/ads/kids`).

### ⚠️ NOINDEX STATUS — NOT SET (INDEXABLE)

`<Base>` prop `robots` defaults to `'index, follow'` (Base.astro line 45). The ads page does NOT pass a `robots` prop to `<Base>`. Result: **these ad landing pages are indexed by Google.**

This was the unresolved question from the prior audit. Current state: **fully indexable**. No noindex directive present anywhere in this route or the layout default.

Whether this is intentional or a bug depends on business decision — thin/duplicate-content risk is real for SEO. This is not automatically fixed here — flagged for review.

---

## TASK 4 — CONVERSION TRACKING / ATTRIBUTION

### Primary CTA href (line 110):

```astro
<Button href={`/funnel/signup?source=ad_${audience}`} variant="primary" ...>
  Book Your Free Class
</Button>
```

Passes `source=ad_kids`, `source=ad_adults`, or `source=ad_ladies` — audience IS identified.

### UTM / gclid passthrough — ⚠️ GAP

The ads page does **not** forward `utm_*` or `gclid` from the inbound ad URL to the `/funnel/signup` link. The CTA is a static server-rendered `href` string — no client-side logic appends URL params.

`SignupForm.svelte` (the form on `/funnel/signup`) DOES capture `utm_*`, `gclid`, `fbclid`, `ttclid` from `window.location.search` on mount (lines 37–52). So if a user lands on `/ads/kids?gclid=abc&utm_source=google`, then clicks the CTA to `/funnel/signup?source=ad_kids`, the `gclid` and `utm_*` params are **lost in transit** — they don't appear in the signup URL.

SignupForm only sees `source=ad_kids`. It captures `source` but loses all ad platform attribution data.

**Attribution gap:** Audience is tracked. Ad platform params (gclid/utm) are NOT forwarded — SignupForm can't attribute back to the specific Google Ads campaign/ad group.

---

## TASK 5 — UI CONSISTENCY

### Hero — Fully custom markup. No `<PageHero>` component used.

Custom layout with `<main>` / `<section>` / grid. Does not match the `<PageHero>` pattern used on course detail and other pages.

### Background — Does NOT match site spec.

Site standard: dot-grid + blob. Ads page: colored glow blob only (`${content.theme.glow}/10 rounded-full blur-[120px]`). No dot-grid background present.

### Interactive components — None.

No Svelte, no Vue, no client-side hydration. Fully static SSR render. No hydration directives needed or used.

---

## TASK 6 — REAL CONTENT (VERBATIM)

### KIDS

**Badge:** Tailored Learning Path  
**H1:** Give Your Child the Gift of the Quran.  
**Subtitle:** Engaging, fun, and patient 1-on-1 online Quran classes designed specifically for children. Watch them build a lifelong love for Islam.  
**Benefits:**

- Patient & Certified Tutors
- Interactive & Fun Lessons
- Flexible Parent Schedules
- Progress Tracking Dashboard

---

### ADULTS

**Badge:** Tailored Learning Path  
**H1:** Master the Quran, No Matter Your Schedule.  
**Subtitle:** 1-on-1 personalized sessions for busy professionals. Whether you are starting from zero or pursuing an Ijazah, we build the schedule around you.  
**Benefits:**

- 24/7 Flexible Scheduling
- Learn at Your Own Pace
- Tajweed & Hifz Tracks
- Private 1-on-1 Focus

---

### LADIES

**Badge:** Tailored Learning Path  
**H1:** Learn the Quran in a 100% Private Environment.  
**Subtitle:** Exclusive 1-on-1 classes taught strictly by certified female Arab scholars. A safe, comfortable, and empowering space for sisters to learn.  
**Benefits:**

- 100% Female Tutors
- Complete Privacy Guaranteed
- Comfortable Learning Pace
- Tajweed & Tafsir Focus

---

**Shared card copy (right column, all audiences):**  
"Top Rated Academy" / ★★★★★ / "Trusted by thousands of students globally."

**Badge label ("Tailored Learning Path") is IDENTICAL across all 3 audiences** — not audience-specific. Low priority but worth noting.

---

## ISSUES SUMMARY

| #   | Severity       | Issue                                                                                  |
| --- | -------------- | -------------------------------------------------------------------------------------- |
| 1   | 🔴 Bug         | WhatsApp href hardcoded (`wa.me/923112112122`) — must use `SITE.whatsappLink`          |
| 2   | 🔴 Gap         | `gclid`/`utm_*` lost between ads page and signup form — ad campaign attribution broken |
| 3   | 🟡 Decision    | Pages indexed (`robots: index, follow`) — no noindex — confirm intentional             |
| 4   | 🟡 Consistency | Hero uses custom markup, not `<PageHero>`                                              |
| 5   | 🟡 Consistency | Background missing dot-grid — uses glow blob only                                      |
| 6   | 🟡 Copy        | Badge "Tailored Learning Path" identical on all 3 audiences                            |
| 7   | 🟢 Schema      | Only `WebPage` JSON-LD — no `Course` or richer schema                                  |
