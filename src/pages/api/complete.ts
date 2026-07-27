// src/pages/api/complete.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { completeSchema } from '../../lib/schema';
import { sendFullAdminNotification, sendWelcomeEmail } from '../../lib/email';
import { jwtVerify } from 'jose';

export const prerender = false;

// ─── HEAD & GET: Pre-flight session check ─────────────────────────────────────────
export const HEAD: APIRoute = async (context) => {
  const cookieHeader = context.request.headers.get('cookie');
  const token = getCookieValue(cookieHeader, 'q_session');

  if (!token) {
    return new Response(null, { status: 401 });
  }

  try {
    const runtimeEnv = env as Record<string, unknown>;
    const jwtSecret = runtimeEnv.JWT_SECRET as string;

    if (!jwtSecret) {
      console.error('[Configuration Error]: Missing JWT_SECRET');
      return new Response(null, { status: 500 });
    }

    const secret = new TextEncoder().encode(jwtSecret);
    await jwtVerify(token, secret);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 401 });
  }
};
export const GET = HEAD;

// ─── Cookie Parser ──────────────────────────────────────────────────────────
function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key.trim() === name) return rest.join('=').trim();
  }
  return null;
}

// ─── KV Helper ──────────────────────────────────────────────────────────────
type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

function getKV(): KVNamespace | null {
  const kv = (env as Record<string, unknown>).SESSION;
  return kv && typeof (kv as KVNamespace).get === 'function' ? (kv as KVNamespace) : null;
}

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.formData();
    const formData = Object.fromEntries(data);

    const runtimeEnv = env as Record<string, unknown>;
    const jwtSecret = runtimeEnv.JWT_SECRET as string;
    const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
    const adminEmail = (runtimeEnv.ADMIN_EMAIL as string) || 'faisalkhan.llc.ltd@gmail.com';

    if (!jwtSecret) {
      console.error('[Configuration Error]: Missing Secrets in Edge Env');
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsed = completeSchema.safeParse(formData);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.errors[0].message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Read the JWT from the HttpOnly cookie (NOT the form body)
    const cookieHeader = context.request.headers.get('cookie');
    const token = getCookieValue(cookieHeader, 'q_session');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Session not found. Please start over.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Decode and verify the 15-minute session token
    let step1Data: { n: string; e: string; w: string; c: string; s: string };
    let jti: string | undefined;

    try {
      const secret = new TextEncoder().encode(jwtSecret);
      const { payload } = await jwtVerify(token, secret);
      step1Data = payload as typeof step1Data;
      jti = payload.jti as string | undefined;
    } catch {
      return new Response(JSON.stringify({ error: 'Session expired. Please start over.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Idempotency Check via Cloudflare KV
    const kv = getKV();
    if (kv && jti) {
      const existing = await kv.get(`IDEMPOTENCY:${jti}`);
      if (existing) {
        console.log(`[API Complete] Duplicate submission blocked for jti: ${jti}`);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 4. Process emails asynchronously using waitUntil
    const sendEmailsTask = async () => {
      try {
        try {
          await sendFullAdminNotification(step1Data, parsed.data, resendApiKey, adminEmail);
        } catch (adminErr) {
          console.error('[Step 2 Admin Notification Failed]:', adminErr);
          if (kv) {
            const deadLetterKey = `FAILED_LEAD_ADMIN:${Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              step1: step1Data,
              step2: parsed.data,
              reason: String(adminErr),
            });
            kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch(
              (e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e)
            );
          }
        }

        try {
          await sendWelcomeEmail(step1Data.e, step1Data.n, resendApiKey);
        } catch (welcomeErr) {
          console.error('[Step 2 Welcome Email Failed]:', welcomeErr);
          if (kv) {
            const deadLetterKey = `FAILED_LEAD_WELCOME:${Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              step1: step1Data,
              step2: parsed.data,
              reason: String(welcomeErr),
            });
            kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 }).catch(
              (e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e)
            );
          }
        }

        // 5. Mark this jti as processed in KV
        if (kv && jti) {
          await kv
            .put(`IDEMPOTENCY:${jti}`, '1', { expirationTtl: 960 })
            .catch((e: unknown) => console.error('[Idempotency KV Write Failed]:', e));
        }
      } catch (error) {
        console.error('[Email Task Critical Error]:', error);
      }
    };

    // Background Task Execution (Mandate 1 - Modernized Path)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locals = context.locals as any;
    if (locals.cfContext?.waitUntil) {
      locals.cfContext.waitUntil(sendEmailsTask());
    } else if (locals.runtime?.ctx?.waitUntil) {
      locals.runtime.ctx.waitUntil(sendEmailsTask());
    } else {
      sendEmailsTask().catch(console.error);
    }

    // 6. Clear the session cookie
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'q_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/funnel',
      },
    });
  } catch (error) {
    console.error('[API Complete Error]:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
