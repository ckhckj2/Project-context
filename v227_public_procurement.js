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
function style(){
  if(document.getElementById('cc227Style'))return;
  const s=document.createElement('style');s.id='cc227Style';s.textContent=`
  .cc227-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.cc227-quick>div{padding:11px 12px;border:1px solid #E4EAF3;border-radius:12px;background:#FAFBFD}.cc227-quick>div:first-child{background:#F4F8FF;border-color:#D8E5FF}.cc227-quick small{display:block;margin-bottom:5px;font-size:9px;font-weight:950;color:#7D8AA0}.cc227-quick b{font-size:11.5px;line-height:1.55;color:#344761}
  .cc227-more,.cc227-context-toggle{border:1px solid #DCE5F2;background:#fff;color:#3F5F91;border-radius:10px;padding:9px 11px;font-size:10px;font-weight:900}.cc227-more{width:100%;margin-top:9px}.cc227-detail,.cc227-context-detail{display:none}.cc227-detail.open,.cc227-context-detail.open{display:block}
  .cc227-flow{display:flex;align-items:stretch;gap:6px;margin-top:12px;overflow-x:auto;padding:2px 0 7px}.cc227-flow>div{flex:1;min-width:102px;padding:10px;border:1px solid #E2E8F2;border-radius:11px;background:#fff}.cc227-flow>div small{display:block;font-size:8px;font-weight:950;color:#8C98AC}.cc227-flow>div b{display:block;margin:3px 0;font-size:10.5px;color:#314761}.cc227-flow>div span{font-size:8.8px;color:#7B879B}.cc227-flow>i{align-self:center;font-style:normal;color:#A4B0C1;font-size:10px}
  .cc227-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.cc227-detail-grid>div{padding:11px;border:1px solid #E5EAF2;border-radius:12px;background:#FAFBFD}.cc227-detail-grid small{display:block;font-size:8.5px;font-weight:950;color:#7D899E}.cc227-detail-grid b{display:block;margin:4px 0;font-size:10.8px;color:#324762}.cc227-detail-grid p{margin:0;font-size:9.5px;line-height:1.6;color:#66758B}
  .cc227-note{display:grid;grid-template-columns:auto 1fr;gap:8px;margin-top:9px;padding:10px 11px;border:1px solid #F0DFBE;border-radius:11px;background:#FFF9EF}.cc227-note b{font-size:9px;color:#A26A1D}.cc227-note span{font-size:9.7px;line-height:1.55;color:#75664D}
  .cc227-links{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.cc227-links a{display:block;text-decoration:none;padding:10px;border:1px solid #DFE7F3;border-radius:11px;background:#fff}.cc227-links b{display:block;font-size:10px;color:#2F4A70}.cc227-links span{display:block;margin-top:3px;font-size:8.8px;color:#74839A}
  .cc227-context{margin:9px 0 0;padding:11px 12px;border:1px solid #DCE7F7;border-radius:13px;background:#F8FBFF}.cc227-context-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.cc227-context-head small{display:block;font-size:8px;font-weight:950;letter-spacing:.08em;color:#7092C8}.cc227-context-head b{display:block;margin:2px 0;font-size:11.5px;color:#304D72}.cc227-context-head span{font-size:9.5px;color:#758399}.cc227-context-detail{padding-top:2px}.cc227-context-detail>p{margin:3px 0 0;font-size:9.5px;line-height:1.55;color:#718097}
  @media(max-width:700px){.cc227-quick,.cc227-detail-grid,.cc227-links{grid-template-columns:1fr}.cc227-context-head{align-items:flex-start;flex-direction:column}.cc227-context-toggle{width:100%}.cc227-flow>div{min-width:96px}.cc227-quick b{font-size:11px}}
  `;document.head.appendChild(s);
}
function install(){
  style();addExample();
  window.CC_RUNTIME.registerContext('public-flow',contextHint);
  window.CC_RUNTIME.registerSearch('public',q=>PUBLIC_RE.test(q),(_,q)=>renderSearch(q));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
