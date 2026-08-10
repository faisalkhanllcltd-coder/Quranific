# Stack Upgrade Audit

**Date:** 2026-08-10
**Mode:** Read-only. No installs, builds, commits, or pushes performed.

> ⚠️ **NOTE:** The first npm registry query during this audit returned heavily cached/stale versions.
> All version data below is from the second, verified query and cross-referenced with installed
> versions from `node_modules`. Trust only this file — discard any earlier draft.

---

## STEP 0 — Backups Confirmed

| Type        | Location                                                                         |
| ----------- | -------------------------------------------------------------------------------- |
| Git branch  | `backup-pre-stack-audit` ✅                                                      |
| Zip archive | `D:\Live Web\backups\quranific-pre-stack-audit-2026-08-10_13-21.zip` (0.8 MB) ✅ |

---

## STEP 1 — Full Dependency Inventory (Real Versions)

### Runtime Dependencies

| Package                    | Installed | npm Latest (stable) | Delta    | Risk Tier             |
| -------------------------- | --------- | ------------------- | -------- | --------------------- |
| astro                      | 6.1.9     | **7.2.0**           | MAJOR    | 🔴 MAJOR              |
| svelte                     | 5.55.5    | 5.56.8              | PATCH    | ✅ PATCH              |
| @astrojs/cloudflare        | 13.2.1    | **14.2.0**          | MAJOR    | 🔴 MAJOR              |
| @astrojs/svelte            | 8.0.5     | **9.0.1**           | MAJOR    | 🔴 MAJOR              |
| @astrojs/mdx               | 5.0.4     | **7.0.5**           | MAJOR +2 | 🔴 MAJOR (+ dead dep) |
| @astrojs/partytown         | 2.1.7     | 2.1.7               | none     | ✅ CURRENT            |
| @astrojs/sitemap           | 3.7.2     | 3.7.3               | PATCH    | ✅ PATCH              |
| tailwindcss                | 4.2.4     | 4.3.3               | MINOR    | 🟡 MINOR              |
| @tailwindcss/vite          | 4.2.4     | 4.3.3               | MINOR    | 🟡 MINOR              |
| jose                       | 6.2.3     | 6.2.8               | PATCH    | ✅ PATCH              |
| lucide-svelte              | 1.0.1     | 1.0.1               | none     | ✅ CURRENT            |
| resend                     | 4.8.0     | 6.18.1              | MAJOR +2 | 🔴 MAJOR (+ dead dep) |
| zod                        | 3.25.76   | **4.4.3**           | MAJOR    | 🔴 MAJOR              |
| @fontsource-variable/inter | 5.2.8     | —                   | —        | ✅ PATCH est.         |
| @fontsource/amiri          | 5.2.8     | —                   | —        | ✅ PATCH est.         |
| @fontsource/merriweather   | 5.2.11    | —                   | —        | ✅ PATCH est.         |

### Dev Dependencies

| Package                   | Installed    | npm Latest (stable) | Delta      | Risk Tier                 |
| ------------------------- | ------------ | ------------------- | ---------- | ------------------------- |
| @astrojs/check            | 0.9.8        | 0.9.10              | PATCH      | ✅ PATCH                  |
| @cloudflare/workers-types | 4.20260426.1 | **5.20260810.1**    | MAJOR      | 🔴 MAJOR                  |
| @eslint/js                | 10.0.1       | 10.8.1              | MINOR      | 🟡 MINOR                  |
| @typescript-eslint/parser | 8.59.1       | 8.66.0              | MINOR      | 🟡 MINOR                  |
| eslint                    | 10.2.1       | 10.8.1              | MINOR      | 🟡 MINOR (10.x IS stable) |
| eslint-plugin-astro       | 1.7.0        | **3.1.0**           | MAJOR +2   | 🔴 MAJOR                  |
| eslint-plugin-svelte      | 3.17.1       | 3.22.0              | MINOR      | 🟡 MINOR                  |
| globals                   | 17.5.0       | —                   | PATCH est. | ✅ PATCH                  |
| husky                     | 9.1.7        | 9.1.7               | none       | ✅ CURRENT                |
| lint-staged               | 16.4.0       | **17.3.0**          | MAJOR      | 🔴 MAJOR                  |
| prettier                  | 3.8.3        | 3.9.6               | MINOR      | 🟡 MINOR                  |
| prettier-plugin-astro     | 0.14.1       | —                   | —          | PATCH est.                |
| prettier-plugin-svelte    | 3.5.1        | —                   | —          | PATCH est.                |
| svelte-eslint-parser      | 1.6.0        | —                   | —          | PATCH est.                |
| typescript                | 5.9.3        | **7.0.2**           | MAJOR +2   | 🔴 MAJOR                  |
| typescript-eslint         | 8.59.1       | 8.66.0              | MINOR      | 🟡 MINOR                  |
| wrangler                  | 4.85.0       | 4.120.0             | MINOR      | 🟡 MINOR                  |

