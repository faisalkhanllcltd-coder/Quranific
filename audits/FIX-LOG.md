# FIX LOG
Evidence basis: `git diff pre-agent-audit-backup...HEAD`. Updated after each commit on `audit/full-site-2026-07-15`.
FIXED = diff evidence confirmed. PARTIAL = diff exists but incomplete. INCOMPLETE = claimed, no per-field evidence. NOT DONE = no diff. OPEN = requires owner/visual input.

| Finding ID | Status | Fixed In | Evidence File(s) | Remaining Gap |
| ---------- | ------ | -------- | ---------------- | ------------- |
| UI-01      | INCOMPLETE | — | `global.css` zero diff; `Base.astro` changed but not for containers | Per-page `quranific-container` substitution not confirmed |
| UI-02      | PARTIAL | Batch 1–4 | `about.astro`, `contact.astro`, `legal/*.astro`, `how-it-works.astro`, `tuition-fee.astro` | `teachers.astro`, `careers.astro`, `testimonials.astro` — zero diff until this batch |
| UI-03      | NOT DONE | — | None | `Header.astro` CTA still raw `<a>` tag; `index.astro` deferred |
| UI-04      | PARTIAL | Batch 1–4 | `legal/*.astro`, `about.astro`, `contact.astro` | `teachers.astro`, `careers.astro`, `testimonials.astro` — zero diff until this batch |
| UI-05      | PARTIAL | Batch 1–4 | `about.astro`, `contact.astro`, legal pages | `teachers.astro` line 283 `text-[10px]`; `careers.astro` many instances; `how-it-works.astro` line 244 `text-[11px]` — until this batch |
| UX-01      | NOT DONE | — | None | `MAIN_NAVIGATION` / `MOBILE_NAVIGATION` arrays unchanged — fixing this batch |
| UX-02      | NOT DONE | — | None | `index.astro` deferred per task |
| UX-03      | INCOMPLETE | Batch 5 | `ContactForm.astro` type cleanup only | Per-field `aria-invalid` not added — fixing this batch |
| UX-04      | NOT DONE | — | None | Promo bar close button tap target — fixing this batch |
| CON-01     | NOT DONE | — | None | `index.astro` deferred per task |
| CON-02     | PARTIAL | Batch 1–4 | `src/CONSTANTS/site.ts`, `courses/index.astro`, `about.astro` | 22 countries, 94%, 4.9★ remain — handling this batch |
| OTH-01     | PARTIAL | Batch 6 | `CompleteForm.svelte`, `Footer.astro` use env var | `site.ts` key still live — cannot remove; `signup.astro:34` references `SITE.turnstileSiteKey` |
| OTH-02     | OPEN | — | None | Needs WCAG contrast calc — doing this batch |
