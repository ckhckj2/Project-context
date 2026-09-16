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
  if(!root||!root.innerHTML.trim())return;
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
  const paneSlot=map.querySelector(':scope>.cc259-active-pane-slot');
  if(paneSlot&&actions.nextElementSibling!==paneSlot)actions.after(paneSlot);
  const openPane=paneSlot?.querySelector(':scope>.drawer.show')||map.querySelector(':scope>.drawer.show');
  if(openPane&&!paneSlot&&actions.nextElementSibling!==openPane)actions.after(openPane);
  const guideAnchor=paneSlot||openPane||actions;
  if(guide&&guideAnchor.nextElementSibling!==guide)guideAnchor.after(guide);
  if(flow&&guide&&guide.nextElementSibling!==flow)guide.after(flow);

  actions.querySelectorAll('[data-drawer]').forEach(button=>{
    if(!button.hasAttribute('aria-expanded'))button.setAttribute('aria-expanded','false');
  });
  root.dataset.cc258Hierarchy='ready';
}

function comparisonPreview(summary,source){
  const comparison=window.CC_SEARCH_ANSWER.read(source)?.comparison;
  if(!comparison)return false;
  const sides=comparison.sides;

  const grid=summary.querySelector('.cc252-action-grid');
  if(!grid)return false;
  grid.replaceChildren();
  sides.forEach((side,index)=>{
    if(index===1)grid.append(node('span','cc258-vs','VS'));
    const card=node('div',`cc258-compare-side cc258-compare-${index?'right':'left'}`);
    card.append(node('small','',side.label||`${index?'B':'A'} 항목`));
    card.append(node('p','',short(side.body,100)));
    grid.append(card);
  });
  const firstText=comparison.first;
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
  const answer=window.CC_SEARCH_ANSWER.read(source);
  if(!answer)return;
  const key=JSON.stringify(answer);
  if(root.dataset.cc258SearchKey!==key){
    root.dataset.cc258SearchKey=key;
    root.classList.remove('cc252-detail-open');
    root.querySelectorAll(':scope>.cc252-source-card').forEach(card=>card.classList.remove('cc242-expanded'));
    const toggle=summary.querySelector('.cc252-detail-toggle');
    if(toggle){
      toggle.setAttribute('aria-expanded','false');
      toggle.replaceChildren(document.createTextNode('상세 답변 보기 '),node('span','','↓'));
    }
  }
  if(summary.dataset.cc258Key===key)return;
  summary.dataset.cc258Key=key;
  if(answer.comparison&&comparisonPreview(summary,source))return;
  summary.classList.remove('cc258-comparison-answer');
  summary.classList.add('cc258-standard-answer');
  summary.dataset.cc258='standard';
}

function install(){

  window.CC_RUNTIME.registerContext('hierarchy',arrangeContext);
  window.CC_RUNTIME.registerResult('hierarchy',arrangeSearchResult);
}
window.CC_INFORMATION_HIERARCHY={version:VERSION,arrangeContext,arrangeSearchResult};

window.CC_BOOT.register('v254_information_hierarchy',install);
})();
