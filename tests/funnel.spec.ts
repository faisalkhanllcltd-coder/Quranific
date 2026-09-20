import { test, expect } from '@playwright/test';

test.describe('Signup Funnel E2E', () => {
  test('should render fields, validate, and complete step 1 submission', async ({ page }) => {
    // Set mock session cookie so /getting-started/complete allows entry
    const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8788';
    await page.context().addCookies([
      {
        name: 'q_session',
        value: 'mock-jwt-session-token',
        url: baseURL,
      },
    ]);

    // Mock Cloudflare Turnstile script to cleanly provide mock token
    await page.route('https://challenges.cloudflare.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.turnstile = {
            render: (el, opts) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'cf-turnstile-response';
              input.value = 'mock-e2e-turnstile-pass-token';
              const target = typeof el === 'string' ? document.querySelector(el) : el;
              target?.appendChild(input);
              if (opts && typeof opts.callback === 'function') {
                opts.callback('mock-e2e-turnstile-pass-token');
              }
              return 'mock-widget-id';
            },
            reset: () => {},
            getResponse: () => 'mock-e2e-turnstile-pass-token',
          };
        `,
      });
    });

    // Intercept registration API response to isolate and test the client-side intake pipeline
    await page.route('**/api/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': 'q_session=mock-jwt-session-token; Path=/',
        },
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/getting-started/signup');
    await page.waitForLoadState('networkidle');

    // Verify Step 1 fields
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const phoneInput = page.locator('input[name="whatsapp"]');
    const countryInput = page.locator('input[name="country"]');
    const consentCheckbox = page.locator('input[name="guardianConsent"]');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(countryInput).toBeVisible();

    // Interact with form
    await nameInput.fill('Test Parent');
    await emailInput.fill('test@example.com');
    await phoneInput.fill('+1234567890');
    await countryInput.fill('United States');
    await consentCheckbox.check();

    await expect(nameInput).toHaveValue('Test Parent');
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(phoneInput).toHaveValue('+1234567890');
    await expect(countryInput).toHaveValue('United States');

    // Mock Turnstile token injection in test environment without touching prod code
    await page.evaluate(() => {
      let input = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'cf-turnstile-response';
        document.body.appendChild(input);
      }
      input.value = 'mock-e2e-turnstile-pass-token';
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Assert transition to Step 2 (/getting-started/complete)
    await page.waitForURL(/\/getting-started\/complete/);
    expect(page.url()).toContain('/getting-started/complete');
  });
});
