import fs from 'node:fs';
const D = 'docs/audit';
const MAP = { '✅':'DONE', '⚠':'PARTIAL', '❌':'MISSING', '➖':'NA', '❓':'UNVERIFIED' };
const files = fs.readdirSync(D).filter(f => /^0[1-4]-.+\.md$/.test(f)).sort();
const blank = () => ({ rows:0, DONE:0, PARTIAL:0, MISSING:0, NA:0, UNVERIFIED:0, NONE:0 });
const grand = blank();
const seen = new Map();
for (const f of files) {
  const c = blank();
  for (const line of fs.readFileSync(`${D}/${f}`, 'utf8').split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map(s => s.trim());
    const id = cells[1];
    if (!/^[A-Z]{1,3}-\d+$/.test(id)) continue;
    seen.set(id, (seen.get(id) || 0) + 1);
    c.rows++;
    const hit = cells.slice(4, 14).map(x => Object.keys(MAP).find(k => x.startsWith(k))).find(Boolean);
    c[hit ? MAP[hit] : 'NONE']++;
  }
  console.log(f, JSON.stringify(c));
  for (const k of Object.keys(c)) grand[k] += c[k];
}
console.log('TOTAL', JSON.stringify(grand));
console.log('DUPLICATE IDS', JSON.stringify([...seen].filter(([, n]) => n > 1).map(([id]) => id)));
