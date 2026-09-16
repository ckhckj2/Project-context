(()=>{
'use strict';
const VERSION='2.1.27';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const {PUBLIC_RE,PUBLIC_HINT_IDS,LINKS,intent,copyFor}=window.CC_PUBLIC_RULES;

function stepFlow(){return '<div class="cc227-flow">'+window.CC_PUBLIC_RULES.flow.map(([title,note],i)=>`<div><small>${String(i+1).padStart(2,'0')}</small><b>${esc(title)}</b><span>${esc(note)}</span></div>`).join('<i>→</i>')+'</div>'}
function applicability(){return '<div class="cc227-detail-grid">'+window.CC_PUBLIC_RULES.applicability.map(([title,criterion,note])=>`<div><small>${esc(title)}</small><b>${esc(criterion)}</b><p>${esc(note)}</p></div>`).join('')+'</div>'}
function sourceLinks(){
  return `<div class="cc227-links">
    <a href="${LINKS.law}" target="_blank" rel="noopener noreferrer"><b>국가법령정보센터</b><span>건축서비스산업 진흥법·시행령 확인 ↗</span></a>
    <a href="${LINKS.g2b}" target="_blank" rel="noopener noreferrer"><b>나라장터</b><span>공고·첨부문서·변경공고 확인 ↗</span></a>
    <a href="${LINKS.pps}" target="_blank" rel="noopener noreferrer"><b>조달청 설계공모</b><span>공모방식·조달청 절차 확인 ↗</span></a>
  </div>`;
}
function renderSearch(q){
  const out=$('searchResult');if(!out)return;
  const c=copyFor(intent(q));
  window.CC_SEARCH_ANSWER.write(out,`<div class="result-card cc227-search"><div class="label">PUBLIC PROJECT · 척척</div><h3>${esc(c.title)}</h3>
    <div class="cc227-quick"><div><small>지금 먼저</small><b>${esc(c.first)}</b></div><div><small>핵심 문서</small><b>${esc(c.doc)}</b></div><div><small>다음 확인</small><b>${esc(c.next)}</b></div></div>
    <button class="cc227-more" type="button" aria-expanded="false">발주·조달 흐름 자세히 보기 <span>▾</span></button>
    <div class="cc227-detail">${stepFlow()}${applicability()}<div class="cc227-note"><b>구분해서 보기</b><span>건축법상 ‘용도’와 공공기관의 ‘발주·조달 절차’는 다른 축입니다. 또 공공건축이라고 해서 모든 사업을 조달청이 직접 수행하는 것도 아닙니다. 실제 공고와 발주기관의 사업방식을 우선 확인하세요.</span></div>${sourceLinks()}</div>
  </div>`,window.CC_SEARCH_ANSWER.model(c.title,[['지금 먼저',c.first],['핵심 문서',c.doc],['다음 확인',c.next]]));
  bindMore(out);
}
function bindMore(root){
  root.querySelectorAll('.cc227-more').forEach(btn=>btn.addEventListener('click',()=>{
    const detail=btn.nextElementSibling;const open=!detail.classList.contains('open');
    detail.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'▴':'▾';
  }));
}

function addExample(){
  const examples=document.querySelector('#view-search .examples');
  if(!examples||examples.querySelector('[data-cc227]'))return;
  const b=document.createElement('button');b.dataset.cc227='1';b.textContent='공공건축 발주 흐름';
  b.addEventListener('click',()=>{const input=$('searchInput');if(input)input.value='공공건축 발주·설계공모 흐름이 어떻게 돼?';renderSearch(input?.value||'공공건축');});
  examples.appendChild(b);
}
function contextHint(){
  const root=$('contextResult');const select=$('project');if(!root||!select||!root.innerHTML.trim())return;
  root.querySelector('.cc227-context')?.remove();
  if(!PUBLIC_HINT_IDS.has(select.value))return;
  const anchor=root.querySelector('.cc226-legal,.cc225-legal,.stage-banner');if(!anchor)return;
  const box=document.createElement('div');box.className='cc227-context';
  box.innerHTML=`<div class="cc227-context-head"><div><small>PUBLIC PROCUREMENT</small><b>공공기관이 발주한 프로젝트라면</b><span>건축법상 용도와 별개로 건축기획·심의·발주절차를 확인해요.</span></div><button type="button" class="cc227-context-toggle" aria-expanded="false">공공발주 흐름 보기 <span>▾</span></button></div><div class="cc227-context-detail">${stepFlow()}<p>사전검토·공공건축심의·설계공모는 모든 공공사업에 동일하게 적용되는 절차가 아닙니다. 설계비·용도·사업조건과 예외를 확인한 뒤 적용하세요.</p></div>`;
  anchor.insertAdjacentElement('afterend',box);
  const btn=box.querySelector('.cc227-context-toggle');const detail=box.querySelector('.cc227-context-detail');
  btn.addEventListener('click',()=>{const open=!detail.classList.contains('open');detail.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'▴':'▾';});
}

function install(){
  addExample();
  window.CC_RUNTIME.registerContext('public-flow',contextHint);
  window.CC_RUNTIME.registerSearch('public',q=>PUBLIC_RE.test(q),(_,q)=>renderSearch(q));
}
window.CC_BOOT.register('v227_public_procurement',install);
})();
