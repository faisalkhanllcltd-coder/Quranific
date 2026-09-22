import fs from 'fs';
import path from 'path';

const waRegex = /923112|wa\.me|api\.whatsapp\.com/i;
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
        if (waRegex.test(line)) {
          const usesSite = /SITE\.(whatsapp|phone)/i.test(line);
          const isHelper = /helpers\.ts/i.test(full);
          const isDomQuery = /querySelector|addEventListener/i.test(line);
          let type = 'Hardcoded';
          if (usesSite) type = 'SITE reference';
          else if (isHelper) type = 'Helper definition';
          else if (isDomQuery) type = 'DOM event listener';

          results.push({
            file: full.replace(/\\/g, '/'),
            line: idx + 1,
            type,
            snippet: line.trim()
          });
        }
      });
    }
  }
}

scanDir('src');

console.log('=== Q-05 WHATSAPP USAGE AUDIT ===');
console.log(`Total occurrences: ${results.length}\n`);
for (const r of results) {
  console.log(`${r.file}:${r.line} [${r.type}]`);
  console.log(`  Snippet: ${r.snippet}\n`);
}
