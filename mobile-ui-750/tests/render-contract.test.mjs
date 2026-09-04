import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { escapeHtml, renderScreen } from '../scripts/render-core.mjs';
import { PAGE_DATA } from '../scripts/page-data.mjs';
import { PAGE_BY_ID } from '../scripts/page-registry.mjs';
import { renderPageById } from '../scripts/page-runtime.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');

test('escapeHtml prevents data from creating markup', () => {
  assert.equal(escapeHtml('<img onerror=x>'), '&lt;img onerror=x&gt;');
  assert.equal(escapeHtml('A & B "C"'), 'A &amp; B &quot;C&quot;');
});

test('renderScreen creates a semantic named page without reference screenshots', () => {
  const html = renderScreen(
    { id: 'service-hall', name: '服务大厅', kind: 'service', group: '服务' },
    { title: '服务大厅', subtitle: '大会服务，一站直达', sections: [] },
  );
  assert.match(html, /<main class="screen/);
  assert.match(html, /服务大厅/);
  assert.match(html, /<header/);
  assert.doesNotMatch(html, /<img[^>]+reference/);
  assert.doesNotMatch(html, /miniapp-/);
});

test('mobile canvas contract is exactly 750 CSS pixels with no responsive rules', () => {
  const css = readFileSync(resolve(projectRoot, 'styles', 'base.css'), 'utf8');
  assert.match(css, /\.mobile-canvas\s*\{[^}]*width:\s*750px;/s);
  assert.match(css, /min-width:\s*750px;/);
  assert.match(css, /max-width:\s*750px;/);
  assert.doesNotMatch(css, /@media/);
  assert.doesNotMatch(css, /\b(?:vw|rem)\b/);
});

test('representative templates render their defining real DOM structures', () => {
  const cases = [
    ['conference-home', /class="conference-hero"/],
    ['schedule', /class="schedule-item"/],
    ['agenda-guests', /class="guest-grid"/],
    ['entry-pass-schedule', /class="credential-card"/],
    ['phone-authorization', /role="dialog"/],
    ['news-detail', /class="article-body"/],
    ['service-hall', /class="primary-service-grid"/],
    ['profile', /class="profile-card"/],
    ['personal-info-edit', /class="form-row"/],
    ['meal-voucher', /class="voucher-card"/],
  ];
  for (const [id, pattern] of cases) {
    const html = renderScreen(PAGE_BY_ID.get(id), PAGE_DATA[id]);
    assert.match(html, pattern, `${id} is missing its defining structure`);
    assert.doesNotMatch(html, /undefined|null/);
  }
});

test('page runtime renders a registered id and rejects an unknown id', () => {
  assert.match(renderPageById('venue-guide'), /data-screen="venue-guide"/);
  assert.throws(() => renderPageById('missing-page'), /Unknown page id/);
});

test('service detail pages render their design-specific story layout', () => {
  const layouts = new Map([
    ['venue-guide', 'venue'],
    ['transportation', 'transport'],
    ['dining-service', 'dining'],
    ['carnival', 'carnival'],
    ['food-street', 'food'],
    ['accommodation', 'hotel'],
    ['youth-study', 'study'],
  ]);
  for (const [pageId, layout] of layouts) {
    const html = renderPageById(pageId);
    assert.match(html, new RegExp(`service-story--${layout}`), `${pageId} should use its ${layout} structure`);
  }
});

test('service layouts expose the reference-specific modules', () => {
  const expected = {
    'venue-guide': ['venue-search', 'venue-overview'],
    transportation: ['transport-destination', 'transport-shuttle', 'transport-notice'],
    'dining-service': ['dining-rights', 'dining-arrangement', 'dining-location', 'dining-tips'],
    carnival: ['carnival-mast', 'carnival-banner', 'carnival-grid'],
    'food-street': ['food-grid', 'story-actions'],
    accommodation: ['hotel-list'],
    'youth-study': ['study-tabs', 'study-routes'],
  };
  for (const [pageId, modules] of Object.entries(expected)) {
    const html = renderPageById(pageId);
    for (const moduleName of modules) {
      assert.match(html, new RegExp(`class="[^"]*${moduleName}`), `${pageId} missing ${moduleName}`);
    }
  }
});

test('profile family preserves reference content and destinations', () => {
  const profile = renderPageById('profile');
  for (const route of ['notifications', 'my-schedule', 'meal-benefits', 'contact-staff']) {
    assert.match(profile, new RegExp(`data-route="${route}"`), `profile missing route ${route}`);
  }

  const notifications = renderPageById('notifications');
  assert.equal((notifications.match(/class="notice-card /g) || []).length, 5);
  assert.match(notifications, /大会接驳班次调整通知/);

  const info = renderPageById('personal-info');
  for (const label of ['姓名', '证件类型', '证件号码', '手机号', '邮箱', '所在城市', '单位', '职务']) {
    assert.match(info, new RegExp(label), `personal info missing ${label}`);
  }
});

test('FAQ preserves all reference groups and support exits', () => {
  const html = renderPageById('faq');
  assert.equal((html.match(/class="faq-group/g) || []).length, 6);
  assert.ok((html.match(/data-toggle="faq"/g) || []).length >= 13);
  assert.match(html, /data-route="ai-assistant"/);
  assert.match(html, /data-route="contact-staff"/);
});

test('food cards keep both the character motif and the dish photo', () => {
  const html = renderPageById('food-street');
  assert.equal((html.match(/class="food-mascot-image"/g) || []).length, 4);
  assert.equal((html.match(/class="food-card-image"/g) || []).length, 4);
});

test('my schedule uses the compact credential-state cards from its reference', () => {
  const html = renderPageById('my-schedule');
  assert.equal((html.match(/class="my-schedule-card/g) || []).length, 3);
  assert.match(html, /待审核/);
  assert.match(html, /报名成功/);
  assert.match(html, /报名失败/);
});
