#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  ensureFile,
  loadPackage,
  sha256File,
  writeJson,
} from "./lib/runtime.mjs";

function usage() {
  return `Usage:
  node validate_shortcut_icons.mjs --manifest <json> --run-id <id> [--output <json>]

Validates the provenance and raster constraints of image-generated primary shortcut icons.`;
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--manifest" || arg === "--output" || arg === "--run-id") {
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
  if (!opts.manifest) throw new Error(`Missing --manifest.\n\n${usage()}`);
  return opts;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isFiniteRatio(value) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function resolveAsset(manifestDir, value, label, errors) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${label} is required`);
    return null;
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    errors.push(`${label} must be a local file, not a URL: ${value}`);
    return null;
  }
  const absolute = path.isAbsolute(value) ? value : path.resolve(manifestDir, value);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    errors.push(`${label} does not exist: ${absolute}`);
    return null;
  }
  return absolute;
}

function requireText(value, label, errors) {
  if (typeof value !== "string" || !value.trim() || /^replace-/i.test(value.trim())) {
    errors.push(`${label} must be a non-placeholder string`);
    return false;
  }
  return true;
}

function requireSha256(value, label, errors) {
  if (typeof value !== "string" || !/^sha256:[0-9a-f]{64}$/i.test(value)) {
    errors.push(`${label} must be a sha256:<64 hex> digest`);
    return false;
  }
  return true;
}

function sha256Text(value) {
  return `sha256:${crypto.createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function sha256DataUrl(value) {
  if (typeof value !== "string" || !/^data:/i.test(value)) return null;
  const comma = value.indexOf(",");
  if (comma < 0) return null;
  const header = value.slice(0, comma);
  const payload = value.slice(comma + 1);
  try {
    const bytes = /;base64(?:;|$)/i.test(header)
      ? Buffer.from(payload, "base64")
      : Buffer.from(decodeURIComponent(payload), "utf8");
    return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
  } catch {
    return null;
  }
}

function readJson(file, label, errors) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

async function alphaGeometry(sharp, file, alphaThreshold) {
  const { data, info } = await sharp(file, { limitInputPixels: false })
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  let edgeAlphaPixels = 0;
  let subjectPixels = 0;
  let opaquePixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * channels + channels - 1];
      if (alpha <= alphaThreshold) continue;
      subjectPixels += 1;
      if (alpha >= 250) opaquePixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      if (x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1) {
        edgeAlphaPixels += 1;
      }
    }
  }

  if (subjectPixels === 0) {
    return {
      subjectPixels,
      edgeAlphaPixels,
      boundingBox: null,
      extentRatio: 0,
      boundingBoxOccupancyRatio: 0,
      opaqueBoundingBoxOccupancyRatio: 0,
      solidRowsRatio: 0,
      solidColumnsRatio: 0,
      looksLikeOpaquePlate: false,
    };
  }

  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  const boxArea = boxWidth * boxHeight;
  let solidRows = 0;
  let solidColumns = 0;
  for (let y = minY; y <= maxY; y += 1) {
    let visible = 0;
    for (let x = minX; x <= maxX; x += 1) {
      const alpha = data[(y * info.width + x) * channels + channels - 1];
      if (alpha > alphaThreshold) visible += 1;
    }
    if (visible / boxWidth >= 0.98) solidRows += 1;
  }
  for (let x = minX; x <= maxX; x += 1) {
    let visible = 0;
    for (let y = minY; y <= maxY; y += 1) {
      const alpha = data[(y * info.width + x) * channels + channels - 1];
      if (alpha > alphaThreshold) visible += 1;
    }
    if (visible / boxHeight >= 0.98) solidColumns += 1;
  }
  const boundingBoxOccupancyRatio = subjectPixels / boxArea;
  const opaqueBoundingBoxOccupancyRatio = opaquePixels / boxArea;
  const solidRowsRatio = solidRows / boxHeight;
  const solidColumnsRatio = solidColumns / boxWidth;
  return {
    subjectPixels,
    edgeAlphaPixels,
    boundingBox: { x: minX, y: minY, width: boxWidth, height: boxHeight },
    extentRatio: Number(Math.max(boxWidth / info.width, boxHeight / info.height).toFixed(6)),
    boundingBoxOccupancyRatio: Number(boundingBoxOccupancyRatio.toFixed(6)),
    opaqueBoundingBoxOccupancyRatio: Number(opaqueBoundingBoxOccupancyRatio.toFixed(6)),
    solidRowsRatio: Number(solidRowsRatio.toFixed(6)),
    solidColumnsRatio: Number(solidColumnsRatio.toFixed(6)),
    looksLikeOpaquePlate:
      opaqueBoundingBoxOccupancyRatio >= 0.985 && solidRowsRatio >= 0.95 && solidColumnsRatio >= 0.95,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.runId || /^replace-/i.test(opts.runId)) {
    throw new Error("--run-id is required and must be non-placeholder for final shortcut validation");
  }
  const manifestPath = ensureFile(opts.manifest, "shortcut icon manifest");
  const manifestDir = path.dirname(manifestPath);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const errors = [];
  const warnings = [];

  if (manifest.version !== 2) errors.push("shortcut icon manifest version must be 2");
  if (manifest.runId !== opts.runId) errors.push("manifest.runId must match --run-id");

  if (manifest.thirdPartyShortcutIconsAllowed !== false) {
    errors.push("thirdPartyShortcutIconsAllowed must be false");
  }
  if (manifest.labelsRenderedAsDom !== true) {
    errors.push("labelsRenderedAsDom must be true");
  }
  if (manifest.rights?.referenceUseConfirmed !== true) {
    errors.push("rights.referenceUseConfirmed must be true before final asset validation");
  }
  if (manifest.generation?.skill !== "imagegen") {
    errors.push('generation.skill must be "imagegen"');
  }
  if (!new Set(["built-in", "cli"]).has(manifest.generation?.mode)) {
    errors.push('generation.mode must be "built-in" or "cli"');
  }
  if (manifest.generation?.tool !== "image_gen.imagegen") {
    errors.push('generation.tool must be "image_gen.imagegen"');
  }
  requireText(manifest.generation?.stylePrompt, "generation.stylePrompt", errors);

  const delivery = manifest.styleLock?.delivery ?? {};
  for (const field of ["width", "height", "maxBytes"]) {
    if (!isPositiveInteger(delivery[field])) errors.push(`styleLock.delivery.${field} must be a positive integer`);
  }
  if (delivery.requireAlpha !== true) errors.push("styleLock.delivery.requireAlpha must be true");
  if (delivery.requireTransparentBorder !== true) {
    errors.push("styleLock.delivery.requireTransparentBorder must be true");
  }
  if (!Number.isInteger(delivery.alphaThreshold) || delivery.alphaThreshold < 0 || delivery.alphaThreshold > 255) {
    errors.push("styleLock.delivery.alphaThreshold must be an integer from 0 to 255");
  }
  if (!isFiniteRatio(delivery.minSubjectExtentRatio)) {
    errors.push("styleLock.delivery.minSubjectExtentRatio must be between 0 and 1");
  }
  if (!isFiniteRatio(delivery.maxSubjectExtentRatio)) {
    errors.push("styleLock.delivery.maxSubjectExtentRatio must be between 0 and 1");
  }
  if (!isFiniteRatio(delivery.maxOpaquePlateCoverage) || delivery.maxOpaquePlateCoverage > 0.99) {
    errors.push("styleLock.delivery.maxOpaquePlateCoverage must be between 0 and 0.99");
  }
  if (
    isFiniteRatio(delivery.minSubjectExtentRatio) &&
    isFiniteRatio(delivery.maxSubjectExtentRatio) &&
    delivery.minSubjectExtentRatio > delivery.maxSubjectExtentRatio
  ) {
    errors.push("minSubjectExtentRatio cannot exceed maxSubjectExtentRatio");
  }

  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    errors.push("icons must contain at least one shortcut icon");
  }

  const { module: sharp, resolution } = await loadPackage("sharp");
  const seenIds = new Set();
  const seenHashes = new Map();
  const results = [];

  for (const [index, icon] of (manifest.icons ?? []).entries()) {
    const prefix = `icons[${index}]`;
    const iconErrors = [];
    requireText(icon.id, `${prefix}.id`, iconErrors);
    requireText(icon.label, `${prefix}.label`, iconErrors);
    requireText(icon.semantic, `${prefix}.semantic`, iconErrors);
    requireText(icon.prompt, `${prefix}.prompt`, iconErrors);
    if (!isPositiveInteger(icon.attempt)) iconErrors.push(`${prefix}.attempt must be a positive integer`);
    requireSha256(icon.sourceSha256, `${prefix}.sourceSha256`, iconErrors);
    requireSha256(icon.generationReceiptSha256, `${prefix}.generationReceiptSha256`, iconErrors);
    requireSha256(icon.alphaSourceSha256, `${prefix}.alphaSourceSha256`, iconErrors);
    requireSha256(icon.normalizationReportSha256, `${prefix}.normalizationReportSha256`, iconErrors);
    requireSha256(icon.finalSha256, `${prefix}.finalSha256`, iconErrors);
    if (icon.sourceKind !== "image-generation") iconErrors.push(`${prefix}.sourceKind must be "image-generation"`);
    if (icon.thirdParty !== false) iconErrors.push(`${prefix}.thirdParty must be false`);
    if (icon.selected !== true) iconErrors.push(`${prefix}.selected must be true for a final icon`);
    if (seenIds.has(icon.id)) iconErrors.push(`${prefix}.id is duplicated: ${icon.id}`);
    if (typeof icon.id === "string") seenIds.add(icon.id);

    const sourceOutput = resolveAsset(manifestDir, icon.sourceOutput, `${prefix}.sourceOutput`, iconErrors);
    const generationReceipt = resolveAsset(manifestDir, icon.generationReceipt, `${prefix}.generationReceipt`, iconErrors);
    const alphaSource = resolveAsset(manifestDir, icon.alphaSourcePath, `${prefix}.alphaSourcePath`, iconErrors);
    const normalizationReport = resolveAsset(manifestDir, icon.normalizationReport, `${prefix}.normalizationReport`, iconErrors);
    const finalPath = resolveAsset(manifestDir, icon.finalPath, `${prefix}.finalPath`, iconErrors);
    let sourceSha256 = null;
    let finalSha256 = null;
    let metadata = null;
    let geometry = null;
    let alphaSourceGeometry = null;

    if (sourceOutput) {
      sourceSha256 = sha256File(sourceOutput);
      if (icon.sourceSha256 !== sourceSha256) {
        iconErrors.push(`${prefix}.sourceSha256 does not match the source file`);
      }
    }

    if (generationReceipt) {
      const receiptSha256 = sha256File(generationReceipt);
      if (icon.generationReceiptSha256 !== receiptSha256) {
        iconErrors.push(`${prefix}.generationReceiptSha256 does not match the receipt file`);
      }
      const receipt = readJson(generationReceipt, `${prefix}.generationReceipt`, iconErrors);
      if (receipt) {
        if (receipt.schemaVersion !== 1 || receipt.tool !== "image_gen.imagegen" || receipt.runId !== opts.runId) {
          iconErrors.push(`${prefix}.generationReceipt tool/schemaVersion/runId does not match the gate run`);
        }
        requireText(receipt.toolCallId, `${prefix}.generationReceipt.toolCallId`, iconErrors);
        requireText(receipt.resultId, `${prefix}.generationReceipt.resultId`, iconErrors);
        if (!Number.isFinite(Date.parse(receipt.generatedAt))) {
          iconErrors.push(`${prefix}.generationReceipt.generatedAt must be an ISO timestamp`);
        }
        if (receipt.promptSha256 !== sha256Text(icon.prompt)) {
          iconErrors.push(`${prefix}.generationReceipt.promptSha256 does not match the selected prompt`);
        }
        if (
          sourceOutput &&
          (path.resolve(receipt.sourceOutput || "") !== path.resolve(sourceOutput) || receipt.sourceSha256 !== sourceSha256)
        ) {
          iconErrors.push(`${prefix}.generationReceipt is not bound to the current source output`);
        }
        const rawToolResult = resolveAsset(
          path.dirname(generationReceipt),
          receipt.rawToolResult?.archivedPath,
          `${prefix}.generationReceipt.rawToolResult.archivedPath`,
          iconErrors
        );
        if (!requireSha256(receipt.rawToolResult?.sha256, `${prefix}.generationReceipt.rawToolResult.sha256`, iconErrors)) {
          // requireSha256 records the failure.
        } else if (rawToolResult && sha256File(rawToolResult) !== receipt.rawToolResult.sha256) {
          iconErrors.push(`${prefix}.generationReceipt.rawToolResult.sha256 does not match the archived tool result`);
        }
        if (rawToolResult) {
          const raw = readJson(rawToolResult, `${prefix}.generationReceipt.rawToolResult`, iconErrors);
          if (raw) {
            if (
              raw.schemaVersion !== 1 ||
              raw.tool !== "image_gen.imagegen" ||
              raw.toolCallId !== receipt.toolCallId ||
              raw.resultId !== receipt.resultId
            ) {
              iconErrors.push(`${prefix}.rawToolResult tool/schema/toolCallId/resultId does not match the receipt`);
            }
            const returnedImageSha256 = sha256DataUrl(raw.result?.image_url);
            if (!returnedImageSha256 || returnedImageSha256 !== sourceSha256) {
              iconErrors.push(`${prefix}.rawToolResult image_url bytes do not match the archived generated source output`);
            }
          }
        }
      }
    }

    if (!new Set(["chroma-key", "native-alpha"]).has(icon.backgroundRemoval?.mode)) {
      iconErrors.push(`${prefix}.backgroundRemoval.mode must be chroma-key or native-alpha`);
    }
    requireText(icon.backgroundRemoval?.tool, `${prefix}.backgroundRemoval.tool`, iconErrors);
    if (icon.backgroundRemoval?.mode === "chroma-key" && !/^#[0-9a-f]{6}$/i.test(icon.backgroundRemoval?.keyColor || "")) {
      iconErrors.push(`${prefix}.backgroundRemoval.keyColor must be a 6-digit hex color for chroma-key removal`);
    }
    if (alphaSource) {
      if (sha256File(alphaSource) !== icon.alphaSourceSha256) {
        iconErrors.push(`${prefix}.alphaSourceSha256 does not match the alpha source file`);
      }
      const alphaMetadata = await sharp(alphaSource, { limitInputPixels: false }).metadata();
      if (!alphaMetadata.hasAlpha) iconErrors.push(`${prefix}.alphaSourcePath must contain an alpha channel`);
      alphaSourceGeometry = await alphaGeometry(sharp, alphaSource, delivery.alphaThreshold ?? 0);
      if (
        alphaSourceGeometry.opaqueBoundingBoxOccupancyRatio > (delivery.maxOpaquePlateCoverage ?? 0.985) &&
        alphaSourceGeometry.solidRowsRatio >= 0.95 &&
        alphaSourceGeometry.solidColumnsRatio >= 0.95
      ) {
        iconErrors.push(`${prefix}.alphaSourcePath looks like an opaque rectangular backing plate inside transparent padding`);
      }
    }

    if (normalizationReport) {
      if (sha256File(normalizationReport) !== icon.normalizationReportSha256) {
        iconErrors.push(`${prefix}.normalizationReportSha256 does not match the report file`);
      }
      const report = readJson(normalizationReport, `${prefix}.normalizationReport`, iconErrors);
      if (report) {
        if (report.schemaVersion !== 1 || report.tool !== "normalize_shortcut_icon" || report.runId !== opts.runId) {
          iconErrors.push(`${prefix}.normalizationReport tool/schemaVersion/runId does not match the gate run`);
        }
        if (
          alphaSource &&
          (path.resolve(report.source?.path || "") !== path.resolve(alphaSource) || report.source?.sha256 !== icon.alphaSourceSha256)
        ) {
          iconErrors.push(`${prefix}.normalizationReport is not bound to the current alpha source`);
        }
        if (
          finalPath &&
          (path.resolve(report.output?.path || "") !== path.resolve(finalPath) || report.output?.sha256 !== icon.finalSha256)
        ) {
          iconErrors.push(`${prefix}.normalizationReport is not bound to the current final icon`);
        }
      }
    }

    if (finalPath) {
      finalSha256 = sha256File(finalPath);
      if (icon.finalSha256 !== finalSha256) {
        iconErrors.push(`${prefix}.finalSha256 does not match the final file`);
      }
      metadata = await sharp(finalPath, { limitInputPixels: false }).metadata();
      if (metadata.width !== delivery.width || metadata.height !== delivery.height) {
        iconErrors.push(
          `${prefix}.finalPath has ${metadata.width}x${metadata.height}; expected ${delivery.width}x${delivery.height}`
        );
      }
      if (delivery.format && metadata.format !== delivery.format) {
        iconErrors.push(`${prefix}.finalPath format is ${metadata.format}; expected ${delivery.format}`);
      }
      if (delivery.requireAlpha && !metadata.hasAlpha) {
        iconErrors.push(`${prefix}.finalPath must contain an alpha channel`);
      }
      const bytes = fs.statSync(finalPath).size;
      if (isPositiveInteger(delivery.maxBytes) && bytes > delivery.maxBytes) {
        iconErrors.push(`${prefix}.finalPath is ${bytes} bytes; maximum is ${delivery.maxBytes}`);
      }

      geometry = await alphaGeometry(sharp, finalPath, delivery.alphaThreshold ?? 0);
      if (geometry.subjectPixels === 0) iconErrors.push(`${prefix}.finalPath has no visible subject pixels`);
      if (delivery.requireTransparentBorder && geometry.edgeAlphaPixels > 0) {
        iconErrors.push(`${prefix}.finalPath has ${geometry.edgeAlphaPixels} non-transparent edge pixels`);
      }
      if (
        geometry.opaqueBoundingBoxOccupancyRatio > (delivery.maxOpaquePlateCoverage ?? 0.985) &&
        geometry.solidRowsRatio >= 0.95 &&
        geometry.solidColumnsRatio >= 0.95
      ) {
        iconErrors.push(`${prefix}.finalPath looks like an opaque rectangular backing plate inside transparent padding`);
      }
      if (
        geometry.extentRatio > 0 &&
        isFiniteRatio(delivery.minSubjectExtentRatio) &&
        geometry.extentRatio < delivery.minSubjectExtentRatio
      ) {
        iconErrors.push(
          `${prefix}.subject extent ratio ${geometry.extentRatio} is below ${delivery.minSubjectExtentRatio}`
        );
      }
      if (
        geometry.extentRatio > 0 &&
        isFiniteRatio(delivery.maxSubjectExtentRatio) &&
        geometry.extentRatio > delivery.maxSubjectExtentRatio
      ) {
        iconErrors.push(
          `${prefix}.subject extent ratio ${geometry.extentRatio} exceeds ${delivery.maxSubjectExtentRatio}`
        );
      }
      if (seenHashes.has(finalSha256)) {
        iconErrors.push(`${prefix}.finalPath duplicates the pixels of icon ${seenHashes.get(finalSha256)}`);
      } else {
        seenHashes.set(finalSha256, icon.id || prefix);
      }
    }

    for (const review of ["semantic", "styleConsistency", "alpha", "trademark", "accessibility"]) {
      if (icon.review?.[review] !== "pass") iconErrors.push(`${prefix}.review.${review} must be "pass"`);
    }

    errors.push(...iconErrors);
    results.push({
      id: icon.id ?? null,
      sourceOutput,
      sourceSha256,
      generationReceipt,
      generationReceiptSha256: generationReceipt ? sha256File(generationReceipt) : null,
      alphaSource,
      alphaSourceSha256: alphaSource ? sha256File(alphaSource) : null,
      alphaSourceGeometry,
      normalizationReport,
      normalizationReportSha256: normalizationReport ? sha256File(normalizationReport) : null,
      finalPath,
      finalSha256,
      metadata: metadata
        ? {
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            hasAlpha: Boolean(metadata.hasAlpha),
            bytes: fs.statSync(finalPath).size,
          }
        : null,
      alphaGeometry: geometry,
      pass: iconErrors.length === 0,
      errors: iconErrors,
    });
  }

  if (manifest.icons?.length === 1) {
    warnings.push("Only one icon is present; cross-icon style consistency still requires human review");
  }

  const report = {
    schemaVersion: 1,
    tool: "validate_shortcut_icons",
    runId: opts.runId || null,
    validatedAt: new Date().toISOString(),
    manifest: manifestPath,
    manifestSha256: sha256File(manifestPath),
    dependency: { sharp: resolution.resolved },
    provenanceAssurance: "archived image_gen tool-result data bytes are bound to the source output; no independent cryptographic provider signature is asserted",
    pass: errors.length === 0,
    errors,
    warnings,
    icons: results,
  };

  if (opts.output) writeJson(path.resolve(opts.output), report);
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
