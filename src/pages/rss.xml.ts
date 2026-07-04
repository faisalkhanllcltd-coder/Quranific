// src/pages/rss.xml.ts
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE } from '../constants/site';

export const GET: APIRoute = async () => {
  // SEO FIX (L-03): Dynamically fetches blog posts instead of returning a dead stub.
  // Fails gracefully if the collection is empty.
  let posts: CollectionEntry<'blog'>[] = [];
  try {
    posts = await getCollection('blog');
  } catch (_e) {
    // Collection might not exist yet, safe to ignore
  }

  const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${SITE.url}/blog/${post.id}</link>
      <description><![CDATA[${post.data.description}]]></description>
      <pubDate>${new Date(post.data.pubDate || new Date()).toUTCString()}</pubDate>
    </item>
  `).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.name} Blog</title>
    <link>${SITE.url}/blog</link>
    <description>${SITE.description}</description>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`.trim();

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
    },
  });
};