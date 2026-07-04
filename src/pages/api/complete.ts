// src/pages/api/complete.ts
import type { APIRoute } from 'astro';
import { completeSchema } from '../../lib/schema';
import { ENV } from '../../lib/env';
import { sendAdminNotification, sendWelcomeEmail } from '../../lib/email';
import { jwtVerify } from 'jose';

export const prerender = false;

// ─── HEAD: Pre-flight session check ─────────────────────────────────────────
// CompleteForm.svelte calls HEAD /api/complete on mount to check if the
// HttpOnly cookie session exists before rendering the form.
// Returns 200 if session cookie is valid, 401 if absent or expired.
export const HEAD: APIRoute = async (context) => {
  const cookieHeader = context.request.headers.get('cookie');
  const token = getCookieValue(cookieHeader, 'q_session');

  if (!token) {
    return new Response(null, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(ENV.JWT_SECRET);
    await jwtVerify(token, secret);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 401 });
  }
};

// ─── Cookie Parser (lightweight, no dependencies) ───────────────────────────
function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key.trim() === name) return rest.join('=').trim();
  }
  return null;
}

// ─── KV Helper (gracefully no-ops when binding is absent in local dev) ───────
type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

function getKV(context: Parameters<APIRoute>[0]): KVNamespace | null {
  // The binding name must match the [[kv_namespaces]] binding in wrangler.toml
  const kv = ((context.locals as any).runtime?.env as Record<string, unknown> | undefined)?.['SESSION'];
  return (kv && typeof (kv as KVNamespace).get === 'function')
    ? kv as KVNamespace
    : null;
}

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.formData();
    const formData = Object.fromEntries(data);

    const parsed = completeSchema.safeParse(formData);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Read the JWT from the HttpOnly cookie (NOT the form body)
    const cookieHeader = context.request.headers.get('cookie');
    const token = getCookieValue(cookieHeader, 'q_session');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Session not found. Please start over.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Decode and verify the 15-minute session token
    let step1Data: { n: string; e: string; w: string; c: string; s: string };
    let jti: string | undefined;

    try {
      const secret = new TextEncoder().encode(ENV.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      step1Data = payload as typeof step1Data;
      jti = payload.jti as string | undefined;
    } catch {
      return new Response(
        JSON.stringify({ error: 'Session expired. Please start over.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Idempotency Check via Cloudflare KV
    //    If this jti has already been processed, return success without re-sending emails.
    const kv = getKV(context);
    if (kv && jti) {
      const existing = await kv.get(`IDEMPOTENCY:${jti}`);
      if (existing) {
        console.log(`[API Complete] Duplicate submission blocked for jti: ${jti}`);
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Process emails asynchronously using waitUntil
    const sendEmailsTask = async () => {
      try {
        const emailResults = await Promise.allSettled([
          sendAdminNotification(step1Data, parsed.data),
          sendWelcomeEmail(step1Data.e, step1Data.n),
        ]);

        // Check for failures and implement dead-letter pattern
        emailResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`[Email Task ${index} Failed]:`, result.reason);

            // Dead-letter: persist the failed lead payload to KV so it can be recovered
            if (kv) {
              const deadLetterKey = `FAILED_LEAD:${Date.now()}`;
              const deadLetterPayload = JSON.stringify({
                failedAt: new Date().toISOString(),
                taskIndex: index,
                step1: step1Data,
                step2: parsed.data,
                reason: String(result.reason),
              });
              // TTL of 30 days (2592000 seconds) to allow manual recovery
              kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 })
                .catch(e => console.error('[Dead-Letter KV Write Failed]:', e));
            }
          }
        });

        // 5. Mark this jti as processed in KV (TTL = 16 minutes, slightly longer than the JWT)
        if (kv && jti) {
          await kv.put(`IDEMPOTENCY:${jti}`, '1', { expirationTtl: 960 })
            .catch(e => console.error('[Idempotency KV Write Failed]:', e));
        }

      } catch (error) {
        console.error('[Email Task Critical Error]:', error);
      }
    };

    if ((context.locals as any).runtime?.ctx?.waitUntil) {
      (context.locals as any).runtime.ctx.waitUntil(sendEmailsTask());
    } else {
      sendEmailsTask().catch(console.error);
    }

    // 6. Clear the session cookie now that the funnel is complete
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Expire the cookie immediately after successful completion
          'Set-Cookie': 'q_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/funnel',
        },
      }
    );

  } catch (error) {
    console.error('[API Complete Error]:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};