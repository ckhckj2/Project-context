import { element as el, navigationLink as link } from './elements.mjs';
import { tasks } from '../content/catalog.mjs';

function button(label, handler, className = 'work-secondary') {
  const node = el('button', label, className + ' cc-control');
  node.type = 'button';
  node.addEventListener('click', handler);
  return node;
}
function page(title, back = '#/learn') {
  const section = el('section', undefined, 'page learning-page');
  section.append(link('← 돌아가기', back, 'back-link'));
  const h1 = el('h1', title, 'cc-title');
  h1.tabIndex = -1;
  section.append(
    h1,
    el(
      'p',
      '학습 기록은 이 브라우저에 자동 저장돼요. 저장 상태는 화면 위에서 확인할 수 있어요.',
      'context-note',
    ),
  );
  return section;
}
export function renderLearning(root, route, learning, dialog) {
  const sourceTask = route.name === 'practice' ? tasks.find((task) => task.id === route.id) : null;
  const trackId = sourceTask?.trackId ?? route.id;
  function error(message) {
    const node = root.querySelector('.learning-error');
    if (node) {
      node.textContent = message;
      node.focus();
    }
  }
  function command(action) {
    try {
      action();
      paint();
      root.querySelector('h1')?.focus();
    } catch {
      error('요청을 적용하지 못했어요. 답변 형식과 진행 중인 도전을 확인해 주세요.');
    }
  }
  function status(section) {
    const node = el('p', undefined, 'learning-error');
    node.setAttribute('role', 'alert');
    node.tabIndex = -1;
    section.append(node);
  }
  function start(mode) {
    command(() => learning.start(trackId, mode, sourceTask?.id));
  }
  function abandon() {
    const body = el('div');
    body.append(
      el('p', '지금 풀던 답변은 지워집니다. 이미 획득한 분야 레벨은 유지돼요.'),
      button(
        '풀이 그만두기',
        () => {
          dialog.close();
          command(() => learning.abandon(trackId, true));
        },
        'primary',
      ),
    );
    dialog.open('이번 풀이를 그만둘까요?', body);
  }
  function lobby() {
    const section = page('어떤 분야를 연습할까요?', '#/');
    const cards = el('div', undefined, 'learning-tracks');
    for (const value of learning.tracks()) {
      const card = link('', '#/learn/' + value.track.id, 'category-card');
      card.append(
        el('strong', value.track.title),
        el('span', 'LV' + value.earnedLevel),
        el(
          'small',
          value.attempt && value.attempt.phase !== 'finished'
            ? '풀던 문제 이어가기 →'
            : '도전 살펴보기 →',
        ),
      );
      cards.append(card);
    }
    section.append(cards, link('기존 퀴즈와 성적 보기', '../index.html?entry=quiz', 'help-link'));
    return section;
  }
  function trackHome(state) {
    const section = page(sourceTask ? '업무 중 한 문제' : state.track.title);
    const card = el('section', undefined, 'learning-intro');
    card.append(el('p', '현재 LV' + state.earnedLevel, 'eyebrow'));
    if (sourceTask) {
      card.append(
        el('h2', sourceTask.title, 'cc-title'),
        el('p', '관련 분야의 기본 절차를 한 문제로 확인해요. 승급에는 반영하지 않아요.'),
        button('한 문제 풀기', () => start('single'), 'primary'),
      );
    } else if (state.earnedLevel < 5) {
      const total = state.earnedLevel === 4 ? 8 : 5,
        threshold = state.earnedLevel === 4 ? 7 : 4;
      card.append(
        el('h2', 'LV' + (state.earnedLevel + 1) + ' 도전', 'cc-title'),
        el('p', `${total}문항 중 ${threshold}개 이상 맞히면 이 분야만 올라가요.`),
        button('승급 도전하기', () => start('promotion'), 'primary'),
      );
    } else
      card.append(
        el('h2', 'LV5까지 도달했어요.', 'cc-title'),
        el('p', '필요한 설명 깊이로 돌아가거나 짧게 복습할 수 있어요.'),
      );
    section.append(card);
    if (!sourceTask)
      section.append(button('3문제 연습하기 · 승급 반영 없음', () => start('practice')));
    status(section);
    return section;
  }
  function result(state) {
    const attempt = state.attempt,
      section = page(attempt.promotionApplied ? '한 단계 올라갔어요.' : '이번 풀이를 마쳤어요.');
    const card = el('section', undefined, 'learning-intro');
    card.append(el('h2', `${attempt.score} / ${attempt.total} 정답`, 'cc-title'));
    card.append(
      el(
        'p',
        attempt.promotionApplied
          ? `${state.track.title} LV${state.earnedLevel} · 다른 분야와 보기 깊이는 그대로예요.`
          : attempt.mode === 'promotion'
            ? '레벨은 그대로예요. 해설을 복습하고 다시 도전할 수 있어요.'
            : '연습 결과는 승급에 반영하지 않아요.',
      ),
    );
    section.append(
      card,
      button(
        attempt.promotionApplied ? '다음 레벨 도전' : '한 번 더 풀기',
        () => start(attempt.mode),
        'primary',
      ),
      button('다른 도전 고르기', () => command(() => learning.abandon(trackId, true))),
      link('분야 선택으로', '#/learn', 'help-link'),
    );
    if (attempt.mode === 'promotion' && state.earnedLevel === 5)
      section.querySelector('button').hidden = true;
    section.append(
      el('p', '학습 기록이며 전문 자격이나 기관 승인을 의미하지 않아요.', 'context-note'),
    );
    status(section);
    return section;
  }
  function question(state) {
    const attempt = state.attempt,
      q = attempt.question,
      section = page(state.track.title);
    const progress = el(
      'p',
      `${attempt.index + 1} / ${attempt.total} · ${attempt.mode === 'promotion' ? '승급 도전' : '연습'}`,
      'eyebrow',
    );
    section.append(progress);
    if (sourceTask && attempt.mode !== 'single')
      section.append(el('p', '이 분야에서 진행 중이던 풀이를 이어갑니다.', 'context-note'));
    const prompt = el('h2', q.prompt, 'quiz-prompt cc-title');
    prompt.id = 'quiz-prompt';
    section.append(prompt);
    if (attempt.phase === 'feedback') {
      const feedback = el('section', undefined, 'quiz-feedback');
      feedback.setAttribute('role', 'status');
      feedback.append(
        el(
          'h3',
          attempt.feedback.correct
            ? '맞았어요.'
            : attempt.feedback.skipped
              ? '건너뛴 문제예요.'
              : '다시 확인해 봐요.',
          'cc-title',
        ),
        el('p', '정답: ' + attempt.feedback.correctAnswer),
        el('p', attempt.feedback.reason),
      );
      if (attempt.feedback.reason !== attempt.feedback.explanation)
        feedback.append(el('p', attempt.feedback.explanation));
      const review = link('관련 업무 설명 읽기', '#/flow/' + q.taskId, 'help-link');
      review.addEventListener('click', () => learning.review(trackId));
      section.append(
        feedback,
        button(
          attempt.index + 1 === attempt.total ? '결과 확인' : '다음 문제',
          () => command(() => learning.next(trackId)),
          'primary',
        ),
        review,
      );
      status(section);
      return section;
    }
    const answers = el('div', undefined, 'quiz-answers');
    answers.setAttribute('aria-labelledby', 'quiz-prompt');
    if (q.type === 'choice') {
      answers.setAttribute('role', 'radiogroup');
      for (const option of q.options) {
        const label = el('label', undefined, 'quiz-choice'),
          input = el('input');
        input.type = 'radio';
        input.name = 'quiz-choice';
        input.value = option.id;
        input.checked = attempt.draft === option.id;
        input.addEventListener('change', () => {
          try {
            learning.setDraft(trackId, option.id);
          } catch {
            error('선택을 반영하지 못했어요. 다시 선택해 주세요.');
          }
        });
        label.append(input, el('span', option.label));
        answers.append(label);
      }
    } else if (q.type === 'short') {
      const label = el('label', '답을 짧게 입력하세요.'),
        input = el('input', undefined, 'quiz-short');
      input.type = 'text';
      input.maxLength = 100;
      input.autocomplete = 'off';
      input.value = attempt.draft;
      input.addEventListener('input', () => {
        try {
          learning.setDraft(trackId, input.value);
        } catch {
          error('100자 이내의 일반 텍스트를 입력해 주세요.');
        }
      });
      label.append(input);
      answers.append(label);
    } else {
      answers.append(el('p', '먼저 할 일부터 차례로 눌러주세요.'));
      for (const option of q.options) {
        const index = attempt.draft.indexOf(option.id),
          node = button(
            (index < 0 ? '' : index + 1 + '. ') + option.label,
            () => command(() => learning.setDraft(trackId, [...attempt.draft, option.id])),
            'quiz-order',
          );
        node.disabled = index >= 0;
        node.setAttribute('aria-pressed', String(index >= 0));
        node.dataset.option = option.id;
        answers.append(node);
      }
      if (attempt.draft.length)
        answers.append(
          button('마지막 선택 취소', () =>
            command(() => learning.setDraft(trackId, attempt.draft.slice(0, -1))),
          ),
        );
    }
    section.append(
      answers,
      button(
        '답 확인',
        () => {
          try {
            learning.answer(trackId);
            paint();
            root.querySelector('.quiz-feedback')?.scrollIntoView({ block: 'nearest' });
            root.querySelector('h1')?.focus();
          } catch {
            error(
              q.type === 'order'
                ? '모든 항목의 순서를 선택해 주세요.'
                : '답을 입력하거나 보기에서 선택해 주세요.',
            );
          }
        },
        'primary',
      ),
      button('모르겠어요 · 건너뛰기', () => command(() => learning.answer(trackId, true))),
    );
    const pause = el('details', undefined, 'work-fold');
    pause.append(
      el('summary', '풀이 관리'),
      link('나중에 이어 풀기', '#/learn', 'help-link'),
      button('이번 풀이 그만두기', abandon),
    );
    section.append(pause);
    status(section);
    return section;
  }
  function paint() {
    if (route.name === 'learn' && !trackId) {
      root.replaceChildren(lobby());
      return;
    }
    const state = learning.snapshot(trackId);
    root.replaceChildren(
      !state.attempt
        ? trackHome(state)
        : state.attempt.phase === 'finished'
          ? result(state)
          : question(state),
    );
  }
  paint();
}
