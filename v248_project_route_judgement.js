(()=>{
'use strict';
const VERSION='2.1.50';
const store=window.CC_PROJECT_STORE;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const {BUSINESS,ROUTES,EXCEPTIONS,ROUTE_GUIDE,TYPE_HINT,taskKind,routeCandidate,exceptionText,judgement,contextSteps}=window.CC_WORK_RULES.route;
const readProjects=()=>store.list();
const activeId=()=>store.activeId();
const activeProject=()=>store.active();
function level(){return window.CC_LEVEL_STORE.state().view}
function options(data,value){return Object.entries(data).map(([k,v])=>'<option value="'+esc(k)+'" '+(k===(value||'unknown')?'selected':'')+'>'+esc(v)+'</option>').join('')}
function enhanceEditor(p=null){
  const editor=$('cc230Editor'),form=editor?.querySelector('.cc230-form');if(!editor||editor.hidden||!form||$('cc250Business'))return;
  const wrap=document.createElement('div');wrap.className='cc250-route-fields';
  wrap.innerHTML='<label><span>사업방식 <small>선택</small></span><select id="cc250Business">'+options(BUSINESS,p?.businessMode)+'</select></label><label><span>원 승인경로 <em>중요</em></span><select id="cc250Route">'+options(ROUTES,p?.approvalRoute)+'</select></label><label><span>현재 예외절차 <small>선택</small></span><select id="cc250Exception">'+options(EXCEPTIONS,p?.routeException)+'</select></label><p>모르면 추정하지 말고 ‘잘 모르겠습니다’로 두세요. 실제 승인서 확인 전에는 경로가 확정되지 않습니다.</p>';
  const memo=[...form.querySelectorAll('label')].find(x=>/메모/.test(x.textContent));memo?form.insertBefore(wrap,memo):form.appendChild(wrap);
}
function collectFields(){
  const fields={};
  for(const [id,key] of [['cc250Business','businessMode'],['cc250Route','approvalRoute'],['cc250Exception','routeException']]){
    if($(id))fields[key]=$(id).value;
  }
  return fields;
}
function enhanceProjectUI(){
  const map=new Map(readProjects().map(x=>[x.id,x]));
  document.querySelectorAll('.cc230-card').forEach(card=>{const p=map.get(card.dataset.pid),tags=card.querySelector('.cc230-tags');if(!p||!tags)return;const sig=[p.approvalRoute,p.routeException].join('|');if(card.dataset.cc250Sig===sig)return;card.dataset.cc250Sig=sig;tags.querySelectorAll('.cc250-tag').forEach(x=>x.remove());if(p.approvalRoute&&p.approvalRoute!=='unknown')tags.insertAdjacentHTML('beforeend','<span class="cc250-tag">'+esc(ROUTES[p.approvalRoute]||p.approvalRoute)+'</span>');if(p.routeException&&!['unknown','none'].includes(p.routeException))tags.insertAdjacentHTML('beforeend','<span class="cc250-tag exception">'+esc(EXCEPTIONS[p.routeException]||p.routeException)+'</span>')});
  const p=activeProject();document.querySelectorAll('#cc230HomeProject,#cc230SearchProject').forEach(bar=>{const sig=p?.approvalRoute||'';if(bar.dataset.cc250RouteSig===sig)return;bar.dataset.cc250RouteSig=sig;bar.querySelector('.cc250-bar-route')?.remove();if(p?.approvalRoute&&p.approvalRoute!=='unknown')bar.insertAdjacentHTML('beforeend','<span class="cc250-bar-route">'+esc(ROUTES[p.approvalRoute]||p.approvalRoute)+'</span>')});
}
function applyRouteHow(root,j,phase){
  const why=root.querySelector('[data-pane="why"]');
  window.CC_CONTEXT_VIEW.setHow(root,{title:(j.known?ROUTES[j.route]:'승인경로 미확인')+' · 프로젝트 기준 수행',note:'저장된 값은 출발점이며 실제 승인서·승인기관·최신 운영기준으로 다시 확인하세요.',steps:contextSteps(j)});
  if(why&&!why.querySelector('.cc250-why-route'))why.insertAdjacentHTML('beforeend','<div class="cc250-why-route"><b>'+esc(j.verdict)+'</b><span>'+esc(j.summary)+'</span></div>');
}
function projectRouteBox(j,p,phase){
  const box=document.createElement('section');box.className='cc250-route-context '+(!j.known?'warn':j.exception&&!['unknown','none'].includes(j.exception)?'exception':'');
  box.innerHTML='<div><small>PROJECT ROUTE · '+esc(phase)+'</small><b>'+esc(j.title)+'</b><p>'+esc(j.summary)+'</p></div><div class="cc250-route-tags"><span>'+esc(BUSINESS[j.business]||j.business)+'</span><span>'+esc(ROUTES[j.route]||j.route)+'</span><span>'+esc(EXCEPTIONS[j.exception]||j.exception)+'</span></div>'+(!j.known?'<button type="button" data-cc250-edit>프로젝트에서 경로 입력</button>':'');
  return box;
}
function openActiveEditor(){
  if(typeof showView==='function')showView('projects');
  setTimeout(()=>{const id=activeId(),card=[...document.querySelectorAll('.cc230-card')].find(x=>x.dataset.pid===id);card?.querySelector('[data-edit]')?.click()},80);
}
function enhanceContext(){
  const root=$('contextResult'),p=activeProject();if(!root||!root.innerHTML.trim()||!p)return;
  root.querySelectorAll('.cc250-route-context,.cc250-judgement,.cc250-inline').forEach(x=>x.remove());
  const task=$('task')?.value||'',phase=$('phase')?.value||p.phase||'단계 미정',j=window.CC_WORK_CONTEXT.resolve().route,gate=root.querySelector('.cc247-fit-gate');if(!j)return;
  const admin=j.kind!=='other',hasException=!['unknown','none'].includes(j.exception),routeRelevant=admin||hasException||/법규|지구단위|협력업체|도면 수정/.test(task);
  let anchor=gate||root.querySelector('.cc230-context-project')||root.querySelector('.stage-banner');if(!anchor)return;
  if(gate){
    const copy=gate.querySelector('.cc247-fit-copy');if(copy)copy.insertAdjacentHTML('beforeend','<div class="cc250-inline"><b>'+esc(j.title)+'</b><span>'+esc(j.summary)+'</span></div>');
    const actual=gate.querySelector('[data-fit="actual"]');if(actual){actual.textContent=j.exception==='change'?'변경·보완 절차로 보기':j.known?'이 프로젝트 절차로 보기':'현재 절차를 확인했어요';actual.addEventListener('click',()=>{applyRouteHow(root,j,phase);window.CC_RUNTIME.refreshContextPresentation()},{once:true})}
    if(gate.classList.contains('mismatch')&&((j.exception==='change'&&admin)||(j.exception==='pre_review'&&j.kind==='review'))){gate.classList.remove('mismatch');gate.classList.add('conditional');const sm=gate.querySelector('small');if(sm)sm.textContent='예외 절차 확인 · '+phase;const t=gate.querySelector('.cc247-title');if(t)t.textContent='저장된 예외절차 때문에 실제 업무일 수 있어요'}
  }else if(admin||hasException){const box=projectRouteBox(j,p,phase);anchor.insertAdjacentElement('afterend',box);anchor=box;box.querySelector('[data-cc250-edit]')?.addEventListener('click',openActiveEditor)}
  // Detailed judgement is owned by judgement-ui.js for all project types.
}

function install(){

  window.CC_PROJECTS_UI.registerEditorExtension('approval-route',{render:enhanceEditor,collect:collectFields});
  window.CC_RUNTIME.registerContext('project-route',enhanceContext);
  document.addEventListener('cc:projects-rendered',enhanceProjectUI);
  enhanceProjectUI();
  window.CC_PROJECT_ROUTE_JUDGEMENT={version:VERSION,fields:['businessMode','approvalRoute','routeException'],business:BUSINESS,routes:ROUTES,exceptions:EXCEPTIONS,judgement};
}
window.CC_BOOT.register('v248_project_route_judgement',install);
})();
