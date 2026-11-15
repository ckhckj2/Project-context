import { test } from 'node:test';
import assert from 'node:assert/strict';
import { petRequest, restorePetProject } from '../../src/application/pet-entry.mjs';
const hash = (p) => '#pet=' + encodeURIComponent(JSON.stringify(p));
test('pet context validates fields without guessing tasks', () => {
  const p = { version: 1, projectId: 'p_한글', phase: '실시설계', taskId: 'drawing-revision' };
  assert.equal(petRequest(hash(p)).taskTitle, '도면 수정');
  for (const patch of [
    { version: 2 },
    { taskId: 'javascript:alert(1)' },
    { phase: 'unknown' },
    { projectId: 'x'.repeat(129) },
  ])
    assert.equal(petRequest(hash({ ...p, ...patch })).error, true);
  assert.equal(petRequest('#pet=%XX').error, true);
  assert.equal(petRequest('#/home'), null);
});

test('entry opens selected context, reports missing project and isolates general help', async () => {
  const fs = await import('node:fs');
  const vm = await import('node:vm');
  const source = fs.readFileSync('app/legacy-entry.mjs', 'utf8').replace(/^import .*;\n/gm, '');
  function run(payload, result = { ok: true, phase: '실시설계' }) {
    const calls = [],
      notes = [],
      fields = {
        project: { options: [{ value: 'office' }] },
        task: { options: [{ value: '도면 수정' }] },
        phase: { options: [{ value: '실시설계' }] },
      };
    const window = {
      StorageEvent: class {},
      dispatchEvent() {},
      CC_BOOT: { register: (_id, f) => f() },
      CC_RUNTIME: { registerSearch() {}, search: (q) => calls.push(['search', q]) },
      showView: (v) => calls.push(['view', v]),
      CC_PROJECTS_UI: {
        openFromPet: (id) => {
          calls.push(['project', id]);
          return result;
        },
      },
      CC_CONTEXT_RENDERER: { render: () => calls.push(['context']) },
    };
    vm.runInNewContext(
      source.replace('import.meta.url', "'https://cheokkcheokk.github.io/app/legacy-entry.mjs'"),
      {
        petRequest,
        restorePetProject: (id) => {
          calls.push(['project', id]);
          return result;
        },
        legacyRequest: () => null,
        URLSearchParams,
        location: { hash: hash(payload), search: '', pathname: '/' },
        history: { replaceState() {} },
        window,
        document: {
          createElement: () => ({ setAttribute() {} }),
          querySelector: () => ({ prepend: (n) => notes.push(n.textContent) }),
          getElementById: (id) => fields[id],
        },
      },
    );
    return { calls, notes, fields };
  }
  const p = { version: 1, projectId: 'p', phase: '기본계획', taskId: 'drawing-revision' };
  const ok = run(p);
  assert.ok(ok.calls.some((c) => c[0] === 'context'));
  assert.equal(ok.fields.phase.value, '실시설계');
  assert.ok(ok.notes[0].includes('최신'));
  const missing = run(p, { ok: false });
  assert.ok(!missing.calls.some((c) => c[0] === 'context'));
  assert.ok(missing.notes[0].includes('찾지 못했'));
  const general = run({ ...p, projectId: '', phase: 'general' });
  assert.ok(!general.calls.some((c) => c[0] === 'project'));
  assert.ok(general.calls.some((c) => c[0] === 'search'));
});

test('project restore preserves data on missing, unsupported and activation errors', () => {
  const project = { id: 'p', typeId: 'office', phase: '실시설계' };
  const store = { read: () => ({ ok: true, items: [project] }), activate: () => ({ ok: true }) };
  const open = (id) => restorePetProject(id, store, ['office'], ['실시설계']);
  assert.equal(open('p').phase, '실시설계');
  assert.equal(open('missing').ok, false);
  project.typeId = 'unknown';
  assert.equal(open('p').ok, false);
  project.typeId = 'office';
  store.activate = () => ({ ok: false });
  assert.equal(open('p').ok, false);
});
