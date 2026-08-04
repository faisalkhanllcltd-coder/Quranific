const fs = require('fs');
let file = fs.readFileSync('src/components/sections/FAQAccordion.astro', 'utf8');

if (!file.includes('import Accordion')) {
  file = file.replace('---', '---\nimport Accordion from \'../ui/Accordion.astro\';');
}

const divStart = file.indexOf('<div class="space-y-4">');
const startReplace = file.indexOf('{', divStart);
const endReplace = file.indexOf('</div>', divStart);
if (startReplace > -1 && endReplace > startReplace) {
  file = file.substring(0, startReplace) + '<Accordion questions={questions} />\n      ' + file.substring(endReplace);
}

const scriptStart = file.indexOf('<script>');
if (scriptStart > -1) {
  file = file.substring(0, scriptStart).trim() + '\n';
}

fs.writeFileSync('src/components/sections/FAQAccordion.astro', file, 'utf8');
console.log('FAQAccordion refactored.');
