import { test, expect } from '@playwright/test';

test.describe('Pricing Calculator Interactive Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quran-classes/for-kids');
    const calculator = page.locator('#pricing-calculator');
    await calculator.scrollIntoViewIfNeeded();
    await expect(calculator).toBeVisible();
  });

  test('interactively updates fee when changing frequency and duration', async ({ page }) => {
    const calculator = page.locator('#pricing-calculator');
    const feeDisplay = calculator.getByTestId('monthly-fee');
    await expect(feeDisplay).toBeVisible();

    const fiveTimesBtn = calculator.locator('button').filter({ hasText: '5×' });

    // Wait for Svelte client:visible hydration to complete using toPass assertion
    await expect(async () => {
      await fiveTimesBtn.click();
      await expect(fiveTimesBtn).toHaveClass(/bg-emerald-700|bg-purple-700/);
    }).toPass({ timeout: 10000 });

    // Price should reflect $60/mo
    await expect(feeDisplay).toContainText('$60');

    // Switch session length to 40 min
    const fortyMinBtn = calculator.locator('button').filter({ hasText: '40 min' });
    await fortyMinBtn.click();

    // Price for 40 min / 5x is $80/mo
    await expect(feeDisplay).toContainText('$80');

    // Verify CTA button href updates dynamically
    const ctaLink = calculator.locator('a[href*="/funnel/signup"]');
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute('href', /duration=40/);
    await expect(ctaLink).toHaveAttribute('href', /sessions=5/);
  });

  test('switches currency seamlessly and updates price symbol', async ({ page }) => {
    const calculator = page.locator('#pricing-calculator');
    const feeDisplay = calculator.getByTestId('monthly-fee');
    await expect(feeDisplay).toBeVisible();

    const twoTimesBtn = calculator.locator('button').filter({ hasText: '2×' });
    // Warm up hydration with a click
    await expect(async () => {
      await twoTimesBtn.click();
      await expect(twoTimesBtn).toHaveClass(/bg-emerald-700|bg-purple-700/);
    }).toPass({ timeout: 10000 });

    const currencySelect = calculator
      .locator('select')
      .filter({ has: page.locator('option[value="GBP"]') });
    await currencySelect.selectOption('GBP');
    await expect(feeDisplay).toContainText('£');

    await currencySelect.selectOption('EUR');
    await expect(feeDisplay).toContainText('€');
  });
});
