(()=>{
'use strict';
const VERSION='2.1.16';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const legacyRunSearch=window.runSearch;

const ASK=/(누구|물어|문의|담당자|어디에\s*(?:물어|문의)|확인받|뭐라고\s*물어|질의)/i;
const ACTION=/(하래|해달래|해줘|하라고|보래|봐줘|확인|검토|조사|찾아|정리|작성|만들|수정|반영|뽑아|잡아|짜|모델링|렌더링)/i;

const INTENTS=[
  {id:'report',re:/보고서|보고자료|발주처\s*(?:보고|협의)\s*자료|회의\s*자료|발표\s*자료|ppt|피피티/i,title:'보고받는 사람이 판단할 수 있도록 자료를 구조화하는 업무예요',meaning:'자료를 많이 넣는 것보다 이번 보고에서 무엇을 설명하고 무엇을 결정받아야 하는지 흐름을 잡는 일이 먼저입니다.',first:'① 보고 목적 ② 대상자 ③ 이번에 결정받을 내용 ④ 근거가 되는 최신 도면·수치·이슈를 먼저 적으세요.',where:'최신 설계도면 · 이전 보고자료 · 회의록/코멘트 · 발주처 요구사항 · 최신 일정/면적 등 프로젝트 기준자료',who:'구성 방향과 메시지는 책임/PM에게 먼저 확인하고, 필요한 기술 수치는 해당 협력업체 자료와 대조하세요.',note:'예쁜 슬라이드보다 “그래서 무엇을 결정해야 하는가”가 먼저 보이게 만드는 게 핵심입니다.'},
  {id:'precedent',re:/사례\s*조사|레퍼런스|reference|유사\s*사례|벤치마킹|precedent/i,title:'설계 판단에 쓸 수 있는 비교 사례를 찾는 업무예요',meaning:'이미지를 많이 모으는 게 아니라 현재 프로젝트의 문제와 비슷한 조건을 가진 사례를 찾아 비교 근거를 만드는 일입니다.',first:'먼저 비교 기준을 2~4개로 정하세요. 예: 규모 / 프로그램 / 입면 방식 / 구조 / 운영동선 / 지역성.',where:'회사 유사 프로젝트 · 공식 프로젝트 자료 · 설계사/시공사 공개자료 · 전문 매체 · 발주처 제공 사례',who:'조사 범위가 넓으면 책임/선임에게 “무엇을 비교하기 위한 사례인지” 먼저 확인하면 검색량을 크게 줄일 수 있습니다.',note:'좋아 보이는 사례보다 현재 의사결정에 직접 비교 가능한 사례를 우선하세요.'},
  {id:'model',re:/모델링|3d\s*모델|삼디\s*모델|매스\s*(?:모델|검토|짜|잡)|mass\s*(?:model|study)/i,title:'공간·규모·형태를 빠르게 검토할 수 있도록 3D로 만드는 업무예요',meaning:'모델의 정밀도보다 지금 단계에서 무엇을 판단하기 위한 모델인지가 중요합니다. 초기에는 매스와 주요 공간관계, 이후에는 도면·협력업체 조정 수준으로 깊어집니다.',first:'모델링 목적을 먼저 정하세요: 규모검토 / 배치·형태 / 입면 / 보고용 / 도면연계 / 협력업체 조정.',where:'최신 평면·단면·배치도 · 면적표 · 기준 레벨 · 최신 협의사항 · 기존 모델',who:'어디까지 모델링할지는 책임/선임과 범위를 맞추고, 구조·설비 공간이 필요하면 해당 협력업체 최신 자료를 받으세요.',note:'단계에 비해 지나치게 상세하게 만들면 수정 비용만 커집니다. 지금 결정할 수 있는 수준까지만 만드는 게 좋습니다.'},
  {id:'render',re:/cg|렌더링|렌더|투시도|조감도|이미지\s*(?:뽑|만들)|perspective/i,title:'현재 설계안의 공간·재료·분위기를 전달하는 시각화 업무예요',meaning:'렌더링 자체가 목적이라기보다 발주처·내부팀이 설계안을 이해하고 비교·결정할 수 있게 만드는 것이 목적입니다.',first:'카메라 위치와 보여줄 설계 포인트를 먼저 정한 뒤 최신 모델·재료·조명 조건을 고정하세요.',where:'최신 3D 모델 · 입면/평면 · 재료·마감 방향 · 발주처/디자인 코멘트 · 기존 이미지 기준',who:'최종적으로 강조할 메시지와 이미지 우선순위는 책임/PM 또는 디자인 담당과 먼저 맞추세요.',note:'설계가 확정되지 않은 부분을 이미지에서 확정된 것처럼 표현하지 않도록 구분하세요.'},
  {id:'revision',re:/도면\s*수정|수정\s*도면|코멘트\s*반영|의견\s*반영|지적사항\s*반영|rev(?:ision)?|레드라인|redline/i,title:'최신 결정사항을 도면에 빠짐없이 반영하고 영향 범위를 확인하는 업무예요',meaning:'보이는 한 군데만 고치는 것이 아니라 변경 원인과 연동되는 도면·면적·협력업체 자료까지 같이 맞추는 업무입니다.',first:'코멘트 원문 → 변경 대상 → 관련 도면/표/모델 → 다른 분야 영향 순서로 체크리스트를 만드세요.',where:'최신 코멘트/회의록 · 기준 도면 · 면적표 · 3D/BIM 모델 · 협력업체 최신 도면',who:'의도나 우선순위가 애매한 코멘트는 책임/선임에게 먼저 확인하고, 기술 영향은 해당 협력업체와 같이 검토하세요.',note:'수정 완료는 한 장을 고친 시점이 아니라 관련 자료들의 버전이 다시 맞았을 때입니다.'},
  {id:'layout',re:/배치\s*(?:검토|계획|봐|보래|잡|짜)|대지\s*배치|동\s*배치|프로그램\s*배치/i,title:'대지 안에서 건물·외부공간·차량·보행 관계를 잡는 업무예요',meaning:'배치는 면적만 들어가는지 보는 작업이 아니라 대지조건, 운영, 법규, 접근, 향후 설계 확장성을 한 번에 맞추는 초기 판단입니다.',first:'대지경계·도로·레벨을 고정하고 프로그램/면적 → 보행·차량 → 서비스·물류 → 법규 제약 순으로 겹쳐 보세요.',where:'대지/측량자료 · 프로그램·면적표 · 도로/도시계획 조건 · 운영조건 · 기존 배치안',who:'운영 우선순위와 배치 대안의 평가기준은 책임/PM 및 발주처 요구사항과 먼저 맞추는 게 좋습니다.',note:'처음부터 한 안을 정답처럼 밀기보다 핵심 제약을 만족하는 2~3개 대안을 비교하면 판단이 쉬워집니다.'},
  {id:'circulation',re:/동선\s*(?:검토|계획|봐|보래|정리)|보행\s*동선|사람\s*동선|이용자\s*동선/i,ambiguous:true,title:'“동선 검토”는 누구의 이동을 보는지 먼저 정해야 해요',meaning:'보행·차량·서비스·피난은 서로 다른 기준으로 검토해야 해서 대상이 불명확하면 결과가 달라집니다.',choices:[['이용자·보행 동선을 보는 것 같아','이용자 보행 동선 검토해달래'],['차량·주차 동선을 보는 것 같아','차량 진출입 주차 동선 검토해달래'],['서비스·물류 동선을 보는 것 같아','서비스 물류 동선 검토해달래'],['피난 동선을 보는 것 같아','피난 동선 검토해달래']]},
  {id:'circulation-user',re:/(이용자|보행|사람).*동선|동선.*(이용자|보행|사람)/i,title:'주요 이용자가 끊김 없이 이동할 수 있는지 보는 업무예요',meaning:'출입구부터 주요 프로그램·수직동선·공용공간까지 이동 경로가 자연스럽고 충돌이 적은지 검토합니다.',first:'주요 사용자 유형을 나누고 각각의 출발점→목적지→수직동선을 한 줄로 표시해보세요.',where:'최신 평면·배치 · 프로그램표 · 운영 시나리오 · 접근성 관련 기준',who:'운영 방식이 중요한 시설은 발주처/운영주체 의견을 책임/PM을 통해 먼저 확인하세요.',note:'동선 길이만 줄이는 것보다 서로 다른 사용자 흐름이 불필요하게 충돌하지 않는지가 중요합니다.'},
  {id:'circulation-service',re:/(서비스|물류|하역|배송|직원).*동선|동선.*(서비스|물류|하역|배송|직원)/i,title:'운영·물류 흐름이 일반 이용자 동선과 충돌하지 않는지 보는 업무예요',meaning:'반입·하역·보관·서비스 이동이 실제 운영 가능한지, 일반 이용자·차량 흐름과 충돌하지 않는지 확인합니다.',first:'반입 주체와 차량 종류, 하역 위치, 보관/백오브하우스, 최종 목적지를 순서대로 연결하세요.',where:'배치·평면 · 운영 프로그램 · 차량제원/하역조건 · 발주처 운영자료',who:'운영조건은 발주처/운영주체와, 차량·설비 제약은 관련 분야와 확인하고 건축 반영 방향은 책임/PM과 맞추세요.',note:'서비스 동선은 나중에 남는 공간에 넣기보다 초기 배치에서 확보해야 충돌이 줄어듭니다.'},
  {id:'facade',re:/입면\s*(?:검토|디자인|계획|봐|보래)|파사드|facade|외관\s*디자인/i,title:'외관의 디자인 의도와 실제 구현 조건을 함께 맞추는 업무예요',meaning:'입면은 형태·비례·재료뿐 아니라 창호 모듈, 구조, 방수, 에너지, 시공성, 비용과 연결되는 종합 조정 업무입니다.',first:'이번 검토가 전체 컨셉 / 모듈·비례 / 재료 / 창호 / 상세 중 어디까지인지 범위를 먼저 정하세요.',where:'최신 평면·단면·입면 · 3D 모델 · 마감/창호 자료 · 구조·에너지·시공 관련 조건',who:'디자인 방향은 책임/디자인 담당과 맞추고 기술 조건은 구조·창호·외장 등 관련 협력업체와 검토하세요.',note:'이미지에서 좋아 보이는 입면과 실제로 시공 가능한 입면 사이의 조건을 초기에 같이 확인하는 게 중요합니다.'},
  {id:'permit-doc',re:/인허가\s*(?:자료|도서|서류)\s*(?:작성|정리|준비)|허가\s*(?:도서|자료|서류)|심의\s*(?:자료|도서)\s*(?:작성|정리|준비)/i,title:'제출 목적에 맞춰 필요한 설계·증빙 자료를 묶는 업무예요',meaning:'인허가나 심의마다 요구자료가 다르므로 고정된 목록을 외우기보다 현재 절차와 관할/발주 조건을 먼저 특정해야 합니다.',first:'① 현재 절차가 무엇인지 ② 제출처 ③ 기준 도면 버전 ④ 건축/협력업체별 제출물을 먼저 나누세요.',where:'해당 절차의 공식 안내/서식 · 세움터 또는 관할기관 안내 · 회사 유사 프로젝트 · 발주처/과업지시 자료',who:'제출 목록과 일정은 사내 인허가 담당/책임/PM에게 기준을 확인하고 협력업체별 담당 자료를 조기에 요청하세요.',note:'프로젝트마다 추가 요구가 생길 수 있으므로 과거 프로젝트의 제출목록을 그대로 복사하지 않습니다.'},
  {id:'drawing-ambiguous',re:/^(?:도면\s*)?(?:봐|봐줘|보래|확인해|검토해|체크해)$|도면\s*(?:확인|검토|봐|보래|체크)(?!.*(?:면적|피난|입면|배치|수정))/i,ambiguous:true,title:'“도면 확인”만으로는 검토 목적이 너무 넓어요',meaning:'같은 도면이라도 무엇을 확인하느냐에 따라 필요한 기준과 담당자가 완전히 달라집니다.',choices:[['평면·배치가 맞는지 보는 것 같아','평면 배치 동선 검토해달래'],['면적·수치가 맞는지 보는 것 같아','면적표와 도면 수치 맞는지 검토해달래'],['코멘트가 반영됐는지 보는 것 같아','도면 코멘트 반영 여부 확인해달래'],['입면·디자인을 보는 것 같아','입면 디자인 검토해달래']]}
];

function resolve(q){
  const t=String(q||'').trim();
  // Specific branches must win before their broader parent intents.
  const specific=['circulation-user','circulation-service','revision','permit-doc','drawing-ambiguous'];
  for(const id of specific){const hit=INTENTS.find(x=>x.id===id);if(hit&&hit.re.test(t))return hit;}
  return INTENTS.find(x=>x.re.test(t))||null;
}
function renderCard(d){return `<div class="result-card cc21-result"><div class="label">WORK GUIDE · 척척</div><h3>${esc(d.title)}</h3><p>${esc(d.meaning)}</p><div class="result-grid"><div class="result-cell"><small>01 · 먼저</small><p>${esc(d.first)}</p></div><div class="result-cell"><small>02 · 어디서</small><p>${esc(d.where)}</p></div><div class="result-cell"><small>03 · 누구와</small><p>${esc(d.who)}</p></div></div>${d.note?`<div class="cc21-note"><b>척척 포인트</b><span>${esc(d.note)}</span></div>`:''}</div>`;}
function renderAsk(d){return `<div class="result-card cc21-result"><div class="label">WHO / HOW · 척척</div><h3>${esc((d.who||'책임/선임에게 먼저 확인하세요.').split('하세요.')[0])}</h3><p>${esc(d.meaning)}</p><div class="script-box"><small>이렇게 물어보세요</small><p>“지금 ${esc(d.title.replace(/예요$|업무예요$/,''))} 관련 업무를 진행하고 있습니다. 제가 먼저 확인해야 할 기준자료와, 판단이 필요한 부분을 어디까지 정리해서 가져가면 될지 확인 부탁드립니다.”</p></div></div>`;}
function renderChoices(d){return `<div class="result-card cc21-result"><div class="label">ONE MORE STEP · 척척</div><h3>${esc(d.title)}</h3><p>${esc(d.meaning)}</p><div class="cc21-choices">${d.choices.map(([label,query])=>`<button type="button" data-cc216-query="${esc(query)}">${esc(label)} <span>→</span></button>`).join('')}</div><div class="cc21-note"><b>왜 다시 물어보나요?</b><span>실무 지시는 짧게 오는 경우가 많아서, 검토 대상을 한 번만 좁혀도 필요한 자료와 담당자를 훨씬 정확하게 안내할 수 있습니다.</span></div></div>`;}
function runExpanded(){
  const input=$('searchInput'),out=$('searchResult');
  if(!input||!out)return;
  const q=input.value.trim();
  if(!q)return;
  const hit=resolve(q);
  if(!hit){if(typeof legacyRunSearch==='function')legacyRunSearch();return;}
  out.innerHTML=hit.ambiguous?renderChoices(hit):(ASK.test(q)?renderAsk(hit):renderCard(hit));
  out.querySelectorAll('[data-cc216-query]').forEach(btn=>btn.onclick=()=>{input.value=btn.dataset.cc216Query;runExpanded();input.scrollIntoView({behavior:'smooth',block:'center'});});
}
function cloneInput(id,handler){const old=$(id);if(!old)return null;const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();handler();}});return fresh;}
function openFromHome(){const h=$('homeSearch');if(!h)return;const q=h.value.trim();if(!q)return;if(typeof showView==='function')showView('search');const s=$('searchInput');if(s)s.value=q;runExpanded();}
function install(){
  
  const s=cloneInput('searchInput',runExpanded);
  const h=cloneInput('homeSearch',openFromHome);
  const go=$('searchGo');if(go)go.onclick=runExpanded;
  const hgo=$('homeSearchBtn');if(hgo)hgo.onclick=openFromHome;
  document.querySelectorAll('[data-example]').forEach(btn=>btn.onclick=()=>{if(typeof showView==='function')showView('search');const input=$('searchInput');if(input)input.value=btn.dataset.example||btn.textContent.trim();runExpanded();});
  if(s)s.placeholder='예: 보고자료 만들래 / 도면 수정해 / 배치 검토해 / CG 뽑아';
  if(h)h.placeholder='예) 책임님께 보고자료 작성을 요청받았어요. 뭐부터 할까요?';
  window.runSearch=runExpanded;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
