// Reviewed representative relationships; unrelated catalog tasks get no invented edges.
export const contextOptions = {
  facility: ['잘 모르겠어요', '공동주택', '업무시설', '공항시설', '기타 시설'],
  phase: [
    '잘 모르겠어요',
    '사전기획 / 사업검토',
    '기본계획',
    '계획설계',
    '중간설계',
    '실시설계',
    '시공·현장 대응',
  ],
};
export const essentialNotice =
  '체크는 개인 작업 기록입니다. 승인·법적 적합성을 뜻하지 않아요. 제출·변경 전 책임자와 실제 승인 절차를 확인하세요.';
export const relatedDefinitions = [
  {
    id: 'report-update',
    title: '보고서 반영',
    purpose: '수정한 도면과 보고 자료가 같은 내용을 전달하도록 맞춥니다.',
    material: '수정 도면 · 최신 보고서 · 면적표',
    owner: '보고자료 담당자·책임자',
    done: '대상 페이지와 수치가 수정 도면과 일치하는 상태',
    steps: [
      { id: 'pages', title: '대상 페이지 확인', text: '도면·면적표가 쓰인 페이지를 찾으세요.' },
      { id: 'update', title: '수정 내용 반영', text: '기준 도면과 보고 자료를 맞추세요.' },
      {
        id: 'compare',
        title: '전체 자료 대조',
        text: '본문과 수치에도 변경이 남았는지 확인하세요.',
      },
    ],
    sourceRef: 'docs/redesign/preview/content.mjs',
  },
  {
    id: 'consultant-send',
    title: '협력사 전달',
    purpose: '변경 내용과 확인할 질문을 해당 담당자에게 전달합니다.',
    material: '변경표 · 기준 도면 · 회신 목록',
    owner: '책임자·관련 분야 담당자',
    done: '받는 사람·자료·회신할 내용이 정리된 상태',
    steps: [
      { id: 'recipient', title: '수신 대상 확인', text: '관련 분야 담당자를 확인하세요.' },
      {
        id: 'materials',
        title: '기준 자료 정리',
        text: '변경 내용과 기준 도면을 함께 준비하세요.',
      },
      { id: 'reply', title: '회신 항목 확인', text: '확인이 필요한 내용과 회신 시점을 정하세요.' },
    ],
    sourceRef: 'docs/redesign/preview/content.mjs',
  },
  {
    id: 'document-match',
    title: '도면·보고서 일치 확인',
    purpose: '수정 도면과 보고서를 함께 확인하세요.',
    material: '검토할 도면 · 수정 보고서',
    owner: '도면·보고자료 담당자',
    done: '자료 사이의 불일치가 확인·정리된 상태',
    steps: [
      { id: 'revision', title: '기준본 대조', text: '같은 변경 상태인지 확인하세요.' },
      { id: 'values', title: '수치·표현 대조', text: '도면과 보고서의 수치·설명을 확인하세요.' },
    ],
    sourceRef: 'docs/redesign/preview/content.mjs',
  },
];
export const drawingBranches = {
  report: { title: '보고서에도 반영하기', nodes: ['report-update', 'document-match'] },
  send: { title: '협력사에 전달하기', nodes: ['consultant-send'] },
};
export const drawingEdges = [
  { from: 'drawing-revision', to: 'report-update', kind: 'prerequisite' },
  { from: 'drawing-revision', to: 'consultant-send', kind: 'prerequisite' },
  { from: 'drawing-revision', to: 'document-match', kind: 'prerequisite' },
  { from: 'report-update', to: 'document-match', kind: 'prerequisite' },
];
