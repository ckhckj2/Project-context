// Representative design content, not the complete production catalog.
export const groups = [
  {
    name: '도면·설계',
    help: '그리고 고치는 일',
    tasks: ['도면 수정', '입면·디자인 검토', '모델링', 'CG·렌더링', '사례조사'],
  },
  {
    name: '보고·회의',
    help: '설명하고 결정받을 자료 만들기',
    tasks: ['보고서 작성', '발주처 협의자료 작성', '심의 보고자료 작성'],
  },
  { name: '협의·전달', help: '담당자와 자료를 주고받는 일', tasks: ['협력업체 조정'] },
  {
    name: '법규·인허가',
    help: '기준과 승인 절차를 확인하는 일',
    tasks: [
      '법규 검토',
      '인허가 자료 작성',
      '지구단위계획 조사',
      '심의 보고자료 작성',
      '변경업무 검토',
    ],
  },
];
export const tasks = {
  drawing: {
    title: '도면 수정',
    next: '수정 범위부터 확인하세요.',
    steps: [
      ['수정 요청 확인', '무엇을 왜 바꾸는지 확인하세요.'],
      ['관련 도면 확인', '함께 바뀌는 도면을 확인하세요.'],
      ['협의 대상 확인', '다른 분야에 영향이 있는지 살펴보세요.'],
    ],
    done: '수정 범위와 협의 대상이 정리된 상태',
  },
  report: {
    title: '보고서 반영',
    next: '수정한 도면이 들어간 페이지를 찾으세요.',
    steps: [
      ['대상 페이지 확인', '도면·면적표가 쓰인 페이지를 찾으세요.'],
      ['수정 내용 반영', '기준 도면과 보고 자료를 맞추세요.'],
      ['전체 자료 대조', '본문과 수치에도 변경이 남았는지 확인하세요.'],
    ],
    done: '대상 페이지와 수치가 수정 도면과 일치하는 상태',
  },
  send: {
    title: '협력사 전달',
    next: '받을 담당자와 전달 범위를 확인하세요.',
    steps: [
      ['수신 대상 확인', '관련 분야 담당자를 확인하세요.'],
      ['기준 자료 정리', '변경 내용과 기준 도면을 함께 준비하세요.'],
      ['회신 항목 확인', '확인이 필요한 내용과 회신 시점을 정하세요.'],
    ],
    done: '받는 사람·자료·회신할 내용이 정리된 상태',
  },
  check: {
    title: '도면·보고서 일치 확인',
    next: '수정 도면과 보고서를 함께 확인하세요.',
    steps: [
      ['기준본 대조', '같은 변경 상태인지 확인하세요.'],
      ['수치·표현 대조', '도면과 보고서의 수치·설명을 확인하세요.'],
    ],
    done: '자료 사이의 불일치가 확인·정리된 상태',
  },
};

const stepIds = {
  drawing: ['request', 'drawings', 'coordination'],
  report: ['pages', 'update', 'compare'],
  send: ['recipient', 'materials', 'reply'],
  check: ['revision', 'values'],
};
export const configuration = {
  definitions: Object.entries(tasks).map(([id]) => ({ id, steps: stepIds[id] })),
  rootId: 'drawing',
  additions: { report: ['report', 'check'], send: ['send'] },
  edges: [
    { from: 'drawing', to: 'report', kind: 'prerequisite' },
    { from: 'drawing', to: 'send', kind: 'prerequisite' },
    { from: 'report', to: 'check', kind: 'prerequisite' },
  ],
  // All levels are available ONLY for visual review; not a real earned record.
  earnedLevel: 5,
  facilities: ['잘 모르겠어요', '공동주택', '업무시설', '공항시설'],
  phases: ['잘 모르겠어요', '기본계획', '계획설계', '중간설계', '실시설계'],
};
export const stepKey = (id, index) => id + ':' + stepIds[id][index];
