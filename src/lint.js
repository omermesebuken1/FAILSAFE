const fs = require('fs');

const MIN_RISK_LENGTH = 80;
const INDEPENDENCE_THRESHOLD = 0.5;
const MIN_RISKS = 1;
const MAX_RISKS = 3;

const WEASEL_PATTERNS = [
  /\b(might|could|may) be (hard|difficult|tough|challenging|tricky)\b/i,
  /\biterate until (good|right|done|done right|it works)\b/i,
  /\bvalidate (pmf|product[- ]market fit)\b(?![^.]*\d)/i,
  /\bjust work harder\b/i,
  /\b(somewhat|kinda|sort of|kind of)\b/i,
  /\bmaybe (continue|pivot|kill)\b/i,
  /\bleaning (continue|pivot|kill)\b/i,
  /\bwork on it until\b/i,
];

const NUMERIC_OR_OBSERVABLE = /(\d|≥|≤|>=|<=|>|<|%|\$|\bzero\b|\bhour|\bday|\bweek|\bmonth|\byear|\buser|\bsignup|\bclick|\bvisitor|\bsubscriber|\bdollar|\bnps\b|\bchurn\b|\bconversion\b|\bretention\b)/i;

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'into', 'will',
  'have', 'has', 'are', 'was', 'were', 'been', 'being', 'their', 'them',
  'they', 'than', 'then', 'when', 'where', 'which', 'while', 'because',
  'about', 'after', 'before', 'these', 'those', 'such', 'also', 'over',
  'under', 'each', 'some', 'most', 'more', 'less', 'much', 'many',
]);

function lintFile(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return { ok: false, findings: [{ rule: 'io', path: '', message: e.message }] };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return { ok: false, findings: [{ rule: 'parse', path: '', message: e.message }] };
  }

  return lintReport(data);
}

function lintReport(data) {
  const findings = [];

  const structural = checkStructure(data);
  findings.push(...structural);
  if (structural.length > 0) {
    return { ok: false, findings };
  }

  data.failure_risks.forEach((risk, i) => {
    checkRisk(risk, `/failure_risks/${i}`, findings);
  });
  if (data.failure_risks.length > 1) {
    checkIndependence(data.failure_risks, findings);
  }

  return { ok: findings.length === 0, findings };
}

function checkStructure(data) {
  const findings = [];
  if (!data || typeof data !== 'object') {
    findings.push({ rule: 'structure', path: '', message: 'not an object' });
    return findings;
  }
  if (data.failsafe_version !== '0.3') {
    findings.push({
      rule: 'structure',
      path: '/failsafe_version',
      message: `expected "0.3", got ${JSON.stringify(data.failsafe_version)}`,
    });
  }
  if (typeof data.project_summary !== 'string' || data.project_summary.length === 0) {
    findings.push({ rule: 'structure', path: '/project_summary', message: 'missing or empty' });
  }
  if (!['Continue', 'Pivot', 'Kill'].includes(data.final_recommendation)) {
    findings.push({
      rule: 'structure',
      path: '/final_recommendation',
      message: 'must be Continue | Pivot | Kill',
    });
  }
  if (!Array.isArray(data.failure_risks)) {
    findings.push({ rule: 'structure', path: '/failure_risks', message: 'must be an array' });
  } else if (data.failure_risks.length < MIN_RISKS || data.failure_risks.length > MAX_RISKS) {
    findings.push({
      rule: 'risk-count',
      path: '/failure_risks',
      message: `expected ${MIN_RISKS}-${MAX_RISKS} risks (no padding, no omission), got ${data.failure_risks.length}`,
    });
  }
  return findings;
}

function checkRisk(risk, base, findings) {
  if (typeof risk.risk !== 'string' || risk.risk.length === 0) {
    findings.push({ rule: 'structure', path: `${base}/risk`, message: 'missing or empty' });
    return;
  }
  if (risk.risk.length < MIN_RISK_LENGTH) {
    findings.push({
      rule: 'specificity-length',
      path: `${base}/risk`,
      message: `risk is ${risk.risk.length} chars (<${MIN_RISK_LENGTH}); too short to be specific`,
    });
  }
  const wf = findWeasel(risk.risk);
  if (wf) {
    findings.push({ rule: 'weasel', path: `${base}/risk`, message: `weasel phrase: "${wf}"` });
  }

  if (risk.solvable === false) return;

  const am = risk.action_map;
  if (!am || typeof am !== 'object') {
    findings.push({ rule: 'structure', path: `${base}/action_map`, message: 'missing on solvable risk' });
    return;
  }
  for (const field of ['validation_step', 'minimum_test', 'success_metric', 'failure_threshold', 'next_action']) {
    const v = am[field];
    if (typeof v !== 'string' || v.length === 0) {
      findings.push({ rule: 'structure', path: `${base}/action_map/${field}`, message: 'missing or empty' });
      continue;
    }
    const w = findWeasel(v);
    if (w) {
      findings.push({ rule: 'weasel', path: `${base}/action_map/${field}`, message: `weasel phrase: "${w}"` });
    }
  }
  for (const field of ['success_metric', 'failure_threshold']) {
    const v = am[field];
    if (typeof v === 'string' && v.length > 0 && !NUMERIC_OR_OBSERVABLE.test(v)) {
      findings.push({
        rule: 'falsifiability',
        path: `${base}/action_map/${field}`,
        message: `${field} has no numeric or observable predicate`,
      });
    }
  }
}

function findWeasel(text) {
  for (const p of WEASEL_PATTERNS) {
    const m = text.match(p);
    if (m) return m[0];
  }
  return null;
}

function tokenize(s) {
  return new Set(
    s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 3 && !STOPWORDS.has(t))
  );
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function checkIndependence(risks, findings) {
  for (let i = 0; i < risks.length; i++) {
    for (let j = i + 1; j < risks.length; j++) {
      const a = tokenize(risks[i].risk || '');
      const b = tokenize(risks[j].risk || '');
      const sim = jaccard(a, b);
      if (sim >= INDEPENDENCE_THRESHOLD) {
        findings.push({
          rule: 'independence',
          path: `/failure_risks/${i},${j}`,
          message: `risks ${i} and ${j} share ${(sim * 100).toFixed(0)}% non-stopword tokens (>=${INDEPENDENCE_THRESHOLD * 100}%)`,
        });
      }
    }
  }
}

module.exports = { lintFile, lintReport };
