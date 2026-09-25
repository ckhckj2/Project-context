import { findTask } from './task-navigation.mjs';
import { projectContextOptions } from './work-context.mjs';

// Explicit catalog clues produce candidates, never a confirmed task or legal conclusion.
const clues = {
  'client-meeting': ['발주처', '협의자료', '회의자료'],
  'report-writing': ['보고서', '보고자료', '보고 자료', '피피티', 'ppt', '회의자료'],
  'permit-documents': ['인허가', '허가자료', '허가 자료', '제출자료'],
  'district-plan': ['지구단위', '지역계획'],
  'code-review': ['법규', '법령', '조례'],
  'review-report': ['심의'],
  'facade-review': ['입면', '디자인', '외관', '파사드'],
  'precedent-research': ['사례', '레퍼런스'],
  modeling: ['모델', '모델링', '스케치업', '라이노', 'bim'],
  rendering: ['cg', '렌더', '투시도', '조감도'],
  'drawing-revision': ['도면', '평면도', '고치', '고쳐', '수정'],
  'consultant-coordination': ['협력사', '협력업체', '구조', '설비', '회신', '담당자와 협의'],
  'change-review': ['설계변경', '변경업무', '변경허가'],
};
const normalize = (value) => value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');

export function inspectInstruction(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 300)
    return { ok: false, message: '받은 지시를 1~300자로 적어 주세요.' };
  const target = normalize(value);
  const matches = (labels) => labels.filter((label) => target.includes(normalize(label)));
  const candidates = Object.entries(clues).flatMap(([id, words]) => {
    const evidence = matches(words);
    return evidence.length ? [{ task: findTask(id), evidence: [...new Set(evidence)] }] : [];
  });
  const context = {};
  for (const key of ['facility', 'phase']) {
    const found = matches(projectContextOptions[key].slice(1));
    // Multiple mentions may describe alternatives. Ask the user instead of choosing one.
    context[key] = found.length === 1 ? found[0] : projectContextOptions[key][0];
  }
  return { ok: true, candidates, context };
}

export function createIntakeDraft() {
  // Kept in memory only: instructions never enter URLs or persistent storage.
  return { instruction: '', result: null, selected: null, context: null };
}
