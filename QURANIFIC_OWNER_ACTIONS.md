# QURANIFIC OWNER ACTIONS

This document tracks every unverified fact, missing credential, policy approval, or business decision that requires the owner's input.

- [ ] Verify the 3 stats in `site.ts` (22 Countries, 94% Retention, 4.9 Rating) or provide real replacements.
- [ ] Verify the claim "certified scholars from Al-Azhar" in `Footer.astro`.
- [ ] Provide a real founder quote and confirm the origin story details in `about.astro` (Faisal Khan's background, "first 18 months with no advertising").
- [ ] Provide real names, roles, and bios for the placeholder team member cards in `about.astro`.
- [ ] Confirm the 2026 milestone goal of "10,000 families" is accurate.
- [ ] Confirm every teacher holds a verified Ijazah before their first session.
- [ ] Confirm background checks are renewed annually without exception.

- [ ] Confirm average turnaround time for teacher matching is under 24 hours (or within 3–6 hours).
- [ ] Confirm progress reports are sent within 30 minutes of session ending.
- [ ] Confirm parent-controlled opt-in for session recordings.
- [ ] Verify the standard pricing ($39, $59) or replace with actual figures.
- [ ] Confirm all base plan prices ($33/$39, $50/$59, $76/$89) and sibling discounts (10%).
- [ ] Confirm WhatsApp parent support is an included feature.
- [ ] Confirm the 5 working days review time for scholarship applications.
- [ ] Confirm scholarships are renewed automatically without annual reapplication.
- [ ] Confirm scholarship status is 100% confidential and hidden from the teacher.
- [ ] Confirm the policy on annual plan cancellation refunds.
- [ ] Confirm the 4-stage vetting process for teachers is accurate.
- [ ] Confirm families can explicitly request a female teacher.
- [ ] Confirm the 100% money-back guarantee in the first paid month.
- [ ] Confirm all teachers hold safeguarding training.
- [ ] Confirm support response SLA.
- [ ] Confirm ratings (5.0, 4.9) and student counts (120+, 85+, etc) in teachers.astro
- [ ] Confirm specific institutional claims (e.g. Al-Azhar Alumnus) in teachers.astro
- [ ] Confirm acceptance rate ("reject over 90% of applicants") in teachers.astro
- [ ] Verify specific teacher names and profiles in teachers.astro
- [ ] Confirm hiring metrics and team sizes (team members, countries, etc.) in careers.astro
- [ ] Confirm actual student names and specific testimonial quotes in testimonials.astro
- [ ] Confirm 100+ countries vs 22 countries discrepancy in testimonials.astro
- [ ] Confirm 4.9/5 and 50k+ Active Students claims in testimonials.astro
- [ ] Confirm that scheduling the free trial class "at your convenience" is operationally accurate.
- [ ] Confirm "Typically fastest response" is factually true for WhatsApp link on success page.
- [ ] Confirm gender preference matching is available and fulfilled as promised in the complete funnel.
- [ ] Configure TURNSTILE_SECRET_KEY as an environment variable in Cloudflare for production.
- [ ] Configure RESEND_API_KEY as an environment variable in Cloudflare for production.
- [ ] Configure JWT_SECRET as an environment variable in Cloudflare for production.
- [ ] Configure KV Namespace binding "SESSION" in Cloudflare dashboard for production rate-limiting and idempotency.
- [x] Add Turnstile widget to the CompleteForm.svelte and Newsletter (Footer) components. CONFIRMED DONE — diff evidence: `cf-turnstile` widget added in `CompleteForm.svelte` and `Footer.astro`, both referencing `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY`.
- [ ] Confirm governing jurisdiction: United Kingdom (in `terms.astro` and `impressum.astro`)
- [ ] Confirm specific statute of limitations: 1 year (in `terms.astro`)
- [ ] Confirm refund window: 7 days (in `refund.astro`)
- [ ] Confirm grace period: 5 days (in `refund.astro`)
- [ ] Confirm make-up notice rule: 5 hours (in `refund.astro`)
- [ ] Provision and verify the 'SESSION' KV binding namespace in the Cloudflare Dashboard to enable the Dead-Letter Queue and idempotency functions.
