import { createReadingProfile } from '../../src/application/reading-profile.mjs';
import { createExecutionSession } from '../../src/application/execution-session.mjs';
import { renderExecution, mountExecutionDialog } from '../../src/ui/execution-view.mjs';
import { tasks } from '../../src/content/catalog.mjs';
export const profile = createReadingProfile({ design: 5, permit: 5, collaboration: 5 });
const sessions = new Map(),
  dialog = mountExecutionDialog();
const select = document.querySelector('#review-task');
for (const task of tasks) {
  const option = document.createElement('option');
  option.value = task.id;
  option.textContent = task.title;
  select.append(option);
}
select.value = 'drawing-revision';
function render() {
  dialog.close();
  if (!sessions.has(select.value))
    sessions.set(select.value, createExecutionSession(select.value, profile));
  renderExecution(document.querySelector('#main'), sessions.get(select.value), dialog);
}
select.addEventListener('change', render);
render();
