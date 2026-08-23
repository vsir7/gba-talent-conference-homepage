#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  ensureFile,
  loadPackage,
  sha256Artifact,
  sha256File,
  writeJson,
} from "./lib/runtime.mjs";

function usage() {
  return `Usage:
  node verify_acceptance.mjs --manifest <json> --output <json>

Fail-closed final verifier for render-contract, strict-capture, stability, pixel,
shortcut-icon, production-build, and release evidence. It does not run project commands.`;
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--manifest" || arg === "--output") {
      const next = argv[i + 1];
      if (!next) throw new Error(`${arg} requires a value`);
      opts[arg.slice(2)] = next;
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
    }
  }
  if (!opts.manifest || !opts.output) throw new Error(`Missing --manifest or --output.\n\n${usage()}`);
  return opts;
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Cannot parse ${label} JSON ${file}: ${error.message}`);
  }
}

function localPath(base, value, label, errors, { file = true, directory = false } = {}) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${label} is required`);
    return null;
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    errors.push(`${label} must be a local path, not a URL`);
    return null;
  }
  const absolute = path.isAbsolute(value) ? value : path.resolve(base, value);
  if (!fs.existsSync(absolute)) {
    errors.push(`${label} does not exist: ${absolute}`);
    return null;
  }
  const stats = fs.statSync(absolute);
  if (file && !stats.isFile()) {
    errors.push(`${label} must be a file: ${absolute}`);
    return null;
  }
  if (directory && !stats.isDirectory()) {
    errors.push(`${label} must be a directory: ${absolute}`);
    return null;
  }
  return absolute;
}

function text(value) {
  return typeof value === "string" && value.trim() && !/replace-me|YYYY-MM-DD/i.test(value);
}

function digest(value) {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/i.test(value);
}

function isTrivialPassCommand(value) {
  return typeof value === "string" && /^\s*(?:true|:|exit\s+0|(?:echo|printf)\b[^;&|]*)\s*$/i.test(value);
}

function same(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function pairKey(a, b) {
  return [path.resolve(a), path.resolve(b)].sort().join("\n");
}

function validateMarkdownMatrix(content, ids, label, errors, { requiredInvolved = [], finalMustPass = false } = {}) {
  const rows = new Map();
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 7 || !ids.includes(cells[0])) continue;
    if (rows.has(cells[0])) errors.push(`${label} has duplicate row ${cells[0]}`);
    rows.set(cells[0], cells);
  }
  for (const id of ids) {
    const cells = rows.get(id);
    if (!cells) {
      errors.push(`${label} is missing row ${id}`);
      continue;
    }
    const status = cells[2];
    const involved = status === "涉及";
    const notApplicable = /^N\/A(?:\s*[:：-].*)?$/i.test(status);
    if (!(involved || notApplicable)) {
      errors.push(`${label} row ${id} status must be 涉及 or N/A with an optional reason`);
    }
    if (requiredInvolved.includes(id) && status !== "涉及") {
      errors.push(`${label} row ${id} is always required and must be marked 涉及`);
    }
    for (let index = 3; index <= 6; index += 1) {
      if (!text(cells[index])) errors.push(`${label} row ${id} column ${index + 1} must be completed`);
    }
    if (involved && !/^pass$/i.test(cells[5])) {
      errors.push(`${label} row ${id} is involved, so result must be pass`);
    }
    if (notApplicable && !/^N\/A(?:\s*[:：-].+)$/i.test(cells[5])) {
      errors.push(`${label} row ${id} is N/A, so result must be N/A with a reason`);
    }
    if (finalMustPass && involved && !/^pass$/i.test(cells[6])) {
      errors.push(`${label} row ${id} is involved, so final review must be pass`);
    }
    if (finalMustPass && notApplicable && !/^N\/A(?:\s*[:：-].+)$/i.test(cells[6])) {
      errors.push(`${label} row ${id} is N/A, so final review must be N/A with a reason`);
    }
  }
}

function backgroundColor(hex) {
  const value = hex.replace(/^#/, "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
    alpha: 1,
  };
}

async function comparablePixels(sharp, file, background) {
  let pipeline = sharp(file, { limitInputPixels: false }).rotate().toColourspace("srgb");
  if (background) pipeline = pipeline.flatten({ background: backgroundColor(background) });
  return await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

async function recomputeComparison(sharp, reference, candidate, {
  channelTolerance = 0,
  maxMismatchRatio = 0,
  minPixelSimilarity = 1,
  mask = null,
  background = null,
} = {}) {
  const ref = await comparablePixels(sharp, reference, background);
  const actual = await comparablePixels(sharp, candidate, background);
  if (ref.info.width !== actual.info.width || ref.info.height !== actual.info.height) {
    return { dimensionsMatch: false, passed: false };
  }
  let maskPixels = null;
  if (mask) {
    const decoded = await sharp(mask, { limitInputPixels: false })
      .rotate()
      .toColourspace("b-w")
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (decoded.info.width !== ref.info.width || decoded.info.height !== ref.info.height) {
      return { dimensionsMatch: true, maskDimensionsMatch: false, passed: false };
    }
    maskPixels = decoded.data;
  }

  const totalPixels = ref.info.width * ref.info.height;
  let excludedPixels = 0;
  let exactMismatchPixels = 0;
  let toleratedMismatchPixels = 0;
  let totalAbsoluteChannelError = 0;
  for (let pixel = 0; pixel < totalPixels; pixel += 1) {
    if (maskPixels && maskPixels[pixel] > 127) {
      excludedPixels += 1;
      continue;
    }
    const offset = pixel * 4;
    let pixelMax = 0;
    for (let channel = 0; channel < 4; channel += 1) {
      const error = Math.abs(ref.data[offset + channel] - actual.data[offset + channel]);
      pixelMax = Math.max(pixelMax, error);
      totalAbsoluteChannelError += error;
    }
    if (pixelMax > 0) exactMismatchPixels += 1;
    if (pixelMax > channelTolerance) toleratedMismatchPixels += 1;
  }
  const evaluatedPixels = totalPixels - excludedPixels;
  if (evaluatedPixels <= 0) return { dimensionsMatch: true, evaluatedPixels, passed: false };
  const exactMismatchRatio = exactMismatchPixels / evaluatedPixels;
  const toleratedMismatchRatio = toleratedMismatchPixels / evaluatedPixels;
  const pixelSimilarity = 1 - totalAbsoluteChannelError / (evaluatedPixels * 4 * 255);
  return {
    dimensionsMatch: true,
    maskDimensionsMatch: true,
    totalPixels,
    evaluatedPixels,
    excludedPixels,
    excludedRatio: excludedPixels / totalPixels,
    exactMismatchPixels,
    exactMismatchRatio,
    toleratedMismatchPixels,
    toleratedMismatchRatio,
    pixelSimilarity,
    exactPass: exactMismatchPixels === 0,
    thresholdPass: toleratedMismatchRatio <= maxMismatchRatio && pixelSimilarity >= minPixelSimilarity,
  };
}

function closeNumber(actual, expected, epsilon = 1e-12) {
  return Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) <= epsilon;
}

function validateCommandReceipt(receiptPath, {
  label,
  expectedName,
  expectedCommand,
  expectedRunId,
  expectedCwd,
}, errors) {
  const receipt = readJson(receiptPath, label);
  if (
    receipt.schemaVersion !== 1 ||
    receipt.tool !== "run_production_command" ||
    receipt.runId !== expectedRunId ||
    receipt.status !== "passed" ||
    receipt.exitCode !== 0
  ) {
    errors.push(`${label} tool/schemaVersion/runId/status/exitCode is invalid`);
  }
  if (receipt.name !== expectedName) errors.push(`${label} name does not match ${expectedName}`);
  if (receipt.command !== expectedCommand) errors.push(`${label} command does not match the registered command`);
  if (path.resolve(receipt.cwd || "") !== path.resolve(expectedCwd || "")) errors.push(`${label} cwd does not match project root`);
  const startedAt = Date.parse(receipt.startedAt);
  const finishedAt = Date.parse(receipt.finishedAt);
  if (!Number.isFinite(startedAt) || !Number.isFinite(finishedAt) || finishedAt < startedAt) {
    errors.push(`${label} timestamps are invalid`);
  }
  const log = localPath(path.dirname(receiptPath), receipt.log, `${label}.log`, errors);
  if (!digest(receipt.logSha256) || (log && sha256File(log) !== receipt.logSha256)) {
    errors.push(`${label}.logSha256 is stale or invalid`);
  }
  return receipt;
}

