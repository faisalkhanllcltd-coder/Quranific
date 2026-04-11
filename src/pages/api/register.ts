// src/pages/api/register.ts
import type { APIRoute } from 'astro';
import { signupSchema } from '../../utils/schema';
import { ENV } from '../../utils/env';
import { SignJWT } from 'jose';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.formData();
    const formData = Object.fromEntries(data);

    const parsed = signupSchema.safeParse(formData);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.errors[0].message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validData = parsed.data;

    // Bot trap - silent success for bots
    if (validData.honeypot) {
      return new Response(JSON.stringify({ success: true, token: 'bot-trap' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Stateless Session Management via JWT
    const secret = new TextEncoder().encode(ENV.JWT_SECRET);
    const token = await new SignJWT({
      n: validData.name,
      e: validData.email,
      w: validData.whatsapp,
      c: validData.country,
      s: validData.source
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);

    return new Response(JSON.stringify({ success: true, token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API Register Error]:', error); // Logs to Cloudflare dashboard
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};