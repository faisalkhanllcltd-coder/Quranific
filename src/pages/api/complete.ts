// src/pages/api/complete.ts
import type { APIRoute } from 'astro';
import { completeSchema } from '../../utils/schema';
import { ENV } from '../../utils/env';
import { sendAdminNotification, sendWelcomeEmail } from '../../utils/email';
import { jwtVerify } from 'jose';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.formData();
    const formData = Object.fromEntries(data);

    const parsed = completeSchema.safeParse(formData);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.errors[0].message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = parsed.data.sessionToken;
    if (token === 'bot-trap') {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Decode and verify the 15-minute session token
    let step1Data;
    try {
      const secret = new TextEncoder().encode(ENV.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      step1Data = payload as { n: string, e: string, w: string, c: string, s: string };
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Session expired. Please start over.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process emails asynchronously but await their completion to satisfy Cloudflare Workers
    const emailResults = await Promise.allSettled([
      sendAdminNotification(step1Data, parsed.data),
      sendWelcomeEmail(step1Data.e, step1Data.n)
    ]);

    // Log silent email failures so you can diagnose Resend issues without breaking the UI
    emailResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[Email Task ${index} Failed]:`, result.reason);
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API Complete Error]:', error); // Logs to Cloudflare dashboard
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};