import test from 'node:test';
import assert from 'node:assert/strict';
import { assessmentObjectives as bank } from '../../src/content/assessment-bank.mjs';
import { tasks } from '../../src/content/catalog.mjs';
import { validateBank, selectAssessment, gradeResponse } from '../../src/domain/assessment.mjs';
import { createLearningSession } from '../../src/application/learning-session.mjs';
const answer = (q) => (q.type === 'short' ? q.aliases[0] : q.answer);
const source = (q) => bank.find((item) => q.id === item.id + '-0' || q.id === item.id + '-1');
function finish(session, track, correct = Infinity) {
  let count = 0;
  while (session.snapshot(track).attempt.phase !== 'finished') {
    const q = session.snapshot(track).attempt.question;
    if (count++ < correct) {
      session.setDraft(track, answer(source(q)));
      session.answer(track);
    } else session.answer(track, true);
    session.next(track);
  }
  return session.snapshot(track);
}
test('reviewed bank covers three tracks and all promotion levels with distinct scenarios', () => {
  validateBank(bank);
  assert.equal(bank.length, 51);
  for (const track of ['design', 'permit', 'collaboration']) {
    assert.deepEqual(
      [1, 2, 3, 4].map(
        (level) => bank.filter((q) => q.trackId === track && q.level === level).length,
      ),
      [5, 5, 5, 2],
    );
    for (const q of bank.filter((q) => q.trackId === track))
      assert.equal(tasks.find((t) => t.id === q.taskId)?.trackId, track);
    const selected = selectAssessment(bank, { trackId: track, level: 4, mode: 'promotion' });
    assert.equal(new Set(selected.map((q) => q.id)).size, 8);
    assert.deepEqual(
      [1, 2, 3, 4].map((level) => selected.filter((q) => q.level === level).length),
      [2, 2, 2, 2],
    );
  }
  assert.throws(() => validateBank([]));
  assert.throws(() => validateBank([...bank, bank[0]]));
});
test('each track promotes independently to five, with exact thresholds and unchanged reading depth', () => {
  const session = createLearningSession();
  for (const track of ['design', 'permit', 'collaboration']) {
    for (let level = 1; level < 5; level++) {
      session.start(track, 'promotion');
      const result = finish(session, track, level === 4 ? 7 : 4);
      assert.equal(result.earnedLevel, level + 1);
      assert.equal(result.attempt.promotionApplied, true);
      assert.throws(() => session.next(track));
      assert.equal(
        session.readingProfile.forTask(tasks.find((t) => t.trackId === track).id).depth,
        1,
      );
    }
    assert.throws(() => session.start(track, 'promotion'));
  }
});
test('failed promotion and perfect practice never award levels; retries alternate scenarios', () => {
  const session = createLearningSession({ random: () => 0.5 });
  session.start('design', 'promotion');
  const first = session.snapshot('design').attempt.question;
  assert.equal(finish(session, 'design', 3).earnedLevel, 1);
  session.start('design', 'promotion');
  assert.notEqual(session.snapshot('design').attempt.question.id, first.id);
  session.abandon('design', true);
  for (const mode of ['practice', 'single']) {
    session.start('design', mode);
    assert.equal(finish(session, 'design').earnedLevel, 1);
  }
  assert.equal(session.snapshot('permit').earnedLevel, 1);
});
test('answers validate types, complete ordering and normalized short aliases', () => {
  const choice = bank.find((q) => q.type === 'choice'),
    order = bank.find((q) => q.type === 'order'),
    short = bank.find((q) => q.type === 'short');
  for (const input of ['', 'unknown', {}, 'x'.repeat(101)])
    assert.throws(() => gradeResponse(choice, input));
  for (const input of [[], ['a', 'a', 'b'], ['a', 'b', 'unknown']])
    assert.throws(() => gradeResponse(order, input));
  assert.equal(gradeResponse(order, order.answer), true);
  assert.equal(gradeResponse(order, [...order.answer].reverse()), false);
  assert.equal(gradeResponse(short, '  ' + short.aliases[0].split('').join(' ') + '  '), true);
  assert.throws(() => gradeResponse(short, ' '));
  assert.throws(() => gradeResponse(short, 'x'.repeat(101)));
});
test('drafts and feedback survive navigation snapshots; mutation and repeated commands cannot award', () => {
  const session = createLearningSession();
  session.start('design', 'promotion');
  const before = session.snapshot('design'),
    q = source(before.attempt.question);
  assert.equal(before.attempt.question.answer, undefined);
  assert.equal(before.attempt.question.options[0].feedback, undefined);
  session.setDraft('design', answer(q));
  before.earnedLevel = 5;
  assert.equal(session.snapshot('design').earnedLevel, 1);
  assert.equal(session.snapshot('design').attempt.draft, answer(q));
  assert.throws(() => session.start('design', 'practice'));
  assert.throws(() => session.abandon('design'));
  session.answer('design');
  session.review('design');
  assert.equal(session.reviewDestination(q.taskId), '#/quiz/design');
  assert.throws(() => session.answer('design'));
  assert.throws(() => session.setDraft('design', 'b'));
  assert.equal(session.snapshot('design').attempt.phase, 'feedback');
  session.abandon('design', true);
  assert.equal(session.snapshot('design').attempt, null);
});
test('insufficient content and mismatched source fail without replacing state', () => {
  const session = createLearningSession({ bank: [bank[0]] });
  assert.throws(() => session.start('design', 'promotion'));
  assert.equal(session.snapshot('design').attempt, null);
  assert.throws(() => session.start('permit', 'single', 'drawing-revision'));
  assert.throws(() => session.start('unknown', 'practice'));
});
