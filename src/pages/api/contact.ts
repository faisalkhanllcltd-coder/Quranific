// src/pages/api/contact.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { sendContactAutoResponder, sendContactAdminNotification } from '../../lib/email';
import { verifyTurnstile } from '../../lib/turnstile';

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email({ error: 'Invalid email address' }),
  message: z.string().min(1, 'Message is required'),
  // Turnstile token from the cf-turnstile widget
  'cf-turnstile-response': z.string().min(1, 'Please complete the security check.'),
});

export const prerender = false;

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

    let data: Record<string, unknown> = {};
    try {
      data = (await context.request.json()) as Record<string, unknown>;
    } catch {
      data = {};
    }

    // 2. Validate all fields including the Turnstile token
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const hasTokenIssue = parsed.error.issues.find((i) => i.path[0] === 'cf-turnstile-response');
      const issue = parsed.error.issues[0];
      const field = issue?.path?.[0];
      let friendlyMsg = 'Please check your input and try again.';
      if (hasTokenIssue) friendlyMsg = 'Please complete the security check.';
      else if (field === 'email') friendlyMsg = 'Please enter a valid email address.';
      else if (field === 'firstName') friendlyMsg = 'First name is required.';
      else if (field === 'lastName') friendlyMsg = 'Last name is required.';
      else if (field === 'message') friendlyMsg = 'Message is required.';
      return new Response(JSON.stringify({ error: friendlyMsg }), {
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
    const adminEmail = runtimeEnv.ADMIN_EMAIL as string;

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
      if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_123456789') {
        try {
          await sendContactAdminNotification(
            { firstName, lastName, email, message },
            resendApiKey,
            adminEmail
          );
        } catch (adminErr) {
          console.error('[Contact Admin Notification Failed]:', adminErr);
          if (kv) {
            const deadLetterKey = `FAILED_CONTACT_ADMIN:${Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              payload: parsed.data,
              reason: String(adminErr),
            });
            kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch(
              (e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e)
            );
          }
        }

        try {
          await sendContactAutoResponder(email, firstName, resendApiKey);
        } catch (userErr) {
          console.error('[Contact User Auto-Responder Failed]:', userErr);
          if (kv) {
            const deadLetterKey = `FAILED_CONTACT_USER:${Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              payload: parsed.data,
              reason: String(userErr),
            });
            kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch(
              (e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e)
            );
          }
        }
      } else {
        // Local Mock Mode
        console.log('\n====== 📨 MOCK EMAIL DISPATCH ======');
        console.log(`To: ${adminEmail}`);
        console.log(`From: ${firstName} ${lastName} <${email}>`);
        console.log(`Message: \n${message}`);
        console.log('====================================\n');
      }
    };

    // 5. Background Task Execution (Mandate 1 - Modernized Path)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locals = context.locals as any;
    if (locals.cfContext?.waitUntil) {
      locals.cfContext.waitUntil(sendEmailTask());
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
