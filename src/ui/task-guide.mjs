import { element as el } from './elements.mjs';

// Basic preparation is available without changing earned levels or execution records.
// Both the introduction and the saved-work view use the same reviewed task content.
export function taskPreparation(task) {
  const body = el('div', undefined, 'task-preparation');
  for (const [title, text] of [
    ['어떤 자료를 준비하나요?', task.material],
    ['누구에게 확인하나요?', task.owner],
  ]) {
    const section = el('section', undefined, 'guide-section');
    section.append(el('h3', title, 'cc-title'), el('p', text));
    body.append(section);
  }
  return body;
}

export function taskSequence(task) {
  const body = el('details', undefined, 'guide-sequence');
  body.append(el('summary', '수행 순서 살펴보기'));
  const list = el('ol', undefined, 'guide-steps');
  for (const step of task.steps) {
    const row = el('li');
    row.append(el('strong', step.title), el('p', step.text));
    list.append(row);
  }
  body.append(list);
  return body;
}
