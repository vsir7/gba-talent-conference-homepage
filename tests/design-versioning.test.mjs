import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const root = process.cwd();
const currentTokenDir = path.join(root, 'design-system', 'tokens');
const archiveTokenDir = path.join(currentTokenDir, 'v1.0');

test('V1.0 archive and V2.0 current tokens are independently buildable', () => {
  const archiveSpec = path.join(root, 'design-v1.0.md');
  const archiveJson = path.join(archiveTokenDir, 'design-tokens.json');
  const archiveBuild = path.join(archiveTokenDir, 'build-tokens.mjs');
  const currentJson = path.join(currentTokenDir, 'design-tokens.json');

  assert.ok(fs.existsSync(archiveSpec), 'Missing frozen V1.0 specification');
  assert.ok(fs.existsSync(archiveJson), 'Missing frozen V1.0 token source');
  assert.ok(fs.existsSync(archiveBuild), 'Missing V1.0 token generator');

  const archived = JSON.parse(fs.readFileSync(archiveJson, 'utf8'));
  const current = JSON.parse(fs.readFileSync(currentJson, 'utf8'));
  assert.equal(archived.meta.version, '1.0.0');
  assert.equal(archived.meta.archiveLabel, 'V1.0');
  assert.equal(current.meta.version, '2.0.0');
  assert.notDeepEqual(archived.color, current.color, 'V1.0 and V2.0 color contracts must remain independent');

  execFileSync(process.execPath, [archiveBuild, '--check'], {
    cwd: root,
    stdio: 'inherit'
  });
});
