import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createProgressWorkspace,
  validateProgress,
} from '../../src/application/progress-workspace.mjs';
import { createPersistenceSession } from '../../src/application/persistence-session.mjs';
import { createValidatedStore } from '../../src/infrastructure/validated-store.mjs';
import { assessmentObjectives as bank } from '../../src/content/assessment-bank.mjs';
const key = 'cc_redesign_progress_v1';
const clone = (value) => JSON.parse(JSON.stringify(value));
function port() {
  const values = new Map([['legacy', 'untouched']]);
  return { values, getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) };
}
const correct = (q) => {
  const source = bank.find((value) => q.id === value.id + '-0' || q.id === value.id + '-1');
  return source.type === 'short' ? source.aliases[0] : source.answer;
};
test('first save is explicit; multiple same-task works, trash and completion restore independently', () => {
  let changes = 0;
  const w = createProgressWorkspace(null, () => changes++),
    draft = w.draft('drawing-revision');
  draft.addBranch('report');
  draft.setMemo('<img src=x onerror=alert(1)>');
  draft.check(draft.snapshot().workflow.stepKeys[0], true);
  assert.equal(changes, 0);
  assert.equal(w.exportState().works.length, 0);
  const first = w.saveDraft('drawing-revision', '첫 도면'),
    second = w.saveDraft('drawing-revision', '다른 도면');
  assert.notEqual(first, second);
  assert.equal(w.work(second).snapshot().memo, '');
  w.moveToTrash(first, true);
  const restored = createProgressWorkspace(clone(w.exportState()));
  assert.throws(() => restored.work(first));
  restored.restore(first);
  assert.equal(restored.work(first).snapshot().memo, '<img src=x onerror=alert(1)>');
  assert.equal(restored.work(first).snapshot().workflow.checks.length, 1);
  const saved = restored.work(second);
  for (const step of saved.snapshot().workflow.stepKeys) saved.check(step, true);
  saved.complete();
  assert.equal(
    createProgressWorkspace(clone(restored.exportState())).work(second).snapshot().workflow.status,
    'completed',
  );
  assert.ok(restored.list()[0].nextAction);
  assert.throws(() => restored.moveToTrash(first));
});
test('all quiz formats, draft/feedback/result and independent earned depth round trip', () => {
  let w = createProgressWorkspace();
  for (const track of ['design', 'permit', 'collaboration']) {
    for (let level = 1; level < 5; level++) {
      w.learning.start(track, 'promotion');
      while (w.learning.snapshot(track).attempt.phase !== 'finished') {
        const before = w.learning.snapshot(track),
          response = correct(before.attempt.question);
        w.learning.setDraft(track, response);
        w = createProgressWorkspace(clone(w.exportState()));
        assert.deepEqual(w.learning.snapshot(track).attempt.draft, response);
        w.learning.answer(track);
        w.learning.review(track);
        const feedback = w.learning.snapshot(track).attempt.feedback;
        w = createProgressWorkspace(clone(w.exportState()));
        assert.deepEqual(w.learning.snapshot(track).attempt.feedback, feedback);
        assert.equal(
          w.learning.reviewDestination(before.attempt.question.taskId),
          '#/quiz/' + track,
        );
        w.learning.next(track);
        w = createProgressWorkspace(clone(w.exportState()));
      }
      assert.equal(w.learning.snapshot(track).earnedLevel, level + 1);
      assert.throws(() => w.learning.next(track));
    }
  }
  w.draft('drawing-revision').setReadingDepth('drawing-revision', 4);
  w = createProgressWorkspace(clone(w.exportState()));
  assert.equal(w.learning.readingProfile.forTask('drawing-revision').depth, 4);
  w.draft('drawing-revision').setReadingDepth('drawing-revision', 1);
  assert.equal(w.learning.snapshot('design').earnedLevel, 5);
});
test('malformed, newer, inconsistent and injected records are rejected without overwriting', () => {
  const w = createProgressWorkspace();
  w.saveDraft('drawing-revision', '도면');
  w.learning.start('design', 'promotion');
  const good = w.exportState();
  const storage = port();
  const store = createValidatedStore({ storage, key, validate: validateProgress });
  const mutations = [
    (d) => {
      d.contentVersion = 2;
    },
    (d) => {
      d.learning = null;
    },
    (d) => {
      d.works[0].id = '__proto__';
    },
    (d) => {
      d.works[0].execution.checks = ['missing'];
    },
    (d) => {
      d.works[0].execution.status = 'completed';
    },
    (d) => {
      d.works[0].execution.selected = ['report', 'report'];
    },
    (d) => {
      d.works[0].title = 'x'.repeat(81);
    },
    (d) => {
      d.learning.earned.design = 6;
    },
    (d) => {
      d.learning.depths.design = 5;
    },
    (d) => {
      d.learning.attempts.design.applied = true;
    },
    (d) => {
      d.learning.attempts.design.quiz.score = 100;
    },
    (d) => {
      d.learning.attempts.design.quiz.items[0].options = ['a', 'a', 'c', 'd', 'e'];
    },
    (d) => {
      d.learning.attempts.design.quiz.responses = [{ response: 'x', skipped: false }];
    },
    (d) => {
      d.learning.reviewReturn = { trackId: 'design', taskId: 'drawing-revision' };
    },
  ];
  for (const mutate of mutations) {
    const bad = clone(good);
    mutate(bad);
    assert.throws(() => validateProgress(bad));
    const raw = JSON.stringify({ schemaVersion: 1, revision: 1, data: bad });
    storage.setItem(key, raw);
    assert.equal(store.read().ok, false);
    assert.equal(store.write(good, raw).ok, false);
    assert.equal(storage.getItem(key), raw);
  }
  assert.equal(storage.getItem('legacy'), 'untouched');
});
test('quota failure retains latest changes for retry; corrupt reads and conflicts fail closed', async () => {
  const storage = port(),
    store = createValidatedStore({ storage, key, validate: validateProgress }),
    reports = [];
  const persistence = createPersistenceSession({
    store,
    initial: store.read(),
    exclusive: async (action) => action(),
    report: (value) => reports.push(value),
  });
  const w = createProgressWorkspace(null, (value) => persistence.changed(value));
  const original = storage.setItem;
  storage.setItem = () => {
    throw new Error('quota');
  };
  w.saveDraft('drawing-revision', '도면');
  await persistence.settled();
  assert.equal(persistence.status(), 'unavailable');
  w.work('work-1').setMemo('실패 뒤 최신 메모');
  storage.setItem = original;
  await persistence.retry();
  await persistence.settled();
  assert.equal(persistence.status(), 'saved');
  assert.equal(store.read().data.works[0].execution.memo, '실패 뒤 최신 메모');
  const old = store.read();
  const other = clone(old.data);
  other.works[0].title = '다른 탭';
  store.write(other, old.raw);
  w.work('work-1').setMemo('덮어쓰면 안 됨');
  await persistence.settled();
  assert.equal(persistence.status(), 'conflict');
  assert.equal(store.read().data.works[0].title, '다른 탭');
  await persistence.retry();
  assert.equal(persistence.status(), 'conflict');
  storage.setItem(key, 'broken');
  const broken = createPersistenceSession({
    store,
    initial: store.read(),
    exclusive: async (action) => action(),
  });
  await broken.changed(w.exportState());
  await broken.retry();
  assert.equal(storage.getItem(key), 'broken');
  assert.equal(broken.status(), 'unreadable');
  assert.ok(reports.includes('saving'));
});
test('exclusive queued writers allow only one stale tab to commit', async () => {
  const storage = port(),
    store = createValidatedStore({ storage, key, validate: validateProgress });
  let queue = Promise.resolve();
  const exclusive = (action) => {
    const result = queue.then(action);
    queue = result.catch(() => {});
    return result;
  };
  const a = createPersistenceSession({ store, initial: store.read(), exclusive }),
    b = createPersistenceSession({ store, initial: store.read(), exclusive });
  const wa = createProgressWorkspace(null, (data) => a.changed(data)),
    wb = createProgressWorkspace(null, (data) => b.changed(data));
  wa.saveDraft('drawing-revision', 'A');
  wb.saveDraft('drawing-revision', 'B');
  await Promise.all([a.settled(), b.settled()]);
  assert.equal(a.status(), 'saved');
  assert.equal(b.status(), 'conflict');
  assert.equal(store.read().data.works[0].title, 'A');
});

test('missing exclusive locking never writes or reports successful persistence', async () => {
  const storage = port();
  const store = createValidatedStore({ storage, key, validate: validateProgress });
  const persistence = createPersistenceSession({
    store,
    initial: store.read(),
    exclusive: () => Promise.reject(new Error('unsupported')),
  });
  await persistence.changed(createProgressWorkspace().exportState());
  await persistence.settled();
  assert.equal(persistence.status(), 'unavailable');
  assert.equal(persistence.hasPending(), true);
  assert.equal(storage.getItem(key), null);
});
