import fs from 'fs';

const log = fs.readFileSync('C:/Users/pak/.gemini/antigravity-ide/brain/1adecd4c-163e-44c3-b6c9-61491c865e96/.system_generated/tasks/task-1269.log', 'utf8');
const lines = log.split('\n');

const results = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const match = line.match(/^c:\\Users\\pak\\AppData\\Local\\Temp\\quranific-audit-head\\([^\:]+):(\d+):(\d+)/i);
  if (match) {
    const file = match[1].replace(/\\/g, '/');
    const lineNum = match[2];
    const nextLine = (lines[i+1] || '').trim();
    let sev = 'info';
    let msg = nextLine;
    if (nextLine.startsWith('Error:')) {
      sev = 'error';
      msg = nextLine.replace(/^Error:\s*/, '');
    } else if (nextLine.startsWith('Warn:')) {
      sev = 'warning';
      msg = nextLine.replace(/^Warn:\s*/, '');
    }
    results.push(`${file}:${lineNum}:${sev}:${msg}`);
  }
}

console.log(`Found ${results.length} diagnostics`);
console.log(results.join('\n'));
fs.writeFileSync('docs/audit/evidence/svelte_check_diagnostics.txt', results.join('\n'));
