# Quranific — Engineering Architecture & Onboarding Guide

> **Platform:** Edge-SSR & SSG Web Application  
> **Production Target:** Cloudflare Pages & Cloudflare Workers (Workerd Edge Runtime)  
> **Core Domain:** Private 1-on-1 Online Quran Tutoring Academy (`https://quranific.com`)

---

## 1. Executive Summary & Architectural Overview

**Quranific** is a high-performance, edge-rendered web application and multi-step student/teacher acquisition engine. The application serves global Muslim diaspora families (primarily in the UK, US, Canada, Australia, UAE, Saudi Arabia, and Singapore) seeking 1-on-1 Quranic education with verified, Ijazah-certified faculty.

### Core Architectural Characteristics

- **Hybrid SSR/SSG Edge Architecture:** Built on **Astro 7** with `@astrojs/cloudflare` in server output mode (`output: 'server'`). Marketing and content pages are statically prerendered (`export const prerender = true`) for global CDN latency minimization, while dynamic lead-capture endpoints and session verification routes execute on Cloudflare's Edge isolate network.
- **Partial Hydration (Astro Islands):** 0 kB JavaScript baseline by default. Client-side JS is shipped only to interactive islands (e.g., pricing calculators, multi-step booking funnels, faculty application forms) using `client:load` or `client:visible`.
- **Reactive UI Layer:** Built with **Svelte 5** leveraging native Runes syntax (`$state`, `$derived`, `$props`, `$bindable`) without legacy Svelte stores or external state management libraries.
- **Modern CSS Engine:** Styled with **Tailwind CSS v4** via the `@tailwindcss/vite` plugin utilizing `@theme` design tokens and the Oxide compilation engine.
- **Edge Security & Persistence:** Cloudflare Turnstile bot verification, distributed IP rate-limiting via Cloudflare KV (`SESSION`), signed HS256 JSON Web Tokens (`jose`) in `HttpOnly` cookies, strict Content Security Policy (CSP), and a dead-letter recovery queue for outbound email resiliency.

---

## 2. Tech Stack Matrix

