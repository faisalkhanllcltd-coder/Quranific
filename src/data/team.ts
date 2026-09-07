// src/data/team.ts
// Unified Team & Faculty Architecture (TASK-03-11)

export type TeamCategory = 'leadership' | 'faculty' | 'admin';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: TeamCategory;
  credentials: string[];
  bio: string;
  avatarUrl?: string;
  languages: string[];
  gender: 'Male' | 'Female';
  title?: string;
  experience?: string;
  rating?: string;
  students?: string;
  specialties: string[];
  arabicLetter?: string;
  avatarBg?: string;
  quote?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 'faisal-khan',
    name: 'Faisal Khan',
    role: 'Founder & CEO',
    category: 'leadership',
    credentials: [
      'Islamic Scholar (Dars-e-Nizami / Alimiyyah)',
      'Classical Text Proofreading & Verification (Hadith & Fiqh)',
      'Software Engineer & Digital Strategist',
    ],
    bio: 'Faisal brings a rare dual-expertise to Quranific. He is formally trained as an Islamic scholar with years of professional experience proofreading classical texts in Hadith, Fiqh, and Tafsir. As a software engineer and digital marketing expert, he architected Quranific’s platform to ensure the technology is as reliable as the teaching methodology.',
    languages: ['English', 'Urdu', 'Arabic'],
    gender: 'Male',
    arabicLetter: 'ف',
    avatarBg: 'bg-gradient-to-br from-emerald-700 to-emerald-500',
    specialties: ['Curriculum Architecture', 'Pedagogical Standards', 'Platform Integrity'],
  },
  {
    id: 'imranullah',
    name: 'Imranullah',
    role: 'Operations & Admin Lead',
    category: 'admin',
    credentials: [
      'Operations & Student Coordination Specialist',
      'Islamic Studies Foundation',
      'Quality Assurance & Faculty Safeguarding Officer',
    ],
    bio: 'Oversees the day-to-day running of the academy, from matching students with the right teacher to ensuring every family’s scheduling, rescheduling, and technical experience is seamless and stress-free.',
    languages: ['English', 'Urdu', 'Arabic'],
    gender: 'Male',
    arabicLetter: 'ع',
    avatarBg: 'bg-gradient-to-br from-teal-700 to-teal-500',
    specialties: ['Student Placement', 'Family Support', '24/7 Academic Coordination'],
  },
  {
    id: 'hakeem-sadi',
    name: 'Hakeem Sadi',
    role: 'Head Teacher & Faculty Dean',
    category: 'faculty',
    credentials: [
      'Certified Alim & Head of Recitation Standards',
      "Ijazah in Hafs 'an 'Asim with Sanad",
      '15+ Years Quranic Teaching & Senior Faculty Mentorship',
    ],
    bio: 'Directs the academic curriculum and senior faculty, holding every instructor to strict standards of Tajweed accuracy, gentle pedagogy, and individualized student pacing.',
    languages: ['English', 'Arabic', 'Urdu'],
    gender: 'Male',
    title: "Alim & Head Teacher, Ijazah in Hafs 'an 'Asim",
    experience: '15+ Years',
    rating: '5.0',
    students: 'Senior Dean',
    arabicLetter: 'ح',
    avatarBg: 'bg-gradient-to-br from-emerald-800 to-emerald-600',
    specialties: ['Pedagogy Mentorship', 'Curriculum Standards', 'Advanced Tajweed'],
    quote:
      'Teaching the Quran is not merely transmitting rules; it is planting love for Allah’s words in the student’s heart.',
  },
  {
    id: 'haseeb-ul-hasan',
    name: 'Haseeb ul Hasan',
    role: 'Tajweed & Hifz Tutor',
    category: 'faculty',
    credentials: [
      'Hafiz al-Quran & Senior Tajweed Specialist',
      "Ijazah in Qira'at (Hafs 'an 'Asim)",
      '10+ Years Hifz Retention & Phonetic Correction',
    ],
    bio: 'Specializes in precision Tajweed and long-term Quran memorization (Hifz). Renowned for identifying deep-rooted phonetic habits and building systematic retention schedules so old portions never fade.',
    languages: ['English', 'Urdu', 'Arabic'],
    gender: 'Male',
    title: "Hafiz & Senior Qari, Ijazah in Hafs 'an 'Asim",
    experience: '10+ Years',
    rating: '4.9',
    students: '18 Active',
    arabicLetter: 'ح',
    avatarBg: 'bg-gradient-to-br from-amber-600 to-amber-400',
    specialties: ['Hifz Retention (Manzil)', 'Makharij Precision', 'Adult Learners'],
    quote:
      'Tajweed is not a rigid mental checklist. It is an art of the tongue that becomes second nature through gentle practice.',
  },
  {
    id: 'fatima-s',
    name: 'Fatima S.',
    role: 'Female Quran & Islamic Studies Tutor',
    category: 'faculty',
    credentials: [
      'Alimah & Certified Hafiza',
      "Ijazah in Hafs 'an 'Asim with Sanad",
      'Early Childhood Pedagogy & Sisters-Only Tajweed Specialist',
    ],
    bio: 'Specializing in early childhood Islamic education and sisters-only adult learning, Ustadha Fatima uses interactive, gentle methods to make young learners fall in love with the Quran in a 100% private environment.',
    languages: ['English', 'Urdu', 'Arabic'],
    gender: 'Female',
    title: "Alimah & Certified Hafiza, Ijazah in Hafs 'an 'Asim",
    experience: '8+ Years',
    rating: '5.0',
    students: '16 Active',
    arabicLetter: 'ف',
    avatarBg: 'bg-gradient-to-br from-purple-700 to-purple-500',
    specialties: ['Children Beginners', 'Sisters Only', 'Tajweed Fundamentals & Qaida'],
    quote:
      'Every child is a beginner exactly once. I ensure that first connection feels warm, supportive, and completely safe.',
  },
  {
    id: 'abdul-hanan',
    name: 'Abdul Hanan',
    role: 'Qaida & Recitation Tutor',
    category: 'faculty',
    credentials: [
      'Certified Qaida Specialist & Qari',
      'Ijazah in Quranic Recitation',
      '6+ Years Modern Phonics-Based Quranic Decoding',
    ],
    bio: 'Master of the foundational bridge: transitioning absolute beginners from isolated letters to decoding real Quranic verses independently. Expert in SEN-adapted pacing and patient repetition.',
    languages: ['English', 'Urdu', 'Arabic'],
    gender: 'Male',
    title: 'Certified Qari & Foundational Qaida Specialist',
    experience: '6+ Years',
    rating: '4.9',
    students: '14 Active',
    arabicLetter: 'ع',
    avatarBg: 'bg-gradient-to-br from-teal-700 to-teal-500',
    specialties: ['Noorani Qaida', 'Phonics & Letter Blending', 'SEN-Adapted Teaching'],
    quote:
      'When a student decodes their very first unseen word in the Mushaf without assistance, that joy is unmatched.',
  },
];

export const leadershipTeam = teamMembers.filter(
  (m) => m.category === 'leadership' || m.category === 'admin'
);
export const facultyTeam = teamMembers.filter((m) => m.category === 'faculty');
