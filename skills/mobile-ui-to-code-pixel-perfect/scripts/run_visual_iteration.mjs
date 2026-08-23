#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ensureDirectory, ensureFile, numberArg, sha256File, writeJson } from "./lib/runtime.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  return `Usage:
  node run_visual_iteration.mjs --reference <image> (--candidate <image> | --url <url>) \\
    --out-dir <dir> --iteration <id> --mode <exact|thresholded> --run-id <id> [options]

Browser capture options:
  --width <px> --height <px> --dpr <number> --screenshot-scale <css|device>
  --full-page --selector <css> --wait-for <css> --expected-status <code>
  --expected-final-url <url> --browser <chromium|chrome|msedge>

Threshold mode requires all three values before the run:
  --channel-tolerance <0-255>
  --max-mismatch-ratio <0-1>
  --min-pixel-similarity <0-1>

--candidate is an offline comparison path for supplied renders and tests.
--url always performs a fresh strict browser capture before comparison.`;
}

function parseArgs(argv) {
  const opts = { fullPage: false, browser: "chromium" };
  const values = new Set([
    "--reference", "--candidate", "--url", "--out-dir", "--iteration", "--mode", "--run-id",
    "--width", "--height", "--dpr", "--screenshot-scale", "--selector", "--wait-for",
    "--expected-status", "--expected-final-url", "--browser", "--channel-tolerance",
    "--max-mismatch-ratio", "--min-pixel-similarity",
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (values.has(arg)) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${arg} requires a value`);
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      opts[key] = value;
      index += 1;
    } else if (arg === "--full-page") {
      opts.fullPage = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
    }
  }

  for (const key of ["reference", "outDir", "iteration", "mode", "runId"]) {
    if (!opts[key]) throw new Error(`--${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)} is required`);
  }
  if (Boolean(opts.candidate) === Boolean(opts.url)) {
    throw new Error("Provide exactly one of --candidate or --url");
  }
  if (!["exact", "thresholded"].includes(opts.mode)) {
    throw new Error("--mode must be exact or thresholded");
  }

  const thresholdKeys = ["channelTolerance", "maxMismatchRatio", "minPixelSimilarity"];
  const suppliedThresholds = thresholdKeys.filter((key) => opts[key] !== undefined);
  if (opts.mode === "thresholded" && suppliedThresholds.length !== thresholdKeys.length) {
    throw new Error("Thresholded mode requires all three threshold values before capture and comparison");
  }
  if (opts.mode === "exact" && suppliedThresholds.length > 0) {
    throw new Error("Exact mode forbids threshold values");
  }
  if (opts.mode === "thresholded") {
    opts.channelTolerance = numberArg(opts.channelTolerance, "--channel-tolerance", { integer: true, min: 0, max: 255 });
    opts.maxMismatchRatio = numberArg(opts.maxMismatchRatio, "--max-mismatch-ratio", { min: 0, max: 1 });
    opts.minPixelSimilarity = numberArg(opts.minPixelSimilarity, "--min-pixel-similarity", { min: 0, max: 1 });
  }

  if (opts.url) {
    for (const key of ["width", "height", "dpr", "screenshotScale"]) {
      if (opts[key] === undefined) {
        throw new Error(`Browser capture requires --${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`);
      }
    }
    opts.width = numberArg(opts.width, "--width", { integer: true, min: 1 });
    opts.height = numberArg(opts.height, "--height", { integer: true, min: 1 });
    opts.dpr = numberArg(opts.dpr, "--dpr", { min: 0.1, max: 8 });
    if (!["css", "device"].includes(opts.screenshotScale)) {
      throw new Error("--screenshot-scale must be css or device");
    }
    if (opts.expectedStatus !== undefined) {
      opts.expectedStatus = numberArg(opts.expectedStatus, "--expected-status", { integer: true, min: 100, max: 599 });
    }
  }
  return opts;
}

