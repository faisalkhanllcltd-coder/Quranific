<script lang="ts">
  // src/components/blocks/CookieBanner.svelte
  // Svelte 5 runes syntax. Mounted with client:idle — non-critical path.
  // Bucket is NOT passed as a server prop (would be baked into cached/prerendered HTML).
  // Instead, the Phase 4 inline script dispatches a 'consent-bucket' CustomEvent on
  // #cookie-banner-root after it resolves /api/consent-bucket asynchronously.
  // This component listens for that event and updates its state accordingly.
  import type { ConsentBucket } from '../../lib/consent';

  // ─── State ────────────────────────────────────────────────────────────────
  // Start with STRICT as fallback — if event arrives, it overrides.
  // If event never arrives (e.g. fetch failed), the STRICT banner copy is shown,
  // which is the safe fallback.
  let bucket = $state<ConsentBucket>('STRICT');
  let visible = $state(false);
  let showDetails = $state(false);
  let hydrated = $state(false);

  // ─── Cookie helpers ───────────────────────────────────────────────────────
  const COOKIE_NAME = 'cf_consent_v1';
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

  function writeConsentCookie(value: string): void {
    // SameSite=Lax: sent with top-level navigation, not blocked for cross-site
    // Secure: HTTPS only (enforced by HSTS in _headers)
    // No HttpOnly: must be readable by client JS for banner suppression
    document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax; Secure`;
  }

  // ─── gtag consent update helper ──────────────────────────────────────────
  type ConsentArg = Record<string, string>;

  function updateGtag(update: ConsentArg): void {
    // gtag is defined in Base.astro consent snippet before GTM fires
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as Record<string, any>;
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', update);
    }
  }

  // ─── Consent grant/deny maps ──────────────────────────────────────────────
  const GRANT_ALL: ConsentArg = {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
    functionality_storage: 'granted',
    personalization_storage: 'granted',
    security_storage: 'granted',
  };

  const GRANT_MODERATE: ConsentArg = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
  };

  const DENY_ALL: ConsentArg = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted', // keep site functional
    personalization_storage: 'denied',
    security_storage: 'granted', // keep security checks active
  };

  // ─── Actions ─────────────────────────────────────────────────────────────
  function acceptAll(): void {
    updateGtag(GRANT_ALL);
    writeConsentCookie(`${bucket}:accepted`);
    visible = false;
  }

  function rejectAll(): void {
    updateGtag(DENY_ALL);
    writeConsentCookie(`${bucket}:rejected`);
    visible = false;
  }

  function acceptAnalyticsOnly(): void {
    const update =
      bucket === 'MODERATE' ? GRANT_MODERATE : { ...DENY_ALL, analytics_storage: 'granted' };
    updateGtag(update);
    writeConsentCookie(`${bucket}:accepted`);
    visible = false;
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────
  $effect(() => {
    hydrated = true;

    const bannerRoot = document.getElementById('cookie-banner-root');
    if (!bannerRoot) return;

    // PATH A: inline script already resolved + stored bucket before we mounted
    // (common with client:idle — inline script fires synchronously at page load,
    //  Svelte hydrates later when browser is idle; we may have missed the event)
    const w = window as Record<string, unknown>;
    if (w.__resolvedBucket) {
      bucket = w.__resolvedBucket as ConsentBucket;
      visible = true;
    }

    // PATH B: component mounted before async fetch resolved — listen for event
    function onBucketResolved(e: Event) {
      const ce = e as CustomEvent<{ bucket: ConsentBucket }>;
      if (ce.detail?.bucket) {
        bucket = ce.detail.bucket;
      }
      visible = true;
    }

    bannerRoot.addEventListener('consent-bucket', onBucketResolved);
    return () => {
      bannerRoot.removeEventListener('consent-bucket', onBucketResolved);
    };
  });
</script>

{#if visible}
  <!-- Backdrop overlay for mobile: non-interactive, does not block page use -->
  <div
    class="fixed inset-x-0 bottom-0 z-[9999] flex items-end justify-center pointer-events-none sm:p-4 sm:items-end sm:justify-end"
    role="dialog"
    aria-modal="true"
    aria-label="Cookie consent"
  >
    <div
      class="pointer-events-auto w-full sm:max-w-md bg-white border border-emerald-100 shadow-2xl shadow-emerald-900/10 rounded-t-2xl sm:rounded-2xl p-6 sm:p-7 text-sm"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 mb-4">
        <div>
          <p class="font-bold text-emerald-950 text-base leading-snug">
            {bucket === 'STRICT' ? 'Your Privacy Choices' : 'We use cookies'}
          </p>
          <p class="text-emerald-700/70 text-xs mt-0.5">
            {bucket === 'STRICT'
              ? 'We need your consent before using analytics or advertising tools.'
              : 'Analytics help us improve. You can opt out at any time.'}
          </p>
        </div>
        <a
          href="/legal/cookies"
          class="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors mt-0.5"
          aria-label="Read our Cookie Policy"
        >
          Learn more
        </a>
      </div>

      {#if showDetails}
        <!-- Granular detail section -->
        <div class="mb-5 space-y-2.5 border border-emerald-100 rounded-xl p-4 bg-emerald-50/40">
          <p class="text-xs font-semibold text-emerald-900 mb-2">Cookie categories:</p>
          <label class="flex items-start gap-3 cursor-not-allowed opacity-60">
            <input type="checkbox" checked disabled class="mt-0.5 accent-emerald-600" />
            <span>
              <span class="font-semibold text-emerald-950">Essential</span>
              <span class="text-emerald-700/70 block text-[11px]"
                >Required for the site to function. Cannot be disabled.</span
              >
            </span>
          </label>
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked disabled class="mt-0.5 accent-emerald-600" />
            <span>
              <span class="font-semibold text-emerald-950">Security</span>
              <span class="text-emerald-700/70 block text-[11px]"
                >Cloudflare Turnstile, fraud prevention. Cannot be disabled.</span
              >
            </span>
          </label>
          <label class="flex items-start gap-3">
            <input type="checkbox" class="mt-0.5 accent-emerald-600" id="analytics-toggle" />
            <span>
              <span class="font-semibold text-emerald-950">Analytics</span>
              <span class="text-emerald-700/70 block text-[11px]"
                >Google Analytics 4 via GTM. Helps us improve the site.</span
              >
            </span>
          </label>
          <label class="flex items-start gap-3">
            <input type="checkbox" class="mt-0.5 accent-emerald-600" id="ads-toggle" />
            <span>
              <span class="font-semibold text-emerald-950">Advertising</span>
              <span class="text-emerald-700/70 block text-[11px]"
                >Google Ads, Meta Pixel, remarketing tags (via GTM).</span
              >
            </span>
          </label>
        </div>
      {/if}

      <!-- Action buttons -->
      <div class="flex flex-col gap-2.5">
        {#if bucket === 'STRICT'}
          <button
            onclick={acceptAll}
            disabled={!hydrated}
            class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Accept All
          </button>
          <button
            onclick={acceptAnalyticsOnly}
            disabled={!hydrated}
            class="w-full py-2.5 px-4 rounded-xl border border-emerald-200 hover:border-emerald-300 text-emerald-800 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Analytics Only
          </button>
          <button
            onclick={rejectAll}
            disabled={!hydrated}
            class="w-full py-2 px-4 text-emerald-600 hover:text-emerald-800 font-medium text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          >
            Reject Non-Essential
          </button>
        {:else}
          <!-- MODERATE bucket: softer CTA -->
          <button
            onclick={acceptAll}
            disabled={!hydrated}
            class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Got it
          </button>
          <button
            onclick={rejectAll}
            disabled={!hydrated}
            class="w-full py-2 px-4 text-emerald-600 hover:text-emerald-800 font-medium text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          >
            Opt out of analytics
          </button>
        {/if}

        <button
          onclick={() => (showDetails = !showDetails)}
          class="text-[11px] text-emerald-500 hover:text-emerald-700 transition-colors text-center mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        >
          {showDetails ? 'Hide details ▲' : 'Manage preferences ▼'}
        </button>
      </div>
    </div>
  </div>
{/if}