| Layer / Subsystem       | Technology                                                | Version / Spec        | Purpose & Implementation Details                                                             |
| :---------------------- | :-------------------------------------------------------- | :-------------------- | :------------------------------------------------------------------------------------------- |
| **Framework**           | [Astro](https://astro.build/)                             | `^7.2.0`              | Core routing, SSG prerendering, HTML streaming, and Island architecture                      |
| **Edge Runtime**        | [@astrojs/cloudflare](https://github.com/withastro/astro) | `^14.2.0`             | Cloudflare Pages/Workers adapter with Workerd platform proxy support                         |
| **UI Components**       | [Svelte](https://svelte.dev/)                             | `^5.0.0`              | Client-side reactive islands utilizing Svelte 5 Runes                                        |
| **Svelte Adapter**      | [@astrojs/svelte](https://github.com/withastro/astro)     | `^9.0.1`              | Svelte island compiler integration for Astro                                                 |
| **Styling Engine**      | [Tailwind CSS](https://tailwindcss.com/)                  | `^4.0.0`              | Utility-first styling via `@tailwindcss/vite` and `@theme` tokens in `global.css`            |
| **Type System**         | [TypeScript](https://www.typescriptlang.org/)             | `^5.9.3`              | Strict mode type checking extending `astro/tsconfigs/strict`                                 |
| **Validation**          | [Zod](https://zod.dev/)                                   | `^4.4.3`              | Runtime schema validation for forms, environment variables, and content collections          |
| **Token Cryptography**  | [jose](https://github.com/panva/jose)                     | `^6.2.1`              | Edge-compatible HS256 JWT signing and verification for multi-step funnel cookies             |
| **Bot Mitigation**      | Cloudflare Turnstile                                      | Managed API           | Invisible/managed CAPTCHA alternative verified at the edge before lead processing            |
| **Email Engine**        | Resend API                                                | REST API              | Custom edge fetch client (`src/lib/email.ts`) avoiding Node.js native dependencies           |
| **Edge Storage**        | Cloudflare KV                                             | `SESSION` binding     | Distributed IP rate limiting (`RL:*`), submission idempotency, and dead-letter lead recovery |
| **Cron Worker**         | Cloudflare Workers                                        | Cron Trigger          | Standalone worker in `alarm-worker/` triggering retry cycles (`0 * * * *`)                   |
| **Icons**               | [lucide-svelte](https://lucide.dev/)                      | `^1.0.1`              | SVG iconography within Svelte components and raw SVG constants                               |
| **Typography**          | Fontsource                                                | `^5.2.8`              | Self-hosted Inter Variable (`@fontsource-variable/inter`), Merriweather, and Amiri fonts     |
| **Script Optimization** | [@astrojs/partytown](https://partytown.builder.io/)       | `^2.1.7`              | Web Worker offloading for third-party analytics (`dataLayer.push`)                           |
| **SEO & Feeds**         | [@astrojs/sitemap](https://github.com/withastro/astro)    | `^3.7.1`              | Automated sitemap generator, RSS XML feed (`rss.xml.ts`), and LLM context (`llms.txt.ts`)    |
| **Code Quality**        | ESLint & Prettier                                         | ESLint 10, Prettier 3 | Enforced with Husky (`^9.1.7`) and lint-staged (`^17.3.0`) pre-commit hooks                  |

---

## 3. Directory Layout & Architecture Map

```
Quranific-live/
├── .dev.vars                     # Local Cloudflare workerd secrets (Wrangler simulation)
├── .env.example                  # Environment blueprint for developers
├── .github/                      # Repository configuration
│   └── workflows/                # CI/CD workflow directory (currently empty)
├── .husky/                       # Git commit hooks (pre-commit lint-staged)
├── .node-version                 # Node.js engine pin (v22 / v20+)
├── .nvmrc                        # NVM environment configuration
├── .prettierrc                   # Code formatting rules
├── alarm-worker/                 # Independent Cloudflare Cron Worker
│   ├── src/
│   │   └── index.ts              # Hourly scheduled trigger calling /api/internal/retry-queue
│   └── wrangler.toml             # Alarm worker configuration (crons = ["0 * * * *"])
├── astro.config.mjs              # Astro engine config (Cloudflare adapter, sitemap, Vite plugins)
├── eslint.config.mjs             # Flat ESLint configuration (Astro, Svelte, TypeScript rules)
├── package.json                  # Dependencies, scripts, and engine constraints
├── public/                       # Unprocessed static assets (images, logos, favicon, OG cards)
├── svelte.config.js              # Svelte 5 Vite preprocessor config
├── tsconfig.json                 # Strict TypeScript configuration and path aliases
├── wrangler.toml                 # Main Cloudflare Pages / Worker production config
└── src/
    ├── content.config.ts         # Astro content collections schema definition (Blog)
    ├── env.d.ts                  # Ambient TypeScript declarations and Cloudflare Locals/Env
    ├── middleware.ts             # Edge middleware: Security headers, Geo-IP locals, CDN caching
    ├── components/
    │   ├── blocks/               # Composite page sections (PageHero, CourseGrid, FAQAccordion)
    │   │   └── PricingCalculator.svelte # Interactive tuition fee estimation island
    │   ├── global/               # Global shell (Header.astro, Footer.astro, MobileMenu.astro)
    │   ├── seo/                  # Structured data & navigation breadcrumbs (Breadcrumb.astro)
    │   └── ui/                   # Atomic UI primitives (Button, Card, Section, EyebrowText)
    ├── constants/                # Single source of truth constants
    │   ├── courses.ts            # Detailed curriculum structures and course metadata
    │   ├── faqs.ts               # Categorized FAQ data
    │   ├── landing.ts            # Intent page landing page configurations
    │   ├── navigation.ts         # Global header and footer navigation trees
    │   ├── pricing.ts            # Matrix of currencies, frequency, durations, and base fees
    │   ├── site.ts               # Global company metadata, contact info, and Turnstile site key
    │   ├── teachers.ts           # Faculty profile declarations
    │   └── testimonials.ts       # Social proof and student review arrays
    ├── content/
    │   └── blog/                 # Markdown / MDX blog articles
    ├── data/                     # Schema-compatible structured JSON/TS datasets
    │   ├── faqs.ts               # Structured FAQ records
    │   ├── howTo.ts              # How-to schema data definitions
    │   └── testimonials.ts       # Testimonial structured data
    ├── layouts/                  # Base document layout wrappers
    │   ├── Base.astro            # Primary HTML shell (SEO meta, fonts, JSON-LD, Partytown)
    │   ├── Funnel.astro          # Focused conversion layout without distracting navigation
    │   ├── Landing.astro         # High-conversion PPC landing page layout
    │   └── Page.astro            # Standard informational page wrapper
    ├── lib/                      # Shared business logic and edge utilities
    │   ├── email.ts              # Edge-compatible Resend client (Transactional notifications)
    │   ├── env.ts                # Zod-validated lazy environment configuration singleton
    │   ├── helpers.ts            # Formatting, phone normalizers, and enum definitions
    │   └── schema.ts             # Zod form validation schemas (Signup, Complete, Contact, etc.)
    ├── styles/                   # Style architecture
    │   ├── cv.css                # Print / curriculum styling rules
    │   ├── fonts.css             # Local @font-face declarations
    │   └── global.css            # Tailwind v4 import, @theme palette, and modern utility classes
    └── pages/                    # File-based routing tree (SSG + Edge SSR)
        ├── 404.astro             # Custom 404 Error page
        ├── 500.astro             # Custom 500 Error page
        ├── index.astro           # Homepage
        ├── llms.txt.ts           # Markdown endpoint for LLM context ingestion
        ├── robots.txt.ts         # Dynamic robots.txt generation
        ├── rss.xml.ts            # Blog RSS feed generator
        ├── safeguarding/         # Child safeguarding & protection policy
        ├── [intent]/             # Dynamic semantic landing pages (/quran-classes/for-kids, etc.)
        ├── about/                # About company, story, mission, and leadership
        ├── blog/                 # Blog index and dynamic [slug].astro articles
        ├── contact/              # Contact page with SmartContactForm.astro and SLA cards
        ├── courses/              # Course directory and dynamic [slug].astro course pages
        ├── faq/                  # Dedicated FAQ repository
        ├── getting-started/      # Multi-step Student Registration Funnel
        │   ├── signup.astro      # Step 1: Lead capture & attribution tracking
        │   ├── complete.astro    # Step 2: Course preferences & scheduling
        │   ├── success.astro     # Confirmation and WhatsApp onboarding guidance
        │   └── _components/      # Collocated Svelte funnel islands (SignupForm, CompleteForm)
        ├── portals/              # Authentication directory for Student & Teacher dashboards
        ├── teachers/             # Faculty showcase & Teacher recruitment funnel
        │   ├── index.astro       # Faculty showcase with dual revenue/recruitment CTAs
        │   ├── apply.astro       # Teacher recruitment page with interactive pre-qualification island
        │   └── _components/      # Collocated faculty cards and TeacherApplicationForm.svelte
        ├── testimonials/         # Reviews and video testimonials
        ├── tuition-fee/          # Pricing calculator page with PricingGrid.svelte
        ├── legal/                # Compliance & policies (cookies, privacy, terms, refund, impressum)
        └── api/                  # Edge API routes (SSR: export const prerender = false)
            ├── register.ts       # POST: Funnel Step 1 lead ingestion + JWT issuance
            ├── complete.ts       # POST/HEAD/GET: Funnel Step 2 submission & session validation
            ├── contact.ts        # POST: General contact form handler with Turnstile
            ├── newsletter.ts     # POST: Newsletter subscription handler
            ├── apply-teacher.ts  # POST: Teacher pre-qualification application endpoint
            └── internal/
                └── retry-queue.ts # POST: Cron-authenticated Dead-Letter Queue processor
```

---

## 4. UI Architecture & Svelte 5 Runes State Management

### 4.1 Astro Islands Hydration Model

Astro generates pure static HTML at build time. Dynamic client-side JavaScript is introduced strictly through Astro island directives:

- `client:load`: Used on high-priority entry funnels where immediate interactivity is mandatory (`SignupForm.svelte`, `CompleteForm.svelte`).
- `client:visible`: Used for below-the-fold or deferred interactive components (`PricingCalculator.svelte`, `TeacherApplicationForm.svelte`, `PricingGrid.svelte`).

### 4.2 Svelte 5 Runes Implementation

All interactive widgets leverage **Svelte 5 Runes** for state reactivity:

- `$state(...)`: Manages form state, wizard step counters, loading indicators, and field errors.
- `$derived(...)`: Dynamically calculates validation states, fee totals based on currency/frequency selections, and color tokens.
- `$props()` & `$bindable()`: Handles typed component properties and bidirectional data flow across multi-step wizard islands (e.g., `TeacherStep1.svelte` and `TeacherStep2.svelte` binding to `TeacherApplicationForm.svelte`).

```svelte
<!-- Example from TeacherApplicationForm.svelte (Svelte 5 Runes) -->
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
      step = 4; // Rejection state
      return;
    }
    step = 2; // Passed pre-qualification
  }
</script>
```

---

## 5. Conversion Funnel & Lead Attribution Flow

The registration engine utilizes a two-step state machine engineered for high conversion and fault tolerance:

```mermaid
sequenceDiagram
    autonumber
    actor User as Prospective Student
    participant Browser as Client Island (SignupForm)
    participant EdgeAPI as Cloudflare Edge (/api/register)
    participant KV as Cloudflare KV (SESSION)
    participant Resend as Resend API
    participant Complete as Client Island (CompleteForm)

    User->>Browser: Enters Name, Email, WhatsApp, Country
    Browser->>EdgeAPI: POST /api/register (FormData + Turnstile + Ad Tracking)
    EdgeAPI->>EdgeAPI: Verify Turnstile Token
    EdgeAPI->>KV: Check & Increment IP Rate Limit (RL:REGISTER:<IP>)
    EdgeAPI->>EdgeAPI: Sign HS256 JWT containing Lead ID & Attribution (15m expiry)
    EdgeAPI->>Resend: Send Step 1 Partial Lead Notification
    EdgeAPI-->>Browser: Set-Cookie: q_session=<JWT>; HttpOnly; Secure (200 OK)
    Browser->>Complete: Navigate to /getting-started/complete
    Complete->>EdgeAPI: HEAD /api/complete (Validate q_session cookie)
    EdgeAPI-->>Complete: 200 OK (Session Active)
    User->>Complete: Selects Course, Teacher Gender, Days & Schedule
    Complete->>EdgeAPI: POST /api/complete (FormData)
    EdgeAPI->>EdgeAPI: Verify & Decode q_session JWT
    EdgeAPI->>KV: Check Idempotency Key (IDEM:COMPLETE:<LeadID>)
    EdgeAPI->>Resend: Send Full Admin Notification & Student Welcome Email
    alt Resend API Failure
        EdgeAPI->>KV: Write to Dead-Letter Queue (FAILED_LEAD:<LeadID>)
    end
    EdgeAPI-->>Complete: 200 OK (Set-Cookie: q_session=; Max-Age=0)
    Complete->>User: Redirect to /getting-started/success
```

### Attribution Tracking Parameters

The application tracks ad sources and calculator context across session boundaries via `sessionStorage` (`q_track_*`) and passes them into the signed session JWT:

- **Ad Attribution:** `fbclid`, `gclid`, `ttclid`, `utm_source`, `utm_campaign`, `utm_medium`, `utm_content`.
- **Fee Calculator Context:** `enrollType`, `duration`, `sessions`, `currency`, `billing`, `price`, `course`, `note`.

---

## 6. Local Development Setup

### 6.1 Prerequisites

- **Node.js:** `v20.0.0` or higher (`v22.x` recommended, defined in `.nvmrc` and `.node-version`).
- **Package Manager:** `npm` (v10+).

### 6.2 Step-by-Step Installation

1. **Clone the repository and install dependencies:**

   ```bash
   git clone https://github.com/faisalkhanllcltd-coder/Quranific.git
   cd Quranific-live
   npm install
   ```

2. **Configure Local Secrets:**
   Create both `.env` (for Vite/Astro build tools) and `.dev.vars` (for Wrangler Cloudflare runtime simulation):

   ```bash
   cp .env.example .env
   cp .env.example .dev.vars
   ```

   Fill in `.env` and `.dev.vars` with your testing credentials:

   ```ini
   RESEND_API_KEY="re_test_123456789"
   TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
   TURNSTILE_SITE_KEY="1x0000000000000000000000000000000AA"
   ADMIN_EMAIL="admin@quranific.com"
   JWT_SECRET="local-development-secret-key-must-be-32-chars-long"
   SITE="http://localhost:4321"
   PROD=false
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The local dev server spins up at `http://localhost:4321` with hot module replacement (HMR) and Cloudflare Platform Proxy enabled.

---

## 7. Quality Assurance & Verification Scripts

The codebase provides automated scripts defined in `package.json`:

```bash
# Execute Astro diagnostic checks across all Astro, TS, and Svelte files
npm run check

# Run strict TypeScript compilation check without emitting files
npm run typecheck

# Run ESLint static analysis across the codebase
npm run lint

# Run ESLint auto-fix
npm run lint:fix

# Format code with Prettier (enforcing Astro and Svelte plugins)
npm run format

# Run full production check and build bundle
npm run build

# Simulate edge production execution using local workerd isolate runtime
npm run preview

# Clean build artifacts and Vite caches
npm run clean
```

---

## 8. Routing & Page Directory Reference

| Route Path                  | Type | Source File                                | Description                                                  |
| :-------------------------- | :--- | :----------------------------------------- | :----------------------------------------------------------- |
| `/`                         | SSG  | `src/pages/index.astro`                    | Main landing page and value proposition                      |
| `/about`                    | SSG  | `src/pages/about/index.astro`              | Academy mission, story, and leadership                       |
| `/courses`                  | SSG  | `src/pages/courses/index.astro`            | Complete curriculum index                                    |
| `/courses/[slug]`           | SSG  | `src/pages/courses/[slug].astro`           | Dynamic course syllabus pages                                |
| `/tuition-fee`              | SSG  | `src/pages/tuition-fee/index.astro`        | Interactive fee structure & sibling discounts                |
| `/teachers`                 | SSG  | `src/pages/teachers/index.astro`           | Verified faculty showcase & dual action cards                |
| `/teachers/apply`           | SSG  | `src/pages/teachers/apply.astro`           | Teacher faculty pre-qualification application funnel         |
| `/testimonials`             | SSG  | `src/pages/testimonials/index.astro`       | Parent reviews, video testimonials, and ratings              |
| `/faq`                      | SSG  | `src/pages/faq/index.astro`                | Categorized search and FAQ accordion                         |
| `/contact`                  | SSG  | `src/pages/contact/index.astro`            | Contact form and channel response SLAs                       |
| `/portals`                  | SSG  | `src/pages/portals/index.astro`            | Direct access to Student and Teacher dashboards              |
| `/safeguarding`             | SSG  | `src/pages/safeguarding/index.astro`       | Child safety, background checking, and monitoring policy     |
| `/getting-started/signup`   | SSG  | `src/pages/getting-started/signup.astro`   | Step 1 lead registration form                                |
| `/getting-started/complete` | SSG  | `src/pages/getting-started/complete.astro` | Step 2 course preference and schedule selection              |
| `/getting-started/success`  | SSG  | `src/pages/getting-started/success.astro`  | Registration complete confirmation screen                    |
| `/quran-classes/[intent]`   | SSG  | `src/pages/[intent]/for-*.astro`           | Paid and organic search intent landers (kids, adults, women) |
| `/legal/*`                  | SSG  | `src/pages/legal/*.astro`                  | Privacy, Terms, Cookies, Refund, Impressum policies          |
| `/blog`                     | SSG  | `src/pages/blog/index.astro`               | Blog index                                                   |
| `/blog/[slug]`              | SSG  | `src/pages/blog/[slug].astro`              | Blog article post template                                   |
| `/api/register`             | SSR  | `src/pages/api/register.ts`                | Edge API: Step 1 lead registration                           |
| `/api/complete`             | SSR  | `src/pages/api/complete.ts`                | Edge API: Step 2 registration completion                     |
| `/api/contact`              | SSR  | `src/pages/api/contact.ts`                 | Edge API: Contact inquiry handler                            |
| `/api/newsletter`           | SSR  | `src/pages/api/newsletter.ts`              | Edge API: Newsletter subscriber ingestion                    |
| `/api/apply-teacher`        | SSR  | `src/pages/api/apply-teacher.ts`           | Edge API: Teacher job application intake                     |
| `/api/internal/retry-queue` | SSR  | `src/pages/api/internal/retry-queue.ts`    | Edge API: Dead-letter queue recovery processor               |
