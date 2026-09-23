import { createWorkSession } from '../../../src/application/work-session.mjs';
import { element as el } from '../../../src/ui/elements.mjs';
import { createDialog } from '../../../src/ui/dialog.mjs';
import { groups, tasks, configuration, stepKey } from './content.mjs';
// Disposable interaction study: static templates + memory only. No production imports,
// persistence, network requests, real grading, or legal-condition calculation.
const app = document.querySelector('#app'),
  sheet = document.querySelector('#sheet');
const session = createWorkSession(configuration);
let state = { screen: 'home', category: 0, focus: 'drawing', ...session.snapshot() };
function command(name, ...args) {
  state = { ...state, ...session[name](...args) };
}
const dialogs = createDialog({
  dialog: sheet,
  title: document.querySelector('#sheetTitle'),
  body: document.querySelector('#sheetBody'),
  closeButton: document.querySelector('#sheetClose'),
  fallbackFocus: () => document.querySelector('.brand'),
});
function toast(text) {
  const n = document.querySelector('#notice');
  n.textContent = text;
  n.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    n.hidden = true;
  }, 4200);
}
function modal(title, content) {
  // Existing static templates stay confined to this disposable renderer.
  // Any user-entered text is built through el()/textContent instead.
  if (typeof content === 'string') {
    const box = el('div');
    box.innerHTML = content;
    content = box;
  }
  dialogs.open(title, content);
}
function go(screen) {
  if (sheet.open) sheet.close();
  state.screen = screen;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function activeIds() {
  return state.workflow.nodes;
}
function currentId() {
  return state.nextTaskId;
}
function nextTitle() {
  return currentId() ? tasks[currentId()].title : '완료 기준 확인';
}
function nodeStatus(id) {
  return state.completed
    ? '완료 ✓'
    : currentId() === id
      ? '지금 할 일'
      : tasks[id].steps.every((_, i) => state.checks.includes(stepKey(id, i)))
        ? '체크 완료'
        : '선택됨';
}
function renderHome() {
  app.innerHTML = `<section class="home-hero"><div class="hero-copy"><p class="tagline">건축 실무, 물으면 척척.</p><h1>지금 할 업무를<br>찾아볼까요?</h1><button class="primary" data-go="choose">업무 선택하기 <span aria-hidden="true">↗</span></button><div class="home-tools"><button class="text-button" data-action="examples">+ 어떤 일을 도와주나요?</button><button class="text-button" data-action="search">업무명 검색</button></div></div><button class="scroll-cue" data-action="scroll">다른 방법으로 시작하기 ↓</button></section><section class="entry-section" id="entries"><h2>필요한 곳에서 시작하세요.</h2><div class="entries"><button class="entry-card" data-go="choose"><i>↗</i><strong>업무 찾아보기</strong><span>할 일을 고르면 다음 행동이 보여요.</span></button><button class="entry-card" data-go="tasks"><i>↗</i><strong>내 업무</strong><span>저장한 흐름에서 이어가세요.</span></button><button class="entry-card" data-go="learn"><i>↗</i><strong>실무 연습하기</strong><span>큰 그림부터 차근차근 익혀요.</span></button></div></section>`;
}
function renderChoose() {
  app.innerHTML = `<section class="page"><button class="back" data-go="home">← 홈으로</button><div class="page-title"><p class="eyebrow">업무 선택</p><h1>어떤 일을 맡았나요?</h1></div><div class="category-grid"></div><button class="text-button help" data-action="help">선택이 어려워요</button></section>`;
  groups.forEach((g, i) => {
    const b = el('button', undefined, 'choice-card');
    b.dataset.group = i;
    b.append(el('strong', g.name), el('span', g.help + ' →'));
    app.querySelector('.category-grid').append(b);
  });
}
function renderGroup() {
  const g = groups[state.category];
  app.innerHTML = `<section class="page"><button class="back" data-go="choose">← 다른 업무</button><div class="page-title"><p class="eyebrow">받은 업무를 골라주세요.</p><h1></h1></div><div class="task-options"></div><button class="text-button help" data-action="help">선택이 어려워요</button></section>`;
  app.querySelector('h1').textContent = g.name;
  g.tasks.forEach((t) => {
    const b = el('button', t, 'task-option');
    b.dataset.task = t;
    b.append(el('span', '→'));
    app.querySelector('.task-options').append(b);
  });
}
function detailHTML() {
  const t = tasks[state.focus];
  return `<p class="eyebrow">${state.focus === currentId() ? '지금 할 일' : '선택한 업무'}</p><h2 class="cc-title">${t.title}</h2><div class="detail-context"><small>공통 업무 안내</small><button class="context-button" data-action="context">내 상황에 맞추기</button></div><div class="action-list">${t.steps.map((s, i) => `<section class="action"><span class="number">0${i + 1}</span><h3 class="cc-title">${s[0]}</h3>${state.sections.method ? `<p>${s[1]}</p>` : ''}</section>`).join('')}</div><div class="done-line"><strong>완료 기준</strong><p>${t.done}</p></div>${state.sections.method ? `<details class="more"><summary>더 알아보기</summary><div class="more-content"><section><h3>판단 이유</h3><p>변경 내용을 연결된 자료에 맞춰야 누락과 재작업을 줄일 수 있어요.</p></section>${state.sections.connections ? '<section><h3>함께 확인할 대상</h3><p>다른 분야에 영향이 있다면 관련 담당자와 변경 범위를 먼저 맞추세요.</p></section>' : ''}${state.sections.exceptions ? '<section><h3>추가 확인이 필요한 경우</h3><p>승인받은 내용이 달라지는 경우에는 적용 절차를 담당자와 확인하세요.</p></section>' : ''}<details class="case"><summary>평면만 바꾸고 천장도는 그대로라면?</summary><p>연결된 도면이 서로 다른 상태일 수 있어요. 이 사례는 시안 설명용이며 실제 기준 확인을 대신하지 않습니다.</p></details></div></details>` : ''}${state.saved ? '<button class="text-button" data-action="progress">완료 체크·메모 →</button>' : ''}`;
}
function renderFlow() {
  if (!activeIds().includes(state.focus)) state.focus = 'drawing';
  const selected = (id) => state.branches.includes(id);
  app.innerHTML = `<section class="flow-layout"><div class="flow-main"><button class="back" data-go="choose">← 업무 선택</button><div class="flow-title"><h1 class="cc-title">내 업무 흐름</h1><button class="depth" data-action="depth">보기 LV${state.depth}⌄</button></div><p class="quiet">필요한 일을 골라 연결하세요.</p><div class="tree"><svg viewBox="0 0 600 340" preserveAspectRatio="none" aria-hidden="true"><path class="${selected('report') ? 'selected-line' : 'candidate-line'}" d="M300 64 C300 115 150 110 150 155"/><path class="${selected('send') ? 'selected-line' : 'candidate-line'}" d="M300 64 C300 115 450 110 450 155"/>${selected('report') ? '<path class="selected-line" d="M150 218 L150 292"/>' : ''}</svg><div class="node-row root"><button class="node cc-title chosen ${currentId() === 'drawing' ? 'current' : ''}" data-node="drawing">도면 수정<small>${nodeStatus('drawing')}</small></button></div><div class="node-row branches"><button class="node cc-title ${selected('report') ? 'chosen' : ''}" data-node="report">${selected('report') ? '' : '＋ '}보고서 반영<small>${selected('report') ? nodeStatus('report') : '추가 가능한 업무'}</small></button><button class="node cc-title ${selected('send') ? 'chosen' : ''}" data-node="send">${selected('send') ? '' : '＋ '}협력사 전달<small>${selected('send') ? nodeStatus('send') : '추가 가능한 업무'}</small></button></div>${selected('report') ? '<div class="node-row end"><button class="node cc-title future" data-node="check">도면·보고서 일치 확인<small>보고서 반영 후</small></button></div>' : ''}</div><p class="legend">파랑은 선택한 업무 · 점선은 추가 가능한 업무</p><button class="mobile-detail" data-action="detail"><p class="eyebrow">${state.focus === currentId() ? '지금 할 일' : '선택한 업무'}</p><h2 class="cc-title">${tasks[state.focus].title}</h2><p>${tasks[state.focus].next}</p><span>실행 방법 보기 →</span></button><div class="flow-actions"><button class="text-button" data-action="edit">경로 수정</button>${state.saved ? '<span class="saved-status">시안에 저장됨 · 새로고침 시 초기화</span>' : '<button class="outline" data-action="save">저장하고 나중에 이어보기</button>'}</div>${state.sections.overview ? '<button class="text-button" data-action="overview">전체 관계 검토 →</button>' : ''}</div><aside class="flow-detail" aria-label="선택한 업무 안내">${detailHTML()}</aside></section>`;
}
function renderTasks() {
  app.innerHTML = `<section class="page"><button class="back" data-go="home">← 홈으로</button><div class="page-title"><p class="eyebrow">내 업무</p><h1>하던 일에서 이어가세요.</h1></div><div id="workList"></div><details class="finished-list"><summary>완료한 업무 ${state.saved && state.completed && !state.trash ? '1' : '0'}</summary><div id="finished"></div></details><button class="text-button" data-action="trash">휴지통</button></section>`;
  const list = app.querySelector('#workList');
  if (!state.saved || state.trash) {
    list.innerHTML =
      '<div class="empty"><p>아직 저장한 업무가 없어요.</p><button class="text-button" data-go="choose">업무 찾아보기 →</button></div>';
    return;
  }
  const card = el('article', undefined, 'workflow-card');
  card.innerHTML = `<div><span class="status-pill">${state.completed ? '완료' : '진행 중'}</span><h2>도면 수정${state.branches.includes('report') ? ' · 보고서 반영' : ''}</h2><p>다음 행동: ${state.completed ? '완료한 흐름 다시 보기' : nextTitle()}</p></div><div><button class="secondary" data-go="flow">${state.completed ? '다시 보기' : '이어서 하기'} →</button><button class="text-button" data-action="${state.completed ? 'reopen' : 'progress'}">${state.completed ? '진행 중으로 되돌리기' : '완료 체크·메모'}</button><button class="text-button" data-action="delete">삭제</button></div>`;
  (state.completed ? app.querySelector('#finished') : list).append(card);
  if (state.completed) list.innerHTML = '<p class="muted">진행 중인 업무가 없어요.</p>';
}
function renderLearn() {
  app.innerHTML = `<section class="page"><button class="back" data-go="home">← 홈으로</button><div class="page-title"><p class="eyebrow">실무 연습하기</p><h1>큰 그림부터, 한 걸음씩.</h1></div><section class="learning-focus"><p class="eyebrow">도면·설계 · LV1 위치와 목적</p><h2>도면을 고치기 전,<br>무엇부터 볼까요?</h2><p>현재 업무와 연결된 한 문제를 풀어보세요.</p><button class="primary" data-action="quiz">한 문제 연습하기 →</button></section><details class="tracks"><summary>분야별 학습 진도 보기</summary>${['도면·설계', '법규·인허가', '협업·전달'].map((n) => `<div class="track"><strong>${n}</strong><span>LV1 · 시안 예시</span></div>`).join('')}<p class="quiet">분야별 승급은 5문제 중 4개, 최종 도전은 8문제 중 7개 정답입니다. 실제 문제 재편은 6단계에서 진행합니다.</p></details></section>`;
}
function render() {
  (
    ({
      home: renderHome,
      choose: renderChoose,
      group: renderGroup,
      flow: renderFlow,
      tasks: renderTasks,
      learn: renderLearn,
    })[state.screen] || renderHome
  )();
}
function selectTask(name) {
  if (name === '도면 수정') {
    go('flow');
    return;
  }
  const box = el('div', undefined, 'stack');
  box.append(
    el(
      'p',
      name +
        '도 기존 콘텐츠 대응표에 포함돼 있어요. 이번 시안은 도면 수정 경로를 대표로 검토합니다.',
    ),
  );
  const b = el('button', '도면 수정 시안 보기 →', 'primary');
  b.dataset.go = 'flow';
  box.append(b);
  modal('지원 업무 확인', box);
}
function contextDialog() {
  const content = `<label class="field">건물 종류<select id="facility"><option>잘 모르겠어요</option><option>공동주택</option><option>업무시설</option><option>공항시설</option></select></label><label class="field">설계 단계<select id="phase"><option>잘 모르겠어요</option><option>기본계획</option><option>계획설계</option><option>중간설계</option><option>실시설계</option></select></label><p class="quiet">모르면 선택하지 않아도 괜찮아요.</p><button class="primary full sheet-actions" data-action="applyContext">이 조건으로 보기</button>`;
  if (matchMedia('(max-width:700px)').matches) {
    modal('내 상황에 맞추기', content);
  } else {
    if (sheet.open) sheet.close();
    app.querySelector('.flow-detail').innerHTML =
      '<button class="back" data-action="cancelContext">← 업무 안내</button><h2>내 상황에 맞추기</h2>' +
      content;
  }
  document.querySelector('#facility').value = state.facility;
  document.querySelector('#phase').value = state.phase;
}
function progressDialog() {
  const box = el('div');
  for (const id of activeIds()) {
    box.append(el('h3', tasks[id].title));
    tasks[id].steps.forEach((step, i) => {
      const label = el('label', undefined, 'check-row'),
        input = el('input');
      input.type = 'checkbox';
      input.dataset.check = stepKey(id, i);
      input.checked = state.checks.includes(input.dataset.check);
      label.append(input, el('span', step[0]));
      box.append(label);
    });
  }
  const d = el('details', undefined, 'more');
  d.append(el('summary', '메모'));
  const area = el('textarea', undefined, 'memo');
  area.maxLength = 500;
  area.value = state.memo;
  area.id = 'memo';
  area.setAttribute('aria-label', '업무 메모');
  d.append(area);
  box.append(d, el('p', '체크를 마친 뒤 완료 기준을 확인하고 직접 완료해 주세요.', 'quiet'));
  const b = el('button', '업무 완료', 'primary full sheet-actions');
  b.dataset.action = 'complete';
  box.append(b);
  modal('진행 상태 확인', box);
}
const actions = {
  menu() {
    modal(
      '메뉴',
      '<div class="sheet-list"><button data-go="home">홈</button><button data-go="tasks">내 업무</button><button data-go="learn">실무 연습하기</button></div>',
    );
  },
  scroll() {
    document.querySelector('#entries').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  },
  examples() {
    modal(
      '어떤 일을 도와주나요?',
      '<div class="sheet-list"><button data-task="도면 수정">도면을 고치라고 했어요 →</button><button data-task="보고서 작성">보고 자료를 만들라고 했어요 →</button><button data-task="협력업체 조정">다른 담당자와 협의하라고 했어요 →</button></div>',
    );
  },
  search() {
    modal(
      '지원 업무 찾기',
      '<label class="field">업무명<input id="taskSearch" placeholder="예: 도면, 보고서" autocomplete="off"></label><p class="quiet">등록된 업무 이름을 찾습니다.</p><div class="sheet-list search-results" id="results"></div>',
    );
    document.querySelector('#taskSearch').focus();
  },
  help() {
    modal(
      '선택이 어려워요',
      '<div class="sheet-list"><button data-action="terms">용어를 모르겠어요</button><button data-action="unsure">무엇을 골라야 할지 모르겠어요</button><button data-action="missing">찾는 업무가 없어요</button></div>',
    );
  },
  terms() {
    modal(
      '어떤 말이 낯선가요?',
      '<div class="stack"><p><strong>인허가</strong><br>관청 등에 필요한 승인·허가 절차를 확인하고 진행하는 일이에요.</p><p><strong>협력사</strong><br>구조·설비 등 다른 분야의 일을 함께 맡는 업체예요.</p><button class="secondary" data-go="choose">업무 다시 고르기</button></div>',
    );
  },
  unsure() {
    modal(
      '어떤 결과물을 만들라고 했나요?',
      '<div class="sheet-list"><button data-task="도면 수정">도면을 고치라고 했어요</button><button data-task="보고서 작성">보고 자료를 만들라고 했어요</button><button data-action="missing">아직 모르겠어요</button></div>',
    );
  },
  missing() {
    modal(
      '일치하는 업무가 없나요?',
      '<p>없는 업무를 비슷한 답으로 대신 안내하지 않아요. 받은 지시의 결과물이나 담당자를 확인한 뒤, 지원 업무를 다시 찾아보세요.</p><button class="secondary full sheet-actions" data-go="choose">지원 업무 전체 보기</button>',
    );
  },
  context: contextDialog,
  cancelContext() {
    render();
  },
  applyContext() {
    command(
      'setContext',
      document.querySelector('#facility').value,
      document.querySelector('#phase').value,
    );
    sheet.close();
    render();
    toast('조건 선택을 확인했어요. 시안에서는 공통 안내를 유지합니다.');
  },
  depth() {
    modal(
      '보기 깊이',
      '<p class="quiet">검토를 위해 LV5까지 열어둔 시안입니다. 실제로는 획득한 범위 안에서 선택합니다.</p><div class="sheet-list">' +
        ['큰 그림', '수행 방법', '협업·연결', '조건별 판단', '전체 조율']
          .map((n, i) => `<button data-depth="${i + 1}">LV${i + 1} · ${n}</button>`)
          .join('') +
        '</div>',
    );
  },
  detail() {
    modal('실행 방법', detailHTML());
  },
  save() {
    command('save');
    render();
    toast('시안에 저장했어요. 메뉴의 내 업무에서 이어볼 수 있어요. 새로고침하면 초기화됩니다.');
  },
  edit() {
    modal(
      '경로 수정',
      '<p class="quiet">제거할 가지를 선택하세요. 기록에 미치는 영향을 먼저 확인합니다.</p><div class="sheet-list">' +
        [...state.branches]
          .map((id) => `<button data-remove="${id}">${tasks[id].title} 가지 제거</button>`)
          .join('') +
        '</div>',
    );
  },
  progress: progressDialog,
  complete() {
    if (
      activeIds().some((id) =>
        tasks[id].steps.some((_, i) => !state.checks.includes(stepKey(id, i))),
      )
    ) {
      toast('아직 체크하지 않은 실행 항목이 있어요.');
      return;
    }
    command('complete');
    sheet.close();
    go('tasks');
    toast('업무 완료로 기록했어요. 필요하면 다시 진행할 수 있어요.');
  },
  reopen() {
    command('reopen');
    render();
  },
  delete() {
    modal(
      '업무를 휴지통으로 옮길까요?',
      '<p>이 시안 안에서 다시 복원할 수 있어요.</p><button class="secondary full sheet-actions" data-action="confirmDelete">휴지통으로 이동</button>',
    );
  },
  confirmDelete() {
    command('remove');
    sheet.close();
    render();
  },
  trash() {
    modal(
      '휴지통',
      state.trash
        ? '<p>도면 수정 업무가 있어요.</p><button class="secondary full sheet-actions" data-action="restore">복원하기</button>'
        : '<p>휴지통이 비어 있어요.</p>',
    );
  },
  restore() {
    command('restore');
    sheet.close();
    render();
  },
  overview() {
    modal(
      '전체 관계 검토 · LV5',
      '<p>도면 수정 후 보고서 반영과 협력사 전달은 업무 조건에 따라 병행할 수 있어요. 보고서 반영 뒤에는 도면과 자료가 일치하는지 확인합니다.</p><p class="quiet">대표 경로 설명입니다. 여러 프로젝트를 조율하는 전체 화면은 별도 설계 검토 대상입니다.</p>',
    );
  },
  quiz() {
    modal(
      '한 문제 연습 · 시안',
      '<p class="eyebrow">도면·설계 · 큰 그림</p><h3>도면을 고치기 전에 먼저 할 일은?</h3><div id="quizChoices">' +
        [
          '수정 요청과 기준 도면 확인',
          '보고서부터 출력',
          '관련 없는 도면까지 모두 수정',
          '수정 이유 확인 없이 작업 시작',
          '파일 이름만 최신으로 바꾸기',
        ]
          .map(
            (s, i) =>
              `<button class="quiz-choice" data-answer="${i}" aria-pressed="false">${s}</button>`,
          )
          .join('') +
        '</div><button class="primary full sheet-actions" data-action="quizSubmit">답 확인</button><p id="feedback" role="status"></p>',
    );
  },
  quizSubmit() {
    const a = sheet.querySelector('[data-answer][aria-pressed=true]');
    document.querySelector('#feedback').textContent = a
      ? a.dataset.answer === '0'
        ? '맞아요. 요청과 기준 자료를 알아야 수정 범위를 잡을 수 있어요.'
        : '먼저 요청과 기준 도면을 확인해야 무엇을 바꿀지 알 수 있어요.'
      : '답을 먼저 선택해 주세요.';
  },
};
document.addEventListener('click', (event) => {
  const b = event.target.closest('button');
  if (!b) return;
  if (b.dataset.go) {
    go(b.dataset.go);
    return;
  }
  if (b.dataset.group !== undefined) {
    state.category = Number(b.dataset.group);
    go('group');
    return;
  }
  if (b.dataset.task) {
    selectTask(b.dataset.task);
    return;
  }
  if (b.dataset.node) {
    const id = b.dataset.node;
    if (['report', 'send'].includes(id) && !state.branches.includes(id)) {
      command('addBranch', id);
      render();
      toast(tasks[id].title + ' 가지를 연결했어요.');
      return;
    }
    state.focus = id;
    render();
    if (matchMedia('(max-width:700px)').matches) actions.detail();
    return;
  }
  if (b.dataset.depth) {
    command('setDepth', Number(b.dataset.depth));
    sheet.close();
    render();
    return;
  }
  if (b.dataset.remove) {
    const id = b.dataset.remove;
    modal(
      '제거하면 바뀌는 내용',
      '<p>이 가지와 연결된 완료 체크가 제거됩니다. 다른 가지와 공통 메모는 유지합니다.</p><button class="secondary full sheet-actions" data-confirm-remove="' +
        id +
        '">확인하고 제거</button>',
    );
    return;
  }
  if (b.dataset.confirmRemove) {
    const id = b.dataset.confirmRemove;
    command('removeBranch', id);
    sheet.close();
    render();
    return;
  }
  if (b.dataset.answer !== undefined) {
    sheet
      .querySelectorAll('[data-answer]')
      .forEach((n) => n.setAttribute('aria-pressed', String(n === b)));
    return;
  }
  if (b.dataset.action && actions[b.dataset.action]) actions[b.dataset.action]();
});
document.addEventListener('change', (event) => {
  if (event.target.dataset.check) {
    const key = event.target.dataset.check;
    command('setStep', key, event.target.checked);
    if (state.screen === 'flow') render();
  }
});
document.addEventListener('input', (event) => {
  if (event.target.id === 'memo') {
    command('setMemo', event.target.value);
  }
  if (event.target.id === 'taskSearch') {
    const target = document.querySelector('#results');
    target.replaceChildren();
    const query = event.target.value.trim();
    if (!query) return;
    const found = [...new Set(groups.flatMap((g) => g.tasks))].filter((t) => t.includes(query));
    found.forEach((t) => {
      const b = el('button', t);
      b.dataset.task = t;
      target.append(b);
    });
    if (!found.length)
      target.append(el('p', '일치하는 업무가 없어요. 업무 이름을 짧게 입력해 보세요.', 'quiet'));
  }
});
document.querySelector('#menuOpen').addEventListener('click', actions.menu);
const initial = new URLSearchParams(location.search).get('screen');
if (['flow', 'tasks', 'learn'].includes(initial)) {
  state.screen = initial;
  if (initial === 'flow') command('addBranch', 'report');
}
render();
