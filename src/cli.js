const fs = require('fs');
const path = require('path');
const { lintFile } = require('./lint');

const HELP = `failsafe — FAILSAFE protocol toolkit

Usage:
  failsafe lint <file>...   Lint one or more FAILSAFE reports.
  failsafe -h | --help      Show this help.

Exit codes:
  0  all reports clean
  1  one or more reports have findings
  2  usage error
`;

function run(argv) {
  if (argv.length === 0 || argv[0] === '-h' || argv[0] === '--help') {
    process.stdout.write(HELP);
    process.exit(argv.length === 0 ? 2 : 0);
  }

  const cmd = argv[0];
  if (cmd !== 'lint') {
    process.stderr.write(`Unknown command: ${cmd}\n\n${HELP}`);
    process.exit(2);
  }

  const files = argv.slice(1);
  if (files.length === 0) {
    process.stderr.write(`lint requires at least one file\n\n${HELP}`);
    process.exit(2);
  }

  let allOk = true;
  for (const file of files) {
    const abs = path.resolve(process.cwd(), file);
    const result = lintFile(abs);
    printResult(file, result);
    if (!result.ok) allOk = false;
  }

  process.exit(allOk ? 0 : 1);
}

function printResult(file, result) {
  if (result.ok) {
    process.stdout.write(`PASS  ${file}\n`);
    return;
  }
  process.stdout.write(`FAIL  ${file}\n`);
  for (const f of result.findings) {
    process.stdout.write(`  [${f.rule}] ${f.path}: ${f.message}\n`);
  }
}

module.exports = { run };
