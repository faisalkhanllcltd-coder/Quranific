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
  whoItsFor: string;
  whyThisCourse: string;
  icon: string;
  level: CourseLevel;
  category: CourseCategory;
  duration: string;
  durationMinutes: 30 | 45 | 60;
  ageRange: string;
  frequency: string;
  instructionLanguage: string[];
  price: string;
  features: string[];
  curriculum: { title: string; desc: string }[];
  prerequisites: string[];
  relatedSlugs: CourseSlug[];
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
    whoItsFor:
      'Children aged 4-14 with zero prior knowledge of Arabic, or older beginners who need to unlearn poor pronunciation habits.',
    whyThisCourse:
      'We do not rush the basics. Our gamified approach and SEN-adapted methodologies ensure children associate learning the Quran with joy, not stress. We focus heavily on Makharij (correct articulation points) from day one.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    level: 'Beginner',
    category: 'Kids',
    duration: 'Avg. 2–3 Months',
    durationMinutes: 30,
    ageRange: 'Ages 4–14',
    frequency: '2–3 sessions/week',
    instructionLanguage: ['English', 'Arabic'],
    price: 'From $39/mo',
    features: [
      'Interactive, highly engaging lessons to retain focus',
      'Certified tutors experienced with young children',
      'Female tutors available upon request',
      'Weekly progress reports for parental visibility',
    ],
    curriculum: [
      {
        title: 'The Arabic Alphabet',
        desc: 'Mastery of individual letter recognition and pronunciation.',
      },
      {
        title: 'Connecting Letters',
        desc: 'Learning how letter shapes change at the beginning, middle, and end of words.',
      },
      { title: 'Short Vowels (Harakat)', desc: 'Understanding Fatha, Kasra, and Damma.' },
      { title: 'Basic Word Construction', desc: 'Fluently reading short, 3-letter Quranic words.' },
    ],
    prerequisites: ['No prior knowledge required.'],
    relatedSlugs: ['quran-reading-with-tajweed', 'arabic-language'],
    riveFile: 'qaida.riv',
    nooraniQaida: true,
    senAdapted: true,
    groupSize: '1-on-1',
  },
  {
    slug: 'quran-reading-with-tajweed',
    title: 'Quran Reading with Tajweed',
    shortTitle: 'Tajweed',
    shortDesc: 'Read the Quran fluently with correct Tajweed rules. Ideal for all ages.',
    longDesc:
      'Transition from basic reading to beautiful, fluent Quranic recitation. This course focuses entirely on the practical application of Tajweed rules, ensuring accurate pronunciation and rhythm. Taught by certified Al-Azhar scholars, we offer personalized pacing to suit individual learning speeds within a secure, monitored virtual environment.',
    whoItsFor:
      'Students who have completed Basic Qaida and want to transition to reading directly from the Mushaf, or adults looking to correct their recitation.',
    whyThisCourse:
      'We bypass heavy theoretical terminology and focus purely on practical application. Your child will learn how to make the Quran sound beautiful without being bogged down by complex rule memorization.',
    icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    level: 'All Levels',
    category: 'All Ages',
    duration: 'Avg. 4–6 Months',
    durationMinutes: 45,
    ageRange: 'Ages 8+',
    frequency: '2–4 sessions/week',
    instructionLanguage: ['English', 'Arabic'],
    price: 'From $49/mo',
    features: [
      '1-on-1 personalized learning pace',
      'Focus on practical, beautiful Tajweed application',
      'Audio recording analysis for pronunciation correction',
      'Secure, monitored virtual classrooms',
    ],
    curriculum: [
      {
        title: 'Rules of Noon & Meem Sakinah',
        desc: 'Practical application of nasal sounds and merging.',
      },
      {
        title: 'Madd Rules (Elongation)',
        desc: 'Understanding when and how long to stretch vowels.',
      },
      {
        title: 'Qalqalah (Echoing Letters)',
        desc: 'Perfecting the sharp rebounding sound of specific letters.',
      },
      {
        title: 'Fluency Training',
        desc: 'Connecting verses smoothly without breaking the rhythm.',
      },
    ],
    prerequisites: ['Completion of Basic Qaida or ability to read basic Arabic words.'],
    relatedSlugs: ['quran-memorization', 'arabic-language'],
    riveFile: 'tajweed.riv',
    highlight: 'Most Popular',
    senAdapted: true,
    groupSize: '1-on-1',
  },
  {
    slug: 'quran-memorization',
    title: 'Quran Memorization (Hifz)',
    shortTitle: 'Hifz',
    shortDesc: 'Structured Hifz program with expert guidance and continuous revision.',
    longDesc:
      'A dedicated, intensive program designed to help students memorize the Quran systematically. Our expert tutors employ traditional memorization techniques combined with modern tracking tools to ensure long-term retention. We emphasize continuous revision (Murajaah) and provide a structured, deeply supportive environment for this noble journey.',
    whoItsFor:
      'Dedicated students of any age who have fluent reading ability and the daily discipline required to commit the Quran to memory.',
    whyThisCourse:
      'Memorization is easy; retention is difficult. Our unique methodology heavily weighs daily revision (Murajaah) to guarantee that what is memorized is never forgotten. We provide a customized weekly schedule to prevent burnout.',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    level: 'All Levels',
    category: 'All Ages',
    duration: '2–4 Years',
    durationMinutes: 45,
    ageRange: 'All Ages',
    frequency: '3–5 sessions/week',
    instructionLanguage: ['English', 'Arabic'],
    price: 'From $59/mo',
    features: [
      'Structured daily memorization and revision plans',
      'Milestone testing to guarantee long-term retention',
      'Dedicated support from certified Hafiz/Hafizah tutors',
      'Flexible scheduling to fit around school routines',
    ],
    curriculum: [
      {
        title: 'Juz Amma & Tabarak',
        desc: 'Starting with the shorter, most frequently recited chapters.',
      },
      { title: 'Daily Sabaq (New Lesson)', desc: 'Memorizing new verses with correct Tajweed.' },
      {
        title: 'Sabqi (Recent Revision)',
        desc: 'Testing the last 5-10 pages to lock them into medium-term memory.',
      },
      {
        title: 'Manzil (Old Revision)',
        desc: 'Cyclical testing of all previously memorized Juz to ensure lifetime retention.',
      },
    ],
    prerequisites: ['Fluent reading of the Quran with basic Tajweed rules applied.'],
    relatedSlugs: ['advanced-tajweed-ijazah', 'quran-translation-with-tafsir'],
    riveFile: 'hifz.riv',
    hifzIncluded: 'full',
    groupSize: '1-on-1',
  },
  {
    slug: 'quran-translation-with-tafsir',
    title: 'Quran Translation & Tafsir',
    shortTitle: 'Tafsir',
    shortDesc: 'Understand the deeper meanings of the Quran with comprehensive exegesis.',
    longDesc:
      'Move beyond recitation and connect deeply with the profound meaning of the Quran. This course explores accurate word-by-word translation and authentic Tafsir. Perfect for adults and older teens seeking to understand the historical context, linguistic beauty, and practical life lessons of the verses.',
    whoItsFor:
      'Adults, older teenagers, and new Muslims who want to understand the message of the Quran and apply its teachings to their daily lives.',
    whyThisCourse:
      'We source exclusively from classical, universally accepted scholars (Ibn Kathir, Al-Jalalayn). We bridge the gap between historical context and modern-day application, making the lessons highly relevant to your daily life.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    level: 'Intermediate',
    category: 'Adult',
    duration: 'Self-paced',
    durationMinutes: 60,
    ageRange: 'Ages 14+',
    frequency: '1–2 sessions/week',
    instructionLanguage: ['English', 'Arabic'],
    price: 'From $49/mo',
    features: [
      'Word-by-word Arabic to English translation',
      'Authentic Tafsir sourced from classical scholars',
      'Discussion-based learning for deeper spiritual insight',
      'Access to recorded sessions for continuous review',
    ],
    curriculum: [
      {
        title: 'Makki vs. Madani Context',
        desc: 'Understanding the timeline and environment of the revelation.',
      },
      {
        title: 'Word-for-Word Translation',
        desc: 'Breaking down the Arabic vocabulary directly into your native language.',
      },
      {
        title: 'Asbab Al-Nuzul',
        desc: 'Learning the specific historical events that triggered each revelation.',
      },
      {
        title: 'Practical Application',
        desc: 'Extracting moral, ethical, and legal lessons for modern living.',
      },
    ],
    prerequisites: [
      'Ability to read Arabic is helpful, but not strictly required (transliteration options available).',
    ],
    relatedSlugs: ['arabic-language', 'quran-reading-with-tajweed'],
    riveFile: 'tafsir.riv',
    groupSize: '1-on-1',
  },
  {
    slug: 'advanced-tajweed-ijazah',
    title: 'Advanced Tajweed (Ijazah)',
    shortTitle: 'Ijazah',
    shortDesc: 'Achieve absolute mastery in recitation and earn a formally certified Ijazah.',
    longDesc:
      'An intensive, high-level program for advanced readers aiming for absolute mastery. Students will recite the entire Quran to a certified Sheikh or Sheikha holding an authentic Sanad linked continuously to the Prophet Muhammad (PBUH). Upon rigorous testing and successful completion, students are awarded a formal, globally recognized Ijazah.',
    whoItsFor:
      'Advanced readers, existing teachers, or Hafiz students who want to formalize their mastery and gain the authority to teach others.',
    whyThisCourse:
      'Authenticity is everything. Your Ijazah is only as strong as the Sanad (chain of transmission) of your teacher. We only pair Ijazah students with master scholars whose chains are universally verified.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    level: 'Advanced',
    category: 'Specialist',
    duration: '6–12 Months',
    durationMinutes: 60,
    ageRange: 'Adults',
    frequency: '2–3 sessions/week',
    instructionLanguage: ['Arabic', 'English'],
    price: 'From $69/mo',
    features: [
      'Direct, 1-on-1 recitation to a certified Sheikh/Sheikha',
      'Authentic Sanad tracking back to the Prophet (PBUH)',
      'Rigorous testing on theoretical Tajweed rules',
      'Formal Ijazah certificate awarded upon successful completion',
    ],
    curriculum: [
      {
        title: 'Tuhfat al-Atfal & Al-Jazariyyah',
        desc: 'Study of classical Tajweed poems required for theoretical mastery.',
      },
      {
        title: 'Khatmah Assessment',
        desc: 'Complete recitation of the entire Quran from memory or Mushaf.',
      },
      { title: 'Error Correction', desc: 'Eliminating micro-errors in Makharij and Sifat.' },
      {
        title: 'Final Certification',
        desc: 'Issuance of the physical and digital Ijazah with your name in the Sanad.',
      },
    ],
    prerequisites: ['Flawless recitation of the Quran with complete application of Tajweed rules.'],
    relatedSlugs: ['quran-memorization', 'quran-translation-with-tafsir'],
    riveFile: 'ijazah.riv',
    groupSize: '1-on-1',
  },
  {
    slug: 'arabic-language',
    title: 'Arabic Language',
    shortTitle: 'Arabic',
    shortDesc: 'Master conversational and Quranic Arabic with native-speaking experts.',
    longDesc:
      'A comprehensive language program bridging conversational fluency with deep Quranic understanding. Taught by native Arab speakers, this course covers grammar structure, expansive vocabulary, and practical conversation skills, providing the ultimate tool to understand Islamic texts and communicate effectively in the Arab world.',
    whoItsFor:
      'Professionals, students, and expatriates who want to communicate effectively in the Middle East, or Muslims seeking to understand the Quran directly without translation.',
    whyThisCourse:
      'We do not just teach textbook grammar. We emphasize active listening and speaking from day one. You will learn to form sentences instinctively, taught exclusively by native Arab speakers who understand regional nuances.',
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
    level: 'All Levels',
    category: 'All Ages',
    duration: 'Avg. 6–9 Months',
    durationMinutes: 45,
    ageRange: 'Ages 10+',
    frequency: '2–3 sessions/week',
    instructionLanguage: ['Arabic', 'English'],
    price: 'From $49/mo',
    features: [
      'Taught exclusively by native Arab-speaking instructors',
      'Curriculum balances conversational and Quranic Arabic',
      'Interactive speaking, listening, and writing exercises',
      'Tailored pacing from absolute beginners to advanced speakers',
    ],
    curriculum: [
      {
        title: 'Vocabulary Expansion',
        desc: 'Building a robust dictionary of high-frequency words used in daily life and the Quran.',
      },
      {
        title: 'Nahu (Grammar)',
        desc: 'Understanding sentence structure, verbs, nouns, and gender alignment.',
      },
      {
        title: 'Sarf (Morphology)',
        desc: 'Learning how words change forms to indicate tense and plurality.',
      },
      {
        title: 'Conversational Fluency',
        desc: 'Live, immersive dialogue practice with your instructor.',
      },
    ],
    prerequisites: ['Basic reading ability of the Arabic script.'],
    relatedSlugs: ['quran-translation-with-tafsir', 'quran-reading-with-tajweed'],
    riveFile: 'arabic.riv',
    groupSize: '1-on-1',
  },
];
