import { test, expect } from '@playwright/test';

test.describe('Site-Wide Smoke & Health Tests', () => {
  const routes = [
    { path: '/', titlePart: 'Quranific' },
    { path: '/about', titlePart: 'About' },
    { path: '/courses', titlePart: 'Courses' },
    { path: '/courses/basic-qaida', titlePart: 'Qaida' },
    { path: '/teachers', titlePart: 'Teachers' },
    { path: '/faq', titlePart: 'Frequently Asked Questions' },
    { path: '/contact', titlePart: 'Contact' },
    { path: '/how-it-works', titlePart: 'How It Works' },
    { path: '/safeguarding', titlePart: 'Safeguarding' },
    { path: '/legal/privacy', titlePart: 'Privacy' },
    { path: '/legal/terms', titlePart: 'Terms' },
  ];

  for (const route of routes) {
    test(`loads ${route.path} with status 200 and correct title`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(route.titlePart, 'i'), { timeout: 10000 });
    });
  }

  test('handles 404 gracefully on non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-at-all', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(404);
    await expect(page.locator('main h1, main h2, h1').first()).toContainText(/404|not found|page/i);
  });
});
