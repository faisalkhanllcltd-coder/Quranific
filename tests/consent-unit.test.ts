// tests/consent-unit.test.ts
// Gate 2 unit test — covers all 7 required cases from the directive.
// Run with: npx tsx tests/consent-unit.test.ts
// No test framework dependency — plain assertions, exits 1 on failure.

import { getConsentBucket } from '../src/lib/consent.ts';

type Case = {
  label: string;
  country: string | null | undefined;
  region: string | null | undefined;
  gpc: boolean;
  expected: 'STRICT' | 'MODERATE' | 'NONE';
};

const cases: Case[] = [
  // 1. EU country → STRICT
  { label: 'EU (DE)', country: 'DE', region: null, gpc: false, expected: 'STRICT' },
  { label: 'EU (FR)', country: 'FR', region: null, gpc: false, expected: 'STRICT' },
  { label: 'UK (GB)', country: 'GB', region: null, gpc: false, expected: 'STRICT' },
  { label: 'CH (Swiss DPA)', country: 'CH', region: null, gpc: false, expected: 'STRICT' },

  // 2. US → MODERATE
  { label: 'US', country: 'US', region: null, gpc: false, expected: 'MODERATE' },

  // 3. CA-QC → STRICT (Quebec Law 25)
  { label: 'CA-QC', country: 'CA', region: 'QC', gpc: false, expected: 'STRICT' },

  // 4. CA-ON → MODERATE (non-Quebec Canada)
  { label: 'CA-ON', country: 'CA', region: 'ON', gpc: false, expected: 'MODERATE' },

  // 5. Unknown country → STRICT (fail-closed)
  { label: 'Unknown country (null)', country: null, region: null, gpc: false, expected: 'STRICT' },
  { label: 'Unknown country (empty)', country: '', region: null, gpc: false, expected: 'STRICT' },
  {
    label: 'Unknown country ("Unknown")',
    country: 'Unknown',
    region: null,
    gpc: false,
    expected: 'STRICT',
  },

  // 6. GPC present + NONE-bucket country → STRICT (GPC overrides)
  {
    label: 'GPC + PK (NONE-bucket country)',
    country: 'PK',
    region: null,
    gpc: true,
    expected: 'STRICT',
  },
  {
    label: 'GPC + AE (NONE-bucket country)',
    country: 'AE',
    region: null,
    gpc: true,
    expected: 'STRICT',
  },

  // 7. GPC present + STRICT-bucket country → STRICT (same result, different path)
  {
    label: 'GPC + DE (STRICT-bucket country)',
    country: 'DE',
    region: null,
    gpc: true,
    expected: 'STRICT',
  },

  // 8. CA unknown region → STRICT (fail-closed per directive)
  { label: 'CA unknown region', country: 'CA', region: '', gpc: false, expected: 'STRICT' },
  { label: 'CA null region', country: 'CA', region: null, gpc: false, expected: 'STRICT' },

  // 9. AU → MODERATE
  { label: 'AU', country: 'AU', region: null, gpc: false, expected: 'MODERATE' },

  // 10. PK (rest of world) → NONE
  { label: 'PK (rest of world)', country: 'PK', region: null, gpc: false, expected: 'NONE' },

  // 11. GPC + MODERATE-bucket country → STRICT
  {
    label: 'GPC + US (MODERATE-bucket country)',
    country: 'US',
    region: null,
    gpc: true,
    expected: 'STRICT',
  },

  // 12. EEA (Norway) → STRICT
  { label: 'NO (EEA)', country: 'NO', region: null, gpc: false, expected: 'STRICT' },
];

let passed = 0;
let failed = 0;

for (const c of cases) {
  const result = getConsentBucket(c.country, c.region, c.gpc);
  const ok = result === c.expected;
  const status = ok ? '✅' : '❌';
  console.log(
    `${status} [${c.label}] country=${c.country ?? 'null'} region=${c.region ?? 'null'} gpc=${c.gpc} → got=${result} expected=${c.expected}`
  );
  if (ok) passed++;
  else failed++;
}

console.log(`\n${passed} passed, ${failed} failed out of ${cases.length} cases.`);
if (failed > 0) process.exit(1);
