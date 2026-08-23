import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const root = process.cwd();
const evidenceRoot = join(root, '.harness/traces/gba-talent-conference/schedule-production');
const releaseRoot = join(evidenceRoot, 'release');
const widths = [320, 375, 390, 414, 430, 480];
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const buildReceipt = readJson(join(releaseRoot, 'commands/build.receipt.json'));
const previewReceipt = readJson(join(releaseRoot, 'preview.receipt.json'));

assert.equal(buildReceipt.status, 'passed', 'Production build receipt did not pass');
assert.equal(previewReceipt.status, 'ready', 'Production preview receipt is not ready');
assert.equal(previewReceipt.buildArtifactSha256, buildReceipt.artifactSha256, 'Preview artifact does not match build');

function verifyCapture(path, expectedWidth) {
  const capture = readJson(path);
  assert.equal(capture.status, 'captured', `${basename(path)} was not captured`);
  assert.deepEqual(capture.strictFailures, [], `${basename(path)} has strict failures`);
  assert.deepEqual(capture.consoleErrors, [], `${basename(path)} has console errors`);
  assert.deepEqual(capture.pageErrors, [], `${basename(path)} has page errors`);
  assert.deepEqual(capture.failedRequests, [], `${basename(path)} has failed requests`);
  assert.deepEqual(capture.httpErrors, [], `${basename(path)} has HTTP errors`);
  assert.equal(capture.metrics.horizontalOverflow, false, `${basename(path)} overflows horizontally`);
  assert.equal(capture.metrics.document.scrollWidth, capture.metrics.document.clientWidth, `${basename(path)} width mismatch`);
  assert.equal(capture.metrics.viewport.width, expectedWidth, `${basename(path)} viewport mismatch`);
  assert.equal(capture.contract.productionPreview.buildArtifactSha256, buildReceipt.artifactSha256, `${basename(path)} artifact mismatch`);
  return {
    name: basename(path),
    viewport: capture.metrics.viewport,
    horizontalOverflow: capture.metrics.horizontalOverflow,
    visibleInteractiveElements: capture.metrics.domAudit.visibleInteractiveElementCount,
    consoleErrors: capture.consoleErrors.length,
    failedRequests: capture.failedRequests.length,
  };
}

const responsive = widths.map((width) => verifyCapture(
  join(releaseRoot, `responsive/schedule-${width}.capture.json`),
  width,
));
const interaction = verifyCapture(join(releaseRoot, 'quality/interaction.capture.json'), 390);
const textScale200 = verifyCapture(join(releaseRoot, 'quality/text-scale-200.capture.json'), 320);

const css = Buffer.concat([
  readFileSync(join(root, 'dist/schedule.css')),
  readFileSync(join(root, 'dist/design-system/tokens/design-tokens.css')),
]);
const js = Buffer.concat([
  readFileSync(join(root, 'dist/schedule.js')),
  readFileSync(join(root, 'dist/schedule-model.js')),
]);
const budgets = {
  cssGzipBytes: gzipSync(css).length,
  cssGzipMaxBytes: 80 * 1024,
  jsGzipBytes: gzipSync(js).length,
  jsGzipMaxBytes: 200 * 1024,
};
assert.ok(budgets.cssGzipBytes <= budgets.cssGzipMaxBytes, 'CSS gzip budget exceeded');
assert.ok(budgets.jsGzipBytes <= budgets.jsGzipMaxBytes, 'JavaScript gzip budget exceeded');

const assetDir = join(root, 'dist/public/assets/schedule');
const imageFiles = readdirSync(assetDir).filter((name) => name.endsWith('.png')).sort();
const images = imageFiles.map((name) => {
  const bytes = statSync(join(assetDir, name)).size;
  assert.ok(bytes <= 100 * 1024, `${name} exceeds the image budget`);
  return { name, bytes, maximum: 100 * 1024 };
});
const provenanceFiles = readdirSync(assetDir).filter((name) => name.endsWith('.asset.json')).sort();
assert.equal(provenanceFiles.length, imageFiles.length, 'Every image needs provenance');
const provenance = provenanceFiles.map((name) => {
  const record = readJson(join(assetDir, name));
  assert.equal(record.atomicAndRightsConfirmed, true, `${name} is not an approved atomic asset`);
  return { name, sourceSha256: record.source.sha256, outputSha256: record.output.sha256 };
});

const distributableText = ['schedule.html', 'schedule.css', 'schedule.js', 'schedule-model.js']
  .map((name) => readFileSync(join(root, 'dist', name), 'utf8'))
  .join('\n')
  .replaceAll('http://www.w3.org/2000/svg', '');
assert.doesNotMatch(distributableText, /https?:\/\/(?!127\.0\.0\.1)/i, 'Unexpected remote URL in schedule artifact');
assert.doesNotMatch(distributableText, /(?:api[_-]?key|secret|password)\s*[:=]/i, 'Potential secret in schedule artifact');
assert.doesNotMatch(distributableText, /innerHTML|insertAdjacentHTML|\b(?:eval|Function)\s*\(/, 'Unsafe HTML or code execution');

const stabilityPairs = ['02-03', '02-04', '03-04'].map((pair) => {
  const metrics = readJson(join(evidenceRoot, `final/stability/${pair}/metrics.json`));
  assert.equal(metrics.status, 'passed', `${pair} stability failed`);
  assert.equal(metrics.exactMismatchPixels, 0, `${pair} stability is not exact`);
  return { pair, exactMismatchPixels: metrics.exactMismatchPixels };
});
const visual = readJson(join(evidenceRoot, 'diffs/reference-final/metrics.json'));
assert.equal(visual.claimLevel, 'blocked', 'Visual grade must remain blocked for unequal dimensions');
assert.equal(visual.dimensionsMatch, false, 'Reference and candidate unexpectedly match dimensions');

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
    mainDocumentSha256: previewReceipt.mainDocumentSha256,
  },
  responsive,
  interaction,
  textScale200,
  budgets,
  images,
  provenance,
  stabilityPairs,
  visual: {
    status: visual.status,
    claimLevel: visual.claimLevel,
    reference: { width: visual.reference.width, height: visual.reference.height },
    candidate: { width: visual.candidate.width, height: visual.candidate.height },
    failure: visual.failure,
  },
  externalBlockers: [
    'The formal agenda, message, assistant, service, profile and map contracts were not supplied.',
    'The screenshot copy is not registered as approved-static production business data.',
    'Safari and WeChat real-device evidence is not available in this local run.',
  ],
};

const output = join(releaseRoot, 'quality-summary.json');
writeFileSync(output, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Schedule production evidence passed. Summary: ${output}`);
