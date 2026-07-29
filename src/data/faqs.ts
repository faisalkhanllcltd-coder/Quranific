export type FAQ = { question: string; answer: string };

export const faqs: Record<string, FAQ[]> = {
  home: [
    {
      question: 'What if my child misses a class?',
      answer:
        'Every single missed class has a guaranteed make-up session: no exceptions, no expiry. Life happens: travel, illness, school events. You simply notify us and we schedule a replacement within the same week where possible. You never lose a session.',
    },
    {
      question: 'How do I know the teacher is genuinely qualified?',
      answer:
        'Every Quranific teacher must hold a verified <strong>ijazah</strong> (a chain of transmission connecting them to the Prophet (ﷺ) through unbroken teachers). Beyond that, they complete a 3-stage vetting process: a recorded recitation assessment, a teaching methodology interview, and a background check. You receive their full profile before the first session. If you ever want a different teacher, we switch immediately, no questions asked.',
    },
    {
      question: "What if it doesn't work for us?",
      answer:
        "The first class is completely free, no credit card needed and no commitment. If you join after that and you're not satisfied within your first paid month, we <strong>refund every penny</strong>. One email is all it takes. We're not interested in holding onto money from families who aren't thrilled. We'd rather earn your trust than your subscription.",
    },
    {
      question: "Is my child's session safe and private?",
      answer:
        "Every session is strictly <strong>1-on-1</strong>, conducted on a private, secure video link. Sessions are never recorded without explicit parental consent. You can join any session unannounced; your child's teacher will expect this and welcomes it. All teachers also carry safeguarding training.",
    },
    {
      question: 'My child is a complete beginner. Is that okay?',
      answer:
        'Beginners are our specialty. <strong>Over 60% of our students start from zero</strong>: no Arabic, no prior Quran knowledge. We assess your child\'s level in the first free class and build an individual learning plan from there. There\'s no "too late" and no "too early." We\'ve taught children from age 4 and adults in their 60s.',
    },
    {
      question: 'How long until I notice a real difference?',
      answer:
        "Most parents notice a shift in their child's attitude toward the Quran within the <strong>first two to three weeks</strong>. Progress in recitation depends on age, frequency of sessions, and prior exposure, but our teachers set clear, measurable milestones and share them with you weekly so you always know exactly where your child stands.",
    },
  ],
  general: [], // Common QA: "How long is each class?", "Do I need to buy textbooks?"
  fees: [], // Pricing QA: "Are there sibling discounts?", "Is it a monthly contract?"
  courses: [], // Curriculum QA: "Do you teach Hifz?", "What if I am an absolute beginner?"
  teachers: [], // Vetting QA: "Can I request a female teacher?", "Are teachers native Arabic speakers?"
  safeguarding: [], // Security QA: "How are teachers vetted?", "Who monitors the sessions?"
  technical: [], // IT QA: "Does it work on an iPad?", "Do we need our camera on?"
  contact: [], // Support QA: "How fast do you reply to WhatsApp?"
  legal: [], // Policy QA: "How do you store my data?"
};
