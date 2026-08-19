# Skill: Quranific UI/UX & Architecture

## Trigger

Use this skill whenever the user asks to build, design, modify, or refine user interfaces, frontend components, CSS/Tailwind styles, layouts, Astro pages, or Svelte components for the Quranific project.

## Goal

Write production-grade, highly performant web components optimized for Cloudflare Edge execution using Astro for static layout and Svelte for interactive client-side islands.

## UI/UX & Tailwind Constraints

- Spacing: Strictly adhere to an 8pt layout grid. Only use standard Tailwind spacing variables (e.g., p-2, m-4, gap-8). No arbitrary values.
- Typography: Implement fluid typography using CSS clamp() for headings. Ensure body text is highly legible (minimum 16px).
- Accessibility (a11y): Guarantee WCAG AA compliant 4.5:1 color contrast. Provide descriptive aria-labels for all icon-only buttons. Use semantic HTML5 tags.
- Mobile-First: Ensure all touch targets are a minimum of 44x44px to prevent fat-finger errors on mobile devices.

## Architectural & Stack Constraints

- Component Selection: Default to .astro files for static layouts, routing, and SEO. Only use .svelte components when client-side state or reactivity is strictly required.
- Hydration: Always use specific Astro client directives (e.g., client:load, client:visible, client:idle) when mounting Svelte components to avoid main-thread blocking.
- Performance: Leverage Astro's built-in Image component to automatically handle dimensions and prevent Cumulative Layout Shift (CLS). Prevent form double-submissions natively via Svelte state.
- Data Passing: Never mix define:vars with import statements inside Astro script tags; pass dynamic data via data-\* attributes instead.
