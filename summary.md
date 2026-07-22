# QURANIFIC REPO — .MD FILE AUDIT SUMMARY
Generated: 2026-07-22  
Branch: `audit/full-site-2026-07-15`

---

## FILE LIST (project .md files, excluding node_modules)

| # | Path | Size (bytes) |
|---|---|---|
| 1 | `audits/AUDIT-00-SUMMARY.md` | 1,079 |
| 2 | `audits/AUDIT-01-UI.md` | 3,207 |
| 3 | `audits/AUDIT-02-UX.md` | 2,261 |
| 4 | `audits/AUDIT-03-CONTENT.md` | 1,164 |
| 5 | `audits/AUDIT-04-OTHER.md` | 1,260 |
| 6 | `audits/FIX-LOG.md` | 851 |
| 7 | `src/content/blog/hello-world.md` | 436 |
| 8 | `src_backup_20260704_200229/content/blog/hello-world.md` | 448 |
| 9 | `AUDIT-LEDGER.md` | 6,943 |
| 10 | `DEPLOYMENT.md` | 2,543 |
| 11 | `Quranific-agent-constitution.md` | 10,278 |
| 12 | `QURANIFIC_OWNER_ACTIONS.md` | 4,413 |

Total: **12 project .md files** (all read in full below).

---

## PER-FILE ENTRIES

---

### 1. `audits/AUDIT-00-SUMMARY.md`
**Purpose:** Top-level summary of the pre-session audit findings.  
**Key facts:**
- 1 Critical finding, 9 Important, 2 Nice-to-have (12 total findings)
- 11 findings are `[CODE-VERIFIED]`, 1 is `[NEEDS VISUAL CONFIRMATION]`
- Top 5 items named: UX-01 (nav disparity), UI-04 (510+ hardcoded hex instances), UI-02 (arbitrary spacing), UI-05 (arbitrary typography), UI-03 (button componentization)

**Status:** Appears to be a read-only audit artifact, no claimed fix status. Status of findings is tracked in `FIX-LOG.md`.

---

### 2. `audits/AUDIT-01-UI.md`
**Purpose:** Phase 1 UI audit findings — 5 items, all code-verified.  
**Key facts:**
- **UI-01:** `quranific-container` utility defined in global.css but many pages write inline classes manually
- **UI-02:** Arbitrary spacing values widespread (`left-[17px]`, `ml-[68px]`, etc.)
- **UI-03:** Raw anchor tags used for CTAs in `Header.astro` (line 81) and `index.astro` (line 393) instead of `Button.astro`
- **UI-04:** >510 instances of hardcoded hex colors across the site
- **UI-05:** Arbitrary font sizes below legibility floor (`text-[10px]`, `text-[11px]`)

**Status:** Audit documentation only (findings, not fixes). All items listed as `Not Started` in FIX-LOG.md.  

**⚠️ CONTRADICTION with session work:** The session claims to have fixed UI-01 through UI-05 across all pages, but this file and FIX-LOG.md both show status as "Not Started." The FIX-LOG.md has never been updated by the session agent. See contradiction section below.

---

### 3. `audits/AUDIT-02-UX.md`
**Purpose:** Phase 2 UX audit findings — 4 items, all code-verified.  
**Key facts:**
- **UX-01 (Critical):** Desktop nav has 4 items; mobile nav has 8 items. Fundamentally different hierarchies.
- **UX-02:** Adult CTA section — "Book Adult Trial Class" and "Ask a Question" compete at equal visual weight on `index.astro` (lines 389-397)
- **UX-03:** Contact form inputs lack inline error states / `aria-invalid` toggling
- **UX-04:** Promo bar close button is ~38px tap target, below the 44px WCAG minimum

**Status:** Audit documentation only. All items `Not Started` in FIX-LOG.md.

---

### 4. `audits/AUDIT-03-CONTENT.md`
**Purpose:** Phase 3 content quality audit — 2 items.  
**Key facts:**
- **CON-01:** Heading "This isn't how it used to be taught" called out as generic SaaS copy pattern (Nice-to-have)
- **CON-02 (Important):** Stats array in `site.ts` (22 Countries, 94% Retention, 4.9 Rating) is flagged as unverified with an explicit developer comment in the file saying so

**Status:** Audit documentation only. Both items `Not Started` in FIX-LOG.md.

---

