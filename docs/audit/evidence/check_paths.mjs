import fs from 'fs';
import path from 'path';

const badStrings = [
  'capi.ts', 'csrf.ts', 'email-service.ts', 'rate-limiter.ts', 'resend.ts',
  'sanitize.ts', 'turnstile.ts', 'LegalLayout.astro', 'components/layout/Header.astro',
  'HeroStudentFeedback', 'TrialBookingModal', 'ConsentBanner', 'ContactForm.svelte',
  'AudioPlayer.svelte', 'tuition-fee.astro'
];

for (const file of fs.readdirSync('docs/audit')) {
  if (file.endsWith('.md')) {
    const full = path.join('docs', 'audit', file);
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      for (const s of badStrings) {
        if (l.includes(s)) {
          console.log(`${file}:${idx+1} [${s}]: ${l.trim()}`);
        }
      }
    });
  }
}
