(()=>{
'use strict';
const VERSION='2.1.23';
const byId=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const previousRunSearch=window.runSearch;
const ASK=/(누구|어디에\s*(?:물어|문의)|물어보|문의|담당자|확인받|질의|뭐라고\s*말|어떻게\s*물어)/i;

const RULES={
  technical:/(구조|기둥|보\b|슬래브|철근|내력벽|기계|설비|공조|배관|덕트|전기|전력|통신|소방|스프링클러|제연|방재|토목|조경|지반|측량|커튼월|외장|창호|에너지|친환경|승강기|교통영향|재해영향|환경영향|소음|진동|bim)/i,
  official:/(관할|구청|시청|군청|허가권자|공무원|행정|건축허가|착공신고|사용승인|사용검사|사업계획승인|지구단위|도시계획|용도지역|용도지구|용도구역|조례|고시|결정도서|법규.*해석|법령.*해석|적용.*(?:확인|문의)|세움터)/i,
  client:/(발주처|건축주|운영주체|운영사|사용자\s*요구|요구사항|과업지시|rfp|사업비|예산|공기|사업일정|운영조건|승인받|결정받)/i,
  internal:/(보고서|보고자료|발표자료|협의자료|사례|레퍼런스|디자인|입면|파사드|모델링|렌더|cg|도면|코멘트|레드라인|면적표|배치|동선|평면|단면|업무범위|우선순위|일정표)/i
};

function selectedContext(){
  const project=byId('project');
  const phase=byId('phase');
  return {
    project:project?.selectedOptions?.[0]?.textContent?.trim()||'',
    projectId:project?.value||'',
    phase:phase?.value||'',
    task:byId('task')?.value||''
  };
}
function technicalRole(q){
  if(/구조|기둥|보\b|슬래브|철근|내력벽/i.test(q))return '구조설계 협력업체';
  if(/소방|스프링클러|제연|방재/i.test(q))return '소방설계 협력업체';
  if(/기계|공조|배관|덕트|냉각/i.test(q))return '기계설비 협력업체';
  if(/전기|전력/i.test(q))return '전기설비 협력업체';
  if(/통신/i.test(q))return '통신설비 협력업체';
  if(/토목|도로|우수|오수/i.test(q))return '토목 협력업체';
  if(/조경/i.test(q))return '조경 협력업체';
  if(/커튼월|외장|창호/i.test(q))return '외장·창호 협력업체';
  if(/에너지|친환경/i.test(q))return '에너지·친환경 분야 담당/협력업체';
  if(/교통영향/i.test(q))return '교통 분야 협력업체';
  if(/재해영향/i.test(q))return '재해영향평가 분야 협력업체';
  if(/환경영향/i.test(q))return '환경영향평가 분야 협력업체';
  if(/지반|측량/i.test(q))return '지반·측량 분야 협력업체';
  if(/bim/i.test(q))return 'BIM 담당자/협력업체';
  return '해당 기술 분야 협력업체';
}
function officialRole(q){
  if(/지구단위|도시계획|용도지역|용도지구|용도구역|결정도서/i.test(q))return '관할 도시계획 담당부서';
  if(/사업계획승인|사용검사/i.test(q))return '관할 주택사업 관련 담당부서';
  if(/소방|소방관서/i.test(q))return '관할 소방 관련 담당부서';
  return '관할 건축행정 담당부서';
}
function projectClient(ctx){
  if(ctx.projectId==='airport')return '발주처·공항 운영주체';
  if(ctx.projectId==='fab'||ctx.projectId==='datacenter')return '발주처 기술·운영 담당';
  if(ctx.projectId==='logistics')return '발주처·운영주체';
  return '발주처·건축주·운영주체';
}
function classify(q){
  if(RULES.technical.test(q))return 'technical';
  if(RULES.official.test(q))return 'official';
  if(RULES.client.test(q))return 'client';
  if(RULES.internal.test(q))return 'internal';
  return 'ambiguous';
}
function contextHint(ctx){
  const bits=[];
  if(ctx.project)bits.push(ctx.project);
  if(ctx.phase&&ctx.phase!=='잘 모르겠습니다')bits.push(ctx.phase);
  if(ctx.task)bits.push(ctx.task);
  return bits.slice(0,3).join(' · ');
}
function routeData(type,q,ctx){
  if(type==='technical'){
    const role=technicalRole(q);
    return {
      label:'TECHNICAL · 기술 판단',
      first:`사내 담당/책임과 질문 범위를 맞춘 뒤 → ${role}`,
      reason:'전문 기술값은 해당 분야가 검토하고, 그 조건을 건축안에 어떻게 반영할지는 사내에서 함께 판단하는 게 안전합니다.',
      prep:['최신 건축도면','질문 위치·변경내용','원하는 회신 시점'],
      script:`최신 건축도면 기준으로 [위치]의 [조건/변경]을 검토 중입니다. 필요한 최소 조건과 건축에 반영해야 할 제약, 회신 가능한 시점을 확인 부탁드립니다.`,
      next:'회신을 받으면 변경 영향이 있는 평면·단면·면적·다른 분야 자료까지 같이 확인하세요.'
    };
  }
  if(type==='official'){
    const role=officialRole(q);
    return {
      label:'OFFICIAL · 행정/공식 해석',
      first:`사내 인허가 담당/PM이 먼저 검토 → 해석이 필요한 쟁점만 ${role}`,
      reason:'관할기관에는 “처음부터 무엇이 맞나요?”보다, 사내에서 근거와 해석안을 정리한 뒤 쟁점을 좁혀 확인하는 편이 정확합니다.',
      prep:['대상 지번·프로젝트 조건','근거 조문/고시 원문','우리 팀의 1차 해석'],
      script:`[조문/고시]를 우리 프로젝트 조건에는 [이렇게] 적용하는 것으로 검토했습니다. 이 해석 방향이 맞는지, 추가로 확인할 기준이 있는지 문의드립니다.`,
      next:'공식 회신·통화 내용은 날짜와 담당부서, 확인한 쟁점을 프로젝트 기록에 남기세요.'
    };
  }
  if(type==='client'){
    const client=projectClient(ctx);
    return {
      label:'CLIENT · 발주처/운영 판단',
      first:`책임/PM과 질문·선택지를 정리 → 회사의 협의 창구를 통해 ${client}`,
      reason:'발주처 질문은 단순 정보 확인보다 일정·비용·운영·디자인 결정으로 이어질 수 있어 내부 방향을 먼저 맞추는 게 좋습니다.',
      prep:['결정이 필요한 항목','가능한 선택지 2~3개','각 안의 영향·차이'],
      script:`현재 [A/B] 두 방향을 검토 중이며 차이는 [핵심 차이]입니다. 운영·일정·비용 측면에서 [영향]이 예상되는데, 어떤 기준을 우선해 진행할지 확인 부탁드립니다.`,
      next:'결정사항은 회의록·메일·보고자료 등 추적 가능한 형태로 남기고 최신 설계에 반영하세요.'
    };
  }
  return {
    label:'INTERNAL · 사내 판단',
    first:'이 업무를 요청한 선임/책임 또는 PM에게 먼저',
    reason:'업무 범위, 설계 방향, 보고 메시지, 우선순위는 프로젝트 맥락을 알고 있는 사내 담당자가 먼저 판단할 영역입니다.',
    prep:['내가 이해한 업무 목적','현재 막힌 지점','가능하면 A/B 선택지'],
    script:`제가 이 업무를 [이 목적]으로 이해했고 현재 [이 지점]에서 판단이 필요합니다. 저는 [A 방향]으로 보고 있는데 이 방향으로 진행하면 될까요?`,
    next:'기술값이 필요하면 협력업체, 공식 해석이 필요하면 관할기관, 발주처 결정이 필요하면 PM 협의로 다음 질문을 넘기세요.'
  };
}
function renderAmbiguous(q){
  const out=byId('searchResult');if(!out)return;
  out.innerHTML=`<div class="result-card cc223-router cc223-ambiguous" data-cc221="1"><div class="label">WHO / HOW · 척척</div><h3>무엇을 판단받으려는 질문인지 먼저 골라주세요</h3><p>같은 “누구에게 물어봐요?”라도 질문 성격에 따라 첫 문의 대상이 달라져요.</p><div class="cc223-choice-grid"><button data-route-type="internal">사내 판단<small>업무범위 · 설계방향 · 보고</small></button><button data-route-type="technical">기술 판단<small>구조 · 설비 · 소방 · 외장</small></button><button data-route-type="official">행정 해석<small>법규 · 인허가 · 지구단위</small></button><button data-route-type="client">발주처 결정<small>운영 · 예산 · 선택안</small></button></div></div>`;
  out.querySelectorAll('[data-route-type]').forEach(btn=>btn.addEventListener('click',()=>renderRoute(btn.dataset.routeType,q)));
}
function renderRoute(type,q){
  const out=byId('searchResult');if(!out)return;
  const ctx=selectedContext();
  const d=routeData(type,q,ctx);
  const hint=contextHint(ctx);
  out.innerHTML=`<div class="result-card cc223-router" data-cc221="1"><div class="label">WHO / HOW · 척척</div><h3>${esc(d.first)}</h3>${hint?`<div class="cc223-context">현재 맥락 · ${esc(hint)}</div>`:''}<div class="cc223-core"><div><small>왜 이 순서인가요?</small><p>${esc(d.reason)}</p></div><div><small>질문 전에 3가지만</small><div class="cc223-chips">${d.prep.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><div class="cc223-script"><small>이렇게 물어보세요</small><p>${esc(d.script)}</p></div></div><details class="cc223-next"><summary>그 다음에는?</summary><p>${esc(d.next)}</p></details></div>`;
}
function renderIfAsk(){
  const input=byId('searchInput');
  const q=input?.value.trim()||'';
  if(!ASK.test(q))return false;
  const type=classify(q);
  if(type==='ambiguous')renderAmbiguous(q);else renderRoute(type,q);
  return true;
}
function runSearch(){if(renderIfAsk())return;if(typeof previousRunSearch==='function')previousRunSearch();}
function installExamples(){
  const box=document.querySelector('#view-search .examples');
  if(!box||box.querySelector('[data-cc223]'))return;
  const items=[['구조 변경은 누구에게 물어봐?','구조 문의'],['지구단위 해석은 누구에게 문의해?','행정 문의'],['발주처 결정이 필요한데 어떻게 물어봐?','발주처 문의']];
  items.forEach(([q,label])=>{const b=document.createElement('button');b.dataset.cc223='1';b.textContent=label;b.addEventListener('click',()=>{byId('searchInput').value=q;renderIfAsk();});box.appendChild(b);});
}
function install(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  installExamples();
  window.runSearch=runSearch;
  const go=byId('searchGo');if(go)go.addEventListener('click',e=>{if(ASK.test(byId('searchInput')?.value||'')){e.preventDefault();e.stopImmediatePropagation();renderIfAsk();}},true);
  const input=byId('searchInput');if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter'&&ASK.test(input.value)){e.preventDefault();e.stopImmediatePropagation();renderIfAsk();}},true);
  const homeGo=byId('homeSearchBtn');if(homeGo)homeGo.addEventListener('click',e=>{const q=byId('homeSearch')?.value||'';if(ASK.test(q)){e.preventDefault();e.stopImmediatePropagation();if(typeof window.showView==='function')window.showView('search');byId('searchInput').value=q;renderIfAsk();}},true);
  const homeInput=byId('homeSearch');if(homeInput)homeInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&ASK.test(homeInput.value)){e.preventDefault();e.stopImmediatePropagation();if(typeof window.showView==='function')window.showView('search');byId('searchInput').value=homeInput.value;renderIfAsk();}},true);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-example]');const q=b?.dataset.example||'';if(q&&ASK.test(q))setTimeout(()=>{const si=byId('searchInput');if(si)si.value=q;renderIfAsk();},25);if(e.target.closest('[data-ask-context]'))setTimeout(renderIfAsk,35);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
