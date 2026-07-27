# Quranific — Agent Onboarding README

> **For AI agents:** Read this file AND `Quranific-agent-constitution.md` before touching any code.
> The constitution rules (especially 2a replace-never-append and 2b no-build-unless-asked) are
> non-negotiable and apply to every task, however small.

---

## 1. What This Project Is

**Quranific** (`https://quranific.com`) is a live online Quran tutoring business targeting
Muslim diaspora parents (30-55) in the UK, US, UAE, Canada, Australia, Singapore, and Saudi Arabia.
The goal of the codebase is **qualified free-trial bookings and paid enrollments**.

- One product: private 1-on-1 Quran sessions with an ijazah-certified teacher.
- Frequency is the only variable (2x/3x/4x/5x per week).
- Session duration: 30-minute or 40-minute.
- Billing: Monthly / 6-month (-5%) / 12-month (-15%).
- 8 supported currencies: USD, GBP, EUR, AED, SGD, CAD, AUD, SAR.

---

## 2. Tech Stack

| Layer          | Technology                                                               |
| -------------- | ------------------------------------------------------------------------ |
| Framework      | **Astro 6** (`output: server`) — SSR on Cloudflare edge                  |
| UI components  | **Svelte 5** (Runes syntax) for interactive widgets                      |
| Styling        | **Tailwind CSS v4** (Oxide engine, no config file)                       |
| Hosting        | **Cloudflare Pages** + **Workers** (via `@astrojs/cloudflare`)           |
| Email          | **Resend** API                                                           |
| Bot protection | **Cloudflare Turnstile**                                                 |
| Session tokens | **jose** — HS256 JWT, 15-min expiry, HttpOnly cookie                     |
| KV store       | **Cloudflare KV** namespace `SESSION` — rate-limiting and idempotency    |
| Typography     | Inter (variable), Merriweather (serif), Amiri (Arabic) via `@fontsource` |
| Content        | **MDX** for blog posts                                                   |
| Linting        | ESLint + Prettier (enforced via Husky v9 pre-commit hook)                |
| Node           | v22 (`.nvmrc` / `.node-version`)                                         |

---

## 3. Repository Layout

```
Quranific-live/
├── src/
│   ├── components/
│   │   ├── funnel/          # SignupForm.svelte, CompleteForm.svelte (Svelte 5)
│   │   ├── global/          # Header, Footer, Nav, Base layout wrapper
│   │   ├── sections/        # Page-level reusable sections (see section 6)
│   │   ├── seo/             # JSON-LD schemas, meta helpers
│   │   └── ui/              # Atoms: Button, Section, Icons
│   ├── constants/
│   │   ├── pricing.ts       # SINGLE SOURCE OF TRUTH for all prices (see section 8)
│   │   ├── site.ts          # SITE config, nav arrays, MAIN_NAVIGATION
│   │   ├── courses.ts       # Course definitions
│   │   ├── faqs.ts          # FAQ content
│   │   ├── testimonials.ts  # Testimonial data
│   │   └── teachers.ts      # Teacher profiles
│   ├── layouts/             # Base.astro (the only root layout)
│   ├── lib/
│   │   └── schema.ts        # Zod validation schemas for all API routes
│   ├── pages/
│   │   ├── index.astro      # Home
│   │   ├── tuition-fee.astro # Pricing page (largest file, ~1360 lines — see section 7)
│   │   ├── about.astro
│   │   ├── courses/         # Course detail pages
│   │   ├── funnel/          # signup.astro, complete.astro, success.astro
│   │   ├── api/             # Edge API routes (see section 9)
│   │   ├── blog/            # MDX blog posts
│   │   ├── legal/           # privacy, terms, refund, cookies, impressum
│   │   └── ads/             # Ad landing pages
│   ├── styles/              # Global CSS (Tailwind v4 directives, custom tokens)
│   ├── content/             # Astro content collections (blog MDX)
│   ├── content.config.ts    # Content collection schema
│   ├── middleware.ts        # Security headers + edge caching + CF locals
│   └── env.d.ts             # TypeScript env type declarations
├── public/                  # Static assets (images, favicon, OG images)
├── alarm-worker/            # Standalone Cloudflare Worker for scheduled tasks
├── astro.config.mjs         # Astro + integrations config
├── wrangler.toml            # Cloudflare Pages deployment config
├── .env.example             # Required env vars — copy to .env for local dev
├── Quranific-agent-constitution.md  # READ THIS FIRST every session
├── QURANIFIC_OWNER_ACTIONS.md       # Owner-verified facts and pending to-dos
├── AUDIT-LEDGER.md          # Security/architecture audit log
├── RECONCILIATION.md        # Detailed bug-fix ledger from past audit sessions
└── DEPLOYMENT.md            # Step-by-step deployment guide
```

