import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Astro v6 Native: Cloudflare's 'cf' object is attached directly to the Request
  const cf = (context.request as any).cf;

  context.locals.isSlowConnection = cf?.httpProtocol === 'HTTP/1.1' || cf?.asOrganization === 'Cellular';
  context.locals.userCountry = (cf?.country as string) || 'Unknown';
  context.locals.userCity = (cf?.city as string) || 'Unknown';

  const response = await next();

  if (cf?.colo) {
    response.headers.set('X-Edge-Location', cf.colo as string);
  }

  return response;
});