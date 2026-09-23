import { assessmentObjectives } from '../content/assessment-bank.mjs';
import { tracks, tasks } from '../content/catalog.mjs';
import {
  createAssessment,
  selectAssessment,
  validateBank,
  restoreAssessment,
} from '../domain/assessment.mjs';
import { assert, record } from '../domain/validation.mjs';
import { createReadingProfile } from './reading-profile.mjs';

export function createLearningSession({
  bank = assessmentObjectives,
  random = Math.random,
  initial = null,
} = {}) {
  const catalog = structuredClone(bank);
  validateBank(catalog);
  const earned = { design: 1, permit: 1, collaboration: 1 },
    attempts = new Map(),
    rounds = new Map();
  const readingProfile = createReadingProfile(earned, () => earned);
  let reviewReturn = null;
  const validTrack = (id) =>
    assert(
      tracks.some((track) => track.id === id),
      'Unknown track',
    );
  function current(trackId) {
    validTrack(trackId);
    const value = attempts.get(trackId);
    assert(value, 'No active assessment');
    return value;
  }
  function snapshot(trackId) {
    validTrack(trackId);
    const attempt = attempts.get(trackId);
    return structuredClone({
      track: tracks.find((track) => track.id === trackId),
      earnedLevel: earned[trackId],
      attempt: attempt ? { ...attempt.quiz.snapshot(), promotionApplied: attempt.applied } : null,
    });
  }
  if (initial !== null) {
    record(initial, ['earned', 'depths', 'rounds', 'attempts', 'reviewReturn']);
    const ids = tracks.map((track) => track.id);
    for (const values of [initial.earned, initial.depths, initial.rounds, initial.attempts])
      record(values, ids);
    for (const id of ids) {
      assert(
        Number.isInteger(initial.earned[id]) && initial.earned[id] >= 1 && initial.earned[id] <= 5,
        'Invalid achievement',
      );
      earned[id] = initial.earned[id];
      readingProfile.setDepth(tasks.find((task) => task.trackId === id).id, initial.depths[id]);
      assert(Number.isSafeInteger(initial.rounds[id]) && initial.rounds[id] >= 0, 'Invalid round');
      rounds.set(id, initial.rounds[id]);
      const entry = initial.attempts[id];
      if (entry !== null) {
        record(entry, ['quiz', 'applied']);
        assert(typeof entry.applied === 'boolean' && initial.rounds[id] > 0, 'Invalid award');
        const quiz = restoreAssessment(catalog, entry.quiz),
          state = quiz.snapshot();
        assert(
          state.trackId === id && state.level + (entry.applied ? 1 : 0) === earned[id],
          'Achievement mismatch',
        );
        if (entry.applied)
          assert(state.phase === 'finished' && quiz.result().passed, 'Invalid award');
        if (state.phase === 'finished' && quiz.result().passed)
          assert(entry.applied, 'Missing award');
        attempts.set(id, { quiz, applied: entry.applied });
      }
    }
    if (initial.reviewReturn !== null) {
      record(initial.reviewReturn, ['taskId', 'trackId']);
      const state = current(initial.reviewReturn.trackId).quiz.snapshot();
      assert(
        state.phase === 'feedback' && state.question.taskId === initial.reviewReturn.taskId,
        'Invalid review destination',
      );
      reviewReturn = { ...initial.reviewReturn };
    }
  }
  return Object.freeze({
    exportState: () =>
      structuredClone({
        earned,
        depths: readingProfile.snapshot().depths,
        rounds: Object.fromEntries(tracks.map(({ id }) => [id, rounds.get(id) ?? 0])),
        attempts: Object.fromEntries(
          tracks.map(({ id }) => [
            id,
            attempts.has(id)
              ? { quiz: attempts.get(id).quiz.exportState(), applied: attempts.get(id).applied }
              : null,
          ]),
        ),
        reviewReturn,
      }),
    readingProfile,
    tracks: () => tracks.map((track) => snapshot(track.id)),
    snapshot,
    start(trackId, mode, taskId) {
      validTrack(trackId);
      const previous = attempts.get(trackId);
      assert(
        !previous || previous.quiz.snapshot().phase === 'finished',
        'Resume or explicitly abandon current assessment',
      );
      if (taskId)
        assert(
          tasks.some((task) => task.id === taskId && task.trackId === trackId),
          'Task/track mismatch',
        );
      const level = earned[trackId],
        round = rounds.get(trackId) ?? 0;
      const questions = selectAssessment(catalog, { trackId, level, mode, round, taskId }, random);
      const quiz = createAssessment(questions, { trackId, level, mode });
      attempts.set(trackId, { quiz, applied: false });
      rounds.set(trackId, round + 1);
      reviewReturn = null;
      return snapshot(trackId);
    },
    setDraft(trackId, value) {
      current(trackId).quiz.setDraft(value);
      return snapshot(trackId);
    },
    answer(trackId, skip = false) {
      current(trackId).quiz.answer(skip);
      return snapshot(trackId);
    },
    next(trackId) {
      const attempt = current(trackId);
      attempt.quiz.next();
      reviewReturn = null;
      if (attempt.quiz.snapshot().phase === 'finished') {
        const result = attempt.quiz.result();
        if (
          !attempt.applied &&
          result.mode === 'promotion' &&
          result.passed &&
          earned[trackId] === result.level &&
          result.level < 5
        ) {
          earned[trackId]++;
          attempt.applied = true;
        }
      }
      return snapshot(trackId);
    },
    abandon(trackId, confirmed = false) {
      validTrack(trackId);
      assert(confirmed === true, 'Confirm abandoning');
      attempts.delete(trackId);
      reviewReturn = null;
      return snapshot(trackId);
    },
    review(trackId) {
      const state = current(trackId).quiz.snapshot();
      assert(state.phase === 'feedback', 'Review follows an answer');
      reviewReturn = { taskId: state.question.taskId, trackId };
    },
    reviewDestination(taskId) {
      return reviewReturn?.taskId === taskId ? '#/quiz/' + reviewReturn.trackId : null;
    },
  });
}