### 5. `audits/AUDIT-04-OTHER.md`
**Purpose:** Phase 4 remaining categories — 2 items.  
**Key facts:**
- **OTH-01:** Turnstile public site key hardcoded in `site.ts` (line 18) — should use env var injection
- **OTH-02:** Promo bar contrast ratio — `text-emerald-50` on dark emerald gradient with small text; flagged as `[NEEDS VISUAL CONFIRMATION]`, unconfirmed

**Status:** Audit documentation only. Both items `Not Started` in FIX-LOG.md.

**⚠️ CONTRADICTION with session work:** The session reports fixing OTH-01 (Turnstile moved to env var), but this file and FIX-LOG.md still show Not Started. The audit file is now stale relative to the actual code.

---

### 6. `audits/FIX-LOG.md`
**Purpose:** Tracking table mapping each finding ID (UI-01 through OTH-02) to fix status.  
**Key facts:**
- Every single row shows `Not Started` with empty Fixed By / Date / Notes columns
- 13 findings tracked total

**Status:** **Completely stale.** The session agent executed fixes for UI-01, UI-02, UI-03, UI-04, UI-05, UX-02, UX-03, OTH-01 across multiple batches — none of these are reflected here. This file was never updated during the session.

---

### 7. `src/content/blog/hello-world.md`
**Purpose:** Placeholder blog post to initialize the Astro content collection.  
**Key facts:**
- Title: "Welcome to the Quranific Blog"
- Description explicitly says "placeholder post"
- Body text says the blog templates haven't been built yet ("once we build the index.astro and [slug].astro templates")
- pubDate: 2026-03-20

**Status:** Planned/placeholder. The body copy contradicts reality — both `blog/index.astro` and `blog/[slug].astro` now exist in the codebase. The placeholder copy is therefore misleading if the blog goes live.

---

### 8. `src_backup_20260704_200229/content/blog/hello-world.md`
**Purpose:** Identical content to item 7 above, residing in an archived backup directory.  
**Key facts:**
- Same title, description, pubDate, tags, and body text as item 7
- Only difference is line endings (CRLF vs LF) — likely an artifact of the directory copy

**Status:** **Orphaned/duplicate.** This is a backup snapshot from 2026-07-04, residing in `src_backup_20260704_200229/`. It has no functional role and is identical to the live version. Should not be deleted without confirming the backup directory policy, but it adds no value.

---

### 9. `AUDIT-LEDGER.md`
**Purpose:** Master tracking ledger for the full site audit, listing every file in the codebase (78 rows) with PENDING/IN_PROGRESS/FIXED/etc. status columns.  
**Key facts:**
- Branch noted as `audit/full-site-2026-07-15`, started 2026-07-15
- Lists Phase 0 (Inventory) as `COMPLETE` — all other phases (1-6) as `PENDING`
- Includes an ENV/Bindings inventory noting `SESSION` KV with ID `14eab319d57e4c58b5f903bce3eb3931` — explicitly flagged "needs real verification"
- Every single file row shows `PENDING` — none updated to reflect session work

**Status:** **Massively stale.** The session agent completed work across Phases 1-6 (all pages, all API routes, middleware, legal, SEO), but every row in this file still reads `PENDING`. This ledger was never updated during the session and does not reflect current code state.

---

