import { element as el, navigationLink as link } from './elements.mjs';
import { createDialog } from './dialog.mjs';
import { taskPreparation, taskSequence } from './task-guide.mjs';
import {
  categoryList,
  tasksInCategory,
  findTask,
  searchTasks,
  exampleList,
  termList,
  legacyDestination,
} from '../application/task-navigation.mjs';

const pathFor = (id) => `#/task/${id}`;
function heading(title, eyebrow) {
  const header = el('div', undefined, 'page-heading');
  if (eyebrow) header.append(el('p', eyebrow, 'eyebrow'));
  const h1 = el('h1', title, 'cc-title');
  h1.tabIndex = -1;
  header.append(h1);
  return header;
}
function page(title, eyebrow, back = '#/tasks', backLabel = '← 업무 선택') {
  const section = el('section', undefined, 'page');
  section.append(link(backLabel, back, 'back-link'), heading(title, eyebrow));
  return section;
}
function taskLink(task) {
  const anchor = link('', pathFor(task.id), 'task-card');
  anchor.append(
    el('strong', task.title),
    el('span', task.description),
    el('small', '선택하기 →', 'card-arrow'),
  );
  return anchor;
}
function helpLink() {
  return link('선택이 어려워요', '#/help', 'help-link');
}

function home() {
  const body = el('div');
  const hero = el('section', undefined, 'home-hero');
  const copy = el('div', undefined, 'hero-copy');
  copy.append(
    el('p', '건축 실무, 물으면 척척.', 'tagline'),
    heading('지금 할 업무를 찾아볼까요?'),
    link('업무 선택하기 ↗', '#/tasks', 'primary'),
  );
  const shortcuts = el('nav', undefined, 'home-shortcuts');
  shortcuts.setAttribute('aria-label', '자주 찾는 업무 바로가기');
  for (const example of exampleList())
    shortcuts.append(link(findTask(example.taskId).title, pathFor(example.taskId)));
  copy.append(shortcuts);
  const tools = el('div', undefined, 'home-tools');
  const examples = el('details', undefined, 'examples');
  examples.append(el('summary', '+ 어떤 일을 도와주나요?'));
  const choices = el('div', undefined, 'example-list');
  for (const example of exampleList()) choices.append(link(example.label, pathFor(example.taskId)));
  examples.append(choices);
  tools.append(examples, link('업무명 검색', '#/search', 'text-link'));
  copy.append(tools);
  hero.append(copy);
  const cue = el('button', '다른 방법으로 시작하기 ↓', 'scroll-cue cc-control');
  cue.type = 'button';
  const entries = el('section', undefined, 'entry-section');
  entries.id = 'start-options';
  cue.addEventListener('click', () => {
    entries.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
    entries.querySelector('h2').focus({ preventScroll: true });
  });
  hero.append(cue);
  const entryTitle = el('h2', '필요한 곳에서 시작하세요.', 'cc-title');
  entryTitle.tabIndex = -1;
  entries.append(entryTitle);
  const cards = el('div', undefined, 'entry-cards');
  for (const [title, description, destination] of [
    ['업무 찾아보기', '할 일을 고르면 다음 행동이 보여요.', '#/tasks'],
    ['내 업무', '저장한 업무를 이어서 진행하세요.', '#/saved'],
    ['실무 연습하기', '큰 그림부터 차근차근 익혀요.', '#/learn'],
  ]) {
    const card = link('', destination, 'entry-card');
    card.append(el('small', '↗', 'card-arrow'), el('strong', title), el('span', description));
    cards.append(card);
  }
  entries.append(cards);
  body.append(hero, entries);
  return body;
}

