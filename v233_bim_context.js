(()=>{
'use strict';
const VERSION='2.1.33';
const PROJECT_STORAGE='cc_projects_v1';
const ACTIVE_STORAGE='cc_active_project_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function readProjects(){try{const v=JSON.parse(localStorage.getItem(PROJECT_STORAGE)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
function activeProject(){try{const id=localStorage.getItem(ACTIVE_STORAGE)||'';return readProjects().find(p=>p.id===id)||null}catch(e){return null}}
function hasBim(p){return !!(p&&p.bimMode&&p.bimMode!=='none')}
function modeLabel(mode){return ({revit:'Revit 협업',coordination:'BIM 코디네이션',delivery:'BIM 납품 프로젝트',other:'기타 BIM'})[mode]||'BIM 프로젝트'}
function isExplicitBim(q){return /\bbim\b|revit|레빗|중앙파일|로컬파일|워크셋|workset|공유좌표|shared\s*coordinate|\bifc\b|clash|간섭검토|\bbep\b|\blod\b|패밀리|파라미터/i.test(q||'')}
function isWorkQuery(q){return /(업무|수정|검토|작성|확인|모델링|도면|평면|단면|입면|파사드|면적|주차|협의|구조|기계|전기|소방|설비|보고|인허가|허가|심의|법규|qgis|지번|도로|자료|납품|변경|회의|코멘트|레드라인)/i.test(q||'')}
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

function buildBox(p,text,compact=false){
  const mode=modeExtra(p.bimMode);const t=TASK_EXTRA[taskKey(text)]||TASK_EXTRA.general;
  const box=document.createElement('div');box.className=compact?'cc233-bim-adjust compact':'cc233-bim-adjust';
  box.innerHTML=`<div class="cc233-head"><div><small>BIM MODE · ${esc(modeLabel(p.bimMode))}</small><b>${esc(t.title)}에서 추가로 확인하세요</b></div><span>${esc(mode.focus)}</span></div>
    <div class="cc233-checks">${t.checks.map((x,i)=>`<div><i>${i+1}</i><p>${esc(x)}</p></div>`).join('')}</div>
    <div class="cc233-meta"><div><small>어디서 확인?</small><p>${esc(mode.where)}</p></div><div><small>누구에게?</small><p>${esc(mode.who)}</p></div></div>`;
  return box;
}

function patchHow(){
  const p=activeProject();const root=$('contextResult');if(!hasBim(p)||!root)return;
  const pane=root.querySelector('[data-pane="how"]');if(!pane||/LV\.3부터/.test(pane.textContent||''))return;
  pane.querySelector('.cc233-bim-adjust')?.remove();
  const task=$('task')?.value||'';
  const detail=pane.querySelector('.cc232-how-detail');const box=buildBox(p,task,false);
  if(detail)detail.insertAdjacentElement('beforebegin',box);else pane.appendChild(box);
}

function currentQuery(){return ($('searchInput')?.value||$('homeSearch')?.value||'').trim()}
function patchSearch(){
  const p=activeProject();const root=$('searchResult');if(!root)return;
  root.querySelectorAll('.cc233-bim-search').forEach(x=>x.remove());
  const q=currentQuery();
  if(!hasBim(p)||!q||isExplicitBim(q)||!isWorkQuery(q))return;
  if(root.querySelector('.cc232-bim-card'))return;
  const card=root.querySelector('.result-card')||root.firstElementChild;if(!card)return;
  const wrap=document.createElement('div');wrap.className='cc233-bim-search';wrap.appendChild(buildBox(p,q,true));card.appendChild(wrap);
}

function scheduleHow(){setTimeout(patchHow,240)}
function scheduleSearch(){setTimeout(patchSearch,180)}
function installStyle(){
  if($('cc233Style'))return;const s=document.createElement('style');s.id='cc233Style';s.textContent=`
  .cc233-bim-adjust{margin:10px 0 0;border:1px solid #dce5f5;border-radius:13px;background:#f8fbff;overflow:hidden}.cc233-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:12px 13px;background:#eef4ff}.cc233-head small{display:block;font-size:8px;font-weight:950;letter-spacing:.07em;color:#4f67e8}.cc233-head b{display:block;margin-top:3px;font-size:11px;color:#274668}.cc233-head>span{font-size:9px;line-height:1.45;color:#657892;text-align:right}.cc233-checks{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding:10px}.cc233-checks>div{display:grid;grid-template-columns:20px 1fr;gap:7px;align-items:start;padding:8px;border-radius:9px;background:#fff}.cc233-checks i{display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#eef2ff;color:#5369e8;font-size:8px;font-style:normal;font-weight:950}.cc233-checks p,.cc233-meta p{margin:1px 0 0;font-size:9px;line-height:1.5;color:#405570}.cc233-meta{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:0 10px 10px}.cc233-meta>div{padding:8px 9px;border-radius:9px;background:#f1f5fa}.cc233-meta small{font-size:8px;font-weight:950;color:#6b7a8f}.cc233-bim-search{margin-top:10px}.cc233-bim-adjust.compact{margin:0}.cc233-bim-adjust.compact .cc233-checks{grid-template-columns:repeat(2,1fr)}
  @media(max-width:700px){.cc233-head{display:grid}.cc233-head>span{text-align:left}.cc233-checks,.cc233-bim-adjust.compact .cc233-checks,.cc233-meta{grid-template-columns:1fr}}
  `;document.head.appendChild(s)
}
function install(){
  installStyle();
  document.addEventListener('click',e=>{
    if(e.target.closest('#analyze,[data-drawer="how"],.master-levels button'))scheduleHow();
    if(e.target.closest('#searchGo,#homeSearchBtn,[data-example],[data-cc229-example],[data-cc219-tool],[data-ask-context]'))scheduleSearch();
    if(e.target.closest('[data-use],.cc232-bim-setting select,[data-view="projects"]')){setTimeout(()=>{patchHow();patchSearch()},180)}
  });
  $('searchInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')scheduleSearch()});
  $('homeSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter')scheduleSearch()});
  if($('contextResult')?.innerHTML.trim())scheduleHow();
  if($('searchResult')?.innerHTML.trim())scheduleSearch();
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();