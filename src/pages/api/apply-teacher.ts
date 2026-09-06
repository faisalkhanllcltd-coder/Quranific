// src/pages/api/apply-teacher.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  sendTeacherAdminNotification,
  sendTeacherAutoResponder,
  type TeacherData,
} from '../../lib/email';

export const prerender = false;

const teacherSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  whatsapp: z.string().min(6, 'Valid WhatsApp number is required'),
  resumeLink: z.string().url('A valid public resume/CV URL is required'),
  ijazah: z.string().min(1, 'Ijazah qualification is required'),
  alim: z.string().min(1, 'Alim/Alima qualification is required'),
  experience: z.string().min(1, 'Teaching experience is required'),
  english: z.string().min(1, 'English fluency is required'),
  arabic: z.string().min(1, 'Arabic fluency is required'),
  'cf-turnstile-response': z.string().min(1, 'Please complete the security check.'),
});

// ─── Cloudflare Turnstile Verification ──────────────────────────────────────
async function verifyTurnstile(token: string, secret: string, remoteip?: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({
      secret: secret,
      response: token,
    });
    if (remoteip && remoteip !== 'unknown') {
      body.set('remoteip', remoteip);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      console.error('[Turnstile Edge Rejection] Error codes:', data['error-codes']);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Turnstile Fetch Exception]:', error);
    return false;
  }
}

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

function getKV(): KVNamespace | null {
  return ((env as Record<string, unknown>).SESSION as KVNamespace) || null;
}

export const POST: APIRoute = async (context) => {
  try {
    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const kv = getKV();

    // 1. Distributed IP Rate Limiting via KV (4 submissions per 60s per IP)
    if (kv && cfConnectingIp !== 'unknown') {
      const rateLimitKey = `RL:TEACHER:${cfConnectingIp}`;
      const attemptsStr = await kv.get(rateLimitKey);
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

      if (attempts >= 4) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a minute before trying again.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      await kv
        .put(rateLimitKey, (attempts + 1).toString(), { expirationTtl: 60 })
        .catch((e: unknown) => console.error('[KV RL Failed]:', e));
    }

    const data = (await context.request.json()) as Record<string, unknown>;

    // 2. Validate all fields including Turnstile token
    const parsed = teacherSchema.safeParse(data);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const teacherData: TeacherData = {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      resumeLink: parsed.data.resumeLink,
      ijazah: parsed.data.ijazah,
      alim: parsed.data.alim,
      experience: parsed.data.experience,
      english: parsed.data.english,
      arabic: parsed.data.arabic,
    };
    const turnstileToken = parsed.data['cf-turnstile-response'];

    const runtimeEnv = env as Record<string, unknown>;
    const turnstileSecret = (runtimeEnv.TURNSTILE_SECRET ??
      runtimeEnv.TURNSTILE_SECRET_KEY) as string;
    const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
    const adminEmail = (runtimeEnv.ADMIN_EMAIL as string) || 'faisalkhan.llc.ltd@gmail.com';

    if (!turnstileSecret) {
      console.error('[Configuration Error]: Missing Turnstile Secret');
      return new Response(JSON.stringify({ error: 'Internal Configuration Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Server-side Turnstile verification
    const isHuman = await verifyTurnstile(turnstileToken, turnstileSecret, cfConnectingIp);
    if (!isHuman) {
      return new Response(
        JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Dispatch Emails & Dead-Letter Queue on failure
    try {
      await Promise.all([
        sendTeacherAdminNotification(teacherData, resendApiKey, adminEmail),
        sendTeacherAutoResponder(teacherData.email, teacherData.fullName, resendApiKey),
      ]);
    } catch (emailErr) {
      console.error('[Teacher Application Email Failed]:', emailErr);
      if (kv) {
        const deadLetterKey = `FAILED_TEACHER:${Date.now()}`;
        const deadLetterPayload = JSON.stringify({
          failedAt: new Date().toISOString(),
          payload: teacherData,
          reason: String(emailErr),
        });
        await kv
          .put(deadLetterKey, deadLetterPayload, { expirationTtl: 2592000 })
          .catch((e: unknown) => console.error('[Dead-Letter KV Write Failed]:', e));
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Teacher Application API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
