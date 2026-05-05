const fs = require('fs');
const path = require('path');

const BUNDLE_FILES = ['FAILSAFE.md', 'CLAUDE.md', 'schema.json', 'template.html'];
const SKILL_FILE = 'skill.md';
const CLAUDE_SKILL_PATH = path.join('.claude', 'skills', 'failsafe.md');
const AGENTS_FILE = 'AGENTS.md';
const CURSOR_FILE = '.cursorrules';

const AGENTS_SNIPPET = '\n## FAILSAFE Protocol\n\nSee `.failsafe/CLAUDE.md` for the FAILSAFE anti-failure pre-mortem protocol. When the user types `FAILSAFE <project>`, `Run FAILSAFE on <project>`, or `/failsafe <project>`, follow the rules in that file and emit JSON only.\n';

const CURSOR_SNIPPET = '\n# FAILSAFE Protocol\n\nSee .failsafe/CLAUDE.md for the FAILSAFE anti-failure pre-mortem protocol. When the user types "FAILSAFE <project>" or "Run FAILSAFE on <project>", follow the rules in that file and emit JSON only.\n';

function init(targetDir, options = {}) {
  const pkgRoot = path.resolve(__dirname, '..');
  const target = path.resolve(targetDir || '.');
  const failsafeDir = path.join(target, '.failsafe');

  if (!fs.existsSync(target)) {
    throw new Error(`target directory does not exist: ${target}`);
  }
  if (!fs.statSync(target).isDirectory()) {
    throw new Error(`target is not a directory: ${target}`);
  }

  const sources = [...BUNDLE_FILES, SKILL_FILE];
  for (const f of sources) {
    if (!fs.existsSync(path.join(pkgRoot, f))) {
      throw new Error(`package is missing source file: ${f}`);
    }
  }

  fs.mkdirSync(failsafeDir, { recursive: true });

  const written = [];
  const skipped = [];
  const appended = [];

  for (const f of BUNDLE_FILES) {
    const src = path.join(pkgRoot, f);
    const dst = path.join(failsafeDir, f);
    if (fs.existsSync(dst) && !options.force) {
      skipped.push(`.failsafe/${f}`);
      continue;
    }
    fs.copyFileSync(src, dst);
    written.push(`.failsafe/${f}`);
  }

  if (options.claude || options.all) {
    const dst = path.join(target, CLAUDE_SKILL_PATH);
    if (fs.existsSync(dst) && !options.force) {
      skipped.push(CLAUDE_SKILL_PATH);
    } else {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(path.join(pkgRoot, SKILL_FILE), dst);
      written.push(CLAUDE_SKILL_PATH);
    }
  }

  if (options.codex || options.all) {
    const result = appendIfMissing(target, AGENTS_FILE, AGENTS_SNIPPET, '## FAILSAFE Protocol');
    if (result === 'appended') appended.push(AGENTS_FILE);
    else if (result === 'created') written.push(AGENTS_FILE);
    else skipped.push(`${AGENTS_FILE} (already references FAILSAFE)`);
  }

  if (options.cursor || options.all) {
    const result = appendIfMissing(target, CURSOR_FILE, CURSOR_SNIPPET, '# FAILSAFE Protocol');
    if (result === 'appended') appended.push(CURSOR_FILE);
    else if (result === 'created') written.push(CURSOR_FILE);
    else skipped.push(`${CURSOR_FILE} (already references FAILSAFE)`);
  }

  return { target, failsafeDir, written, skipped, appended };
}

function appendIfMissing(targetDir, file, snippet, marker) {
  const dst = path.join(targetDir, file);
  if (fs.existsSync(dst)) {
    const existing = fs.readFileSync(dst, 'utf8');
    if (existing.includes(marker)) {
      return 'skipped';
    }
    fs.appendFileSync(dst, snippet);
    return 'appended';
  }
  fs.writeFileSync(dst, snippet.replace(/^\n/, ''));
  return 'created';
}

module.exports = { init };
