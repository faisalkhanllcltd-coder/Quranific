import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://quranific.com',
  output: 'static',
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
    plugins: [tailwindcss()],
    css: {
      transformer: 'lightningcss',
      lightningcss: { drafts: { customMedia: true } }
    },
    build: {
      cssMinify: 'lightningcss',
      target: 'esnext'
    }
  },
  prefetch: {
    defaultStrategy: 'hover'
  }
});