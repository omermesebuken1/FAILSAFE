const path = require('path');
const { lintFile } = require('./lint');
const { init } = require('./init');

const HELP = `failsafe — FAILSAFE protocol toolkit

Usage:
  failsafe init [dir]        Scaffold .failsafe/ in the target directory
                             (default: current directory).
  failsafe lint <file>...    Lint one or more FAILSAFE reports.
  failsafe -h | --help       Show this help.

Options (init):
  --force                    Overwrite existing files in .failsafe/

Exit codes:
  0  success
  1  lint findings
  2  usage or io error
`;

function run(argv) {
  if (argv.length === 0 || argv[0] === '-h' || argv[0] === '--help') {
    process.stdout.write(HELP);
    process.exit(argv.length === 0 ? 2 : 0);
  }

  const cmd = argv[0];
  const rest = argv.slice(1);

  switch (cmd) {
    case 'init':
      return runInit(rest);
    case 'lint':
      return runLint(rest);
    default:
      process.stderr.write(`Unknown command: ${cmd}\n\n${HELP}`);
      process.exit(2);
  }
}

function runInit(argv) {
  const force = argv.includes('--force');
  const dir = argv.find(x => !x.startsWith('--')) || '.';
  let result;
  try {
    result = init(path.resolve(process.cwd(), dir), { force });
  } catch (e) {
    process.stderr.write(`error: ${e.message}\n`);
    process.exit(2);
  }

  for (const f of result.written) {
    process.stdout.write(`  wrote    .failsafe/${f}\n`);
  }
  for (const f of result.skipped) {
    process.stdout.write(`  skipped  .failsafe/${f}  (exists; use --force to overwrite)\n`);
  }

  const inCwd = result.target === process.cwd();
  const display = inCwd ? '.failsafe/' : path.join(result.target, '.failsafe') + '/';
  process.stdout.write([
    '',
    `FAILSAFE bundle written to ${display}`,
    '',
    'To activate it in your project, pick the path that matches your tool:',
    '',
    '  Claude Code   add this line to your CLAUDE.md:',
    '                  @.failsafe/CLAUDE.md',
    '',
    '  Cursor        append the contents of .failsafe/CLAUDE.md to .cursorrules',
    '',
    '  Other agents  include .failsafe/CLAUDE.md in the system prompt',
    '',
    'Then say:',
    '  "Run FAILSAFE on <one-line project description>"',
    '',
  ].join('\n'));

  process.exit(0);
}

function runLint(argv) {
  if (argv.length === 0) {
    process.stderr.write(`lint requires at least one file\n\n${HELP}`);
    process.exit(2);
  }

  let allOk = true;
  for (const file of argv) {
    const abs = path.resolve(process.cwd(), file);
    const result = lintFile(abs);
    printLintResult(file, result);
    if (!result.ok) allOk = false;
  }

  process.exit(allOk ? 0 : 1);
}

function printLintResult(file, result) {
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
