(()=>{
'use strict';
const VERSION='2.1.49';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const {STATUS,MATRIX,COPY,PREP,ACTUAL,ADMIN,classify}=window.CC_WORK_RULES.fit;
function selected(){return {task:$('task')?.value||'',phase:$('phase')?.value||''}}
function setPending(root,on){
  const a=root.querySelector('.actions');if(!a)return;
  a.classList.toggle('cc247-pending',on);a.setAttribute('aria-hidden',String(on));
}
function closeDrawers(root){
  root.querySelectorAll('.drawer.show').forEach(x=>x.classList.remove('show'));
  root.querySelectorAll('[data-drawer]').forEach(x=>{x.classList.remove('cc-drawer-active');x.setAttribute('aria-expanded','false')});
}
function applyPrep(root,key,phase,mode){
  const answer=window.CC_WORK_MODEL.fitAnswer(key,phase,mode);
  window.CC_CONTEXT_VIEW.setWhy(root,answer.why);
  window.CC_CONTEXT_VIEW.setHow(root,answer.how);
}
function applyActual(root,key,phase){
  const why=root.querySelector('[data-pane="why"]');
  window.CC_CONTEXT_VIEW.setHow(root,window.CC_WORK_MODEL.fitAnswer(key,phase,'actual').how);
  if(why){
    why.querySelector('.cc247-exception-note')?.remove();
    const n=document.createElement('div');n.className='cc247-exception-note';
    n.innerHTML=ADMIN.has(key)?'<b>예외 절차 확인</b><span>사전심의·부분허가·변경/보완절차·특별법·패스트트랙 등은 프로젝트별로 다릅니다. PM/인허가 담당과 관할 공식 안내로 확인하세요.</span>':'<b>현재 단계 확인</b><span>이 단계에서 실제 수행하는 이유와 결과물의 사용처를 확인한 뒤 기존 답변을 적용하세요.</span>';
    why.appendChild(n);
  }
}
function resolve(root,gate,key,phase,mode){
  setPending(root,false);gate.classList.add('resolved');gate.dataset.mode=mode;
  if(mode==='actual'){
    gate.querySelector('.cc247-title').textContent=ADMIN.has(key)?'실제 제출·변경 절차로 안내합니다':'현재 단계에서 실제 수행하는 업무로 안내합니다';
    gate.querySelector('.cc247-body').textContent=ADMIN.has(key)?'예외 가능성을 열어두고 정확한 절차명과 승인권자 확인을 우선합니다.':'업무 목적과 최신 기준자료를 확인하는 순서부터 안내합니다.';
    applyActual(root,key,phase);
  }else{
    gate.querySelector('.cc247-title').textContent=mode==='prep'?'선행 준비 업무로 안내합니다':'현재 단계의 목적에 맞게 다시 안내합니다';
    gate.querySelector('.cc247-body').textContent=ADMIN.has(key)?'현재 단계에 맞춰 대상·경로·시기·확인처 중심으로 내용을 바꿨어요.':'현재 단계에서 결정해야 할 내용과 기준자료 중심으로 바꿨어요.';
    applyPrep(root,key,phase,mode);
  }
  gate.querySelector('.cc247-choices')?.remove();
  window.CC_RUNTIME.refreshContextPresentation();
}
function goPhase(){
  if(typeof window.showView==='function')window.showView('home');else document.querySelector('[data-view="home"]')?.click();
  setTimeout(()=>$('phase')?.focus(),80);
}
function render(root,fit){
  root.querySelector('.cc247-fit-gate')?.remove();
  if(!fit||fit.status==='normal'){setPending(root,false);return}
  const phase=selected().phase,copy=COPY[fit.key][fit.status]||COPY[fit.key].conditional,state=STATUS[fit.status];
  const actualLabel=ADMIN.has(fit.key)?(fit.status==='mismatch'?'변경·보완 절차예요':'실제 제출 절차예요'):'이 단계에서 실제 수행해요';
  const gate=document.createElement('section');gate.className='cc247-fit-gate '+state[1];
  gate.innerHTML='<div class="cc247-fit-copy"><small>'+esc(state[0])+' · '+esc(phase)+'</small><b class="cc247-title">'+esc(copy[0])+'</b><p class="cc247-body">'+esc(copy[1])+'</p></div><div class="cc247-choices"><button type="button" data-fit="prep">'+(fit.status==='prep'?'선행 준비로 보기':'단계에 맞게 다시 보기')+'</button><button type="button" data-fit="actual">'+actualLabel+'</button><button type="button" data-fit="phase">단계 다시 선택</button></div>';
  const stage=root.querySelector('.stage-banner');if(stage)stage.insertAdjacentElement('afterend',gate);else root.prepend(gate);
  closeDrawers(root);setPending(root,true);
  gate.querySelector('[data-fit="prep"]').onclick=()=>resolve(root,gate,fit.key,phase,fit.status==='prep'?'prep':'check');
  gate.querySelector('[data-fit="actual"]').onclick=()=>resolve(root,gate,fit.key,phase,'actual');
  gate.querySelector('[data-fit="phase"]').onclick=goPhase;
}
function enhance(){
  const root=$('contextResult');if(!root||!root.innerHTML.trim())return;
  const s=selected();render(root,classify(s.task,s.phase));
}
function style(){
  if($('cc247Style'))return;const s=document.createElement('style');s.id='cc247Style';
  s.textContent='.cc247-fit-gate{display:flex;justify-content:space-between;gap:18px;align-items:center;margin:12px 0;padding:14px 16px;border:1px solid #D8E5F7;border-radius:14px;background:#F4F8FE}.cc247-fit-gate.conditional{border-color:#E9DFC5;background:#FFF9EE}.cc247-fit-gate.mismatch{border-color:#EED7D7;background:#FFF5F5}.cc247-fit-copy{min-width:0}.cc247-fit-copy small{display:block;color:#3864B0;font-size:8.5px;font-weight:950}.cc247-fit-gate.conditional small{color:#8A672C}.cc247-fit-gate.mismatch small{color:#A55252}.cc247-fit-copy b{display:block;margin-top:4px;color:#314A6B;font-size:13px}.cc247-fit-copy p{margin:4px 0 0;color:#68788D;font-size:10px;line-height:1.5}.cc247-choices{display:flex;flex:0 0 auto;flex-wrap:wrap;justify-content:flex-end;gap:6px}.cc247-choices button{padding:7px 9px;border:1px solid #D7E0EC;border-radius:9px;background:#fff;color:#4F6380;font-size:9px;font-weight:900}.cc247-choices button:first-child{border-color:#8FB1E8;background:#EEF4FF;color:#2E5EB5}.cc247-fit-gate.resolved{padding:11px 14px}.actions.cc247-pending{display:none!important}.cc247-mode{display:inline-flex;margin-right:7px;padding:4px 7px;border-radius:999px;background:#EEF4FF;color:#3565BD;font-size:8.5px;font-weight:950}.cc247-exception-note{display:flex;gap:8px;margin-top:10px;padding:10px 12px;border:1px solid #E9DFC5;border-radius:11px;background:#FFF9EE}.cc247-exception-note b{flex:0 0 auto;color:#856227;font-size:9px}.cc247-exception-note span{color:#6F6553;font-size:9.5px;line-height:1.5}@media(max-width:760px){.cc247-fit-gate{align-items:stretch;flex-direction:column}.cc247-choices{justify-content:flex-start}.cc247-choices button{flex:1 1 auto}.cc247-exception-note{display:grid}}';
  document.head.appendChild(s);
}
function install(){
  style();
  window.CC_RUNTIME.registerContext('phase-fit',enhance);
  const counts={normal:0,prep:0,conditional:0,mismatch:0};
  Object.values(MATRIX).forEach(x=>Object.values(x.phases).forEach(v=>counts[v]++));
  window.CC_TASK_PHASE_FIT={version:VERSION,scope:'all-13',tasks:Object.keys(MATRIX).length,decisions:Object.keys(MATRIX).length*6,statuses:Object.keys(STATUS),counts};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
