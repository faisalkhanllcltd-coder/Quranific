import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'd:\\Live Web\\Quranific-live';

// 1. Routes from git ls-files src/pages
const rawFiles = execSync('git ls-files src/pages', { cwd: REPO_ROOT, encoding: 'utf-8' })
  .split('\n')
  .map(f => f.trim())
  .filter(Boolean);

// Filter out _ folders and api
const pageFiles = rawFiles.filter(f => !f.includes('/_') && !f.includes('/api/'));

// Course slugs
const coursesTs = fs.readFileSync(path.join(REPO_ROOT, 'src/constants/courses.ts'), 'utf-8');
const courseSlugs = [...coursesTs.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);

// Intent x Audience
const intents = ['quran-classes', 'quran-teacher'];
const audiences = ['for-kids', 'for-adults', 'for-women'];

// Blog non-draft slugs
const blogFiles = execSync('git ls-files src/content/blog', { cwd: REPO_ROOT, encoding: 'utf-8' })
  .split('\n')
  .map(f => f.trim())
  .filter(Boolean);
const blogSlugs = [];
for (const bf of blogFiles) {
  const content = fs.readFileSync(path.join(REPO_ROOT, bf), 'utf-8');
  if (!content.includes('draft: true')) {
    const slug = path.basename(bf, path.extname(bf));
    blogSlugs.push(slug);
  }
}

const routes = new Set();
for (const file of pageFiles) {
  if (file === 'src/pages/index.astro') {
    routes.add('/');
  } else if (file === 'src/pages/courses/[slug].astro') {
    for (const s of courseSlugs) routes.add(`/courses/${s}`);
  } else if (file.startsWith('src/pages/[intent]/')) {
    const aud = path.basename(file, '.astro');
    for (const intent of intents) {
      routes.add(`/${intent}/${aud}`);
    }
  } else if (file === 'src/pages/blog/[slug].astro') {
    for (const b of blogSlugs) routes.add(`/blog/${b}`);
  } else if (file === 'src/pages/robots.txt.ts') {
    routes.add('/robots.txt');
  } else if (file === 'src/pages/rss.xml.ts') {
    routes.add('/rss.xml');
  } else {
    // Normal static / index page
    let r = file.replace(/^src\/pages/, '').replace(/\.astro$/, '').replace(/\/index$/, '');
    if (!r) r = '/';
    routes.add(r);
  }
}

// 2. Fetch live sitemap
async function fetchSitemap() {
  const sitemapUrls = new Set();
  const urlsToTry = [
    'https://quranific.com/sitemap-index.xml',
    'https://quranific.com/sitemap-0.xml',
    'https://quranific.com/sitemap.xml'
  ];
  for (const u of urlsToTry) {
    try {
      const res = await fetch(u, {
        headers: { 'User-Agent': 'Mozilla/5.0 QuranificE2E/1.0' }
      });
      if (res.ok) {
        const text = await res.text();
        const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
        for (const loc of locs) {
          if (loc.endsWith('.xml')) {
            // sub-sitemap
            try {
              const subRes = await fetch(loc, { headers: { 'User-Agent': 'Mozilla/5.0 QuranificE2E/1.0' } });
              if (subRes.ok) {
                const subText = await subRes.text();
                const subLocs = [...subText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
                for (const sl of subLocs) {
                  const p = new URL(sl).pathname.replace(/\/$/, '') || '/';
                  sitemapUrls.add(p);
                }
              }
            } catch (e) {}
          } else {
            const p = new URL(loc).pathname.replace(/\/$/, '') || '/';
            sitemapUrls.add(p);
          }
        }
      }
    } catch (e) {}
  }
  return sitemapUrls;
}

// 3. Nav and Footer links
const siteTs = fs.readFileSync(path.join(REPO_ROOT, 'src/constants/site.ts'), 'utf-8');
const navFooterMatches = [...siteTs.matchAll(/href:\s*'([^']+)'/g)].map(m => m[1]);
const internalNavFooter = new Set();
for (const l of navFooterMatches) {
  if (l.startsWith('/') || l.startsWith('https://quranific.com')) {
    const p = l.startsWith('http') ? new URL(l).pathname.replace(/\/$/, '') || '/' : l.replace(/\/$/, '') || '/';
    internalNavFooter.add(p);
  }
}

// 4. Intentionally noindex
const intentionallyNoindex = [
  '/quran-classes/for-kids',
  '/quran-classes/for-adults',
  '/quran-classes/for-women',
  '/quran-teacher/for-kids',
  '/quran-teacher/for-adults',
  '/quran-teacher/for-women',
  '/getting-started/complete',
  '/getting-started/success',
  '/portals',
  '/404',
  '/500'
];

async function run() {
  const sitemapUrls = await fetchSitemap();

  const inSitemapNoPage = [...sitemapUrls].filter(u => !routes.has(u));
  const pageNotInSitemap = [...routes].filter(u => !sitemapUrls.has(u) && !u.endsWith('.txt') && !u.endsWith('.xml'));
  const noindexPages = pageNotInSitemap.filter(u => intentionallyNoindex.includes(u));
  const missingFromSitemapUnintended = pageNotInSitemap.filter(u => !intentionallyNoindex.includes(u));

  console.log('=== ROUTE INVENTORY ===');
  console.log(`Discovered App Routes: ${routes.size}`);
  console.log(`Live Sitemap URLs: ${sitemapUrls.size}`);
  console.log(`Internal Nav/Footer Links: ${internalNavFooter.size}`);
  console.log(`Intentionally noindex Pages: ${noindexPages.length}`);
  console.log(`In sitemap but no page: ${inSitemapNoPage.length} -> ${JSON.stringify(inSitemapNoPage)}`);
  console.log(`Page not in sitemap (noindex): ${noindexPages.length} -> ${JSON.stringify(noindexPages)}`);
  console.log(`Page not in sitemap (unintended): ${missingFromSitemapUnintended.length} -> ${JSON.stringify(missingFromSitemapUnintended)}`);

  // Redirects
  console.log('\n=== REDIRECTS & CONFIG ===');
  const astroConfig = fs.readFileSync(path.join(REPO_ROOT, 'astro.config.mjs'), 'utf-8');
  const redirectsBlock = astroConfig.match(/redirects:\s*\{([^}]+)\}/s);
  console.log(`astro.config.mjs redirects: ${redirectsBlock ? redirectsBlock[1].trim().replace(/\n\s+/g, ', ') : 'none'}`);
  const hasPublicRedirects = fs.existsSync(path.join(REPO_ROOT, 'public/_redirects'));
  console.log(`public/_redirects: ${hasPublicRedirects ? 'present' : 'none'}`);
  const hasPublicHeaders = fs.existsSync(path.join(REPO_ROOT, 'public/_headers'));
  console.log(`public/_headers: ${hasPublicHeaders ? 'present' : 'none'}`);

  // API Routes
  const apiFiles = execSync('git ls-files src/pages/api', { cwd: REPO_ROOT, encoding: 'utf-8' })
    .split('\n')
    .map(f => f.trim())
    .filter(Boolean);
  console.log(`API Routes (${apiFiles.length}): ${apiFiles.map(f => f.replace('src/pages', '').replace(/\.ts$/, '')).join(', ')}`);

  // Forms and Turnstile occurrences
  const formTurnstileGrep = execSync('git grep -n -i "<form\\|turnstile" -- src', { cwd: REPO_ROOT, encoding: 'utf-8' })
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  console.log(`Forms / Turnstile occurrences in src: ${formTurnstileGrep.length}`);
}

run();
