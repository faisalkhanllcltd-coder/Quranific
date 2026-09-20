// src/data/team.ts
// Single source of truth for all faculty and leadership data.
// Consumed by: src/pages/about/_components/AboutTeam.astro,
//              src/pages/teachers/index.astro,
//              src/pages/teachers/_components/TeachersFaculty.astro

export type TeamRole = 'Leadership' | 'Teacher' | 'Admin';
export type Gender = 'male' | 'female';

export interface TeamMember {
  /** Unique slug identifier for URL or key usage. */
  id: string;
  /** Full display name. */
  name: string;
  /** Job title shown publicly. */
  title: string;
  /** Operational role category for filtering. */
  role: TeamRole;
  /** Gender used for teacher-matching UX (male-to-male / female-to-female). */
  gender: Gender;
  /** Short biographical paragraph — max 2 sentences, no AI tropes. */
  bio: string;
  /** Key qualifications or certifications, displayed as a list. */
  qualifications: string[];
  /** Subjects or specialisms this person covers. */
  specialisms: string[];
  /** Alias for specialisms for faculty component compatibility. */
  specialties?: string[];
  /** Languages spoken by the instructor. */
  languages?: string[];
  /** Teaching experience in years. */
  experience?: string;
  /** Verified student rating. */
  rating?: string;
  /** Active students count. */
  students?: string;
  /** ISO 3166-1 alpha-2 country code where the teacher is based. */
  location: string;
  /** Whether this member is actively accepting new students. */
  accepting: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  // ── Leadership ────────────────────────────────────────────────────────────
  {
    id: 'faisal-khan',
    name: 'Faisal Khan',
    title: 'Founder & CEO',
    role: 'Leadership',
    gender: 'male',
    bio: 'Faisal founded Quranific with a single conviction: that every Muslim child and adult deserves access to a qualified, patient teacher — regardless of where they live. He oversees curriculum standards, teacher vetting, and the overall direction of the academy.',
    qualifications: ['BSc Computer Science', 'Islamic Studies — Al-Azhar Institute (Karachi)'],
    specialisms: ['Academy Operations', 'Curriculum Design', 'Teacher Standards'],
    location: 'PK',
    accepting: false,
  },
  {
    id: 'imranullah',
    name: 'Imranullah',
    title: 'Head of Administration',
    role: 'Admin',
    gender: 'male',
    bio: 'Imranullah manages the day-to-day operations of the academy, from scheduling and student onboarding to teacher coordination and parent communications. He is the first point of contact for all administrative queries.',
    qualifications: ['BA Islamic Studies', 'Certified Quranic Reciter'],
    specialisms: ['Student Scheduling', 'Parent Communication', 'Operations'],
    location: 'PK',
    accepting: false,
  },
  // ── Teaching Faculty ─────────────────────────────────────────────────────
  {
    id: 'hakeem-sadi',
    name: 'Hakeem Sadi',
    title: 'Head Teacher',
    role: 'Teacher',
    gender: 'male',
    bio: "Hakeem Sadi leads Quranific's teaching team and sets the academic standard for recitation quality. He holds a verified Ijazah in the Hafs narration and has over a decade of experience teaching students from beginner Qaida through to advanced Ijazah preparation.",
    qualifications: [
      'Ijazah in Hafs an Asim (Verified Chain)',
      'Diploma in Tajweed Sciences',
      'Certified Hafiz of the Quran',
    ],
    specialisms: ['Tajweed', 'Ijazah Preparation', 'Advanced Recitation', 'Hifz Coaching'],
    specialties: ['Tajweed', 'Ijazah Preparation', 'Advanced Recitation', 'Hifz Coaching'],
    languages: ['Arabic', 'English', 'Urdu'],
    experience: '12+ Years',
    rating: '5.0',
    students: '16 Active',
    location: 'PK',
    accepting: true,
  },
  {
    id: 'haseeb-ul-hasan',
    name: 'Haseeb ul Hasan',
    title: 'Qari & Tajweed Specialist',
    role: 'Teacher',
    gender: 'male',
    bio: 'Qari Haseeb ul Hasan specialises in diagnosing and correcting pronunciation errors developed over years of self-teaching or informal learning. His patient, methodical approach is particularly effective with adult beginners and students returning to the Quran after a long gap.',
    qualifications: [
      'Ijazah in Tajweed (Hafs narration)',
      'Certified Hafiz',
      'Diploma in Quranic Sciences',
    ],
    specialisms: ['Quran Reading with Tajweed', 'Makharij Correction', 'Adult Learners', 'Qaida'],
    specialties: ['Quran Reading with Tajweed', 'Makharij Correction', 'Adult Learners', 'Qaida'],
    languages: ['English', 'Urdu', 'Arabic'],
    experience: '9+ Years',
    rating: '4.9',
    students: '14 Active',
    location: 'PK',
    accepting: true,
  },
  {
    id: 'fatima-s',
    name: 'Fatima S.',
    title: 'Ustadha — Women & Kids',
    role: 'Teacher',
    gender: 'female',
    bio: "Ustadha Fatima specialises in teaching women and younger children, maintaining a calm and supportive environment that many students describe as the first time they've actually enjoyed learning the Quran. All of her sessions are strictly female-to-female.",
    qualifications: [
      'Ijazah in Quran Recitation',
      'Diploma in Islamic Studies',
      'Child Safeguarding Certified',
    ],
    specialisms: ["Women's Programme", 'Kids Qaida', 'Tajweed', 'Islamic Studies'],
    specialties: ["Women's Programme", 'Kids Qaida', 'Tajweed', 'Islamic Studies'],
    languages: ['English', 'Urdu', 'Arabic'],
    experience: '8+ Years',
    rating: '5.0',
    students: '15 Active',
    location: 'PK',
    accepting: true,
  },
  {
    id: 'abdul-hanan',
    name: 'Abdul Hanan',
    title: 'Quran & Arabic Teacher',
    role: 'Teacher',
    gender: 'male',
    bio: 'Abdul Hanan combines Quranic instruction with Arabic language teaching, helping students understand the words they recite rather than simply repeating sounds. His root-word approach to Arabic makes the language accessible without grammar overload.',
    qualifications: [
      'BA Arabic Language & Literature',
      'Ijazah in Quran Recitation',
      'Certified Hafiz',
    ],
    specialisms: ['Arabic Language', 'Quran Translation & Tafsir', 'Qaida', 'Hifz'],
    specialties: ['Arabic Language', 'Quran Translation & Tafsir', 'Qaida', 'Hifz'],
    languages: ['Arabic', 'English', 'Urdu'],
    experience: '7+ Years',
    rating: '4.9',
    students: '12 Active',
    location: 'PK',
    accepting: true,
  },
];

/** Leadership and admin members only — used on the About page. Includes Founder, Admin, and Head Teacher. */
export const LEADERSHIP = TEAM_MEMBERS.filter(
  (m) => m.role === 'Leadership' || m.role === 'Admin' || m.id === 'hakeem-sadi'
);

/** Active teaching faculty — used on the Teachers page. */
export const FACULTY = TEAM_MEMBERS.filter((m) => m.role === 'Teacher');

/** Female teachers only — used for women's programme filtering. */
export const FEMALE_FACULTY = TEAM_MEMBERS.filter(
  (m) => m.role === 'Teacher' && m.gender === 'female'
);
