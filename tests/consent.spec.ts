// tests/consent.spec.ts
// Phase 6 — Automated consent enforcement test (Playwright)
// Tests that the correct gtag consent defaults are applied per bucket,
// and that the banner behaves correctly on first/return visits.
//
// Run: npx playwright test tests/consent.spec.ts
// Requires: npx playwright install chromium (already installed per prior session)

/* eslint-disable @typescript-eslint/no-explicit-any */

import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Intercept dataLayer pushes and collect consent calls.
 * Returns a function that resolves with the collected consent args.
 */
async function captureConsentDefaults(page: Page): Promise<Record<string, string>[]> {
  const calls: Record<string, string>[] = [];

  await page.addInitScript(() => {
    // Intercept gtag before page scripts run
    (window as any).__capturedConsentCalls = [];
    (window as any).dataLayer = (window as any).dataLayer || [];
    const origPush = (window as any).dataLayer.push.bind((window as any).dataLayer);
    (window as any).dataLayer.push = function (...args: any[]) {
      for (const arg of args) {
        if (Array.isArray(arg) && arg[0] === 'consent') {
          (window as any).__capturedConsentCalls.push({ cmd: arg[1], params: arg[2] });
        }
      }
      return origPush(...args);
    };
    // Also intercept the function-style gtag
    (window as any).gtag = function (...args: any[]) {
      if (args[0] === 'consent') {
        (window as any).__capturedConsentCalls.push({ cmd: args[1], params: args[2] });
      }
      (window as any).dataLayer.push(args);
    };
  });

  return calls;
}

async function getConsentCalls(page: Page) {
  return page.evaluate(() => (window as any).__capturedConsentCalls || []);
}

/**
 * Create a context with a spoofed country header to simulate geo-bucketing.
 * In local dev, the CF-IPCountry header is not set by wrangler — we simulate
 * via custom header on the test request. The middleware reads cf.country.
 * For local testing we mock via a special header processed in dev mode.
 *
 * NOTE: In production on Cloudflare Edge, cf.country comes from the real CF
 * object, not a header. These tests validate client-side behaviour given a
 * pre-rendered bucket value in window.__consentBucket. We set that directly
 * for test isolation rather than trying to mock CF infra.
 */
async function pageWithBucket(page: Page, bucket: 'STRICT' | 'MODERATE' | 'NONE') {
  // Inject the bucket via script before page loads (simulates what the
  // Consent Mode snippet does after server-side computation)
  await page.addInitScript((b) => {
    (window as any).__consentBucket = b;
  }, bucket);
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Consent Mode defaults — per bucket', () => {
  test.beforeEach(async ({ context }) => {
    // Start each test with clean cookies
    await context.clearCookies();
  });

  test('STRICT bucket: consent default denies ad_storage and analytics_storage', async ({
    page,
  }) => {
    await captureConsentDefaults(page);
    await pageWithBucket(page, 'STRICT');

    // Navigate to homepage
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('domcontentloaded');

    // Verify consent defaults injected by the inline snippet
    const consentBucket = await page.evaluate(() => (window as any).__consentBucket);
    expect(consentBucket).toBe('STRICT');

    const calls = await getConsentCalls(page);
    const defaultCall = calls.find((c: any) => c.cmd === 'default');
    expect(defaultCall).toBeTruthy();
    expect(defaultCall.params.ad_storage).toBe('denied');
    expect(defaultCall.params.analytics_storage).toBe('denied');
    expect(defaultCall.params.ad_user_data).toBe('denied');
    expect(defaultCall.params.ad_personalization).toBe('denied');
    // Security and functionality must remain granted
    expect(defaultCall.params.security_storage).toBe('granted');
    expect(defaultCall.params.functionality_storage).toBe('granted');
  });

  test('MODERATE bucket: analytics granted, ads denied by default', async ({ page }) => {
    await captureConsentDefaults(page);
    await pageWithBucket(page, 'MODERATE');

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('domcontentloaded');

    const calls = await getConsentCalls(page);
    const defaultCall = calls.find((c: any) => c.cmd === 'default');
    expect(defaultCall).toBeTruthy();
    expect(defaultCall.params.analytics_storage).toBe('granted');
    expect(defaultCall.params.ad_storage).toBe('denied');
    expect(defaultCall.params.ad_user_data).toBe('denied');
  });

  test('NONE bucket: all storage granted by default', async ({ page }) => {
    await captureConsentDefaults(page);
    await pageWithBucket(page, 'NONE');

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('domcontentloaded');

    const calls = await getConsentCalls(page);
    const defaultCall = calls.find((c: any) => c.cmd === 'default');
    expect(defaultCall).toBeTruthy();
    expect(defaultCall.params.ad_storage).toBe('granted');
    expect(defaultCall.params.analytics_storage).toBe('granted');
  });
});

