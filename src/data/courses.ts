// src/data/courses.ts

// 1. We define the strict blueprint (The Interface)
export interface Course {
  slug: string;
  title: string;
  shortDesc: string;      // Used for Header Dropdowns and the Mega Page Cards
  longDesc: string;       // Used for the dedicated detail page
  icon: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  features: string[];     // Bullet points for the sales page
}

// 2. We inject the actual data (The Single Source of Truth)
export const courses: Course[] = [
  {
    slug: "basic-qaida",
    title: "Basic Qaida",
    shortDesc: "Perfect for absolute beginners.",
    longDesc: "Start your Quranic journey by mastering the Arabic alphabet, correct pronunciation (Makharij), and basic joining of letters. This is the mandatory foundation for fluent reading.",
    icon: "📖",
    level: "Beginner",
    duration: "Flexible (Avg. 2-3 Months)",
    features: ["Arabic Alphabet Recognition", "Correct Pronunciation (Makharij)", "Vowel Marks (Harakat)", "Joining Letters"]
  },
  {
    slug: "quran-reading",
    title: "Quran Reading with Tajweed",
    shortDesc: "Read fluently with proper rules.",
    longDesc: "Learn to read the Holy Quran beautifully and accurately. We focus on implementing foundational Tajweed rules so you can recite with confidence and precision.",
    icon: "🎙️",
    level: "All Levels",
    duration: "Ongoing",
    features: ["Fluid Recitation", "Application of Tajweed Rules", "Breath Control (Waqf)", "Error Correction"]
  },
  {
    slug: "quran-memorization",
    title: "Quran Memorization",
    shortDesc: "Hifz programs for all ages.",
    longDesc: "Structured Hifz programs tailored to your memorization capacity. We employ proven retention techniques, balancing new lessons (Sabaq) with daily revision (Manzil).",
    icon: "🧠",
    level: "All Levels",
    duration: "1 to 3+ Years",
    features: ["Custom Memorization Plan", "Daily Sabaq & Sabqi", "Long-term Retention (Manzil)", "Progress Tracking"]
  },
  {
    slug: "quran-translation",
    title: "Quran Translation & Tafsir",
    shortDesc: "Understand the meaning deeply.",
    longDesc: "Go beyond recitation and understand the profound meanings of the verses. This course covers word-by-word translation and the historical context (Asbab al-Nuzul) of the surahs.",
    icon: "💡",
    level: "Intermediate",
    duration: "Ongoing",
    features: ["Word-by-Word Translation", "Contextual Tafsir", "Practical Life Application", "Thematic Studies"]
  },
  {
    slug: "advanced-tajweed",
    title: "Advanced Tajweed (Ijazah)",
    shortDesc: "Mastery for dedicated students.",
    longDesc: "For advanced reciters seeking an Ijazah (certification) with an unbroken chain of transmission (Sanad) to the Prophet Muhammad (PBUH). Strict adherence to perfect Makharij and Sifat.",
    icon: "📜",
    level: "Advanced",
    duration: "Varies by Student",
    features: ["Sanad Connection", "Rigorous Testing", "Mastery of Sifat", "Official Certification"]
  },
  {
    slug: "arabic-language",
    title: "Arabic Language",
    shortDesc: "Speak and understand Arabic.",
    longDesc: "Master Classical (Fusha) and conversational Arabic. Understand the grammar (Nahw) and morphology (Sarf) necessary to comprehend the Quran directly in its revealed language.",
    icon: "🗣️",
    level: "All Levels",
    duration: "Ongoing",
    features: ["Vocabulary Building", "Grammar (Nahw & Sarf)", "Conversational Practice", "Reading Comprehension"]
  }
];