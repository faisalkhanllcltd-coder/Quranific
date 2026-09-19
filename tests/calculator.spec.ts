import { test, expect } from '@playwright/test';

test.describe('Pricing Calculator E2E', () => {
  test('should update UI and navigation URL based on selections', async ({ page }) => {
    await page.goto('/tuition-fee');

    // Wait for the calculator to be visible
    const calculatorHeading = page.locator('h3:has-text("Tuition Calculator")');
    await expect(calculatorHeading).toBeVisible();

    // Verify default state
    await expect(page.locator('button:has-text("30 min").bg-emerald-600')).toBeVisible();
    await expect(page.locator('button:has-text("3").bg-emerald-600')).toBeVisible();

    // Click 40 min session length
    await page.click('button:has-text("40 min")');
    // Verify it became active
    await expect(page.locator('button:has-text("40 min").bg-emerald-600')).toBeVisible();

    // Click 2 sessions per week
    await page.click('button:has-text("2")');
    await expect(page.locator('button:has-text("2").bg-emerald-600')).toBeVisible();

    // Click continue
    const cta = page.locator('a:has-text("Continue to Registration")');
    await expect(cta).toBeVisible();

    // Check href attributes directly or click and check URL
    await cta.click();

    // Verify URL params passed
    await page.waitForURL(/\/getting-started\/signup/);
    const url = new URL(page.url());
    expect(url.searchParams.get('dur')).toBe('40');
    expect(url.searchParams.get('sess')).toBe('2');
  });
});
