// src/data/courses.ts

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseSlug = 'basic-qaida' | 'quran-reading-with-tajweed' | 'quran-memorization' | 'quran-translation-with-tafsir' | 'advanced-tajweed-ijazah' | 'arabic-language';

export interface Course {
  slug: CourseSlug;
  title: string;
  shortTitle: string;     // For mobile headers or tight UI spaces
  shortDesc: string;      // For Header Dropdowns and Mega Page Cards
  longDesc: string;       // For the dedicated detail page
  icon: string;           // Emoji or SVG reference
  level: CourseLevel;
  duration: string;       // E.g., "Flexible (Avg. 2-3 Months)"
  durationMinutes: 30 | 45 | 60; // For booking/scheduling logic
  features: string[];     // Bullet points for the sales page
  riveFile: string;       // For animation assets
}

// THE SINGLE SOURCE OF TRUTH
export const courses: Course[] = [
  {
    slug: "basic-qaida",
    title: "Basic Qaida",
    shortTitle: "Qaida",
    shortDesc: "Perfect for absolute beginners.",
    longDesc: "Start your Quranic journey by mastering the Arabic alphabet, correct pronunciation (Makharij), and basic joining of letters. This is the mandatory foundation for fluent reading.",
    icon: "📖",
    level: "Beginner",
    duration: "Flexible (Avg. 2-3 Months)",
    durationMinutes: 30,
    features: ["Arabic Alphabet Recognition", "Correct Pronunciation (Makharij)", "Vowel Marks (Harakat)", "Joining Letters"],
    riveFile: "course-qaida.riv"
  },
  {
    // FIX: Standardized slug to match the form dropdowns
    slug: "quran-reading-with-tajweed",
    title: "Quran Reading with Tajweed",
    shortTitle: "Tajweed",
    shortDesc: "Read fluently with proper rules.",
    longDesc: "Learn to read the Holy Quran beautifully and accurately. We focus on implementing foundational Tajweed rules so you can recite with confidence and precision.",
    icon: "🎙️",
    level: "All Levels",
    duration: "Ongoing",
    durationMinutes: 45,
    features: ["Fluid Recitation", "Application of Tajweed Rules", "Breath Control (Waqf)", "Error Correction"],
    riveFile: "course-tajweed.riv"
  },
  {
    slug: "quran-memorization",
    title: "Quran Memorization (Hifz)",
    shortTitle: "Memorization",
    shortDesc: "Hifz programs for all ages.",
    longDesc: "Structured Hifz programs tailored to your memorization capacity. We employ proven retention techniques, balancing new lessons (Sabaq) with daily revision (Manzil).",
    icon: "🧠",
    level: "All Levels",
    duration: "1 to 3+ Years",
    durationMinutes: 45,
    features: ["Custom Memorization Plan", "Daily Sabaq & Sabqi", "Long-term Retention (Manzil)", "Progress Tracking"],
    riveFile: "course-hifz.riv"
  },
  {
    // FIX: Standardized slug to match the form dropdowns
    slug: "quran-translation-with-tafsir",
    title: "Quran Translation & Tafsir",
    shortTitle: "Tafsir",
    shortDesc: "Understand the meaning deeply.",
    longDesc: "Go beyond recitation and understand the profound meanings of the verses. This course covers word-by-word translation and the historical context (Asbab al-Nuzul) of the surahs.",
    icon: "💡",
    level: "Intermediate",
    duration: "Ongoing",
    durationMinutes: 60,
    features: ["Word-by-Word Translation", "Contextual Tafsir", "Practical Life Application", "Thematic Studies"],
    riveFile: "course-tafsir.riv"
  },
  {
    // FIX: Standardized slug
    slug: "advanced-tajweed-ijazah",
    title: "Advanced Tajweed (Ijazah)",
    shortTitle: "Ijazah",
    shortDesc: "Mastery for dedicated students.",
    longDesc: "For advanced reciters seeking an Ijazah (certification) with an unbroken chain of transmission (Sanad) to the Prophet Muhammad (PBUH). Strict adherence to perfect Makharij and Sifat.",
    icon: "📜",
    level: "Advanced",
    duration: "Varies by Student",
    durationMinutes: 60,
    features: ["Sanad Connection", "Rigorous Testing", "Mastery of Sifat", "Official Certification"],
    riveFile: "course-ijazah.riv"
  },
  {
    slug: "arabic-language",
    title: "Arabic Language",
    shortTitle: "Arabic",
    shortDesc: "Speak and understand Arabic.",
    longDesc: "Master Classical (Fusha) and conversational Arabic. Understand the grammar (Nahw) and morphology (Sarf) necessary to comprehend the Quran directly in its revealed language.",
    icon: "🗣️",
    level: "All Levels",
    duration: "Ongoing",
    durationMinutes: 45,
    features: ["Vocabulary Building", "Grammar (Nahw & Sarf)", "Conversational Practice", "Reading Comprehension"],
    riveFile: "course-arabic.riv"
  }
];

// Convenience export for funnel dropdowns
export const COURSE_LIST = courses;