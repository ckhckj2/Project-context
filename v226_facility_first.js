(()=>{
'use strict';
const VERSION='2.1.26';
const {GENERAL,GROUP_ORDER,orderFor,legalText}=window.CC_FACILITY_RULES;
const ADDITIONS=window.CC_FACILITY_RULES.additions();
function projectById(id){return typeof PROJECTS!=='undefined'?PROJECTS.find(p=>p.id===id):null;}
function upsert(p){
  if(typeof PROJECTS==='undefined')return;
  const i=PROJECTS.findIndex(x=>x.id===p.id);
  if(i>=0)PROJECTS[i]=Object.assign({},PROJECTS[i],p); else PROJECTS.push(p);
}
function configureData(){
  if(typeof PROJECTS==='undefined')return;







  window.CC_FACILITY_RULES.updates().forEach(upsert);
  ADDITIONS.forEach(upsert);
}

function rebuildSelect(){
  const select=document.getElementById('project');
  if(!select||typeof PROJECTS==='undefined')return;
  const previous=select.value||'multi';
  select.innerHTML='';
  GROUP_ORDER.forEach(groupName=>{
    const items=orderFor(groupName,PROJECTS.filter(p=>p.group===groupName));
    if(!items.length)return;
    const group=document.createElement('optgroup');
    group.label=groupName;
    items.forEach(p=>group.appendChild(new Option(p.label,p.id)));
    select.appendChild(group);
  });
  if([...select.options].some(o=>o.value===previous))select.value=previous;else select.value='multi';
}
function renderLegal(){
  const root=document.getElementById('contextResult');
  const select=document.getElementById('project');
  if(!root||!select)return;
  const p=projectById(select.value);const text=legalText(p);
  root.querySelectorAll('.cc225-legal,.cc226-legal').forEach(x=>x.remove());
  if(!text)return;
  const banner=root.querySelector('.stage-banner');if(!banner)return;
  const box=document.createElement('div');box.className='cc226-legal';
  const isFallback=/잘 모르겠음|확인 필요/.test(p?.label||'')||/확인 필요/.test(text);
  box.innerHTML=`<small>건축법상 용도</small><b>${text}</b><span>${isFallback?'세부 시설명을 알면 더 정확한 법정 용도로 좁혀드릴 수 있어요.':'사용자가 고른 시설명을 법정 용도 체계에 연결한 결과예요. 실제 허가용도는 규모·사용형태·복합용도 여부를 함께 확인하세요.'}</span>`;
  banner.insertAdjacentElement('afterend',box);
}
function installStyle(){
  if(document.getElementById('cc226Style'))return;
  const s=document.createElement('style');s.id='cc226Style';s.textContent='.cc226-legal{margin:9px 0 0;padding:11px 13px;border:1px solid #DCE6F6;border-radius:13px;background:#F8FAFE;display:grid;grid-template-columns:auto 1fr;gap:3px 10px;align-items:baseline}.cc226-legal small{font-size:9px;font-weight:950;color:#70809A}.cc226-legal b{font-size:12px;font-weight:950;color:#294568}.cc226-legal span{grid-column:2;font-size:10px;line-height:1.5;color:#728099}@media(max-width:700px){.cc226-legal{grid-template-columns:1fr;gap:4px}.cc226-legal span{grid-column:1}}';document.head.appendChild(s);
}
function install(){
  configureData();rebuildSelect();installStyle();
  
  window.CC_RUNTIME.registerContext('facility-use',renderLegal);
  if(document.getElementById('contextResult')?.innerHTML.trim())renderLegal();
}
configureData();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
