(()=>{
'use strict';
const VERSION='2.1.22';
const byId=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const MOBILE=()=>window.matchMedia('(max-width:700px)').matches;

function shortList(text,max=2){
  const raw=String(text||'').trim();
  if(!raw)return '필요한 기준자료부터 확인하세요.';
  const parts=raw.split(/\s*(?:·|→)\s*/).map(x=>x.trim()).filter(Boolean);
  if(parts.length<=1)return raw.length>96?raw.slice(0,93)+'…':raw;
  const picked=parts.slice(0,max).join(' · ');
  return picked+(parts.length>max?' 외':'');
}
function toggleDetail(btn,detail){
  const open=!detail.classList.contains('open');
  detail.classList.toggle('open',open);
  btn.setAttribute('aria-expanded',String(open));
  btn.firstChild.nodeValue=open?'상세 내용 접기':'자세히 보기';
}
function compactContext(){
  const root=byId('contextResult');
  if(!root||!root.innerHTML.trim())return;
  const pane=root.querySelector('[data-pane="why"]');
  if(!pane||pane.dataset.cc221==='1')return;
  if(pane.textContent.includes('LV.2 선임부터'))return;

  const title=pane.querySelector('.why-title');
  const topGrid=pane.querySelector(':scope > .detail-grid');
  const where=pane.querySelector('.cc218-where');
  if(!title||!topGrid)return;

  const why=title.textContent.trim();
  const wherePs=where?[...where.querySelectorAll('.detail-cell p')]:[];
  const first=shortList(wherePs[0]?.textContent||topGrid.querySelector('.detail-cell p')?.textContent,2);
  const source=shortList(wherePs[1]?.textContent||'프로젝트 기준자료 · 공식 자료',2);

  const original=[...pane.children];
  const kicker=pane.querySelector(':scope > .kicker');
  const summary=document.createElement('div');
  summary.className='cc221-summary';
  summary.innerHTML=`<div class="cc221-summary-row"><small>한줄 답</small><b>${esc(why)}</b></div><div class="cc221-summary-row"><small>지금 먼저</small><b>${esc(first)}</b></div><div class="cc221-summary-row"><small>확인처</small><b>${esc(source)}</b></div>`;
  const more=document.createElement('button');
  more.type='button';
  more.className='cc221-more';
  more.setAttribute('aria-expanded','false');
  more.append(document.createTextNode('자세히 보기'));
  const detail=document.createElement('div');
  detail.className='cc221-detail';

  original.forEach(node=>{if(node!==kicker)detail.appendChild(node);});
  pane.append(summary,more,detail);
  more.addEventListener('click',()=>toggleDetail(more,detail));
  pane.dataset.cc221='1';
}
function candidateCell(card){
  const cells=[...card.querySelectorAll('.result-cell')];
  if(!cells.length)return null;
  const preferred=cells.find(c=>/(먼저|순서|우선|어떻게|01)/.test(c.querySelector('small')?.textContent||''));
  return preferred||cells[0];
}
function compactSearch(){
  const root=byId('searchResult');
  if(!root)return;
  const card=root.querySelector('.result-card');
  if(!card||card.dataset.cc221==='1')return;
  if(card.querySelector('button'))return;
  const label=card.querySelector(':scope > .label');
  const h3=card.querySelector(':scope > h3');
  if(!h3)return;
  const cell=candidateCell(card);
  const intro=card.querySelector(':scope > p');
  const core=cell?.querySelector('p')?.textContent?.trim()||intro?.textContent?.trim()||'';
  if(!core)return;

  const original=[...card.children];
  const summary=document.createElement('div');
  summary.className='cc221-search-summary';
  summary.innerHTML=`<small>핵심만 먼저</small><b>${esc(shortList(core,3))}</b>`;
  const more=document.createElement('button');
  more.type='button';
  more.className='cc221-more';
  more.setAttribute('aria-expanded','false');
  more.append(document.createTextNode('자세히 보기'));
  const detail=document.createElement('div');
  detail.className='cc221-detail';
  original.forEach(node=>{if(node!==label&&node!==h3)detail.appendChild(node);});
  card.append(summary,more,detail);
  more.addEventListener('click',()=>toggleDetail(more,detail));
  card.dataset.cc221='1';
}
function mobileDrawerClick(e){
  if(!MOBILE())return;
  const btn=e.target.closest('#contextResult .actions [data-drawer]');
  if(!btn)return;
  const root=byId('contextResult');
  const actions=btn.closest('.actions');
  const pane=root?.querySelector(`[data-pane="${btn.dataset.drawer}"]`);
  if(!actions||!pane)return;

  setTimeout(()=>{
    if(!document.body.contains(btn)||!document.body.contains(pane))return;
    const open=pane.classList.contains('show');
    actions.querySelectorAll('[data-drawer]').forEach(other=>{
      const otherPane=root.querySelector(`[data-pane="${other.dataset.drawer}"]`);
      if(other!==btn&&otherPane){otherPane.classList.remove('show');other.classList.remove('cc-drawer-active');other.setAttribute('aria-expanded','false');}
    });
    btn.classList.toggle('cc-drawer-active',open);
    btn.setAttribute('aria-expanded',String(open));
    if(open)btn.insertAdjacentElement('afterend',pane);
  },0);
}
function restoreDesktopDrawers(){
  if(MOBILE())return;
  const root=byId('contextResult');
  const actions=root?.querySelector('.actions');
  if(!actions)return;
  const panes=['context','caution','why'].map(k=>root.querySelector(`[data-pane="${k}"]`)).filter(Boolean);
  if(panes.some(p=>p.parentElement===actions))actions.after(...panes);
  actions.querySelectorAll('[data-drawer]').forEach(btn=>btn.classList.remove('cc-drawer-active'));
}
function scheduleContext(){setTimeout(()=>{compactContext();restoreDesktopDrawers();},70);}
function scheduleSearch(){setTimeout(compactSearch,90);}
function install(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  const analyze=byId('analyze');if(analyze)analyze.addEventListener('click',scheduleContext);
  const searchGo=byId('searchGo');if(searchGo)searchGo.addEventListener('click',scheduleSearch);
  const homeGo=byId('homeSearchBtn');if(homeGo)homeGo.addEventListener('click',scheduleSearch);
  const searchInput=byId('searchInput');if(searchInput)searchInput.addEventListener('keydown',e=>{if(e.key==='Enter')scheduleSearch();});
  const homeInput=byId('homeSearch');if(homeInput)homeInput.addEventListener('keydown',e=>{if(e.key==='Enter')scheduleSearch();});
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-example], [data-cc219-tool]'))scheduleSearch();
    if(e.target.closest('[data-drawer="why"]'))setTimeout(compactContext,20);
    mobileDrawerClick(e);
  });
  window.addEventListener('resize',()=>setTimeout(restoreDesktopDrawers,40),{passive:true});
  if(byId('contextResult')?.innerHTML.trim())scheduleContext();
  if(byId('searchResult')?.innerHTML.trim())scheduleSearch();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
