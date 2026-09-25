import { element as el, navigationLink as link } from './elements.mjs';
import { inspectInstruction } from '../application/work-intake.mjs';
import { projectContextOptions } from '../application/work-context.mjs';

function button(label, action, className = 'work-secondary') {
  const control = el('button', label, className + ' cc-control');
  control.type = 'button';
  control.addEventListener('click', action);
  return control;
}

export function instructionForm(value, submit) {
  const form = el('form', undefined, 'instruction-form');
  const label = el('label', '받은 업무 지시');
  const input = el('textarea');
  input.id = 'work-instruction';
  input.rows = 2;
  input.maxLength = 300;
  input.required = true;
  input.value = value;
  input.placeholder = '예: 중간설계 중인 운수시설 사례를 조사하래요';
  input.setAttribute('aria-describedby', 'instruction-note');
  label.htmlFor = input.id;
  const note = el(
    'p',
    '업무에 필요한 말만 적어 주세요. 입력한 지시는 외부로 전송하거나 저장하지 않아요.',
    'context-note',
  );
  note.id = 'instruction-note';
  const action = el('button', '관련 업무 찾기 →', 'primary cc-control');
  action.type = 'submit';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submit(input.value);
  });
  form.append(label, input, note, action);
  return form;
}

export function renderIntake(root, draft, start) {
  function paint(focus = false) {
    const page = el('section', undefined, 'page intake-page');
    page.append(link('← 홈으로', '#/', 'back-link'));
    const trail = el('ol', undefined, 'intake-trail');
    for (const [index, title] of ['지시 입력', '업무 확인', '조건 확인'].entries()) {
      const item = el('li', String(index + 1).padStart(2, '0') + ' ' + title);
      if (index === (draft.selected ? 2 : draft.result ? 1 : 0))
        item.setAttribute('aria-current', 'step');
      trail.append(item);
    }
    page.append(trail);
    const title = el(
      'h1',
      draft.selected
        ? '어떤 상황의 업무인가요?'
        : draft.result
          ? '맡은 업무를 확인해 주세요.'
          : '받은 지시에서 시작해요.',
      'cc-title',
    );
    title.tabIndex = -1;
    page.append(title);
    if (!draft.result) {
      page.append(
        instructionForm(draft.instruction, (value) => {
          draft.instruction = value;
          draft.result = inspectInstruction(value);
          paint(true);
        }),
      );
    } else {
      const quote = el('blockquote', draft.instruction, 'intake-instruction');
      page.append(
        quote,
        button(
          '지시 수정하기',
          () => {
            draft.result = null;
            draft.selected = null;
            draft.context = null;
            paint(true);
          },
          'text-button',
        ),
      );
      if (!draft.result.ok) page.append(el('p', draft.result.message, 'work-notice'));
      else if (!draft.selected) {
        page.append(
          el(
            'p',
            draft.result.candidates.length
              ? '입력한 단어와 관련된 업무예요. 여러 일을 맡았다면 먼저 할 하나를 골라 주세요.'
              : '맞는 업무를 찾지 못했어요. 지시를 구체적으로 적거나 업무 목록에서 골라 주세요.',
            'intake-lead',
          ),
        );
        const list = el('div', undefined, 'intake-candidates');
        for (const { task, evidence } of draft.result.candidates) {
          const choice = button(
            '',
            () => {
              draft.selected = task;
              draft.context = { ...draft.result.context };
              paint(true);
            },
            'intake-candidate',
          );
          choice.dataset.intakeTask = task.id;
          choice.append(
            el('strong', task.title),
            el('span', task.description),
            el('small', '관련 단어 · ' + evidence.join(' · ')),
            el('span', '이 업무로 진행 →', 'intake-choice-action'),
          );
          list.append(choice);
        }
        page.append(list, link('전체 업무에서 직접 고르기 →', '#/tasks', 'help-link'));
      } else {
        const selected = el('div', undefined, 'intake-selected');
        selected.append(
          el('span', '확인한 업무'),
          el('strong', draft.selected.title),
          button(
            '다른 업무 선택',
            () => {
              draft.selected = null;
              paint(true);
            },
            'text-button',
          ),
        );
        page.append(
          selected,
          el(
            'p',
            '시설은 전체 지도에, 설계 단계는 실행 관점에 반영돼요. 모르면 그대로 시작해도 돼요.',
            'intake-lead',
          ),
        );
        const form = el('form', undefined, 'intake-context');
        for (const [key, label] of [
          ['facility', '어떤 시설인가요?'],
          ['phase', '어느 설계 단계인가요?'],
        ]) {
          const field = el('div', undefined, 'intake-field');
          const found = draft.context[key] !== projectContextOptions[key][0];
          if (found) {
            field.append(
              el(
                'span',
                (draft.context[key] === draft.result.context[key] ? '입력에서 찾은 ' : '선택한 ') +
                  (key === 'facility' ? '시설' : '단계'),
              ),
              el('strong', draft.context[key]),
              button('수정', () => {
                draft.context[key] = projectContextOptions[key][0];
                paint(true);
              }),
            );
          } else {
            const caption = el('label', label);
            const select = el('select');
            select.id = 'intake-' + key;
            caption.htmlFor = select.id;
            for (const name of projectContextOptions[key]) {
              const option = el('option', name === '공항시설' ? '공항시설 / 격납고' : name);
              option.value = name;
              select.append(option);
            }
            select.addEventListener('change', () => {
              draft.context[key] = select.value;
            });
            field.append(caption, select);
          }
          form.append(field);
        }
        const first = el('div', undefined, 'intake-first');
        first.append(
          el('span', '시작하면 할 일'),
          el('strong', draft.selected.firstAction.title),
          el('p', draft.selected.firstAction.hint),
        );
        const action = el('button', '이 조건으로 업무 시작 →', 'primary cc-control');
        action.type = 'submit';
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          start(draft.selected.id, { ...draft.context });
        });
        page.append(first, form);
        form.append(action);
      }
    }
    root.replaceChildren(page);
    if (focus) title.focus();
  }
  paint();
}
