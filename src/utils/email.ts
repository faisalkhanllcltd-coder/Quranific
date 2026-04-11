// src/utils/email.ts
import { Resend } from 'resend';
import { ENV } from './env';

// Lazy factory — instantiated per-call to avoid module-level global state leaking
// across V8 isolate invocations on Cloudflare Workers.
function getResend(): Resend | null {
  const key = ENV.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend();
  if (!resend) return { success: true, mock: true };

  try {
    await resend.emails.send({
      from: 'Quranific Support <support@quranific.com>',
      to: email,
      subject: 'Welcome to Quranific! Your journey begins.',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>As-salamu alaykum, ${name}!</h2>
          <p>Your registration is almost complete. Our team is reviewing your preferences to match you with the perfect tutor.</p>
          <p>Please ensure you message us on WhatsApp to finalize your free trial schedule.</p>
          <br/>
          <p>Warm regards,<br/>The Quranific Team</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Welcome Email failed:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(step1Data: any, step2Data: any) {
  const resend = getResend();
  if (!resend) return { success: true, mock: true };

  try {
    const fullProfileHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
        <h2 style="color: #065f46;">🎉 New Student Lead: ${step1Data.n}</h2>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0;"><strong>Traffic Source:</strong> <span style="color: #059669; font-weight: bold;">${step1Data.s || 'organic'}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${step1Data.e}</p>
          <p style="margin: 0 0 8px 0;"><strong>WhatsApp:</strong> ${step1Data.w}</p>
          <p style="margin: 0;"><strong>Country:</strong> ${step1Data.c}</p>
        </div>
        <h3 style="color: #0f172a;">Course Preferences</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Course:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${step2Data.course}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Level:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${step2Data.level}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Schedule:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${step2Data.schedule} (${step2Data.days})</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Gender Match:</strong></td><td style="padding: 8px 0;">${step2Data.gender} Student / ${step2Data.teacherGender}</td></tr>
        </table>
      </div>
    `;

    await resend.emails.send({
      from: 'System <onboarding@quranific.com>',
      to: ENV.ADMIN_EMAIL,
      subject: `🚨 NEW LEAD: ${step1Data.n} - ${step2Data.course}`,
      html: fullProfileHtml,
    });
    return { success: true };
  } catch (error) {
    console.error('Admin Email failed:', error);
    return { success: false, error };
  }
}