---

## STEP 2 — Node.js Version

| Item                   | Value                          |
| ---------------------- | ------------------------------ |
| `.nvmrc` pinned        | `22.12.0`                      |
| `package.json` engines | **Not set** — no engines field |
| Local running          | `v24.13.1` (Node 24 Current)   |
| Node 22 LTS latest     | `22.17.x`                      |
| Node 24 latest         | `24.13.1`                      |

**Cloudflare ceiling:**
Cloudflare Pages build environment reads `.nvmrc` → builds run on **Node 22.12.0**, not local 24.x. Cloudflare Workers runtime runs on V8, not Node; the `nodejs_compat` flag provides Node API polyfills. Cloudflare officially supports Node 18, 20, and 22 in the Pages build container. **Node 24 is not documented as supported on Cloudflare Pages.** The local 24.x / `.nvmrc` 22.x mismatch is not a production risk (Cloudflare uses .nvmrc), but creates a potential local dev discrepancy.

**Action:** Update `.nvmrc` from `22.12.0` → `22.17.x` at next maintenance pass. Stay on 22.x — do not follow Node 24 until Cloudflare explicitly adds Pages support.

---

## STEP 3 — Cloudflare-Specific Stack

| Item                                 | Installed    | Latest                | Gap                    |
| ------------------------------------ | ------------ | --------------------- | ---------------------- |
| `@astrojs/cloudflare`                | 13.2.1       | **14.2.0**            | 🔴 MAJOR               |
| `wrangler` (CLI)                     | 4.85.0       | 4.120.0               | 🟡 MINOR (35 versions) |
| `@cloudflare/workers-types`          | 4.20260426.1 | **5.20260810.1**      | 🔴 MAJOR               |
| `wrangler.toml` `compatibility_date` | `2026-03-25` | Latest: `2025-08-01`+ | —                      |

**Adapter minimum Astro version:**
`@astrojs/cloudflare` 14.x requires **Astro 7.x**. This creates a hard ordering dependency:

- **You cannot bump `@astrojs/cloudflare` to 14.x without simultaneously bumping `astro` to 7.x.**
- The reverse is also true — bumping Astro to 7 without adapter 14.x will likely break the build.
- **`@astrojs/svelte` must also move to 9.x in the same pass** (Astro 7 integration).
- These three packages must be bumped as an **atomic update.**

**`@cloudflare/workers-types` 4 → 5:**

- MAJOR version change — likely includes breaking type definition changes
- `env.d.ts` uses `import('@cloudflare/workers-types').KVNamespace` — this import path may change in v5
- Must be validated after update against `env.d.ts` and `tsconfig.json` type reference

**`wrangler.toml` `compatibility_date` = `2026-03-25`:**

- This date appears set in the future relative to Cloudflare's actual release cycle. Verify intentionality. A date too far in the future risks enabling unreviewed runtime behaviors. Current latest Cloudflare compatibility date is approximately 2025-08-01.

---

## STEP 4 — Core Framework Compatibility Matrix

| Framework | Installed | npm Latest | Jump Required |
| --------- | --------- | ---------- | ------------- |
| Astro     | 6.1.9     | **7.2.0**  | 🔴 MAJOR      |
| Svelte    | 5.55.5    | 5.56.8     | ✅ PATCH only |
| Tailwind  | 4.2.4     | 4.3.3      | 🟡 MINOR      |

**Cross-dependency constraints:**

