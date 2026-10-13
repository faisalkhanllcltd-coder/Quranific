// src/pages/api/register.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { signupSchema } from '../../lib/schema';
import { SignJWT } from 'jose';
import { sendStep1AdminNotification } from '../../lib/email';
import { verifyTurnstile } from '../../lib/turnstile';

export const prerender = false;

// ─── KV Helper ──────────────────────────────────────────────────────────────
function getKV() {
  const runtimeEnv = env as Record<string, unknown>;
  return runtimeEnv.SESSION;
}

export const POST: APIRoute = async (context) => {
  try {
    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = getKV() as any;

    // 1. Distributed IP Rate Limiting via KV
    if (kv && cfConnectingIp !== 'unknown') {
      const rateLimitKey = `RL:REGISTER:${cfConnectingIp}`;
      const attemptsStr = (await kv.get(rateLimitKey)) as string | null;
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

      if (attempts >= 4) {
        return new Response(
          JSON.stringify({ error: 'Too many registration attempts. Please wait a minute.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Lock the IP for 60 seconds
      await kv
        .put(rateLimitKey, (attempts + 1).toString(), { expirationTtl: 60 })
        .catch((e: unknown) => console.error('[KV RL Failed]:', e));
    }

    const data = await context.request.formData();
    const formData = Object.fromEntries(data);

    const trk = {
      fb: (formData.fbclid as string) || '',
      gc: (formData.gclid as string) || '',
      tt: (formData.ttclid as string) || '',
      us: (formData.utm_source as string) || '',
      uc: (formData.utm_campaign as string) || '',
      um: (formData.utm_medium as string) || '',
    };

    const parsed = signupSchema.safeParse(formData);
    if (!parsed.success) {
      const hasTokenIssue = parsed.error.issues.find((i) => i.path[0] === 'turnstileToken');
      const issue = parsed.error.issues[0];
      const field = issue?.path?.[0];
      let friendlyMsg = 'Please check your input and try again.';
      if (hasTokenIssue) friendlyMsg = 'Please complete the security check.';
      else if (field === 'email') friendlyMsg = 'Please enter a valid email address.';
      else if (field === 'name') friendlyMsg = 'Please enter your name.';
      else if (field === 'whatsapp') friendlyMsg = 'Please enter a valid WhatsApp number.';
      else if (field === 'country') friendlyMsg = 'Please select your country.';
      else if (field === 'guardianConsent')
        friendlyMsg = 'Parent or guardian confirmation is required to register.';
      else if (issue?.message) friendlyMsg = issue.message;

      return new Response(JSON.stringify({ error: friendlyMsg }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validData = parsed.data;

    // Bot trap - silent success for bots (honeypot field)
    if (validData.honeypot) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract edge variables dynamically
    const runtimeEnv = env as Record<string, unknown>;
    const turnstileSecret = (runtimeEnv.TURNSTILE_SECRET ??
      runtimeEnv.TURNSTILE_SECRET_KEY) as string;
    const jwtSecret = runtimeEnv.JWT_SECRET as string;
    const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
    const adminEmail = runtimeEnv.ADMIN_EMAIL as string;

    if (!turnstileSecret || !jwtSecret) {
      console.error(
        '[Configuration Error]: Missing TURNSTILE_SECRET or JWT_SECRET in Cloudflare edge variables.'
      );
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Server-side Turnstile verification
    const isHuman = await verifyTurnstile(
      validData.turnstileToken,
      turnstileSecret,
      cfConnectingIp
    );
    if (!isHuman) {
      return new Response(
        JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stateless Session Management via JWT
    const secretKey = new TextEncoder().encode(jwtSecret);
    const jti = crypto.randomUUID();
    const leadId = jti.substring(0, 6).toUpperCase();

    const token = await new SignJWT({
      n: validData.name,
      e: validData.email,
      w: validData.whatsapp,
      c: validData.country,
      s: validData.source,
      // Lead ID for email threading and DLQ correlation
      lid: leadId,
      // Calculator context — short keys to minimise JWT size
      et: validData.enrollType,
      dur: validData.duration,
      ses: validData.sessions,
      cur: validData.currency,
      bil: validData.billing,
      prc: validData.price,
      crs: validData.course,
      not: validData.note,
      // Ad attribution
      ...trk,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setJti(jti)
      .setExpirationTime('15m')
      .sign(secretKey);

    // Asynchronously fire Step 1 Admin Notification
    const sendEmailTask = async () => {
      try {
        await sendStep1AdminNotification(
          {
            n: validData.name,
            e: validData.email,
            w: validData.whatsapp,
            c: validData.country,
            s: validData.source,
            lid: leadId,
            ...trk,
          },
          resendApiKey,
          adminEmail
        );
      } catch (err) {
        console.error('[Step 1 Admin Notification Failed]:', err);
        // ── Dead-Letter Queue: persist failed lead for manual recovery ──────────
        if (kv) {
          const deadLetterKey = `FAILED_LEAD_STEP1:${leadId}`;
          const deadLetterPayload = JSON.stringify({
            failedAt: new Date().toISOString(),
            step1: validData,
            reason: String(err),
          });
          kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch((e: unknown) =>
            console.error('[Dead-Letter KV Write Failed]:', e)
          );
        }
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locals = context.locals as any;
    if (locals.cfContext?.waitUntil) {
      locals.cfContext.waitUntil(sendEmailTask());
    } else {
      sendEmailTask().catch(console.error);
    }

    // Deliver the JWT as an HttpOnly cookie
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `q_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/`,
      },
    });
  } catch (error) {
    console.error('[API Register Error]:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
