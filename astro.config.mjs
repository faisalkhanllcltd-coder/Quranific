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
      enabled: true, // 1:1 Local Edge Simulation — KV, env, CF bindings available in dev
    },
  }),
  // Permanent redirects: old /ads/* URLs and bare intent shortcuts → canonical intent routes
  redirects: {
    '/ads/kids': '/quran-classes/for-kids',
    '/ads/adults': '/quran-classes/for-adults',
    '/ads/ladies': '/quran-classes/for-women',
    // Bare top-level shortcuts → canonical intent paths (301)
    '/for-kids': '/quran-classes/for-kids',
    '/for-adults': '/quran-classes/for-adults',
    '/for-women': '/quran-classes/for-women',
  },
  integrations: [
    svelte(),
    sitemap({
      // Exclude internal API routes, signup funnel, legacy ad aliases,
      // AND all intent/landing pages (noindex) — /quran-classes/*, /quran-teacher/*
      filter: (page) => {
        try {
          const url = new URL(page);
          const path = url.pathname;
          return !(
            path.startsWith('/api/') ||
            path.startsWith('/getting-started/') ||
            path.startsWith('/ads/') ||
            path.startsWith('/quran-classes/') ||
            path.startsWith('/quran-teacher/') ||
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
    // cloudflare-apex-redirect Vite plugin removed — middleware.ts handles www→apex in production.
    plugins: [
      tailwindcss(),
      {
        name: 'vite-environment-exclude-virtual-modules',
        configEnvironment() {
          return {
            optimizeDeps: {
              exclude: [
                '@astrojs/cloudflare',
                '@astrojs/svelte',
                'astro:middleware',
                'astro:transitions',
                'astro/virtual-modules',
                'astro/assets/services/noop',
                'lucide-svelte',
              ],
            },
          };
        },
      },
    ],
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      exclude: [
        '@astrojs/cloudflare',
        '@astrojs/svelte',
        'astro:middleware',
        'astro:transitions',
        'astro/virtual-modules',
        'astro/assets/services/noop',
        'lucide-svelte',
      ],
    },
    ssr: {
      optimizeDeps: {
        exclude: [
          '@astrojs/cloudflare',
          '@astrojs/svelte',
          'astro:middleware',
          'astro:transitions',
          'astro/virtual-modules',
          'astro/assets/services/noop',
          'lucide-svelte',
        ],
      },
    },
    environments: {
      astro: {
        optimizeDeps: {
          exclude: [
            '@astrojs/cloudflare',
            '@astrojs/svelte',
            'astro:middleware',
            'astro:transitions',
            'astro/virtual-modules',
            'astro/assets/services/noop',
            'lucide-svelte',
          ],
        },
      },
      ssr: {
        optimizeDeps: {
          exclude: [
            '@astrojs/cloudflare',
            '@astrojs/svelte',
            'astro:middleware',
            'astro:transitions',
            'astro/virtual-modules',
            'astro/assets/services/noop',
            'lucide-svelte',
          ],
        },
      },
    },
  },
  prefetch: {
    defaultStrategy: 'hover',
  },
});
