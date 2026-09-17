/**
 * Environment Prerequisite:
 * TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
 * must be present in the .env or wrangler.toml for the valid token tests to pass locally.
 */

import { test, expect } from '@playwright/test';

try {
  process.loadEnvFile?.('.env');
} catch {
  // .env may not be present in CI environments where variables are set directly
}

test.describe('PT-1: Contact API (/api/contact)', () => {
  test('Test 1: POST missing email -> Expect 400', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        firstName: 'Ahmad',
        lastName: 'Khan',
        message: 'Assalamu Alaikum, I have an inquiry.',
        'cf-turnstile-response': '1x00000000000000000000AA',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('Test 2: POST invalid Turnstile token -> Expect 400', async ({ request }) => {
    if (process.env.TURNSTILE_SECRET_KEY === '1x0000000000000000000000000000000AA') {
      test.skip();
    }

    const response = await request.post('/api/contact', {
      data: {
        firstName: 'Ahmad',
        lastName: 'Khan',
        email: 'ahmad.khan@example.com',
        message: 'Assalamu Alaikum, I have an inquiry.',
        'cf-turnstile-response': 'invalid-token-here',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('Security check failed');
  });

  test('Test 3: POST valid payload with Turnstile test token 1x00000000000000000000AA -> Expect 200', async ({
    request,
  }) => {
    const response = await request.post('/api/contact', {
      data: {
        firstName: 'Ahmad',
        lastName: 'Khan',
        email: 'ahmad.khan@example.com',
        message: 'Assalamu Alaikum, I have an inquiry.',
        'cf-turnstile-response': '1x00000000000000000000AA',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true });
  });

  test('Test 4 (Rate Limit): Loop 5 POST requests forcing CF-Connecting-IP: test-contact-ip', async ({
    request,
  }) => {
    const ip = 'test-contact-ip';

    for (let i = 1; i <= 5; i++) {
      const response = await request.post('/api/contact', {
        headers: {
          'CF-Connecting-IP': ip,
        },
        data: {
          firstName: 'Rate',
          lastName: 'Limit',
          email: 'ratelimit@example.com',
          message: `Rate limit test attempt ${i}`,
          'cf-turnstile-response': '1x00000000000000000000AA',
        },
      });

      if (i < 5) {
        expect(response.status()).not.toBe(429);
      } else {
        expect(response.status()).toBe(429);
        const body = await response.json();
        expect(body).toHaveProperty('error');
      }
    }
  });
});
