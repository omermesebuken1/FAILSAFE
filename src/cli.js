const path = require('path');
const fs = require('fs');
const { lintFile } = require('./lint');
const { init } = require('./init');
const { renderFile } = require('./render');

const HELP = `failsafe — FAILSAFE protocol toolkit

Usage:
  failsafe init [dir]        Scaffold .failsafe/ in the target directory
                             (default: current directory).
  failsafe lint <file>...    Lint one or more FAILSAFE reports.
  failsafe view <file>       Render a JSON report as a standalone HTML file.
  failsafe -h | --help       Show this help.

Init flags (combine freely; default writes only .failsafe/):
  --claude                   Also write .claude/skills/failsafe.md
  --codex                    Also append a FAILSAFE block to AGENTS.md
  --cursor                   Also append a FAILSAFE block to .cursorrules
  --all                      Equivalent to --claude --codex --cursor
  --force                    Overwrite existing files in .failsafe/ and skill paths

View flags:
  --open                     Open the rendered HTML in the default browser
  --stdout                   Print HTML to stdout instead of writing a file
  --out <path>               Write HTML to a specific path

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
    case 'view':
      return runView(rest);
    default:
      process.stderr.write(`Unknown command: ${cmd}\n\n${HELP}`);
      process.exit(2);
  }
}

function runInit(argv) {
  const options = {
    force: argv.includes('--force'),
    claude: argv.includes('--claude'),
    codex: argv.includes('--codex'),
    cursor: argv.includes('--cursor'),
    all: argv.includes('--all'),
  };
  const dir = argv.find(x => !x.startsWith('--')) || '.';

  let result;
  try {
    result = init(path.resolve(process.cwd(), dir), options);
  } catch (e) {
    process.stderr.write(`error: ${e.message}\n`);
    process.exit(2);
  }

  for (const f of result.written) {
    process.stdout.write(`  wrote     ${f}\n`);
  }
  for (const f of result.appended) {
    process.stdout.write(`  appended  ${f}\n`);
  }
  for (const f of result.skipped) {
    process.stdout.write(`  skipped   ${f}\n`);
  }

  const inCwd = result.target === process.cwd();
  const display = inCwd ? '.failsafe/' : path.join(result.target, '.failsafe') + '/';

  process.stdout.write([
    '',
    `FAILSAFE bundle written to ${display}`,
    '',
  ].join('\n'));

  if (!options.claude && !options.codex && !options.cursor && !options.all) {
    process.stdout.write([
      'To activate FAILSAFE, pick the path that matches your tool:',
      '',
      '  Claude Code   re-run with --claude   (or copy skill.md to .claude/skills/failsafe.md)',
      '  Codex         re-run with --codex    (or paste skill.md into AGENTS.md)',
      '  Cursor        re-run with --cursor   (or paste skill.md into .cursorrules)',
      '  All three     re-run with --all',
      '',
      'Then say:',
      '  "Run FAILSAFE on <one-line project description>"',
      '',
    ].join('\n'));
  } else {
    process.stdout.write([
      'FAILSAFE is now wired into the surfaces you selected.',
      '',
      'Try it:',
      '  "Run FAILSAFE on <one-line project description>"',
      '',
    ].join('\n'));
  }

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

function runView(argv) {
  const positional = argv.find(x => !x.startsWith('--'));
  if (!positional) {
    process.stderr.write(`view requires a JSON file path\n\n${HELP}`);
    process.exit(2);
  }

  const jsonPath = path.resolve(process.cwd(), positional);
  const stdout = argv.includes('--stdout');
  const open = argv.includes('--open');
  const outIdx = argv.indexOf('--out');
  const outOverride = outIdx >= 0 ? argv[outIdx + 1] : null;

  let html;
  try {
    html = renderFile(jsonPath);
  } catch (e) {
    process.stderr.write(`error: ${e.message}\n`);
    process.exit(2);
  }

  if (stdout) {
    process.stdout.write(html);
    process.exit(0);
  }

  const parsed = path.parse(jsonPath);
  const defaultHtml = path.join(parsed.dir, parsed.name + '.html');
  const htmlPath = outOverride
    ? path.resolve(process.cwd(), outOverride)
    : defaultHtml;

  fs.writeFileSync(htmlPath, html);
  process.stdout.write(`HTML report written to: ${htmlPath}\n`);
  process.stdout.write(`  file://${htmlPath}\n`);

  if (open) {
    const opener =
      process.platform === 'darwin' ? 'open' :
      process.platform === 'win32'  ? 'start' :
                                      'xdg-open';
    require('child_process').spawn(opener, [htmlPath], {
      detached: true,
      stdio: 'ignore',
    }).unref();
  }

  process.exit(0);
}

module.exports = { run };
