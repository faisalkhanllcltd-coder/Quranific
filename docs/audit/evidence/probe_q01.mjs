import fs from 'fs';
import path from 'path';

const arabicRegex = /[\u0600-\u06FF]/;
const results = [];

function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.astro' && entry.name !== '.git') {
        scanDir(full);
      }
    } else if (/\.(astro|svelte|ts|js|md)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (arabicRegex.test(line)) {
          // Check if line or enclosing tag has lang or dir
          const hasLang = /lang=["']ar["']/i.test(line);
          const hasDir = /dir=["']rtl["']/i.test(line);
          results.push({
            file: full.replace(/\\/g, '/'),
            line: idx + 1,
            hasLang,
            hasDir,
            snippet: line.trim()
          });
        }
      });
    }
  }
}

scanDir('src');

console.log('=== Q-01 ARABIC CHARACTERS & ENCLOSING ATTRIBUTES ===');
console.log(`Total hits: ${results.length}\n`);
for (const r of results) {
  console.log(`${r.file}:${r.line}`);
  console.log(`  lang="ar": ${r.hasLang} | dir="rtl": ${r.hasDir}`);
  console.log(`  Snippet: ${r.snippet}\n`);
}
