export const prerender = false; // Forces Astro to execute this as a server-side Edge endpoint, not static HTML.

import type { APIRoute } from 'astro';
import { sendTeacherAdminNotification, sendTeacherAutoResponder } from '../../lib/email';
import type { TeacherData } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = (await request.json()) as TeacherData;

    // Secure the API key via Astro's standard env variables
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.warn('No RESEND_API_KEY found. Simulating successful response in development.');
    }

    // Fire off both emails concurrently.
    // 'null' triggers the FALLBACK_ADMIN_EMAIL (faisalkhan.llc.ltd@gmail.com)
    await Promise.all([
      sendTeacherAdminNotification(data, RESEND_API_KEY, null),
      sendTeacherAutoResponder(data.email, data.fullName, RESEND_API_KEY),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Teacher Application API Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
