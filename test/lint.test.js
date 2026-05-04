const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { lintFile, lintReport } = require('../src/lint');

const root = path.resolve(__dirname, '..');

const goodFiles = [
  'examples/startup-resume-builder.json',
  'examples/feature-realtime-collab.json',
  'examples/extension-tab-summarizer.json',
];

const badFiles = [
  { file: 'test/fixtures/anti-vague.json',            expectRule: 'specificity-length' },
  { file: 'test/fixtures/anti-weasel-risk.json',      expectRule: 'weasel' },
  { file: 'test/fixtures/anti-weasel-actionmap.json', expectRule: 'weasel' },
  { file: 'test/fixtures/anti-unfalsifiable.json',    expectRule: 'falsifiability' },
  { file: 'test/fixtures/anti-overlapping.json',      expectRule: 'independence' },
  { file: 'test/fixtures/anti-mixed.json',            expectRule: null },
];

for (const f of goodFiles) {
  test(`accepts ${f}`, () => {
    const r = lintFile(path.join(root, f));
    assert.equal(r.ok, true, `unexpected findings: ${JSON.stringify(r.findings, null, 2)}`);
  });
}

for (const { file, expectRule } of badFiles) {
  test(`rejects ${file}`, () => {
    const r = lintFile(path.join(root, file));
    assert.equal(r.ok, false, 'expected at least one finding');
    if (expectRule) {
      const rules = r.findings.map(x => x.rule);
      assert.ok(
        rules.includes(expectRule),
        `expected rule "${expectRule}" but got: ${rules.join(', ') || '(none)'}`
      );
    }
  });
}

test('extension example has exactly 2 risks (flexibility)', () => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'examples/extension-tab-summarizer.json'), 'utf8'));
  assert.equal(data.failure_risks.length, 2);
});

test('accepts a valid 1-risk report', () => {
  const data = baseReport();
  data.failure_risks = [data.failure_risks[0]];
  const r = lintReport(data);
  assert.equal(r.ok, true, `unexpected findings: ${JSON.stringify(r.findings)}`);
});

test('rejects a 0-risk report', () => {
  const data = baseReport();
  data.failure_risks = [];
  const r = lintReport(data);
  assert.equal(r.ok, false);
  assert.ok(r.findings.some(x => x.rule === 'risk-count'));
});

test('rejects a 4-risk report', () => {
  const data = baseReport();
  data.failure_risks = [
    data.failure_risks[0],
    data.failure_risks[0],
    data.failure_risks[0],
    data.failure_risks[0],
  ];
  const r = lintReport(data);
  assert.equal(r.ok, false);
  assert.ok(r.findings.some(x => x.rule === 'risk-count'));
});

test('rejects v0.2 reports (version mismatch)', () => {
  const data = baseReport();
  data.failsafe_version = '0.2';
  const r = lintReport(data);
  assert.equal(r.ok, false);
  assert.ok(r.findings.some(x => x.rule === 'structure' && x.path === '/failsafe_version'));
});

test('precision and recall on labeled set (>=85%)', () => {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const f of goodFiles) {
    const r = lintFile(path.join(root, f));
    if (r.ok) tn++; else fp++;
  }
  for (const { file } of badFiles) {
    const r = lintFile(path.join(root, file));
    if (!r.ok) tp++; else fn++;
  }
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  console.log(`  tp=${tp} fp=${fp} tn=${tn} fn=${fn}  precision=${precision.toFixed(2)} recall=${recall.toFixed(2)}`);
  assert.ok(precision >= 0.85, `precision ${precision.toFixed(2)} < 0.85`);
  assert.ok(recall >= 0.85, `recall ${recall.toFixed(2)} < 0.85`);
});

function baseReport() {
  return {
    failsafe_version: '0.3',
    project_summary: 'Sample project for testing the linter.',
    failure_risks: [
      {
        risk: 'A specific, concrete failure mode that takes more than eighty characters to describe in proper detail.',
        root_cause_type: 'Execution',
        solvable: true,
        solver: 'User',
        action_map: {
          validation_step: 'Test the assumption.',
          minimum_test: 'Run a 2-week experiment with 100 users.',
          success_metric: 'At least 30% of users complete the flow.',
          failure_threshold: 'Below 10% complete the flow.',
          next_action: 'If pass: continue. If fail: pivot.',
        },
      },
    ],
    final_recommendation: 'Continue',
  };
}
