import fs from 'fs';

const pages = [
  'src/pages/[intent]/for-kids.astro',
  'src/pages/[intent]/for-adults.astro',
  'src/pages/[intent]/for-women.astro',
  'src/pages/courses/index.astro',
  'src/pages/courses/[slug].astro'
];

console.log('=== Q-12 HEAD PROPS AUDIT ===\n');
for (const p of pages) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    const titleMatch = content.match(/title\s*[:=]\s*["'`]([^"'`]+)["'`]/) ||
                       content.match(/title\s*[:=]\s*\{([^}]+)\}/);
    const descMatch = content.match(/description\s*[:=]\s*["'`]([^"'`]+)["'`]/) ||
                      content.match(/description\s*[:=]\s*\{([^}]+)\}/);
    const canonMatch = content.match(/canonical\s*[:=]\s*["'`]([^"'`]+)["'`]/) ||
                       content.match(/canonical\s*[:=]\s*\{([^}]+)\}/) ||
                       content.match(/canonicalURL\s*[:=]\s*["'`]([^"'`]+)["'`]/);
    
    console.log(`${p}:`);
    console.log(`  Title: ${titleMatch ? titleMatch[1] : 'NOT FOUND'}`);
    console.log(`  Description: ${descMatch ? descMatch[1] : 'NOT FOUND'}`);
    console.log(`  Canonical: ${canonMatch ? canonMatch[1] : 'NOT FOUND'}\n`);
  } else {
    console.log(`${p}: FILE DOES NOT EXIST\n`);
  }
}
