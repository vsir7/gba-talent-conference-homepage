import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const homeCss = read('styles.css');
const scheduleCss = read('schedule.css');
const entryCss = read('entry-service.css');
const profileCss = read('profile.css');
const serviceHallCss = read('service-hall.css');
const homeHtml = read('index.html');
const scheduleHtml = read('schedule.html');
const entryHtml = read('entry-service.html');
const profileHtml = read('profile.html');
const serviceHallHtml = read('service-hall.html');
const featureCss = read('service-pages.css');
const featurePages = ['tech-interaction.html', 'dining-service.html', 'carnival.html', 'attendance-guide.html', 'food-street.html'].map(read);
const batchTwoPages = ['city-walk.html', 'transportation.html', 'faq.html', 'youth-study.html', 'accommodation.html'].map(read);
const batchTwoCss = read('service-batch-02.css');
const batchThreePages = ['venue-guide.html', 'schedule-search.html', 'agenda-detail.html', 'guest-detail.html', 'notifications.html'].map(read);
const batchThreeCss = read('service-batch-03.css');

test('all published routes provide an embedded favicon and avoid an automatic 404 request', () => {
  for (const html of [homeHtml, scheduleHtml, entryHtml, serviceHallHtml, profileHtml, ...featurePages, ...batchTwoPages, ...batchThreePages]) {
    assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/);
  }
});

test('third service batch keeps the reference module order on the 750px canvas', () => {
  assert.match(batchThreeCss, /@media \(min-width: 640px\)/);
  assert.match(batchThreeCss, /\.batch3-shell\{max-width:var\(--layout-wide-canvas\)/);
  assert.doesNotMatch(batchThreeCss, /width:\s*750px/);
  assert.match(batchThreeCss, /\.venue-list\{gap:17px\}/);
  assert.match(batchThreeCss, /\.result-list\{gap:17px\}/);
  assert.match(batchThreeCss, /\.agenda-guests\{gap:14px/);
  assert.match(batchThreeCss, /\.guest-agenda-list\{gap:15px/);
  assert.match(batchThreeCss, /\.notice-list\{gap:16px/);
  for (const html of batchThreePages) assert.match(html, /data-ui-ready="false"/);
});

test('second service batch keeps source module order on the 750px canvas', () => {
  assert.match(batchTwoCss, /@media \(min-width: 640px\)/);
  assert.match(batchTwoCss, /\.batch-shell\s*\{[^}]*max-width:\s*var\(--layout-wide-canvas\)/);
  assert.doesNotMatch(batchTwoCss, /width:\s*750px/);
  assert.match(batchTwoCss, /\.city-spot-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(batchTwoCss, /\.study-route-list\s*\{[^}]*display:\s*grid/);
  for (const html of batchTwoPages) assert.match(html, /data-ui-ready="false"/);
});

test('first service batch preserves one-column reference flow on the 750px canvas', () => {
  assert.match(featureCss, /@media \(min-width:640px\)/);
  assert.match(featureCss, /\.feature-shell\{max-width:var\(--layout-wide-canvas\)/);
  assert.doesNotMatch(featureCss, /width:\s*750px/);
  assert.match(featureCss, /\.guide-flow\{display:grid;grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(featureCss, /\.carnival-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  for (const html of featurePages) assert.match(html, /data-ui-ready="false"/);
});

test('all conference pages provide a 750px-wide reflow profile', () => {
  for (const css of [homeCss, scheduleCss, entryCss, serviceHallCss]) {
    assert.match(css, /@media \(min-width:\s*640px\)/);
    assert.match(css, /max-width:var\(--layout-wide-canvas\)/);
    assert.doesNotMatch(css, /width:\s*750px/);
  }
});

test('home keeps the reference section sequence on the 750px canvas', () => {
  assert.match(homeCss, /\.agenda-card--upcoming\{grid-template-columns:1fr;min-height:278px/);
  assert.match(homeCss, /\.countdown\{display:grid;grid-template-columns:minmax\(0,1fr\) auto/);
  assert.match(homeCss, /\.news-list\{grid-template-columns:1fr;gap:20px/);
  assert.match(homeCss, /\.news-card:last-child\{grid-column:auto\}/);
  assert.match(homeCss, /\.home-brand-hero\{min-height:350px/);
});

test('schedule makes its categories and timeline use the wide canvas', () => {
  assert.match(scheduleCss, /\.category-strip\{[^}]*overflow:visible/);
  assert.match(scheduleCss, /\.category-chip\{min-width:0;flex:1/);
  assert.match(scheduleCss, /\.timeline-item\{grid-template-columns:116px minmax\(0,1fr\)/);
});

test('entry service grows its content hierarchy without creating empty grid columns', () => {
  assert.match(entryCss, /\.entry-content\{grid-template-columns:1fr;gap:20px/);
  assert.match(entryCss, /\.status-summary\{min-height:150px/);
  assert.match(entryCss, /\.notice-content\{grid-template-columns:86px minmax\(0,1fr\)/);
});

test('profile keeps its source card order on the 750px canvas', () => {
  assert.match(profileCss, /@media \(min-width:640px\)/);
  assert.match(profileCss, /\.profile-shell,\.profile-tabbar\{max-width:var\(--layout-wide-canvas\)/);
  assert.match(profileCss, /\.profile-content\{grid-template-columns:1fr;gap:20px/);
  assert.doesNotMatch(profileCss, /\.profile-content\{grid-template-columns:minmax\(0,1\.08fr\) minmax\(0,\.92fr\)/);
  assert.match(profileCss, /\.attendance-card\{grid-column:1\/-1;padding:28px/);
  assert.match(profileCss, /\.congress-card\{padding:24px/);
  assert.match(profileCss, /\.other-card\{padding:24px/);
});

test('service hall keeps its two-column, shortcut and exploration order on the 750px canvas', () => {
  assert.match(serviceHallCss, /\.primary-services\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(serviceHallCss, /\.quick-services\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(serviceHallCss, /\.explore-grid--three\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(serviceHallCss, /\.explore-grid--two\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(serviceHallCss, /\.primary-services\{grid-template-columns:1fr/);
});
