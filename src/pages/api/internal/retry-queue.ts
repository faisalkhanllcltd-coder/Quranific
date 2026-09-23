// src/pages/api/internal/retry-queue.ts
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import {
  sendStep1AdminNotification,
  sendFullAdminNotification,
  sendWelcomeEmail,
  sendContactAdminNotification,
  sendContactAutoResponder,
  sendNewsletterAdminNotification,
  sendNewsletterWelcome,
  sendTeacherAdminNotification,
  sendTeacherAutoResponder,
  type Step1Data,
  type Step2Data,
  type ContactNotificationData,
  type TeacherData,
} from '../../../lib/email';

export const prerender = false;

// ─── Types ──────────────────────────────────────────────────────────────────
type KVNamespace = {
  list(options?: { prefix?: string; cursor?: string }): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor?: string;
  }>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
};

function normalizeStep1Data(raw: Record<string, unknown>, leadId: string): Step1Data {
  return {
    n: String(raw.n || raw.fullName || raw.name || 'Unknown'),
    e: String(raw.e || raw.email || ''),
    w: String(raw.w || raw.p || raw.whatsapp || raw.phone || ''),
    c: String(raw.c || raw.country || ''),
    s: String(raw.s || raw.source || 'organic'),
    lid: String(raw.lid || leadId),
    et: raw.et ? String(raw.et) : raw.enrollType ? String(raw.enrollType) : undefined,
    dur: raw.dur ? String(raw.dur) : raw.duration ? String(raw.duration) : undefined,
    ses: raw.ses ? String(raw.ses) : raw.sessions ? String(raw.sessions) : undefined,
    cur: raw.cur ? String(raw.cur) : raw.currency ? String(raw.currency) : undefined,
    bil: raw.bil ? String(raw.bil) : raw.billing ? String(raw.billing) : undefined,
    prc: raw.prc ? String(raw.prc) : raw.price ? String(raw.price) : undefined,
    crs: raw.crs ? String(raw.crs) : raw.course ? String(raw.course) : undefined,
    not: raw.not ? String(raw.not) : raw.note ? String(raw.note) : undefined,
    fb: raw.fb ? String(raw.fb) : raw.fbclid ? String(raw.fbclid) : undefined,
    gc: raw.gc ? String(raw.gc) : raw.gclid ? String(raw.gclid) : undefined,
    tt: raw.tt ? String(raw.tt) : raw.ttclid ? String(raw.ttclid) : undefined,
    us: raw.us ? String(raw.us) : raw.utm_source ? String(raw.utm_source) : undefined,
    uc: raw.uc ? String(raw.uc) : raw.utm_campaign ? String(raw.utm_campaign) : undefined,
    um: raw.um ? String(raw.um) : raw.utm_medium ? String(raw.utm_medium) : undefined,
  };
}

