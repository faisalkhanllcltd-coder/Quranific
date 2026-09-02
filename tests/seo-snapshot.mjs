/**
 * scratch/seo-snapshot.mjs
 * Extracts <title>, <meta name="description">, and all <script type="application/ld+json">
 * blocks from the built HTML for the protected surface pages.
 *
 * Usage: node scratch/seo-snapshot.mjs [output-file]
 * Output: JSON written to stdout (and optionally to a file)
 *
 * Run BEFORE a change to capture baseline, AFTER to diff.
 * Both runs use this identical script — no methodology drift.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const DIST = resolve('./dist/client');

const PAGES = [
  { name: 'homepage', file: 'index.html' },
  { name: 'courses/basic-qaida', file: 'courses/basic-qaida/index.html' },
  {
    name: 'courses/quran-reading-with-tajweed',
    file: 'courses/quran-reading-with-tajweed/index.html',
  },
  { name: 'courses/quran-memorization', file: 'courses/quran-memorization/index.html' },
  {
    name: 'courses/quran-translation-with-tafsir',
    file: 'courses/quran-translation-with-tafsir/index.html',
  },
  { name: 'courses/advanced-tajweed-ijazah', file: 'courses/advanced-tajweed-ijazah/index.html' },
  { name: 'courses/arabic-language', file: 'courses/arabic-language/index.html' },
  { name: '[intent] quran-classes/for-adults', file: 'quran-classes/for-adults/index.html' },
  { name: '[intent] quran-classes/for-kids', file: 'quran-classes/for-kids/index.html' },
  { name: '[intent] quran-classes/for-women', file: 'quran-classes/for-women/index.html' },
  { name: '[intent] quran-teacher/for-adults', file: 'quran-teacher/for-adults/index.html' },
  { name: '[intent] quran-teacher/for-kids', file: 'quran-teacher/for-kids/index.html' },
  { name: '[intent] quran-teacher/for-women', file: 'quran-teacher/for-women/index.html' },
];

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractMetaDescription(html) {
  const m =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ??
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  return m ? m[1].trim() : null;
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch {
      blocks.push({ _parseError: m[1].trim().slice(0, 120) });
    }
  }
  return blocks;
}

const snapshot = {};

for (const page of PAGES) {
  const filePath = join(DIST, page.file);
  if (!existsSync(filePath)) {
    snapshot[page.name] = { error: `FILE NOT FOUND: ${filePath}` };
    continue;
  }
  const html = readFileSync(filePath, 'utf8');
  snapshot[page.name] = {
    title: extractTitle(html),
    metaDescription: extractMetaDescription(html),
    jsonLd: extractJsonLd(html),
  };
}

const output = JSON.stringify(snapshot, null, 2);
const outFile = process.argv[2];
if (outFile) {
  writeFileSync(outFile, output);
  console.error(`Written to ${outFile}`);
}
console.log(output);
