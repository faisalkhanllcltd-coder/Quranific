// src/pages/api/newsletter.ts
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
    // 1. Safe Edge Context Extraction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locals = context.locals as any;
    const runtime = locals.runtime;
    const env = runtime?.env ?? import.meta.env;
    const kv = env.SESSION;
    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') || 'unknown';

    // 2. Distributed IP Rate Limiting via KV
    if (kv && cfConnectingIp !== 'unknown') {
      const rateLimitKey = `RL:NEWSLETTER:${cfConnectingIp}`;
      const attemptsStr = (await kv.get(rateLimitKey)) as string | null;
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

      if (attempts >= 4) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a minute before trying again.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Lock the IP for 60 seconds
      await kv
        .put(rateLimitKey, (attempts + 1).toString(), { expirationTtl: 60 })
        .catch((e: unknown) => console.error('[KV RL Failed]:', e));
    }

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
    const adminEmail = (runtimeEnv.ADMIN_EMAIL as string) || 'faisalkhan.llc.ltd@gmail.com';

    if (!turnstileSecret) {
      console.error('[Configuration Error]: Missing Turnstile Secret');
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
      if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_123456789') {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'System <onboarding@quranific.com>',
              to: adminEmail,
              subject: `New Newsletter Subscriber!`,
              text: `A new user has subscribed to the newsletter.\n\nEmail: ${email}`,
            }),
          });
          if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
        } catch (adminErr) {
          console.error('[Newsletter Admin Notification Failed]:', adminErr);
          if (kv) {
            const deadLetterKey = `FAILED_NEWSLETTER_ADMIN:${Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              email: email,
              reason: String(adminErr),
            });
            kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch(
              (e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e)
            );
          }
        }

        try {
          await sendNewsletterWelcome(email, resendApiKey);
        } catch (userErr) {
          console.error('[Newsletter User Welcome Failed]:', userErr);
          if (kv) {
            const deadLetterKey = `FAILED_NEWSLETTER_USER:${Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              email: email,
              reason: String(userErr),
            });
            kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch(
              (e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e)
            );
          }
        }
      } else {
        // Local Mock Mode
        console.log('\n====== 📬 MOCK NEWSLETTER SUB ======');
        console.log(`New Subscriber: ${email}`);
        console.log(`Notification sent to: ${adminEmail}`);
        console.log('====================================\n');
      }
    };

    // 3. Background Task Execution (Safe)
    if (locals.cfContext?.waitUntil) {
      locals.cfContext.waitUntil(sendEmailTask());
    } else if (locals.runtime?.ctx?.waitUntil) {
      locals.runtime.ctx.waitUntil(sendEmailTask());
    } else {
      sendEmailTask().catch(console.error);
    }

    // 4. Return success immediately
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('[Newsletter Fatal 500]:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error. Could not process subscription.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
