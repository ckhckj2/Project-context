import { element, sourceLink } from '../../src/ui/elements.mjs';
import { createDialog } from '../../src/ui/dialog.mjs';
const open = document.querySelector('#open');
const output = document.querySelector('#output');
output.append(element('p', '<img src=x onerror="alert(1)">'));
for (const address of [
  'javascript:alert(1)',
  'data:text/html,x',
  'http://example.com',
  'https://user:secret@example.com',
]) {
  try {
    sourceLink('unsafe', address);
    output.dataset.unsafe = 'true';
  } catch {
    /* expected */
  }
}
output.append(sourceLink('근거', 'https://www.law.go.kr/'));
const dialog = createDialog({
  dialog: document.querySelector('#dialog'),
  title: document.querySelector('#title'),
  body: document.querySelector('#body'),
  closeButton: document.querySelector('#close'),
  fallbackFocus: () => open,
});
open.addEventListener('click', () => {
  const box = element('div');
  const next = element('button', '다음 안내');
  next.id = 'next';
  next.addEventListener('click', () => dialog.open('두 번째 안내', element('p', '안내 교체')));
  box.append(next);
  dialog.open('첫 안내', box);
});
