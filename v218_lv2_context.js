(()=>{
'use strict';
const VERSION='2.1.18';
const byId=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const WHERE_RULES=[
  [/발주처|협의자료/,{material:'최신 설계도면 · 이전 발주처 보고자료 · 회의록/코멘트 · 발주처 요구사항(RFP·과업지시서 등)',source:'프로젝트 공용폴더/문서관리시스템 · 발주처 공식 전달자료 · 최신 회의록',order:'이전 결정사항 확인 → 이번에 결정받을 쟁점 표시 → 최신 도면·수치 대조 → PM/책임 검토'}],
  [/보고서|보고자료|발표자료/,{material:'최신 도면 · 이전 보고본 · 회의록 · 변경이력 · 최신 면적/수치',source:'프로젝트 기준폴더 · 승인/배포본 · 발주처 전달자료 · 협력업체 최신 회신',order:'결론·목적 확인 → 기준일 통일 → 근거자료 연결 → 이전안과 달라진 이유 확인'}],
  [/사례|레퍼런스/,{material:'현재 프로젝트의 용도·규모·동수/매싱·입면 목표 · 기존 사내 유사사례',source:'사내 프로젝트 아카이브 · Pinterest · ArchDaily · Designboom · Divisare · Dezeen · Architizer · 설계사 공식 홈페이지',order:'같은 용도 → 유사 규모 → 유사 구성/매싱 → 입면 재료·모듈·분절 방식 순으로 좁혀 비교'}],
  [/입면|파사드|디자인/,{material:'최신 평면·단면·입면 · 3D 모델 · 재료/창호 방향 · 구조·설비 조건 · 디자인 코멘트',source:'최신 설계도서 · 사내 디자인 기준자료 · 외장/창호 협력업체 자료 · 유사사례 전문매체',order:'디자인 목표 확인 → 평·단면과 정합성 확인 → 모듈·재료 검토 → 구조·외장·에너지 조건 대조'}],
  [/모델링|3d|bim/i,{material:'최신 CAD/BIM 기준도면 · 기준 레벨 · 면적표 · 최신 변경/협의사항',source:'프로젝트 공용모델 · 최신 배포도면 · 협력업체 수신도면 · BIM 실행/작성 기준(있는 경우)',order:'모델링 목적 확인 → 기준파일/기준일 확인 → 필요한 범위만 모델링 → 도면·협력업체 자료와 정합성 확인'}],
  [/cg|렌더|투시도|이미지/i,{material:'최신 모델 · 카메라/뷰 기준 · 재료·마감 방향 · 입면 코멘트 · 승인된 디자인안',source:'최신 3D 모델 · 재료보드/사양자료 · 이전 승인 이미지 · 발주처/디자인 코멘트',order:'보여줄 메시지 확인 → 최신 모델 고정 → 재료·뷰 설정 → 실제 설계와 다른 표현이 없는지 마지막 대조'}],
  [/지구단위/,{material:'대상 지번 · 토지이용계획 · 최신 지구단위계획 결정도서/변경고시 · 대지 관련 기존 검토자료',source:'토지이음 → 관할 지자체 도시계획 포털/고시·공고 → 최신 결정도서 원문',order:'적용 여부 확인 → 최신 결정/변경 여부 확인 → 도면·지침에서 대지 적용항목 표시 → 애매한 해석만 사내검토 후 관할부서 확인'}],
  [/법규|법령|규모검토/,{material:'대지정보 · 실제 건축물 용도 · 규모/층수/높이 · 사업방식 · 현재 설계안',source:'토지이음 → 국가법령정보센터 → 지자체 조례/고시·지구단위계획 → 기존 인허가 자료',order:'대지·용도·규모·사업방식 확정 → 적용 법체계 좁히기 → 설계 영향항목 정리 → 최신 조문/공식자료 재확인'}],
  [/심의/,{material:'심의 체크리스트/요구항목 · 최신 계획안 · 관련 검토보고서 · 이전 유사 심의자료',source:'관할기관 심의 안내/공고 · 프로젝트 기존 자료 · 관련 협력업체 검토자료',order:'어떤 심의인지 확인 → 요구자료 목록 확인 → 쟁점별 근거 연결 → 제출 전 최신안/수치/버전 통일'}],
  [/인허가|건축허가|허가자료|착공|사용승인|사용검사/,{material:'현재 인허가 경로 · 최신 설계도서 · 기존 승인/허가도서 · 협력업체 제출자료 · 보완이력',source:'세움터(해당 업무) · 국가법령정보센터 · 관할기관 안내 · 기존 허가/승인 문서',order:'현재 절차 확인 → 제출기준/기준일 확인 → 필요한 도서·협력업체 자료 목록화 → 누락·버전 확인 후 제출'}],
  [/변경허가|변경신고|경미한 변경|변경업무/,{material:'원 승인/허가도서 · 변경 전후 도면 · 변경사유 · 관련 회의록 · 협력업체 영향자료',source:'기존 인허가 문서/세움터 제출이력 · 최신 법령 · 관할기관 안내 · 프로젝트 변경이력',order:'원 인허가 경로 확인 → 무엇이 바뀌는지 표시 → 도면·법규·협력업체 영향 추적 → 필요한 변경절차 여부 확인'}],
  [/도면|평면|단면|cad|캐드/,{material:'최신 기준도면 · 레드라인/코멘트 · 변경이력 · 면적표 · 모델 · 관련 협력업체 도면',source:'프로젝트 배포/승인 폴더 · 도면관리표 · 협력업체 최신 수신본 · 회의록',order:'기준도면 버전 확인 → 수정 원인 확인 → 영향받는 도면 찾기 → 모델/표/협력업체와 다시 맞추기'}],
  [/협력업체|구조|기계|전기|소방|설비/,{material:'최신 건축 기준도면 · 질문할 위치/조건 · 관련 협력업체 최신 도면 · 이전 회신/회의록',source:'협력업체 송수신 기록 · 최신 수신도면 · RFI/질의회신 · 설계회의록',order:'질문을 도면 위치와 조건으로 구체화 → 최신 기준본 첨부 → 회신 책임자/기한 확인 → 결정사항을 건축도면에 반영'}]
];

const DEFAULT_WHERE={
  material:'최신 설계도면 · 현재 업무를 요청받은 메일/회의록 · 이전 유사 결과물 · 프로젝트 기준자료',
  source:'프로젝트 공용폴더 · 최신 배포/승인본 · 관련 협력업체 자료 · 공식 행정/법령 자료(필요한 경우)',
  order:'업무 목적 확인 → 기준자료의 최신 버전 확인 → 필요한 정보만 추리기 → 선임/책임에게 방향 검토'
};

function whereData(task){
  const hit=WHERE_RULES.find(([re])=>re.test(task||''));
  return hit?hit[1]:DEFAULT_WHERE;
}
function projectNote(id,label){
  if(id==='airport')return '공항시설·격납고는 공항 안에 있다는 이유만으로 하나의 인허가 경로로 단정하지 않습니다. 발주처/공항 운영조건, 사업시행 방식, 기존 승인·실시계획 자료를 먼저 확인하세요.';
  if(id==='fab')return '공장/FAB는 건축도면보다 공정·유틸리티·운영 기준이 먼저 설계조건을 만드는 경우가 많습니다. 발주처 Design Criteria와 공정/유틸리티 최신 조건을 기준자료에 포함하세요.';
  if(id==='logistics')return '물류·창고는 일반 창고인지 별도 물류사업 성격이 있는지 먼저 구분하고, 차량제원·하역·운영 시나리오를 배치/법규 자료와 함께 보세요.';
  if(id==='multi')return '공동주택은 “공동주택”이라는 용도만으로 절차를 정하지 말고, 사업방식과 기존 승인경로를 먼저 확인한 뒤 자료를 찾는 순서를 정하세요.';
  if(id==='dorm'||id==='officetel')return `${label}은 건축법상 용도와 주택 관련 법체계의 분류가 다르게 보일 수 있으니 한쪽 분류만 보고 자료를 찾지 마세요.`;
  if(id==='mixed')return '복합시설은 구성 용도별 기준자료와 전체 사업의 주된 인허가 경로를 나눠서 확인해야 합니다.';
  if(id==='datacenter')return '데이터센터는 전력·냉각·통신·운영조건이 건축계획과 강하게 연결되므로 발주처 기술기준과 협력업체 최신 조건을 일찍 확인하세요.';
  return `${label||'이 프로젝트'}에서는 같은 업무라도 프로젝트의 사업방식·규모·관할 조건에 따라 확인처가 달라질 수 있습니다. 공식 자료의 최신 버전을 기준으로 보세요.`;
}

function enhanceContext(){
  const root=byId('contextResult');
  if(!root||!root.innerHTML.trim())return;
  const lv=(typeof viewLevel==='function')?viewLevel():1;
  const task=byId('task')?.value||'';
  const projectSelect=byId('project');
  const projectId=projectSelect?.value||'';
  const label=projectSelect?.selectedOptions?.[0]?.textContent?.trim()||'';
  const whyPane=root.querySelector('[data-pane="why"]');
  const whyButton=root.querySelector('[data-drawer="why"]');
  if(!whyPane||!whyButton)return;

  if(lv<2){
    whyButton.innerHTML='<small>04 · LOCKED</small>왜·어디서 확인해요? 🔒';
    return;
  }

  const wd=(typeof whyData==='function')?whyData(task):{title:'이 업무의 목적과 확인처를 함께 잡아보세요',why:'다음 결정에 필요한 정보를 만들기 위한 업무입니다.',risk:'기준자료가 다르면 다시 확인하는 시간이 커집니다.',done:'목적·기준자료·다음 행동이 연결되면 됩니다.'};
  const wh=whereData(task);
  const whyProject=(typeof projectWhy==='function')?projectWhy(label):'';
  whyButton.innerHTML='<small>04 · WHY / WHERE</small>왜 하고, 어디서 확인해요?';
  whyPane.innerHTML=`<div class="kicker">LV.2 · WHY / WHERE</div><div class="why-title">${safe(wd.title)}</div><div class="detail-grid"><div class="detail-cell"><small>WHY</small><p>${safe(wd.why)}</p></div><div class="detail-cell"><small>놓치면</small><p>${safe(wd.risk)}</p></div><div class="detail-cell"><small>DONE</small><p>${safe(wd.done)}</p></div></div><div class="context-note">${safe(whyProject)}</div><div class="cc218-where"><div class="cc218-where-head"><small>WHERE</small><b>어디서, 어떤 순서로 확인할까요?</b></div><div class="detail-grid"><div class="detail-cell"><small>먼저 볼 자료</small><p>${safe(wh.material)}</p></div><div class="detail-cell"><small>공식·외부 확인처</small><p>${safe(wh.source)}</p></div><div class="detail-cell"><small>확인 순서</small><p>${safe(wh.order)}</p></div></div><div class="cc218-project-note"><b>${safe(label||'프로젝트')}에서 특히</b><span>${safe(projectNote(projectId,label))}</span></div></div>`;
}

function install(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  if(!document.getElementById('cc218Style')){
    const style=document.createElement('style');
    style.id='cc218Style';
    style.textContent='.cc218-where{margin-top:12px;padding-top:12px;border-top:1px solid #E1E7F4}.cc218-where-head{display:flex;align-items:baseline;gap:8px;margin-bottom:9px}.cc218-where-head small{font-size:8.5px;font-weight:950;letter-spacing:.12em;color:#6C79A4}.cc218-where-head b{font-size:12.5px;color:#33436F}.cc218-project-note{display:flex;gap:7px;align-items:flex-start;margin-top:10px;padding:10px 12px;border-radius:11px;background:#F2F7FF;border:1px solid #E0E9FA;color:#5B6883;font-size:10.2px;line-height:1.55}.cc218-project-note b{flex:0 0 auto;color:#315EBA}.cc218-project-note span{min-width:0}@media(max-width:700px){.cc218-project-note{display:block}.cc218-project-note b{display:block;margin-bottom:4px}}';
    document.head.appendChild(style);
  }
  const analyze=byId('analyze');
  if(analyze&&!analyze.dataset.cc218){
    analyze.dataset.cc218='1';
    analyze.addEventListener('click',()=>setTimeout(enhanceContext,0));
  }
  if(byId('view-context')?.classList.contains('active'))enhanceContext();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();