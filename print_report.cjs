/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('import_counts.json', 'utf8'));

const buckets = {
  dead: [],
  global: [],
  shared: [],
  specific: []
};

for (const [comp, info] of Object.entries(data)) {
  const c = info.count;
  const compNorm = comp.replace(/\\\\/g, '/');
  if (c === 0) {
    buckets.dead.push(compNorm);
  } else if (c === 1) {
    const route = info.importingFiles[0].replace(/\\\\/g, '/');
    buckets.specific.push({ comp: compNorm, route });
  } else if (c === 2 || c === 3) {
    buckets.shared.push({ comp: compNorm, count: c });
  } else {
    buckets.global.push({ comp: compNorm, count: c });
  }
}

console.log('### Dead (0 Imports)');
buckets.dead.sort().forEach(c => console.log(`- \`${c}\``));

console.log('\n### Global Primitives (High Reuse)');
buckets.global.sort((a,b)=>b.count-a.count).forEach(item => console.log(`- \`${item.comp}\` (${item.count} imports)`));

console.log('\n### Shared Sections (2-3 Imports)');
buckets.shared.sort((a,b)=>b.count-a.count).forEach(item => console.log(`- \`${item.comp}\` (${item.count} imports)`));

console.log('\n### Page-Specific (1 Import)');
buckets.specific.sort((a,b)=>a.comp.localeCompare(b.comp)).forEach(item => console.log(`- \`${item.comp}\` (Used in: ${item.route})`));
