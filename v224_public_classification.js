(()=>{
'use strict';
const VERSION='2.1.25';
const LEGAL_PROJECTS=window.CC_FACILITY_RULES.publicProjects();
function addData(){
  if(typeof PROJECTS==='undefined')return;
  LEGAL_PROJECTS.forEach(p=>{
    const i=PROJECTS.findIndex(x=>x.id===p.id);
    if(i>=0)PROJECTS[i]=p; else PROJECTS.push(p);
  });
}
function addSelectOptions(){
  const select=document.getElementById('project');
  if(!select)return;
  select.querySelectorAll('option').forEach(o=>{
    if(LEGAL_PROJECTS.some(p=>p.id===o.value))o.remove();
  });
  [...select.querySelectorAll('optgroup')].forEach(g=>{
    if(!g.children.length)g.remove();
  });
  LEGAL_PROJECTS.forEach(p=>{
    let group=[...select.querySelectorAll('optgroup')].find(g=>g.label===p.group);
    if(!group){group=document.createElement('optgroup');group.label=p.group;select.appendChild(group);}
    group.appendChild(new Option(p.label,p.id));
  });
}
function renderLegalUse(){
  const root=document.getElementById('contextResult');
  const select=document.getElementById('project');
  if(!root||!select)return;
  const p=LEGAL_PROJECTS.find(x=>x.id===select.value);
  if(!p)return;
  root.querySelector('.cc225-legal')?.remove();
  const banner=root.querySelector('.stage-banner');
  if(!banner)return;
  const box=document.createElement('div');
  box.className='cc225-legal';
  box.innerHTML=`<small>건축법상 용도 분류</small><b>${p.legalUse}</b><span>공공 발주·운영 성격은 이 용도분류와 별도로 확인합니다.</span>`;
  banner.insertAdjacentElement('afterend',box);
}

function install(){
  addData();addSelectOptions();

  window.CC_RUNTIME.registerContext('public-use',renderLegalUse);
  if(document.getElementById('contextResult')?.innerHTML.trim())renderLegalUse();
}
addData();
window.CC_BOOT.register('v224_public_classification',install);
})();
