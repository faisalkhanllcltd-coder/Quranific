// src/pages/api/register.ts
import type { APIRoute } from 'astro';
import { signupSchema } from '../../lib/schema';
import { ENV } from '../../lib/env';
import { SignJWT } from 'jose';

export const prerender = false;

// ─── Cloudflare Turnstile Verification ──────────────────────────────────────
async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({
      secret:   ENV.TURNSTILE_SECRET_KEY,
      response: token,
    });
    if (remoteip) body.set('remoteip', remoteip);

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body }
    );
    if (!res.ok) return false;
    const data = await res.json() as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.formData();
    const formData = Object.fromEntries(data);

    const parsed = signupSchema.safeParse(formData);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validData = parsed.data;

    // Bot trap - silent success for bots (honeypot field)
    if (validData.honeypot) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Server-side Turnstile verification
    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') ?? undefined;
    const isHuman = await verifyTurnstile(validData.turnstileToken, cfConnectingIp);
    if (!isHuman) {
      return new Response(
        JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stateless Session Management via JWT (now includes jti for idempotency)
    const secret = new TextEncoder().encode(ENV.JWT_SECRET);
    const jti = crypto.randomUUID();

    const token = await new SignJWT({
      n: validData.name,
      e: validData.email,
      w: validData.whatsapp,
      c: validData.country,
      s: validData.source,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setJti(jti)
      .setExpirationTime('15m')
      .sign(secret);

    // Deliver the JWT as an HttpOnly cookie — never exposed to JavaScript
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // HttpOnly prevents XSS from reading the token.
          // Secure ensures it is only sent over HTTPS.
          // SameSite=Strict prevents CSRF.
          // Path=/funnel scopes it to the funnel pages only.
          'Set-Cookie': `q_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/funnel`,
        },
      }
    );

  } catch (error) {
    console.error('[API Register Error]:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};