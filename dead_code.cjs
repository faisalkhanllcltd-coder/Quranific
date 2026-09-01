const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(astro|svelte|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(srcDir);
const importedFiles = new Set();
const fileContentMap = new Map();

for (const file of allFiles) {
  fileContentMap.set(file, fs.readFileSync(file, 'utf8'));
}

// Very basic import tracing
function traceImports(content, currentFile) {
  const importRegex = /import\s+.*?(?:from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[1];
    if (importPath.startsWith('.') || importPath.startsWith('~/') || importPath.startsWith('@/')) {
        let resolvedPath = '';
        if (importPath.startsWith('~/') || importPath.startsWith('@/')) {
            resolvedPath = path.join(srcDir, importPath.replace(/^~\/|^@\//, ''));
        } else {
            resolvedPath = path.join(path.dirname(currentFile), importPath);
        }
        
        // try to find the exact file
        const exts = ['', '.astro', '.svelte', '.ts', '.tsx', '/index.astro', '/index.ts'];
        let found = false;
        for (const ext of exts) {
            if (fileContentMap.has(resolvedPath + ext)) {
                importedFiles.add(resolvedPath + ext);
                found = true;
                break;
            }
        }
        if (!found) {
           // Maybe it's a dynamic import or glob?
        }
    }
  }
}

// Start tracing from pages and layouts
const entryPoints = allFiles.filter(f => f.includes('\\pages\\') || f.includes('\\layouts\\') || f.includes('\\middleware.ts') || f.includes('\\env.ts'));
entryPoints.forEach(f => importedFiles.add(f));

let previousSize = 0;
while (importedFiles.size > previousSize) {
    previousSize = importedFiles.size;
    for (const file of Array.from(importedFiles)) {
        if (fileContentMap.has(file)) {
            traceImports(fileContentMap.get(file), file);
        }
    }
}

const deadFiles = allFiles.filter(f => !importedFiles.has(f) && !f.endsWith('d.ts'));

console.log('--- DEAD FILES ---');
deadFiles.forEach(f => console.log(f.replace(__dirname, '')));
