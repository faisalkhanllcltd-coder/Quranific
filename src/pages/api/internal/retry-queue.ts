// src/pages/api/internal/retry-queue.ts
import type { APIRoute } from 'astro';
import { ENV } from '../../../lib/env';
import { sendAdminNotification, sendWelcomeEmail } from '../../../lib/email';

export const prerender = false;

// ─── Types ──────────────────────────────────────────────────────────────────
type KVNamespace = {
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
};

type AppLocals = {
  cfContext?: { env?: { SESSION?: KVNamespace } };
  runtime?: { env?: { SESSION?: KVNamespace } };
};

export const POST: APIRoute = async (context) => {
  try {
    const authHeader = context.request.headers.get('Authorization');

    // Validate the pre-shared key
    if (authHeader !== `Bearer ${ENV.JWT_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const locals = context.locals as AppLocals;
    const kv = locals.cfContext?.env?.SESSION || locals.runtime?.env?.SESSION;

    if (!kv) {
      return new Response(JSON.stringify({ error: 'KV Binding Missing' }), { status: 500 });
    }

    let recoveredCount = 0;

    // 1. Recover Funnel Completions (FAILED_LEAD)
    const leadList = await kv.list({ prefix: 'FAILED_LEAD:' });
    for (const key of leadList.keys) {
      const dataStr = await kv.get(key.name);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        try {
          if (data.taskIndex === 0) {
            await sendAdminNotification(data.step1, data.step2);
          } else if (data.taskIndex === 1) {
            await sendWelcomeEmail(data.step1.e, data.step1.n);
          }
          await kv.delete(key.name);
          recoveredCount++;
        } catch (e) {
          console.error(`Cron retry failed for lead ${key.name}:`, e);
        }
      }
    }

    // 2. Recover Contact Form Inquiries (FAILED_CONTACT)
    const contactList = await kv.list({ prefix: 'FAILED_CONTACT:' });
    for (const key of contactList.keys) {
      const dataStr = await kv.get(key.name);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        const { firstName, lastName, email, message } = data.payload;
        try {
          if (ENV.RESEND_API_KEY.startsWith('re_') && ENV.RESEND_API_KEY !== 're_123456789') {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${ENV.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Quranific Support <support@quranific.com>',
                to: ENV.ADMIN_EMAIL,
                reply_to: email,
                subject: `New Contact Inquiry from ${firstName} ${lastName}`,
                text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
              }),
            });

            if (res.ok) {
              await kv.delete(key.name);
              recoveredCount++;
            } else {
              console.error(`Cron Resend API rejected contact retry for ${key.name}`);
            }
          } else {
            // Local Mock Mode Handling
            await kv.delete(key.name);
            recoveredCount++;
          }
        } catch (e) {
          console.error(`Cron retry failed for contact ${key.name}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, recovered: recoveredCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[CRON Critical Error]:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error during recovery cycle' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
