export type FAQ = {
  question: string;
  answer: string;
  link?: { text: string; href: string };
};

export const landingKids: FAQ[] = [
  {
    question: 'Do I need to know Arabic to help my child practice?',
    answer:
      'Not at all. Our methodology is designed so the teacher handles 100% of the academic heavy lifting during the session. You do not need to be a fluent reader, and there is no "homework" for parents to supervise.',
  },
  {
    question: 'What if I have more than one child?',
    answer:
      "Sibling discounts apply automatically: 10% off your second child, 20% off your third. No need to ask — it's applied at checkout.",
  },
  {
    question: "What if the schedule doesn't fit?",
    answer:
      'Classes run 24/7 across time zones. You set the frequency, and you can adjust it any time — no penalty, no process.',
  },
  {
    question: 'What happens if we wait?',
    answer:
      "Nothing happens to us. But the earlier a child starts building a real relationship with Tajweed, the more natural it becomes. Patterns formed young are patterns that last. The free trial costs nothing to find out if now's the right time.",
  },
];

export const landingAdults: FAQ[] = [
  {
    question: "Am I too old to start, or what if I don't know Arabic?",
    answer:
      'You are never too old. A large portion of our adult students start from the very beginning (the Noorani Qaida). You do not need to know Arabic — our teachers specialise in guiding beginners step-by-step in English.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'From $40/month depending on session length and frequency. Full pricing is transparent — no hidden fees.',
  },
  {
    question: 'Can I request a specific gender for my teacher?',
    answer:
      'Absolutely. We offer strict male-to-male and female-to-female matching for absolute comfort and privacy.',
  },
  {
    question: 'What if my schedule changes every week?',
    answer:
      'Classes run 24/7 across time zones. You can easily adjust your schedule or reschedule individual sessions when work or family commitments come up.',
  },
];

export const landingWomen: FAQ[] = [
  {
    question: 'Is it guaranteed I will have a female teacher?',
    answer:
      'Yes. This programme is strictly female-to-female. You will only ever be matched with a vetted, qualified Ustadha, ensuring a 100% secure and private environment.',
  },
  {
    question: 'What if I am a complete beginner?',
    answer:
      'A large portion of our students start from the very beginning (the Noorani Qaida). You do not need to know Arabic — our Ustadhas specialise in guiding beginners step-by-step in English.',
  },
  {
    question: 'What if my baby cries or I need to pause class?',
    answer:
      'We understand the realities of motherhood and busy lives. Our environment is empathetic and flexible. You can pause, step away, or reschedule easily.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'From $40/month depending on session length and frequency. Full pricing is transparent — no hidden fees.',
  },
];

