#!/usr/bin/env node
// summarize.mjs — parse Playwright JSON reporter output
// Usage: node summarize.mjs <json-file>
// Enforces <numbers_rule>:
// - total/pass/fail/inconclusive
// - assigns EVERY failure to a root-cause id via rule table (suite + normalized error / pattern)
// - unmatched failures print as UNEXPLAINED with project, URL and first 3 raw error lines
// - A run is reportable only when UNEXPLAINED=0 and root-cause counts sum to fail count.

import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node summarize.mjs <json-file>');
  process.exit(1);
}

const fileContent = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '');
const raw = JSON.parse(fileContent);

let totalTests = 0;
let pass = 0;
let fail = 0;
let inconclusive = 0;

// Detailed failure entries: { project, suite, title, errMsg, errKey, rawLines }
const failures = [];

function stripAnsi(str) {
  return (str || '').replace(/\u001b\[[0-9;]*m/g, '');
}

function normalizeError(msg) {
  if (!msg) return 'unknown error';
  const clean = stripAnsi(msg);
  const lines = clean.split('\n').map(s => s.trim()).filter(Boolean);
  const first = lines[0] || '';
  return first
    .replace(/\(.*?\)/g, '')         // strip parenthetical file refs
    .replace(/:\d+:\d+/g, '')        // strip line:col
    .replace(/https?:\/\/[^\s]+/g, '<URL>') // strip URLs
    .trim()
    .slice(0, 120);
}

function walkSuites(suites, parentTitle = '', project = '') {
  for (const suite of suites || []) {
    const currentProject = suite.project?.name || project || '';
    const suiteTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;

    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        totalTests++;
        const res = test.results?.[0];
        const status = res?.status || test.status || 'unknown';
        if (status === 'passed') {
          pass++;
        } else if (status === 'skipped' || status === 'pending') {
          inconclusive++;
        } else {
          fail++;
          const result = test.results?.[0];
          const rawMsg = result?.error?.message || result?.errors?.[0]?.message || 'No error message';
          const errMsg = stripAnsi(rawMsg);
          const errKey = normalizeError(rawMsg);
          const rawLines = errMsg.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3);
          failures.push({
            project: currentProject || test.projectName || 'default',
            suite: suiteTitle,
            title: spec.title || test.title || '',
            errMsg,
            errKey,
            rawLines,
          });
        }
      }
    }

    walkSuites(suite.suites, suiteTitle, currentProject);
  }
}

walkSuites(raw.suites);

