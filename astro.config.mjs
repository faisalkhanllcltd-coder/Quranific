// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://quranific.com',
  output: 'server',
  compressHTML: true,
  adapter: cloudflare({
    imageService: 'cloudflare',
    platformProxy: {
      enabled: true, // Mandate 11: 1:1 Local Edge Simulation
    },
  }),
  // Permanent redirects: old /ads/* URLs → new semantic intent routes
  redirects: {
    '/ads/kids': '/quran-classes/for-kids',
    '/ads/adults': '/quran-classes/for-adults',
    '/ads/ladies': '/quran-classes/for-women',
  },
  integrations: [
    svelte(),
    sitemap({
      // Exclude internal API routes, signup funnel, and legacy ad aliases
      filter: (page) => {
        try {
          const url = new URL(page);
          const path = url.pathname;
          return !(
            path.startsWith('/api/') ||
            path.startsWith('/getting-started/') ||
            path.startsWith('/ads/') ||
            path === '/for-kids' ||
            path === '/for-adults' ||
            path === '/for-women' ||
            path === '/for-kids/' ||
            path === '/for-adults/' ||
            path === '/for-women/'
          );
        } catch {
          return true;
        }
      },
    }),

    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  vite: {
    // CONFIG FIX (L-06): Removed redundant LightningCSS. Tailwind v4 (Oxide engine) handles this natively.
    plugins: [tailwindcss()],
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      exclude: [
        '@astrojs/cloudflare',
        '@astrojs/svelte',
        'astro:middleware',
        'astro/assets/services/noop',
        'lucide-svelte',
      ],
    },
  },
  prefetch: {
    defaultStrategy: 'hover',
  },
});
