import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const file = (path) => new URL(path, root);
const read = (path) => existsSync(file(path)) ? readFileSync(file(path), 'utf8') : '';

const html = read('entry-service.html');
const css = read('entry-service.css');
const js = read('entry-service.js');

test('entry service production files exist', () => {
  for (const path of ['entry-service.html', 'entry-service.css', 'entry-service.js']) {
    assert.equal(existsSync(file(path)), true, `${path} must exist`);
  }
});

test('page uses design-system tokens and real semantic DOM', () => {
  assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/);
  assert.match(html, /<main class="entry-shell" data-ui-ready="true">/);
  assert.match(html, /<h1>入场服务<\/h1>/);
  assert.match(html, /我的入场状态/);
  assert.match(html, /大会基础信息/);
  assert.match(html, /入场流程/);
  assert.match(html, /入场须知/);
  assert.match(html, /遇到问题？/);
  assert.match(css, /^@import "\.\/design-system\/tokens\/design-tokens\.css";/);
  assert.doesNotMatch(html, /class="status-bar"|>9:41</);
  assert.doesNotMatch(css, /codex-clipboard|background-image:\s*url\([^)]*\.harness/);
});

test('page preserves the 375px adaptation and accessibility contracts', () => {
  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
  assert.match(css, /\.entry-shell\{[^}]*max-width:var\(--layout-viewport-max\)/);
  assert.match(css, /@media \(max-width:359px\)/);
  assert.match(css, /@media \(min-width:414px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css, /env\(safe-area-inset-top/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /width:\s*375px/);
});

test('status, process and actions expose meaningful state and behavior', () => {
  assert.match(html, /role="status"/);
  assert.match(html, /<ol class="entry-steps"/);
  assert.match(html, /<time datetime="2025-04-24T09:41:30\+08:00">/);
  assert.match(html, /<dialog[^>]+id="entry-dialog"/);
  assert.match(js, /history\.back\(\)/);
  assert.match(js, /showModal\(\)/);
  assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|eval\(/);
});

test('atomic illustrations exist with traceable provenance', () => {
  const assets = ['access-gate', 'venue-building', 'arrival-map', 'qr-code', 'registration-card', 'result-check', 'notice-megaphone', 'support-headset'];
  for (const asset of assets) {
    assert.equal(existsSync(file(`public/assets/entry-service/${asset}.png`)), true, `${asset}.png must exist`);
    const provenance = read(`public/assets/entry-service/${asset}.asset.json`);
    assert.match(provenance, /"atomicAndRightsConfirmed"\s*:\s*true/);
  }
});
