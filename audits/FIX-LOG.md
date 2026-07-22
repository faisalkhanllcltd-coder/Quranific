# FIX LOG
Evidence basis: `git diff pre-agent-audit-backup...HEAD` — updated after every commit on `audit/full-site-2026-07-15`.
FIXED = diff evidence confirmed + build passing. PARTIAL = diff exists, residual gap documented. NOT DONE = no diff. OPEN = requires owner input.

| Finding | Status | Commit(s) | Evidence File(s) | Residual Gap |
| ------- | ------ | --------- | ---------------- | ------------ |
| UI-01   | PARTIAL | — | `global.css` zero diff; `Base.astro` touched for speculationrules only | Per-page quranific-container substitution not confirmed; `global.css` untouched |
| UI-02   | FIXED ✓ | `10c404b` | `teachers.astro`, `careers.astro`, `how-it-works.astro` + prior session: `about.astro`, `contact.astro`, `legal/*.astro` | `testimonials.astro` had no arbitrary spacing (clean); `index.astro` deferred |
| UI-03   | NOT DONE | — | None | `Header.astro` CTA remains raw `<a>` tag; `index.astro` deferred |
| UI-04   | FIXED ✓ | `10c404b` | `teachers.astro`, `careers.astro` + prior: `legal/*.astro`, `about.astro`, `contact.astro` | `index.astro` deferred |
| UI-05   | FIXED ✓ | `10c404b` | `teachers.astro` line 283 `text-[10px]`→`text-xs`; `careers.astro` all instances; `how-it-works.astro` line 244 `text-[11px]`→`text-xs` | `index.astro` deferred |
| UX-01   | FIXED ✓ | `f47faff` | `src/constants/site.ts` — MAIN_NAVIGATION expanded from 4 to 8 items matching MOBILE_NAVIGATION | None |
| UX-02   | NOT DONE | — | None | `index.astro` deferred per task |
| UX-03   | FIXED ✓ | `958f809` | `ContactForm.astro` — per-field `aria-invalid`, `aria-describedby`, inline error `<p role="alert">`, input-event reset, `validateFields()` before submit | Careers application form fields have no `aria-invalid` (out of scope this pass — that form posts client-side only) |
| UX-04   | FIXED ✓ | `c224eee` | `Header.astro` line 32 — close button `p-3`→`min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center` | None |
| CON-01  | NOT DONE | — | None | `index.astro` deferred |
| CON-02  | FIXED ✓ | `f47faff`, `eeafbe7` | `site.ts`: 22/94%/4.9★ → qualitative + TODO; `testimonials.astro`: 4.9/5, 50k+, 100+ countries → qualitative + TODO; aggregateRating removed from JSON-LD | Owner must confirm real values to restore numbers |
| OTH-01  | REPORTED | — | `signup.astro:34` still references `SITE.turnstileSiteKey` — field **cannot** be removed | Owner must replace placeholder `0x4AAAAAAA_REPLACE_WITH_REAL_KEY` with real Cloudflare Turnstile site key |
| OTH-02  | CLOSED ✓ | — | Calculated: promo bar text (emerald-50 @ opacity-90) on `#064e3b` mid-gradient = **7.9:1** ✓ PASS; highlight (emerald-300) = **6.4:1** ✓ PASS; close icon (emerald-400/80) = **3.85:1** ✓ PASS for graphical elements (3:1 threshold) | No code change needed |
