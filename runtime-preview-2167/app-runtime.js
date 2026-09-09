(()=>{
'use strict';

// This is the only owner of search dispatch and context composition order.
const SEARCH_ORDER=['comparison','concept-comparison','ask','definition','permit-workflow','change',
  'glossary','public','reviews','bim','precedent','specific','common','tools','expanded','fallback'];
const CONTEXT_ORDER=['why','tools','how','public-use','facility-use','public-flow',
  'focus','phase','phase-fit','project-route','project-label','bim','reviews','depth','hierarchy','drawings','visual','feedback'];
const RESULT_ORDER=['copy','neutral','change-impact','bim','compact','focus','hierarchy','visual','feedback','navigation'];
const routes=new Map(),contextSteps=new Map(),resultSteps=new Map();
const $=id=>document.getElementById(id);
let resultObserver=null;
let composing=false;
const stats={searches:0,contexts:0,results:0};

function register(registry,order,id,value){
  if(!order.includes(id)||registry.has(id))throw new Error('Duplicate or unknown runtime step: '+id);
  registry.set(id,value);
}
function runSteps(registry,order){
  for(const id of order){
    const step=registry.get(id);
    if(step)step();
  }
}
function classify(query){
  const q=String(query??'').trim().slice(0,500);
  if(!q)return {id:'empty',query:q};
  for(const id of SEARCH_ORDER){
    const data=routes.get(id)?.match(q);
    if(data)return {id,query:q,data};
  }
  return {id:'empty',query:q};
}
function observeResult(){
  const root=$('searchResult');
  if(root&&resultObserver)resultObserver.observe(root,{childList:true});
}
function refreshResult(){
  if(!$('searchResult')?.children.length)return;
  resultObserver?.disconnect();
  try{runSteps(resultSteps,RESULT_ORDER);stats.results++;}
  finally{observeResult();}
}
function search(query){
  const route=classify(query??$('searchInput')?.value);
  if(route.id==='empty')return false;
  const input=$('searchInput');if(input)input.value=route.query;
  resultObserver?.disconnect();
  try{
    routes.get(route.id).render(route.data,route.query);
    stats.searches++;
    runSteps(resultSteps,RESULT_ORDER);
    stats.results++;
  }finally{observeResult();}
  return true;
}
function renderContext(){
  const root=$('contextResult');
  if(composing||!root?.children.length)return;
  composing=true;
  root.setAttribute('aria-busy','true');
  try{runSteps(contextSteps,CONTEXT_ORDER);stats.contexts++;}
  finally{root.setAttribute('aria-busy','false');composing=false;}
}
function refreshContextPresentation(){
  // A phase-fit choice changes content without re-creating the choice itself.
  for(const id of ['depth','hierarchy','drawings','visual','feedback'])contextSteps.get(id)?.();
}
function go(query){
  if(!String(query??'').trim())return;
  window.showView('search');
  search(query);
}
function handleSearch(event){
  if(event.defaultPrevented||event.isComposing||event.keyCode===229)return;
  const target=event.target;
  let query;
  if(event.type==='keydown'){
    if(event.key!=='Enter'||!['searchInput','homeSearch'].includes(target.id))return;
    query=target.value;
  }else{
    const button=target.closest?.('#searchGo,#homeSearchBtn,[data-example],[data-search-query],[data-cc21-query],[data-cc216-query],[data-cc229-go],[data-cc245-query]');
    if(!button)return;
    query=button.id==='searchGo'?$('searchInput')?.value:button.id==='homeSearchBtn'?$('homeSearch')?.value:
      button.dataset.searchQuery??button.dataset.example??button.dataset.cc21Query??button.dataset.cc216Query??button.dataset.cc229Go??button.dataset.cc245Query;
  }
  event.preventDefault();
  // One handler also owns dynamically created examples and clarification links.
  event.stopImmediatePropagation();
  go(query);
}
function install(){
  document.addEventListener('click',handleSearch,true);
  document.addEventListener('keydown',handleSearch,true);
  resultObserver=new MutationObserver(refreshResult);
  observeResult();
}
window.CC_RUNTIME=Object.freeze({
  registerSearch:(id,match,render)=>register(routes,SEARCH_ORDER,id,{match,render}),
  registerContext:(id,step)=>register(contextSteps,CONTEXT_ORDER,id,step),
  registerResult:(id,step)=>register(resultSteps,RESULT_ORDER,id,step),
  classify,search,go,renderContext,refreshContextPresentation,refreshResult,
  diagnostics:()=>({routes:SEARCH_ORDER.filter(id=>routes.has(id)),context:CONTEXT_ORDER.filter(id=>contextSteps.has(id)),results:RESULT_ORDER.filter(id=>resultSteps.has(id)),...stats})
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
