import assert from 'node:assert/strict';
import test from 'node:test';

import { PAGE_BY_ID, PAGES } from '../scripts/page-registry.mjs';
import { PAGE_DATA } from '../scripts/page-data.mjs';
import { renderPageById } from '../scripts/page-runtime.mjs';

test('speaker registration is a registered 750px board page with its supplied reference', () => {
  const page = PAGE_BY_ID.get('speaker-registration');
  assert.ok(page);
  assert.equal(page.name, '分享者报名');
  assert.equal(page.file, 'speaker-registration.html');
  assert.equal(page.group, '日程');
  assert.equal(page.reference, '033-miniapp-speaker-registration.png');
  assert.equal(page.targetHeight, 1598);
  assert.equal(PAGES.at(8)?.id, 'speaker-registration');
});

test('speaker registration renders the complete interactive form from the reference', () => {
  const data = PAGE_DATA['speaker-registration'];
  assert.equal(data.template, 'speaker-form');
  assert.equal(data.outlines.length, 3);

  const html = renderPageById('speaker-registration');
  assert.match(html, /填写分享信息，提交后由大会审核/);
  assert.match(html, /技术创新与产业未来/);
  assert.match(html, /陈志远/);
  assert.match(html, /name="subject"[^>]*required/);
  assert.match(html, /name="introduction"[^>]*maxlength="300"[^>]*required/);
  assert.equal((html.match(/name="outline\[\]"/g) || []).length, 3);
  assert.match(html, /data-action="add-outline"/);
  assert.match(html, /accept="\.ppt,\.pptx,\.pdf"/);
  assert.match(html, /提交审核/);
});

test('the sharer choice carries the destination used by the registration CTA', () => {
  const html = renderPageById('registration-picker');
  assert.match(html, /data-action="select-type"[^>]*data-registration-route="speaker-registration"[^>]*>[^<]*<span/);
  assert.match(html, /data-action="registration-submit"/);
});
