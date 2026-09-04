# Quranific — Engineering Architecture, Operations & Onboarding Guide

> **Platform:** Edge-SSR & SSG Web Application  
> **Production Target:** Cloudflare Pages & Cloudflare Workers (Workerd Edge Runtime)  
> **Core Domain:** Private 1-on-1 Online Quran Tutoring Academy (`https://quranific.com`)  
> **Operational Entity:** Quranific (Karachi, Pakistan)

---

## 1. Executive Summary & Architectural Overview

**Quranific** is a high-performance, edge-rendered web application and multi-step student/teacher acquisition engine. The application serves global Muslim diaspora families (primarily in the UK, US, Canada, Australia, UAE, Saudi Arabia, Qatar, and Singapore) seeking 1-on-1 Quranic education with verified, Ijazah-certified faculty.

### Core Architectural Characteristics

- **Hybrid SSR/SSG Edge Architecture:** Built on **Astro 7** with `@astrojs/cloudflare` configured in server output mode (`output: 'server'`). Content, informational, and landing pages are statically prerendered (`export const prerender = true`) for global CDN edge delivery, while dynamic lead-capture endpoints and session verification routes execute directly on Cloudflare's Edge isolate network.
- **Partial Hydration (Astro Islands):** 0 kB JavaScript baseline by default. Client-side JS is shipped only to interactive islands (e.g., pricing calculators, multi-step booking funnels, teacher qualification forms, cookie consent banner) using `client:load`, `client:idle`, or `client:visible`.
- **Reactive UI Layer:** Built with **Svelte 5** leveraging native Runes syntax (`$state`, `$derived`, `$props`, `$bindable`) without legacy Svelte stores or external state management libraries.
- **Modern CSS Engine:** Styled with **Tailwind CSS v4** via `@tailwindcss/vite` and `@tailwindcss/typography`, utilizing `@theme` design tokens in CSS and the high-performance Oxide compilation engine.
- **Edge Security & Cryptography:** Cloudflare Turnstile bot verification, distributed IP rate-limiting via Cloudflare KV (`SESSION`), signed HS256 JSON Web Tokens (`jose`) delivered in `HttpOnly; Secure; SameSite=Lax` cookies, and strict Content Security Policy (CSP) headers applied in Edge middleware.
- **Fault-Tolerant Lead Pipeline:** Outbound transactional emails are dispatched asynchronously via Resend's REST API. Failures are captured in a Cloudflare KV Dead-Letter Queue (`FAILED_LEAD:*`, `FAILED_CONTACT:*`) and automatically processed by an hourly scheduled Cron Worker (`alarm-worker`).
- **Geo-IP Google Consent Mode v2:** Edge middleware inspects Cloudflare Geo-IP headers (`cf.country`, `cf.regionCode`) and Global Privacy Control (`Sec-GPC: 1`) to assign visitors into `STRICT`, `MODERATE`, or `NONE` consent buckets, injecting Consent Mode v2 defaults server-side before Google Tag Manager initializes.

---

## 2. Tech Stack Matrix