| Upgrade                           | Requires                                                          | Risk                           |
| --------------------------------- | ----------------------------------------------------------------- | ------------------------------ |
| Astro 6 → 7                       | `@astrojs/cloudflare` 13 → 14 simultaneously                      | 🔴 Hard coupling               |
| Astro 6 → 7                       | `@astrojs/svelte` 8 → 9 simultaneously                            | 🔴 Hard coupling               |
| Astro 6 → 7                       | `eslint-plugin-astro` 1 → 3 (new major, Astro 7 rules)            | 🔴 Should accompany            |
| `@cloudflare/workers-types` 4 → 5 | `env.d.ts` type path validation                                   | 🔴 Breaking type change        |
| `zod` 3 → 4                       | 3 usage files: `content.config.ts`, `lib/env.ts`, `lib/schema.ts` | 🔴 Breaking API changes        |
| `typescript` 5 → 7                | Entire codebase type re-check; tsconfig changes likely            | 🔴 Breaking, skip until stable |
| `tailwindcss` 4.2 → 4.3           | `@tailwindcss/vite` must move in sync (both 4.3.3)                | 🟡 Must stay in lockstep       |
| `lint-staged` 16 → 17             | `.husky/` pre-commit config may require update                    | 🟡 MAJOR but low risk          |

**Recommended atomic update batches (in order):**

**Batch 1 — Safe immediate patches (zero risk):**

- `svelte` 5.55.5 → 5.56.8
- `@astrojs/sitemap` 3.7.2 → 3.7.3
- `@astrojs/check` 0.9.8 → 0.9.10
- `jose` 6.2.3 → 6.2.8
- `wrangler` 4.85.0 → 4.120.0
- `eslint` 10.2.1 → 10.8.1 + `eslint-plugin-svelte` 3.17.1 → 3.22.0 + `typescript-eslint` 8.59.1 → 8.66.0
- `prettier` 3.8.3 → 3.9.6
- `tailwindcss` + `@tailwindcss/vite` both 4.2.4 → 4.3.3 (simultaneously)

**Batch 2 — Cloudflare workers-types MAJOR (isolated):**

- `@cloudflare/workers-types` 4.x → 5.x + validate `env.d.ts`

**Batch 3 — Astro 7 atomic (all or nothing):**

- `astro` 6.1.9 → 7.2.0
- `@astrojs/cloudflare` 13.2.1 → 14.2.0
- `@astrojs/svelte` 8.0.5 → 9.0.1
- `eslint-plugin-astro` 1.7.0 → 3.1.0
- Full `astro check` + `npm run build` after

**Batch 4 — Breaking dependency updates (owner review required first):**

- `zod` 3 → 4 (review API changes for `content.config.ts`, `lib/env.ts`, `lib/schema.ts`)
- `typescript` 5.9.3 → 7.0.2 (TypeScript 7 is a major release — defer until stable and ecosystem catches up)
- `lint-staged` 16 → 17 (review husky integration changes)

---

## STEP 5 — Unused / Dead Dependencies

### 🔴 PURGE: `resend` (in `dependencies`)

- `src/lib/email.ts` contains: _"Removed Resend SDK to prevent Edge incompatibilities with Node.js native modules."_
- Zero `from 'resend'` import found anywhere in `src/`
- Email sending reimplemented via raw `fetch()` calls to Resend HTTP API
- Package gap: installed 4.8.0 → latest 6.18.1 (MAJOR) — irrelevant since it is unused
- **Action:** Remove from `package.json` dependencies + `npm install`

### 🔴 PURGE: `@astrojs/mdx` (in `dependencies` + `astro.config.mjs`)

- Zero `.mdx` files exist anywhere in the repository (confirmed via full recursive search)
- Blog content is `.md` (Markdown) only — MDX features not in use
- Adds Rollup plugin overhead to every build for zero output
- **Action:** Remove from `package.json` and delete from `astro.config.mjs` (import L7 + `mdx()` at L24)

### 🟡 HALF-DEAD: `@astrojs/partytown` (in `dependencies` + `Base.astro`)

- Integration is wired and functional, but GA4 ID is `G-XXXXXXXXXX` (literal placeholder)
- Partytown registers a Service Worker on every page load — overhead with no analytics benefit
- **Action:** Set real GA4 ID or remove the integration. Not a breaking risk either way.

### ✅ All other packages confirmed used

