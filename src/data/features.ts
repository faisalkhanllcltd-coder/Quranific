// src/data/features.ts
// Centralized Single Source of Truth for features, guarantees, and tuition inclusions.

export interface AcademyFeature {
  title: string;
  desc: string;
}

/**
 * Core academy guarantees and key plan features displayed on the tuition page.
 */
export const TUITION_PLAN_FEATURES: AcademyFeature[] = [
  { title: 'First class always free', desc: 'No credit card required' },
  { title: 'Full-month guarantee', desc: 'Refund if unsatisfied' },
  { title: 'Make-up guarantee', desc: 'Every absence replaced' },
  { title: 'Progress report', desc: 'Included in every plan' },
];

/**
 * Comprehensive list of everything included with Quranific tuition.
 */
export const WHATS_INCLUDED_ITEMS: string[] = [
  'A dedicated 1-on-1 teacher, matched to your child',
  'All learning materials included, no extra cost',
  'Missed sessions made up, guaranteed',
  'Progress updates whenever you ask, no extra fee',
  "Full-month guarantee if you're not satisfied",
  'Cancel anytime, no lock-in contract',
];

/**
 * Standard course inclusions shared across 1-on-1 programs.
 */
export const STANDARD_COURSE_FEATURES: string[] = [
  '1-on-1 private sessions with certified scholars',
  'Step-by-step Salah & Wudu practical guidance',
  'Essential short Surah memorization (Al-Fatiha to An-Nas)',
  'Daily Adhkar, core Duas, and Islamic etiquette (Tarbiyah)',
  'On-demand progress reports & performance tracking',
  'Make-up guarantee for any missed sessions',
];
