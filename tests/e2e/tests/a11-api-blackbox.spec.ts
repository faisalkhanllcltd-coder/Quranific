import { test, expect } from '../helpers/test-fixture';

test.describe('A11: Production API Black-Box Security & Contract Tests', () => {
  test('[A11-API-UNAUTH-RETRY-QUEUE] /api/internal/retry-queue unauth returns 401', async ({ request }) => {
    // GET unauth
    const getRes = await request.get('/api/internal/retry-queue', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(getRes.status()).toBe(401);

    // POST unauth
    const postRes = await request.post('/api/internal/retry-queue', {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(postRes.status()).toBe(401);
  });

  test('[A11-API-CORS-GEO-CONSENT] CORS on consent-bucket and geo-currency allows only quranific.com', async ({ request }) => {
    // Check consent-bucket
    const resConsent = await request.get('/api/consent-bucket');
    expect(resConsent.headers()['access-control-allow-origin']).toBe('https://quranific.com');

    // Check geo-currency
    const resGeo = await request.get('/api/geo-currency');
    expect(resGeo.headers()['access-control-allow-origin']).toBe('https://quranific.com');

  });

  test('[A11-API-NEWSLETTER-NEGATIVE] Negative POSTs on /api/newsletter return 400 with friendly message', async ({ request }) => {
    // Test 1: Empty body {}
    const resEmpty = await request.post('/api/newsletter', {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(resEmpty.status()).toBe(400);
    const bodyEmpty = await resEmpty.json();
    expect(bodyEmpty.error).toBeDefined();

    // Test 2: Email only (missing Turnstile token)
    const resEmailOnly = await request.post('/api/newsletter', {
      headers: { 'Content-Type': 'application/json' },
      data: { email: 'probe-test@example.com' },
    });
    expect(resEmailOnly.status()).toBe(400);
    const bodyEmailOnly = await resEmailOnly.json();
    expect(bodyEmailOnly.error).toBeDefined();

    // Headers check: Cache-Control no-store & X-Robots-Tag noindex
    const headers = resEmailOnly.headers();
    expect(headers['cache-control']).toContain('no-store');
    expect(headers['x-robots-tag']).toContain('noindex');
  });

  test('[A11-API-CONTACT-NEGATIVE] Negative POST on /api/contact returns 400', async ({ request }) => {
    const res = await request.post('/api/contact', {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('[A11-API-CONFIRM-GARBAGE] /api/newsletter/confirm with garbage/missing token returns friendly 400', async ({ request }) => {
    // Missing token
    const resMissing = await request.get('/api/newsletter/confirm');
    expect(resMissing.status()).toBe(400);
    const textMissing = await resMissing.text();
    expect(textMissing).toContain('Invalid Request');

    // Garbage token
    const resGarbage = await request.get('/api/newsletter/confirm?token=garbage.token.123');
    expect(resGarbage.status()).toBe(400);
    const textGarbage = await resGarbage.text();
    expect(textGarbage).toContain('Invalid Link');
  });

  test('[A11-API-UNSUBSCRIBE-GARBAGE] /api/newsletter/unsubscribe with garbage token returns 400', async ({ request }) => {
    const res = await request.get('/api/newsletter/unsubscribe?token=garbage_token');
    expect(res.status()).toBe(400);
    const text = await res.text();
    expect(text).toContain('Invalid Link');
  });
});
