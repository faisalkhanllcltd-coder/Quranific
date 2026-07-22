# PHASE 4: REMAINING CATEGORIES (Gap-Check)

### [OTH-01] Turnstile Secret Exposure Pattern
- Severity: Important
- Confidence: [CODE-VERIFIED]
- File(s): `src/constants/site.ts` (line 18)
- Issue: The Turnstile public site key is hardcoded. While public keys are technically safe, manual hardcoding of keys in a constants file is a poor security practice compared to env var injection.
- Why it matters: This pattern can accidentally lead to secret keys being committed if developers treat `site.ts` as the dump for all keys.
- Suggested direction: Use Astro's `PUBLIC_` environment variables instead of hardcoding in `site.ts`.

### [OTH-02] Promo Bar Contrast Ratio Warning
- Severity: Nice-to-have
- Confidence: [NEEDS VISUAL CONFIRMATION]
- File(s): `src/components/global/Header.astro` (lines 7-10)
- Issue: The promo bar uses `text-emerald-50` against a gradient `from-[#022c22] via-[#064e3b]`. The `text-[11px]` (or `text-xs`) font size makes the contrast requirement stricter (WCAG requires 4.5:1 for normal text).
- Why it matters: Might fail WCAG AAA accessibility guidelines for small text readability.
- Suggested direction: Confirm visually or via DevTools that the contrast ratio passes. If it fails, darken the background or brighten the text.
