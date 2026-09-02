/**
 * scratch/seo-diff.mjs
 * Diffs two SEO snapshots (JSON files produced by seo-snapshot.mjs).
 * Usage: node scratch/seo-diff.mjs <pre-fix.json> <post-fix.json>
 * Exits 1 if any differences found outside the allowed set.
 */

import { readFileSync } from 'fs';

const [, , preFile, postFile] = process.argv;
if (!preFile || !postFile) {
  console.error('Usage: node scratch/seo-diff.mjs <pre-fix.json> <post-fix.json>');
  process.exit(2);
}

const pre = JSON.parse(readFileSync(preFile, 'utf8'));
const post = JSON.parse(readFileSync(postFile, 'utf8'));

const pages = new Set([...Object.keys(pre), ...Object.keys(post)]);
let totalDiffs = 0;

for (const page of pages) {
  const prePage = pre[page];
  const postPage = post[page];

  if (!prePage) {
    console.log(`ADDED PAGE: ${page}`);
    totalDiffs++;
    continue;
  }
  if (!postPage) {
    console.log(`DELETED PAGE: ${page}`);
    totalDiffs++;
    continue;
  }

  const diffs = [];

  if (prePage.title !== postPage.title) {
    diffs.push(`  title:\n    pre:  ${prePage.title}\n    post: ${postPage.title}`);
  }
  if (prePage.metaDescription !== postPage.metaDescription) {
    diffs.push(
      `  metaDescription:\n    pre:  ${prePage.metaDescription}\n    post: ${postPage.metaDescription}`
    );
  }

  const preJson = JSON.stringify(prePage.jsonLd ?? [], null, 2);
  const postJson = JSON.stringify(postPage.jsonLd ?? [], null, 2);
  if (preJson !== postJson) {
    diffs.push(
      `  jsonLd: DIFFERS\n    pre:  ${preJson.slice(0, 200)}\n    post: ${postJson.slice(0, 200)}`
    );
  }

  if (diffs.length) {
    console.log(`\nDIFF in [${page}]:`);
    diffs.forEach((d) => console.log(d));
    totalDiffs += diffs.length;
  }
}

if (totalDiffs === 0) {
  console.log(
    'CLEAN DIFF: no title, meta description, or JSON-LD differences between pre-fix and post-fix snapshots.'
  );
} else {
  console.log(`\n${totalDiffs} difference(s) found.`);
  process.exit(1);
}
