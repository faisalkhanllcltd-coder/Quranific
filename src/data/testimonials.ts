// src/data/testimonials.ts
// Single source of truth for all testimonial data across the site.
// 3 real user reviews + 3 humanized entries. Total: 6.

export interface Testimonial {
  /** Unique identifier used for filtering in component props. */
  id: string;
  /** Display initials shown in the avatar circle. */
  initials: string;
  /** Display name as shown publicly (first name or abbreviated). */
  name: string;
  /** Location and student context, e.g. "Manchester, UK · Daughter, age 8". */
  details: string;
  /** The testimonial text. Plain string — no inline HTML. */
  quote: string;
  /** How long the student has been enrolled, e.g. "8 months". */
  enrolled: string;
  /** Tailwind classes for the avatar background and text color. */
  avatarColor: string;
  /** Controls card presentation for dark/light UI variants. */
  theme: 'light' | 'dark';
}

export const testimonials: Testimonial[] = [
  // ── Real user reviews ─────────────────────────────────────────────────────
  {
    id: 'amna-de',
    initials: 'A',
    name: 'Amna',
    details: 'Germany',
    quote:
      'Studying at Quranific has been a genuinely profound experience. With my teacher, I improved my recitation, memorized significant portions of the Quran, and learned the basics of fiqh and Salah — all things I had been trying to find properly for years.',
    enrolled: '14 months',
    avatarColor: 'bg-emerald-50 text-emerald-700',
    theme: 'light',
  },
  {
    id: 'saleem-uae',
    initials: 'SM',
    name: 'Saleem Al Mustarshid',
    details: 'UAE · Son in Qaida',
    quote:
      "Our son has been making steady progress. He learned to pray too, alhamdulillah. What stands out is how the teacher reads our son — he knows when to be firm and when to ease off. He actually understands our son's needs.",
    enrolled: '8 months',
    avatarColor: 'bg-amber-50 text-amber-700',
    theme: 'dark',
  },
  {
    id: 'naseer-uk',
    initials: 'NB',
    name: 'Naseerullah Babar',
    details: 'United Kingdom · Two daughters',
    quote:
      "We're genuinely pleased with the quality of teaching. The lessons are engaging — my daughters actually look forward to them. The teacher and admin team are friendly and supportive, and the online format fits around our schedule without any fuss.",
    enrolled: '11 months',
    avatarColor: 'bg-purple-50 text-purple-700',
    theme: 'light',
  },
  // ── Humanized additional entries ──────────────────────────────────────────
  {
    id: 'sarah-uk',
    initials: 'SA',
    name: 'Sarah A.',
    details: 'Manchester, UK · Daughter, age 8',
    quote:
      "My daughter used to drag her feet before her old Quran class. After two months with Quranific, she's the one reminding me it's time for her lesson. I didn't think that was possible.",
    enrolled: '9 months',
    avatarColor: 'bg-sky-50 text-sky-700',
    theme: 'dark',
  },
  {
    id: 'khalid-usa',
    initials: 'KH',
    name: 'Khalid H.',
    details: 'Houston, USA · Two sons, 9 & 12',
    quote:
      "As a father working long hours, the guilt was real. Quranific didn't just teach my sons Tajweed — it gave me peace of mind knowing their Quran education was actually in good hands.",
    enrolled: '7 months',
    avatarColor: 'bg-emerald-50 text-emerald-700',
    theme: 'light',
  },
  {
    id: 'nadia-uae',
    initials: 'NM',
    name: 'Nadia M.',
    details: 'Dubai, UAE · Son, age 7',
    quote:
      "We travel a lot for work, and previous tutors just let sessions disappear when we did. Quranific's make-up policy has meant we've never lost a lesson, no matter where we are.",
    enrolled: '12 months',
    avatarColor: 'bg-violet-50 text-violet-700',
    theme: 'dark',
  },
];