export const faqs: Record<string, FAQ[]> = {
  landingKids,
  landingAdults,
  landingWomen,
  home: [
    {
      question: 'How exactly do the online classes work?',
      answer:
        'Our classes are completely live and 1-on-1, conducted via secure video call. The teacher uses an interactive digital whiteboard to guide your child through the Quran, allowing for real-time feedback and focusing strictly on their individual pace without the distractions of a group setting.',
    },
    {
      question: 'Do I need any special equipment or software?',
      answer:
        'No special equipment is required. You only need a laptop, tablet, or desktop computer, a stable internet connection, and a pair of headphones to help your child focus. We provide all the necessary digital learning materials directly on the screen.',
    },
    {
      question: 'How does the 1-month money-back guarantee work?',
      answer:
        'It is a complete risk-reversal. If you are not entirely satisfied after your first full paid month, we will issue a full refund. No questions asked, no complicated forms, and no chasing. You just send us a single email.',
    },
    {
      question: 'Can we choose a male or female teacher?',
      answer:
        'Yes. We understand the importance of cultural and personal comfort, so you have full control over selecting a male or female teacher. Regardless of who you choose, every single teacher on our platform holds a verified Ijazah.',
    },
    {
      question: 'At what age can my child start?',
      answer:
        "We have specialized courses designed for children starting from age 4. Our curriculum is highly adaptable, catering to complete beginners in our kids' programs all the way up to advanced modules for adults.",
    },
    {
      question: 'How do we get started?',
      answer:
        'Our frictionless onboarding process takes just a few clicks. First, book a free trial class to meet your teacher. They will assess your level and recommend the best approach. After the trial, you can choose a monthly plan that fits your schedule.',
    },
  ],
  general: [
    {
      question: 'How do you handle time zone differences?',
      answer:
        "We have a truly global student base and our teachers are distributed worldwide. You can select your local time zone when booking, and we will match you with a teacher available exactly when you need them, whether it's early morning or late evening.",
    },
    {
      question: 'What happens during public holidays or vacations?',
      answer:
        "If you're going on holiday, you can easily pause your sessions through the parent dashboard. Your billing is paused, and we hold your slot with the same teacher for when you return, ensuring continuous progression without paying for missed weeks.",
    },
    {
      question: 'Do you issue certificates of completion?',
      answer:
        'Yes. Upon completing a specific module or course—such as finishing the Qaida or completing a Juz of memorization—your child will receive a digital certificate marking their milestone to encourage and motivate their ongoing journey.',
    },
  ], // Common QA: "How long is each class?", "Do I need to buy textbooks?"
  pricing: [
    {
      question: 'When does billing start? Do I pay before the first class?',
      answer:
        'No. <strong class="text-emerald-950">Your first class is completely free</strong> and requires no payment details. Billing begins only after you choose to continue (which means after you have attended the free trial, received the progress report, and made a conscious decision to enrol). You choose when the first payment happens, not us.',
    },
    {
      question: 'Can I upgrade or downgrade my plan at any time?',
      answer:
        'Yes, always. You can increase or decrease your session frequency — or switch between plans entirely — at any point. <strong class="text-emerald-950">Changes take effect from your next billing cycle</strong>, with no penalty, no admin fee, and no minimum notice period. If your child\'s progress means they need more sessions, or your schedule tightens and you need fewer, one message to us is all it takes.',
    },
    {
      question: 'How do I pay, and is the payment process secure?',
      answer:
        'Payments are processed through <strong class="text-emerald-950">Stripe</strong>, one of the world\'s most trusted payment platforms, used by millions of businesses globally. We accept all major debit and credit cards (Visa, Mastercard, American Express). Your card details are never stored by us — they are encrypted and held exclusively by Stripe under PCI-DSS Level 1 compliance, the highest standard available. You will receive an automatic receipt after every payment.',
    },
    {
      question: 'What is your Full-Month Guarantee?',
      answer:
        'If after your first full paid month you are not completely satisfied, for any reason, we refund every penny. No questions, no forms, no chasing. One email to us and it is done.',
    },
    {
      question: 'What exactly is covered by the make-up guarantee?',
      answer:
        'Every session your child misses, for any reason, has a guaranteed replacement. <strong class="text-emerald-950">There are no limits, no exclusions, and no "only applies if you give 24 hours\' notice" clauses</strong>. Your child is ill on the day? Make-up scheduled. Family travel? Make-up scheduled. Teacher unavailable? Make-up scheduled, and we tell you in advance. The replacement is booked within the same calendar week where possible, or the following week for late notice.',
    },
    {
      question: 'What happens if I want to cancel?',
      answer:
        'Cancel before your next billing date and you will not be charged. <strong class="text-emerald-950">No notice period. No cancellation fee. No lock-in.</strong> Send us one message (WhatsApp, email, or through the parent dashboard) and we confirm the cancellation immediately. If you are on an annual plan and cancel mid-year, we refund the remaining months pro-rata without question.',
    },
    {
      question: 'Are there any fees not listed on this page?',
      answer:
        'No. The price you see on this page is the price you pay. <strong class="text-emerald-950">No setup fee. No resource fee. No platform access charge. No "teacher matching" fee.</strong> We have listed every cost component on this page deliberately, because we find it frustrating when pricing pages make you feel like you are about to discover something unpleasant at checkout. You are not.',
    },
    {
      question: 'Can I pay in my local currency?',
      answer:
        'Prices are listed in USD, which is our base currency. <strong class="text-emerald-950">Your card is charged in USD and your bank applies its standard conversion rate</strong>. We do not add a foreign exchange surcharge. Families in the UK, UAE, Canada, Australia, and the EU all pay in USD. If you would prefer an invoice in your local currency for accounting purposes, contact us and we will arrange it.',
    },
  ],
  courses: [
    // ── SLOT 1: Trust / credibility ──────────────────────────────────────────
    {
      question: 'Who will be teaching my child?',
      answer:
        "Every Quranific teacher holds a verified <strong>Ijazah</strong> — a certified chain of Quranic transmission — and passes our strict <strong>four-stage</strong> vetting process before teaching a single student: Ijazah verification, a live recitation assessment, a structured teaching methodology interview, and a full safeguarding check. You receive your teacher's complete profile before the first session. We also offer both <strong>male and female teachers</strong> so families can choose whoever they feel most comfortable with culturally and personally. If at any point you want a different teacher, we arrange a new match immediately, at no charge and with no awkward conversation required.",
    },
    // ── SLOT 2: Core value proposition ───────────────────────────────────────
    {
      question: 'Do the courses cover basic Islamic teachings like Salah and Dua?',
      answer:
        "Yes. Alongside Quran recitation, our teachers provide step-by-step guidance on the five daily prayers, covering the correct method of wudu, the sequence of rak'ahs, and the meaning behind each posture. Students also memorise the short Surahs most commonly recited in Salah — including Al-Fatiha and Al-Ikhlas — as well as the essential daily Duas for protection, gratitude, and morning and evening remembrance. Islamic studies content is woven naturally into the lesson rather than treated as a separate subject, so your child builds a living, practical connection to their faith from the very first session.",
    },
    // ── SLOT 3: Discovery / entry ─────────────────────────────────────────────
    {
      question: 'How do I know which programme is right for my child?',
      answer:
        'The free trial class is the definitive answer. In the very first session, your teacher conducts a diagnostic assessment and tells you exactly where your child stands and which programme fits best. You are not committed to any programme until after that session. If you want a head start, browse the programmes on this page — each one lists the age range, level, and learning outcomes so you can narrow down the options in under a minute.',
    },
    // ── SLOT 4: Objection removal — scheduling ────────────────────────────────
    {
      question: 'How flexible are the class timings?',
      answer:
        "Completely flexible. Because every session is strictly <strong>1-on-1</strong>, your class time is yours alone — there is no fixed group timetable to work around. We schedule sessions to fit your family's daily routine and accommodate any time zone worldwide. If your routine changes week to week, simply message us and we adjust. Many of our families book different slots on different weeks depending on school schedules, work commitments, or travel — and that is perfectly fine.",
    },
    // ── SLOT 5: Accessibility — SEN ───────────────────────────────────────────
    {
      question: 'My child has ADHD or a learning difference. Which course works for them?',
      answer:
        "The <strong>Basic Qaida</strong> or <strong>Quran Reading with Tajweed</strong> programmes can both be delivered in SEN-adapted format at no extra charge. Sessions are shortened to 20–25 minutes, structured differently with more frequent breaks, and taught by a teacher with specific SEN training. Simply note your child's needs in the signup form and we match them to the right teacher from day one.",
    },
    // ── SLOT 6: Accessibility — language ─────────────────────────────────────
    {
      question: 'What languages are the classes taught in?',
      answer:
        'Classes are delivered in <strong>English, Urdu, and Arabic</strong>, depending on your preference. Most of our teachers are fluent in all three and will naturally switch to whichever language your child is most comfortable in — or blend languages mid-session when it helps comprehension. You can specify your language preference in the signup form, and we match your child to a teacher whose first language aligns with yours.',
    },
    // ── SLOT 7: Risk removal — switching ──────────────────────────────────────
    {
      question: 'Can my child switch programmes if the level turns out to be wrong?',
      answer:
        'Yes, always, and at no extra cost. If the teacher sees a better fit after the first few sessions, they will tell you directly and recommend the switch themselves. We have no financial incentive to keep your child in the wrong programme. Switching is handled in one message and takes effect from the very next session.',
    },
    // ── SLOT 8: Progression milestone ────────────────────────────────────────
    {
      question: 'How long until my child is ready to start Hifz (memorisation)?',
      answer:
        'Hifz requires a solid Tajweed foundation — a child who memorises without it will embed errors that are very hard to correct later. Our teachers assess Hifz readiness honestly. Most children completing the Quran Reading with Tajweed programme are ready to begin Hifz within 12–18 months, depending on age and session frequency. Your teacher will tell you precisely when the transition is right.',
    },
    // ── SLOT 9: Niche — adult privacy ─────────────────────────────────────────
    {
      question: 'Is the adult programme completely private?',
      answer:
        'Yes. In the <strong>Quran Reading with Tajweed</strong>, <strong>Quran Memorization (Hifz)</strong>, <strong>Quran Translation &amp; Tafsir</strong>, and <strong>Advanced Tajweed (Ijazah)</strong> programmes, sessions are strictly <strong>1-on-1</strong>, never recorded without your explicit consent, and never discussed in any group setting. Your teacher knows only your first name. Progress reports go only to you. Many of our adult students specifically enrol because they want to correct mistakes they have carried for years without anyone knowing.',
    },
    // ── SLOT 10: Confidence — teacher chemistry ───────────────────────────────
    {
      question: 'What if my child does not connect with the assigned teacher?',
      answer:
        'Teacher chemistry matters enormously in 1-on-1 learning. If your child does not connect with their teacher for any reason — personality, teaching style, pace — simply let us know and we arrange a new match immediately. There is no awkward conversation, no forms to fill, and absolutely no charge. We have done this many times and consider it a normal part of finding the right learning relationship.',
    },
  ],
  teachers: [], // Vetting QA: "Can I request a female teacher?", "Are teachers native Arabic speakers?"
  safeguarding: [
    {
      question: 'Are the teachers background checked?',
      answer:
        'Absolutely. Every single teacher undergoes a comprehensive identity and criminal background check before they ever teach a session. We have a zero-tolerance policy on safeguarding and take the security of our students extremely seriously.',
    },
    {
      question: 'Can parents observe the sessions?',
      answer:
        'We actively encourage it. Because the classes are conducted via a secure online link, you are welcome to sit next to your child or join the meeting from another device at any time, unannounced. We want you to feel 100% comfortable with the teaching process.',
    },
    {
      question: 'How secure are the video links?',
      answer:
        "All classes run on secure, private video links that are uniquely generated for your child's session. They are end-to-end encrypted and cannot be accessed by anyone without the specific link and passcode.",
    },
  ], // Security QA: "How are teachers vetted?", "Who monitors the sessions?"
  technical: [
    {
      question: 'What are the internet speed requirements?',
      answer:
        'A standard broadband connection (around 5 Mbps) is perfectly fine for our live 1-on-1 video classes. If you can watch a YouTube video smoothly, your connection is strong enough for our sessions.',
    },
    {
      question: 'Does the platform work on an iPad or tablet?',
      answer:
        'Yes, our classes are fully accessible across all devices including laptops, desktops, iPads, and Android tablets. We recommend using a device with a decent-sized screen so your child can easily see the interactive whiteboard.',
    },
    {
      question: 'What if I forget my password or get locked out?',
      answer:
        "You can instantly reset your password via the login screen. If you're having trouble connecting to a class, our 24/7 technical support team is always available via WhatsApp to get you connected within minutes so you don't lose session time.",
    },
  ], // IT QA: "Does it work on an iPad?", "Do we need our camera on?"
  contact: [], // Support QA: "How fast do you reply to WhatsApp?"
  legal: [], // Policy QA: "How do you store my data?"
};
