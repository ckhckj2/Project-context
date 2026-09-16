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

function preparePopularQuestions(){
  const current=document.querySelector('#view-home .cc-popular-questions');
  if(!current||current.closest('.cc251-popular-fold'))return;
  const fold=makeFold('cc251-popular-fold','자주 묻는 질문','예시를 눌러 바로 검색');
  const body=document.createElement('div');
  body.className='cc251-popular-body';
  current.querySelectorAll('button').forEach(button=>body.append(button));
  fold.append(body);
  current.replaceWith(fold);
}

function prepareHome(){
  const home=$('view-home');
  if(!home||home.dataset.cc251==='1')return;
  home.dataset.cc251='1';
  home.classList.add('cc251-home');

  const hero=home.querySelector('.hero');
  const form=hero&&hero.querySelector(':scope > .form');
  const ask=home.querySelector('.cc-ask-card');
  const flow=home.querySelector('.cc-flow-card');
  const lower=home.querySelector('.cc-home-lower');
  const topic=home.querySelector('.cc-topic-strip');

  const heading=hero&&hero.querySelector('h1');
  const lead=hero&&hero.querySelector(':scope > .lead');
  if(lead)lead.textContent='업무·프로젝트·단계를 연결해 지금 필요한 판단부터 확인하세요.';
  if(ask&&hero&&form){
    const askTitle=ask.querySelector('.cc-ask-title');
    const askInput=ask.querySelector('#homeSearch');
    if(askTitle)askTitle.innerHTML='<b>빠르게</b> 질문하기';
    if(askInput)askInput.placeholder='예: 입면 디자인 검토를 맡았어요. 무엇부터 확인할까요?';
    hero.insertBefore(ask,form);
  }

  if(form&&!form.closest('.cc251-structured')){
    const fold=makeFold('cc251-structured','내 업무 맥락 보기','업무 · 프로젝트 · 단계를 연결해 전후업무와 수행방법 확인');
    form.parentNode.insertBefore(fold,form);
    fold.append(form);
  }

  const structured=hero&&hero.querySelector('.cc251-structured');
  if(structured&&ask&&!structured.closest('.cc251-entry-grid')){
    const entry=document.createElement('div');
    entry.className='cc251-entry-grid';
    hero.insertBefore(entry,ask);
    entry.append(structured,ask);
    structured.addEventListener('toggle',()=>entry.classList.toggle('cc251-context-open',structured.open));
  }

  preparePopularQuestions();

  if(flow&&!flow.closest('.cc251-flow-fold')){
    const fold=makeFold('cc251-flow-fold','건축 실무 흐름 보기','전체 단계와 체크포인트');
    (lower||home).insertBefore(fold,flow);
    fold.append(flow);
  }

  if(topic&&!topic.closest('.cc251-topic-fold')){
    const fold=makeFold('cc251-topic-fold','지금 많이 찾는 주제','법규 · QGIS · 도로 · 면적');
    topic.parentNode.insertBefore(fold,topic);
    fold.append(topic);
  }

  if(lower&&!lower.querySelector('.cc-flow-card,.cc-ask-card,.cc251-fold'))lower.remove();
  if(heading)heading.setAttribute('tabindex','-1');
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
