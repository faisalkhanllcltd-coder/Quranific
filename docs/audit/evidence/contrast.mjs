import fs from 'fs';
import path from 'path';

// Relative luminance formula per WCAG 2.2
function getLuminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16) / 255);
  const [r, g, b] = rgb.map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Map tokens from global.css
const colors = {
  'white': '#ffffff',
  'cream-50': '#fefdf9',
  'cream-100': '#fdf9ed',
  'emerald-50': '#ecfdf5',
  'emerald-100': '#d1fae5',
  'emerald-200': '#a7f3d0',
  'emerald-500': '#10b981',
  'emerald-600': '#059669',
  'emerald-700': '#047857',
  'emerald-800': '#065f46',
  'emerald-900': '#064e3b',
  'emerald-950': '#022c22',
  'emerald-ink': '#021f18',
  'gold-50': '#fffbeb',
  'gold-100': '#fef3c7',
  'gold-500': '#f59e0b',
  'gold-600': '#d97706',
  'gold-700': '#b45309',
  'amber-600': '#d97706', // default Tailwind matches gold-600
  'amber-700': '#b45309',
  'red-600': '#dc2626',
  'red-700': '#b91c1c',
  'orange-700': '#c2410c',
  'purple-700': '#7e22ce'
};

// Find all text-* and bg-* usages in src
const srcFiles = [];
function findFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) findFiles(fullPath);
    else if (/\.(astro|svelte|css)$/.test(entry.name)) srcFiles.push(fullPath);
  }
}
findFiles('src');

const pairs = [
  { text: 'emerald-700', bg: 'white', context: 'Buttons, links, highlights on white' },
  { text: 'emerald-700', bg: 'cream-50', context: 'Body links on cream-50 background' },
  { text: 'emerald-800', bg: 'white', context: 'Headings, badges on white' },
  { text: 'emerald-900', bg: 'white', context: 'Primary headings on white' },
  { text: 'emerald-950', bg: 'cream-50', context: 'Body text on default background (global.css)' },
  { text: 'emerald-950', bg: 'white', context: 'Body text on white cards' },
  { text: 'emerald-ink', bg: 'white', context: 'High contrast text on white' },
  { text: 'emerald-ink', bg: 'cream-50', context: 'High contrast text on cream-50' },
  { text: 'gold-600', bg: 'white', context: 'Gold badges/accents on white' },
  { text: 'gold-700', bg: 'white', context: 'Dark gold accents on white' },
  { text: 'amber-600', bg: 'white', context: 'AboutTeam role/accent (uncommitted worktree)' },
  { text: 'amber-700', bg: 'white', context: 'AboutTeam recommended accessible replacement' },
  { text: 'red-600', bg: 'white', context: 'Form error messages on white' },
  { text: 'red-700', bg: 'white', context: 'Form error messages on white (accessible)' }
];

console.log('=== ACTUAL TEXT / BACKGROUND CONTRAST PAIRS ===\n');
for (const p of pairs) {
  const textHex = colors[p.text];
  const bgHex = colors[p.bg];
  const ratio = getContrast(textHex, bgHex);
  const passAA_normal = ratio >= 4.5;
  const passAA_large = ratio >= 3.0;
  console.log(`${p.text} (${textHex}) on ${p.bg} (${bgHex}):`);
  console.log(`  Ratio: ${ratio.toFixed(2)}:1`);
  console.log(`  WCAG AA Normal Text (>=4.5:1): ${passAA_normal ? 'PASS' : 'FAIL'}`);
  console.log(`  WCAG AA Large Text (>=3.0:1):  ${passAA_large ? 'PASS' : 'FAIL'}`);
  console.log(`  Context: ${p.context}\n`);
}
