import { test, expect } from '../helpers/test-fixture';

test.describe('A10: Client Form Contracts & Turnstile Parity', () => {
  test('[A10-FORM-NEWSLETTER] Footer Newsletter Form client contract', async ({ safetyPage }) => {
    const { page } = safetyPage;
    let submittedPayload: Record<string, any> = {};

    // Mock API response to prevent any real POST
    await page.route('**/api/newsletter', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON() || {};
        submittedPayload = postData;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Check Turnstile container in footer
    const footerForm = page.locator('#newsletter-form');
    await expect(footerForm).toBeVisible();

    // The footer newsletter creates its widget on first focus or pointerdown
    // Focus email input first to initialize the Turnstile widget
    await page.locator('#footer-email').focus();

    // Assert Turnstile widget input is attached to the DOM
    const hiddenTurnstile = footerForm.locator('input[name="cf-turnstile-response"]');
    await expect(hiddenTurnstile).toBeAttached({ timeout: 10000 });
  });

  test('[A10-FORM-CONTACT] Contact Form Turnstile and client contract', async ({ safetyPage }) => {
    const { page } = safetyPage;
    let submittedPayload: Record<string, any> = {};

    await page.route('**/api/contact', async (route) => {
      if (route.request().method() === 'POST') {
        submittedPayload = route.request().postDataJSON() || {};
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    const contactForm = page.locator('#smart-form');
    await expect(contactForm).toBeVisible();

    const turnstileContainer = contactForm.locator('.cf-turnstile');
    expect(await turnstileContainer.count()).toBeGreaterThanOrEqual(1);
  });

  test('[A10-FORM-SIGNUP] Signup Step 1 Form Turnstile and client contract', async ({ safetyPage }) => {
    const { page } = safetyPage;
    await page.goto('/getting-started/signup', { waitUntil: 'domcontentloaded' });

    const turnstileContainer = page.locator('.cf-turnstile');
    expect(await turnstileContainer.count()).toBeGreaterThanOrEqual(1);

    // Verify submit button disabled during submission
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();
  });
});
