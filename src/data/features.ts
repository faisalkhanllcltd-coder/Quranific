// src/data/features.ts
// Centralized feature arrays for per-page import.
// Replaces all hardcoded inline arrays in intent pages, TuitionPlans.astro,
// WhatsIncluded.astro, and QuranificDifference.astro.

// ─── Shared types ──────────────────────────────────────────────────────────────

export interface Feature {
  title: string;
  desc: string;
}

export interface VettingStep {
  n: string;
  title: string;
  body: string;
  icon: string;
}

export interface OnboardingStep {
  n: string;
  title: string;
  body: string;
}

// ─── Tuition page features ─────────────────────────────────────────────────────
// Used by: src/pages/tuition-fee/_components/TuitionPlans.astro

export const tuitionFeatures: Feature[] = [
  { title: 'First class always free', desc: 'No credit card required' },
  { title: 'Full-month guarantee', desc: 'Refund if unsatisfied' },
  { title: 'Make-up guarantee', desc: 'Every absence replaced' },
  { title: 'Progress report', desc: 'Included in every plan' },
];

// ─── Landing page features (shared across Kids, Adults, Women) ─────────────────

/** 4-stage teacher vetting process — Kids landing pages. */
export const kidsVettingSteps: VettingStep[] = [
  {
    n: '01',
    title: 'Ijazah Verification',
    body: 'We confirm the teacher holds a valid chain of Ijazah — a certified lineage of Quranic transmission. No exceptions.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  },
  {
    n: '02',
    title: 'Live Recitation Assessment',
    body: 'Our academic team conducts a live Tajweed assessment. Not a CV review — an actual recitation, evaluated to professional standards.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  },
  {
    n: '03',
    title: 'Teaching Methodology Interview',
    body: "We probe specifically for child-teaching ability: how do they explain a concept when a child doesn't understand? How do they keep an 8-year-old engaged after 15 minutes? Concrete answers only.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    n: '04',
    title: 'Full Safeguarding Check',
    body: 'Every teacher completes a formal safeguarding background check before they ever meet a student. This is non-negotiable and renewed annually.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  },
];

/** 4-stage teacher vetting process — Adults landing pages. */
export const adultsVettingSteps: VettingStep[] = [
  {
    n: '01',
    title: 'Ijazah Verification',
    body: 'We confirm the teacher holds a valid chain of Ijazah — a certified lineage of Quranic transmission. No exceptions.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  },
  {
    n: '02',
    title: 'Live Recitation Assessment',
    body: 'Our academic team conducts a live Tajweed assessment to ensure professional, elite-level recitation.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  },
  {
    n: '03',
    title: 'Adult Pedagogy Interview',
    body: 'We probe specifically for adult-teaching ability. How do they explain complex Tajweed rules to an English-speaking professional? We hire for patience, logic, and clarity — not rote repetition.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  },
  {
    n: '04',
    title: 'Professional Conduct Check',
    body: 'Every teacher is vetted for punctuality, professionalism, and strict privacy standards.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  },
];

/** 4-stage teacher vetting process — Women''s landing pages. */
export const womenVettingSteps: VettingStep[] = [
  {
    n: '01',
    title: 'Ijazah Verification',
    body: 'We confirm the Ustadha holds a valid Ijazah — a certified, traceable chain of Quranic transmission. This is the non-negotiable baseline.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  },
  {
    n: '02',
    title: 'Live Recitation Assessment',
    body: 'Our Head Teacher evaluates every Ustadha in a live recitation session before she teaches a single student.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  },
  {
    n: '03',
    title: 'Teaching Methodology Interview',
    body: 'We evaluate specifically how each Ustadha creates a safe, patient learning space. Good recitation and good teaching are different skills — we verify both.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    n: '04',
    title: 'Privacy & Safeguarding Check',
    body: 'Every Ustadha completes a safeguarding background check and is bound by strict session privacy protocols.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  },
];

/** Trust points — Kids landing page. */
export const kidsTrustPoints: string[] = [
  'Progress updates on request — always included, no extra fee',
  'Sit in on any session, announced or unannounced',
  'Direct teacher contact from your first class onward',
  'Safeguarding checks renewed annually — not a one-time box-tick',
];

/** Trust points — Adults landing page. */
export const adultsTrustPoints: string[] = [
  'Strict male-to-male and female-to-female matching',
  '24/7 Student Portal for instant schedule management',
  'Distraction-free, professional learning environment',
];

/** Trust points — Women''s landing page. */
export const womenTrustPoints: string[] = [
  'Strictly female-to-female — no exceptions, ever',
  'Sessions never recorded without your explicit consent',
  'Teacher knows only your first name — full privacy by design',
  'Schedule around your life, not the other way around',
];

/** 3-step onboarding flow — Kids landing page. */
export const kidsOnboardingSteps: OnboardingStep[] = [
  {
    n: '1',
    title: 'Book your free class — no card required.',
    body: "Tell us your child's age, current Quran level, and when you're free. That's all we need to match you with the right teacher.",
  },
  {
    n: '2',
    title: 'Meet your teacher and start where your child is.',
    body: 'No placement test. No pressure. In the first session, the teacher listens before they teach — understanding where your child is starting from, what they enjoy, and how they learn.',
  },
  {
    n: '3',
    title: 'Watch your child want to come back for the next one.',
    body: "That's the whole point of the trial: not a sales pitch, a real first lesson. If your child isn't engaged, we'll find a better match — or we part ways, no hard feelings.",
  },
];

/** 3-step onboarding flow — Adults landing page. */
export const adultsOnboardingSteps: OnboardingStep[] = [
  {
    n: '1',
    title: 'Book your free class — no card required.',
    body: "Tell us your current level, preferred schedule, and whether you want a male or female teacher. We'll match you within 24 hours.",
  },
  {
    n: '2',
    title: 'Meet your teacher — a real session, not a sales call.',
    body: 'Your first class is a proper lesson. The teacher assesses your level, explains the plan, and you both decide if the fit is right.',
  },
  {
    n: '3',
    title: 'Learn at the pace that suits your life.',
    body: 'Sessions run around your schedule — mornings, evenings, weekends. Adjust frequency any time, with no minimum notice period.',
  },
];

/** 3-step onboarding flow — Women''s landing page. */
export const womenOnboardingSteps: OnboardingStep[] = [
  {
    n: '1',
    title: 'Book your free class — no card, no commitment.',
    body: "Tell us your level and preferred time. We'll match you with an Ustadha whose schedule fits yours within 24 hours.",
  },
  {
    n: '2',
    title: 'Your first session is a real lesson — not a pitch.',
    body: 'Your Ustadha will assess where you are, explain her approach, and start teaching. You decide whether to continue after that — zero pressure.',
  },
  {
    n: '3',
    title: 'Learn at your pace, around your life.',
    body: 'Flexible scheduling, easy rescheduling, and a make-up guarantee mean you never lose a session to life getting in the way.',
  },
];
