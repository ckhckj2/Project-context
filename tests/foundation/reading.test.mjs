import test from 'node:test';
import assert from 'node:assert/strict';
import { createReadingProfile } from '../../src/application/reading-profile.mjs';
import { createExecutionSession } from '../../src/application/execution-session.mjs';
import { tasks, tracks } from '../../src/content/catalog.mjs';
import { relatedDefinitions } from '../../src/content/execution-paths.mjs';

test('all catalog and related tasks belong to exactly three independent tracks', () => {
  const profile = createReadingProfile({ design: 5, permit: 3, collaboration: 2 });
  assert.equal(tracks.length, 3);
  for (const task of [...tasks, ...relatedDefinitions])
    assert.ok(tracks.some((track) => track.id === profile.forTask(task.id).trackId));
  profile.setDepth('drawing-revision', 5);
  assert.equal(profile.forTask('report-update').depth, 1);
  assert.equal(profile.forTask('code-review').depth, 1);
  assert.throws(() => profile.setDepth('report-update', 3));
  assert.equal(profile.forTask('report-update').depth, 1);
});
test('reading changes preserve graph, context, notes, checks, completion and achievements at every level', () => {
  const profile = createReadingProfile({ design: 5, permit: 5, collaboration: 5 });
  const session = createExecutionSession('drawing-revision', profile);
  session.addBranch('report');
  session.setMemo('보존');
  session.check('drawing-revision:prepare', true);
  const before = session.snapshot();
  for (const level of [2, 3, 4, 5, 1]) {
    session.setReadingDepth('drawing-revision', level);
    const after = session.snapshot();
    for (const key of ['workflow', 'context', 'memo', 'branches'])
      assert.deepEqual(after[key], before[key]);
    assert.equal(after.tasks[0].reading.depth, level);
    assert.equal(after.tasks[0].reading.sections.essentialNotices, true);
  }
  assert.deepEqual(profile.snapshot().earned, { design: 5, permit: 5, collaboration: 5 });
  for (const key of session.snapshot().workflow.stepKeys) session.check(key, true);
  session.complete();
  const completed = session.snapshot().workflow;
  session.setReadingDepth('drawing-revision', 2);
  assert.deepEqual(session.snapshot().workflow, completed);
  const other = createExecutionSession('modeling', profile);
  session.setReadingDepth('drawing-revision', 3);
  assert.equal(other.snapshot().tasks[0].reading.depth, 3);
});
test('invalid profiles and depths fail atomically; defaults do not import or grant legacy grades', () => {
  for (const data of [
    { design: 6, permit: 1, collaboration: 1 },
    { design: 1 },
    { design: 1, permit: 1, collaboration: 1, extra: 5 },
    { design: '5', permit: 1, collaboration: 1 },
  ])
    assert.throws(() => createReadingProfile(data));
  const input = { design: 5, permit: 1, collaboration: 1 },
    profile = createReadingProfile(input);
  input.design = 1;
  assert.equal(profile.forTask('modeling').earnedLevel, 5);
  const before = profile.snapshot();
  for (const level of [0, 6, 1.5, '3', null]) {
    assert.throws(() => profile.setDepth('modeling', level));
    assert.deepEqual(profile.snapshot(), before);
  }
  assert.throws(() => profile.forTask('__proto__'));
  assert.equal(createReadingProfile().forTask('modeling').earnedLevel, 1);
  const copy = profile.forTask('modeling');
  copy.levels.length = 0;
  assert.equal(profile.forTask('modeling').levels.length, 5);
});
