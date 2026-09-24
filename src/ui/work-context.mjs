import { element as el } from './elements.mjs';
import { taskContext } from '../content/task-context.mjs';

// Present existing guidance and selected graph edges without inventing project status.
export function workContext(state, taskId, editContext) {
  const task = state.tasks.find((item) => item.id === taskId);
  const panel = el('section', undefined, 'work-context-map');
  panel.setAttribute('aria-label', '현재 업무의 맥락');
  const header = el('div', undefined, 'work-context-header');
  header.append(el('h2', '전체 과정 속 내 업무', 'cc-title'));
  const edit = el('button', '단계·시설 설정', 'text-button');
  edit.type = 'button';
  edit.addEventListener('click', editContext);
  header.append(edit);
  panel.append(header);
  const known = state.context.phase !== state.options.phase[0];
  panel.append(
    el(
      'p',
      known ? '현재 단계 · ' + state.context.phase : '현재 단계 · 미설정',
      'work-phase-status',
    ),
  );
  const phases = el('ul', undefined, 'work-phases');
  phases.setAttribute('aria-label', '설계 과정과 현재 단계');
  for (const name of state.options.phase.slice(1)) {
    const phase = el('li', name);
    if (name === state.context.phase) phase.setAttribute('aria-current', 'step');
    phases.append(phase);
  }
  panel.append(phases);
  panel.append(
    el(
      'p',
      known
        ? '선택한 단계 기준의 안내예요. 프로젝트별 절차는 겹치거나 반복될 수 있어요.'
        : '단계를 선택하면 현재 위치와 단계별 관점을 보여드려요. 업무명만으로 단계를 추정하지 않아요.',
      'work-context-note',
    ),
  );
  if (state.context.facility !== state.options.facility[0])
    panel.append(el('p', '시설 · ' + state.context.facility, 'work-context-note'));
  panel.append(el('h3', '보고 있는 업무 · ' + task.title, 'work-context-task'));
  panel.append(el('p', task.purpose, 'work-context-purpose'));
  if (task.phaseGuide) panel.append(el('p', task.phaseGuide.note, 'work-phase-guide'));
  const title = (id) => state.tasks.find((item) => item.id === id)?.title ?? id;
  const following = state.workflow.edges
    .filter((edge) => edge.from === task.id)
    .map((edge) => edge.to);
  const parallel = state.tasks.filter(
    (item) =>
      item.id !== task.id &&
      item.prerequisites.length &&
      item.prerequisites.length === task.prerequisites.length &&
      item.prerequisites.every((id) => task.prerequisites.includes(id)),
  );
  const relations = el('div', undefined, 'work-context-relations');
  const summaries = taskContext[task.id];
  let index = 0;
  for (const [label, text, linked] of [
    ['선행 업무', task.material, task.prerequisites.map(title)],
    ['병행·관련 업무', task.owner, parallel.map((item) => item.title)],
    ['후속 업무', task.done, following.map(title)],
  ]) {
    const column = el('section');
    column.append(
      el('h3', label),
      el('strong', summaries[index++], 'work-relation-title'),
      el('p', text),
    );
    if (linked.length)
      column.append(el('p', '연결된 업무 · ' + linked.join(' · '), 'work-context-linked'));
    relations.append(column);
  }
  panel.append(relations);
  panel.append(
    el(
      'p',
      '일반 업무 안내입니다. 실제 요청 사유와 인계 대상은 프로젝트 담당자에게 확인하세요.',
      'work-context-note',
    ),
  );
  return panel;
}
