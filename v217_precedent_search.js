(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const compact=s=>String(s??'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
const PROGRAMS=[
  [/주상복합/,'주상복합'],[/공동주택|아파트/,'공동주택'],[/오피스텔/,'오피스텔'],
  [/업무시설|오피스(?!텔)|office/,'업무시설'],[/호텔|숙박/,'숙박시설'],[/판매시설|상업시설|쇼핑/,'상업·판매시설'],
  [/복합시설|mixed-?use/,'복합시설'],[/지식산업센터/,'지식산업센터'],[/데이터센터/,'데이터센터'],
  [/공항|격납고|hangar/,'공항시설·격납고'],[/물류센터|물류시설|창고(?:시설)?/,'물류·창고시설'],
  [/운수시설|터미널|여객시설/,'운수시설'],[/공장|fab/,'공장·FAB'],[/기숙사/,'기숙사'],
  [/병원|의료/,'의료시설'],[/학교|교육|연구/,'교육·연구시설'],[/도서관/,'도서관'],
  [/문화|미술관|박물관|공연/,'문화시설']
];
const SCOPES=[
  {re:/입면|파사드|facade|외관/,label:'입면',criteria:'재료·창호 모듈·개구부·분절 방식',record:'주요 입면 재료·시스템',why:'현재 프로젝트에 적용할 수 있는 입면 전략을 비교하는 조사예요.'},
  {re:/평면|공간구성/,label:'평면',criteria:'프로그램 배치·주요 공간 관계·운영 동선',record:'층별 프로그램·공간 관계·동선',why:'비슷한 용도와 규모의 공간 구성·동선을 비교하는 조사예요.'},
  {re:/배치|대지/,label:'배치',criteria:'대지 조건·도로 접근·건물과 외부공간 관계',record:'대지 조건·진출입·외부공간 구성',why:'대지와 건물·외부공간의 관계를 비교하는 조사예요.'},
  {re:/단면/,label:'단면',criteria:'층고·레벨·수직동선·구조와 설비 공간',record:'층고·레벨·수직 연결',why:'공간의 높이와 수직 관계를 비교하는 조사예요.'}
];
const GENERAL={label:'',criteria:'규모·프로그램·형태·운영 동선 중 이번에 결정할 항목',record:'비교 기준·설계 전략',why:'현재 설계 결정을 뒷받침할 비교 근거를 찾는 업무예요.'};
function match(query){
  // Only explicit contrast is discarded. Do not silently correct arbitrary text.
  const q=compact(query).split(/말고|아니라|아니고|제외하고/).pop().replace(/(입면|평면|배치|단면)사레/g,'$1사례');
  if(!/사례(?!금)|레퍼런스|reference|precedent|벤치마킹/.test(q))return null;
  const programs=PROGRAMS.filter(([re])=>re.test(q));
  const phases=window.CC_WORK_RULES.phase.PHASE_ORDER.filter(phase=>phase.split(/[/·]/).some(part=>q.includes(compact(part))));
  const scopes=SCOPES.filter(scope=>scope.re.test(q));
  return {q,programs,phases,scope:scopes.length===1?scopes[0]:GENERAL,scopeLabel:scopes.map(s=>s.label).join('·')};
}
function massing(q){
  const parts=[];
  if(/트윈타워|twintower|쌍둥이타워|2개동|두개동|2동/.test(q))parts.push('트윈타워·2개동 구성');
  else if(/싱글타워|singletower|단일동|1개동|1동/.test(q))parts.push('싱글타워·단일동 구성');
  if(/포디움|podium|저층부/.test(q))parts.push('포디움·저층부 구성');
  if(/고층|초고층|high-?rise/.test(q))parts.push('고층 규모');
  return parts.join(' + ');
}
function clarification(data){
  const {programs,q}=data;
  const withoutPrograms=programs.reduce((text,[re])=>text.replace(new RegExp(re.source,'g'),''),q);
  return `<div class="result-card cc21-result cc217-result"><div class="label">사례조사 · 용도 확인</div><h3>어느 용도의 사례를 찾을까요?</h3><p>질문에 용도가 둘 이상 나왔어요. 먼저 조사할 쪽을 골라 주세요.</p><div class="cc21-choices">${programs.map(([,label])=>`<button type="button" data-search-query="${esc(label+' '+withoutPrograms)}">${esc(label)} 사례 보기 <span>→</span></button>`).join('')}</div></div>`;
}
function render(data){
  if(data.programs.length>1)return {html:clarification(data),answer:null};
  const program=data.programs[0]?.[1]||'';
  const phase=data.phases.length===1?data.phases[0]:'';
  const {scope,scopeLabel,q}=data;
  const form=massing(q);
  const title=[program,phase,scopeLabel?scopeLabel+' 사례조사':'사례조사'].filter(Boolean).join(' · ');
  const first=`${program?program+'의 ':''}${scopeLabel?scopeLabel+' ':''}사례로 무엇을 결정할지 정하고, 비교 기준 2~4개를 적으세요.`;
  const criteria=[program||'비교할 건물 용도', '유사한 연면적·층수',form||'비슷한 형태·구성',scope.criteria].join(' → ');
  const stage=phase?window.CC_WORK_MODEL.resolve({task:'사례조사',phase,source:'search'}):null;
  const phaseNote=stage?.how.note||stage?.why.why||'';
  const unknown=[!program?'용도 미입력':'',!phase?(data.phases.length>1?'설계단계가 둘 이상 언급됨':'설계단계 미입력'):''].filter(Boolean).join(' · ');
  const where='회사 유사 프로젝트·공식 설계사 자료에서 원문 도면과 프로젝트 조건을 확인하세요. 이미지 탐색 후에는 출처·용도·규모를 대조하세요.';
  const record=`프로젝트명 / 설계사 / 준공연도 / 용도 / 규모 / ${scope.record} / 현재 프로젝트에 적용할 점과 한계`;
  const answer=window.CC_SEARCH_ANSWER.model(title,[['지금 먼저',first],['비교할 조건',criteria],['확인할 자료',where]], [unknown,'사례를 찾는 기준과 순서를 안내해요.'].filter(Boolean).join(' · '));
  return {answer,html:`<div class="result-card cc21-result cc217-result"><div class="label">사례조사 안내</div><h3>${esc(title)}</h3><p>${esc(scope.why)}</p><div class="cc217-context"><small>질문에서 읽은 조건</small><p>${esc([program,phase,scopeLabel,form].filter(Boolean).join(' · ')||'사례조사')}${unknown?' · '+esc(unknown):''}</p><p>사례를 찾는 기준과 순서를 안내해요. 실제 건축 사례 목록을 검색한 결과는 아니에요.</p></div><div class="result-grid"><div class="result-cell"><small>01 · 지금 먼저</small><p>${esc(first)}</p></div><div class="result-cell"><small>02 · 비교할 조건</small><p>${esc(criteria)}</p></div><div class="result-cell"><small>03 · 확인할 자료</small><p>${esc(where)}</p></div></div>${phaseNote?`<div class="cc21-note"><b>${esc(phase)}에서의 조사</b><span>${esc(phaseNote)}</span></div>`:''}<div class="cc21-note"><b>같은 표로 비교하기</b><span>${esc(record)}을 기록하세요.</span></div><div class="cc21-note"><b>자료 찾는 순서</b><span>Pinterest 등으로 이미지를 탐색한 뒤 ArchDaily · Designboom · Divisare · Dezeen · Architizer와 설계사 공식 홈페이지에서 프로젝트 정보를 대조하세요. 이미지가 비슷하다는 이유만으로 적용 가능하다고 판단하지 마세요.</span></div>${unknown?`<div class="cc21-note"><b>범위를 더 좁히려면</b><span>${esc(unknown)} 상태예요. 용도와 현재 설계단계를 검색 문장에 더하면 조사 범위를 좁힐 수 있어요.</span></div>`:''}</div>`};
}
function install(){
  window.CC_RUNTIME.registerSearch('precedent',match,data=>{const result=render(data);window.CC_SEARCH_ANSWER.write($('searchResult'),result.html,result.answer)});
}
window.CC_BOOT.register('v217_precedent_search',install);
})();
