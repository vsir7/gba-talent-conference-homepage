import assert from 'node:assert/strict';
import test from 'node:test';

import { PAGES } from '../scripts/page-registry.mjs';
import { PAGE_DATA } from '../scripts/page-data.mjs';

test('every route has non-empty design content', () => {
  assert.deepEqual(Object.keys(PAGE_DATA).sort(), PAGES.map((page) => page.id).sort());
  for (const page of PAGES) {
    const data = PAGE_DATA[page.id];
    assert.ok(data, `missing page data for ${page.id}`);
    assert.ok(data.title, `missing title for ${page.id}`);
    assert.ok(data.template, `missing template for ${page.id}`);
  }
});

test('duplicate pass routes stay distinct while sharing credential content', () => {
  const schedule = PAGE_DATA['entry-pass-schedule'];
  const service = PAGE_DATA['entry-pass-service'];
  const profile = PAGE_DATA['entry-pass-profile'];
  assert.notEqual(schedule.sourceRoute, service.sourceRoute);
  assert.notEqual(service.sourceRoute, profile.sourceRoute);
  assert.equal(schedule.credentialNo, service.credentialNo);
  assert.equal(schedule.credentialNo, profile.credentialNo);
});

test('all local atomic assets use project asset paths rather than UI references', () => {
  const serialized = JSON.stringify(PAGE_DATA);
  assert.doesNotMatch(serialized, /miniapp-/);
  assert.doesNotMatch(serialized, /references\/originals/);
  assert.doesNotMatch(serialized, /feishu-ui-images/);
});

test('core pages preserve the latest reference information architecture', () => {
  assert.equal(PAGE_DATA['conference-home'].portals.length, 6);
  assert.equal(PAGE_DATA.schedule.sessions.length, 3);
  assert.ok(PAGE_DATA.schedule.sessions.every((session) => session.image));
  assert.equal(PAGE_DATA['service-hall'].primaryServices.length, 4);
  assert.equal(PAGE_DATA.profile.primaryMenu.length, 4);
  assert.match(PAGE_DATA['entry-pass-schedule'].digitalTime, /^\d{2}:\d{2}:\d{2}$/);
  assert.match(PAGE_DATA['agenda-intro'].hero, /extracted\/agenda-city-hero\.png$/);
});
