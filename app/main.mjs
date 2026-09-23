// Composition root: browser history and DOM owners are wired here, not in domain.
import { routeFromHash } from '../src/application/task-navigation.mjs';
import { renderNavigation, mountMenu } from '../src/ui/task-navigation.mjs';

import { renderExecution, mountExecutionDialog } from '../src/ui/execution-view.mjs';
import { renderLearning } from '../src/ui/learning-view.mjs';
import {
  createProgressWorkspace,
  validateProgress,
} from '../src/application/progress-workspace.mjs';
import { createPersistenceSession } from '../src/application/persistence-session.mjs';
import { createValidatedStore } from '../src/infrastructure/validated-store.mjs';
import { openFirstSave, renderSavedWorks, mountSaveStatus } from '../src/ui/progress-view.mjs';
const workDialog = mountExecutionDialog();
const key = 'cc_redesign_progress_v1';
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = null;
}
const store = createValidatedStore({ storage, key, validate: validateProgress, maxLength: 200000 });
const initial = store.read();
let showStatus = () => {};
let confirmedReload = false;
const persistence = createPersistenceSession({
  store,
  initial,
  exclusive: (action) => {
    if (!navigator.locks) return Promise.reject(new Error('Exclusive storage unavailable'));
    return navigator.locks.request('cc-redesign-progress-v1', action);
  },
  report: (status) => showStatus(status),
});
const workspace = createProgressWorkspace(initial.ok ? initial.data : null, (value) =>
  persistence.changed(value),
);
const learning = workspace.learning;
showStatus = mountSaveStatus(document.querySelector('#saveStatus'), {
  retry: () => persistence.retry(),
  reload: () => {
    confirmedReload = true;
    location.reload();
  },
  dialog: workDialog,
});
showStatus(persistence.status());
window.addEventListener('storage', (event) => {
  if (event.storageArea === storage && (event.key === key || event.key === null))
    persistence.externalChange(event.newValue);
});
window.addEventListener('beforeunload', (event) => {
  if (!confirmedReload && persistence.hasPending()) {
    event.preventDefault();
    event.returnValue = '';
  }
});

const main = document.querySelector('#main');
document.querySelector('.skip-link').addEventListener('click', (event) => {
  event.preventDefault();
  main.focus();
});
let previousHash = location.hash;
function render(moveFocus = false) {
  workDialog.close();
  const route = routeFromHash(location.hash);
  if (route.name === 'flow') {
    renderExecution(
      main,
      workspace.draft(route.id),
      workDialog,
      learning.reviewDestination(route.id),
      {
        save: () =>
          openFirstSave(workDialog, workspace.taskTitle(route.id), (title) => {
            const id = workspace.saveDraft(route.id, title);
            location.hash = '#/work/' + id;
            return id;
          }),
      },
    );
  } else if (route.name === 'work') {
    const item = workspace.list().find((value) => value.id === route.id && !value.trashed);
    if (item)
      renderExecution(main, workspace.work(route.id), workDialog, null, {
        saved: true,
        title: item.title,
      });
    else renderSavedWorks(main, workspace, workDialog);
  } else if (route.name === 'saved') renderSavedWorks(main, workspace, workDialog);
  else if (['learn', 'quiz', 'practice'].includes(route.name))
    renderLearning(main, route, learning, workDialog);
  else renderNavigation(main, route);
  document.title = `${main.querySelector('h1')?.textContent ?? '척척'} · 척척`;
  if (moveFocus) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.querySelector('h1')?.focus();
  }
}
mountMenu(() => document.querySelector('.brand'));
window.addEventListener('hashchange', () => {
  if (location.hash === '#main') {
    main.focus();
    return;
  }
  if (location.hash !== previousHash) {
    previousHash = location.hash;
    render(true);
  }
});
render();
