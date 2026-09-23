// Navigation groups are not learning tracks. A task may appear in two groups
// while keeping one stable ID and one progress record.
export const categories = [
  {
    id: 'design',
    title: '도면·설계',
    description: '도면을 그리고, 고치고, 모양을 검토해요.',
    taskIds: ['drawing-revision', 'facade-review', 'modeling', 'rendering', 'precedent-research'],
  },
  {
    id: 'report',
    title: '보고·회의',
    description: '설명하거나 결정받을 자료를 만들어요.',
    taskIds: ['report-writing', 'client-meeting', 'review-report'],
  },
  {
    id: 'coordinate',
    title: '협의·전달',
    description: '다른 담당자와 자료·의견을 주고받아요.',
    taskIds: ['consultant-coordination'],
  },
  {
    id: 'permit',
    title: '법규·인허가',
    description: '지켜야 할 기준과 승인 절차를 확인해요.',
    taskIds: ['code-review', 'permit-documents', 'district-plan', 'review-report', 'change-review'],
  },
];

export const taskHelp = {
  'client-meeting': {
    description: '발주처와 이야기할 도면·자료를 준비해요.',
    aliases: ['발주처', '협의자료', '회의자료'],
  },
  'report-writing': {
    description: '검토한 내용을 읽기 쉬운 자료로 정리해요.',
    aliases: ['보고서', '보고자료', '회의자료', '피피티', 'ppt'],
  },
  'permit-documents': {
    description: '허가·승인 절차에 필요한 자료를 준비해요.',
    aliases: ['인허가', '허가자료', '제출자료'],
  },
  'district-plan': {
    description: '이 땅에 따로 적용되는 계획을 찾아봐요.',
    aliases: ['지구단위', '땅', '대지', '지역계획'],
  },
  'code-review': {
    description: '설계가 지켜야 할 기준을 확인해요.',
    aliases: ['법규', '기준', '법령', '조례'],
  },
  'review-report': {
    description: '심의를 받을 설계안과 설명 자료를 준비해요.',
    aliases: ['심의', '심의자료', '심의보고서'],
  },
  'facade-review': {
    description: '건물의 겉모습과 디자인을 검토해요.',
    aliases: ['입면', '디자인', '외관', '파사드'],
  },
  'precedent-research': {
    description: '참고할 사례를 찾아 비교해요.',
    aliases: ['사례', '레퍼런스', '참고'],
  },
  modeling: {
    description: '공간과 형태를 입체 모델로 만들어요.',
    aliases: ['모델', '모델링', '스케치업', '라이노', 'bim'],
  },
  rendering: {
    description: '설계안을 이미지로 표현해요.',
    aliases: ['cg', '렌더링', '투시도', '조감도'],
  },
  'drawing-revision': {
    description: '수정 지시를 관련 도면에 반영해요.',
    aliases: ['도면', '도면수정', '평면도', '수정', '고치기'],
  },
  'consultant-coordination': {
    description: '함께 설계하는 업체와 조건·일정을 맞춰요.',
    aliases: ['협력사', '협력업체', '구조', '설비', '조정', '회신'],
  },
  'change-review': {
    description: '설계 변경이 다른 자료와 절차에 주는 영향을 살펴봐요.',
    aliases: ['변경', '변경업무', '변경허가'],
  },
};

export const examples = [
  { label: '도면을 고치라고 했어요.', taskId: 'drawing-revision' },
  { label: '보고 자료를 만들라고 했어요.', taskId: 'report-writing' },
  { label: '다른 담당자와 협의하라고 했어요.', taskId: 'consultant-coordination' },
];

export const terms = [
  { title: '인허가', description: '관청 등에 필요한 허가·승인을 확인하고 받는 절차예요.' },
  { title: '협력사', description: '구조·설비 등 다른 분야의 설계를 함께 맡는 업체예요.' },
  { title: '발주처', description: '사업을 맡기고 필요한 결과물을 요청하는 쪽이에요.' },
  { title: '심의', description: '정해진 기준에 따라 설계안을 검토받는 과정이에요.' },
];

// Beginner summaries. Original common guidance remains in start-guides.
export const firstActions = {
  'client-meeting': {
    title: '이번 회의의 목적 확인',
    hint: '어떤 결정을 받아야 하는지 요청자와 먼저 맞춰보세요.',
  },
  'report-writing': {
    title: '보고서의 목적 확인',
    hint: '누가 무엇을 결정할 자료인지 먼저 확인하세요.',
  },
  'permit-documents': {
    title: '진행 중인 승인 절차 확인',
    hint: '담당자에게 어떤 절차의 자료를 준비하는지 물어보세요.',
  },
  'district-plan': {
    title: '대지 위치와 적용 구역 확인',
    hint: '지번과 구역명을 확인한 뒤 해당 계획을 찾아보세요.',
  },
  'code-review': {
    title: '검토할 기준의 범위 확인',
    hint: '건물의 용도·규모와 사업방식을 먼저 확인하세요.',
  },
  'review-report': {
    title: '심의에서 설명할 내용 확인',
    hint: '이번 자료로 설명하거나 결정받을 내용을 한 문장으로 정리하세요.',
  },
  'facade-review': {
    title: '디자인 검토 범위 확인',
    hint: '형태·재료·창호 중 무엇을 검토하는지 확인하세요.',
  },
  'precedent-research': {
    title: '사례를 찾는 목적 확인',
    hint: '무엇을 비교하고 결정하려는지부터 정하세요.',
  },
  modeling: {
    title: '모델을 만드는 목적 확인',
    hint: '공간·형태·도면 검토 중 어떤 일에 필요한 모델인지 확인하세요.',
  },
  rendering: {
    title: '이미지를 사용할 곳 확인',
    hint: '누구에게 어떤 설계 내용을 보여줄지 먼저 확인하세요.',
  },
  'drawing-revision': {
    title: '수정 요청 확인',
    hint: '어디를 왜 바꾸는지, 어떤 도면을 기준으로 삼을지 확인하세요.',
  },
  'consultant-coordination': {
    title: '요청할 내용과 기한 정리',
    hint: '어느 담당자에게 어떤 자료가 필요한지 적어보세요.',
  },
  'change-review': {
    title: '변경 전 기준자료 확인',
    hint: '기존 승인자료와 변경안을 나란히 준비하세요.',
  },
};
