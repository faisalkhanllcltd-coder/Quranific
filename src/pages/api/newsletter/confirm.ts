// src/pages/api/newsletter/confirm.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { SITE } from '../../../constants/site';
import {
  verifyNewsletterToken,
  createNewsletterUnsubscribeUrl,
} from '../../../lib/newsletter-token';
import { ensureSubscribed } from '../../../lib/resend-contacts';
import { sendNewsletterWelcome, sendNewsletterAdminNotification } from '../../../lib/email';

export const prerender = false;

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

function renderPage(options: {
  title: string;
  heading: string;
  message: string;
  type: 'confirm-prompt' | 'success' | 'deferred' | 'error';
  token?: string;
}): string {
  const { title, heading, message, type, token } = options;

  let icon: string;
  if (type === 'success') {
    icon = `<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background: #ecfdf5; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>`;
  } else if (type === 'deferred') {
    icon = `<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>`;
  } else if (type === 'confirm-prompt') {
    icon = `<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    </div>`;
  } else {
    icon = `<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background: #fef2f2; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    </div>`;
  }

  let actionElement: string;
  if (type === 'confirm-prompt' && token) {
    actionElement = `
      <form method="POST" action="/api/newsletter/confirm">
        <input type="hidden" name="token" value="${token}" />
        <button type="submit" class="btn" style="border: none; cursor: pointer; width: 100%;">Confirm Subscription</button>
      </form>
    `;
  } else {
    actionElement = `<a href="${SITE.url}" class="btn">Return to Homepage</a>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="referrer" content="no-referrer">
  <title>${title} | Quranific</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 24px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      color: #0f172a;
    }
    .card {
      background: #ffffff;
      max-width: 480px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      padding: 40px 32px;
      text-align: center;
      box-sizing: border-box;
    }
    .brand {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #064e3b;
      margin-bottom: 24px;
      text-decoration: none;
      display: inline-block;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 28px 0;
    }
    .btn {
      display: inline-block;
      background: #059669;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 9999px;
      text-decoration: none;
      transition: background 0.2s ease;
      box-sizing: border-box;
    }
    .btn:hover {
      background: #047857;
    }
    .footer-text {
      margin-top: 24px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="card">
    <a href="${SITE.url}" class="brand">Quranific</a>
    ${icon}
    <h1>${heading}</h1>
    <p>${message}</p>
    ${actionElement}
    <div class="footer-text">Quranific &bull; Quran &amp; Arabic Studies</div>
  </div>
</body>
</html>`;
}

export const GET: APIRoute = async (context) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeEnv = env as Record<string, any>;
  const jwtSecret = runtimeEnv.JWT_SECRET as string;

  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(
      renderPage({
        title: 'Missing Token',
        heading: 'Invalid Request',
        message: 'No confirmation token was provided. Please check the link in your email.',
        type: 'error',
      }),
      { status: 400, headers: HTML_HEADERS }
    );
  }

  if (!jwtSecret || !jwtSecret.trim()) {
    console.error('[Configuration Error]: Missing JWT_SECRET');
    return new Response(
      renderPage({
        title: 'Configuration Error',
        heading: 'Internal Error',
        message: 'A system configuration error occurred. Please contact support@quranific.com.',
        type: 'error',
      }),
      { status: 500, headers: HTML_HEADERS }
    );
  }

  try {
    await verifyNewsletterToken(token, 'newsletter_confirm', jwtSecret);
    return new Response(
      renderPage({
        title: 'Confirm Subscription',
        heading: 'Confirm Your Subscription',
        message:
          'Please click the button below to complete your newsletter subscription to Quranific updates.',
        type: 'confirm-prompt',
        token,
      }),
      { status: 200, headers: HTML_HEADERS }
    );
  } catch (err) {
    console.error('[Newsletter Confirm Token Verification Failed]:', err);
    return new Response(
      renderPage({
        title: 'Invalid Link',
        heading: 'Link Expired or Invalid',
        message:
          'This confirmation link is invalid or has expired (valid for 48 hours). Please request a new subscription on our website.',
        type: 'error',
      }),
      { status: 400, headers: HTML_HEADERS }
    );
  }
};

