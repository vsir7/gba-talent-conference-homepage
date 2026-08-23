#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  ensureDirectory,
  numberArg,
  sha256Artifact,
  sha256File,
  writeJson,
} from "./lib/runtime.mjs";

const ARTIFACT_STATIC_COMMAND = "mobile-ui-to-code-pixel-perfect:start_production_preview:artifact-static:v1";

function usage() {
  return `Usage:
  # Release-ready mode: the URL is served directly from the hashed artifact.
  node start_production_preview.mjs --run-id <id> --serve-artifact \\
    --cwd <project-dir> --url <local-http-url> --artifact <build-directory> \\
    --receipt <receipt.json> --log <startup.log> [options]

  # Diagnostic mode: an external command owns the URL.
  node start_production_preview.mjs --run-id <id> --command <shell-command> \\
    --cwd <project-dir> --url <http-url> --artifact <build-output> \\
    --receipt <receipt.json> --log <startup.log> [options]

Required:
  --run-id <id>          Evidence-chain identifier.
  --cwd <directory>      Project working directory for the command.
  --url <url>            Main-document URL polled until it returns HTTP 2xx/3xx.
  --artifact <path>      Current built file or directory. Relative paths resolve from --cwd.
  --receipt <file>       JSON readiness receipt. --output is accepted as an alias.
  --log <file>           Combined stdout/stderr startup log.

Options:
  --serve-artifact           Start the built-in static server rooted exactly at --artifact.
                             Requires a directory and forbids --command.
  --command <command>        Diagnostic external-command mode. Mutually exclusive with
                             --serve-artifact.
  --timeout-ms <ms>          Overall readiness timeout. Default: 60000.
  --poll-ms <ms>             Delay between requests. Default: 250.
  --request-timeout-ms <ms>  Per-request timeout. Default: 3000.
  --help                     Show this message.

In --serve-artifact mode, only loopback HTTP URLs are accepted. Files are served
from the exact artifact directory with safe decoding, traversal protection and
an index.html SPA fallback. The receipt causally binds servedRoot and
servedArtifactSha256 to the URL. External-command mode remains diagnostic only.

When ready, the startup log is frozen and hashed and status=ready is written
before this wrapper continues running. Later output is still forwarded to the
terminal but is intentionally not appended to the frozen evidence log.`;
}

function parseArgs(argv) {
  const opts = {
    timeoutMs: 60000,
    pollMs: 250,
    requestTimeoutMs: 3000,
  };
  const valueArgs = new Set([
    "--run-id",
    "--command",
    "--cwd",
    "--url",
    "--artifact",
    "--build-artifact",
    "--receipt",
    "--output",
    "--log",
    "--timeout-ms",
    "--poll-ms",
    "--request-timeout-ms",
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }
    if (arg === "--serve-artifact") {
      opts.serveArtifact = true;
      continue;
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
  if (opts.buildArtifact && opts.artifact && opts.buildArtifact !== opts.artifact) {
    throw new Error("--artifact and --build-artifact cannot have different values");
  }
  opts.receipt = opts.receipt ?? opts.output;
  opts.artifact = opts.artifact ?? opts.buildArtifact;
  for (const key of ["runId", "cwd", "url", "artifact", "receipt", "log"]) {
    if (!opts[key]?.trim()) throw new Error(`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} is required`);
  }
  if (opts.serveArtifact && opts.command) {
    throw new Error("--serve-artifact and --command are mutually exclusive");
  }
  if (!opts.serveArtifact && !opts.command?.trim()) {
    throw new Error("Choose exactly one preview mode: --serve-artifact or --command <command>");
  }
  opts.timeoutMs = numberArg(opts.timeoutMs, "--timeout-ms", { integer: true, min: 1 });
  opts.pollMs = numberArg(opts.pollMs, "--poll-ms", { integer: true, min: 10 });
  opts.requestTimeoutMs = numberArg(opts.requestTimeoutMs, "--request-timeout-ms", { integer: true, min: 1 });
  const url = new URL(opts.url);
  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("--url must use http or https");
  }
  if (opts.serveArtifact) {
    const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (url.protocol !== "http:") throw new Error("--serve-artifact requires an http URL");
    if (!new Set(["127.0.0.1", "localhost", "::1"]).has(hostname)) {
      throw new Error("--serve-artifact only accepts a loopback URL");
    }
    if (url.username || url.password) throw new Error("--serve-artifact URL cannot contain credentials");
    const port = Number(url.port || 80);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("--serve-artifact URL must contain a valid TCP port");
    }
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

function digestBuffer(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizedExitCode(exitCode, signal) {
  if (Number.isInteger(exitCode)) return exitCode;
  const signalNumber = signal ? os.constants.signals[signal] : null;
  return signalNumber ? 128 + signalNumber : 1;
}

async function probe(url, requestTimeoutMs) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(requestTimeoutMs),
    headers: { accept: "text/html,application/xhtml+xml" },
  });
  const body = Buffer.from(await response.arrayBuffer());
  if (response.status < 200 || response.status >= 400) {
    return { ready: false, status: response.status, finalUrl: response.url };
  }
  return {
    ready: true,
    status: response.status,
    finalUrl: response.url,
    bodySha256: digestBuffer(body),
    contentType: response.headers.get("content-type"),
  };
}