---

## 4. Local Development

```bash
npm install
cp .env.example .env        # Fill in secrets
npm run dev                  # Hot-reload dev server with edge simulation
npm run check                # Type-check only (no build)
npm run build                # astro check + astro build
npm run preview              # Preview ./dist via Wrangler locally
npm run deploy               # npm run build + wrangler pages deploy
```

> **Rule 2b:** Never run build, lint, commit, or push unless the current prompt explicitly
> requests it. The owner reviews changes before any deployment.

---

## 5. Environment Variables

All secrets live in `.env` (local) and Cloudflare Dashboard > Settings > Variables (production).

| Variable                    | Required | Purpose                                       |
| --------------------------- | -------- | --------------------------------------------- |
| `RESEND_API_KEY`            | YES      | Send transactional emails via Resend          |
| `JWT_SECRET`                | YES      | Sign/verify 15-min HS256 session JWTs         |
| `TURNSTILE_SECRET_KEY`      | YES      | Server-side Turnstile bot challenge verify    |
| `PUBLIC_TURNSTILE_SITE_KEY` | YES      | Client-side Turnstile widget (safe to expose) |

The `SESSION` KV namespace binding is in `wrangler.toml` (ID: `14eab319d57e4c58b5f903bce3eb3931`).
It must also be bound in the Cloudflare Dashboard for production.

Dev-only vars live in `.dev.vars`.

---

## 6. Page Inventory

| Route              | File                    | Purpose                                    |
| ------------------ | ----------------------- | ------------------------------------------ |
| `/`                | `index.astro`           | Home                                       |
| `/tuition-fee`     | `tuition-fee.astro`     | Full pricing page                          |
| `/courses`         | `courses/`              | Course listing + detail pages              |
| `/how-it-works`    | `how-it-works.astro`    | Process explainer                          |
| `/about`           | `about.astro`           | Founder story, team, mission               |
| `/teachers`        | `teachers.astro`        | Teacher profiles grid                      |
| `/testimonials`    | `testimonials.astro`    | Parent reviews                             |
| `/faq`             | `faq.astro`             | FAQ accordion                              |
| `/contact`         | `contact.astro`         | Contact form                               |
| `/blog`            | `blog/`                 | MDX blog posts                             |
| `/partners`        | `partners.astro`        | Partner logos/info                         |
| `/careers`         | `careers.astro`         | Job listings                               |
| `/portals`         | `portals.astro`         | Student/parent portal links                |
| `/safeguarding`    | `safeguarding.astro`    | Child safeguarding policy                  |
| `/funnel/signup`   | `funnel/signup.astro`   | Step 1 of free-trial funnel                |
| `/funnel/complete` | `funnel/complete.astro` | Step 2 — CompleteForm.svelte               |
| `/funnel/success`  | `funnel/success.astro`  | Post-submission confirmation               |
| `/legal/*`         | `legal/`                | Privacy, terms, refund, cookies, impressum |
| `/ads/*`           | `ads/`                  | Ad-specific landing pages                  |
| `/api/register`    | `api/register.ts`       | POST — funnel lead capture                 |
| `/api/complete`    | `api/complete.ts`       | POST — schedule/detail submission          |
| `/api/contact`     | `api/contact.ts`        | POST — contact form                        |
| `/api/newsletter`  | `api/newsletter.ts`     | POST — newsletter subscribe                |

---

## 7. The Tuition-Fee Page (`/tuition-fee`)

This is the most complex page (~1360 lines). Read this section before touching it.

### Page Sections (top to bottom)

1. **PageHero** — badge: "Trusted by families across the UK, US, and UAE"
2. **Trust strip** — 4 guarantee icons (full-month guarantee, make-up, no hidden fees, weekly reports)
3. **Hero Fee Calculator** — 5-field widget (Who / Duration / Sessions / Currency / Billing)
4. **Unified Rate Card** (`id="plans"`) — rebuilt pricing table (see below)
5. **Family Discounts** — sibling discount explainer + interactive demo
6. **Scholarship section** — need-based support explainer
7. **FAQ accordion** — pricing FAQs
8. **Final CTA**

### Rate Card Architecture

Controls (above the card):

- Duration toggle: 30 min / 40 min (`id="plan-dur-btns"`)
- Billing toggle: Monthly / 6 months -5% / 12 months -15% (`id="plan-billing-btns"`)
- Currency select: 8 currencies (`id="plan-currency-select"`)

Grid: `grid-cols-1 sm:grid-cols-4` — one column per frequency (2x/3x/4x/5x/week)

The **5x/week column** has a thin amber top bar (`h-[3px] bg-amber-400`) and "Most families choose this" label.
No tier names (Light/Standard/Plus/Hifz-Ready etc.) anywhere — they were removed.
All 4 columns show the same product.

