const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { init } = require('../src/init');

const PKG_ROOT = path.resolve(__dirname, '..');
const FILES = ['FAILSAFE.md', 'CLAUDE.md', 'schema.json'];

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'failsafe-init-'));
}

test('init creates .failsafe/ with all three protocol files', () => {
  const dir = tmp();
  try {
    const result = init(dir);
    assert.equal(result.written.length, 3);
    assert.equal(result.skipped.length, 0);
    for (const f of FILES) {
      const dst = path.join(dir, '.failsafe', f);
      assert.ok(fs.existsSync(dst), `expected ${dst} to exist`);
      assert.ok(fs.statSync(dst).size > 0, `expected ${dst} to be non-empty`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init copies are byte-identical to package files', () => {
  const dir = tmp();
  try {
    init(dir);
    for (const f of FILES) {
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
    assert.equal(result.skipped.length, 3);
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
    assert.equal(result.written.length, 3);
    assert.equal(result.skipped.length, 0);
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

test('init throws when target is a file, not a directory', () => {
  const dir = tmp();
  const filePath = path.join(dir, 'a-file');
  fs.writeFileSync(filePath, 'x');
  try {
    assert.throws(() => init(filePath), /not a directory/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('init does not touch files outside .failsafe/', () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), 'user-owned');
    fs.writeFileSync(path.join(dir, 'schema.json'), '{}');
    init(dir);
    assert.equal(fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8'), 'user-owned');
    assert.equal(fs.readFileSync(path.join(dir, 'schema.json'), 'utf8'), '{}');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
