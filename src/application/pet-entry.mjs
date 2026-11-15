import { findTask } from './task-navigation.mjs';

const phases = [
  '사전기획 / 사업검토',
  '기본계획',
  '계획설계',
  '중간설계',
  '실시설계',
  '시공·현장 대응',
  'general',
];
export function petRequest(hash) {
  if (!hash.startsWith('#pet=')) return null;
  try {
    if (hash.length > 2000) throw new Error();
    const value = JSON.parse(decodeURIComponent(hash.slice(5)));
    if (
      value.version !== 1 ||
      typeof value.projectId !== 'string' ||
      value.projectId.length > 128 ||
      !phases.includes(value.phase)
    )
      throw new Error();
    const task = value.taskId === '' ? null : findTask(value.taskId);
    if (value.taskId !== '' && !task) throw new Error();
    if (!['', '용어', '업무 순서', '자료 찾기'].includes(value.general || '')) throw new Error();
    return {
      projectId: value.projectId,
      phase: value.phase,
      taskTitle: task?.title || '',
      general: value.general || '',
    };
  } catch {
    return { error: true };
  }
}

export function restorePetProject(id, store, allowedTypes, allowedPhases) {
  const state = store.read();
  if (!state.ok) return { ok: false };
  const project = state.items.find((item) => item.id === id);
  if (!project || !allowedTypes.includes(project.typeId) || !allowedPhases.includes(project.phase))
    return { ok: false };
  if (!store.activate(id).ok) return { ok: false };
  return { ok: true, phase: project.phase };
}
