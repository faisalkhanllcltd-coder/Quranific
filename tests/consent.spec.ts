// tests/consent.spec.ts
// Phase R2 — Playwright consent enforcement tests.
// Updated for async /api/consent-bucket fetch architecture.
//
// Run: npx playwright test tests/consent.spec.ts
// Requires: dev server running at http://localhost:4321 (npm run dev)
//
// NOTE ON GTAG ASSERTION STRATEGY:
// The gtag() 'update' calls are made by our source code (consent.ts, CookieBanner.svelte,
// Phase 4 inline script) which is unit-tested separately. In E2E tests, we verify the
// OBSERVABLE OUTCOMES (banner visibility, cookie value, no banner flash) rather than
// intercepting internal gtag calls, since the gtag function is defined in an is:inline
// snippet before Playwright's addInitScript and the Arguments-based dataLayer.push
// makes reliable interception complex.
//
// The unit tests in tests/consent-unit.test.ts cover the getConsentBucket logic (19/19).
// These Playwright tests cover the browser integration layer.

import { test, expect, type Page } from '@playwright/test';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE = 'http://localhost:4321';
const COOKIE_NAME = 'cf_consent_v1';
const BANNER_WAIT = 12_000; // ms — client:idle means banner appears after browser idle

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Mock /api/consent-bucket response without needing Cloudflare geo.
 * Must call before page.goto() to intercept the fetch made by the inline script.
 */
async function mockBucket(page: Page, bucket: 'STRICT' | 'MODERATE' | 'NONE', hasGPC = false) {
  await page.route(/\/api\/consent-bucket/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ bucket, hasGPC }),
    });
  });
}

/**
 * Wait for the banner dialog to appear (accounts for client:idle + async fetch).
 */
async function waitForBanner(page: Page) {
  await expect(page.getByRole('dialog', { name: /cookie consent/i })).toBeVisible({
    timeout: BANNER_WAIT,
  });
}

// ─── Gate R1 — Snippet byte-identity ─────────────────────────────────────────

test.describe('Gate R1 — Consent snippet is bucket-agnostic', () => {
  test('built page consent snippet has no server-injected bucket variable', async ({ page }) => {
    // Use the request API (not page.goto) to get raw HTML text without navigation.
    const response = await page.request.get(`${BASE}/`);
    const html = await response.text();

    expect(html).not.toContain('consentDefaultsJson');
    expect(html).not.toContain('const consentBucket =');
    expect(html).not.toContain('window.__consentBucket');

    expect(html).toContain("ad_storage: 'denied'");
    expect(html).toContain("analytics_storage: 'denied'");
    expect(html).toContain('wait_for_update: 500');
    expect(html).toContain('/api/consent-bucket');
    expect(html).toContain('consent-banner-hidden');
  });

  test('homepage and course page have byte-identical consent snippets', async ({ page }) => {
    async function extractSnippet(url: string) {
      const r = await page.goto(url);
      const html = await r!.text();
      const start = html.indexOf('Consent Mode v2');
      const end = html.indexOf('Google Tag Manager');
      return html.substring(start, end).trim();
    }

    const s1 = await extractSnippet(`${BASE}/`);
    const s2 = await extractSnippet(`${BASE}/courses/basic-qaida`);

    expect(s1).toBeTruthy();
    expect(s1).toEqual(s2);
  });
});

// ─── Gate R1 — /api/consent-bucket endpoint ──────────────────────────────────

