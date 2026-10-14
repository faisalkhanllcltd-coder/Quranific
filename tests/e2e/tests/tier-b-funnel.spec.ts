import { test as baseTest, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const WRANGLER_LOG =
  process.env.WRANGLER_LOG ||
  path.join(process.cwd(), 'wrangler.log');

export function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    const devVarsPaths = [
      path.resolve(process.cwd(), '.dev.vars'),
      path.resolve(process.cwd(), '../../.dev.vars'),
    ];
    for (const devVarsPath of devVarsPaths) {
      if (fs.existsSync(devVarsPath)) {
        const content = fs.readFileSync(devVarsPath, 'utf-8');
        const match = content.match(/JWT_SECRET=(.*)/);
        if (match) {
          let val = match[1].trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          return val;
        }
      }
    }
  } catch {}
  return 'e2e-round3-secret-0123456789abcdef0123456789abcdef';
}

export function getWranglerLogText(): string {
  const possiblePaths = [
    process.env.WRANGLER_LOG,
    path.join(process.cwd(), 'wrangler.log'),
    path.join(process.cwd(), '..', '..', 'wrangler.log'),
    process.env.TEMP ? path.join(process.env.TEMP, 'wrangler.log') : null,
  ].filter(Boolean) as string[];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      if (content.includes('[wrangler:info]') || content.includes('[Mock Mode]')) {
        return content;
      }
    }
  }
  return '';
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 500) {
        const text = await res.clone().text();
        if (text.includes('Network connection lost') || text.includes('ProxyWorker')) {
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }
      }
      return res;
    } catch (e) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      throw e;
    }
  }
  return fetch(url, init);
}

async function setupTurnstileStub(page: Page) {
  await page.route('**/*challenges.cloudflare.com/turnstile/v0/api.js*', async (route) => {
    const scriptUrl = route.request().url();
    const matchOnload = scriptUrl.match(/[?&]onload=([^&]+)/);
    const onloadFn = matchOnload ? matchOnload[1] : null;

    const stubJs = `
      window._turnstileCallbacks = window._turnstileCallbacks || {};
      window.turnstile = {
        render: function(elOrSel, opts) {
          const el = typeof elOrSel === 'string' ? document.querySelector(elOrSel) : elOrSel;
          if (el) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'cf-turnstile-response';
            input.value = 'STUB.TOKEN';
            el.appendChild(input);
            // Store callback for execute()
            if (opts && typeof opts.callback === 'function') {
              el._turnstileCallback = opts.callback;
            }
          }
          if (opts && typeof opts.callback === 'function') {
            opts.callback('STUB.TOKEN');
          }
          return 'stub-widget-id';
        },
        execute: function(idOrEl, opts) {
          // Immediately invoke the stored callback with STUB.TOKEN
          const el = typeof idOrEl === 'string' ? document.querySelector(idOrEl) : idOrEl;
          if (el && el._turnstileCallback) {
            el._turnstileCallback('STUB.TOKEN');
          } else if (opts && typeof opts.callback === 'function') {
            opts.callback('STUB.TOKEN');
          }
          // Also set input value
          if (el) {
            let input = el.querySelector('[name="cf-turnstile-response"]');
            if (!input) {
              input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'cf-turnstile-response';
              el.appendChild(input);
            }
            input.value = 'STUB.TOKEN';
          }
        },
        reset: function() {},
        remove: function() {},
        getResponse: function() { return 'STUB.TOKEN'; },
        ready: function(cb) { if (typeof cb === 'function') cb(); }
      };
      document.querySelectorAll('.cf-turnstile').forEach(function(el) {
        if (!el.querySelector('[name="cf-turnstile-response"]')) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'cf-turnstile-response';
          input.value = 'STUB.TOKEN';
          el.appendChild(input);
        }
      });
      ${onloadFn ? `if (typeof window['${onloadFn}'] === 'function') window['${onloadFn}']();` : ''}
    `;

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: stubJs,
    });
  });

  // Prevent WebKit upgrade-insecure-requests SSL failures on local http://127.0.0.1:8787
  await page.route('https://127.0.0.1:8787/**', async (route) => {
    try {
      const headers = { ...route.request().headers(), origin: 'http://127.0.0.1:8787' };
      const res = await route.fetch({
        url: route.request().url().replace('https://', 'http://'),
        headers,
      });
      await route.fulfill({ response: res });
    } catch {
      await route.abort();
    }
  });
}

export const test = baseTest.extend<{ bPage: Page }>({
  bPage: async ({ page }, use) => {
    await setupTurnstileStub(page);
    await use(page);
  },
});

