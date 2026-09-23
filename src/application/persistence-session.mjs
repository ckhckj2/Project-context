// Store and exclusive-lock ports are supplied by the composition root.
// A conflict stops writes; stale in-memory state never merges over another tab.
export function createPersistenceSession({ store, exclusive, initial, report = () => {} }) {
  let raw = initial.ok ? initial.raw : null;
  let status = initial.ok ? (raw === null ? 'ready' : 'saved') : 'unreadable';
  let pending = null,
    running = null,
    suspended = !initial.ok;
  const announce = () => report(status);
  async function drain() {
    while (pending !== null && !suspended) {
      const value = pending;
      pending = null;
      status = 'saving';
      announce();
      let result;
      try {
        result = await exclusive(() =>
          suspended ? { ok: false, reason: 'conflict' } : store.write(value, raw),
        );
      } catch {
        result = { ok: false, reason: 'unavailable' };
      }
      if (!result.ok) {
        pending ??= value;
        status = result.reason;
        suspended = true;
        announce();
        return;
      }
      raw = result.raw;
      status = suspended ? 'conflict' : 'saved';
      announce();
    }
  }
  function flush() {
    if (!running && !suspended && pending !== null)
      running = drain().finally(() => {
        running = null;
        if (pending !== null && !suspended) flush();
      });
    return running ?? Promise.resolve();
  }
  return Object.freeze({
    status: () => status,
    hasPending: () => pending !== null || running !== null,
    changed(value) {
      pending = structuredClone(value);
      return flush();
    },
    retry() {
      if (status === 'unavailable') {
        suspended = false;
        return flush();
      }
      return Promise.resolve();
    },
    externalChange(value) {
      if (value !== raw) {
        suspended = true;
        status = 'conflict';
        announce();
      }
    },
    settled: async () => {
      while (running) await running;
    },
  });
}
