// src/data/testimonials.ts
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  location: string;
  locationAndRole?: string;
  quote: string;
  content: string; // compatibility with LandingTestimonials
  text: string; // compatibility with TestimonialsGrid and JSON-LD schema
  details?: string;
  rating: number;
  enrolled: string;
  enrollmentTime: string; // compatibility with LandingTestimonials
  avatarColor: string;
  theme: 'light' | 'dark';
  audience: ('kids' | 'adults' | 'women' | 'general')[];
  verifiedConsent: boolean; // Consent verification gateway flag (requires owner confirmation before launch)
}

export const testimonials: Testimonial[] = [
  {
    id: 'amna',
    name: 'Amna',
    role: 'Verified Adult Learner',
    initials: 'A',
    location: 'Germany',
    locationAndRole: 'Germany · Adult Learner',
    quote:
      'Studying at Quranific has been a profound experience. With the guidance of my dedicated teacher, I have enhanced my Quran recitation and memorized significant portions. Additionally, I have learned about Islamic Studies, fiqah, and Salah. Memorizing various duas and prayers has improved my linguistic skills and spiritual practice.',
    content:
      'Studying at Quranific has been a profound experience. With the guidance of my dedicated teacher, I have enhanced my Quran recitation and <strong class="font-semibold text-slate-900">memorized significant portions</strong>. Additionally, I have learned about Islamic Studies, fiqah, Salah.',
    text: 'Studying at Quranific has been a profound experience. With the guidance of my dedicated teacher, I have enhanced my Quran recitation and memorized significant portions. Additionally, I have learned about Islamic Studies, fiqah, and Salah. Memorizing various duas and prayers has improved my linguistic skills and spiritual practice. Overall, Quranific has greatly contributed to my personal and spiritual growth.',
    details: 'Germany · Adult Learner',
    rating: 5,
    enrolled: '14 months',
    enrollmentTime: '14 months',
    avatarColor: 'bg-emerald-50 text-emerald-700',
    theme: 'light',
    audience: ['women', 'adults', 'general'],
    verifiedConsent: false, // PENDING OWNER FORMAL CONSENT VERIFICATION
  },
  {
    id: 'saleem',
    name: 'Saleem Al Mustarshid',
    role: 'Verified Parent',
    initials: 'SM',
    location: 'UAE',
    locationAndRole: 'UAE · Father of young student',
    quote:
      "Our son has been making steady progress with his teacher. He has learnt to pray too alhamdulillah. The teacher also knows when to be firm with our son and when he needs to be gentle, really glad he understands our son's needs and helping him through the Qaida.",
    content:
      'Our son has been making steady progress with his teacher. He has learnt to pray too alhamdulillah. The teacher also knows when to be firm with our son and <strong class="font-semibold text-slate-900">when he needs to be gentle</strong>, really glad he understands our son’s needs and helping him through the Qaida.',
    text: "Our son has been making steady progress with his teacher. He has learnt to pray too alhamdulillah. The teacher also knows when to be firm with our son and when he needs to be gentle, really glad he understands our son's needs and helping him through the Qaida.",
    details: 'UAE · Son, age 7',
    rating: 5,
    enrolled: '8 months',
    enrollmentTime: '8 months',
    avatarColor: 'bg-amber-50 text-amber-700',
    theme: 'dark',
    audience: ['kids', 'general'],
    verifiedConsent: false, // PENDING OWNER FORMAL CONSENT VERIFICATION
  },
  {
    id: 'naseerullah',
    name: 'Naseerullah Babar',
    role: 'Verified Parent',
    initials: 'NB',
    location: 'UK',
    locationAndRole: 'UK · Father of two daughters',
    quote:
      "We're very pleased with the quality of teaching. The instructors are dedicated, and the lessons are engaging, which my daughters enjoy a lot. The teacher and admin are very friendly and supportive. The online format is convenient for us and makes learning easy and flexible.",
    content:
      'We’re very pleased with the quality of teaching. The instructors are dedicated, and <strong class="font-semibold text-slate-900">the lessons are engaging, which my daughters enjoy a lot</strong>. The teacher and admin are very friendly and supportive. The online format is convenient for us and makes learning easy and flexible.',
    text: "We're very pleased with the quality of teaching. The instructors are dedicated, and the lessons are engaging, which my daughters enjoy a lot. The teacher and admin are very friendly and supportive. The online format is convenient for us and makes learning easy and flexible.",
    details: 'UK · Two daughters',
    rating: 5,
    enrolled: '11 months',
    enrollmentTime: '11 months',
    avatarColor: 'bg-purple-50 text-purple-700',
    theme: 'light',
    audience: ['kids', 'adults', 'general'],
    verifiedConsent: false, // PENDING OWNER FORMAL CONSENT VERIFICATION
  },
  {
    id: 'omar-fatima',
    name: 'Omar & Fatima',
    role: 'Verified Parents',
    initials: 'OF',
    location: 'United Kingdom',
    locationAndRole: 'United Kingdom · Parents of two',
    quote:
      "We struggled to find a reliable local teacher who could accommodate our work schedules. Quranific's flexibility is a lifesaver. Our kids log in at 6 PM sharp, and their Ustadha is always there waiting with a smile. The progress in their Makharij (pronunciation) is remarkable.",
    content:
      "We struggled to find a reliable local teacher who could accommodate our work schedules. Quranific's flexibility is a lifesaver. Our kids log in at 6 PM sharp, and their Ustadha is always there waiting with a smile. The progress in their Makharij (pronunciation) is remarkable.",
    text: "We struggled to find a reliable local teacher who could accommodate our work schedules. Quranific's flexibility is a lifesaver. Our kids log in at 6 PM sharp, and their Ustadha is always there waiting with a smile. The progress in their Makharij (pronunciation) is remarkable.",
    details: 'Manchester, UK · Daughter, age 8',
    rating: 5,
    enrolled: '6 months',
    enrollmentTime: '6 months',
    avatarColor: 'bg-emerald-50 text-emerald-700',
    theme: 'light',
    audience: ['kids', 'general'],
    verifiedConsent: false,
  },
  {
    id: 'dr-ahmed',
    name: 'Dr. Ahmed R.',
    role: 'Verified Adult Learner',
    initials: 'AR',
    location: 'United States',
    locationAndRole: 'United States · Physician & Student',
    quote:
      "As a busy physician, my schedule is chaotic. My teacher at Quranific has been incredibly accommodating. I am finally memorizing Surah Al-Baqarah, something I thought I'd never have time for. The 1-on-1 focus means we don't waste a single minute of the session.",
    content:
      "As a busy physician, my schedule is chaotic. My teacher at Quranific has been incredibly accommodating. I am finally memorizing Surah Al-Baqarah, something I thought I'd never have time for. The 1-on-1 focus means we don't waste a single minute of the session.",
    text: "As a busy physician, my schedule is chaotic. My teacher at Quranific has been incredibly accommodating. I am finally memorizing Surah Al-Baqarah, something I thought I'd never have time for. The 1-on-1 focus means we don't waste a single minute of the session.",
    details: 'Houston, USA · Two sons, 9 & 12',
    rating: 5,
    enrolled: '9 months',
    enrollmentTime: '9 months',
    avatarColor: 'bg-emerald-50 text-emerald-700',
    theme: 'dark',
    audience: ['adults', 'general'],
    verifiedConsent: false,
  },
  {
    id: 'zainab-ali',
    name: 'Zainab Ali',
    role: 'Verified Parent',
    initials: 'ZA',
    location: 'Canada',
    locationAndRole: 'Canada · Mother of 7-year-old',
    quote:
      "My 7-year-old daughter was previously very shy and intimidated by Quran classes. Her female tutor at Quranific completely changed that. She uses interactive screen sharing and so much positive reinforcement. Now, my daughter reminds ME that it's time for her Quran class!",
    content:
      "My 7-year-old daughter was previously very shy and intimidated by Quran classes. Her female tutor at Quranific completely changed that. She uses interactive screen sharing and so much positive reinforcement. Now, my daughter reminds ME that it's time for her Quran class!",
    text: "My 7-year-old daughter was previously very shy and intimidated by Quran classes. Her female tutor at Quranific completely changed that. She uses interactive screen sharing and so much positive reinforcement. Now, my daughter reminds ME that it's time for her Quran class!",
    details: 'Toronto, Canada · Daughter, age 7',
    rating: 5,
    enrolled: '12 months',
    enrollmentTime: '12 months',
    avatarColor: 'bg-purple-50 text-purple-700',
    theme: 'light',
    audience: ['kids', 'women', 'general'],
    verifiedConsent: false,
  },
];