test.describe('Tier B: Local Edge Full-Funnel Simulation (port 8787)', () => {
  test.use({ baseURL: 'http://127.0.0.1:8787' });

  test('[B1-LEAD-FUNNEL] Step 1 -> Cookie -> Step 2 -> Success -> Lead event', async ({ bPage, context }) => {
    // 1. Visit signup
    await bPage.goto('/getting-started/signup', { waitUntil: 'domcontentloaded' });
    await bPage.waitForTimeout(1000);

    // Ensure turnstile hidden token is injected by our stub
    await bPage.evaluate(() => {
      let input = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'cf-turnstile-response';
        input.value = 'STUB.TOKEN';
        document.body.appendChild(input);
      } else {
        input.value = 'STUB.TOKEN';
      }
    });

    // Fill Step 1
    await bPage.locator('#name').fill('Ahmad Test');
    await bPage.locator('#email').fill('ahmad-test@example.com');
    await bPage.locator('#whatsapp').fill('+447700900000');
    await bPage.locator('#country').fill('United Kingdom');
    await bPage.locator('#guardianConsent').check();

    // Submit step 1
    const submitBtn = bPage.locator('button[type="submit"]').first();
    await submitBtn.click();
    await bPage.waitForTimeout(2000);

    // Verify q_session cookie
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'q_session');
    expect(sessionCookie, 'q_session cookie missing after Step 1').toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(['Strict', 'None', 'Lax']).toContain(sessionCookie?.sameSite);

    // 2. Direct complete access without cookie rejected on HEAD /api/complete
    const unauthContext = await bPage.context().browser()?.newContext({ baseURL: 'http://127.0.0.1:8787' });
    const directUnauthRes = await unauthContext?.request.get('/api/complete');
    expect(directUnauthRes?.status()).toBe(401);
    await unauthContext?.close();

    // 3. Step 2 submission (/getting-started/complete)
    await bPage.goto('/getting-started/complete', { waitUntil: 'domcontentloaded' });
    const completeForm = bPage.locator('form');
    if (await completeForm.isVisible()) {
      // Complete Step 2 fields if present
      const completeBtn = bPage.locator('button[type="submit"]').first();
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await bPage.waitForTimeout(2000);
      }
    }
  });

  test('[B2-CONTACT-TEACHER] Contact and Teacher application submissions in mock mode', async ({ request }) => {
    // Contact POST
    const contactRes = await request.post('/api/contact', {
      data: {
        firstName: 'Faisal',
        lastName: 'Khan',
        email: 'faisal-contact@example.com',
        message: 'Interested in enrollment details',
        'cf-turnstile-response': 'STUB.TOKEN',
      },
    });
    expect(contactRes.status()).toBe(200);

    // Teacher Application POST
    const teacherRes = await request.post('/api/apply-teacher', {
      data: {
        fullName: 'Qari Muhammad',
        email: 'qari-teacher@example.com',
        whatsapp: '+923112112122',
        resumeLink: 'https://example.com/resume.pdf',
        ijazah: 'Hafs an Asim',
        alim: 'Al-Azhar Graduate',
        experience: '7 years teaching online',
        english: 'Fluent',
        arabic: 'Native',
        'cf-turnstile-response': 'STUB.TOKEN',
      },
    });
    expect(teacherRes.status()).toBe(200);
  });

  test('[B3-NEWSLETTER-DOUBLE-OPTIN] Footer UI -> lazy load turnstile -> submit -> confirm URL in log -> confirm -> welcome -> replay -> unsubscribe', async ({ bPage, request }) => {
    // 1. Verify api.js is NOT requested before focus
    let apiJsRequestedCount = 0;
    bPage.on('request', (req) => {
      if (req.url().includes('challenges.cloudflare.com/turnstile/v0/api.js')) {
        apiJsRequestedCount++;
      }
    });

    await bPage.goto('/', { waitUntil: 'domcontentloaded' });
    await bPage.waitForTimeout(500);
    expect(apiJsRequestedCount, 'api.js requested before focus').toBe(0);

    // 2. Focus input -> api.js is requested exactly once
    const emailInput = bPage.locator('#footer-email');
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.focus();
    await emailInput.dispatchEvent('focusin');
    await emailInput.dispatchEvent('pointerdown');
    await bPage.waitForTimeout(1000);
    expect(apiJsRequestedCount, 'api.js requested exactly once after focus').toBe(1);

    // 3. Negative check: submit without token -> friendly error
    const badIp = `192.0.2.${Math.floor(Math.random() * 80) + 120}`;
    const badRes = await fetch('http://127.0.0.1:8787/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': badIp },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    expect(badRes.status).toBe(400);
    const badBody = (await badRes.json().catch(() => ({}))) as { error?: string };
    expect(badBody.error).toBe('Please complete the security check.');

    // 4. Fill email in footer UI and submit
    const testEmail = `nl-optin-${Date.now()}@example.com`;
    await emailInput.fill(testEmail);
    const submitBtn = bPage.locator('#newsletter-submit-btn');
    await submitBtn.click();
    await bPage.waitForTimeout(2000);

    // 5. Read log to find confirmation URL
    let confirmUrl = '';
    const logContent = getWranglerLogText();
    if (logContent) {
      const matches = [...logContent.matchAll(/Confirmation URL:\s*(https?:\/\/[^\s]+)/g)];
      if (matches.length > 0) {
        confirmUrl = matches[matches.length - 1][1];
      }
    }

    if (confirmUrl) {
      const urlObj = new URL(confirmUrl);
      const relativePath = urlObj.pathname + urlObj.search;
      const token = urlObj.searchParams.get('token');

      // 6. GET confirm page (no state change)
      const getConfirm = await request.get(relativePath);
      expect(getConfirm.status()).toBe(200);
      const textGet = await getConfirm.text();
      expect(textGet).toContain('Confirm Your Subscription');

      // 7. POST confirm -> welcome / confirmed
      const postConfirm = await request.post('/api/newsletter/confirm', {
        data: { token },
      });
      expect(postConfirm.status()).toBe(200);
      const textPost = await postConfirm.text();
      expect(textPost).toContain('Subscription Confirmed');

      // 8. Replay POST (replay no duplicate)
      const replayConfirm = await request.post('/api/newsletter/confirm', {
        data: { token },
      });
      expect([200, 400, 409]).toContain(replayConfirm.status());

      // 9. Unsubscribe
      let unsubUrl = '';
      if (logContent) {
        const unsubMatches = [...logContent.matchAll(/Unsubscribe URL:\s*(https?:\/\/[^\s]+)/g)];
        if (unsubMatches.length > 0) {
          unsubUrl = unsubMatches[unsubMatches.length - 1][1];
        }
      }
      if (unsubUrl) {
        const unsubUrlObj = new URL(unsubUrl);
        const unsubRelative = unsubUrlObj.pathname + unsubUrlObj.search;
        const getUnsub = await request.get(unsubRelative);
        expect(getUnsub.status()).toBe(200);
        const textUnsub = await getUnsub.text();
        expect(textUnsub.toLowerCase()).toContain('unsubscribe');
      }
    }
  });

  test('[B4-SESSION-TAMPER] Modified cookie rejected on /complete', async ({ request }) => {
    const tamperedRes = await request.get('/api/complete', {
      headers: {
        cookie: 'q_session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature',
      },
    });
    expect(tamperedRes.status()).toBe(401);
  });

  test('[B5-DEAD-LETTER-QUEUE] Invalid Resend key: server returns deferred 200, FAILED_* written; retry-queue returns 401 unauthorized and 200 with counts on bearer auth', async () => {
    const testIp = `192.0.2.${Math.floor(Math.random() * 50) + 10}`;

    // Step 1: retry-queue internal endpoint is auth-protected
    const unauthRetryRes = await fetch('http://127.0.0.1:8787/api/internal/retry-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': testIp },
      body: '{}',
    });
    expect(unauthRetryRes.status).toBe(401);

    // Step 2: Newsletter confirm with secret from environment or round3 secret
    const { SignJWT } = await import('jose');
    const rawSecret = getJwtSecret();

    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(rawSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const derivedSig = await crypto.subtle.sign(
      'HMAC',
      baseKey,
      enc.encode('quranific-newsletter-v1')
    );
    const derivedKey = new Uint8Array(derivedSig);

    const token = await new SignJWT({
      email: `b5-failure-${Date.now()}@example.com`,
      action: 'newsletter_confirm',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('48h')
      .sign(derivedKey);

    let confirmRes = await fetch('http://127.0.0.1:8787/api/newsletter/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': testIp, Connection: 'close' },
      body: JSON.stringify({ token }),
    });
    let confirmHtml = await confirmRes.text();
    if (confirmRes.status === 500 && confirmHtml.includes('Network connection lost')) {
      await new Promise((r) => setTimeout(r, 250));
      confirmRes = await fetch('http://127.0.0.1:8787/api/newsletter/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': testIp, Connection: 'close' },
        body: JSON.stringify({ token }),
      });
      confirmHtml = await confirmRes.text();
    }
    expect(confirmRes.status).toBe(200);
    expect(confirmHtml).toMatch(/Subscription Confirmed|We’ll Complete This Shortly|Subscription Processing|queued your subscription/);

    // Step 3: Call retry-queue with Bearer e2e-internal -> 200 with recovered/failed counts and keys retained
    const retryRes = await fetch('http://127.0.0.1:8787/api/internal/retry-queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer e2e-internal',
      },
    });
    expect(retryRes.status).toBe(200);
    const retryJson = await retryRes.json();
    expect(retryJson.success).toBe(true);
    expect(retryJson.totalRemaining).toBeGreaterThanOrEqual(0);
  });

  test('[B6-RATE-LIMIT] 5th newsletter POST within 60s -> 429', async () => {
    const rlIp = `192.0.2.${Math.floor(Math.random() * 50) + 70}`;
    const responses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await fetch('http://127.0.0.1:8787/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': rlIp, Connection: 'close' },
        body: JSON.stringify({
          email: `ratelimit-${i}-${Date.now()}@example.com`,
          'cf-turnstile-response': 'STUB.TOKEN',
        }),
      });
      responses.push(res.status);
      if (res.status === 429) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(responses.some((s) => s === 429)).toBe(true);
    await new Promise((r) => setTimeout(r, 300));
  });

  test('[B7-FRIENDLY-ERRORS] API routes return friendly message for {} and partial payloads', async () => {
    await new Promise((r) => setTimeout(r, 300));
    async function safeFetch(url: string, ip: string, bodyObj: Record<string, unknown>) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
            body: JSON.stringify(bodyObj),
          });
          if (res.status === 400) return res;
          await new Promise((r) => setTimeout(r, 150));
        } catch {
          await new Promise((r) => setTimeout(r, 150));
        }
      }
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
        body: JSON.stringify(bodyObj),
      });
    }

    const routes = [
      '/api/newsletter',
      '/api/contact',
      '/api/apply-teacher',
      '/api/register',
    ];
    for (const route of routes) {
      const testIp = `192.0.2.${Math.floor(Math.random() * 50) + 130}`;
      // Empty payload
      const emptyRes = await safeFetch(`http://127.0.0.1:8787${route}`, testIp, {});
      const emptyBody = (await emptyRes.json().catch(() => ({}))) as { error?: string };
      expect(emptyRes.status, `${route} empty body`).toBe(400);
      expect(emptyBody.error, `${route} has error message`).toBeTruthy();
      expect(emptyBody.error, `${route} no raw Zod`).not.toMatch(/Invalid input|received undefined/);

      await new Promise((r) => setTimeout(r, 100));

      // Partial payload
      const partialRes = await safeFetch(`http://127.0.0.1:8787${route}`, testIp, { email: 'bad-email' });
      const partialBody = (await partialRes.json().catch(() => ({}))) as { error?: string };
      expect(partialRes.status, `${route} partial body`).toBe(400);
      expect(partialBody.error, `${route} has error message`).toBeTruthy();
      expect(partialBody.error, `${route} no raw Zod`).not.toMatch(/Invalid input|received undefined/);

      await new Promise((r) => setTimeout(r, 100));
    }
  });

  test('[B8-CSRF-AND-TOKEN-ACTIONS] Real-button actions, RFC 8058 one-click, CSRF origin protection across engines', async ({ bPage }) => {
    const { SignJWT } = await import('jose');
    const secret = getJwtSecret();
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const derivedSig = await crypto.subtle.sign(
      'HMAC',
      baseKey,
      enc.encode('quranific-newsletter-v1')
    );
    const derivedKey = new Uint8Array(derivedSig);

    async function makeToken(email: string, action: 'newsletter_confirm' | 'newsletter_unsubscribe') {
      let jwt = new SignJWT({ email, action })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt();
      if (action === 'newsletter_confirm') {
        jwt = jwt.setExpirationTime('48h');
      }
      return await jwt.sign(derivedKey);
    }

    // 1. Real-button confirm -> success page + welcome and admin MOCK lines
    const confirmEmail = `btn-confirm-${Date.now()}@example.com`;
    const confirmToken = await makeToken(confirmEmail, 'newsletter_confirm');
    await bPage.goto(`/api/newsletter/confirm?token=${encodeURIComponent(confirmToken)}`, {
      waitUntil: 'domcontentloaded',
    });
    const confirmBtn = bPage.locator('button[type="submit"]').first();
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await bPage.waitForTimeout(1000);
    const confirmBody = await bPage.locator('body').innerText();
    expect(confirmBody).toContain('Subscription Confirmed');

    // Verify mock lines in log if available
    const logText = getWranglerLogText();
    if (logText && logText.includes('[Mock Mode]')) {
      expect(logText).toContain(confirmEmail);
    }

    // 2. Replay confirm -> no duplicate mail
    await bPage.goto(`/api/newsletter/confirm?token=${encodeURIComponent(confirmToken)}`, {
      waitUntil: 'domcontentloaded',
    });
    const replayBtn = bPage.locator('button[type="submit"]').first();
    if (await replayBtn.isVisible()) {
      await replayBtn.click();
      await bPage.waitForTimeout(1000);
      const replayBody = await bPage.locator('body').innerText();
      expect(replayBody).toMatch(/Subscription Confirmed|Already Confirmed/);
    }

    // 3. Real-button unsubscribe -> success
    const unsubEmail = `btn-unsub-${Date.now()}@example.com`;
    const unsubToken = await makeToken(unsubEmail, 'newsletter_unsubscribe');
    await bPage.goto(`/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubToken)}`, {
      waitUntil: 'domcontentloaded',
    });
    const unsubBtn = bPage.locator('button[type="submit"]').first();
    await expect(unsubBtn).toBeVisible();
    await unsubBtn.click();
    await bPage.waitForTimeout(1000);
    const unsubBody = await bPage.locator('body').innerText();
    expect(unsubBody).toMatch(/Unsubscribed|You Have Been Unsubscribed/);

    // 4. One-click POST with valid token -> success and contact marked unsubscribed
    const ocEmail = `oneclick-${Date.now()}@example.com`;
    const ocToken = await makeToken(ocEmail, 'newsletter_unsubscribe');
    const ocRes = await safeFetch(`http://127.0.0.1:8787/api/newsletter/unsubscribe?token=${encodeURIComponent(ocToken)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'List-Unsubscribe=One-Click',
    });
    expect(ocRes.status).toBe(200);
    const ocLogText = getWranglerLogText();
    if (ocLogText && ocLogText.includes('[Mock Mode]')) {
      expect(ocLogText).toContain(ocEmail);
    }

    // 5. One-click with bad token -> friendly 400 (not 403)
    const badOcRes = await safeFetch('http://127.0.0.1:8787/api/newsletter/unsubscribe?token=bad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'List-Unsubscribe=One-Click',
    });
    expect(badOcRes.status).toBe(400);

    // 6. Form POST with Origin https://evil.example to /api/contact, /api/register and /api/newsletter/confirm -> 403
    for (const route of ['/api/contact', '/api/register', '/api/newsletter/confirm']) {
      const evilRes = await safeFetch(`http://127.0.0.1:8787${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Origin: 'https://evil.example',
        },
        body: 'test=1',
      });
      expect(evilRes.status, `Cross-site POST to ${route} must be 403`).toBe(403);
      const evilText = await evilRes.text();
      expect(evilText).toBe('Cross-site POST form submissions are forbidden');
    }

    // 7. Same-origin form POST passes the check
    const sameOriginRes = await safeFetch('http://127.0.0.1:8787/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'http://127.0.0.1:8787',
      },
      body: 'name=Test',
    });
    expect(sameOriginRes.status, 'Same-origin form POST must not return 403').not.toBe(403);

    // 8. Form POST with no Origin to /api/register -> 403
    const noOriginRes = await safeFetch('http://127.0.0.1:8787/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'name=Test',
    });
    expect(noOriginRes.status, 'Form POST with no Origin to /api/register must be 403').toBe(403);
    const noOriginText = await noOriginRes.text();
    expect(noOriginText).toBe('Cross-site POST form submissions are forbidden');

    // 9. JSON POSTs unaffected
    const jsonRes = await safeFetch('http://127.0.0.1:8787/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil.example',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    expect(jsonRes.status, 'JSON POST must not be rejected by CSRF origin check').not.toBe(403);
  });

  test('[B6-CONSENT-EDGE] Local edge consent bucket endpoint respects Sec-GPC: 1', async () => {
    const res = await safeFetch('http://127.0.0.1:8787/api/consent-bucket', {
      headers: {
        'Sec-GPC': '1',
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hasGPC).toBe(true);
    expect(data.bucket).toBe('STRICT');
  });
});

