import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');

export function parseSsim(output) {
  const value = Number(String(output).match(/All:([0-9.]+)/)?.[1]);
  if (!Number.isFinite(value)) throw new Error('Unable to parse SSIM output');
  return value;
}

function runFfmpeg(args) {
  const result = spawnSync('/opt/homebrew/bin/ffmpeg', ['-y', '-hide_banner', '-loglevel', 'info', ...args], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `ffmpeg exited ${result.status}`);
  return result.stderr;
}

export function compareVisuals() {
  const manifest = JSON.parse(readFileSync(resolve(projectRoot, 'references', 'manifest.json'), 'utf8'));
  const diffDir = resolve(projectRoot, 'evidence', 'diffs');
  mkdirSync(diffDir, { recursive: true });
  const pages = manifest.entries.map((entry) => {
    const reference = resolve(projectRoot, 'references', entry.normalizedFile);
    const actual = resolve(projectRoot, 'evidence', 'viewports', `${entry.pageId}.png`);
    const diff = resolve(diffDir, `${entry.pageId}.png`);
    const metricOutput = runFfmpeg(['-i', reference, '-i', actual, '-lavfi', 'ssim', '-f', 'null', '-']);
    runFfmpeg(['-i', reference, '-i', actual, '-filter_complex', 'blend=all_mode=difference', '-frames:v', '1', diff]);
    return { pageId: entry.pageId, reference: entry.normalizedFile, actual: `viewports/${entry.pageId}.png`, diff: `diffs/${entry.pageId}.png`, ssim: parseSsim(metricOutput) };
  });
  const averageSsim = pages.reduce((sum, page) => sum + page.ssim, 0) / pages.length;
  const report = {
    generatedAt: new Date().toISOString(),
    method: 'ffmpeg SSIM on equal-size 750px normalized reference and fixed-viewport render; score is evidence, not an exact-fidelity claim',
    summary: { total: pages.length, averageSsim, minimumSsim: Math.min(...pages.map((page) => page.ssim)), maximumSsim: Math.max(...pages.map((page) => page.ssim)) },
    pages,
  };
  writeFileSync(resolve(projectRoot, 'evidence', 'visual-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = compareVisuals();
  process.stdout.write(`${JSON.stringify(report.summary)}\n`);
}
