const fs = require('fs');
const path = require('path');

const FILES = ['FAILSAFE.md', 'CLAUDE.md', 'schema.json'];

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

  for (const f of FILES) {
    if (!fs.existsSync(path.join(pkgRoot, f))) {
      throw new Error(`package is missing source file: ${f}`);
    }
  }

  fs.mkdirSync(failsafeDir, { recursive: true });

  const written = [];
  const skipped = [];
  for (const f of FILES) {
    const src = path.join(pkgRoot, f);
    const dst = path.join(failsafeDir, f);
    if (fs.existsSync(dst) && !options.force) {
      skipped.push(f);
      continue;
    }
    fs.copyFileSync(src, dst);
    written.push(f);
  }

  return { target, failsafeDir, written, skipped };
}

module.exports = { init };
