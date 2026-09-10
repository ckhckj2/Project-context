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
  const pane=root.querySelector('[data-pane="how"]');if(!pane||window.CC_LEVEL_STORE.state().view<3)return;
  pane.querySelector('.cc233-bim-adjust')?.remove();
  const task=$('task')?.value||'';
  const detail=pane.querySelector('.cc232-how-detail');const box=buildBox(p,task,false);
  if(detail)detail.insertAdjacentElement('beforebegin',box);else pane.appendChild(box);
}

function installStyle(){
  if($('cc233Style'))return;const s=document.createElement('style');s.id='cc233Style';s.textContent=`
  .cc233-bim-adjust{margin:10px 0 0;border:1px solid #dce5f5;border-radius:13px;background:#f8fbff;overflow:hidden}.cc233-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:12px 13px;background:#eef4ff}.cc233-head small{display:block;font-size:8px;font-weight:950;letter-spacing:.07em;color:#4f67e8}.cc233-head b{display:block;margin-top:3px;font-size:11px;color:#274668}.cc233-head>span{font-size:9px;line-height:1.45;color:#657892;text-align:right}.cc233-checks{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding:10px}.cc233-checks>div{display:grid;grid-template-columns:20px 1fr;gap:7px;align-items:start;padding:8px;border-radius:9px;background:#fff}.cc233-checks i{display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#eef2ff;color:#5369e8;font-size:8px;font-style:normal;font-weight:950}.cc233-checks p,.cc233-meta p{margin:1px 0 0;font-size:9px;line-height:1.5;color:#405570}.cc233-meta{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:0 10px 10px}.cc233-meta>div{padding:8px 9px;border-radius:9px;background:#f1f5fa}.cc233-meta small{font-size:8px;font-weight:950;color:#6b7a8f}.cc233-bim-search{margin-top:10px}.cc233-bim-adjust.compact{margin:0}.cc233-bim-adjust.compact .cc233-checks{grid-template-columns:repeat(2,1fr)}
  @media(max-width:700px){.cc233-head{display:grid}.cc233-head>span{text-align:left}.cc233-checks,.cc233-bim-adjust.compact .cc233-checks,.cc233-meta{grid-template-columns:1fr}}
  `;document.head.appendChild(s)
}
function install(){
  installStyle();
  window.CC_RUNTIME.registerContext('bim',patchHow);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
