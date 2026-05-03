const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { lintFile } = require('../src/lint');

const root = path.resolve(__dirname, '..');

const goodFiles = [
  'examples/startup-resume-builder.json',
  'examples/feature-realtime-collab.json',
  'examples/personal-novel.json',
  'examples/lite-novel.json',
];

const badFiles = [
  { file: 'test/fixtures/anti-vague.json',           expectRule: 'specificity-length' },
  { file: 'test/fixtures/anti-weasel-risk.json',     expectRule: 'weasel' },
  { file: 'test/fixtures/anti-weasel-actionmap.json', expectRule: 'weasel' },
  { file: 'test/fixtures/anti-unfalsifiable.json',   expectRule: 'falsifiability' },
  { file: 'test/fixtures/anti-overlapping.json',     expectRule: 'independence' },
  { file: 'test/fixtures/anti-mixed.json',           expectRule: null },
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
