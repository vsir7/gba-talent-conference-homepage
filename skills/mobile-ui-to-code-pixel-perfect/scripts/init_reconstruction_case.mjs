#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ensureDirectory, ensureFile, numberArg, sha256File, writeJson } from "./lib/runtime.mjs";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  return `Usage:
  node init_reconstruction_case.mjs \\
    --reference <png|jpg> --case-dir <dir> --project-root <dir> \\
    --page <name> --framework <name> --url <url> \\
    --css-width <px> --css-height <px> --dpr <number> \\
    --screenshot-scale <css|device> \\
    --browser <chromium|chrome|msedge> --is-mobile <true|false> \\
    --has-touch <true|false> --locale <locale> --timezone <zone> \\
    --color-scheme <light|dark|no-preference> [options]

Options:
  --capture-mode <viewport|full-page>  Default: viewport.
  --contract-evidence <file>           Required audited contract-selection JSON.
  --task-id <id>                       Default: case directory name.
  --tile-height <px>                   Default: expected viewport pixel height.
  --help                               Show this message.

The render contract is always explicit. The initializer never selects a
viewport or DPR from filename, image width, device conventions, or model guess.`;
}

function parseArgs(argv) {
  const opts = { captureMode: "viewport" };
  const values = new Set([
    "--reference", "--case-dir", "--project-root", "--page", "--framework", "--url",
    "--css-width", "--css-height", "--dpr", "--screenshot-scale", "--capture-mode",
    "--browser", "--is-mobile", "--has-touch", "--locale", "--timezone",
    "--color-scheme", "--task-id", "--tile-height", "--contract-evidence",
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (values.has(arg)) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${arg} requires a value`);
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      opts[key] = value;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
    }
  }

  const identity = ["reference", "caseDir", "projectRoot", "page", "framework", "url"];
  const missingIdentity = identity.filter((key) => !opts[key]);
  if (missingIdentity.length > 0) {
    throw new Error(`Missing required arguments: ${missingIdentity.join(", ")}\n\n${usage()}`);
  }

  const contract = ["cssWidth", "cssHeight", "dpr", "screenshotScale"];
  const missingContract = contract.filter((key) => opts[key] === undefined);
  if (missingContract.length > 0) {
    throw new Error(
      `An explicit render contract is required; missing: ${missingContract.join(", ")}. ` +
      "Do not infer viewport or DPR from the image width."
    );
  }
  if (!opts.contractEvidence) {
    throw new Error(
      "Audited contract selection evidence is required via --contract-evidence. " +
      "A working guess is not eligible for exact tuning."
    );
  }

  const rendererContract = ["browser", "isMobile", "hasTouch", "locale", "timezone", "colorScheme"];
  const missingRendererContract = rendererContract.filter((key) => opts[key] === undefined);
  if (missingRendererContract.length > 0) {
    throw new Error(
      "An explicit renderer contract is required; missing: " +
      missingRendererContract.join(", ") +
      ". Do not inherit browser or device-emulation defaults silently."
    );
  }

  opts.cssWidth = numberArg(opts.cssWidth, "--css-width", { integer: true, min: 1 });
  opts.cssHeight = numberArg(opts.cssHeight, "--css-height", { integer: true, min: 1 });
  opts.dpr = numberArg(opts.dpr, "--dpr", { min: 0.1, max: 8 });
  if (opts.tileHeight !== undefined) {
    opts.tileHeight = numberArg(opts.tileHeight, "--tile-height", { integer: true, min: 1 });
  }
  if (!["css", "device"].includes(opts.screenshotScale)) {
    throw new Error("--screenshot-scale must be css or device");
  }
  if (!["viewport", "full-page"].includes(opts.captureMode)) {
    throw new Error("--capture-mode must be viewport or full-page");
  }
  if (!["chromium", "chrome", "msedge"].includes(opts.browser)) {
    throw new Error("--browser must be chromium, chrome, or msedge");
  }
  for (const key of ["isMobile", "hasTouch"]) {
    if (!["true", "false"].includes(opts[key])) {
      const flag = key === "isMobile" ? "--is-mobile" : "--has-touch";
      throw new Error(flag + " must be true or false");
    }
    opts[key] = opts[key] === "true";
  }
  if (!["light", "dark", "no-preference"].includes(opts.colorScheme)) {
    throw new Error("--color-scheme must be light, dark, or no-preference");
  }
  try {
    opts.parsedUrl = new URL(opts.url);
  } catch {
    throw new Error(`--url must be an absolute URL: ${opts.url}`);
  }
  return opts;
}

function copyTemplate(source, destination) {
  fs.copyFileSync(ensureFile(source, "template"), destination);
}

