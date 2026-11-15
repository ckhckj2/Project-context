export function restorePetProject(id, host, document) {
  const store = host.CC_PROJECT_STORE;
  const state = store.read();
  if (!state.ok) return { ok: false };
  const project = state.items.find((item) => item.id === id);
  if (!project) return { ok: false };
  for (const [field, value] of [
    ['project', project.typeId],
    ['phase', project.phase],
  ]) {
    if (
      !Array.from(document.getElementById(field)?.options || []).some(
        (option) => option.value === value,
      )
    )
      return { ok: false };
  }
  const result = store.activate(id);
  if (!result.ok) return { ok: false };
  // Reuse the existing storage-change adapter to refresh forms and project labels.
  host.dispatchEvent(new host.StorageEvent('storage', { key: 'cc_active_project_v1' }));
  return { ok: true, phase: project.phase };
}
