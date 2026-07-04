// src/content.config.ts
// A-0 FIX: Import 'z' from 'zod' directly instead of 're-exporting from 'astro:content'.
// The re-export is deprecated in Astro 5+ (ts warning 6385).
import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';

const blogCollection = defineCollection({
  // Engine Fix: Bypassing the buggy Vite macro and using native routing
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.date(),
    updatedDate: z.date().optional(),
    heroImage:   z.string().optional(),
    author:      z.string().default('Quranific Team'),
    tags:        z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};