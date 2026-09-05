(()=>{
'use strict';
const VERSION='2.1.45';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const ROUTES={
  building:{label:'건축법 · 승인 후 변경관리',query:'변경허가 절차는 어떻게 해?',extraChecks:['변경 종류·부분·면적에 따른 변경허가/변경신고 구분','경미한 변경 또는 사용승인 시 일괄신고 가능성','기존 허가조건·의제협의 재검토']},
  housing:{label:'주택법 사업계획 변경',query:'주택법 사업계획 변경승인은 어떻게 진행해?',extraChecks:['사업계획 변경승인 또는 경미한 변경신고 구분','입주자모집 이후 변경 제한·동의·통보 영향','승인조건과 기존 변경승인 이력']},
  renewal:{label:'정비사업 계획 변경',query:'재건축 사업시행계획 변경은 어떻게 해?',extraChecks:['사업시행계획 변경인가 또는 경미한 변경신고 구분','총회 의결·공람·고시 등 내부 및 행정절차','관리처분계획·정비계획 영향 여부']},
  airport:{label:'공항시설 실시계획 변경',query:'공항 실시계획 변경승인 절차 알려줘',extraChecks:['실시계획 변경승인·경미한 변경 구분','공항운영·항공안전·관계기관 재협의','변경승인 후 고시와 승인조건 반영']},
  logistics:{label:'물류시설·물류단지 변경',query:'물류창고 변경허가 절차 알려줘',extraChecks:['일반 건축허가와 단지계획·실시계획 중 원 승인경로','토지이용·기반시설·의제 인허가 재협의','중요 변경과 경미한 변경의 관할 기준']},
  industry:{label:'산업단지·공장 변경',query:'산업단지 실시계획 변경승인 절차 알려줘',extraChecks:['산업단지계획·공장설립승인·건축허가 영향층 구분','입주계약·업종·관리기본계획 적합성','승인기관별 변경절차의 선후행 관계']}
};

const IMPACTS={
  layout:{label:'배치',docs:['배치도','대지종횡단면도','동선·주차계획'],people:['토목','조경','구조'],checks:['이격·접도·동선 조건','기존 배치 관련 심의의견']},
  site:{label:'대지·경계',docs:['지적·측량자료','배치도','대지면적 산정자료'],people:['측량','토목','인허가'],checks:['대지범위·접도·도시계획 조건','토지 관련 승인·협의']},
  area:{label:'면적',docs:['건축개요','면적표','평면도'],people:['건축','사업·분양','인허가'],checks:['연면적·용적률·건폐율 연동','보고·승인·사업성 숫자 일치']},
  height:{label:'높이·층수',docs:['건축개요','입면도','단면도'],people:['구조','경관','인허가'],checks:['높이·경관·공항·지구단위 조건','피난·소방·구조 연쇄 영향']},
  use:{label:'용도',docs:['건축개요','면적표','평면도'],people:['인허가','소방','사업·운영'],checks:['법적 용도분류와 사업상 시설명 구분','주차·피난·소방·편의시설 기준 재검토']},
  structure:{label:'구조',docs:['구조계획서','구조도면','건축 평·단면도'],people:['구조','시공·원가','BIM'],checks:['구조안전·내진·기초 영향','설비·피난·층고와의 정합성']},
  units:{label:'세대수·주택형',docs:['세대수표','주택형별 면적표','단위세대·동평면'],people:['사업·분양','구조·설비','인허가'],checks:['분양·계약·동의 영향','주차·부대복리·기반시설 재산정']},
  welfare:{label:'부대복리시설',docs:['시설면적표','단지배치도','관련 평면도'],people:['사업주체','조경·설비','인허가'],checks:['법정 설치기준과 운영계획','사업계획승인·분양자료 정합성']},
  parking:{label:'주차',docs:['주차대수 산정표','주차장 평면도','차량동선도'],people:['교통','토목','기계·전기'],checks:['용도별 법정대수·조례','장애인·전기차·기계식 등 별도기준']},
  fire:{label:'피난·소방',docs:['피난계획도','방화구획도','소방도면'],people:['소방','구조','기계·전기'],checks:['피난거리·출구·계단 영향','기존 소방협의·성능위주설계 조건']},
  facade:{label:'입면·외장',docs:['입면도','단면상세','외장재 계획'],people:['외장','구조','경관'],checks:['경관심의·디자인 조건','구조·방화·에너지 기준']},
  mep:{label:'기계·전기',docs:['기계·전기 도면','장비·부하 자료','샤프트·실 계획'],people:['기계','전기','소방'],checks:['용량·인입·장비실 영향','건축·구조와의 공간 정합성']},
  period:{label:'사업기간',docs:['사업기간표','인허가 일정표','공정표'],people:['PM','발주처·사업주체','인허가'],checks:['승인 유효기간·착공조건','선행 심의·협의 일정 재조정']},
  entity:{label:'사업주체',docs:['승인서','권리·계약 증빙','신청인 자료'],people:['사업주체','법무','인허가'],checks:['변경승인·신고 필요 여부','권한·계약·승계 문서']},
  budget:{label:'정비사업비',docs:['사업비 내역','사업시행계획서','관리처분 관련 자료'],people:['조합·사업시행자','정비사업 담당','원가·법무'],checks:['의결·인가·관리처분 영향','경미한 변경 기준 최신 확인']},
  infra:{label:'정비기반시설',docs:['정비기반시설 계획','배치·토목도면','기부채납 자료'],people:['토목','조합·사업시행자','관할부서'],checks:['정비계획·사업시행계획 영향','관계부서 협의와 귀속조건']},
  ops:{label:'공항운영·안전',docs:['운영계획','항공안전 관련 도면','실시계획 승인도서'],people:['공항운영','항공안전·관할 항공청','설비·소방'],checks:['운영 중 공사·보안·안전 영향','기존 실시계획 승인조건']},
  landuse:{label:'토지이용·기반시설',docs:['토지이용계획도','단지계획·실시계획','기반시설 도면'],people:['단지계획','토목','지정권자·관리기관'],checks:['단지계획·실시계획 변경영향','의제 인허가와 관계기관 재협의']},
  industry:{label:'업종·공장면적',docs:['공장설립 승인도서','업종·생산계획','공장·부대시설 면적표'],people:['공장설립 담당','산업단지 관리기관','사업·생산'],checks:['입주가능 업종·관리기본계획','공장설립 변경승인·신고와 건축절차']}
};
const COMMON=['layout','site','area','height','use','structure','parking','fire','facade','mep','period','entity'];
const ROUTE_ITEMS={
  building:COMMON,
  housing:['layout','site','area','height','use','structure','units','welfare','parking','fire','facade','mep','period','entity'],
  renewal:['layout','site','area','height','use','structure','units','parking','fire','budget','infra','period','entity'],
  airport:['layout','site','area','height','use','structure','parking','fire','mep','ops','period','entity'],
  logistics:['layout','site','area','height','use','structure','parking','fire','mep','landuse','period','entity'],
  industry:['layout','site','area','height','use','structure','parking','fire','mep','landuse','industry','period','entity']
};
let state={route:'building',selected:[],values:{}};

function uniq(list){return [...new Set(list.filter(Boolean))]}
function selectedImpacts(){return state.selected.map(k=>IMPACTS[k]).filter(Boolean)}
function resultData(){
  const impacts=selectedImpacts(),route=ROUTES[state.route];
  return {
    docs:uniq(impacts.flatMap(x=>x.docs)),
    people:uniq(impacts.flatMap(x=>x.people)),
    checks:uniq([...impacts.flatMap(x=>x.checks),...(route?.extraChecks||[])])
  };
}
function stage(n){
  return `<div class="cc244-stage"><span class="${n>=1?'on':''}">1 변경항목</span><i></i><span class="${n>=2?'on':''}">2 전후입력</span><i></i><span class="${n>=3?'on':''}">3 영향초안</span></div>`;
}
function shell(inner,n,title){
  const r=ROUTES[state.route];
  return `<div class="cc244-analyzer"><div class="cc244-head"><div><div class="label">CHANGE IMPACT · 척척</div><h3>${esc(title)}</h3></div><button data-cc244-guide>가이드로 돌아가기</button></div><div class="cc244-route">${esc(r?.label||'변경업무')}</div>${stage(n)}${inner}</div>`;
}
function wireGuide(){
  document.querySelectorAll('[data-cc244-guide]').forEach(button=>button.addEventListener('click',()=>{
    const q=ROUTES[state.route]?.query||'인허가 변경업무를 요청받았어요';
    if($('searchInput'))$('searchInput').value=q;
    $('searchGo')?.click();
  }));
}
function renderSelect(route,preserve=false){
  const nextRoute=ROUTES[route]?route:'building';
  if(!preserve||state.route!==nextRoute)state={route:nextRoute,selected:[],values:{}};
  const out=$('searchResult');if(!out)return;
  const keys=ROUTE_ITEMS[state.route]||COMMON;
  out.innerHTML=shell(`<p class="cc244-lead">실제로 달라지는 항목만 고르세요. 법적 절차는 선택 결과를 바탕으로 PM·인허가 담당과 확인합니다.</p><div class="cc244-options">${keys.map(k=>{const on=state.selected.includes(k);return `<button type="button" data-cc244-item="${k}" class="${on?'selected':''}" aria-pressed="${on}">${esc(IMPACTS[k].label)}<span>${on?'✓':'＋'}</span></button>`}).join('')}</div><div class="cc244-bottom"><small id="cc244Count">${state.selected.length}개 선택</small><button class="cc244-primary" id="cc244Next" ${state.selected.length?'':'disabled'}>변경 전후 입력 →</button></div>`,1,'무엇이 변경됐나요?');
  out.querySelectorAll('[data-cc244-item]').forEach(b=>b.addEventListener('click',()=>{
    const key=b.dataset.cc244Item,on=!state.selected.includes(key);
    state.selected=on?[...state.selected,key]:state.selected.filter(x=>x!==key);
    b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));b.querySelector('span').textContent=on?'✓':'＋';
    $('cc244Count').textContent=`${state.selected.length}개 선택`;$('cc244Next').disabled=!state.selected.length;
  }));
  $('cc244Next').addEventListener('click',renderInputs);wireGuide();
}
function renderInputs(){
  const out=$('searchResult');if(!out||!state.selected.length)return;
  out.innerHTML=shell(`<p class="cc244-lead">모르는 값은 비워두세요. 결과에서는 ‘확인 필요’로 표시됩니다.</p><div class="cc244-inputs">${state.selected.map(k=>`<div data-cc244-row="${k}"><b>${esc(IMPACTS[k].label)}</b><label><small>기존 승인내용</small><input data-side="before" value="${esc(state.values[k]?.before||'')}" placeholder="예: 43층 / 273세대"></label><span>→</span><label><small>변경내용</small><input data-side="after" value="${esc(state.values[k]?.after||'')}" placeholder="예: 48층 / 251세대"></label></div>`).join('')}</div><div class="cc244-bottom"><button class="cc244-secondary" id="cc244Prev">← 항목 다시 선택</button><button class="cc244-primary" id="cc244Analyze">영향 초안 만들기 →</button></div>`,2,'기존과 변경 내용을 비교해 주세요');
  const collectValues=()=>{out.querySelectorAll('[data-cc244-row]').forEach(row=>{const k=row.dataset.cc244Row;state.values[k]={before:row.querySelector('[data-side="before"]').value.trim(),after:row.querySelector('[data-side="after"]').value.trim()}})};
  $('cc244Prev').addEventListener('click',()=>{collectValues();renderSelect(state.route,true)});
  $('cc244Analyze').addEventListener('click',()=>{
    collectValues();
    renderResult();
  });wireGuide();
}
function impactPanel(kind,data){
  const names={docs:'영향 가능 도서',people:'협력·확인 분야',checks:'행정 확인사항'};
  return `<div class="cc244-panel ${kind==='docs'?'active':''}" data-cc244-panel="${kind}"><small>${names[kind]}</small><div>${data[kind].map((x,i)=>`<span><em>${i+1}</em>${esc(x)}</span>`).join('')}</div></div>`;
}
function renderResult(){
  const out=$('searchResult');if(!out)return;const data=resultData();
  const rows=state.selected.map(k=>{const d=IMPACTS[k],v=state.values[k]||{};return `<tr><th>${esc(d.label)}</th><td>${esc(v.before||'확인 필요')}</td><td>${esc(v.after||'확인 필요')}</td><td>${esc(d.docs.slice(0,2).join(' · '))}</td><td>${esc(d.people.slice(0,2).join(' · '))}</td></tr>`}).join('');
  out.innerHTML=shell(`<div class="cc244-summary"><div><small>변경항목</small><b>${state.selected.length}개</b></div><div><small>영향 가능 도서</small><b>${data.docs.length}개</b></div><div><small>확인 분야</small><b>${data.people.length}개</b></div></div><div class="cc244-tabs"><button class="active" data-cc244-tab="docs">도면·자료</button><button data-cc244-tab="people">협력분야</button><button data-cc244-tab="checks">행정확인</button></div><div class="cc244-panels">${impactPanel('docs',data)}${impactPanel('people',data)}${impactPanel('checks',data)}</div><details class="cc244-table"><summary>변경비교표 초안 보기</summary><div><table><thead><tr><th>항목</th><th>기존</th><th>변경</th><th>영향 가능 도서</th><th>협력분야</th></tr></thead><tbody>${rows}</tbody></table></div></details><div class="cc244-note"><b>완료 기준</b><span>이 초안을 기존 승인도서와 대조하고, PM·인허가 담당과 변경절차·처리시점·관할기관 확인사항을 확정하세요.</span></div><div class="cc244-warning">척척은 변경허가·신고 대상 여부를 확정하지 않습니다. 최신 법령과 승인권자 기준을 확인하세요.</div><div class="cc244-bottom"><button class="cc244-secondary" id="cc244Edit">← 변경내용 수정</button><button class="cc244-primary" data-cc244-guide>경로 가이드 보기 →</button></div>`,3,'변경 영향 초안을 만들었어요');
  out.querySelectorAll('[data-cc244-tab]').forEach(b=>b.addEventListener('click',()=>{
    out.querySelectorAll('[data-cc244-tab]').forEach(x=>x.classList.toggle('active',x===b));
    out.querySelectorAll('[data-cc244-panel]').forEach(x=>x.classList.toggle('active',x.dataset.cc244Panel===b.dataset.cc244Tab));
  }));
  $('cc244Edit').addEventListener('click',renderInputs);wireGuide();
}
function attach(){
  const root=$('searchResult');if(!root)return;
  root.querySelectorAll('.cc243-card[data-cc243-guide]').forEach(card=>{
    if(card.dataset.cc244==='1')return;card.dataset.cc244='1';
    const bar=card.querySelector('.cc243-switch');if(!bar)return;
    const btn=document.createElement('button');btn.type='button';btn.className='cc244-launch';btn.textContent='변경 영향 분석 시작 →';
    btn.addEventListener('click',()=>renderSelect(card.dataset.cc243Guide));bar.appendChild(btn);
  });
}
function installStyle(){
  if($('cc244Style'))return;
  const s=document.createElement('style');s.id='cc244Style';s.textContent=`
  .cc243-switch .cc244-launch{margin-left:auto;border-color:#AEC4EC!important;background:#EEF4FF!important;color:#2E61C1!important}.cc244-analyzer{position:relative;margin-top:12px;padding:22px 24px;border:1px solid #DFE6F0;border-radius:16px;background:#fff;box-shadow:0 10px 28px rgba(45,66,96,.05)}.cc244-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.cc244-head h3{margin:7px 0 0;color:#253A57;font-size:20px;line-height:1.35}.cc244-head>button{padding:7px 10px;border:1px solid #DDE5F0;border-radius:999px;background:#fff;color:#62738A;font-size:9.5px;font-weight:900}.cc244-route{display:inline-block;margin-top:10px;padding:5px 8px;border-radius:999px;background:#EEF4FF;color:#3564BD;font-size:9px;font-weight:900}.cc244-stage{display:flex;align-items:center;max-width:520px;margin:15px 0 13px}.cc244-stage span{color:#A0AABD;font-size:9px;font-weight:900}.cc244-stage span.on{color:#3264C4}.cc244-stage i{flex:1;height:1px;margin:0 9px;background:#E1E7F0}.cc244-lead{margin:0 0 11px;color:#65768D;font-size:11px;line-height:1.55}.cc244-options{display:flex;flex-wrap:wrap;gap:7px}.cc244-options button{display:flex;align-items:center;gap:8px;padding:9px 11px;border:1px solid #DDE5EF;border-radius:999px;background:#fff;color:#4C607D;font-size:10.5px;font-weight:850}.cc244-options button.selected{border-color:#8FB0EB;background:#EDF4FF;color:#285BB9}.cc244-options button span{font-size:10px}.cc244-bottom{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:16px}.cc244-bottom small{color:#74849A;font-size:9.5px;font-weight:900}.cc244-primary,.cc244-secondary{padding:9px 12px;border-radius:10px;font-size:10px;font-weight:900}.cc244-primary{border:1px solid #3E70D5;background:#4779DD;color:#fff}.cc244-primary:disabled{border-color:#DCE3ED;background:#E9EDF3;color:#A4ADBA}.cc244-secondary{border:1px solid #DDE5EF;background:#fff;color:#5A6D87}
  .cc244-inputs{display:grid;gap:8px}.cc244-inputs>div{display:grid;grid-template-columns:115px 1fr 20px 1fr;gap:8px;align-items:end;padding:10px;border:1px solid #E1E7F0;border-radius:11px}.cc244-inputs>div>b{align-self:center;color:#354C6A;font-size:10.5px}.cc244-inputs label{display:grid;gap:4px}.cc244-inputs label small{color:#7D8A9C;font-size:8.5px;font-weight:850}.cc244-inputs input{min-width:0;padding:8px 9px;border:1px solid #DCE4EF;border-radius:8px;color:#354A67;font-size:10px}.cc244-inputs>div>span{align-self:center;color:#8B98AA;text-align:center}
  .cc244-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.cc244-summary>div{padding:10px 11px;border-radius:11px;background:#F5F8FC}.cc244-summary small{display:block;color:#7A899C;font-size:8.5px;font-weight:900}.cc244-summary b{display:block;margin-top:3px;color:#334C70;font-size:15px}.cc244-tabs{display:flex;gap:6px;margin-top:12px;padding:4px;border-radius:10px;background:#F3F6FA}.cc244-tabs button{flex:1;padding:8px;border:0;border-radius:8px;background:transparent;color:#6E7E93;font-size:10px;font-weight:900}.cc244-tabs button.active{background:#fff;color:#2F61BD;box-shadow:0 2px 7px rgba(42,70,110,.08)}.cc244-panel{display:none;margin-top:9px;padding:11px;border:1px solid #E2E8F1;border-radius:11px}.cc244-panel.active{display:block}.cc244-panel>small{color:#78879A;font-size:8.5px;font-weight:950}.cc244-panel>div{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}.cc244-panel span{display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:8px;background:#F6F8FB;color:#526680;font-size:9.5px;font-weight:800}.cc244-panel em{display:grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#E7EFFD;color:#3264C2;font-size:7.5px;font-style:normal}.cc244-table{margin-top:9px;border:1px solid #E2E8F1;border-radius:11px}.cc244-table summary{padding:10px 11px;color:#526781;font-size:9.5px;font-weight:900;cursor:pointer}.cc244-table>div{overflow:auto;padding:0 10px 10px}.cc244-table table{width:100%;min-width:720px;border-collapse:collapse}.cc244-table th,.cc244-table td{padding:8px;border-bottom:1px solid #E8EDF4;color:#5D6E84;font-size:9px;text-align:left}.cc244-table thead th{color:#758398;font-size:8px}.cc244-note{display:flex;gap:9px;margin-top:9px;padding:10px 11px;border:1px solid #D8EBDD;border-radius:11px;background:#F4FAF6}.cc244-note b{color:#447458;font-size:9px}.cc244-note span{color:#476653;font-size:9.5px;line-height:1.5}.cc244-warning{margin-top:7px;color:#8994A4;font-size:8.5px;line-height:1.45}
  @media(max-width:750px){.cc244-analyzer{padding:18px 15px}.cc244-head h3{font-size:17px}.cc244-head>button{white-space:nowrap}.cc244-stage{max-width:none}.cc244-inputs>div{grid-template-columns:1fr}.cc244-inputs>div>span{transform:rotate(90deg)}.cc244-summary{grid-template-columns:repeat(3,minmax(0,1fr))}.cc244-summary b{font-size:13px}.cc244-bottom{align-items:stretch;flex-direction:column}.cc244-bottom button{width:100%}.cc243-switch .cc244-launch{margin-left:0}}
  `;document.head.appendChild(s);
}
function install(){
  installStyle();attach();
  const root=$('searchResult');if(root)new MutationObserver(attach).observe(root,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
