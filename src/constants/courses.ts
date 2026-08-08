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
  shortTitle: string; // For mobile headers or tight UI spaces
  shortDesc: string; // For header dropdowns and mega page cards
  longDesc: string; // For the dedicated detail page
  icon: string; // Emoji reference
  level: CourseLevel;
  category: CourseCategory;
  duration: string; // Human-readable, e.g. "Flexible (Avg. 2–3 Months)"
  durationMinutes: 30 | 45 | 60;
  ageRange: string; // e.g. "Ages 5–15", "Adults 18+", "All Ages"
  frequency: string; // e.g. "2–3 sessions/week", "Flexible"
  price: string; // e.g. "From $39/mo", "From $59/mo"
  features: string[]; // Bullet points for the course detail page
  riveFile: string; // For animation assets (future use)
  // Optional fields
  highlight?: string; // Badge on the card, e.g. "Most Popular"
  nooraniQaida?: boolean; // Includes Noorani Qaida content
  hifzIncluded?: 'full' | 'partial' | 'none';
  senAdapted?: boolean; // SEN/learning-differences-adapted teaching
  groupSize?: string; // Always "1-on-1" but kept flexible
}

// THE SINGLE SOURCE OF TRUTH
export const courses: Course[] = [
  {
    slug: 'basic-qaida',
    title: 'Basic Qaida',
    shortTitle: 'Qaida',
    shortDesc: 'Perfect for absolute beginners — learn every Arabic letter from zero.',
    longDesc:
      'Start your Quranic journey by mastering the Arabic alphabet, correct pronunciation (Makharij), and the basic joining of letters. This is the mandatory foundation for fluent Quranic reading, taught gently and patiently for young learners and adult beginners alike.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    level: 'Beginner',
    category: 'Kids',
    duration: 'Avg. 2–3 Months',
    durationMinutes: 30,
    ageRange: 'Ages 4–14',
    frequency: '2–3 sessions/week',
    price: 'From $39/mo',
    features: [
      'Arabic Alphabet Recognition (all 29 letters)',
      'Correct Pronunciation & Makharij',
      'Vowel Marks (Harakat: Fatha, Kasra, Dhamma)',
      'Letter Joining & Word Formation',
      'Noorani Qaida reading system',
      'Introduction to short Surahs',
    ],
    riveFile: 'course-qaida.riv',
    highlight: 'Best for Beginners',
    nooraniQaida: true,
    hifzIncluded: 'none',
    senAdapted: false,
  },
  {
    slug: 'quran-reading-with-tajweed',
    title: 'Quran Reading with Tajweed',
    shortTitle: 'Tajweed',
    shortDesc: 'Read the Quran fluently and beautifully with correct Tajweed rules.',
    longDesc:
      'Learn to read the Holy Quran beautifully and accurately. We focus on implementing foundational and advanced Tajweed rules — from Makhaarij to Noon Sakinah, Madd, and Waqf — so you recite with the confidence and precision the Quran deserves.',
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    level: 'All Levels',
    category: 'All Ages',
    duration: 'Ongoing',
    durationMinutes: 45,
    ageRange: 'Ages 8+',
    frequency: '2–3 sessions/week',
    price: 'From $39/mo',
    features: [
      'Full Tajweed rules: Makhaarij, Sifaat, Noon Sakinah, Madd',
      'Fluid Recitation & Fluency Building',
      'Waqf & Ibtida (correct stopping and starting)',
      'Juz Amma full recitation with Tajweed applied',
      'Error Correction by Ijazah-certified teacher',
      'Weekly Surah sign-off assessments',
    ],
    riveFile: 'course-tajweed.riv',
    nooraniQaida: false,
    hifzIncluded: 'partial',
    senAdapted: false,
  },
  {
    slug: 'quran-memorization',
    title: 'Quran Memorization (Hifz)',
    shortTitle: 'Hifz',
    shortDesc: 'Structured Hifz programmes for children and adults of all ages.',
    longDesc:
      'Structured Hifz programmes tailored to your memorisation capacity. We employ proven retention techniques — balancing new lessons (Sabaq) with daily revision (Sabqi and Manzil) — to ensure what is memorised stays memorised. Matched with an Ijazah-holding specialist.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    level: 'All Levels',
    category: 'All Ages',
    duration: '1 to 3+ Years',
    durationMinutes: 45,
    ageRange: 'All Ages',
    frequency: '3–5 sessions/week',
    price: 'From $59/mo',
    features: [
      'Custom Memorisation Plan tailored to your pace',
      'Daily Sabaq (new portion) & Sabqi (recent revision)',
      'Long-term Manzil (full Quran revision) cycles',
      'Spaced Repetition for unbreakable retention',
      'Waqf & Ibtida: correct stopping and starting rules',
      'Progress Tracking with on-demand reports',
    ],
    riveFile: 'course-hifz.riv',
    nooraniQaida: false,
    hifzIncluded: 'full',
    senAdapted: false,
  },
  {
    slug: 'quran-translation-with-tafsir',
    title: 'Quran Translation & Tafsir',
    shortTitle: 'Tafsir',
    shortDesc: 'Understand the profound meaning of every verse, word by word.',
    longDesc:
      'Go beyond recitation and understand the profound meanings of the verses. This course covers word-by-word translation, grammatical analysis, and the historical context (Asbab al-Nuzul) of the Surahs, so the Quran speaks to you directly in your daily life.',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    level: 'Intermediate',
    category: 'Adult',
    duration: 'Ongoing',
    durationMinutes: 60,
    ageRange: 'Ages 14+',
    frequency: '1–2 sessions/week',
    price: 'From $49/mo',
    features: [
      'Word-by-Word Translation with grammatical analysis',
      'Contextual Tafsir (Asbab al-Nuzul: reasons for revelation)',
      'Practical Life Application of Quranic guidance',
      'Thematic Studies across related Surahs',
      'Understanding Quranic Arabic vocabulary',
      'Scholar-referenced commentary (Tafsir Ibn Kathir & others)',
    ],
    riveFile: 'course-tafsir.riv',
    nooraniQaida: false,
    hifzIncluded: 'none',
    senAdapted: false,
  },
  {
    slug: 'advanced-tajweed-ijazah',
    title: 'Advanced Tajweed (Ijazah)',
    shortTitle: 'Ijazah',
    shortDesc: 'Earn an Ijazah with an unbroken chain back to the Prophet ﷺ.',
    longDesc:
      'For advanced reciters seeking an Ijazah — a certification with an unbroken chain of transmission (Sanad) back to the Prophet Muhammad (ﷺ). Strict adherence to perfect Makharij, Sifaat, and all Tajweed rules under direct examination by a certified Ijazah holder.',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    level: 'Advanced',
    category: 'Specialist',
    duration: 'Varies by Student',
    durationMinutes: 60,
    ageRange: 'Adults (strong Tajweed req.)',
    frequency: '3–5 sessions/week',
    price: 'From $79/mo',
    features: [
      'Sanad Connection: unbroken chain to the Prophet ﷺ',
      'Rigorous Testing of all Tajweed rules',
      'Mastery of Sifaat al-Huruf (letter characteristics)',
      'Makharij perfection under live examination',
      'Full recitation of the Quran with teacher sign-off',
      'Official Ijazah Certificate upon completion',
    ],
    riveFile: 'course-ijazah.riv',
    highlight: 'Certification',
    nooraniQaida: false,
    hifzIncluded: 'full',
    senAdapted: false,
  },
  {
    slug: 'arabic-language',
    title: 'Arabic Language',
    shortTitle: 'Arabic',
    shortDesc: 'Master Classical Arabic grammar and vocabulary to understand the Quran directly.',
    longDesc:
      'Master Classical (Fusha) Arabic — the language of the Quran. Understand the grammar (Nahw) and morphology (Sarf) necessary to comprehend the Quran directly in its revealed language, removing the dependency on translations for your Quranic understanding.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    level: 'All Levels',
    category: 'All Ages',
    duration: 'Ongoing',
    durationMinutes: 45,
    ageRange: 'Ages 10+',
    frequency: '2–3 sessions/week',
    price: 'From $39/mo',
    features: [
      'Vocabulary Building (core Quranic word roots)',
      'Grammar: Nahw (syntax) & Sarf (morphology)',
      'Reading Comprehension of Quranic passages',
      'Conversational Classical Arabic practice',
      'Quran word analysis: understanding each verse directly',
      'Medina Arabic Book series curriculum',
    ],
    riveFile: 'course-arabic.riv',
    nooraniQaida: false,
    hifzIncluded: 'none',
    senAdapted: false,
  },
];

// Convenience exports
export const COURSE_LIST = courses;

/** Distinct category values present in the data — used for filter chips. */
export const COURSE_CATEGORIES: string[] = [
  'All Courses',
  ...Array.from(new Set(courses.map((c) => c.category))),
];
