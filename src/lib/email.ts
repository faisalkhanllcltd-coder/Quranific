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
  lid?: string; // Lead ID for email threading
  // Ad attribution (short keys from JWT)
  fb?: string; // fbclid
  gc?: string; // gclid
  tt?: string; // ttclid
  us?: string; // utm_source
  uc?: string; // utm_campaign
  um?: string; // utm_medium
  // Calculator context (short keys from JWT)
  et?: string; // enrollType
  dur?: string; // duration
  ses?: string; // sessions
  cur?: string; // currency
  bil?: string; // billing
  prc?: string; // price
  crs?: string; // course (from calculator)
  not?: string; // note (free-text from calculator)
}

export interface Step2Data {
  course: string;
  level: string;
  schedule: string;
  days: string;
  gender: string;
  teacherGender: string;
  duration?: string;
  sessions?: string;
  note?: string;
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
  const safeLid = esc(String(step1Data.lid || 'UNKNOWN'));

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
        subject: `[ID: ${safeLid}] ⏳ Partial Lead - ${safeName}`,
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
  const safeLid = esc(String(step1Data.lid || 'UNKNOWN'));
  // Calculator context from JWT
  const safeEnrollType = esc(String(step1Data.et || '—'));
  const safeDuration = esc(String(step2Data.duration || step1Data.dur || '—'));
  const safeSessions = esc(String(step2Data.sessions || step1Data.ses || '—'));
  const safeCurrency = esc(String(step1Data.cur || '—'));
  const safeBilling = esc(String(step1Data.bil || '—'));
  const safePrice = esc(String(step1Data.prc || '—'));
  const safeNote = esc(String(step2Data.note || step1Data.not || 'No additional notes'));
  // Ad attribution
  const safeGclid = esc(String(step1Data.gc || ''));
  const safeFbclid = esc(String(step1Data.fb || ''));
  const safeUtmSource = esc(String(step1Data.us || ''));
  const safeUtmCampaign = esc(String(step1Data.uc || ''));
  const safeUtmMedium = esc(String(step1Data.um || ''));
  // Step 2 fields
  const safeCourse = esc(String(step2Data.course || step1Data.crs || ''));
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
        <p style="margin: 0;""><strong>Country:</strong> ${safeCountry}</p>
      </div>

      <h3 style="color: #0f172a; border-bottom: 2px solid #d1fae5; padding-bottom: 6px;">📊 Pre-fill Context &amp; Notes</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Enrol Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeEnrollType}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Session Length:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeDuration}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Sessions / Week:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeSessions}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Currency:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeCurrency}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Billing Cycle:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeBilling}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Calculator Price:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #059669; font-weight: bold;">${safePrice}</td></tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top;"><strong>Additional Notes:</strong></td>
          <td style="padding: 8px 0; color: #1e3a5f; font-style: italic;">${safeNote}</td>
        </tr>
      </table>

      <h3 style="color: #0f172a;">Course Preferences</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Course:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeCourse}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Level:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeLevel}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Schedule:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${safeSchedule} (${safeDays})</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Gender Match:</strong></td><td style="padding: 8px 0;">${safeGender} Student / ${safeTeacher}</td></tr>
      </table>

      ${
        safeGclid || safeFbclid || safeUtmSource
          ? `
      <h3 style="color: #0f172a; margin-top: 20px;">Ad Attribution</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #64748b;">
        ${safeGclid ? `<tr><td style="padding: 4px 0;"><strong>gclid:</strong></td><td style="padding: 4px 0;">${safeGclid}</td></tr>` : ''}
        ${safeFbclid ? `<tr><td style="padding: 4px 0;"><strong>fbclid:</strong></td><td style="padding: 4px 0;">${safeFbclid}</td></tr>` : ''}
        ${safeUtmSource ? `<tr><td style="padding: 4px 0;"><strong>utm_source:</strong></td><td style="padding: 4px 0;">${safeUtmSource}</td></tr>` : ''}
        ${safeUtmCampaign ? `<tr><td style="padding: 4px 0;"><strong>utm_campaign:</strong></td><td style="padding: 4px 0;">${safeUtmCampaign}</td></tr>` : ''}
        ${safeUtmMedium ? `<tr><td style="padding: 4px 0;"><strong>utm_medium:</strong></td><td style="padding: 4px 0;">${safeUtmMedium}</td></tr>` : ''}
      </table>`
          : ''
      }
    </div>
  `;

  const text = `🎉 New Student Lead: ${safeName}\n\nTraffic Source: ${safeSource}\nEmail: ${safeEmail}\nWhatsApp: ${safeWhatsapp}\nCountry: ${safeCountry}\n\nPre-fill Context\nEnrol Type: ${safeEnrollType}\nSession Length: ${safeDuration}\nSessions/Week: ${safeSessions}\nCurrency: ${safeCurrency}\nBilling: ${safeBilling}\nCalculator Price: ${safePrice}\nAdditional Notes: ${safeNote}\n\nCourse Preferences\nCourse: ${safeCourse}\nLevel: ${safeLevel}\nSchedule: ${safeSchedule} (${safeDays})\nGender Match: ${safeGender} Student / ${safeTeacher}`;

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
        subject: `[ID: ${safeLid}] 🎉 Full Registration - ${safeName}`,
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