function runNode(script, args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

function writeBlockedLedger(ledgerPath, base, reason, child) {
  const ledger = {
    ...base,
    status: "blocked",
    claimLevel: "blocked",
    nextAction: "fix-capture-or-comparison-error",
    failure: reason,
    childProcess: child ? { status: child.status, stdout: child.stdout, stderr: child.stderr } : null,
  };
  writeJson(ledgerPath, ledger);
  return ledger;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const reference = ensureFile(opts.reference, "reference image");
  const outDir = ensureDirectory(opts.outDir);
  const capturesDir = ensureDirectory(path.join(outDir, "captures"));
  const diffsDir = ensureDirectory(path.join(outDir, "diffs"));
  const ledgerPath = path.join(outDir, "iteration.json");
  const candidateOutput = path.join(capturesDir, `${opts.iteration}.png`);
  const startedAt = new Date().toISOString();
  const base = {
    schemaVersion: 1,
    tool: "run_visual_iteration",
    runId: opts.runId,
    iteration: opts.iteration,
    mode: opts.mode,
    startedAt,
    inputKind: opts.url ? "fresh-browser-capture" : "offline-candidate",
    reference: { path: reference, sha256: sha256File(reference) },
    contract: opts.url ? {
      url: opts.url,
      width: opts.width,
      height: opts.height,
      dpr: opts.dpr,
      screenshotScale: opts.screenshotScale,
      fullPage: opts.fullPage,
      selector: opts.selector || null,
      browser: opts.browser,
    } : null,
    thresholds: opts.mode === "exact" ? {
      channelTolerance: 0,
      maxMismatchRatio: 0,
      minPixelSimilarity: 1,
    } : {
      channelTolerance: opts.channelTolerance,
      maxMismatchRatio: opts.maxMismatchRatio,
      minPixelSimilarity: opts.minPixelSimilarity,
    },
  };

  let captureReport = null;
  if (opts.candidate) {
    const suppliedCandidate = ensureFile(opts.candidate, "candidate image");
    fs.copyFileSync(suppliedCandidate, candidateOutput);
  } else {
    const captureArgs = [
      "--url", opts.url,
      "--output", candidateOutput,
      "--width", String(opts.width),
      "--height", String(opts.height),
      "--dpr", String(opts.dpr),
      "--screenshot-scale", opts.screenshotScale,
      "--browser", opts.browser,
      "--run-id", opts.runId,
      "--server-kind", "development",
      "--strict",
    ];
    if (opts.fullPage) captureArgs.push("--full-page");
    for (const [key, flag] of [
      ["selector", "--selector"], ["waitFor", "--wait-for"],
      ["expectedStatus", "--expected-status"], ["expectedFinalUrl", "--expected-final-url"],
    ]) {
      if (opts[key] !== undefined) captureArgs.push(flag, String(opts[key]));
    }
    const capture = runNode(path.join(scriptsDir, "capture_page.mjs"), captureArgs);
    if (capture.status !== 0) {
      writeBlockedLedger(ledgerPath, base, "strict browser capture failed", capture);
      console.error(capture.stderr || capture.stdout);
      process.exit(capture.status || 1);
    }
    captureReport = candidateOutput.replace(/\.[^.]+$/, "") + ".capture.json";
  }

  const compareArgs = [
    "--reference", reference,
    "--candidate", candidateOutput,
    "--out-dir", diffsDir,
    "--mode", opts.mode,
    "--run-id", opts.runId,
  ];
  if (opts.mode === "thresholded") {
    compareArgs.push(
      "--channel-tolerance", String(opts.channelTolerance),
      "--max-mismatch-ratio", String(opts.maxMismatchRatio),
      "--min-pixel-similarity", String(opts.minPixelSimilarity),
    );
  }
  const comparison = runNode(path.join(scriptsDir, "compare_images.mjs"), compareArgs);
  const metricsPath = path.join(diffsDir, "metrics.json");
  if (!fs.existsSync(metricsPath)) {
    writeBlockedLedger(ledgerPath, base, "comparison failed before metrics were produced", comparison);
    console.error(comparison.stderr || comparison.stdout);
    process.exit(comparison.status || 1);
  }

  const metrics = JSON.parse(fs.readFileSync(metricsPath, "utf8"));
  const passed = metrics.status === "passed";
  const nextAction = passed
    ? opts.mode === "exact"
      ? "eligible-for-stability-gate"
      : "threshold-passed-never-claim-exact"
    : metrics.dimensionsMatch === false
      ? "fix-render-contract"
      : "repair-largest-difference-region";
  const ledger = {
    ...base,
    completedAt: new Date().toISOString(),
    status: metrics.status,
    claimLevel: metrics.claimLevel,
    candidate: { path: candidateOutput, sha256: sha256File(candidateOutput) },
    captureReport,
    comparisonMetrics: metricsPath,
    metrics: {
      dimensionsMatch: metrics.dimensionsMatch,
      exactMismatchPixels: metrics.exactMismatchPixels ?? null,
      exactMismatchRatio: metrics.exactMismatchRatio ?? null,
      toleratedMismatchPixels: metrics.toleratedMismatchPixels ?? null,
      toleratedMismatchRatio: metrics.toleratedMismatchRatio ?? null,
      pixelSimilarity: metrics.pixelSimilarity ?? null,
      exactDifferenceBounds: metrics.exactDifferenceBounds ?? null,
      toleratedDifferenceBounds: metrics.toleratedDifferenceBounds ?? null,
    },
    artifacts: metrics.artifacts || null,
    nextAction,
    finalClaimNote: "One iteration is never sufficient for a 100% or release-ready claim; run the registered stability and production gates.",
    childProcess: { comparisonExitCode: comparison.status },
  };
  writeJson(ledgerPath, ledger);
  console.log(JSON.stringify({ ledger: ledgerPath, ...ledger }, null, 2));
  if (!passed) process.exit(comparison.status === 2 ? 2 : 1);
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
