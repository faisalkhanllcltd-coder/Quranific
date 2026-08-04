# SRC STRUCTURE AUDIT — Quranific

Generated: 2026-08-03 | Auditor: Antigravity agent

---

## Step 0 — Backup Branch

| Item         | Value                                                                                  |
| ------------ | -------------------------------------------------------------------------------------- |
| Branch name  | `backup-pre-src-reorg-2026-08-03`                                                      |
| Push status  | ✅ pushed to `origin`                                                                  |
| Confirmation | `f7e27cc refactor(fees): componentize tuition page architecture into isolated modules` |

---

## Step 1 — Full Inventory

**Totals: 95 files, 767,096 bytes (~749 KB)**

| Folder                                                      | Files | Bytes   |
| ----------------------------------------------------------- | ----- | ------- |
| `src/pages` (root)                                          | 17    | 354,740 |
| `src/pages/legal`                                           | 5     | 67,555  |
| `src/pages/api`                                             | 4     | 30,905  |
| `src/pages/courses`                                         | 2     | 24,250  |
| `src/pages/blog`                                            | 2     | 14,761  |
| `src/pages/funnel`                                          | 3     | 8,561   |
| `src/pages/ads`                                             | 1     | 8,357   |
| `src/pages/api/internal`                                    | 1     | 4,252   |
| `src/components/sections`                                   | 20    | 95,395  |
| `src/components/global`                                     | 3     | 28,288  |
| `src/components/fees`                                       | 2     | 26,762  |
| `src/components/funnel`                                     | 3     | 22,524  |
| `src/components/ui`                                         | 5     | 4,403   |
| `src/components/courses`                                    | 1     | 4,496   |
| `src/components/seo`                                        | 1     | 3,336   |
| `src/constants`                                             | 8     | 21,359  |
| `src/data`                                                  | 2     | 7,672   |
| `src/layouts`                                               | 4     | 12,802  |
| `src/lib`                                                   | 4     | 18,893  |
| `src/styles`                                                | 3     | 3,031   |
| `src/content/blog`                                          | 1     | 436     |
| Root src files (env.d.ts, content.config.ts, middleware.ts) | 3     | 4,318   |

---

## Step 2 — Dead File Detection

Searched every `.astro`/`.svelte` basename (excluding self) across all `.astro`, `.svelte`, `.ts`, `.js`, `.tsx`, `.jsx` files under `src/`.

**7 components with zero references found:**

| File                                          | Lines | Bytes  | Notes                                                                   |
| --------------------------------------------- | ----- | ------ | ----------------------------------------------------------------------- |
| `src/components/sections/AdEntryPoints.astro` | 75    | 3,639  | Likely superseded by inline ad-audience logic in `ads/[audience].astro` |
| `src/components/sections/BlogGrid.astro`      | 33    | 2,011  | `blog/index.astro` renders its own grid inline — this is unused         |
| `src/components/sections/ContactForm.astro`   | 228   | 10,820 | `contact.astro` has a full inline form — this component duplicates it   |
| `src/components/sections/CourseGrid.astro`    | 35    | 1,793  | `courses/index.astro` now renders its own card loop — this is orphaned  |
| `src/components/sections/PricingTable.astro`  | 165   | 9,846  | Superseded by `PricingGrid.svelte`; no import anywhere                  |
| `src/components/sections/TeacherGrid.astro`   | 41    | 2,217  | `teachers.astro` renders teacher cards inline — this component unused   |
| `src/components/sections/ValuePillars.astro`  | 21    | 1,791  | No page imports it                                                      |

> **Note on `PricingCalculator.svelte`**: Confirmed imported in `HowItWorks.astro` (grep returned OK(2)) — NOT orphaned.

---

## Step 3 — Duplicate / Near-Duplicate Detection

Basenames shared across different folders (filtered to true ambiguities — excluded obvious unrelated pairs like `contact.astro` page vs `api/contact.ts` route):

| Basename                        | Files                                                                                                                                                                                              | Verdict                                                                                                                                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `testimonials`                  | `src/constants/testimonials.ts` (1,950B, typed `Testimonial` with `id/initials/name/longQuote`) vs `src/data/testimonials.ts` (1,313B, typed `Testimonial` with `quote/initials/avatarColor/name`) | **True fork** — different schemas, different field names. Two parallel testimonial stores. `src/data/testimonials.ts` is imported by `index.astro`; `src/constants/testimonials.ts` is imported by `testimonials.astro`. Consolidation candidate — HIGH. |
| `teachers`                      | `src/constants/teachers.ts` (704B, `TEACHERS_LIST` array with real teacher data) vs `src/pages/teachers.astro` (20,652B)                                                                           | **Not a true dupe** — data file vs page file. But teacher data array is hardcoded in both the constant AND inline in `teachers.astro` — verify if the page actually imports the constant or redeclares its own array.                                    |
| `landing`                       | `src/constants/landing.ts` (1,197B, audience copy + slug type) vs `src/layouts/Landing.astro` (432B, a layout shell)                                                                               | **Not a dupe** — completely different roles.                                                                                                                                                                                                             |
| `[slug]`                        | `src/pages/blog/[slug].astro` vs `src/pages/courses/[slug].astro`                                                                                                                                  | **Not a dupe** — same Astro dynamic-route pattern, different content.                                                                                                                                                                                    |
| `PricingTable` vs `PricingGrid` | `sections/PricingTable.astro` (165 lines, dead — see Step 2) vs `fees/PricingGrid.svelte` (active)                                                                                                 | **Functional overlap** — PricingTable is the static Astro predecessor to the interactive Svelte grid. PricingTable is dead; only PricingGrid is live.                                                                                                    |

