import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { PAGES } from '../scripts/page-registry.mjs';
import { generatePageHtml } from '../scripts/generate-pages.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');

test('registry exposes 32 unique routes and references', () => {
  assert.equal(PAGES.length, 32);
  assert.equal(new Set(PAGES.map((page) => page.id)).size, 32);
  assert.equal(new Set(PAGES.map((page) => page.file)).size, 32);
  for (const page of PAGES) {
    assert.match(page.reference, /^0\d{2}-miniapp-.*\.png$/);
    assert.ok(page.name.length > 0);
    assert.ok(page.group.length > 0);
    assert.ok(page.kind.length > 0);
    assert.ok(Number.isInteger(page.targetHeight) && page.targetHeight >= 1300, `invalid target height for ${page.id}`);
  }
});

test('generated page entries mount the requested real DOM screen', () => {
  const html = generatePageHtml(PAGES[0]);
  assert.match(html, /data-page-id="conference-home"/);
  assert.match(html, /--target-height:\s*2295px/);
  assert.match(html, /scripts\/page\.js/);
  assert.doesNotMatch(html, /references\/originals/);
  assert.doesNotMatch(html, /miniapp-conference\.png/);
});

test('all registry routes have generated HTML entries', () => {
  for (const page of PAGES) {
    const file = resolve(projectRoot, 'pages', page.file);
    assert.ok(existsSync(file), `missing ${page.file}`);
    assert.match(readFileSync(file, 'utf8'), new RegExp(`data-page-id="${page.id}"`));
  }
});
