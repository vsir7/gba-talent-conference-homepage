import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';

const root = process.cwd();
const evidenceRoot = join(
  root,
  '.harness/traces/gba-talent-conference/home-production',
);
const releaseRoot = join(evidenceRoot, 'release');
const widths = [320, 375, 390, 414, 430, 480];

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const buildReceipt = readJson(join(releaseRoot, 'commands/build.receipt.json'));
const previewReceipt = readJson(join(releaseRoot, 'preview.receipt.json'));
assert.equal(buildReceipt.status, 'passed', 'Production build receipt did not pass');
assert.equal(previewReceipt.status, 'ready', 'Production preview receipt is not ready');
assert.equal(
  previewReceipt.buildArtifactSha256,
  buildReceipt.artifactSha256,
  'Production preview does not serve the verified build artifact',
);

function verifyCapture(path, expectedWidth) {
  const capture = readJson(path);
  assert.equal(capture.status, 'captured', `${basename(path)} was not captured`);
  assert.deepEqual(capture.strictFailures, [], `${basename(path)} has strict failures`);
  assert.deepEqual(capture.consoleErrors, [], `${basename(path)} has console errors`);
  assert.deepEqual(capture.pageErrors, [], `${basename(path)} has page errors`);
  assert.deepEqual(capture.failedRequests, [], `${basename(path)} has failed requests`);
  assert.deepEqual(capture.httpErrors, [], `${basename(path)} has HTTP errors`);
  assert.equal(capture.readiness.fontsReady, true, `${basename(path)} fonts are not ready`);
  assert.equal(capture.readiness.imagesReady, true, `${basename(path)} images are not ready`);
  assert.equal(
    capture.contract.productionPreview.buildArtifactSha256,
    buildReceipt.artifactSha256,
    `${basename(path)} was not captured from the verified build artifact`,
  );
  assert.equal(capture.metrics.horizontalOverflow, false, `${basename(path)} overflows horizontally`);
  assert.equal(
    capture.metrics.document.scrollWidth,
    capture.metrics.document.clientWidth,
    `${basename(path)} document width is inconsistent`,
  );
  if (expectedWidth) {
    assert.equal(capture.metrics.viewport.width, expectedWidth, `${basename(path)} viewport mismatch`);
  }

  return {
    name: basename(path),
    viewport: capture.metrics.viewport,
    screenshot: capture.screenshot,
    documentHeight: capture.metrics.document.scrollHeight,
    horizontalOverflow: capture.metrics.horizontalOverflow,
    consoleErrors: capture.consoleErrors.length,
    pageErrors: capture.pageErrors.length,
    failedRequests: capture.failedRequests.length,
    httpErrors: capture.httpErrors.length,
  };
}

const responsive = widths.map((width) => verifyCapture(
  join(releaseRoot, `responsive/home-${width}.capture.json`),
  width,
));
const interaction = verifyCapture(join(releaseRoot, 'quality/interaction.capture.json'), 390);
const textScale200 = verifyCapture(join(releaseRoot, 'quality/text-scale-200.capture.json'), 320);

const css = readFileSync(join(root, 'dist/styles.css'));
const tokenCss = readFileSync(join(root, 'dist/design-system/tokens/design-tokens.css'));
const js = readFileSync(join(root, 'dist/app.js'));
const budgets = {
  cssGzipBytes: gzipSync(Buffer.concat([css, tokenCss])).length,
  cssGzipMaxBytes: 80 * 1024,
  jsGzipBytes: gzipSync(js).length,
  jsGzipMaxBytes: 200 * 1024,
};
assert.ok(budgets.cssGzipBytes <= budgets.cssGzipMaxBytes, 'CSS gzip budget exceeded');
assert.ok(budgets.jsGzipBytes <= budgets.jsGzipMaxBytes, 'JavaScript gzip budget exceeded');

const assetDir = join(root, 'dist/public/assets/reference');
const imageFiles = readdirSync(assetDir).filter((name) => name.endsWith('.png')).sort();
const images = imageFiles.map((name) => {
  const bytes = statSync(join(assetDir, name)).size;
  const maximum = name.startsWith('hero-') || name.startsWith('opening-')
    ? 300 * 1024
    : 100 * 1024;
  assert.ok(bytes <= maximum, `${name} exceeds its image budget`);
  return { name, bytes, maximum };
});

const provenanceFiles = readdirSync(assetDir)
  .filter((name) => name.endsWith('.asset.json'))
  .sort();
assert.equal(provenanceFiles.length, imageFiles.length, 'Every image needs an asset provenance record');
const provenance = provenanceFiles.map((name) => {
  const record = readJson(join(assetDir, name));
  assert.equal(record.atomicAndRightsConfirmed, true, `${name} is not approved as an atomic asset`);
  return {
    name,
    atomicAndRightsConfirmed: record.atomicAndRightsConfirmed,
    sourceSha256: record.source?.sha256,
    outputSha256: record.output?.sha256,
  };
});

const distributableText = [
  readFileSync(join(root, 'dist/index.html'), 'utf8'),
  readFileSync(join(root, 'dist/styles.css'), 'utf8'),
  readFileSync(join(root, 'dist/app.js'), 'utf8'),
].join('\n');
assert.doesNotMatch(distributableText, /https?:\/\/(?!127\.0\.0\.1)/i, 'Unexpected remote URL in artifact');
assert.doesNotMatch(distributableText, /(?:api[_-]?key|secret|password)\s*[:=]/i, 'Potential secret in artifact');
assert.doesNotMatch(distributableText, /\b(?:eval|Function)\s*\(/, 'Dynamic code execution is forbidden');

const visual = readJson(join(evidenceRoot, 'diffs/reference-final/metrics.json'));
assert.equal(visual.claimLevel, 'blocked', 'The visual verdict must remain honest when dimensions differ');
assert.equal(visual.dimensionsMatch, false, 'Reference and candidate unexpectedly report equal dimensions');

const stabilityPairs = ['01-02', '01-03', '02-03'].map((pair) => {
  const metrics = readJson(join(evidenceRoot, `final/stability/${pair}/metrics.json`));
  assert.equal(metrics.status, 'passed', `Stability comparison ${pair} failed`);
  assert.equal(metrics.exactMismatchPixels, 0, `Stability comparison ${pair} is not exact`);
  return {
    pair,
    status: metrics.status,
    exactMismatchPixels: metrics.exactMismatchPixels,
    mismatchRatio: metrics.mismatchRatio,
  };
});

const summary = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  verdict: {
    frontendQualityGates: 'passed',
    visualGrade: 'blocked',
    productionGrade: 'integration-blocked',
  },
  artifact: {
    sha256: buildReceipt.artifactSha256,
    previewUrl: previewReceipt.url,
    previewMainDocumentSha256: previewReceipt.mainDocumentSha256,
  },
  responsive,
  interaction,
  textScale200,
  budgets,
  images,
  provenance,
  visual: {
    status: visual.status,
    claimLevel: visual.claimLevel,
    dimensionsMatch: visual.dimensionsMatch,
    reference: { width: visual.reference.width, height: visual.reference.height },
    candidate: { width: visual.candidate.width, height: visual.candidate.height },
    failure: visual.failure,
  },
  stabilityPairs,
  externalBlockers: [
    'Formal registration, agenda and news routes or APIs were not supplied.',
    'Approved production business content was not supplied.',
    'Safari and WeChat real-device compatibility evidence is not available in this local run.',
  ],
};

const output = join(releaseRoot, 'quality-summary.json');
writeFileSync(output, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Production evidence checks passed. Summary: ${output}`);
