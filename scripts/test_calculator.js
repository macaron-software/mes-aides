#!/usr/bin/env node
/**
 * scripts/test_calculator.js
 * Unit tests for eu-simulator.js eligibility engine.
 *
 * Run: node scripts/test_calculator.js
 *
 * Income is passed in smallest currency unit (centimes/cents/øre):
 *   60000 → 600 EUR/USD/CAD etc.
 *   0     → 0 (no income)
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* ── Browser API mocks ──────────────────────────────────────────────────── */
global.fetch = async (url) => {
  const match = url.match(/\/data\/aids_(\w+)\.json/);
  if (!match) throw new Error(`Unexpected fetch URL: ${url}`);
  const filePath = path.join(ROOT, 'data', `aids_${match[1]}.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Data file not found: ${filePath}`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return { ok: true, json: async () => data };
};
global.URLSearchParams = require('url').URLSearchParams;

/* ── Load simulator (uses module.exports in Node) ───────────────────────── */
const { EUSimulator, formatAmount } = require(path.join(ROOT, 'web/js/eu-simulator.js'));

/* ── Test scenarios ─────────────────────────────────────────────────────── */
/**
 * income: in centimes of local currency (100 centimes = 1 unit)
 *   0      → no income
 *   60000  → 600 EUR
 *   250000 → 2500 EUR
 *   100000 → 1000 CAD
 *
 * expect_aids         → ALL listed IDs must appear in results
 * expect_aids_contain → AT LEAST ONE listed ID must appear in results
 * expect_not          → NONE of these IDs may appear in results
 */
const SCENARIOS = [
  {
    cc: 'de', income: 0, age: 35, situation: 'single', employment: 'unemployed', housing: 'rented',
    expect_aids: ['de-buergergeld'],
    expect_not:  [],
    note: 'DE: unemployed single → Bürgergeld (income_below_threshold + age_15_65)'
  },
  {
    cc: 'de', income: 250000, age: 30, situation: 'family', employment: 'employed', housing: 'rented',
    expect_aids: ['de-kindergeld'],
    expect_not:  ['de-buergergeld'], // 2500€ > 1600€ threshold
    note: 'DE: employed family 2500€/mo → Kindergeld only, NOT Bürgergeld'
  },
  {
    cc: 'es', income: 0, age: 40, situation: 'single', employment: 'unemployed', housing: 'rented',
    expect_aids: ['es-imv'],
    expect_not:  [],
    note: 'ES: unemployed, no income → IMV (Ingreso Mínimo Vital)'
  },
  {
    cc: 'fr', income: 60000, age: 28, situation: 'single', employment: 'unemployed', housing: 'rented',
    expect_aids_contain: ['rsa', 'apl'],
    expect_not:  [],
    note: 'FR: 600€/mo, renting → RSA + APL both eligible'
  },
  {
    cc: 'ca', income: 100000, age: 67, situation: 'single', employment: 'retired', housing: 'rented',
    expect_aids: ['ca-oas'],
    expect_not:  [],
    note: 'CA: senior 67, retired → OAS (age_65_plus)'
  },
  {
    cc: 'us', income: 0, age: 50, situation: 'single', employment: 'disabled', housing: 'rented',
    expect_aids: ['us-ssi'],
    expect_not:  [],
    note: 'US: disabled 50, no income → SSI (age_65_plus_or_blind_or_disabled)'
  },
  {
    cc: 'au', income: 0, age: 30, situation: 'single', employment: 'unemployed', housing: 'rented',
    expect_aids: ['au-jobseeker'],
    expect_not:  [],
    note: 'AU: unemployed 30 → JobSeeker (age_22_to_66 + unemployed_or_temporarily_ill)'
  },
  {
    cc: 'se', income: 0, age: 32, situation: 'family', employment: 'unemployed', housing: 'rented',
    expect_aids: ['se-a-kassa', 'se-barnbidrag'],
    expect_not:  [],
    note: 'SE: unemployed family → A-kassa + Barnbidrag'
  }
];

/* ── Test runner ────────────────────────────────────────────────────────── */
async function runTests() {
  const results = [];
  let pass = 0, fail = 0;

  for (const s of SCENARIOS) {
    const sim = new EUSimulator(s.cc);
    await sim.init();

    const aids = sim.simulate({
      income:     s.income,
      age:        s.age,
      situation:  s.situation,
      employment: s.employment,
      housing:    s.housing,
    });

    const foundIds  = aids.map(a => a.id);
    const failures  = [];

    // Check must-include aids
    for (const id of (s.expect_aids || [])) {
      if (!foundIds.includes(id)) {
        failures.push(`MISSING aid "${id}" (found: ${foundIds.join(', ') || 'none'})`);
      }
    }

    // Check at-least-one-of
    if (s.expect_aids_contain?.length) {
      const anyFound = s.expect_aids_contain.some(id => foundIds.includes(id));
      if (!anyFound) {
        failures.push(`NONE of [${s.expect_aids_contain.join(', ')}] found (found: ${foundIds.join(', ') || 'none'})`);
      }
    }

    // Check must-not-include
    for (const id of (s.expect_not || [])) {
      if (foundIds.includes(id)) {
        failures.push(`UNEXPECTED aid "${id}" should NOT be returned`);
      }
    }

    const ok = failures.length === 0;
    if (ok) pass++; else fail++;

    // Collect formatted amounts for the report
    const aidLabels = aids
      .filter(a => (s.expect_aids || s.expect_aids_contain || []).some(id => a.id === id || (s.expect_aids_contain || []).includes(a.id)))
      .map(a => `${a.nom} (${a._formatted?.amount || '—'})`)
      .join(', ') || foundIds.slice(0, 3).join(', ');

    results.push({ s, ok, failures, aids, aidLabels });
  }

  return { results, pass, fail };
}

/* ── Report ─────────────────────────────────────────────────────────────── */
function printReport({ results, pass, fail }) {
  const COL = { cc: 6, scenario: 28, result: 6, aids: 40, amounts: 20 };

  const hr = '─'.repeat(110);
  console.log('\n' + hr);
  console.log(
    'COUNTRY'.padEnd(COL.cc) + ' │ ' +
    'SCENARIO'.padEnd(COL.scenario) + ' │ ' +
    'RESULT'.padEnd(COL.result) + ' │ ' +
    'AIDS FOUND / ISSUES'
  );
  console.log(hr);

  for (const { s, ok, failures, aids, aidLabels } of results) {
    const cc       = s.cc.toUpperCase().padEnd(COL.cc);
    const scenario = s.note.replace(/^[A-Z]{2,2}: /, '').substring(0, COL.scenario).padEnd(COL.scenario);
    const result   = ok ? '✅ PASS' : '❌ FAIL';

    if (ok) {
      // Show matched aids with amounts
      const reportAids = aids.slice(0, 4).map(a => {
        const amt = a._formatted?.amount;
        return amt && amt !== '—' ? `${a.nom} ${amt}` : a.nom;
      }).join(', ');
      console.log(`${cc} │ ${scenario} │ ${result} │ ${reportAids}`);
    } else {
      console.log(`${cc} │ ${scenario} │ ${result} │ ${failures.join('; ')}`);
    }
  }

  console.log(hr);
  console.log(`\nResult: ${pass}/${pass + fail} passed${fail > 0 ? ` — ${fail} FAILED` : ' ✅'}\n`);

  if (fail > 0) {
    console.error('FAILURES:');
    for (const { s, ok, failures } of results) {
      if (!ok) {
        console.error(`  [${s.cc.toUpperCase()}] ${s.note}`);
        for (const f of failures) console.error(`    → ${f}`);
      }
    }
    process.exit(1);
  }
}

/* ── Main ───────────────────────────────────────────────────────────────── */
runTests()
  .then(printReport)
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
