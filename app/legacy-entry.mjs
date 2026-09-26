// Compatibility adapter for original projects, scores and unmigrated reference content.
// Modules finish before DOMContentLoaded, so registration precedes CC_BOOT.run.
import { legacyRequest } from '../src/application/task-navigation.mjs';

const params = new URLSearchParams(location.search);
const request = legacyRequest(params.get('entry'), params.get('task'));
window.CC_BOOT.register('redesign-entry', () => {
  // An exact navigation command, not an authorization or a general search keyword.
  window.CC_RUNTIME.registerSearch(
    'development',
    (query) => query.normalize('NFKC').replace(/\s+/g, '') === '관리자모드로이동해줘',
    () => location.assign(new URL('./', import.meta.url).href),
  );
  if (!request) return;
  window.showView(request.view);
  if (!request.taskTitle) return;
  // Independent search does not borrow a saved project's approval/facility context.
  window.CC_RUNTIME.search(request.taskTitle);
});
