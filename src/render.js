const fs = require('fs');
const path = require('path');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonForScript(jsonString) {
  return jsonString.replace(/<\/script>/gi, '<\\/script>');
}

function render(template, data) {
  let result = template.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_, name, body) => {
      const v = data[name];
      if (Array.isArray(v)) {
        return v.map(item => render(body, { ...data, ...item })).join('');
      }
      if (v) return render(body, data);
      return '';
    }
  );

  result = result.replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => {
    const v = data[k];
    return v == null ? '' : String(v);
  });

  result = result.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = data[k];
    return v == null ? '' : escapeHtml(String(v));
  });

  return result;
}

function prepareData(report) {
  const risks = (report.failure_risks || []).map((r, i) => {
    const am = r.action_map || {};
    return {
      risk_index: i + 1,
      risk: r.risk,
      root_cause_type: r.root_cause_type,
      root_cause_type_lower: String(r.root_cause_type || '').toLowerCase(),
      solvable_label: r.solvable ? 'Solvable' : 'Unsolvable',
      solvable_class: r.solvable ? 'solvable' : 'unsolvable',
      solver: r.solver,
      has_action_map: !!r.solvable,
      validation_step: am.validation_step || '',
      minimum_test: am.minimum_test || '',
      success_metric: am.success_metric || '',
      failure_threshold: am.failure_threshold || '',
      next_action: am.next_action || '',
    };
  });

  return {
    failsafe_version: report.failsafe_version || '',
    project_summary: report.project_summary || '',
    final_recommendation: report.final_recommendation || '',
    decision_lower: String(report.final_recommendation || '').toLowerCase(),
    json_data_raw: escapeJsonForScript(JSON.stringify(report, null, 2)),
    risks,
  };
}

function renderReport(report, templateString) {
  return render(templateString, prepareData(report));
}

function defaultTemplatePath() {
  return path.resolve(__dirname, '..', 'template.html');
}

function renderFile(jsonPath, options = {}) {
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const localTemplate = path.join(path.dirname(jsonPath), '.failsafe', 'template.html');
  const templatePath =
    options.template ||
    (fs.existsSync(localTemplate) ? localTemplate : defaultTemplatePath());
  const template = fs.readFileSync(templatePath, 'utf8');
  return renderReport(json, template);
}

module.exports = { render, renderReport, renderFile, prepareData, defaultTemplatePath };
