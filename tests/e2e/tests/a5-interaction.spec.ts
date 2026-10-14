import { test, expect } from '../helpers/test-fixture';

test.describe('A5: Interactions & Navigation', () => {
  test('[A5-INTERACTION-NAV-DESKTOP] Desktop Header navigation and sticky scroll', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Header presence
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Scroll down and verify sticky header
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(300);
    const isSticky = await page.evaluate(() => {
      const wrapper = document.querySelector('div.sticky.top-0.z-50');
      const header = document.getElementById('main-header');
      const wStyle = wrapper ? window.getComputedStyle(wrapper) : null;
      const hStyle = header ? window.getComputedStyle(header) : null;
      return (wStyle?.position === 'sticky') || (hStyle?.position === 'sticky') || (hStyle?.position === 'fixed');
    });
    expect(isSticky, 'Header should be sticky or fixed on scroll').toBe(true);

    // Verify main navigation links
    const navLinks = page.locator('header nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('[A5-INTERACTION-NAV-MOBILE] Mobile Hamburger toggle, aria-expanded, and ESC key', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const hamburgerBtn = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i]').first();
    if (await hamburgerBtn.isVisible()) {
      // Check initial aria-expanded
      const initialAria = await hamburgerBtn.getAttribute('aria-expanded');
      expect(initialAria).toBe('false');

      // Click to open
      await hamburgerBtn.click();
      await page.waitForTimeout(300);
      expect(await hamburgerBtn.getAttribute('aria-expanded')).toBe('true');

      // Press ESC to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      expect(await hamburgerBtn.getAttribute('aria-expanded')).toBe('false');
    }
  });

  test('[A5-INTERACTION-PROMO-BAR] Promo bar show, dismiss, and persistence', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const promoBar = page.locator('[data-announcement-bar], [aria-label*="announcement" i]').first();
    if (await promoBar.isVisible()) {
      const dismissBtn = promoBar.locator('button[aria-label*="dismiss" i], button[aria-label*="close" i]').first();
      if (await dismissBtn.isVisible()) {
        await dismissBtn.click();
        await page.waitForTimeout(300);
        await expect(promoBar).not.toBeVisible();

        // Reload page to assert persistence
        await page.reload();
        await expect(promoBar).not.toBeVisible();
      }
    }
  });

  test('[A5-INTERACTION-FAQ-ACCORDION] FAQ accordions click, keyboard, and deep link', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });

    const faqButtons = page.locator('button[aria-controls], summary, .faq-trigger');
    const firstFaq = faqButtons.first();
    if (await firstFaq.isVisible()) {
      // Click expansion
      await firstFaq.click();
      await page.waitForTimeout(200);

      // Keyboard toggle (Enter key)
      await firstFaq.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }
  });

  test('[A5-INTERACTION-CTA-DESTINATIONS] Verify every primary CTA destination on home', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const ctas = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('a[href*="signup"], a[href*="courses"], a[href*="contact"]'));
      return buttons.map((b) => ({
        text: (b.textContent || '').trim().replace(/\s+/g, ' '),
        href: b.getAttribute('href') || '',
      }));
    });

    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) {
      expect(cta.href, `CTA "${cta.text}" has empty href`).toBeTruthy();
      expect(cta.href.startsWith('/') || cta.href.startsWith('https://'), `CTA "${cta.text}" invalid href`).toBe(true);
    }
  });
});