### 10. `DEPLOYMENT.md`
**Purpose:** Standard operating procedure (SOP) for deploying to Cloudflare Pages.  
**Key facts:**
- Lists required credentials: `RESEND_API_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `JWT_SECRET`, `ADMIN_EMAIL`
- Specifies KV namespace `SESSION` for idempotency and dead-letter queue, with `npx wrangler kv:namespace create SESSION` command
- Instructs putting `TURNSTILE_SITE_KEY` in `src/constants/site.ts` directly (line 10)
- Local dev: copy `.env.example` to `.dev.vars`, use dummy Turnstile secret `1x0000000000000000000000000000000AA`
- Security checklist at the bottom (all unchecked)

**Status:** **Partially stale / contradicted.** The instruction on line 10 says `TURNSTILE_SITE_KEY` goes in `src/constants/site.ts` directly — but the session agent changed this to use `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY` as part of the OTH-01 fix. The DEPLOYMENT.md now gives instructions that contradict the actual code. The security checklist at the bottom is never updated.

---

### 11. `Quranific-agent-constitution.md`
**Purpose:** Agent operating rules — the master governance document for all AI-assisted work on the codebase.  
**Key facts:**
- Defines identity: "Senior full-stack engineer + CRO/UX/SEO/security specialist"
- Stack: Astro 6 · Svelte 5 (Runes) · Tailwind v4 · Cloudflare Pages/Workers · Resend
- Five Prime Directives: no fabricated facts, no unproven success claims, output economy (3-8 line chat replies), scope discipline, ask before deleting/renaming/legal/pricing
- Full design system rules (UI consistency, UX, content, accessibility, performance, SEO, architecture, security, code quality)
- Anti-pattern table and severity labels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `OPPORTUNITY`)
- Explicitly requires running real build/lint/typecheck before saying "done" and running `git status + git log` locally and on remote

**Status:** Active governing document. No claimed status. This file is not tracked in FIX-LOG.md or AUDIT-LEDGER.md as it is meta, not a deliverable.  

**⚠️ NOTE:** Prime Directive #2 requires `git status + git log --oneline -3` locally **and on remote** before claiming success. The session's git work (22 modified files, multiple new untracked files) has **never been committed**, so no remote verification was ever possible per the constitution's own standards.

---

### 12. `QURANIFIC_OWNER_ACTIONS.md`
**Purpose:** Owner-facing checklist of every unverified fact, missing credential, or business decision requiring human confirmation before launch.  
**Key facts:**
- 43+ checklist items total (all unchecked `[ ]`)
- Categories: stats verification, founder story, teacher credentials, pricing, policies, safeguarding claims, Cloudflare secrets, legal policies
- **File corruption detected:** Lines 44-49 contain null-byte-encoded UTF-16 text (`\u0000` between every character). This is garbled content appended by the session agent using a PowerShell `echo >>` command that wrote UTF-16LE instead of UTF-8. The affected lines appear to be: Confirm governing jurisdiction (UK), Confirm statute of limitations (1 year), Confirm refund window (7 days), Confirm grace period (5 days), Confirm make-up notice rule (5 hours), Provision and verify 'SESSION' KV binding.
- Line 44 also contains a stale action item: "Add Turnstile widget to CompleteForm.svelte and Newsletter components" — the session agent subsequently claims to have done this, making this line contradictory

**Status:** Active but **corrupted.** The last 6 entries (lines 44-49) are unreadable in standard markdown renderers due to null byte encoding. The file must be repaired before the owner can act on those items.

---

## CONTRADICTIONS BETWEEN FILES

| # | Files | Topic | Contradiction |
|---|---|---|---|
| 1 | `audits/FIX-LOG.md` vs session chat claims | Fix status | FIX-LOG.md shows all 13 findings as `Not Started`. The session agent claims UI-01 through UI-05, UX-02, UX-03, UX-04, OTH-01 were fixed. The log was never updated. |
| 2 | `AUDIT-LEDGER.md` vs session chat claims | Phase progress | AUDIT-LEDGER.md shows Phases 1-6 as `PENDING`. Session claims all phases were completed across 8 batches. Ledger was never updated. |
| 3 | `DEPLOYMENT.md` (line 10) vs session code changes | TURNSTILE_SITE_KEY location | DEPLOYMENT.md says key goes in `src/constants/site.ts` directly. Session changed `site.ts` to use `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY`. The SOP is now wrong. |
| 4 | `QURANIFIC_OWNER_ACTIONS.md` (line 44) vs session claims | Turnstile widget in CompleteForm | Line 44 says "Add Turnstile widget to CompleteForm.svelte and Newsletter components now that backend enforces it" (implying it's NOT done). Session Batch 6 claims to have implemented this. Either the item is now resolved but not checked, or the implementation is incomplete. |
| 5 | `src/content/blog/hello-world.md` body text vs codebase | Blog templates | Post body says "once we build the index.astro and [slug].astro templates." Both templates exist in the codebase. The placeholder copy is stale/misleading. |
| 6 | `AUDIT-00-SUMMARY.md` finding severity list vs `AUDIT-LEDGER.md` phase plan | Scope | AUDIT-00-SUMMARY lists 12 findings (1 Critical, 9 Important, 2 Nice-to-have). AUDIT-LEDGER tracks 78 rows across 6 phases. These are complementary but independently maintained with no cross-reference. No conflict per se, but they could drift. |

---

## STALE / ORPHANED / DUPLICATE FLAGS

| File | Flag | Reason |
|---|---|---|
| `audits/FIX-LOG.md` | **STALE** | Never updated during session. Shows all items as Not Started despite claimed fixes. |
| `AUDIT-LEDGER.md` | **STALE** | Never updated during session. All 78 rows still PENDING. |
| `DEPLOYMENT.md` | **PARTIALLY STALE** | TURNSTILE_SITE_KEY instructions now contradict the actual code. Security checklist never updated. |
| `src_backup_20260704_200229/content/blog/hello-world.md` | **ORPHANED DUPLICATE** | Identical content to live version, in a backup directory with no functional role. |
| `src/content/blog/hello-world.md` | **STALE COPY** | Body text references blog templates not yet built, but both templates now exist in the codebase. |
| `QURANIFIC_OWNER_ACTIONS.md` (lines 44-49) | **CORRUPTED** | UTF-16LE null-byte encoding makes these lines unreadable in markdown renderers. Requires manual repair. |

---

## GIT LOG / STATUS / BRANCH — VERBATIM OUTPUT

### `git log --oneline -30` (and `--all`)
```
aba52ea chore: enforce Node v22 for Cloudflare Pages build
95d1a13 fix: add missing @eslint/js dependency, fix husky v10 compat
c3af0cf sync: wip restructure
f6947ce Initial enterprise baseline with legacy tech debt
```
*(Only 4 commits exist in the entire repo history.)*

### `git status`
```
On branch audit/full-site-2026-07-15
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   astro.config.mjs
	modified:   package.json
	modified:   src/components/funnel/CompleteForm.svelte
	modified:   src/components/global/Footer.astro
	modified:   src/components/sections/ContactForm.astro
	modified:   src/layouts/Base.astro
	modified:   src/lib/email.ts
	modified:   src/middleware.ts
	modified:   src/pages/api/complete.ts
	modified:   src/pages/api/contact.ts
	modified:   src/pages/api/newsletter.ts
	modified:   src/pages/contact.astro
	modified:   src/pages/how-it-works.astro
	modified:   src/pages/legal/cookies.astro
	modified:   src/pages/legal/impressum.astro
	modified:   src/pages/legal/privacy.astro
	modified:   src/pages/legal/refund.astro
	modified:   src/pages/legal/terms.astro
	modified:   src/pages/llms.txt.ts
	modified:   src/pages/rss.xml.ts
	modified:   src/pages/tuition-fee.astro
	modified:   wrangler.toml

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	AUDIT-LEDGER.md
	QURANIFIC_OWNER_ACTIONS.md
	Quranific-agent-constitution.md
	audits/
	replace.cjs
	src_backup_20260715_203823.zip