---

## Step 4 — Stray Backup / Artifact Files

Searched `src/` recursively for: `*.bak`, `*backup*`, `*_old*`, `*_copy*`, `*-v2*`, timestamped filenames.

**Result: 0 stray artifact files found under `src/`.**

> The `tuition-fee.astro.bak-20260728_234906` file referenced in the session prompt was NOT found — it was already cleaned up or never committed to the working tree.

---

## Step 5 — Naming Convention Audit

**Dominant convention: PascalCase for all component files (`.astro`, `.svelte`)**

All 35 component files under `src/components/` use PascalCase — **zero violations**.

**Page files** (`src/pages/`): dominant convention is **kebab-case** for multi-word pages.

| File                           | Verdict                         |
| ------------------------------ | ------------------------------- |
| `src/pages/tuition-fee.astro`  | ✅ kebab-case                   |
| `src/pages/how-it-works.astro` | ✅ kebab-case                   |
| `src/pages/safeguarding.astro` | ✅ single word                  |
| `src/pages/portals.astro`      | ✅ single word                  |
| `src/pages/llms.txt.ts`        | ✅ special (generated endpoint) |

**No page naming violations found.**

**Constants files** (`src/constants/`): dominant convention is **camelCase/lowercase** — all files lowercase, consistent.

**Layouts** (`src/layouts/`): mix — `Base.astro`, `Funnel.astro`, `Landing.astro`, `Page.astro` — all PascalCase. Consistent.

**No naming convention violations found anywhere in `src/`.**

---

## Step 6 — Size Outliers (Top 15 by bytes)

| Rank | File                                            | Size                  | Why large                                                                                                                                                                    |
| ---- | ----------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `pages/how-it-works.astro`                      | 88,365B / 1,708 lines | All section content inlined — no extraction to components. Multiple large visual step blocks, hardcoded SVGs, stat grids, all in one file. Prime componentization candidate. |
| 2    | `pages/contact.astro`                           | 70,136B / 1,304 lines | Inline form, validation feedback UI, map iframe, all channel cards, contact FAQ — nothing extracted. `ContactForm.astro` exists in components but is unused (see Step 2).    |
| 3    | `pages/careers.astro`                           | 65,752B / 753 lines   | All job listings, perks grid, teacher application form, and culture section hardcoded inline.                                                                                |
| 4    | `pages/about.astro`                             | 46,662B / 564 lines   | Full founder story, team grid, mission section, stats row all inline.                                                                                                        |
| 5    | `pages/legal/refund.astro`                      | 20,966B               | Long-form legal text — expected size for policy doc.                                                                                                                         |
| 6    | `pages/teachers.astro`                          | 20,652B               | Teacher profile cards repeated inline. `TeacherGrid.astro` exists but is unused (see Step 2).                                                                                |
| 7    | `pages/courses/index.astro`                     | 17,731B               | Post-redesign: still has filter chip logic, card loop, section copy all inline. CourseCard component exists but course index still heavier than needed.                      |
| 8    | `pages/features.astro`                          | 17,587B               | All feature blocks, comparison table, platform mockup, guarantee section inline.                                                                                             |
| 9    | `pages/testimonials.astro`                      | 14,394B               | Full testimonials grid with inline data array (separate from `src/data/testimonials.ts` — see Step 3).                                                                       |
| 10   | `pages/legal/terms.astro`                       | 13,848B               | Long-form legal text — expected.                                                                                                                                             |
| 11   | `components/fees/PricingGrid.svelte`            | 13,891B               | Interactive pricing grid + calculator state + CTA (recently extended). Expected for a rich Svelte island.                                                                    |
| 12   | `pages/legal/privacy.astro`                     | 12,962B               | Long-form legal text — expected.                                                                                                                                             |
| 13   | `components/fees/PricingCalculator.svelte`      | 12,871B               | Full interactive calculator with pricing matrix, state, and CTA. Mounted on how-it-works. Expected.                                                                          |
| 14   | `components/sections/QuranificDifference.astro` | 12,706B               | Comparison table, card grid, inline SVGs all packed into one section component.                                                                                              |
| 15   | `components/global/Footer.astro`                | 12,145B               | Full nav link tree, multiple columns, legal links, social icons, newsletter signup — typical for a site footer.                                                              |

---

## Summary

| Metric                            | Count                                                           |
| --------------------------------- | --------------------------------------------------------------- |
| Total files under `src/`          | **95**                                                          |
| Total size                        | **767,096 bytes (~749 KB)**                                     |
| Dead/zero-reference components    | **7**                                                           |
| True data-dupe candidates         | **1** (`constants/testimonials.ts` vs `data/testimonials.ts`)   |
| Functional-overlap dead component | **1** (`PricingTable.astro` superseded by `PricingGrid.svelte`) |
| Stray backup/artifact files       | **0**                                                           |
| Naming convention violations      | **0**                                                           |
| Size outliers >30KB               | **5** (`how-it-works`, `contact`, `careers`, `about`, `refund`) |
