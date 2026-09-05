(()=>{
'use strict';
const VERSION='2.1.43';
const $=id=>document.getElementById(id);

function setExpanded(card,button,expanded){
  card.classList.toggle('cc242-expanded',expanded);
  button.setAttribute('aria-expanded',String(expanded));
  button.innerHTML=expanded?'핵심만 보기 <span>↑</span>':'전체 보기 <span>↓</span>';
}
function movePermitTabs(card){
  const tabs=card.querySelector(':scope > .cc241-switch');
  const title=card.querySelector(':scope > h3');
  const context=card.querySelector(':scope > .cc241-context');
  if(!tabs||!title)return;
  (context||title).insertAdjacentElement('afterend',tabs);
  const label=tabs.querySelector(':scope > small');
  if(label)label.textContent='필요한 업무만 선택';
}
function closeDetails(card){
  card.querySelectorAll('details[open]').forEach(d=>d.open=false);
}
function prepare(card){
  if(!card||card.dataset.cc242==='1')return;
  card.dataset.cc242='1';
  card.classList.add('cc242-card');
  closeDetails(card);
  if(card.classList.contains('cc241-card'))movePermitTabs(card);

  const button=document.createElement('button');
  button.type='button';
  button.className='cc242-toggle';
  button.setAttribute('aria-expanded','false');
  button.innerHTML='전체 보기 <span>↓</span>';
  button.addEventListener('click',()=>setExpanded(card,button,!card.classList.contains('cc242-expanded')));

  const label=card.querySelector(':scope > .label');
  if(label)label.insertAdjacentElement('afterend',button);
  else card.prepend(button);
}
function compact(){
  const root=$('searchResult');if(!root)return;
  root.querySelectorAll('.result-card').forEach(prepare);
}
function installStyle(){
  if($('#cc242Style'))return;
  const s=document.createElement('style');s.id='cc242Style';s.textContent=`
  /* v2.1.43 — desktop-first compact result hierarchy */
  #searchResult .cc242-card{position:relative;padding:22px 24px!important}
  #searchResult .cc242-card>.label{padding-right:92px}
  #searchResult .cc242-card>h3,
  #searchResult .cc242-card>.cc235-top h3{max-width:760px;margin-top:8px!important;margin-bottom:8px!important;font-size:20px!important;line-height:1.35!important;letter-spacing:-.025em}
  #searchResult .cc242-toggle{position:absolute;z-index:2;right:22px;top:18px;display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid #DDE5F0;border-radius:999px;background:#fff;color:#61728A;font-size:10px;font-weight:900;cursor:pointer}
  #searchResult .cc242-toggle:hover{border-color:#B9CBEA;background:#F7F9FD;color:#315FAE}
  #searchResult .cc242-toggle span{font-size:9px}

  /* one-line orientation: enough to decide whether to continue */
  #searchResult .cc242-card>p,
  #searchResult .cc242-card .cc235-top p,
  #searchResult .cc242-card .cc232-bim-head p,
  #searchResult .cc242-card .cc241-intro{display:-webkit-box!important;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:1;margin-bottom:12px!important;font-size:11.5px!important;line-height:1.6!important;color:#64758C!important}
  #searchResult .cc242-card.cc242-expanded>p,
  #searchResult .cc242-card.cc242-expanded .cc235-top p,
  #searchResult .cc242-card.cc242-expanded .cc232-bim-head p,
  #searchResult .cc242-card.cc242-expanded .cc241-intro{-webkit-line-clamp:unset;overflow:visible}

  /* common 3-cell answers */
  #searchResult .cc242-card:not(.cc242-expanded)>.result-grid .result-cell p{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2}
  #searchResult .cc242-card:not(.cc242-expanded)>.cc21-note{display:none!important}

  /* practical work cards: three actions + one completion line */
  #searchResult .cc228-card:not(.cc242-expanded)>.cc228-line:not(.done){display:none!important}
  #searchResult .cc228-card:not(.cc242-expanded)>.cc228-detail{display:none!important}

  /* v2.1.42 permit workflow: tabs first, only step titles by default */
  #searchResult .cc241-card>.cc241-switch{order:0;margin:4px 0 13px!important;padding:9px 10px;border-radius:11px;background:#F7F9FC}
  #searchResult .cc241-card>.cc241-switch small{width:auto!important;margin-right:5px}
  #searchResult .cc241-card:not(.cc242-expanded)>.cc241-intro{display:none!important}
  #searchResult .cc241-card:not(.cc242-expanded)>.cc241-steps>div:nth-child(n+4){display:none!important}
  #searchResult .cc241-card:not(.cc242-expanded)>.cc241-steps>div{align-items:center;padding:9px 11px}
  #searchResult .cc241-card:not(.cc242-expanded)>.cc241-steps section p{display:none!important}
  #searchResult .cc241-card:not(.cc242-expanded)>.cc241-caution{display:none!important}
  #searchResult .cc241-card:not(.cc242-expanded)>.cc241-steps:before{content:'지금 할 일';display:block;margin:1px 0 0;color:#7A899E;font-size:9px;font-weight:950;letter-spacing:.02em}

  /* review and permit packages */
  #searchResult .cc235-review-card:not(.cc242-expanded)>.cc235-project,
  #searchResult .cc235-review-card:not(.cc242-expanded)>.cc235-caution,
  #searchResult .cc235-review-card:not(.cc242-expanded)>.cc235-practice,
  #searchResult .cc235-review-card:not(.cc242-expanded)>.cc235-sources{display:none!important}
  #searchResult .cc235-review-card:not(.cc242-expanded)>.cc235-core{margin-top:10px}
  #searchResult .cc235-overview:not(.cc242-expanded)>.cc235-project,
  #searchResult .cc235-overview:not(.cc242-expanded)>.cc235-caution,
  #searchResult .cc235-overview:not(.cc242-expanded)>.cc235-practice-grid{display:none!important}
  #searchResult .cc235-overview:not(.cc242-expanded)>.cc235-flow>div:nth-child(n+4){display:none!important}
  #searchResult .cc235-overview:not(.cc242-expanded)>.cc235-flow>div span{display:none!important}
  #searchResult .cc235-overview:not(.cc242-expanded)>.cc235-pick small{display:none}

  /* BIM: definition + three starting actions */
  #searchResult .cc232-bim-card:not(.cc242-expanded)>.cc232-four,
  #searchResult .cc232-bim-card:not(.cc242-expanded)>.cc232-bim-detail{display:none!important}
  #searchResult .cc232-bim-card:not(.cc242-expanded)>.cc232-start{margin-top:10px}

  /* WHO/HOW: keep the usable script, hide explanatory reading */
  #searchResult .cc223-router:not(.cc223-ambiguous):not(.cc242-expanded)>.cc223-core>div:first-child,
  #searchResult .cc223-router:not(.cc223-ambiguous):not(.cc242-expanded)>.cc223-next{display:none!important}

  /* compact fallback for older result cards */
  #searchResult .cc242-card:not(.cc242-expanded) details:not(.cc223-next){margin-top:8px}
  #searchResult .cc242-card.cc242-expanded .cc242-toggle{background:#F2F6FC}

  @media(min-width:900px){
    #searchResult .cc241-card:not(.cc242-expanded)>.cc241-steps{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    #searchResult .cc241-card:not(.cc242-expanded)>.cc241-steps:before{grid-column:1/-1}
    #searchResult .cc241-card:not(.cc242-expanded)>.cc241-steps>div{grid-template-columns:25px 1fr;min-height:48px}
    #searchResult .cc235-overview:not(.cc242-expanded)>.cc235-flow{grid-template-columns:repeat(3,minmax(0,1fr))}
  }
  @media(max-width:700px){
    #searchResult .cc242-card{padding:18px 16px!important}
    #searchResult .cc242-card>.label{padding-right:78px}
    #searchResult .cc242-card>h3,
    #searchResult .cc242-card>.cc235-top h3{font-size:17px!important;line-height:1.4!important}
    #searchResult .cc242-toggle{right:14px;top:13px;padding:6px 8px;font-size:9px}
    #searchResult .cc241-card>.cc241-switch{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
    #searchResult .cc241-card>.cc241-switch small{grid-column:1/-1}
    #searchResult .cc241-card>.cc241-switch button{padding:7px 5px}
  }`;
  document.head.appendChild(s);
}
function install(){
  installStyle();
  
  compact();
  const root=$('searchResult');
  if(root)new MutationObserver(()=>compact()).observe(root,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
