import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { tasks } from '../../src/content/catalog.mjs';
import {
  categoryList,
  tasksInCategory,
  routeFromHash,
  searchTasks,
  findTask,
  legacyRequest,
  legacyDestination,
} from '../../src/application/task-navigation.mjs';

test('four navigation categories cover all 13 tasks with stable shared references', () => {
  const categories = categoryList();
  assert.equal(categories.length, 4);
  assert.deepEqual(
    [...new Set(categories.flatMap((group) => group.taskIds))].sort(),
    tasks.map((task) => task.id).sort(),
  );
  assert.ok(categories.every((group) => group.taskIds.length <= 5));
  assert.equal(categories.filter((group) => group.taskIds.includes('review-report')).length, 2);
  categories[0].taskIds.length = 0;
  assert.equal(tasksInCategory('design').length, 5, 'UI snapshots must not mutate catalog');
});

test('routes reject unknown IDs, script strings and encoded external destinations', () => {
  for (const task of tasks)
    assert.deepEqual(routeFromHash('#/task/' + task.id), { name: 'task', id: task.id });
  for (const hash of [
    '#/task/missing',
    '#/category/missing',
    '#/constructor',
    '#/help/nope',
    '#/task/<script>',
    '#/task/%2f%2fexample.com',
    '#/search/extra',
  ])
    assert.equal(routeFromHash(hash).name, 'not-found');
  assert.equal(legacyRequest('task', '__proto__'), null);
  assert.equal(legacyRequest('https://example.com', 'drawing-revision'), null);
  assert.throws(() => legacyDestination('task', 'unknown'));
});

test('catalog search handles Korean spacing/case but does not invent an intent match', () => {
  assert.equal(searchTasks(' 도면 수정 ')[0].id, 'drawing-revision');
  assert.equal(searchTasks('ＳＫＥＴＣＨＵＰ').length, 0, 'unregistered terms remain unmatched');
  assert.equal(searchTasks('PPT')[0].id, 'report-writing');
  assert.equal(searchTasks('스케치업')[0].id, 'modeling');
  assert.deepEqual(searchTasks('평면도 고쳐서 보고서에 반영하래'), []);
  assert.deepEqual(searchTasks('<img src=x onerror=alert(1)>'), []);
  assert.deepEqual(searchTasks('x'.repeat(101)), []);
});

test('first actions preserve existing common guidance instead of adding legal claims', () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(new URL('../../work-rules.js', import.meta.url), 'utf8'),
    context,
  );
  for (const task of tasks) {
    const source = context.window.CC_WORK_RULES.task.taskRule(task.title);
    assert.equal(findTask(task.id).guide.firstAction, source.steps[0]);
    assert.equal(findTask(task.id).guide.purpose, source.why);
    const detail = findTask(task.id).detail;
    assert.equal(detail.material, source.material);
    assert.equal(detail.owner, source.owner);
    assert.equal(detail.done, source.done);
    assert.deepEqual(
      detail.steps.map((step) => step.text),
      Array.from(source.steps),
    );
    detail.steps.length = 0;
    assert.equal(findTask(task.id).detail.steps.length, source.steps.length);
    assert.equal(legacyRequest('task', task.id).taskTitle, task.title);
  }
});
