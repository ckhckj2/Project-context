import { petRequest } from '../src/application/pet-entry.mjs';
import { restorePetProject } from '../src/ui/pet-project.mjs';
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
  const pet = petRequest(location.hash);
  if (pet) {
    history.replaceState(null, '', location.pathname + location.search);
    const tell = (text) => {
      const note = document.createElement('p');
      note.className = 'page-card';
      note.setAttribute('role', 'status');
      note.textContent = text;
      document.querySelector('main')?.prepend(note);
    };
    if (pet.error) {
      window.showView('projects');
      tell('척척펫 연결 정보를 읽지 못했어요. 펫에서 다시 열어 주세요.');
      return;
    }
    if (!pet.projectId || pet.phase === 'general') {
      window.CC_RUNTIME.search(pet.taskTitle || pet.general || '업무 순서');
      tell('프로젝트 조건을 적용하지 않은 일반 도움입니다.');
      return;
    }
    const result = restorePetProject(pet.projectId, window, document);
    if (!result.ok) {
      window.showView('projects');
      tell(
        '이 브라우저에서 같은 프로젝트를 찾지 못했어요. 프로젝트를 확인한 뒤 펫에 다시 가져와 주세요.',
      );
      return;
    }
    const task = document.getElementById('task');
    const phase = document.getElementById('phase');
    if (
      !pet.taskTitle ||
      !Array.from(task.options).some((option) => option.value === pet.taskTitle) ||
      !Array.from(phase.options).some((option) => option.value === result.phase)
    ) {
      window.showView('projects');
      tell('업무 또는 단계를 확인한 뒤 웹에서 선택해 주세요.');
      return;
    }
    task.value = pet.taskTitle;
    phase.value = result.phase;
    window.CC_CONTEXT_RENDERER.render();
    if (result.phase !== pet.phase)
      tell(
        '웹에서 변경된 최신 프로젝트 단계를 적용했어요. 펫의 프로젝트 파일도 다시 가져와 주세요.',
      );
    return;
  }
  if (!request) return;
  window.showView(request.view);
  if (!request.taskTitle) return;
  // Independent search does not borrow a saved project's approval/facility context.
  window.CC_RUNTIME.search(request.taskTitle);
});
