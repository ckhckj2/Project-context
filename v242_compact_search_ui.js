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

function install(){

  window.CC_RUNTIME.registerResult('compact',compact);
}
window.CC_BOOT.register('v242_compact_search_ui',install);
})();
