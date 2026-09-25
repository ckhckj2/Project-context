import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectInstruction, createIntakeDraft } from '../../src/application/work-intake.mjs';
import { tasks } from '../../src/content/catalog.mjs';
import { routeFromHash } from '../../src/application/task-navigation.mjs';

test('instruction candidates support every task without confirming an inferred intent', () => {
  for (const task of tasks)
    assert.ok(
      inspectInstruction(task.title).candidates.some((item) => item.task.id === task.id),
      task.id,
    );
  const result = inspectInstruction('평면도 고쳐서 보고서에 반영하래');
  assert.deepEqual(result.candidates.map((item) => item.task.id).sort(), [
    'drawing-revision',
    'report-writing',
  ]);
  assert.equal(createIntakeDraft().selected, null);
  assert.equal(inspectInstruction('견적서 금액을 계산해줘').candidates.length, 0);
  assert.equal(inspectInstruction('회의자료 준비').candidates.length, 2);
});

test('only uniquely named context is prefilled; ambiguous or unknown conditions stay unknown', () => {
  assert.deepEqual(inspectInstruction('운수시설 중간설계 사례 조사').context, {
    facility: '운수시설',
    phase: '중간설계',
  });
  assert.equal(inspectInstruction('중간설계와 실시설계 도면').context.phase, '잘 모르겠어요');
  assert.equal(inspectInstruction('보고서 준비').context.facility, '잘 모르겠어요');
});

test('instruction bounds, full-width normalization and route validation remain safe', () => {
  for (const value of [null, {}, '', '   ', 'x'.repeat(301)])
    assert.equal(inspectInstruction(value).ok, false);
  assert.equal(inspectInstruction('ＰＰＴ 만들래').candidates[0].task.id, 'report-writing');
  assert.equal(inspectInstruction('<img src=x onerror=alert(1)>').candidates.length, 0);
  assert.deepEqual(routeFromHash('#/start'), { name: 'start' });
  assert.deepEqual(routeFromHash('#/start/private-instruction'), { name: 'not-found' });
});
