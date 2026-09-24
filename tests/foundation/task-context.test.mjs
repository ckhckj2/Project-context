import test from 'node:test';
import assert from 'node:assert/strict';
import { taskContext } from '../../src/content/task-context.mjs';
import { executionGuides } from '../../src/content/execution-guides.mjs';
import { relatedDefinitions } from '../../src/content/execution-paths.mjs';

test('every root and related task has explicit workflow context', () => {
  const ids = [...Object.keys(executionGuides), ...relatedDefinitions.map((item) => item.id)];
  assert.deepEqual(Object.keys(taskContext).sort(), ids.sort());
  for (const id of ids) {
    assert.equal(taskContext[id].length, 3, id);
    for (const description of taskContext[id]) assert.ok(description.trim().length > 0, id);
  }
});