// ── Root-Cause Classification Rules ──────────────────────────────────────────
// Rule table: array of { id, match: (f) => boolean, description }
const ROOT_CAUSE_RULES = [
  {
    id: 'STICKY_HEADER_INTENT_PAGE',
    description: 'Intent landing page uses custom hero navigation, exempt from sticky-header wrapper',
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && (f.errMsg.includes('No sticky header on /quran-classes') || f.errMsg.includes('No sticky header on /quran-teacher')),
  },
  {
    id: 'STATUS_500_PRODUCT_BUG',
    description: 'GET /500 returned 200 instead of 500 (prerender=true in 500.astro)',
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && f.errMsg.includes('Unexpected status on /500'),
  },
  {
    id: 'CONSOLE_NON_HTML_MIME',
    description: 'Console errors checked on non-HTML MIME routes (/robots.txt, /rss.xml)',
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && (f.errMsg.includes('on /robots.txt') || f.errMsg.includes('on /rss.xml')),
  },
  {
    id: 'A1_STATUS_500_CONSOLE_ERROR',
    description: 'Browser console log for HTTP 500 on /500 error route',
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && f.errMsg.includes('Console errors detected on /500'),
  },
  {
    id: 'CSP_REPORT_ONLY_UPGRADE_INSECURE_REQUESTS',
    description: "Chromium console error: 'upgrade-insecure-requests' ignored in CSP Report-Only policy",
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && f.errMsg.includes('upgrade-insecure-requests'),
  },
  {
    id: 'CSP_REPORT_ONLY_POLICY_LOG',
    description: 'Browser console warning for Report-Only CSP policy directives',
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && (f.errMsg.includes('Report-Only') || f.errMsg.includes('Report Only') || f.errMsg.includes('Console errors detected on')),
  },
  {
    id: 'FAQ_DUPLICATE_DOM_IDS',
    description: 'Multiple FAQAccordion instances render identical id="faq" in FaqTabs.astro',
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && f.errMsg.includes('Duplicate DOM IDs on /faq'),
  },
  {
    id: 'A1_TARGET_BLANK_MISSING_NOOPENER',
    description: 'target="_blank" link missing rel="noopener" attribute',
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && (f.errMsg.includes('missing noopener') || (f.errMsg.includes('toContain') && f.rawLines.some(l => l.includes('Received has value: null')))),
  },
  {
    id: 'A1_FORBIDDEN_CONTENT_OR_FAIL',
    description: 'Crawl integrity assertion mismatch',
    match: (f) => (f.suite.includes('A1:') || f.suite.includes('A1 ')) && f.errMsg.includes('expect(received).toContain'),
  },
  {
    id: 'A2_FAQ_SCHEMA_MISMATCH',
    description: 'FAQPage JSON-LD questions mismatch visible accordions on /faq',
    match: (f) => f.suite.includes('A2') && f.errMsg.includes('FAQ schema question'),
  },
  {
    id: 'A2_404_NOINDEX_STATUS',
    description: '404 status/noindex assertion mismatch in A2 SEO test',
    match: (f) => f.suite.includes('A2') && f.errMsg.includes('404'),
  },
  {
    id: 'A4_LAYOUT_TIMEOUT',
    description: 'Layout & viewport multi-page screenshot test exceeded 60s timeout',
    match: (f) => f.suite.includes('A4') && f.errMsg.includes('Test timeout of'),
  },
  {
    id: 'A4_CONTAINER_METRICS',
    description: 'Container computed maxWidth or paddingLeft differs from expected global.css rule',
    match: (f) => f.suite.includes('A4') && (f.errMsg.includes('Unexpected container paddingLeft') || f.errMsg.includes('Unexpected container maxWidth') || f.errMsg.includes('Horizontal overflow')),
  },
  {
    id: 'A6_BANNER_LOCATOR_STRICT_MODE',
    description: 'A6 STRICT test locator resolved to multiple elements (strict mode violation)',
    match: (f) => f.suite.includes('A6') && (f.errMsg.includes('strict mode violation') || (f.title.includes('STRICT') && f.errMsg.includes('toBeVisible'))),
  },
  {
    id: 'A6_NONE_DATALAYER_PARTYTOWN',
    description: 'A6 NONE test looked in window.dataLayer instead of Partytown _ptf forwarder',
    match: (f) => f.suite.includes('A6') && f.title.includes('NONE') && (f.errMsg.includes('toBeDefined') || f.errMsg.includes('Test timeout')),
  },
  {
    id: 'A6_STRICT_GTM_NETWORK_REQUEST',
    description: 'GTM script request emitted by Partytown before consent in STRICT mode',
    match: (f) => f.suite.includes('A6') && (f.errMsg.includes('Unexpected analytics/GTM network requests') || f.errMsg.includes('googletagmanager.com')),
  },
  {
    id: 'HARNESS_BROWSER_LAUNCH_TIMEOUT',
    description: 'Playwright browserType.launch or network I/O suspended during Windows execution',
    match: (f) => f.errMsg.includes('browserType.launch: Timeout') || f.errMsg.includes('ERR_NETWORK_IO_SUSPENDED') || f.errMsg.includes('Could not resolve hostname') || f.errMsg.includes('setting up "page"'),
  },
  {
    id: 'A6_ATTRIBUTION_PARAMS_DROPPED',
    description: 'Attribution params dropped between intent page CTA and signup form',
    match: (f) => f.suite.includes('A6') && f.errMsg.includes('Attribution parameters should be carried'),
  },
  {
    id: 'A7_BASE_PRICE_MISMATCH',
    description: 'Tuition page missing base price or currency symbol expected by pricing oracle',
    match: (f) => f.suite.includes('A7') && (f.errMsg.includes('Page missing base price') || f.errMsg.includes('Page missing currency symbol')),
  },
  {
    id: 'A7_CALCULATOR_CTA',
    description: 'Calculator selection CTA href verification mismatch',
    match: (f) => f.suite.includes('A7') && f.errMsg.includes('getting-started/signup'),
  },
  {
    id: 'A8_BLOG_EMPTY_SECTION',
    description: 'Empty section(s) detected on /blog (e.g. cv-section)',
    match: (f) => f.suite.includes('A8') && f.errMsg.includes('Empty section(s) detected on /blog'),
  },
  {
    id: 'A8_IMPRESSUM_FORBIDDEN_TOKEN',
    description: 'Forbidden content token found on /legal/impressum',
    match: (f) => f.suite.includes('A8') && f.errMsg.includes('Forbidden content token'),
  },
  {
    id: 'A9_AXE_SERIOUS_CRITICAL',
    description: 'Axe-core accessibility serious or critical violation',
    match: (f) => f.suite.includes('A9') && f.errMsg.includes('Axe-core serious/critical violations'),
  },
  {
    id: 'A10_TURNSTILE_CONTRACT',
    description: 'Client form contracts / Turnstile parity failure',
    match: (f) => f.suite.includes('A10'),
  },
];

