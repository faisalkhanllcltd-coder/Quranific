// src/constants/site.ts

export const SITE = {
  name: 'Quranific',
  title: 'Quranific | The Quran Class Your Child Will Actually Love',
  description: 'No crowded mosque classes. No harsh methods. Just a gentle, qualified teacher, one child, and 30 minutes that might change everything.',
  url: 'https://quranific.com',
  themeColor: '#047857',
  defaultImage: '/images/og/default.webp', // Optimized for Edge CDN delivery
  whatsappNumber: '923112112122',
  whatsappLink: 'https://wa.me/message/FF4LDK3JR2GPN1',
  email: 'admin@quranific.com',

  // B-2 FIX: Turnstile site key exposed at build time for the funnel widget.
  // This is the PUBLIC site key (safe to embed in HTML). The SECRET key stays
  // in environment variables and is never committed to the repository.
  // TODO: Replace this placeholder with your real Cloudflare Turnstile site key.
  turnstileSiteKey: '0x4AAAAAAA_REPLACE_WITH_REAL_KEY',

  // G-5 FIX: phone and address added so pages that access SITE.phone / SITE.address
  // resolve to a real value instead of undefined. Fill in real details before go-live.
  // If no phone number exists, remove SITE.phone references from contact.astro and impressum.astro.
  phone: '',    // TODO: e.g. '+44 20 XXXX XXXX'
  address: '',  // TODO: e.g. 'London, United Kingdom'

  // MARKETING ENGINE: Global Announcement Bar
  announcement: {
    enabled: true, // Flip to false to hide the bar across the entire site
    text: 'Limited Time Offer: Get',
    highlight: '1 Month Free',
    suffix: 'Quran Classes!',
    linkText: 'Claim Offer &rarr;',
    linkUrl: '/funnel/signup'
  },

  // Synced with all actual mailto links across the platform
  emails: {
    support: 'hello@quranific.com',
    scholarships: 'scholarships@quranific.com',
    careers: 'careers@quranific.com',
    partners: 'partners@quranific.com',
    privacy: 'privacy@quranific.com'
  },

  social: {
    facebook: 'https://www.facebook.com/quranific',
    instagram: 'https://www.instagram.com/quranific_com',
    pinterest: 'https://pinterest.com/quranific',
    tiktok: 'https://www.tiktok.com/@quranific.com',
    x: 'https://x.com/quranific_'
  },

  stats: [
    { number: '3,200', symbol: '+', label: 'Families enrolled' },
    { number: '22', symbol: '', label: 'Countries served' },
    { number: '94', symbol: '%', label: 'Retention after month 1' },
    { number: '4.9', symbol: '★', label: 'Average rating' }
  ],

  trustCountries: [
    { flag: '🇺🇸', name: 'USA' }, { flag: '🇬🇧', name: 'United Kingdom' },
    { flag: '🇨🇦', name: 'Canada' }, { flag: '🇦🇺', name: 'Australia' },
    { flag: '🇦🇪', name: 'UAE' }, { flag: '🇸🇦', name: 'Saudi Arabia' },
    { flag: '🇶🇦', name: 'Qatar' }, { flag: '🇩🇪', name: 'Germany' },
    { flag: '🇳🇱', name: 'Netherlands' }, { flag: '🇸🇬', name: 'Singapore' },
    { flag: '🇮🇹', name: 'Italy' }, { flag: '🇧🇭', name: 'Bahrain' }
  ]
} as const;

// ---------------------------------------------------------------------------
// Navigation constants — Strict single source of truth for all nav surfaces.
// ---------------------------------------------------------------------------
export type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly hasDropdown?: boolean;
};

export const MAIN_NAVIGATION: ReadonlyArray<NavItem> = [
  { label: 'Home', href: '/' },
  { label: 'How it Works', href: '/how-it-works' },
  { label: 'Courses', href: '/courses', hasDropdown: true },
  { label: 'Tuition & Fee', href: '/tuition-fee' }
];

export const MOBILE_NAVIGATION: ReadonlyArray<NavItem> = [
  { label: 'Home', href: '/' },
  { label: 'How it Works', href: '/how-it-works' },
  { label: 'Courses', href: '/courses' },
  { label: 'Teachers', href: '/teachers' },
  { label: 'Tuition Fee', href: '/tuition-fee' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' }
];

export const FOOTER_NAVIGATION = {
  explore: [
    { label: 'How it Works', href: '/how-it-works' },
    { label: 'Programs & Courses', href: '/courses' },
    { label: 'Expert Teachers', href: '/teachers' },
    { label: 'Pricing & Fees', href: '/tuition-fee' },
    { label: 'Student Portals', href: '/portals' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Refund Policy', href: '/legal/refund' },
    { label: 'XML Sitemap', href: '/sitemap-index.xml' },
    { label: 'AI/LLM Context', href: '/llms.txt' }
  ]
} as const;