function choose() {
  const section = page('어떤 일을 맡았나요?', '업무 선택', '#/', '← 홈으로');
  section.append(el('p', '업무를 고르면 먼저 할 일을 바로 보여드려요.', 'selection-intro'));
  const list = el('div', undefined, 'category-list');
  for (const category of categoryList()) {
    const group = el('section', undefined, 'task-group');
    group.append(el('h2', category.title, 'cc-title'));
    const tasks = el('div', undefined, 'task-group-links');
    for (const task of tasksInCategory(category.id)) {
      const anchor = link('', pathFor(task.id), 'task-shortcut');
      anchor.append(
        el('strong', task.title),
        el('span', task.description),
        el('small', '업무 안내 보기 →', 'card-arrow'),
      );
      tasks.append(anchor);
    }
    group.append(tasks);
    list.append(group);
  }
  const alternatives = el('nav', undefined, 'selection-alternatives');
  alternatives.setAttribute('aria-label', '업무 찾기 도움');
  alternatives.append(link('업무명으로 검색하기', '#/search', 'text-link'), helpLink());
  section.append(list, alternatives);
  return section;
}

function category(id) {
  const item = categoryList().find((item) => item.id === id);
  const section = page(item.title, '받은 업무를 골라주세요.');
  const list = el('div', undefined, 'task-list');
  for (const task of tasksInCategory(id)) list.append(taskLink(task));
  section.append(list, helpLink());
  return section;
}

function task(id) {
  const item = findTask(id);
  const section = page(item.title, '업무 안내');
  section.classList.add('task-guide-page');
  const category = categoryList().find((group) => group.taskIds.includes(id));
  const trail = el('nav', undefined, 'task-trail');
  trail.setAttribute('aria-label', '현재 업무 경로');
  trail.append(
    link('업무 선택', '#/tasks'),
    el('span', '› ' + category.title + ' › ' + item.title),
  );
  section.insertBefore(trail, section.querySelector('.page-heading'));
  const purpose = el('section', undefined, 'purpose');
  purpose.append(el('h2', '왜 이 일을 하나요?', 'cc-title'), el('p', item.detail.purpose));
  section.append(purpose);
  const card = el('section', undefined, 'first-action');
  card.append(
    el('p', '먼저 할 일', 'eyebrow'),
    el('h2', item.firstAction.title, 'cc-title'),
    el('p', item.firstAction.hint, 'first-action-hint'),
    link('체크리스트로 진행하기 →', '#/flow/' + id, 'primary'),
    el('p', '실행 항목을 체크하고, 메모를 남기며 업무를 진행할 수 있어요.', 'action-caption'),
  );
  section.append(card);
  const guide = el('section', undefined, 'task-guide');
  guide.setAttribute('aria-label', '업무 상세안내');
  guide.append(
    el('h2', '업무 상세안내', 'cc-title'),
    taskPreparation(item.detail),
    taskSequence(item.detail),
  );
  const done = el('section', undefined, 'guide-done');
  done.append(el('h3', '어디까지 하면 되나요?', 'cc-title'), el('p', item.detail.done));
  guide.append(done);
  const notice = el('section', undefined, 'guide-notice');
  notice.append(
    el('h3', '시작 전 확인', 'cc-title'),
    el('p', '공통 업무 안내예요. 시설·설계 단계·실제 승인 절차에 따라 적용할 내용이 달라져요.'),
    el('p', '제출·변경 전에는 최신 기준자료와 책임자에게 적용 여부를 확인하세요.'),
  );
  const legacy = el('details', undefined, 'guide-legacy');
  legacy.append(
    el('summary', '이전 화면의 추가 자료 찾기'),
    el('p', '프로젝트별 절차·용어 등 더 넓은 자료가 필요하면 이전 화면에서 찾아볼 수 있어요.'),
    link('기존 상세 안내 보기', legacyDestination('task', id), 'help-link'),
  );
  section.append(guide, notice, legacy);
  return section;
}

