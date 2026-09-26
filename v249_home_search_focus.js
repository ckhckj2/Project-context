(()=>{
'use strict';

const VERSION='2.1.51';
const $=id=>document.getElementById(id);

function makeFold(className,title,description){
  const details=document.createElement('details');
  details.className=`cc251-fold ${className}`;
  const summary=document.createElement('summary');
  summary.innerHTML=`<span><b>${title}</b>${description?`<small>${description}</small>`:''}</span><i aria-hidden="true"></i>`;
  details.append(summary);
  return details;
}

// Keep the existing task select as the single source of truth for context renderers.
// Shortcuts only change that selection; project and level records are untouched.
function prepareHome(){
  const home=$('view-home'),task=$('task');
  if(!home||!task||home.dataset.cc251==='1')return;
  home.dataset.cc251='1';
  if($('homeSearch'))$('homeSearch').placeholder='예: 변경허가와 변경신고 차이';
  const buttons=[...home.querySelectorAll('[data-home-task]')];
  const sync=()=>{
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.homeTask===task.value)));
    $('homeContextOptions').hidden=!task.value;
  };
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const value=button.dataset.homeTask;
    if(![...task.options].some(option=>option.value===value))return;
    task.value=value;
    task.dispatchEvent(new Event('change',{bubbles:true}));
  }));
  task.addEventListener('change',sync);
  sync();
}

function addQuickExample(container,label,query){
  if(!container)return null;
  const existing=[...container.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
  if(existing)return existing;
  const button=document.createElement('button');
  button.type='button';
  button.textContent=label;
  button.dataset.example=query;
  button.addEventListener('click',()=>{
    const input=$('searchInput');
    if(input)input.value=query;
    const go=$('searchGo');
    if(go)go.click();
  });
  container.append(button);
  return button;
}

function prepareSearch(){
  const view=$('view-search');
  if(!view||view.dataset.cc251==='1')return;
  view.dataset.cc251='1';
  view.classList.add('cc251-search');
  const card=view.querySelector('.search-card');
  const lead=card&&card.querySelector(':scope > .lead');
  const searchbox=card&&card.querySelector(':scope > .searchbox');
  const caps=card&&card.querySelector(':scope > .caps');
  const examples=card&&card.querySelector(':scope > .examples');

  if(lead)lead.textContent='상황을 그대로 적어주세요. 먼저 할 일과 확인할 곳부터 답해드려요.';
  if(searchbox&&lead)lead.insertAdjacentElement('afterend',searchbox);

  if(examples){
    examples.classList.add('cc251-quick-examples');
    const permit=addQuickExample(examples,'변경허가·신고 차이','변경허가와 변경신고의 차이는 뭐예요?');
    const elevation=addQuickExample(examples,'입면 디자인 검토','입면 디자인 검토 업무를 맡았어요. 무엇부터 확인하면 될까요?');
    if(permit)examples.insertBefore(permit,examples.children[4]||null);
    if(elevation)examples.insertBefore(elevation,examples.children[5]||null);
    if(searchbox)searchbox.insertAdjacentElement('afterend',examples);
  }

  if(caps&&!caps.closest('.cc251-example-fold')){
    const fold=makeFold('cc251-example-fold','질문 예시 더보기','요청 · 범위 확인 · 문의 방법');
    caps.parentNode.insertBefore(fold,caps);
    fold.append(caps);
  }
}

function install(){

  prepareHome();
  prepareSearch();

}

window.CC_BOOT.register('v249_home_search_focus',install);
})();
