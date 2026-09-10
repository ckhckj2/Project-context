(()=>{
'use strict';
// Context and search intentionally retain their existing detail/compact wording.
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value)}return value}
function hasBim(p){return !!(p&&p.bimMode&&p.bimMode!=='none')}
function modeLabel(mode){return ({revit:'Revit 협업',coordination:'BIM 코디네이션',delivery:'BIM 납품 프로젝트',other:'기타 BIM'})[mode]||'BIM 프로젝트'}
function isExplicitBim(q){return /\bbim\b|revit|레빗|중앙파일|로컬파일|워크셋|workset|공유좌표|shared\s*coordinate|\bifc\b|clash|간섭검토|\bbep\b|\blod\b|패밀리|파라미터/i.test(q||'')}
function isWorkQuery(q){return /(업무|수정|검토|작성|확인|모델링|도면|평면|단면|입면|파사드|면적|주차|협의|구조|기계|전기|소방|설비|보고|인허가|허가|심의|법규|qgis|지번|도로|자료|납품|변경|회의|코멘트|레드라인)/i.test(q||'')}
const context=(()=>{
function taskKey(text){
  const q=String(text||'');
  if(/면적표|면적\s*(산출|검토|계산)|room|area\s*scheme/i.test(q))return 'area';
  if(/구조|기계|전기|소방|설비|덕트|배관|슬래브|기둥|보\b/i.test(q))return 'coord';
  if(/협력업체|수신도면|수신모델|외부참조|링크/i.test(q))return 'exchange';
  if(/입면|파사드|외장|창호/i.test(q))return 'facade';
  if(/도면|평면|단면|레드라인|수정|변경/i.test(q))return 'drawing';
  if(/모델링|3d|모델/i.test(q))return 'model';
  if(/납품|제출|준공도서/i.test(q))return 'delivery';
  return 'general';
}

const TASK_EXTRA={
  drawing:{title:'도면 수정',checks:['수정 대상이 모델 기반 도면인지 먼저 확인','수정 전 중앙/클라우드 모델과 작업권한 확인','수정 후 연결된 View·Sheet·Tag·Schedule 영향 확인','동기화 또는 게시 전 변경범위 재확인']},
  model:{title:'모델링',checks:['기준 모델·레벨·그리드·좌표 확인','내 작업범위와 Workset/소유 상태 확인','링크 모델 최신본과 간섭 가능성 확인','작업 후 동기화·경고·뷰 영향 점검']},
  area:{title:'면적 검토',checks:['Room/Area Scheme과 면적 경계 기준 확인','면적표가 참조하는 모델 버전 확인','경계·Room 상태 변경이 Schedule에 미치는 영향 확인','도면 면적과 모델 Schedule의 기준일을 통일']},
  coord:{title:'분야 협의',checks:['구조·설비 링크 모델의 최신 버전 확인','공유좌표/기준점이 맞는지 확인','변경 전후 간섭 위치와 영향 범위 기록','이슈 담당자와 반영 책임을 정해 모델/회의록에 남김']},
  exchange:{title:'협력업체 자료',checks:['수신 파일의 작성일·버전·좌표 기준 확인','링크/참조 방식과 교체 주기 확인','이전 모델과 변경된 범위를 비교','모델 교체 후 간섭·뷰·도면 영향 확인']},
  facade:{title:'입면·외장',checks:['입면 모델의 기준 레벨·그리드·모듈 확인','창호/외장 패밀리와 타입 변경 영향 확인','구조·설비 링크와 간섭 가능성 확인','입면 변경이 평면·단면·수량/Schedule에 함께 반영됐는지 확인']},
  delivery:{title:'납품·제출',checks:['BEP/발주처 BIM 지침의 납품 범위 확인','LOD/속성정보·파일명·폴더 규칙 확인','링크 정리·경고·불필요 뷰/객체 점검','IFC/NWC 등 요구 포맷을 시험 출력해 검수']},
  general:{title:'일반 업무',checks:['이 업무가 모델에 영향을 주는지 먼저 판단','영향이 있다면 기준 모델·버전·좌표를 확인','다른 사람 작업과 충돌할 수 있는 Workset/링크를 확인','결과를 동기화·이슈기록·도면 반영 중 필요한 방식으로 남김']}
};

function modeExtra(mode){
  if(mode==='revit')return {focus:'중앙/클라우드 협업 · Workset · 링크 · 동기화',where:'프로젝트 BEP/사내 BIM 기준 → 중앙·클라우드 모델 → 링크/좌표 기준',who:'프로젝트 BIM 담당 → 사내 BIM팀 또는 Revit 운용 가능 인원'};
  if(mode==='coordination')return {focus:'분야별 링크 · 공유좌표 · 간섭 · 이슈관리',where:'BEP/코디네이션 기준 → 분야별 최신 링크 → Clash/Issue 기록',who:'BIM 코디네이터 → 해당 구조·설비 모델 작성자/협력업체'};
  if(mode==='delivery')return {focus:'BEP · LOD/속성 · 파일규칙 · 납품 검수',where:'발주처 BIM 지침/과업지시서 → BEP → 모델/속성/파일명 납품 체크리스트',who:'프로젝트 BIM 책임자 → 사내 BIM팀 → 발주처 BIM 담당(필요 시)'};
  return {focus:'프로젝트 BIM 운용기준 · 모델 역할 · 책임범위',where:'프로젝트 BIM 기준/BEP → 사내 기준 → 실제 공용모델',who:'프로젝트 BIM 담당 또는 사내 BIM 운용 가능 인원'};
}

return freeze({hasBim,modeLabel,taskKey,TASK_EXTRA,modeExtra});
})();
const search=(()=>{
function taskKey(text){const q=String(text||'');if(/면적표|면적\s*(산출|검토|계산)/i.test(q))return'area';if(/구조|기계|전기|소방|설비|덕트|배관|슬래브|기둥/i.test(q))return'coord';if(/협력업체|수신도면|수신모델|외부참조|링크/i.test(q))return'exchange';if(/입면|파사드|외장|창호/i.test(q))return'facade';if(/도면|평면|단면|레드라인|수정|변경/i.test(q))return'drawing';if(/모델링|3d|모델/i.test(q))return'model';if(/납품|제출|준공도서/i.test(q))return'delivery';return'general'}
const EXTRA={
 drawing:['도면 수정',['수정 대상이 모델 기반 도면인지 먼저 확인','중앙/클라우드 모델과 작업권한 확인','View·Sheet·Tag·Schedule 영향 확인','수정 후 동기화 전 변경범위 재확인']],
 model:['모델링',['기준 모델·레벨·그리드·좌표 확인','내 작업범위와 Workset/소유 상태 확인','링크 모델 최신본과 간섭 가능성 확인','작업 후 동기화·경고·뷰 영향 점검']],
 area:['면적 검토',['Room/Area Scheme과 면적 경계 기준 확인','면적표가 참조하는 모델 버전 확인','경계·Room 변경이 Schedule에 미치는 영향 확인','도면 면적과 모델 Schedule의 기준일 통일']],
 coord:['분야 협의',['구조·설비 링크 모델 최신 버전 확인','공유좌표/기준점 정합성 확인','변경 전후 간섭 위치와 영향범위 기록','이슈 담당자와 반영 책임을 모델/회의록에 기록']],
 exchange:['협력업체 자료',['수신 파일 작성일·버전·좌표 기준 확인','링크/참조 방식과 교체 주기 확인','이전 모델과 변경 범위 비교','모델 교체 후 간섭·뷰·도면 영향 확인']],
 facade:['입면·외장',['입면 모델의 레벨·그리드·모듈 확인','창호/외장 패밀리와 타입 변경 영향 확인','구조·설비 링크 간섭 가능성 확인','평면·단면·수량/Schedule 동시 반영 확인']],
 delivery:['납품·제출',['BEP/발주처 BIM 지침의 납품 범위 확인','LOD/속성정보·파일명·폴더 규칙 확인','링크·경고·불필요 뷰/객체 점검','IFC/NWC 등 요구 포맷 시험 출력 후 검수']],
 general:['일반 업무',['이 업무가 모델에 영향을 주는지 먼저 판단','영향 시 기준 모델·버전·좌표 확인','다른 사람 작업과 충돌할 Workset/링크 확인','동기화·이슈기록·도면반영 중 필요한 방식으로 결과 기록']]
};
function modeInfo(mode){if(mode==='revit')return['중앙/클라우드 협업 · Workset · 링크 · 동기화','BEP/사내 BIM 기준 → 중앙·클라우드 모델 → 링크/좌표 기준','프로젝트 BIM 담당 → 사내 BIM팀 또는 Revit 운용 가능 인원'];if(mode==='coordination')return['분야별 링크 · 공유좌표 · 간섭 · 이슈관리','BEP/코디네이션 기준 → 분야별 최신 링크 → Clash/Issue 기록','BIM 코디네이터 → 해당 구조·설비 모델 작성자/협력업체'];if(mode==='delivery')return['BEP · LOD/속성 · 파일규칙 · 납품 검수','발주처 BIM 지침/과업지시서 → BEP → 모델/속성/파일명 체크리스트','프로젝트 BIM 책임자 → 사내 BIM팀 → 발주처 BIM 담당(필요 시)'];return['프로젝트 BIM 운용기준 · 모델 역할 · 책임범위','프로젝트 BIM 기준/BEP → 사내 기준 → 공용모델','프로젝트 BIM 담당 또는 사내 BIM 운용 가능 인원']}
return freeze({hasBim,modeLabel,isExplicitBim,isWorkQuery,taskKey,EXTRA,modeInfo});
})();
const topics=(()=>{
const BIM_TOPICS=[
  {id:'central',re:/(중앙파일|central\s*file|로컬파일|local\s*file|worksharing|워크셰어)/i,name:'Revit 중앙·로컬 협업',what:'여러 사람이 같은 Revit 프로젝트를 편집할 때 중앙 모델과 각 사용자의 작업본을 통해 변경사항을 조정하는 협업 방식이에요.',why:'동시에 작업하면서 서로의 변경을 안전하게 합치고, 누가 무엇을 편집 중인지 관리하기 위해 사용합니다.',where:'프로젝트 BEP/BIM 기준 → 사내 Revit 운용기준 → 현재 중앙/클라우드 모델 위치 → Autodesk 도움말',who:'프로젝트 BIM 담당자 → 사내 BIM팀/운용 가능인원. 기능 자체가 처음이면 공식 도움말·교육영상으로 보완하세요.',start:['중앙/클라우드 협업 방식 확인','내가 열어야 할 파일과 작업권한 확인','동기화 규칙·저장 위치 확인'],caution:'프로젝트 규칙을 모른 채 중앙파일을 복사·이동·이름변경하거나 임의로 협업 설정을 바꾸지 마세요.'},
  {id:'workset',re:/(workset|워크셋)/i,name:'Workset',what:'Revit 협업 모델에서 요소와 작업범위를 나누고 가시성·소유 상태 등을 관리하는 단위예요.',why:'여러 사람이 같은 모델에서 작업할 때 작업범위와 모델 표시를 관리하는 데 사용합니다.',where:'프로젝트 BEP/사내 BIM 기준 → 현재 모델의 Workset 구성 → Autodesk Revit 도움말',who:'프로젝트 BIM 담당자 또는 해당 모델 운용 경험자에게 기존 Workset 규칙을 먼저 확인하세요.',start:['현재 프로젝트 Workset 목록 확인','내 작업요소가 어느 Workset에 들어가는지 확인','새 Workset 생성이 필요한지 담당자 확인'],caution:'개인 편의로 Workset을 새로 만들면 프로젝트 표준이 흐트러질 수 있습니다.'},
  {id:'coords',re:/(좌표|shared\s*coordinates|공유좌표|project\s*base\s*point|survey\s*point)/i,name:'Revit 좌표·공유좌표',what:'건축·구조·설비·토목 등 서로 다른 모델을 같은 실제 위치에 맞춰 연결하기 위한 위치 기준이에요.',why:'링크 모델이 어긋나지 않고 여러 분야가 같은 기준점에서 협업하도록 하기 위해 중요합니다.',where:'BEP/좌표 기준도 → 측량·토목 기준 → Revit 링크/좌표 설정 → Autodesk 도움말',who:'좌표를 바꾸기 전 프로젝트 BIM 담당자와 토목/측량 기준을 아는 담당자에게 확인하세요.',start:['현재 좌표 기준과 기준파일 확인','링크 모델 위치가 어떤 방식인지 확인','변경 필요 시 영향받는 모든 링크를 먼저 목록화'],caution:'좌표는 한 모델만의 설정이 아닙니다. 임의 변경하면 여러 링크 모델 전체가 어긋날 수 있습니다.'},
  {id:'link',re:/(revit\s*link|링크모델|링크\s*모델|rvt\s*링크)/i,name:'Revit 링크 모델',what:'다른 Revit 모델을 현재 모델 안에 참조로 불러와 함께 보는 방식이에요.',why:'건축·구조·MEP 모델을 분리 운용하면서도 위치와 간섭을 함께 확인하기 위해 사용합니다.',where:'BEP/모델 분할기준 → 링크 경로·좌표 규칙 → 현재 모델 관리 설정',who:'프로젝트 BIM 담당자와 해당 링크 모델 작성자/협력업체',start:['어떤 모델을 링크해야 하는지 확인','경로·좌표·버전 확인','링크 후 레벨/그리드/주요 간섭 위치 점검'],caution:'링크 파일을 직접 수정해야 하는지, 참조만 해야 하는지 역할을 먼저 구분하세요.'},
  {id:'ifc',re:/\bifc\b|아이에프씨/i,name:'IFC',what:'서로 다른 BIM 소프트웨어 사이에서 건물 모델 정보를 교환하기 위한 개방형 데이터 형식이에요.',why:'Revit 외 다른 프로그램이나 발주처·협력업체와 모델을 주고받을 때 활용됩니다.',where:'발주처 BIM 지침/BEP → 납품 요구 버전·속성 기준 → 내보내기 설정 → buildingSMART/프로그램 도움말',who:'납품 목적이면 BIM 담당자/발주처 기준 담당, 단순 변환 테스트면 사내 BIM 운용 가능인원',start:['왜 IFC가 필요한지 확인','요구 IFC 버전·속성·좌표 확인','샘플 export 후 뷰어에서 검수'],caution:'IFC는 그냥 “다른 확장자로 저장”하는 작업이 아닙니다. 납품 속성·분류·좌표 기준을 먼저 확인하세요.'},
  {id:'clash',re:/(clash|클래시|간섭검토|간섭\s*체크)/i,name:'Clash Detection · 간섭검토',what:'건축·구조·설비 모델이 물리적으로 충돌하거나 필요한 여유공간을 침범하는지 찾는 BIM 조정 작업이에요.',why:'시공 전에 충돌을 발견해 설계변경과 현장 재작업을 줄이기 위해 수행합니다.',where:'BEP/간섭검토 기준 → 통합모델 → 간섭 규칙/허용오차 → 이슈리스트',who:'BIM 코디네이터/사내 BIM팀 → 충돌 당사자인 건축·구조·설비 담당',start:['검토할 모델 버전 고정','검토 규칙과 허용오차 확인','이슈별 담당자·마감일 지정'],caution:'모든 충돌을 같은 중요도로 처리하지 말고 실제 시공·유지관리 영향이 있는 이슈를 분류하세요.'},
  {id:'bep',re:/\bbep\b|bim\s*(수행|실행)계획|bim\s*execution/i,name:'BEP · BIM 수행계획',what:'프로젝트에서 BIM을 누가, 어떤 기준과 파일구조·좌표·LOD·협업방식으로 운영할지 정리한 실행 문서예요.',why:'팀마다 제각각 모델링하지 않고 프로젝트 전체의 BIM 작업방식을 하나로 맞추기 위해 사용합니다.',where:'발주처 BIM 지침/과업지시서 → 프로젝트 BEP → 사내 BIM 표준',who:'프로젝트 BIM 매니저/코디네이터 또는 사내 BIM팀',start:['현재 승인된 BEP 버전 확인','내 역할·모델범위·납품물 확인','파일명·좌표·LOD·협업 규칙 표시'],caution:'BEP가 있다면 개인 습관보다 프로젝트 BEP가 우선입니다.'},
  {id:'lod',re:/\blod\b|모델\s*상세수준|상세수준/i,name:'LOD',what:'BIM 모델 요소가 프로젝트 단계별로 어느 정도의 형상·정보 신뢰도를 가져야 하는지 표현할 때 쓰는 개념이에요.',why:'필요 이상으로 모델링하거나, 반대로 의사결정에 필요한 정보가 부족한 상황을 줄이기 위해 씁니다.',where:'발주처 BIM 지침 · BEP · 단계별 납품요구조건',who:'프로젝트 BIM 담당자/발주처 BIM 기준 담당',start:['현재 단계와 납품목적 확인','요구 LOD/정보요건 확인','내 모델 요소 범위를 맞춤'],caution:'LOD 숫자만 보고 세부 요구를 추정하지 말고 프로젝트에서 정의한 기준을 확인하세요.'},
  {id:'family',re:/(패밀리|family|shared\s*parameter|공유매개변수|파라미터)/i,name:'Revit 패밀리·파라미터',what:'Revit에서 문·창호·가구·장비 같은 반복 객체와 그 속성정보를 정의하는 기본 구성요소예요.',why:'같은 객체를 일관되게 재사용하고 도면·스케줄·BIM 정보와 연결하기 위해 사용합니다.',where:'사내 패밀리 라이브러리/템플릿 → 프로젝트 파라미터 기준 → Autodesk 도움말',who:'사내 BIM팀/패밀리 관리자 또는 프로젝트 BIM 담당자',start:['기존 사내 패밀리 존재 여부 확인','필요 파라미터와 분류 확인','새로 만들기 전에 재사용 가능성 확인'],caution:'중복 패밀리와 제각각인 파라미터는 모델 성능과 납품 품질을 떨어뜨릴 수 있습니다.'},
  {id:'revit',re:/(revit|레빗)/i,name:'Autodesk Revit',what:'건축·구조·설비 모델과 도면·스케줄 정보를 하나의 BIM 모델에서 연동해 다루는 설계 소프트웨어예요.',why:'모델 변경을 여러 도면과 정보에 연결하고 분야 간 BIM 협업을 하기 위해 사용합니다.',where:'사내 Revit/BIM 기준 → 프로젝트 템플릿/BEP → Autodesk 공식 도움말·공식 교육 → 기능 학습용 교육영상',who:'프로젝트 BIM 담당자/사내 BIM팀/운용 가능인원. 단순 기능 학습은 공식 도움말이나 검증된 교육영상도 활용할 수 있어요.',start:['회사 라이선스·설치방식 확인','프로젝트 템플릿/BEP 확인','샘플 파일에서 기본 조작 후 실제 모델 작업'],caution:'회사 프로젝트에서는 개인 템플릿이나 임의 플러그인 사용 전에 사내 기준을 확인하세요.',links:[['Autodesk Revit','https://www.autodesk.com/products/revit/overview'],['Revit 도움말','https://help.autodesk.com/view/RVT/2026/ENU/']]},
  {id:'bim',re:/\bbim\b|빔\s*(업무|설계|모델)/i,name:'BIM',what:'건물의 3D 형상과 속성정보를 하나의 디지털 모델로 연결해 설계·협업·시공·운영에 활용하는 업무방식이에요.',why:'단순 3D 모델링보다 도면·수량·정보·분야 간 협업을 하나의 모델 체계에서 연결하기 위해 사용합니다.',where:'발주처 BIM 요구조건/과업지시서 → 프로젝트 BEP → 사내 BIM 기준 → 사용하는 프로그램 공식 도움말',who:'프로젝트 BIM 담당자 → 사내 BIM팀/운용 가능인원 → 관련 모델 작성자·협력업체. 기능 공부는 유튜브 등 교육자료를 보조로 활용하세요.',start:['우리 프로젝트가 BIM을 왜 쓰는지 확인','BEP·납품기준·협업방식 확인','내가 맡은 모델 범위와 책임 확인'],caution:'BIM은 Revit 프로그램 자체와 같은 뜻이 아닙니다. 프로젝트 운영방식과 정보기준까지 포함합니다.'}
];
function bimTopic(q){return BIM_TOPICS.find(x=>x.re.test(q||''))||null}
return freeze({BIM_TOPICS,bimTopic});
})();
window.CC_BIM_RULES=freeze({context,search,topics});
})();