no changes added to commit (use "git add" and/or "git commit -a")
```

### `git branch -a`
```
* audit/full-site-2026-07-15
  backup-phase-10
  main
  pre-agent-audit-backup
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
  remotes/origin/pre-agent-audit-backup
```

### `git log --all --grep="gemini" -i --oneline`
```
(no output — no commit messages reference "gemini")
```

---

## BEST-GUESS "LAST CLEAN STATE BEFORE SESSION" COMMIT

**Candidate: `aba52ea` — "chore: enforce Node v22 for Cloudflare Pages build"**

**Reasoning:**
- The entire session was conducted on the `audit/full-site-2026-07-15` branch
- **Zero commits were made during the session** — all 22 modified files and 6 new untracked files remain uncommitted
- The branch `pre-agent-audit-backup` exists on both local and remote, and its name strongly suggests it was created deliberately before any agent session began
- The 4-commit log (`aba52ea`, `95d1a13`, `c3af0cf`, `f6947ce`) predates the session — `aba52ea` is HEAD of main at time of branch creation
- The branch `audit/full-site-2026-07-15` itself was created from `aba52ea` (or thereabouts) given the date in the branch name matches the apparent audit start date
- No commits reference "gemini" or any session identifier in any branch

**To verify:** Run `git log pre-agent-audit-backup --oneline` and compare to `aba52ea`. If they match, `aba52ea` is definitively the pre-session baseline. Alternatively, `git diff pre-agent-audit-backup HEAD` will show all net changes from the session.

**Key risk:** Because **no session work was ever committed**, a `git checkout .` or `git restore .` on the current branch would **destroy all 22 modified files** with no recovery path other than the `.zip` backup (`src_backup_20260715_203823.zip`) and whatever is in `src_backup_20260704_200229/`. The constitution's Prime Directive #2 requires remote verification before claiming success — this was never done.
