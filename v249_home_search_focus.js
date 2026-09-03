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

function installStyle(){
  if($('cc251Style'))return;
  const style=document.createElement('style');
  style.id='cc251Style';
  style.textContent=`
  /* v2.1.51 — first-screen focus: one question, optional structure, details on demand */
  .cc251-fold{margin-top:12px;border:1px solid #E2E8F1;border-radius:14px;background:#fff;box-shadow:0 3px 14px rgba(15,23,42,.025);overflow:hidden}
  .cc251-fold:not([open])>:not(summary){display:none!important}
  .cc251-fold>summary{list-style:none;min-height:52px;padding:0 17px;display:flex;align-items:center;justify-content:space-between;gap:14px;cursor:pointer;color:#263A5C}
  .cc251-fold>summary::-webkit-details-marker{display:none}
  .cc251-fold>summary>span{display:flex;align-items:baseline;gap:10px;min-width:0}
  .cc251-fold>summary b{font-size:12px;line-height:1.35;font-weight:950;letter-spacing:-.25px}
  .cc251-fold>summary small{font-size:9.5px;color:#8A97AA;font-weight:750}
  .cc251-fold>summary i{position:relative;width:22px;height:22px;flex:0 0 22px;border-radius:50%;background:#F2F6FC}
  .cc251-fold>summary i:before,.cc251-fold>summary i:after{content:"";position:absolute;left:7px;top:10px;width:8px;height:1.5px;border-radius:2px;background:#617693;transition:transform .16s ease}
  .cc251-fold>summary i:after{transform:rotate(90deg)}
  .cc251-fold[open]>summary i:after{transform:rotate(0)}
  .cc251-fold>summary:hover{background:#FAFBFD}

  .cc251-home .hero{padding-bottom:0!important}
  .cc251-home .hero>.lead{max-width:560px!important}
  .cc251-entry-grid{position:relative;z-index:2;max-width:900px;margin:24px auto 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
  .cc251-entry-grid.cc251-context-open .cc-ask-card{display:none!important}
  .cc251-home .cc-ask-card{min-height:166px!important;max-width:none!important;margin:0!important;padding:20px 22px!important;border-color:#DCE6F5!important;background:#fff!important;box-shadow:0 5px 18px rgba(15,23,42,.035)!important}
  .cc251-home .cc-ask-card:after{display:none!important}
  .cc251-home .cc-ask-title{margin-bottom:11px!important}
  .cc251-home .cc251-popular-fold{margin-top:10px;border-color:#DFE7F3;background:rgba(255,255,255,.72);box-shadow:none}
  .cc251-home .cc251-popular-fold>summary{min-height:38px;padding:0 12px}
  .cc251-home .cc251-popular-fold>summary b{font-size:9.5px}
  .cc251-home .cc251-popular-fold>summary small{font-size:8.5px}
  .cc251-popular-body{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 12px}
  .cc251-popular-body button{border:1px solid #E0E7F1;background:#fff;border-radius:999px;padding:7px 9px;color:#60728C;font-size:9px;font-weight:850;cursor:pointer}

  .cc251-home .cc251-structured{max-width:none;margin:0;border:0;background:linear-gradient(145deg,#3479F5,#205FD9);box-shadow:0 10px 24px rgba(37,99,235,.19)}
  .cc251-home .cc251-structured>summary{min-height:166px;padding:22px 24px;color:#fff}
  .cc251-home .cc251-structured>summary:hover{background:rgba(255,255,255,.045)}
  .cc251-home .cc251-structured>summary>span{display:grid;gap:9px;align-content:center}
  .cc251-home .cc251-structured>summary b{font-size:18px;letter-spacing:-.5px}
  .cc251-home .cc251-structured>summary small{max-width:330px;color:#DCE9FF;font-size:10.5px;line-height:1.55}
  .cc251-home .cc251-structured>summary i{width:34px;height:34px;flex-basis:34px;background:rgba(255,255,255,.16)}
  .cc251-home .cc251-structured>summary i:before,.cc251-home .cc251-structured>summary i:after{left:11px;top:16px;width:12px;background:#fff}
  .cc251-home .cc251-structured[open]{grid-column:1/-1;background:#fff;border:1px solid #DCE6F5}
  .cc251-home .cc251-structured[open]>summary{min-height:68px;background:linear-gradient(145deg,#3479F5,#205FD9)}
  .cc251-home .cc251-structured[open]>summary>span{display:flex;gap:10px}
  .cc251-home .cc251-structured>.form{margin:0!important;border:0!important;border-top:1px solid #EDF1F6!important;border-radius:0!important;box-shadow:none!important}

  .cc251-home .cc-help-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important;margin-top:14px!important}
  .cc251-home .cc-help-card{min-height:72px!important;padding:12px 13px!important;border-radius:14px!important;display:grid!important;grid-template-columns:36px 1fr 22px!important;align-items:center!important;gap:10px!important;overflow:visible!important}
  .cc251-home .cc-help-card:hover{transform:translateY(-1px)!important}
  .cc251-home .cc-help-icon{width:36px!important;height:36px!important;margin:0!important;border-radius:11px!important}
  .cc251-home .cc-help-icon svg{width:21px!important;height:21px!important}
  .cc251-home .cc-help-card>b{margin:0!important;font-size:11.5px!important;line-height:1.35!important}
  .cc251-home .cc-help-card>span:not(.cc-help-icon){display:none!important}
  .cc251-home .cc-help-card>em{position:relative!important;right:auto!important;bottom:auto!important;width:22px!important;height:22px!important;border:0!important;background:#F4F7FB!important}
  .cc251-home .cc-help-card>em:before{width:6px!important;height:6px!important;border-width:1.5px!important}

  .cc251-home .cc-home-lower{display:block!important;margin:0!important}
  .cc251-home .cc251-flow-fold,.cc251-home .cc251-topic-fold{margin-top:10px}
  .cc251-home .cc251-flow-fold>.cc-flow-card,.cc251-home .cc251-topic-fold>.cc-topic-strip{margin:0!important;border:0!important;border-top:1px solid #EDF1F6!important;border-radius:0!important;box-shadow:none!important}
  .cc251-home .cc251-flow-fold>.cc-flow-card{min-height:0!important}
  .cc251-home .cc251-topic-fold>.cc-topic-strip>b{display:none!important}
  .cc251-home .cc251-topic-fold>.cc-topic-strip{grid-template-columns:1fr auto!important}

  .cc251-search .search-card>.lead{max-width:660px;margin-bottom:16px!important}
  .cc251-search .searchbox{margin-top:14px!important;padding:9px!important;border-color:#CED9E8!important;box-shadow:0 8px 24px rgba(15,23,42,.045)}
  .cc251-search .searchbox input{min-height:44px;font-size:13px!important}
  .cc251-search .searchbox button{min-width:112px;font-size:11px!important}
  .cc251-search .cc251-quick-examples{margin-top:11px!important}
  .cc251-search .cc251-quick-examples button:nth-child(n+7){display:none!important}
  .cc251-search .cc251-example-fold{margin-top:12px;box-shadow:none}
  .cc251-search .cc251-example-fold>.caps{margin:0!important;padding:12px;border-top:1px solid #EDF1F6;grid-template-columns:repeat(3,minmax(0,1fr))}

  @media(max-width:1050px){
    .cc251-entry-grid{grid-template-columns:1fr}
    .cc251-home .cc251-structured[open]{grid-column:auto}
    .cc251-home .cc251-structured>summary,.cc251-home .cc-ask-card{min-height:142px!important}
    .cc251-home .cc-help-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  }
  @media(max-width:700px){
    .cc251-fold>summary{min-height:48px;padding:0 13px}
    .cc251-fold>summary>span{display:grid;gap:1px}
    .cc251-fold>summary small{font-size:8.5px}
    .cc251-home .hero h1{text-align:left!important}
    .cc251-entry-grid{margin-top:17px;gap:9px}
    .cc251-home .cc-ask-card{padding:15px!important}
    .cc251-home .cc251-structured{margin:0}
    .cc251-home .cc251-structured>summary{min-height:104px!important;padding:16px 17px}
    .cc251-home .cc251-structured>summary b{font-size:15px}
    .cc251-home .cc251-structured>summary small{font-size:9.5px}
    .cc251-home .cc251-structured[open]>summary{min-height:64px!important}
    .cc251-home .cc-ask-card{min-height:0!important}
    .cc251-home .cc-help-grid{grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:11px!important}
    .cc251-home .cc-help-card{min-height:66px!important;padding:10px!important;grid-template-columns:32px 1fr!important;gap:8px!important}
    .cc251-home .cc-help-icon{width:32px!important;height:32px!important}
    .cc251-home .cc-help-card>b{font-size:10.5px!important}
    .cc251-home .cc-help-card>em{display:none!important}
    .cc251-search .searchbox{grid-template-columns:1fr!important}
    .cc251-search .searchbox button{min-height:42px}
    .cc251-search .cc251-example-fold>.caps{grid-template-columns:1fr!important}
  }
  @media(max-width:390px){
    .cc251-home .cc-help-grid{grid-template-columns:1fr!important}
  }
  `;
  document.head.append(style);
}

function install(){
  installStyle();
  prepareHome();
  prepareSearch();
  const markVersion=()=>document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  markVersion();
  setTimeout(markVersion,20);
  document.documentElement.dataset.uiVersion=VERSION;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