test.describe('Gate R1 — /api/consent-bucket integration', () => {
  test('endpoint returns JSON with bucket and hasGPC, Cache-Control: no-store', async ({
    request,
  }) => {
    const response = await request.get(`${BASE}/api/consent-bucket`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.headers()['cache-control']).toBe('no-store');

    const data = await response.json();
    expect(data).toHaveProperty('bucket');
    expect(data).toHaveProperty('hasGPC');
    expect(['STRICT', 'MODERATE', 'NONE']).toContain(data.bucket);
    expect(typeof data.hasGPC).toBe('boolean');
  });

  test('two rapid requests both return no-store, no age header (not cached)', async ({
    request,
  }) => {
    const r1 = await request.get(`${BASE}/api/consent-bucket`);
    const r2 = await request.get(`${BASE}/api/consent-bucket`);

    expect(r1.headers()['cache-control']).toBe('no-store');
    expect(r2.headers()['cache-control']).toBe('no-store');

    // 'age' header is set by CDN when serving a cached response
    const age1 = r1.headers()['age'];
    const age2 = r2.headers()['age'];
    const hasAgeHit =
      (age1 !== undefined && parseInt(age1) > 0) || (age2 !== undefined && parseInt(age2) > 0);
    expect(hasAgeHit).toBe(false);

    // x-cache, if present, must not indicate HIT
    const xCache1 = r1.headers()['x-cache'] ?? '';
    const xCache2 = r2.headers()['x-cache'] ?? '';
    expect(xCache1).not.toContain('HIT');
    expect(xCache2).not.toContain('HIT');
  });
});

// ─── Gate 4 — Banner visibility ──────────────────────────────────────────────

test.describe('Gate 4 — Banner visibility', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('STRICT bucket, no cookie: banner appears after async fetch + Svelte hydration', async ({
    page,
  }) => {
    await mockBucket(page, 'STRICT');

    await page.goto(`${BASE}/`);
    await waitForBanner(page);

    // Banner root should no longer be hidden
    const bannerRoot = page.locator('#cookie-banner-root');
    await expect(bannerRoot).not.toHaveClass(/consent-banner-hidden/);

    // Consent snippet in HTML must be universally denied (bucket-agnostic)
    const html = await page.content();
    expect(html).toContain("ad_storage: 'denied'");
    expect(html).toContain('wait_for_update: 500');
  });

  test('NONE bucket, no cookie: banner stays hidden (silent grant, no banner shown)', async ({
    page,
  }) => {
    await mockBucket(page, 'NONE');

    await page.goto(`${BASE}/`);
    // Wait for async fetch to resolve + short settle time
    await page.waitForTimeout(3000);

    const bannerRoot = page.locator('#cookie-banner-root');
    // NONE: silent grant — banner stays hidden permanently
    await expect(bannerRoot).toHaveClass(/consent-banner-hidden/);

    // No banner dialog should appear
    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();
  });

  test('returning visitor (STRICT:accepted cookie): banner stays hidden', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: COOKIE_NAME,
        value: 'STRICT:accepted',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto(`${BASE}/`);
    // PATH A is synchronous — no network fetch required
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const bannerRoot = page.locator('#cookie-banner-root');
    await expect(bannerRoot).toHaveClass(/consent-banner-hidden/);

    // Banner dialog must not appear for returning accepted visitor
    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();
  });

  test('returning visitor (STRICT:rejected cookie): banner stays hidden', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: COOKIE_NAME,
        value: 'STRICT:rejected',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const bannerRoot = page.locator('#cookie-banner-root');
    await expect(bannerRoot).toHaveClass(/consent-banner-hidden/);

    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();
  });

  test('fetch failure: fail safe — banner shown with STRICT fallback', async ({ page }) => {
    await page.route(/\/api\/consent-bucket/, async (route) => {
      await route.abort('failed');
    });

    await page.goto(`${BASE}/`);
    await waitForBanner(page);

    const bannerRoot = page.locator('#cookie-banner-root');
    await expect(bannerRoot).not.toHaveClass(/consent-banner-hidden/);
  });
});

// ─── Gate 4 — No Flash of Banner ─────────────────────────────────────────────

test.describe('Gate 4 — No flash of banner on throttled load', () => {
  test('banner-root has consent-banner-hidden in raw SSR HTML (no-JS check)', async ({ page }) => {
    await mockBucket(page, 'STRICT');
    const response = await page.goto(`${BASE}/`);
    const html = await response!.text();

    // Class must be present in server-rendered HTML
    expect(html).toContain('consent-banner-hidden');
    expect(html).toContain('id="cookie-banner-root"');
  });
});

