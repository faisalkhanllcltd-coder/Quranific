import { test as base, Page } from '@playwright/test';

// Global blocked / rate tracking
export const blockedChallengeUrls: string[] = [];

// Interception patterns for ads / analytics
const AD_ANALYTICS_PATTERNS = [
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com/gtag',
  'googletagmanager.com/g/collect',
  'googleadservices.com',
  'doubleclick.net',
  'facebook.com/tr',
  'cloudflareinsights.com',
];

// Helper to delay between requests to prevent Cloudflare throttling
let lastRequestTime = 0;
export async function enforceRateLimit() {
  const minDelay = parseInt(process.env.E2E_DELAY_MS || '350', 10);
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < minDelay) {
    await new Promise((r) => setTimeout(r, minDelay - elapsed));
  }
  lastRequestTime = Date.now();
}

export interface SafetyContext {
  abortedCalls: string[];
  isBlockedByCloudflare: boolean;
}

export const test = base.extend<{
  safetyPage: { page: Page; safety: SafetyContext };
}>({
  safetyPage: async ({ page }, use) => {
    const safety: SafetyContext = {
      abortedCalls: [],
      isBlockedByCloudflare: false,
    };

    // Route aborting for ads/analytics
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const isAdOrAnalytics = AD_ANALYTICS_PATTERNS.some((p) => url.includes(p));

      if (isAdOrAnalytics) {
        safety.abortedCalls.push(url);
        // Abort to prevent test hit from reaching third-party server
        await route.abort('blockedbyclient');
      } else {
        await enforceRateLimit();
        await route.continue();
      }
    });

    // Cloudflare Challenge Detection listener
    page.on('response', async (res) => {
      if (res.status() === 403 || res.status() === 503) {
        const text = await res.text().catch(() => '');
        if (text.includes('Just a moment') || text.includes('Cloudflare')) {
          safety.isBlockedByCloudflare = true;
          if (!blockedChallengeUrls.includes(res.url())) {
            blockedChallengeUrls.push(res.url());
          }
        }
      }
    });

    await use({ page, safety });
  },
});

export { expect } from '@playwright/test';
