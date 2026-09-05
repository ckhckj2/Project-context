(()=>{
'use strict';
const VERSION='2.1.50';
const STORAGE='cc_projects_v1';
const ACTIVE='cc_active_project_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const BUSINESS={
  unknown:'잘 모르겠습니다',general:'일반 민간 건축사업',public:'공공 발주사업',housing:'주택건설사업',
  maintenance:'정비사업',development:'민간투자·개발사업',special:'특별법·기반시설사업'
};
const ROUTES={
  unknown:'잘 모르겠습니다',building:'건축허가·건축신고',housing:'주택법 사업계획승인',
  maintenance:'정비사업 사업시행계획인가',airport:'공항시설 시행허가·실시계획',
  logistics:'물류단지계획·개발실시계획',industry:'산업단지계획·공장설립승인',
  special:'기타 특별법 승인·인가',multiple:'복수 승인경로·정리 중'
};
const EXCEPTIONS={
  unknown:'잘 모르겠습니다',none:'별도 예외 없음',pre_review:'사전심의·사전협의',
  partial:'부분허가·우선시공분',fast_track:'패스트트랙·설계/시공 병행',change:'변경·보완·재심의'
};
const ROUTE_GUIDE={
  unknown:{focus:'기존 승인서의 문서명·근거법·승인기관부터 확인하세요.',change:'원 승인경로가 확인되기 전에는 변경허가·변경신고를 단정하지 마세요.'},
  building:{focus:'건축허가서 또는 건축신고필증과 승인도서를 기준본으로 봅니다.',change:'허가·신고사항 변경, 경미한 변경, 사용승인 일괄신고 가능성을 구분합니다.'},
  housing:{focus:'건축허가가 아니라 사업계획승인서·승인조건·승인도서를 기준본으로 봅니다.',change:'사업계획 변경승인과 경미한 사항 신고 여부를 원 승인내용과 비교합니다.'},
  maintenance:{focus:'사업시행계획인가서·인가조건·의제사항과 관리처분 등 현재 사업단계를 확인합니다.',change:'사업시행계획 변경인가/신고와 의제된 개별 인허가의 재협의 범위를 나눕니다.'},
  airport:{focus:'시행허가·실시계획 승인범위와 고시·승인조건에 해당 건축물이 포함됐는지 확인합니다.',change:'실시계획 변경승인과 경미한 변경, 관계기관 재협의 범위를 먼저 봅니다.'},
  logistics:{focus:'일반 건축허가인지 물류단지계획·개발실시계획인지 승인문서로 구분합니다.',change:'건축물 변경과 토지이용·기반시설 등 단지계획 변경을 나눠 봅니다.'},
  industry:{focus:'산업단지계획·입주계약·공장설립승인·건축허가의 승인층을 각각 확인합니다.',change:'이번 변경이 어느 승인층에 닿는지 표시하고 기관별 절차의 선후행을 확인합니다.'},
  special:{focus:'시설명이 아니라 실제 승인서의 근거법·승인기관·의제 범위를 확인합니다.',change:'원 특별법 승인과 의제된 개별 인허가의 변경절차를 따로 추적합니다.'},
  multiple:{focus:'복수 승인서의 선후행·의제 관계와 현재 유효한 기준본을 한 표로 정리합니다.',change:'변경항목별로 영향을 받는 승인층과 승인기관을 나눠 확인합니다.'}
};
const TYPE_HINT={
  multi:'건축허가 또는 주택법 사업계획승인',airport:'건축허가 또는 공항시설 시행허가·실시계획',
  logistics:'건축허가 또는 물류단지계획·개발실시계획',fab:'건축허가·공장설립승인·산업단지계획',
  knowledge:'건축허가·공장설립승인',hazard:'건축허가 또는 관계 특별법 승인',mixed:'구성 용도별 인허가와 전체 사업 승인경로'
};
let editingId=null,uiScheduled=false;
function readProjects(){try{const v=JSON.parse(localStorage.getItem(STORAGE)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
function writeProjects(v){try{localStorage.setItem(STORAGE,JSON.stringify(v));return true}catch(e){return false}}
function activeId(){try{return localStorage.getItem(ACTIVE)||''}catch(e){return ''}}
function activeProject(){const id=activeId();return readProjects().find(x=>x.id===id)||null}
function level(){try{return typeof viewLevel==='function'?viewLevel():Number(localStorage.getItem('pc_master_preview_level')||localStorage.getItem('pc_progress_level')||localStorage.getItem('pc_level')||1)}catch(e){return 1}}
function options(data,value){return Object.entries(data).map(([k,v])=>'<option value="'+esc(k)+'" '+(k===(value||'unknown')?'selected':'')+'>'+esc(v)+'</option>').join('')}
function taskKind(task){if(/심의/.test(task))return'review';if(/인허가|허가자료/.test(task))return'permit';if(/변경업무|변경허가|변경신고|경미한 변경/.test(task))return'change';return'other'}
function routeCandidate(p){return TYPE_HINT[p?.typeId]||'건축허가 또는 별도 사업법상 승인'}
function exceptionText(code,kind,phase){
  if(code==='pre_review')return kind==='review'?'사전심의·사전협의라면 초기 단계의 심의자료도 실제 업무일 수 있어요.':'사전협의 결과가 현재 업무의 선행조건인지 확인하세요.';
  if(code==='partial')return'부분허가·우선시공분이라면 일반적인 단계 순서와 제출도서 범위가 달라질 수 있어요.';
  if(code==='fast_track')return'설계·인허가·시공이 병행되므로 '+phase+'만으로 업무 시점을 단정하지 마세요.';
  if(code==='change')return'변경·보완·재심의라면 최초 절차와 다른 시점에 같은 업무명이 다시 나타날 수 있어요.';
  return code==='none'?'저장된 별도 예외절차는 없습니다.':'예외절차 적용 여부가 아직 입력되지 않았습니다.';
}
function judgement(p,task,phase){
  if(!p)return null;
  const kind=taskKind(task),route=p.approvalRoute||'unknown',business=p.businessMode||'unknown',exception=p.routeException||'unknown';
  const guide=ROUTE_GUIDE[route]||ROUTE_GUIDE.unknown,known=route!=='unknown';
  const title=known?ROUTES[route]+' 기준으로 먼저 보세요':'원 승인경로가 아직 입력되지 않았어요';
  let summary=known?(kind==='change'?guide.change:guide.focus):'시설유형만으로 정하지 말고 '+routeCandidate(p)+' 중 실제 승인서를 확인해야 합니다.';
  if(business==='public')summary+=' 공공발주 여부만으로 인허가 경로가 결정되지는 않습니다.';
  if(business==='special')summary+=' 특별법 사업이라는 명칭보다 실제 승인서와 의제 범위가 기준입니다.';
  const exceptionSummary=exceptionText(exception,kind,phase);
  const verdict=!known?'판단 보류':exception==='unknown'?'조건부 판단':exception==='none'?'일반 경로 가정':'예외 경로 가능';
  return {kind,route,business,exception,known,title,summary,exceptionSummary,verdict,
    checks:['기존 승인서 문서명·근거법·승인기관','현재 절차가 최초·변경·보완 중 무엇인지','관할기관 최신 운영기준과 PM 확인']};
}
function enhanceEditor(){
  const editor=$('cc230Editor'),form=editor?.querySelector('.cc230-form');if(!editor||editor.hidden||!form||$('cc250Business'))return;
  const p=editingId?readProjects().find(x=>x.id===editingId):null;
  const wrap=document.createElement('div');wrap.className='cc250-route-fields';
  wrap.innerHTML='<label><span>사업방식 <small>선택</small></span><select id="cc250Business">'+options(BUSINESS,p?.businessMode)+'</select></label><label><span>원 승인경로 <em>중요</em></span><select id="cc250Route">'+options(ROUTES,p?.approvalRoute)+'</select></label><label><span>현재 예외절차 <small>선택</small></span><select id="cc250Exception">'+options(EXCEPTIONS,p?.routeException)+'</select></label><p>모르면 추정하지 말고 ‘잘 모르겠습니다’로 두세요. 실제 승인서 확인 전에는 경로가 확정되지 않습니다.</p>';
  const memo=[...form.querySelectorAll('label')].find(x=>/메모/.test(x.textContent));memo?form.insertBefore(wrap,memo):form.appendChild(wrap);
}
function persistExtra(s,attempt=0){
  const items=readProjects();let target=s.id?items.find(x=>x.id===s.id):null;
  if(!target)target=items.filter(x=>x.name===s.name).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))[0];
  if(!target){if(attempt<2)setTimeout(()=>persistExtra(s,attempt+1),100);return}
  const next=items.map(x=>x.id===target.id?Object.assign({},x,{businessMode:s.businessMode,approvalRoute:s.approvalRoute,routeException:s.routeException}):x);
  if(!writeProjects(next))return;
  if(activeId()===target.id)window.CC_ACTIVE_PROJECT=Object.assign({},next.find(x=>x.id===target.id));
  document.dispatchEvent(new CustomEvent('cc:project-profile-updated',{detail:{id:target.id}}));scheduleUI();
}
function scheduleUI(){if(uiScheduled)return;uiScheduled=true;setTimeout(()=>{uiScheduled=false;enhanceEditor();enhanceProjectUI()},30)}
function enhanceProjectUI(){
  const map=new Map(readProjects().map(x=>[x.id,x]));
  document.querySelectorAll('.cc230-card').forEach(card=>{const p=map.get(card.dataset.pid),tags=card.querySelector('.cc230-tags');if(!p||!tags)return;const sig=[p.approvalRoute,p.routeException].join('|');if(card.dataset.cc250Sig===sig)return;card.dataset.cc250Sig=sig;tags.querySelectorAll('.cc250-tag').forEach(x=>x.remove());if(p.approvalRoute&&p.approvalRoute!=='unknown')tags.insertAdjacentHTML('beforeend','<span class="cc250-tag">'+esc(ROUTES[p.approvalRoute]||p.approvalRoute)+'</span>');if(p.routeException&&!['unknown','none'].includes(p.routeException))tags.insertAdjacentHTML('beforeend','<span class="cc250-tag exception">'+esc(EXCEPTIONS[p.routeException]||p.routeException)+'</span>')});
  const p=activeProject();document.querySelectorAll('#cc230HomeProject,#cc230SearchProject').forEach(bar=>{const sig=p?.approvalRoute||'';if(bar.dataset.cc250RouteSig===sig)return;bar.dataset.cc250RouteSig=sig;bar.querySelector('.cc250-bar-route')?.remove();if(p?.approvalRoute&&p.approvalRoute!=='unknown')bar.insertAdjacentHTML('beforeend','<span class="cc250-bar-route">'+esc(ROUTES[p.approvalRoute]||p.approvalRoute)+'</span>')});
}
function contextSteps(j){
  if(j.kind==='change')return [ROUTES[j.route]+' 원 승인서와 유효한 기준도서 고정',ROUTE_GUIDE[j.route].change,'변경항목별 승인층·협의대상·처리시점 확인'];
  if(j.kind==='permit')return [ROUTES[j.route]+'의 승인권자와 현재 절차 확인',j.exceptionSummary,'관할 공식 제출목록과 분야별 최신본 연결'];
  if(j.kind==='review')return ['원 승인경로에서 해당 심의의 위치 확인',j.exceptionSummary,'심의조건을 다음 승인·설계도서에 추적 반영'];
  return [j.title,j.exceptionSummary,'최신 기준자료와 다음 결정사항 연결'];
}
function applyRouteHow(root,j,phase){
  const how=root.querySelector('[data-pane="how"]'),why=root.querySelector('[data-pane="why"]');
  if(how){const title=how.querySelector('.cc232-how-head b');if(title)title.textContent=(j.known?ROUTES[j.route]:'승인경로 미확인')+' · 프로젝트 기준 수행';const note=how.querySelector('.cc232-how-head span');if(note)note.textContent='저장된 값은 출발점이며 실제 승인서·승인기관·최신 운영기준으로 다시 확인하세요.';const top=how.querySelector('.cc232-how-steps');if(top)top.innerHTML=contextSteps(j).map((x,i)=>'<div><small>0'+(i+1)+'</small><b>'+esc(x)+'</b></div>').join('')}
  if(why&&!why.querySelector('.cc250-why-route'))why.insertAdjacentHTML('beforeend','<div class="cc250-why-route"><b>'+esc(j.verdict)+'</b><span>'+esc(j.summary)+'</span></div>');
}
function projectRouteBox(j,p,phase){
  const box=document.createElement('section');box.className='cc250-route-context '+(!j.known?'warn':j.exception&&!['unknown','none'].includes(j.exception)?'exception':'');
  box.innerHTML='<div><small>PROJECT ROUTE · '+esc(phase)+'</small><b>'+esc(j.title)+'</b><p>'+esc(j.summary)+'</p></div><div class="cc250-route-tags"><span>'+esc(BUSINESS[j.business]||j.business)+'</span><span>'+esc(ROUTES[j.route]||j.route)+'</span><span>'+esc(EXCEPTIONS[j.exception]||j.exception)+'</span></div>'+(!j.known?'<button type="button" data-cc250-edit>프로젝트에서 경로 입력</button>':'');
  return box;
}
function addJudgement(root,anchor,j,p,phase){
  if(level()<4)return;
  const d=document.createElement('details');d.className='cc250-judgement';
  d.innerHTML='<summary><span>LV.4 · JUDGEMENT</span><b>'+esc(j.verdict)+'</b><em>판단 근거 보기</em></summary><div class="cc250-judge-grid"><div><small>저장된 조건</small><p>'+esc([BUSINESS[j.business],ROUTES[j.route],EXCEPTIONS[j.exception],phase].join(' · '))+'</p></div><div><small>현재 판단</small><p>'+esc(j.summary+' '+j.exceptionSummary)+'</p></div><div><small>확정 전 확인</small><p>'+esc(j.checks.join(' → '))+'</p></div></div><p class="cc250-judge-note">척척의 판단은 경로 후보를 좁히는 가설입니다. 법적 절차의 최종 판단은 실제 승인문서와 관할기관 기준으로 확인하세요.</p>';
  anchor.insertAdjacentElement('afterend',d);
}
function openActiveEditor(){
  if(typeof showView==='function')showView('projects');
  setTimeout(()=>{const id=activeId(),card=[...document.querySelectorAll('.cc230-card')].find(x=>x.dataset.pid===id);card?.querySelector('[data-edit]')?.click()},80);
}
function enhanceContext(){
  const root=$('contextResult'),p=activeProject();if(!root||!root.innerHTML.trim()||!p)return;
  root.querySelectorAll('.cc250-route-context,.cc250-judgement,.cc250-inline').forEach(x=>x.remove());
  const task=$('task')?.value||'',phase=$('phase')?.value||p.phase||'단계 미정',j=judgement(p,task,phase),gate=root.querySelector('.cc247-fit-gate');if(!j)return;
  const admin=j.kind!=='other',hasException=!['unknown','none'].includes(j.exception),routeRelevant=admin||hasException||/법규|지구단위|협력업체|도면 수정/.test(task);
  let anchor=gate||root.querySelector('.cc230-context-project')||root.querySelector('.stage-banner');if(!anchor)return;
  if(gate){
    const copy=gate.querySelector('.cc247-fit-copy');if(copy)copy.insertAdjacentHTML('beforeend','<div class="cc250-inline"><b>'+esc(j.title)+'</b><span>'+esc(j.summary)+'</span></div>');
    const actual=gate.querySelector('[data-fit="actual"]');if(actual){actual.textContent=j.exception==='change'?'변경·보완 절차로 보기':j.known?'이 프로젝트 절차로 보기':'현재 절차를 확인했어요';actual.addEventListener('click',()=>setTimeout(()=>applyRouteHow(root,j,phase),20),{once:true})}
    if(gate.classList.contains('mismatch')&&((j.exception==='change'&&admin)||(j.exception==='pre_review'&&j.kind==='review'))){gate.classList.remove('mismatch');gate.classList.add('conditional');const sm=gate.querySelector('small');if(sm)sm.textContent='예외 절차 확인 · '+phase;const t=gate.querySelector('.cc247-title');if(t)t.textContent='저장된 예외절차 때문에 실제 업무일 수 있어요'}
  }else if(admin||hasException){const box=projectRouteBox(j,p,phase);anchor.insertAdjacentElement('afterend',box);anchor=box;box.querySelector('[data-cc250-edit]')?.addEventListener('click',openActiveEditor)}
  if(routeRelevant)addJudgement(root,anchor,j,p,phase);
}
function style(){
  if($('cc250Style'))return;const s=document.createElement('style');s.id='cc250Style';s.textContent=`
  .cc250-route-fields{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;padding:12px;border:1px solid #DCE6F5;border-radius:13px;background:#F7F9FD}.cc250-route-fields label{min-width:0}.cc250-route-fields p{grid-column:1/-1;margin:0;color:#7B8798;font-size:9px;line-height:1.5}.cc250-tag{color:#355FA9!important;background:#EEF4FF!important}.cc250-tag.exception{color:#8A6425!important;background:#FFF4D8!important}.cc250-bar-route{margin-left:auto;padding:4px 7px;border-radius:999px;background:#EEF4FF;color:#3F67AD!important;font-size:8px!important;font-weight:900}.cc250-route-context{display:flex;align-items:center;gap:12px;margin:10px 0;padding:11px 13px;border:1px solid #DCE6F5;border-radius:13px;background:#F7F9FD}.cc250-route-context.warn{border-color:#E9DFC5;background:#FFF9EE}.cc250-route-context.exception{border-color:#D9E1F5;background:#F4F7FF}.cc250-route-context>div:first-child{flex:1;min-width:0}.cc250-route-context small{display:block;color:#5572AA;font-size:8px;font-weight:950}.cc250-route-context b{display:block;margin-top:3px;color:#334C70;font-size:11px}.cc250-route-context p{margin:3px 0 0;color:#68778C;font-size:9px;line-height:1.5}.cc250-route-tags{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.cc250-route-tags span{padding:5px 7px;border-radius:999px;background:#fff;color:#58708F;font-size:8px;font-weight:850}.cc250-route-context button{border:1px solid #D8E2F1;border-radius:9px;background:#fff;padding:7px 9px;color:#4168AD;font-size:8.5px;font-weight:900}.cc250-inline{display:grid;gap:2px;margin-top:7px;padding-top:7px;border-top:1px solid rgba(85,112,155,.18)}.cc250-inline b{margin:0!important;color:#3E5F8D!important;font-size:9px!important}.cc250-inline span{color:#6D7C90;font-size:8.5px;line-height:1.45}.cc250-judgement{margin:9px 0;border:1px solid #D9E3F3;border-radius:13px;background:#fff;overflow:hidden}.cc250-judgement summary{display:flex;align-items:center;gap:8px;padding:10px 13px;cursor:pointer;list-style:none}.cc250-judgement summary::-webkit-details-marker{display:none}.cc250-judgement summary span{color:#526FE0;font-size:8px;font-weight:950}.cc250-judgement summary b{color:#344D70;font-size:10px}.cc250-judgement summary em{margin-left:auto;color:#8793A4;font-size:8px;font-style:normal}.cc250-judge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:0 12px 10px}.cc250-judge-grid>div{padding:9px;border-radius:10px;background:#F7F9FC}.cc250-judge-grid small{color:#61748E;font-size:8px;font-weight:950}.cc250-judge-grid p{margin:4px 0 0;color:#53657C;font-size:8.5px;line-height:1.5}.cc250-judge-note{margin:0;padding:9px 12px;border-top:1px solid #E9EDF3;color:#7A8798;font-size:8px;line-height:1.5}.cc250-why-route{display:flex;gap:8px;margin-top:9px;padding:9px 11px;border-radius:10px;background:#F5F8FD}.cc250-why-route b{flex:0 0 auto;color:#4567A3;font-size:9px}.cc250-why-route span{color:#65758A;font-size:9px;line-height:1.5}
  @media(max-width:800px){.cc250-route-fields,.cc250-judge-grid{grid-template-columns:1fr}.cc250-route-fields p{grid-column:auto}.cc250-route-context{align-items:flex-start;flex-direction:column}.cc250-route-tags{justify-content:flex-start}.cc250-bar-route{margin-left:0}.cc250-judgement summary{align-items:flex-start;flex-wrap:wrap}.cc250-judgement summary em{margin-left:0;width:100%}}
  `;document.head.appendChild(s);
}
function install(){
  style();
  document.addEventListener('click',e=>{
    const edit=e.target.closest('.cc230-card [data-edit]');if(edit)editingId=edit.closest('.cc230-card')?.dataset.pid||null;
    if(e.target.closest('#cc230New,#cc230EmptyNew'))editingId=null;
    if(e.target.closest('#cc230Save')){const name=$('cc230Name')?.value.trim()||'';if(name){const snap={id:editingId,name,businessMode:$('cc250Business')?.value||'unknown',approvalRoute:$('cc250Route')?.value||'unknown',routeException:$('cc250Exception')?.value||'unknown'};setTimeout(()=>persistExtra(snap),60)}}
    if(e.target.closest('#analyze'))setTimeout(enhanceContext,140);
    if(e.target.closest('.master-levels button'))setTimeout(enhanceContext,140);
    scheduleUI();
  },true);
  document.addEventListener('cc:project-profile-updated',()=>setTimeout(enhanceContext,80));
  new MutationObserver(scheduleUI).observe(document.body,{childList:true,subtree:true});
  scheduleUI();if($('contextResult')?.innerHTML.trim())setTimeout(enhanceContext,160);
  window.CC_PROJECT_ROUTE_JUDGEMENT={version:VERSION,fields:['businessMode','approvalRoute','routeException'],business:BUSINESS,routes:ROUTES,exceptions:EXCEPTIONS,judgement};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