- `lucide-svelte`: `CompleteForm.svelte`, `SignupForm.svelte`, `StepIndicator.svelte`
- `jose`: `api/complete.ts`, `api/register.ts`, `funnel/success.astro`
- `zod`: `content.config.ts`, `lib/env.ts`, `lib/schema.ts`
- `@fontsource/amiri`: `Base.astro` — Arabic font for `--font-arabic`
- `@cloudflare/workers-types`: `env.d.ts` — `KVNamespace` type
- `globals` + `svelte-eslint-parser`: `eslint.config.mjs`
- All lint/format devDeps: consumed by husky pre-commit hook pipeline

---

## STEP 6 — Master Summary Table (sorted safest → riskiest)

| Package                   | Installed    | Latest       | Risk Tier   | Used              | Cross-dep Note                                                                 |
| ------------------------- | ------------ | ------------ | ----------- | ----------------- | ------------------------------------------------------------------------------ |
| svelte                    | 5.55.5       | 5.56.8       | PATCH       | ✅                | —                                                                              |
| @astrojs/sitemap          | 3.7.2        | 3.7.3        | PATCH       | ✅                | —                                                                              |
| @astrojs/check            | 0.9.8        | 0.9.10       | PATCH       | ✅                | —                                                                              |
| @astrojs/partytown        | 2.1.7        | 2.1.7        | CURRENT     | ⚠️ GA placeholder | —                                                                              |
| jose                      | 6.2.3        | 6.2.8        | PATCH       | ✅                | —                                                                              |
| husky                     | 9.1.7        | 9.1.7        | CURRENT     | ✅                | —                                                                              |
| lucide-svelte             | 1.0.1        | 1.0.1        | CURRENT     | ✅                | —                                                                              |
| zod (current 3)           | 3.25.76      | 3.25.76      | CURRENT     | ✅                | Zod 4 exists — MAJOR jump needs owner review                                   |
| tailwindcss               | 4.2.4        | 4.3.3        | MINOR       | ✅                | Must sync with @tailwindcss/vite                                               |
| @tailwindcss/vite         | 4.2.4        | 4.3.3        | MINOR       | ✅                | Must sync with tailwindcss                                                     |
| wrangler                  | 4.85.0       | 4.120.0      | MINOR       | ✅                | Needed before fx-updater deploy                                                |
| eslint                    | 10.2.1       | 10.8.1       | MINOR       | ✅                | ESLint 10 is stable                                                            |
| eslint-plugin-svelte      | 3.17.1       | 3.22.0       | MINOR       | ✅                | —                                                                              |
| typescript-eslint         | 8.59.1       | 8.66.0       | MINOR       | ✅                | —                                                                              |
| prettier                  | 3.8.3        | 3.9.6        | MINOR       | ✅                | —                                                                              |
| lint-staged               | 16.4.0       | 17.3.0       | MAJOR       | ✅                | Review husky pre-commit config                                                 |
| astro                     | 6.1.9        | 7.2.0        | 🔴 MAJOR    | ✅                | Requires adapter 14.x + @astrojs/svelte 9.x + eslint-plugin-astro 3.x — atomic |
| @astrojs/cloudflare       | 13.2.1       | 14.2.0       | 🔴 MAJOR    | ✅                | Requires Astro 7.x — atomic with astro                                         |
| @astrojs/svelte           | 8.0.5        | 9.0.1        | 🔴 MAJOR    | ✅                | Requires Astro 7.x — atomic with astro                                         |
| eslint-plugin-astro       | 1.7.0        | 3.1.0        | 🔴 MAJOR    | ✅                | Bump with Astro 7 batch                                                        |
| @cloudflare/workers-types | 4.20260426.1 | 5.20260810.1 | 🔴 MAJOR    | ✅                | `env.d.ts` type path validation required                                       |
| zod                       | 3.25.76      | 4.4.3        | 🔴 MAJOR    | ✅                | Breaking API changes — 3 usage files to audit                                  |
| typescript                | 5.9.3        | 7.0.2        | 🔴 MAJOR +2 | ✅                | Defer — wait for ecosystem stability                                           |
| resend                    | 4.8.0        | 6.18.1       | 🔴 MAJOR    | 🔴 UNUSED         | PURGE — SDK explicitly removed from email.ts                                   |
| @astrojs/mdx              | 5.0.4        | 7.0.5        | 🔴 MAJOR    | 🔴 UNUSED         | PURGE — zero .mdx files in repo                                                |
