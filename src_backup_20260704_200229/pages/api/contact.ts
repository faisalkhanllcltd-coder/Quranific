// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { ENV } from '../../lib/env';
import { z } from 'zod';

const contactSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName:  z.string().min(1, 'Last name is required'),
    email:     z.string().email('Invalid email address'),
    message:   z.string().min(1, 'Message is required'),
    // Turnstile token from the cf-turnstile widget
    'cf-turnstile-response': z.string().min(1, 'Please complete the security check.'),
});

export const prerender = false;

// ─── Cloudflare Turnstile Verification ──────────────────────────────────────
async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
    try {
        const body = new URLSearchParams({
            secret:   ENV.TURNSTILE_SECRET_KEY,
            response: token,
        });
        if (remoteip) body.set('remoteip', remoteip);

        const res = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            { method: 'POST', body }
        );
        if (!res.ok) return false;
        const data = await res.json() as { success: boolean };
        return data.success === true;
    } catch {
        return false;
    }
}

export const POST: APIRoute = async (context) => {
    try {
        const data = (await context.request.json()) as Record<string, unknown>;

        // 1. Validate all fields including the Turnstile token
        const parsed = contactSchema.safeParse(data);
        if (!parsed.success) {
            return new Response(
                JSON.stringify({ error: parsed.error.errors[0].message }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { firstName, lastName, email, message } = parsed.data;
        const turnstileToken = parsed.data['cf-turnstile-response'];

        // 2. Server-side Turnstile verification — hard reject if it fails
        const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') ?? undefined;
        const isHuman = await verifyTurnstile(turnstileToken, cfConnectingIp);
        if (!isHuman) {
            return new Response(
                JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 3. Dispatch the Email via Resend in the background
        const sendEmailTask = async () => {
            try {
                if (ENV.RESEND_API_KEY.startsWith('re_') && ENV.RESEND_API_KEY !== 're_123456789') {
                    const res = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${ENV.RESEND_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            from:     'Quranific Support <support@quranific.com>',
                            to:       ENV.ADMIN_EMAIL,
                            reply_to: email,
                            subject:  `New Contact Inquiry from ${firstName} ${lastName}`,
                            text:     `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
                        })
                    });
                    if (!res.ok) {
                        console.error('Resend API rejected the email dispatch');
                    }
                } else {
                    // Local Mock Mode
                    console.log('\n====== 📨 MOCK EMAIL DISPATCH ======');
                    console.log(`To: ${ENV.ADMIN_EMAIL}`);
                    console.log(`From: ${firstName} ${lastName} <${email}>`);
                    console.log(`Message: \n${message}`);
                    console.log('====================================\n');
                }
            } catch (error) {
                console.error('Contact API Email Dispatch Error:', error);
            }
        };

        if ((context.locals as any).runtime?.ctx?.waitUntil) {
            (context.locals as any).runtime.ctx.waitUntil(sendEmailTask());
        } else {
            sendEmailTask().catch(console.error);
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: unknown) {
        console.error('Contact API Critical Error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error. Could not dispatch message.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};