import { test, expect } from '@playwright/test';

test.describe('Pricing Calculator E2E', () => {
  test('should update UI and navigation URL based on selections', async ({ page }) => {
    await page.goto('/courses/basic-qaida');

    // Scroll calculator into view so Astro's client:visible hydrates it
    const calc = page.locator('#pricing-calculator');
    await calc.scrollIntoViewIfNeeded();
    await page.locator('#pricing-calculator[data-hydrated="true"]').waitFor({ timeout: 10000 });

    // Verify default state (.bg-emerald-700 active tokens)
    await expect(page.locator('button:has-text("30 min").bg-emerald-700')).toBeVisible();
    await expect(page.locator('button:has-text("3×").bg-emerald-700')).toBeVisible();

    // Click 40 min session length
    await page.click('button:has-text("40 min")');
    await expect(page.locator('button:has-text("40 min").bg-emerald-700')).toBeVisible();

    // Click 2 sessions per week
    await page.click('button:has-text("2×")');
    await expect(page.locator('button:has-text("2×").bg-emerald-700')).toBeVisible();

    // Click continue
    const cta = page.locator('a:has-text("Continue to Registration")');
    await expect(cta).toBeVisible();

    // Click and check URL
    await cta.click();

    // Verify URL params passed
    await page.waitForURL(/\/getting-started\/signup/);
    const url = new URL(page.url());
    expect(url.searchParams.get('duration')).toBe('40');
    expect(url.searchParams.get('sessions')).toBe('2');
  });
});
