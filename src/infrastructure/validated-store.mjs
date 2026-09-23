import { assert, record } from '../domain/validation.mjs';

/** Inject a Storage-like port; constructing this adapter never touches storage.
 * No legacy keys, automatic migration, reset, import or backup.
 * expectedRaw detects observed conflicts, not an atomic cross-tab transaction.
 */
export function createValidatedStore({ storage, key, validate, maxLength = 100000 }) {
  assert(
    typeof key === 'string' && /^cc_redesign_[a-z0-9_]+$/.test(key),
    'Only redesign storage keys are allowed',
  );
  assert(Number.isSafeInteger(maxLength) && maxLength > 0, 'Invalid storage size limit');
  assert(typeof validate === 'function', 'A schema validator is required');
  function decode(raw) {
    assert(raw.length <= maxLength, 'Oversized record');
    const envelope = JSON.parse(raw);
    record(envelope, ['schemaVersion', 'revision', 'data']);
    assert(envelope.schemaVersion === 1, 'Unsupported schema');
    assert(Number.isSafeInteger(envelope.revision) && envelope.revision >= 1, 'Invalid revision');
    validate(envelope.data);
    return envelope;
  }
  function read() {
    try {
      const raw = storage.getItem(key);
      if (raw === null) return { ok: true, raw: null, revision: 0, data: null };
      const envelope = decode(raw);
      return { ok: true, raw, revision: envelope.revision, data: structuredClone(envelope.data) };
    } catch {
      return { ok: false, reason: 'unreadable' };
    }
  }
  function write(data, expectedRaw) {
    const current = read();
    if (!current.ok) return current;
    if (current.raw !== expectedRaw) return { ok: false, reason: 'conflict' };
    let raw;
    try {
      // Validate exactly the representation that will be stored.
      raw = JSON.stringify({ schemaVersion: 1, revision: current.revision + 1, data });
      decode(raw);
    } catch {
      return { ok: false, reason: 'invalid' };
    }
    try {
      if (storage.getItem(key) !== expectedRaw) return { ok: false, reason: 'conflict' };
      storage.setItem(key, raw);
      if (storage.getItem(key) !== raw) return { ok: false, reason: 'conflict' };
      return { ok: true, raw, revision: current.revision + 1 };
    } catch {
      return { ok: false, reason: 'unavailable' };
    }
  }
  return Object.freeze({ read, write });
}
