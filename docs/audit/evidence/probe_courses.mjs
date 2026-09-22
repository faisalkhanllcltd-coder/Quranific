import fs from 'fs';

const coursesFile = 'src/constants/courses.ts';
if (fs.existsSync(coursesFile)) {
  const content = fs.readFileSync(coursesFile, 'utf8');
  const slugMatches = Array.from(content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)).map(m => m[1]);
  console.log('=== COURSES PROBE ===');
  console.log('Defined course slugs in src/constants/courses.ts:');
  console.log(JSON.stringify(slugMatches, null, 2));
} else {
  console.log('src/constants/courses.ts does not exist');
}
