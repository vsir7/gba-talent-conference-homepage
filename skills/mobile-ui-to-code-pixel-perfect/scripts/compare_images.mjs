#!/usr/bin/env node

import path from "node:path";
import {
  ensureDirectory,
  ensureFile,
  loadPackage,
  numberArg,
  sha256File,
  writeJson,
} from "./lib/runtime.mjs";

function usage() {
  return `Usage:
  node compare_images.mjs --reference <image> --candidate <image> --out-dir <dir> --mode <exact|thresholded> [options]

Options:
  --channel-tolerance <0-255>    Required for thresholded mode.
  --max-mismatch-ratio <0-1>    Required for thresholded mode.
  --min-pixel-similarity <0-1>  Required for thresholded mode.
  --mask <image>                 White pixels are excluded. Any mask forbids a 100% claim.
  --background <hex>             Flatten both images before thresholded comparison. Forbidden in exact mode.
  --run-id <id>                  Evidence-chain identifier for final acceptance.
  --help                         Show this message.`;
}

function parseArgs(argv) {
  const opts = {};
  const valueArgs = new Set([
    "--reference", "--candidate", "--out-dir", "--mode", "--channel-tolerance",
    "--max-mismatch-ratio", "--min-pixel-similarity", "--mask", "--background", "--run-id",
  ]);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (valueArgs.has(arg)) {
      const next = argv[i + 1];
      if (!next) throw new Error(`${arg} requires a value`);
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      opts[key] = next;
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
    }
  }
  if (!opts.reference || !opts.candidate || !opts.outDir || !opts.mode) {
    throw new Error(`Missing required arguments.\n\n${usage()}`);
  }
  if (!["exact", "thresholded"].includes(opts.mode)) {
    throw new Error("--mode must be exact or thresholded");
  }
  if (opts.mode === "exact") {
    if (opts.background) {
      throw new Error("--background is forbidden in exact mode because flattening can hide RGBA differences");
    }
    opts.channelTolerance = 0;
    opts.maxMismatchRatio = 0;
    opts.minPixelSimilarity = 1;
  } else {
    for (const name of ["channelTolerance", "maxMismatchRatio", "minPixelSimilarity"]) {
      if (opts[name] === undefined) {
        throw new Error(`thresholded mode requires --${name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`);
      }
    }
    opts.channelTolerance = numberArg(opts.channelTolerance, "--channel-tolerance", { integer: true, min: 0, max: 255 });
    opts.maxMismatchRatio = numberArg(opts.maxMismatchRatio, "--max-mismatch-ratio", { min: 0, max: 1 });
    opts.minPixelSimilarity = numberArg(opts.minPixelSimilarity, "--min-pixel-similarity", { min: 0, max: 1 });
  }
  if (opts.background && !/^#?[0-9a-f]{6}$/i.test(opts.background)) {
    throw new Error("--background must be a 6-digit hex color");
  }
  return opts;
}

function colorObject(hex) {
  const value = hex.replace(/^#/, "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
    alpha: 1,
  };
}

