// src/lib/consent.ts
// Pure, side-effect-free bucketing logic.
// No imports from Astro/Cloudflare — fully unit-testable in Node.

/**
 * Consent bucket determines gtag Consent Mode defaults:
 * - STRICT  → deny ad_storage, analytics_storage, etc. (EU/UK/CH, CA-QC, unknown, GPC)
 * - MODERATE → grant analytics_storage, deny ad_storage (US, CA non-QC, AU)
 * - NONE    → grant all (rest of world, unless GPC overrides)
 */
export type ConsentBucket = 'STRICT' | 'MODERATE' | 'NONE';

/**
 * EU/UK/CH country codes requiring STRICT (deny-by-default) treatment.
 * UK is post-Brexit but still follows UK GDPR.
 * CH follows nFADP (Swiss DPA), equally strict.
 */
const STRICT_COUNTRIES = new Set([
  // EU Member States
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
  // EEA non-EU
  'IS',
  'LI',
  'NO',
  // UK (UK GDPR)
  'GB',
  // Switzerland (nFADP)
  'CH',
]);

/**
 * Countries in MODERATE bucket: grant analytics by default, deny ad storage.
 * US: CalOPPA / CCPA (opt-out model — analytics OK without consent).
 * AU: Privacy Act 1988 — analytics not consent-required, but ad targeting is.
 * CA (non-QC): PIPEDA — opt-out model; Quebec is opt-in (handled separately).
 */
const MODERATE_COUNTRIES = new Set(['US', 'AU', 'CA']);

/**
 * Compute the consent bucket for a given request.
 *
 * @param country     - ISO 3166-1 alpha-2 country code from cf.country, or null/undefined
 * @param regionCode  - ISO 3166-2 region code from cf.regionCode (e.g. 'QC'), or null/undefined
 * @param hasGPC      - true if Sec-GPC: 1 header is present
 * @returns ConsentBucket
 *
 * Decision table (evaluated in order — first match wins):
 * 1. GPC present → STRICT (overrides everything, per CCPA reg + emerging standard)
 * 2. Country in STRICT_COUNTRIES → STRICT
 * 3. Country is 'CA' AND (regionCode is 'QC' OR regionCode is unknown) → STRICT
 *    Rationale: Quebec Law 25 requires opt-in consent. Unknown Canadian region
 *    treated as STRICT (fail-closed per directive).
 * 4. Country in MODERATE_COUNTRIES → MODERATE
 * 5. Country is null/undefined/empty/'Unknown' → STRICT (fail-closed for unknown)
 * 6. All others → NONE
 */
export function getConsentBucket(
  country: string | null | undefined,
  regionCode: string | null | undefined,
  hasGPC: boolean
): ConsentBucket {
  // Rule 1: GPC is a binding opt-out signal regardless of geography
  if (hasGPC) return 'STRICT';

  // Normalise
  const c = (country ?? '').toUpperCase().trim();

  // Rule 2: Explicit STRICT countries
  if (STRICT_COUNTRIES.has(c)) return 'STRICT';

  // Rule 3: Canada — Quebec carve-out, fail-closed for unknown region
  if (c === 'CA') {
    const r = (regionCode ?? '').toUpperCase().trim();
    // If region is QC or unknown/empty, treat as STRICT
    if (r === 'QC' || r === '') return 'STRICT';
    // Known non-QC Canadian province → MODERATE
    return 'MODERATE';
  }

  // Rule 4: Explicit MODERATE countries (US, AU, and CA already handled above)
  if (MODERATE_COUNTRIES.has(c)) return 'MODERATE';

  // Rule 5: Unknown/missing country → fail-closed
  if (!c || c === 'UNKNOWN') return 'STRICT';

  // Rule 6: Rest of world
  return 'NONE';
}

/**
 * Build the gtag Consent Mode v2 default parameters for a given bucket.
 * These are injected server-side into the Consent Mode default snippet.
 *
 * STRICT:   deny everything except functionality_storage + security_storage
 * MODERATE: deny ad_storage + ad_user_data + ad_personalization
 *           grant analytics_storage + functionality_storage + security_storage
 * NONE:     grant everything
 *
 * wait_for_update: 500ms — allows the banner's client-side gtag('consent','update')
 * call to fire before GTM tags execute (for STRICT/MODERATE where banner is shown).
 */
export function getConsentDefaults(bucket: ConsentBucket): Record<string, string> {
  switch (bucket) {
    case 'STRICT':
      return {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted',
        wait_for_update: '500',
      };
    case 'MODERATE':
      return {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted',
      };
    case 'NONE':
      return {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted',
      };
  }
}

/**
 * Parse the cf_consent_v1 cookie from a Cookie header string.
 * Returns true if a valid consent record is found.
 *
 * Cookie format: cf_consent_v1=<bucket>:<choice>
 *   <bucket>: STRICT | MODERATE | NONE
 *   <choice>: accepted | rejected
 * Example: cf_consent_v1=STRICT:accepted
 *
 * We intentionally do not trust NONE:accepted in STRICT regions — bucket is
 * re-validated server-side on each request; client cookie is only used to
 * suppress the banner.
 */
export function parseConsentCookie(cookieHeader: string | null | undefined): {
  hasCookie: boolean;
  bucket: ConsentBucket | null;
  choice: 'accepted' | 'rejected' | null;
} {
  if (!cookieHeader) return { hasCookie: false, bucket: null, choice: null };

  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey.trim() === 'cf_consent_v1') {
      const value = rest.join('=').trim();
      const [bucketRaw, choiceRaw] = value.split(':');
      const bucket = bucketRaw as ConsentBucket;
      const choice = choiceRaw as 'accepted' | 'rejected';
      if (
        (bucket === 'STRICT' || bucket === 'MODERATE' || bucket === 'NONE') &&
        (choice === 'accepted' || choice === 'rejected')
      ) {
        return { hasCookie: true, bucket, choice };
      }
    }
  }

  return { hasCookie: false, bucket: null, choice: null };
}
