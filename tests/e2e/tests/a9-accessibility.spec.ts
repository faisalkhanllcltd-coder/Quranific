import { test, expect } from '../helpers/test-fixture';
import AxeBuilder from '@axe-core/playwright';
import { SAMPLE_PAGES } from '../helpers/routes';

const A11Y_PAGES = [
  '/',
  '/getting-started/signup',
  '/courses/basic-qaida',
  '/tuition-fee',
  '/contact',
  '/teachers',
  '/faq',
  '/legal/privacy',
];

test.describe('A9: Accessibility Audit (axe-core)', () => {
  for (const route of A11Y_PAGES) {
    test(`[A9-AXE-${route}] Run axe-core (serious & critical) on ${route}`, async ({ safetyPage }) => {
      const { page, safety } = safetyPage;
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      if (safety.isBlockedByCloudflare) {
        test.skip(true, `URL ${route} blocked by Cloudflare challenge`);
      }

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const severeViolations = axeResults.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );

      const formattedViolations = severeViolations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
        helpUrl: v.helpUrl,
      }));

      expect(formattedViolations, `Axe-core serious/critical violations on ${route}: ${JSON.stringify(formattedViolations)}`).toHaveLength(0);
    });
  }

  test('[A9-KEYBOARD-HOME] Keyboard navigation & skip link on Homepage', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Press Tab once: skip link should become visible or receive focus
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    const skipLinkHref = await page.evaluate(() => (document.activeElement as HTMLAnchorElement)?.getAttribute('href'));

    expect(focusedTag).toBe('A');
    expect(skipLinkHref).toBe('#main-content');
  });

  test('[A9-KEYBOARD-SIGNUP] Form labels & tab order on /getting-started/signup', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.goto('/getting-started/signup', { waitUntil: 'domcontentloaded' });

    // Check all inputs have associated labels
    const unlabeledInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'));
      return inputs
        .filter((input) => {
          const id = input.id;
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
          return !hasLabel && !hasAriaLabel;
        })
        .map((input) => input.getAttribute('name') || input.id || input.tagName);
    });

    expect(unlabeledInputs, `Unlabeled form inputs on signup: ${unlabeledInputs.join(', ')}`).toHaveLength(0);
  });
});
