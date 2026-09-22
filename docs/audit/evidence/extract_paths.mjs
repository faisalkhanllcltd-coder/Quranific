import fs from 'fs';
import path from 'path';

const auditFiles = [
  '00-MASTER-REPORT.md',
  '01-cloudflare.md',
  '02-astro.md',
  '03-svelte.md',
  '04-adjacent.md'
];

const paths = new Map(); // path -> Set of files

// Regex to capture file paths and component names
// src/..., public/..., alarm-worker/...
const pathRegex = /(?:src|public|alarm-worker)\/[a-zA-Z0-9_\-\.\/]+/g;
// Also look for component names like FooBar.astro or FooBar.svelte
const componentRegex = /\b[A-Z][a-zA-Z0-9]+\.(?:astro|svelte)\b/g;

for (const f of auditFiles) {
  const fullPath = path.join('docs', 'audit', f);
  if (!fs.existsSync(fullPath)) continue;
  const text = fs.readFileSync(fullPath, 'utf8');

  let match;
  while ((match = pathRegex.exec(text)) !== null) {
    let p = match[0].replace(/[,\.:;\)`'"\]>]+$/, '');
    if (!paths.has(p)) paths.set(p, new Set());
    paths.get(p).add(f);
  }

  while ((match = componentRegex.exec(text)) !== null) {
    let comp = match[0];
    if (!paths.has(comp)) paths.set(comp, new Set());
    paths.get(comp).add(f);
  }
}

// Find all files in repo to check component names
function getAllFiles(dir, all = []) {
  if (!fs.existsSync(dir)) return all;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.astro') {
        getAllFiles(p, all);
      }
    } else {
      all.push(p.replace(/\\/g, '/'));
    }
  }
  return all;
}

const repoFiles = getAllFiles('.');

console.log(`Total unique items found: ${paths.size}`);

const results = [];
for (const [item, files] of Array.from(paths.entries()).sort()) {
  let exists = false;
  let resolvedPath = '';

  if (fs.existsSync(item)) {
    exists = true;
    resolvedPath = item;
  } else {
    // Check if it matches a component name anywhere in repo
    const matches = repoFiles.filter(f => f.endsWith('/' + item) || f === item);
    if (matches.length > 0) {
      exists = true;
      resolvedPath = matches.join(', ');
    }
  }

  results.push({
    item,
    exists,
    resolvedPath,
    files: Array.from(files).join(', ')
  });
}

const missing = results.filter(r => !r.exists);
const existing = results.filter(r => r.exists);

console.log(`Existing items: ${existing.length}`);
console.log(`Missing items: ${missing.length}`);
console.log('\n--- MISSING ITEMS ---');
for (const m of missing) {
  console.log(`| \`${m.item}\` | False | ${m.files} |`);
}

fs.writeFileSync('docs/audit/evidence/paths_report.json', JSON.stringify({ existing, missing }, null, 2));
