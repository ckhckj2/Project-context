(()=>{
'use strict';
const VERSION='2.1.17';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const previousRunSearch=window.runSearch;

const PRECEDENT=/(?:입면|파사드|facade|외관).*(?:사례|레퍼런스|reference|precedent|벤치마킹)|(?:사례|레퍼런스|reference|precedent|벤치마킹).*(?:입면|파사드|facade|외관)/i;

function selectedProject(){
  const el=$('project');
  if(!el)return '';
  const opt=el.selectedOptions&&el.selectedOptions[0];
  return opt?opt.textContent.trim():'';
}
function explicitProgram(q){
  const rules=[
    [/주상복합/i,'주상복합'],[/공동주택|아파트/i,'공동주택'],[/오피스텔/i,'오피스텔'],[/업무시설|오피스|office/i,'업무시설'],[/호텔|숙박/i,'숙박시설'],[/판매시설|상업시설|쇼핑/i,'상업·판매시설'],[/복합시설|mixed[- ]?use/i,'복합시설'],[/지식산업센터/i,'지식산업센터'],[/데이터센터/i,'데이터센터'],[/공항|격납고|hangar/i,'공항시설·격납고'],[/물류|창고/i,'물류·창고시설'],[/공장|fab/i,'공장·FAB'],[/기숙사/i,'기숙사'],[/병원|의료/i,'의료시설'],[/학교|교육|연구/i,'교육·연구시설'],[/문화|미술관|박물관|공연/i,'문화시설']
  ];
  const hit=rules.find(([re])=>re.test(q));
  return hit?hit[1]:'';
}
function massing(q,meta){
  const s=`${q} ${meta}`;
  const parts=[];
  if(/트윈\s*타워|twin\s*tower|쌍둥이\s*타워|2\s*개\s*동|두\s*개\s*동|2\s*동/i.test(s))parts.push('트윈타워·2개동 구성');
  else if(/싱글\s*타워|single\s*tower|단일\s*동|1\s*개\s*동|1\s*동/i.test(s))parts.push('싱글타워·단일동 구성');
  if(/포디움|podium|저층부/i.test(s))parts.push('포디움·저층부 구성');
  if(/고층|초고층|high[- ]?rise/i.test(s))parts.push('고층 규모');
  return parts.join(' + ');
}
function render(q){
  const meta=($('meta')?.value||'').trim();
  const program=explicitProgram(q)||selectedProject();
  const form=massing(q,meta);
  const context=[];
  if(program)context.push(`용도·프로그램: ${program}`);
  if(meta)context.push(`현재 프로젝트 규모·메모: ${meta}`);
  if(form)context.push(`형태·구성: ${form}`);
  const contextHtml=context.length?`<div class="cc217-context"><small>현재 검색 기준</small><p>${context.map(esc).join(' · ')}</p></div>`:`<div class="cc217-context"><small>현재 검색 기준</small><p>프로젝트 용도, 규모, 동수·타워 구성을 먼저 확인하면 사례의 적합도가 훨씬 높아집니다.</p></div>`;
  const programText=program||'현재 프로젝트와 같은 용도';
  const scaleText=meta?'입력한 규모·메모와 비슷한 사례':'세대수·연면적·층수 등 유사 규모';
  const formText=form?form:'트윈타워/싱글타워, 동수, 포디움 구성 등 유사 매싱';
  return `<div class="result-card cc21-result cc217-result"><div class="label">FACADE PRECEDENT · 척척</div><h3>입면 사례는 “예쁜 이미지”보다 현재 프로젝트와 닮은 사례부터 찾으세요</h3><p>입면 사례조사는 디자인 이미지를 많이 모으는 업무가 아니라, 현재 프로젝트에 적용 가능한 입면 전략을 비교하기 위한 조사에 가깝습니다.</p>${contextHtml}<div class="result-grid"><div class="result-cell"><small>01 · 검색 우선순위</small><p>① ${esc(programText)} → ② ${esc(scaleText)} → ③ ${esc(formText)} → ④ 재료·모듈·개구부·수직/수평 분절 등 입면 전략 순으로 좁혀보세요.</p></div><div class="result-cell"><small>02 · 어디서 찾나요?</small><p><b>Pinterest</b>는 초반 이미지 탐색과 키워드 확장에, <b>ArchDaily · Designboom · Divisare</b>는 프로젝트 정보가 있는 사례 확인에 활용하기 좋습니다. 추가로 Dezeen·Architizer와 설계사 공식 홈페이지도 함께 보면 좋습니다.</p></div><div class="result-cell"><small>03 · 어떻게 비교하나요?</small><p>프로젝트명 / 설계사 / 준공연도 / 용도 / 규모 / 동수·타워 구성 / 포디움 여부 / 주요 입면 재료·시스템 / 현재 프로젝트와 유사한 이유를 한 줄씩 기록하세요.</p></div></div><div class="cc21-note"><b>검색 팁</b><span>예를 들어 “주상복합 입면 사례”라면 주상복합이라는 용도만 맞추지 말고, 현재 프로젝트가 트윈타워라면 트윈타워 중심으로, 싱글타워라면 싱글타워 중심으로 다시 좁히세요. 규모까지 비슷하면 비교 가치가 더 높습니다.</span></div>${(!meta||!form)?`<div class="cc21-note cc217-warn"><b>추가하면 더 정확해요</b><span>${!meta?'세대수·연면적·층수 같은 대략적인 규모':''}${!meta&&!form?' / ':''}${!form?'동수·트윈/싱글타워·포디움 같은 구성':''}을 규모·메모에 적어두면 사례조사 기준을 더 구체적으로 잡을 수 있습니다.</span></div>`:''}</div>`;
}
function runSearch(){
  const input=$('searchInput'),out=$('searchResult');
  if(!input||!out)return;
  const q=input.value.trim();
  if(!q)return;
  if(PRECEDENT.test(q))out.innerHTML=render(q);else if(typeof previousRunSearch==='function')previousRunSearch();
}
function replaceInput(id,handler){
  const old=$(id);if(!old)return null;
  const fresh=old.cloneNode(true);old.replaceWith(fresh);
  fresh.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();handler();}});
  return fresh;
}
function install(){
  
  const style=document.createElement('style');
  style.id='cc217Style';
  style.textContent='.cc217-context{margin:12px 0;padding:11px 12px;border:1px solid #DFE8FA;border-radius:12px;background:#F8FAFF}.cc217-context small{display:block;margin-bottom:4px;color:#7B89A2;font-size:8.5px;font-weight:950}.cc217-context p{margin:0;color:#33415E;font-size:10px;font-weight:750;line-height:1.55}.cc217-result .result-cell b{color:#245FD6}.cc217-warn{background:#FFF9ED!important;border-color:#F6DFC0!important}.cc217-warn b{color:#B46A11!important}';
  if(!document.getElementById(style.id))document.head.appendChild(style);
  const searchInput=replaceInput('searchInput',runSearch);
  const homeInput=replaceInput('homeSearch',()=>{const q=$('homeSearch')?.value.trim();if(!q)return;showView('search');$('searchInput').value=q;runSearch();});
  const go=$('searchGo');if(go)go.onclick=runSearch;
  const homeGo=$('homeSearchBtn');if(homeGo)homeGo.onclick=()=>{const q=$('homeSearch')?.value.trim();if(!q)return;showView('search');$('searchInput').value=q;runSearch();};
  if(searchInput)searchInput.placeholder='예: 주상복합 트윈타워 입면 사례 찾아보세요 / 코멘트 반영하래';
  if(homeInput)homeInput.placeholder='예) 입면 사례조사를 요청받았어요. 어떻게 찾을까요?';
  window.runSearch=runSearch;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