Per-column DOM slots:

- `plan-sym-{2,3,4,5}` — currency symbol
- `plan-price-{2,3,4,5}` — discounted monthly price
- `plan-per-{2,3,4,5}` — per-class rate: `approx {sym}{price/sessions_per_month} / class`
- `plan-save-{2,3,4,5}` — savings badge (hidden when billing=monthly, shown otherwise)

Unique value vs hero calculator: The rate card shows savings across **all 4 frequencies simultaneously**
when 6-month or annual billing is selected. The hero calculator only shows one frequency at a time.

### Script Architecture

One `<script is:inline>` block at the bottom of the file. All JS fires on `astro:page-load`.

| Section            | State       | Key function         |
| ------------------ | ----------- | -------------------- |
| Hero calculator    | `calcState` | `updateCalcResult()` |
| Rate card          | `planState` | `updatePlanGrid()`   |
| Sibling calculator | stateless   | inline click handler |

`PRICING_DATA` is defined once and shared by both `updateCalcResult()` and `updatePlanGrid()`.
It mirrors `src/constants/pricing.ts` exactly — no numbers duplicated differently.

`BILLING_DISCOUNTS = { monthly: 0, sixMonth: 0.05, annual: 0.15 }` — same in script and pricing.ts.

---

## 8. Pricing — Single Source of Truth

**File:** `src/constants/pricing.ts`

Structure: `PRICING[Currency][Duration][Sessions] = monthly_base_price_integer`

```
Currencies: USD | GBP | EUR | AED | SGD | CAD | AUD | SAR
Durations:  '30' | '40'    (minutes)
Sessions:   '2' | '3' | '4' | '5'    (per week)
```

Owner-verified exact values (last confirmed 2026-07-27):

- USD, GBP, EUR, AED — type them directly if changing, do NOT recompute from exchange rates
- SGD, CAD, AUD — computed at SGD@1.29, CAD@1.41, AUD@1.43; **refresh periodically**
- SAR and AED are USD-pegged; do not need rate refreshing

Billing discounts: Monthly=0%, 6-month=5%, 12-month=15%

**Rule:** Any pricing change MUST update `pricing.ts` first.
The fee page inline `PRICING_DATA` object MUST be manually synced to `pricing.ts`
(it is a client-side copy because `pricing.ts` is server-only TypeScript).

---

## 9. API Routes

All routes are Cloudflare Workers edge functions (`prerender = false`).

### POST /api/register (Step 1 — Free Trial Signup)

1. IP rate-limit via KV (`RL:REGISTER:{ip}` — 60s lock)
2. Zod validation (`signupSchema`)
3. Honeypot field check (silent success for bots)
4. Cloudflare Turnstile server-side verify
5. Sign HS256 JWT (15-min expiry) with lead data
6. Return JWT as `q_session` HttpOnly cookie (Secure, SameSite=Strict, Path=/funnel)

### POST /api/complete (Step 2 — Scheduling)

Reads JWT from cookie, verifies it, sends emails via Resend.
Implements idempotency via KV (`IDEMPOTENCY:{jti}` key).

### POST /api/contact

Contact form submission → Resend email.

### POST /api/newsletter

Newsletter subscribe → Resend email.

---

## 10. Conversion Funnel

```
Any CTA → /funnel/signup
  SignupForm.svelte (Svelte 5 Runes)
    Fields: name, email, whatsapp, country, source
    Hidden: gclid, utm_source, utm_medium, utm_campaign, utm_content, utm_term
    Turnstile widget
    POST /api/register → q_session JWT cookie
  → /funnel/complete
    CompleteForm.svelte
    Fields: preferred_days, preferred_time, age, gender_preference, notes
    POST /api/complete → sends emails via Resend
  → /funnel/success
    WhatsApp link, booking confirmation
```

Attribution: URL query params (`gclid`, `utm_*`, `enrollType`, `duration`, `sessions`,
`currency`, `billing`, `price`) are captured in hidden form fields and preserved through the funnel.
All CTA links on `tuition-fee.astro` append calculator selections to `/funnel/signup`
URL via `updateCalcCta()`.

---

## 11. Component Conventions

### Svelte 5 (Runes)

- Use `$state()` and `$derived()` — NOT `let` + `$:` (that is Svelte 4 syntax)
- Funnel components use `client:load` directive
- No `client:*` on Astro components

### Tailwind v4

- No `tailwind.config.js` — configuration via CSS `@theme` blocks in `src/styles/`
- Custom tokens: `cream-50`, `cream-100` etc. defined in global CSS

### Icons

- Inline SVG strings in shared `Icons` object in `src/components/ui/`
- Usage: `set:html={Icons.check}` — not external SVG files

### Section Components

