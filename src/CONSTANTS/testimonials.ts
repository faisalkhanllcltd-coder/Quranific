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
    initials: 'SA',
    name: 'Sarah A.',
    locationAndRole: 'Manchester, UK · Daughter, age 8',
    content: "My daughter used to cry before her old Quran class. After two months with Quranific, she reminds ME it's time for her lesson. I didn't think that was possible.",
    enrollmentTime: '14 months',
    theme: 'light'
  },
  {
    id: '2',
    initials: 'KH',
    name: 'Khalid H.',
    locationAndRole: 'Houston, USA · Two sons, ages 9 & 12',
    content: "As a father working long hours, the guilt was real. Quranific didn't just teach my sons tajweed — they gave me back the peace of knowing I didn't drop the ball on their deen.",
    enrollmentTime: '8 months',
    theme: 'dark'
  },
  {
    id: '3',
    initials: 'NM',
    name: 'Nadia M.',
    locationAndRole: 'Dubai, UAE · Son, age 7',
    content: "The make-up class policy alone is worth it. We travel a lot for work and previous academies just let sessions disappear. Quranific has never let us miss a lesson.",
    enrollmentTime: '11 months',
    theme: 'light'
  }
];