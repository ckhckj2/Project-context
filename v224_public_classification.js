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
function installStyle(){
  if(document.getElementById('cc225LegalStyle'))return;
  const s=document.createElement('style');s.id='cc225LegalStyle';
  s.textContent='.cc225-legal{margin:9px 0 0;padding:11px 13px;border:1px solid #DCE6F6;border-radius:13px;background:#F8FAFE;display:grid;grid-template-columns:auto 1fr;gap:3px 10px;align-items:baseline}.cc225-legal small{font-size:9px;font-weight:950;color:#70809A}.cc225-legal b{font-size:12px;font-weight:950;color:#294568}.cc225-legal span{grid-column:2;font-size:10px;line-height:1.5;color:#728099}@media(max-width:700px){.cc225-legal{grid-template-columns:1fr;gap:4px}.cc225-legal span{grid-column:1}}';
  document.head.appendChild(s);
}
function install(){
  addData();addSelectOptions();installStyle();
  
  window.CC_RUNTIME.registerContext('public-use',renderLegalUse);
  if(document.getElementById('contextResult')?.innerHTML.trim())renderLegalUse();
}
addData();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