export const POST: APIRoute = async (context) => {
  try {
    const authHeader = context.request.headers.get('Authorization');
    const runtimeEnv = env as Record<string, unknown>;
    const jwtSecret = runtimeEnv.JWT_SECRET as string;
    const resendApiKey = runtimeEnv.RESEND_API_KEY as string;
    const adminEmail = (runtimeEnv.ADMIN_EMAIL as string) || 'faisalkhan.llc.ltd@gmail.com';

    // Validate pre-shared Bearer secret
    if (!jwtSecret || authHeader !== `Bearer ${jwtSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const kv = runtimeEnv.SESSION as KVNamespace | undefined;
    if (!kv) {
      return new Response(JSON.stringify({ error: 'KV Binding Missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let recoveredCount = 0;
    const failedKeys: { name: string; error: string }[] = [];
    const dispatches: { key: string; id?: string; timestamp: string }[] = [];

    // Scan all dead-letter keys starting with 'FAILED' (covers both 'FAILED_' and legacy 'FAILED:')
    let cursor: string | undefined = undefined;
    const allKeys: { name: string }[] = [];

    do {
      const listRes = await kv.list({ prefix: 'FAILED', cursor });
      if (listRes.keys && listRes.keys.length > 0) {
        allKeys.push(...listRes.keys);
      }
      cursor = listRes.list_complete ? undefined : listRes.cursor;
    } while (cursor);

    // CIRCUIT BREAKER SETTINGS
    const MAX_BATCH_SIZE = 15;
    const MAX_CONSECUTIVE_FAILURES = 3;
    let consecutiveFailures = 0;
    let circuitBreakerTripped = false;

    // Isolate batch to protect Resend free-tier quota
    const keysToProcess = allKeys.slice(0, MAX_BATCH_SIZE);

    for (const key of keysToProcess) {
      if (circuitBreakerTripped) {
        console.warn(`[Retry-Queue] Circuit breaker tripped. Skipping remaining key: ${key.name}`);
        break;
      }

      const dataStr = await kv.get(key.name);
      if (!dataStr) continue;

      try {
        const data = JSON.parse(dataStr);
        let delivered = false;
        let res: { success: boolean; id?: string } | undefined;

        // 1. FAILED_LEAD_STEP1: Producer writes { failedAt, step1: validData, reason }
        if (key.name.startsWith('FAILED_LEAD_STEP1:')) {
          const leadId = key.name.replace('FAILED_LEAD_STEP1:', '');
          const rawStep1 = data.step1 || data;
          const step1Data = normalizeStep1Data(rawStep1, leadId);
          res = await sendStep1AdminNotification(step1Data, resendApiKey, adminEmail);
          delivered = true;
        }

        // 2. FAILED_LEAD_STEP2: Producer writes { failedAt, step1: step1Data, step2: parsed.data, reason }
        else if (key.name.startsWith('FAILED_LEAD_STEP2:')) {
          const leadId = key.name.replace('FAILED_LEAD_STEP2:', '');
          const rawStep1 = data.step1 || {};
          const step1Data = normalizeStep1Data(rawStep1, leadId);
          const step2Data: Step2Data = data.step2 || {};
          res = await sendFullAdminNotification(step1Data, step2Data, resendApiKey, adminEmail);
          delivered = true;
        }

        // 3. FAILED_LEAD_WELCOME: Producer writes { failedAt, step1: step1Data, step2: parsed.data, reason }
        else if (key.name.startsWith('FAILED_LEAD_WELCOME:')) {
          const rawStep1 = data.step1 || {};
          const email = rawStep1.e || rawStep1.email;
          const name = rawStep1.n || rawStep1.fullName || rawStep1.name || 'Student';
          if (!email) {
            throw new Error(`Missing email in FAILED_LEAD_WELCOME payload for key: ${key.name}`);
          }
          res = await sendWelcomeEmail(email, name, resendApiKey);
          delivered = true;
        }

        // 4. FAILED_CONTACT_ADMIN or legacy FAILED_CONTACT: { failedAt, payload: parsed.data, reason }
        else if (
          key.name.startsWith('FAILED_CONTACT_ADMIN:') ||
          key.name.startsWith('FAILED_CONTACT:')
        ) {
          const payload = (data.payload || data) as ContactNotificationData;
          res = await sendContactAdminNotification(payload, resendApiKey, adminEmail);
          delivered = true;
        }

        // 5. FAILED_CONTACT_USER: { failedAt, payload: parsed.data, reason }
        else if (key.name.startsWith('FAILED_CONTACT_USER:')) {
          const payload = data.payload || data;
          const email = payload.email;
          const firstName = payload.firstName || 'Student';
          if (!email) {
            throw new Error(`Missing email in FAILED_CONTACT_USER payload for key: ${key.name}`);
          }
          res = await sendContactAutoResponder(email, firstName, resendApiKey);
          delivered = true;
        }

        // 6. FAILED_NEWSLETTER_ADMIN: { failedAt, email, reason }
        else if (key.name.startsWith('FAILED_NEWSLETTER_ADMIN:')) {
          const email = data.email;
          if (!email) {
            throw new Error(
              `Missing email in FAILED_NEWSLETTER_ADMIN payload for key: ${key.name}`
            );
          }
          res = await sendNewsletterAdminNotification(email, resendApiKey, adminEmail);
          delivered = true;
        }

        // 7. FAILED_NEWSLETTER_USER: { failedAt, email, reason }
        else if (key.name.startsWith('FAILED_NEWSLETTER_USER:')) {
          const email = data.email;
          if (!email) {
            throw new Error(`Missing email in FAILED_NEWSLETTER_USER payload for key: ${key.name}`);
          }
          res = await sendNewsletterWelcome(email, resendApiKey);
          delivered = true;
        }

        // 8. FAILED_TEACHER_ADMIN or FAILED_TEACHER: { failedAt, payload: TeacherData, reason }
        else if (
          key.name.startsWith('FAILED_TEACHER_ADMIN:') ||
          key.name.startsWith('FAILED_TEACHER:')
        ) {
          const payload = (data.payload || data) as TeacherData;
          res = await sendTeacherAdminNotification(payload, resendApiKey, adminEmail);
          delivered = true;
        }

        // 9. FAILED_TEACHER_USER: { failedAt, payload: { email, fullName }, reason }
        else if (key.name.startsWith('FAILED_TEACHER_USER:')) {
          const payload = data.payload || data;
          const email = payload.email;
          const fullName = payload.fullName || 'Teacher';
          if (!email) {
            throw new Error(`Missing email in FAILED_TEACHER_USER payload for key: ${key.name}`);
          }
          res = await sendTeacherAutoResponder(email, fullName, resendApiKey);
          delivered = true;
        }

        // 10. Legacy FAILED_LEAD: { taskIndex: 0 | 1, step1, step2 }
        else if (key.name.startsWith('FAILED_LEAD:')) {
          if (data.taskIndex === 0) {
            const leadId = key.name.replace('FAILED_LEAD:', '');
            const step1Data = normalizeStep1Data(data.step1 || {}, leadId);
            res = await sendFullAdminNotification(
              step1Data,
              data.step2 || {},
              resendApiKey,
              adminEmail
            );
            delivered = true;
          } else if (data.taskIndex === 1) {
            const email = data.step1?.e || data.step1?.email;
            const name = data.step1?.n || data.step1?.name || 'Student';
            if (!email) throw new Error('Missing email in legacy FAILED_LEAD');
            res = await sendWelcomeEmail(email, name, resendApiKey);
            delivered = true;
          }
        }

        if (delivered) {
          await kv.delete(key.name);
          dispatches.push({
            key: key.name,
            id: res?.id,
            timestamp: new Date().toISOString(),
          });
          recoveredCount++;
          consecutiveFailures = 0; // Reset breaker on success
        }
      } catch (err) {
        console.error(`[Retry-Queue] Processing failed for key ${key.name}:`, err);
        failedKeys.push({ name: key.name, error: String(err) });

        consecutiveFailures++;
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          circuitBreakerTripped = true;
          console.error(
            '[Retry-Queue] CRITICAL: Maximum consecutive failures reached. Circuit breaker engaged.'
          );
        }
      }
    }

    if ((recoveredCount > 0 || circuitBreakerTripped) && runtimeEnv.ALERT_WEBHOOK_URL) {
      const remainingTotal = allKeys.length - recoveredCount;
      const breakerStatus = circuitBreakerTripped ? ' ⚠️ CIRCUIT BREAKER TRIPPED.' : '';
      await fetch(runtimeEnv.ALERT_WEBHOOK_URL as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `[Quranific DLQ] Recovered ${recoveredCount} failed email(s). ${remainingTotal} total items remain in queue.${breakerStatus}`,
        }),
      }).catch((err: unknown) => {
        console.error('[DLQ Alert Webhook Failed]:', err);
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        recovered: recoveredCount,
        failed: failedKeys.length,
        totalRemaining: allKeys.length - recoveredCount,
        circuitBreakerTripped,
        dispatches: dispatches.length > 0 ? dispatches : undefined,
        failedDetails: failedKeys.length > 0 ? failedKeys : undefined,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[CRON Critical Error]:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error during recovery cycle' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = async (context) => {
  try {
    const authHeader = context.request.headers.get('Authorization');
    const runtimeEnv = env as Record<string, unknown>;
    const jwtSecret = runtimeEnv.JWT_SECRET as string;
    const resendApiKey = runtimeEnv.RESEND_API_KEY as string;

    if (!jwtSecret || authHeader !== `Bearer ${jwtSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY Missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(context.request.url);
    const emailId = url.searchParams.get('id');
    const resendUrl = emailId
      ? `https://api.resend.com/emails/${encodeURIComponent(emailId)}`
      : 'https://api.resend.com/emails?limit=10';

    const resendRes = await fetch(resendUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const resendBody = await resendRes.text();
    return new Response(resendBody, {
      status: resendRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
