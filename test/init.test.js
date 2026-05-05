const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { init } = require('../src/init');

const PKG_ROOT = path.resolve(__dirname, '..');
const BUNDLE_FILES = ['FAILSAFE.md', 'CLAUDE.md', 'schema.json', 'template.html'];

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'failsafe-init-'));
}

test('init creates .failsafe/ with all protocol files', () => {
  const dir = tmp();
  try {
    const result = init(dir);
    assert.equal(result.written.length, BUNDLE_FILES.length);
    assert.equal(result.skipped.length, 0);
    for (const f of BUNDLE_FILES) {
      const dst = path.join(dir, '.failsafe', f);
      assert.ok(fs.existsSync(dst), `expected ${dst} to exist`);
      assert.ok(fs.statSync(dst).size > 0);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init copies are byte-identical to package files', () => {
  const dir = tmp();
  try {
    init(dir);
    for (const f of BUNDLE_FILES) {
      const orig = fs.readFileSync(path.join(PKG_ROOT, f));
      const copy = fs.readFileSync(path.join(dir, '.failsafe', f));
      assert.deepEqual(copy, orig, `copy of ${f} differs from original`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init skips existing files without --force', () => {
  const dir = tmp();
  try {
    init(dir);
    fs.writeFileSync(path.join(dir, '.failsafe', 'CLAUDE.md'), 'modified');
    const result = init(dir);
    assert.equal(result.skipped.length, BUNDLE_FILES.length);
    assert.equal(result.written.length, 0);
    assert.equal(
      fs.readFileSync(path.join(dir, '.failsafe', 'CLAUDE.md'), 'utf8'),
      'modified'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init with force overwrites existing files', () => {
  const dir = tmp();
  try {
    init(dir);
    fs.writeFileSync(path.join(dir, '.failsafe', 'CLAUDE.md'), 'modified');
    const result = init(dir, { force: true });
    assert.equal(result.written.length, BUNDLE_FILES.length);
    assert.notEqual(
      fs.readFileSync(path.join(dir, '.failsafe', 'CLAUDE.md'), 'utf8'),
      'modified'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init throws on non-existent target', () => {
  const ghost = path.join(os.tmpdir(), `failsafe-ghost-${Date.now()}`);
  assert.throws(() => init(ghost), /does not exist/);
});

test('init throws when target is a file', () => {
  const dir = tmp();
  const filePath = path.join(dir, 'a-file');
  fs.writeFileSync(filePath, 'x');
  try {
    assert.throws(() => init(filePath), /not a directory/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init does not touch files outside .failsafe/ by default', () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), 'user-owned');
    fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'user-owned');
    fs.writeFileSync(path.join(dir, '.cursorrules'), 'user-owned');
    init(dir);
    assert.equal(fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8'), 'user-owned');
    assert.equal(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), 'user-owned');
    assert.equal(fs.readFileSync(path.join(dir, '.cursorrules'), 'utf8'), 'user-owned');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init --claude writes .claude/skills/failsafe.md', () => {
  const dir = tmp();
  try {
    const result = init(dir, { claude: true });
    const skillPath = path.join(dir, '.claude', 'skills', 'failsafe.md');
    assert.ok(fs.existsSync(skillPath));
    const content = fs.readFileSync(skillPath, 'utf8');
    assert.ok(content.startsWith('---\nname: failsafe\n'), 'skill file should have frontmatter');
    assert.ok(result.written.includes(path.join('.claude', 'skills', 'failsafe.md')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init --codex appends FAILSAFE block to AGENTS.md', () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# Existing instructions\n\nKeep these.\n');
    const result = init(dir, { codex: true });
    const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('Keep these.'), 'should preserve existing content');
    assert.ok(content.includes('FAILSAFE Protocol'), 'should append FAILSAFE block');
    assert.ok(result.appended.includes('AGENTS.md'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init --codex creates AGENTS.md if missing', () => {
  const dir = tmp();
  try {
    init(dir, { codex: true });
    const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('FAILSAFE Protocol'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init --codex is idempotent (does not duplicate the block)', () => {
  const dir = tmp();
  try {
    init(dir, { codex: true });
    init(dir, { codex: true });
    const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
    const occurrences = (content.match(/## FAILSAFE Protocol/g) || []).length;
    assert.equal(occurrences, 1, `expected 1 FAILSAFE block, got ${occurrences}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init --cursor appends to .cursorrules', () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, '.cursorrules'), 'existing rules\n');
    init(dir, { cursor: true });
    const content = fs.readFileSync(path.join(dir, '.cursorrules'), 'utf8');
    assert.ok(content.includes('existing rules'));
    assert.ok(content.includes('FAILSAFE Protocol'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init --all wires up all three surfaces', () => {
  const dir = tmp();
  try {
    init(dir, { all: true });
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'skills', 'failsafe.md')));
    assert.ok(fs.existsSync(path.join(dir, 'AGENTS.md')));
    assert.ok(fs.existsSync(path.join(dir, '.cursorrules')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
