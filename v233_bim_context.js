(()=>{
'use strict';
const VERSION='2.1.33';
const store=window.CC_PROJECT_STORE;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const activeProject=()=>store.active();
const {hasBim,modeLabel,taskKey,TASK_EXTRA,modeExtra}=window.CC_BIM_RULES.context;

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
  // Basic HOW is available at every level, including its BIM supplement.
  const pane=root.querySelector('[data-pane="how"]');if(!pane)return;
  pane.querySelector('.cc233-bim-adjust')?.remove();
  const task=$('task')?.value||'';
  const detail=pane.querySelector('.cc232-how-detail');const box=buildBox(p,task,false);
  if(detail)detail.insertAdjacentElement('beforebegin',box);else pane.appendChild(box);
}


function install(){

  window.CC_RUNTIME.registerContext('bim',patchHow);
}
window.CC_BOOT.register('v233_bim_context',install);
})();
