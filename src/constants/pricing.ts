// src/constants/pricing.ts
// SINGLE SOURCE OF TRUTH for all Quranific fixed geo-based pricing.
// No API, no cron, no live exchange rate lookups.
// Confirmed against source specification.

export type Duration = '30' | '40';
export type Sessions = '2' | '3' | '4' | '5';
export type Currency = 'USD' | 'AED' | 'SAR' | 'GBP' | 'EUR' | 'SGD' | 'CAD' | 'AUD';

// PRICING[currency][duration_min][sessions_per_week] = monthly base price
export const PRICING: Record<Currency, Record<Duration, Record<Sessions, number>>> = {
  USD: {
    '30': { '2': 40, '3': 50, '4': 55, '5': 60 },
    '40': { '2': 56, '3': 66, '4': 73, '5': 80 },
  },
  AED: {
    '30': { '2': 146, '3': 183, '4': 201, '5': 220 },
    '40': { '2': 205, '3': 242, '4': 268, '5': 293 },
  },
  SAR: {
    '30': { '2': 150, '3': 187, '4': 206, '5': 225 },
    '40': { '2': 210, '3': 247, '4': 274, '5': 300 },
  },
  GBP: {
    '30': { '2': 29, '3': 37, '4': 40, '5': 44 },
    '40': { '2': 41, '3': 48, '4': 54, '5': 59 },
  },
  EUR: {
    '30': { '2': 34, '3': 43, '4': 47, '5': 51 },
    '40': { '2': 48, '3': 57, '4': 63, '5': 69 },
  },
  SGD: {
    '30': { '2': 50, '3': 63, '4': 69, '5': 76 },
    '40': { '2': 71, '3': 84, '4': 92, '5': 101 },
  },
  CAD: {
    '30': { '2': 55, '3': 69, '4': 75, '5': 82 },
    '40': { '2': 77, '3': 91, '4': 100, '5': 110 },
  },
  AUD: {
    '30': { '2': 55, '3': 69, '4': 76, '5': 83 },
    '40': { '2': 78, '3': 92, '4': 101, '5': 111 },
  },
};

export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  label: string;
  decimals: number;
}

export const CURRENCY_META: CurrencyMeta[] = [
  { code: 'USD', symbol: '$', label: 'USA (USD $)', decimals: 0 },
  { code: 'GBP', symbol: '£', label: 'UK (GBP £)', decimals: 0 },
  { code: 'EUR', symbol: '€', label: 'Europe (EUR €)', decimals: 2 },
  { code: 'AED', symbol: 'د.إ', label: 'UAE (AED د.إ)', decimals: 0 },
  { code: 'SGD', symbol: 'S$', label: 'Singapore (SGD S$)', decimals: 0 },
  { code: 'CAD', symbol: 'CA$', label: 'Canada (CAD CA$)', decimals: 0 },
  { code: 'AUD', symbol: 'A$', label: 'Australia (AUD A$)', decimals: 0 },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Arabia (SAR ﷼)', decimals: 0 },
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = Object.fromEntries(
  CURRENCY_META.map((c) => [c.code, c.symbol])
) as Record<Currency, string>;

/**
 * Formats price according to currency conventions:
 * EUR always shows 2 decimal places (€34.00),
 * all other currencies show whole numbers ($40, £29, S$50, CA$55, A$55, د.إ146, ﷼150).
 */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'EUR') {
    return amount.toFixed(2);
  }
  return Math.round(amount).toString();
}

/**
 * All 27 European Union (EU) Member States plus Eurozone microstates using the Euro.
 */
const EU_COUNTRIES = [
  // 27 EU Member States
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  // Eurozone microstates officially using EUR
  'AD',
  'MC',
  'ME',
  'SM',
  'VA',
  'XK',
] as const;

export const COUNTRY_CURRENCY_MAP: Record<string, Currency> = {
  AE: 'AED',
  SA: 'SAR',
  GB: 'GBP',
  SG: 'SGD',
  CA: 'CAD',
  AU: 'AUD',
  US: 'USD',
  ...Object.fromEntries(EU_COUNTRIES.map((code) => [code, 'EUR'])),
};

/**
 * Resolves visitor ISO country code to fixed regional currency.
 * Defaults to USD for any unmapped country or missing/empty code.
 */
export function getCurrencyForCountry(countryCode?: string | null): Currency {
  if (!countryCode) return 'USD';
  const clean = countryCode.trim().toUpperCase();
  return COUNTRY_CURRENCY_MAP[clean] ?? 'USD';
}
