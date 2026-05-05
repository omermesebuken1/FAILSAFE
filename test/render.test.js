const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { render, renderReport, renderFile, prepareData, defaultTemplatePath } = require('../src/render');

const ROOT = path.resolve(__dirname, '..');

function sampleReport() {
  return {
    failsafe_version: '0.3',
    project_summary: 'A test project for the renderer.',
    failure_risks: [
      {
        risk: 'A long enough specific risk description that talks about a real concrete failure mode in this fake project.',
        root_cause_type: 'Execution',
        solvable: true,
        solver: 'User',
        action_map: {
          validation_step: 'Test it.',
          minimum_test: 'Run for 2 weeks.',
          success_metric: '≥30% complete.',
          failure_threshold: '<10% complete.',
          next_action: 'Pass: continue. Fail: pivot.',
        },
      },
      {
        risk: 'An unsolvable risk that lacks an action map because nothing the user can do will move the needle on it.',
        root_cause_type: 'Environment',
        solvable: false,
        solver: 'None',
        action_map: {
          validation_step: '',
          minimum_test: '',
          success_metric: '',
          failure_threshold: '',
          next_action: '',
        },
      },
    ],
    final_recommendation: 'Pivot',
  };
}

test('render replaces simple placeholders', () => {
  const out = render('Hello {{name}}!', { name: 'World' });
  assert.equal(out, 'Hello World!');
});

test('render escapes HTML in placeholders', () => {
  const out = render('{{x}}', { x: '<script>alert(1)</script>' });
  assert.ok(!out.includes('<script>'));
  assert.ok(out.includes('&lt;script&gt;'));
});

test('render triple-mustache passes raw content', () => {
  const out = render('{{{x}}}', { x: '<b>bold</b>' });
  assert.equal(out, '<b>bold</b>');
});

test('render iterates array sections', () => {
  const out = render('{{#items}}[{{n}}]{{/items}}', { items: [{ n: 1 }, { n: 2 }, { n: 3 }] });
  assert.equal(out, '[1][2][3]');
});

test('render skips falsy section', () => {
  const out = render('{{#x}}YES{{/x}}', { x: false });
  assert.equal(out, '');
});

test('render renders truthy section once', () => {
  const out = render('{{#x}}YES{{/x}}', { x: true });
  assert.equal(out, 'YES');
});

test('prepareData maps risks correctly', () => {
  const data = prepareData(sampleReport());
  assert.equal(data.failsafe_version, '0.3');
  assert.equal(data.final_recommendation, 'Pivot');
  assert.equal(data.decision_lower, 'pivot');
  assert.equal(data.risks.length, 2);
  assert.equal(data.risks[0].risk_index, 1);
  assert.equal(data.risks[0].has_action_map, true);
  assert.equal(data.risks[0].solvable_class, 'solvable');
  assert.equal(data.risks[1].has_action_map, false);
  assert.equal(data.risks[1].solvable_class, 'unsolvable');
  assert.equal(data.risks[0].root_cause_type_lower, 'execution');
});

test('renderReport produces HTML containing decision and project summary', () => {
  const tpl = fs.readFileSync(defaultTemplatePath(), 'utf8');
  const html = renderReport(sampleReport(), tpl);
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('A test project for the renderer.'));
  assert.ok(html.includes('Pivot'));
  assert.ok(html.includes('decision-pivot'));
});

test('renderReport renders all risks as articles', () => {
  const tpl = fs.readFileSync(defaultTemplatePath(), 'utf8');
  const html = renderReport(sampleReport(), tpl);
  const articleCount = (html.match(/<article class="risk">/g) || []).length;
  assert.equal(articleCount, 2);
});

test('renderReport hides action map for unsolvable risks', () => {
  const tpl = fs.readFileSync(defaultTemplatePath(), 'utf8');
  const html = renderReport(sampleReport(), tpl);
  const actionMapCount = (html.match(/<details class="action-map"/g) || []).length;
  assert.equal(actionMapCount, 1);
});

test('renderReport injects the original JSON into the data script tag', () => {
  const tpl = fs.readFileSync(defaultTemplatePath(), 'utf8');
  const html = renderReport(sampleReport(), tpl);
  assert.ok(html.includes('id="failsafe-data"'));
  assert.ok(html.includes('"failsafe_version": "0.3"'));
});

test('renderFile works on the bundled examples', () => {
  for (const f of [
    'examples/startup-resume-builder.json',
    'examples/feature-realtime-collab.json',
    'examples/extension-tab-summarizer.json',
    'examples/log4u.json',
  ]) {
    const html = renderFile(path.join(ROOT, f));
    assert.ok(html.length > 1000, `expected substantial HTML for ${f}`);
    assert.ok(html.includes('<!DOCTYPE html>'));
  }
});
