#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
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
  node capture_page.mjs --url <url> --output <png> --width <px> --height <px> [options]

Options:
  --dpr <number>                 Default: 1.
  --is-mobile <true|false>       Browser mobile emulation context. Default: true.
  --has-touch <true|false>       Touch input context. Default: true.
  --screenshot-scale <css|device> Default: css.
  --animations <disabled|allow>  Screenshot animation policy. Default: disabled.
  --full-page                   Capture the full scrolling page.
  --selector <css>              Capture one element instead of the page.
  --wait-for <css>              Wait until a selector is visible.
  --state-script <file>         Evaluate a JavaScript file in the page before capture.
  --auth-state <file>           Playwright storage state JSON.
  --run-id <id>                 Evidence-chain identifier for final acceptance.
  --server-kind <value>         development or production-preview. Default: development.
  --preview-receipt <file>      Receipt from start_production_preview.mjs.
  --icon-role-inventory <file>  Reviewed icon inventory; required for production capture.
  --shortcut-manifest <file>    Registered shortcut asset manifest when inventory contains shortcuts.
  --expected-status <code>      Require the main document's final response status.
  --expected-final-url <url>    Require the final page URL after navigation/state setup.
  --allow-http-error <text>     Allow a matching 4xx/5xx response URL. Repeatable.
  --require-network-idle        Strict mode fails if network idle is not reached.
  --browser <chromium|chrome|msedge> Default: chromium.
  --executable-path <file>      Explicit Chromium-family browser executable.
  --locale <locale|default>     Default: zh-CN. Use default to omit the override.
  --timezone <zone|default>     Default: Asia/Shanghai. Use default to omit the override.
  --color-scheme <value>        light, dark, no-preference, or default. Default: light.
  --reduced-motion <value>      reduce, no-preference, or default. Default: reduce.
  --timeout <ms>                Default: 30000.
  --settle-ms <ms>              Stable wait immediately before final capture. Default: 120.
  --warmup-captures <n>         Unstored screenshots before final capture. Default: 0.
  --warmup-full-page            Make warmup screenshots full-page.
  --warmup-phase <value>        before-state or after-state. Default: after-state.
  --warm-scroll                 Warm lazy-loaded content; enabled by default for full-page capture.
  --no-warm-scroll              Disable the full-page warm scroll.
  --show-scrollbars             Keep scrollbars visible. Hidden by default.
  --no-stabilize-css            Do not inject animation/transition/caret stabilization CSS.
  --strict                      Exit non-zero on console/page/request/image/font/overflow failures.
  --help                        Show this message.`;
}

function parseArgs(argv) {
  const opts = {
    dpr: 1,
    isMobile: true,
    hasTouch: true,
    screenshotScale: "css",
    animations: "disabled",
    browser: "chromium",
    locale: "zh-CN",
    timezone: "Asia/Shanghai",
    colorScheme: "light",
    reducedMotion: "reduce",
    timeout: 30000,
    settleMs: 120,
    warmupCaptures: 0,
    warmupFullPage: false,
    warmupPhase: "after-state",
    fullPage: false,
    warmScroll: null,
    hideScrollbars: true,
    stabilizeCss: true,
    strict: false,
    allowHttpError: [],
    requireNetworkIdle: false,
    serverKind: "development",
  };

  const valueArgs = new Set([
    "--url", "--output", "--width", "--height", "--dpr", "--is-mobile", "--has-touch", "--screenshot-scale", "--animations",
    "--selector", "--wait-for", "--state-script", "--auth-state", "--browser",
    "--executable-path", "--locale", "--timezone", "--color-scheme", "--reduced-motion", "--timeout",
    "--settle-ms", "--warmup-captures", "--warmup-phase", "--expected-status", "--expected-final-url", "--run-id",
    "--server-kind", "--preview-receipt", "--icon-role-inventory", "--shortcut-manifest",
  ]);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--allow-http-error") {
      const next = argv[i + 1];
      if (!next) throw new Error(`${arg} requires a value`);
      opts.allowHttpError.push(next);
      i += 1;
    } else if (valueArgs.has(arg)) {
      const next = argv[i + 1];
      if (!next) throw new Error(`${arg} requires a value`);
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      opts[key] = next;
      i += 1;
    } else if (arg === "--full-page") {
      opts.fullPage = true;
    } else if (arg === "--warm-scroll") {
      opts.warmScroll = true;
    } else if (arg === "--no-warm-scroll") {
      opts.warmScroll = false;
    } else if (arg === "--warmup-full-page") {
      opts.warmupFullPage = true;
    } else if (arg === "--show-scrollbars") {
      opts.hideScrollbars = false;
    } else if (arg === "--no-stabilize-css") {
      opts.stabilizeCss = false;
    } else if (arg === "--strict") {
      opts.strict = true;
    } else if (arg === "--require-network-idle") {
      opts.requireNetworkIdle = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
    }
  }

  if (!opts.url || !opts.output || !opts.width || !opts.height) {
    throw new Error(`Missing required arguments.\n\n${usage()}`);
  }
  opts.width = numberArg(opts.width, "--width", { integer: true, min: 1 });
  opts.height = numberArg(opts.height, "--height", { integer: true, min: 1 });
  opts.dpr = numberArg(opts.dpr, "--dpr", { min: 0.1, max: 8 });
  for (const name of ["isMobile", "hasTouch"]) {
    if (typeof opts[name] === "string") {
      if (!/^(true|false)$/i.test(opts[name])) {
        throw new Error(`--${name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)} must be true or false`);
      }
      opts[name] = opts[name].toLowerCase() === "true";
    }
  }
  opts.timeout = numberArg(opts.timeout, "--timeout", { integer: true, min: 1 });
  opts.settleMs = numberArg(opts.settleMs, "--settle-ms", { integer: true, min: 0, max: 60000 });
  opts.warmupCaptures = numberArg(opts.warmupCaptures, "--warmup-captures", { integer: true, min: 0, max: 20 });
  if (opts.expectedStatus !== undefined) {
    opts.expectedStatus = numberArg(opts.expectedStatus, "--expected-status", { integer: true, min: 100, max: 599 });
  }
  if (!["css", "device"].includes(opts.screenshotScale)) {
    throw new Error("--screenshot-scale must be css or device");
  }
  if (!["disabled", "allow"].includes(opts.animations)) {
    throw new Error("--animations must be disabled or allow");
  }
  if (!["before-state", "after-state"].includes(opts.warmupPhase)) {
    throw new Error("--warmup-phase must be before-state or after-state");
  }
  if (!["chromium", "chrome", "msedge"].includes(opts.browser)) {
    throw new Error("--browser must be chromium, chrome, or msedge");
  }
  if (!["development", "production-preview"].includes(opts.serverKind)) {
    throw new Error("--server-kind must be development or production-preview");
  }
  if (opts.serverKind === "production-preview" && !opts.previewReceipt) {
    throw new Error("--preview-receipt is required when --server-kind=production-preview");
  }
  if (opts.serverKind === "production-preview" && !opts.iconRoleInventory) {
    throw new Error("--icon-role-inventory is required when --server-kind=production-preview");
  }
  if (!["light", "dark", "no-preference", "default"].includes(opts.colorScheme)) {
    throw new Error("--color-scheme must be light, dark, no-preference, or default");
  }
  if (!["reduce", "no-preference", "default"].includes(opts.reducedMotion)) {
    throw new Error("--reduced-motion must be reduce, no-preference, or default");
  }
  if (opts.selector && opts.fullPage) throw new Error("--selector and --full-page cannot be combined");
  if (opts.warmScroll === null) opts.warmScroll = opts.fullPage;
  return opts;
}

async function warmScroll(page, viewportHeight) {
  let previousHeight = 0;
  let stablePasses = 0;
  let passes = 0;
  while (stablePasses < 2 && passes < 6) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.max(320, Math.floor(viewportHeight * 0.78));
    for (let y = 0; y < height; y += step) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(120);
    const nextHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    stablePasses = nextHeight === previousHeight ? stablePasses + 1 : 0;
    previousHeight = nextHeight;
    passes += 1;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
}

async function waitForAssets(page, timeout) {
  return await page.evaluate(async (limit) => {
    const withTimeout = (promise) => Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(false), limit)),
    ]);
    const fontsReady = document.fonts
      ? await withTimeout(document.fonts.ready.then(() => true).catch(() => false))
      : true;
    const imageResults = await Promise.all([...document.images].map(async (image) => {
      if (!image.complete) {
        await withTimeout(new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        }));
      }
      if (typeof image.decode === "function" && image.complete && image.naturalWidth > 0) {
        await withTimeout(image.decode().then(() => true).catch(() => false));
      }
      return image.complete && image.naturalWidth > 0;
    }));
    return { fontsReady, imagesReady: imageResults.every(Boolean) };
  }, Math.min(timeout, 15000));
}

async function takeWarmupScreenshots(page, opts) {
  for (let index = 0; index < opts.warmupCaptures; index += 1) {
    await page.screenshot({
      fullPage: opts.warmupFullPage,
      animations: opts.animations,
      caret: "hide",
      scale: opts.screenshotScale,
    });
  }
}

function packageVersionFromResolved(resolved, expectedName) {
  let directory = path.dirname(resolved);
  while (directory !== path.dirname(directory)) {
    const packageFile = path.join(directory, "package.json");
    if (fs.existsSync(packageFile)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
        if (pkg.name === expectedName && typeof pkg.version === "string") return pkg.version;
      } catch {
        // Keep walking; a parent package.json may be the requested package root.
      }
    }
    directory = path.dirname(directory);
  }
  return null;
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

async function collectEmbeddedImageResources(page) {
  const candidates = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    const describe = (element, pseudo = null) => ({
      tag: element?.tagName?.toLowerCase?.() || null,
      id: element?.id || null,
      className: typeof element?.className === "string" ? element.className.slice(0, 200) : null,
      pseudo,
    });
    const add = (value, source, element, pseudo = null) => {
      if (typeof value !== "string") return;
      const url = value.trim();
      if (!/^data:/i.test(url) && !/^blob:/i.test(url)) return;
      const descriptor = describe(element, pseudo);
      const key = [url, source, descriptor.tag, descriptor.id, descriptor.className, pseudo].join("\u0000");
      if (seen.has(key)) return;
      seen.add(key);
      results.push({ url, source, ...descriptor });
    };
    const addCssUrls = (value, source, element, pseudo = null) => {
      if (typeof value !== "string" || !/url\(/i.test(value)) return;
      const pattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi;
      let match;
      while ((match = pattern.exec(value))) add(match[1] ?? match[2] ?? match[3] ?? "", source, element, pseudo);
    };
    const elements = [document.documentElement, ...document.querySelectorAll("*")];
    const cssImageProperties = [
      "backgroundImage",
      "borderImageSource",
      "listStyleImage",
      "maskImage",
      "webkitMaskImage",
      "cursor",
      "content",
    ];
    for (const element of elements) {
      for (const pseudo of [null, "::before", "::after"]) {
        const style = getComputedStyle(element, pseudo);
        for (const property of cssImageProperties) addCssUrls(style[property], property, element, pseudo);
      }
      if (element instanceof HTMLImageElement || element instanceof HTMLInputElement) {
        add(element.currentSrc || element.src, "element-src", element);
      }
      if (element instanceof HTMLVideoElement) add(element.poster, "video-poster", element);
      if (element instanceof HTMLObjectElement) add(element.data, "object-data", element);
      if (element instanceof HTMLEmbedElement) add(element.src, "embed-src", element);
      add(element.getAttribute?.("href"), "href", element);
      add(element.getAttribute?.("xlink:href"), "xlink-href", element);
    }
    return results;
  });
  return candidates.map((item) => ({
    kind: /^data:/i.test(item.url) ? "data-url" : "blob-url",
    url: item.url.slice(0, 160),
    sha256: /^data:/i.test(item.url) ? sha256DataUrl(item.url) : null,
    source: item.source,
    element: {
      tag: item.tag,
      id: item.id,
      className: item.className,
      pseudo: item.pseudo,
    },
  }));
}

async function collectEmbeddedFontResources(page) {
  const frameAudits = [];
  const inaccessibleFrames = [];
  for (const frame of page.frames()) {
    try {
      const audit = await frame.evaluate(async () => {
        const resources = [];
        const inaccessibleStyleSheets = [];
        const seenSheets = new Set();
        const seenRoots = new Set();
        let styleSheetCount = 0;
        let fontFaceRuleCount = 0;
        const visitRules = (rules, stylesheet) => {
          for (const rule of [...rules]) {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              fontFaceRuleCount += 1;
              resources.push({
                source: rule.style?.getPropertyValue("src") || "",
                family: rule.style?.getPropertyValue("font-family") || null,
                stylesheet,
              });
            }
            if (rule.styleSheet) visitSheet(rule.styleSheet);
            if (rule.cssRules) visitRules(rule.cssRules, stylesheet);
          }
        };
        const visitSheet = (sheet, fallbackLabel = null) => {
          if (!sheet || seenSheets.has(sheet)) return;
          seenSheets.add(sheet);
          styleSheetCount += 1;
          const label = sheet.href || fallbackLabel || `inline-style-${styleSheetCount}`;
          try {
            visitRules(sheet.cssRules || [], label);
          } catch (error) {
            inaccessibleStyleSheets.push({ href: sheet.href || null, error: error.message });
          }
        };
        const walkRoot = (root, label) => {
          if (!root || seenRoots.has(root)) return;
          seenRoots.add(root);
          if (root === document) {
            for (const sheet of document.styleSheets) visitSheet(sheet, "document-style");
            for (const sheet of document.adoptedStyleSheets || []) visitSheet(sheet, "document-adopted-style");
          } else {
            for (const sheet of root.adoptedStyleSheets || []) visitSheet(sheet, `${label}-adopted-style`);
            for (const style of root.querySelectorAll("style,link[rel='stylesheet']")) visitSheet(style.sheet, `${label}-style`);
          }
          let nestedIndex = 0;
          for (const element of root.querySelectorAll("*")) {
            if (!element.shadowRoot) continue;
            nestedIndex += 1;
            walkRoot(element.shadowRoot, `${label}-shadow-${nestedIndex}`);
          }
        };
        walkRoot(document, "document");
        const runtimeReader = globalThis.__mobileUiToCodePixelPerfectFontRuntimeAuditV1;
        const runtime = typeof runtimeReader === "function"
          ? await runtimeReader()
          : {
              installed: false,
              installErrors: ["runtime font audit reader is unavailable"],
              fontFaceConstructorWrapped: false,
              attachShadowWrapped: false,
              trackedShadowRootCount: 0,
              fontFaces: [],
              shadowFontRules: { resources: [], inaccessibleStyleSheets: [], styleSheetCount: 0, fontFaceRuleCount: 0 },
            };
        return { resources, inaccessibleStyleSheets, styleSheetCount, fontFaceRuleCount, runtime };
      });
      frameAudits.push({ frameUrl: frame.url(), audit });
    } catch (error) {
      inaccessibleFrames.push({ frameUrl: frame.url(), error: error.message });
    }
  }
  const resources = [];
  const resourceByKey = new Map();
  const extractCssUrls = (value) => {
    if (typeof value !== "string" || !/url\(/i.test(value)) return [];
    const urls = [];
    const pattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi;
    let match;
    while ((match = pattern.exec(value))) urls.push((match[1] ?? match[2] ?? match[3] ?? "").trim());
    return urls;
  };
  const addEmbeddedUrl = (url, metadata) => {
    const isData = /^data:/i.test(url);
    const isBlob = /^blob:/i.test(url);
    if (!isData && !isBlob) return null;
    const kind = isData ? "data-url" : "blob-url";
    const sha256 = isData ? sha256DataUrl(url) : null;
    const key = [kind, sha256, url, metadata.family, metadata.source, metadata.frameUrl].join("\u0000");
    let entry = resourceByKey.get(key);
    if (!entry) {
      const bindingId = `font-resource:${crypto.createHash("sha256").update(key).digest("hex")}`;
      entry = { bindingId, kind, url: url.slice(0, 160), sha256, ...metadata };
      resourceByKey.set(key, entry);
      resources.push(entry);
    }
    return { bindingId: entry.bindingId, kind: entry.kind, sha256: entry.sha256 };
  };
  const addUrlSources = (value, metadata) => {
    return extractCssUrls(value).map((url) => addEmbeddedUrl(url, metadata)).filter(Boolean);
  };
  const apiFontFaces = [];
  const inaccessibleStyleSheets = [];
  let styleSheetCount = 0;
  let cssFontFaceRuleCount = 0;
  let trackedShadowStyleSheetCount = 0;
  let trackedShadowFontFaceRuleCount = 0;
  let trackedShadowRootCount = 0;
  let runtimeInstrumentationInstalled = true;
  for (const { frameUrl, audit } of frameAudits) {
    styleSheetCount += audit.styleSheetCount;
    cssFontFaceRuleCount += audit.fontFaceRuleCount;
    inaccessibleStyleSheets.push(...audit.inaccessibleStyleSheets.map((item) => ({ ...item, frameUrl })));
    for (const item of audit.resources) {
      addUrlSources(item.source, { family: item.family, stylesheet: item.stylesheet, source: "css-font-face", frameUrl });
    }
    const runtime = audit.runtime;
    runtimeInstrumentationInstalled = runtimeInstrumentationInstalled &&
      runtime.installed === true &&
      runtime.fontFaceConstructorWrapped === true &&
      runtime.attachShadowWrapped === true;
    trackedShadowRootCount += runtime.trackedShadowRootCount || 0;
    trackedShadowStyleSheetCount += runtime.shadowFontRules?.styleSheetCount || 0;
    trackedShadowFontFaceRuleCount += runtime.shadowFontRules?.fontFaceRuleCount || 0;
    inaccessibleStyleSheets.push(...(runtime.shadowFontRules?.inaccessibleStyleSheets || []).map((item) => ({ ...item, frameUrl })));
    for (const item of runtime.shadowFontRules?.resources || []) {
      addUrlSources(item.source, { family: item.family, stylesheet: item.stylesheet, source: "tracked-shadow-font-face", frameUrl });
    }
    for (const face of runtime.fontFaces || []) {
      if (face.sourceKind === "buffer") {
        const key = ["buffer-source", face.sha256, face.family, frameUrl].join("\u0000");
        let entry = resourceByKey.get(key);
        if (!entry) {
          const bindingId = `font-resource:${crypto.createHash("sha256").update(key).digest("hex")}`;
          entry = {
            bindingId,
            kind: "buffer-source",
            url: null,
            sha256: face.sha256,
            bytes: face.bytes,
            family: face.family,
            stylesheet: null,
            source: "font-face-api",
            frameUrl,
          };
          resourceByKey.set(key, entry);
          resources.push(entry);
        }
        apiFontFaces.push({
          frameUrl,
          family: face.family,
          sourceKind: face.sourceKind,
          bytes: face.bytes,
          sha256: face.sha256,
          status: face.status,
          inDocumentFontSet: face.inDocumentFontSet,
          classificationPass: /^sha256:[0-9a-f]{64}$/i.test(face.sha256 || "") && Number.isInteger(face.bytes) && face.bytes > 0,
          normalizationError: null,
          normalizedSourceSha256: null,
          urlCount: 0,
          localSourceCount: 0,
          networkUrls: [],
          unknownUrls: [],
          embeddedResourceBindings: [{ bindingId: entry.bindingId, kind: entry.kind, sha256: entry.sha256 }],
        });
      } else {
        const normalizedSource = face.normalizedSource;
        const urls = extractCssUrls(normalizedSource);
        const localSourceCount = typeof normalizedSource === "string"
          ? (normalizedSource.match(/\blocal\s*\(/gi) || []).length
          : 0;
        const embeddedResourceBindings = [];
        const networkUrls = [];
        const unknownUrls = [];
        for (const url of urls) {
          const binding = addEmbeddedUrl(url, { family: face.family, stylesheet: null, source: "font-face-api", frameUrl });
          if (binding) {
            embeddedResourceBindings.push(binding);
            continue;
          }
          try {
            const resolved = new URL(url, frameUrl);
            if (resolved.protocol === "http:" || resolved.protocol === "https:") networkUrls.push(resolved.href);
            else unknownUrls.push(url.slice(0, 160));
          } catch {
            unknownUrls.push(url.slice(0, 160));
          }
        }
        const classifiedUrlCount = embeddedResourceBindings.length + networkUrls.length;
        const classificationPass = !face.normalizationError &&
          typeof normalizedSource === "string" &&
          (urls.length > 0 || localSourceCount > 0) &&
          classifiedUrlCount === urls.length &&
          unknownUrls.length === 0;
        apiFontFaces.push({
          frameUrl,
          family: face.family,
          sourceKind: face.sourceKind,
          bytes: null,
          sha256: null,
          status: face.status,
          inDocumentFontSet: face.inDocumentFontSet,
          classificationPass,
          normalizationError: face.normalizationError,
          normalizedSourceSha256: typeof normalizedSource === "string"
            ? `sha256:${crypto.createHash("sha256").update(normalizedSource).digest("hex")}`
            : null,
          urlCount: urls.length,
          localSourceCount,
          networkUrls,
          unknownUrls,
          embeddedResourceBindings,
        });
      }
    }
  }
  return {
    resources,
    audit: {
      inspected: true,
      runtimeInstrumentationInstalled,
      frameCount: frameAudits.length,
      inaccessibleFrames,
      styleSheetCount,
      cssFontFaceRuleCount,
      trackedShadowRootCount,
      trackedShadowStyleSheetCount,
      trackedShadowFontFaceRuleCount,
      fontFaceApiCount: apiFontFaces.length,
      fontFaceApiRecords: apiFontFaces,
      unclassifiedFontFaceApiRecords: apiFontFaces
        .filter((item) => item.classificationPass !== true)
        .map((item) => ({ frameUrl: item.frameUrl, family: item.family, sourceKind: item.sourceKind, normalizationError: item.normalizationError })),
      inaccessibleStyleSheets,
    },
  };
}

async function collectMetrics(page) {
  return await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const images = [...document.images].map((image) => {
      const rect = image.getBoundingClientRect();
      return {
        src: image.currentSrc || image.src || null,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        renderedWidth: Number(rect.width.toFixed(2)),
        renderedHeight: Number(rect.height.toFixed(2)),
      };
    });
    const fontSamples = new Map();
    for (const element of [...document.querySelectorAll("body *")]) {
      if (!element.textContent?.trim()) continue;
      const style = getComputedStyle(element);
      const key = [style.fontFamily, style.fontWeight, style.fontSize, style.lineHeight].join(" | ");
      if (!fontSamples.has(key) && fontSamples.size < 80) {
        fontSamples.set(key, {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
        });
      }
    }
    const clientWidth = root.clientWidth;
    const scrollWidth = Math.max(root.scrollWidth, body?.scrollWidth || 0);
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const visibleElements = [...document.body.querySelectorAll("*")].filter((element) =>
      !["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(element.tagName) && visible(element)
    );
    const visibleTextElements = visibleElements.filter((element) =>
      [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
    );
    const interactiveSelector = "a[href],button,input,select,textarea,[role='button'],[role='link'],[tabindex]:not([tabindex='-1'])";
    const visibleInteractiveElements = [...document.querySelectorAll(interactiveSelector)].filter(visible);
    const viewportArea = Math.max(1, innerWidth * innerHeight);
    const viewportCoveringVisuals = [];
    const rasterVisuals = [];
    const rasterRectangles = [];
    const auditVisual = (element, pseudo = null) => {
      const style = getComputedStyle(element, pseudo);
      const rect = element.getBoundingClientRect();
      const overlapWidth = Math.max(0, Math.min(innerWidth, rect.right) - Math.max(0, rect.left));
      const overlapHeight = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
      const viewportCoverage = (overlapWidth * overlapHeight) / viewportArea;
      const tag = element.tagName.toLowerCase();
      const hasRasterTag = !pseudo && ["img", "canvas", "video", "svg", "picture", "object", "embed", "iframe"].includes(tag);
      const hasImageBackground = style.backgroundImage && /url\(/i.test(style.backgroundImage);
      const hasImageContent = pseudo && /url\(/i.test(style.content || "");
      if ((hasRasterTag || hasImageBackground || hasImageContent) && viewportCoverage > 0) {
        const entry = {
          tag: pseudo ? `${tag}${pseudo}` : tag,
          id: element.id || null,
          className: typeof element.className === "string" ? element.className.slice(0, 200) : null,
          viewportCoverage: Number(viewportCoverage.toFixed(6)),
          src: element.currentSrc || element.src || null,
          backgroundImage: hasImageBackground ? style.backgroundImage.slice(0, 500) : null,
          content: hasImageContent ? style.content.slice(0, 500) : null,
          rect: {
            x: Number(rect.x.toFixed(2)),
            y: Number(rect.y.toFixed(2)),
            width: Number(rect.width.toFixed(2)),
            height: Number(rect.height.toFixed(2)),
          },
        };
        rasterVisuals.push(entry);
        rasterRectangles.push({
          left: Math.max(0, rect.left),
          right: Math.min(innerWidth, rect.right),
          top: Math.max(0, rect.top),
          bottom: Math.min(innerHeight, rect.bottom),
        });
        if (viewportCoverage >= 0.85) viewportCoveringVisuals.push(entry);
      }
    };
    for (const element of [document.documentElement, document.body, ...visibleElements]) {
      auditVisual(element);
      auditVisual(element, "::before");
      auditVisual(element, "::after");
    }
    const unionArea = (rectangles) => {
      const xs = [...new Set(rectangles.flatMap((rect) => [rect.left, rect.right]))].sort((a, b) => a - b);
      let area = 0;
      for (let index = 0; index < xs.length - 1; index += 1) {
        const left = xs[index];
        const right = xs[index + 1];
        if (right <= left) continue;
        const intervals = rectangles
          .filter((rect) => rect.left < right && rect.right > left && rect.bottom > rect.top)
          .map((rect) => [rect.top, rect.bottom])
          .sort((a, b) => a[0] - b[0]);
        let covered = 0;
        let start = null;
        let end = null;
        for (const [top, bottom] of intervals) {
          if (start === null) {
            start = top;
            end = bottom;
          } else if (top <= end) {
            end = Math.max(end, bottom);
          } else {
            covered += end - start;
            start = top;
            end = bottom;
          }
        }
        if (start !== null) covered += end - start;
        area += (right - left) * covered;
      }
      return area;
    };
    const rasterCombinedViewportCoverage = unionArea(rasterRectangles) / viewportArea;
    return {
      url: location.href,
      title: document.title,
      environment: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        colorScheme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference",
        maxTouchPoints: navigator.maxTouchPoints,
        pointerCoarse: matchMedia("(pointer: coarse)").matches,
      },
      viewport: { width: innerWidth, height: innerHeight },
      scroll: { x: scrollX, y: scrollY },
      document: {
        clientWidth,
        clientHeight: root.clientHeight,
        scrollWidth,
        scrollHeight: Math.max(root.scrollHeight, body?.scrollHeight || 0),
      },
      horizontalOverflow: scrollWidth > clientWidth,
      fontStatus: document.fonts?.status || "unsupported",
      fontSamples: [...fontSamples.values()],
      images,
      brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0),
      domAudit: {
        viewportCoverageThreshold: 0.85,
        bodyChildCount: document.body.children.length,
        visibleElementCount: visibleElements.length,
        visibleTextElementCount: visibleTextElements.length,
        visibleInteractiveElementCount: visibleInteractiveElements.length,
        viewportCoveringVisuals,
        rasterVisualCount: rasterVisuals.length,
        rasterCombinedViewportCoverage: Number(rasterCombinedViewportCoverage.toFixed(6)),
        rasterVisuals: rasterVisuals.slice(0, 200),
      },
    };
  });
}

async function auditShortcutDom(page, inputs, imageResources) {
  if (!inputs.length) return [];
  const domResults = await page.evaluate((items) => {
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const hasVisibleText = (root, label) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent?.trim() || !node.textContent.includes(label)) continue;
        if (visible(node.parentElement)) return true;
      }
      return false;
    };
    const effectiveOpacity = (element, stopAt) => {
      let value = 1;
      let current = element;
      while (current) {
        value *= Number(getComputedStyle(current).opacity || 1);
        if (current === stopAt) break;
        current = current.parentElement;
      }
      return value;
    };
    return items.map((item) => {
      let roots = [];
      let assets = [];
      let labels = [];
      let selectorError = null;
      try {
        roots = [...document.querySelectorAll(item.domLocator)];
        assets = [...document.querySelectorAll(item.assetLocator)];
        labels = [...document.querySelectorAll(item.labelLocator)];
      } catch (error) {
        selectorError = error.message;
      }
      const root = roots.length === 1 ? roots[0] : null;
      const asset = assets.length === 1 ? assets[0] : null;
      const labelElement = labels.length === 1 ? labels[0] : null;
      const rootTag = root?.tagName?.toLowerCase() || null;
      const semanticControl = Boolean(root && (
        ["a", "button"].includes(rootTag) ||
        ["button", "link"].includes(root.getAttribute("role"))
      ));
      const assetRect = asset?.getBoundingClientRect();
      const intersectionWidth = assetRect ? Math.max(0, Math.min(innerWidth, assetRect.right) - Math.max(0, assetRect.left)) : 0;
      const intersectionHeight = assetRect ? Math.max(0, Math.min(innerHeight, assetRect.bottom) - Math.max(0, assetRect.top)) : 0;
      const intersectionRatio = assetRect && assetRect.width * assetRect.height > 0
        ? (intersectionWidth * intersectionHeight) / (assetRect.width * assetRect.height)
        : 0;
      const mediaElements = root
        ? [...root.querySelectorAll("img,svg,canvas,video,picture,object,embed,iframe")].filter(visible)
        : [];
      const suspiciousVisuals = [];
      const emojiPattern = /\p{Extended_Pictographic}/u;
      for (const element of root ? [root, ...root.querySelectorAll("*")] : []) {
        if (!visible(element)) continue;
        const style = getComputedStyle(element);
        if (style.backgroundImage && /url\(/i.test(style.backgroundImage)) {
          suspiciousVisuals.push(`${element.tagName.toLowerCase()}:background-image`);
        }
        if (/font\s*awesome|material\s*icons|iconfont|icomoon/i.test(style.fontFamily || "")) {
          suspiciousVisuals.push(`${element.tagName.toLowerCase()}:icon-font`);
        }
        if (emojiPattern.test(element.childNodes.length === 1 && element.firstChild?.nodeType === Node.TEXT_NODE ? element.textContent : "")) {
          suspiciousVisuals.push(`${element.tagName.toLowerCase()}:emoji`);
        }
        for (const pseudo of ["::before", "::after"]) {
          const pseudoStyle = getComputedStyle(element, pseudo);
          const content = pseudoStyle.content || "";
          if ((content !== "none" && content !== "normal" && content !== '""' && content !== "''") || /url\(/i.test(pseudoStyle.backgroundImage || "")) {
            suspiciousVisuals.push(`${element.tagName.toLowerCase()}${pseudo}:generated-visual`);
          }
        }
      }
      let unobscuredSampleCount = 0;
      if (assetRect) {
        const samples = [
          [0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75],
        ];
        for (const [xRatio, yRatio] of samples) {
          const hit = document.elementFromPoint(assetRect.left + assetRect.width * xRatio, assetRect.top + assetRect.height * yRatio);
          if (hit === asset || asset?.contains(hit)) unobscuredSampleCount += 1;
        }
      }
      return {
        ...item,
        selectorError,
        rootCount: roots.length,
        assetCount: assets.length,
        labelCount: labels.length,
        rootTag,
        assetTag: asset?.tagName?.toLowerCase() || null,
        rootVisible: visible(root),
        assetVisible: visible(asset),
        assetInsideRoot: Boolean(root && asset && root.contains(asset)),
        semanticControl,
        domTextLabelFound: Boolean(
          root &&
          labelElement &&
          root.contains(labelElement) &&
          visible(labelElement) &&
          labelElement.textContent.trim() === item.label &&
          hasVisibleText(labelElement, item.label)
        ),
        currentSrc: asset?.currentSrc || asset?.src || null,
        alt: asset?.getAttribute?.("alt") ?? null,
        assetRect: assetRect ? {
          x: Number(assetRect.x.toFixed(2)),
          y: Number(assetRect.y.toFixed(2)),
          width: Number(assetRect.width.toFixed(2)),
          height: Number(assetRect.height.toFixed(2)),
        } : null,
        assetIntersectionRatio: Number(intersectionRatio.toFixed(6)),
        effectiveOpacity: asset && root ? Number(effectiveOpacity(asset, root).toFixed(6)) : 0,
        visibleMediaTags: mediaElements.map((element) => element.tagName.toLowerCase()),
        suspiciousVisuals,
        unobscuredSampleCount,
      };
    });
  }, inputs);
  return domResults.map((item) => {
    const resource = imageResources.find((entry) => entry.url === item.currentSrc && entry.sha256);
    const actualSha256 = /^data:/i.test(item.currentSrc || "") ? sha256DataUrl(item.currentSrc) : resource?.sha256 || null;
    const errors = [];
    if (item.selectorError) errors.push(`selector error: ${item.selectorError}`);
    if (item.rootCount !== 1 || item.assetCount !== 1 || item.labelCount !== 1) errors.push("root, asset, and label locators must each match exactly one element");
    if (!item.rootVisible || !item.assetVisible || !item.assetInsideRoot) errors.push("shortcut root/asset is not visibly bound");
    if (!item.semanticControl) errors.push("shortcut root must be a real a/button control");
    if (!item.domTextLabelFound) errors.push("shortcut label is not visible DOM text");
    if (item.assetTag !== "img") errors.push("shortcut visual must render as an img asset, not SVG/icon-font/CSS glyph");
    if (
      !item.assetRect ||
      Math.abs(item.assetRect.width - item.expectedCssWidth) > 1 ||
      Math.abs(item.assetRect.height - item.expectedCssHeight) > 1 ||
      item.assetIntersectionRatio < 0.9 ||
      item.effectiveOpacity < 0.9
    ) errors.push("registered shortcut img size/viewport intersection/effective opacity is invalid");
    if (item.visibleMediaTags.length !== 1 || item.visibleMediaTags[0] !== "img") {
      errors.push("shortcut root contains an additional visible image/SVG/canvas/video/embed visual");
    }
    if (item.suspiciousVisuals.length) errors.push("shortcut root contains CSS background, pseudo-content, icon-font, or emoji visual substitution");
    if (item.unobscuredSampleCount < 3) errors.push("registered shortcut img is mostly obscured by another element");
    if (!actualSha256 || actualSha256 !== item.expectedSha256) errors.push("rendered image bytes do not match the generated final asset hash");
    return { ...item, actualSha256, pass: errors.length === 0, errors };
  });
}

async function auditUtilityIconDom(page, inputs) {
  return await page.evaluate((items) => {
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) >= 0.9 && rect.width > 0 && rect.height > 0;
    };
    return items.map((item) => {
      let roots = [];
      let assets = [];
      let selectorError = null;
      try {
        roots = [...document.querySelectorAll(item.domLocator)];
        assets = [...document.querySelectorAll(item.assetLocator)];
      } catch (error) {
        selectorError = error.message;
      }
      const root = roots[0] || null;
      const asset = assets[0] || null;
      const errors = [];
      if (selectorError) errors.push(`selector error: ${selectorError}`);
      if (roots.length !== 1 || assets.length !== 1) errors.push("root and asset locators must each match exactly one element");
      if (!visible(root) || !visible(asset) || !(root === asset || root?.contains(asset))) errors.push("utility icon root/asset is not visibly bound");
      const actualLibrary = asset?.getAttribute?.("data-icon-library") || null;
      const actualVersion = asset?.getAttribute?.("data-icon-version") || null;
      const actualIcon = asset?.getAttribute?.("data-icon-name") || null;
      if (actualLibrary !== item.libraryPackage || actualVersion !== item.libraryVersion || actualIcon !== item.libraryIcon) {
        errors.push("utility icon DOM provenance attributes do not match the reviewed library/version/icon");
      }
      return {
        ...item,
        selectorError,
        rootCount: roots.length,
        assetCount: assets.length,
        rootTag: root?.tagName?.toLowerCase() || null,
        assetTag: asset?.tagName?.toLowerCase() || null,
        rootVisible: visible(root),
        assetVisible: visible(asset),
        assetInsideRoot: Boolean(root && asset && (root === asset || root.contains(asset))),
        actualLibrary,
        actualVersion,
        actualIcon,
        pass: errors.length === 0,
        errors,
      };
    });
  }, inputs);
}

async function auditShortcutInventoryCompleteness(page, inventoryItems) {
  return await page.evaluate((items) => {
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) >= 0.9 && rect.width > 0 && rect.height > 0;
    };
    const registered = [];
    for (const item of items.filter((entry) => entry.role === "shortcut")) {
      try {
        const matches = [...document.querySelectorAll(item.domLocator)];
        if (matches.length === 1) registered.push({ id: item.id, element: matches[0] });
      } catch {
        // The direct shortcut audit reports invalid selectors separately.
      }
    }
    const groups = new Map();
    for (const control of [...document.querySelectorAll("a[href],button,[role='button'],[role='link']")].filter(visible)) {
      if (control.closest("nav,[role='navigation']")) continue;
      const images = [...control.querySelectorAll("img")].filter(visible);
      const prominent = images.find((image) => {
        const rect = image.getBoundingClientRect();
        return rect.width >= 32 && rect.height >= 32 && rect.width <= 128 && rect.height <= 128;
      });
      if (!prominent || !control.textContent.trim()) continue;
      const parent = control.parentElement;
      if (!parent) continue;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push({ control, image: prominent });
    }
    const candidates = [];
    for (const entries of groups.values()) {
      if (entries.length < 3) continue;
      const sizes = entries.map(({ image }) => image.getBoundingClientRect());
      const minWidth = Math.min(...sizes.map((rect) => rect.width));
      const maxWidth = Math.max(...sizes.map((rect) => rect.width));
      const minHeight = Math.min(...sizes.map((rect) => rect.height));
      const maxHeight = Math.max(...sizes.map((rect) => rect.height));
      if (maxWidth - minWidth > 4 || maxHeight - minHeight > 4) continue;
      for (const { control, image } of entries) {
        const matched = registered.find((item) => item.element === control);
        candidates.push({
          label: control.textContent.trim().replace(/\s+/g, " ").slice(0, 160),
          tag: control.tagName.toLowerCase(),
          imageSize: {
            width: Number(image.getBoundingClientRect().width.toFixed(2)),
            height: Number(image.getBoundingClientRect().height.toFixed(2)),
          },
          registeredShortcutId: matched?.id || null,
        });
      }
    }
    const unclassified = candidates.filter((item) => !item.registeredShortcutId);
    return { pass: unclassified.length === 0, candidates, unclassified };
  }, inventoryItems);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const output = path.resolve(opts.output);
  ensureDirectory(path.dirname(output));
  if (opts.stateScript) opts.stateScript = ensureFile(opts.stateScript, "state script");
  if (opts.authState) opts.authState = ensureFile(opts.authState, "auth state");
  if (opts.executablePath) opts.executablePath = ensureFile(opts.executablePath, "browser executable");
  let previewReceipt = null;
  let previewReceiptPath = null;
  let previewProcessAliveAtCapture = null;
  if (opts.previewReceipt) {
    previewReceiptPath = ensureFile(opts.previewReceipt, "production preview receipt");
    previewReceipt = JSON.parse(fs.readFileSync(previewReceiptPath, "utf8"));
    if (
      previewReceipt.schemaVersion !== 1 ||
      previewReceipt.tool !== "start_production_preview" ||
      previewReceipt.status !== "ready" ||
      previewReceipt.runId !== opts.runId
    ) {
      throw new Error("Production preview receipt tool/schema/status/runId is invalid");
    }
    if (previewReceipt.url !== opts.url) throw new Error("Production preview receipt URL does not match --url");
    try {
      process.kill(previewReceipt.pid, 0);
      previewProcessAliveAtCapture = true;
    } catch {
      throw new Error("Production preview process is not alive at capture time");
    }
  }
  let iconRoleInventoryPath = null;
  let iconRoleInventory = null;
  let shortcutManifestPath = null;
  let shortcutManifest = null;
  let shortcutAuditInputs = [];
  let utilityAuditInputs = [];
  if (opts.iconRoleInventory) {
    iconRoleInventoryPath = ensureFile(opts.iconRoleInventory, "icon role inventory");
    iconRoleInventory = JSON.parse(fs.readFileSync(iconRoleInventoryPath, "utf8"));
    if (
      iconRoleInventory.schemaVersion !== 1 ||
      iconRoleInventory.tool !== "icon_role_inventory" ||
      iconRoleInventory.runId !== opts.runId ||
      !Array.isArray(iconRoleInventory.items)
    ) {
      throw new Error("Icon role inventory tool/schema/runId/items is invalid");
    }
    const shortcutItems = iconRoleInventory.items.filter((item) => item.role === "shortcut");
    const thirdPartyUtilityItems = iconRoleInventory.items.filter((item) => item.role === "utility" && item.sourceType === "third-party");
    if (shortcutItems.length !== iconRoleInventory.shortcutCount) {
      throw new Error("Icon role inventory shortcutCount is invalid");
    }
    if (shortcutItems.length && !opts.shortcutManifest) {
      throw new Error("--shortcut-manifest is required when the inventory contains shortcuts");
    }
    if (opts.shortcutManifest) {
      shortcutManifestPath = ensureFile(opts.shortcutManifest, "shortcut asset manifest");
      shortcutManifest = JSON.parse(fs.readFileSync(shortcutManifestPath, "utf8"));
      if (shortcutManifest.version !== 2 || shortcutManifest.runId !== opts.runId || !Array.isArray(shortcutManifest.icons)) {
        throw new Error("Shortcut asset manifest version/runId/icons is invalid");
      }
      const sourcePolicy = shortcutManifest.sourcePolicy || "image-generation";
      if (!new Set(["exact-source-priority", "image-generation"]).has(sourcePolicy)) {
        throw new Error("Shortcut asset manifest sourcePolicy is invalid");
      }
      const icons = new Map(shortcutManifest.icons.map((icon) => [icon.id, icon]));
      const expectedCssSize = shortcutManifest.styleLock?.renderCssSize;
      if (!Number.isFinite(expectedCssSize?.width) || !Number.isFinite(expectedCssSize?.height)) {
        throw new Error("Generated shortcut manifest is missing styleLock.renderCssSize");
      }
      shortcutAuditInputs = shortcutItems.map((item) => {
        const icon = icons.get(item.id);
        if (!icon) throw new Error(`Shortcut inventory item has no registered asset: ${item.id}`);
        if (!item.assetLocator || !item.labelLocator) throw new Error(`Shortcut inventory item is missing assetLocator/labelLocator: ${item.id}`);
        return {
          id: item.id,
          label: item.label,
          domLocator: item.domLocator,
          assetLocator: item.assetLocator,
          labelLocator: item.labelLocator,
          expectedSha256: icon.finalSha256,
          expectedCssWidth: expectedCssSize.width,
          expectedCssHeight: expectedCssSize.height,
        };
      });
      if (icons.size !== shortcutAuditInputs.length) {
        throw new Error("Shortcut asset manifest and inventory IDs do not match exactly");
      }
    }
    utilityAuditInputs = thirdPartyUtilityItems.map((item) => {
      for (const field of ["domLocator", "assetLocator", "libraryPackage", "libraryVersion", "libraryIcon"]) {
        if (typeof item[field] !== "string" || !item[field].trim()) {
          throw new Error(`Third-party utility inventory item is missing ${field}: ${item.id || "unknown"}`);
        }
      }
      return {
        id: item.id,
        label: item.label,
        domLocator: item.domLocator,
        assetLocator: item.assetLocator,
        libraryPackage: item.libraryPackage,
        libraryVersion: item.libraryVersion,
        libraryIcon: item.libraryIcon,
      };
    });
  }

  const { module: playwright, resolution } = await loadPackage("playwright");
  const chromium = playwright.chromium;
  if (!chromium) throw new Error("Resolved Playwright package does not expose chromium");
  const launchOptions = { headless: true };
  if (opts.executablePath) launchOptions.executablePath = opts.executablePath;
  else if (opts.browser === "chrome" || opts.browser === "msedge") launchOptions.channel = opts.browser;

  const browser = await chromium.launch(launchOptions);
  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];
  const failedRequests = [];
  const httpErrors = [];
  const imageResources = [];
  const imageResourceTasks = [];
  const dataResponses = [];
  const dataResponseTasks = [];
  const staticResources = [];
  const staticResourceTasks = [];
  let context;
  let screenshotMetadata = null;
  let networkIdleReached = false;
  let mainResponse = null;

  try {
    const contextOptions = {
      viewport: { width: opts.width, height: opts.height },
      deviceScaleFactor: opts.dpr,
      isMobile: opts.isMobile,
      hasTouch: opts.hasTouch,
      storageState: opts.authState,
      serviceWorkers: "block",
    };
    if (opts.locale !== "default") contextOptions.locale = opts.locale;
    if (opts.timezone !== "default") contextOptions.timezoneId = opts.timezone;
    if (opts.colorScheme !== "default") contextOptions.colorScheme = opts.colorScheme;
    if (opts.reducedMotion !== "default") contextOptions.reducedMotion = opts.reducedMotion;
    context = await browser.newContext(contextOptions);
    await context.addInitScript(() => {
      const auditKey = "__mobileUiToCodePixelPerfectFontRuntimeAuditV1";
      if (globalThis[auditKey]) return;
      const fontFaceRecords = [];
      const shadowRoots = [];
      const installErrors = [];
      let fontFaceProxy = null;
      let attachShadowProxy = null;
      const digestBytes = async (bytes) => {
        if (!bytes || !globalThis.crypto?.subtle) return null;
        try {
          const digest = await crypto.subtle.digest("SHA-256", bytes);
          return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
        } catch {
          return null;
        }
      };
      try {
        const descriptor = Object.getOwnPropertyDescriptor(globalThis, "FontFace");
        const NativeFontFace = descriptor?.value;
        if (typeof NativeFontFace !== "function") throw new Error("FontFace constructor is unavailable");
        fontFaceProxy = new Proxy(NativeFontFace, {
          construct(target, args, newTarget) {
            const instance = Reflect.construct(target, args, newTarget === fontFaceProxy ? target : newTarget);
            const [family, source] = args;
            const record = {
              family: typeof family === "string" ? family : String(family ?? ""),
              sourceKind: typeof source === "string" ? "string" : "buffer",
              source: typeof source === "string" ? source : null,
              bytes: null,
              digestPromise: Promise.resolve(null),
              instance,
            };
            if (typeof source !== "string") {
              try {
                let copy = null;
                if (source instanceof ArrayBuffer) copy = source.slice(0);
                else if (ArrayBuffer.isView(source)) copy = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
                if (copy) {
                  record.bytes = copy.byteLength;
                  record.digestPromise = digestBytes(copy);
                }
              } catch {
                record.digestPromise = Promise.resolve(null);
              }
            }
            fontFaceRecords.push(record);
            return instance;
          },
        });
        Object.defineProperty(globalThis, "FontFace", { ...descriptor, value: fontFaceProxy });
      } catch (error) {
        installErrors.push(`FontFace: ${error.message}`);
      }
      try {
        const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, "attachShadow");
        const nativeAttachShadow = descriptor?.value;
        if (typeof nativeAttachShadow !== "function") throw new Error("Element.attachShadow is unavailable");
        attachShadowProxy = new Proxy(nativeAttachShadow, {
          apply(target, thisArg, args) {
            const root = Reflect.apply(target, thisArg, args);
            shadowRoots.push(root);
            return root;
          },
        });
        Object.defineProperty(Element.prototype, "attachShadow", { ...descriptor, value: attachShadowProxy });
      } catch (error) {
        installErrors.push(`attachShadow: ${error.message}`);
      }
      const readShadowFontRules = () => {
        const resources = [];
        const inaccessibleStyleSheets = [];
        const seenSheets = new Set();
        let styleSheetCount = 0;
        let fontFaceRuleCount = 0;
        const visitRules = (rules, stylesheet) => {
          for (const rule of [...rules]) {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              fontFaceRuleCount += 1;
              resources.push({
                source: rule.style?.getPropertyValue("src") || "",
                family: rule.style?.getPropertyValue("font-family") || null,
                stylesheet,
              });
            }
            if (rule.styleSheet) visitSheet(rule.styleSheet);
            if (rule.cssRules) visitRules(rule.cssRules, stylesheet);
          }
        };
        const visitSheet = (sheet, fallbackLabel = null) => {
          if (!sheet || seenSheets.has(sheet)) return;
          seenSheets.add(sheet);
          styleSheetCount += 1;
          const label = sheet.href || fallbackLabel || `runtime-shadow-style-${styleSheetCount}`;
          try {
            visitRules(sheet.cssRules || [], label);
          } catch (error) {
            inaccessibleStyleSheets.push({ href: sheet.href || null, error: error.message });
          }
        };
        for (const [rootIndex, root] of shadowRoots.entries()) {
          for (const sheet of root.adoptedStyleSheets || []) visitSheet(sheet, `tracked-shadow-${rootIndex + 1}-adopted`);
          for (const style of root.querySelectorAll("style,link[rel='stylesheet']")) {
            visitSheet(style.sheet, `tracked-shadow-${rootIndex + 1}-style`);
          }
        }
        return { resources, inaccessibleStyleSheets, styleSheetCount, fontFaceRuleCount };
      };
      const normalizeFontSource = (source) => {
        if (typeof source !== "string") return { value: null, error: null };
        try {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(`@font-face { font-family: "__mobile_ui_font_audit__"; src: ${source}; }`);
          const rule = [...sheet.cssRules].find((item) => item.type === CSSRule.FONT_FACE_RULE);
          const value = rule?.style?.getPropertyValue("src") || "";
          if (!value) throw new Error("CSSOM returned an empty font source");
          return { value, error: null };
        } catch (error) {
          return { value: null, error: error.message };
        }
      };
      Object.defineProperty(globalThis, auditKey, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: async () => ({
          installed: installErrors.length === 0,
          installErrors: [...installErrors],
          fontFaceConstructorWrapped: Boolean(fontFaceProxy) && globalThis.FontFace === fontFaceProxy,
          attachShadowWrapped: Boolean(attachShadowProxy) && Element.prototype.attachShadow === attachShadowProxy,
          trackedShadowRootCount: shadowRoots.length,
          fontFaces: await Promise.all(fontFaceRecords.map(async (record) => {
            const normalized = normalizeFontSource(record.source);
            return {
              family: record.family,
              sourceKind: record.sourceKind,
              source: record.source,
              normalizedSource: normalized.value,
              normalizationError: normalized.error,
              bytes: record.bytes,
              sha256: await record.digestPromise,
              status: record.instance?.status || null,
              inDocumentFontSet: Boolean(document.fonts?.has?.(record.instance)),
            };
          })),
          shadowFontRules: readShadowFontRules(),
        }),
      });
    });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
      if (message.type() === "warning") consoleWarnings.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("requestfailed", (request) => {
      failedRequests.push({
        url: request.url(),
        method: request.method(),
        error: request.failure()?.errorText || "request failed",
      });
    });
    page.on("response", (response) => {
      if (response.request().resourceType() === "image") {
        imageResourceTasks.push(response.body().then((body) => {
          imageResources.push({
            url: response.url(),
            status: response.status(),
            sha256: `sha256:${crypto.createHash("sha256").update(body).digest("hex")}`,
            bytes: body.length,
          });
        }).catch((error) => {
          imageResources.push({ url: response.url(), status: response.status(), error: error.message });
        }));
      }
      if (["xhr", "fetch"].includes(response.request().resourceType())) {
        dataResponseTasks.push(response.body().then((body) => {
          dataResponses.push({
            url: response.url(),
            method: response.request().method(),
            status: response.status(),
            resourceType: response.request().resourceType(),
            contentType: response.headers()["content-type"] || null,
            bodySha256: `sha256:${crypto.createHash("sha256").update(body).digest("hex")}`,
            bytes: body.length,
          });
        }).catch((error) => {
          dataResponses.push({
            url: response.url(),
            method: response.request().method(),
            status: response.status(),
            resourceType: response.request().resourceType(),
            error: error.message,
          });
        }));
      }
      if (["font", "media", "stylesheet", "script"].includes(response.request().resourceType())) {
        staticResourceTasks.push(response.body().then((body) => {
          staticResources.push({
            url: response.url(),
            resourceType: response.request().resourceType(),
            status: response.status(),
            bodySha256: `sha256:${crypto.createHash("sha256").update(body).digest("hex")}`,
            bytes: body.length,
          });
        }).catch((error) => {
          staticResources.push({
            url: response.url(),
            resourceType: response.request().resourceType(),
            status: response.status(),
            error: error.message,
          });
        }));
      }
      if (response.status() < 400) return;
      const url = response.url();
      if (opts.allowHttpError.some((allowed) => url.includes(allowed))) return;
      httpErrors.push({
        url,
        status: response.status(),
        statusText: response.statusText(),
        resourceType: response.request().resourceType(),
        method: response.request().method(),
      });
    });

    mainResponse = await page.goto(opts.url, { waitUntil: "domcontentloaded", timeout: opts.timeout });
    try {
      await page.waitForLoadState("networkidle", { timeout: Math.min(opts.timeout, 10000) });
      networkIdleReached = true;
    } catch {
      networkIdleReached = false;
    }

    if (opts.stabilizeCss || opts.hideScrollbars) {
      const deterministicCss = `
        ${opts.stabilizeCss ? `*, *::before, *::after {
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          animation-iteration-count: 1 !important;
          transition: none !important;
          caret-color: transparent !important;
          scroll-behavior: auto !important;
        }` : ""}
        ${opts.hideScrollbars ? "* { scrollbar-width: none !important; } *::-webkit-scrollbar { display: none !important; }" : ""}
      `;
      await page.addStyleTag({ content: deterministicCss });
    }

    let readiness = await waitForAssets(page, opts.timeout);
    if (opts.warmupPhase === "before-state") await takeWarmupScreenshots(page, opts);

    if (opts.stateScript) {
      const source = fs.readFileSync(opts.stateScript, "utf8");
      await page.evaluate(async (code) => {
        const run = new Function(`return (async () => {\n${code}\n})()`);
        return await run();
      }, source);
    }
    if (opts.waitFor) {
      await page.locator(opts.waitFor).waitFor({ state: "visible", timeout: opts.timeout });
    }
    readiness = await waitForAssets(page, opts.timeout);
    if (opts.fullPage && opts.warmScroll) await warmScroll(page, opts.height);
    if (opts.warmupPhase === "after-state") await takeWarmupScreenshots(page, opts);
    if (opts.settleMs > 0) await page.waitForTimeout(opts.settleMs);
    await Promise.allSettled([...imageResourceTasks, ...dataResponseTasks, ...staticResourceTasks]);
    const metrics = await collectMetrics(page);
    const embeddedImageResources = await collectEmbeddedImageResources(page);
    const embeddedFonts = await collectEmbeddedFontResources(page);
    const embeddedFontResources = embeddedFonts.resources;
    const fontFaceAudit = embeddedFonts.audit;
    const shortcutDomAudit = await auditShortcutDom(page, shortcutAuditInputs, imageResources);
    const utilityIconDomAudit = await auditUtilityIconDom(page, utilityAuditInputs);
    const shortcutInventoryAudit = await auditShortcutInventoryCompleteness(page, iconRoleInventory?.items ?? []);
    const finalUrl = page.url();
    let mainDocumentBodySha256 = null;
    if (mainResponse) {
      try {
        const body = await mainResponse.body();
        mainDocumentBodySha256 = `sha256:${crypto.createHash("sha256").update(body).digest("hex")}`;
      } catch {
        mainDocumentBodySha256 = null;
      }
    }
    const mainDocument = mainResponse
      ? {
          url: mainResponse.url(),
          status: mainResponse.status(),
          statusText: mainResponse.statusText(),
          bodySha256: mainDocumentBodySha256,
        }
      : null;

    const screenshotOptions = {
      path: output,
      animations: opts.animations,
      caret: "hide",
      scale: opts.screenshotScale,
    };
    if (opts.selector) {
      await page.locator(opts.selector).screenshot(screenshotOptions);
    } else {
      await page.screenshot({ ...screenshotOptions, fullPage: opts.fullPage });
    }

    try {
      const { module: sharp } = await loadPackage("sharp");
      const imageMetadata = await sharp(output).metadata();
      screenshotMetadata = {
        width: imageMetadata.width,
        height: imageMetadata.height,
        format: imageMetadata.format,
        hasAlpha: Boolean(imageMetadata.hasAlpha),
      };
    } catch (error) {
      screenshotMetadata = { error: error.message };
    }

    const expectedPixelSize = opts.selector || opts.fullPage ? null : {
      width: opts.screenshotScale === "device" ? Math.round(opts.width * opts.dpr) : opts.width,
      height: opts.screenshotScale === "device" ? Math.round(opts.height * opts.dpr) : opts.height,
    };
    const pixelSizeMatches = !expectedPixelSize || !screenshotMetadata?.width
      ? null
      : expectedPixelSize.width === screenshotMetadata.width && expectedPixelSize.height === screenshotMetadata.height;
    const strictFailures = [];
    if (consoleErrors.length) strictFailures.push("console errors");
    if (pageErrors.length) strictFailures.push("page errors");
    if (failedRequests.length) strictFailures.push("failed requests");
    if (httpErrors.length) strictFailures.push("HTTP 4xx/5xx responses");
    if (metrics.brokenImages.length) strictFailures.push("broken images");
    if (metrics.horizontalOverflow) strictFailures.push("horizontal overflow");
    if (!readiness.fontsReady || metrics.fontStatus !== "loaded") strictFailures.push("fonts not ready");
    if (!readiness.imagesReady) strictFailures.push("images not ready");
    if (pixelSizeMatches === false) strictFailures.push("unexpected screenshot pixel size");
    if (opts.requireNetworkIdle && !networkIdleReached) strictFailures.push("network idle not reached");
    if (opts.expectedStatus !== undefined && mainDocument?.status !== opts.expectedStatus) {
      strictFailures.push(`main document status is ${mainDocument?.status ?? "unavailable"}; expected ${opts.expectedStatus}`);
    }
    if (opts.expectedFinalUrl && finalUrl !== opts.expectedFinalUrl) {
      strictFailures.push(`final URL is ${finalUrl}; expected ${opts.expectedFinalUrl}`);
    }
    if (shortcutDomAudit.some((item) => item.pass !== true)) {
      strictFailures.push("registered shortcut assets are not bound to the actual shortcut DOM");
    }
    if (shortcutInventoryAudit.pass !== true) {
      strictFailures.push("prominent shortcut-like control group contains entries missing from the reviewed shortcut inventory");
    }
    if (utilityIconDomAudit.some((item) => item.pass !== true)) {
      strictFailures.push("third-party utility icons are not bound to their reviewed library/version/icon DOM provenance");
    }
    if (
      fontFaceAudit.runtimeInstrumentationInstalled !== true ||
      fontFaceAudit.inaccessibleFrames.length ||
      fontFaceAudit.inaccessibleStyleSheets.length ||
      fontFaceAudit.unclassifiedFontFaceApiRecords.length
    ) {
      strictFailures.push("runtime font instrumentation, frame audit, or stylesheet font-source inspection is incomplete");
    }
    if (previewReceipt && mainDocumentBodySha256 !== previewReceipt.mainDocumentSha256) {
      strictFailures.push("main document body does not match production preview receipt");
    }

    const report = {
      schemaVersion: 2,
      tool: "capture_page",
      runId: opts.runId || null,
      captureId: crypto.randomUUID(),
      capturedAt: new Date().toISOString(),
      requestedUrl: opts.url,
      finalUrl,
      mainDocument,
      output,
      screenshotSha256: sha256File(output),
      screenshot: screenshotMetadata,
      expectedPixelSize,
      pixelSizeMatches,
      contract: {
        cssViewport: { width: opts.width, height: opts.height },
        deviceScaleFactor: opts.dpr,
        isMobile: opts.isMobile,
        hasTouch: opts.hasTouch,
        screenshotScale: opts.screenshotScale,
        animations: opts.animations,
        fullPage: opts.fullPage,
        selector: opts.selector || null,
        serviceWorkers: "block",
        browser: opts.browser,
        browserVersion: browser.version(),
        locale: opts.locale,
        timezone: opts.timezone,
        colorScheme: opts.colorScheme,
        reducedMotion: opts.reducedMotion,
        hideScrollbars: opts.hideScrollbars,
        stabilizeCss: opts.stabilizeCss,
        warmScroll: opts.warmScroll,
        warmupCaptures: opts.warmupCaptures,
        warmupFullPage: opts.warmupFullPage,
        warmupPhase: opts.warmupPhase,
        settleMs: opts.settleMs,
        waitFor: opts.waitFor || null,
        stateScript: opts.stateScript ? {
          path: opts.stateScript,
          sha256: sha256File(opts.stateScript),
        } : null,
        expectedStatus: opts.expectedStatus ?? null,
        expectedFinalUrl: opts.expectedFinalUrl || null,
        allowedHttpErrorPatterns: opts.allowHttpError,
        requireNetworkIdle: opts.requireNetworkIdle,
        strict: opts.strict,
        serverKind: opts.serverKind,
        productionPreview: previewReceipt ? {
          receipt: previewReceiptPath,
          receiptSha256: sha256File(previewReceiptPath),
          command: previewReceipt.command,
          cwd: previewReceipt.cwd,
          pid: previewReceipt.pid,
          processStartedAt: previewReceipt.processStartedAt,
          processAliveAtCapture: previewProcessAliveAtCapture,
          buildArtifact: previewReceipt.buildArtifact,
          buildArtifactSha256: previewReceipt.buildArtifactSha256,
          mainDocumentSha256: previewReceipt.mainDocumentSha256,
        } : null,
        iconRoleInventory: iconRoleInventoryPath ? {
          path: iconRoleInventoryPath,
          sha256: sha256File(iconRoleInventoryPath),
        } : null,
        shortcutManifest: shortcutManifestPath ? {
          path: shortcutManifestPath,
          sha256: sha256File(shortcutManifestPath),
        } : null,
      },
      runtime: {
        node: process.version,
        pid: process.pid,
        processStartedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
      },
      dependency: {
        playwright: resolution.resolved,
        playwrightVersion: packageVersionFromResolved(resolution.resolved, "playwright"),
      },
      readiness,
      networkIdleReached,
      metrics,
      consoleErrors,
      consoleWarnings,
      pageErrors,
      failedRequests,
      httpErrors,
      imageResources,
      dataResponses,
      staticResources,
      embeddedImageResources,
      embeddedFontResources,
      fontFaceAudit,
      shortcutDomAudit,
      utilityIconDomAudit,
      shortcutInventoryAudit,
      strictFailures,
      status: opts.strict && strictFailures.length ? "failed" : "captured",
    };
    const reportPath = output.replace(/\.[^.]+$/, "") + ".capture.json";
    writeJson(reportPath, report);
    console.log(JSON.stringify({ report: reportPath, ...report }, null, 2));
    if (opts.strict && strictFailures.length) process.exitCode = 2;
  } finally {
    if (context) await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
