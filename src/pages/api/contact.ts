// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { ENV } from '../../lib/env';
import { z } from 'zod';

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
  // Turnstile token from the cf-turnstile widget
  'cf-turnstile-response': z.string().min(1, 'Please complete the security check.'),
});

export const prerender = false;

// ─── Cloudflare Turnstile Verification ──────────────────────────────────────
async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({
      secret: ENV.TURNSTILE_SECRET_KEY,
      response: token,
    });
    if (remoteip) body.set('remoteip', remoteip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ─── KV Helper ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKV(context: Parameters<APIRoute>[0]): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locals = context.locals as any;
  return locals.cfContext?.env?.SESSION || locals.runtime?.env?.SESSION || null;
}

export const POST: APIRoute = async (context) => {
  try {
    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const kv = getKV(context);

    // 1. Distributed IP Rate Limiting via KV (Mandate 3 & 4)
    if (kv && cfConnectingIp !== 'unknown') {
      const rateLimitKey = `RL:CONTACT:${cfConnectingIp}`;
      const isRateLimited = await kv.get(rateLimitKey);
      if (isRateLimited) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a minute before trying again.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Lock the IP for 60 seconds
      await kv
        .put(rateLimitKey, '1', { expirationTtl: 60 })
        .catch((e: unknown) => console.error('[KV RL Failed]:', e));
    }

    const data = (await context.request.json()) as Record<string, unknown>;

    // 2. Validate all fields including the Turnstile token
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.errors[0].message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { firstName, lastName, email, message } = parsed.data;
    const turnstileToken = parsed.data['cf-turnstile-response'];

    // 3. Server-side Turnstile verification — hard reject if it fails
    const isHuman = await verifyTurnstile(turnstileToken, cfConnectingIp);
    if (!isHuman) {
      return new Response(
        JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Dispatch the Email via Resend in the background
    const sendEmailTask = async () => {
      try {
        if (ENV.RESEND_API_KEY.startsWith('re_') && ENV.RESEND_API_KEY !== 're_123456789') {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ENV.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Quranific Support <support@quranific.com>',
              to: ENV.ADMIN_EMAIL,
              reply_to: email,
              subject: `New Contact Inquiry from ${firstName} ${lastName}`,
              text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
            }),
          });
          if (!res.ok) {
            throw new Error('Resend API rejected the email dispatch');
          }
        } else {
          // Local Mock Mode
          console.log('\n====== 📨 MOCK EMAIL DISPATCH ======');
          console.log(`To: ${ENV.ADMIN_EMAIL}`);
          console.log(`From: ${firstName} ${lastName} <${email}>`);
          console.log(`Message: \n${message}`);
          console.log('====================================\n');
        }
      } catch (error) {
        console.error('Contact API Email Dispatch Error:', error);
        if (kv) {
          const deadLetterKey = `FAILED_CONTACT:${Date.now()}`;
          const deadLetterPayload = JSON.stringify({
            failedAt: new Date().toISOString(),
            payload: parsed.data,
            reason: String(error),
          });
          kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch((e: unknown) =>
            console.error('[Dead-Letter KV Write Failed]:', e)
          );
        }
      }
    };

    // 5. Background Task Execution (Mandate 1 - Modernized Path)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locals = context.locals as any;
    if (locals.cfContext?.waitUntil) {
      locals.cfContext.waitUntil(sendEmailTask());
    } else if (locals.runtime?.ctx?.waitUntil) {
      locals.runtime.ctx.waitUntil(sendEmailTask());
    } else {
      sendEmailTask().catch(console.error);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Contact API Critical Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error. Could not dispatch message.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
