import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';

import { buildReferenceEntries } from '../scripts/prepare-references.mjs';
import { PAGES } from '../scripts/page-registry.mjs';

test('reference entries preserve original identity and separate normalized targets', () => {
  const entries = buildReferenceEntries({ probe: false });
  assert.equal(entries.length, PAGES.length);
  for (const [index, entry] of entries.entries()) {
    assert.equal(entry.pageId, PAGES[index].id);
    assert.equal(entry.sourceFile, PAGES[index].reference);
    assert.match(entry.normalizedFile, /^normalized-750\/.*\.png$/);
    assert.notEqual(entry.sourcePath, entry.normalizedPath);
    assert.ok(existsSync(entry.sourcePath));
  }
});
