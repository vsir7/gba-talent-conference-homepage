#!/usr/bin/env node

import fs from "node:fs";
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
  node inspect_reference.mjs --input <image> --out-dir <dir> [options]

Options:
  --tile-height <px>  Generate vertical PNG tiles. Default: 0 (disabled).
  --overlap <px>      Tile overlap. Default: 80.
  --help              Show this message.`;
}

function parseArgs(argv) {
  const opts = { tileHeight: 0, overlap: 80 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--input") {
      opts.input = next;
      i += 1;
    } else if (arg === "--out-dir") {
      opts.outDir = next;
      i += 1;
    } else if (arg === "--tile-height") {
      opts.tileHeight = numberArg(next, arg, { integer: true, min: 0 });
      i += 1;
    } else if (arg === "--overlap") {
      opts.overlap = numberArg(next, arg, { integer: true, min: 0 });
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
    }
  }
  if (!opts.input || !opts.outDir) throw new Error(`Missing --input or --out-dir.\n\n${usage()}`);
  if (opts.tileHeight > 0 && opts.overlap >= opts.tileHeight) {
    throw new Error("--overlap must be smaller than --tile-height");
  }
  return opts;
}

function orientedDimensions(metadata) {
  const swap = [5, 6, 7, 8].includes(metadata.orientation);
  return {
    width: swap ? metadata.height : metadata.width,
    height: swap ? metadata.width : metadata.height,
  };
}

function viewportCandidates(pixelWidth) {
  const known = new Map([
    [640, { cssWidth: 320, dpr: 2 }],
    [720, { cssWidth: 360, dpr: 2 }],
    [750, { cssWidth: 375, dpr: 2 }],
    [780, { cssWidth: 390, dpr: 2 }],
    [828, { cssWidth: 414, dpr: 2 }],
    [1125, { cssWidth: 375, dpr: 3 }],
    [1170, { cssWidth: 390, dpr: 3 }],
    [1242, { cssWidth: 414, dpr: 3 }],
  ]);
  const candidates = [];
  if (pixelWidth >= 320 && pixelWidth <= 480) {
    candidates.push({
      cssWidth: pixelWidth,
      dpr: 1,
      screenshotScale: "css",
      reason: "image width is within a common mobile CSS viewport range",
    });
  }
  if (known.has(pixelWidth)) {
    const candidate = known.get(pixelWidth);
    candidates.push({
      ...candidate,
      screenshotScale: "device",
      reason: "matches a common 2x/3x mobile export width",
    });
  }
  for (const dpr of [2, 3]) {
    const cssWidth = pixelWidth / dpr;
    if (Number.isInteger(cssWidth) && cssWidth >= 320 && cssWidth <= 480) {
      if (!candidates.some((item) => item.cssWidth === cssWidth && item.dpr === dpr)) {
        candidates.push({
          cssWidth,
          dpr,
          screenshotScale: "device",
          reason: `pixel width divides into a plausible CSS width at DPR ${dpr}`,
        });
      }
    }
  }
  return candidates;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const input = ensureFile(opts.input, "reference image");
  const outDir = ensureDirectory(opts.outDir);
  const { module: sharp, resolution } = await loadPackage("sharp");
  const metadata = await sharp(input, { limitInputPixels: false }).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Cannot read image dimensions: ${input}`);

  const oriented = orientedDimensions(metadata);
  const report = {
    schemaVersion: 1,
    tool: "inspect_reference",
    inspectedAt: new Date().toISOString(),
    input,
    sha256: sha256File(input),
    format: metadata.format,
    rawPixelSize: { width: metadata.width, height: metadata.height },
    orientedPixelSize: oriented,
    orientation: metadata.orientation ?? null,
    orientationAppliedForTiles: true,
    colorSpace: metadata.space ?? null,
    channels: metadata.channels ?? null,
    hasAlpha: Boolean(metadata.hasAlpha),
    density: metadata.density ?? null,
    hasIccProfile: Boolean(metadata.icc),
    hasExif: Boolean(metadata.exif),
    aspectRatio: Number((oriented.width / oriented.height).toFixed(8)),
    viewportCandidates: viewportCandidates(oriented.width),
    dependency: { sharp: resolution.resolved },
    tiles: [],
  };

  if (opts.tileHeight > 0) {
    const tilesDir = ensureDirectory(path.join(outDir, "tiles"));
    const step = opts.tileHeight - opts.overlap;
    let index = 1;
    for (let top = 0; top < oriented.height; top += step) {
      const height = Math.min(opts.tileHeight, oriented.height - top);
      const filename = `tile-${String(index).padStart(3, "0")}-y${String(top).padStart(5, "0")}.png`;
      const output = path.join(tilesDir, filename);
      await sharp(input, { limitInputPixels: false })
        .rotate()
        .extract({ left: 0, top, width: oriented.width, height })
        .png()
        .toFile(output);
      report.tiles.push({ file: path.relative(outDir, output), top, height });
      index += 1;
      if (top + height >= oriented.height) break;
    }
  }

  const reportPath = path.join(outDir, "reference-metadata.json");
  writeJson(reportPath, report);
  console.log(JSON.stringify({ report: reportPath, ...report }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
