const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/legal/privacy.astro',
  'src/pages/legal/terms.astro',
  'src/pages/legal/refund.astro',
  'src/pages/legal/cookies.astro',
  'src/pages/legal/impressum.astro'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(/bg-\[#fefdf9\]/g, 'bg-cream-50');
  content = content.replace(/text-\[#022c22\]/g, 'text-emerald-950');
  content = content.replace(/text-\[#047857\]/g, 'text-emerald-700');
  content = content.replace(/text-\[#064e3b\]/g, 'text-emerald-900');
  content = content.replace(/border-\[#d1fae5\]/g, 'border-emerald-100');
  content = content.replace(/border-\[#047857\]/g, 'border-emerald-700');
  content = content.replace(/bg-\[#047857\]/g, 'bg-emerald-700');
  content = content.replace(/selection:bg-\[#d1fae5\]/g, 'selection:bg-emerald-100');
  content = content.replace(/selection:text-\[#064e3b\]/g, 'selection:text-emerald-900');
  
  content = content.replace(/max-w-4xl mx-auto px-4 sm:px-6/g, 'quranific-container');
  content = content.replace(/max-w-5xl mx-auto/g, 'quranific-container');
  
  fs.writeFileSync(fullPath, content);
});
console.log('Colors and containers purged');
