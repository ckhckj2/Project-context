(()=>{
'use strict';

const VERSION='2.1.58';
const $=id=>document.getElementById(id);
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const short=(value,max=118)=>{const text=clean(value);return text.length>max?text.slice(0,max-1).trim()+'…':text};

function node(tag,className,textValue){
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(textValue!==undefined)element.textContent=textValue;
  return element;
}

function compactDepthGuide(guide){
  if(!guide)return null;
  if(guide.matches('details.cc258-depth-fold'))return guide;

  const title=clean(guide.querySelector('.cc254-depth-head b')?.textContent)||'현재 답변 깊이';
  const track=guide.querySelector('.cc254-depth-track');
  const note=guide.querySelector(':scope>p');
  const fold=document.createElement('details');
  fold.className='cc254-depth-guide cc258-depth-fold';
  fold.dataset.cc254Key=guide.dataset.cc254Key||'';
  fold.dataset.cc254Level=guide.dataset.cc254Level||'';
  fold.dataset.cc258='1';

  const summary=document.createElement('summary');
  const copy=node('span','cc258-depth-copy');
  copy.append(node('small','', '현재 답변 깊이'));
  copy.append(node('b','',title));
  summary.append(copy);
  summary.append(node('span','cc258-depth-open','레벨 설명 보기'));
  summary.append(node('i','cc258-depth-chevron'));

  const body=node('div','cc258-depth-body');
  if(track)body.append(track);
  if(note)body.append(note);
  fold.append(summary,body);
  guide.replaceWith(fold);
  return fold;
}

function arrangeContext(){
  const root=$('contextResult');
  if(!root||!root.innerHTML.trim()||root.classList.contains('cc256-building'))return;
  const map=root.querySelector('.map');
  const brief=map?.querySelector(':scope>.cc252-context-brief');
  const actions=map?.querySelector(':scope>.actions.cc252-actions');
  if(!map||!brief||!actions)return;

  const guide=compactDepthGuide(map.querySelector(':scope>.cc254-depth-guide'));
  const flow=map.querySelector(':scope>.cc252-context-flow');
  const mapHead=map.querySelector(':scope>.map-head');

  if(mapHead){
    if(mapHead.nextElementSibling!==brief)mapHead.after(brief);
  }else if(map.firstElementChild!==brief){
    map.prepend(brief);
  }
  if(brief.nextElementSibling!==actions)brief.after(actions);
  if(guide&&actions.nextElementSibling!==guide)actions.after(guide);
  if(flow&&guide&&guide.nextElementSibling!==flow)guide.after(flow);

  actions.querySelectorAll('[data-drawer]').forEach(button=>{
    if(!button.hasAttribute('aria-expanded'))button.setAttribute('aria-expanded','false');
  });
  root.dataset.cc258Hierarchy='ready';
}

function comparisonPreview(summary,source){
  const head=source.querySelector('.cc245-head');
  if(!head)return false;
  const sides=[...head.querySelectorAll(':scope>div')].slice(0,2);
  if(sides.length!==2)return false;

  const grid=summary.querySelector('.cc252-action-grid');
  if(!grid)return false;
  grid.replaceChildren();
  sides.forEach((side,index)=>{
    if(index===1)grid.append(node('span','cc258-vs','VS'));
    const card=node('div',`cc258-compare-side cc258-compare-${index?'right':'left'}`);
    card.append(node('small','',clean(side.querySelector('small')?.textContent)||`${index?'B':'A'} 항목`));
    card.append(node('p','',short(side.querySelector('b')?.textContent||side.textContent,100)));
    grid.append(card);
  });
  const firstText=clean(source.querySelector('.cc245-first')?.textContent).replace(/^먼저 확인\s*/, '');
  if(firstText){
    const first=node('div','cc258-compare-first');
    first.append(node('small','','먼저 확인'));
    first.append(node('p','',short(firstText,145)));
    grid.append(first);
  }
  summary.classList.remove('cc258-standard-answer');
  summary.classList.add('cc258-comparison-answer');
  summary.dataset.cc258='comparison';
  return true;
}

function arrangeSearchResult(){
  const root=$('searchResult');
  const summary=root?.querySelector(':scope>.cc252-answer');
  const source=root?.querySelector(':scope>.cc252-source-card');
  if(!summary||!source)return;
  const key=[clean(source.querySelector('h3')?.textContent),clean(source.querySelector('.cc245-head')?.textContent)].join('|');
  if(summary.dataset.cc258Key===key)return;
  summary.dataset.cc258Key=key;
  if(source.classList.contains('cc245-card')&&comparisonPreview(summary,source))return;
  summary.classList.remove('cc258-comparison-answer');
  summary.classList.add('cc258-standard-answer');
  summary.dataset.cc258='standard';
}

function installStyle(){
  if($('cc258Style'))return;
  const style=document.createElement('style');
  style.id='cc258Style';
  style.textContent=`
  /* v2.1.58 — action-first hierarchy and semantic comparison summaries */
  #contextResult .cc252-context-brief{margin-bottom:9px!important}
  #contextResult .cc252-brief-grid{grid-template-columns:1.25fr 1fr 1fr!important;gap:8px!important}
  #contextResult .actions.cc252-actions{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:7px!important;margin:0 0 9px!important}
  #contextResult .actions.cc252-actions>button{position:relative;min-width:0!important;min-height:66px!important;padding:12px!important}
  #contextResult .actions.cc252-actions>button[data-drawer="how"]{border-color:#356FC7!important;background:#356FC7!important;color:#fff!important;box-shadow:0 6px 14px rgba(42,95,178,.17)!important}
  #contextResult .actions.cc252-actions>button[data-drawer="how"] small{color:#DDEAFF!important}
  #contextResult .actions.cc252-actions>button[data-drawer="how"] small:after{content:" · 먼저";color:#fff}
  #contextResult .actions.cc252-actions>button[data-drawer="how"]:hover{border-color:#285BA7!important;background:#285FAF!important;color:#fff!important}
  #contextResult .actions.cc252-actions>button.cc-drawer-active:after{content:"열림";position:absolute;right:7px;top:7px;padding:2px 5px;border-radius:999px;background:#fff;color:#285FAF;font-size:8px;font-weight:950;line-height:1.3}
  #contextResult .actions.cc252-actions>button.cc-drawer-active{padding-right:39px!important}

  .cc254-depth-guide.cc258-depth-fold{margin:0 0 9px!important;padding:0!important;overflow:hidden}
  .cc258-depth-fold>summary{display:grid;grid-template-columns:1fr auto 24px;align-items:center;gap:10px;min-height:54px;padding:0 14px;list-style:none;cursor:pointer;background:#fff}
  .cc258-depth-fold>summary::-webkit-details-marker{display:none}
  .cc258-depth-fold>summary:hover{background:#F8FAFD}
  .cc258-depth-copy small,.cc258-depth-copy b{display:block}
  .cc258-depth-copy small{color:#64758C;font-size:9.5px;font-weight:900}
  .cc258-depth-copy b{margin-top:2px;color:#25466F;font-size:13px;line-height:1.4}
  .cc258-depth-open{color:#54709A;font-size:10px;font-weight:850}
  .cc258-depth-chevron{position:relative;width:22px;height:22px;border-radius:50%;background:#EEF3FA}
  .cc258-depth-chevron:before,.cc258-depth-chevron:after{content:"";position:absolute;left:7px;top:10px;width:8px;height:1.5px;background:#5E7392}
  .cc258-depth-chevron:after{transform:rotate(90deg)}
  .cc258-depth-fold[open] .cc258-depth-chevron:after{transform:none}
  .cc258-depth-fold[open] .cc258-depth-open{font-size:0}
  .cc258-depth-fold[open] .cc258-depth-open:after{content:"레벨 설명 닫기";font-size:10px}
  .cc258-depth-body{padding:0 14px 13px;border-top:1px solid #E8EDF4;background:#FBFCFE}
  .cc258-depth-body .cc254-depth-track{margin-top:12px}
  .cc258-depth-body>p{margin:10px 1px 0;color:#5F7087;font-size:10.5px;line-height:1.6}

  .cc252-answer.cc258-standard-answer .cc252-action-grid>div{min-height:98px!important}
  .cc252-answer.cc258-standard-answer .cc252-action-grid p{-webkit-line-clamp:2!important}
  .cc258-comparison-answer .cc252-action-grid{grid-template-columns:minmax(0,1fr) 42px minmax(0,1fr)!important;align-items:stretch!important}
  .cc258-comparison-answer .cc252-action-grid>div{min-height:0!important;padding:15px 16px!important}
  .cc258-comparison-answer .cc258-compare-side{display:flex;flex-direction:column;justify-content:center;border-color:#D7E3F3!important;background:#F5F9FF!important}
  .cc258-comparison-answer .cc258-compare-right{border-color:#DFE4ED!important;background:#F8F9FB!important}
  .cc258-comparison-answer .cc258-compare-side small{font-size:11px!important}
  .cc258-comparison-answer .cc258-compare-side p{display:block!important;overflow:visible!important;margin-top:6px!important;color:#2F486B!important;font-size:13px!important;line-height:1.55!important}
  .cc258-vs{align-self:center;justify-self:center;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#E9EEF6;color:#61728A;font-size:9px;font-weight:950}
  .cc258-comparison-answer .cc258-compare-first{grid-column:1/-1;display:grid!important;grid-template-columns:82px 1fr;align-items:center;gap:8px;min-height:0!important;border-color:#D9EBDD!important;background:#F5FAF6!important}
  .cc258-comparison-answer .cc258-compare-first small{color:#467057!important}
  .cc258-comparison-answer .cc258-compare-first p{display:block!important;overflow:visible!important;margin:0!important;color:#3F614B!important;-webkit-line-clamp:unset!important}

  @media(max-width:900px){
    #contextResult .actions.cc252-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    #contextResult .actions.cc252-actions>button[data-drawer="how"]{grid-column:1/-1;order:-1}
    #contextResult .cc252-brief-grid{grid-template-columns:1fr!important}
  }
  @media(max-width:620px){
    .cc258-depth-fold>summary{grid-template-columns:1fr 22px}
    .cc258-depth-open{display:none}
    .cc258-comparison-answer .cc252-action-grid{grid-template-columns:1fr!important}
    .cc258-comparison-answer .cc258-vs{width:auto;height:auto;padding:2px 9px;border-radius:999px}
    .cc258-comparison-answer .cc258-compare-first{grid-column:auto;grid-template-columns:1fr}
  }
  @media(prefers-reduced-motion:reduce){.cc258-depth-chevron:after{transition:none}}
  `;
  document.head.append(style);
}

let contextTimer=null;
let resultTimer=null;
function scheduleContext(delay=55){clearTimeout(contextTimer);contextTimer=setTimeout(arrangeContext,delay)}
function scheduleResult(delay=55){clearTimeout(resultTimer);resultTimer=setTimeout(arrangeSearchResult,delay)}

function markVersion(){
  document.querySelectorAll('.version').forEach(element=>element.textContent='v'+VERSION);
  document.documentElement.dataset.uiVersion=VERSION;
}

function install(){
  installStyle();
  const context=$('contextResult');
  const result=$('searchResult');
  if(context)new MutationObserver(()=>scheduleContext()).observe(context,{childList:true,subtree:true});
  if(result)new MutationObserver(()=>scheduleResult()).observe(result,{childList:true,subtree:true});
  document.addEventListener('click',event=>{
    if(event.target.closest('#analyze,.master-levels button'))scheduleContext(360);
    if(event.target.closest('#searchGo,#homeSearchBtn,[data-example]'))scheduleResult(100);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&(event.target===$('searchInput')||event.target===$('homeSearch')))scheduleResult(100);
  });
  if(context?.innerHTML.trim())scheduleContext(260);
  if(result?.children.length)scheduleResult(100);
  markVersion();
  setTimeout(markVersion,80);
  setTimeout(markVersion,500);
}

window.CC_INFORMATION_HIERARCHY={version:VERSION,arrangeContext,arrangeSearchResult};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
