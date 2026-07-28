// audit-overflow.mjs
// Run: npx playwright test --config=audit-overflow.mjs  (no — see bottom)
// Actual run: node audit-overflow.mjs
// Requires: npx playwright install chromium (first time only)

import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';

// All top-level pages (skip API, dynamic catch-all, ads subdirs — hard to enumerate)
const PAGES = [
  '/',
  '/about',
  '/tuition-fee',
  '/faq',
  '/how-it-works',
  '/teachers',
  '/testimonials',
  '/contact',
  '/blog',
  '/partners',
  '/careers',
  '/portals',
  '/safeguarding',
  '/features',
  '/funnel/signup',
];

const WIDTHS = [375, 768, 1440];

// Returns { overflow, scrollWidth, clientWidth, culpritSelector, culpritWidth }
async function checkPage(page, url, width) {
  await page.setViewportSize({ width, height: 800 });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(600); // allow deferred JS/CSS paint
  } catch {
    return { error: 'TIMEOUT/LOAD_ERROR', overflow: false };
  }

  const result = await page.evaluate(() => {
    const docSW = document.documentElement.scrollWidth;
    const docCW = document.documentElement.clientWidth;
    const overflow = docSW > docCW;

    if (!overflow) return { overflow: false, scrollWidth: docSW, clientWidth: docCW };

    // Walk entire DOM to find the deepest element causing the overflow
    let culprit = null;
    let culpritWidth = 0;
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      const rightEdge = rect.right;
      if (rightEdge > docCW + 1) {
        // 1px tolerance for rounding
        // prefer deepest (last) match
        culprit = el;
        culpritWidth = Math.round(rightEdge);
      }
    }

    function getSelector(el) {
      if (!el) return 'unknown';
      const id = el.id ? `#${el.id}` : '';
      const tag = el.tagName.toLowerCase();
      // first 3 classes
      const cls = Array.from(el.classList)
        .slice(0, 3)
        .map((c) => `.${c}`)
        .join('');
      return `${tag}${id}${cls}`;
    }

    return {
      overflow: true,
      scrollWidth: docSW,
      clientWidth: docCW,
      culpritSelector: getSelector(culprit),
      culpritWidth,
      culpritOuterHTML: culprit ? culprit.outerHTML.slice(0, 200) : null,
    };
  });

  return result;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const rows = [];

  for (const path of PAGES) {
    const url = BASE + path;
    for (const width of WIDTHS) {
      const r = await checkPage(page, url, width);
      rows.push({
        page: path,
        width,
        overflow: r.overflow,
        scrollWidth: r.scrollWidth ?? '—',
        clientWidth: r.clientWidth ?? '—',
        culprit: r.culpritSelector ?? (r.error ? r.error : 'none'),
        culpritWidth: r.culpritWidth ?? '—',
      });
    }
  }

  await browser.close();

  // Print table
  console.log('\n=== HORIZONTAL OVERFLOW AUDIT ===\n');
  console.log(
    'PAGE'.padEnd(22) +
      'W'.padEnd(6) +
      'OVFL'.padEnd(6) +
      'scrollW'.padEnd(9) +
      'clientW'.padEnd(9) +
      'CULPRIT (selector, rightEdge)'
  );
  console.log('─'.repeat(110));
  for (const r of rows) {
    const flag = r.overflow ? '  YES' : '  no';
    const extra = r.overflow ? `  ${r.culprit}  rightEdge=${r.culpritWidth}` : '';
    console.log(
      r.page.padEnd(22) +
        String(r.width).padEnd(6) +
        flag.padEnd(6) +
        String(r.scrollWidth).padEnd(9) +
        String(r.clientWidth).padEnd(9) +
        extra
    );
  }

  const overflows = rows.filter((r) => r.overflow);
  console.log(`\nSummary: ${overflows.length} overflow(s) found across ${rows.length} checks.`);
  if (overflows.length) {
    console.log('\nOverflow details:');
    for (const r of overflows) {
      console.log(
        `  ${r.page} @ ${r.width}px — scrollW=${r.scrollWidth} clientW=${r.clientWidth} — ${r.culprit} rightEdge=${r.culpritWidth}px`
      );
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
