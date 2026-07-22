// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://quranific.com',
  output: 'server',
  adapter: cloudflare({
    imageService: 'cloudflare',
    platformProxy: {
      enabled: true // Mandate 11: 1:1 Local Edge Simulation
    }
  }),
  integrations: [
    svelte(),
    sitemap({
      filter: (page) => !['/api/', '/funnel/', '/ads/'].some(path => page.includes(path)),
    }),
    mdx(),
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
      target: 'esnext'
    },
    optimizeDeps: {
      exclude: ['astro:middleware']
    }
  },
  prefetch: {
    defaultStrategy: 'hover'
  }
});