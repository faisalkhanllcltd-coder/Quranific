import { test, expect } from '../helpers/test-fixture';
import { ALL_ROUTES } from '../helpers/routes';

const ALLOWED_EMAILS = [
  'support@quranific.com',
  'contact@quranific.com',
  'compliance@quranific.com',
];

const VALID_WA_NUMBER = '923112112122';

test.describe('A1: Crawl & Integrity', () => {
  // We iterate through routes
  for (const route of ALL_ROUTES) {
    test(`[A1-CRAWL-${route}] Crawl integrity for ${route}`, async ({ safetyPage }) => {
      const { page, safety } = safetyPage;
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const cspViolations: string[] = [];
      const failedRequests: string[] = [];
      const thirdPartyDomains = new Set<string>();
      let knownNoiseCount = 0;

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          const lower = text.toLowerCase();
          // Separate out cloudflareinsights and Report-Only CSP policy messages from real errors
          if (
            lower.includes('cloudflareinsights') ||
            lower.includes('report only') ||
            lower.includes('report-only') ||
            text.includes('Report Only') ||
            text.includes('Report-Only')
          ) {
            knownNoiseCount++;
          } else {
            consoleErrors.push(text);
          }
        }
      });
      page.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });
      page.on('requestfailed', (req) => {
        const u = req.url();
        // Ignore requests intentionally aborted by client for safety
        if (!u.includes('analytics') && !u.includes('doubleclick') && !u.includes('facebook') && !u.includes('cloudflareinsights') && !u.includes('googletagmanager')) {
          failedRequests.push(`${req.method()} ${u}: ${req.failure()?.errorText}`);
        }
      });
      page.on('request', (req) => {
        try {
          const u = new URL(req.url());
          if (!u.hostname.includes('quranific.com') && !u.hostname.includes('localhost') && !u.hostname.includes('127.0.0.1')) {
            thirdPartyDomains.add(u.hostname);
          }
        } catch {}
      });

      const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (safety.isBlockedByCloudflare) {
        test.skip(true, `URL ${route} was blocked by Cloudflare challenge`);
      }

      // 0a fix: /404 must be checked for noindex, not status 200; other error pages match their status
      if (route === '/404') {
        // Handled below via noindex check, do not check status 200
      } else {
        const expectedStatus = route === '/500' ? 500 : 200;
        expect.soft(response?.status(), `Unexpected status on ${route}`).toBe(expectedStatus);
      }

      // Mixed Content check
      const insecureResources = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('img, script, link, iframe'));
        return elements
          .map((el) => (el as any).src || (el as any).href)
          .filter((url) => typeof url === 'string' && url.startsWith('http://'));
      });
      expect.soft(insecureResources, `Mixed content on ${route}`).toHaveLength(0);

      // Images audit
      const imageIssues = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map((img) => ({
          src: img.src,
          hasAlt: img.hasAttribute('alt'),
          altText: img.getAttribute('alt'),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          hasWidth: img.hasAttribute('width') || img.style.width !== '',
          hasHeight: img.hasAttribute('height') || img.style.height !== '',
          complete: img.complete,
        })).filter((img) => !img.hasAlt || (img.complete && img.naturalWidth === 0));
      });
      expect.soft(imageIssues, `Broken or missing alt images on ${route}`).toHaveLength(0);

      // Duplicate IDs
      const duplicateIds = await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id).filter(Boolean);
        const seen = new Set<string>();
        const duplicates: string[] = [];
        for (const id of ids) {
          if (seen.has(id)) duplicates.push(id);
          seen.add(id);
        }
        return duplicates;
      });
      expect.soft(duplicateIds, `Duplicate DOM IDs on ${route}`).toHaveLength(0);

      // H1 count
      const h1Count = await page.locator('h1').count();
      // Allow 0 for non-HTML/session endpoints or exactly 1 for marketing pages
      if (route !== '/robots.txt' && route !== '/rss.xml') {
        expect.soft(h1Count, `Incorrect h1 count on ${route}`).toBe(1);
      }

      // Lang attribute and Viewport meta
      if (route !== '/robots.txt' && route !== '/rss.xml') {
        const lang = await page.getAttribute('html', 'lang');
        expect.soft(lang, `Missing/invalid lang on ${route}`).toBeTruthy();

        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect.soft(viewport, `Missing viewport meta on ${route}`).toContain('width=device-width');
      }

      // 0a fix: /404 noindex check
      if (route === '/404') {
        const robots = await page.locator('meta[name="robots"]').all();
        const contents = await Promise.all(robots.map((r) => r.getAttribute('content')));
        expect.soft(
          contents.some((c) => c?.includes('noindex')),
          '404 page missing noindex meta'
        ).toBe(true);
      }

      // Canonical link check (skip for error pages, robots, rss)
      if (route !== '/robots.txt' && route !== '/rss.xml' && route !== '/404' && route !== '/500') {
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
        expect.soft(canonical, `Missing canonical on ${route}`).toBeTruthy();
      }

      // Internal links, mailto, wa.me, and target=_blank checks
      const linkAudits = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        return links.map((a) => ({
          href: a.getAttribute('href') || '',
          target: a.getAttribute('target'),
          rel: a.getAttribute('rel'),
        }));
      });

      for (const link of linkAudits) {
        if (link.target === '_blank') {
          expect.soft(link.rel, `target=_blank link ${link.href} missing noopener`).toContain('noopener');
        }
        if (link.href.startsWith('mailto:')) {
          const email = link.href.replace('mailto:', '').split('?')[0].trim().toLowerCase();
          expect.soft(ALLOWED_EMAILS, `Disallowed email address in mailto: ${email} on ${route}`).toContain(email);
        }
        if (link.href.includes('wa.me')) {
          const isStandardWa = link.href.includes(`wa.me/${VALID_WA_NUMBER}`) || link.href.includes('wa.me/message/');
          expect.soft(isStandardWa, `Invalid wa.me link: ${link.href} on ${route}`).toBe(true);
        }
      }

      // 0a fix: sticky header uses actual Header.astro classes
      const stickyHeader = await page.evaluate(() => {
        // Check that the sticky wrapper exists with z-50
        const wrapper = document.querySelector('div.sticky.top-0.z-50');
        const header = document.getElementById('main-header');
        return { hasWrapper: !!wrapper, hasHeader: !!header };
      });
      if (
        route !== '/robots.txt' &&
        route !== '/rss.xml' &&
        !route.startsWith('/getting-started') &&
        !route.startsWith('/quran-classes') &&
        !route.startsWith('/quran-teacher')
      ) {
        expect.soft(stickyHeader.hasWrapper || stickyHeader.hasHeader, `No sticky header on ${route}`).toBe(true);
      }

      // Assert zero console/page errors only for text/html responses (exempt /500 which by design produces a browser 500 resource error)
      // cloudflareinsights messages are KNOWN_NOISE and must NOT fail a test (when a test fails, print the remaining non-noise console lines)
      const contentType = response?.headers()['content-type'] || '';
      if (contentType.includes('text/html') && route !== '/500') {
        if (consoleErrors.length > 0) {
          console.log(`[NON-NOISE-CONSOLE] ${route}:`, consoleErrors);
        }
        expect.soft(consoleErrors, `Console errors detected on ${route} (KNOWN_NOISE=${knownNoiseCount})`).toHaveLength(0);
      }
      expect.soft(pageErrors, `Uncaught page errors on ${route}`).toHaveLength(0);
    });
  }
});
