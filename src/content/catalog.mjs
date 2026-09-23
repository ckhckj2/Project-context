// IDs survive title changes. Track assignments remain an editorial proposal.
// This catalog does not pretend that migrated task bodies or new quizzes exist.
export const tracks = Object.freeze([
  Object.freeze({ id: 'design', title: '도면·설계' }),
  Object.freeze({ id: 'permit', title: '법규·인허가' }),
  Object.freeze({ id: 'collaboration', title: '협업·전달' }),
]);

export const tasks = Object.freeze(
  [
    { id: 'client-meeting', title: '발주처 협의자료 작성', trackId: 'collaboration' },
    { id: 'report-writing', title: '보고서 작성', trackId: 'collaboration' },
    { id: 'permit-documents', title: '인허가 자료 작성', trackId: 'permit' },
    { id: 'district-plan', title: '지구단위계획 조사', trackId: 'permit' },
    { id: 'code-review', title: '법규 검토', trackId: 'permit' },
    { id: 'review-report', title: '심의 보고자료 작성', trackId: 'permit' },
    { id: 'facade-review', title: '입면·디자인 검토', trackId: 'design' },
    { id: 'precedent-research', title: '사례조사', trackId: 'design' },
    { id: 'modeling', title: '모델링', trackId: 'design' },
    { id: 'rendering', title: 'CG·렌더링', trackId: 'design' },
    { id: 'drawing-revision', title: '도면 수정', trackId: 'design' },
    { id: 'consultant-coordination', title: '협력업체 조정', trackId: 'collaboration' },
    { id: 'change-review', title: '변경업무 검토', trackId: 'permit' },
  ].map((task) =>
    Object.freeze({ ...task, sourceRef: 'v2_data.js', reviewStatus: 'mapping-proposal' }),
  ),
);
