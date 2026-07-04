// src/pages/api/newsletter.ts
import type { APIRoute } from 'astro';
import { ENV } from '../../lib/env';
import { z } from 'zod';

const newsletterSchema = z.object({ 
    email: z.string().email('Invalid email address') 
});

export const prerender = false; // CRITICAL: This cannot be a static file

export const POST: APIRoute = async (context) => {
    try {
        const data = (await context.request.json()) as Record<string, unknown>;
        
        // 1. Validate incoming data with Zod
        const parsed = newsletterSchema.safeParse(data);
        if (!parsed.success) {
            return new Response(JSON.stringify({ error: parsed.error.errors[0].message }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { email } = parsed.data;

        // TODO: Phase 5 D1 Database integration for uniqueness constraint

        // 2. Dispatch the Email via Resend in the background
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
                            from: 'Quranific Updates <hello@quranific.com>',
                            to: ENV.ADMIN_EMAIL,
                            subject: `New Newsletter Subscriber!`,
                            text: `A new user has subscribed to the newsletter.\n\nEmail: ${email}`,
                        })
                    });

                    if (!res.ok) {
                        console.error('Resend API rejected the subscription dispatch');
                    }
                } else {
                    // Local Mock Mode
                    console.log('\n====== 📬 MOCK NEWSLETTER SUB ======');
                    console.log(`New Subscriber: ${email}`);
                    console.log(`Notification sent to: ${ENV.ADMIN_EMAIL}`);
                    console.log('====================================\n');
                }
            } catch (error) {
                console.error('Newsletter API Email Dispatch Error:', error);
            }
        };

        if ((context.locals as any).runtime?.ctx?.waitUntil) {
            (context.locals as any).runtime.ctx.waitUntil(sendEmailTask());
        } else {
            sendEmailTask().catch(console.error);
        }

        // 3. Return success immediately
        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Newsletter API Critical Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error. Could not process subscription.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};