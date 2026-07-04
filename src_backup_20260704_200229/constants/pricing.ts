// src/constants/pricing.ts
export const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 35,
    interval: 'month',
    description: 'Perfect for beginners starting their journey.',
    features: [
      '2 Days / Week',
      '30 Minute Sessions',
      'Basic Tajweed Rules',
      'Monthly Progress Report',
    ],
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 55,
    interval: 'month',
    description: 'Our most popular pacing for steady progress.',
    features: [
      '3 Days / Week',
      '30 Minute Sessions',
      'Advanced Tajweed & Recitation',
      'Dedicated Academic Coordinator',
      'Weekly Progress Tracking',
    ],
    popular: true,
  },
  {
    id: 'intensive',
    name: 'Intensive',
    price: 85,
    interval: 'month',
    description: 'Accelerated learning for Hifz and deep study.',
    features: [
      '5 Days / Week',
      '30 Minute Sessions',
      'Hifz (Memorization) Support',
      'Priority Scheduling',
      '24/7 Priority Support',
    ],
    popular: false,
  }
];