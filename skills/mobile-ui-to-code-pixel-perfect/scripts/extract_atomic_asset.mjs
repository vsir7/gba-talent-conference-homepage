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

const ALLOWED_KINDS = new Set(["icon", "photo", "logo", "illustration", "texture", "background"]);
const ALLOWED_ROLES = new Set(["utility", "content", "brand", "key-visual", "shortcut"]);

function usage() {
  return `Usage:
  node extract_atomic_asset.mjs --input <image> --output <png> --x <px> --y <px> --width <px> --height <px> --kind <kind> [--role <role>] --confirm-atomic

Kinds: icon, photo, logo, illustration, texture, background
Roles: utility, content, brand, key-visual, shortcut

--confirm-atomic attests that the user may use the source and that the crop contains
one atomic visual asset, not UI text, a control, a card, a form, or a composite module.
Shortcut extraction is allowed only under the exact-source-priority policy and
must still contain one isolated atomic icon.`;
}

function parseArgs(argv) {
  const opts = { confirmAtomic: false };
  const valueArgs = new Set(["--input", "--output", "--x", "--y", "--width", "--height", "--kind", "--role"]);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (valueArgs.has(arg)) {
      const next = argv[i + 1];
      if (!next) throw new Error(`${arg} requires a value`);
      const key = arg.slice(2);
      opts[key] = next;
      i += 1;
    } else if (arg === "--confirm-atomic") {
      opts.confirmAtomic = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
    }
  }
  for (const name of ["input", "output", "x", "y", "width", "height", "kind"]) {
    if (opts[name] === undefined) throw new Error(`Missing --${name}.\n\n${usage()}`);
  }
  if (!opts.confirmAtomic) throw new Error("Refusing extraction without --confirm-atomic");
  if (!ALLOWED_KINDS.has(opts.kind)) throw new Error(`--kind must be one of: ${[...ALLOWED_KINDS].join(", ")}`);
  if (opts.role && !ALLOWED_ROLES.has(opts.role)) {
    throw new Error(`--role must be one of: ${[...ALLOWED_ROLES].join(", ")}`);
  }
  if (!opts.role) {
    throw new Error("--role is required for every extracted asset so primary shortcuts cannot be disguised as another kind");
  }
  opts.x = numberArg(opts.x, "--x", { integer: true, min: 0 });
  opts.y = numberArg(opts.y, "--y", { integer: true, min: 0 });
  opts.width = numberArg(opts.width, "--width", { integer: true, min: 1 });
  opts.height = numberArg(opts.height, "--height", { integer: true, min: 1 });
  if (path.extname(opts.output).toLowerCase() !== ".png") throw new Error("--output must end in .png");
  return opts;
}

function orientedSize(metadata) {
  const swap = [5, 6, 7, 8].includes(metadata.orientation);
  return {
    width: swap ? metadata.height : metadata.width,
    height: swap ? metadata.width : metadata.height,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const input = ensureFile(opts.input, "source image");
  const output = path.resolve(opts.output);
  ensureDirectory(path.dirname(output));
  const { module: sharp, resolution } = await loadPackage("sharp");
  const metadata = await sharp(input, { limitInputPixels: false }).metadata();
  const size = orientedSize(metadata);
  if (!size.width || !size.height) throw new Error("Cannot read source image dimensions");
  if (opts.x + opts.width > size.width || opts.y + opts.height > size.height) {
    throw new Error(`Crop exceeds oriented source bounds ${size.width}x${size.height}`);
  }

  await sharp(input, { limitInputPixels: false })
    .rotate()
    .extract({ left: opts.x, top: opts.y, width: opts.width, height: opts.height })
    .png()
    .toFile(output);

  const report = {
    extractedAt: new Date().toISOString(),
    kind: opts.kind,
    role: opts.role || null,
    sourcePolicy: opts.role === "shortcut" ? "exact-source-priority" : "standard-atomic-extraction",
    atomicAndRightsConfirmed: true,
    transform: "EXIF orientation correction followed by exact integer rectangle crop; no resize or visual adjustment",
    source: {
      path: input,
      sha256: sha256File(input),
      orientedPixelSize: size,
    },
    crop: { x: opts.x, y: opts.y, width: opts.width, height: opts.height },
    output: {
      path: output,
      sha256: sha256File(output),
      pixelSize: { width: opts.width, height: opts.height },
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