async function readPixels(sharp, file, background) {
  let pipeline = sharp(file, { limitInputPixels: false }).rotate().toColourspace("srgb");
  if (background) pipeline = pipeline.flatten({ background: colorObject(background) });
  return await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

function emptyBounds() {
  return { minX: Infinity, minY: Infinity, maxX: -1, maxY: -1 };
}

function addToBounds(bounds, x, y) {
  bounds.minX = Math.min(bounds.minX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.maxY = Math.max(bounds.maxY, y);
}

function serializeBounds(bounds) {
  if (bounds.maxX < 0) return null;
  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX + 1,
    height: bounds.maxY - bounds.minY + 1,
    right: bounds.maxX,
    bottom: bounds.maxY,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const reference = ensureFile(opts.reference, "reference image");
  const candidate = ensureFile(opts.candidate, "candidate image");
  const mask = opts.mask ? ensureFile(opts.mask, "mask image") : null;
  const outDir = ensureDirectory(opts.outDir);
  const { module: sharp, resolution } = await loadPackage("sharp");

  const ref = await readPixels(sharp, reference, opts.background);
  const actual = await readPixels(sharp, candidate, opts.background);
  const baseReport = {
    schemaVersion: 1,
    tool: "compare_images",
    runId: opts.runId || null,
    comparedAt: new Date().toISOString(),
    mode: opts.mode,
    reference: { path: reference, sha256: sha256File(reference), width: ref.info.width, height: ref.info.height },
    candidate: { path: candidate, sha256: sha256File(candidate), width: actual.info.width, height: actual.info.height },
    mask: mask ? { path: mask, sha256: sha256File(mask) } : null,
    background: opts.background || null,
    thresholds: {
      channelTolerance: opts.channelTolerance,
      maxMismatchRatio: opts.maxMismatchRatio,
      minPixelSimilarity: opts.minPixelSimilarity,
    },
    dependency: { sharp: resolution.resolved },
  };

  const dimensionsMatch = ref.info.width === actual.info.width && ref.info.height === actual.info.height;
  if (!dimensionsMatch) {
    const report = {
      ...baseReport,
      status: "failed",
      claimLevel: "blocked",
      dimensionsMatch: false,
      failure: "Reference and candidate pixel dimensions differ. Automatic resize/crop/alignment is forbidden.",
    };
    const metricsPath = path.join(outDir, "metrics.json");
    writeJson(metricsPath, report);
    console.log(JSON.stringify({ metrics: metricsPath, ...report }, null, 2));
    process.exit(2);
  }

  let maskPixels = null;
  if (mask) {
    const decodedMask = await sharp(mask, { limitInputPixels: false })
      .rotate()
      .toColourspace("b-w")
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (decodedMask.info.width !== ref.info.width || decodedMask.info.height !== ref.info.height) {
      throw new Error("Mask pixel dimensions must match the reference image");
    }
    maskPixels = decodedMask.data;
  }

  const width = ref.info.width;
  const height = ref.info.height;
  const totalPixels = width * height;
  const diff = Buffer.alloc(totalPixels * 4);
  const overlay = Buffer.alloc(totalPixels * 4);
  const exactBounds = emptyBounds();
  const toleratedBounds = emptyBounds();
  let excludedPixels = 0;
  let exactMismatchPixels = 0;
  let toleratedMismatchPixels = 0;
  let totalAbsoluteChannelError = 0;
  let maxChannelError = 0;

  for (let pixel = 0; pixel < totalPixels; pixel += 1) {
    const offset = pixel * 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const excluded = maskPixels ? maskPixels[pixel] > 127 : false;
    let pixelMax = 0;
    let pixelSum = 0;
    for (let channel = 0; channel < 4; channel += 1) {
      const error = Math.abs(ref.data[offset + channel] - actual.data[offset + channel]);
      pixelMax = Math.max(pixelMax, error);
      pixelSum += error;
      overlay[offset + channel] = channel === 3
        ? 255
        : Math.round((ref.data[offset + channel] + actual.data[offset + channel]) / 2);
    }

    if (excluded) {
      excludedPixels += 1;
      diff[offset] = 60;
      diff[offset + 1] = 120;
      diff[offset + 2] = 255;
      diff[offset + 3] = 180;
      continue;
    }

    totalAbsoluteChannelError += pixelSum;
    maxChannelError = Math.max(maxChannelError, pixelMax);
    if (pixelMax > 0) {
      exactMismatchPixels += 1;
      addToBounds(exactBounds, x, y);
    }
    if (pixelMax > opts.channelTolerance) {
      toleratedMismatchPixels += 1;
      addToBounds(toleratedBounds, x, y);
      diff[offset] = 255;
      diff[offset + 1] = Math.max(0, 180 - pixelMax);
      diff[offset + 2] = 0;
      diff[offset + 3] = 255;
    } else {
      const grey = Math.round(
        0.2126 * ref.data[offset] + 0.7152 * ref.data[offset + 1] + 0.0722 * ref.data[offset + 2]
      );
      diff[offset] = grey;
      diff[offset + 1] = grey;
      diff[offset + 2] = grey;
      diff[offset + 3] = 72;
    }
  }

  const evaluatedPixels = totalPixels - excludedPixels;
  if (evaluatedPixels <= 0) throw new Error("Mask excludes every pixel; no comparison remains");
  const exactMismatchRatio = exactMismatchPixels / evaluatedPixels;
  const toleratedMismatchRatio = toleratedMismatchPixels / evaluatedPixels;
  const meanAbsoluteChannelError = totalAbsoluteChannelError / (evaluatedPixels * 4);
  const pixelSimilarity = 1 - totalAbsoluteChannelError / (evaluatedPixels * 4 * 255);
  const exactPass = exactMismatchPixels === 0;
  const thresholdPass =
    toleratedMismatchRatio <= opts.maxMismatchRatio && pixelSimilarity >= opts.minPixelSimilarity;
  const passed = opts.mode === "exact" ? exactPass : thresholdPass;
  const claimLevel = !passed ? "failed" : mask ? "masked" : opts.mode === "exact" ? "exact" : "thresholded";

  const diffPath = path.join(outDir, "diff.png");
  const overlayPath = path.join(outDir, "overlay.png");
  await sharp(diff, { raw: { width, height, channels: 4 } }).png().toFile(diffPath);
  await sharp(overlay, { raw: { width, height, channels: 4 } }).png().toFile(overlayPath);

  const report = {
    ...baseReport,
    status: passed ? "passed" : "failed",
    claimLevel,
    dimensionsMatch: true,
    totalPixels,
    evaluatedPixels,
    excludedPixels,
    excludedRatio: excludedPixels / totalPixels,
    exactMismatchPixels,
    exactMismatchRatio,
    toleratedMismatchPixels,
    toleratedMismatchRatio,
    meanAbsoluteChannelError,
    maxChannelError,
    pixelSimilarity,
    exactDifferenceBounds: serializeBounds(exactBounds),
    toleratedDifferenceBounds: serializeBounds(toleratedBounds),
    artifacts: {
      diff: diffPath,
      diffSha256: sha256File(diffPath),
      overlay: overlayPath,
      overlaySha256: sha256File(overlayPath),
    },
    exactPixelMatch: passed && opts.mode === "exact" && !mask && !opts.background && exactMismatchPixels === 0,
    exact100PercentEligible: false,
    finalClaimNote: "This script verifies pixels only. A 100% claim also requires the registered render contract, strict capture reports, and three-capture stability evidence.",
  };
  const metricsPath = path.join(outDir, "metrics.json");
  writeJson(metricsPath, report);
  console.log(JSON.stringify({ metrics: metricsPath, ...report }, null, 2));
  if (!passed) process.exit(2);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