| Layer / Subsystem       | Technology                                                                | Version / Spec        | Purpose & Implementation Details                                                                    |
| :---------------------- | :------------------------------------------------------------------------ | :-------------------- | :-------------------------------------------------------------------------------------------------- |
| **Framework**           | [Astro](https://astro.build/)                                             | `^7.2.0`              | Core routing, SSG prerendering, HTML streaming, and Island architecture                             |
| **Edge Runtime**        | [@astrojs/cloudflare](https://github.com/withastro/astro)                 | `^14.2.0`             | Cloudflare Pages/Workers adapter with Workerd platform proxy support (`imageService: 'cloudflare'`) |
| **UI Components**       | [Svelte](https://svelte.dev/)                                             | `^5.0.0`              | Client-side reactive islands utilizing Svelte 5 Runes                                               |
| **Svelte Adapter**      | [@astrojs/svelte](https://github.com/withastro/astro)                     | `^9.0.1`              | Svelte island compiler and Vite preprocessor integration for Astro                                  |
| **Styling Engine**      | [Tailwind CSS](https://tailwindcss.com/)                                  | `^4.0.0`              | Utility-first styling via `@tailwindcss/vite` and `@theme` tokens in `src/styles/global.css`        |
| **Typography Plugin**   | [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | `^0.5.20`             | Prose formatting for markdown content and rich-text containers via `@plugin` directive              |
| **Type System**         | [TypeScript](https://www.typescriptlang.org/)                             | `^5.9.3`              | Strict mode type checking extending `astro/tsconfigs/strict`                                        |
| **Validation**          | [Zod](https://zod.dev/)                                                   | `^4.4.3`              | Runtime schema validation for form submissions, lead payloads, and content collections              |
| **Token Cryptography**  | [jose](https://github.com/panva/jose)                                     | `^6.2.1`              | Edge-compatible HS256 JWT signing and verification for multi-step funnel cookies (`q_session`)      |
| **Bot Mitigation**      | Cloudflare Turnstile                                                      | Managed API           | Invisible/managed CAPTCHA alternative verified at the edge before lead processing (`siteverify`)    |
| **Email Engine**        | Resend API                                                                | REST API              | Custom edge fetch client (`src/lib/email.ts`) avoiding Node.js native dependencies                  |
| **Edge Storage**        | Cloudflare KV                                                             | `SESSION` binding     | Distributed IP rate limiting (`RL:*`), submission idempotency, and dead-letter lead recovery        |
| **Cron Worker**         | Cloudflare Workers                                                        | Cron Trigger          | Standalone worker in `alarm-worker/` triggering retry cycles hourly (`0 * * * *`)                   |
| **Icons**               | [lucide-svelte](https://lucide.dev/)                                      | `^1.0.1`              | SVG iconography within Svelte components and raw SVG constants                                      |
| **Typography**          | Fontsource                                                                | `^5.2.8`              | Self-hosted Inter Variable (`@fontsource-variable/inter`), Merriweather, and Amiri fonts            |
| **Script Optimization** | [@astrojs/partytown](https://partytown.builder.io/)                       | `^2.1.7`              | Web Worker offloading for third-party analytics (`dataLayer.push`)                                  |
| **SEO & Feeds**         | [@astrojs/sitemap](https://github.com/withastro/astro)                    | `^3.7.1`              | Automated sitemap generator, RSS XML feed (`rss.xml.ts`), and LLM context (`llms.txt.ts`)           |
| **Code Quality**        | ESLint & Prettier                                                         | ESLint 10, Prettier 3 | Enforced with Husky (`^9.1.7`) and lint-staged (`^17.3.0`) pre-commit hooks                         |

---

## 3. Directory Layout & Architecture Map

```
Quranific-live/
├── .dev.vars                     # Local Cloudflare workerd secrets (Wrangler simulation)
├── .editorconfig                 # Editor whitespace and encoding consistency
├── .env.example                  # Environment blueprint for developers
├── .github/                      # Repository configuration and issue templates
├── .husky/                       # Git commit hooks (pre-commit lint-staged)
├── .node-version                 # Node.js engine pin (v22 / v20+)
├── .nvmrc                        # NVM environment configuration
├── .prettierrc                   # Code formatting rules (Astro & Svelte plugins)
├── alarm-worker/                 # Independent Cloudflare Cron Worker
│   ├── src/
│   │   └── index.ts              # Hourly scheduled trigger calling /api/internal/retry-queue
│   ├── tsconfig.json             # Worker TypeScript configuration
│   └── wrangler.toml             # Alarm worker configuration (crons = ["0 * * * *"])
├── astro.config.mjs              # Astro engine config (Cloudflare adapter, sitemap, Vite plugins)
├── dead_code.cjs                 # Internal maintenance: Unused export/file scanner
├── link_check.cjs                # Internal maintenance: Route integrity and broken link validator
├── eslint.config.mjs             # Flat ESLint configuration (Astro, Svelte, TypeScript rules)
├── package.json                  # Dependencies, scripts, and engine constraints
├── public/                       # Unprocessed static assets
│   ├── _headers                  # Cloudflare edge cache and security header overrides
│   ├── favicon.ico               # Site favicon
│   ├── icons/                    # App icons, web manifests, and SVGs
│   └── images/                   # High-resolution optimized image assets and OG cards
├── svelte.config.js              # Svelte 5 Vite preprocessor config
├── tests/                        # Automated unit and end-to-end test suites
│   ├── consent-unit.test.ts      # Unit tests for Geo-IP consent bucketing logic (19 test cases)
│   └── consent.spec.ts           # Playwright E2E spec for Google Consent Mode and banner behavior
├── tsconfig.json                 # Strict TypeScript configuration and path aliases
├── wrangler.toml                 # Main Cloudflare Pages / Worker production config
└── src/
    ├── content.config.ts         # Astro content collections schema definition (Blog collection)
    ├── env.d.ts                  # Ambient TypeScript declarations, Cloudflare Locals & Env bindings
    ├── middleware.ts             # Edge middleware: Security headers, Geo-IP locals, Consent, CDN caching
    ├── components/
    │   ├── blocks/               # Composite page sections and widgets
    │   │   ├── CookieBanner.svelte        # Svelte 5 Google Consent Mode v2 banner island
    │   │   ├── CourseCard.astro           # Course syllabus card primitive
    │   │   ├── CourseGrid.astro           # Responsive curriculum grid container
    │   │   ├── CoursesFAQ.astro           # Course-specific FAQ section
    │   │   ├── FAQAccordion.astro         # Interactive schema-enabled FAQ accordion
    │   │   ├── FinalCTA.astro             # Global bottom-of-page conversion CTA
    │   │   ├── LandingCTA.astro           # PPC landing page conversion block
    │   │   ├── LandingFAQ.astro           # Dedicated landing page FAQ accordion
    │   │   ├── LandingFooter.astro        # Simplified high-conversion landing footer
    │   │   ├── LandingOnboarding.astro    # 3-step student onboarding visualization
    │   │   ├── LandingOutcome.astro       # Student transformation & milestone outcome cards
    │   │   ├── LandingPreview.astro       # Interactive 1-on-1 live classroom preview
    │   │   ├── LandingPricing.astro       # Simplified landing page pricing table
    │   │   ├── LandingProblem.astro       # Empathy & pain point contrast block
    │   │   ├── LandingTestimonials.astro  # Social proof carousel for landing pages
    │   │   ├── LandingTrust.astro         # Trust metrics, country badges, and safety guarantees
    │   │   ├── LandingVetting.astro       # 4-stage teacher vetting breakdown
    │   │   ├── PageHero.astro             # Standard page hero banner with breadcrumbs
    │   │   ├── PricingCalculator.svelte   # Interactive tuition fee estimation island (Svelte 5)
    │   │   ├── StickyMobileCTA.astro      # Mobile-only sticky bottom conversion bar
    │   │   └── TeacherTeaserBanner.astro  # Faculty trust banner linking to /teachers
    │   ├── global/               # Global layout shells
    │   │   ├── Footer.astro               # Global site footer with categorized links & trust badges
    │   │   ├── Header.astro               # Global navigation bar with announcement bar
    │   │   └── MobileMenu.astro           # Slide-out mobile navigation drawer
    │   ├── seo/                  # SEO & structured data
    │   │   └── Breadcrumb.astro           # Schema.org BreadcrumbList microdata component
    │   └── ui/                   # Atomic UI primitives
    │       ├── Button.astro               # Universal button supporting primary, gold, and outline variants
    │       ├── EyebrowBadge.astro         # Tag badge with subtle border and emerald tint
    │       ├── EyebrowText.astro          # Small uppercase sub-heading text
    │       ├── MicroTag.astro             # Compact status/category badge
    │       ├── Note.astro                 # Visual alert / tip / warning callout box
    │       └── Section.astro              # Standardized section wrapper with container padding
    ├── constants/                # Immutable platform constants & configurations
    │   ├── courses.ts            # Detailed curriculum syllabus, milestones, and metadata
    │   ├── pricing.ts            # Fee matrices across 9 currencies, durations, and frequencies
    │   ├── site.ts               # Site metadata, contacts, navigation trees, and Turnstile public key
    │   └── testimonials.ts       # Verified parent and student testimonials data
    ├── content/
    │   └── blog/                 # Markdown / MDX blog articles
    ├── data/                     # Schema-compatible structured JSON/TS datasets
    │   ├── faqs.ts               # Categorized FAQ records for general, courses, and landing pages
    │   ├── howTo.ts              # Schema.org HowTo structured data definitions
    │   └── testimonials.ts       # Structured testimonial data records
    ├── layouts/                  # Base document layout wrappers
    │   ├── Base.astro            # Core HTML shell (Fonts, SEO Meta, Consent Mode, GTM, JSON-LD)
    │   ├── Funnel.astro          # Focused conversion layout for registration wizard steps
    │   ├── Landing.astro         # High-conversion PPC landing page wrapper
    │   └── Page.astro            # Standard informational content page wrapper
    ├── lib/                      # Shared business logic and edge utilities
    │   ├── consent.ts            # Pure Geo-IP consent bucketing logic & Google Consent Mode defaults
    │   ├── email.ts              # Edge-native Resend email client, templates & dead-letter queue
    │   ├── helpers.ts            # Text formatting, phone normalizers, and currency utilities
    │   └── schema.ts             # Zod validation schemas for forms and API requests
    ├── styles/                   # Style architecture
    │   ├── cv.css                # Faculty CV and certificate display styles
    │   ├── fonts.css             # Local @font-face declarations for custom typefaces
    │   └── global.css            # Tailwind v4 import, @plugin, @theme palette & modern utility classes
    └── pages/                    # File-based routing tree (SSG + Edge SSR)
        ├── 404.astro             # Custom 404 Not Found error page
        ├── 500.astro             # Custom 500 Internal Server Error page
        ├── index.astro           # Homepage
        ├── llms.txt.ts           # Machine-readable Markdown endpoint for LLM context ingestion
        ├── robots.txt.ts         # Dynamic robots.txt generation endpoint
        ├── rss.xml.ts            # Blog RSS feed generator endpoint
        ├── _home-components/     # Homepage modular sections
        │   ├── HowItWorks.astro           # 3-step learning journey explanation
        │   ├── PainPoints.astro           # Common parent dilemmas and solutions
        │   ├── QuranificDifference.astro  # Interactive curriculum and comparison table
        │   └── TestimonialGrid.astro      # Multi-column student review showcase
        ├── [intent]/             # Semantic landing pages (/quran-classes/*, /quran-teacher/*)
        │   ├── for-adults.astro           # Tailored lander for adult learners
        │   ├── for-kids.astro             # Tailored lander for children & diaspora parents
        │   ├── for-women.astro            # Tailored lander for female students with female faculty
        │   └── _components/               # Intent-specific hero and guarantee blocks
        ├── about/                # About company, story, mission, and leadership
        │   └── index.astro
        ├── blog/                 # Blog index and dynamic post routes
        │   ├── index.astro
        │   └── [slug].astro
        ├── contact/              # Contact page with SmartContactForm.astro and SLA cards
        │   └── index.astro
        ├── courses/              # Course catalog and syllabus pages
        │   ├── index.astro                # Curriculum catalog overview
        │   ├── [slug].astro               # Dynamic course syllabus and learning outcomes
        │   └── _components/               # Course page bento grids and curriculum timeline
        ├── faq/                  # Dedicated searchable FAQ repository
        │   └── index.astro
        ├── getting-started/      # Multi-step Student Registration Funnel
        │   ├── signup.astro               # Step 1: Lead capture & attribution tracking
        │   ├── complete.astro             # Step 2: Course preferences & schedule selection
        │   ├── success.astro              # Step 3: Registration confirmation & WhatsApp onboarding
        │   └── _components/               # Funnel Svelte islands (SignupForm, CompleteForm, StepIndicator)
        ├── legal/                # Compliance, privacy, and regulatory policies
        │   ├── cookies.astro              # Cookie Policy & tracking technology disclosures
        │   ├── impressum.astro            # Legal Notice & corporate identity disclosures (Pakistan Nexus)
        │   ├── privacy.astro              # Privacy Policy (GDPR, UK GDPR, CCPA, COPPA)
        │   ├── refund.astro               # Refund, Tuition & Cancellation Policy
        │   └── terms.astro                # Terms of Service & Student/Parent Agreement
        ├── portals/              # Authentication directory for Student & Teacher portals
        │   └── index.astro
        ├── safeguarding/         # Child safeguarding & protection framework
        │   └── index.astro
        ├── teachers/             # Faculty showcase & Teacher recruitment funnel
        │   ├── index.astro                # Verified faculty showcase with dual action CTAs
        │   ├── apply.astro                # Teacher recruitment with pre-qualification island
        │   └── _components/               # Faculty cards, vetting steps, and TeacherApplicationForm.svelte
        ├── testimonials/         # Social proof, video reviews, and parent ratings
        │   └── index.astro
        ├── tuition-fee/          # Interactive pricing calculator page
        │   └── index.astro
        └── api/                  # Edge API endpoints (SSR: export const prerender = false)
            ├── apply-teacher.ts           # POST: Teacher pre-qualification application intake
            ├── complete.ts                # POST/HEAD/GET: Funnel Step 2 submission & session validation
            ├── contact.ts                 # POST: General contact form handler with Turnstile & KV rate limiting
            ├── newsletter.ts              # POST: Newsletter subscriber intake with Turnstile
            ├── register.ts                # POST: Funnel Step 1 lead ingestion + HS256 JWT issuance
            └── internal/
                └── retry-queue.ts         # POST: Cron-authenticated Dead-Letter Queue processor
```

---

## 4. UI Architecture, Svelte 5 Runes & Design System

### 4.1 Astro Islands Hydration Model

Astro generates pure static HTML at build time. Dynamic client-side JavaScript is introduced strictly through explicit Astro island directives:

- `client:load`: High-priority entry funnels where immediate user interactivity is required (`SignupForm.svelte`, `CompleteForm.svelte`).
- `client:idle`: Used for deferred, non-critical background components such as the `CookieBanner.svelte` consent banner.
- `client:visible`: Used for below-the-fold or conditional interactive components (`PricingCalculator.svelte`, `TeacherApplicationForm.svelte`).

### 4.2 Svelte 5 Runes Implementation

All interactive widgets are implemented using **Svelte 5 Runes**:

- `$state(...)`: Manages form fields, step indicators, loading states, and validation errors.
- `$derived(...)`: Dynamically computes validation checks, currency conversions, sibling discounts, and fee totals.
- `$props()` & `$bindable()`: Enforces strictly-typed component properties and two-way data bindings across wizard islands (e.g., `TeacherStep1.svelte` and `TeacherStep2.svelte` binding to `TeacherApplicationForm.svelte`).

```svelte
<!-- Example: Svelte 5 Runes in TeacherApplicationForm.svelte -->
<script lang="ts">
  import TeacherStep1 from './TeacherStep1.svelte';
  import TeacherStep2 from './TeacherStep2.svelte';

  let step = $state(1);
  let isSubmitting = $state(false);
  let form = $state({
    ijazah: '',
    alim: '',
    experience: '',
    english: '',
    arabic: '',
    fullName: '',
    email: '',
    whatsapp: '',
    resumeLink: '',
  });

  function handleNext() {
    if (form.ijazah === 'no' || form.experience === 'under_1' || form.english === 'no') {
      step = 4; // Instant rejection screen for unqualified applicants
      return;
    }
    step = 2; // Passed pre-qualification, proceed to contact details
  }
</script>
```

### 4.3 Tailwind CSS v4 Modern Design System

The application uses Tailwind CSS v4 configured directly in `src/styles/global.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@import './fonts.css';
@import './cv.css';

@theme {
  /* Emerald Primary & Accent Palette */
  --color-emerald-50: #ecfdf5;
  --color-emerald-100: #d1fae5;
  --color-emerald-200: #a7f3d0;
  --color-emerald-300: #6ee7b7;
  --color-emerald-400: #34d399;
  --color-emerald-500: #10b981;
  --color-emerald-600: #059669;
  --color-emerald-700: #047857;
  --color-emerald-800: #065f46;
  --color-emerald-900: #064e3b;
  --color-emerald-950: #022c22;
  --color-emerald-ink: #021f18;

  /* Gold Highlight Palette */
  --color-gold-50: #fffbeb;
  --color-gold-100: #fef3c7;
  --color-gold-200: #fde68a;
  --color-gold-300: #fcd34d;
  --color-gold-400: #fbbf24;
  --color-gold-500: #f59e0b;
  --color-gold-600: #d97706;
  --color-gold-700: #b45309;

  /* Cream Background Surfaces */
  --color-cream-50: #fefdf9;
  --color-cream-100: #fdf9ed;

  /* The 3-Font Architecture */
  --font-sans: 'Inter Variable', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif;
  --font-serif: 'Merriweather', 'Merriweather Fallback', Georgia, serif;
  --font-arabic: 'Amiri', 'Traditional Arabic', serif;
}

/* Reusable Tailwind v4 Utilities */
@utility quranific-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12;
}

@utility quranific-section {
  @apply py-16 sm:py-20 lg:py-24;
}

@utility quranific-input {
  @apply w-full px-4 py-3 text-sm bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-emerald-400/60;
}

@utility consent-banner-hidden {
  display: none !important;
}
```

---

## 5. Lead Funnel, Attribution & Consent Architecture

### 5.1 Registration State Machine & Recovery Flow

The conversion engine utilizes a resilient two-step state machine:

```mermaid
sequenceDiagram
    autonumber
    actor User as Prospective Student / Parent
    participant Browser as Client Island (SignupForm)
    participant EdgeAPI as Cloudflare Edge (/api/register)
    participant KV as Cloudflare KV (SESSION)
    participant Resend as Resend API
    participant Complete as Client Island (CompleteForm)
    participant Cron as Cron Worker (alarm-worker)

    User->>Browser: Enters Name, Email, WhatsApp, Country
    Browser->>EdgeAPI: POST /api/register (FormData + Turnstile + Ad Tracking)
    EdgeAPI->>EdgeAPI: Verify Cloudflare Turnstile Token
    EdgeAPI->>KV: Check & Increment IP Rate Limit (RL:REGISTER:<IP>) [Max 4/min]
    EdgeAPI->>EdgeAPI: Sign HS256 JWT containing Lead ID & Attribution (15m expiry)
    EdgeAPI->>Resend: Send Step 1 Partial Lead Notification
    EdgeAPI-->>Browser: Set-Cookie: q_session=<JWT>; HttpOnly; Secure; SameSite=Lax (200 OK)
    Browser->>Complete: Navigate to /getting-started/complete
    Complete->>EdgeAPI: HEAD /api/complete (Validate q_session cookie)
    EdgeAPI-->>Complete: 200 OK (Session Active)
    User->>Complete: Selects Course, Teacher Gender, Days & Schedule
    Complete->>EdgeAPI: POST /api/complete (FormData)
    EdgeAPI->>EdgeAPI: Verify & Decode q_session JWT
    EdgeAPI->>KV: Check Idempotency Key (IDEM:COMPLETE:<LeadID>)
    EdgeAPI->>Resend: Send Full Admin Notification & Student Welcome Email
    alt Resend API Outage / Network Failure
        EdgeAPI->>KV: Persist to Dead-Letter Queue (FAILED_LEAD:<LeadID>)
        Cron->>EdgeAPI: Hourly POST /api/internal/retry-queue (Bearer JWT_SECRET)
        EdgeAPI->>KV: Scan FAILED_LEAD:* and replay pending emails
        EdgeAPI->>KV: Delete recovered keys
    end
    EdgeAPI-->>Complete: 200 OK (Set-Cookie: q_session=; Max-Age=0)
    Complete->>User: Redirect to /getting-started/success
```

### 5.2 Attribution & Calculator Context Parameters

Ad attribution and tuition calculator context are preserved across page transitions in `sessionStorage` (`q_track_*`) and encoded into the signed session JWT:

- **Paid Ad Attribution:** `fbclid`, `gclid`, `ttclid`, `utm_source`, `utm_campaign`, `utm_medium`, `utm_content`.
- **Calculator Context:** `enrollType`, `duration`, `sessions`, `currency`, `billing`, `price`, `course`, `note`, `age`, `level`.

### 5.3 Geo-IP Google Consent Mode v2 Architecture

To ensure strict compliance with global privacy regulations without sacrificing performance or CDN caching, the site implements a server-injected, client-evaluated consent architecture:

| Bucket         | Geographic Scope / Trigger                                                                         | Default Consent Mode Settings                                                                             | Banner Behavior                                            |
| :------------- | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| **`STRICT`**   | EU Member States, EEA, UK (UK GDPR), Switzerland (nFADP), Quebec (`CA-QC`), or `Sec-GPC: 1` header | All storage denied except `security_storage` and `functionality_storage`. `wait_for_update: 500ms`.       | Banner rendered; cookies blocked until explicit opt-in.    |
| **`MODERATE`** | United States (CCPA/CPRA), Australia, Canada (non-QC)                                              | `analytics_storage: granted`, `ad_storage: denied`, `ad_user_data: denied`, `ad_personalization: denied`. | Banner rendered with opt-out preferences.                  |
| **`NONE`**     | Rest of World (no GPC signal)                                                                      | All storage granted by default.                                                                           | Banner suppressed unless user accesses cookie preferences. |

- **Global Privacy Control (GPC):** The `Sec-GPC: 1` request header is evaluated at the Edge and immediately promotes any request to the `STRICT` bucket regardless of geographic origin.
- **Cache-Safe Banner:** The banner visibility state is managed on the client side via the `cf_consent_v1=<bucket>:<choice>` cookie, preventing CDN edge-cache poisoning.

---

## 6. Environment Variables & Secrets Reference

All runtime secrets and variables are typed in `src/env.d.ts` and managed via Cloudflare Pages and Wrangler:

| Key                    | Sensitivity    | Target System                  | Purpose & Description                                                                                       |
| :--------------------- | :------------- | :----------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`       | **Secret**     | Cloudflare Pages / `.dev.vars` | API key from [Resend](https://resend.com) (`re_...`) for transactional notifications and autoresponders.    |
| `TURNSTILE_SECRET_KEY` | **Secret**     | Cloudflare Pages / `.dev.vars` | Cloudflare Turnstile private key for server-side token validation at `/siteverify`.                         |
| `TURNSTILE_SITE_KEY`   | Public         | `src/constants/site.ts`        | Cloudflare Turnstile public key embedded in the frontend CAPTCHA widgets.                                   |
| `JWT_SECRET`           | **Secret**     | Cloudflare Pages / `.dev.vars` | Minimum 32-character secret key used by `jose` to sign and verify `q_session` JWTs.                         |
| `ADMIN_EMAIL`          | Config         | Cloudflare Pages / `.dev.vars` | Primary recipient for lead intake notifications (`admin@quranific.com`).                                    |
| `SITE`                 | Config         | Cloudflare Pages / `.env`      | Canonical site origin (`https://quranific.com` or `http://localhost:4321`).                                 |
| `PROD`                 | Config         | Cloudflare Pages / `.env`      | Environment flag (`true` in production, `false` in development).                                            |
| `SESSION`              | **KV Binding** | Cloudflare Pages KV Binding    | KV namespace binding (`14eab319d57e4c58b5f903bce3eb3931`) for rate limits, sessions, and dead-letter queue. |

---

## 7. Local Development Setup

### 7.1 Prerequisites

- **Node.js:** `v20.0.0` or higher (`v22.x` recommended, defined in `.nvmrc` and `.node-version`).
- **Package Manager:** `npm` (v10+).

### 7.2 Step-by-Step Installation

1. **Clone the repository and install dependencies:**

   ```bash
   git clone https://github.com/faisalkhanllcltd-coder/Quranific.git
   cd Quranific-live
   npm install
   ```

2. **Configure Local Environment & Secrets:**
   Create `.env` (for Vite/Astro build tools) and `.dev.vars` (for local Cloudflare workerd runtime simulation):

   ```bash
   cp .env.example .env
   cp .env.example .dev.vars
   ```

   Ensure `.dev.vars` contains valid development placeholders:

   ```ini
   RESEND_API_KEY="re_test_123456789"
   TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
   ADMIN_EMAIL="admin@quranific.com"
   JWT_SECRET="local-development-secret-key-must-be-32-chars-long"
   SITE="http://localhost:4321"
   PROD=false
   ```

3. **Start the Local Development Server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:4321` with Hot Module Replacement (HMR) and Cloudflare Platform Proxy enabled.

---

## 8. Quality Assurance & Verification Scripts

The codebase provides automated scripts defined in `package.json`:

```bash
# Start local Astro development server with Cloudflare platform proxy
npm run dev

# Run Astro diagnostic checks followed by full production build
npm run build

# Run Astro diagnostic type-checks on Astro, TypeScript, and Svelte files
npm run check

# Run strict TypeScript compilation check without emitting files
npm run typecheck

# Run ESLint static analysis across all .js, .ts, .astro, and .svelte files
npm run lint

# Automatically fix ESLint formatting and linting errors
npm run lint:fix

# Format the entire codebase using Prettier (with Astro and Svelte plugins)
npm run format

# Clean build artifacts (dist/, .astro/, node_modules/.vite/)
npm run clean

# Build and preview the production bundle locally via Wrangler Pages Workerd
npm run preview

# Build and deploy the production bundle directly to Cloudflare Pages
npm run deploy

# Execute consent bucketing unit tests (19 test cases)
npx tsx tests/consent-unit.test.ts

# Execute link check and route integrity validator
node link_check.cjs

# Execute dead code scanner
node dead_code.cjs
```

---

## 9. Routing & Endpoint Reference

### 9.1 Public Web Routes (Prerendered SSG)

| Route Path                  | Type | Source File                                | Description                                                                                                                                                                          |
| :-------------------------- | :--- | :----------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                         | SSG  | `src/pages/index.astro`                    | Homepage: Value proposition, course previews, social proof                                                                                                                           |
| `/about`                    | SSG  | `src/pages/about/index.astro`              | Academy mission, story, leadership, and teaching philosophy                                                                                                                          |
| `/courses`                  | SSG  | `src/pages/courses/index.astro`            | Complete curriculum catalog and course directory                                                                                                                                     |
| `/courses/[slug]`           | SSG  | `src/pages/courses/[slug].astro`           | Dynamic syllabus pages (6 courses: `basic-qaida`, `quran-reading-with-tajweed`, `quran-memorization`, `quran-translation-with-tafsir`, `advanced-tajweed-ijazah`, `arabic-language`) |
| `/tuition-fee`              | SSG  | `src/pages/tuition-fee/index.astro`        | Interactive fee calculator, currency switcher & sibling discount matrix                                                                                                              |
| `/teachers`                 | SSG  | `src/pages/teachers/index.astro`           | Verified faculty showcase with dual student/teacher action cards                                                                                                                     |
| `/teachers/apply`           | SSG  | `src/pages/teachers/apply.astro`           | Faculty recruitment pre-qualification application wizard                                                                                                                             |
| `/testimonials`             | SSG  | `src/pages/testimonials/index.astro`       | Verified parent reviews, video testimonials, and trust scores                                                                                                                        |
| `/faq`                      | SSG  | `src/pages/faq/index.astro`                | Searchable FAQ repository with categorized accordion blocks                                                                                                                          |
| `/contact`                  | SSG  | `src/pages/contact/index.astro`            | Contact inquiry form with SLA cards and WhatsApp link                                                                                                                                |
| `/portals`                  | SSG  | `src/pages/portals/index.astro`            | Direct portal access directory for Students and Teachers                                                                                                                             |
| `/safeguarding`             | SSG  | `src/pages/safeguarding/index.astro`       | Child safety, background checking, and classroom conduct policy                                                                                                                      |
| `/getting-started/signup`   | SSG  | `src/pages/getting-started/signup.astro`   | Funnel Step 1: Lead capture & attribution tracking                                                                                                                                   |
| `/getting-started/complete` | SSG  | `src/pages/getting-started/complete.astro` | Funnel Step 2: Course preferences, teacher gender & schedule                                                                                                                         |
| `/getting-started/success`  | SSG  | `src/pages/getting-started/success.astro`  | Funnel Step 3: Registration confirmation & onboarding guide                                                                                                                          |
| `/quran-classes/for-kids`   | SSG  | `src/pages/[intent]/for-kids.astro`        | High-conversion intent lander for kids Quran classes                                                                                                                                 |
| `/quran-teacher/for-kids`   | SSG  | `src/pages/[intent]/for-kids.astro`        | High-conversion intent lander for kids Quran teachers                                                                                                                                |
| `/quran-classes/for-adults` | SSG  | `src/pages/[intent]/for-adults.astro`      | High-conversion intent lander for adult Quran classes                                                                                                                                |
| `/quran-teacher/for-adults` | SSG  | `src/pages/[intent]/for-adults.astro`      | High-conversion intent lander for adult Quran teachers                                                                                                                               |
| `/quran-classes/for-women`  | SSG  | `src/pages/[intent]/for-women.astro`       | High-conversion intent lander for female students & teachers                                                                                                                         |
| `/quran-teacher/for-women`  | SSG  | `src/pages/[intent]/for-women.astro`       | High-conversion intent lander for female Quran teachers                                                                                                                              |
| `/legal/privacy`            | SSG  | `src/pages/legal/privacy.astro`            | Privacy Policy (GDPR, UK GDPR, CCPA, COPPA)                                                                                                                                          |
| `/legal/terms`              | SSG  | `src/pages/legal/terms.astro`              | Terms of Service & Governance Agreement (Pakistan Jurisdiction)                                                                                                                      |
| `/legal/refund`             | SSG  | `src/pages/legal/refund.astro`             | Refund, Cancellation & Make-Up Class Policy                                                                                                                                          |
| `/legal/cookies`            | SSG  | `src/pages/legal/cookies.astro`            | Cookie Policy & Tracking Technology Disclosures                                                                                                                                      |
| `/legal/impressum`          | SSG  | `src/pages/legal/impressum.astro`          | Legal Notice & Company Information (Karachi, Pakistan Nexus)                                                                                                                         |
| `/blog`                     | SSG  | `src/pages/blog/index.astro`               | Blog index and educational articles repository                                                                                                                                       |
| `/blog/[slug]`              | SSG  | `src/pages/blog/[slug].astro`              | Dynamic blog post template rendered from Content Collections                                                                                                                         |
| `/robots.txt`               | SSR  | `src/pages/robots.txt.ts`                  | Dynamic search engine indexing rules                                                                                                                                                 |
| `/rss.xml`                  | SSR  | `src/pages/rss.xml.ts`                     | Dynamic RSS feed generator for blog content                                                                                                                                          |
| `/llms.txt`                 | SSR  | `src/pages/llms.txt.ts`                    | Contextual Markdown summary for LLM ingestion                                                                                                                                        |

### 9.2 Edge API Endpoints (SSR: `prerender = false`)

| Endpoint Route              | Method(s)             | Source File                             | Description & Edge Constraints                                                                                                      |
| :-------------------------- | :-------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `/api/register`             | `POST`                | `src/pages/api/register.ts`             | Validates Turnstile, enforces KV rate limit (4/min), issues HS256 JWT cookie (`q_session`), dispatches Step 1 email.                |
| `/api/complete`             | `POST`, `HEAD`, `GET` | `src/pages/api/complete.ts`             | Validates `q_session` JWT cookie, checks KV idempotency (`IDEM:COMPLETE:*`), dispatches admin notification & student welcome email. |
| `/api/contact`              | `POST`                | `src/pages/api/contact.ts`              | Validates contact message, Turnstile token, enforces KV rate limit (4/min), and sends inquiry email.                                |
| `/api/newsletter`           | `POST`                | `src/pages/api/newsletter.ts`           | Validates email, Turnstile token, enforces KV rate limit (4/min), and registers newsletter subscriber.                              |
| `/api/apply-teacher`        | `POST`                | `src/pages/api/apply-teacher.ts`        | Processes teacher job pre-qualification applications and dispatches notification & autoresponder emails.                            |
| `/api/internal/retry-queue` | `POST`                | `src/pages/api/internal/retry-queue.ts` | Authenticated Dead-Letter Queue processor called by Cloudflare Cron Worker with Bearer `JWT_SECRET`.                                |

---

## 10. Security & Compliance Architecture

1. **Content Security Policy (CSP):** Enforced in `src/middleware.ts` and `public/_headers` restricting script and frame execution to trusted origins (`challenges.cloudflare.com`, `googletagmanager.com`, `google-analytics.com`).
2. **HTTP Security Headers:** Every Edge SSR response automatically receives `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, and `Permissions-Policy`.
3. **Edge Caching Policy:** Static assets (`/fonts/*`, `/_astro/*`) are cached immutably for 1 year. Edge SSR responses receive `CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=86400` while forcing browser revalidation (`Cache-Control: public, max-age=0, must-revalidate`).
4. **Compliance & Legal Structure:** All legal policies reflect Quranific's current physical nexus in Karachi, Pakistan, fulfilling underwriting and KYC criteria for international merchant processors (2Checkout, Payoneer, Airwallex).
