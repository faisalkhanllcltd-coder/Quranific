import fs from 'node:fs';
import path from 'node:path';

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.astro' || file === '.wrangler') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, fileList);
    } else {
      fileList.push(fullPath.replace(/\\/g, '/'));
    }
  }
  return fileList;
}

const allRepoFiles = walk('.').filter(f => !f.startsWith('docs/audit/'));

const fullList = [
  'public/_headers',
  'src/middleware.ts',
  'src/pages/api/register.ts',
  'src/pages/api/complete.ts',
  'src/pages/api/contact.ts',
  'src/pages/api/apply-teacher.ts',
  'src/pages/api/newsletter.ts',
  'src/pages/api/consent-bucket.ts',
  'src/pages/api/geo-currency.ts',
  'src/pages/api/internal/retry-queue.ts',
  'src/lib/consent.ts',
  'src/lib/email.ts',
  'src/lib/helpers.ts',
  'src/lib/schema.ts',
  'src/constants/site.ts',
  'src/constants/courses.ts',
  'src/constants/pricing.ts',
  'src/layouts/Base.astro',
  'src/layouts/Funnel.astro',
  'src/layouts/Landing.astro',
  'src/layouts/Page.astro',
  'src/components/blocks/CookieBanner.svelte',
  'src/components/blocks/PricingCalculator.svelte',
  'src/pages/getting-started/_components/CompleteForm.svelte',
  'src/pages/getting-started/_components/SignupForm.svelte',
  'src/pages/getting-started/_components/StepIndicator.svelte',
  'src/pages/teachers/_components/TeacherApplicationForm.svelte',
  'src/pages/teachers/_components/TeacherStep1.svelte',
  'src/pages/teachers/_components/TeacherStep2.svelte',
  'src/pages/tuition-fee/_components/PricingGrid.svelte',
  'src/styles/global.css',
  'src/styles/fonts.css',
  'src/styles/cv.css',
  'src/content.config.ts',
  'src/env.d.ts',
  'tsconfig.json',
  'svelte.config.js',
  'eslint.config.mjs',
  'src/pages/index.astro',
  'src/pages/[intent]/for-adults.astro',
  'src/pages/[intent]/for-kids.astro',
  'src/pages/[intent]/for-women.astro',
  'src/pages/getting-started/signup.astro',
  'src/pages/getting-started/complete.astro',
  'src/pages/getting-started/success.astro',
  'src/pages/courses/index.astro',
  'src/pages/courses/[slug].astro',
  'alarm-worker/wrangler.toml',
  'alarm-worker/src/index.ts',
  'wrangler.toml',
  'package.json',
  'astro.config.mjs'
];

const partialList = [
  'src/pages/about/_components/AboutTeam.astro',
  'src/pages/about/_components/AboutTeachers.astro',
  'src/pages/about/index.astro',
  'src/pages/contact/index.astro',
  'src/pages/contact/_components/SmartContactForm.astro',
  'src/pages/courses/_components/CourseHero.astro',
  'src/pages/legal/cookies.astro',
  'src/pages/legal/impressum.astro',
  'src/pages/legal/privacy.astro',
  'src/pages/legal/refund.astro',
  'src/pages/legal/terms.astro',
  'src/pages/teachers/_components/TeachersIjazah.astro',
  'src/components/blocks/TeacherTeaserBanner.astro',
  'src/components/blocks/CourseCard.astro',
  'src/components/blocks/CourseGrid.astro',
  'src/components/blocks/CoursesFAQ.astro',
  'src/data/faqs.ts',
  'src/data/features.ts',
  'scripts/smoke-test.mjs',
  'scripts/seo-diff.mjs',
  'scripts/seo-snapshot.mjs',
  'tests/consent-unit.test.ts',
  'tests/calculator.spec.ts',
  'tests/funnel.spec.ts',
  'tests/api-contact.spec.ts',
  'tests/api-teacher.spec.ts',
  'tests/consent.spec.ts'
];

const fullSet = new Set(fullList);
const partialSet = new Set(partialList);

const ledger = [];
let counts = { FULL: 0, PARTIAL: 0, SCANNED: 0, NOT_OPENED: 0 };

for (const file of allRepoFiles) {
  let status = 'NOT OPENED';
  if (fullSet.has(file)) {
    status = 'FULL';
    counts.FULL++;
  } else if (partialSet.has(file)) {
    status = 'PARTIAL';
    counts.PARTIAL++;
  } else if (file.startsWith('src/') || file.startsWith('public/')) {
    status = 'SCANNED';
    counts.SCANNED++;
  } else {
    counts.NOT_OPENED++;
  }
  ledger.push({ file, status });
}

console.log('Total files tracked:', allRepoFiles.length);
console.log('Ledger counts:', counts);

// Check if any item in fullList was missed
for (const f of fullList) {
  if (!allRepoFiles.includes(f)) {
    console.warn('MISSING FROM REPO:', f);
  }
}

fs.writeFileSync('docs/audit/_ledger.json', JSON.stringify({ counts, total: allRepoFiles.length, files: ledger }, null, 2));
