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
      // Exclude API routes, funnel, old ad paths, and paid lander routes
      filter: (page) =>
        !['/api/', '/funnel/', '/ads/', '/for-kids', '/for-adults', '/for-women'].some((path) =>
          page.includes(path)
        ),
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
