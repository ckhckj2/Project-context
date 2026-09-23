// Compatibility adapter for original projects, scores and unmigrated reference content.
// Modules finish before DOMContentLoaded, so registration precedes CC_BOOT.run.
import { legacyRequest } from '../src/application/task-navigation.mjs';

const params = new URLSearchParams(location.search);
const request = legacyRequest(params.get('entry'), params.get('task'));
if (request) {
  window.CC_BOOT.register('redesign-entry', () => {
    window.showView(request.view);
    if (!request.taskTitle) return;
    // Independent search does not borrow a saved project's approval/facility context.
    window.CC_RUNTIME.search(request.taskTitle);
  });
}
