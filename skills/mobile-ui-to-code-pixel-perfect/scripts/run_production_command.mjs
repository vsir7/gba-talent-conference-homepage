#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  ensureDirectory,
  sha256Artifact,
  sha256File,
  writeJson,
} from "./lib/runtime.mjs";

function usage() {
  return `Usage:
  node run_production_command.mjs --run-id <id> --name <gate> --command <shell-command> \\
    --cwd <project-dir> --receipt <receipt.json> --log <command.log> [options]

Required:
  --run-id <id>          Evidence-chain identifier.
  --name <gate>          Stable production-gate name, for example build or lint.
  --command <command>    Shell command to execute exactly once.
  --cwd <directory>      Project working directory for the command.
  --receipt <file>       JSON receipt path. --output is accepted as an alias.
  --log <file>           Combined stdout/stderr log path.

Options:
  --artifact <path>      File or directory produced/validated by the command. A relative
                         path is resolved from --cwd and deterministically SHA-256 hashed.
  --help                 Show this message.

The script writes a receipt even when the command fails and exits non-zero unless
the command exits 0 and any requested artifact can be hashed. Output is forwarded
to the current terminal while also being written to --log.`;
}

function parseArgs(argv) {
  const opts = {};
  const valueArgs = new Set([
    "--run-id",
    "--name",
    "--command",
    "--cwd",
    "--receipt",
    "--output",
    "--log",
    "--artifact",
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }
    if (!valueArgs.has(arg)) throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
    const value = argv[index + 1];
    if (!value) throw new Error(`${arg} requires a value`);
    const key = arg.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase());
    opts[key] = value;
    index += 1;
  }

  if (opts.output && opts.receipt && path.resolve(opts.output) !== path.resolve(opts.receipt)) {
    throw new Error("--receipt and --output cannot point to different files");
  }
  opts.receipt = opts.receipt ?? opts.output;
  for (const key of ["runId", "name", "command", "cwd", "receipt", "log"]) {
    if (!opts[key]?.trim()) throw new Error(`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} is required`);
  }
  return opts;
}

function resolveFrom(base, value) {
  return path.isAbsolute(value) ? path.normalize(value) : path.resolve(base, value);
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function validateEvidencePaths(receipt, log, artifact) {
  if (receipt === log) throw new Error("--receipt and --log must be different files");
  if (!artifact) return;
  if (isInside(artifact, receipt) || isInside(artifact, log)) {
    throw new Error("Receipt and log files must be outside the path passed as --artifact");
  }
}

function forwardChunk(target, logDescriptor, chunk) {
  fs.writeSync(logDescriptor, chunk);
  target.write(chunk);
}

function waitForChild(child) {
  return new Promise((resolve) => {
    let spawnError = null;
    child.once("error", (error) => {
      spawnError = error;
    });
    child.once("close", (exitCode, signal) => resolve({ exitCode, signal, spawnError }));
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cwd = path.resolve(opts.cwd);
  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
    throw new Error(`--cwd does not exist or is not a directory: ${cwd}`);
  }

  const receipt = path.resolve(opts.receipt);
  const log = path.resolve(opts.log);
  const artifact = opts.artifact ? resolveFrom(cwd, opts.artifact) : null;
  validateEvidencePaths(receipt, log, artifact);
  ensureDirectory(path.dirname(receipt));
  ensureDirectory(path.dirname(log));

  const startedAt = new Date().toISOString();
  const shell = process.env.SHELL || true;
  const logDescriptor = fs.openSync(log, "w");
  let child;
  let result;
  try {
    child = spawn(opts.command, {
      cwd,
      shell,
      env: process.env,
      stdio: ["inherit", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk) => forwardChunk(process.stdout, logDescriptor, chunk));
    child.stderr.on("data", (chunk) => forwardChunk(process.stderr, logDescriptor, chunk));
    result = await waitForChild(child);
  } finally {
    fs.closeSync(logDescriptor);
  }

  const finishedAt = new Date().toISOString();
  const commandExitCode = Number.isInteger(result?.exitCode) ? result.exitCode : null;
  let artifactSha256 = null;
  let artifactError = null;
  if (artifact) {
    try {
      artifactSha256 = sha256Artifact(artifact);
    } catch (error) {
      artifactError = error.message;
    }
  }

  const passed = commandExitCode === 0 && !result?.signal && !result?.spawnError && !artifactError;
  const receiptValue = {
    schemaVersion: 1,
    tool: "run_production_command",
    runId: opts.runId,
    name: opts.name,
    command: opts.command,
    cwd,
    startedAt,
    finishedAt,
    exitCode: commandExitCode,
    status: passed ? "passed" : "failed",
    log,
    logSha256: sha256File(log),
  };
  if (child?.pid) receiptValue.pid = child.pid;
  if (result?.signal) receiptValue.signal = result.signal;
  if (result?.spawnError) receiptValue.error = result.spawnError.message;
  if (artifact) {
    receiptValue.artifact = artifact;
    receiptValue.artifactSha256 = artifactSha256;
  }
  if (artifactError) receiptValue.error = artifactError;

  writeJson(receipt, receiptValue);
  console.log(`Production command receipt: ${receipt}`);
  if (!passed) process.exitCode = commandExitCode && commandExitCode > 0 ? commandExitCode : 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
