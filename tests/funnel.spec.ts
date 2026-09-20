import { test, expect } from '@playwright/test';

test.describe('Signup Funnel E2E', () => {
  test('should render multi-step funnel fields', async ({ page }) => {
    await page.goto('/getting-started/signup');

    // Verify Step 1 fields
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const phoneInput = page.locator('input[name="whatsapp"]');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();

    // Interact with form
    await nameInput.fill('Test Parent');
    await emailInput.fill('test@example.com');
    await phoneInput.fill('+1234567890');

    // We skip actual form submission in E2E since it relies on Turnstile
    // and live API endpoints.
    // D1/CRM syncing is skipped entirely per instructions.
  });
});
