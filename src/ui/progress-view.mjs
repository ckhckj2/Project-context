import { element as el, navigationLink as link } from './elements.mjs';
function button(label, action) {
  const node = el('button', label, 'work-secondary cc-control');
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}
export function openFirstSave(dialog, title, save) {
  const body = el('div', undefined, 'save-form'),
    label = el('label', '알아보기 쉬운 업무 이름'),
    input = el('input');
  input.type = 'text';
  input.maxLength = 80;
  input.value = title;
  label.append(input);
  const error = el('p');
  error.setAttribute('role', 'alert');
  body.append(
    label,
    el(
      'p',
      '이 브라우저에만 저장돼요. 브라우저 데이터를 지우거나 기기를 바꾸면 복구할 수 없어요. 민감한 업무자료는 적지 마세요.',
      'context-note',
    ),
    error,
    button('저장하기', () => {
      try {
        const id = save(input.value);
        dialog.close();
        return id;
      } catch {
        error.textContent =
          '80자 이내의 업무 이름을 입력해 주세요. 저장 가능한 업무는 휴지통을 포함해 100개예요.';
      }
    }),
  );
  dialog.open('저장하고 나중에 이어보기', body);
}
export function renderSavedWorks(root, workspace, dialog) {
  let filter = 'active',
    limit = 5;
  function paint() {
    const page = el('section', undefined, 'page saved-page'),
      h1 = el('h1', '내 업무', 'cc-title');
    h1.tabIndex = -1;
    page.append(
      link('← 홈으로', '#/', 'back-link'),
      h1,
      el(
        'p',
        '이 브라우저에 저장한 업무예요. 데이터 삭제·기기 변경 시 복구할 수 없어요.',
        'context-note',
      ),
    );
    const label = el('label', '목록 '),
      select = el('select');
    for (const [value, title] of [
      ['active', '진행 중'],
      ['completed', '완료'],
      ['trash', '휴지통'],
    ]) {
      const option = el('option', title);
      option.value = value;
      select.append(option);
    }
    select.value = filter;
    select.addEventListener('change', () => {
      filter = select.value;
      limit = 5;
      paint();
    });
    label.append(select);
    page.append(label);
    const values = workspace
      .list()
      .filter((item) =>
        filter === 'trash' ? item.trashed : !item.trashed && item.status === filter,
      );
    if (!values.length)
      page.append(
        el(
          'p',
          filter === 'trash'
            ? '휴지통이 비어 있어요.'
            : '아직 이 목록에 업무가 없어요. 업무 흐름에서 저장하면 여기에 나타나요.',
          'saved-empty',
        ),
      );
    const list = el('div', undefined, 'saved-list');
    for (const item of values.slice(0, limit)) {
      const card = el('article', undefined, 'saved-card');
      card.append(el('h2', item.title, 'cc-title'));
      if (filter === 'trash')
        card.append(
          button('되살리기', () => {
            workspace.restore(item.id);
            paint();
          }),
        );
      else {
        card.append(
          el(
            'p',
            item.nextAction ??
              (item.status === 'completed'
                ? '완료한 업무예요.'
                : '모든 항목을 확인했어요. 완료를 확정해 주세요.'),
          ),
          link('이어서 보기 →', '#/work/' + item.id, 'help-link'),
        );
        const manage = el('details');
        manage.append(
          el('summary', '관리'),
          button('휴지통으로', () => {
            const body = el('div');
            body.append(
              el('p', '진행 목록에서 숨깁니다. 휴지통에서 체크와 메모를 그대로 되살릴 수 있어요.'),
              button('휴지통으로 옮기기', () => {
                workspace.moveToTrash(item.id, true);
                dialog.close();
                paint();
              }),
            );
            dialog.open('이 업무를 휴지통으로 옮길까요?', body);
          }),
        );
        card.append(manage);
      }
      list.append(card);
    }
    page.append(list);
    if (values.length > limit)
      page.append(
        button('5개 더 보기', () => {
          limit += 5;
          paint();
        }),
      );
    page.append(
      link('새 업무 찾아보기', '#/tasks', 'help-link'),
      link('기존 프로젝트 보기', '../index.html?entry=projects', 'help-link'),
    );
    root.replaceChildren(page);
  }
  paint();
}
export function mountSaveStatus(root, { retry, reload, dialog }) {
  const messages = {
    ready: '',
    saving: '저장 중…',
    saved: '이 브라우저에 저장됨',
    unavailable: '저장하지 못했어요. 지금 변경은 새로고침하면 사라질 수 있어요.',
    unreadable: '저장 기록을 읽지 못했어요. 기존 기록을 덮어쓰지 않고 임시로 사용 중이에요.',
    conflict: '다른 탭에서 기록이 바뀌었어요. 덮어쓰기를 막기 위해 저장을 멈췄어요.',
    invalid: '저장할 내용을 확인하지 못했어요. 기존 기록을 유지하고 저장을 멈췄어요.',
  };
  return (status) => {
    root.replaceChildren();
    root.hidden = status === 'ready';
    root.append(el('span', messages[status] ?? messages.unavailable));
    if (status === 'unavailable') root.append(button('저장 다시 시도', retry));
    if (['conflict', 'unreadable', 'invalid'].includes(status))
      root.append(
        button('저장 기록 다시 불러오기', () => {
          const body = el('div');
          body.append(
            el(
              'p',
              '현재 화면에서 저장하지 못한 변경은 사라집니다. 저장된 기록을 다시 불러올까요?',
            ),
            button('다시 불러오기', reload),
          );
          dialog.open('기록 다시 불러오기', body);
        }),
      );
  };
}
