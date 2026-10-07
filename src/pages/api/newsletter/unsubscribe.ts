// src/pages/api/newsletter/unsubscribe.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { jwtVerify } from 'jose';

export const prerender = false;

function renderHtml(title: string, heading: string, message: string, isSuccess: boolean): string {
  const icon = isSuccess
    ? `<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background: #ecfdf5; display: flex; align-items: center; justify-content: center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>`
    : `<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background: #fef2f2; display: flex; align-items: center; justify-content: center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
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
    <a href="https://quranific.com" class="brand">Quranific</a>
    ${icon}
    <h1>${heading}</h1>
    <p>${message}</p>
    <a href="https://quranific.com" class="btn">Return to Homepage</a>
    <div class="footer-text">Quranific &bull; Quran &amp; Arabic Studies</div>
  </div>
</body>
</html>`;
}

export const GET: APIRoute = async (context) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeEnv = env as Record<string, any>;
  const kv = runtimeEnv.SESSION;
  const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
  const resendAudienceId = runtimeEnv.RESEND_AUDIENCE_ID as string;
  const jwtSecret = runtimeEnv.JWT_SECRET as string;

  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    if (context.request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Missing unsubscribe token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      renderHtml(
        'Missing Token',
        'Invalid Request',
        'No unsubscribe token was provided in your request. Please check the link in your email.',
        false
      ),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  try {
    const secretKey = new TextEncoder().encode(jwtSecret || 'dev-local-jwt-secret-placeholder-32b');
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });

    if (payload.action !== 'newsletter_unsubscribe' || typeof payload.email !== 'string') {
      throw new Error('Invalid token payload format');
    }

    const email = payload.email.toLowerCase().trim();

    // 1. Update in Resend Audiences if configured
    if (resendApiKey && resendAudienceId) {
      try {
        const resendRes = await fetch(
          `https://api.resend.com/audiences/${resendAudienceId}/contacts/${encodeURIComponent(email)}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              unsubscribed: true,
            }),
          }
        );
        if (!resendRes.ok && resendRes.status !== 404) {
          console.warn(`[Newsletter Unsubscribe] Resend returned status ${resendRes.status}`);
        }
      } catch (resendErr) {
        console.error('[Newsletter Unsubscribe] Resend API call failed:', resendErr);
      }
    }

    // 2. Persist unsubscribe flag to Cloudflare KV
    if (kv) {
      try {
        await kv.put(`UNSUBSCRIBED:NEWSLETTER:${email}`, 'true', { expirationTtl: 31536000 });
      } catch (kvErr) {
        console.error('[Newsletter Unsubscribe] KV write failed:', kvErr);
      }
    }

    if (context.request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ success: true, email }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      renderHtml(
        'Unsubscribed',
        'You Have Been Unsubscribed',
        `You will no longer receive newsletter or promotional emails from Quranific at <strong>${email}</strong>.`,
        true
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err) {
    console.error('[Newsletter Unsubscribe Error]:', err);
    if (context.request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid or expired unsubscribe token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      renderHtml(
        'Invalid Link',
        'Unable to Process Request',
        'This unsubscribe link is invalid or has expired. If you need assistance, please contact support@quranific.com.',
        false
      ),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
};

export const POST = GET;
