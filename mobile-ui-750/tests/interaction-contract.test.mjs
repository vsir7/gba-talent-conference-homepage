import assert from 'node:assert/strict';
import test from 'node:test';

import { PAGES } from '../scripts/page-registry.mjs';
import { renderPageById } from '../scripts/page-runtime.mjs';

const BUTTON_PATTERN = /<button\b([^>]*)>/g;

test('every visible button has an explicit prototype behavior', () => {
  for (const page of PAGES) {
    const html = renderPageById(page.id);
    const buttons = [...html.matchAll(BUTTON_PATTERN)];
    assert.ok(buttons.length > 0, `${page.id} should expose at least one action`);

    for (const [, attributes] of buttons) {
      const hasBehavior = /\bdata-(?:action|route|tab|filter|dialog|toggle)=/.test(attributes)
        || /\btype="submit"/.test(attributes);
      assert.ok(hasBehavior, `${page.id} contains a button without an explicit behavior: <button${attributes}>`);
    }
  }
});

test('all cross-page routes point to registered 750px pages', () => {
  const registered = new Set(PAGES.map((page) => page.id));
  for (const page of PAGES) {
    const html = renderPageById(page.id);
    const routes = [...html.matchAll(/\bdata-route="([^"]+)"/g)].map((match) => match[1]);
    for (const route of routes) {
      assert.ok(registered.has(route), `${page.id} points to unregistered route ${route}`);
    }
  }
});

test('stateful reference pages expose their required controls', () => {
  const expectations = new Map([
    ['ai-assistant', ['data-action="send-message"']],
    ['schedule', ['data-filter=', 'data-route="agenda-intro"']],
    ['agenda-intro', ['data-tab="agenda-guests"', 'data-route="registration-picker"']],
    ['agenda-guests', ['data-tab="agenda-intro"', 'data-route="registration-picker"']],
    ['agenda-schedule', ['data-tab="agenda-ticket-notice"', 'data-route="registration-picker"']],
    ['agenda-ticket-notice', ['data-tab="agenda-intro"', 'data-route="registration-picker"']],
    ['registration-picker', ['data-action="select-slot"', 'data-action="select-type"', 'data-route="phone-authorization"']],
    ['phone-authorization', ['data-action="authorize-phone"', 'data-action="deny-phone"']],
    ['personal-info-edit', ['type="submit"']],
    ['faq', ['data-toggle="faq"']],
  ]);

  for (const [pageId, needles] of expectations) {
    const html = renderPageById(pageId);
    for (const needle of needles) assert.ok(html.includes(needle), `${pageId} is missing ${needle}`);
  }
});
