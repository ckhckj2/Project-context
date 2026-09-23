import { createExecutionSession } from './execution-session.mjs';
import { createLearningSession } from './learning-session.mjs';
import { tasks } from '../content/catalog.mjs';
import { assert, record, identifier, text } from '../domain/validation.mjs';

const executionCommands = [
  'setReadingDepth',
  'addBranch',
  'removeBranch',
  'applyContext',
  'check',
  'setMemo',
  'complete',
  'reopen',
];
const learningCommands = ['start', 'setDraft', 'answer', 'next', 'abandon', 'review'];
function observe(owner, commands, changed) {
  const wrapped = { ...owner };
  for (const name of commands) {
    const command = owner[name];
    wrapped[name] = (...args) => {
      const result = command(...args);
      changed();
      return result;
    };
  }
  return Object.freeze(wrapped);
}
export function createProgressWorkspace(initial = null, changed = () => {}) {
  if (initial !== null) {
    record(initial, ['contentVersion', 'nextId', 'learning', 'works']);
    assert(initial.contentVersion === 1, 'Unsupported content version');
    assert(
      initial.learning !== null && typeof initial.learning === 'object',
      'Missing learning state',
    );
    assert(Number.isSafeInteger(initial.nextId) && initial.nextId >= 1, 'Invalid sequence');
    assert(Array.isArray(initial.works) && initial.works.length <= 100, 'Invalid work count');
  }
  const learningOwner = createLearningSession({ initial: initial?.learning ?? null });
  const works = new Map(),
    drafts = new Map();
  let nextId = initial?.nextId ?? 1;
  if (initial)
    for (const value of initial.works) {
      record(value, ['id', 'title', 'trashed', 'execution']);
      identifier(value.id);
      assert(
        /^work-[1-9][0-9]*$/.test(value.id) &&
          Number(value.id.slice(5)) < nextId &&
          !works.has(value.id),
        'Invalid work ID',
      );
      text(value.title, 80);
      assert(value.title.trim(), 'Empty title');
      assert(typeof value.trashed === 'boolean', 'Invalid trash flag');
      const session = createExecutionSession(
        value.execution?.rootId,
        learningOwner.readingProfile,
        value.execution,
      );
      works.set(value.id, { id: value.id, title: value.title, trashed: value.trashed, session });
    }
  function exportState() {
    return {
      contentVersion: 1,
      nextId,
      learning: learningOwner.exportState(),
      works: [...works.values()].map(({ id, title, trashed, session }) => ({
        id,
        title,
        trashed,
        execution: session.exportState(),
      })),
    };
  }
  const notify = () => changed(exportState());
  function entry(id) {
    const value = works.get(id);
    assert(value, 'Unknown saved work');
    return value;
  }
  function draft(rootId) {
    if (!drafts.has(rootId))
      drafts.set(rootId, createExecutionSession(rootId, learningOwner.readingProfile));
    return drafts.get(rootId);
  }
  return Object.freeze({
    learning: observe(learningOwner, learningCommands, notify),
    exportState,
    draft(rootId) {
      const session = draft(rootId);
      // Unsaved task content stays temporary; reading depth is a learning preference.
      return observe(session, ['setReadingDepth'], notify);
    },
    work(id) {
      const value = entry(id);
      assert(!value.trashed, 'Work is in trash');
      return observe(value.session, executionCommands, notify);
    },
    list: () =>
      [...works.values()].map(({ id, title, trashed, session }) => {
        const state = session.snapshot();
        return {
          id,
          title,
          trashed,
          rootId: state.rootId,
          status: state.workflow.status,
          nextAction:
            state.tasks
              .find((task) => task.id === state.nextTaskId)
              ?.steps.find(
                (step) => !state.workflow.checks.includes(state.nextTaskId + ':' + step.id),
              )?.title ?? null,
        };
      }),
    saveDraft(rootId, title) {
      text(title, 80);
      assert(title.trim(), 'Empty title');
      assert(works.size < 100 && Number.isSafeInteger(nextId + 1), 'Work limit reached');
      const session = draft(rootId),
        id = 'work-' + nextId++;
      works.set(id, { id, title: title.trim(), trashed: false, session });
      drafts.delete(rootId);
      notify();
      return id;
    },
    moveToTrash(id, confirmed = false) {
      assert(confirmed === true, 'Confirm moving to trash');
      entry(id).trashed = true;
      notify();
    },
    restore(id) {
      entry(id).trashed = false;
      notify();
    },
    taskTitle(rootId) {
      return tasks.find((task) => task.id === rootId)?.title ?? '';
    },
  });
}
export function validateProgress(value) {
  assert(value !== null, 'Missing progress');
  // Construct in isolation: a failed restore cannot partially replace live state.
  createProgressWorkspace(value);
}
