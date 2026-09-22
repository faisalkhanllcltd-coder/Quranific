import { execSync } from 'child_process';
import fs from 'fs';

function runAudit(cmd) {
  try {
    const stdout = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return JSON.parse(stdout);
  } catch (err) {
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch (e) {
        console.error('Failed to parse stdout:', err.stdout);
      }
    }
    throw err;
  }
}

const auditAll = runAudit('npm audit --json');
const auditProd = runAudit('npm audit --omit=dev --json');

fs.writeFileSync('docs/audit/evidence/audit_all.json', JSON.stringify(auditAll, null, 2));
fs.writeFileSync('docs/audit/evidence/audit_prod.json', JSON.stringify(auditProd, null, 2));

console.log('--- ALL VULNERABILITIES ---');
console.log(JSON.stringify(auditAll.metadata.vulnerabilities));
console.log('--- PROD VULNERABILITIES ---');
console.log(JSON.stringify(auditProd.metadata.vulnerabilities));

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = pkg.dependencies || {};
const devDeps = pkg.devDependencies || {};

const rows = [];
for (const [name, data] of Object.entries(auditAll.vulnerabilities)) {
  const inDeps = name in deps;
  const inDev = name in devDeps;
  const location = inDeps ? 'dependencies' : (inDev ? 'devDependencies' : 'transitive');
  const directOrTrans = data.isDirect ? 'direct' : 'transitive';
  
  // extract via details
  const viaList = Array.isArray(data.via) ? data.via : [data.via];
  const ghsas = [];
  for (const v of viaList) {
    if (typeof v === 'object' && v.url) {
      ghsas.push({
        id: v.url.split('/').pop(),
        url: v.url,
        title: v.title,
        severity: v.severity,
        range: v.range
      });
    } else if (typeof v === 'string') {
      ghsas.push({ id: `via ${v}`, url: '', title: `via ${v}`, severity: data.severity, range: data.range });
    }
  }

  rows.push({
    name,
    severity: data.severity,
    range: data.range,
    fixAvailable: typeof data.fixAvailable === 'object' ? data.fixAvailable.name : !!data.fixAvailable,
    directOrTrans,
    location,
    ghsas
  });
}

console.log('--- DETAILED TABLE ---');
for (const r of rows) {
  console.log(`Package: ${r.name} | Severity: ${r.severity} | Range: ${r.range} | Fix: ${r.fixAvailable} | Direct: ${r.directOrTrans} | Location: ${r.location}`);
  for (const g of r.ghsas) {
    console.log(`  -> ${g.id} (${g.severity}) - ${g.title} [${g.range}] ${g.url}`);
  }
}

fs.writeFileSync('docs/audit/evidence/audit_table.json', JSON.stringify(rows, null, 2));