// ─── Gate 5 — Banner interaction after hydration ──────────────────────────────

test.describe('Gate 5 — Banner interaction after hydration', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('accept button appears and is enabled after Svelte hydration completes', async ({
    page,
  }) => {
    await mockBucket(page, 'STRICT');
    await page.goto(`${BASE}/`);
    await waitForBanner(page);

    const acceptBtn = page.getByRole('button', { name: /accept all/i });
    await expect(acceptBtn).toBeEnabled({ timeout: BANNER_WAIT });
  });
});

// ─── Gate 6 — Banner actions ──────────────────────────────────────────────────

test.describe('Gate 6 — Banner actions', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('STRICT: Accept All → cookie STRICT:accepted, banner hidden', async ({ page }) => {
    await mockBucket(page, 'STRICT');

    await page.goto(`${BASE}/`);
    await waitForBanner(page);

    const acceptBtn = page.getByRole('button', { name: /accept all/i });
    await expect(acceptBtn).toBeEnabled({ timeout: BANNER_WAIT });
    await acceptBtn.click();

    // Cookie must be set correctly
    const cookies = await page.context().cookies();
    const c = cookies.find((c) => c.name === COOKIE_NAME);
    expect(c).toBeTruthy();
    expect(c!.value).toBe('STRICT:accepted');

    // Banner must disappear
    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();
  });

  test('STRICT: Reject Non-Essential → cookie STRICT:rejected, banner hidden', async ({ page }) => {
    await mockBucket(page, 'STRICT');

    await page.goto(`${BASE}/`);
    await waitForBanner(page);

    const rejectBtn = page.getByRole('button', { name: /reject non-essential/i });
    await expect(rejectBtn).toBeEnabled({ timeout: BANNER_WAIT });
    await rejectBtn.click();

    const cookies = await page.context().cookies();
    const c = cookies.find((c) => c.name === COOKIE_NAME);
    expect(c).toBeTruthy();
    expect(c!.value).toBe('STRICT:rejected');

    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();
  });

  test('MODERATE: Got It → cookie MODERATE:accepted, banner hidden', async ({ page }) => {
    await mockBucket(page, 'MODERATE');

    await page.goto(`${BASE}/`);
    await waitForBanner(page);

    // MODERATE shows "Got it" button (calls acceptAll)
    const gotItBtn = page.getByRole('button', { name: /got it/i });
    await expect(gotItBtn).toBeEnabled({ timeout: BANNER_WAIT });
    await gotItBtn.click();

    const cookies = await page.context().cookies();
    const c = cookies.find((c) => c.name === COOKIE_NAME);
    expect(c).toBeTruthy();
    expect(c!.value).toBe('MODERATE:accepted');

    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();
  });

  test('click Accept All then reload: banner does NOT reappear (cookie persists)', async ({
    page,
  }) => {
    await mockBucket(page, 'STRICT');

    await page.goto(`${BASE}/`);
    await waitForBanner(page);

    await page.getByRole('button', { name: /accept all/i }).click();
    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();

    // Reload — returning visitor (PATH A), banner must NOT reappear
    await mockBucket(page, 'STRICT'); // re-register route mock for second load
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();
  });

  test('Protected surface: [intent] and course pages have same snippet as homepage', async ({
    page,
  }) => {
    async function extractSnippet(url: string) {
      const r = await page.goto(url);
      const html = await r!.text();
      const start = html.indexOf("ad_storage: 'denied'");
      const end = html.indexOf('wait_for_update');
      return html.substring(start, end + 30).trim();
    }

    const home = await extractSnippet(`${BASE}/`);
    const intent = await extractSnippet(`${BASE}/quran-classes/for-adults`);
    const course = await extractSnippet(`${BASE}/courses/basic-qaida`);

    expect(home).toBeTruthy();
    expect(home).toEqual(intent);
    expect(home).toEqual(course);
  });
});
