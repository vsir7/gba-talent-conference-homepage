import test from 'node:test';
import assert from 'node:assert/strict';

import { renderPageById } from '../scripts/page-runtime.mjs';

test('carnival renders the five-entry composition from the refreshed reference', () => {
  const html = renderPageById('carnival');

  assert.equal((html.match(/class="carnival-card(?: featured)?"/g) || []).length, 5);
  assert.match(html, /五处风景线/);
  assert.match(html, /class="carnival-card featured"/);
  assert.match(html, /class="carnival-banner-image"/);
  assert.match(html, /assets\/refreshed\/carnival-hero-art\.png/);
  assert.doesNotMatch(html, /class="carnival-cta"/);
});

test('personal information renders all ten refreshed reference rows', () => {
  const html = renderPageById('personal-info');

  assert.equal((html.match(/class="info-record"/g) || []).length, 10);
  for (const label of ['证件照', '参会角色', '姓名', '证件类型', '证件号码', '手机号', '邮箱', '所在城市', '单位', '职务']) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.match(html, /class="info-photo"/);
  assert.match(html, />个人观众</);
  assert.match(html, /class="header-action"[^>]*data-route="personal-info-edit"[^>]*>编辑</);
  assert.doesNotMatch(html, /class="info-record"[^>]*data-route=/);
  assert.doesNotMatch(html, /<em>›<\/em>/);
});

test('registration picker renders detailed slot cards with topics and speakers', () => {
  const html = renderPageById('registration-picker');

  assert.equal((html.match(/class="slot-card(?: selected)?"/g) || []).length, 2);
  assert.match(html, /技术创新与产业未来/);
  assert.match(html, /湾区人才与产业协同发展/);
  assert.match(html, /陈志远/);
  assert.match(html, /林晓雯/);
  assert.equal((html.match(/class="slot-speaker-avatar"/g) || []).length, 2);
});
