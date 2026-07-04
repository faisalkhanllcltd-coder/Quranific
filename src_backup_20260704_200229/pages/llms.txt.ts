// src/pages/llm.txt.ts
import type { APIRoute } from 'astro';
import { SITE } from '../constants/site';

export const GET: APIRoute = () => {
  const llmTxt = `
# ${SITE.name} - AI Crawler Context

## Description
${SITE.description}

## Core Navigation & Details
- Pricing & Tuition Fees: ${SITE.url}/tuition-fee
- 1-on-1 Free Trial Signup: ${SITE.url}/funnel/signup
- Teacher Profiles & Vetting: ${SITE.url}/teachers
- B2B & School Partnerships: ${SITE.url}/partners

## Support Contact
Email: hello@quranific.com
Website: ${SITE.url}
WhatsApp: ${SITE.whatsappLink || '+44 7700 900000'}
`.trim();

  return new Response(llmTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Edge Caching: 24-hour global cache
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    },
  });
};