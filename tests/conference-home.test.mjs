import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const file = (path) => new URL(path, root);
const html = readFileSync(file('index.html'), 'utf8');
const css = readFileSync(file('styles.css'), 'utf8');
const js = readFileSync(file('app.js'), 'utf8');

test('conference home uses the production design system and real DOM', () => {
  assert.match(html, /data-ui-ready="true"/);
  assert.match(css, /@import "\.\/design-system\/tokens\/design-tokens\.css"/);
  assert.match(html, /class="home-brand-hero"/);
  assert.match(html, /class="feature-entry-group card card--hero"/);
  assert.match(html, /class="notice-bar"/);
  assert.match(html, /class="guest-grid"/);
  assert.match(html, /class="news-list"/);
  assert.doesNotMatch(html, /class="status-bar"|9:41/);
  assert.doesNotMatch(css, /codex-clipboard|background-image:\s*url\([^)]*\.harness/);
});

test('all atomic reference assets exist and are traceable', () => {
  const assets = [
    'hero-key-visual', 'opening-stage', 'speaker-yang', 'speaker-zhang',
    'speaker-yu', 'news-opening', 'news-vision', 'news-campus'
  ];
  for (const asset of assets) {
    assert.equal(existsSync(file(`public/assets/reference/${asset}.png`)), true, `${asset}.png must exist`);
    assert.equal(existsSync(file(`public/assets/reference/${asset}.asset.json`)), true, `${asset} provenance must exist`);
  }
});

test('home controls expose meaningful interaction and state semantics', () => {
  assert.match(html, /aria-expanded="false" aria-controls="notice-details"/);
  assert.match(html, /aria-pressed="false" data-reminder/);
  assert.match(html, /<dialog class="dialog"/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(js, /localStorage\.setItem/);
  assert.match(js, /showModal\(\)/);
  assert.doesNotMatch(js, /功能已响应|innerHTML|eval\(/);
});

test('responsive and accessibility contracts are present', () => {
  assert.match(css, /@media \(max-width:359px\)/);
  assert.match(css, /@media \(min-width:414px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css, /var\(--size-touch-target\)/);
  assert.match(css, /env\(safe-area-inset-top/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
});

test('375px regular-phone layout reflows dense components instead of clamping the page', () => {
  assert.match(css, /\.app-shell\{[^}]*max-width:var\(--layout-viewport-max\)/);
  assert.doesNotMatch(css, /--layout-home-viewport/);
  assert.match(css, /@media \(min-width:360px\) and \(max-width:413px\)/);
  assert.match(css, /\.feature-entry-group\{grid-template-columns:1fr/);
  assert.match(css, /\.feature-entry\{display:grid;grid-template-columns:var\(--component-hero-icon-min-size\) 1fr var\(--component-micro-action-visual-size\)/);
  assert.match(css, /\.agenda-card--upcoming\{grid-template-columns:1fr/);
  assert.match(css, /\.countdown\{display:grid;grid-template-columns:minmax\(0,1fr\) auto;grid-template-areas:"label action" "time action" "units action"/);
});
