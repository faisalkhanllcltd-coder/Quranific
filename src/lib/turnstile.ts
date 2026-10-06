// src/lib/turnstile.ts

/**
 * Cloudflare Turnstile Server-Side Verification
 * Validates a Turnstile token against Cloudflare's siteverify endpoint.
 *
 * @param token - The turnstile token submitted by the client (cf-turnstile-response)
 * @param secret - The Turnstile secret key from environment variables
 * @param remoteip - Optional client IP address (from CF-Connecting-IP header)
 * @returns Promise<boolean> - True if validation succeeded, false otherwise
 */
export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteip?: string
): Promise<boolean> {
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
