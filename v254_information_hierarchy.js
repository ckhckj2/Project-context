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

  clarifyContext(root,map,brief,actions);

  actions.querySelectorAll('[data-drawer]').forEach(button=>{
    if(!button.hasAttribute('aria-expanded'))button.setAttribute('aria-expanded','false');
  });
  root.dataset.cc258Hierarchy='ready';
}

// Presentation uses the same selection/fit model as the existing detail panes.
// The visible rail describes design stages, never completion or approval status.
function clarifyContext(root,map,brief,actions){
  root.classList.add('cc-context-clear');
  const model=window.CC_WORK_CONTEXT.resolve(root.querySelector('.cc247-fit-gate')?.dataset.mode);
  const {task,phase}=model.input;
  const banner=root.querySelector('.stage-banner');
  const purpose=banner?.querySelector('.stage-copy p');
  if(purpose)purpose.textContent=model.why.why;
  let position=root.querySelector('.cc-context-position');
  if(!position){
    position=node('section','cc-context-position');
    position.setAttribute('aria-label','설계 단계의 앞뒤');
    banner?.after(position);
  }
  position.replaceChildren(node('h2','','설계 단계의 앞뒤'));
  const phases=window.CC_WORK_RULES.phase.PHASE_ORDER;
  const index=phases.indexOf(phase);
  if(index<0){
    position.append(node('p','','아직 설계 단계를 고르지 않았어요. 단계를 선택하면 앞뒤 흐름을 연결해 드려요.'));
    const choose=node('button','','설계 단계 선택하기 →');
    choose.type='button';choose.dataset.view='home';position.append(choose);
  }else{
    const list=node('ol','');
    const items=[['이전',index>0?phases[index-1]:'사업조건·요구사항 확인'],['현재',phase],['다음',index<phases.length-1?phases[index+1]:'준공·운영 인계']];
    items.forEach(([label,value],i)=>{
      const item=node('li',i===1?'is-current':'');
      if(i===1)item.setAttribute('aria-current','step');
      item.append(node('small','',label),node('b','',value));list.append(item);
    });
    position.append(list);
  }
  const head=brief.querySelector('.cc252-brief-head');
  if(head){head.querySelector('small').textContent='지금 먼저 할 일';head.querySelector('b').textContent=task;}
  const cells=brief.querySelectorAll('.cc252-brief-grid>div');
  const labels=['첫 행동','준비할 자료','함께 확인할 사람'];
  const values=[model.how.steps[0],model.how.material,model.how.owner];
  cells.forEach((cell,i)=>{
    cell.querySelector('small').textContent=labels[i];
    cell.querySelector('p').textContent=values[i]||'';
  });
  const buttons=[['[data-drawer="how"]','수행 순서 보기 →'],['[data-drawer="context"]','앞뒤 단계 보기'],['[data-drawer="why"]','목적·자료 보기'],['[data-ask-context]','담당자 질문하기'],['[data-drawer="caution"]','주의사항 보기']];
  buttons.forEach(([selector,label])=>{
    const button=actions.querySelector(selector);
    if(button){button.textContent=label;button.setAttribute('aria-label',label);actions.append(button);}
  });
  // Legal classification remains readable, below the work guidance it qualifies.
  const legal=root.querySelector('.cc226-legal,.cc225-legal');
  if(legal&&map.nextElementSibling!==legal)map.after(legal);
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
