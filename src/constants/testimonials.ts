// src/constants/testimonials.ts
export interface Testimonial {
  id: string;
  initials: string;
  name: string;
  locationAndRole: string;
  content: string;
  enrollmentTime: string;
  theme: 'light' | 'dark'; // Controls UI card presentation natively
}

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: '1',
    initials: 'A',
    name: 'Amna',
    locationAndRole: 'Germany',
    content:
      'Studying at Quranific has been a profound experience. With the guidance of my dedicated teacher, I have enhanced my Quran recitation and <strong class="font-semibold text-slate-900">memorized significant portions</strong>. Additionally, I have learned about Islamic Studies, fiqah, Salah.',
    enrollmentTime: '14 months',
    theme: 'light',
  },
  {
    id: '2',
    initials: 'SM',
    name: 'Saleem Al Mustarshid',
    locationAndRole: 'UAE',
    content:
      'Our son has been making steady progress with his teacher. He has learnt to pray too alhamdulillah. The teacher also knows when to be firm with our son and <strong class="font-semibold text-slate-900">when he needs to be gentle</strong>, really glad he understands our son’s needs and helping him through the Qaida.',
    enrollmentTime: '8 months',
    theme: 'dark',
  },
  {
    id: '3',
    initials: 'NB',
    name: 'Naseerullah Babar',
    locationAndRole: 'UK',
    content:
      'We’re very pleased with the quality of teaching. The instructors are dedicated, and <strong class="font-semibold text-slate-900">the lessons are engaging, which my daughters enjoy a lot</strong>. The teacher and admin are very friendly and supportive. The online format is convenient for us and makes learning easy and flexible.',
    enrollmentTime: '11 months',
    theme: 'light',
  },
];
