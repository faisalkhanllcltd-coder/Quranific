import { defineMiddleware } from 'astro:middleware';

// ─── Security Headers ────────────────────────────────────────────────────────
// Applied to every response. Keeps them in one place so future changes are
// auditable in a single file rather than scattered across route handlers.
const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Strict referrer — only send origin on cross-origin navigations
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Disable sensitive browser features not required by this application
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',

  // Content Security Policy
  // - default-src 'self'             : Block everything not explicitly allowed
  // - script-src 'self' + Turnstile + Partytown + inline (required for Astro island hydration)
  // - style-src  'self' 'unsafe-inline': Tailwind CSS injects runtime styles
  // - img-src    'self' data: https:  : Allow remote images (og images, etc.)
  // - font-src   'self' data:         : Self-hosted @fontsource fonts
  // - connect-src: Resend API + Cloudflare Turnstile + self
  // - frame-src:  Cloudflare Turnstile widget runs in an iframe
  // - worker-src: Partytown uses a service worker
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://challenges.cloudflare.com 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.resend.com https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '),
};

export const onRequest = defineMiddleware(async (context, next) => {
  // Astro v6 Native: Cloudflare's 'cf' object is attached directly to the Request
  const cf = (context.request as Request & { cf?: Record<string, unknown> }).cf;

  context.locals.isSlowConnection = cf?.httpProtocol === 'HTTP/1.1' || cf?.asOrganization === 'Cellular';
  context.locals.userCountry = (cf?.country as string) || 'Unknown';
  context.locals.userCity    = (cf?.city    as string) || 'Unknown';

  const response = await next();

  // Attach edge location header for debugging (Cloudflare-only)
  if (cf?.colo) {
    response.headers.set('X-Edge-Location', cf.colo as string);
  }

  // Apply security headers to every response
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    // Only set if not already explicitly set by the route handler
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }

  return response;
});