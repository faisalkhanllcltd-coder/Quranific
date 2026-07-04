// src/constants/faqs.ts
export interface FAQ {
  question: string;
  answer: string;
}

export const FAQS: FAQ[] = [
  {
    question: "What if my child misses a class?",
    answer: "Every single missed class has a <strong>guaranteed make-up session</strong> — no exceptions, no expiry. Life happens: travel, illness, school events. You simply notify us and we schedule a replacement within the same week where possible. You never lose a session."
  },
  {
    question: "How do I know the teacher is genuinely qualified?",
    answer: "Every Quranific teacher must hold a verified <strong>ijazah</strong> — a chain of transmission connecting them to the Prophet (ﷺ) through unbroken teachers. Beyond that, they complete a 3-stage vetting process: a recorded recitation assessment, a teaching methodology interview, and a background check. You receive their full profile before the first session. If you ever want a different teacher, we switch immediately — no questions asked."
  },
  {
    question: "What if it doesn't work for us?",
    answer: "The first class is completely free — no credit card needed, no commitment. If you join after that and you're not satisfied within your first paid month, we <strong>refund every penny</strong>. One email is all it takes. We're not interested in holding onto money from families who aren't thrilled. We'd rather earn your trust than your subscription."
  },
  {
    question: "Is my child's session safe and private?",
    answer: "Every session is strictly <strong>1-on-1</strong>, conducted on a private, secure video link. Sessions are never recorded without explicit parental consent. You can join any session unannounced — your child's teacher will expect this and welcomes it. All teachers also carry safeguarding training."
  },
  {
    question: "My child is a complete beginner. Is that okay?",
    answer: "Beginners are our specialty. <strong>Over 60% of our students start from zero</strong> — no Arabic, no prior Quran knowledge. We assess your child's level in the first free class and build an individual learning plan from there. There's no \"too late\" and no \"too early.\" We've taught children from age 4 and adults in their 60s."
  },
  {
    question: "How long until I notice a real difference?",
    answer: "Most parents notice a shift in their child's attitude toward the Quran within the <strong>first two to three weeks</strong>. Progress in recitation depends on age, frequency of sessions, and prior exposure — but our teachers set clear, measurable milestones and share them with you weekly so you always know exactly where your child stands."
  }
];