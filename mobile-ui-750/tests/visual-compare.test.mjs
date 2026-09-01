import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSsim } from '../scripts/visual-compare.mjs';

test('parseSsim extracts the aggregate score from ffmpeg output', () => {
  assert.equal(parseSsim('SSIM R:0.2 G:0.3 B:0.4 All:0.388043 (2.132792)'), 0.388043);
  assert.throws(() => parseSsim('no metric'), /Unable to parse SSIM/);
});
