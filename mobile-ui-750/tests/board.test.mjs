import assert from 'node:assert/strict';
import test from 'node:test';

import { PAGES } from '../scripts/page-registry.mjs';
import { pageHash, resolvePageId } from '../scripts/board-core.mjs';

test('valid page hash selects its page', () => {
  assert.equal(resolvePageId('#page=venue-guide', PAGES), 'venue-guide');
});

test('encoded valid page hash selects its page', () => {
  assert.equal(resolvePageId('#page=ai-assistant%20', PAGES), 'conference-home');
  assert.equal(resolvePageId('#page=ai-assistant', PAGES), 'ai-assistant');
});

test('invalid or empty page hash falls back to conference home', () => {
  assert.equal(resolvePageId('#page=missing', PAGES), 'conference-home');
  assert.equal(resolvePageId('', PAGES), 'conference-home');
});

test('pageHash creates stable deep links', () => {
  assert.equal(pageHash('venue-guide'), '#page=venue-guide');
});
