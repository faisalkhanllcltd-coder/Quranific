# FIX LOG
Statuses based on `git diff pre-agent-audit-backup...HEAD` evidence only.
PARTIAL = diff exists but finding not fully resolved. NOT DONE = no diff evidence.

| Finding ID | Status       | Fixed By | Evidence File(s) | Notes |
| ---------- | ------------ | -------- | ---------------- | ----- |
| UI-01      | INCOMPLETE   | Session  | `global.css` — zero diff; no container substitutions confirmed | `global.css` was not in diff at all |
| UI-02      | PARTIAL      | Session  | `about.astro`, `contact.astro`, `legal/*.astro` | `teachers.astro`, `careers.astro`, `testimonials.astro` — zero diff |
| UI-03      | NOT DONE     | —        | None | `Header.astro` CTA still raw `<a>` tag; `index.astro` zero diff |
| UI-04      | PARTIAL      | Session  | `legal/*.astro`, `about.astro`, `contact.astro` | `teachers.astro`, `careers.astro`, `testimonials.astro` — zero diff |
| UI-05      | PARTIAL      | Session  | `about.astro`, `contact.astro`, legal pages | `teachers.astro` zero diff; `text-[11px]` still in `how-it-works.astro` |
| UX-01      | NOT DONE     | —        | None | `MAIN_NAVIGATION` / `MOBILE_NAVIGATION` arrays unchanged |
| UX-02      | NOT DONE     | —        | None | `index.astro` zero diff |
| UX-03      | INCOMPLETE   | Session  | `ContactForm.astro` (type fixes only) | Per-field `aria-invalid` not added |
| UX-04      | NOT DONE     | —        | None | Header promo bar padding unchanged in diff |
| CON-01     | NOT DONE     | —        | None | `index.astro` zero diff |
| CON-02     | PARTIAL      | Session  | `src/CONSTANTS/site.ts`, `courses/index.astro`, `about.astro` | Only `3,200` replaced; 22/94%/4.9★ still unverified |
| OTH-01     | PARTIAL      | Session  | `CompleteForm.svelte`, `Footer.astro` (widget uses env var) | `site.ts` key still holds placeholder string |
| OTH-02     | OPEN         | —        | None | Requires visual contrast check; never claimed |
