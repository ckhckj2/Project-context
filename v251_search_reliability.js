(()=>{
'use strict';

const VERSION='2.1.53';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const compact=value=>clean(value).toLowerCase().replace(/\s+/g,'');

const SOURCES={
  buildingLaw:['국가법령정보센터 · 건축법','https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=268119'],
  changeLaw:['건축법 제16조','https://www.law.go.kr/lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1026847027'],
  changeDecree:['건축법 시행령 제12조','https://www.law.go.kr/LSW/lumLsLinkPop.do?lspttninfSeq=105443'],
  housingLaw:['주택법 제15조','https://www.law.go.kr/LSW/lsLawLinkInfo.do?ancYnChk=0&chrClsCd=010202&lsJoLnkSeq=1012071641'],
  qgis:['QGIS 공식 사이트','https://qgis.org/project/overview/'],
  openbim:['buildingSMART · openBIM','https://www.buildingsmart.org/about/openbim/']
};

const CONCEPTS=[
  {id:'change_permit',label:'변경허가',terms:['변경허가'],meaning:'건축법상 허가·신고를 받은 내용을 변경할 때, 변경 전에 다시 허가를 받는 처리유형이에요.',scope:'원 승인도서와 변경내용을 비교해 변경허가 대상인지 판단',authority:'허가권자',timing:'원칙적으로 해당 변경을 하기 전',first:'원 승인서·승인도서와 변경안을 겹쳐 변경항목·영향도서를 표로 만드세요.',caution:'변경량이 커 보인다는 인상만으로 판단하지 말고 건축법 제16조와 시행령 제12조, 프로젝트 조건을 확인하세요.',sources:['changeLaw','changeDecree']},
  {id:'change_report',label:'변경신고',terms:['변경신고'],meaning:'건축법상 허가·신고 후 변경사항 중 법령이 신고로 처리하도록 정한 내용을 관할 행정청에 신고하는 절차예요.',scope:'원 승인내용과 변경범위를 비교해 신고 대상·시점 확인',authority:'특별자치시장·시장·군수·구청장 등 관할 행정청',timing:'원칙적으로 변경 전. 일부는 법정 요건에 따라 사용승인 때 일괄신고 가능',first:'변경내용·부분·면적·동수·층수·높이·위치와 누적변경을 함께 정리하세요.',caution:'경미한 변경이나 사용승인 시 일괄신고와 같은 뜻이 아닙니다.',sources:['changeLaw','changeDecree']},
  {id:'minor_change',label:'경미한 변경',terms:['경미한변경'],meaning:'건축법 제16조상 변경허가·변경신고를 하지 않아도 되는 대통령령상 변경을 말해요.',scope:'시행령이 정한 예외범위에 해당하는지 확인',authority:'법령상 예외 여부를 확인하고 필요 시 허가권자와 협의',timing:'변경 전 적용 가능 여부 확인',first:'변경이 건축행위·대수선·용도변경 등에 해당하는지부터 확인하세요.',caution:'변경허가·신고 예외라고 해서 다른 법령 협의나 도면 반영까지 면제되는 것은 아닙니다.',sources:['changeLaw','changeDecree']},
  {id:'building_permit',label:'건축허가',terms:['건축허가'],meaning:'건축법상 건축·대수선 등을 하기 전에 허가권자에게 받는 행정적 승인 절차예요.',scope:'개별 건축행위가 건축법과 관계기준에 적합한지 확인',authority:'특별자치시장·시장·군수·구청장 등 허가권자',timing:'착공 전 법정 절차',first:'대지 위치·법적 용도·규모·층수·건축행위와 적용 경로를 먼저 확정하세요.',caution:'프로젝트가 주택법이나 특별법상 별도 승인경로인지 먼저 확인해야 합니다.',sources:['buildingLaw']},
  {id:'building_report',label:'건축신고',terms:['건축신고'],meaning:'건축법이 정한 일정 범위의 건축행위는 신고하면 건축허가를 받은 것으로 보는 절차예요.',scope:'건축법 제14조의 신고대상과 제외·추가조건 확인',authority:'특별자치시장·시장·군수·구청장 등 관할 행정청',timing:'착공 전 신고',first:'위치·용도·규모·층수·건축행위를 기준으로 신고대상인지 확인하세요.',caution:'허가와 신고 중 신청자가 편한 방식을 고르는 구조가 아닙니다.',sources:['buildingLaw']},
  {id:'housing_approval',label:'사업계획승인',terms:['주택건설사업계획승인','사업계획승인'],meaning:'주택법상 일정한 주택건설사업 또는 대지조성사업의 전체 사업계획을 승인받는 절차예요.',scope:'주택·부대복리시설·대지조성 등 사업계획 전체',authority:'주택법상 사업계획승인권자',timing:'해당 주택건설사업 시행 전',first:'세대수·대지면적·주택 외 시설과의 복합 여부·사업방식부터 확인하세요.',caution:'공동주택이라는 이유만으로 항상 사업계획승인 대상이라고 단정하면 안 됩니다.',sources:['housingLaw']},
  {id:'building_review',label:'건축심의',terms:['건축심의'],meaning:'법령·조례 등에 따라 건축위원회가 대상 건축계획의 쟁점을 검토하는 절차예요.',scope:'대상별 건축계획·안전·피난·교통 등 위원회 검토사항',authority:'관할 건축위원회',timing:'대상 프로젝트의 허가·승인 전 정해진 시점',first:'대상 여부·심의종류·접수시기·도서목차를 관할 기준으로 확인하세요.',caution:'심의 의결은 건축허가나 사업계획승인 자체가 아닙니다.',sources:['buildingLaw']},
  {id:'landscape_review',label:'경관심의',terms:['경관심의'],meaning:'경관법·조례·경관계획 등에 따라 주변 경관과의 조화를 검토하는 절차예요.',scope:'배치·스카이라인·입면·색채·외부공간 등 경관 관점',authority:'관할 경관위원회 또는 공동위원회',timing:'대상 사업의 허가·승인 전 관할 기준에 따른 시점',first:'경관구역·대상기준·접수순서·공동심의 여부를 확인하세요.',caution:'건축심의를 받는다고 경관심의가 자동 면제된다고 단정하면 안 됩니다.',sources:['buildingLaw']},
  {id:'bim',label:'BIM',terms:['buildinginformationmodeling','buildinginformationmodelling','bim','빔'],meaning:'건축물의 형상과 속성정보를 디지털 모델로 연결해 설계·검토·협업·시공·운영에 활용하는 업무방식이에요.',scope:'모델뿐 아니라 정보기준·역할·협업·납품·검토 과정까지 포함',authority:'프로젝트 발주요구조건·BEP·사내 BIM 기준',timing:'프로젝트 기획부터 설계·시공·운영 전 과정',first:'이 프로젝트가 BIM을 왜 쓰는지, BEP와 내 모델 범위·책임부터 확인하세요.',caution:'BIM은 Revit이라는 프로그램 하나와 같은 뜻이 아닙니다.',sources:['openbim']},
  {id:'revit',label:'Revit',terms:['autodeskrevit','revit','레빗'],meaning:'건축·구조·설비 모델과 도면·스케줄 정보를 연동해 다루는 Autodesk의 BIM 저작도구예요.',scope:'BIM 업무를 수행하는 여러 소프트웨어 중 하나',authority:'프로젝트 템플릿·BEP·사내 운용기준',timing:'프로젝트가 Revit 기반 업무를 요구할 때',first:'프로젝트 템플릿·중앙/클라우드 협업방식·좌표·파일규칙을 확인하세요.',caution:'프로그램을 사용한다고 프로젝트의 BIM 정보관리까지 자동으로 성립하는 것은 아닙니다.',sources:['openbim']},
  {id:'qgis',label:'QGIS',terms:['qgis','큐지아이에스'],meaning:'공간정보를 만들고, 편집하고, 시각화하고, 분석하고, 지도나 데이터로 내보낼 수 있는 오픈소스 GIS 프로그램이에요.',scope:'지번·용도지역·지형·도로·재해·환경 등 공간데이터의 중첩과 분석',authority:'데이터 제공기관의 원자료·갱신일·좌표계',timing:'대지·주변조건을 공간적으로 비교하거나 분석할 때',first:'무엇을 확인할지 정한 뒤 데이터 출처·기준일·좌표계를 확인하고 필요한 레이어만 중첩하세요.',caution:'QGIS 화면은 분석도구입니다. 법적 판단은 최신 공적자료와 원문으로 다시 확인해야 합니다.',sources:['qgis']},
  {id:'seumteo',label:'세움터',terms:['세움터','건축행정시스템'],meaning:'건축허가·신고, 착공, 사용승인 등 건축행정 민원과 관련 정보를 처리하는 전자행정시스템이에요.',scope:'건축행정 절차의 신청·제출·처리상태·보완이력 확인',authority:'관할 행정청과 해당 신청절차',timing:'프로젝트의 실제 행정절차가 세움터 처리대상일 때',first:'원 승인경로와 현재 신청단계를 확인한 뒤 해당 절차의 최신 요구목록을 확인하세요.',caution:'모든 프로젝트와 관할청에 같은 제출목록이 적용되는 것은 아닙니다.',sources:['buildingLaw']},
  {id:'bep',label:'BEP',terms:['bim수행계획','bim실행계획','bep'],meaning:'프로젝트에서 BIM을 누가 어떤 파일·좌표·LOD·협업·납품기준으로 수행할지 정한 실행계획이에요.',scope:'BIM 역할·모델분할·파일규칙·좌표·정보요건·검토와 납품',authority:'발주처 BIM 지침과 승인된 프로젝트 BEP',timing:'BIM 작업을 시작하거나 업무범위가 바뀔 때',first:'승인된 BEP 버전에서 내 역할·모델범위·납품물·협업규칙을 확인하세요.',caution:'개인 작업습관보다 승인된 프로젝트 기준이 우선입니다.',sources:['openbim']},
  {id:'workset',label:'Workset',terms:['workset','워크셋'],meaning:'Revit 협업모델에서 요소와 작업범위를 나누고 가시성·소유상태 등을 관리하는 단위예요.',scope:'Revit 작업공유 환경의 모델 구성과 작업관리',authority:'프로젝트 BEP·사내 Revit 기준·현재 모델 규칙',timing:'작업공유 모델에서 요소를 작성·편집할 때',first:'현재 Workset 목록과 내 작업요소가 들어갈 기존 규칙부터 확인하세요.',caution:'개인 편의를 위해 임의로 새 Workset을 만들면 프로젝트 표준이 흐트러질 수 있습니다.',sources:['openbim']}
];

const PAIR_SUMMARY={
  'building_permit|housing_approval':'건축법상 개별 건축행위의 허가와 주택법상 주택건설사업 전체 계획의 승인은 적용대상·심사범위·승인경로가 달라요.',
  'building_permit|building_report':'건축허가가 원칙이고, 건축법이 정한 일정 범위는 신고로 허가를 갈음해요.',
  'change_permit|change_report':'둘 다 승인 후 변경관리지만, 변경의 법정 유형과 범위에 따라 허가 또는 신고로 나뉘어요.',
  'change_report|minor_change':'변경신고는 신고가 필요한 처리유형이고, 경미한 변경은 건축법 제16조상 변경허가·신고 예외예요.',
  'building_review|landscape_review':'검토하는 위원회와 근거, 핵심 관점이 다른 별도의 심의 절차예요.',
  'bim|revit':'BIM은 정보와 협업을 포함한 업무방식이고, Revit은 그 업무에 사용할 수 있는 소프트웨어 중 하나예요.'
};

const PAIR_FIRST={
  'bim|revit':'① 프로젝트의 BIM 목적·요구사항 확인 → ② BEP에서 산출물·협업방식 확인 → ③ 그 업무에 Revit이 필요한지와 사용기준 확인',
  'building_review|landscape_review':'① 대상 심의와 근거기준 확인 → ② 각 심의의 접수시기·도서·위원회 대조 → ③ 공동심의 여부와 후속 인허가 일정 확인'
};

function conceptsIn(query){
  const q=compact(query);
  const found=CONCEPTS.filter(item=>item.terms.some(term=>q.includes(compact(term))));
  const ids=new Set(found.map(item=>item.id));
  return found.filter(item=>{
    if(item.id==='building_permit'&&ids.has('change_permit')&&!q.includes('건축허가'))return false;
    if(item.id==='building_report'&&ids.has('change_report')&&!q.includes('건축신고'))return false;
    return true;
  }).sort((a,b)=>Math.min(...a.terms.map(term=>q.indexOf(compact(term))).filter(index=>index>=0))-Math.min(...b.terms.map(term=>q.indexOf(compact(term))).filter(index=>index>=0)));
}

function persona(query){
  const q=clean(query);
  if(/건축주|소유자|집주인|비전공|일반인|우리\s*(?:집|건물)|내\s*(?:집|건물)/i.test(q))return 'owner';
  if(/업무|요청\s*받|맡았|책임님|선임님|상사|사내|\bpm\b/i.test(q))return 'employee';
  return 'neutral';
}

function routeQuery(query){
  const q=clean(query);
  const terms=conceptsIn(q);
  const compare=/(?:차이|비교|vs\.?|다른\s*점|뭐가\s*(?:달라|다른)|어떻게\s*(?:달라|다른)|무엇이\s*(?:달라|다른)|구분)/i.test(q);
  if(compare&&terms.length>=2)return {type:'comparison',terms:terms.slice(0,2),persona:persona(q),query:q};
  const define=/(?:뭐|뭔|무엇|뜻|의미|정의|어떤\s*(?:건가|것|의미)|설명해)/i.test(q);
  if(terms.length&&define)return {type:'definition',terms:[terms[0]],persona:persona(q),query:q};
  if(terms.length&&['qgis','seumteo','bep','workset'].includes(terms[0].id)&&/(?:확인|사용|어떻게|시작|업무|요청)/i.test(q))return {type:'definition',terms:[terms[0]],persona:persona(q),query:q};
  return {type:'legacy',terms,persona:persona(q),query:q};
}

function sourceLinks(keys){
  return [...new Set(keys)].map(key=>SOURCES[key]).filter(Boolean).map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join('');
}

function audienceLabel(kind){return kind==='owner'?'건축주·비전공자 기준':kind==='employee'?'실무자 기준':'일반 설명'}

function renderDefinition(route){
  const item=route.terms[0];
  const who=route.persona==='owner'?'설계자나 인허가 담당자에게 “우리 프로젝트에서 이 항목이 왜 필요하고 무엇을 결정해야 하나요?”라고 확인하세요.':route.persona==='employee'?'프로젝트 책임·담당자에게 적용 목적과 현재 기준본을 먼저 확인하세요.':'프로젝트 담당자나 관련 전문가에게 적용 목적과 기준자료를 확인하세요.';
  const out=$('searchResult');if(!out)return;
  out.innerHTML=`<div class="result-card cc253-card" data-cc253="definition"><div class="label">DEFINITION · ${esc(audienceLabel(route.persona))}</div><h3>${esc(item.label)}, 이렇게 이해하면 돼요</h3><p>${esc(item.meaning)}</p><div class="result-grid"><div class="result-cell"><small>실무에서 무엇을 하나요?</small><p>${esc(item.scope)}</p></div><div class="result-cell"><small>무엇부터 확인하나요?</small><p>${esc(item.first)}</p></div><div class="result-cell"><small>누구에게 확인하나요?</small><p>${esc(who)}</p></div></div><div class="cc253-caution"><b>주의</b><span>${esc(item.caution)}</span></div><div class="cc253-sources">${sourceLinks(item.sources)}</div></div>`;
}

function renderComparison(route){
  const [left,right]=route.terms;
  const key=[left.id,right.id].sort().join('|');
  const title=PAIR_SUMMARY[key]||`${left.label}와 ${right.label}는 적용대상·확인범위·처리주체와 시점을 나눠 봐야 해요.`;
  const first=PAIR_FIRST[key]||`① 우리 프로젝트에 적용되는 원래 승인경로 확인 → ② ${left.label}·${right.label}의 대상과 시점 대조 → ③ 최신 원문과 담당기관 기준으로 최종 확인`;
  const caution=(left.caution+' '+right.caution).replace(/\s+/g,' ');
  const sources=[...left.sources,...right.sources];
  const out=$('searchResult');if(!out)return;
  out.innerHTML=`<div class="result-card cc245-card cc253-card" data-cc253="comparison"><div class="label">COMPARE · ${esc(audienceLabel(route.persona))}</div><h3>${esc(title)}</h3><div class="cc245-head"><div><small>${esc(left.label)}</small><b>${esc(left.meaning)}</b></div><em>VS</em><div><small>${esc(right.label)}</small><b>${esc(right.meaning)}</b></div></div><div class="cc245-table"><div class="cc245-tr cc245-th"><span>구분</span><span>${esc(left.label)}</span><span>${esc(right.label)}</span></div><div class="cc245-tr"><b>핵심 범위</b><span>${esc(left.scope)}</span><span>${esc(right.scope)}</span></div><div class="cc245-tr"><b>처리·확인 주체</b><span>${esc(left.authority)}</span><span>${esc(right.authority)}</span></div><div class="cc245-tr"><b>확인 시점</b><span>${esc(left.timing)}</span><span>${esc(right.timing)}</span></div></div><div class="cc245-first"><small>먼저 확인</small><b>${esc(first)}</b></div><div class="cc245-more"><div class="cc245-caution"><b>주의</b><span>${esc(caution)}</span></div><div class="cc245-sources">${sourceLinks(sources)}</div></div></div>`;
}

let lastQuery='';
let routeToken=0;
function renderRoute(route){
  if(route.type==='comparison')renderComparison(route);
  else if(route.type==='definition')renderDefinition(route);
}

function finalRoute(query,fromHome=false){
  const route=routeQuery(query);
  lastQuery=route.query;
  if(route.type==='legacy')return false;
  if(fromHome){
    if(typeof window.showView==='function')window.showView('search');
    else document.querySelector('[data-view="search"]')?.click();
    if($('searchInput'))$('searchInput').value=route.query;
  }
  const token=++routeToken;
  setTimeout(()=>{if(token===routeToken)renderRoute(route)},220);
  return true;
}

function queryFromEvent(event){
  const target=event.target;
  if(event.type==='keydown'&&event.key==='Enter'&&(target===$('searchInput')||target===$('homeSearch')))return {query:target.value||'',home:target===$('homeSearch')};
  if(event.type==='click'){
    if(target.closest?.('#searchGo,#cc253SearchGo'))return {query:$('searchInput')?.value||'',home:false};
    if(target.closest?.('#homeSearchBtn,#cc253HomeSearchBtn'))return {query:$('homeSearch')?.value||'',home:true};
    const example=target.closest?.('[data-example],[data-cc245-query],[data-cc253-query]');
    if(example)return {query:example.dataset.example||example.dataset.cc245Query||example.dataset.cc253Query||'',home:!!example.closest('#view-home')};
  }
  return null;
}

function intercept(event){
  const input=queryFromEvent(event);if(!input)return;
  const route=routeQuery(input.query);
  lastQuery=route.query;
  if(route.type==='legacy'){
    const claimed=event.type==='click'&&event.target.closest?.('#cc253SearchGo,#cc253HomeSearchBtn');
    if(claimed){
      event.preventDefault();event.stopImmediatePropagation();
      const claimedId=claimed.id;
      claimed.id=claimedId==='cc253SearchGo'?'searchGo':'homeSearchBtn';
      claimed.click();
      setTimeout(()=>{claimed.id=claimedId},0);
    }
    setTimeout(repairLegacy,320);
    return;
  }
  event.preventDefault();event.stopImmediatePropagation();
  finalRoute(input.query,input.home);
}

function replaceEmployeePhrases(root){
  const replacements=[
    [/상사가 시킨 일을/g,'궁금하거나 맡은 일을'],
    [/선임\s*\/\s*책임\s*\/\s*PM/g,'프로젝트 담당자'],
    [/선임\s*\/\s*책임/g,'프로젝트 담당자'],
    [/책임\s*\/\s*PM 또는 디자인 담당/g,'프로젝트 설계·디자인 담당'],
    [/선임\/책임에게/g,'프로젝트 담당자에게']
  ];
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;let changed=false;
  while((node=walker.nextNode())){
    let next=node.nodeValue;
    replacements.forEach(([pattern,value])=>{next=next.replace(pattern,value)});
    if(next!==node.nodeValue){node.nodeValue=next;changed=true}
  }
  return changed;
}

function repairLegacy(){
  const root=$('searchResult');
  const card=root?.querySelector(':scope>.result-card');
  if(!card||card.dataset.cc253||card.dataset.cc253Neutral==='1'||persona(lastQuery)==='employee')return;
  let changed=replaceEmployeePhrases(card);
  const label=clean(card.querySelector(':scope>.label')?.textContent);
  const title=card.querySelector(':scope>h3');
  const intro=[...card.children].find(child=>child.tagName==='P');
  if(label.includes("TODAY'S TASK")&&title){
    title.textContent='궁금한 내용을 목적 → 확인자료 → 다음 행동으로 풀어보세요';
    if(intro)intro.textContent='무엇을 알고 결정하려는지부터 좁히면 필요한 자료와 확인할 사람을 찾기 쉬워집니다.';
    const cells=[...card.querySelectorAll('.result-grid .result-cell')];
    if(cells[0]?.querySelector('p'))cells[0].querySelector('p').textContent='알고 싶은 결과, 필요한 시점, 이미 가지고 있는 자료를 먼저 정리하세요.';
    if(cells[2]?.querySelector('p'))cells[2].querySelector('p').textContent='프로젝트 담당자나 관련 전문가에게 질문의 범위와 공식 확인처를 물어보세요.';
    changed=true;
  }
  card.dataset.cc253Neutral='1';
  if(changed){
    root.querySelector(':scope>.cc252-answer')?.remove();
    root.classList.remove('cc252-detail-open');
    card.classList.remove('cc242-expanded');
  }
}

function installStyle(){
  if($('cc253Style'))return;
  const style=document.createElement('style');style.id='cc253Style';style.textContent=`
  .cc253-card .result-grid{margin-top:12px!important}.cc253-card .result-cell{background:#F7F9FC!important}.cc253-caution{display:flex;gap:9px;margin-top:10px;padding:10px 12px;border-radius:11px;background:#FFF9F1}.cc253-caution b{flex:0 0 auto;color:#8B6531;font-size:9px}.cc253-caution span{color:#716555;font-size:9.5px;line-height:1.55}.cc253-sources{display:flex;flex-wrap:wrap;gap:9px;margin-top:8px}.cc253-sources a{color:#3868BA;font-size:9px;font-weight:850;text-decoration:none}.cc253-card.cc242-card:not(.cc242-expanded)>.cc253-caution,.cc253-card.cc242-card:not(.cc242-expanded)>.cc253-sources{display:none!important}
  `;document.head.append(style);
}

function claimControls(){
  const searchGo=$('searchGo');
  if(searchGo){searchGo.id='cc253SearchGo';searchGo.addEventListener('click',intercept,true)}
  const homeGo=$('homeSearchBtn');
  if(homeGo){homeGo.id='cc253HomeSearchBtn';homeGo.addEventListener('click',intercept,true)}
  document.querySelectorAll('[data-example],[data-cc245-query]').forEach(node=>{
    const query=node.dataset.example||node.dataset.cc245Query||'';
    if(routeQuery(query).type==='legacy')return;
    node.dataset.cc253Query=query;
    node.removeAttribute('data-example');
    node.removeAttribute('data-cc245-query');
    node.addEventListener('click',intercept,true);
  });
}

function install(){
  installStyle();
  const previous=window.runSearch;
  window.runSearch=function(){const query=$('searchInput')?.value||'';return finalRoute(query,false)||(typeof previous==='function'?previous():undefined)};
  claimControls();
  window.addEventListener('click',intercept,true);
  window.addEventListener('keydown',intercept,true);
  const result=$('searchResult');if(result)new MutationObserver(()=>setTimeout(repairLegacy,260)).observe(result,{childList:true,subtree:true});
  const markVersion=()=>document.querySelectorAll('.version').forEach(node=>node.textContent='v'+VERSION);
  markVersion();setTimeout(markVersion,40);
  document.documentElement.dataset.uiVersion=VERSION;
}

window.CC_SEARCH_RELIABILITY={version:VERSION,routeQuery,persona,concepts:CONCEPTS.map(item=>item.id)};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
