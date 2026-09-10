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
function style(){
  if($('cc250Style'))return;const s=document.createElement('style');s.id='cc250Style';s.textContent=`
  .cc250-route-fields{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;padding:12px;border:1px solid #DCE6F5;border-radius:13px;background:#F7F9FD}.cc250-route-fields label{min-width:0}.cc250-route-fields p{grid-column:1/-1;margin:0;color:#7B8798;font-size:9px;line-height:1.5}.cc250-tag{color:#355FA9!important;background:#EEF4FF!important}.cc250-tag.exception{color:#8A6425!important;background:#FFF4D8!important}.cc250-bar-route{margin-left:auto;padding:4px 7px;border-radius:999px;background:#EEF4FF;color:#3F67AD!important;font-size:8px!important;font-weight:900}.cc250-route-context{display:flex;align-items:center;gap:12px;margin:10px 0;padding:11px 13px;border:1px solid #DCE6F5;border-radius:13px;background:#F7F9FD}.cc250-route-context.warn{border-color:#E9DFC5;background:#FFF9EE}.cc250-route-context.exception{border-color:#D9E1F5;background:#F4F7FF}.cc250-route-context>div:first-child{flex:1;min-width:0}.cc250-route-context small{display:block;color:#5572AA;font-size:8px;font-weight:950}.cc250-route-context b{display:block;margin-top:3px;color:#334C70;font-size:11px}.cc250-route-context p{margin:3px 0 0;color:#68778C;font-size:9px;line-height:1.5}.cc250-route-tags{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.cc250-route-tags span{padding:5px 7px;border-radius:999px;background:#fff;color:#58708F;font-size:8px;font-weight:850}.cc250-route-context button{border:1px solid #D8E2F1;border-radius:9px;background:#fff;padding:7px 9px;color:#4168AD;font-size:8.5px;font-weight:900}.cc250-inline{display:grid;gap:2px;margin-top:7px;padding-top:7px;border-top:1px solid rgba(85,112,155,.18)}.cc250-inline b{margin:0!important;color:#3E5F8D!important;font-size:9px!important}.cc250-inline span{color:#6D7C90;font-size:8.5px;line-height:1.45}.cc250-judgement{margin:9px 0;border:1px solid #D9E3F3;border-radius:13px;background:#fff;overflow:hidden}.cc250-judgement summary{display:flex;align-items:center;gap:8px;padding:10px 13px;cursor:pointer;list-style:none}.cc250-judgement summary::-webkit-details-marker{display:none}.cc250-judgement summary span{color:#526FE0;font-size:8px;font-weight:950}.cc250-judgement summary b{color:#344D70;font-size:10px}.cc250-judgement summary em{margin-left:auto;color:#8793A4;font-size:8px;font-style:normal}.cc250-judge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:0 12px 10px}.cc250-judge-grid>div{padding:9px;border-radius:10px;background:#F7F9FC}.cc250-judge-grid small{color:#61748E;font-size:8px;font-weight:950}.cc250-judge-grid p{margin:4px 0 0;color:#53657C;font-size:8.5px;line-height:1.5}.cc250-judge-note{margin:0;padding:9px 12px;border-top:1px solid #E9EDF3;color:#7A8798;font-size:8px;line-height:1.5}.cc250-why-route{display:flex;gap:8px;margin-top:9px;padding:9px 11px;border-radius:10px;background:#F5F8FD}.cc250-why-route b{flex:0 0 auto;color:#4567A3;font-size:9px}.cc250-why-route span{color:#65758A;font-size:9px;line-height:1.5}
  @media(max-width:800px){.cc250-route-fields,.cc250-judge-grid{grid-template-columns:1fr}.cc250-route-fields p{grid-column:auto}.cc250-route-context{align-items:flex-start;flex-direction:column}.cc250-route-tags{justify-content:flex-start}.cc250-bar-route{margin-left:0}.cc250-judgement summary{align-items:flex-start;flex-wrap:wrap}.cc250-judgement summary em{margin-left:0;width:100%}}
  `;document.head.appendChild(s);
}
function install(){
  style();
  window.CC_PROJECTS_UI.registerEditorExtension('approval-route',{render:enhanceEditor,collect:collectFields});
  window.CC_RUNTIME.registerContext('project-route',enhanceContext);
  document.addEventListener('cc:projects-rendered',enhanceProjectUI);
  enhanceProjectUI();
  window.CC_PROJECT_ROUTE_JUDGEMENT={version:VERSION,fields:['businessMode','approvalRoute','routeException'],business:BUSINESS,routes:ROUTES,exceptions:EXCEPTIONS,judgement};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
