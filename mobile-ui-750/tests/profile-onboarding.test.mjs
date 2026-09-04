import assert from 'node:assert/strict';
import test from 'node:test';

import { PAGE_BY_ID } from '../scripts/page-registry.mjs';
import { PAGE_DATA } from '../scripts/page-data.mjs';
import { renderPageById } from '../scripts/page-runtime.mjs';

test('role selection is registered as a 750px board page with the supplied reference', () => {
  const page = PAGE_BY_ID.get('role-selection');
  assert.ok(page);
  assert.equal(page.name, '选择参会角色');
  assert.equal(page.file, 'role-selection.html');
  assert.equal(page.reference, '034-miniapp-role-selection.png');
  assert.equal(page.targetHeight, 1625);
});

test('role selection renders all eight choices and the required destinations', () => {
  const data = PAGE_DATA['role-selection'];
  assert.equal(data.roles.length, 8);

  const html = renderPageById('role-selection');
  assert.equal((html.match(/data-action="select-role"/g) || []).length, 8);
  assert.match(html, /class="role-choice selected"/);
  assert.match(html, /data-route="profile-completion"[^>]*>下一步</);
  assert.match(html, /data-route="personal-info"[^>]*>跳过</);
});

test('profile completion renders the full real form from the supplied reference', () => {
  const page = PAGE_BY_ID.get('profile-completion');
  assert.ok(page);
  assert.equal(page.name, '完善个人信息');
  assert.equal(page.reference, '035-miniapp-profile-completion.png');
  assert.equal(page.targetHeight, 1625);

  const html = renderPageById('profile-completion');
  assert.match(html, /class="profile-completion-form"/);
  assert.match(html, /name="photo"[^>]*accept="image\/\*"/);
  for (const name of ['fullName', 'phone', 'email', 'idType', 'idNumber', 'city', 'organization', 'jobTitle', 'industry', 'region', 'biography', 'cooperation']) {
    assert.match(html, new RegExp(`name="${name}"`), `missing form control ${name}`);
  }
  assert.match(html, /name="biography"[^>]*maxlength="200"/);
  assert.match(html, /name="cooperation"[^>]*maxlength="200"/);
  assert.match(html, /type="submit"[^>]*>保存</);
});
