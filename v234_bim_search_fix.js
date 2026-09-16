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


function install(){

  window.CC_RUNTIME.registerResult('bim',()=>renderAdjustment($('searchInput')?.value||''));
}
window.CC_BOOT.register('v234_bim_search_fix',install);
})();
