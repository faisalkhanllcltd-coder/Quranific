// src/constants/landing.ts
export type AudienceSlug = 'kids' | 'adults' | 'ladies';

export interface LandingCopy {
  audience: AudienceSlug;
  heroTitle: string;
  heroSubtitle: string;
  benefits: string[];
}

export const LANDING_PAGES: Record<AudienceSlug, LandingCopy> = {
  'kids': {
    audience: 'kids',
    heroTitle: 'Engaging Online Quran Classes for Kids',
    heroSubtitle: 'Certified teachers who make learning the Quran fun, interactive, and safe for your children.',
    benefits: ['Interactive Rive Animations', 'Patient & Certified Tutors', 'Flexible After-School Hours'],
  },
  'adults': {
    audience: 'adults',
    heroTitle: 'Master the Quran on Your Schedule',
    heroSubtitle: 'Tailored 1-on-1 Quran and Tajweed classes designed for busy adults.',
    benefits: ['Flexible Scheduling', 'Learn at Your Own Pace', 'Expert Feedback'],
  },
  'ladies': {
    audience: 'ladies',
    heroTitle: 'Private Quran Classes for Ladies',
    heroSubtitle: 'Learn comfortably with certified, experienced female Quran tutors in a secure environment.',
    benefits: ['100% Female Tutors', 'Private & Secure', 'Tailored to All Levels'],
  }
} as const;