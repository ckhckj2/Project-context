(()=>{
'use strict';
const VERSION='2.1.47';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const {PHASE_ORDER,PHASE_RULES,CHANGE_RULES,phaseRule}=window.CC_WORK_RULES.phase;

function level(){return window.CC_LEVEL_STORE.state().view}
function selected(){return {task:$('task')?.value||'',phase:$('phase')?.value||'',project:$('project')?.selectedOptions?.[0]?.textContent?.trim()||''}}
function updateFlow(root,phase){
  const now=root.querySelector('.flow .node.now');
  if(now){const original=now.dataset.cc246Original||now.textContent.trim();now.dataset.cc246Original=original;now.textContent=`${phase} · ${original}`;}
  const copy=root.querySelector('.stage-copy p');const {task}=selected();
  if(copy)copy.textContent=`이 단계에서 ${task}의 목적·확인자료·실행순서를 나눠 봅니다.`;
}
function updateContext(root,phase,task){
  const pane=root.querySelector('[data-pane="context"]');const cells=pane?.querySelectorAll('.detail-cell p');if(!cells||cells.length<3)return;
  const i=PHASE_ORDER.indexOf(phase);if(i<0)return;
  cells[0].textContent=i>0?PHASE_ORDER[i-1]:'사업조건·대지·요구사항 확인';
  cells[1].textContent=`${phase} · ${task}`;
  cells[2].textContent=i<PHASE_ORDER.length-1?PHASE_ORDER[i+1]:'준공·사용승인 및 운영 인계';
}
function updateWhy(root,task,phase,rule){
  window.CC_CONTEXT_VIEW.setWhy(root,{title:phase+' · '+task+'의 목적과 확인자료',why:rule.whyText,risk:rule.risk,done:rule.doneText,material:rule.material,source:rule.source,order:rule.order});
}
function updateHow(root,task,phase,rule){
  window.CC_CONTEXT_VIEW.setHow(root,{title:rule.how(task),note:rule.note,steps:rule.howSteps,done:rule.doneText,material:rule.material});
  if(level()<3)return;
  const pane=root.querySelector('[data-pane="how"]');if(!pane)return;
  let phaseBox=pane.querySelector('.cc246-how-phase');
  if(!phaseBox){phaseBox=document.createElement('div');phaseBox.className='cc246-how-phase';const details=pane.querySelector('.cc232-how-detail');if(details)details.insertAdjacentElement('beforebegin',phaseBox);else pane.appendChild(phaseBox);}
  phaseBox.innerHTML=`<small>${esc(phase)} · 완료 기준</small><b>${esc(rule.doneText)}</b>`;
}
function enhance(){
  const root=$('contextResult');if(!root||!root.innerHTML.trim())return;
  const {task,phase}=selected();const model=window.CC_WORK_CONTEXT.resolve();const data=model.phase;if(!data)return;
  const rule={...data,how:()=>data.howTitle};
  updateFlow(root,phase);updateContext(root,phase,task);updateWhy(root,task,phase,rule);updateHow(root,task,phase,rule);
  root.dataset.cc246Phase=phase;
}
function style(){
  if($('cc246Style'))return;const s=document.createElement('style');s.id='cc246Style';s.textContent=`
  .cc246-phase-label{display:inline-flex;margin:0 7px 4px 0;padding:4px 7px;border-radius:999px;background:#EEF4FF;color:#3565BD;font-size:8.5px;font-weight:950;vertical-align:middle}.cc246-how-phase{display:flex;gap:8px;align-items:flex-start;padding:10px 13px;border:1px solid #DCE7F7;border-top:0;background:#F3F7FE}.cc246-how-phase small{flex:0 0 auto;color:#3765B7;font-size:8.5px;font-weight:950}.cc246-how-phase b{color:#435B79;font-size:10px;line-height:1.5}.flow .node.now{max-width:190px;line-height:1.35}
  @media(max-width:700px){.cc246-how-phase{display:grid;gap:4px}.flow .node.now{max-width:none}}
  `;document.head.appendChild(s);
}
function install(){
  style();
  window.CC_RUNTIME.registerContext('phase',enhance);
  window.CC_PHASE_CONTEXT={version:VERSION,phases:PHASE_ORDER.length,phaseAware:true};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