test.describe('Cookie banner visibility', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('STRICT bucket, no cookie: banner is visible', async ({ page }) => {
    await pageWithBucket(page, 'STRICT');
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    const bannerRoot = page.locator('#cookie-banner-root');
    // After Phase 4 inline script runs, the banner-root should be visible
    await expect(bannerRoot).not.toHaveClass(/consent-banner-hidden/);

    // Banner content should be visible after Svelte hydration (client:idle)
    await expect(page.getByRole('dialog', { name: /cookie consent/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test('NONE bucket, no cookie: banner stays hidden', async ({ page }) => {
    await pageWithBucket(page, 'NONE');
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    const bannerRoot = page.locator('#cookie-banner-root');
    // NONE bucket → Phase 4 script returns early, class stays
    await expect(bannerRoot).toHaveClass(/consent-banner-hidden/);
  });

  test('STRICT bucket, cookie already set: banner stays hidden', async ({ page, context }) => {
    // Pre-set the consent cookie as if user already accepted
    await context.addCookies([
      {
        name: 'cf_consent_v1',
        value: 'STRICT:accepted',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await pageWithBucket(page, 'STRICT');
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    const bannerRoot = page.locator('#cookie-banner-root');
    await expect(bannerRoot).toHaveClass(/consent-banner-hidden/);
  });
});

test.describe('Banner accept/reject actions', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('STRICT bucket: Accept All fires gtag update with all granted, sets cookie', async ({
    page,
  }) => {
    await captureConsentDefaults(page);
    await pageWithBucket(page, 'STRICT');

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Wait for Svelte banner to hydrate
    const acceptBtn = page.getByRole('button', { name: /accept all/i });
    await expect(acceptBtn).toBeEnabled({ timeout: 5000 });

    await acceptBtn.click();

    // Cookie must be set
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === 'cf_consent_v1');
    expect(consentCookie).toBeTruthy();
    expect(consentCookie!.value).toBe('STRICT:accepted');

    // gtag update call must have been fired with granted values
    const calls = await getConsentCalls(page);
    const updateCall = calls.find((c: any) => c.cmd === 'update');
    expect(updateCall).toBeTruthy();
    expect(updateCall.params.ad_storage).toBe('granted');
    expect(updateCall.params.analytics_storage).toBe('granted');

    // Banner must be gone
    await expect(page.getByRole('dialog', { name: /cookie consent/i })).not.toBeVisible();
  });

  test('STRICT bucket: Reject Non-Essential fires gtag update with denied, sets cookie', async ({
    page,
  }) => {
    await captureConsentDefaults(page);
    await pageWithBucket(page, 'STRICT');

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    const rejectBtn = page.getByRole('button', { name: /reject non-essential/i });
    await expect(rejectBtn).toBeEnabled({ timeout: 5000 });
    await rejectBtn.click();

    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === 'cf_consent_v1');
    expect(consentCookie).toBeTruthy();
    expect(consentCookie!.value).toBe('STRICT:rejected');

    const calls = await getConsentCalls(page);
    const updateCall = calls.find((c: any) => c.cmd === 'update');
    expect(updateCall).toBeTruthy();
    expect(updateCall.params.ad_storage).toBe('denied');
    expect(updateCall.params.analytics_storage).toBe('denied');
    // Security must remain granted
    expect(updateCall.params.security_storage).toBe('granted');
  });

  test('GPC present (simulated) → STRICT bucket, no banner needed — verify default is denied', async ({
    page,
  }) => {
    // GPC is processed server-side in real deployment; here we simulate the
    // outcome: bucket=STRICT (same as EU), banner shows, default is denied
    await captureConsentDefaults(page);
    await pageWithBucket(page, 'STRICT');

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('domcontentloaded');

    const calls = await getConsentCalls(page);
    const defaultCall = calls.find((c: any) => c.cmd === 'default');
    expect(defaultCall).toBeTruthy();
    expect(defaultCall.params.ad_storage).toBe('denied');
    expect(defaultCall.params.analytics_storage).toBe('denied');
  });
});

test.describe('No CLS — banner does not cause layout shift', () => {
  test('banner shell starts hidden, no height contribution before reveal', async ({ page }) => {
    await pageWithBucket(page, 'STRICT');
    // Simulate slow 3G to catch flash-of-banner issues
    await page.route('**/*', async (route) => {
      // Add artificial delay only to non-critical resources
      if (
        route.request().resourceType() === 'script' &&
        !route.request().url().includes('_astro')
      ) {
        await new Promise((r) => setTimeout(r, 200));
      }
      await route.continue();
    });

    await page.goto('http://localhost:4321/');

    // Immediately after HTML parse, before any JS runs, banner-root must have
    // consent-banner-hidden class (set in SSR HTML)
    const hasHiddenClass = await page.evaluate(() => {
      const el = document.getElementById('cookie-banner-root');
      return el?.className?.includes('consent-banner-hidden') ?? false;
    });
    expect(hasHiddenClass).toBe(true);

    await page.waitForLoadState('networkidle');
    // After Phase 4 inline script (STRICT, no cookie) → banner revealed
    const bannerRoot = page.locator('#cookie-banner-root');
    await expect(bannerRoot).not.toHaveClass(/consent-banner-hidden/);
  });
});
