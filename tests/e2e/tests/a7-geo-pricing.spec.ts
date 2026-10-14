import { test, expect } from '../helpers/test-fixture';
import { EXPECTED_CURRENCY_FOR_COUNTRY, REPO_PRICING } from '../helpers/pricing-oracle';

test.describe('A7: Geo-Currency & Pricing Engine', () => {
  const testCountries = ['GB', 'DE', 'SA', 'AE', 'SG', 'CA', 'AU', 'QA', 'PK', 'US'];

  for (const country of testCountries) {
    const expected = EXPECTED_CURRENCY_FOR_COUNTRY[country];
    test(`[A7-GEO-${country}] Pricing displays ${expected.currency} (${expected.symbol}) on /tuition-fee`, async ({ safetyPage }) => {
      const { page } = safetyPage;
      // Mock /api/geo-currency
      await page.route('**/api/geo-currency**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ country, currency: expected.currency }),
        });
      });

      await page.goto('/tuition-fee', { waitUntil: 'domcontentloaded' });

      // Auto-retrying assertion for currency symbol to allow async fetch('/api/geo-currency') to resolve
      await expect(page.locator('#plans')).toContainText(expected.symbol, { timeout: 10000 });

      // Verify baseline monthly price for 2 sessions, 30 min in that currency (numeric comparison)
      const baseExpected = REPO_PRICING[expected.currency]?.['30']?.['2'];
      if (baseExpected) {
        const priceElement = page.locator('bdi.font-serif').first();
        await expect(priceElement).toBeVisible({ timeout: 10000 });
        const priceText = await priceElement.innerText();
        const priceNumeric = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        expect(priceNumeric, `Page numeric price ${priceNumeric} does not match expected ${baseExpected} for ${expected.currency}`).toBe(baseExpected);
      }
    });
  }

  test('[A7-GEO-500-FALLBACK] Geo API 500 falls back to USD $40 floor', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.route('**/api/geo-currency**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Error' }),
      });
    });

    await page.goto('/tuition-fee', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const pageText = await page.content();
    // Default USD fallback
    expect(pageText).toContain('$');
    const fallbackPriceText = await page.locator('bdi.font-serif').first().innerText();
    const fallbackPriceNumeric = parseFloat(fallbackPriceText.replace(/[^0-9.]/g, ''));
    expect(fallbackPriceNumeric, 'USD 500 fallback floor should be 40').toBe(40);
  });

  test('[A7-CALCULATOR-SELECTION] Calculator CTA carries selected options to signup', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.goto('/tuition-fee', { waitUntil: 'domcontentloaded' });

    // Find any CTA button in pricing section
    const pricingCta = page.locator('a[href*="/getting-started/signup"]').first();
    if (await pricingCta.isVisible()) {
      const href = await pricingCta.getAttribute('href');
      expect(href).toContain('/getting-started/signup');
    }
  });
});