- `HomeHero.astro` — Home hero. The floating image's `animate-hero-float` is on an inner div;
  `drop-shadow-2xl` is on the static outer wrapper. These are deliberately split to prevent
  compositing conflicts (GPU layer promotion breaks CSS filter on animated elements).
- `PageHero.astro` — Reusable inner-page hero. Props: `eyebrow?`, `title`, `highlightWord?`,
  `subtitle?`, `cta?`
- `PricingTable.astro` — Simple static pricing display for course detail pages.
  NOT the dynamic tuition-fee calculator.

---

## 12. Middleware

`src/middleware.ts` runs on every request:

1. Reads Cloudflare edge metadata (`cf.country`, `cf.city`, `cf.httpProtocol`) into `context.locals`
2. Sets security headers: `X-Frame-Options: DENY`, HSTS, full `Content-Security-Policy`
3. Caching: browsers get `no-cache`; Cloudflare edge gets `max-age=3600, stale-while-revalidate=86400`
4. API routes (`/api/*`) are excluded from edge caching

---

## 13. State Management Rules

**No localStorage or sessionStorage.** All cross-page state uses URL query parameters.

- `gclid`, `utm_*` — passed through every CTA href via `URLSearchParams`
- Calculator selections — appended to `/funnel/signup` href by `updateCalcCta()`
- Session data — HttpOnly JWT cookie (`q_session`), not accessible to JS

---

## 14. Critical Rules for Any Agent

1. **Read `Quranific-agent-constitution.md` first** — every session, every task.
2. **Rule 2a — Replace, never append:** Every edit to an existing HTML element, config entry,
   or script block must show a removal in the diff. Re-open the file after saving and confirm
   no duplicate version exists before proceeding.
3. **Rule 2b — No build/lint/commit/push** unless the prompt explicitly requests it for that pass.
4. **Never fabricate facts:** No invented stats, testimonials, teacher names, or policy language.
   Use `<!-- TODO(owner): confirm -->` for anything unverified.
5. **Pricing is sacred:** Only change `pricing.ts` with owner-confirmed numbers.
   When updating the fee page inline `PRICING_DATA`, always sync it to `pricing.ts` exactly.
6. **One `<script is:inline>` per page** — never add a second one; append to the existing block.
7. **Hover-safe button pattern:** When a button has a selected state with a background color,
   strip `hover:text-{color}` from selected buttons so the text color does not become invisible.
   The `selectCalcBtn()` and `selectPlanBtn()` functions in tuition-fee.astro implement this.
8. **Attribution must carry through:** Any new CTA link to `/funnel/signup` must preserve existing
   query params via `URLSearchParams` (see `updateCalcCta()` for the pattern).

---

## 15. Pending Owner Actions

See `QURANIFIC_OWNER_ACTIONS.md` for the full list. Key open items:

| Item                                                                          | Status                         |
| ----------------------------------------------------------------------------- | ------------------------------ |
| GA4 + Google Ads conversion tracking in `Base.astro`                          | PENDING — no analytics yet     |
| Refresh SGD/CAD/AUD exchange rates in `pricing.ts`                            | Periodic (last set 2026-07-27) |
| Placeholder team bios in `about.astro`                                        | Unverified                     |
| 4.9/5 rating and 50k+ students claims in `testimonials.astro`                 | Unverified                     |
| 100% money-back guarantee wording                                             | Unverified                     |
| WhatsApp parent support included in all plans                                 | Unverified                     |
| Confirm scheduling the free trial "at your convenience" is operationally true | Unverified                     |

---

## 16. Deployment

See `DEPLOYMENT.md` for the full guide. Quick summary:

```bash
npm run build      # astro check + astro build → ./dist
npm run deploy     # npm run build + wrangler pages deploy ./dist
```

- Production: `https://quranific.com` and `https://www.quranific.com`
- Cloudflare project name: `quranific`
- Custom domains in `wrangler.toml`
- Smart placement enabled (`placement.mode = "smart"`) for lowest-latency edge routing

---

## 17. Files That Must NOT Be Modified Without Owner Review

| File                              | Reason                                                      |
| --------------------------------- | ----------------------------------------------------------- |
| `src/constants/pricing.ts`        | Owner-verified prices — confirm every change before editing |
| `src/pages/legal/`                | Legal text requires human review                            |
| `src/pages/api/register.ts`       | Security-critical lead capture and JWT issuance             |
| `wrangler.toml`                   | Production infra config                                     |
| `.env` / `.dev.vars`              | Secrets — never commit to git                               |
| `Quranific-agent-constitution.md` | The law — not editable by agents                            |
| `QURANIFIC_OWNER_ACTIONS.md`      | Owner source of truth — append only, never remove lines     |

---

_README last updated: 2026-07-27. For full change history see `RECONCILIATION.md` and `AUDIT-LEDGER.md`._
