import { test, expect } from '@playwright/test';

test.describe('Intent Landing Pages & Conversion Funnels', () => {
  const funnels = [
    {
      path: '/quran-classes/for-kids',
      headingMatch: /child|kids|look/i,
      expectedIntent: 'kids',
    },
    {
      path: '/quran-classes/for-adults',
      headingMatch: /adult|busy|professionals|schedule/i,
      expectedIntent: 'adults',
    },
    {
      path: '/quran-classes/for-women',
      headingMatch: /women|sisters|female/i,
      expectedIntent: 'women',
    },
    {
      path: '/quran-teacher/for-kids',
      headingMatch: /teacher|tutor|kids|child/i,
      expectedIntent: 'kids',
    },
    {
      path: '/quran-teacher/for-adults',
      headingMatch: /teacher|tutor|adult/i,
      expectedIntent: 'adults',
    },
    {
      path: '/quran-teacher/for-women',
      headingMatch: /teacher|female|ustadha/i,
      expectedIntent: 'women',
    },
  ];

  for (const funnel of funnels) {
    test(`renders funnel ${funnel.path} with valid CTAs and trust elements`, async ({ page }) => {
      const response = await page.goto(funnel.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Verify hero heading
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(funnel.headingMatch);

      // Verify primary CTA links
      const ctas = page.locator(
        'a[href*="/enroll"], a[href*="/funnel/signup"], a[href*="/booking"]'
      );
      await expect(ctas.first()).toBeVisible();

      // Verify Trust/Guarantee or Testimonial section presence
      await expect(
        page
          .locator('section')
          .filter({ hasText: /guarantee|risk|results|reviews|students|vetted/i })
          .first()
      ).toBeVisible();
    });
  }

  test("women's funnel applies purple theme accents", async ({ page }) => {
    await page.goto('/quran-classes/for-women', { waitUntil: 'domcontentloaded' });

    // Check that purple classes or purple styling tokens exist
    const purpleElements = page.locator('[class*="purple"]');
    await expect(purpleElements.first()).toBeVisible();
  });
});
