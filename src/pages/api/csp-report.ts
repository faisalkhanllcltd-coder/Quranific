import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 16384) {
      return new Response(null, { status: 204 });
    }

    let body = '';
    if (request.body) {
      const reader = request.body.getReader();
      const decoder = new TextDecoder();
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > 16384) {
          await reader.cancel();
          return new Response(null, { status: 204 });
        }
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
    } else {
      const text = await request.text();
      if (text.length > 16384) {
        return new Response(null, { status: 204 });
      }
      body = text;
    }

    if (body) {
      console.error('[CSP-VIOLATION]', body);
    }
  } catch {
    // Browsers send CSP reports asynchronously; ignore parsing/stream abort errors
  }

  return new Response(null, { status: 204 });
};
