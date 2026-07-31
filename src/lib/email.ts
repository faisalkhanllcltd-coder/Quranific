// src/lib/email.ts
// Removed Resend SDK to prevent Edge incompatibilities with Node.js native modules.

// ─── HTML Escaping Helper ────────────────────────────────────────────────────
function esc(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export interface Step1Data {
  n: string; // name
  e: string; // email
  w: string; // whatsapp
  c: string; // country
  s?: string; // source
  fb?: string;
  gc?: string;
  tt?: string;
  us?: string;
  uc?: string;
  um?: string;
}

export interface Step2Data {
  course: string;
  level: string;
  schedule: string;
  days: string;
  gender: string;
  teacherGender: string;
}

const FALLBACK_ADMIN_EMAIL = 'faisalkhan.llc.ltd@gmail.com';

// ─── Task 1: The Email Engine Functions ──────────────────────────────────────

export async function sendStep1AdminNotification(
  step1Data: Step1Data,
  apiKey: string,
  adminEmail: string | undefined | null
) {
  if (!apiKey || apiKey === 're_123456789') return { success: true, mock: true };

  const safeName = esc(String(step1Data.n || 'Unknown'));
  const safeEmail = esc(String(step1Data.e || 'Unknown'));
  const safeWhatsapp = esc(String(step1Data.w || 'Unknown'));
  const safeCountry = esc(String(step1Data.c || 'Unknown'));
  const safeSource = esc(String(step1Data.s || 'organic'));

  const finalAdminEmail = adminEmail || FALLBACK_ADMIN_EMAIL;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
      <h2 style="color: #065f46;">⏳ Partial Lead (Step 1 Captured)</h2>
      <p>A new user has completed Step 1 of the funnel.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 8px 0;"><strong>WhatsApp:</strong> ${safeWhatsapp}</p>
        <p style="margin: 0 0 8px 0;"><strong>Country:</strong> ${safeCountry}</p>
        <p style="margin: 0;"><strong>Traffic Source:</strong> <span style="color: #059669; font-weight: bold;">${safeSource}</span></p>
      </div>
    </div>
  `;

  const text = `Partial Lead (Step 1 Captured)\nName: ${safeName}\nEmail: ${safeEmail}\nWhatsApp: ${safeWhatsapp}\nCountry: ${safeCountry}\nSource: ${safeSource}`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'System <onboarding@quranific.com>',
        to: finalAdminEmail,
        subject: `⏳ Partial Lead: ${safeName}`,
        html,
        text,
      }),
    });

    if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
    return { success: true };
  } catch (error) {
    console.error('sendStep1AdminNotification failed:', error);
    throw error;
  }
}

export async function sendFullAdminNotification(
  step1Data: Step1Data,
  step2Data: Step2Data,
  apiKey: string,
  adminEmail: string | undefined | null
) {
  if (!apiKey || apiKey === 're_123456789') return { success: true, mock: true };

  const safeName = esc(String(step1Data.n || ''));
  const safeEmail = esc(String(step1Data.e || ''));
  const safeWhatsapp = esc(String(step1Data.w || ''));
  const safeCountry = esc(String(step1Data.c || ''));
  const safeSource = esc(String(step1Data.s || 'organic'));
  const safeCourse = esc(String(step2Data.course || ''));
  const safeLevel = esc(String(step2Data.level || ''));
  const safeSchedule = esc(String(step2Data.schedule || ''));
  const safeDays = esc(String(step2Data.days || ''));
  const safeGender = esc(String(step2Data.gender || ''));
  const safeTeacher = esc(String(step2Data.teacherGender || ''));

  const finalAdminEmail = adminEmail || FALLBACK_ADMIN_EMAIL;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
      <h2 style="color: #065f46;">🎉 New Student Lead: ${safeName} (Full Registration)</h2>
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

  const text = `🎉 New Student Lead: ${safeName}\n\nTraffic Source: ${safeSource}\nEmail: ${safeEmail}\nWhatsApp: ${safeWhatsapp}\nCountry: ${safeCountry}\n\nCourse Preferences\nCourse: ${safeCourse}\nLevel: ${safeLevel}\nSchedule: ${safeSchedule} (${safeDays})\nGender Match: ${safeGender} Student / ${safeTeacher}`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'System <onboarding@quranific.com>',
        to: finalAdminEmail,
        subject: `🚨 NEW LEAD: ${safeName} - ${safeCourse}`,
        html,
        text,
      }),
    });

    if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
    return { success: true };
  } catch (error) {
    console.error('sendFullAdminNotification failed:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string, apiKey: string) {
  if (!apiKey || apiKey === 're_123456789') return { success: true, mock: true };
  const safeName = esc(name);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Quranific Support <support@quranific.com>',
        to: email,
        reply_to: 'support@quranific.com',
        subject: 'Welcome to Quranific! Your journey begins.',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>As-salamu alaykum, ${safeName}!</h2>
            <p>Your registration is complete. Our team is reviewing your preferences to match you with the perfect tutor.</p>
            <p>Please ensure you message us on WhatsApp to finalize your free trial schedule.</p>
            <br/>
            <p>Warm regards,<br/>The Quranific Team</p>
          </div>
        `,
        text: `As-salamu alaykum, ${name}!\n\nYour registration is complete. Our team is reviewing your preferences to match you with the perfect tutor.\n\nPlease ensure you message us on WhatsApp to finalize your free trial schedule.\n\nWarm regards,\nThe Quranific Team`,
      }),
    });

    if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
    return { success: true };
  } catch (error) {
    console.error('sendWelcomeEmail failed:', error);
    throw error;
  }
}

export async function sendContactAutoResponder(email: string, name: string, apiKey: string) {
  if (!apiKey || apiKey === 're_123456789') return { success: true, mock: true };
  const safeName = esc(name);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Quranific Support <support@quranific.com>',
        to: email,
        reply_to: 'support@quranific.com',
        subject: 'We received your message',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>As-salamu alaykum, ${safeName}!</h2>
            <p>We received your message. We will be in touch shortly.</p>
            <p>You can also reach us immediately on WhatsApp for a faster response.</p>
            <br/>
            <p>Warm regards,<br/>The Quranific Team</p>
          </div>
        `,
        text: `As-salamu alaykum, ${name}!\n\nWe received your message. We will be in touch shortly.\n\nYou can also reach us immediately on WhatsApp for a faster response.\n\nWarm regards,\nThe Quranific Team`,
      }),
    });

    if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
    return { success: true };
  } catch (error) {
    console.error('sendContactAutoResponder failed:', error);
    throw error;
  }
}

export async function sendNewsletterWelcome(email: string, apiKey: string) {
  if (!apiKey || apiKey === 're_123456789') return { success: true, mock: true };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Quranific Updates <newsletter@quranific.com>',
        to: email,
        reply_to: 'support@quranific.com',
        subject: 'Thank you for subscribing to Quranific',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>As-salamu alaykum!</h2>
            <p>Thank you for subscribing to Quranific updates.</p>
            <p>You will now receive our latest news, articles, and special offers directly in your inbox.</p>
            <br/>
            <p>Warm regards,<br/>The Quranific Team</p>
          </div>
        `,
        text: `As-salamu alaykum!\n\nThank you for subscribing to Quranific updates.\n\nYou will now receive our latest news, articles, and special offers directly in your inbox.\n\nWarm regards,\nThe Quranific Team`,
      }),
    });

    if (!res.ok) throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
    return { success: true };
  } catch (error) {
    console.error('sendNewsletterWelcome failed:', error);
    throw error;
  }
}
