(()=>{
'use strict';
const VERSION='2.1.25';
const LEGAL_PROJECTS=[
  {
    group:'산업·특수',id:'correctional',label:'교정시설',
    legalUse:'건축법 시행령 별표 1 제23호 · 교정시설',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','보안·운영 프로그램 정리','기본·계획설계','관계기관·운영부서 협의','심의·인허가(해당 시)','중간·실시설계','공사·감리','준공·인수'],
    caution:'교정시설은 건축법 시행령 별표 1에서 별도의 용도인 “교정시설”로 분류됩니다. 공공발주 여부와 건축법상 용도는 별개로 보고, 보안구역·수용자·직원·방문 동선과 운영기준을 함께 확인하세요.'
  },
  {
    group:'일반건축',id:'court',label:'법원·사법청사 (공공업무시설)',
    legalUse:'건축법 시행령 별표 1 제14호가목 · 업무시설 > 공공업무시설',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','재판·민원·업무 프로그램 정리','공개·비공개 동선 계획','기본·계획설계','관계부서 협의','심의·인허가(해당 시)','중간·실시설계','공사·감리','준공·인수'],
    caution:'법원 청사는 국가·지방자치단체 청사에 해당하는 경우 건축법 시행령 별표 1의 업무시설 중 공공업무시설로 검토합니다. 실제 허가상 용도와 복합 구성은 프로젝트별로 다시 확인하세요.'
  },
  {
    group:'일반건축',id:'publicoffice',label:'행정청사·공공업무시설',
    legalUse:'건축법 시행령 별표 1 제14호가목 · 업무시설 > 공공업무시설',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','민원·업무 프로그램 정리','기본·계획설계','사용부서·발주처 협의','심의·인허가(해당 시)','중간·실시설계','공사·감리','준공·인수'],
    caution:'국가 또는 지방자치단체의 청사 중 제1종 근린생활시설에 해당하지 않는 것은 업무시설의 공공업무시설로 분류합니다. 발주 절차와 건축 인허가 절차는 따로 확인하세요.'
  },
  {
    group:'일반건축',id:'publicmuseum',label:'박물관·미술관 (문화 및 집회시설)',
    legalUse:'건축법 시행령 별표 1 제5호라목 · 문화 및 집회시설 > 전시장',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','전시·수장·운영 프로그램 정리','기본·계획설계','전시·운영부서 협의','심의·인허가(해당 시)','중간·실시설계','전시설계·건축 조정','공사·감리','준공·인수'],
    caution:'박물관·미술관은 건축법 시행령 별표 1에서 문화 및 집회시설 중 전시장으로 분류됩니다. 공공시설인지 여부와 건축법상 용도는 별개의 축으로 관리하세요.'
  },
  {
    group:'일반건축',id:'publiclibrary',label:'도서관 (교육연구시설)',
    legalUse:'건축법 시행령 별표 1 제10호바목 · 교육연구시설 > 도서관',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','열람·장서·운영 프로그램 정리','기본·계획설계','운영부서·발주처 협의','심의·인허가(해당 시)','중간·실시설계','공사·감리','준공·인수'],
    caution:'도서관은 건축법 시행령 별표 1에서 교육연구시설로 분류됩니다. 공공도서관이라는 발주·운영 성격과 건축법상 용도분류를 혼동하지 마세요.'
  }
];
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
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  const analyze=document.getElementById('analyze');
  if(analyze)analyze.addEventListener('click',()=>setTimeout(renderLegalUse,80));
  if(document.getElementById('contextResult')?.innerHTML.trim())renderLegalUse();
}
addData();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();