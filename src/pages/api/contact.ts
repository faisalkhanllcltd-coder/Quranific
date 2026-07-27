// src/pages/api/contact.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { sendContactAutoResponder } from '../../lib/email';

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

// ─── KV Helper ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKV(): any {
  return (env as Record<string, unknown>).SESSION || null;
}

export const POST: APIRoute = async (context) => {
  try {
    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const kv = getKV();

    // 1. Distributed IP Rate Limiting via KV (Mandate 3 & 4)
    if (kv && cfConnectingIp !== 'unknown') {
      const rateLimitKey = `RL:CONTACT:${cfConnectingIp}`;
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

    // 3. Server-side Turnstile verification — hard reject if it fails
    const isHuman = await verifyTurnstile(turnstileToken, turnstileSecret, cfConnectingIp);
    if (!isHuman) {
      return new Response(
        JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Dispatch the Email via Resend in the background
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
                from: 'Quranific Support <support@quranific.com>',
                to: finalAdminEmail,
                reply_to: email,
                subject: `New Contact Inquiry from ${firstName} ${lastName}`,
                text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
              }),
            }).then(async (res) => {
              if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
            }),
            sendContactAutoResponder(email, firstName, resendApiKey),
          ]);
        } else {
          // Local Mock Mode
          console.log('\n====== 📨 MOCK EMAIL DISPATCH ======');
          console.log(`To: ${finalAdminEmail}`);
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
