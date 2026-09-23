import { element as el } from './elements.mjs';

function group(title, ...content) {
  const body = el('section', undefined, 'reading-section');
  body.append(el('h3', title, 'cc-title'), ...content);
  return body;
}
function list(values) {
  const ul = el('ul', undefined, 'work-list');
  for (const value of values) ul.append(el('li', value));
  return ul;
}
export function readingContent(task, state) {
  const body = el('div', undefined, 'work-explanation'),
    sections = task.reading.sections;
  const groups = [group('이 일을 하는 이유', el('p', task.purpose))];
  if (sections.method) groups.push(group('준비할 자료', el('p', task.material)));
  if (sections.connections)
    groups.push(
      group('확인할 사람', el('p', task.owner)),
      group(
        '연결된 업무',
        list(
          task.prerequisites.length
            ? task.prerequisites.map(
                (id) => state.tasks.find((item) => item.id === id).title + ' 확인 후 진행',
              )
            : ['현재 업무에는 선택된 선행 업무가 없어요.'],
        ),
      ),
    );
  if (sections.exceptions) {
    groups.push(
      group(
        '현재 조건',
        el('p', state.context.facility + ' · ' + state.context.phase),
        el('p', '건물 종류만으로 승인 절차를 정하지 않아요. 실제 승인서·책임자 확인이 필요합니다.'),
      ),
    );
    if (task.phaseGuide)
      groups.push(
        group(
          state.context.phase + '에서 판단하기',
          el('p', task.phaseGuide.note),
          list(task.phaseGuide.steps),
          el('p', task.phaseGuide.done),
        ),
      );
    else
      groups.push(
        group(
          '아직 정하지 않은 조건',
          el('p', '설계 단계를 모르면 현재 과업과 기준 자료를 요청자에게 먼저 확인하세요.'),
        ),
      );
  }
  const current = el('div');
  current.append(groups[0]);
  if (groups.length > 1) {
    const label = el('label', '살펴볼 내용');
    const select = el('select', undefined, 'reading-topic');
    for (const [index, item] of groups.entries()) {
      const option = el('option', item.querySelector('h3').textContent);
      option.value = String(index);
      select.append(option);
    }
    select.addEventListener('change', () => {
      const item = groups[Number(select.value)];
      if (item) current.replaceChildren(item);
    });
    label.append(select);
    body.append(label);
  }
  body.append(current);
  body.append(
    el(
      'p',
      '기존 척척 업무 안내를 바탕으로 합니다. 최신 공식 문서와 책임자에게 적용 여부를 확인하세요.',
      'context-note',
    ),
  );
  return body;
}
// Overview intentionally summarizes state only; it does not expose another track's gated body.
export function coordinationOverview(state) {
  const body = el('div', undefined, 'reading-overview');
  body.append(
    el(
      'p',
      '선행 항목을 확인한 업무부터 진행하세요. 병행 가지는 각각 확인하며, 체크는 승인이나 학습 성취가 아닙니다.',
    ),
  );
  for (const task of state.tasks)
    body.append(
      group(
        task.title,
        el('p', task.checked ? '항목 확인됨' : task.blocked ? '선행 업무 대기' : '진행 가능'),
        el(
          'p',
          task.prerequisites.length
            ? '선행: ' +
                task.prerequisites
                  .map((id) => state.tasks.find((item) => item.id === id).title)
                  .join(' · ')
            : '선택된 선행 업무 없음',
        ),
      ),
    );
  return body;
}
