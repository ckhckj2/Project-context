import { assert, identifier, text, record } from './validation.mjs';
import { viewDepth } from './learning.mjs';

export function validateBank(bank) {
  assert(Array.isArray(bank) && bank.length > 0, 'Empty assessment bank');
  const seen = new Set();
  for (const q of bank) {
    identifier(q.id);
    assert(!seen.has(q.id), 'Duplicate objective');
    seen.add(q.id);
    assert(['design', 'permit', 'collaboration'].includes(q.trackId), 'Unknown track');
    assert(Number.isInteger(q.level) && q.level >= 1 && q.level <= 4, 'Invalid objective level');
    identifier(q.taskId);
    text(q.objective);
    text(q.explanation, 1000);
    assert(q.reviewStatus === 'process-reviewed', 'Unreviewed objective');
    assert(
      Array.isArray(q.cases) && q.cases.length === 2 && new Set(q.cases).size === 2,
      'Two distinct cases required',
    );
    q.cases.forEach((value) => text(value, 500));
    assert(['choice', 'order', 'short'].includes(q.type), 'Unknown response type');
    if (q.type === 'short') {
      assert(Array.isArray(q.aliases) && q.aliases.length > 0, 'Missing aliases');
      q.aliases.forEach((value) => {
        text(value, 100);
        assert(value.trim(), 'Empty alias');
      });
    } else {
      assert(
        Array.isArray(q.options) && q.options.length === (q.type === 'choice' ? 5 : 3),
        'Invalid option count',
      );
      const ids = q.options.map((option) => identifier(option.id));
      assert(new Set(ids).size === ids.length, 'Duplicate option');
      assert(
        new Set(q.options.map((option) => option.label)).size === ids.length,
        'Duplicate label',
      );
      q.options.forEach((option) => {
        text(option.label, 200);
        if (q.type === 'choice') text(option.feedback, 1000);
      });
      if (q.type === 'choice') assert(ids.includes(q.answer), 'Unknown correct option');
      else
        assert(
          Array.isArray(q.answer) &&
            q.answer.length === ids.length &&
            new Set(q.answer).size === ids.length &&
            q.answer.every((id) => ids.includes(id)),
          'Invalid ordered answer',
        );
    }
  }
}
function shuffle(values, random) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const value = random();
    assert(Number.isFinite(value) && value >= 0 && value < 1, 'Invalid random source');
    const j = Math.floor(value * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function selectAssessment(
  bank,
  { trackId, level, mode, round = 0, taskId },
  random = Math.random,
) {
  viewDepth(level, 1);
  assert(['promotion', 'practice', 'single'].includes(mode), 'Invalid assessment mode');
  assert(['design', 'permit', 'collaboration'].includes(trackId), 'Unknown track');
  assert(Number.isInteger(round) && round >= 0, 'Invalid round');
  assert(mode !== 'promotion' || level < 5, 'Maximum level reached');
  const pool = bank.filter((q) => q.trackId === trackId);
  let chosen;
  if (mode === 'promotion') {
    const levels = level === 4 ? [1, 2, 3, 4] : [level],
      count = level === 4 ? 2 : 5;
    chosen = levels.flatMap((target) => {
      const eligible = pool.filter((q) => q.level === target);
      assert(eligible.length >= count, 'Insufficient reviewed objectives');
      return shuffle(eligible, random).slice(0, count);
    });
  } else {
    const eligible = pool.filter((q) => q.level <= Math.min(level, 4));
    const matching = taskId ? eligible.filter((q) => q.taskId === taskId) : [];
    const available = mode === 'single' && matching.length ? matching : eligible;
    const count = mode === 'single' ? 1 : 3;
    assert(available.length >= count, 'Insufficient reviewed objectives');
    chosen = shuffle(available, random).slice(0, count);
  }
  return shuffle(chosen, random).map((q) => ({
    ...structuredClone(q),
    caseId: q.id + '-' + (round % 2),
    prompt: q.cases[round % 2],
    options: q.options ? shuffle(structuredClone(q.options), random) : undefined,
  }));
}
const normalize = (value) =>
  value.normalize('NFKC').trim().toLocaleLowerCase('ko-KR').replace(/\s+/g, '');
export function validateResponse(question, response, partial = false) {
  if (question.type === 'order') {
    assert(Array.isArray(response) && response.length <= question.options.length, 'Invalid order');
    assert(
      new Set(response).size === response.length &&
        response.every((id) => question.options.some((option) => option.id === id)),
      'Invalid ordered item',
    );
    assert(partial || response.length === question.options.length, 'Complete the order');
    return [...response];
  }
  text(response, 100);
  if (question.type === 'choice')
    assert(
      (partial && response === '') || question.options.some((option) => option.id === response),
      'Invalid choice',
    );
  else assert(partial || response.trim().length > 0, 'Empty response');
  return response;
}
export function gradeResponse(question, response) {
  const value = validateResponse(question, response);
  if (question.type === 'choice') return value === question.answer;
  if (question.type === 'order') return value.every((id, index) => id === question.answer[index]);
  return question.aliases.some((alias) => normalize(alias) === normalize(value));
}
export function createAssessment(questions, { trackId, level, mode }) {
  questions = structuredClone(questions);
  assert(
    questions.length === (mode === 'promotion' ? (level === 4 ? 8 : 5) : mode === 'single' ? 1 : 3),
    'Invalid test length',
  );
  let index = 0,
    phase = 'answer',
    responses = [],
    draft = questions[0].type === 'order' ? [] : '';
  const threshold = mode === 'promotion' ? (level === 4 ? 7 : 4) : null;
  function snapshot() {
    const q = questions[index],
      feedback = responses[index];
    return structuredClone({
      trackId,
      level,
      mode,
      index,
      phase,
      total: questions.length,
      threshold,
      draft,
      score: responses.filter((item) => item.correct).length,
      question: {
        id: q.caseId,
        taskId: q.taskId,
        type: q.type,
        prompt: q.prompt,
        objective: q.objective,
        options: q.options?.map(({ id, label }) => ({ id, label })),
      },
      feedback:
        phase === 'answer'
          ? null
          : {
              correct: feedback?.correct,
              skipped: feedback?.skipped,
              reason: feedback?.reason,
              explanation: q.explanation,
              correctAnswer:
                q.type === 'short'
                  ? q.aliases[0]
                  : q.type === 'order'
                    ? q.answer
                        .map((id) => q.options.find((option) => option.id === id).label)
                        .join(' → ')
                    : q.options.find((option) => option.id === q.answer).label,
            },
      responses: responses.map((item) => ({ id: item.id, correct: item.correct })),
    });
  }
  return Object.freeze({
    snapshot,
    exportState: () =>
      structuredClone({
        trackId,
        level,
        mode,
        index,
        phase,
        draft,
        items: questions.map((q) => ({
          id: q.caseId,
          options: q.options?.map((option) => option.id) ?? [],
        })),
        responses: responses.map(({ response, skipped }) => ({ response, skipped })),
      }),
    setDraft(value) {
      assert(phase === 'answer', 'Question already answered');
      draft = validateResponse(questions[index], value, true);
      return snapshot();
    },
    answer(skip = false) {
      assert(phase === 'answer', 'Question already answered');
      assert(typeof skip === 'boolean', 'Invalid skip');
      const q = questions[index];
      const correct = !skip && gradeResponse(q, draft);
      const reason =
        q.type === 'choice' && !skip
          ? q.options.find((option) => option.id === draft).feedback
          : q.explanation;
      responses.push({
        id: q.caseId,
        correct,
        skipped: skip,
        reason,
        response: structuredClone(draft),
      });
      phase = 'feedback';
      return snapshot();
    },
    next() {
      assert(phase === 'feedback', 'Read feedback first');
      if (index + 1 === questions.length) phase = 'finished';
      else {
        index++;
        phase = 'answer';
        draft = questions[index].type === 'order' ? [] : '';
      }
      return snapshot();
    },
    result() {
      assert(phase === 'finished', 'Assessment unfinished');
      const score = responses.filter((item) => item.correct).length;
      return {
        trackId,
        level,
        mode,
        score,
        total: questions.length,
        threshold,
        passed: threshold !== null && score >= threshold,
      };
    },
  });
}

// Restore through the same grading transitions; persisted scores and explanations are never trusted.
export function restoreAssessment(bank, saved) {
  record(saved, ['trackId', 'level', 'mode', 'index', 'phase', 'draft', 'items', 'responses']);
  viewDepth(saved.level, 1);
  assert(['design', 'permit', 'collaboration'].includes(saved.trackId), 'Unknown track');
  assert(['single', 'practice', 'promotion'].includes(saved.mode), 'Unknown mode');
  assert(saved.mode !== 'promotion' || saved.level < 5, 'Invalid promotion');
  assert(
    Array.isArray(saved.items) && saved.items.length > 0 && saved.items.length <= 8,
    'Invalid items',
  );
  const seen = new Set();
  const questions = saved.items.map((item) => {
    record(item, ['id', 'options']);
    const q = bank.find((value) => item.id === value.id + '-0' || item.id === value.id + '-1');
    assert(
      q && q.trackId === saved.trackId && q.level <= Math.min(saved.level, 4) && !seen.has(q.id),
      'Invalid objective',
    );
    seen.add(q.id);
    if (saved.mode === 'promotion' && saved.level < 4)
      assert(q.level === saved.level, 'Wrong level');
    const ids = q.options?.map((option) => option.id) ?? [];
    assert(
      Array.isArray(item.options) &&
        item.options.length === ids.length &&
        new Set(item.options).size === ids.length &&
        item.options.every((id) => ids.includes(id)),
      'Invalid options',
    );
    return {
      ...structuredClone(q),
      caseId: item.id,
      prompt: q.cases[Number(item.id.slice(-1))],
      options: q.options
        ? item.options.map((id) => structuredClone(q.options.find((option) => option.id === id)))
        : undefined,
    };
  });
  if (saved.mode === 'promotion' && saved.level === 4)
    for (const level of [1, 2, 3, 4])
      assert(questions.filter((q) => q.level === level).length === 2, 'Unbalanced assessment');
  assert(
    Number.isInteger(saved.index) && saved.index >= 0 && saved.index < questions.length,
    'Invalid question index',
  );
  assert(['answer', 'feedback', 'finished'].includes(saved.phase), 'Invalid phase');
  assert(
    saved.phase !== 'finished' || saved.index === questions.length - 1,
    'Incomplete assessment',
  );
  assert(
    Array.isArray(saved.responses) &&
      saved.responses.length === saved.index + (saved.phase === 'answer' ? 0 : 1),
    'Invalid responses',
  );
  const quiz = createAssessment(questions, saved);
  saved.responses.forEach((entry, index) => {
    record(entry, ['response', 'skipped']);
    assert(typeof entry.skipped === 'boolean', 'Invalid skip');
    quiz.setDraft(entry.response);
    quiz.answer(entry.skipped);
    if (index < saved.index || saved.phase === 'finished') quiz.next();
  });
  if (saved.phase === 'answer') quiz.setDraft(saved.draft);
  else
    assert(
      JSON.stringify(saved.draft) === JSON.stringify(saved.responses.at(-1).response),
      'Draft mismatch',
    );
  return quiz;
}
