import { petRequest, restorePetProject } from '../src/application/pet-entry.mjs';
// Compatibility adapter for original projects, scores and unmigrated reference content.
// Modules finish before DOMContentLoaded, so registration precedes CC_BOOT.run.
import { legacyRequest } from '../src/application/task-navigation.mjs';

const params = new URLSearchParams(location.search);
const request = legacyRequest(params.get('entry'), params.get('task'));
window.CC_BOOT.register('redesign-entry', () => {
  // The legacy sidebar is rebuilt during boot, so attach after its owner finishes.
  const download = document.createElement('a');
  download.href = './app/pet-download.html';
  download.className = 'cc-pet-sidebar';
  download.textContent = '↓ 척척펫 다운로드';
  document.querySelector('.cc212-sub-nav')?.append(download);
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
      const container =
        document.querySelector(
          '#view-context.active #contextResult, #view-search.active #searchResult',
        ) || document.querySelector('.view.active');
      container?.prepend(note);
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
    const result = restorePetProject(
      pet.projectId,
      window.CC_PROJECT_STORE,
      Array.from(document.getElementById('project').options, (option) => option.value),
      Array.from(document.getElementById('phase').options, (option) => option.value),
    );
    if (!result.ok) {
      window.showView('projects');
      tell(
        '이 브라우저에서 같은 프로젝트를 찾지 못했어요. 프로젝트를 확인한 뒤 펫에 다시 가져와 주세요.',
      );
      return;
    }
    window.dispatchEvent(new window.StorageEvent('storage', { key: 'cc_active_project_v1' }));
    const task = document.getElementById('task');
    const phase = document.getElementById('phase');
    if (!pet.taskTitle) {
      // Opening the web before choosing a task is a valid, shallower handoff.
      task.value = '';
      task.dispatchEvent(new window.Event('change', { bubbles: true }));
      window.showView('home');
      tell('프로젝트를 불러왔어요. 궁금한 업무를 선택해 주세요.');
      return;
    }
    if (
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