// Assign each failure to root cause
const rootCauseCounts = new Map();
const unexplained = [];

for (const f of failures) {
  let matchedRule = null;
  for (const rule of ROOT_CAUSE_RULES) {
    if (rule.match(f)) {
      matchedRule = rule;
      break;
    }
  }

  if (matchedRule) {
    const current = rootCauseCounts.get(matchedRule.id) || { count: 0, description: matchedRule.description, examples: [] };
    current.count++;
    if (current.examples.length < 3) {
      current.examples.push(`${f.project} > ${f.title}`);
    }
    rootCauseCounts.set(matchedRule.id, current);
  } else {
    unexplained.push(f);
  }
}

// ── Print Report ─────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════');
console.log('  PLAYWRIGHT RUN SUMMARY (WITH ROOT-CAUSE ATTRIBUTION)');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  file         : ${file}`);
console.log(`  tests (total): ${totalTests}`);
console.log(`  pass         : ${pass}`);
console.log(`  fail         : ${fail}`);
console.log(`  inconclusive : ${inconclusive}`);
console.log(`  unexplained  : ${unexplained.length}`);
console.log('══════════════════════════════════════════════════════════════\n');

if (rootCauseCounts.size > 0) {
  console.log('  ROOT-CAUSE BREAKDOWN:\n');
  let sumRootCauses = 0;
  for (const [id, data] of rootCauseCounts.entries()) {
    sumRootCauses += data.count;
    console.log(`  [×${data.count}] ${id}`);
    console.log(`       Desc: ${data.description}`);
    console.log(`       Ex:   ${data.examples.slice(0, 2).join(' | ')}`);
  }
  console.log(`\n  Sum of root causes: ${sumRootCauses} (Must equal fail: ${fail})`);
}

if (unexplained.length > 0) {
  console.log('\n  ❌ UNEXPLAINED FAILURES DETECTED:');
  for (const u of unexplained) {
    console.log(`  ------------------------------------------------------------`);
    console.log(`  Project: ${u.project}`);
    console.log(`  Suite:   ${u.suite}`);
    console.log(`  URL/Spec: ${u.title}`);
    console.log(`  Raw lines:`);
    u.rawLines.forEach(l => console.log(`    ${l}`));
  }
  console.log('  ------------------------------------------------------------\n');
  console.log(`  ❌ NOT REPORTABLE: UNEXPLAINED=${unexplained.length} (Must be 0).\n`);
  process.exitCode = 1;
} else if (fail > 0) {
  let sum = 0;
  for (const d of rootCauseCounts.values()) sum += d.count;
  if (sum === fail) {
    console.log(`\n  ✅ REPORTABLE: UNEXPLAINED=0 and root-cause sum (${sum}) == fail (${fail}).\n`);
  } else {
    console.log(`\n  ❌ NOT REPORTABLE: root-cause sum (${sum}) != fail (${fail}).\n`);
    process.exitCode = 1;
  }
} else {
  console.log('  ✅ Clean run: 0 failures, 0 unexplained.\n');
}
