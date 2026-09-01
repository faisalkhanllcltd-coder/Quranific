const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const pagesDir = path.join(srcDir, 'pages');
const publicDir = path.join(rootDir, 'public');

// 1. Build route map
const routes = new Set();
const dynamicRoutes = [];
const publicFiles = new Set();

function walkPublic(dir, basePath = '') {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkPublic(fullPath, `${basePath}/${file}`);
    } else {
      publicFiles.add(`${basePath}/${file}`);
    }
  }
}
walkPublic(publicDir);

function walkPages(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.startsWith('_')) continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkPages(fullPath, `${basePath}/${file}`);
    } else if (file.endsWith('.astro') || file.endsWith('.ts') || file.endsWith('.svelte')) {
      let route = `${basePath}/${file}`.replace(/\.(astro|ts|svelte)$/, '');
      if (route.endsWith('/index')) {
        route = route.slice(0, -6);
      }
      if (route === '') route = '/';
      
      if (route.includes('[')) {
        let regexStr = route.replace(/\[\.\.\.[^\]]+\]/g, '.*').replace(/\[[^\]]+\]/g, '[^/]+');
        dynamicRoutes.push(new RegExp(`^${regexStr}$`));
      } else {
        routes.add(route);
        if (route !== '/') {
            routes.add(route + '/');
        }
      }
    }
  }
}
walkPages(pagesDir);
routes.add('/');

// 2. Find links and trace imports
const links = [];
const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
const fileImports = new Map();
const allSourceFiles = [];

function walkFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkFiles(fullPath);
    } else if (/\.(astro|svelte|tsx|ts|js|jsx|md|mdx)$/.test(file)) {
      allSourceFiles.push(fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Extract hrefs
      const hrefRegex = /href=["']([^"']+)["']/g;
      let match;
      while ((match = hrefRegex.exec(content)) !== null) {
        links.push({ file: fullPath.replace(rootDir, ''), href: match[1] });
      }
      // Check src= (images, etc)
      const srcRegex = /src=["']([^"']+)["']/g;
      while ((match = srcRegex.exec(content)) !== null) {
        links.push({ file: fullPath.replace(rootDir, ''), href: match[1] });
      }

      const redirectRegex = /Astro\.redirect\(['"]([^'"]+)['"]/g;
      while ((match = redirectRegex.exec(content)) !== null) {
        links.push({ file: fullPath.replace(rootDir, ''), href: match[1] });
      }

      const imports = [];
      while ((match = importRegex.exec(content)) !== null) {
         imports.push(match[1]);
      }
      while ((match = dynamicImportRegex.exec(content)) !== null) {
         imports.push(match[1]);
      }
      fileImports.set(fullPath.replace(rootDir, ''), imports);
    }
  }
}
walkFiles(srcDir);

// 3. Verify links
const brokenLinks = [];
const assetErrors = [];
const routeHitCount = new Map();
for (const r of routes) routeHitCount.set(r, 0);

for (const link of links) {
  let { href, file } = link;
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    continue;
  }
  if (href.startsWith('{') || href.startsWith('$')) continue; // Template vars in Svelte/Astro
  
  href = href.split('#')[0].split('?')[0];
  if (!href) continue;

  if (href.startsWith('/')) {
    if (publicFiles.has(href)) {
        continue; // valid asset
    }
    
    // Check if it's an asset that doesn't exist
    if (href.includes('.') && !href.endsWith('.html')) {
        assetErrors.push({ file, href });
        continue;
    }

    if (routes.has(href)) {
        routeHitCount.set(href, routeHitCount.get(href) + 1);
    } else {
        const isDynamic = dynamicRoutes.some(r => r.test(href));
        if (isDynamic) {
             // We can't strictly count dynamic route hits this way easily, assume they are hit.
        } else {
           brokenLinks.push({ file, href });
        }
    }
  }
}

// 4. Orphaned pages
const orphanedPages = [];
for (const [route, hits] of routeHitCount.entries()) {
  if (hits === 0 && !route.endsWith('/')) {
     if (route === '/' || route === '/404' || route === '/500' || route.startsWith('/api') || route === '/llms.txt' || route === '/robots.txt' || route === '/rss.xml') continue;
     orphanedPages.push(route);
  }
}

// 5. Dead components/utilities
const importedFiles = new Set();
const fileContentMap = new Map();
for (const file of allSourceFiles) {
  fileContentMap.set(file, fs.readFileSync(file, 'utf8'));
}

function traceImports(content, currentFile) {
  const importRegex = /(?:import|export)\s+.*?(?:from\s+)?['"]([^'"]+)['"]/g;
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
        
        const exts = ['', '.astro', '.svelte', '.ts', '.tsx', '/index.astro', '/index.ts'];
        let found = false;
        for (const ext of exts) {
            if (fileContentMap.has(resolvedPath + ext)) {
                importedFiles.add(resolvedPath + ext);
                found = true;
                break;
            }
        }
    }
  }
}

const entryPoints = allSourceFiles.filter(f => f.includes('\\pages\\') || f.includes('\\layouts\\') || f.includes('\\middleware.ts') || f.includes('\\env.ts'));
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

const deadFiles = allSourceFiles.filter(f => !importedFiles.has(f) && !f.endsWith('d.ts') && !f.includes('\\content.config.ts'));
const deadComponents = deadFiles.filter(f => f.includes('\\components\\') || f.endsWith('.astro') || f.endsWith('.svelte'));
const unusedUtils = deadFiles.filter(f => !f.includes('\\components\\') && !f.endsWith('.astro') && !f.endsWith('.svelte'));


// --- REPORT GENERATION ---
console.log('## 1. 🚨 Broken Links & 404 Risks\n');
if (brokenLinks.length === 0) console.log('✅ No broken links found.\n');
else {
    brokenLinks.forEach(b => console.log(`- **${b.file}** points to \`${b.href}\` which does not exist.`));
    console.log('');
}

console.log('## 2. 🪦 Dead Components\n');
if (deadComponents.length === 0) console.log('✅ No dead components found.\n');
else {
    deadComponents.forEach(c => console.log(`- \`${c.replace(rootDir, '')}\``));
    console.log('');
}

console.log('## 3. 🏝️ Orphaned Pages\n');
if (orphanedPages.length === 0) console.log('✅ No orphaned pages found.\n');
else {
    orphanedPages.forEach(p => console.log(`- \`${p}\` is not linked to anywhere in the application.`));
    console.log('');
}

console.log('## 4. 👻 Unused Utilities & Data\n');
if (unusedUtils.length === 0) console.log('✅ No unused utilities found.\n');
else {
    unusedUtils.forEach(u => console.log(`- \`${u.replace(rootDir, '')}\``));
    console.log('');
}

console.log('## 5. ⚠️ Asset Reference Errors\n');
if (assetErrors.length === 0) console.log('✅ No asset reference errors found.\n');
else {
    assetErrors.forEach(a => console.log(`- **${a.file}** references missing asset \`${a.href}\`.`));
    console.log('');
}

