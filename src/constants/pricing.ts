// src/constants/pricing.ts
// SINGLE SOURCE OF TRUTH for all Quranific pricing.
// USD base prices confirmed by owner 2026-07-27.
// GBP/EUR/AED values confirmed by owner 2026-07-27 — exact, not rate-derived.
// SGD/CAD/AUD computed at rates: SGD@1.29, CAD@1.41, AUD@1.43 (refresh periodically).
// SAR@3.75 and AED are USD-pegged — do not need rate refreshing.

export type Duration = '30' | '40';
export type Sessions = '2' | '3' | '4' | '5';
export type Currency = 'USD' | 'GBP' | 'EUR' | 'AED' | 'SGD' | 'CAD' | 'AUD' | 'SAR';

// PRICING[currency][duration_min][sessions_per_week] = monthly base price
export const PRICING: Record<Currency, Record<Duration, Record<Sessions, number>>> = {
  USD: {
    '30': { '2': 40, '3': 50, '4': 55, '5': 60 },
    '40': { '2': 56, '3': 66, '4': 73, '5': 80 },
  },
  GBP: {
    '30': { '2': 30, '3': 38, '4': 42, '5': 46 },
    '40': { '2': 40, '3': 50, '4': 56, '5': 61 },
  },
  EUR: {
    '30': { '2': 36, '3': 46, '4': 50, '5': 55 },
    '40': { '2': 48, '3': 61, '4': 66, '5': 73 },
  },
  AED: {
    '30': { '2': 145, '3': 180, '4': 205, '5': 220 },
    '40': { '2': 193, '3': 240, '4': 273, '5': 293 },
  },
  SGD: {
    '30': { '2': 52, '3': 65, '4': 71, '5': 77 },
    '40': { '2': 72, '3': 85, '4': 94, '5': 103 },
  },
  CAD: {
    '30': { '2': 56, '3': 71, '4': 78, '5': 85 },
    '40': { '2': 79, '3': 93, '4': 103, '5': 113 },
  },
  AUD: {
    '30': { '2': 57, '3': 72, '4': 79, '5': 86 },
    '40': { '2': 80, '3': 94, '4': 104, '5': 114 },
  },
  SAR: {
    '30': { '2': 150, '3': 188, '4': 206, '5': 225 },
    '40': { '2': 210, '3': 248, '4': 274, '5': 300 },
  },
};

export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  label: string;
}

export const CURRENCY_META: CurrencyMeta[] = [
  { code: 'USD', symbol: '$', label: 'USA (USD $)' },
  { code: 'GBP', symbol: '£', label: 'UK (GBP £)' },
  { code: 'EUR', symbol: '€', label: 'Europe (EUR €)' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE (AED)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore (SGD S$)' },
  { code: 'CAD', symbol: 'C$', label: 'Canada (CAD C$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australia (AUD A$)' },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Arabia (SAR)' },
];

export const BILLING_DISCOUNTS = {
  monthly: 0,
  sixMonth: 0.05,
  annual: 0.15,
} as const;
