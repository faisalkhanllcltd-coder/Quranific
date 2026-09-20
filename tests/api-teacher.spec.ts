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

const validTeacherPayload = {
  fullName: 'Sheikh Ahmad Al-Mansoor',
  email: 'sheikh.ahmad@example.com',
  whatsapp: '+447123456789',
  resumeLink: 'https://example.com/resumes/sheikh-ahmad.pdf',
  ijazah: 'Hafs an Asim (Mutqan)',
  alim: 'Al-Azhar University Graduate',
  experience: '7 years teaching Tajweed and Qiraat',
  english: 'Fluent',
  arabic: 'Native',
  'cf-turnstile-response': '1x00000000000000000000AA',
};

const isRemote = Boolean(
  process.env.BASE_URL &&
  !process.env.BASE_URL.includes('127.0.0.1') &&
  !process.env.BASE_URL.includes('localhost')
);

test.describe('PT-1: Apply Teacher API (/api/apply-teacher)', () => {
  test('Test 1: POST missing email -> Expect 400', async ({ request }) => {
    const payloadWithoutEmail = { ...validTeacherPayload };
    delete (payloadWithoutEmail as { email?: string }).email;

    let response = await request.post('/api/apply-teacher', {
      data: payloadWithoutEmail,
    });

    if (response.status() === 500) {
      // Retry if Miniflare dev server dropped the internal workerd connection
      response = await request.post('/api/apply-teacher', {
        data: payloadWithoutEmail,
      });
    }

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('Test 2: POST invalid Turnstile token -> Expect 400', async ({ request }) => {
    if (!isRemote && process.env.TURNSTILE_SECRET_KEY === '1x0000000000000000000000000000000AA') {
      test.skip();
    }

    const response = await request.post('/api/apply-teacher', {
      data: {
        ...validTeacherPayload,
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
    if (isRemote) {
      test.skip(
        true,
        'Live production uses real Turnstile secret key which rejects dummy test tokens'
      );
    }

    const response = await request.post('/api/apply-teacher', {
      data: validTeacherPayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true });
  });

  test('Test 4 (Rate Limit): Loop 5 POST requests forcing CF-Connecting-IP: test-teacher-ip', async ({
    request,
  }) => {
    if (isRemote) {
      test.skip(true, 'Live Cloudflare edge proxy strips spoofed CF-Connecting-IP headers');
    }

    const ip = `test-teacher-ip-${Date.now()}`;

    for (let i = 1; i <= 5; i++) {
      const response = await request.post('/api/apply-teacher', {
        headers: {
          'CF-Connecting-IP': ip,
        },
        data: {
          ...validTeacherPayload,
          fullName: `Teacher Candidate ${i}`,
          email: `teacher.candidate${i}@example.com`,
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
