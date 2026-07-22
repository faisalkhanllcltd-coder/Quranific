// src/utils/email.ts
import { Resend } from 'resend';
import { ENV } from './env';

// ─── HTML Escaping Helper ────────────────────────────────────────────────────
// Prevents XSS / HTML injection when user-supplied data is interpolated into
// HTML email strings. MUST be applied to every user-input interpolation.
function esc(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Lazy factory — instantiated per-call to avoid module-level global state leaking
// across V8 isolate invocations on Cloudflare Workers.
function getResend(): Resend | null {
  const key = ENV.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend();
  if (!resend) return { success: true, mock: true };

  // Escape user-supplied name to prevent HTML injection in the welcome email
  const safeName = esc(name);

  try {
    await resend.emails.send({
      from:     'Quranific Support <support@quranific.com>',
      to:       email,
      replyTo: 'support@quranific.com',
      subject:  'Welcome to Quranific! Your journey begins.',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>As-salamu alaykum, ${safeName}!</h2>
          <p>Your registration is almost complete. Our team is reviewing your preferences to match you with the perfect tutor.</p>
          <p>Please ensure you message us on WhatsApp to finalize your free trial schedule.</p>
          <br/>
          <p>Warm regards,<br/>The Quranific Team</p>
        </div>
      `,
      text: `As-salamu alaykum, ${name}!\n\nYour registration is almost complete. Our team is reviewing your preferences to match you with the perfect tutor.\n\nPlease ensure you message us on WhatsApp to finalize your free trial schedule.\n\nWarm regards,\nThe Quranific Team`,
    });
    return { success: true };
  } catch (error) {
    console.error('Welcome Email failed:', error);
    throw error;
  }
}

// Typed wrappers for the step-data objects passed from API routes
interface Step1Data { n: string; e: string; w: string; c: string; s?: string; }
interface Step2Data {
  course: string; level: string; schedule: string;
  days: string; gender: string; teacherGender: string;
}

export async function sendAdminNotification(step1Data: Step1Data, step2Data: Step2Data) {
  const resend = getResend();
  if (!resend) return { success: true, mock: true };

  // Escape ALL user-supplied fields before embedding in HTML
  const safeName     = esc(String(step1Data.n ?? ''));
  const safeEmail    = esc(String(step1Data.e ?? ''));
  const safeWhatsapp = esc(String(step1Data.w ?? ''));
  const safeCountry  = esc(String(step1Data.c ?? ''));
  const safeSource   = esc(String(step1Data.s ?? 'organic'));
  const safeCourse   = esc(String(step2Data.course ?? ''));
  const safeLevel    = esc(String(step2Data.level ?? ''));
  const safeSchedule = esc(String(step2Data.schedule ?? ''));
  const safeDays     = esc(String(step2Data.days ?? ''));
  const safeGender   = esc(String(step2Data.gender ?? ''));
  const safeTeacher  = esc(String(step2Data.teacherGender ?? ''));

  try {
    const fullProfileHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
        <h2 style="color: #065f46;">🎉 New Student Lead: ${safeName}</h2>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0;"><strong>Traffic Source:</strong> <span style="color: #059669; font-weight: bold;">${safeSource}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${safeEmail}</p>
          <p style="margin: 0 0 8px 0;"><strong>WhatsApp:</strong> ${safeWhatsapp}</p>
          <p style="margin: 0;"><strong>Country:</strong> ${safeCountry}</p>
        </div>
        <h3 style="color: #0f172a;">Course Preferences</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Course:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeCourse}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Level:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeLevel}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Schedule:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeSchedule} (${safeDays})</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Gender Match:</strong></td><td style="padding: 8px 0;">${safeGender} Student / ${safeTeacher}</td></tr>
        </table>
      </div>
    `;

    const fullProfileText = `🎉 New Student Lead: ${step1Data.n}\n\nTraffic Source: ${step1Data.s || 'organic'}\nEmail: ${step1Data.e}\nWhatsApp: ${step1Data.w}\nCountry: ${step1Data.c}\n\nCourse Preferences\nCourse: ${step2Data.course}\nLevel: ${step2Data.level}\nSchedule: ${step2Data.schedule} (${step2Data.days})\nGender Match: ${step2Data.gender} Student / ${step2Data.teacherGender}`;

    await resend.emails.send({
      from:    'System <onboarding@quranific.com>',
      to:      ENV.ADMIN_EMAIL,
      subject: `🚨 NEW LEAD: ${step1Data.n} - ${step2Data.course}`,
      html:    fullProfileHtml,
      text:    fullProfileText,
    });
    return { success: true };
  } catch (error) {
    console.error('Admin Email failed:', error);
    throw error;
  }
}