// src/pages/api/newsletter.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { sendNewsletterWelcome } from '../../lib/email';

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const prerender = false;

// ─── Cloudflare Turnstile Verification ──────────────────────────────────────
async function verifyTurnstile(token: string, secret: string, remoteip?: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({
      secret: secret,
      response: token,
    });
    if (remoteip && remoteip !== 'unknown') {
      body.set('remoteip', remoteip);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      console.error('[Turnstile Edge Rejection] Error codes:', data['error-codes']);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Turnstile Fetch Exception]:', error);
    return false;
  }
}
// CRITICAL: This cannot be a static file

export const POST: APIRoute = async (context) => {
  try {
    const data = (await context.request.json()) as Record<string, unknown>;

    const turnstileToken = data['cf-turnstile-response'] as string | undefined;
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: 'Security check missing. Please refresh and try again.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const runtimeEnv = env as Record<string, unknown>;
    const turnstileSecret = (runtimeEnv.TURNSTILE_SECRET ??
      runtimeEnv.TURNSTILE_SECRET_KEY) as string;
    const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
    const adminEmail = (runtimeEnv.ADMIN_EMAIL as string) || 'admin@quranific.com';

    if (!turnstileSecret) {
      console.error('[Configuration Error]: Missing Turnstile Secret');
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const isHuman = await verifyTurnstile(turnstileToken, turnstileSecret, cfConnectingIp);
    if (!isHuman) {
      return new Response(
        JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Validate incoming data with Zod
    const parsed = newsletterSchema.safeParse(data);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.errors[0].message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email } = parsed.data;

    // TODO: Phase 5 D1 Database integration for uniqueness constraint

    // 2. Dispatch the Email via Resend in the background
    const sendEmailTask = async () => {
      try {
        const finalAdminEmail = adminEmail || 'faisalkhan.llc.ltd@gmail.com';
        if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_123456789') {
          await Promise.all([
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Quranific Updates <hello@quranific.com>',
                to: finalAdminEmail,
                subject: `New Newsletter Subscriber!`,
                text: `A new user has subscribed to the newsletter.\n\nEmail: ${email}`,
              }),
            }).then(async (res) => {
              if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
            }),
            sendNewsletterWelcome(email, resendApiKey),
          ]);
        } else {
          // Local Mock Mode
          console.log('\n====== 📬 MOCK NEWSLETTER SUB ======');
          console.log(`New Subscriber: ${email}`);
          console.log(`Notification sent to: ${finalAdminEmail}`);
          console.log('====================================\n');
        }
      } catch (error) {
        console.error('Newsletter API Email Dispatch Error:', error);
        const kv = (env as Record<string, unknown>).SESSION as
          | { put: (key: string, value: string, opts?: Record<string, unknown>) => Promise<void> }
          | undefined;
        if (kv) {
          const deadLetterKey = `FAILED_NEWSLETTER:${Date.now()}`;
          const deadLetterPayload = JSON.stringify({
            failedAt: new Date().toISOString(),
            email: email,
            reason: String(error),
          });
          kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch((e: unknown) =>
            console.error('[Dead-Letter KV Write Failed]:', e)
          );
        }
      }
    };

    const localsRuntime = (
      context.locals as { runtime?: { ctx?: { waitUntil: (p: Promise<unknown>) => void } } }
    ).runtime;
    if (localsRuntime?.ctx?.waitUntil) {
      localsRuntime.ctx.waitUntil(sendEmailTask());
    } else {
      sendEmailTask().catch(console.error);
    }

    // 3. Return success immediately
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Newsletter API Critical Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error. Could not process subscription.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
