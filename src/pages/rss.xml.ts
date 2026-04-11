// src/pages/rss.xml.ts
import type { APIRoute } from 'astro';
import { SITE } from '../constants/site';

export const GET: APIRoute = () => {
  // Defensive stub: Will be expanded dynamically when you add a CMS or Markdown blog collection
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.name} Blog</title>
    <link>${SITE.url}/blog</link>
    <description>${SITE.description}</description>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
  </channel>
</rss>`.trim();

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Edge Caching: 24-hour global cache to protect Worker limits
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
    },
  });
};