export const POST: APIRoute = async (context) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeEnv = env as Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locals = context.locals as any;
  const kv = runtimeEnv.SESSION;
  const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
  const resendAudienceId = runtimeEnv.RESEND_AUDIENCE_ID as string | undefined;
  const adminEmail = (runtimeEnv.ADMIN_EMAIL as string) || SITE.emails.admin;
  const jwtSecret = runtimeEnv.JWT_SECRET as string;
  const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') || 'unknown';

  let token = '';

  const contentType = context.request.headers.get('content-type') || '';
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await context.request.formData().catch(() => null);
    if (formData) {
      token = (formData.get('token') as string) || '';
    }
  } else if (contentType.includes('application/json')) {
    const json = (await context.request.json().catch(() => null)) as Record<string, unknown> | null;
    if (json && typeof json.token === 'string') {
      token = json.token;
    }
  }

  if (!token) {
    const url = new URL(context.request.url);
    token = url.searchParams.get('token') || '';
  }

  if (!token) {
    return new Response(
      renderPage({
        title: 'Missing Token',
        heading: 'Invalid Request',
        message: 'No confirmation token was submitted.',
        type: 'error',
      }),
      { status: 400, headers: HTML_HEADERS }
    );
  }

  if (!jwtSecret || !jwtSecret.trim()) {
    console.error('[Configuration Error]: Missing JWT_SECRET');
    return new Response(
      renderPage({
        title: 'Configuration Error',
        heading: 'Internal Error',
        message: 'A system configuration error occurred. Please contact support@quranific.com.',
        type: 'error',
      }),
      { status: 500, headers: HTML_HEADERS }
    );
  }

  let email: string;
  try {
    const payload = await verifyNewsletterToken(token, 'newsletter_confirm', jwtSecret);
    email = payload.email;
  } catch (err) {
    console.error('[Newsletter Confirm POST Verification Failed]:', err);
    return new Response(
      renderPage({
        title: 'Invalid Link',
        heading: 'Link Expired or Invalid',
        message: 'This confirmation link is invalid or has expired. Please sign up again.',
        type: 'error',
      }),
      { status: 400, headers: HTML_HEADERS }
    );
  }

  // 1. Store consent record in KV FIRST (no TTL, only if none exists; never overwrite the first confirmedAt)
  if (kv) {
    const consentKey = `NL_CONSENT:${email}`;
    try {
      const existingConsent = await kv.get(consentKey);
      if (!existingConsent) {
        const consentRecord = JSON.stringify({
          confirmedAt: new Date().toISOString(),
          ip: cfConnectingIp,
          source: 'footer',
        });
        await kv.put(consentKey, consentRecord);
      }
    } catch (e: unknown) {
      console.error('[KV NL_CONSENT write failed]:', e);
    }
  }

  // 2. Ensure contact is subscribed in Resend
  let subResult: 'created' | 'resubscribed' | 'already';
  if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_123456789') {
    try {
      subResult = await ensureSubscribed(email, resendApiKey, resendAudienceId);
    } catch (resendErr) {
      console.error('[Newsletter Confirm ensureSubscribed Failed]:', resendErr);

      // Write payload to KV with key FAILED_NEWSLETTER:<timestamp> (TTL 30 days = 2592000s)
      if (kv) {
        const deadLetterKey = `FAILED_NEWSLETTER:${Date.now()}`;
        const deadLetterPayload = JSON.stringify({
          failedAt: new Date().toISOString(),
          email,
          audienceId: resendAudienceId,
          reason: String(resendErr),
        });
        await kv
          .put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 })
          .catch((e: unknown) =>
            console.error('[Dead-Letter FAILED_NEWSLETTER KV Write Failed]:', e)
          );
      }

      return new Response(
        renderPage({
          title: 'Subscription Processing',
          heading: 'We’ll Complete This Shortly',
          message:
            'Thank you for confirming your email! Our contact service is experiencing temporary latency, but we’ve queued your subscription and will finalize it shortly.',
          type: 'deferred',
        }),
        { status: 200, headers: HTML_HEADERS }
      );
    }
  } else {
    // Local mock mode: treat as created to trigger mock welcome/admin notifications
    subResult = 'created';
  }

  // 3. Dispatch welcome email and admin notification in background via waitUntil ONLY if created or resubscribed
  if (subResult === 'created' || subResult === 'resubscribed') {
    const sendBackgroundTasks = async () => {
      try {
        const unsubscribeUrl = await createNewsletterUnsubscribeUrl(email, jwtSecret);
        await Promise.all([
          sendNewsletterWelcome(email, resendApiKey, unsubscribeUrl),
          sendNewsletterAdminNotification(email, resendApiKey, adminEmail),
        ]);
      } catch (bgErr) {
        console.error('[Newsletter Welcome/Admin Background Dispatch Failed]:', bgErr);
      }
    };

    const waitUntil =
      locals.cfContext?.waitUntil?.bind(locals.cfContext) ??
      locals.runtime?.ctx?.waitUntil?.bind(locals.runtime?.ctx);

    if (waitUntil) {
      waitUntil(sendBackgroundTasks());
    } else {
      sendBackgroundTasks().catch(console.error);
    }
  }

  return new Response(
    renderPage({
      title: 'Subscription Confirmed',
      heading: 'Subscription Confirmed!',
      message: `JazakAllah Khair! You have been successfully subscribed to Quranific updates at <strong>${email}</strong>. Welcome to our community!`,
      type: 'success',
    }),
    { status: 200, headers: HTML_HEADERS }
  );
};
