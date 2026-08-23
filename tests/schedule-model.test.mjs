import assert from 'node:assert/strict';
import test from 'node:test';

let model;
try {
  model = await import('../schedule-model.js');
} catch {
  model = null;
}

test('schedule selection returns the three visible October 25 agenda items', () => {
  assert.ok(model, 'schedule model must be loadable');
  const selected = model.selectScheduleItems(
    { day: '2026-10-25', category: 'all', scope: 'all', query: '' },
    new Set(['opening']),
  );
  assert.deepEqual(selected.map((item) => item.id), ['opening', 'innovation-lecture', 'open-mic']);
});

test('schedule selection combines category, followed scope and search query', () => {
  assert.ok(model, 'schedule model must be loadable');
  assert.deepEqual(
    model.selectScheduleItems(
      { day: '2026-10-25', category: 'keynote', scope: 'all', query: '' },
      new Set(['opening']),
    ).map((item) => item.id),
    ['opening'],
  );
  assert.deepEqual(
    model.selectScheduleItems(
      { day: '2026-10-25', category: 'all', scope: 'mine', query: '' },
      new Set(['opening', 'open-mic']),
    ).map((item) => item.id),
    ['opening', 'open-mic'],
  );
  assert.deepEqual(
    model.selectScheduleItems(
      { day: '2026-10-25', category: 'all', scope: 'all', query: '技术创新' },
      new Set(),
    ).map((item) => item.id),
    ['innovation-lecture'],
  );
});

test('October 26 stays empty until an approved schedule source is connected', () => {
  assert.ok(model, 'schedule model must be loadable');
  assert.deepEqual(
    model.selectScheduleItems(
      { day: '2026-10-26', category: 'all', scope: 'all', query: '' },
      new Set(),
    ),
    [],
  );
});

test('following an agenda item is immutable and reversible', () => {
  assert.ok(model, 'schedule model must be loadable');
  const original = new Set(['opening']);
  const followed = model.toggleFollowed(original, 'open-mic');
  const unfollowed = model.toggleFollowed(followed, 'opening');

  assert.deepEqual([...original], ['opening']);
  assert.deepEqual([...followed], ['opening', 'open-mic']);
  assert.deepEqual([...unfollowed], ['open-mic']);
});
