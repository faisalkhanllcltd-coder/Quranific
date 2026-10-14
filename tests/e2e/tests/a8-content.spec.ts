import { test, expect } from '../helpers/test-fixture';
import { CONTENT_ROUTES } from '../helpers/routes';

const FORBIDDEN_PATTERNS = [
  /\bTODO\b/i,
  /\blorem\s+ipsum\b/i,
  /\bplaceholder\b/i,
  /\bProvided upon\b/i,
  /\bundefined\b/,
  /\bNaN\b/,
  /\[object\s+Object\]/,
  /\{\{[^}]+\}\}/, // unrendered mustache or template brackets
];

test.describe('A8: Content Integrity & Quality', () => {
  for (const route of CONTENT_ROUTES) {
    test(`[A8-CONTENT-${route}] Quality and placeholder scan on ${route}`, async ({ safetyPage }) => {
      const { page, safety } = safetyPage;
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      if (safety.isBlockedByCloudflare) {
        test.skip(true, `URL ${route} blocked by Cloudflare challenge`);
      }

      // Extract visible page text
      const visibleText = await page.evaluate(() => document.body.innerText || '');

      // Assert absence of forbidden placeholder tokens
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (route === '/legal/impressum' && pattern.source.includes('Provided upon')) {
          continue; // Impressum known owner decision
        }
        const match = visibleText.match(pattern);
        expect(match, `Forbidden content token "${pattern}" found on ${route}: ${match ? match[0] : ''}`).toBeNull();
      }

      // Check for empty sections
      const emptySections = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('section, main > div, article'));
        return sections
          .filter((s) => {
            // Must have some text or image child
            const hasText = (s.textContent || '').trim().length > 0;
            const hasMedia = s.querySelector('img, svg, video, canvas') !== null;
            return !hasText && !hasMedia;
          })
          .map((s) => s.className || s.tagName);
      });

      expect(emptySections.length, `Empty section(s) detected on ${route}: ${emptySections.join(', ')}`).toBe(0);
    });
  }
});