const MIME_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".htm", "text/html; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".otf", "font/otf"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".text", "text/plain; charset=utf-8"],
  [".ttf", "font/ttf"],
  [".txt", "text/plain; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

class StaticRequestError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function safeRequestPath(rawRequestUrl, root, realRoot) {
  const rawPath = String(rawRequestUrl || "/").split("?", 1)[0];
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    throw new StaticRequestError(400, "Malformed URL encoding");
  }
  if (!decoded.startsWith("/") || decoded.includes("\0") || decoded.includes("\\")) {
    throw new StaticRequestError(400, "Invalid request path");
  }

  const segments = decoded.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new StaticRequestError(403, "Path traversal refused");
  }
  const candidate = path.resolve(root, ...segments);
  if (!isInside(root, candidate)) throw new StaticRequestError(403, "Path traversal refused");

  const existingFile = (file) => {
    try {
      const realFile = fs.realpathSync(file);
      if (!isInside(realRoot, realFile)) {
        throw new StaticRequestError(403, "Symbolic-link escape refused");
      }
      const stat = fs.statSync(realFile);
      return stat.isFile() ? realFile : null;
    } catch (error) {
      if (error instanceof StaticRequestError) throw error;
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
      throw error;
    }
  };

  let selected = null;
  try {
    const stat = fs.statSync(candidate);
    selected = stat.isDirectory()
      ? existingFile(path.join(candidate, "index.html"))
      : existingFile(candidate);
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
  }
  if (selected) return selected;

  // Missing client-side routes fall back to the immutable root entry document.
  const fallback = existingFile(path.join(root, "index.html"));
  if (fallback) return fallback;
  throw new StaticRequestError(404, "Not found");
}

function sendStaticError(response, statusCode, message) {
  const body = Buffer.from(`${statusCode} ${message}\n`, "utf8");
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-length": body.length,
    "content-type": "text/plain; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  response.end(body);
}

async function startArtifactStaticServer(root, urlValue, output) {
  const url = new URL(urlValue);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const listenHost = hostname.toLowerCase() === "localhost" ? "localhost" : hostname;
  const port = Number(url.port || 80);
  const realRoot = fs.realpathSync(root);

  const server = http.createServer((request, response) => {
    const started = Date.now();
    const finishLog = (statusCode) => {
      output(process.stdout, Buffer.from(
        `${request.method || "GET"} ${request.url || "/"} ${statusCode} ${Date.now() - started}ms\n`,
        "utf8"
      ));
    };
    response.once("finish", () => finishLog(response.statusCode));

    try {
      if (!new Set(["GET", "HEAD"]).has(request.method || "GET")) {
        response.setHeader("allow", "GET, HEAD");
        sendStaticError(response, 405, "Method not allowed");
        return;
      }
      const file = safeRequestPath(request.url, root, realRoot);
      const body = fs.readFileSync(file);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-length": body.length,
        "content-type": MIME_TYPES.get(path.extname(file).toLowerCase()) || "application/octet-stream",
        "x-content-type-options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      const statusCode = error instanceof StaticRequestError ? error.statusCode : 500;
      sendStaticError(response, statusCode, statusCode === 500 ? "Internal server error" : error.message);
    }
  });

  await new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen({ host: listenHost, port, exclusive: true });
  });
  output(process.stdout, Buffer.from(
    `Built-in artifact server listening at ${urlValue}; root=${root}\n`,
    "utf8"
  ));
  return server;
}

function closeServer(server) {
  return new Promise((resolve) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close(() => resolve());
    server.closeIdleConnections?.();
  });
}

function terminateChild(child, signal = "SIGTERM") {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === "win32") child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

function waitForExit(child) {
  return new Promise((resolve) => {
    let spawnError = null;
    child.once("error", (error) => {
      spawnError = error;
    });
    child.once("close", (exitCode, signal) => resolve({ exitCode, signal, spawnError }));
  });
}

async function stopAfterFailure(child, exitPromise) {
  terminateChild(child, "SIGTERM");
  let timeout;
  const stopped = await Promise.race([
    exitPromise.then((result) => ({ result })),
    new Promise((resolve) => {
      timeout = setTimeout(() => resolve(null), 3000);
    }),
  ]);
  clearTimeout(timeout);
  if (stopped) return stopped.result;
  terminateChild(child, "SIGKILL");
  return await exitPromise;
}

