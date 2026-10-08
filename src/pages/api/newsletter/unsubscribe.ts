// src/pages/api/newsletter/unsubscribe.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { SITE } from '../../../constants/site';
import { verifyNewsletterToken } from '../../../lib/newsletter-token';
import { setUnsubscribed } from '../../../lib/resend-contacts';

export const prerender = false;

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

function renderHtml(options: {
  title: string;
  heading: string;
  message: string;
  type: 'prompt' | 'success' | 'error';
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
  } else if (type === 'prompt') {
    icon = `<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
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
  if (type === 'prompt' && token) {
    actionElement = `
      <form method="POST" action="/api/newsletter/unsubscribe">
        <input type="hidden" name="token" value="${token}" />
        <button type="submit" class="btn btn-danger" style="border: none; cursor: pointer; width: 100%;">Unsubscribe</button>
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
    .btn-danger {
      background: #dc2626;
    }
    .btn-danger:hover {
      background: #b91c1c;
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
      renderHtml({
        title: 'Missing Token',
        heading: 'Invalid Request',
        message:
          'No unsubscribe token was provided in your request. Please check the link in your email.',
        type: 'error',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...SECURITY_HEADERS,
        },
      }
    );
  }

  if (!jwtSecret || !jwtSecret.trim()) {
    console.error('[Configuration Error]: Missing JWT_SECRET');
    return new Response(
      renderHtml({
        title: 'Configuration Error',
        heading: 'Internal Error',
        message: 'A system configuration error occurred. Please contact support@quranific.com.',
        type: 'error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...SECURITY_HEADERS,
        },
      }
    );
  }

  try {
    const payload = await verifyNewsletterToken(token, 'newsletter_unsubscribe', jwtSecret);
    return new Response(
      renderHtml({
        title: 'Unsubscribe',
        heading: 'Unsubscribe from Updates',
        message: `Are you sure you want to unsubscribe <strong>${payload.email}</strong> from Quranific updates?`,
        type: 'prompt',
        token,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...SECURITY_HEADERS,
        },
      }
    );
  } catch (err) {
    console.error('[Newsletter Unsubscribe Verification Failed]:', err);
    return new Response(
      renderHtml({
        title: 'Invalid Link',
        heading: 'Unable to Process Request',
        message:
          'This unsubscribe link is invalid or has expired. If you need assistance, please contact support@quranific.com.',
        type: 'error',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...SECURITY_HEADERS,
        },
      }
    );
  }
};

export const POST: APIRoute = async (context) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeEnv = env as Record<string, any>;
  const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
  const jwtSecret = runtimeEnv.JWT_SECRET as string;

  const url = new URL(context.request.url);
  let token = url.searchParams.get('token') || '';

  const contentType = context.request.headers.get('content-type') || '';
  if (
    !token &&
    (contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data'))
  ) {
    const formData = await context.request.formData().catch(() => null);
    if (formData) {
      token = (formData.get('token') as string) || '';
    }
  } else if (!token && contentType.includes('application/json')) {
    const json = (await context.request.json().catch(() => null)) as Record<string, unknown> | null;
    if (json && typeof json.token === 'string') {
      token = json.token;
    }
  }

  if (!token) {
    if (context.request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Missing unsubscribe token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
      });
    }
    return new Response(
      renderHtml({
        title: 'Missing Token',
        heading: 'Invalid Request',
        message:
          'No unsubscribe token was provided in your request. Please check the link in your email.',
        type: 'error',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...SECURITY_HEADERS,
        },
      }
    );
  }

  if (!jwtSecret || !jwtSecret.trim()) {
    console.error('[Configuration Error]: Missing JWT_SECRET');
    if (context.request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
      });
    }
    return new Response(
      renderHtml({
        title: 'Configuration Error',
        heading: 'Internal Error',
        message: 'A system configuration error occurred. Please contact support@quranific.com.',
        type: 'error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...SECURITY_HEADERS,
        },
      }
    );
  }

  try {
    const payload = await verifyNewsletterToken(token, 'newsletter_unsubscribe', jwtSecret);
    const email = payload.email;

    // Call Resend to mark unsubscribed
    try {
      await setUnsubscribed(email, true, resendApiKey);
    } catch (resendErr) {
      console.error('[Newsletter Unsubscribe Resend Failed]:', resendErr);
      if (context.request.headers.get('accept')?.includes('application/json')) {
        return new Response(
          JSON.stringify({
            error: 'Failed to update subscription status. Please email support@quranific.com.',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS } }
        );
      }
      return new Response(
        renderHtml({
          title: 'Unsubscribe Error',
          heading: 'Unable to Process Unsubscribe',
          message:
            'We were unable to process your unsubscribe request due to a server error. Please contact us directly at support@quranific.com.',
          type: 'error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            ...SECURITY_HEADERS,
          },
        }
      );
    }

    if (context.request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ success: true, email }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
      });
    }

    return new Response(
      renderHtml({
        title: 'Unsubscribed',
        heading: 'You Have Been Unsubscribed',
        message: `You will no longer receive newsletter or promotional emails from Quranific at <strong>${email}</strong>.`,
        type: 'success',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...SECURITY_HEADERS,
        },
      }
    );
  } catch (err) {
    console.error('[Newsletter Unsubscribe Error]:', err);
    if (context.request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid or expired unsubscribe token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
      });
    }
    return new Response(
      renderHtml({
        title: 'Invalid Link',
        heading: 'Unable to Process Request',
        message:
          'This unsubscribe link is invalid or has expired. If you need assistance, please contact support@quranific.com.',
        type: 'error',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...SECURITY_HEADERS,
        },
      }
    );
  }
};
