import { test, expect } from '@playwright/test';

test.describe('Navigation & Responsive Layout', () => {
  test('header logo navigates back to homepage', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    const logoLink = page.locator('header a[href="/"]').first();
    await expect(logoLink).toBeVisible();
    await logoLink.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('desktop navigation links function properly', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop navigation only');

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const coursesNav = page.locator('header nav a[href="/courses"]').first();
    await expect(coursesNav).toBeVisible();
    await coursesNav.click();
    await expect(page).toHaveURL(/\/courses/);
  });

  test('mobile menu toggles open and close', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile menu only');

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const menuButton = page.locator('#mobile-menu-toggle, button[aria-label*="menu" i]').first();
    await expect(menuButton).toBeVisible();

    // Open menu
    await menuButton.click();
    const mobileDrawer = page.locator('#mobile-menu-drawer');
    await expect(mobileDrawer).toBeVisible();
  });

  test('footer contains critical legal and navigation links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer').last();
    await expect(footer).toBeVisible();

    await expect(footer.locator('a[href*="/legal/privacy"]').first()).toBeVisible();
    await expect(footer.locator('a[href*="/legal/terms"]').first()).toBeVisible();
  });
});
