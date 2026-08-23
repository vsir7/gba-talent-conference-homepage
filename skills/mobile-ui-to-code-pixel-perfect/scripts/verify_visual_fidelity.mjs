#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  ensureDirectory,
  ensureFile,
  sha256File,
  writeJson,
} from "./lib/runtime.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  return [
    "Usage:",
    "  node verify_visual_fidelity.mjs --manifest <file> --output <file> --run-id <id>",
    "",
    "Verifies only the registered visual-fidelity contract. It requires at least",
    "three strict fresh capture reports, complete pairwise exact stability metrics,",
    "and a final comparison against the untouched registered reference.",
  ].join("\n");
}

function parseArgs(argv) {
  const opts = {};
  const valueArgs = new Set(["--manifest", "--output", "--run-id"]);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (valueArgs.has(arg)) {
      const value = argv[index + 1];
      if (!value) throw new Error(arg + " requires a value");
      opts[arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error("Unknown argument: " + arg + "\n\n" + usage());
    }
  }
  for (const key of ["manifest", "output", "runId"]) {
    if (!opts[key]) throw new Error("--" + key.replace(/[A-Z]/g, (char) => "-" + char.toLowerCase()) + " is required");
  }
  return opts;
}

function readJson(file, label, errors) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(label + " is not valid JSON: " + error.message);
    return null;
  }
}