function search() {
  const section = page('어떤 업무를 찾으세요?', '업무명 검색', '#/', '← 홈으로');
  const label = el('label', '업무 이름이나 도구 이름', 'search-label');
  label.htmlFor = 'task-query';
  const input = el('input', undefined, 'search-input');
  input.id = 'task-query';
  input.type = 'search';
  input.maxLength = 100;
  input.placeholder = '예: 도면, 보고서, 스케치업';
  input.autocomplete = 'off';
  const status = el('p', '등록된 업무 이름과 관련 단어를 찾습니다.', 'search-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const result = el('div', undefined, 'task-list');
  result.id = 'task-results';
  const more = el('button', '', 'text-button cc-control');
  more.type = 'button';
  more.hidden = true;
  let matches = [],
    limit = 5;
  function paint() {
    result.replaceChildren(...matches.slice(0, limit).map(taskLink));
    more.hidden = matches.length <= limit;
    more.textContent = `나머지 ${Math.max(0, matches.length - limit)}개 업무 보기`;
  }
  function update() {
    limit = 5;
    matches = searchTasks(input.value);
    paint();
    status.textContent = !input.value.trim()
      ? '등록된 업무 이름과 관련 단어를 찾습니다.'
      : matches.length
        ? `${matches.length}개 업무를 찾았어요.`
        : '일치하는 업무가 없어요. 업무 이름을 짧게 입력하거나 도움을 열어보세요.';
  }
  input.addEventListener('input', (event) => {
    if (!event.isComposing) update();
  });
  input.addEventListener('compositionend', update);
  more.addEventListener('click', () => {
    limit += 5;
    paint();
  });
  section.append(label, input, status, result, more, helpLink());
  return section;
}

function help(id) {
  if (!id) {
    const section = page('어디가 막혔나요?', '선택 도움');
    const list = el('div', undefined, 'help-list');
    for (const [title, destination] of [
      ['용어를 모르겠어요', 'terms'],
      ['무엇을 골라야 할지 모르겠어요', 'unsure'],
      ['찾는 업무가 없어요', 'missing'],
    ])
      list.append(link(title + ' →', '#/help/' + destination));
    section.append(list);
    return section;
  }
  const section = page(
    id === 'terms'
      ? '낯선 말부터 알아봐요.'
      : id === 'unsure'
        ? '무엇을 만들라고 했나요?'
        : '맞는 업무가 없나요?',
    '선택 도움',
    '#/help',
    '← 다른 도움',
  );
  if (id === 'terms') {
    const list = el('div', undefined, 'terms-list');
    for (const term of termList()) {
      const card = el('section');
      card.append(el('h2', term.title, 'cc-title'), el('p', term.description));
      list.append(card);
    }
    section.append(list, link('업무 다시 고르기 →', '#/tasks', 'primary'));
  } else if (id === 'unsure') {
    const list = el('div', undefined, 'help-list');
    for (const example of exampleList()) list.append(link(example.label, pathFor(example.taskId)));
    list.append(link('아직 모르겠어요 →', '#/help/missing'));
    section.append(list);
  } else {
    section.append(
      el('p', '받은 지시에서 만들어야 할 결과물과 확인받을 담당자를 먼저 물어보세요.', 'help-copy'),
    );
    section.append(
      el('p', '일치하지 않는 업무를 임의로 골라 안내하지 않아요.', 'context-note'),
      link('지원 업무 살펴보기 →', '#/tasks', 'primary'),
    );
  }
  return section;
}

export function renderNavigation(root, route) {
  const renderers = { home, tasks: choose, category, task, search, help };
  const render = Object.hasOwn(renderers, route.name) ? renderers[route.name] : null;
  if (render) root.replaceChildren(render(route.id));
  else {
    const section = page('이 업무를 찾을 수 없어요.', '경로 확인', '#/', '← 홈으로');
    section.append(link('지원 업무 살펴보기 →', '#/tasks', 'primary'));
    root.replaceChildren(section);
  }
}

export function mountMenu(fallbackFocus) {
  const dialog = createDialog({
    dialog: document.querySelector('#menuDialog'),
    title: document.querySelector('#menuTitle'),
    body: document.querySelector('#menuBody'),
    closeButton: document.querySelector('#menuClose'),
    fallbackFocus,
  });
  document.querySelector('#menu').addEventListener('click', () => {
    const list = el('nav', undefined, 'help-list');
    list.setAttribute('aria-label', '주 메뉴');
    for (const [label, destination] of [
      ['홈', '#/'],
      ['업무 찾아보기', '#/tasks'],
      ['내 업무', '#/saved'],
      ['실무 연습하기', '#/learn'],
    ]) {
      const item = link(label, destination);
      item.addEventListener('click', dialog.close);
      list.append(item);
    }
    dialog.open('메뉴', list);
  });
}