async function runArtifactMode({
  opts,
  cwd,
  receipt,
  log,
  buildArtifact,
  processStartedAt,
  writeOutput,
  freezeLog,
}) {
  if (!fs.existsSync(buildArtifact) || !fs.lstatSync(buildArtifact).isDirectory()) {
    throw new Error(`--serve-artifact requires --artifact to be a directory: ${buildArtifact}`);
  }

  let server = null;
  let requestedSignal = null;
  let runtimeError = null;
  let readyProbe = null;
  let lastProbe = null;
  let initialArtifactSha256 = null;
  let serverClosedPromise = null;
  const signalHandlers = new Map();

  try {
    initialArtifactSha256 = sha256Artifact(buildArtifact);
    server = await startArtifactStaticServer(buildArtifact, opts.url, writeOutput);
    serverClosedPromise = new Promise((resolve) => server.once("close", resolve));
    server.on("error", (error) => {
      runtimeError = error;
      writeOutput(process.stderr, Buffer.from(`Artifact server error: ${error.message}\n`, "utf8"));
      void closeServer(server);
    });

    for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
      const handler = () => {
        requestedSignal = signal;
        void closeServer(server);
      };
      signalHandlers.set(signal, handler);
      process.on(signal, handler);
    }

    const deadline = Date.now() + opts.timeoutMs;
    while (Date.now() < deadline) {
      if (requestedSignal) throw new Error(`received ${requestedSignal} before readiness`);
      if (runtimeError) throw runtimeError;
      try {
        lastProbe = await probe(opts.url, Math.min(opts.requestTimeoutMs, Math.max(1, deadline - Date.now())));
        if (lastProbe.ready) {
          readyProbe = lastProbe;
          break;
        }
      } catch (error) {
        lastProbe = { ready: false, error: error.message };
      }
      await sleep(opts.pollMs);
    }
    if (!readyProbe) {
      throw new Error(`preview URL did not become ready within ${opts.timeoutMs}ms`);
    }

    await new Promise((resolve) => setImmediate(resolve));
    freezeLog();
    const servedArtifactSha256 = sha256Artifact(buildArtifact);
    if (servedArtifactSha256 !== initialArtifactSha256) {
      throw new Error("build artifact changed while the built-in preview was starting");
    }
    if (requestedSignal) throw new Error(`received ${requestedSignal} while readiness evidence was being finalized`);
    if (runtimeError) throw runtimeError;

    const readyAt = new Date().toISOString();
    const receiptValue = {
      schemaVersion: 1,
      tool: "start_production_preview",
      runId: opts.runId,
      serveMode: "artifact-static",
      command: ARTIFACT_STATIC_COMMAND,
      cwd,
      pid: process.pid,
      processStartedAt,
      readyAt,
      url: opts.url,
      httpStatus: readyProbe.status,
      mainDocumentSha256: readyProbe.bodySha256,
      buildArtifact,
      buildArtifactSha256: servedArtifactSha256,
      servedRoot: buildArtifact,
      servedArtifactSha256,
      log,
      logSha256: sha256File(log),
      status: "ready",
    };
    if (readyProbe.finalUrl !== opts.url) receiptValue.finalUrl = readyProbe.finalUrl;
    if (readyProbe.contentType) receiptValue.contentType = readyProbe.contentType;
    writeJson(receipt, receiptValue);
    console.log(`Production artifact preview ready; receipt: ${receipt}`);

    await serverClosedPromise;
    if (runtimeError) {
      console.error(runtimeError.stack || runtimeError.message);
      process.exitCode = 1;
    } else if (requestedSignal) {
      process.exitCode = normalizedExitCode(null, requestedSignal);
    }
  } catch (error) {
    freezeLog();
    const failedAt = new Date().toISOString();
    writeJson(receipt, {
      schemaVersion: 1,
      tool: "start_production_preview",
      runId: opts.runId,
      serveMode: "artifact-static",
      command: ARTIFACT_STATIC_COMMAND,
      cwd,
      pid: process.pid,
      processStartedAt,
      failedAt,
      url: opts.url,
      buildArtifact,
      servedRoot: buildArtifact,
      initialArtifactSha256,
      log,
      logSha256: sha256File(log),
      status: "failed",
      error: error.message,
      lastProbe,
    });
    console.error(error.stack || error.message);
    if (server) await closeServer(server);
    process.exitCode = 1;
  } finally {
    for (const [signal, handler] of signalHandlers) process.off(signal, handler);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cwd = path.resolve(opts.cwd);
  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
    throw new Error(`--cwd does not exist or is not a directory: ${cwd}`);
  }

  const receipt = path.resolve(opts.receipt);
  const log = path.resolve(opts.log);
  const buildArtifact = resolveFrom(cwd, opts.artifact);
  if (receipt === log) throw new Error("--receipt and --log must be different files");
  if (isInside(buildArtifact, receipt) || isInside(buildArtifact, log)) {
    throw new Error("Receipt and log files must be outside the path passed as --artifact");
  }
  ensureDirectory(path.dirname(receipt));
  ensureDirectory(path.dirname(log));

  const processStartedAt = new Date().toISOString();
  const shell = process.env.SHELL || true;
  const logDescriptor = fs.openSync(log, "w");
  let logOpen = true;
  const writeChildOutput = (target, chunk) => {
    if (logOpen) fs.writeSync(logDescriptor, chunk);
    target.write(chunk);
  };
  const freezeLog = () => {
    if (!logOpen) return;
    logOpen = false;
    fs.closeSync(logDescriptor);
  };

  if (opts.serveArtifact) {
    await runArtifactMode({
      opts,
      cwd,
      receipt,
      log,
      buildArtifact,
      processStartedAt,
      writeOutput: writeChildOutput,
      freezeLog,
    });
    return;
  }

  const child = spawn(opts.command, {
    cwd,
    shell,
    env: process.env,
    detached: process.platform !== "win32",
    stdio: ["inherit", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => writeChildOutput(process.stdout, chunk));
  child.stderr.on("data", (chunk) => writeChildOutput(process.stderr, chunk));
  const exitPromise = waitForExit(child);
  let childExit = null;
  exitPromise.then((result) => {
    childExit = result;
  });

  const forwardSignal = (signal) => {
    try {
      terminateChild(child, signal);
    } catch (error) {
      console.error(`Failed to forward ${signal}: ${error.message}`);
    }
  };
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => forwardSignal(signal));
  }

  let readyProbe = null;
  let readinessError = null;
  let lastProbe = null;
  const deadline = Date.now() + opts.timeoutMs;
  try {
    while (Date.now() < deadline) {
      if (childExit) {
        const detail = childExit.spawnError?.message
          ?? `exit ${normalizedExitCode(childExit.exitCode, childExit.signal)}`;
        throw new Error(`preview command exited before readiness (${detail})`);
      }
      try {
        lastProbe = await probe(opts.url, Math.min(opts.requestTimeoutMs, Math.max(1, deadline - Date.now())));
        if (lastProbe.ready) {
          readyProbe = lastProbe;
          break;
        }
      } catch (error) {
        lastProbe = { ready: false, error: error.message };
      }
      await Promise.race([sleep(opts.pollMs), exitPromise]);
    }
    if (!readyProbe) {
      throw new Error(`preview URL did not become ready within ${opts.timeoutMs}ms`);
    }

    // Let output produced by the successful readiness request reach the startup log.
    await new Promise((resolve) => setImmediate(resolve));
    freezeLog();
    if (childExit) throw new Error("preview command exited while readiness evidence was being finalized");

    const buildArtifactSha256 = sha256Artifact(buildArtifact);
    if (childExit) throw new Error("preview command exited while the build artifact was being hashed");
    const readyAt = new Date().toISOString();
    const receiptValue = {
      schemaVersion: 1,
      tool: "start_production_preview",
      runId: opts.runId,
      serveMode: "external-command",
      command: opts.command,
      cwd,
      pid: child.pid,
      processStartedAt,
      readyAt,
      url: opts.url,
      httpStatus: readyProbe.status,
      mainDocumentSha256: readyProbe.bodySha256,
      buildArtifact,
      buildArtifactSha256,
      log,
      logSha256: sha256File(log),
      status: "ready",
    };
    if (readyProbe.finalUrl !== opts.url) receiptValue.finalUrl = readyProbe.finalUrl;
    if (readyProbe.contentType) receiptValue.contentType = readyProbe.contentType;
    writeJson(receipt, receiptValue);
    console.log(`Production preview ready; receipt: ${receipt}`);
  } catch (error) {
    readinessError = error;
  }

  if (readinessError) {
    freezeLog();
    const failedAt = new Date().toISOString();
    writeJson(receipt, {
      schemaVersion: 1,
      tool: "start_production_preview",
      runId: opts.runId,
      serveMode: "external-command",
      command: opts.command,
      cwd,
      pid: child.pid ?? null,
      processStartedAt,
      failedAt,
      url: opts.url,
      buildArtifact,
      log,
      logSha256: sha256File(log),
      status: "failed",
      error: readinessError.message,
      lastProbe,
    });
    console.error(readinessError.stack || readinessError.message);
    await stopAfterFailure(child, exitPromise);
    process.exitCode = 1;
    return;
  }

  const exit = await exitPromise;
  process.exitCode = normalizedExitCode(exit.exitCode, exit.signal);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
