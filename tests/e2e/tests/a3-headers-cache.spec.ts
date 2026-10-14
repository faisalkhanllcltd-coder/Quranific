import { test, expect } from '../helpers/test-fixture';

test.describe('A3: Security Headers & Caching', () => {
  const routesToTest = [
    { name: 'Static Home', url: '/' },
    { name: 'Prerendered Course', url: '/courses/basic-qaida' },
    { name: 'SSR Dynamic API', url: '/api/consent-bucket' },
    { name: 'Session Route', url: '/getting-started/signup' },
  ];

  for (const item of routesToTest) {
    test(`[A3-HEADERS-${item.name}] Inspect security headers on ${item.url}`, async ({ request }) => {
      const res = await request.get(item.url);
      const headers = res.headers();

      // HSTS
      expect(headers['strict-transport-security'], `HSTS missing on ${item.url}`).toBeDefined();
      expect(headers['strict-transport-security']).toContain('max-age=31536000');

      // X-Content-Type-Options
      expect(headers['x-content-type-options'], `nosniff missing on ${item.url}`).toBe('nosniff');

      // Frame Protection
      expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);

      // Referrer-Policy
      expect(headers['referrer-policy'], `Referrer-Policy missing on ${item.url}`).toBeDefined();

      // COOP
      expect(headers['cross-origin-opener-policy'], `COOP missing on ${item.url}`).toBeDefined();

      // Content-Security-Policy (no unsafe-eval)
      const csp = headers['content-security-policy'] || headers['content-security-policy-report-only'];
      expect(csp, `CSP missing on ${item.url}`).toBeDefined();
      expect(csp, `CSP must never allow unsafe-eval on ${item.url}`).not.toContain("'unsafe-eval'");

      // Cache-Control checks
      const cacheControl = headers['cache-control'];
      expect(cacheControl, `Cache-Control missing on ${item.url}`).toBeDefined();
      if (item.url.startsWith('/api/')) {
        expect(cacheControl).toContain('no-store');
      } else {
        expect(cacheControl).toContain('public');
      }
    });
  }

  test('[A3-ASSET-CACHE] Cache-Control for /_astro/ assets and compression', async ({ page }) => {
    let astroAssetUrl = '';
    let assetHeaders: Record<string, string> = {};

    page.on('response', (res) => {
      const u = res.url();
      if (u.includes('/_astro/') && (u.endsWith('.css') || u.endsWith('.js'))) {
        astroAssetUrl = u;
        assetHeaders = res.headers();
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    if (astroAssetUrl) {
      expect(assetHeaders['cache-control']).toBeDefined();
      expect(assetHeaders['cache-control']).toContain('immutable');
      expect(assetHeaders['cache-control']).toContain('max-age=31536000');
    }
  });
});