function evidencePath(base, value, label, errors) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(label + " path is required");
    return null;
  }
  const resolved = path.resolve(base, value);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    errors.push(label + " does not exist: " + resolved);
    return null;
  }
  return resolved;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validTimestamp(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function digest(value) {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/i.test(value);
}

function pairKey(left, right) {
  return [path.resolve(left), path.resolve(right)].sort().join("\u0000");
}

function recomputePixels({ reference, candidate, outDir, mode, runId, acceptance, maskPath, errors, label }) {
  ensureDirectory(outDir);
  const args = [
    path.join(scriptsDir, "compare_images.mjs"),
    "--reference", reference,
    "--candidate", candidate,
    "--out-dir", outDir,
    "--mode", mode,
    "--run-id", runId,
  ];
  if (mode === "thresholded") {
    args.push(
      "--channel-tolerance", String(acceptance.channelTolerance),
      "--max-mismatch-ratio", String(acceptance.maxMismatchRatio),
      "--min-pixel-similarity", String(acceptance.minPixelSimilarity)
    );
    if (maskPath) args.push("--mask", maskPath);
    if (acceptance.background) args.push("--background", String(acceptance.background));
  }
  const child = spawnSync(process.execPath, args, { encoding: "utf8" });
  const metricsPath = path.join(outDir, "metrics.json");
  if (!fs.existsSync(metricsPath)) {
    errors.push(label + " fresh pixel recomputation produced no metrics: " + (child.stderr || child.stdout || "unknown error"));
    return { child, metricsPath: null, metrics: null };
  }
  const metrics = readJson(metricsPath, label + " fresh pixel recomputation", errors);
  if (child.status !== 0 || metrics?.status !== "passed") {
    errors.push(label + " failed fresh pixel recomputation");
  }
  return { child, metricsPath, metrics };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const manifestPath = ensureFile(opts.manifest, "manifest");
  const outputPath = path.resolve(opts.output);
  ensureDirectory(path.dirname(outputPath));
  const base = path.dirname(manifestPath);
  const errors = [];
  const manifest = readJson(manifestPath, "manifest", errors);

  if (!manifest) {
    writeJson(outputPath, {
      schemaVersion: 1,
      tool: "verify_visual_fidelity",
      runId: opts.runId,
      passed: false,
      visualGrade: "blocked",
      exact100PercentEligible: false,
      errors,
    });
    process.exit(2);
  }

  if (!Number.isInteger(manifest.version) || manifest.version < 4) {
    errors.push("manifest.version must be 4 or newer");
  }
  if (manifest.evidence?.runId !== opts.runId) {
    errors.push("manifest evidence.runId must match --run-id");
  }
  if (manifest.reference?.contractSelection !== "explicit") {
    errors.push("reference.contractSelection must be explicit");
  }
  if (!new Set(["original-uncompressed", "compressed-derivative", "unknown-provenance"]).has(manifest.reference?.sourceQuality)) {
    errors.push("reference.sourceQuality must classify the source as original-uncompressed, compressed-derivative, or unknown-provenance");
  }
  if (!new Set(["original-reference", "approved-new-baseline"]).has(manifest.reference?.baselineKind)) {
    errors.push("reference.baselineKind must be original-reference or approved-new-baseline");
  }
  if (manifest.reference?.baselineKind === "original-reference") {
    if (manifest.reference?.parentReferenceSha256 !== null || manifest.reference?.baselineApproval !== null) {
      errors.push("original-reference must not declare parent baseline lineage");
    }
  }
  if (manifest.reference?.baselineKind === "approved-new-baseline") {
    if (
      !digest(manifest.reference?.parentReferenceSha256) ||
      manifest.reference.parentReferenceSha256 === manifest.reference?.sha256
    ) {
      errors.push("approved-new-baseline requires a distinct parent reference SHA-256");
    }
    const baselineApprovalPath = evidencePath(
      base,
      manifest.reference?.baselineApproval?.path,
      "new baseline approval",
      errors
    );
    if (baselineApprovalPath) {
      if (manifest.reference?.baselineApproval?.sha256 !== sha256File(baselineApprovalPath)) {
        errors.push("new baseline approval SHA-256 is stale or invalid");
      }
      const baselineApproval = readJson(baselineApprovalPath, "new baseline approval", errors);
      if (
        baselineApproval &&
        (
          baselineApproval.schemaVersion !== 1 ||
          !validTimestamp(baselineApproval.approvedAt) ||
          typeof baselineApproval.approvedBy !== "string" ||
          !baselineApproval.approvedBy.trim() ||
          baselineApproval.page !== manifest.page ||
          baselineApproval.state !== manifest.state?.name ||
          baselineApproval.parentReferenceSha256 !== manifest.reference.parentReferenceSha256 ||
          baselineApproval.newReferenceSha256 !== manifest.reference.sha256 ||
          typeof baselineApproval.reason !== "string" ||
          !baselineApproval.reason.trim() ||
          typeof baselineApproval.source !== "string" ||
          !baselineApproval.source.trim()
        )
      ) {
        errors.push("new baseline approval does not establish valid parent-to-new reference lineage");
      }
    }
  }
  const contractSelectionPath = evidencePath(
    base,
    manifest.reference?.contractSelectionEvidence?.path,
    "contract selection evidence",
    errors
  );
  let contractSelection = null;
  if (contractSelectionPath) {
    if (manifest.reference?.contractSelectionEvidence?.sha256 !== sha256File(contractSelectionPath)) {
      errors.push("contract selection evidence SHA-256 is stale or invalid");
    }
    contractSelection = readJson(contractSelectionPath, "contract selection evidence", errors);
    if (
      contractSelection &&
      (
        contractSelection.schemaVersion !== 1 ||
        !new Set(["user-confirmation", "design-metadata", "project-evidence"]).has(contractSelection.selectedBy) ||
        contractSelection.selectedBy !== manifest.reference?.contractSelectedBy ||
        !validTimestamp(contractSelection.recordedAt) ||
        contractSelection.referenceSha256 !== manifest.reference?.sha256 ||
        contractSelection.page !== manifest.page ||
        contractSelection.state !== manifest.state?.name ||
        !Array.isArray(contractSelection.candidatesConsidered) ||
        contractSelection.candidatesConsidered.length === 0 ||
        typeof contractSelection.rationale !== "string" ||
        !contractSelection.rationale.trim() ||
        typeof contractSelection.source !== "string" ||
        !contractSelection.source.trim()
      )
    ) {
      errors.push("contract selection evidence is incomplete or not bound to the manifest");
    }
  }

  const referencePath = evidencePath(base, manifest.reference?.path, "reference", errors);
  if (referencePath && sha256File(referencePath) !== manifest.reference?.sha256) {
    errors.push("registered reference SHA-256 is stale or invalid");
  }

  const render = manifest.render || {};
  if (!Number.isFinite(render.cssViewport?.width) || !Number.isFinite(render.cssViewport?.height)) {
    errors.push("render.cssViewport must be explicit");
  }
  if (!Number.isFinite(render.deviceScaleFactor) || render.deviceScaleFactor <= 0) {
    errors.push("render.deviceScaleFactor must be explicit");
  }
  if (!new Set(["css", "device"]).has(render.screenshotScale)) {
    errors.push("render.screenshotScale must be css or device");
  }
  if (render.serviceWorkers !== "block") {
    errors.push("render.serviceWorkers must be block for isolated final captures");
  }
  if (!new Set(["viewport", "full-page", "selector"]).has(render.captureMode)) {
    errors.push("render.captureMode must be viewport, full-page, or selector");
  }
  if (render.captureMode === "selector" && (typeof render.selector !== "string" || !render.selector.trim())) {
    errors.push("render.selector is required when captureMode is selector");
  }
  if (typeof render.isMobile !== "boolean" || typeof render.hasTouch !== "boolean") {
    errors.push("render.isMobile and render.hasTouch must be explicit booleans");
  }
  if (!Number.isFinite(render.expectedPixelSize?.width) || !Number.isFinite(render.expectedPixelSize?.height)) {
    errors.push("render.expectedPixelSize must be explicit");
  }
  if (
    contractSelection &&
    (
      !same(contractSelection.selected?.cssViewport, render.cssViewport) ||
      contractSelection.selected?.deviceScaleFactor !== render.deviceScaleFactor ||
      contractSelection.selected?.screenshotScale !== render.screenshotScale ||
      contractSelection.selected?.captureMode !== render.captureMode ||
      contractSelection.selected?.browser !== render.browser ||
      contractSelection.selected?.isMobile !== render.isMobile ||
      contractSelection.selected?.hasTouch !== render.hasTouch ||
      contractSelection.selected?.locale !== render.locale ||
      contractSelection.selected?.timezone !== render.timezone ||
      contractSelection.selected?.colorScheme !== render.colorScheme
    )
  ) {
    errors.push("contract selection evidence does not match the final render contract");
  }
  for (const field of ["browser", "locale", "timezone", "colorScheme"]) {
    if (typeof render[field] !== "string" || !render[field].trim()) {
      errors.push("render." + field + " must be explicit");
    }
  }
  const domPolicy = render.domPolicy || {};
  if (
    domPolicy.realDomRequired !== true ||
    domPolicy.forbidViewportRaster !== true ||
    !Number.isInteger(domPolicy.minimumVisibleElements) ||
    domPolicy.minimumVisibleElements < 1 ||
    !Number.isInteger(domPolicy.minimumVisibleTextElements) ||
    domPolicy.minimumVisibleTextElements < 1 ||
    !Number.isInteger(domPolicy.minimumInteractiveElements) ||
    domPolicy.minimumInteractiveElements < 0 ||
    !Number.isFinite(domPolicy.maximumCombinedRasterCoverage) ||
    domPolicy.maximumCombinedRasterCoverage < 0 ||
    domPolicy.maximumCombinedRasterCoverage > 0.84
  ) {
    errors.push("render.domPolicy must define a strict real-DOM anti-impostor contract");
  }

  const acceptance = manifest.acceptance || {};
  if (!new Set(["exact", "thresholded"]).has(acceptance.mode)) {
    errors.push("acceptance.mode must be exact or thresholded");
  }
  const minimumStableCaptures = Number(acceptance.minimumStableCaptures);
  if (!Number.isInteger(minimumStableCaptures) || minimumStableCaptures < 3) {
    errors.push("acceptance.minimumStableCaptures must be an integer of at least 3");
  }
  if (acceptance.mode === "exact") {
    if (
      acceptance.channelTolerance !== 0 ||
      acceptance.maxMismatchRatio !== 0 ||
      acceptance.minPixelSimilarity !== 1
    ) {
      errors.push("exact acceptance requires zero tolerance, zero mismatch ratio, and similarity 1");
    }
    if (acceptance.mask || acceptance.background) {
      errors.push("exact acceptance forbids masks and background flattening");
    }
  }
  if (acceptance.mode === "thresholded") {
    if (!Number.isInteger(acceptance.channelTolerance) || acceptance.channelTolerance < 0 || acceptance.channelTolerance > 255) {
      errors.push("thresholded acceptance channelTolerance must be an integer from 0 to 255");
    }
    for (const field of ["maxMismatchRatio", "minPixelSimilarity"]) {
      if (!Number.isFinite(acceptance[field]) || acceptance[field] < 0 || acceptance[field] > 1) {
        errors.push("thresholded acceptance " + field + " must be between 0 and 1");
      }
    }
    if (
      acceptance.mask &&
      (
        typeof acceptance.mask.path !== "string" ||
        !acceptance.mask.path.trim() ||
        !digest(acceptance.mask.sha256) ||
        !Number.isFinite(acceptance.mask.maxExcludedRatio) ||
        acceptance.mask.maxExcludedRatio < 0 ||
        acceptance.mask.maxExcludedRatio > 1 ||
        typeof acceptance.mask.reason !== "string" ||
        !acceptance.mask.reason.trim()
      )
    ) {
      errors.push("thresholded acceptance mask requires path, SHA-256, maxExcludedRatio from 0 to 1, and reason");
    }
    if (
      typeof acceptance.approvedBy !== "string" ||
      !acceptance.approvedBy.trim() ||
      !validTimestamp(acceptance.approvedAt) ||
      typeof acceptance.approvalReason !== "string" ||
      !acceptance.approvalReason.trim()
    ) {
      errors.push("thresholded acceptance requires prior approval: approvedBy, approvedAt, and approvalReason");
    }
    const approvalPath = evidencePath(
      base,
      acceptance.approvalEvidence?.path,
      "threshold approval evidence",
      errors
    );
    if (approvalPath) {
      if (acceptance.approvalEvidence?.sha256 !== sha256File(approvalPath)) {
        errors.push("threshold approval evidence SHA-256 is stale or invalid");
      }
      const approval = readJson(approvalPath, "threshold approval evidence", errors);
      if (approval) {
        if (
          approval.schemaVersion !== 1 ||
          approval.mode !== "thresholded" ||
          approval.approvedBy !== acceptance.approvedBy ||
          approval.approvedAt !== acceptance.approvedAt ||
          approval.reason !== acceptance.approvalReason ||
          approval.page !== manifest.page ||
          approval.state !== manifest.state?.name ||
          typeof approval.source !== "string" ||
          !approval.source.trim() ||
          !same(approval.thresholds, {
            channelTolerance: acceptance.channelTolerance,
            maxMismatchRatio: acceptance.maxMismatchRatio,
            minPixelSimilarity: acceptance.minPixelSimilarity,
          }) ||
          !same(approval.mask ?? null, acceptance.mask ?? null)
        ) {
          errors.push("threshold approval evidence does not match the page, state, approver, reason, numeric contract, or mask");
        }
      }
    }
  }

  const captureReportPaths = Array.isArray(manifest.evidence?.captureReports)
    ? manifest.evidence.captureReports
    : [];
  if (captureReportPaths.length < Math.max(3, minimumStableCaptures || 3)) {
    errors.push("insufficient capture reports for the stability gate");
  }

  const captures = [];
  const captureIds = new Set();
  const processIdentities = new Set();
  const servedArtifactBindings = [];
  const capturedTimes = [];
  for (const [index, rawPath] of captureReportPaths.entries()) {
    const reportPath = evidencePath(base, rawPath, "captureReports[" + index + "]", errors);
    if (!reportPath) continue;
    const report = readJson(reportPath, "capture report " + index, errors);
    if (!report) continue;
    if (report.schemaVersion !== 2 || report.tool !== "capture_page") {
      errors.push("capture report " + index + " tool/schemaVersion is invalid");
    }
    if (report.runId !== opts.runId) errors.push("capture report " + index + " runId does not match");
    if (!validTimestamp(report.capturedAt)) {
      errors.push("capture report " + index + " capturedAt is invalid");
    } else {
      capturedTimes.push(Date.parse(report.capturedAt));
    }
    if (report.status !== "captured" || !Array.isArray(report.strictFailures) || report.strictFailures.length > 0) {
      errors.push("capture report " + index + " is not a passed strict capture");
    }
    if (
      report.requestedUrl !== render.url ||
      report.finalUrl !== manifest.state?.expectedFinalUrl ||
      report.mainDocument?.status !== render.expectedHttpStatus ||
      report.contract?.expectedStatus !== render.expectedHttpStatus ||
      report.contract?.expectedFinalUrl !== manifest.state?.expectedFinalUrl
    ) {
      errors.push("capture report " + index + " is not bound to the registered target URL and HTTP contract");
    }
    const expectedStateScriptPath = manifest.state?.stateScript
      ? evidencePath(base, manifest.state.stateScript, "state script", errors)
      : null;
    const expectedStateScript = expectedStateScriptPath
      ? { path: expectedStateScriptPath, sha256: sha256File(expectedStateScriptPath) }
      : null;
    const observedStateScript = report.contract?.stateScript
      ? {
          path: path.resolve(report.contract.stateScript.path),
          sha256: report.contract.stateScript.sha256,
        }
      : null;
    if (!same(observedStateScript, expectedStateScript)) {
      errors.push("capture report " + index + " state script differs from the registered target state");
    }
    if (!digest(report.mainDocument?.bodySha256)) {
      errors.push("capture report " + index + " lacks a hashed main document");
    }
    if (!Array.isArray(report.staticResources)) {
      errors.push("capture report " + index + " lacks static resource evidence");
    }
    const staticResourceSet = (Array.isArray(report.staticResources) ? report.staticResources : [])
      .map((resource) => ({
        url: resource?.url || null,
        resourceType: resource?.resourceType || null,
        status: resource?.status ?? null,
        bodySha256: resource?.bodySha256 || null,
      }))
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
    if (staticResourceSet.some((resource) => resource.status < 400 && !digest(resource.bodySha256))) {
      errors.push("capture report " + index + " contains an unhashed served static resource");
    }
    servedArtifactBindings.push(JSON.stringify({
      mainDocumentBodySha256: report.mainDocument?.bodySha256 || null,
      staticResources: staticResourceSet,
    }));
    if (typeof report.captureId !== "string" || !report.captureId.trim() || captureIds.has(report.captureId)) {
      errors.push("capture report " + index + " captureId is missing or duplicated");
    } else {
      captureIds.add(report.captureId);
    }
    const processIdentity = String(report.runtime?.pid) + "|" + String(report.runtime?.processStartedAt);
    if (
      !Number.isInteger(report.runtime?.pid) ||
      !validTimestamp(report.runtime?.processStartedAt) ||
      processIdentities.has(processIdentity)
    ) {
      errors.push("capture report " + index + " does not prove a unique fresh capture process");
    } else {
      processIdentities.add(processIdentity);
    }
    const candidatePath = evidencePath(base, report.output, "capture report " + index + " output", errors);
    if (!candidatePath) continue;
    const actualHash = sha256File(candidatePath);
    if (report.screenshotSha256 !== actualHash) {
      errors.push("capture report " + index + " screenshot hash is stale or invalid");
    }
    if (render.captureMode === "viewport" && report.pixelSizeMatches !== true) {
      errors.push("capture report " + index + " pixelSizeMatches must be true");
    }
    if (
      report.screenshot?.width !== render.expectedPixelSize?.width ||
      report.screenshot?.height !== render.expectedPixelSize?.height
    ) {
      errors.push("capture report " + index + " pixel dimensions differ from the render contract");
    }
    for (const field of ["cssViewport", "deviceScaleFactor", "isMobile", "hasTouch", "screenshotScale", "serviceWorkers", "browser", "locale", "timezone", "colorScheme"]) {
      if (!same(report.contract?.[field], render[field])) {
        errors.push("capture report " + index + " contract." + field + " differs from the manifest");
      }
    }
    const expectedFullPage = render.captureMode === "full-page";
    const expectedSelector = render.captureMode === "selector" ? render.selector : null;
    if (report.contract?.fullPage !== expectedFullPage || (report.contract?.selector || null) !== expectedSelector) {
      errors.push("capture report " + index + " capture mode differs from the manifest");
    }
    const domAudit = report.metrics?.domAudit;
    if (!domAudit || domAudit.viewportCoverageThreshold !== 0.85) {
      errors.push("capture report " + index + " lacks the fixed DOM anti-impostor audit");
    } else {
      if (domAudit.visibleElementCount < domPolicy.minimumVisibleElements) {
        errors.push("capture report " + index + " has too few visible DOM elements");
      }
      if (domAudit.visibleTextElementCount < domPolicy.minimumVisibleTextElements) {
        errors.push("capture report " + index + " has too few visible DOM text elements");
      }
      if (domAudit.visibleInteractiveElementCount < domPolicy.minimumInteractiveElements) {
        errors.push("capture report " + index + " has too few visible interactive DOM elements");
      }
      if (
        domPolicy.forbidViewportRaster &&
        (!Array.isArray(domAudit.viewportCoveringVisuals) || domAudit.viewportCoveringVisuals.length > 0)
      ) {
        errors.push("capture report " + index + " contains a viewport-covering raster, canvas, SVG, or background visual");
      }
      if (
        !Array.isArray(domAudit.rasterVisuals) ||
        !Number.isFinite(domAudit.rasterCombinedViewportCoverage) ||
        domAudit.rasterCombinedViewportCoverage > domPolicy.maximumCombinedRasterCoverage
      ) {
        errors.push("capture report " + index + " exceeds the combined raster coverage limit");
      }
    }
    const loadedImageResources = [
      ...(Array.isArray(report.imageResources) ? report.imageResources : []),
      ...(Array.isArray(report.embeddedImageResources) ? report.embeddedImageResources : []),
    ];
    if (loadedImageResources.some((resource) => resource?.sha256 === manifest.reference?.sha256)) {
      errors.push("capture report " + index + " loaded the registered reference screenshot as an image resource");
    }
    captures.push({ path: candidatePath, sha256: actualHash, reportPath });
  }

  const capturePaths = new Set(captures.map((capture) => capture.path));
  if (capturePaths.size !== captures.length) {
    errors.push("stability captures must use distinct output paths");
  }
  if (new Set(servedArtifactBindings).size !== 1) {
    errors.push("stability captures are not bound to the same served artifact and static resource set");
  }
  if (
    acceptance.mode === "thresholded" &&
    validTimestamp(acceptance.approvedAt) &&
    capturedTimes.length > 0 &&
    Date.parse(acceptance.approvedAt) >= Math.min(...capturedTimes)
  ) {
    errors.push("threshold approval must predate every registered capture");
  }

  const expectedPairs = new Set();
  const expectedPairItems = [];
  for (let left = 0; left < captures.length; left += 1) {
    for (let right = left + 1; right < captures.length; right += 1) {
      expectedPairs.add(pairKey(captures[left].path, captures[right].path));
      expectedPairItems.push([captures[left].path, captures[right].path]);
    }
  }

  const stabilityMetricPaths = Array.isArray(manifest.evidence?.stabilityMetrics)
    ? manifest.evidence.stabilityMetrics
    : [];
  const observedPairs = new Set();
  for (const [index, rawPath] of stabilityMetricPaths.entries()) {
    const metricPath = evidencePath(base, rawPath, "stabilityMetrics[" + index + "]", errors);
    if (!metricPath) continue;
    const metric = readJson(metricPath, "stability metric " + index, errors);
    if (!metric) continue;
    if (
      metric.schemaVersion !== 1 ||
      metric.tool !== "compare_images" ||
      metric.runId !== opts.runId ||
      metric.mode !== "exact" ||
      metric.status !== "passed" ||
      metric.dimensionsMatch !== true ||
      metric.exactMismatchPixels !== 0 ||
      metric.exactPixelMatch !== true ||
      metric.mask !== null ||
      metric.background !== null
    ) {
      errors.push("stability metric " + index + " is not a clean exact comparison");
    }
    const leftPath = path.resolve(metric.reference?.path || "");
    const rightPath = path.resolve(metric.candidate?.path || "");
    if (!capturePaths.has(leftPath) || !capturePaths.has(rightPath) || leftPath === rightPath) {
      errors.push("stability metric " + index + " does not compare two registered captures");
    } else {
      const key = pairKey(leftPath, rightPath);
      if (observedPairs.has(key)) errors.push("stability metric " + index + " duplicates a pair");
      observedPairs.add(key);
    }
    if (
      (fs.existsSync(leftPath) && metric.reference?.sha256 !== sha256File(leftPath)) ||
      (fs.existsSync(rightPath) && metric.candidate?.sha256 !== sha256File(rightPath))
    ) {
      errors.push("stability metric " + index + " image hash is stale or invalid");
    }
  }
  if (observedPairs.size !== expectedPairs.size || [...expectedPairs].some((key) => !observedPairs.has(key))) {
    errors.push(
      "pairwise stability evidence is incomplete: expected pair count " +
      expectedPairs.size +
      ", observed " +
      observedPairs.size
    );
  }

  const recomputeRoot = ensureDirectory(path.join(
    path.dirname(outputPath),
    ".visual-fidelity-recomputed",
    opts.runId,
    String(process.pid) + "-" + String(Date.now())
  ));
  const freshStabilityMetricPaths = [];
  for (const [index, pair] of expectedPairItems.entries()) {
    const fresh = recomputePixels({
      reference: pair[0],
      candidate: pair[1],
      outDir: path.join(recomputeRoot, "stability-" + String(index + 1).padStart(2, "0")),
      mode: "exact",
      runId: opts.runId,
      acceptance,
      maskPath: null,
      errors,
      label: "stability pair " + index,
    });
    if (fresh.metricsPath) freshStabilityMetricPaths.push(fresh.metricsPath);
    if (
      fresh.metrics &&
      (
        fresh.metrics.exactMismatchPixels !== 0 ||
        fresh.metrics.exactPixelMatch !== true ||
        fresh.metrics.mask !== null ||
        fresh.metrics.background !== null
      )
    ) {
      errors.push("stability pair " + index + " actual pixels are not exact");
    }
  }

  const finalMetricsPath = evidencePath(
    base,
    manifest.evidence?.finalComparisonMetrics,
    "finalComparisonMetrics",
    errors
  );
  let finalMetric = null;
  let finalCandidatePath = null;
  if (finalMetricsPath) {
    finalMetric = readJson(finalMetricsPath, "final comparison metrics", errors);
  }
  if (finalMetric) {
    const finalReference = path.resolve(finalMetric.reference?.path || "");
    const finalCandidate = path.resolve(finalMetric.candidate?.path || "");
    finalCandidatePath = finalCandidate;
    if (
      finalMetric.schemaVersion !== 1 ||
      finalMetric.tool !== "compare_images" ||
      finalMetric.runId !== opts.runId ||
      finalMetric.mode !== acceptance.mode ||
      finalMetric.status !== "passed" ||
      finalMetric.dimensionsMatch !== true
    ) {
      errors.push("final comparison does not match the registered acceptance contract");
    }
    if (referencePath && finalReference !== referencePath) {
      errors.push("final comparison does not use the registered untouched reference");
    }
    if (referencePath && finalMetric.reference?.sha256 !== sha256File(referencePath)) {
      errors.push("final comparison reference hash is stale or invalid");
    }
    if (!capturePaths.has(finalCandidate)) {
      errors.push("final comparison candidate is not one of the stable registered captures");
    } else if (finalMetric.candidate?.sha256 !== sha256File(finalCandidate)) {
      errors.push("final comparison candidate hash is stale or invalid");
    }
    if (acceptance.mode === "exact") {
      if (
        finalMetric.exactMismatchPixels !== 0 ||
        finalMetric.exactPixelMatch !== true ||
        finalMetric.mask !== null ||
        finalMetric.background !== null
      ) {
        errors.push("final exact comparison contains mismatch, mask, or background flattening");
      }
    } else {
      if (
        finalMetric.thresholds?.channelTolerance !== acceptance.channelTolerance ||
        finalMetric.thresholds?.maxMismatchRatio !== acceptance.maxMismatchRatio ||
        finalMetric.thresholds?.minPixelSimilarity !== acceptance.minPixelSimilarity
      ) {
        errors.push("final threshold values differ from the pre-approved manifest");
      }
      const manifestMask = acceptance.mask?.path ? path.resolve(base, acceptance.mask.path) : null;
      const metricMask = finalMetric.mask?.path ? path.resolve(finalMetric.mask.path) : null;
      if (manifestMask !== metricMask) errors.push("final comparison mask differs from the approved manifest");
    }
  }

  let freshFinalMetricsPath = null;
  let finalMaskPath = null;
  if (acceptance.mask?.path) {
    finalMaskPath = evidencePath(base, acceptance.mask.path, "acceptance.mask", errors);
    if (finalMaskPath && acceptance.mask.sha256 !== sha256File(finalMaskPath)) {
      errors.push("acceptance.mask SHA-256 is stale or invalid");
    }
  }
  if (referencePath && finalCandidatePath && capturePaths.has(finalCandidatePath)) {
    const freshFinal = recomputePixels({
      reference: referencePath,
      candidate: finalCandidatePath,
      outDir: path.join(recomputeRoot, "final-reference-comparison"),
      mode: acceptance.mode,
      runId: opts.runId,
      acceptance,
      maskPath: finalMaskPath,
      errors,
      label: "final reference comparison",
    });
    freshFinalMetricsPath = freshFinal.metricsPath;
    if (acceptance.mode === "exact" && freshFinal.metrics && freshFinal.metrics.exactPixelMatch !== true) {
      errors.push("final reference comparison actual pixels are not exact");
    }
    if (acceptance.mode === "thresholded" && freshFinal.metrics?.status !== "passed") {
      errors.push("final reference comparison actual pixels do not pass the approved threshold");
    }
  } else {
    errors.push("final reference comparison could not be freshly recomputed from a registered stable capture");
  }

  const passed = errors.length === 0;
  const visualGrade = passed
    ? acceptance.mode === "exact"
      ? "exact"
      : acceptance.mask
        ? "masked"
        : "thresholded"
    : "blocked";
  const result = {
    schemaVersion: 1,
    tool: "verify_visual_fidelity",
    runId: opts.runId,
    verifiedAt: new Date().toISOString(),
    manifest: {
      path: manifestPath,
      sha256: sha256File(manifestPath),
      version: manifest.version,
      page: manifest.page || null,
    },
    passed,
    visualGrade,
    exact100PercentEligible: passed && visualGrade === "exact",
    allowedClaim: passed
      ? visualGrade === "exact"
        ? manifest.reference?.sourceQuality === "original-uncompressed"
          ? "Exact at the registered reference state and render contract."
          : "Exact against the registered provided raster file and render contract; this does not prove recovery of a pre-compression original design."
        : "Passed the pre-approved " + visualGrade + " visual threshold; do not claim exact or 100%."
      : "Visual fidelity is blocked; do not claim exact, pixel perfect, or 100%.",
    stability: {
      captureCount: captures.length,
      minimumRequired: Math.max(3, minimumStableCaptures || 3),
      expectedPairCount: expectedPairs.size,
      observedPairCount: observedPairs.size,
      servedArtifactStable: new Set(servedArtifactBindings).size === 1,
      freshPairwiseMetrics: freshStabilityMetricPaths,
    },
    finalComparisonMetrics: finalMetricsPath,
    freshFinalComparisonMetrics: freshFinalMetricsPath,
    sourceQuality: manifest.reference?.sourceQuality || null,
    restoresPreCompressionOriginal: passed && visualGrade === "exact" && manifest.reference?.sourceQuality === "original-uncompressed",
    productionReady: null,
    productionNote: "This tool verifies visual fidelity only. Production readiness requires a separate delivery gate.",
    errors,
  };
  writeJson(outputPath, result);
  console.log(JSON.stringify({ output: outputPath, ...result }, null, 2));
  if (!passed) process.exit(2);
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
