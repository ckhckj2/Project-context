import { element as el } from './elements.mjs';
import { taskContext } from '../content/task-context.mjs';
import { projectContext, taskRelationships } from '../application/work-context.mjs';

function projectMap(state) {
  const project = projectContext(state.context.facility, state.context.phase);
  const map = el('section', undefined, 'project-map');
  map.setAttribute('aria-label', '시설별 전체 흐름');
  if (!project) {
    map.append(
      el(
        'p',
        state.context.facility === '기타 시설'
          ? '기타 시설의 전체 절차는 프로젝트 담당자에게 확인해 주세요. 위 설계 단계와 아래 업무 관계는 계속 볼 수 있어요.'
          : '어떤 건물의 업무인가요? 단계·시설 설정에서 선택하면 시설별 전체 흐름을 볼 수 있어요.',
        'work-context-note',
      ),
    );
    return map;
  }
  map.append(el('h3', project.label + '의 전체 흐름', 'project-map-title'));
  const list = el('ol', undefined, 'project-map-steps');
  for (const [index, section] of project.sections.entries()) {
    const item = el('li', undefined, section.relevant ? 'is-relevant' : '');
    const number = el('span', String(index + 1).padStart(2, '0'), 'project-map-number');
    number.setAttribute('aria-hidden', 'true');
    const copy = el('div');
    copy.append(el('span', section.title));
    if (section.relevant) copy.append(el('small', '선택한 단계의 참고 구간'));
    item.append(number, copy);
    list.append(item);
  }
  map.append(list);
  if (
    state.context.phase !== state.options.phase[0] &&
    !project.sections.some((item) => item.relevant)
  )
    map.append(
      el(
        'p',
        '선택한 설계 단계가 이 요약 흐름에 따로 표시되어 있지 않아요. 인허가 위치로 대신 표시하지 않아요.',
        'project-map-unmapped',
      ),
    );
  map.append(
    el('p', project.caution, 'project-map-caution'),
    el(
      'p',
      '읽는 지도예요. 순서는 겹치거나 반복될 수 있고, 진한 표시는 완료·승인 상태가 아닌 설계 단계의 참고 구간이에요.',
      'work-context-note',
    ),
  );
  return map;
}

export function workContext(state, taskId, editContext, openTask, overview) {
  const task = state.tasks.find((item) => item.id === taskId);
  const panel = el('section', undefined, 'work-context-map');
  panel.setAttribute('aria-label', '현재 업무의 맥락');
  const header = el('div', undefined, 'work-context-header');
  const summary = el('div', undefined, 'work-context-summary');
  const known = state.context.phase !== state.options.phase[0];
  const position = el('strong');
  position.append(
    el(
      'span',
      (state.context.facility === state.options.facility[0]
        ? '시설 미설정'
        : state.context.facility) + ' · ',
    ),
    el('span', known ? state.context.phase : '단계 미설정', 'work-phase-status'),
  );
  summary.append(el('span', '프로젝트 위치', 'work-section-label'), position);
  header.append(summary);
  const edit = el('button', '단계·시설 설정', 'work-secondary cc-control');
  edit.type = 'button';
  edit.addEventListener('click', editContext);
  header.append(edit);
  panel.append(header);
  const phases = el('ol', undefined, 'work-phases');
  phases.setAttribute('aria-label', '설계 과정과 현재 단계');
  for (const name of state.options.phase.slice(1)) {
    const phase = el('li', name);
    if (name === state.context.phase) phase.setAttribute('aria-current', 'step');
    phases.append(phase);
  }
  const processDetails = el('details', undefined, 'work-process work-fold');
  processDetails.append(el('summary', '시설 전체 과정과 설계 단계 보기'));
  processDetails.open = overview.open;
  processDetails.addEventListener('toggle', () => overview.onToggle(processDetails.open));
  processDetails.append(phases);
  if (!known)
    processDetails.append(
      el(
        'p',
        '아직 단계를 모르면 그대로 진행해도 돼요. 업무명만으로 현재 위치를 추정하지 않아요.',
        'work-context-note',
      ),
    );
  processDetails.append(projectMap(state));
  const current = el('div', undefined, 'work-context-current');
  current.append(
    el('p', '이 업무의 목적', 'work-section-label'),
    el('p', task.purpose, 'work-context-purpose'),
  );
  if (task.phaseGuide) current.append(el('p', task.phaseGuide.note, 'work-phase-guide'));
  panel.append(current);
  const support = el('section', undefined, 'work-context-support');
  support.append(
    el('h2', '이 일의 앞뒤 맥락', 'cc-title'),
    el('p', '지금 보는 업무 · ' + task.title, 'work-section-label'),
  );
  const relations = el('div', undefined, 'work-context-relations');
  const summaries = taskContext[task.id];
  const linked = taskRelationships(state, task.id);
  for (const [index, label] of ['이전에 확인', '함께 맞출 일', '다음에 활용'].entries()) {
    const column = el('section');
    column.append(
      el('span', ['BEFORE', 'WITH', 'AFTER'][index], 'work-relation-order'),
      el('h3', label),
      el('p', summaries[index], 'work-relation-title'),
    );
    if (linked[index].length) {
      column.append(el('p', '내 흐름에 연결된 업무', 'work-context-note'));
      for (const item of linked[index]) {
        const action = el('button', undefined, 'work-relation-link cc-control');
        action.type = 'button';
        action.dataset.contextTask = item.id;
        action.append(el('strong', item.title), el('span', '실행 항목 열기 →'));
        action.addEventListener('click', () => openTask(item.id));
        column.append(action);
      }
    }
    relations.append(column);
  }
  support.append(
    relations,
    el(
      'p',
      '일반적인 업무 관계예요. 연결 버튼이 있는 업무만 내 흐름에 추가된 항목이에요.',
      'work-context-note',
    ),
  );
  support.append(processDetails);
  panel.append(support);
  return panel;
}
