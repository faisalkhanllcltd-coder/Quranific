# Quranific Deployment Guide

This document outlines the standard operating procedure (SOP) for deploying the Quranific application to Cloudflare Pages.

## 1. Prerequisites

You must have the following credentials available:
- **Resend API Key** (`RESEND_API_KEY`): For transactional emails.
- **Cloudflare Turnstile Keys**:
  - `TURNSTILE_SITE_KEY` — set as `PUBLIC_TURNSTILE_SITE_KEY` in your `.dev.vars` / Cloudflare environment variables. The widget components reference `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY` directly — do NOT add it to `src/constants/site.ts`.
  - `TURNSTILE_SECRET_KEY` (Private, added to secrets)
- **JWT Secret** (`JWT_SECRET`): A long, random string (min 32 chars) for signing session cookies.
- **Admin Email** (`ADMIN_EMAIL`): Where form submissions are sent.

## 2. Infrastructure Setup (Cloudflare KV)

The application requires a Cloudflare KV namespace named `SESSION` for:
1. Idempotency (preventing duplicate form submissions).
2. Dead-letter queue (storing leads when Resend API fails).

**To create the KV Namespace:**
```bash
npx wrangler kv:namespace create SESSION
```
Copy the generated `id` and place it in your `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SESSION"
id = "your_generated_id_here"
```

## 3. Environment Variables (Secrets)

Secrets are never committed to the repository.

### Local Development
Copy `.env.example` to `.env` or use `.dev.vars` (for Wrangler):
```bash
cp .env.example .dev.vars
```
Fill in the values. Use the dummy Turnstile secret for local testing:
`1x0000000000000000000000000000000AA`

### Production
Add secrets to Cloudflare Pages via the dashboard (Settings > Environment variables) or using the Wrangler CLI:
```bash
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put TURNSTILE_SECRET_KEY
npx wrangler pages secret put JWT_SECRET
npx wrangler pages secret put ADMIN_EMAIL
```

## 4. Build and Deploy

**Local Testing (Edge Simulator):**
```bash
npm run build
npm run preview
```
*(The preview environment runs the Cloudflare workerd runtime locally to simulate edge execution exactly.)*

**Deploy to Production:**
Push to the `main` branch to trigger Cloudflare's automated build, or run a manual deployment:
```bash
npx wrangler pages deploy dist
```

## 5. Security & Compliance Checklist
- [ ] Ensure Turnstile keys are properly split (Public in `site.ts`, Private in secrets).
- [ ] Verify `JWT_SECRET` is strong and unique to the environment.
- [ ] Check that the `SESSION` KV binding is active so the dead-letter queue works.
- [ ] Confirm `SITE.phone` and `SITE.address` are populated in `site.ts` before running live ads.
