import { test, expect } from '../helpers/test-fixture';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [360, 390, 768, 1024, 1280, 1440, 1920];
const SAMPLE_ROUTES = [
  '/',
  '/courses/basic-qaida',
  '/tuition-fee',
  '/getting-started/signup',
  '/contact',
  '/quran-classes/for-kids',
];

const SCREENSHOT_DIR = path.join(process.env.TEMP || 'C:\\Users\\pak\\AppData\\Local\\Temp', 'qe2e', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe('A4: Layout & Viewport Audit', () => {
  for (const vpWidth of VIEWPORTS) {
    test(`[A4-LAYOUT-VP-${vpWidth}] Layout and container audit at width ${vpWidth}px`, async ({ safetyPage }) => {
      test.setTimeout(180000);
      const { page, safety } = safetyPage;
      await page.setViewportSize({ width: vpWidth, height: 900 });

      for (const route of SAMPLE_ROUTES) {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        if (safety.isBlockedByCloudflare) continue;

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth + 1;
        });
        expect(overflow, `Horizontal overflow detected on ${route} at ${vpWidth}px`).toBe(false);

        // Container computed style audit
        const containerMetrics = await page.evaluate(() => {
          const container = document.querySelector('.quranific-container');
          if (!container) return null;
          const style = window.getComputedStyle(container);
          return {
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
            maxWidth: style.maxWidth,
          };
        });

        if (containerMetrics) {
          // Rule in global.css:
          // @utility quranific-container { @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; }
          // max-w-7xl is 80rem = 1280px
          // px-4 is 16px (<640), sm:px-6 is 24px (640-1023), lg:px-8 is 32px (>=1024)
          let expectedPadding = '16px';
          if (vpWidth >= 1024) expectedPadding = '32px';
          else if (vpWidth >= 640) expectedPadding = '24px';

          expect(containerMetrics.paddingLeft, `Unexpected container paddingLeft on ${route} at ${vpWidth}px`).toBe(expectedPadding);
          expect(containerMetrics.maxWidth, `Unexpected container maxWidth on ${route} at ${vpWidth}px`).toBe('1280px');
        }

        // Save reference screenshot at 390 and 1440
        if (vpWidth === 390 || vpWidth === 1440) {
          const cleanName = route.replace(/\//g, '_') || 'home';
          const shotPath = path.join(SCREENSHOT_DIR, `${cleanName}_${vpWidth}.png`);
          await page.screenshot({ path: shotPath, fullPage: true });
        }
      }
    });
  }
});
