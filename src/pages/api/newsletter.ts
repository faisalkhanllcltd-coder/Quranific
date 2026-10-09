// src/pages/api/newsletter.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { sendNewsletterConfirmation } from '../../lib/email';
import { verifyTurnstile } from '../../lib/turnstile';
import { createNewsletterConfirmUrl } from '../../lib/newsletter-token';
import { getContact } from '../../lib/resend-contacts';

const newsletterSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
  'cf-turnstile-response': z.string().min(1, 'Please complete the security check.'),
});

export const prerender = false;

const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export const POST: APIRoute = async (context) => {
  try {
    // 1. Safe Edge Context Extraction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtimeEnv = env as Record<string, any>;
    const kv = runtimeEnv.SESSION;
    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') || 'unknown';

    // 2. Distributed IP Rate Limiting via KV
    if (kv && cfConnectingIp !== 'unknown') {
      const rateLimitKey = `RL:NEWSLETTER:${cfConnectingIp}`;
      const attemptsStr = (await kv.get(rateLimitKey)) as string | null;
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

      if (attempts >= 4) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a minute before trying again.' }),
          { status: 429, headers: SECURITY_HEADERS }
        );
      }
      // Lock the IP for 60 seconds
      await kv
        .put(rateLimitKey, (attempts + 1).toString(), { expirationTtl: 60 })
        .catch((e: unknown) => console.error('[KV RL Failed]:', e));
    }

    const data = (await context.request.json()) as Record<string, unknown>;

    const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
    const jwtSecret = runtimeEnv.JWT_SECRET as string;

    // 3. Validate incoming data with Zod
    const parsed = newsletterSchema.safeParse(data);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), {
        status: 400,
        headers: SECURITY_HEADERS,
      });
    }

    const cleanEmail = parsed.data.email.toLowerCase().trim();
    const turnstileToken = parsed.data['cf-turnstile-response'];

    const turnstileSecret = (runtimeEnv.TURNSTILE_SECRET ??
      runtimeEnv.TURNSTILE_SECRET_KEY) as string;

    if (!turnstileSecret) {
      console.error('[Configuration Error]: Missing Turnstile Secret');
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: SECURITY_HEADERS,
      });
    }

    // 4. Server-side Turnstile verification — hard reject if it fails
    const isHuman = await verifyTurnstile(turnstileToken, turnstileSecret, cfConnectingIp);
    if (!isHuman) {
      return new Response(
        JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }),
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // 5. Per-email KV throttle check (key NL_REQ:<lowercased email>, TTL 600s)
    const emailThrottleKey = `NL_REQ:${cleanEmail}`;
    if (kv) {
      const existingReq = await kv.get(emailThrottleKey);
      if (existingReq) {
        // Return generic success without emailing repeatedly
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: SECURITY_HEADERS,
        });
      }
    }

    // 6. Check if contact is already an active subscriber
    if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_123456789') {
      try {
        const contact = await getContact(cleanEmail, resendApiKey);
        if (contact && !contact.unsubscribed) {
          // Never reveal who is subscribed: return generic success without sending anything
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: SECURITY_HEADERS,
          });
        }
      } catch (checkErr) {
        console.error('[Resend Check Contact Failed]:', checkErr);
      }
    }

    // 7. Verify JWT secret is present before generating confirm token
    if (!jwtSecret || !jwtSecret.trim()) {
      console.error('[Configuration Error]: Missing JWT_SECRET for newsletter token generation');
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: SECURITY_HEADERS,
      });
    }

    // 8. Generate signed confirmation URL (48h expiry)
    let confirmUrl: string;
    try {
      confirmUrl = await createNewsletterConfirmUrl(cleanEmail, jwtSecret);
    } catch (tokenErr) {
      console.error('[Newsletter Token Generation Failed]:', tokenErr);
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: SECURITY_HEADERS,
      });
    }

    // 9. Send Confirmation Email (awaited)
    if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_123456789') {
      try {
        await sendNewsletterConfirmation(cleanEmail, confirmUrl, resendApiKey);
      } catch (emailErr) {
        console.error('[Newsletter Confirmation Send Failed]:', emailErr);
        return new Response(
          JSON.stringify({
            error:
              "Couldn't send the confirmation email, please try again or message us on WhatsApp",
          }),
          { status: 500, headers: SECURITY_HEADERS }
        );
      }
    } else {
      // Local Mock Mode
      console.log('\n====== 📬 MOCK NEWSLETTER CONFIRMATION ======');
      console.log(`Subscriber: ${cleanEmail}`);
      console.log(`Confirmation URL: ${confirmUrl}`);
      console.log('=============================================\n');
    }

    // 10. Write per-email KV throttle key only after successful send / mock log
    if (kv) {
      await kv
        .put(emailThrottleKey, '1', { expirationTtl: 600 })
        .catch((e: unknown) => console.error('[KV Email Throttle Failed]:', e));
    }

    // 11. Return success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: SECURITY_HEADERS,
    });
  } catch (error: unknown) {
    console.error('[Newsletter Fatal 500]:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: SECURITY_HEADERS,
    });
  }
};
