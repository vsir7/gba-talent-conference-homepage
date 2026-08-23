import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const file = (path) => new URL(path, root);
const read = (path) => existsSync(file(path)) ? readFileSync(file(path), 'utf8') : '';

const html = read('page-board.html');
const css = read('page-board.css');
const js = read('page-board.js');

test('page board production files exist', () => {
  for (const path of ['page-board.html', 'page-board.css', 'page-board.js']) {
    assert.equal(existsSync(file(path)), true, `${path} must exist`);
  }
});

test('page board exposes the registered production pages', () => {
  assert.match(html, /<aside class="page-board__sidebar"/);
  assert.match(html, /<nav[^>]+id="page-directory"/);
  assert.match(html, /<iframe[^>]+id="page-preview"/);
  for (const path of ['index.html', 'schedule.html', 'entry-service.html', 'service-hall.html', 'profile.html', 'tech-interaction.html', 'dining-service.html', 'carnival.html', 'attendance-guide.html', 'food-street.html', 'city-walk.html', 'transportation.html', 'faq.html', 'youth-study.html', 'accommodation.html', 'venue-guide.html', 'schedule-search.html', 'agenda-detail.html', 'guest-detail.html', 'notifications.html']) {
    assert.match(js, new RegExp(path.replace('.', '\\.')));
  }
});

test('page board preserves safe routing and a 750px preview contract', () => {
  assert.match(html, /viewport-fit=cover/);
  assert.match(css, /--board-preview-width:750px/);
  assert.match(css, /@media \(max-width:900px\)/);
  assert.match(css, /grid-template-columns:224px minmax\(0,1fr\)!important/);
  assert.match(css, /\.page-board__directory\{display:grid!important/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /const pages = Object\.freeze/);
  assert.match(js, /window\.location\.hash/);
  assert.match(js, /preview\.addEventListener\('error'/);
  assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|eval\(/);
});

test('page board exposes accessible page switching and preview fallbacks', () => {
  assert.match(html, /aria-label="页面目录"/);
  assert.match(html, /id="preview-status" role="status"/);
  assert.match(html, /id="retry-preview"/);
  assert.match(html, /<a[^>]+id="open-page"[^>]+target="_blank"[^>]+rel="noopener"/);
  assert.match(js, /setAttribute\('aria-current', selected \? 'page' : 'false'\)/);
  assert.match(js, /retryButton\.addEventListener\('click'/);
});
