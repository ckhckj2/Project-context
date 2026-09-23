import { createReadingProfile } from './reading-profile.mjs';
import { executionGuides, phaseGuides, changePhaseGuides } from '../content/execution-guides.mjs';
import {
  relatedDefinitions,
  drawingBranches,
  drawingEdges,
  contextOptions,
  essentialNotice,
} from '../content/execution-paths.mjs';
import { createWorkflow, setStep, finishWorkflow, nextTask } from '../domain/workflow.mjs';
import { assert, record, text } from '../domain/validation.mjs';

export function createExecutionSession(
  rootId,
  readingProfile = createReadingProfile(),
  initial = null,
) {
  assert(Object.hasOwn(executionGuides, rootId), 'Unknown task');
  const definitions = [executionGuides[rootId], ...relatedDefinitions];
  const branches = rootId === 'drawing-revision' ? drawingBranches : {};
  const definition = (id) => definitions.find((item) => item.id === id);
  const graphDefinitions = definitions.map((item) => ({
    id: item.id,
    steps: item.steps.map((step) => step.id),
  }));
  let selected = [],
    context = { facility: contextOptions.facility[0], phase: contextOptions.phase[0] },
    memo = '';
  let workflow = createWorkflow(graphDefinitions, [rootId], []);
  const done = (id) =>
    workflow.stepKeys
      .filter((key) => key.startsWith(id + ':'))
      .every((key) => workflow.checks.includes(key));
  const prerequisites = (id) =>
    workflow.edges
      .filter((edge) => edge.to === id && edge.kind === 'prerequisite')
      .map((edge) => edge.from);
  function recheckImpact(key) {
    assert(workflow.stepKeys.includes(key), 'Unknown step');
    const id = key.split(':')[0],
      affected = new Set([id]);
    for (let i = 0; i < workflow.nodes.length; i++)
      for (const edge of workflow.edges)
        if (edge.kind === 'prerequisite' && affected.has(edge.from)) affected.add(edge.to);
    return {
      taskIds: [...affected].filter((value) => value !== id),
      checkKeys: workflow.checks.filter(
        (value) =>
          value === key || (value.split(':')[0] !== id && affected.has(value.split(':')[0])),
      ),
    };
  }
  function snapshot() {
    return structuredClone({
      rootId,
      context,
      memo,
      workflow,
      nextTaskId: nextTask(workflow),
      essentialNotice,
      options: contextOptions,
      tasks: workflow.nodes.map((id) => ({
        ...definition(id),
        reading: readingProfile.forTask(id),
        phaseGuide:
          (id === 'change-review' ? changePhaseGuides : phaseGuides)[context.phase] ?? null,
        checked: done(id),
        blocked: !prerequisites(id).every(done),
        prerequisites: prerequisites(id),
      })),
      branches: Object.entries(branches).map(([id, branch]) => ({
        id,
        ...branch,
        selected: selected.includes(id),
      })),
    });
  }
  function selection(next) {
    const included = new Set([rootId, ...next.flatMap((id) => branches[id].nodes)]);
    const nodes = definitions.filter((item) => included.has(item.id)).map((item) => item.id);
    return createWorkflow(
      graphDefinitions,
      nodes,
      drawingEdges.filter((edge) => nodes.includes(edge.from) && nodes.includes(edge.to)),
      workflow,
    );
  }
  function removal(id) {
    assert(selected.includes(id), 'Unknown selected branch');
    const next = selection(selected.filter((value) => value !== id));
    return {
      taskIds: workflow.nodes.filter((value) => !next.nodes.includes(value)),
      checkKeys: workflow.checks.filter((value) => !next.stepKeys.includes(value)),
    };
  }
  function validateContext(value) {
    record(value, ['facility', 'phase']);
    assert(
      contextOptions.facility.includes(value.facility) &&
        contextOptions.phase.includes(value.phase),
      'Unknown context',
    );
  }
  function contextImpact(value) {
    validateContext(value);
    const changed = value.facility !== context.facility || value.phase !== context.phase;
    return {
      changed,
      checkKeys: changed ? [...workflow.checks] : [],
      taskIds: changed ? [...workflow.nodes] : [],
    };
  }
  if (initial !== null) {
    record(initial, ['rootId', 'selected', 'context', 'memo', 'checks', 'status']);
    assert(initial.rootId === rootId, 'Root mismatch');
    validateContext(initial.context);
    text(initial.memo);
    assert(
      Array.isArray(initial.selected) &&
        initial.selected.length <= Object.keys(branches).length &&
        new Set(initial.selected).size === initial.selected.length,
      'Invalid branches',
    );
    initial.selected.forEach((id) => assert(Object.hasOwn(branches, id), 'Unknown branch'));
    workflow = selection(initial.selected);
    assert(
      Array.isArray(initial.checks) &&
        initial.checks.length <= workflow.stepKeys.length &&
        new Set(initial.checks).size === initial.checks.length,
      'Invalid checks',
    );
    initial.checks.forEach((key) => assert(workflow.stepKeys.includes(key), 'Unknown check'));
    workflow.checks = [...initial.checks];
    for (const id of workflow.nodes) {
      if (workflow.checks.some((key) => key.startsWith(id + ':')))
        assert(prerequisites(id).every(done), 'Unchecked prerequisite');
    }
    assert(['active', 'completed'].includes(initial.status), 'Invalid status');
    if (initial.status === 'completed') workflow = finishWorkflow(workflow);
    selected = [...initial.selected];
    context = { ...initial.context };
    memo = initial.memo;
  }
  return Object.freeze({
    exportState: () =>
      structuredClone({
        rootId,
        selected,
        context,
        memo,
        checks: workflow.checks,
        status: workflow.status,
      }),
    snapshot,
    setReadingDepth(taskId, depth) {
      assert(workflow.nodes.includes(taskId), 'Task is not selected');
      readingProfile.setDepth(taskId, depth);
      return snapshot();
    },
    addBranch(id) {
      assert(Object.hasOwn(branches, id), 'Unknown branch');
      const next = [...new Set([...selected, id])];
      if (next.length === selected.length) return snapshot();
      workflow = selection(next);
      selected = next;
      return snapshot();
    },
    removalImpact(id) {
      return structuredClone(removal(id));
    },
    removeBranch(id, confirmed = false) {
      removal(id);
      assert(confirmed === true, 'Confirm branch removal');
      const next = selected.filter((value) => value !== id);
      workflow = selection(next);
      selected = next;
      return snapshot();
    },
    contextImpact,
    recheckImpact,
    applyContext(value, confirmed = false) {
      const impact = contextImpact(value);
      assert(
        !impact.changed || !workflow.checks.length || confirmed === true,
        'Confirm rechecking',
      );
      if (impact.changed) {
        workflow = { ...workflow, checks: [], status: 'active' };
        context = { ...value };
      }
      return snapshot();
    },
    check(key, checked) {
      assert(workflow.stepKeys.includes(key), 'Unknown step');
      const id = key.split(':')[0];
      assert(!checked || prerequisites(id).every(done), 'Complete prerequisites first');
      let next = setStep(workflow, key, checked);
      // Reopening an upstream action invalidates dependent confirmations, never sibling work.
      if (!checked) {
        const impact = recheckImpact(key);
        next = {
          ...next,
          checks: next.checks.filter((value) => !impact.checkKeys.includes(value)),
        };
      }
      workflow = next;
      return snapshot();
    },
    setMemo(value) {
      memo = text(value);
      return snapshot();
    },
    complete() {
      workflow = finishWorkflow(workflow);
      return snapshot();
    },
    reopen() {
      workflow = { ...workflow, status: 'active' };
      return snapshot();
    },
  });
}