function runInspector(reference, referenceDir, tileHeight) {
  const script = path.join(skillDir, "scripts/inspect_reference.mjs");
  const args = [script, "--input", reference, "--out-dir", referenceDir];
  if (tileHeight > 0) {
    args.push("--tile-height", String(tileHeight), "--overlap", String(Math.min(80, tileHeight - 1)));
  }
  const result = spawnSync(process.execPath, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Reference inspection failed:\n${result.stderr || result.stdout}`);
  }
}

function expectedPixels(opts) {
  const multiplier = opts.screenshotScale === "device" ? opts.dpr : 1;
  return {
    width: Math.round(opts.cssWidth * multiplier),
    height: Math.round(opts.cssHeight * multiplier),
  };
}

function readContractEvidence(file) {
  const evidencePath = ensureFile(file, "contract selection evidence");
  let evidence;
  try {
    evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  } catch (error) {
    throw new Error("Contract selection evidence must be valid JSON: " + error.message);
  }
  if (
    evidence.schemaVersion !== 1 ||
    !new Set(["user-confirmation", "design-metadata", "project-evidence"]).has(evidence.selectedBy) ||
    !Number.isFinite(Date.parse(evidence.recordedAt)) ||
    !/^sha256:[0-9a-f]{64}$/i.test(evidence.referenceSha256 || "") ||
    typeof evidence.page !== "string" ||
    !evidence.page.trim() ||
    typeof evidence.state !== "string" ||
    !evidence.state.trim() ||
    !Array.isArray(evidence.candidatesConsidered) ||
    evidence.candidatesConsidered.length === 0 ||
    typeof evidence.rationale !== "string" ||
    !evidence.rationale.trim() ||
    typeof evidence.source !== "string" ||
    !evidence.source.trim()
  ) {
    throw new Error(
      "Contract selection evidence requires schemaVersion=1, an audited selectedBy value, " +
      "recordedAt, referenceSha256, page, state, candidatesConsidered, rationale, and source."
    );
  }
  return { path: evidencePath, value: evidence, sha256: sha256File(evidencePath) };
}

function validateSelectedContract(evidence, opts, reference) {
  const selected = evidence.selected;
  if (
    evidence.referenceSha256 !== sha256File(reference) ||
    evidence.page !== opts.page ||
    evidence.state !== "reference-visible-state" ||
    selected?.cssViewport?.width !== opts.cssWidth ||
    selected?.cssViewport?.height !== opts.cssHeight ||
    selected?.deviceScaleFactor !== opts.dpr ||
    selected?.screenshotScale !== opts.screenshotScale ||
    selected?.captureMode !== opts.captureMode ||
    selected?.browser !== opts.browser ||
    selected?.isMobile !== opts.isMobile ||
    selected?.hasTouch !== opts.hasTouch ||
    selected?.locale !== opts.locale ||
    selected?.timezone !== opts.timezone ||
    selected?.colorScheme !== opts.colorScheme
  ) {
    throw new Error("Contract selection evidence does not match the requested render contract");
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const reference = ensureFile(opts.reference, "reference image");
  const contractEvidence = readContractEvidence(opts.contractEvidence);
  const projectRoot = path.resolve(opts.projectRoot);
  if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
    throw new Error(`project root does not exist or is not a directory: ${projectRoot}`);
  }
  const caseDir = path.resolve(opts.caseDir);
  const manifestPath = path.join(caseDir, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    throw new Error(`Refusing to overwrite an existing reconstruction case: ${manifestPath}`);
  }

  const directories = [
    "reference", "analysis", "assets", "shortcut-icons", "captures", "diffs",
    "iterations", "release", "final",
  ];
  for (const directory of directories) ensureDirectory(path.join(caseDir, directory));

  const expected = expectedPixels(opts);
  const tileHeight = opts.tileHeight ?? expected.height;
  const referenceDir = path.join(caseDir, "reference");
  runInspector(reference, referenceDir, tileHeight);
  const metadataPath = path.join(referenceDir, "reference-metadata.json");
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  const actual = metadata.orientedPixelSize;
  const widthMatches = actual.width === expected.width;
  const heightMatches = actual.height === expected.height;
  const dimensionsMatch = opts.captureMode === "full-page" ? widthMatches : widthMatches && heightMatches;
  if (!dimensionsMatch) {
    throw new Error(
      `Explicit render contract does not match reference dimensions: ` +
      `contract=${expected.width}x${expected.height}, reference=${actual.width}x${actual.height}, ` +
      `captureMode=${opts.captureMode}. Change the contract only from source evidence.`
    );
  }
  validateSelectedContract(contractEvidence.value, opts, reference);
  const contractEvidenceTarget = path.join(caseDir, "analysis/contract-selection.json");
  if (path.resolve(contractEvidence.path) !== path.resolve(contractEvidenceTarget)) {
    fs.copyFileSync(contractEvidence.path, contractEvidenceTarget);
  }

  const templatePath = path.join(skillDir, "assets/pixel-perfect-manifest.template.json");
  const manifest = JSON.parse(fs.readFileSync(ensureFile(templatePath, "manifest template"), "utf8"));
  const now = new Date().toISOString();
  manifest.version = Math.max(4, Number(manifest.version) || 0);
  manifest.taskId = opts.taskId || path.basename(caseDir);
  manifest.page = opts.page;
  manifest.implementation.projectRoot = projectRoot;
  manifest.implementation.framework = opts.framework;
  manifest.implementation.packageManager = "unresolved";
  manifest.state.name = "reference-visible-state";
  manifest.state.route = `${opts.parsedUrl.pathname}${opts.parsedUrl.search}`;
  manifest.state.query = opts.parsedUrl.search.replace(/^\?/, "");
  manifest.state.expectedFinalUrl = opts.url;
  manifest.reference = {
    ...manifest.reference,
    path: reference,
    sha256: metadata.sha256,
    captureType: opts.captureMode,
    pixelWidth: actual.width,
    pixelHeight: actual.height,
    orientationApplied: metadata.orientationAppliedForTiles,
    hasAlpha: metadata.hasAlpha,
    sourceNotes: "original user-provided raster reference",
    sourceQuality: "unassessed",
    contractSelection: "explicit",
    contractSelectedAt: now,
    contractSelectedBy: contractEvidence.value.selectedBy,
    contractSelectionEvidence: {
      path: "analysis/contract-selection.json",
      sha256: contractEvidence.sha256,
    },
    contractSelectionRationale: contractEvidence.value.rationale,
    viewportCandidatesObserved: metadata.viewportCandidates,
  };
  manifest.render.url = opts.url;
  manifest.render.cssViewport = { width: opts.cssWidth, height: opts.cssHeight };
  manifest.render.deviceScaleFactor = opts.dpr;
  manifest.render.screenshotScale = opts.screenshotScale;
  manifest.render.expectedPixelSize = { width: actual.width, height: actual.height };
  manifest.render.captureMode = opts.captureMode;
  manifest.render.browser = opts.browser;
  manifest.render.isMobile = opts.isMobile;
  manifest.render.hasTouch = opts.hasTouch;
  manifest.render.locale = opts.locale;
  manifest.render.timezone = opts.timezone;
  manifest.render.colorScheme = opts.colorScheme;
  manifest.render.warmScroll = opts.captureMode === "full-page";
  manifest.render.serverKind = "development";
  manifest.acceptance = {
    ...manifest.acceptance,
    mode: "exact",
    channelTolerance: 0,
    maxMismatchRatio: 0,
    minPixelSimilarity: 1,
    mask: null,
    background: null,
    approvedBy: null,
    approvedAt: null,
    approvalReason: null,
  };
  manifest.reconstruction = {
    objective: "highest-defensible-pixel-fidelity",
    sourceContractStatus: "locked-explicitly",
    modelAssistance: { used: false, purposes: [], outputs: [] },
    inventories: { text: null, components: null, assets: null, states: null },
    iterationPolicy: {
      defaultMode: "exact",
      changeOneVariableGroupPerRound: true,
      postHocThresholdChangesForbidden: true,
      modelSelfAssessmentIsFinalGate: false,
    },
  };
  manifest.evidence.runId = null;
  manifest.evidence.referenceMetadata = "reference/reference-metadata.json";
  manifest.evidence.analysis = "analysis/page-analysis.md";
  manifest.evidence.acceptanceReport = "final/acceptance-report.md";
  manifest.evidence.visualIterations = [];
  manifest.unknowns = [
    "source quality and compression history must be classified",
    "font identity and exact font bytes must be resolved",
    "all visible assets and hidden interaction states must be inventoried",
  ];
  manifest.createdAt = now;

  writeJson(manifestPath, manifest);
  copyTemplate(path.join(skillDir, "assets/page-analysis.template.md"), path.join(caseDir, "analysis/page-analysis.md"));
  copyTemplate(path.join(skillDir, "assets/acceptance-report.template.md"), path.join(caseDir, "final/acceptance-report.md"));
  copyTemplate(path.join(skillDir, "assets/release-readiness.template.md"), path.join(caseDir, "release/release-readiness.md"));

  console.log(JSON.stringify({
    status: "initialized",
    caseDir,
    manifest: manifestPath,
    referenceMetadata: metadataPath,
    contract: {
      cssViewport: manifest.render.cssViewport,
      dpr: opts.dpr,
      screenshotScale: opts.screenshotScale,
      expectedPixelSize: manifest.render.expectedPixelSize,
      selection: "explicit",
    },
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
