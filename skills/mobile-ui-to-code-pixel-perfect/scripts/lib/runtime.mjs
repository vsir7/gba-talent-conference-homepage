import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => path.resolve(value)))];
}

function moduleParents() {
  const nodePathParents = (process.env.NODE_PATH || "")
    .split(path.delimiter)
    .filter(Boolean)
    .map((entry) => (path.basename(entry) === "node_modules" ? path.dirname(entry) : entry));

  return unique([
    process.cwd(),
    here,
    path.resolve(here, ".."),
    path.resolve(here, "../.."),
    ...nodePathParents,
    path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node"
    ),
  ]);
}

export function resolvePackage(name) {
  const attempts = [];
  for (const parent of moduleParents()) {
    try {
      const resolver = createRequire(path.join(parent, "package.json"));
      const resolved = resolver.resolve(name);
      return { resolved, parent };
    } catch (error) {
      attempts.push(`${parent}: ${error.code || error.message}`);
    }
  }

  const message = [
    `Cannot resolve required package: ${name}`,
    "Use the target project's local dependency, set NODE_PATH, or use the Codex bundled runtime.",
    ...attempts,
  ].join("\n");
  throw new Error(message);
}

export async function loadPackage(name) {
  const resolution = resolvePackage(name);
  const namespace = await import(pathToFileURL(resolution.resolved).href);
  return {
    module: namespace.default ?? namespace,
    namespace,
    resolution,
  };
}

export function ensureFile(file, label = "file") {
  const absolute = path.resolve(file);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    throw new Error(`${label} does not exist or is not a file: ${absolute}`);
  }
  return absolute;
}

export function ensureDirectory(directory) {
  const absolute = path.resolve(directory);
  fs.mkdirSync(absolute, { recursive: true });
  return absolute;
}

export function sha256File(file) {
  const hash = crypto.createHash("sha256");
  const descriptor = fs.openSync(file, "r");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    let bytesRead = 0;
    do {
      bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytesRead > 0) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    fs.closeSync(descriptor);
  }
  return `sha256:${hash.digest("hex")}`;
}

function updateFramedValue(hash, value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
  const length = Buffer.allocUnsafe(8);
  length.writeBigUInt64BE(BigInt(bytes.length));
  hash.update(length);
  hash.update(bytes);
}

function compareUtf8Names(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

/**
 * Hash a regular file or a directory tree without incorporating timestamps or
 * host-specific absolute paths. Directory entries are ordered by their UTF-8
 * byte representation. Empty directories and symbolic-link targets are part of
 * the digest; symbolic links are never followed.
 */
export function sha256Artifact(artifact) {
  const absolute = path.resolve(artifact);
  if (!fs.existsSync(absolute)) {
    throw new Error(`artifact does not exist: ${absolute}`);
  }

  const rootStat = fs.lstatSync(absolute);
  if (rootStat.isFile()) return sha256File(absolute);
  if (!rootStat.isDirectory()) {
    throw new Error(`artifact must be a regular file or directory: ${absolute}`);
  }

  const hash = crypto.createHash("sha256");
  hash.update("mobile-ui-to-code-pixel-perfect-artifact-tree-v1\0", "utf8");

  const visit = (directory, relativeDirectory) => {
    hash.update("D", "utf8");
    updateFramedValue(hash, relativeDirectory);

    const names = fs.readdirSync(directory).sort(compareUtf8Names);
    for (const name of names) {
      const absoluteEntry = path.join(directory, name);
      const relativeEntry = relativeDirectory
        ? path.posix.join(relativeDirectory, name)
        : name;
      const stat = fs.lstatSync(absoluteEntry);

      if (stat.isDirectory()) {
        visit(absoluteEntry, relativeEntry);
      } else if (stat.isFile()) {
        hash.update("F", "utf8");
        updateFramedValue(hash, relativeEntry);
        updateFramedValue(hash, String(stat.size));

        const descriptor = fs.openSync(absoluteEntry, "r");
        const buffer = Buffer.allocUnsafe(1024 * 1024);
        try {
          let bytesRead = 0;
          do {
            bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, null);
            if (bytesRead > 0) hash.update(buffer.subarray(0, bytesRead));
          } while (bytesRead > 0);
        } finally {
          fs.closeSync(descriptor);
        }
      } else if (stat.isSymbolicLink()) {
        hash.update("L", "utf8");
        updateFramedValue(hash, relativeEntry);
        updateFramedValue(hash, fs.readlinkSync(absoluteEntry));
      } else {
        throw new Error(`artifact contains an unsupported filesystem entry: ${absoluteEntry}`);
      }
    }
  };

  visit(absolute, "");
  return `sha256:${hash.digest("hex")}`;
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function numberArg(value, name, { integer = false, min, max } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (integer && !Number.isInteger(parsed))) {
    throw new Error(`${name} must be ${integer ? "an integer" : "a number"}: ${value}`);
  }
  if (min !== undefined && parsed < min) throw new Error(`${name} must be >= ${min}`);
  if (max !== undefined && parsed > max) throw new Error(`${name} must be <= ${max}`);
  return parsed;
}
