import test from 'node:test';
import assert from 'node:assert/strict';
import { createValidatedStore } from '../../src/infrastructure/validated-store.mjs';
import { record, text } from '../../src/domain/validation.mjs';

const key = 'cc_redesign_test';
const validate = (data) => {
  record(data, ['memo']);
  text(data.memo);
};
function fixture(raw = null) {
  const values = new Map([['cc_projects_v1', 'legacy-preserved']]);
  if (raw !== null) values.set(key, raw);
  const storage = {
    getItem: (name) => values.get(name) ?? null,
    setItem: (name, value) => values.set(name, value),
  };
  return { values, storage, store: createValidatedStore({ storage, key, validate }) };
}
test('valid revisioned writes and observed conflicts preserve legacy values', () => {
  const { store, values } = fixture();
  const first = store.write({ memo: '검토 중' }, null);
  assert.equal(first.ok, true);
  assert.equal(first.revision, 1);
  assert.equal(store.read().data.memo, '검토 중');
  assert.deepEqual(store.write({ memo: 'stale' }, null), { ok: false, reason: 'conflict' });
  assert.equal(values.get('cc_projects_v1'), 'legacy-preserved');
});
test('corrupt, newer schema and prototype fields never overwrite the original', () => {
  const samples = [
    '{bad',
    '{"schemaVersion":2,"revision":1,"data":{"memo":"future"}}',
    '{"schemaVersion":1,"revision":1,"data":{"memo":"x","__proto__":{"polluted":true}}}',
    '{"schemaVersion":1,"revision":1,"data":{"memo":"x","unknown":"preserve"}}',
  ];
  for (const raw of samples) {
    const { store, values } = fixture(raw);
    assert.equal(store.read().ok, false);
    assert.equal(store.write({ memo: 'overwrite' }, raw).ok, false);
    assert.equal(values.get(key), raw);
  }
  assert.equal({}.polluted, undefined);
});
test('quota, blocked access, invalid data and oversized values do not report success', () => {
  const { store, storage, values } = fixture();
  assert.equal(store.write({ memo: 'a'.repeat(501) }, null).reason, 'invalid');
  assert.equal(store.write({ memo: 'x', constructor: 'bad' }, null).reason, 'invalid');
  storage.setItem = () => {
    throw new Error('QuotaExceededError');
  };
  assert.equal(store.write({ memo: 'ok' }, null).reason, 'unavailable');
  assert.equal(values.has(key), false);
  storage.getItem = () => {
    throw new Error('SecurityError');
  };
  assert.equal(store.read().reason, 'unreadable');
  assert.throws(() => createValidatedStore({ storage, key: 'cc_projects_v1', validate }));
});
