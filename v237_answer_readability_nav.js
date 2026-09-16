(()=>{
'use strict';
const VERSION='2.1.38';
const $=id=>document.getElementById(id);
let searchOrigin='';

function ensureBack(){
  const card=document.querySelector('#view-search .search-card');
  if(!card)return null;
  let btn=$('cc237SearchBack');
  if(!btn){
    btn=document.createElement('button');
    btn.type='button';
    btn.id='cc237SearchBack';
    btn.className='cc237-search-back';
    btn.textContent='← 내 업무 맥락으로 돌아가기';
    btn.hidden=true;
    btn.addEventListener('click',()=>{
      searchOrigin='';
      btn.hidden=true;
      if(typeof window.showView==='function')window.showView('context');
    });
    card.insertBefore(btn,card.firstChild);
  }
  return btn;
}
function syncBack(){
  const btn=ensureBack();if(!btn)return;
  const searchActive=$('view-search')?.classList.contains('active');
  btn.hidden=!(searchActive&&searchOrigin==='context');
}
function captureNavigation(e){
  const target=e.target;
  const contextActive=$('view-context')?.classList.contains('active');
  const toSearch=target.closest?.('[data-view="search"],[data-ask-context]');
  if(toSearch){
    searchOrigin=contextActive?'context':'';
    return;
  }
  const toOther=target.closest?.('[data-view="home"],[data-view="quiz"],[data-view="level"],[data-view="projects"]');
  if(toOther)searchOrigin='';
}

function install(){
  ensureBack();
  window.addEventListener('click',captureNavigation,true);
  window.CC_RUNTIME.registerResult('navigation',syncBack);
  window.CC_RUNTIME.registerView('search-back',syncBack);

}
window.CC_BOOT.register('v237_answer_readability_nav',install);
})();
