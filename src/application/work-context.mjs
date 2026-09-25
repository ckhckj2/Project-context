import { projectFlows, designSectionLabels } from '../content/project-flows.mjs';
import { contextOptions } from '../content/execution-paths.mjs';

// Keep the previously saved airport value; only its display label is expanded.
export const projectContextOptions = {
  ...contextOptions,
  facility: [
    contextOptions.facility[0],
    ...projectFlows.map((project) => (project.id === 'airport' ? '공항시설' : project.label)),
    '기타 시설',
  ],
};

export function projectContext(facility, phase) {
  const project = projectFlows.find(
    (item) => item.label === facility || (facility === '공항시설' && item.id === 'airport'),
  );
  if (!project) return null;
  const phaseKey = phase === '계획설계' ? '기본계획' : phase;
  const labels = designSectionLabels[phaseKey] ?? [];
  return {
    ...project,
    sections: project.flow.map((title, index) => ({
      title,
      relevant: phase === '사전기획 / 사업검토' ? index === 0 : labels.includes(title),
    })),
  };
}

export function taskRelationships(state, taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return null;
  const following = state.workflow.edges
    .filter((edge) => edge.from === taskId && edge.kind === 'prerequisite')
    .map((edge) => edge.to);
  return [
    state.tasks.filter((item) => task.prerequisites.includes(item.id)),
    state.tasks.filter(
      (item) =>
        item.id !== taskId &&
        item.prerequisites.length > 0 &&
        item.prerequisites.length === task.prerequisites.length &&
        item.prerequisites.every((id) => task.prerequisites.includes(id)),
    ),
    state.tasks.filter((item) => following.includes(item.id)),
  ];
}
