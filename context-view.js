(()=>{
'use strict';
// Shared write contract for the basic and detailed context layouts.
const write=(pane,selector,value)=>{if(value!==undefined)pane.querySelectorAll(selector).forEach(node=>{node.textContent=value;});};
const cells=(pane,selector,values)=>{const nodes=pane.querySelectorAll(selector);values.forEach((value,i)=>{if(value!==undefined&&nodes[i])nodes[i].textContent=value;});};
function setHow(root,data){
  const pane=root.querySelector('[data-pane="how"]');if(!pane)return;
  write(pane,'.cc232-how-head b, .cc252-pane-head b',data.title);
  write(pane,'.cc232-how-head span, .cc252-pane-head span',data.note);
  if(data.steps)pane.querySelectorAll('.cc232-how-steps, .cc252-how-sequence').forEach(list=>{
    const fragment=document.createDocumentFragment();
    data.steps.forEach((text,i)=>{const row=document.createElement('div'),number=document.createElement('small'),label=document.createElement('b');number.textContent=String(i+1).padStart(2,'0');label.textContent=text;row.append(number,label);fragment.appendChild(row);});
    list.replaceChildren(fragment);
  });
  cells(pane,'.cc252-how-meta > div p',[data.material,data.owner,data.done]);
  write(pane,'.cc246-how-phase b',data.done);
}
function setWhy(root,data){
  const pane=root.querySelector('[data-pane="why"]');if(!pane)return;
  write(pane,'.why-title, .cc252-pane-head b',data.title);
  cells(pane,':scope > .detail-grid .detail-cell p',[data.why,data.risk,data.done]);
  cells(pane,'.cc218-where .detail-cell p',[data.material,data.source,data.order]);
  if(!pane.querySelector('.why-title'))cells(pane,'.cc252-pane-grid > div p',[data.why,data.material,data.done]);
}
window.CC_CONTEXT_VIEW=Object.freeze({setHow,setWhy});
})();
