// src/pages/api/newsletter.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { sendNewsletterWelcome } from '../../lib/email';
import { SITE } from '../../constants/site';

const newsletterSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
});

export const prerender = false;

// CRITICAL: This cannot be a static file

export const POST: APIRoute = async (context) => {
  try {
    // 1. Safe Edge Context Extraction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locals = context.locals as any;
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
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Lock the IP for 60 seconds
      await kv
        .put(rateLimitKey, (attempts + 1).toString(), { expirationTtl: 60 })
        .catch((e: unknown) => console.error('[KV RL Failed]:', e));
    }

    const data = (await context.request.json()) as Record<string, unknown>;

    const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
    const adminEmail = (runtimeEnv.ADMIN_EMAIL as string) || 'faisalkhan.llc.ltd@gmail.com';

    // 1. Validate incoming data with Zod
    const parsed = newsletterSchema.safeParse(data);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email } = parsed.data;

    // 2. Dispatch to Resend Audiences + email tasks in the background
    const resendAudienceId = runtimeEnv.RESEND_AUDIENCE_ID as string | undefined;

    const sendEmailTask = async () => {
      if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_123456789') {
        // ── Step A: Push contact to Resend Audiences for list management ──────
        // Handles duplicate/uniqueness at the Resend level (upsert by email).
        if (resendAudienceId) {
          try {
            const audienceRes = await fetch(
              `https://api.resend.com/audiences/${resendAudienceId}/contacts`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email,
                  unsubscribed: false,
                }),
              }
            );
            if (!audienceRes.ok) {
              const errText = await audienceRes.text();
              // 422 = duplicate contact — treat as success (idempotent upsert)
              if (audienceRes.status !== 422) {
                console.error(`[Resend Audiences Error]: ${audienceRes.status} ${errText}`);
              }
            }
          } catch (audienceErr) {
            console.error('[Resend Audiences Fetch Failed]:', audienceErr);
          }
        } else {
          console.warn('[Newsletter]: RESEND_AUDIENCE_ID not set — skipping contact upsert');
        }

        // ── Step B: Admin notification ────────────────────────────────────────
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `Quranific System <${SITE.emails.support}>`,
              to: adminEmail || SITE.emails.admin,
              subject: `New Newsletter Subscriber!`,
              text: `A new user has subscribed to the newsletter.\n\nEmail: ${email}`,
            }),
          });
          if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
        } catch (adminErr) {
          console.error('[Newsletter Admin Notification Failed]:', adminErr);
          if (kv) {
            const deadLetterKey = `FAILED_NEWSLETTER_ADMIN:${Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              email: email,
              reason: String(adminErr),
            });
            try {
              await kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 });
            } catch (e: unknown) {
              console.error('[Dead-Letter KV Write Failed]:', e);
            }
          }
        }

        // ── Step C: Welcome email to subscriber ───────────────────────────────
        try {
          await sendNewsletterWelcome(email, resendApiKey);
        } catch (userErr) {
          console.error('[Newsletter User Welcome Failed]:', userErr);
          if (kv) {
            const deadLetterKey = `FAILED_NEWSLETTER_USER:${Date.now()}`;
            const deadLetterPayload = JSON.stringify({
              failedAt: new Date().toISOString(),
              email: email,
              reason: String(userErr),
            });
            try {
              await kv.put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 });
            } catch (e: unknown) {
              console.error('[Dead-Letter KV Write Failed]:', e);
            }
          }
        }
      } else {
        // Local Mock Mode
        console.log('\n====== 📬 MOCK NEWSLETTER SUB ======');
        console.log(`New Subscriber: ${email}`);
        console.log(`Audience ID: ${resendAudienceId ?? 'NOT SET'}`);
        console.log(`Notification sent to: ${adminEmail}`);
        console.log('====================================\n');
      }
    };

    // 3. Background Task Execution (Safe)
    if (locals.cfContext?.waitUntil) {
      locals.cfContext.waitUntil(sendEmailTask());
    } else {
      sendEmailTask().catch(console.error);
    }

    // 4. Return success immediately
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Newsletter Fatal 500]:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: `System Crash: ${errorMessage}` }), {
      status: 500,
    });
  }
};
