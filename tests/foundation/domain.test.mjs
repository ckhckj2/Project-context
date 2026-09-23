import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateGraph, createWorkflow, setStep, nextTask } from '../../src/domain/workflow.mjs';
import { viewDepth, visibleSections } from '../../src/domain/learning.mjs';
import { createWorkSession } from '../../src/application/work-session.mjs';
import { tasks, tracks } from '../../src/content/catalog.mjs';
import { configuration } from '../../docs/redesign/preview/content.mjs';

test('all existing task titles have unique stable IDs and a known track', () => {
  const inventory = JSON.parse(
    fs.readFileSync(new URL('../../docs/redesign/source-inventory.json', import.meta.url)),
  );
  assert.deepEqual(tasks.map((task) => task.title).sort(), inventory.tasks.sort());
  assert.equal(new Set(tasks.map((task) => task.id)).size, 13);
  assert.equal(tracks.length, 3);
  assert.ok(tasks.every((task) => tracks.some((track) => track.id === task.trackId)));
});

test('branching, merging and parallel relation semantics; malformed graphs rejected', () => {
  const edge = (from, to, kind = 'prerequisite') => ({ from, to, kind });
  const nodes = ['root', 'left', 'right', 'join'];
  const edges = [
    edge('root', 'left'),
    edge('root', 'right'),
    edge('left', 'join'),
    edge('right', 'join'),
  ];
  validateGraph(nodes, edges);
  validateGraph(
    ['left', 'right'],
    [edge('left', 'right', 'parallel-related'), edge('right', 'left', 'parallel-related')],
  );
  for (const bad of [
    [...edges, edge('join', 'root')],
    [edge('left', 'missing')],
    [edge('root', 'root')],
    [edges[0], edges[0]],
    [{ ...edges[0], hidden: true }],
  ])
    assert.throws(() => validateGraph(nodes, bad));
  const definitions = nodes.map((id) => ({ id, steps: ['check'] }));
  let work = createWorkflow(definitions, nodes, edges);
  const original = structuredClone(work);
  work = setStep(work, 'root:check', true);
  work = setStep(work, 'left:check', true);
  assert.equal(nextTask(work), 'right', 'join cannot skip the right prerequisite');
  work = setStep(work, 'right:check', true);
  assert.equal(nextTask(work), 'join');
  assert.deepEqual(original.checks, [], 'commands do not mutate inputs');
});

test('view depth never grants achievement or hides essential notices', () => {
  assert.equal(viewDepth(5, 1), 1);
  assert.throws(() => viewDepth(2, 3));
  for (const invalid of [0, 6, '3', NaN]) assert.throws(() => viewDepth(5, invalid));
  for (let depth = 1; depth <= 5; depth++)
    assert.equal(visibleSections(depth).essentialNotices, true);
});

test('session preserves unrelated work, needs explicit completion and protects ownership', () => {
  const session = createWorkSession(configuration);
  session.addBranch('report');
  session.addBranch('send');
  session.save();
  session.setStep('drawing:request', true);
  session.setStep('send:recipient', true);
  session.setStep('report:pages', true);
  session.setMemo('협의 대기');
  const before = session.snapshot();
  session.setDepth(5);
  session.setDepth(1);
  assert.deepEqual(session.snapshot().checks, before.checks);
  assert.throws(() => session.complete());
  const after = session.removeBranch('report');
  assert.ok(after.checks.includes('send:recipient'));
  assert.ok(!after.workflow.nodes.includes('check'));
  assert.ok(!after.checks.includes('report:pages'));
  assert.equal(after.memo, '협의 대기');
  assert.throws(() => session.addBranch('__proto__'));
  assert.throws(() => session.setContext('tampered', 'unknown'));
  const copy = session.snapshot();
  copy.workflow.nodes.push('intruder');
  copy.checks.push('intruder:check');
  assert.ok(!session.snapshot().workflow.nodes.includes('intruder'));
  for (const key of session.snapshot().workflow.stepKeys) session.setStep(key, true);
  assert.equal(session.snapshot().completed, false, 'checks alone never complete a task');
  session.complete();
  assert.equal(session.snapshot().completed, true);
  session.remove();
  session.restore();
  assert.equal(session.snapshot().completed, true);
  session.reopen();
  assert.equal(session.snapshot().completed, false);
});
