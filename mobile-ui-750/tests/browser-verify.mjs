import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGES } from '../scripts/page-registry.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/tongyuhu/Documents/OPC260601/oneup-platform/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core');
const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const screenshotDir = resolve(projectRoot, 'evidence', 'screenshots');
const viewportDir = resolve(projectRoot, 'evidence', 'viewports');
const reportFile = resolve(projectRoot, 'evidence', 'report.json');
const baseUrl = process.env.MOBILE_UI_BASE_URL || 'http://127.0.0.1:4175';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

mkdirSync(screenshotDir, { recursive: true });
mkdirSync(viewportDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: chrome });
const results = [];
let failed = false;

try {
  const board = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await board.goto(`${baseUrl}/page-board.html`, { waitUntil: 'networkidle' });
  const boardState = await board.evaluate(() => ({
    links: document.querySelectorAll('[data-page-link]').length,
    iframeWidth: document.querySelector('[data-board-frame]')?.getBoundingClientRect().width,
  }));
  if (boardState.links !== PAGES.length || boardState.iframeWidth !== 750) failed = true;
  await board.close();

  for (const pageInfo of PAGES) {
    const page = await browser.newPage({ viewport: { width: 750, height: pageInfo.targetHeight }, deviceScaleFactor: 1 });
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${baseUrl}/pages/${pageInfo.file}`, { waitUntil: 'networkidle' });
    const metrics = await page.evaluate(() => ({
      bodyWidth: document.body.getBoundingClientRect().width,
      canvasWidth: document.querySelector('.mobile-canvas')?.getBoundingClientRect().width,
      scrollWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      screen: document.querySelector('[data-screen]')?.getAttribute('data-screen'),
    }));
    const screenshot = resolve(screenshotDir, `${pageInfo.id}.png`);
    const viewportScreenshot = resolve(viewportDir, `${pageInfo.id}.png`);
    await page.screenshot({ path: viewportScreenshot, fullPage: false });
    await page.screenshot({ path: screenshot, fullPage: true });
    const result = { pageId: pageInfo.id, file: pageInfo.file, targetHeight: pageInfo.targetHeight, ...metrics, consoleErrors, failedRequests, viewportScreenshot, screenshot };
    if (metrics.bodyWidth !== 750 || metrics.canvasWidth !== 750 || metrics.scrollWidth !== 750 || metrics.screen !== pageInfo.id || consoleErrors.length || failedRequests.length) failed = true;
    results.push(result);
    await page.close();
  }

  const report = { generatedAt: new Date().toISOString(), baseUrl, board: boardState, pages: results, summary: { total: results.length, failed: results.filter((item) => item.bodyWidth !== 750 || item.canvasWidth !== 750 || item.scrollWidth !== 750 || item.screen !== item.pageId || item.consoleErrors.length || item.failedRequests.length).length } };
  writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report.summary)}\n`);
} finally {
  await browser.close();
}

if (failed) process.exitCode = 1;
