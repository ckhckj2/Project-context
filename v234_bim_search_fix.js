(()=>{
'use strict';
const VERSION='2.1.34';
const store=window.CC_PROJECT_STORE;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));


const activeProject=()=>store.active();
const {hasBim,modeLabel,isExplicitBim,isWorkQuery,taskKey,EXTRA,modeInfo}=window.CC_BIM_RULES.search;

function renderAdjustment(q){
 const p=activeProject(),root=$('searchResult');if(!root)return;
 root.querySelectorAll('.cc233-bim-search,.cc234-bim-search').forEach(x=>x.remove());
 if(!hasBim(p)||!q||isExplicitBim(q)||!isWorkQuery(q)||root.querySelector('.cc232-bim-card,.cc235-review-card,.cc235-overview,.cc235-permit'))return;
 const card=root.querySelector('.result-card')||root.firstElementChild;if(!card)return;
 const [title,checks]=EXTRA[taskKey(q)]||EXTRA.general;const [focus,where,who]=modeInfo(p.bimMode);
 const box=document.createElement('div');box.className='cc234-bim-search';
 box.innerHTML=`<div class="cc234-title"><div><small>BIM MODE · ${esc(modeLabel(p.bimMode))}</small><b>${esc(title)} · BIM 프로젝트 추가 확인</b></div><span>${esc(focus)}</span></div><div class="cc234-checks">${checks.map((x,i)=>`<div><i>${i+1}</i><p>${esc(x)}</p></div>`).join('')}</div><div class="cc234-meta"><div><small>어디서 확인?</small><p>${esc(where)}</p></div><div><small>누구에게?</small><p>${esc(who)}</p></div></div>`;
 card.appendChild(box);
}

function installStyle(){if($('cc234Style'))return;const s=document.createElement('style');s.id='cc234Style';s.textContent=`.cc234-bim-search{margin-top:12px;border:1px solid #cfdcf6;border-radius:13px;overflow:hidden;background:#f8fbff}.cc234-title{display:flex;justify-content:space-between;gap:12px;padding:12px 13px;background:#eef4ff}.cc234-title small{display:block;font-size:8px;font-weight:950;letter-spacing:.07em;color:#4f67e8}.cc234-title b{display:block;margin-top:3px;font-size:11px;color:#274668}.cc234-title span{font-size:9px;color:#657892;text-align:right}.cc234-checks{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding:10px}.cc234-checks>div{display:grid;grid-template-columns:20px 1fr;gap:7px;padding:8px;border-radius:9px;background:#fff}.cc234-checks i{display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#eef2ff;color:#5369e8;font-size:8px;font-style:normal;font-weight:950}.cc234-checks p,.cc234-meta p{margin:1px 0 0;font-size:9px;line-height:1.5;color:#405570}.cc234-meta{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:0 10px 10px}.cc234-meta>div{padding:8px 9px;border-radius:9px;background:#f1f5fa}.cc234-meta small{font-size:8px;font-weight:950;color:#6b7a8f}@media(max-width:700px){.cc234-title{display:grid}.cc234-title span{text-align:left}.cc234-checks,.cc234-meta{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function install(){
  installStyle();
  window.CC_RUNTIME.registerResult('bim',()=>renderAdjustment($('searchInput')?.value||''));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
