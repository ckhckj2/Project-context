import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as acorn from 'acorn';
import { projectFlows } from '../../src/content/project-flows.mjs';
import { contextOptions } from '../../src/content/execution-paths.mjs';
import {
  projectContext,
  projectContextOptions,
  taskRelationships,
} from '../../src/application/work-context.mjs';
import { createExecutionSession } from '../../src/application/execution-session.mjs';

test('all 25 original facility flows and cautions are preserved verbatim', () => {
  const source = fs.readFileSync(new URL('../../v2_data.js', import.meta.url), 'utf8');
  const declaration = acorn
    .parse(source, { ecmaVersion: 'latest' })
    .body.find(
      (node) => node.type === 'VariableDeclaration' && node.declarations[0].id.name === 'PROJECTS',
    );
  const original = vm.runInNewContext(
    source.slice(declaration.start, declaration.end) + ';PROJECTS',
  );
  assert.deepEqual(projectFlows, JSON.parse(JSON.stringify(original)));
  assert.equal(projectFlows.length, 25);
  assert.equal(new Set(projectContextOptions.facility).size, 27);
});

test('unknown facilities and missing design sections never invent administrative location', () => {
  for (const value of ['잘 모르겠어요', '기타 시설', '<script>', null])
    assert.equal(projectContext(value, '실시설계'), null);
  for (const facility of projectContextOptions.facility) {
    const unset = projectContext(facility, '잘 모르겠어요');
    assert.equal(unset?.sections.some((section) => section.relevant) ?? false, false);
  }
  assert.equal(
    projectContext('지식산업센터', '실시설계').sections.some((item) => item.relevant),
    false,
  );
  const airport = projectContext('공항시설', '실시설계');
  assert.equal(airport.label, '공항시설 / 격납고');
  assert.deepEqual(
    airport.sections.filter((item) => item.relevant).map((item) => item.title),
    ['중간·실시설계'],
  );
  assert.deepEqual(projectContext('공항시설 / 격납고', '실시설계'), airport);
});

test('old and new facility records restore unchanged; context edits still require recheck confirmation', () => {
  for (const facility of new Set([...contextOptions.facility, ...projectContextOptions.facility])) {
    const session = createExecutionSession('drawing-revision');
    session.addBranch('report');
    session.applyContext({ facility, phase: '중간설계' });
    session.check('drawing-revision:prepare', true);
    session.setMemo('기존 메모 <b>유지</b>');
    const before = session.exportState();
    const restored = createExecutionSession('drawing-revision', undefined, before);
    assert.deepEqual(restored.exportState(), before);
    assert.throws(() => restored.applyContext({ facility, phase: '실시설계' }));
    assert.deepEqual(restored.exportState(), before);
    restored.applyContext({ facility, phase: '실시설계' }, true);
    assert.deepEqual(restored.exportState(), {
      ...before,
      context: { facility, phase: '실시설계' },
      checks: [],
    });
  }
});

test('relationships use selected dependencies only and browsing them does not mutate saved work', () => {
  const session = createExecutionSession('drawing-revision');
  assert.deepEqual(taskRelationships(session.snapshot(), 'drawing-revision'), [[], [], []]);
  session.addBranch('report');
  session.addBranch('send');
  session.check('drawing-revision:prepare', true);
  const before = session.exportState();
  const ids = (id) =>
    taskRelationships(session.snapshot(), id).map((group) => group.map((task) => task.id));
  assert.deepEqual(ids('report-update'), [
    ['drawing-revision'],
    ['consultant-send'],
    ['document-match'],
  ]);
  assert.deepEqual(ids('document-match'), [['drawing-revision', 'report-update'], [], []]);
  assert.deepEqual(session.exportState(), before);
  session.removeBranch('send', true);
  assert.deepEqual(ids('report-update')[1], []);
  assert.equal(taskRelationships(session.snapshot(), 'not-a-task'), null);
});
