import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGES } from './page-registry.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const workspaceRoot = resolve(projectRoot, '..');
const sourceRoot = resolve(workspaceRoot, 'feishu-ui-images-latest-2026-09-01');
const normalizedRoot = resolve(projectRoot, 'references', 'normalized-750');

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function dimensions(path) {
  const output = execFileSync('/usr/bin/sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], { encoding: 'utf8' });
  const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]);
  return { width, height };
}

export function buildReferenceEntries({ probe = true } = {}) {
  return PAGES.map((page) => {
    const sourcePath = resolve(sourceRoot, page.reference);
    const normalizedFile = `normalized-750/${page.reference}`;
    const normalizedPath = resolve(projectRoot, 'references', normalizedFile);
    return {
      pageId: page.id,
      pageName: page.name,
      sourceFile: page.reference,
      sourcePath,
      normalizedFile,
      normalizedPath,
      ...(probe ? { source: { ...dimensions(sourcePath), sha256: sha256(sourcePath) } } : {}),
    };
  });
}

export function prepareReferences() {
  mkdirSync(normalizedRoot, { recursive: true });
  const entries = buildReferenceEntries();
  for (const entry of entries) {
    execFileSync('/usr/bin/sips', ['--resampleWidth', '750', entry.sourcePath, '--out', entry.normalizedPath], { stdio: 'ignore' });
    entry.normalized = { ...dimensions(entry.normalizedPath), sha256: sha256(entry.normalizedPath) };
    entry.sourcePath = `../../feishu-ui-images-latest-2026-09-01/${basename(entry.sourcePath)}`;
    entry.normalizedPath = entry.normalizedFile;
  }
  const manifest = {
    generatedAt: new Date().toISOString(),
    contract: { cssWidth: 750, deviceScaleFactor: 1, browserZoom: 1 },
    note: 'Original files remain immutable. Normalized files are separate 750px comparison baselines.',
    entries,
  };
  writeFileSync(resolve(projectRoot, 'references', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = prepareReferences();
  process.stdout.write(`Prepared ${manifest.entries.length} normalized references.\n`);
}
