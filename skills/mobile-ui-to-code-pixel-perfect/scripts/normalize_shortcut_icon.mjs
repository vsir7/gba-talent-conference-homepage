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
  node normalize_shortcut_icon.mjs --input <alpha-image> --output <png> --size <px> --run-id <id> [options]

Options:
  --subject-extent <0-1>    Long-side share of the final square canvas. Default: 0.74.
  --y-offset-ratio <-1..1>  Vertical offset as a share of canvas size. Default: -0.02.
  --alpha-threshold <0-255> Visible-alpha threshold for source bounds. Default: 8.
  --source-padding <px>     Extra source pixels around detected bounds. Default: 2.
  --run-id <id>             Evidence-chain identifier; required for final assets.
  --help                    Show this message.

The transform is deterministic: alpha-bounds crop, proportional resize, then transparent padding.`;
}

function parseArgs(argv) {
  const opts = {
    subjectExtent: 0.74,
    yOffsetRatio: -0.02,
    alphaThreshold: 8,
    sourcePadding: 2,
  };
  const valueArgs = new Set([
    "--input",
    "--output",
    "--size",
    "--subject-extent",
    "--y-offset-ratio",
    "--alpha-threshold",
    "--source-padding",
    "--run-id",
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
  if (!opts.input || !opts.output || opts.size === undefined || !opts.runId) {
    throw new Error(`Missing --input, --output, --size, or --run-id.\n\n${usage()}`);
  }
  if (path.extname(opts.output).toLowerCase() !== ".png") {
    throw new Error("--output must end in .png");
  }
  opts.size = numberArg(opts.size, "--size", { integer: true, min: 16, max: 4096 });
  opts.subjectExtent = numberArg(opts.subjectExtent, "--subject-extent", { min: 0.1, max: 0.95 });
  opts.yOffsetRatio = numberArg(opts.yOffsetRatio, "--y-offset-ratio", { min: -0.25, max: 0.25 });
  opts.alphaThreshold = numberArg(opts.alphaThreshold, "--alpha-threshold", { integer: true, min: 0, max: 255 });
  opts.sourcePadding = numberArg(opts.sourcePadding, "--source-padding", { integer: true, min: 0, max: 128 });
  return opts;
}

function findAlphaBounds(data, info, threshold) {
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  const channels = info.channels;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * channels + channels - 1];
      if (alpha <= threshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function expandBounds(bounds, width, height, padding) {
  const left = Math.max(0, bounds.left - padding);
  const top = Math.max(0, bounds.top - padding);
  const right = Math.min(width, bounds.left + bounds.width + padding);
  const bottom = Math.min(height, bounds.top + bounds.height + padding);
  return { left, top, width: right - left, height: bottom - top };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const input = ensureFile(opts.input, "transparent shortcut icon source");
  const output = path.resolve(opts.output);
  if (path.resolve(input) === output) throw new Error("Input and output must be different files");
  ensureDirectory(path.dirname(output));
  const { module: sharp, resolution } = await loadPackage("sharp");
  const metadata = await sharp(input, { limitInputPixels: false }).metadata();
  if (!metadata.hasAlpha) throw new Error("Input must contain an alpha channel before normalization");

  const { data, info } = await sharp(input, { limitInputPixels: false })
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sourceEdgeAlphaPixels = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (x !== 0 && y !== 0 && x !== info.width - 1 && y !== info.height - 1) continue;
      const alpha = data[(y * info.width + x) * info.channels + info.channels - 1];
      if (alpha > opts.alphaThreshold) sourceEdgeAlphaPixels += 1;
    }
  }
  const detected = findAlphaBounds(data, info, opts.alphaThreshold);
  if (!detected) throw new Error("Input contains no visible alpha subject pixels");
  const crop = expandBounds(detected, info.width, info.height, opts.sourcePadding);
  const targetLongSide = Math.max(1, Math.round(opts.size * opts.subjectExtent));
  const scale = targetLongSide / Math.max(crop.width, crop.height);
  const resizedWidth = Math.max(1, Math.round(crop.width * scale));
  const resizedHeight = Math.max(1, Math.round(crop.height * scale));
  let left = Math.round((opts.size - resizedWidth) / 2);
  let top = Math.round((opts.size - resizedHeight) / 2 + opts.size * opts.yOffsetRatio);
  left = Math.max(0, Math.min(opts.size - resizedWidth, left));
  top = Math.max(0, Math.min(opts.size - resizedHeight, top));

  const subject = await sharp(input, { limitInputPixels: false })
    .rotate()
    .extract(crop)
    .resize(resizedWidth, resizedHeight, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: opts.size,
      height: opts.size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: subject, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);

  const finalMetadata = await sharp(output).metadata();
  const report = {
    schemaVersion: 1,
    tool: "normalize_shortcut_icon",
    runId: opts.runId,
    normalizedAt: new Date().toISOString(),
    transform: "alpha bounds crop, proportional Lanczos3 resize, transparent square padding; no stretch or model call",
    source: {
      path: input,
      sha256: sha256File(input),
      pixelSize: { width: info.width, height: info.height },
      detectedAlphaBounds: detected,
      expandedCrop: crop,
      alphaThreshold: opts.alphaThreshold,
      sourcePadding: opts.sourcePadding,
      edgeAlphaPixels: sourceEdgeAlphaPixels,
      edgeAlphaNote: sourceEdgeAlphaPixels > 0
        ? "Accepted because normalization adds a new transparent safe area; the final validator still rejects opaque rectangular backing plates"
        : "Source already contains transparent edge padding",
    },
    normalization: {
      canvasSize: opts.size,
      subjectExtent: opts.subjectExtent,
      yOffsetRatio: opts.yOffsetRatio,
      resizedSubject: { width: resizedWidth, height: resizedHeight, left, top },
    },
    output: {
      path: output,
      sha256: sha256File(output),
      pixelSize: { width: finalMetadata.width, height: finalMetadata.height },
      format: finalMetadata.format,
      hasAlpha: Boolean(finalMetadata.hasAlpha),
    },
    dependency: { sharp: resolution.resolved },
  };
  const reportPath = output.replace(/\.png$/i, ".asset.json");
  writeJson(reportPath, report);
  console.log(JSON.stringify({ report: reportPath, ...report }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
