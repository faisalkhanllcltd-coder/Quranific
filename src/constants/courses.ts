// src/constants/courses.ts
// Single source of truth for all course data.
// Consumed by: courses/index.astro, courses/[slug].astro, CourseCard.astro,
//              CourseGrid.astro, ComparisonTable.astro, funnel dropdowns, JSON-LD schemas.

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseCategory = 'Kids' | 'Adult' | 'All Ages' | 'Specialist';
export type CourseSlug =
  | 'basic-qaida'
  | 'quran-reading-with-tajweed'
  | 'quran-memorization'
  | 'quran-translation-with-tafsir'
  | 'advanced-tajweed-ijazah'
  | 'arabic-language';

export interface Course {
  slug: CourseSlug;
  title: string;
  shortTitle: string;
  shortDesc: string;
  longDesc: string;
  icon: string;
  level: CourseLevel;
  category: CourseCategory;
  duration: string;
  durationMinutes: 30 | 45 | 60;
  ageRange: string;
  frequency: string;
  price: string;
  features: string[];
  riveFile: string;
  highlight?: string;
  nooraniQaida?: boolean;
  hifzIncluded?: 'full' | 'partial' | 'none';
  senAdapted?: boolean;
  groupSize?: string;
}

export const courses: Course[] = [
  {
    slug: 'basic-qaida',
    title: 'Basic Qaida',
    shortTitle: 'Qaida',
    shortDesc:
      'The perfect starting point for beginners to learn the Arabic alphabet and basic pronunciation safely.',
    longDesc:
      'Designed specifically for young beginners and new learners, our Basic Qaida course builds an unshakable foundation in Arabic reading. We utilize interactive, engaging methods to keep students focused while ensuring strict safeguarding protocols. Parents can request female tutors for their daughters and monitor progress seamlessly through our dedicated portal.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    level: 'Beginner',
    category: 'Kids',
    duration: 'Avg. 2–3 Months',
    durationMinutes: 30,
    ageRange: 'Ages 4–14',
    frequency: '2–3 sessions/week',
    price: 'From $39/mo',
    features: [
      'Interactive, highly engaging lessons to retain focus',
      'Certified tutors experienced with young children',
      'Female tutors available upon request',
      'Weekly progress reports for parental visibility',
    ],
    riveFile: 'qaida.riv',
    nooraniQaida: true,
  },
  {
    slug: 'quran-reading-with-tajweed',
    title: 'Quran Reading with Tajweed',
    shortTitle: 'Tajweed',
    shortDesc: 'Read the Quran fluently with correct Tajweed rules. Ideal for all ages.',
    longDesc:
      'Transition from basic reading to beautiful, fluent Quranic recitation. This course focuses entirely on the practical application of Tajweed rules, ensuring accurate pronunciation and rhythm. Taught by certified Al-Azhar scholars, we offer personalized pacing to suit individual learning speeds within a secure, monitored virtual environment.',
    icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    level: 'All Levels',
    category: 'All Ages',
    duration: 'Avg. 4–6 Months',
    durationMinutes: 45,
    ageRange: 'Ages 8+',
    frequency: '2–4 sessions/week',
    price: 'From $49/mo',
    features: [
      '1-on-1 personalized learning pace',
      'Focus on practical, beautiful Tajweed application',
      'Audio recording analysis for pronunciation correction',
      'Secure, monitored virtual classrooms',
    ],
    riveFile: 'tajweed.riv',
    highlight: 'Most Popular',
  },
  {
    slug: 'quran-memorization',
    title: 'Quran Memorization (Hifz)',
    shortTitle: 'Hifz',
    shortDesc: 'Structured Hifz program with expert guidance and continuous revision.',
    longDesc:
      'A dedicated, intensive program designed to help students memorize the Quran systematically. Our expert tutors employ traditional memorization techniques combined with modern tracking tools to ensure long-term retention. We emphasize continuous revision (Murajaah) and provide a structured, deeply supportive environment for this noble journey.',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    level: 'All Levels',
    category: 'All Ages',
    duration: '2–4 Years',
    durationMinutes: 45,
    ageRange: 'All Ages',
    frequency: '3–5 sessions/week',
    price: 'From $59/mo',
    features: [
      'Structured daily memorization and revision plans',
      'Milestone testing to guarantee long-term retention',
      'Dedicated support from certified Hafiz/Hafizah tutors',
      'Flexible scheduling to fit around school routines',
    ],
    riveFile: 'hifz.riv',
    hifzIncluded: 'full',
  },
  {
    slug: 'quran-translation-with-tafsir',
    title: 'Quran Translation & Tafsir',
    shortTitle: 'Tafsir',
    shortDesc: 'Understand the deeper meanings of the Quran with comprehensive exegesis.',
    longDesc:
      'Move beyond recitation and connect deeply with the profound meaning of the Quran. This course explores accurate word-by-word translation and authentic Tafsir. Perfect for adults and older teens seeking to understand the historical context, linguistic beauty, and practical life lessons of the verses.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    level: 'Intermediate',
    category: 'Adult',
    duration: 'Self-paced',
    durationMinutes: 60,
    ageRange: 'Ages 14+',
    frequency: '1–2 sessions/week',
    price: 'From $49/mo',
    features: [
      'Word-by-word Arabic to English translation',
      'Authentic Tafsir sourced from classical scholars',
      'Discussion-based learning for deeper spiritual insight',
      'Access to recorded sessions for continuous review',
    ],
    riveFile: 'tafsir.riv',
  },
  {
    slug: 'advanced-tajweed-ijazah',
    title: 'Advanced Tajweed (Ijazah)',
    shortTitle: 'Ijazah',
    shortDesc: 'Achieve absolute mastery in recitation and earn a formally certified Ijazah.',
    longDesc:
      'An intensive, high-level program for advanced readers aiming for absolute mastery. Students will recite the entire Quran to a certified Sheikh or Sheikha holding an authentic Sanad linked continuously to the Prophet Muhammad (PBUH). Upon rigorous testing and successful completion, students are awarded a formal, globally recognized Ijazah.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    level: 'Advanced',
    category: 'Specialist',
    duration: '6–12 Months',
    durationMinutes: 60,
    ageRange: 'Adults',
    frequency: '2–3 sessions/week',
    price: 'From $69/mo',
    features: [
      'Direct, 1-on-1 recitation to a certified Sheikh/Sheikha',
      'Authentic Sanad tracking back to the Prophet (PBUH)',
      'Rigorous testing on theoretical Tajweed rules',
      'Formal Ijazah certificate awarded upon successful completion',
    ],
    riveFile: 'ijazah.riv',
  },
  {
    slug: 'arabic-language',
    title: 'Arabic Language',
    shortTitle: 'Arabic',
    shortDesc: 'Master conversational and Quranic Arabic with native-speaking experts.',
    longDesc:
      'A comprehensive language program bridging conversational fluency with deep Quranic understanding. Taught by native Arab speakers, this course covers grammar structure, expansive vocabulary, and practical conversation skills, providing the ultimate tool to understand Islamic texts and communicate effectively in the Arab world.',
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
    level: 'All Levels',
    category: 'All Ages',
    duration: 'Avg. 6–9 Months',
    durationMinutes: 45,
    ageRange: 'Ages 10+',
    frequency: '2–3 sessions/week',
    price: 'From $49/mo',
    features: [
      'Taught exclusively by native Arab-speaking instructors',
      'Curriculum balances conversational and Quranic Arabic',
      'Interactive speaking, listening, and writing exercises',
      'Tailored pacing from absolute beginners to advanced speakers',
    ],
    riveFile: 'arabic.riv',
  },
];

// Convenience exports (required by PricingCalculator.svelte and filter chips)
export const COURSE_LIST = courses;

/** Distinct category values present in the data — used for filter chips. */
export const COURSE_CATEGORIES: string[] = [
  'All Courses',
  ...Array.from(new Set(courses.map((c) => c.category))),
];
