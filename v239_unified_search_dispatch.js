(()=>{
'use strict';
const VERSION='2.1.39';
const $=id=>document.getElementById(id);
let busy=false;

function setVersion(){document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION)}
function runLatest(q,{fromHome=false}={}){
  q=String(q||'').trim();
  if(!q)return;
  if(fromHome&&typeof window.showView==='function')window.showView('search');
  const input=$('searchInput');
  if(input)input.value=q;
  // All search modules are loaded before this file. Call the latest composed router
  // instead of the old v2.1.16 onclick handler, which still points to the v2.1.0 fallback.
  if(typeof window.runSearch==='function')window.runSearch();
}
function topExampleButton(target){
  return target.closest?.(
    '#view-home .cc-help-card[data-example],'+
    '#view-home .cc-popular-questions [data-example],'+
    '#view-home .cc-topic-strip [data-example],'+
    '#view-search .caps [data-example],'+
    '#view-search .examples [data-example]'
  );
}
function capture(e){
  if(busy)return;
  const t=e.target;
  let q='';let fromHome=false;let handled=false;

  if(e.type==='click'&&t.closest?.('#searchGo')){
    q=$('searchInput')?.value||'';handled=true;
  }else if(e.type==='keydown'&&e.key==='Enter'&&t.id==='searchInput'){
    q=t.value||'';handled=true;
  }else if(e.type==='click'&&t.closest?.('#homeSearchBtn')){
    q=$('homeSearch')?.value||'';fromHome=true;handled=true;
  }else if(e.type==='keydown'&&e.key==='Enter'&&t.id==='homeSearch'){
    q=t.value||'';fromHome=true;handled=true;
  }else if(e.type==='click'){
    const ex=topExampleButton(t);
    if(ex){q=ex.dataset.example||'';fromHome=!!ex.closest('#view-home');handled=true;}
  }
  if(!handled||!String(q).trim())return;

  e.preventDefault();
  e.stopImmediatePropagation();
  busy=true;
  try{runLatest(q,{fromHome});}
  finally{setTimeout(()=>{busy=false},0)}
}

function install(){
  // Window-capture runs before the older document/target handlers and removes
  // the routing race between v2.1.16 and the newer search modules.
  window.addEventListener('click',capture,true);
  window.addEventListener('keydown',capture,true);
  setVersion();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
