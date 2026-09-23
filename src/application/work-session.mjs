import { assert, text } from '../domain/validation.mjs';
import { createWorkflow, setStep, finishWorkflow, nextTask } from '../domain/workflow.mjs';
import { viewDepth, visibleSections } from '../domain/learning.mjs';

/** Memory session for composing a workflow. Durable saving belongs to stage 7.
 * Definitions/branches/edges are supplied by content, never inferred from the DOM.
 * Every command returns a detached snapshot. UI-only focus/navigation stays in UI.
 */
export function createWorkSession(configuration) {
  const {
    definitions,
    rootId,
    additions,
    edges,
    earnedLevel = 1,
    facilities,
    phases,
  } = structuredClone(configuration);
  let branches = [],
    workflow = createWorkflow(definitions, [rootId], []);
  let depth = 1,
    saved = false,
    trash = false,
    memo = '',
    facility = facilities[0],
    phase = phases[0];
  const snapshot = () =>
    structuredClone({
      branches,
      workflow,
      checks: workflow.checks,
      completed: workflow.status === 'completed',
      sections: visibleSections(depth),
      nextTaskId: nextTask(workflow),
      depth,
      saved,
      trash,
      memo,
      facility,
      phase,
    });
  function select(nextBranches) {
    const nodes = [...new Set([rootId, ...nextBranches.flatMap((id) => additions[id])])];
    const next = createWorkflow(
      definitions,
      nodes,
      edges.filter((edge) => nodes.includes(edge.from) && nodes.includes(edge.to)),
      workflow,
    );
    branches = nextBranches;
    workflow = next;
    return snapshot();
  }
  return Object.freeze({
    snapshot,
    addBranch(id) {
      assert(Object.hasOwn(additions, id), 'Unknown branch');
      return select([...new Set([...branches, id])]);
    },
    removeBranch(id) {
      assert(branches.includes(id), 'Unknown selected branch');
      return select(branches.filter((item) => item !== id));
    },
    setDepth(value) {
      depth = viewDepth(earnedLevel, value);
      return snapshot();
    },
    setStep(key, checked) {
      workflow = setStep(workflow, key, checked);
      return snapshot();
    },
    setMemo(value) {
      memo = text(value);
      return snapshot();
    },
    setContext(nextFacility, nextPhase) {
      assert(
        facilities.includes(nextFacility) && phases.includes(nextPhase),
        'Unknown context option',
      );
      facility = nextFacility;
      phase = nextPhase;
      return snapshot();
    },
    save() {
      saved = true;
      trash = false;
      return snapshot();
    },
    complete() {
      assert(saved, 'Save the workflow first');
      workflow = finishWorkflow(workflow);
      return snapshot();
    },
    reopen() {
      workflow = { ...workflow, status: 'active' };
      return snapshot();
    },
    remove() {
      assert(saved, 'No saved workflow');
      trash = true;
      return snapshot();
    },
    restore() {
      trash = false;
      return snapshot();
    },
  });
}
