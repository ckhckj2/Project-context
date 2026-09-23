import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { tasks } from '../../src/content/catalog.mjs';
import { createExecutionSession } from '../../src/application/execution-session.mjs';
import { routeFromHash } from '../../src/application/task-navigation.mjs';
const checkTask = (session, id) => {
  for (const key of session.snapshot().workflow.stepKeys.filter((key) => key.startsWith(id + ':')))
    session.check(key, true);
};

test('all 13 execution guides preserve original task and phase rules, including change exceptions', () => {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(new URL('../../work-rules.js', import.meta.url), 'utf8'),
    sandbox,
  );
  for (const task of tasks) {
    assert.equal(routeFromHash('#/flow/' + task.id).name, 'flow');
    const session = createExecutionSession(task.id),
      source = sandbox.window.CC_WORK_RULES.task.taskRule(task.title),
      guide = session.snapshot().tasks[0];
    assert.deepEqual(
      guide.steps.map((step) => step.text),
      Array.from(source.steps),
    );
    assert.equal(guide.done, source.done);
    assert.equal(guide.material, source.material);
    assert.equal(guide.owner, source.owner);
    assert.equal(guide.purpose, source.why);
    for (const phase of sandbox.window.CC_WORK_RULES.phase.PHASE_ORDER) {
      session.applyContext({ facility: '잘 모르겠어요', phase });
      const result = session.snapshot().tasks[0].phaseGuide,
        expected = sandbox.window.CC_WORK_RULES.phase.phaseRule(task.title, phase);
      assert.deepEqual(result.steps, Array.from(expected.howSteps));
      assert.equal(result.done, expected.doneText);
      assert.equal(result.risk, expected.risk);
    }
    checkTask(session, task.id);
    assert.equal(session.snapshot().workflow.status, 'active');
    session.complete();
    assert.equal(session.snapshot().workflow.status, 'completed');
    session.reopen();
    assert.equal(session.snapshot().workflow.status, 'active');
  }
});
test('branches enforce prerequisites, converge once, and preserve sibling records on recheck/removal', () => {
  const session = createExecutionSession('drawing-revision');
  session.addBranch('report');
  session.addBranch('send');
  session.addBranch('report');
  assert.equal(session.snapshot().tasks.length, 4);
  assert.throws(() => session.check('report-update:pages', true));
  assert.throws(() => session.complete());
  checkTask(session, 'drawing-revision');
  checkTask(session, 'report-update');
  checkTask(session, 'consultant-send');
  checkTask(session, 'document-match');
  session.setMemo('공통 메모');
  const impact = session.recheckImpact('report-update:pages');
  assert.deepEqual(impact.taskIds, ['document-match']);
  session.check('report-update:pages', false);
  assert.ok(session.snapshot().workflow.checks.includes('consultant-send:reply'));
  assert.ok(!session.snapshot().workflow.checks.includes('document-match:values'));
  const before = session.snapshot();
  assert.throws(() => session.removeBranch('report'));
  assert.deepEqual(session.snapshot(), before);
  assert.deepEqual(session.removalImpact('report').taskIds, ['report-update', 'document-match']);
  session.removeBranch('report', true);
  assert.ok(session.snapshot().workflow.checks.includes('consultant-send:reply'));
  assert.equal(session.snapshot().memo, '공통 메모');
  session.addBranch('report');
  assert.ok(!session.snapshot().workflow.checks.includes('report-update:compare'));
  session.check('drawing-revision:prepare', false);
  assert.ok(!session.snapshot().workflow.checks.includes('consultant-send:reply'));
});
test('context drafts are isolated; changed conditions require explicit confirmation and unknown remains unknown', () => {
  const session = createExecutionSession('drawing-revision');
  checkTask(session, 'drawing-revision');
  session.setMemo('keep');
  session.complete();
  const before = session.snapshot(),
    draft = { facility: '공항시설', phase: '실시설계' };
  assert.equal(session.contextImpact(draft).checkKeys.length, 3);
  assert.deepEqual(session.snapshot(), before);
  assert.throws(() => session.applyContext(draft));
  assert.deepEqual(session.snapshot(), before);
  session.applyContext(draft, true);
  draft.phase = 'bad';
  assert.equal(session.snapshot().context.phase, '실시설계');
  assert.equal(session.snapshot().workflow.checks.length, 0);
  assert.equal(session.snapshot().memo, 'keep');
  assert.equal(session.snapshot().workflow.status, 'active');
  session.applyContext({ facility: '잘 모르겠어요', phase: '잘 모르겠어요' });
  assert.equal(session.snapshot().tasks[0].phaseGuide, null);
  session.snapshot().tasks[0].steps.length = 0;
  assert.equal(session.snapshot().tasks[0].steps.length, 3);
});
test('invalid commands fail without mutating state; separate roots and legacy data stay independent', () => {
  for (const id of ['__proto__', 'unknown', '<script>'])
    assert.throws(() => createExecutionSession(id));
  assert.equal(routeFromHash('#/flow/__proto__').name, 'not-found');
  assert.equal(routeFromHash('#/flow/unknown').name, 'not-found');
  const session = createExecutionSession('modeling'),
    before = session.snapshot();
  for (const action of [
    () => session.addBranch('__proto__'),
    () => session.addBranch('report'),
    () => session.check('modeling:prepare', 'yes'),
    () => session.check('bad', true),
    () => session.setMemo('x'.repeat(501)),
    () => session.setMemo('\u0000'),
    () => session.applyContext({ facility: '공항시설', phase: 'invalid' }),
    () => session.applyContext({ facility: '공항시설', phase: '실시설계', approval: 'airport' }),
  ]) {
    assert.throws(action);
    assert.deepEqual(session.snapshot(), before);
  }
  session.setMemo('<img src=x onerror=alert(1)>');
  assert.equal(createExecutionSession('drawing-revision').snapshot().memo, '');
  checkTask(session, 'modeling');
  const ready = session.snapshot();
  session.applyContext(ready.context);
  assert.deepEqual(session.snapshot(), ready);
});
