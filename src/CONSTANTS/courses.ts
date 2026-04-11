// src/constants/courses.ts
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseSlug = 'basic-qaida' | 'quran-reading-with-tajweed' | 'quran-memorization' | 'quran-translation-with-tafsir' | 'advanced-tajweed-ijazah' | 'arabic-language';

export interface Course {
  slug: CourseSlug;
  title: string;
  shortTitle: string;
  description: string;
  level: CourseLevel;
  riveFile: string;
  durationMinutes: 30 | 45 | 60;
}

export const COURSES: Record<CourseSlug, Course> = {
  'basic-qaida': {
    slug: 'basic-qaida',
    title: 'Basic Qaida',
    shortTitle: 'Qaida',
    description: 'Build a strong foundation. Learn the Arabic alphabet and basic pronunciation rules.',
    level: 'Beginner',
    riveFile: 'course-qaida.riv',
    durationMinutes: 30,
  },
  'quran-reading-with-tajweed': {
    slug: 'quran-reading-with-tajweed',
    title: 'Quran Reading with Tajweed',
    shortTitle: 'Tajweed',
    description: 'Learn to recite the Quran beautifully and accurately with proper phonetic rules.',
    level: 'Intermediate',
    riveFile: 'course-tajweed.riv',
    durationMinutes: 45,
  },
  'quran-memorization': {
    slug: 'quran-memorization',
    title: 'Quran Memorization (Hifz)',
    shortTitle: 'Memorization',
    description: 'A structured, step-by-step program to memorize the Holy Quran and retain it.',
    level: 'Intermediate',
    riveFile: 'course-hifz.riv',
    durationMinutes: 45,
  },
  'quran-translation-with-tafsir': {
    slug: 'quran-translation-with-tafsir',
    title: 'Quran Translation with Tafsir',
    shortTitle: 'Tafsir',
    description: 'Understand the deep meaning, context, and translation of the Quranic verses.',
    level: 'Advanced',
    riveFile: 'course-tafsir.riv',
    durationMinutes: 60,
  },
  'advanced-tajweed-ijazah': {
    slug: 'advanced-tajweed-ijazah',
    title: 'Advanced Tajweed Mastery (Ijazah)',
    shortTitle: 'Ijazah',
    description: 'Achieve mastery in recitation and earn your certification (Ijazah) with a continuous chain.',
    level: 'Advanced',
    riveFile: 'course-ijazah.riv',
    durationMinutes: 60,
  },
  'arabic-language': {
    slug: 'arabic-language',
    title: 'Arabic Language',
    shortTitle: 'Arabic',
    description: 'Learn to speak, read, and write Arabic to deeply connect with the Quran and Islamic texts.',
    level: 'Beginner',
    riveFile: 'course-arabic.riv',
    durationMinutes: 45,
  }
} as const;

export const COURSE_LIST = Object.values(COURSES);