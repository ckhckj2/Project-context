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

function install(){
  configureData();rebuildSelect();

  window.CC_RUNTIME.registerContext('facility-use',renderLegal);
  if(document.getElementById('contextResult')?.innerHTML.trim())renderLegal();
}
configureData();
window.CC_BOOT.register('v226_facility_first',install);
})();
