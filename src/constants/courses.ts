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
  quote?: string;
  quoteAuthor?: string;
  outcome?: string;
  idealFor?: string[];
  notFor?: { text: string; linkText?: string; linkUrl?: string }[];
  courseFaqs?: { question: string; answer: string }[];
  cardHook?: string;
  cardDesc?: string;
  bestFor?: string;
  cardOutcomes?: string[];
}

export const courses: Course[] = [
  {
    slug: 'basic-qaida',
    title: 'Basic Qaida: Your Foundation for Reading the Quran',
    shortTitle: 'Qaida',
    shortDesc:
      'From your first Arabic letter to reading real Quranic words. No Arabic background required.',
    longDesc:
      'Start reading the Quran with confidence. Built for recognition and skill transfer — not just finishing a page.',
    whoItsFor:
      'Children aged 4-14 with zero prior knowledge of Arabic, or older beginners who need to unlearn poor pronunciation habits.',
    whyThisCourse:
      "We don't graduate on page count. We graduate when you can pick up a Mushaf and decode a verse you've never seen. Less transliteration. More independence.",
    cardHook: 'From letters to real words.',
    cardDesc:
      'The gold-standard foundation for absolute beginners. Learn to confidently decode and pronounce Quranic Arabic.',
    bestFor: 'Absolute beginners',
    cardOutcomes: [
      'Zero Arabic background required',
      'Master letters, vowels, and joining rules',
      'Read unseen words independently',
    ],
    quote:
      "My son spent 6 months on a Qaida app and still couldn't decode new words. Quranific actually taught him how to read independently.",
    quoteAuthor: 'Parent of a 7-year-old student',
    outcome: 'Read a new Quranic word confidently — without hearing it first.',
    idealFor: [
      'Absolute beginners (any age)',
      'Kids starting fresh',
      'Adults starting over',
      'Anyone stuck relying on transliteration',
    ],
    notFor: [
      {
        text: 'Already reading fluently?',
        linkText: 'Quran Reading with Tajweed',
        linkUrl: '/courses/quran-reading-with-tajweed/',
      },
    ],
    courseFaqs: [
      {
        question: 'Do I need to know Arabic before starting?',
        answer: 'No. Basic Qaida assumes zero prior Arabic knowledge.',
      },
      {
        question: 'What age is this course for?',
        answer: 'Any age — the same step-by-step method works for kids and adults.',
      },
      {
        question: 'How is this different from a Quran reading app?',
        answer:
          "Apps track page progress. This course tracks whether you can actually decode new, unseen words — that's the real skill.",
      },
      {
        question: 'What happens after I finish Basic Qaida?',
        answer:
          'You move to correct pronunciation and Tajweed rules, applied to what you can now read.',
      },
    ],
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
      '1-on-1 private sessions with certified scholars',
      'Step-by-step Salah & Wudu practical guidance',
      'Essential short Surah memorization (Al-Fatiha to An-Nas)',
      'Daily Adhkar, core Duas, and Islamic etiquette (Tarbiyah)',
      'On-demand progress reports & performance tracking',
      'Make-up guarantee for any missed sessions',
    ],
    curriculum: [
      {
        title: 'Letter Mechanics',
        desc: 'Shapes, joining, and the sounds beginners mix up (ب/ت/ث, ع/غ).',
      },
      {
        title: 'Vowel Systems',
        desc: 'Harakat, Sukoon, Shaddah, and Tanween, read naturally.',
      },
      {
        title: 'Madd & Patterns',
        desc: 'Spotting repeating patterns across the Mushaf.',
      },
      {
        title: 'The Quran Bridge',
        desc: 'The textbook drops away; you apply it to real Surahs.',
      },
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
    shortDesc:
      "You can read the words. Let's fix how they sound. Forget dry rule memorization — we diagnose your exact phonetic errors and fix them live.",
    longDesc:
      'Stop guessing your pronunciation. Get a personalized error profile, fix Makharij mistakes, and recite fluently with real Tajweed application.',
    whoItsFor:
      'Students who have completed Basic Qaida and want to transition to reading directly from the Mushaf, or adults looking to correct their recitation.',
    whyThisCourse:
      'We don\'t just say "improve your Tajweed." We give you a targeted error profile (e.g., "Your Qaf sounds like Kaf"). We move you from knowing the rules to muscle memory, so recitation becomes smooth — not a mental checklist running in your head.',
    cardHook: "You read. Let's fix how it sounds.",
    cardDesc:
      'Move beyond rule memorization. Get a personalized error profile and correct your pronunciation for an accurate recitation.',
    bestFor: 'Readers who want it correct',
    cardOutcomes: [
      'Fix specific pronunciation (Makharij) errors',
      'Apply Tajweed rules in real recitation',
      'Develop a natural, confident rhythm',
    ],
    quote:
      "My daughter 'finished' the Quran with her last tutor, but her recitation was rushed and full of mistakes. Qari Haseeb ul Hassan at Quranific helped her unlearn the bad habits and actually recite beautifully.",
    quoteAuthor: 'Parent of a 9-year-old',
    outcome: 'Recite an unseen passage with correct pronunciation and natural flow.',
    idealFor: [
      'Readers who can decode words but mispronounce them',
      "Students who've outgrown Basic Qaida",
      'Learners stuck relying on a mental checklist of rules',
    ],
    notFor: [
      {
        text: "Can't read Quranic words yet?",
        linkText: 'Start with Basic Qaida',
        linkUrl: '/courses/basic-qaida',
      },
    ],
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
      '1-on-1 private sessions with certified scholars',
      'Step-by-step Salah & Wudu practical guidance',
      'Essential short Surah memorization (Al-Fatiha to An-Nas)',
      'Daily Adhkar, core Duas, and Islamic etiquette (Tarbiyah)',
      'On-demand progress reports & performance tracking',
      'Make-up guarantee for any missed sessions',
    ],
    curriculum: [
      {
        title: 'Fluency & Navigation',
        desc: 'Stops, starts, and natural reading flow across the Mushaf.',
      },
      {
        title: 'Precision Makharij',
        desc: 'Fixing classic articulation conflicts (e.g., ح/ه, س/ص, ت/ط).',
      },
      {
        title: 'Rule Application',
        desc: 'Noon/Meem rules, Madd, and Qalqalah, applied in real context.',
      },
      {
        title: 'Self-Correction',
        desc: 'Hearing your own mistakes before the teacher points them out.',
      },
    ],
    courseFaqs: [
      {
        question: "What's the difference between this and Basic Qaida?",
        answer:
          'Basic Qaida teaches you to decode letters and words. This course fixes how you pronounce what you already read.',
      },
      {
        question: 'Do I need to read fluently before joining?',
        answer:
          "Yes — basic reading ability is the prerequisite. If you're not there yet, start with Basic Qaida.",
      },
      {
        question: 'What is Makharij and why does it matter?',
        answer:
          'It is the precise articulation point of each Arabic letter. Get it wrong, and the meaning of a word can change entirely.',
      },
      {
        question: 'Will I get feedback on my own recitation?',
        answer:
          'Yes — your personal error profile is built from your actual recitation, not a generic rulebook.',
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
    title: 'Quran Memorization: Build Hifz That Actually Lasts',
    shortTitle: 'Hifz',
    shortDesc:
      'Build Hifz that actually lasts. We treat retention as the main event, ensuring every word stays perfect in your heart and recitation.',
    longDesc:
      'Most Hifz programs chase the new lesson and let the old ones fade. We treat retention as the main event, ensuring every word stays perfect in your heart and recitation.',
    whoItsFor:
      'Dedicated students of any age who have fluent reading ability and the daily discipline required to commit the Quran to memory.',
    whyThisCourse:
      "That moment you realize you've forgotten the first half of a Surah while memorizing the second half? We stop it before it starts. Pace is set to the fastest you can go without sacrificing retention.",
    cardHook: 'Memorize it. Keep it.',
    cardDesc:
      'A rigorous retention system designed to stop the #1 Hifz problem: forgetting old Surahs while memorizing new ones.',
    bestFor: 'Serious, lasting memorization',
    cardOutcomes: [
      '100% accuracy in pronunciation & Tajweed',
      'Structured review cycles (Sabaq, Sabqi, Manzil)',
      'Guard the Quran in your heart permanently',
    ],
    outcome: 'Recite from a random starting point in your Hifz, without hesitation.',
    quote:
      "My son memorized 5 Juz at his local madrasa but forgot 3 of them. Quranific's Sabqi and Manzil system finally stopped the cycle of forgetting. He actually retains it now.",
    quoteAuthor: 'Parent of an 11-year-old',
    idealFor: [
      'Kids and adults ready to commit to memorization',
      'Students who stalled elsewhere due to forgetting old portions',
    ],
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
      '1-on-1 private Hifz coaching with certified Hafiz',
      'Sabaq, Sabqi, and Manzil retention tracking',
      'Mutashabihat (similar verses) error bank & correction',
      'Juz-by-Juz milestone testing and progress reports',
      'Make-up guarantee for any missed sessions',
    ],
    curriculum: [
      { title: 'Sabaq (New)', desc: 'Focusing on accuracy over volume for new memorization.' },
      {
        title: 'Sabqi (Recent)',
        desc: 'Daily reinforcement of the last 7–10 days of memorization.',
      },
      { title: 'Manzil (Long-term)', desc: 'A systematic schedule so old portions never fade.' },
      {
        title: 'Mutashabihat',
        desc: 'Your personal error bank for similar verses you keep mixing up.',
      },
    ],
    courseFaqs: [
      {
        question: 'What are Sabaq, Sabqi, and Manzil?',
        answer:
          'Sabaq is your new memorization. Sabqi is your recent review (last 7–10 days). Manzil is your long-term review, so nothing older fades.',
      },
      {
        question: "How do I stop forgetting what I've already memorized?",
        answer:
          'The Manzil cycle exists for exactly this — it schedules review of old portions on a strict system, not on hope.',
      },
      {
        question: 'Is Hifz suitable for adults, or only children?',
        answer: 'Both. The system adapts to your pace and capacity, not your age.',
      },
      {
        question: "What if I've already memorized some Surahs elsewhere?",
        answer:
          'You can join and slot straight into the review cycle — no need to restart from zero.',
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
    title: 'Quran Translation & Tafsir: Understand What You Recite',
    shortTitle: 'Tafsir',
    shortDesc:
      'You read the words. Now feel the message. Go from simply reciting to deeply understanding how every verse applies to your life today.',
    longDesc:
      'You read the words. Now feel the message. A framework for reflection — not just a translation read-through. Go from simply reciting to deeply understanding how every verse applies to your life today.',
    whoItsFor:
      'Adults, older teenagers, and new Muslims who want to understand the message of the Quran and apply its teachings to their daily lives.',
    whyThisCourse:
      'Word → Context → Tafsir → Lesson. Not just what a verse says — why it was said, and what it means for you today. We teach intellectual humility alongside translation.',
    cardHook: 'Read the words. Feel the message.',
    cardDesc:
      'Bridge the language gap. Go from simply reciting to deeply comprehending the context, meaning, and life application of every verse.',
    bestFor: 'Meaning over memorization',
    cardOutcomes: [
      'Understand word-for-word meanings',
      'Explore scholarly Tafsir and context',
      'Connect Quranic teachings to daily life',
    ],
    outcome:
      'Pray with absolute presence, because you understand the exact words you are reciting.',
    quote:
      "I've read English translations before, but it felt disconnected. The Word-to-Context method made me actually feel the Ayahs during Salah for the very first time.",
    quoteAuthor: 'Adult Learner',
    idealFor: [
      "Students who recite but don't understand the meaning",
      'Anyone wanting reliable, scholarly Tafsir (not scattered YouTube clips)',
    ],
    notFor: [
      {
        text: "Can't recite fluently yet?",
        linkText: 'Start with Tajweed',
        linkUrl: '/courses/quran-reading-with-tajweed',
      },
    ],
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
      '1-on-1 private Tafsir sessions with qualified scholars',
      'Word-for-word root analysis and translation',
      'Thematic study (Tawhid, Prophets, Sabr, Justice)',
      'Safe, scholarly guided Q&A for doubt clearing',
      'Make-up guarantee for any missed sessions',
    ],
    curriculum: [
      {
        title: 'High-Frequency Roots',
        desc: 'Learning the core vocabulary roots that unlock thousands of words.',
      },
      {
        title: 'Contextual Awareness',
        desc: 'Understanding the overarching theme of the Surah and why it matters.',
      },
      {
        title: 'Intelligent Tafsir Reading',
        desc: 'Telling translation, scholarly context, and application apart.',
      },
      {
        title: 'Thematic Study',
        desc: 'Themes of Mercy, Patience, Tawhid, and Justice, traced across the Quran.',
      },
    ],
    courseFaqs: [
      {
        question: 'Do I need Arabic fluency to study Tafsir?',
        answer: 'No — the course builds the vocabulary and context you need as you go.',
      },
      {
        question: 'What is the Word → Context → Tafsir → Lesson method?',
        answer:
          'A four-step framework: learn the word, understand its context, read the Tafsir, then extract the lesson for your own life.',
      },
      {
        question: 'Which topics does the thematic study cover?',
        answer:
          'Core themes including Mercy, Patience, Tawhid, and Justice, traced across multiple Surahs.',
      },
      {
        question: 'Is this based on reliable scholarly sources?',
        answer:
          'Yes — grounded in established, mainstream Tafsir, with clear separation between translation and interpretation.',
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
    title: 'Advanced Tajweed & Ijazah: Refine Every Letter',
    shortTitle: 'Ijazah',
    shortDesc:
      'Knowing the rule is easy. Applying it flawlessly is the art. Diagnose accent habits and pass an unseen-passage test that proves real control.',
    longDesc:
      'Knowing the rule is easy. Applying it flawlessly is the art. Diagnose accent habits and pass an unseen-passage test that proves real control.',
    whoItsFor:
      'Advanced readers, existing teachers, or Hafiz students who want to formalize their mastery and gain the authority to teach others.',
    whyThisCourse:
      'This is a diagnostic course. We identify your specific accent influences or bad habits and drill them out — replaced with precise Arabic pronunciation.',
    cardHook: 'Good recitation, made precise.',
    cardDesc:
      'For fluent readers seeking mastery. Diagnose deeply ingrained accent habits and refine the exact characteristics of every letter.',
    bestFor: 'Fluent readers chasing precision',
    cardOutcomes: [
      'Master advanced Sifaat and Waqf rules',
      'Self-correct on unseen passages',
      'Prepare for Ijazah certification',
    ],
    outcome: 'Self-correct your recitation in real time on passages you have never seen before.',
    quote:
      "I've been reciting my whole life, but my teacher identified regional accent habits I didn't even know I had. The unseen passage test proved I actually control my tongue now.",
    quoteAuthor: 'Adult Learner',
    idealFor: [
      'Fluent readers wanting precision, not just correctness',
      'Students preparing to lead recitation or teach others',
    ],
    notFor: [
      {
        text: 'Still fixing basic pronunciation?',
        linkText: 'Start with Tajweed',
        linkUrl: '/courses/quran-reading-with-tajweed',
      },
    ],
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
      '1-on-1 private coaching with elite scholars',
      'Diagnostic accent correction and Sifaat mastery',
      'Advanced Waqf (stopping/starting) application',
      'Unseen passage testing for real-time accuracy',
      'Make-up guarantee for any missed sessions',
    ],
    curriculum: [
      {
        title: 'Sifaat al-Huruf',
        desc: 'Letter characteristics that shape sound quality and precision.',
      },
      {
        title: 'Refined Control',
        desc: 'Mastering Tafkhim/Tarqiq (heavy/light rules), Ra, and Lam.',
      },
      {
        title: 'Breath & Meaning',
        desc: "Advanced Waqf and Ibtida' that respects the Ayah's meaning.",
      },
      {
        title: 'Auditory Intelligence',
        desc: 'Training your ear to catch errors in your own recording.',
      },
    ],
    courseFaqs: [
      {
        question: 'Who should take this instead of the regular Tajweed course?',
        answer:
          'Fluent readers who already recite correctly but want precision — the regular course fixes correctness first.',
      },
      {
        question: "What is the 'unseen passage' test?",
        answer:
          "A recitation assessment on a passage you haven't practiced. It proves control, not memorized performance.",
      },
      {
        question: 'What are Sifaat al-Huruf?',
        answer:
          "The characteristics of each letter's sound — beyond just its articulation point — that shape recitation quality.",
      },
      {
        question: 'Can this fix an accent influence in my recitation?',
        answer:
          "Yes — that's the core of the diagnostic approach. We identify the specific habit and drill it out.",
      },
    ],
    prerequisites: ['Flawless recitation of the Quran with complete application of Tajweed rules.'],
    relatedSlugs: ['quran-memorization', 'quran-translation-with-tafsir'],
    riveFile: 'ijazah.riv',
    groupSize: '1-on-1',
  },
  {
    slug: 'arabic-language',
    title: 'Arabic: Understand the Book. Speak the Language.',
    shortTitle: 'Arabic',
    shortDesc:
      'Stop memorizing grammar charts. Learn the 10 core root words that unlock hundreds of meanings for reading the Quran and everyday conversation.',
    longDesc:
      'Stop memorizing grammar charts. Learn the 10 core root words that unlock hundreds of meanings for reading the Quran and everyday conversation.',
    whoItsFor:
      'Professionals, students, and expatriates who want to communicate effectively in the Middle East, or Muslims seeking to understand the Quran directly without translation.',
    whyThisCourse:
      'Grammar is a tool, not a subject. You learn it to understand a verse or order food — not to label a grammatical case. Deep Quranic understanding and Modern Standard Arabic, taught together.',
    cardHook: 'Understand the Book. Speak the language.',
    cardDesc:
      'Skip the endless grammar charts. Learn the root-word system that unlocks hundreds of meanings for the Quran and real-world conversation.',
    bestFor: 'Quranic + everyday Arabic',
    cardOutcomes: [
      'Learn both Quranic and everyday Arabic',
      'Master high-frequency root words',
      'Think and speak in natural patterns',
    ],
    outcome: 'Think in Arabic word patterns natively, instead of translating in your head.',
    quote:
      "I gave up on Arabic grammar tables three times. Learning the 10-root engine made it finally click. Last Friday, I actually understood the Imam's Khutbah without the translation.",
    quoteAuthor: 'Adult Learner',
    idealFor: [
      'Students wanting Quranic and everyday Arabic in one track',
      'Complete beginners — foundations are covered from script up',
    ],
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
      '1-on-1 Conversational & Quranic Arabic sessions',
      'Root-based vocabulary engine (Learn 1, unlock 10)',
      'Live speaking and listening practice',
      'Custom-paced grammar application (no boring charts)',
      'Make-up guarantee for any missed sessions',
    ],
    curriculum: [
      { title: 'Foundations', desc: 'Script, pronunciation, and basic sentence structure.' },
      { title: 'The Root System', desc: 'Mastering word families (e.g., ع ل م and ك ت ب).' },
      { title: 'Quranic Grammar', desc: 'Understanding how verbs and pronouns shift meaning.' },
      { title: 'Functional MSA', desc: 'Greetings, daily conversation, and practical speaking.' },
    ],
    courseFaqs: [
      {
        question: 'Is this Quranic Arabic or Modern Standard Arabic (MSA)?',
        answer:
          "Both — connected through the same root system, so you're not learning two disconnected languages.",
      },
      {
        question: 'Do I need to know the Arabic alphabet first?',
        answer: 'No — Foundations covers script and pronunciation from the start.',
      },
      {
        question: 'How does the root system make learning faster?',
        answer:
          'Ten roots unlock hundreds of related words, instead of memorizing each word in isolation.',
      },
      {
        question: 'Can I use this Arabic for daily conversation?',
        answer:
          'Yes — Functional MSA covers real, everyday communication alongside Quranic application.',
      },
    ],
    prerequisites: ['Basic reading ability of the Arabic script.'],
    relatedSlugs: ['quran-translation-with-tafsir', 'quran-reading-with-tajweed'],
    riveFile: 'arabic.riv',
    groupSize: '1-on-1',
  },
];
