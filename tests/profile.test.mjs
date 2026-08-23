import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const file = (path) => new URL(path, root);
const read = (path) => existsSync(file(path)) ? readFileSync(file(path), 'utf8') : '';

const html = read('profile.html');
const css = read('profile.css');
const js = read('profile.js');

test('profile production files exist', () => {
  for (const path of ['profile.html', 'profile.css', 'profile.js']) {
    assert.equal(existsSync(file(path)), true, `${path} must exist`);
  }
});

test('profile page is a real-DOM 375px mobile canvas', () => {
  assert.match(html, /<main class="profile-shell" data-ui-ready="true">/);
  assert.match(html, /<title>我的｜第四届粤港澳大湾区人才高质量发展大会<\/title>/);
  assert.match(html, /张小湾/);
  assert.match(html, /我的参会/);
  assert.match(html, /我的大会/);
  assert.match(html, /个人信息/);
  assert.match(css, /^@import "\.\/design-system\/tokens\/design-tokens\.css";/);
  assert.match(css, /\.profile-shell\{[^}]*max-width:375px/);
  assert.match(css, /\.profile-tabbar\{[^}]*max-width:375px/);
  assert.match(css, /\.profile-shell,\.profile-tabbar\{max-width:var\(--layout-wide-canvas\)/);
  assert.doesNotMatch(html, /class="status-bar"|>9:41</);
  assert.doesNotMatch(css, /codex-clipboard|background-image:\s*url\([^)]*\.harness/);
});

test('profile page keeps accessibility, safe-area and interaction contracts', () => {
  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
  assert.match(html, /<dialog[^>]+id="profile-dialog"/);
  assert.match(css, /env\(safe-area-inset-top/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /showModal\(\)/);
  assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|eval\(/);
});

test('profile atomic illustrations include provenance', () => {
  for (const asset of ['avatar-xiaowan', 'attendance-card', 'quick-schedule', 'quick-open-mic', 'quick-dining', 'quick-cooperation']) {
    assert.equal(existsSync(file(`public/assets/profile/${asset}.png`)), true, `${asset}.png must exist`);
    assert.match(read(`public/assets/profile/${asset}.asset.json`), /"atomicAndRightsConfirmed"\s*:\s*true/);
  }
});
