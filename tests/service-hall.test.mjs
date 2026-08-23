import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const file = (path) => new URL(path, root);
const read = (path) => existsSync(file(path)) ? readFileSync(file(path), 'utf8') : '';
const html = read('service-hall.html');
const css = read('service-hall.css');
const js = read('service-hall.js');

test('service hall production files exist', () => {
  for (const path of ['service-hall.html', 'service-hall.css', 'service-hall.js']) assert.equal(existsSync(file(path)), true, `${path} must exist`);
});

test('service hall uses semantic real DOM and design-system tokens', () => {
  assert.match(html, /<main class="service-shell" data-ui-ready="false">/);
  assert.match(html, /<h1 id="service-title">服务大厅<\/h1>/);
  assert.match(html, /<section class="primary-services"/);
  assert.match(html, /<nav class="quick-services"/);
  assert.match(html, /<nav class="service-tabbar"/);
  assert.match(css, /^@import "\.\/design-system\/tokens\/design-tokens\.css";/);
  assert.match(html, /href="entry-service\.html"/);
  assert.doesNotMatch(css, /codex-clipboard|background-image:\s*url\([^)]*\.harness/);
});

test('service hall provides responsive 750px reflow without global scaling', () => {
  assert.match(css, /\.service-shell\{[^}]*max-width:var\(--layout-viewport-max\)/);
  assert.match(css, /@media \(min-width:640px\)/);
  assert.match(css, /\.service-shell\{max-width:var\(--layout-wide-canvas\)/);
  assert.match(css, /\.primary-services\{gap:20px/);
  assert.match(css, /\.explore-grid--three\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(css, /(?:transform:\s*scale|zoom:|width:\s*750px)/);
});

test('service hall preserves accessibility and pending-service feedback', () => {
  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
  assert.match(html, /id="service-snackbar" role="status" aria-live="polite"/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /document\.querySelectorAll\('\[data-pending\]'\)/);
  assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|eval\(/);
});

test('service hall atomic asset provenance is retained', () => {
  for (const asset of ['quick-guide', 'quick-hotel', 'quick-faq', 'explore-carnival', 'explore-tech', 'explore-food', 'explore-citywalk', 'explore-study']) {
    assert.equal(existsSync(file(`public/assets/service-hall/${asset}.png`)), true, `${asset}.png must exist`);
    assert.match(read(`public/assets/service-hall/${asset}.asset.json`), /"atomicAndRightsConfirmed"\s*:\s*true/);
  }
});
