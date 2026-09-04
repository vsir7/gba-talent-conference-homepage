import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/tongyuhu/Documents/OPC260601/oneup-platform/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core');

const baseUrl = process.env.MOBILE_UI_BASE_URL || 'http://127.0.0.1:4175';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

test('registration sheet remains reachable and scrollable in a short preview viewport', async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chrome });
  try {
    const page = await browser.newPage({ viewport: { width: 750, height: 820 }, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/pages/registration-picker.html`, { waitUntil: 'networkidle' });

    const sheet = page.locator('.ticket-sheet');
    const before = await sheet.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: window.innerHeight,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflowY: getComputedStyle(element).overflowY,
      };
    });

    assert.ok(before.top >= 0, `sheet starts above the viewport at ${before.top}px`);
    assert.ok(before.bottom <= before.viewportHeight, `sheet ends below the viewport at ${before.bottom}px`);
    assert.equal(before.overflowY, 'auto');
    assert.ok(before.scrollHeight > before.clientHeight, 'sheet content should overflow its own scroll container');

    await sheet.evaluate((element) => { element.scrollTop = 300; });
    assert.ok(await sheet.evaluate((element) => element.scrollTop) > 0, 'sheet should accept vertical scrolling');
  } finally {
    await browser.close();
  }
});
