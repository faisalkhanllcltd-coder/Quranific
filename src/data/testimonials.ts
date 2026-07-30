export interface Testimonial {
  quote: string;
  initials: string;
  avatarColor: string;
  name: string;
  details: string;
  enrolled: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "My daughter used to cry before her old Quran class. After two months with Quranific, she reminds ME it's time for her lesson. I didn't think that was possible.",
    initials: 'SA',
    avatarColor: 'bg-amber-50 text-amber-700',
    name: 'Sarah A.',
    details: 'Manchester, UK · Daughter, age 8',
    enrolled: '14 months',
  },
  {
    quote:
      "As a father working long hours, the guilt was real. Quranific didn't just teach my sons tajweed. They gave me back the peace of knowing I didn't drop the ball on their deen.",
    initials: 'KH',
    avatarColor: 'bg-emerald-50 text-emerald-700',
    name: 'Khalid H.',
    details: 'Houston, USA · Two sons, 9 & 12',
    enrolled: '8 months',
  },
  {
    quote:
      'The make-up class policy alone is worth it. We travel a lot for work and previous academies just let sessions disappear. Quranific has never let us miss a lesson.',
    initials: 'NM',
    avatarColor: 'bg-purple-50 text-purple-700',
    name: 'Nadia M.',
    details: 'Dubai, UAE · Son, age 7',
    enrolled: '11 months',
  },
];
