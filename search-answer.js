(()=>{
'use strict';
// Producers supply plain data. No card text, CSS selectors or HTML parsing
// participates in deciding the answer. Ownership follows the rendered node.
const answers=new WeakMap();
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
function model(title,items=[]){
  const rows=items.filter(x=>x&&clean(x[1])).slice(0,3).map(([label,body])=>
    Object.freeze({label:clean(label).replace(/^\d+\s*[·.\-]?\s*/,''),body:clean(body)}));
  return Object.freeze({title:clean(title),items:Object.freeze(rows)});
}
function comparison(title,left,right,first,caution){
  const base=model(title,[['핵심 구분',left.join(' · ')+' / '+right.join(' · ')],['먼저 확인',first],['주의',caution]]);
  return Object.freeze({...base,comparison:Object.freeze({sides:Object.freeze([left,right].map(([label,body])=>Object.freeze({label:clean(label),body:clean(body)}))),first:clean(first)})});
}
function work(d){return model(d.title,[['먼저',d.first],['어디서',d.where],['누구와',d.who]])}
function write(root,markup,answer=null){
  if(!root)return;
  root.classList.remove('cc252-result-root','cc252-detail-open');
  root.innerHTML=markup;
  if(root.firstElementChild&&answer)answers.set(root.firstElementChild,answer);
}
window.CC_SEARCH_ANSWER=Object.freeze({model,work,comparison,write,read:card=>answers.get(card)||null});
})();
