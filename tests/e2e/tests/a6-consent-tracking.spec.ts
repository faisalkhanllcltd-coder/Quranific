import { test, expect } from '../helpers/test-fixture';

test.describe('A6: Consent & Attribution Tracking', () => {
  test('[A6-CONSENT-GPC] Real fetch with Sec-GPC: 1 returns STRICT', async ({ request }) => {
    const res = await request.get('/api/consent-bucket', {
      headers: {
        'Sec-GPC': '1',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.hasGPC).toBe(true);
    expect(body.bucket).toBe('STRICT');
  });

  test('[A6-CONSENT-STRICT-FRESH] STRICT bucket fresh visit: 8s zero tracking requests', async ({ safetyPage }) => {
    const { page } = safetyPage;
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('googletagmanager.com') ||
        url.includes('google-analytics.com') ||
        url.includes('doubleclick.net') ||
        url.includes('googleadservices.com')
      ) {
        trackingRequests.push(url);
      }
    });

    await page.route('**/api/consent-bucket', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bucket: 'STRICT', hasGPC: false }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const banner = page.locator('#cookie-banner-root [role="dialog"]').first();
    await expect(banner).toBeVisible();

    await page.waitForTimeout(8000);

    expect(
      trackingRequests,
      `Unexpected tracking requests before consent in STRICT: ${trackingRequests.join(', ')}`
    ).toEqual([]);
  });

  test('[A6-CONSENT-GPC-FRESH] Real Sec-GPC: 1 header fresh visit: 8s zero tracking requests', async ({ page }) => {
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('googletagmanager.com') ||
        url.includes('google-analytics.com') ||
        url.includes('doubleclick.net') ||
        url.includes('googleadservices.com')
      ) {
        trackingRequests.push(url);
      }
    });

    await page.setExtraHTTPHeaders({
      'Sec-GPC': '1',
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const banner = page.locator('#cookie-banner-root [role="dialog"]').first();
    await expect(banner).toBeVisible();

    await page.waitForTimeout(8000);

    expect(
      trackingRequests,
      `Unexpected tracking requests with Sec-GPC: 1: ${trackingRequests.join(', ')}`
    ).toEqual([]);
  });

  test('[A6-CONSENT-ACCEPT-ALL] Accept all -> gtm.js requested exactly once, consent update granted before it', async ({ safetyPage }) => {
    const { page } = safetyPage;
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('googletagmanager.com') ||
        url.includes('google-analytics.com') ||
        url.includes('doubleclick.net') ||
        url.includes('googleadservices.com')
      ) {
        trackingRequests.push(url);
      }
    });

    await page.route('**/api/consent-bucket', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bucket: 'STRICT', hasGPC: false }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const banner = page.locator('#cookie-banner-root [role="dialog"]').first();
    await expect(banner).toBeVisible();

    const acceptBtn = banner.locator('button:has-text("Accept All")');
    await acceptBtn.click();
    await expect(banner).toBeHidden();

    // gtm.js requested exactly once
    await expect
      .poll(
        () => trackingRequests.filter((u) => u.includes('googletagmanager.com/gtm.js')).length,
        {
          message: 'Expected gtm.js to be requested exactly once',
          timeout: 8000,
        }
      )
      .toBe(1);

    // Verify consent update occurred before gtm.start / gtm.js in dataLayer
    const dlOrder = await page.evaluate(() => {
      const w = window as unknown as Record<string, unknown>;
      const dl = (w.dataLayer as Array<Record<string, unknown> | [string, string, Record<string, unknown>]>) || [];
      let updateIdx = -1;
      let gtmIdx = -1;
      for (let i = 0; i < dl.length; i++) {
        const item = dl[i];
        if (Array.isArray(item) && item[0] === 'consent' && item[1] === 'update' && item[2]?.analytics_storage === 'granted') {
          updateIdx = i;
        }
        if (!Array.isArray(item) && (item['event'] === 'gtm.js' || item['gtm.start'])) {
          gtmIdx = i;
        }
      }
      return { updateIdx, gtmIdx };
    });

    expect(dlOrder.updateIdx, 'Consent update not found in dataLayer').toBeGreaterThanOrEqual(0);
    expect(dlOrder.gtmIdx, 'gtm.js event not found in dataLayer').toBeGreaterThanOrEqual(0);
    expect(dlOrder.updateIdx, 'Consent update must precede gtm.js').toBeLessThan(dlOrder.gtmIdx);
  });

  test('[A6-CONSENT-REJECT-ALL] Reject all in a fresh context -> zero requests for 8 s', async ({ safetyPage }) => {
    const { page } = safetyPage;
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('googletagmanager.com') ||
        url.includes('google-analytics.com') ||
        url.includes('doubleclick.net') ||
        url.includes('googleadservices.com')
      ) {
        trackingRequests.push(url);
      }
    });

    await page.route('**/api/consent-bucket', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bucket: 'STRICT', hasGPC: false }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const banner = page.locator('#cookie-banner-root [role="dialog"]').first();
    await expect(banner).toBeVisible();

    const rejectBtn = banner.locator('button:has-text("Reject Non-Essential")');
    await rejectBtn.click();
    await expect(banner).toBeHidden();

    await page.waitForTimeout(8000);
    expect(
      trackingRequests,
      `Unexpected tracking requests after reject all: ${trackingRequests.join(', ')}`
    ).toEqual([]);
  });

  test('[A6-CONSENT-CUSTOMIZE-ANALYTICS] Customize with analytics only -> loads', async ({ safetyPage }) => {
    const { page } = safetyPage;
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com/gtm.js')) {
        trackingRequests.push(url);
      }
    });

    await page.route('**/api/consent-bucket', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bucket: 'STRICT', hasGPC: false }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const banner = page.locator('#cookie-banner-root [role="dialog"]').first();
    await expect(banner).toBeVisible();

    const analyticsOnlyBtn = banner.locator('button:has-text("Analytics Only")');
    await analyticsOnlyBtn.click();
    await expect(banner).toBeHidden();

    await expect
      .poll(
        () => trackingRequests.some((u) => u.includes('googletagmanager.com/gtm.js')),
        {
          message: 'Expected gtm.js to load on customize with analytics only',
          timeout: 8000,
        }
      )
      .toBe(true);
  });

  test('[A6-CONSENT-RETURNING-VISITOR] Returning visitor with stored accept -> gtm.js within 5 s of load', async ({ context, safetyPage }) => {
    const { page } = safetyPage;
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com/gtm.js')) {
        trackingRequests.push(url);
      }
    });

    await context.addCookies([
      {
        name: 'cf_consent_v1',
        value: 'STRICT:accepted',
        domain: 'quranific.com',
        path: '/',
      },
    ]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect
      .poll(
        () => trackingRequests.some((u) => u.includes('googletagmanager.com/gtm.js')),
        {
          message: 'Expected gtm.js within 5 s of load for returning visitor with stored accept',
          timeout: 5000,
        }
      )
      .toBe(true);
  });

  test('[A6-CONSENT-NAVIGATE-SECOND-PAGE] Navigating to a second page after accept still loads it', async ({ context, safetyPage }) => {
    const { page } = safetyPage;
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com/gtm.js')) {
        trackingRequests.push(url);
      }
    });

    await context.addCookies([
      {
        name: 'cf_consent_v1',
        value: 'STRICT:accepted',
        domain: 'quranific.com',
        path: '/',
      },
    ]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect
      .poll(() => trackingRequests.some((u) => u.includes('googletagmanager.com/gtm.js')), {
        timeout: 5000,
      })
      .toBe(true);

    // Navigate to a second page
    await page.goto('/courses', { waitUntil: 'domcontentloaded' });
    const isGtmLoaded = await page.evaluate(() => {
      const w = window as unknown as Record<string, unknown>;
      return !!w.__gtmLoaded;
    });
    expect(isGtmLoaded, 'GTM must remain loaded on navigation to second page').toBe(true);
  });

  test('[A6-CONSENT-MODERATE-MOCK] MODERATE bucket loads gtm.js without consent as before', async ({ safetyPage }) => {
    const { page } = safetyPage;
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const u = req.url();
      if (u.includes('googletagmanager.com')) {
        trackingRequests.push(u);
      }
    });

    await page.route('**/api/consent-bucket', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bucket: 'MODERATE', hasGPC: false }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect
      .poll(() => trackingRequests.some((u) => u.includes('googletagmanager.com')), {
        message: 'Expected GTM request in MODERATE bucket',
        timeout: 8000,
      })
      .toBe(true);
  });

  test('[A6-CONSENT-NONE-MOCK] NONE bucket silently grants and loads gtm.js without consent as before', async ({ safetyPage }) => {
    const { page } = safetyPage;
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const u = req.url();
      if (u.includes('googletagmanager.com') || u.includes('google-analytics.com')) {
        trackingRequests.push(u);
      }
    });

    await page.route('**/api/consent-bucket', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bucket: 'NONE', hasGPC: false }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const bannerRoot = page.locator('#cookie-banner-root');
    const isHidden = await bannerRoot.evaluate((el) => el.classList.contains('consent-banner-hidden') || el.style.display === 'none');
    expect(isHidden).toBe(true);

    await expect
      .poll(() => trackingRequests.some((u) => u.includes('googletagmanager.com')), {
        message: 'Expected GTM request in NONE bucket',
        timeout: 8000,
      })
      .toBe(true);
  });

  test('[A6-ATTRIBUTION-UTM-GCLID] Intent landing page with UTM & GCLID carries to signup', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.goto('/quran-classes/for-kids?gclid=TEST_GCLID_123&utm_source=test_source&utm_campaign=test_camp', {
      waitUntil: 'domcontentloaded',
    });

    const signupCta = page.locator('a[href*="signup"]').first();
    await signupCta.click();
    await page.waitForURL('**/getting-started/signup**');

    const formValues = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return null;
      const data = new FormData(form as HTMLFormElement);
      return Object.fromEntries(data.entries());
    });

    const currentUrl = page.url();
    const hasParamsInUrl = currentUrl.includes('gclid=TEST_GCLID_123') || currentUrl.includes('utm_source=test_source');

    expect(
      hasParamsInUrl || (formValues && (formValues.gclid === 'TEST_GCLID_123' || formValues.utm_source === 'test_source')),
      'Attribution parameters should be carried to signup URL or form inputs'
    ).toBe(true);
  });
});
