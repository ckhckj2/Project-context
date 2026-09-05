(()=>{
'use strict';
const VERSION='2.1.26';
const GENERAL='일반건축';
const GROUP_ORDER=['주거·주거유사','일반건축','산업·특수','복합시설'];

const ADDITIONS=[
  {
    group:GENERAL,id:'office_unknown',label:'업무시설 · 세부 유형 잘 모르겠음',
    legalUse:'건축법 시행령 별표 1 제14호 · 업무시설 · 공공업무시설/일반업무시설 등 세부 유형 확인 필요',
    flow:['대지조건 확인','실제 사용용도 확인','규모·법규 검토','기본·계획설계','심의(해당 시)','건축인허가','중간·실시설계','착공신고·공사','사용승인'],
    caution:'“업무시설”만으로는 실제 세부 유형을 확정할 수 없습니다. 공공업무시설인지 일반업무시설인지, 또는 규모·사용형태상 근린생활시설에 해당하는지 먼저 확인하세요.'
  },
  {
    group:GENERAL,id:'school',label:'학교·교육기관',
    legalUse:'건축법 시행령 별표 1 제10호가목 · 교육연구시설 > 학교',
    flow:['학교유형·운영조건 확인','부지·입지조건 검토','교육프로그램·규모 검토','기본·계획설계','관계기준·협의(해당 시)','심의·건축인허가(해당 시)','중간·실시설계','공사','사용승인'],
    caution:'학교는 교육연구시설의 세부 유형입니다. 학교 종류와 사업주체에 따라 교육 관련 기준·협의가 추가될 수 있으므로 건축법상 용도와 사업 절차를 함께 확인하세요.'
  },
  {
    group:GENERAL,id:'research',label:'연구소',
    legalUse:'건축법 시행령 별표 1 제10호마목 · 교육연구시설 > 연구소',
    flow:['연구프로그램·안전조건 확인','부지·입지조건 검토','실험·연구공간 계획','설비·위험요소 협의','기본·계획설계','심의·건축인허가(해당 시)','중간·실시설계','공사·시운전','사용승인'],
    caution:'연구소는 교육연구시설의 세부 유형입니다. 실험실·위험물·특수설비가 포함되면 별도 법령과 관계기관 협의가 추가될 수 있습니다.'
  },
  {
    group:GENERAL,id:'performance',label:'공연장',
    legalUse:'건축법 시행령 별표 1 제5호가목 · 문화 및 집회시설 > 공연장 · 제2종 근린생활시설 해당 여부 우선 확인',
    flow:['공연형식·관람인원 확인','규모·법적 용도 확인','무대·객석·피난 계획','음향·무대·설비 협의','기본·계획설계','심의·건축인허가(해당 시)','중간·실시설계','공사·시운전','사용승인'],
    caution:'공연장은 규모 등에 따라 제2종 근린생활시설로 분류될 수 있으므로 시설명만 보고 문화 및 집회시설로 단정하지 마세요. 실제 면적·사용형태를 먼저 확인합니다.'
  },
  {
    group:GENERAL,id:'assembly',label:'집회장·회의장·예식장',
    legalUse:'건축법 시행령 별표 1 제5호나목 · 문화 및 집회시설 > 집회장',
    flow:['집회형식·수용인원 확인','대지·규모 검토','홀·부대공간 계획','보행·피난·주차 계획','기본·계획설계','심의·건축인허가(해당 시)','중간·실시설계','공사','사용승인'],
    caution:'집회장은 예식장·공회당·회의장 등 실제 사용형태를 확인해야 합니다. 수용인원과 집회공간 성격이 피난·주차·소방 계획에 큰 영향을 줍니다.'
  },
  {
    group:GENERAL,id:'spectator',label:'관람장',
    legalUse:'건축법 시행령 별표 1 제5호다목 · 문화 및 집회시설 > 관람장',
    flow:['관람시설 유형 확인','관람석·수용인원 검토','대지·차량·보행 검토','관람·피난 동선 계획','기본·계획설계','심의·건축인허가(해당 시)','중간·실시설계','공사','사용승인'],
    caution:'관람장은 경기장 성격·관람석 규모·외부 동선에 따라 검토 항목이 크게 달라집니다. 운동시설과의 구분도 실제 시설 구성으로 확인하세요.'
  }
];

function projectById(id){return typeof PROJECTS!=='undefined'?PROJECTS.find(p=>p.id===id):null;}
function upsert(p){
  if(typeof PROJECTS==='undefined')return;
  const i=PROJECTS.findIndex(x=>x.id===p.id);
  if(i>=0)PROJECTS[i]=Object.assign({},PROJECTS[i],p); else PROJECTS.push(p);
}
function configureData(){
  if(typeof PROJECTS==='undefined')return;
  upsert({id:'office',group:GENERAL,label:'일반 사무실·오피스',legalUse:'건축법 시행령 별표 1 제14호나목 · 업무시설 > 일반업무시설 · 근린생활시설 해당 여부 별도 확인',caution:'사무실·금융업소 등은 규모와 조건에 따라 근린생활시설에 해당할 수 있습니다. “오피스”라는 이름만으로 업무시설을 확정하지 말고 실제 용도와 면적을 먼저 확인하세요.'});
  upsert({id:'education',group:GENERAL,label:'교육연구시설 · 세부 유형 잘 모르겠음',legalUse:'건축법 시행령 별표 1 제10호 · 교육연구시설 · 학교/교육원/학원/연구소/도서관 등 세부 유형 확인 필요',caution:'교육연구시설은 하나의 실제 시설명이 아니라 법정 대분류입니다. 학교·교육원·학원·연구소·도서관 중 실제 사용형태를 먼저 확인하세요.'});
  upsert({id:'culture',group:GENERAL,label:'문화 및 집회시설 · 세부 유형 잘 모르겠음',legalUse:'건축법 시행령 별표 1 제5호 · 문화 및 집회시설 · 공연장/집회장/관람장/전시장/동·식물원 등 세부 유형 확인 필요',caution:'문화 및 집회시설은 법정 대분류입니다. 실제 시설이 공연장·집회장·관람장·전시장 등 무엇인지 확인한 뒤 세부 기준을 검토하세요.'});
  upsert({id:'publicmuseum',group:GENERAL,label:'박물관·미술관·전시장',legalUse:'건축법 시행령 별표 1 제5호라목 · 문화 및 집회시설 > 전시장',caution:'박물관·미술관은 문화 및 집회시설 중 전시장에 포함됩니다. 전시·수장·작품 반입·온습도·조명·보안 조건을 함께 검토하고, 공공 발주 여부는 별도 축으로 관리하세요.'});
  upsert({id:'publiclibrary',group:GENERAL,label:'도서관',legalUse:'건축법 시행령 별표 1 제10호바목 · 교육연구시설 > 도서관',caution:'도서관은 교육연구시설의 세부 유형입니다. 장서·서가하중·자료이동·열람·운영 동선을 함께 검토하고, 공공도서관 여부는 발주·운영 성격으로 별도 관리하세요.'});
  upsert({id:'publicoffice',group:GENERAL,label:'행정청사·공공청사',legalUse:'건축법 시행령 별표 1 제14호가목 · 업무시설 > 공공업무시설 · 제1종 근린생활시설 해당 여부 별도 확인',caution:'국가·지방자치단체 청사라도 규모와 세부 조건에 따라 제1종 근린생활시설 해당 여부를 먼저 확인해야 합니다. 공공 발주라는 사실과 건축법상 용도는 별개입니다.'});
  upsert({id:'court',group:GENERAL,label:'법원·사법청사',legalUse:'건축법 시행령 별표 1 제14호가목 · 업무시설 > 공공업무시설로 검토 · 실제 허가용도 확인 필요',caution:'법원·사법청사는 공개·업무·보안영역의 운영 특성이 중요합니다. 건축법상 세부 용도는 실제 발주·허가 조건과 복합 구성을 확인해 확정하세요.'});
  ADDITIONS.forEach(upsert);
}

const GENERAL_ORDER=[
  'neighborhood1','neighborhood2',
  'office','publicoffice','court','office_unknown',
  'sales','hotel',
  'school','research','publiclibrary','education',
  'medical',
  'performance','assembly','spectator','publicmuseum','culture',
  'sports','religion','transport','elderly'
];
function orderFor(group,items){
  if(group!==GENERAL)return items;
  const rank=new Map(GENERAL_ORDER.map((id,i)=>[id,i]));
  return items.slice().sort((a,b)=>(rank.get(a.id)??999)-(rank.get(b.id)??999));
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
function legalText(p){
  if(p?.legalUse)return p.legalUse;
  const fallback={
    neighborhood1:'건축법 시행령 별표 1 제3호 · 제1종 근린생활시설',
    neighborhood2:'건축법 시행령 별표 1 제4호 · 제2종 근린생활시설',
    sales:'건축법 시행령 별표 1 제7호 · 판매시설',hotel:'건축법 시행령 별표 1 제15호 · 숙박시설',medical:'건축법 시행령 별표 1 제9호 · 의료시설',sports:'건축법 시행령 별표 1 제13호 · 운동시설',religion:'건축법 시행령 별표 1 제6호 · 종교시설',transport:'건축법 시행령 별표 1 제8호 · 운수시설',elderly:'건축법 시행령 별표 1 제11호 · 노유자시설'
  };
  return fallback[p?.id]||'';
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
  
  const analyze=document.getElementById('analyze');if(analyze)analyze.addEventListener('click',()=>setTimeout(renderLegal,140));
  if(document.getElementById('contextResult')?.innerHTML.trim())renderLegal();
}
configureData();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