function compareContract(report, manifest, index, errors) {
  const prefix = `captureReports[${index}]`;
  const expected = manifest.render;
  const actual = report.contract ?? {};
  const fields = [
    ["cssViewport", actual.cssViewport, expected.cssViewport],
    ["deviceScaleFactor", actual.deviceScaleFactor, expected.deviceScaleFactor],
    ["isMobile", actual.isMobile, expected.isMobile],
    ["hasTouch", actual.hasTouch, expected.hasTouch],
    ["screenshotScale", actual.screenshotScale, expected.screenshotScale],
    ["animations", actual.animations, expected.animations],
    ["fullPage", actual.fullPage, expected.captureMode === "full-page"],
    ["selector", actual.selector, expected.captureMode === "selector" ? expected.selector : null],
    ["serviceWorkers", actual.serviceWorkers, expected.serviceWorkers],
    ["browser", actual.browser, expected.browser],
    ["locale", actual.locale, expected.locale],
    ["timezone", actual.timezone, expected.timezone],
    ["colorScheme", actual.colorScheme, expected.colorScheme],
    ["reducedMotion", actual.reducedMotion, expected.reducedMotion],
    ["hideScrollbars", actual.hideScrollbars, expected.hideScrollbars],
    ["stabilizeCss", actual.stabilizeCss, expected.stabilizeCss],
    ["warmScroll", actual.warmScroll, expected.warmScroll],
    ["warmupCaptures", actual.warmupCaptures, expected.warmupCaptures],
    ["warmupFullPage", actual.warmupFullPage, expected.warmupFullPage],
    ["warmupPhase", actual.warmupPhase, expected.warmupPhase],
    ["settleMs", actual.settleMs, expected.settleMs],
    ["waitFor", actual.waitFor, expected.waitFor],
    ["allowedHttpErrorPatterns", actual.allowedHttpErrorPatterns, expected.allowedHttpErrorPatterns],
    ["requireNetworkIdle", actual.requireNetworkIdle, expected.requireNetworkIdle],
    ["expectedStatus", actual.expectedStatus, expected.expectedHttpStatus],
    ["expectedFinalUrl", actual.expectedFinalUrl, manifest.state?.expectedFinalUrl],
    ["serverKind", actual.serverKind, expected.serverKind],
  ];
  for (const [name, actualValue, expectedValue] of fields) {
    if (!same(actualValue, expectedValue)) {
      errors.push(`${prefix}.contract.${name} does not match manifest`);
    }
  }
  if (actual.strict !== true) errors.push(`${prefix} was not captured with --strict`);
  if (report.contract?.browserVersion !== expected.browserVersion) {
    errors.push(`${prefix}.contract.browserVersion does not match manifest`);
  }
  const osValue = report.runtime
    ? `${report.runtime.platform} ${report.runtime.release} ${report.runtime.arch}`
    : null;
  if (osValue !== expected.operatingSystem) errors.push(`${prefix}.runtime operating system does not match manifest`);
  if (report.runtime?.node !== expected.nodeVersion) errors.push(`${prefix}.runtime.node does not match manifest`);
  if (report.dependency?.playwrightVersion !== expected.playwrightVersion) {
    errors.push(`${prefix}.dependency.playwrightVersion does not match manifest`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const manifestPath = ensureFile(opts.manifest, "pixel-perfect manifest");
  const base = path.dirname(manifestPath);
  const manifest = readJson(manifestPath, "manifest");
  const errors = [];
  const warnings = [];

  if (manifest.version !== 4) {
    errors.push("manifest.version must be 4; legacy manifests cannot bypass the visual-fidelity gate");
  }
  if (!text(manifest.taskId)) errors.push("taskId must be a non-placeholder string");
  if (!text(manifest.page)) errors.push("page must be a non-placeholder string");
  const serialized = JSON.stringify(manifest);
  if (/replace-me|replace-after|YYYY-MM-DD/i.test(serialized)) {
    errors.push("manifest still contains placeholder values");
  }
  if (!Array.isArray(manifest.unknowns) || manifest.unknowns.length > 0) {
    errors.push("unknowns must be an empty array for final acceptance");
  }
  const runId = manifest.evidence?.runId;
  if (!text(runId)) errors.push("evidence.runId must be a non-placeholder string");
  const manifestDigest = sha256File(manifestPath);
  const visualFidelityResultPath = localPath(
    base,
    manifest.evidence?.visualFidelityResult,
    "evidence.visualFidelityResult",
    errors
  );
  let visualFidelityResult = null;
  const freshVisualPairMetrics = [];
  let freshVisualFinalMetric = null;
  if (visualFidelityResultPath) {
    visualFidelityResult = readJson(visualFidelityResultPath, "visual fidelity result");
    if (
      visualFidelityResult.schemaVersion !== 1 ||
      visualFidelityResult.tool !== "verify_visual_fidelity" ||
      visualFidelityResult.runId !== runId ||
      visualFidelityResult.passed !== true ||
      path.resolve(visualFidelityResult.manifest?.path || "") !== path.resolve(manifestPath) ||
      visualFidelityResult.manifest?.sha256 !== manifestDigest
    ) {
      errors.push("evidence.visualFidelityResult is not a passed result bound to this manifest and run");
    }
    if (
      !Array.isArray(visualFidelityResult.stability?.freshPairwiseMetrics) ||
      visualFidelityResult.stability.freshPairwiseMetrics.length < 3 ||
      !text(visualFidelityResult.freshFinalComparisonMetrics)
    ) {
      errors.push("evidence.visualFidelityResult lacks fresh pixel recomputation evidence");
   } else {
     for (const [index, metricPath] of visualFidelityResult.stability.freshPairwiseMetrics.entries()) {
        const absolute = localPath(
          path.dirname(visualFidelityResultPath),
          metricPath,
          `visual fidelity freshPairwiseMetrics[${index}]`,
          errors
        );
        if (absolute) {
          freshVisualPairMetrics.push({
            path: absolute,
            metric: readJson(absolute, `visual fidelity fresh pairwise metric ${index}`),
          });
        }
     }
      const absoluteFinal = localPath(
       path.dirname(visualFidelityResultPath),
       visualFidelityResult.freshFinalComparisonMetrics,
       "visual fidelity freshFinalComparisonMetrics",
       errors
     );
      if (absoluteFinal) {
        freshVisualFinalMetric = {
          path: absoluteFinal,
          metric: readJson(absoluteFinal, "visual fidelity fresh final comparison metric"),
        };
      }
   }
  }

  const acceptanceMode = manifest.acceptance?.mode;
  if (!Number.isInteger(manifest.acceptance?.channelTolerance) || manifest.acceptance.channelTolerance < 0 || manifest.acceptance.channelTolerance > 255) {
    errors.push("acceptance.channelTolerance must be an integer from 0 to 255");
  }
  for (const field of ["maxMismatchRatio", "minPixelSimilarity"]) {
    if (!Number.isFinite(manifest.acceptance?.[field]) || manifest.acceptance[field] < 0 || manifest.acceptance[field] > 1) {
      errors.push(`acceptance.${field} must be between 0 and 1`);
    }
  }
  if (acceptanceMode === "exact" && (
    manifest.acceptance.channelTolerance !== 0 ||
    manifest.acceptance.maxMismatchRatio !== 0 ||
    manifest.acceptance.minPixelSimilarity !== 1 ||
    manifest.acceptance.mask !== null ||
    manifest.acceptance.background !== null
  )) {
    errors.push("exact acceptance requires fixed 0/0/1 thresholds with no mask or background transform");
  }
  if (!new Set(["exact", "thresholded"]).has(acceptanceMode)) {
    errors.push("acceptance.mode must be exact or thresholded");
  }

  if (manifest.state?.fixture !== null) errors.push("release-ready final acceptance forbids state.fixture");
  if (manifest.state?.stateScript !== null) errors.push("release-ready final acceptance forbids state.stateScript business/UI injection");
  if (!new Set(["live-api", "approved-static", "none"]).has(manifest.state?.dataKind)) {
    errors.push("state.dataKind must be live-api, approved-static, or none");
  }

  const reference = localPath(base, manifest.reference?.path, "reference.path", errors);
  const { module: sharp, resolution } = await loadPackage("sharp");
  if (!digest(manifest.reference?.sha256)) errors.push("reference.sha256 must be a SHA-256 digest");
  if (reference) {
    const actualHash = sha256File(reference);
    if (actualHash !== manifest.reference.sha256) errors.push("reference.sha256 does not match the reference file");
    const metadata = await sharp(reference, { limitInputPixels: false }).rotate().metadata();
    if (metadata.width !== manifest.reference.pixelWidth || metadata.height !== manifest.reference.pixelHeight) {
      errors.push("reference pixel dimensions do not match the file");
    }
    if (Boolean(metadata.hasAlpha) !== manifest.reference.hasAlpha) {
      errors.push("reference.hasAlpha does not match the reference file");
    }
  }

  const referenceMetadataPath = localPath(base, manifest.evidence?.referenceMetadata, "evidence.referenceMetadata", errors);
  if (referenceMetadataPath) {
    const metadataReport = readJson(referenceMetadataPath, "reference metadata");
    if (metadataReport.tool !== "inspect_reference" || metadataReport.schemaVersion !== 1) {
      errors.push("evidence.referenceMetadata has an unexpected tool or schemaVersion");
    }
    if (reference && path.resolve(metadataReport.input || "") !== path.resolve(reference)) {
      errors.push("evidence.referenceMetadata input does not match reference.path");
    }
    if (metadataReport.sha256 !== manifest.reference?.sha256) {
      errors.push("evidence.referenceMetadata sha256 does not match reference.sha256");
    }
    if (
      metadataReport.orientedPixelSize?.width !== manifest.reference?.pixelWidth ||
      metadataReport.orientedPixelSize?.height !== manifest.reference?.pixelHeight ||
      Boolean(metadataReport.hasAlpha) !== manifest.reference?.hasAlpha
    ) {
      errors.push("evidence.referenceMetadata dimensions or alpha do not match manifest reference");
    }
  }

  for (const field of ["browserVersion", "operatingSystem", "nodeVersion", "playwrightVersion"]) {
    if (!text(manifest.render?.[field])) errors.push(`render.${field} is required for final acceptance`);
  }
  if (!text(manifest.state?.expectedFinalUrl)) errors.push("state.expectedFinalUrl is required");
  if (!Number.isInteger(manifest.render?.expectedHttpStatus)) errors.push("render.expectedHttpStatus must be an integer");
  if (!new Set(["viewport", "full-page", "selector"]).has(manifest.render?.captureMode)) {
    errors.push("render.captureMode must be viewport, full-page, or selector");
  }
  if (manifest.reference?.captureType !== manifest.render?.captureMode) {
    errors.push("reference.captureType must match render.captureMode");
  }
  if (
    manifest.render?.expectedPixelSize?.width !== manifest.reference?.pixelWidth ||
    manifest.render?.expectedPixelSize?.height !== manifest.reference?.pixelHeight
  ) {
    errors.push("render.expectedPixelSize must match reference pixel dimensions");
  }
  if (manifest.render?.captureMode === "selector" && !text(manifest.render?.selector)) {
    errors.push("render.selector is required for selector capture mode");
  }
  const domPolicy = manifest.render?.domPolicy ?? {};
  if (domPolicy.realDomRequired !== true || domPolicy.forbidViewportRaster !== true) {
    errors.push("render.domPolicy must require real DOM and forbid viewport-covering raster/canvas/SVG impostors");
  }
  if (!Number.isInteger(domPolicy.minimumVisibleElements) || domPolicy.minimumVisibleElements < 3) {
    errors.push("render.domPolicy.minimumVisibleElements must be an integer >= 3");
  }
  if (!Number.isInteger(domPolicy.minimumVisibleTextElements) || domPolicy.minimumVisibleTextElements < 1) {
    errors.push("render.domPolicy.minimumVisibleTextElements must be an integer >= 1");
  }
  if (!Number.isInteger(domPolicy.minimumInteractiveElements) || domPolicy.minimumInteractiveElements < 1) {
    errors.push("render.domPolicy.minimumInteractiveElements must be an integer >= 1");
  }
  if (!Number.isFinite(domPolicy.maximumCombinedRasterCoverage) || domPolicy.maximumCombinedRasterCoverage < 0 || domPolicy.maximumCombinedRasterCoverage > 0.84) {
    errors.push("render.domPolicy.maximumCombinedRasterCoverage must be between 0 and 0.84");
  }
  if (manifest.acceptance?.mode === "thresholded" || manifest.acceptance?.mask) {
    for (const field of ["approvedBy", "approvedAt", "approvalReason"]) {
      if (!text(manifest.acceptance?.[field])) errors.push(`acceptance.${field} is required for thresholded or masked acceptance`);
    }
  }

  const analysis = localPath(base, manifest.evidence?.analysis, "evidence.analysis", errors);
  const acceptanceReport = localPath(base, manifest.evidence?.acceptanceReport, "evidence.acceptanceReport", errors);
  const releaseReadiness = localPath(base, manifest.evidence?.releaseReadiness, "evidence.releaseReadiness", errors);
  let analysisShortcutInvolved = null;
  if (analysis) {
    const content = fs.readFileSync(analysis, "utf8");
    if (!content.includes(`Evidence Run ID: ${runId}`)) errors.push("evidence.analysis is not bound to the current runId");
    if (!content.includes(`Manifest SHA-256: ${manifestDigest}`)) errors.push("evidence.analysis is not bound to the current manifest SHA-256");
    if (!content.includes(`Reference SHA-256: ${manifest.reference?.sha256}`)) errors.push("evidence.analysis is not bound to the current reference SHA-256");
    if (!/^\s*-?\s*Analysis Status:\s*passed\s*$/im.test(content)) {
      errors.push("evidence.analysis must declare Analysis Status: passed");
    }
    if (!/^\s*-?\s*Unresolved Count:\s*0\s*$/im.test(content)) {
      errors.push("evidence.analysis must declare Unresolved Count: 0");
    }
    const shortcutMatch = content.match(/^\s*-?\s*Shortcut Icons Involved:\s*(true|false)\s*$/im);
    if (!shortcutMatch) errors.push("evidence.analysis must declare Shortcut Icons Involved: true or false");
    else analysisShortcutInvolved = shortcutMatch[1].toLowerCase() === "true";
    validateMarkdownMatrix(
      content,
      Array.from({ length: 50 }, (_, index) => String(index + 1)),
      "visual defect matrix",
      errors,
      { finalMustPass: true }
    );
  }
  if (acceptanceReport) {
    const content = fs.readFileSync(acceptanceReport, "utf8");
    if (!content.includes(`Evidence Run ID: ${runId}`)) errors.push("evidence.acceptanceReport is not bound to the current runId");
    if (!content.includes(`Manifest SHA-256: ${manifestDigest}`)) errors.push("evidence.acceptanceReport is not bound to the current manifest SHA-256");
    if (!content.includes(`Reference SHA-256: ${manifest.reference?.sha256}`)) errors.push("evidence.acceptanceReport is not bound to the current reference SHA-256");
  }

  const productionPreviewReceiptPath = localPath(
    base,
    manifest.delivery?.productionPreviewReceipt,
    "delivery.productionPreviewReceipt",
    errors
  );
  let productionPreviewReceipt = null;
  if (productionPreviewReceiptPath) {
    productionPreviewReceipt = readJson(productionPreviewReceiptPath, "production preview receipt");
    if (
      productionPreviewReceipt.schemaVersion !== 1 ||
      productionPreviewReceipt.tool !== "start_production_preview" ||
      productionPreviewReceipt.runId !== runId ||
      productionPreviewReceipt.status !== "ready"
    ) {
      errors.push("production preview receipt tool/schemaVersion/runId/status is invalid");
    }
    if (
      productionPreviewReceipt.serveMode !== "artifact-static" ||
      productionPreviewReceipt.command !== "mobile-ui-to-code-pixel-perfect:start_production_preview:artifact-static:v1"
    ) {
      errors.push("release-ready requires the controlled artifact-static production preview mode");
    }
    if (productionPreviewReceipt.url !== manifest.render?.url || productionPreviewReceipt.url !== manifest.delivery?.productionPreviewUrl) {
      errors.push("production preview receipt URL does not match render/delivery URL");
    }
    if (productionPreviewReceipt.command !== manifest.delivery?.commands?.productionPreview) {
      errors.push("production preview receipt command does not match delivery.commands.productionPreview");
    }
    const expectedProjectRoot = path.resolve(base, manifest.implementation?.projectRoot || "");
    const expectedBuildArtifact = path.resolve(base, manifest.implementation?.buildArtifact?.path || "");
    if (path.resolve(productionPreviewReceipt.cwd || "") !== expectedProjectRoot) {
      errors.push("production preview receipt cwd does not match implementation.projectRoot");
    }
    if (
      path.resolve(productionPreviewReceipt.buildArtifact || "") !== expectedBuildArtifact ||
      productionPreviewReceipt.buildArtifactSha256 !== manifest.implementation?.buildArtifact?.sha256 ||
      path.resolve(productionPreviewReceipt.servedRoot || "") !== expectedBuildArtifact ||
      productionPreviewReceipt.servedArtifactSha256 !== manifest.implementation?.buildArtifact?.sha256
    ) {
      errors.push("production preview receipt is not bound to the declared production build artifact");
    }
    if (!Number.isInteger(productionPreviewReceipt.pid) || !Number.isFinite(Date.parse(productionPreviewReceipt.processStartedAt)) || !Number.isFinite(Date.parse(productionPreviewReceipt.readyAt))) {
      errors.push("production preview receipt process/timestamps are invalid");
    }
    if (!Number.isInteger(productionPreviewReceipt.httpStatus) || productionPreviewReceipt.httpStatus < 200 || productionPreviewReceipt.httpStatus >= 400) {
      errors.push("production preview receipt HTTP status is not successful");
    }
    if (!digest(productionPreviewReceipt.mainDocumentSha256)) errors.push("production preview receipt mainDocumentSha256 is invalid");
    const previewLog = localPath(path.dirname(productionPreviewReceiptPath), productionPreviewReceipt.log, "production preview receipt log", errors);
    if (!digest(productionPreviewReceipt.logSha256) || (previewLog && sha256File(previewLog) !== productionPreviewReceipt.logSha256)) {
      errors.push("production preview receipt log hash is stale or invalid");
    }
  }

  const capturePaths = manifest.evidence?.captureReports;
  const configuredMinimumCaptures = manifest.acceptance?.minimumStableCaptures;
  if (!Number.isInteger(configuredMinimumCaptures) || configuredMinimumCaptures < 3) {
    errors.push("acceptance.minimumStableCaptures must be an integer >= 3");
  }
  const minimumCaptures = Math.max(3, Number.isInteger(configuredMinimumCaptures) ? configuredMinimumCaptures : 3);
  if (!Array.isArray(capturePaths) || capturePaths.length < minimumCaptures) {
    errors.push(`evidence.captureReports must contain at least ${minimumCaptures} reports`);
  }
  const captureReports = [];
  const screenshotPaths = [];
  const screenshotHashes = [];
  const seenCaptureReportPaths = new Set();
  const seenScreenshotPaths = new Set();
  const seenCaptureIds = new Set();
  const seenCaptureProcesses = new Set();
  const capturedAtValues = [];
  for (const [index, value] of (capturePaths ?? []).entries()) {
    const reportPath = localPath(base, value, `evidence.captureReports[${index}]`, errors);
    if (!reportPath) continue;
    if (seenCaptureReportPaths.has(path.resolve(reportPath))) {
      errors.push(`evidence.captureReports contains duplicate report path: ${reportPath}`);
      continue;
    }
    seenCaptureReportPaths.add(path.resolve(reportPath));
    const report = readJson(reportPath, `capture report ${index}`);
    captureReports.push({ path: reportPath, report });
    if (report.tool !== "capture_page" || report.schemaVersion !== 2 || report.runId !== runId) {
      errors.push(`captureReports[${index}] tool/schemaVersion/runId does not match the gate run`);
    }
    if (!text(report.captureId) || seenCaptureIds.has(report.captureId)) {
      errors.push(`captureReports[${index}] captureId is missing or duplicated`);
    } else {
      seenCaptureIds.add(report.captureId);
    }
    const capturedAt = Date.parse(report.capturedAt);
    if (!Number.isFinite(capturedAt) || capturedAtValues.includes(capturedAt)) {
      errors.push(`captureReports[${index}] capturedAt is invalid or duplicated`);
    } else {
      capturedAtValues.push(capturedAt);
    }
    const processKey = `${report.runtime?.pid ?? "missing"}@${report.runtime?.processStartedAt ?? "missing"}`;
    if (!Number.isInteger(report.runtime?.pid) || !text(report.runtime?.processStartedAt) || seenCaptureProcesses.has(processKey)) {
      errors.push(`captureReports[${index}] process identity is missing or duplicated`);
    } else {
      seenCaptureProcesses.add(processKey);
    }
    if (report.status !== "captured") errors.push(`captureReports[${index}].status must be captured`);
    if (!Array.isArray(report.strictFailures) || report.strictFailures.length > 0) {
      errors.push(`captureReports[${index}] contains strict failures`);
    }
    if (
      report.fontFaceAudit?.inspected !== true ||
      report.fontFaceAudit?.runtimeInstrumentationInstalled !== true ||
      !Array.isArray(report.fontFaceAudit?.inaccessibleFrames) ||
      report.fontFaceAudit.inaccessibleFrames.length > 0 ||
      !Array.isArray(report.fontFaceAudit?.inaccessibleStyleSheets) ||
      !Array.isArray(report.fontFaceAudit?.fontFaceApiRecords) ||
      !Array.isArray(report.fontFaceAudit?.unclassifiedFontFaceApiRecords) ||
      !Array.isArray(report.embeddedFontResources)
    ) {
      errors.push(`captureReports[${index}] lacks the embedded font-face audit`);
    } else if (
      report.fontFaceAudit.inaccessibleStyleSheets.length ||
      report.fontFaceAudit.unclassifiedFontFaceApiRecords.length
    ) {
      errors.push(`captureReports[${index}] contains uninspectable stylesheets or unclassified FontFace API sources`);
    }
    if (report.finalUrl !== manifest.state?.expectedFinalUrl) {
      errors.push(`captureReports[${index}].finalUrl does not match state.expectedFinalUrl`);
    }
    if (report.mainDocument?.status !== manifest.render?.expectedHttpStatus) {
      errors.push(`captureReports[${index}].mainDocument.status does not match render.expectedHttpStatus`);
    }
    if (report.requestedUrl !== manifest.render?.url) {
      errors.push(`captureReports[${index}].requestedUrl does not match render.url`);
    }
    const domAudit = report.metrics?.domAudit;
    if (!domAudit || domAudit.viewportCoverageThreshold !== 0.85) {
      errors.push(`captureReports[${index}] is missing the fixed DOM anti-impostor audit`);
    } else {
      if (domAudit.visibleElementCount < domPolicy.minimumVisibleElements) {
        errors.push(`captureReports[${index}] has too few visible DOM elements`);
      }
      if (domAudit.visibleTextElementCount < domPolicy.minimumVisibleTextElements) {
        errors.push(`captureReports[${index}] has too few visible DOM text elements`);
      }
      if (domAudit.visibleInteractiveElementCount < domPolicy.minimumInteractiveElements) {
        errors.push(`captureReports[${index}] has too few visible interactive DOM elements`);
      }
      if (domPolicy.forbidViewportRaster && (!Array.isArray(domAudit.viewportCoveringVisuals) || domAudit.viewportCoveringVisuals.length > 0)) {
        errors.push(`captureReports[${index}] contains a viewport-covering raster/canvas/SVG/background visual`);
      }
      if (
        !Array.isArray(domAudit.rasterVisuals) ||
        !Number.isFinite(domAudit.rasterCombinedViewportCoverage) ||
        domAudit.rasterCombinedViewportCoverage > domPolicy.maximumCombinedRasterCoverage
      ) {
        errors.push(`captureReports[${index}] exceeds the combined raster/background viewport coverage limit`);
      }
    }
    if ((report.imageResources ?? []).some((resource) => resource.sha256 === manifest.reference?.sha256)) {
      errors.push(`captureReports[${index}] loaded the reference screenshot itself as an image resource`);
    }
    const previewBinding = report.contract?.productionPreview;
    if (
      report.contract?.serverKind !== "production-preview" ||
      !previewBinding ||
      previewBinding.processAliveAtCapture !== true ||
      !productionPreviewReceiptPath ||
      path.resolve(previewBinding.receipt || "") !== path.resolve(productionPreviewReceiptPath) ||
      previewBinding.receiptSha256 !== sha256File(productionPreviewReceiptPath)
    ) {
      errors.push(`captureReports[${index}] is not bound to the live registered production preview`);
    }
    if (productionPreviewReceipt && (
      previewBinding?.pid !== productionPreviewReceipt.pid ||
      previewBinding?.processStartedAt !== productionPreviewReceipt.processStartedAt ||
      path.resolve(previewBinding?.buildArtifact || "") !== path.resolve(productionPreviewReceipt.buildArtifact || "") ||
      previewBinding?.buildArtifactSha256 !== productionPreviewReceipt.buildArtifactSha256 ||
      previewBinding?.mainDocumentSha256 !== productionPreviewReceipt.mainDocumentSha256 ||
      report.mainDocument?.bodySha256 !== productionPreviewReceipt.mainDocumentSha256
    )) {
      errors.push(`captureReports[${index}] production preview binding is stale or inconsistent`);
    }
    const shortcutPolicy = manifest.assetPolicy?.shortcutIcons;
    if (report.shortcutInventoryAudit?.pass !== true || !Array.isArray(report.shortcutInventoryAudit?.candidates)) {
      errors.push(`captureReports[${index}] lacks a passed shortcut inventory completeness audit`);
    }
    const expectedInventoryPath = path.resolve(base, shortcutPolicy?.classificationEvidence || "");
    const inventoryBinding = report.contract?.iconRoleInventory;
    if (
      !inventoryBinding ||
      path.resolve(inventoryBinding.path || "") !== expectedInventoryPath ||
      inventoryBinding.sha256 !== shortcutPolicy?.classificationEvidenceSha256
    ) {
      errors.push(`captureReports[${index}] is not bound to the reviewed icon role inventory`);
    }
    if (shortcutPolicy?.involved) {
      const expectedShortcutManifest = path.resolve(base, shortcutPolicy.manifest || "");
      const shortcutBinding = report.contract?.shortcutManifest;
      if (
        !shortcutBinding ||
        path.resolve(shortcutBinding.path || "") !== expectedShortcutManifest ||
        !fs.existsSync(expectedShortcutManifest) ||
        shortcutBinding.sha256 !== sha256File(expectedShortcutManifest) ||
        !Array.isArray(report.shortcutDomAudit) ||
        report.shortcutDomAudit.length === 0 ||
        report.shortcutDomAudit.some((item) => item.pass !== true || item.actualSha256 !== item.expectedSha256)
      ) {
        errors.push(`captureReports[${index}] does not render the registered shortcut assets in real DOM controls`);
      }
    } else if (!Array.isArray(report.shortcutDomAudit) || report.shortcutDomAudit.length !== 0 || report.contract?.shortcutManifest) {
      errors.push(`captureReports[${index}] shortcut DOM evidence conflicts with involved=false`);
    }
    if (manifest.render?.captureMode === "viewport" && report.pixelSizeMatches !== true) {
      errors.push(`captureReports[${index}].pixelSizeMatches must be true for viewport capture`);
    }
    if (manifest.render?.captureMode !== "viewport" && report.pixelSizeMatches !== null) {
      errors.push(`captureReports[${index}].pixelSizeMatches must be null for full-page or selector capture`);
    }
    if (
      report.screenshot?.width !== manifest.render?.expectedPixelSize?.width ||
      report.screenshot?.height !== manifest.render?.expectedPixelSize?.height
    ) {
      errors.push(`captureReports[${index}] screenshot dimensions do not match render.expectedPixelSize`);
    }
    compareContract(report, manifest, index, errors);
    const stateScriptPath = manifest.state?.stateScript
      ? localPath(base, manifest.state.stateScript, "state.stateScript", errors)
      : null;
    if (stateScriptPath) {
      if (
        path.resolve(report.contract?.stateScript?.path || "") !== path.resolve(stateScriptPath) ||
        report.contract?.stateScript?.sha256 !== sha256File(stateScriptPath)
      ) {
        errors.push(`captureReports[${index}].contract.stateScript does not match manifest stateScript`);
      }
    } else if (report.contract?.stateScript) {
      errors.push(`captureReports[${index}] used an unregistered stateScript`);
    }
    const screenshot = localPath(path.dirname(reportPath), report.output, `captureReports[${index}].output`, errors);
    if (screenshot) {
      if (seenScreenshotPaths.has(path.resolve(screenshot))) {
        errors.push(`captureReports contains duplicate screenshot path: ${screenshot}`);
      }
      seenScreenshotPaths.add(path.resolve(screenshot));
      const hash = sha256File(screenshot);
      if (hash !== report.screenshotSha256) errors.push(`captureReports[${index}].screenshotSha256 does not match`);
      screenshotPaths.push(screenshot);
      screenshotHashes.push(hash);
    }
  }
  if (screenshotHashes.length && new Set(screenshotHashes).size !== 1) {
    errors.push("stable capture screenshot SHA-256 values are not identical");
  }
  for (let index = 1; index < capturedAtValues.length; index += 1) {
    if (capturedAtValues[index] <= capturedAtValues[index - 1]) {
      errors.push("captureReports must be listed in strictly increasing capturedAt order");
      break;
    }
  }
  if (captureReports.length < minimumCaptures || screenshotPaths.length < minimumCaptures) {
    errors.push(`final gate requires at least ${minimumCaptures} unique capture reports and screenshot files`);
  }

  const responsiveReports = [...captureReports];
  const knownResponsiveReports = new Set(captureReports.map((item) => path.resolve(item.path)));
  for (const [index, value] of (manifest.evidence?.responsiveCaptureReports ?? []).entries()) {
    const reportPath = localPath(base, value, `evidence.responsiveCaptureReports[${index}]`, errors);
    if (!reportPath || knownResponsiveReports.has(path.resolve(reportPath))) continue;
    const report = readJson(reportPath, `responsive capture report ${index}`);
    if (report.tool !== "capture_page" || report.schemaVersion !== 2 || report.runId !== runId) {
      errors.push(`responsiveCaptureReports[${index}] tool/schemaVersion/runId does not match the gate run`);
    }
    if (!text(report.captureId) || seenCaptureIds.has(report.captureId)) {
      errors.push(`responsiveCaptureReports[${index}] captureId is missing or duplicated`);
    } else {
      seenCaptureIds.add(report.captureId);
    }
    const processKey = `${report.runtime?.pid ?? "missing"}@${report.runtime?.processStartedAt ?? "missing"}`;
    if (!Number.isInteger(report.runtime?.pid) || !text(report.runtime?.processStartedAt) || seenCaptureProcesses.has(processKey)) {
      errors.push(`responsiveCaptureReports[${index}] process identity is missing or duplicated`);
    } else {
      seenCaptureProcesses.add(processKey);
    }
    if (report.requestedUrl !== manifest.render?.url) {
      errors.push(`responsiveCaptureReports[${index}].requestedUrl does not match render.url`);
    }
    if (
      report.status !== "captured" ||
      !Array.isArray(report.strictFailures) ||
      report.strictFailures.length > 0 ||
      report.finalUrl !== manifest.state?.expectedFinalUrl ||
      report.mainDocument?.status !== manifest.render?.expectedHttpStatus ||
      report.contract?.strict !== true
    ) {
      errors.push(`responsiveCaptureReports[${index}] is not a strict passed capture`);
    }
    if (
      report.fontFaceAudit?.inspected !== true ||
      report.fontFaceAudit?.runtimeInstrumentationInstalled !== true ||
      !Array.isArray(report.fontFaceAudit?.inaccessibleFrames) ||
      report.fontFaceAudit.inaccessibleFrames.length > 0 ||
      !Array.isArray(report.fontFaceAudit?.inaccessibleStyleSheets) ||
      report.fontFaceAudit.inaccessibleStyleSheets.length > 0 ||
      !Array.isArray(report.fontFaceAudit?.fontFaceApiRecords) ||
      !Array.isArray(report.fontFaceAudit?.unclassifiedFontFaceApiRecords) ||
      report.fontFaceAudit.unclassifiedFontFaceApiRecords.length > 0 ||
      !Array.isArray(report.embeddedFontResources)
    ) {
      errors.push(`responsiveCaptureReports[${index}] lacks a complete embedded font-face audit`);
    }
    const responsiveDomAudit = report.metrics?.domAudit;
    if (
      !responsiveDomAudit ||
      responsiveDomAudit.viewportCoverageThreshold !== 0.85 ||
      responsiveDomAudit.visibleElementCount < domPolicy.minimumVisibleElements ||
      responsiveDomAudit.visibleTextElementCount < domPolicy.minimumVisibleTextElements ||
      responsiveDomAudit.visibleInteractiveElementCount < domPolicy.minimumInteractiveElements ||
      !Array.isArray(responsiveDomAudit.viewportCoveringVisuals) ||
      responsiveDomAudit.viewportCoveringVisuals.length > 0 ||
      !Array.isArray(responsiveDomAudit.rasterVisuals) ||
      !Number.isFinite(responsiveDomAudit.rasterCombinedViewportCoverage) ||
      responsiveDomAudit.rasterCombinedViewportCoverage > domPolicy.maximumCombinedRasterCoverage
    ) {
      errors.push(`responsiveCaptureReports[${index}] fails the real-DOM anti-impostor audit`);
    }
    if ((report.imageResources ?? []).some((resource) => resource.sha256 === manifest.reference?.sha256)) {
      errors.push(`responsiveCaptureReports[${index}] loaded the reference screenshot itself as an image resource`);
    }
    const responsivePreview = report.contract?.productionPreview;
    if (
      report.contract?.serverKind !== "production-preview" ||
      !responsivePreview ||
      responsivePreview.processAliveAtCapture !== true ||
      !productionPreviewReceiptPath ||
      path.resolve(responsivePreview.receipt || "") !== path.resolve(productionPreviewReceiptPath) ||
      responsivePreview.receiptSha256 !== sha256File(productionPreviewReceiptPath) ||
      report.mainDocument?.bodySha256 !== productionPreviewReceipt?.mainDocumentSha256
    ) {
      errors.push(`responsiveCaptureReports[${index}] is not bound to the registered production preview`);
    }
    const responsiveInventory = report.contract?.iconRoleInventory;
    if (report.shortcutInventoryAudit?.pass !== true || !Array.isArray(report.shortcutInventoryAudit?.candidates)) {
      errors.push(`responsiveCaptureReports[${index}] lacks a passed shortcut inventory completeness audit`);
    }
    if (
      !responsiveInventory ||
      path.resolve(responsiveInventory.path || "") !== path.resolve(base, manifest.assetPolicy?.shortcutIcons?.classificationEvidence || "") ||
      responsiveInventory.sha256 !== manifest.assetPolicy?.shortcutIcons?.classificationEvidenceSha256
    ) {
      errors.push(`responsiveCaptureReports[${index}] is not bound to the reviewed icon role inventory`);
    }
    if (manifest.assetPolicy?.shortcutIcons?.involved) {
      if (
        !Array.isArray(report.shortcutDomAudit) ||
        report.shortcutDomAudit.length === 0 ||
        report.shortcutDomAudit.some((item) => item.pass !== true || item.actualSha256 !== item.expectedSha256)
      ) errors.push(`responsiveCaptureReports[${index}] fails registered shortcut DOM binding`);
    }
    const screenshot = localPath(path.dirname(reportPath), report.output, `responsiveCaptureReports[${index}].output`, errors);
    if (screenshot) {
      if (seenScreenshotPaths.has(path.resolve(screenshot))) {
        errors.push(`responsiveCaptureReports contains duplicate screenshot path: ${screenshot}`);
      }
      seenScreenshotPaths.add(path.resolve(screenshot));
      if (sha256File(screenshot) !== report.screenshotSha256) {
        errors.push(`responsiveCaptureReports[${index}].screenshotSha256 is stale or invalid`);
      }
    }
    responsiveReports.push({ path: reportPath, report });
    knownResponsiveReports.add(path.resolve(reportPath));
  }
  let requiredResponsiveChecks = 0;
  let passedResponsiveChecks = 0;
  for (const [index, check] of (manifest.responsiveChecks ?? []).entries()) {
    if (check.required !== true) continue;
    requiredResponsiveChecks += 1;
    const match = responsiveReports.find(({ report }) =>
      report.contract?.cssViewport?.width === check.width &&
      report.contract?.cssViewport?.height === check.height &&
      report.contract?.deviceScaleFactor === check.dpr &&
      report.contract?.strict === true &&
      report.status === "captured" &&
      Array.isArray(report.strictFailures) &&
      report.strictFailures.length === 0 &&
      report.finalUrl === manifest.state?.expectedFinalUrl &&
      report.mainDocument?.status === manifest.render?.expectedHttpStatus
    );
    if (!match) errors.push(`responsiveChecks[${index}] has no matching strict passed capture report`);
    else {
      const responsiveManifest = {
        ...manifest,
        render: {
          ...manifest.render,
          cssViewport: { width: check.width, height: check.height },
          deviceScaleFactor: check.dpr,
        },
      };
      compareContract(match.report, responsiveManifest, `responsive-${index}`, errors);
      if (manifest.render.captureMode === "viewport") {
        const expectedWidth = manifest.render.screenshotScale === "device" ? Math.round(check.width * check.dpr) : check.width;
        const expectedHeight = manifest.render.screenshotScale === "device" ? Math.round(check.height * check.dpr) : check.height;
        if (
          match.report.pixelSizeMatches !== true ||
          match.report.screenshot?.width !== expectedWidth ||
          match.report.screenshot?.height !== expectedHeight
        ) errors.push(`responsiveChecks[${index}] screenshot pixel size is invalid`);
      } else if (match.report.pixelSizeMatches !== null) {
        errors.push(`responsiveChecks[${index}] full-page/selector pixelSizeMatches must be null`);
      }
      passedResponsiveChecks += 1;
    }
  }
  const requiredResponsiveWidths = new Set((manifest.responsiveChecks ?? []).filter((check) => check.required === true).map((check) => check.width));
  if (!Array.isArray(manifest.responsiveChecks) || requiredResponsiveChecks < 3 || requiredResponsiveWidths.size < 3) {
    errors.push("responsiveChecks must contain at least three required, distinct mobile viewport widths");
  }

  const requiredPairs = new Set();
  for (let i = 0; i < screenshotPaths.length; i += 1) {
    for (let j = i + 1; j < screenshotPaths.length; j += 1) requiredPairs.add(pairKey(screenshotPaths[i], screenshotPaths[j]));
  }
  const freshVisualObservedPairs = new Set();
  for (const [index, entry] of freshVisualPairMetrics.entries()) {
    const metric = entry.metric;
    const prefix = `visual fidelity freshPairwiseMetrics[${index}]`;
    if (
      metric.tool !== "compare_images" ||
      metric.schemaVersion !== 1 ||
      metric.runId !== runId ||
      metric.mode !== "exact" ||
      metric.status !== "passed" ||
      metric.dimensionsMatch !== true ||
      metric.exactMismatchPixels !== 0 ||
      metric.exactPixelMatch !== true ||
      metric.mask !== null ||
      metric.background !== null
    ) {
      errors.push(`${prefix} is not a run-bound, untransformed exact comparison`);
    }
    const metricReference = localPath(path.dirname(entry.path), metric.reference?.path, `${prefix}.reference.path`, errors);
    const metricCandidate = localPath(path.dirname(entry.path), metric.candidate?.path, `${prefix}.candidate.path`, errors);
    if (metricReference && metricCandidate) {
      if (sha256File(metricReference) !== metric.reference?.sha256) {
        errors.push(`${prefix}.reference.sha256 is stale or invalid`);
      }
      if (sha256File(metricCandidate) !== metric.candidate?.sha256) {
        errors.push(`${prefix}.candidate.sha256 is stale or invalid`);
      }
      const recomputed = await recomputeComparison(sharp, metricReference, metricCandidate);
      if (!recomputed.dimensionsMatch || !recomputed.exactPass) {
        errors.push(`${prefix} fails production verifier pixel recomputation`);
      }
      if (
        metric.exactMismatchPixels !== recomputed.exactMismatchPixels ||
        !closeNumber(metric.pixelSimilarity, recomputed.pixelSimilarity)
      ) {
        errors.push(`${prefix} stored metrics do not match production verifier recomputation`);
      }
      const key = pairKey(metricReference, metricCandidate);
      if (!requiredPairs.has(key)) errors.push(`${prefix} does not compare a required registered capture pair`);
      if (freshVisualObservedPairs.has(key)) errors.push(`${prefix} duplicates a fresh pair`);
      freshVisualObservedPairs.add(key);
    }
  }
  for (const pair of requiredPairs) {
    if (!freshVisualObservedPairs.has(pair)) {
      errors.push(`visual fidelity result is missing a fresh exact pair: ${pair.replace("\n", " <-> ")}`);
    }
  }
  const observedPairs = new Set();
  for (const [index, value] of (manifest.evidence?.stabilityMetrics ?? []).entries()) {
    const metricPath = localPath(base, value, `evidence.stabilityMetrics[${index}]`, errors);
    if (!metricPath) continue;
    const metric = readJson(metricPath, `stability metric ${index}`);
    if (metric.tool !== "compare_images" || metric.schemaVersion !== 1 || metric.runId !== runId) {
      errors.push(`stabilityMetrics[${index}] tool/schemaVersion/runId does not match the gate run`);
    }
    if (
      metric.status !== "passed" ||
      metric.mode !== "exact" ||
      metric.mask ||
      metric.background ||
      metric.exactMismatchPixels !== 0 ||
      metric.exactPixelMatch !== true
    ) {
      errors.push(`stabilityMetrics[${index}] is not an untransformed exact zero-difference result`);
    }
    const metricReference = localPath(path.dirname(metricPath), metric.reference?.path, `stabilityMetrics[${index}].reference.path`, errors);
    const metricCandidate = localPath(path.dirname(metricPath), metric.candidate?.path, `stabilityMetrics[${index}].candidate.path`, errors);
    if (metricReference && metricCandidate) {
      if (path.resolve(metricReference) === path.resolve(metricCandidate)) {
        errors.push(`stabilityMetrics[${index}] compares a file with itself`);
      }
      if (sha256File(metricReference) !== metric.reference?.sha256) {
        errors.push(`stabilityMetrics[${index}].reference.sha256 is stale or invalid`);
      }
      if (sha256File(metricCandidate) !== metric.candidate?.sha256) {
        errors.push(`stabilityMetrics[${index}].candidate.sha256 is stale or invalid`);
      }
      const recomputed = await recomputeComparison(sharp, metricReference, metricCandidate);
      if (!recomputed.dimensionsMatch || !recomputed.exactPass) {
        errors.push(`stabilityMetrics[${index}] fails fresh exact pixel recomputation`);
      }
      if (
        metric.exactMismatchPixels !== recomputed.exactMismatchPixels ||
        !closeNumber(metric.pixelSimilarity, recomputed.pixelSimilarity)
      ) {
        errors.push(`stabilityMetrics[${index}] stored metrics do not match fresh recomputation`);
      }
      const key = pairKey(metricReference, metricCandidate);
      if (observedPairs.has(key)) errors.push(`duplicate stability metric pair: ${key.replace("\n", " <-> ")}`);
      observedPairs.add(key);
    }
  }
  for (const pair of requiredPairs) {
    if (!observedPairs.has(pair)) errors.push(`missing exact stability metric for pair: ${pair.replace("\n", " <-> ")}`);
  }

  let visualGrade = "blocked";
  let registeredFinalReference = null;
  let registeredFinalCandidate = null;
  let registeredFinalMask = null;
  let registeredFinalBackground = null;
  const finalMetricPath = localPath(base, manifest.evidence?.finalComparisonMetrics, "evidence.finalComparisonMetrics", errors);
  if (finalMetricPath) {
    const metric = readJson(finalMetricPath, "final comparison metrics");
    if (metric.tool !== "compare_images" || metric.schemaVersion !== 1 || metric.runId !== runId) {
      errors.push("final comparison tool/schemaVersion/runId does not match the gate run");
    }
    if (metric.status !== "passed") errors.push("final comparison did not pass");
    const metricReference = localPath(path.dirname(finalMetricPath), metric.reference?.path, "final comparison reference.path", errors);
    const metricCandidate = localPath(path.dirname(finalMetricPath), metric.candidate?.path, "final comparison candidate.path", errors);
    registeredFinalReference = metricReference;
    registeredFinalCandidate = metricCandidate;
    if (reference && metricReference && path.resolve(metricReference) !== path.resolve(reference)) {
      errors.push("final comparison reference does not match manifest reference");
    }
    if (metricReference && sha256File(metricReference) !== metric.reference?.sha256) {
      errors.push("final comparison reference SHA-256 is stale or invalid");
    }
    if (metricCandidate && sha256File(metricCandidate) !== metric.candidate?.sha256) {
      errors.push("final comparison candidate SHA-256 is stale or invalid");
    }
    for (const name of ["diff", "overlay"]) {
      const artifact = localPath(path.dirname(finalMetricPath), metric.artifacts?.[name], `final comparison artifacts.${name}`, errors);
      const digestField = metric.artifacts?.[`${name}Sha256`];
      if (!digest(digestField) || (artifact && sha256File(artifact) !== digestField)) {
        errors.push(`final comparison ${name} artifact hash is stale or invalid`);
      }
    }
    if (!metricCandidate || !screenshotPaths.some((file) => path.resolve(file) === path.resolve(metricCandidate))) {
      errors.push("final comparison candidate is not one of the stable captures");
    }
    let maskPath = null;
    if (manifest.acceptance?.mask) {
      if (typeof manifest.acceptance.mask !== "object") {
        errors.push("acceptance.mask must be null or an object with path, sha256, reason, and maxExcludedRatio");
      } else {
        maskPath = localPath(base, manifest.acceptance.mask.path, "acceptance.mask.path", errors);
        if (!digest(manifest.acceptance.mask.sha256)) errors.push("acceptance.mask.sha256 must be a SHA-256 digest");
        else if (maskPath && sha256File(maskPath) !== manifest.acceptance.mask.sha256) errors.push("acceptance.mask.sha256 does not match mask file");
        if (!text(manifest.acceptance.mask.reason)) errors.push("acceptance.mask.reason is required");
        if (!Number.isFinite(manifest.acceptance.mask.maxExcludedRatio) || manifest.acceptance.mask.maxExcludedRatio < 0 || manifest.acceptance.mask.maxExcludedRatio > 1) {
          errors.push("acceptance.mask.maxExcludedRatio must be between 0 and 1");
        }
      }
    }
    const background = manifest.acceptance?.background || null;
    registeredFinalMask = maskPath;
    registeredFinalBackground = background;
    if (background && !/^#?[0-9a-f]{6}$/i.test(background)) errors.push("acceptance.background must be null or a 6-digit hex color");
    if (metric.background !== background) errors.push("final comparison background does not match manifest acceptance.background");
    if (maskPath) {
      if (
        path.resolve(metric.mask?.path || "") !== path.resolve(maskPath) ||
        metric.mask?.sha256 !== manifest.acceptance.mask.sha256
      ) errors.push("final comparison mask does not match manifest acceptance.mask");
    } else if (metric.mask) {
      errors.push("final comparison used an unregistered mask");
    }
    const recomputed = metricReference && metricCandidate
      ? await recomputeComparison(sharp, metricReference, metricCandidate, {
          channelTolerance: manifest.acceptance?.channelTolerance ?? 0,
          maxMismatchRatio: manifest.acceptance?.maxMismatchRatio ?? 0,
          minPixelSimilarity: manifest.acceptance?.minPixelSimilarity ?? 1,
          mask: maskPath,
          background,
        })
      : null;
    if (!recomputed?.dimensionsMatch || recomputed.maskDimensionsMatch === false) {
      errors.push("final comparison dimensions fail fresh recomputation");
    }
    if (recomputed && (
      metric.exactMismatchPixels !== recomputed.exactMismatchPixels ||
      metric.toleratedMismatchPixels !== recomputed.toleratedMismatchPixels ||
      !closeNumber(metric.pixelSimilarity, recomputed.pixelSimilarity) ||
      metric.excludedPixels !== recomputed.excludedPixels
    )) {
      errors.push("final stored metrics do not match fresh pixel recomputation");
    }
    if (manifest.acceptance?.mode === "exact") {
      if (
        metric.mode === "exact" &&
        !metric.mask &&
        !metric.background &&
        recomputed?.exactPass === true
      ) {
        visualGrade = "exact";
      } else {
        errors.push("exact acceptance requires untransformed zero-difference final metrics");
      }
    } else if (manifest.acceptance?.mode === "thresholded") {
      if (metric.mode !== "thresholded") errors.push("thresholded manifest requires thresholded final metrics");
      if (!same(metric.thresholds, {
        channelTolerance: manifest.acceptance.channelTolerance,
        maxMismatchRatio: manifest.acceptance.maxMismatchRatio,
        minPixelSimilarity: manifest.acceptance.minPixelSimilarity,
      })) errors.push("final comparison thresholds do not match manifest acceptance thresholds");
      if (recomputed?.thresholdPass !== true) errors.push("thresholded acceptance fails fresh pixel recomputation");
      if (maskPath && recomputed && recomputed.excludedRatio > manifest.acceptance.mask.maxExcludedRatio) {
        errors.push("mask excluded ratio exceeds manifest acceptance.mask.maxExcludedRatio");
      }
      if (recomputed?.thresholdPass === true) visualGrade = maskPath ? "masked" : "thresholded";
    } else {
      errors.push("acceptance.mode must be exact or thresholded");
    }
  }

  if (freshVisualFinalMetric) {
    const metric = freshVisualFinalMetric.metric;
    const prefix = "visual fidelity freshFinalComparisonMetrics";
    if (
      metric.tool !== "compare_images" ||
      metric.schemaVersion !== 1 ||
      metric.runId !== runId ||
      metric.mode !== acceptanceMode ||
      metric.status !== "passed" ||
      metric.dimensionsMatch !== true
    ) {
      errors.push(`${prefix} is not a passed comparison bound to this run and acceptance mode`);
    }
    const metricReference = localPath(
      path.dirname(freshVisualFinalMetric.path),
      metric.reference?.path,
      `${prefix}.reference.path`,
      errors
    );
    const metricCandidate = localPath(
      path.dirname(freshVisualFinalMetric.path),
      metric.candidate?.path,
      `${prefix}.candidate.path`,
      errors
    );
    if (metricReference && metricCandidate) {
      if (
        path.resolve(metricReference) !== path.resolve(registeredFinalReference || "") ||
        path.resolve(metricCandidate) !== path.resolve(registeredFinalCandidate || "")
      ) {
        errors.push(`${prefix} inputs differ from the registered final comparison`);
      }
      if (sha256File(metricReference) !== metric.reference?.sha256) {
        errors.push(`${prefix}.reference.sha256 is stale or invalid`);
      }
      if (sha256File(metricCandidate) !== metric.candidate?.sha256) {
        errors.push(`${prefix}.candidate.sha256 is stale or invalid`);
      }
      const recomputed = await recomputeComparison(sharp, metricReference, metricCandidate, {
        channelTolerance: manifest.acceptance?.channelTolerance ?? 0,
        maxMismatchRatio: manifest.acceptance?.maxMismatchRatio ?? 0,
        minPixelSimilarity: manifest.acceptance?.minPixelSimilarity ?? 1,
        mask: registeredFinalMask,
        background: registeredFinalBackground,
      });
      if (
        !recomputed.dimensionsMatch ||
        metric.exactMismatchPixels !== recomputed.exactMismatchPixels ||
        metric.toleratedMismatchPixels !== recomputed.toleratedMismatchPixels ||
        metric.excludedPixels !== recomputed.excludedPixels ||
        !closeNumber(metric.pixelSimilarity, recomputed.pixelSimilarity)
      ) {
        errors.push(`${prefix} stored metrics do not match production verifier recomputation`);
      }
      if (acceptanceMode === "exact") {
        if (
          metric.exactPixelMatch !== true ||
          metric.exactMismatchPixels !== 0 ||
          metric.mask !== null ||
          metric.background !== null ||
          recomputed.exactPass !== true
        ) {
          errors.push(`${prefix} is not an untransformed exact-zero comparison`);
        }
      } else {
        if (
          !same(metric.thresholds, {
            channelTolerance: manifest.acceptance.channelTolerance,
            maxMismatchRatio: manifest.acceptance.maxMismatchRatio,
            minPixelSimilarity: manifest.acceptance.minPixelSimilarity,
          }) ||
          recomputed.thresholdPass !== true
        ) {
          errors.push(`${prefix} does not match the approved threshold contract`);
        }
      }
    }
  }

  if (visualFidelityResult) {
    if (
      finalMetricPath &&
      path.resolve(visualFidelityResult.finalComparisonMetrics || "") !== path.resolve(finalMetricPath)
    ) {
      errors.push("evidence.visualFidelityResult final comparison path differs from the manifest");
    }
    if (visualFidelityResult.visualGrade !== visualGrade) {
      errors.push("evidence.visualFidelityResult visualGrade differs from production verifier recomputation");
    }
    if (visualFidelityResult.exact100PercentEligible !== (visualGrade === "exact")) {
      errors.push("evidence.visualFidelityResult exact eligibility differs from production verifier recomputation");
    }
  }

  const deliveryErrorBaseline = errors.length;
  const shortcut = manifest.assetPolicy?.shortcutIcons;
  if (typeof shortcut?.involved !== "boolean") errors.push("assetPolicy.shortcutIcons.involved must be true or false");
  if (analysisShortcutInvolved !== null && analysisShortcutInvolved !== shortcut?.involved) {
    errors.push("analysis shortcut classification does not match assetPolicy.shortcutIcons.involved");
  }
  const iconInventoryPath = localPath(base, shortcut?.classificationEvidence, "assetPolicy.shortcutIcons.classificationEvidence", errors);
  let iconInventory = null;
  let inventoryShortcutIds = [];
  if (iconInventoryPath) {
    if (!digest(shortcut?.classificationEvidenceSha256) || sha256File(iconInventoryPath) !== shortcut.classificationEvidenceSha256) {
      errors.push("shortcut icon classification evidence hash is stale or invalid");
    }
    iconInventory = readJson(iconInventoryPath, "icon role inventory");
    if (
      iconInventory.schemaVersion !== 1 ||
      iconInventory.tool !== "icon_role_inventory" ||
      iconInventory.runId !== runId ||
      iconInventory.page !== manifest.page ||
      iconInventory.referenceSha256 !== manifest.reference?.sha256
    ) {
      errors.push("icon role inventory tool/schemaVersion/runId/page/reference binding is invalid");
    }
    if (!text(iconInventory.reviewedBy) || !Number.isFinite(Date.parse(iconInventory.reviewedAt))) {
      errors.push("icon role inventory requires a reviewer and valid timestamp");
    }
    const inventoryIds = new Set();
    for (const [index, item] of (iconInventory.items ?? []).entries()) {
      for (const field of ["id", "label", "location", "reason", "domLocator"]) {
        if (!text(item?.[field])) errors.push(`icon role inventory item ${index}.${field} is required`);
      }
      if (!new Set(["shortcut", "utility", "brand", "content", "primary-visual"]).has(item?.role)) {
        errors.push(`icon role inventory item ${index}.role is invalid`);
      }
      if (item?.primaryEntry === true && item?.role !== "shortcut") {
        errors.push(`icon role inventory item ${index} is a primary entry and must be classified as shortcut`);
      }
      if (item?.role === "shortcut" && (!text(item?.assetLocator) || !text(item?.labelLocator))) {
        errors.push(`icon role inventory shortcut item ${index}.assetLocator and labelLocator are required`);
      }
      if (inventoryIds.has(item?.id)) errors.push(`icon role inventory contains duplicate id ${item?.id}`);
      inventoryIds.add(item?.id);
    }
    inventoryShortcutIds = (iconInventory.items ?? []).filter((item) => item.role === "shortcut").map((item) => item.id).sort();
    if (iconInventory.shortcutCount !== inventoryShortcutIds.length) errors.push("icon role inventory shortcutCount is incorrect");
    if (shortcut?.involved !== (inventoryShortcutIds.length > 0)) {
      errors.push("assetPolicy.shortcutIcons.involved does not match the reviewed icon inventory");
    }
    for (const [index, item] of responsiveReports.entries()) {
      const renderedIds = (item.report.shortcutDomAudit ?? []).map((entry) => entry.id).sort();
      if (!same(renderedIds, inventoryShortcutIds)) {
        errors.push(`capture evidence ${index} does not cover every reviewed shortcut DOM locator exactly once`);
      }
    }
  }
  let shortcutManifestValue = null;
  if (shortcut?.involved) {
    const sourcePolicy = shortcut.requiredSource || "image-generation";
    if (!new Set(["exact-source-priority", "image-generation"]).has(sourcePolicy)) {
      errors.push("assetPolicy.shortcutIcons.requiredSource is invalid");
    }
    const shortcutManifest = localPath(base, shortcut.manifest, "assetPolicy.shortcutIcons.manifest", errors);
    const shortcutValidation = shortcut.validationReport
      ? localPath(base, shortcut.validationReport, "assetPolicy.shortcutIcons.validationReport", errors)
      : null;
    if (shortcutManifest) {
      shortcutManifestValue = readJson(shortcutManifest, "shortcut asset manifest");
      if (shortcutManifestValue.thirdPartyShortcutIconsAllowed !== false || shortcutManifestValue.labelsRenderedAsDom !== true) {
        errors.push("shortcut asset manifest violates third-party or DOM-label policy");
      }
      if (shortcutManifestValue.rights?.referenceUseConfirmed !== true) {
        errors.push("shortcut asset manifest does not confirm reference-use rights");
      }
      const manifestSourcePolicy = shortcutManifestValue.sourcePolicy || "image-generation";
      if (manifestSourcePolicy !== sourcePolicy) {
        errors.push("shortcut asset manifest sourcePolicy differs from assetPolicy.shortcutIcons.requiredSource");
      }
      const registeredShortcutIds = (shortcutManifestValue.icons ?? []).map((icon) => icon.id).sort();
      if (!same(registeredShortcutIds, inventoryShortcutIds)) {
        errors.push("shortcut asset manifest does not cover every shortcut in the icon role inventory exactly once");
      }
      const allowedSources = sourcePolicy === "image-generation"
        ? new Set(["image-generation"])
        : new Set(["original", "reference-extracted"]);
      for (const [index, icon] of (shortcutManifestValue.icons ?? []).entries()) {
        if (!allowedSources.has(icon.sourceKind) || icon.thirdParty !== false) {
          errors.push(`shortcut icon ${index} violates the registered source policy`);
        }
        if (sourcePolicy === "image-generation" && !text(icon.prompt)) {
          errors.push(`shortcut icon ${index} is missing its final prompt`);
        }
        const source = localPath(path.dirname(shortcutManifest), icon.sourceOutput, `shortcut icon ${index} sourceOutput`, errors);
        const final = localPath(path.dirname(shortcutManifest), icon.finalPath, `shortcut icon ${index} finalPath`, errors);
        if (!digest(icon.sourceSha256) || (source && sha256File(source) !== icon.sourceSha256)) {
          errors.push(`shortcut icon ${index} source SHA-256 is stale or invalid`);
        }
        if (!digest(icon.finalSha256) || (final && sha256File(final) !== icon.finalSha256)) {
          errors.push(`shortcut icon ${index} final SHA-256 is stale or invalid`);
        }
        if (source && reference && sha256File(source) === manifest.reference?.sha256) {
          errors.push(`shortcut icon ${index} cannot use the full reference screenshot as its source asset`);
        }
      }
    }
    if (sourcePolicy === "image-generation" && !shortcutValidation) {
      errors.push("image-generation shortcut policy requires assetPolicy.shortcutIcons.validationReport");
    }
    if (shortcutValidation) {
      if (sourcePolicy !== "image-generation") {
        errors.push("shortcut generation validation is only valid for the image-generation source policy");
      }
      const value = readJson(shortcutValidation, "shortcut icon validation report");
      if (value.tool !== "validate_shortcut_icons" || value.schemaVersion !== 1 || value.runId !== runId) {
        errors.push("shortcut icon validation tool/schemaVersion/runId does not match the gate run");
      }
      if (
        shortcutManifest &&
        (path.resolve(value.manifest || "") !== path.resolve(shortcutManifest) || value.manifestSha256 !== sha256File(shortcutManifest))
      ) {
        errors.push("shortcut icon validation report is not bound to the current shortcut manifest");
      }
      if (value.pass !== true || value.errors?.length) errors.push("shortcut icon validation report did not pass");
      for (const [index, icon] of (value.icons ?? []).entries()) {
        const source = localPath(path.dirname(shortcutValidation), icon.sourceOutput, `shortcut validation icon ${index} sourceOutput`, errors);
        const final = localPath(path.dirname(shortcutValidation), icon.finalPath, `shortcut validation icon ${index} finalPath`, errors);
        if (source && sha256File(source) !== icon.sourceSha256) errors.push(`shortcut validation icon ${index} source hash is stale`);
        if (final && sha256File(final) !== icon.finalSha256) errors.push(`shortcut validation icon ${index} final hash is stale`);
      }
    }
  }

  const registeredImageHashes = new Set();
  if (!Array.isArray(manifest.assets)) errors.push("assets must be an array");
  for (const [index, asset] of (manifest.assets ?? []).entries()) {
    for (const field of ["id", "role", "sourceKind"]) {
      if (!text(asset?.[field])) errors.push(`assets[${index}].${field} is required`);
    }
    if (asset.role === "shortcut") errors.push(`assets[${index}] cannot register a shortcut outside the shortcut asset manifest`);
    if (!new Set(["original", "reference-extracted", "image-generation", "third-party"]).has(asset.sourceKind)) {
      errors.push(`assets[${index}].sourceKind is invalid`);
    }
    const assetPath = localPath(base, asset.path, `assets[${index}].path`, errors);
    if (!digest(asset.sha256) || (assetPath && sha256File(assetPath) !== asset.sha256)) {
      errors.push(`assets[${index}].sha256 is stale or invalid`);
    } else {
      registeredImageHashes.add(asset.sha256);
    }
    if (asset.sourceKind === "reference-extracted" && asset.rights?.referenceUseConfirmed !== true) {
      errors.push(`assets[${index}] extracted reference asset lacks rights confirmation`);
    }
    if (asset.sourceKind === "third-party") {
      const license = localPath(base, asset.rights?.licensePath, `assets[${index}].rights.licensePath`, errors);
      if (!digest(asset.rights?.licenseSha256) || (license && sha256File(license) !== asset.rights.licenseSha256)) {
        errors.push(`assets[${index}] third-party license hash is stale or invalid`);
      }
    }
  }
  for (const icon of (shortcutManifestValue?.icons ?? [])) {
    if (digest(icon.finalSha256)) registeredImageHashes.add(icon.finalSha256);
  }

  const typography = manifest.typography ?? {};
  if (!new Set(["system", "bundled"]).has(typography.strategy)) errors.push("typography.strategy must be system or bundled");
  if (!Array.isArray(typography.requiredWeights) || typography.requiredWeights.length === 0 || typography.requiredWeights.some((weight) => !Number.isInteger(weight))) {
    errors.push("typography.requiredWeights must contain at least one integer weight");
  }
  if (!Array.isArray(typography.fontFiles)) errors.push("typography.fontFiles must be an array");
  if (typography.strategy === "bundled" && typography.fontFiles?.length === 0) errors.push("bundled typography requires fontFiles");
  if (typography.strategy === "system" && typography.fallbackAllowed !== true) errors.push("system typography must explicitly allow the registered OS-bound system fallback");
  const registeredFontHashes = new Set();
  for (const [index, font] of (typography.fontFiles ?? []).entries()) {
    if (!text(font.family) || !Array.isArray(font.weights) || font.weights.length === 0) errors.push(`typography.fontFiles[${index}] family/weights are required`);
    const fontPath = localPath(base, font.path, `typography.fontFiles[${index}].path`, errors);
    if (!digest(font.sha256) || (fontPath && sha256File(fontPath) !== font.sha256)) {
      errors.push(`typography.fontFiles[${index}].sha256 is stale or invalid`);
    } else {
      registeredFontHashes.add(font.sha256);
    }
    const license = localPath(base, font.licensePath, `typography.fontFiles[${index}].licensePath`, errors);
    if (!digest(font.licenseSha256) || (license && sha256File(license) !== font.licenseSha256)) {
      errors.push(`typography.fontFiles[${index}] license hash is stale or invalid`);
    }
  }

  const utilityPolicy = manifest.assetPolicy?.utilityIcons ?? {};
  if (utilityPolicy.thirdPartyAllowed !== true || utilityPolicy.licenseEvidenceRequired !== true || utilityPolicy.remoteHotlinkAllowed !== false) {
    errors.push("utility icon policy must allow licensed local third-party icons and forbid remote hotlinks");
  }
  if (!Array.isArray(utilityPolicy.approvedLibraries)) errors.push("assetPolicy.utilityIcons.approvedLibraries must be an array");
  const approvedUtilityLibraries = new Map();
  for (const [index, library] of (utilityPolicy.approvedLibraries ?? []).entries()) {
    for (const field of ["package", "version", "importPath", "importSha256", "packageJsonPath", "packageJsonSha256"]) {
      if (!text(library?.[field])) errors.push(`approvedLibraries[${index}].${field} is required`);
    }
    const importFile = localPath(base, library.importPath, `approvedLibraries[${index}].importPath`, errors);
    if (!digest(library.importSha256) || (importFile && sha256File(importFile) !== library.importSha256)) {
      errors.push(`approvedLibraries[${index}] import artifact hash is stale or invalid`);
    }
    const packageJson = localPath(base, library.packageJsonPath, `approvedLibraries[${index}].packageJsonPath`, errors);
    if (!digest(library.packageJsonSha256) || (packageJson && sha256File(packageJson) !== library.packageJsonSha256)) {
      errors.push(`approvedLibraries[${index}] package metadata hash is stale or invalid`);
    }
    if (packageJson) {
      try {
        const metadata = readJson(packageJson, `approvedLibraries[${index}] package metadata`);
        if (metadata.name !== library.package || metadata.version !== library.version) {
          errors.push(`approvedLibraries[${index}] package metadata name/version does not match the declaration`);
        }
      } catch (error) {
        errors.push(error.message);
      }
    }
    const license = localPath(base, library.licensePath, `approvedLibraries[${index}].licensePath`, errors);
    if (!digest(library.licenseSha256) || (license && sha256File(license) !== library.licenseSha256)) {
      errors.push(`approvedLibraries[${index}] license hash is stale or invalid`);
    }
    if (approvedUtilityLibraries.has(library.package)) errors.push(`approvedLibraries contains duplicate package ${library.package}`);
    approvedUtilityLibraries.set(library.package, library);
  }
  const utilityInventoryItems = (iconInventory?.items ?? []).filter((item) => item.role === "utility");
  const thirdPartyUtilityItems = utilityInventoryItems.filter((item) => item.sourceType === "third-party");
  const usedUtilityPackages = new Set();
  for (const [index, item] of utilityInventoryItems.entries()) {
    if (!new Set(["third-party", "original", "image-generation"]).has(item.sourceType)) {
      errors.push(`utility inventory item ${index}.sourceType is invalid`);
    }
    if (item.sourceType === "third-party") {
      const library = approvedUtilityLibraries.get(item.libraryPackage);
      if (!library) {
        errors.push(`utility inventory item ${index} is not bound to an approved third-party library`);
        continue;
      }
      usedUtilityPackages.add(item.libraryPackage);
      for (const field of ["assetLocator", "libraryVersion", "libraryIcon", "libraryImport", "implementationPath", "implementationSha256"]) {
        if (!text(item[field])) errors.push(`third-party utility inventory item ${index}.${field} is required`);
      }
      if (item.libraryVersion !== library.version) {
        errors.push(`third-party utility inventory item ${index} libraryVersion does not match approved package metadata`);
      }
      if (item.libraryImport !== item.libraryPackage && !item.libraryImport?.startsWith(`${item.libraryPackage}/`)) {
        errors.push(`third-party utility inventory item ${index}.libraryImport must use its approved package or a deep import from it`);
      }
      const implementation = localPath(base, item.implementationPath, `third-party utility inventory item ${index}.implementationPath`, errors);
      if (!digest(item.implementationSha256) || (implementation && sha256File(implementation) !== item.implementationSha256)) {
        errors.push(`third-party utility inventory item ${index} implementation hash is stale or invalid`);
      }
      if (implementation) {
        const source = fs.readFileSync(implementation, "utf8");
        const withoutComments = source
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/(^|[^:])\/\/.*$/gm, "$1");
        const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const importValue = escapeRegex(item.libraryImport);
        const moduleLoad = new RegExp(`(?:\\bfrom\\s*["']${importValue}["']|\\brequire\\s*\\(\\s*["']${importValue}["']\\s*\\)|\\bimport\\s*\\(\\s*["']${importValue}["']\\s*\\))`).test(withoutComments);
        const iconUse = new RegExp(`\\b${escapeRegex(item.libraryIcon)}\\b`).test(withoutComments);
        if (!moduleLoad || !iconUse) {
          errors.push(`third-party utility inventory item ${index} implementation lacks an executable import/require and icon-name reference`);
        }
      }
    }
  }
  for (const libraryPackage of approvedUtilityLibraries.keys()) {
    if (!usedUtilityPackages.has(libraryPackage)) errors.push(`approved utility library is not used by any reviewed utility icon: ${libraryPackage}`);
  }
  const expectedThirdPartyUtilityIds = thirdPartyUtilityItems.map((item) => item.id).sort();
  const thirdPartyUtilityById = new Map(thirdPartyUtilityItems.map((item) => [item.id, item]));
  for (const [captureIndex, item] of responsiveReports.entries()) {
    const audits = item.report.utilityIconDomAudit ?? [];
    const actualIds = audits.map((entry) => entry.id).sort();
    if (!same(actualIds, expectedThirdPartyUtilityIds)) {
      errors.push(`capture evidence ${captureIndex} does not cover every reviewed third-party utility icon DOM locator exactly once`);
    }
    for (const audit of audits) {
      const inventoryItem = thirdPartyUtilityById.get(audit.id);
      if (!inventoryItem || audit.pass !== true) {
        errors.push(`capture evidence ${captureIndex} has invalid third-party utility icon DOM provenance for ${audit.id || "unknown"}`);
        continue;
      }
      if (
        audit.libraryPackage !== inventoryItem.libraryPackage ||
        audit.libraryVersion !== inventoryItem.libraryVersion ||
        audit.libraryIcon !== inventoryItem.libraryIcon ||
        audit.actualLibrary !== inventoryItem.libraryPackage ||
        audit.actualVersion !== inventoryItem.libraryVersion ||
        audit.actualIcon !== inventoryItem.libraryIcon
      ) {
        errors.push(`capture evidence ${captureIndex} utility icon DOM provenance conflicts with the reviewed inventory for ${audit.id}`);
      }
    }
  }

  const renderOrigin = (() => {
    try { return new URL(manifest.render?.url).origin; } catch { return null; }
  })();
  for (const [captureIndex, item] of responsiveReports.entries()) {
    for (const resource of [...(item.report.imageResources ?? []), ...(item.report.staticResources ?? [])]) {
      let origin = null;
      try { origin = new URL(resource.url).origin; } catch { /* invalid URL handled below */ }
      if (!origin || origin !== renderOrigin) errors.push(`capture evidence ${captureIndex} loaded a remote or invalid static resource: ${resource.url}`);
      if (!digest(resource.sha256 ?? resource.bodySha256)) errors.push(`capture evidence ${captureIndex} static resource lacks a body hash: ${resource.url}`);
      if (resource.resourceType === "font" && !registeredFontHashes.has(resource.bodySha256)) {
        errors.push(`capture evidence ${captureIndex} loaded an unregistered font resource: ${resource.url}`);
      }
    }
    for (const image of (item.report.imageResources ?? [])) {
      if (!registeredImageHashes.has(image.sha256)) errors.push(`capture evidence ${captureIndex} loaded an unregistered image asset: ${image.url}`);
    }
    for (const image of (item.report.embeddedImageResources ?? [])) {
      const isBlob = image.kind === "blob-url" || /^blob:/i.test(image.url || "");
      const isData = image.kind === "data-url" || /^data:/i.test(image.url || "");
      if (isBlob) {
        errors.push(`capture evidence ${captureIndex} uses a non-frozen blob image URL`);
      } else if (!isData || !digest(image.sha256) || !registeredImageHashes.has(image.sha256)) {
        errors.push(`capture evidence ${captureIndex} contains an unregistered embedded image`);
      }
    }
    for (const font of (item.report.embeddedFontResources ?? [])) {
      const isBlob = font.kind === "blob-url" || /^blob:/i.test(font.url || "");
      const isData = font.kind === "data-url" || /^data:/i.test(font.url || "");
      const isBuffer = font.kind === "buffer-source";
      if (isBlob) {
        errors.push(`capture evidence ${captureIndex} uses a non-frozen blob font URL`);
      } else if ((!isData && !isBuffer) || !digest(font.sha256) || !registeredFontHashes.has(font.sha256)) {
        errors.push(`capture evidence ${captureIndex} contains an unregistered embedded font`);
      }
    }
    const fontFaceApiRecords = item.report.fontFaceAudit?.fontFaceApiRecords ?? [];
    if (item.report.fontFaceAudit?.fontFaceApiCount !== fontFaceApiRecords.length) {
      errors.push(`capture evidence ${captureIndex} FontFace API count does not match its records`);
    }
    const embeddedFontsByBinding = new Map(
      (item.report.embeddedFontResources ?? [])
        .filter((resource) => text(resource.bindingId))
        .map((resource) => [resource.bindingId, resource])
    );
    const boundApiFontResourceIds = new Set();
    for (const [recordIndex, record] of fontFaceApiRecords.entries()) {
      const recordLabel = `capture evidence ${captureIndex} FontFace API record ${recordIndex}`;
      if (
        !text(record.family) ||
        !text(record.frameUrl) ||
        !new Set(["string", "buffer"]).has(record.sourceKind) ||
        typeof record.inDocumentFontSet !== "boolean" ||
        record.classificationPass !== true ||
        !Array.isArray(record.embeddedResourceBindings) ||
        !Array.isArray(record.networkUrls) ||
        !Array.isArray(record.unknownUrls) ||
        record.unknownUrls.length > 0
      ) {
        errors.push(`${recordLabel} is incomplete or unclassified`);
        continue;
      }
      for (const binding of record.embeddedResourceBindings) {
        const resource = embeddedFontsByBinding.get(binding.bindingId);
        if (
          !resource ||
          resource.kind !== binding.kind ||
          resource.sha256 !== binding.sha256 ||
          resource.family !== record.family ||
          resource.frameUrl !== record.frameUrl ||
          resource.source !== "font-face-api"
        ) {
          errors.push(`${recordLabel} is not bound to its captured embedded font resource`);
        } else {
          boundApiFontResourceIds.add(binding.bindingId);
        }
      }
      if (record.sourceKind === "buffer") {
        if (
          record.embeddedResourceBindings.length !== 1 ||
          record.embeddedResourceBindings[0]?.kind !== "buffer-source" ||
          !digest(record.sha256) ||
          !Number.isInteger(record.bytes) ||
          record.bytes <= 0 ||
          record.urlCount !== 0 ||
          record.localSourceCount !== 0 ||
          record.networkUrls.length !== 0
        ) {
          errors.push(`${recordLabel} buffer source evidence is inconsistent`);
        }
      } else {
        if (
          !digest(record.normalizedSourceSha256) ||
          record.normalizationError !== null ||
          !Number.isInteger(record.urlCount) ||
          record.urlCount < 0 ||
          !Number.isInteger(record.localSourceCount) ||
          record.localSourceCount < 0 ||
          record.urlCount !== record.embeddedResourceBindings.length + record.networkUrls.length ||
          (record.urlCount === 0 && record.localSourceCount === 0)
        ) {
          errors.push(`${recordLabel} normalized string-source classification is inconsistent`);
        }
        for (const networkUrl of record.networkUrls) {
          const networkFont = (item.report.staticResources ?? []).find((resource) =>
            resource.resourceType === "font" && resource.url === networkUrl && registeredFontHashes.has(resource.bodySha256)
          );
          if (!networkFont) errors.push(`${recordLabel} network URL is not bound to a registered loaded font response: ${networkUrl}`);
        }
      }
    }
    for (const resource of (item.report.embeddedFontResources ?? []).filter((entry) => entry.source === "font-face-api")) {
      if (!boundApiFontResourceIds.has(resource.bindingId)) {
        errors.push(`capture evidence ${captureIndex} has an orphan FontFace API embedded resource`);
      }
    }
    for (const image of (item.report.metrics?.images ?? [])) {
      if (/^blob:/i.test(image.src || "")) errors.push(`capture evidence ${captureIndex} uses a non-frozen blob image URL`);
    }
  }

  const projectRoot = localPath(base, manifest.implementation?.projectRoot, "implementation.projectRoot", errors, { file: false, directory: true });
  const buildArtifact = localPath(base, manifest.implementation?.buildArtifact?.path, "implementation.buildArtifact.path", errors, { file: false });
  if (manifest.implementation?.buildMode !== "production") errors.push("implementation.buildMode must be production");
  if (!text(manifest.implementation?.revision)) errors.push("implementation.revision is required");
  if (typeof manifest.implementation?.dirty !== "boolean") errors.push("implementation.dirty must be true or false");
  if (manifest.implementation?.buildArtifact?.builtByCommand !== "build") {
    errors.push('implementation.buildArtifact.builtByCommand must be "build"');
  }
  if (!text(manifest.implementation?.buildArtifact?.builtByReceipt)) {
    errors.push("implementation.buildArtifact.builtByReceipt is required");
  }
  if (!text(manifest.implementation?.buildArtifact?.builtAt)) errors.push("implementation.buildArtifact.builtAt is required");
  if (!digest(manifest.implementation?.buildArtifact?.sha256)) {
    errors.push("implementation.buildArtifact.sha256 must be a SHA-256 digest");
  } else if (buildArtifact && sha256Artifact(buildArtifact) !== manifest.implementation.buildArtifact.sha256) {
    errors.push("implementation.buildArtifact.sha256 does not match build artifact contents");
  }
  if (!projectRoot) warnings.push("Project-root checks could not be completed");
  if (projectRoot && buildArtifact) {
    const relative = path.relative(projectRoot, buildArtifact);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      errors.push("implementation.buildArtifact.path must be inside implementation.projectRoot");
    }
  }

  const delivery = manifest.delivery ?? {};
  if (delivery.target !== "production") errors.push("delivery.target must be production");
  if (delivery.grade !== "release-ready") errors.push("delivery.grade must be release-ready");
  if (delivery.officialRouteIntegrated !== true) errors.push("delivery.officialRouteIntegrated must be true");
  for (const field of ["authIntegration", "accessibilityStandard"]) {
    if (!text(delivery[field])) errors.push(`delivery.${field} is required; use an explicit N/A reason when not involved`);
  }
  const productionDataSource = delivery.productionDataSource;
  if (!productionDataSource || typeof productionDataSource !== "object" || !new Set(["live-api", "approved-static", "none"]).has(productionDataSource.kind)) {
    errors.push("delivery.productionDataSource must be a structured live-api, approved-static, or none declaration");
  } else {
    if (productionDataSource.kind !== manifest.state?.dataKind) {
      errors.push("delivery.productionDataSource.kind must match state.dataKind");
    }
    if (productionDataSource.kind === "live-api") {
      const adapter = localPath(base, productionDataSource.adapterPath, "delivery.productionDataSource.adapterPath", errors);
      if (!digest(productionDataSource.adapterSha256) || (adapter && sha256File(adapter) !== productionDataSource.adapterSha256)) {
        errors.push("live-api production data adapter hash is stale or invalid");
      }
      const endpointContract = localPath(base, productionDataSource.contractPath, "delivery.productionDataSource.contractPath", errors);
      if (!digest(productionDataSource.contractSha256) || (endpointContract && sha256File(endpointContract) !== productionDataSource.contractSha256)) {
        errors.push("live-api endpoint contract hash is stale or invalid");
      }
      if (!Array.isArray(productionDataSource.expectedRequests) || productionDataSource.expectedRequests.length === 0) {
        errors.push("live-api production data source requires at least one expectedRequests entry");
      }
      for (const [requestIndex, expected] of (productionDataSource.expectedRequests ?? []).entries()) {
        if (!text(expected.url) || !/^https?:\/\//i.test(expected.url)) errors.push(`expectedRequests[${requestIndex}].url must be an absolute HTTP URL`);
        if (!text(expected.method)) errors.push(`expectedRequests[${requestIndex}].method is required`);
        if (!Number.isInteger(expected.status) || expected.status < 200 || expected.status >= 400) {
          errors.push(`expectedRequests[${requestIndex}].status must be a successful HTTP status`);
        }
        if (expected.responseSha256 !== null && expected.responseSha256 !== undefined && !digest(expected.responseSha256)) {
          errors.push(`expectedRequests[${requestIndex}].responseSha256 must be null or a SHA-256 digest`);
        }
        for (const [captureIndex, item] of responsiveReports.entries()) {
          const match = (item.report.dataResponses ?? []).find((response) =>
            response.url === expected.url &&
            response.method === expected.method &&
            response.status === expected.status &&
            (!expected.responseSha256 || response.bodySha256 === expected.responseSha256)
          );
          if (!match) errors.push(`capture evidence ${captureIndex} did not observe required live API request ${expected.method} ${expected.url}`);
        }
      }
    } else if (productionDataSource.kind === "approved-static") {
      const staticAsset = localPath(base, productionDataSource.assetPath, "delivery.productionDataSource.assetPath", errors);
      if (!digest(productionDataSource.assetSha256) || (staticAsset && sha256File(staticAsset) !== productionDataSource.assetSha256)) {
        errors.push("approved-static production data asset hash is stale or invalid");
      }
      for (const field of ["approvedBy", "approvedAt", "reason"]) {
        if (!text(productionDataSource[field])) errors.push(`approved-static production data requires ${field}`);
      }
      if (!Number.isFinite(Date.parse(productionDataSource.approvedAt))) errors.push("approved-static production data approvedAt must be an ISO timestamp");
    } else if (!text(productionDataSource.reason)) {
      errors.push("productionDataSource.kind=none requires a reason");
    }
  }
  if (typeof delivery.accessibilityStandard === "string" && delivery.accessibilityStandard.trim().startsWith("N/A:")) {
    errors.push("delivery.accessibilityStandard cannot be N/A for release-ready");
  }
  if (
    !delivery.performanceBudget ||
    (typeof delivery.performanceBudget === "object" && !Object.keys(delivery.performanceBudget).length) ||
    (typeof delivery.performanceBudget === "string" && delivery.performanceBudget.trim().startsWith("N/A:"))
  ) {
    errors.push("delivery.performanceBudget is required");
  }
  if (!Array.isArray(delivery.targetBrowsers) || !delivery.targetBrowsers.length) {
    errors.push("delivery.targetBrowsers must not be empty");
  } else if (delivery.targetBrowsers.some((browser) => !text(browser) || String(browser).trim().startsWith("N/A:"))) {
    errors.push("delivery.targetBrowsers contains an invalid target");
  }
  if (delivery.unresolvedP0 !== 0 || delivery.unresolvedP1 !== 0) {
    errors.push("release-ready requires zero unresolved P0 and P1 issues");
  }

  const requiredCommandNames = ["build", "typecheck", "lint", "unitOrComponent", "e2eOrSmoke", "projectGate", "productionPreview"];
  const commandEntries = manifest.evidence?.productionCommandResults ?? [];
  const commandResults = new Map();
  for (const [index, value] of commandEntries.entries()) {
    const receiptPath = localPath(base, value, `evidence.productionCommandResults[${index}]`, errors);
    if (!receiptPath) continue;
    const preview = readJson(receiptPath, `production command receipt ${index}`);
    if (!text(preview.name)) {
      errors.push(`productionCommandResults[${index}] receipt name is required`);
      continue;
    }
    if (commandResults.has(preview.name)) errors.push(`productionCommandResults has duplicate name: ${preview.name}`);
    commandResults.set(preview.name, receiptPath);
  }
  let buildCommandReceipt = null;
  for (const name of requiredCommandNames) {
    const command = delivery.commands?.[name];
    if (!text(command)) {
      errors.push(`delivery.commands.${name} is required; use "N/A: <reason>" only when truly not applicable`);
      continue;
    }
    if (String(command).startsWith("N/A:")) {
      if (name === "build" || name === "productionPreview") errors.push(`delivery.commands.${name} cannot be N/A`);
      continue;
    }
    if (isTrivialPassCommand(command)) {
      errors.push(`delivery.commands.${name} is a trivial pass command and cannot prove a production gate`);
      continue;
    }
    if (name === "productionPreview") continue;
    const receiptPath = commandResults.get(name);
    if (!receiptPath) {
      errors.push(`missing productionCommandResults entry for ${name}`);
      continue;
    }
    const receipt = validateCommandReceipt(receiptPath, {
      label: `productionCommandResults.${name}`,
      expectedName: name,
      expectedCommand: command,
      expectedRunId: runId,
      expectedCwd: projectRoot,
    }, errors);
    if (name === "build") buildCommandReceipt = { path: receiptPath, receipt };
  }
  if (buildCommandReceipt) {
    if (
      !buildArtifact ||
      path.resolve(buildCommandReceipt.receipt.artifact || "") !== path.resolve(buildArtifact) ||
      buildCommandReceipt.receipt.artifactSha256 !== manifest.implementation?.buildArtifact?.sha256
    ) {
      errors.push("build command receipt is not bound to the current production build artifact");
    }
    if (
      path.resolve(manifest.implementation?.buildArtifact?.builtByReceipt || "") !== path.resolve(buildCommandReceipt.path) ||
      manifest.implementation?.buildArtifact?.builtAt !== buildCommandReceipt.receipt.finishedAt
    ) {
      errors.push("implementation.buildArtifact builtByReceipt/builtAt does not match the build receipt");
    }
  }
  if (!text(delivery.productionPreviewUrl)) errors.push("delivery.productionPreviewUrl is required");
  if (delivery.productionPreviewUrl !== manifest.render?.url) {
    errors.push("delivery.productionPreviewUrl must equal render.url used by strict captures");
  }

  const mandatoryStates = ["loading", "empty", "error", "success"];
  if (!Array.isArray(delivery.requiredStates) || new Set(delivery.requiredStates).size !== delivery.requiredStates.length) {
    errors.push("delivery.requiredStates must be a duplicate-free array");
  }
  for (const state of mandatoryStates) {
    if (!delivery.requiredStates?.includes(state)) errors.push(`delivery.requiredStates must include ${state}`);
  }
  const stateReceipts = new Map();
  for (const [index, value] of (manifest.evidence?.stateResults ?? []).entries()) {
    const receiptPath = localPath(base, value, `evidence.stateResults[${index}]`, errors);
    if (!receiptPath) continue;
    const preview = readJson(receiptPath, `state receipt ${index}`);
    if (!text(preview.name) || stateReceipts.has(preview.name)) {
      errors.push(`stateResults[${index}] has a missing or duplicate receipt name`);
      continue;
    }
    stateReceipts.set(preview.name, receiptPath);
  }
  for (const state of delivery.requiredStates ?? []) {
    const command = delivery.stateCommands?.[state];
    if (!text(command) || String(command).startsWith("N/A:")) {
      errors.push(`delivery.stateCommands.${state} is required and cannot be N/A`);
      continue;
    }
    if (isTrivialPassCommand(command)) {
      errors.push(`delivery.stateCommands.${state} is a trivial pass command`);
      continue;
    }
    const expectedName = `state:${state}`;
    const receiptPath = stateReceipts.get(expectedName);
    if (!receiptPath) {
      errors.push(`missing stateResults receipt for ${state}`);
      continue;
    }
    validateCommandReceipt(receiptPath, {
      label: `stateResults.${state}`,
      expectedName,
      expectedCommand: command,
      expectedRunId: runId,
      expectedCwd: projectRoot,
    }, errors);
  }

  const qualityResults = new Map();
  for (const [index, value] of (manifest.evidence?.qualityGateResults ?? []).entries()) {
    const receiptPath = localPath(base, value, `evidence.qualityGateResults[${index}]`, errors);
    if (!receiptPath) continue;
    const preview = readJson(receiptPath, `quality gate receipt ${index}`);
    if (!text(preview.name)) {
      errors.push(`qualityGateResults[${index}] receipt name is required`);
      continue;
    }
    if (qualityResults.has(preview.name)) errors.push(`qualityGateResults has duplicate name: ${preview.name}`);
    qualityResults.set(preview.name, receiptPath);
  }
  const requiredQualityGates = [
    "accessibility",
    "performance",
    "security",
    "asset-license",
    ...(delivery.targetBrowsers ?? []).map((browser) => `browser:${browser}`),
  ];
  for (const name of requiredQualityGates) {
    const command = delivery.qualityCommands?.[name];
    if (!text(command) || String(command).startsWith("N/A:")) {
      errors.push(`delivery.qualityCommands.${name} is required and cannot be N/A`);
      continue;
    }
    if (isTrivialPassCommand(command)) {
      errors.push(`delivery.qualityCommands.${name} is a trivial pass command`);
      continue;
    }
    const expectedName = `quality:${name}`;
    const receiptPath = qualityResults.get(expectedName);
    if (!receiptPath) {
      errors.push(`missing required qualityGateResults receipt: ${expectedName}`);
      continue;
    }
    validateCommandReceipt(receiptPath, {
      label: `qualityGateResults.${name}`,
      expectedName,
      expectedCommand: command,
      expectedRunId: runId,
      expectedCwd: projectRoot,
    }, errors);
  }

  if (releaseReadiness) {
    const content = fs.readFileSync(releaseReadiness, "utf8");
    if (!content.includes(`Evidence Run ID: ${runId}`)) errors.push("evidence.releaseReadiness is not bound to the current runId");
    if (!content.includes(`Manifest SHA-256: ${manifestDigest}`)) errors.push("evidence.releaseReadiness is not bound to the current manifest SHA-256");
    if (!content.includes(`Reference SHA-256: ${manifest.reference?.sha256}`)) errors.push("evidence.releaseReadiness is not bound to the current reference SHA-256");
    if (!new RegExp(`^\\s*-?\\s*生产交付等级[：:]\\s*release-ready\\s*$`, "im").test(content)) {
      errors.push("evidence.releaseReadiness must declare production grade release-ready");
    }
    if (!new RegExp(`^\\s*-?\\s*视觉还原等级[：:]\\s*${visualGrade}\\s*$`, "im").test(content)) {
      errors.push(`evidence.releaseReadiness must declare visual grade ${visualGrade}`);
    }
    validateMarkdownMatrix(
      content,
      Array.from({ length: 16 }, (_, index) => `P${String(index + 1).padStart(2, "0")}`),
      "production gate matrix",
      errors,
      { requiredInvolved: ["P01", "P02", "P03", "P05", "P06", "P07", "P08", "P09", "P10", "P11", "P12", "P13", "P14", "P15", "P16"] }
    );
  }

  const visualAccepted = visualGrade === "exact" || visualGrade === "thresholded";
  const deliveryGrade = errors.length > deliveryErrorBaseline ? "blocked" : delivery.grade;
  const productionReady = errors.length === 0 && visualAccepted && deliveryGrade === "release-ready";
  const report = {
    schemaVersion: 1,
    tool: "verify_acceptance",
    runId,
    verifiedAt: new Date().toISOString(),
    manifest: manifestPath,
    manifestSha256: manifestDigest,
    visualGrade,
    deliveryGrade,
    productionReady,
    final100PercentEligible: productionReady && visualGrade === "exact",
    evidenceSummary: {
      analysis,
      acceptanceReport,
      releaseReadiness,
      stableCaptureCount: captureReports.length,
      stableScreenshotSha256: screenshotHashes[0] || null,
      requiredStabilityPairs: requiredPairs.size,
      observedStabilityPairs: observedPairs.size,
      requiredResponsiveChecks,
      passedResponsiveChecks,
      finalComparisonMetrics: finalMetricPath,
      visualFidelityResult: visualFidelityResultPath,
      buildArtifact,
      shortcutIconsInvolved: shortcut?.involved ?? null,
    },
    errors,
    warnings,
    dependency: { sharp: resolution.resolved },
  };
  const output = path.resolve(opts.output);
  writeJson(output, report);
  console.log(JSON.stringify({ output, ...report }, null, 2));
  if (!productionReady) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
