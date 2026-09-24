import { readingContent, coordinationOverview } from './reading-content.mjs';
import { element as el, navigationLink as link } from './elements.mjs';
import { createDialog } from './dialog.mjs';
import { workContext } from './work-context.mjs';
import { taskPreparation, taskSequence } from './task-guide.mjs';

export function mountExecutionDialog() {
  return createDialog({
    dialog: document.querySelector('#workDialog'),
    title: document.querySelector('#workTitle'),
    body: document.querySelector('#workBody'),
    closeButton: document.querySelector('#workClose'),
    fallbackFocus: () => document.querySelector('main h1'),
  });
}
function button(label, action, className = 'work-secondary') {
  const node = el('button', label, className + ' cc-control');
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}
function fold(title, ...children) {
  const node = el('details', undefined, 'work-fold');
  node.append(el('summary', title), ...children);
  return node;
}
function lines(values) {
  const list = el('ul', undefined, 'work-list');
  for (const value of values) list.append(el('li', value));
  return list;
}

export function renderExecution(
  root,
  session,
  dialog,
  reviewDestination = null,
  persistence = null,
) {
  let activeId = session.snapshot().nextTaskId ?? session.snapshot().rootId;
  let detailOpen = false;
  let optionsOpen = false;
  const mobile = () => matchMedia('(max-width: 800px)').matches;
  const titleOf = (id) => session.snapshot().tasks.find((task) => task.id === id)?.title ?? id;
  function message(text) {
    const body = el('div');
    body.append(el('p', text));
    dialog.open('확인이 필요해요', body);
  }
  function act(command, focusKey) {
    try {
      command();
      paint();
      if (detailOpen && mobile()) showDetail(activeId);
      if (focusKey) {
        const target =
          detailOpen && mobile()
            ? document.querySelector(`#workBody [data-step="${focusKey}"]`)
            : root.querySelector(`[data-step="${focusKey}"]`);
        const scope =
          detailOpen && mobile()
            ? document.querySelector('#workBody')
            : root.querySelector('.work-side');
        if (target?.checkVisibility()) target.focus();
        else scope.querySelector('.work-detail > .work-steps input')?.focus();
      } else if (!detailOpen) root.querySelector('.work-current button')?.focus();
    } catch {
      message('요청을 적용하지 못했어요. 선행 업무와 입력값을 확인한 뒤 다시 시도해 주세요.');
    }
  }
  function detail(id) {
    const state = session.snapshot(),
      task = state.tasks.find((item) => item.id === id);
    const body = el('section', undefined, 'work-detail');
    body.append(
      el('p', task.blocked ? '선행 업무를 먼저 확인하세요.' : '직접 체크하며 진행', 'eyebrow'),
      el('h2', task.title, 'cc-title'),
    );
    if (task.blocked)
      body.append(
        el('p', '먼저 마칠 업무: ' + task.prerequisites.map(titleOf).join(' · '), 'work-notice'),
      );
    const reading = task.reading;
    const readingButton = button(
      reading.trackTitle + ' · LV' + reading.depth + ' 보기',
      () => readingOptions(id),
      'reading-button',
    );
    readingButton.dataset.reading = id;
    body.append(readingButton);
    const steps = el('div', undefined, 'work-steps');
    const otherSteps = el('div', undefined, 'work-steps');
    const currentStep = task.steps.find(
      (step) => !state.workflow.checks.includes(id + ':' + step.id),
    );
    for (const step of task.steps) {
      const key = id + ':' + step.id,
        label = el('label', undefined, 'work-step'),
        input = el('input');
      input.type = 'checkbox';
      input.checked = state.workflow.checks.includes(key);
      input.disabled = task.blocked;
      input.dataset.step = key;
      const copy = el('span');
      copy.append(el('strong', step.title), el('span', step.text));
      label.append(input, copy);
      input.addEventListener('change', () => {
        if (!input.checked && session.recheckImpact(key).checkKeys.some((value) => value !== key)) {
          input.checked = true;
          const confirmation = el('div');
          confirmation.append(
            el(
              'p',
              '이 항목과 연결된 후속 업무는 다시 확인해야 합니다. 병행 가지의 기록은 유지돼요.',
            ),
            button(
              '다시 진행하기',
              () => {
                dialog.close();
                detailOpen = false;
                act(() => session.check(key, false));
              },
              'primary',
            ),
          );
          dialog.open('후속 확인 기록을 되돌릴까요?', confirmation);
        } else act(() => session.check(key, input.checked), key);
      });
      if (reading.depth === 1 && step !== currentStep) otherSteps.append(label);
      else steps.append(label);
    }
    body.append(steps);
    if (otherSteps.childElementCount) {
      const remaining = fold('다른 실행 항목 확인', otherSteps);
      remaining.classList.add('reading-other-steps');
      body.append(remaining);
    }
    body.append(el('p', '완료 기준', 'eyebrow'), el('p', task.done, 'work-done'));
    const preparation = fold('준비자료·확인할 사람 보기', taskPreparation(task));
    preparation.classList.add('work-preparation');
    body.append(preparation);
    const learning = readingContent(task, state);
    if (!['report-update', 'consultant-send', 'document-match'].includes(task.id))
      learning.append(link('관련 분야 한 문제 풀기', '#/practice/' + task.id, 'help-link'));
    body.append(fold('설명 깊이별 안내 보기', learning));
    if (reading.sections.overview)
      body.append(
        button('전체 조율 살펴보기', () => {
          detailOpen = false;
          dialog.open('전체 조율', coordinationOverview(session.snapshot()));
        }),
      );
    if (task.phaseGuide) body.append(el('p', task.phaseGuide.risk, 'work-notice'));
    body.append(el('p', state.essentialNotice, 'work-notice'));
    return body;
  }
  function showDetail(id) {
    activeId = id;
    detailOpen = mobile();
    if (mobile()) {
      const fromCurrent = document.activeElement?.classList.contains('work-open-detail');
      paint();
      root.querySelector(fromCurrent ? '.work-open-detail' : `[data-node="${id}"]`)?.focus();
      dialog.open(titleOf(id), detail(id));
    } else {
      paint();
      root.querySelector('.work-detail h2')?.focus();
    }
  }
  function readingOptions(id) {
    detailOpen = false;
    const task = session.snapshot().tasks.find((item) => item.id === id),
      reading = task.reading;
    const body = el('div', undefined, 'reading-options');
    body.append(el('p', reading.trackTitle + ' · 획득 LV' + reading.earnedLevel));
    const label = el('label', '지금 필요한 설명 깊이');
    const select = el('select');
    select.id = 'reading-depth';
    label.htmlFor = select.id;
    for (const item of reading.levels) {
      const option = el('option', 'LV' + item.level + ' · ' + item.title);
      option.value = String(item.level);
      select.append(option);
    }
    select.value = String(reading.depth);
    const goal = el('p', reading.levels.find((item) => item.level === reading.depth).goal);
    select.addEventListener('change', () => {
      goal.textContent =
        reading.levels.find((item) => item.level === Number(select.value))?.goal ??
        '선택을 확인하세요.';
    });
    body.append(
      label,
      select,
      goal,
      el('p', '보기만 바뀌며 업무 기록과 획득 레벨은 유지돼요.', 'context-note'),
    );
    if (reading.earnedLevel === 1)
      body.append(
        el(
          'p',
          '분야별 학습 도전에서 다음 레벨을 열 수 있어요. 기존 통합 성적은 그대로 보존합니다.',
          'context-note',
        ),
      );
    body.append(
      button(
        '이 깊이로 보기',
        () => {
          dialog.close();
          act(() => session.setReadingDepth(id, Number(select.value)));
        },
        'primary',
      ),
    );
    dialog.open('설명 깊이', body);
  }
  function conditions() {
    detailOpen = false;
    const state = session.snapshot(),
      draft = { ...state.context },
      body = el('div', undefined, 'work-context');
    body.append(el('p', '건물 종류는 참고 조건이며 승인 절차를 자동으로 정하지 않아요.'));
    for (const [key, title] of [
      ['facility', '건물 종류'],
      ['phase', '설계 단계'],
    ]) {
      const label = el('label', title),
        select = el('select');
      select.id = 'context-' + key;
      label.htmlFor = select.id;
      for (const value of state.options[key]) {
        const option = el('option', value);
        option.value = value;
        select.append(option);
      }
      select.value = draft[key];
      select.addEventListener('change', () => {
        draft[key] = select.value;
      });
      body.append(label, select);
    }
    body.append(
      el('p', '적용하기를 눌러야 안내가 바뀝니다.', 'context-note'),
      button(
        '적용하기',
        () => {
          const impact = session.contextImpact(draft);
          if (impact.checkKeys.length) {
            const confirm = el('div');
            confirm.append(
              el(
                'p',
                `조건이 바뀌면 ${impact.checkKeys.length}개 체크를 다시 확인해야 해요. 업무 선택과 메모는 유지됩니다.`,
              ),
              lines(impact.taskIds.map(titleOf)),
              button(
                '조건 적용하고 다시 확인',
                () => {
                  dialog.close();
                  act(() => session.applyContext(draft, true));
                },
                'primary',
              ),
              button('조건으로 돌아가기', conditions),
            );
            dialog.open('변경되는 기록 확인', confirm);
          } else {
            dialog.close();
            act(() => session.applyContext(draft));
          }
        },
        'primary',
      ),
    );
    dialog.open('내 상황에 맞추기', body);
  }
  function editPath() {
    detailOpen = false;
    const body = el('div');
    for (const branch of session.snapshot().branches.filter((item) => item.selected))
      body.append(
        button(branch.title + ' 제거', () => {
          const impact = session.removalImpact(branch.id),
            confirm = el('div');
          confirm.append(
            el(
              'p',
              `${impact.taskIds.length}개 업무와 해당 체크 ${impact.checkKeys.length}개가 제거됩니다. 다른 가지와 메모는 유지돼요.`,
            ),
            lines(impact.taskIds.map(titleOf)),
            button(
              '이 가지 제거하기',
              () => {
                dialog.close();
                activeId = session.snapshot().rootId;
                act(() => session.removeBranch(branch.id, true));
              },
              'primary',
            ),
            button('돌아가기', editPath),
          );
          dialog.open('제거할 내용 확인', confirm);
        }),
      );
    dialog.open('업무 흐름 편집', body);
  }
  function paint() {
    const state = session.snapshot();
    if (!state.workflow.nodes.includes(activeId)) activeId = state.rootId;
    const page = el('section', undefined, 'page work-page'),
      heading = el('div', undefined, 'work-heading'),
      h1 = el('h1', persistence?.title ?? '내 업무 흐름', 'cc-title');
    h1.tabIndex = -1;
    page.append(link('← 업무 선택', '#/tasks', 'back-link'));
    heading.append(
      button(
        '업무 안내 다시 읽기',
        () => {
          detailOpen = false;
          const task = state.tasks.find((item) => item.id === state.rootId);
          const guide = el('div', undefined, 'work-guide');
          guide.append(
            el('p', task.purpose),
            taskPreparation(task),
            taskSequence(task),
            el('h3', '완료 기준', 'cc-title'),
            el('p', task.done),
            el('p', state.essentialNotice, 'work-notice'),
          );
          dialog.open(task.title + ' · 업무 안내', guide);
        },
        'work-guide-link',
      ),
    );
    heading.append(
      el('p', titleOf(state.rootId), 'eyebrow'),
      h1,
      el(
        'p',
        persistence?.saved
          ? '이 업무의 변경은 자동 저장돼요. 저장 상태는 화면 위에서 확인할 수 있어요.'
          : '아직 저장하지 않은 업무예요. 새로고침하면 체크와 메모가 사라져요.',
        'context-note',
      ),
    );
    if (persistence?.save) heading.append(button('저장하고 나중에 이어보기', persistence.save));
    if (persistence?.saved) heading.append(link('내 업무 목록', '#/saved', 'help-link'));
    page.append(heading, workContext(state, activeId, conditions));
    const controls = el('div', undefined, 'work-toolbar');
    controls.append(
      button('내 상황에 맞추기', conditions),
      el(
        'span',
        state.context.facility === '잘 모르겠어요' && state.context.phase === '잘 모르겠어요'
          ? '아직 조건을 정하지 않았어요.'
          : state.context.facility + ' · ' + state.context.phase,
        'work-context-summary',
      ),
    );
    // Conditions refine the result; they must not block the first action.
    const layout = el('div', undefined, 'work-layout'),
      canvas = el('section', undefined, 'work-canvas');
    canvas.setAttribute('aria-label', '선택한 업무와 선행 관계');
    const next = state.tasks.find((task) => task.id === state.nextTaskId),
      pending = next?.steps.find(
        (step) => !state.workflow.checks.includes(next.id + ':' + step.id),
      );
    const current = el('div', undefined, 'work-current');
    current.append(
      el(
        'p',
        state.workflow.status === 'completed'
          ? '이번 흐름 완료'
          : next
            ? '지금 할 일'
            : '확인을 마쳤어요',
        'eyebrow',
      ),
      el(
        'h2',
        pending?.title ??
          (state.workflow.status === 'completed'
            ? '필요하면 다시 이어가세요.'
            : '완료 기준을 확인하세요.'),
        'cc-title',
      ),
    );
    if (pending) current.append(el('p', pending.text, 'work-current-hint'));
    if (next)
      current.append(
        button('실행 항목 열기 →', () => showDetail(next.id), 'primary work-open-detail'),
      );
    else if (state.workflow.status === 'completed')
      current.append(button('다시 진행하기', () => act(() => session.reopen())));
    else current.append(button('이번 흐름 완료', () => act(() => session.complete()), 'primary'));
    canvas.append(current, controls);
    const treeHeading = el('h2', '전체 업무 흐름', 'work-tree-title cc-title');
    treeHeading.tabIndex = -1;
    current.append(
      button(
        '전체 흐름으로 이동 ↓',
        () => {
          treeHeading.scrollIntoView({ block: 'start' });
          treeHeading.focus({ preventScroll: true });
        },
        'text-button work-tree-jump',
      ),
    );
    canvas.append(
      treeHeading,
      el(
        'p',
        '현재 보는 업무는 테두리로 표시해요. 업무를 누르면 실행 항목을 볼 수 있어요.',
        'work-tree-hint',
      ),
    );
    const trail = el(
      'p',
      '현재 위치 · ' +
        (activeId === state.rootId
          ? titleOf(activeId)
          : titleOf(state.rootId) + ' › ' + titleOf(activeId)),
      'work-location',
    );
    canvas.append(trail);
    const parallel =
      state.workflow.nodes.includes('report-update') &&
      state.workflow.nodes.includes('consultant-send');
    const nodes = el('div', undefined, parallel ? 'work-nodes work-parallel' : 'work-nodes');
    for (const task of state.tasks) {
      const group = el('div', undefined, 'work-node-group');
      group.dataset.task = task.id;
      if (task.prerequisites.length)
        group.append(
          el('p', '↓ ' + task.prerequisites.map(titleOf).join(' + ') + ' 후', 'work-edge'),
        );
      const node = button('', () => showDetail(task.id), 'work-node');
      node.dataset.node = task.id;
      node.setAttribute('aria-pressed', String(activeId === task.id));
      node.append(
        el(
          'small',
          task.checked
            ? '✓ 항목 확인됨'
            : task.blocked
              ? '선행 업무 대기'
              : state.nextTaskId === task.id
                ? '진행 가능 · 다음 업무'
                : '진행 가능',
        ),
        el('strong', task.title),
        el('span', '실행 항목 열기 →', 'work-node-action'),
      );
      group.append(node);
      nodes.append(group);
    }
    canvas.append(nodes);
    const candidates = state.branches.filter((branch) => !branch.selected);
    if (candidates.length) {
      const choices = el('div', undefined, 'work-candidates');
      choices.append(el('p', '추가 가능한 업무', 'eyebrow'));
      for (const branch of candidates) {
        const candidate = button(
          '+ ' + branch.title,
          () => act(() => session.addBranch(branch.id)),
          'work-candidate',
        );
        candidate.dataset.branch = branch.id;
        choices.append(candidate);
      }
      const optional = fold('필요한 후속 업무 추가 (' + candidates.length + ')', choices);
      optional.classList.add('work-optional');
      optional.open = optionsOpen;
      optional.addEventListener('toggle', () => {
        optionsOpen = optional.open;
      });
      canvas.append(optional);
    }
    if (state.branches.some((branch) => branch.selected))
      canvas.append(button('흐름 편집', editPath));
    const memo = el('textarea');
    memo.value = state.memo;
    memo.maxLength = 500;
    memo.id = 'workflow-memo';
    memo.rows = 3;
    const error = el('p', undefined, 'work-notice');
    error.setAttribute('role', 'status');
    memo.addEventListener('input', () => {
      try {
        session.setMemo(memo.value);
        error.textContent = '';
      } catch {
        error.textContent = '메모를 반영하지 못했어요. 500자 이내의 일반 텍스트를 입력해 주세요.';
      }
    });
    const label = el('label', '업무 메모 (500자 이내)');
    label.htmlFor = memo.id;
    const memoFold = fold('메모', label, memo, error);
    memoFold.classList.add('work-memo');
    canvas.append(memoFold);
    const side = el('div', undefined, 'work-side');
    side.append(detail(activeId));
    layout.append(canvas, side);
    page.append(layout);
    if (reviewDestination)
      heading.append(link('문제로 돌아가기 →', reviewDestination, 'help-link'));
    root.replaceChildren(page);
    root.querySelector('.work-detail h2')?.setAttribute('tabindex', '-1');
  }
  paint();
}
