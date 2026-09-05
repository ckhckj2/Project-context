(()=>{
'use strict';

const VERSION='2.1.52';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const short=(value,max=120)=>{const text=clean(value);return text.length>max?text.slice(0,max-1).trim()+'…':text};

const DEFAULT_RULE={
  why:'다음 의사결정에 필요한 기준과 결과물을 만드는 업무예요.',
  material:'최신 업무지시 · 기준도면/모델 · 최근 협의사항',
  owner:'업무를 요청한 선임·책임 또는 프로젝트 PM',
  steps:['결과물의 목적·검토자·마감시점을 확인','최신 기준자료와 변경사항을 한곳에 모으기','검토자에게 중간 확인 후 결과물과 근거를 함께 정리'],
  done:'목적·기준자료·검토자·다음 행동이 서로 연결된 상태'
};

const RULES=[
  {re:/발주처.*협의|보고서|보고자료/,why:'발주처나 의사결정자가 선택해야 할 내용을 근거와 함께 전달하기 위한 업무예요.',material:'최신 도면·모델 · 이전 보고자료 · 결정사항·미결사항',owner:'자료의 메시지는 책임·PM, 기술 근거는 해당 분야 담당자',steps:['이번 자료에서 받아야 할 결정을 한 문장으로 정리','결정에 필요한 도면·수치·대안을 최신본으로 통일','결론을 먼저 배치하고 근거와 미결사항을 검토받기'],done:'결정할 내용·근거·미결사항·후속 담당자가 한눈에 보이는 상태'},
  {re:/인허가|심의/,why:'설계안이 적용 절차와 기준을 충족하는지 공식적으로 확인받기 위한 업무예요.',material:'원 승인경로 · 관할청/접수시스템 요구목록 · 최신 건축·구조·기계·전기·소방 자료',owner:'PM·인허가 담당 → 분야별 협력업체 → 필요 시 관할기관',steps:['원래 어떤 절차로 승인받는 프로젝트인지 확인','관할청·접수시스템의 최신 요구목록으로 분야별 자료 요청','도면·계산서·신청서의 기준일과 변경사항을 맞춘 뒤 제출 전 검토'],done:'적용 절차와 제출목록이 확인되고 모든 파일의 버전·수치·담당자가 맞는 상태'},
  {re:/지구단위/,why:'대지에 별도로 적용되는 도시계획 조건을 설계 초기부터 반영하기 위한 업무예요.',material:'토지이용계획 · 최신 지구단위계획 결정도서/결정도 · 변경고시',owner:'프로젝트 책임·PM → 도시계획 담당 또는 관할 지자체',steps:['지번·구역명과 적용구역을 먼저 확인','최신 결정도서에서 건축에 영향 주는 조항 표시','규모·배치·용도 조건을 도면과 체크리스트에 반영'],done:'적용 조항과 설계 반영 위치, 추가 확인사항이 표시된 상태'},
  {re:/법규/,why:'설계안이 적용 법령과 지역기준 안에서 성립하는지 확인하기 위한 업무예요.',material:'법적 용도·사업방식 · 국가법령정보센터 · 조례·지구단위계획 최신 원문',owner:'사내 법규 검토자·책임·PM, 해석이 애매하면 관할기관',steps:['용도·규모·사업방식으로 적용 법규 범위 설정','법률→시행령→시행규칙→조례·계획 순으로 원문 확인','적용·예외·미확정 항목을 근거조문과 함께 기록'],done:'판단값마다 근거·기준일·예외·추가 확인대상이 남아 있는 상태'},
  {re:/입면|디자인/,why:'디자인 의도와 평·단면, 창호·외장·구조 등 실제 구현조건을 함께 맞추기 위한 업무예요.',material:'최신 평면·단면·입면 · 모델 · 마감·창호 자료 · 최근 디자인 코멘트',owner:'디자인 방향은 책임·PM, 구현조건은 외장·창호·구조 담당',steps:['컨셉·비례·재료·창호·상세 중 검토범위 확인','평·단·입면과 모델의 기준일을 통일','변경 영향과 구현조건을 표시해 디자인 검토받기'],done:'디자인 결정과 구현조건, 영향받는 도면이 함께 정리된 상태'},
  {re:/사례조사/,why:'예쁜 이미지를 모으는 것이 아니라 현재 설계 결정을 뒷받침할 비교근거를 찾는 업무예요.',material:'프로젝트 요구사항 · 비교기준 · 신뢰 가능한 원문·도면·사진 출처',owner:'조사방향은 책임·PM, 기술사례는 해당 분야 담당자',steps:['이번 조사로 결정할 질문과 비교기준 설정','같은 기준으로 사례를 수집하고 출처 기록','적용 가능점·차이점·추천안을 한 장으로 요약'],done:'사례마다 출처·비교기준·프로젝트 적용점이 정리된 상태'},
  {re:/모델링/,why:'현재 단계에서 판단할 공간·규모·형태와 도면 간 정합성을 확인하기 위한 업무예요.',material:'최신 평면·단면·배치 · 면적표 · 기준레벨 · 협의사항 · 프로젝트 BIM 기준',owner:'모델 범위는 책임·PM, 협업규칙은 BIM 담당자와 확인',steps:['규모·형태·입면·도면연계 중 모델 목적 확인','최신 기준도면·레벨·좌표·파일 규칙 통일','필요한 상세수준까지만 작성하고 도면·면적과 교차검토'],done:'검토 목적에 필요한 수준으로 모델과 기준도면이 맞는 상태'},
  {re:/CG|렌더링/,why:'결정해야 할 공간·재료·빛·형태를 이해관계자가 빠르게 판단하도록 시각화하는 업무예요.',material:'승인된 모델·카메라 · 재료·조명 기준 · 표현목적과 마감시간',owner:'구도·메시지는 책임·PM, 재료·디자인은 담당자와 확인',steps:['이미지의 사용처와 결정할 내용을 먼저 확인','카메라·모델·재료의 기준본을 고정','저해상도 중간검토 후 확정안만 최종 출력'],done:'결정 목적과 최신 설계가 일치하고 수정 가능 범위가 명확한 상태'},
  {re:/도면.*수정/,why:'요청된 변경을 모든 관련 도면과 수치에 빠짐없이 일관되게 반영하기 위한 업무예요.',material:'수정지시 · 최신 기준도면/모델 · 변경이력 · 관련 분야 도면',owner:'변경 의도는 요청자, 영향범위는 책임·관련 분야 담당자',steps:['수정내용·이유·기준본을 확인하고 레드라인 작성','평·단·입면·상세·면적·모델의 영향범위 확인','관련 도서를 함께 수정하고 변경내역을 검토자에게 전달'],done:'변경이 모든 영향도서에 반영되고 검토·전달 기록이 남은 상태'},
  {re:/협력업체/,why:'분야별 설계조건과 변경사항을 같은 기준일과 공간조건으로 맞추기 위한 업무예요.',material:'최신 건축도면 · 분야별 요청·회신목록 · 간섭·미결사항 · 일정',owner:'프로젝트 책임·PM과 각 분야 실무담당자',steps:['요청할 결정·자료·마감일을 분야별로 구분','기준도면과 변경표를 함께 전달하고 회신버전 기록','간섭·미결사항의 담당자와 완료일을 정해 재확인'],done:'요청·회신·반영·미결사항의 담당자와 버전이 추적되는 상태'},
  {re:/변경업무/,why:'기존 승인도서와 달라진 설계를 적정 변경절차와 최신 설계도서로 다시 연결하기 위한 업무예요.',material:'원 승인서·승인도서 · 변경안 · 변경비교표 · 적용 법령·관할기관 기준',owner:'PM·인허가 담당 → 변경 영향 분야 → 승인기관 확인',steps:['원 승인경로와 승인도서를 기준본으로 고정','배치·면적·높이·층수·용도·구조 등의 변경을 비교표로 작성','변경허가·신고·경미한 변경 등 처리유형과 선행시점 확인'],done:'변경내용·영향도서·처리절차·담당자·처리시점이 연결된 상태'}
];

function taskRule(task){return RULES.find(rule=>rule.re.test(task||''))||DEFAULT_RULE}
function currentLevel(){const match=clean($('miniLevel')?.textContent).match(/LV\.(\d)/);return match?Number(match[1]):1}

function textParts(element){
  if(!element)return null;
  const label=clean(element.querySelector('small')?.textContent||element.querySelector('b')?.textContent||'지금 확인').replace(/^\d+\s*[·.\-]?\s*/,'');
  const body=clean(element.querySelector('p')?.textContent||element.querySelector('span')?.textContent||element.textContent);
  return body?{label:short(label,28),body:short(body,120)}:null;
}

function resultActions(card){
  let items=[];
  if(card.classList.contains('cc245-card')){
    items=[
      {label:'핵심 구분',body:short(card.querySelector('.cc245-head')?.textContent,125)},
      {label:'먼저 확인',body:short(card.querySelector('.cc245-first')?.textContent?.replace(/^먼저 확인\s*/,''),125)},
      {label:'주의',body:short(card.querySelector('.cc245-more')?.textContent?.replace(/^주의\s*/,''),125)}
    ];
  }else if(card.querySelector('.cc235-flow')){
    items=[...card.querySelectorAll('.cc235-flow>div')].slice(0,3).map(textParts);
  }else if(card.querySelector('.cc241-steps')){
    items=[...card.querySelectorAll('.cc241-steps>div')].slice(0,3).map(textParts);
  }else if(card.querySelector('.cc243-steps')){
    items=[...card.querySelectorAll('.cc243-steps>div')].slice(0,3).map(textParts);
  }else if(card.querySelector('.script-box')){
    const title=clean(card.querySelector('h3')?.textContent||'');
    items=[
      {label:'문의 대상',body:short(title.includes('→')?title.split('→').slice(1).join('→'):title,110)},
      {label:'확인할 내용',body:short([...card.children].find(x=>x.tagName==='P')?.textContent,110)},
      {label:'이렇게 질문',body:short(card.querySelector('.script-box')?.textContent?.replace(/^이렇게 물어보세요\s*/,''),125)}
    ];
  }else if(card.querySelector('.result-grid .result-cell')){
    items=[...card.querySelectorAll('.result-grid .result-cell')].slice(0,3).map(textParts);
  }else if(card.querySelector('.cc232-start')){
    items=[...card.querySelectorAll('.cc232-start li,.cc232-start>div')].slice(0,3).map(textParts);
  }
  items=items.filter(item=>item&&item.body);
  const intro=short([...card.children].find(x=>x.tagName==='P')?.textContent,115);
  const fallbacks=[
    {label:'핵심',body:intro||'질문의 핵심 의미와 적용범위를 먼저 확인하세요.'},
    {label:'지금 먼저',body:'현재 프로젝트의 목적과 최신 기준자료부터 확인하세요.'},
    {label:'상세 확인',body:'적용조건·주의사항·완료기준은 상세 답변에서 이어서 확인하세요.'}
  ];
  for(const fallback of fallbacks){if(items.length>=3)break;if(!items.some(item=>item.body===fallback.body))items.push(fallback)}
  return items.slice(0,3);
}

function prepareResult(){
  const root=$('searchResult');
  if(!root||!root.children.length)return;
  const cards=[...root.querySelectorAll(':scope>.result-card')];
  if(!cards.length)return;
  root.classList.add('cc252-result-root');
  cards.forEach(card=>card.classList.add('cc252-source-card'));
  if(root.querySelector(':scope>.cc252-answer'))return;

  const first=cards[0];
  const title=clean(first.querySelector('h3')?.textContent||'질문의 핵심부터 확인하세요');
  const actions=resultActions(first);
  const summary=document.createElement('section');
  summary.className='cc252-answer';
  summary.innerHTML=`<div class="cc252-answer-head"><small>핵심 답변</small><h3>${esc(title)}</h3></div><div class="cc252-action-grid">${actions.map((item,index)=>`<div><small>0${index+1} · ${esc(item.label)}</small><p>${esc(item.body)}</p></div>`).join('')}</div><button type="button" class="cc252-detail-toggle" aria-expanded="false">상세 답변 보기 <span>↓</span></button>`;
  root.insertBefore(summary,first);
  const toggle=summary.querySelector('.cc252-detail-toggle');
  toggle.addEventListener('click',()=>{
    const open=!root.classList.contains('cc252-detail-open');
    root.classList.toggle('cc252-detail-open',open);
    root.querySelectorAll(':scope>.cc252-source-card').forEach(card=>card.classList.toggle('cc242-expanded',open));
    toggle.setAttribute('aria-expanded',String(open));
    toggle.innerHTML=open?'핵심만 보기 <span>↑</span>':'상세 답변 보기 <span>↓</span>';
  });
}

function basicWhy(rule,task,phase){
  return `<div class="cc252-pane-head"><small>기본 공개 · WHY / WHERE</small><b>${esc(task)}의 목적과 확인자료</b><span>${esc(phase)} 기준으로 먼저 알아야 할 내용이에요.</span></div><div class="cc252-pane-grid"><div><small>왜 하나요?</small><p>${esc(rule.why)}</p></div><div><small>먼저 볼 자료</small><p>${esc(rule.material)}</p></div><div><small>완료 기준</small><p>${esc(rule.done)}</p></div></div><div class="cc252-level-note">LV.2부터 공식 확인처·놓쳤을 때의 위험·프로젝트별 추가조건이 더해집니다.</div>`;
}

function basicHow(rule,task,phase){
  return `<div class="cc252-pane-head"><small>기본 공개 · HOW</small><b>${esc(phase)} · ${esc(task)} 기본 수행순서</b><span>신입도 업무를 시작할 수 있는 최소 실행정보예요.</span></div><div class="cc252-how-sequence">${rule.steps.map((step,index)=>`<div><small>0${index+1}</small><b>${esc(step)}</b></div>`).join('')}</div><div class="cc252-pane-grid cc252-how-meta"><div><small>기준자료</small><p>${esc(rule.material)}</p></div><div><small>누구와 확인?</small><p>${esc(rule.owner)}</p></div><div><small>완료 기준</small><p>${esc(rule.done)}</p></div></div><div class="cc252-level-note">LV.3부터 전체 체크리스트·협력업체 조정·프로젝트 조건별 판단이 더해집니다.</div>`;
}

function deepWhy(rule,task,phase){
  return `<div class="cc252-pane-head"><small>LV.2 · WHY / WHERE</small><b>${esc(task)}의 목적·근거·확인처</b><span>${esc(phase)}에서 적용할 조건과 놓쳤을 때의 영향까지 확인합니다.</span></div><div class="cc252-pane-grid"><div><small>WHY</small><p>${esc(rule.why)}</p></div><div><small>놓치면</small><p>기준자료·적용조건·검토시점이 어긋나 재작업이나 승인·협의 지연이 생길 수 있어요.</p></div><div><small>먼저 볼 자료</small><p>${esc(rule.material)}</p></div><div><small>공식·외부 확인</small><p>프로젝트 원문 기준과 최신 법령·고시·관할기관 안내를 함께 확인하세요.</p></div><div><small>누구와 확인?</small><p>${esc(rule.owner)}</p></div><div><small>완료 기준</small><p>${esc(rule.done)}</p></div></div>`;
}

function deepHow(rule,task,phase){
  const checklist=[rule.steps[0],rule.steps[1],rule.steps[2],'관련 도면·수치·분야에 미치는 영향을 교차검토','결과·미결사항·기준일·다음 담당자를 기록하고 공유'];
  return `<div class="cc252-pane-head"><small>LV.3 · HOW</small><b>${esc(phase)} · ${esc(task)} 실행 절차</b><span>하나의 순서로 실행한 뒤 필요할 때 상세 체크리스트를 펼치세요.</span></div><div class="cc252-how-sequence">${rule.steps.map((step,index)=>`<div><small>0${index+1}</small><b>${esc(step)}</b></div>`).join('')}</div><details class="cc252-deep-detail"><summary>전체 실행 체크리스트 보기</summary><div class="cc252-checklist">${checklist.map((step,index)=>`<div><span>${index+1}</span><p>${esc(step)}</p></div>`).join('')}</div><div class="cc252-pane-grid cc252-how-meta"><div><small>CHECK</small><p>${esc(rule.material)}</p></div><div><small>WHO</small><p>${esc(rule.owner)}</p></div><div><small>완료 기준</small><p>${esc(rule.done)}</p></div></div></details>`;
}

function bindDrawer(button,pane){
  if(!button||!pane)return button;
  const clone=button.cloneNode(true);
  clone.classList.remove('locked');
  clone.dataset.cc252Unlocked='1';
  button.replaceWith(clone);
  clone.addEventListener('click',()=>{
    const root=$('contextResult');
    const open=!pane.classList.contains('show');
    root.querySelectorAll('.drawer.show').forEach(item=>{if(item!==pane)item.classList.remove('show')});
    root.querySelectorAll('.actions [data-drawer]').forEach(item=>{if(item!==clone){item.classList.remove('cc-drawer-active');item.setAttribute('aria-expanded','false')}});
    pane.classList.toggle('show',open);
    clone.classList.toggle('cc-drawer-active',open);
    clone.setAttribute('aria-expanded',String(open));
  });
  return clone;
}

function foldProjectFlow(map){
  const flow=map?.querySelector(':scope>.flow');
  if(!flow||flow.closest('.cc252-context-flow'))return;
  const fold=document.createElement('details');
  fold.className='cc252-context-flow';
  fold.innerHTML='<summary><span><b>프로젝트 전체 흐름 보기</b><small>현재 단계의 앞뒤 업무 확인</small></span><i aria-hidden="true"></i></summary>';
  const head=map.querySelector(':scope>.map-head');
  (head||map.firstChild)?.after(fold);
  fold.append(flow);
}

function patchContext(){
  const root=$('contextResult');
  if(!root||!root.innerHTML.trim())return;
  const map=root.querySelector('.map');
  const actions=map?.querySelector(':scope>.actions');
  if(!map||!actions)return;
  const task=$('task')?.value||'현재 업무';
  const phase=$('phase')?.value||'현재 단계';
  const rule=taskRule(task);
  const level=currentLevel();
  const contextKey=[task,phase,level,clean(root.querySelector('.stage-banner')?.textContent)].join('|');
  const readyHow=level>=3
    ? actions.querySelector('[data-drawer="how"]')&&map.querySelector('[data-pane="how"]:not(.cc232-how-lock)')&&!map.querySelector('[data-pane="how"] .cc232-how-lock')
    : actions.querySelector('[data-drawer="how"][data-cc252-unlocked="1"]')&&map.querySelector('[data-pane="how"] .cc252-pane-head');
  if(root.dataset.cc252Key===contextKey&&map.querySelector(':scope>.cc252-context-brief')&&actions.classList.contains('cc252-actions')&&readyHow)return;
  root.dataset.cc252Key=contextKey;

  foldProjectFlow(map);
  let brief=map.querySelector(':scope>.cc252-context-brief');
  if(!brief){
    brief=document.createElement('section');
    brief.className='cc252-context-brief';
    actions.before(brief);
  }
  brief.innerHTML=`<div class="cc252-brief-head"><div><small>레벨과 관계없이 먼저 확인</small><b>${esc(phase)} · ${esc(task)}</b></div><span>기본 실행정보</span></div><div class="cc252-brief-grid"><div><small>01 · 지금 먼저</small><p>${esc(rule.steps[0])}</p></div><div><small>02 · 기준자료</small><p>${esc(rule.material)}</p></div><div><small>03 · 누구와</small><p>${esc(rule.owner)}</p></div></div>`;

  let whyButton=actions.querySelector('[data-drawer="why"]');
  const whyPane=map.querySelector('[data-pane="why"]');
  let howButton=actions.querySelector('[data-drawer="how"]');
  const howPane=map.querySelector('[data-pane="how"]');

  if(level<2&&whyPane){
    whyPane.innerHTML=basicWhy(rule,task,phase);
    whyButton=bindDrawer(whyButton,whyPane);
  }else if(level>=2&&whyPane?.querySelector('.cc252-pane-head')){
    whyPane.innerHTML=deepWhy(rule,task,phase);
  }
  if(level<3&&howPane){
    howPane.innerHTML=basicHow(rule,task,phase);
    howButton=bindDrawer(howButton,howPane);
  }else if(level>=3&&howPane?.querySelector('.cc252-pane-head')){
    howPane.innerHTML=deepHow(rule,task,phase);
    howPane.classList.add('cc252-unified-how');
  }else if(howPane&&!howPane.querySelector(':scope>.cc252-how-sequence')){
    const sequence=document.createElement('div');
    sequence.className='cc252-how-sequence cc252-deep-sequence';
    sequence.innerHTML=rule.steps.map((step,index)=>`<div><small>0${index+1}</small><b>${esc(step)}</b></div>`).join('');
    const head=howPane.querySelector(':scope>.cc232-how-head');
    head?head.after(sequence):howPane.prepend(sequence);
    howPane.classList.add('cc252-unified-how');
  }

  whyButton=actions.querySelector('[data-drawer="why"]');
  howButton=actions.querySelector('[data-drawer="how"]');
  const contextButton=actions.querySelector('[data-drawer="context"]');
  const askButton=actions.querySelector('[data-ask-context]');
  const cautionButton=actions.querySelector('[data-drawer="caution"]');
  if(contextButton)contextButton.innerHTML='<small>CONTEXT</small>앞뒤 업무';
  if(howButton)howButton.innerHTML='<small>HOW</small>수행 순서';
  if(whyButton)whyButton.innerHTML='<small>WHY / WHERE</small>목적·확인자료';
  if(askButton)askButton.innerHTML='<small>WHO</small>누구에게 물어보기';
  if(cautionButton)cautionButton.innerHTML='<small>CAUTION</small>놓치기 쉬운 점';
  [contextButton,howButton,whyButton,askButton,cautionButton].filter(Boolean).forEach(button=>actions.append(button));
  actions.classList.add('cc252-actions');
}

function installStyle(){
  if($('cc252Style'))return;
  const style=document.createElement('style');
  style.id='cc252Style';
  style.textContent=`
  /* v2.1.52 — answer first, three actions, depth on demand */
  #searchResult.cc252-result-root{display:block!important}
  #searchResult.cc252-result-root>.cc252-source-card{display:none!important}
  #searchResult.cc252-result-root.cc252-detail-open>.cc252-source-card{display:block!important;margin-top:10px!important}
  #searchResult .cc252-source-card>.cc242-toggle{display:none!important}
  .cc252-answer{padding:24px;border:1px solid #DCE5F1;border-radius:18px;background:#fff;box-shadow:0 8px 26px rgba(15,23,42,.045)}
  .cc252-answer-head small{display:block;color:#2D6FE9;font-size:9px;font-weight:950;letter-spacing:.08em}
  .cc252-answer-head h3{max-width:820px;margin:7px 0 0!important;color:#142A4D;font-size:22px!important;line-height:1.4!important;letter-spacing:-.5px}
  .cc252-action-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:18px}
  .cc252-action-grid>div{min-height:112px;padding:14px;border:1px solid #E6EBF3;border-radius:13px;background:#F8FAFD}
  .cc252-action-grid small{display:block;color:#5471A2;font-size:9px;font-weight:950}
  .cc252-action-grid p{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3;margin:7px 0 0;color:#40536E;font-size:11.5px;line-height:1.65;font-weight:650}
  .cc252-detail-toggle{width:100%;margin-top:11px;padding:11px 14px;border:1px solid #DDE5F0;border-radius:11px;background:#fff;color:#526783;font-size:10px;font-weight:900;cursor:pointer}
  .cc252-detail-toggle:hover{border-color:#AFC5E8;background:#F8FAFE;color:#2F5EA8}

  #contextResult .map>.map-head{display:none!important}
  .cc252-context-flow{margin:0 0 10px;border:1px solid #E3E9F1;border-radius:13px;background:#fff;overflow:hidden}
  .cc252-context-flow>summary{list-style:none;min-height:48px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer}
  .cc252-context-flow>summary::-webkit-details-marker{display:none}
  .cc252-context-flow>summary span{display:flex;align-items:baseline;gap:9px}
  .cc252-context-flow>summary b{color:#314A6C;font-size:11px}
  .cc252-context-flow>summary small{color:#8A97A9;font-size:9px}
  .cc252-context-flow>summary i{width:20px;height:20px;border-radius:50%;background:#F0F4FA;position:relative}
  .cc252-context-flow>summary i:before,.cc252-context-flow>summary i:after{content:"";position:absolute;left:6px;top:9px;width:8px;height:1.5px;background:#62748E}
  .cc252-context-flow>summary i:after{transform:rotate(90deg)}
  .cc252-context-flow[open]>summary i:after{transform:none}
  .cc252-context-flow:not([open])>:not(summary){display:none!important}
  .cc252-context-flow>.flow{margin:0!important;padding:14px!important;border-top:1px solid #EBEFF5}

  .cc252-context-brief{margin:0 0 10px;padding:16px;border:1px solid #D9E5F6;border-radius:15px;background:linear-gradient(145deg,#F8FBFF,#F2F7FF)}
  .cc252-brief-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .cc252-brief-head small{display:block;color:#4D72B3;font-size:8.5px;font-weight:950}
  .cc252-brief-head b{display:block;margin-top:3px;color:#223F69;font-size:14px}
  .cc252-brief-head>span{padding:5px 8px;border-radius:999px;background:#fff;color:#5673A3;font-size:8px;font-weight:900}
  .cc252-brief-grid,.cc252-pane-grid,.cc252-how-sequence{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
  .cc252-brief-grid>div,.cc252-pane-grid>div,.cc252-how-sequence>div{padding:11px;border-radius:11px;background:#fff}
  .cc252-brief-grid small,.cc252-pane-grid small,.cc252-how-sequence small{display:block;color:#5573A6;font-size:8.5px;font-weight:950}
  .cc252-brief-grid p,.cc252-pane-grid p{margin:5px 0 0;color:#465A74;font-size:10.5px;line-height:1.6}
  .cc252-how-sequence b{display:block;margin-top:5px;color:#385271;font-size:10.5px;line-height:1.55}

  #contextResult .actions.cc252-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;margin-top:10px!important}
  #contextResult .actions.cc252-actions>button{min-height:58px!important;padding:10px 11px!important;border-radius:11px!important;text-align:left!important;font-size:10.5px!important}
  #contextResult .actions.cc252-actions>button small{display:block!important;margin-bottom:4px!important;color:#6178A0!important;font-size:8px!important}
  #contextResult .actions.cc252-actions>button:nth-child(-n+3){border-color:#C8D8EF!important;background:#F4F8FE!important;color:#284E84!important}
  #contextResult .actions.cc252-actions>button.locked{filter:none!important;opacity:1!important}

  .cc252-pane-head{padding:16px 17px;border:1px solid #DEE6F1;border-radius:14px 14px 0 0;background:#fff}
  .cc252-pane-head small{display:block;color:#4569A8;font-size:9px;font-weight:950;letter-spacing:.04em}
  .cc252-pane-head b{display:block;margin-top:4px;color:#1E3C65;font-size:16px}
  .cc252-pane-head span{display:block;margin-top:5px;color:#78879A;font-size:10px}
  .cc252-pane-grid,.cc252-how-sequence{margin:0;padding:10px;border:1px solid #DEE6F1;border-top:0;background:#F8FAFD}
  .cc252-how-meta{border-top:1px solid #E8EDF4}
  .cc252-level-note{padding:10px 13px;border:1px solid #DEE6F1;border-top:0;border-radius:0 0 14px 14px;background:#fff;color:#7A8799;font-size:9px;line-height:1.55}
  .cc252-deep-sequence{margin:0!important;border-top:0!important}
  .cc252-unified-how>.cc232-how-steps{display:none!important}
  .cc252-deep-detail{padding:0 12px 12px;border:1px solid #DEE6F1;border-top:0;border-radius:0 0 14px 14px;background:#fff}
  .cc252-deep-detail>summary{padding:12px 2px;cursor:pointer;color:#50637E;font-size:10px;font-weight:900}
  .cc252-checklist{display:grid;gap:6px}
  .cc252-checklist>div{display:grid;grid-template-columns:23px 1fr;gap:8px;align-items:start}
  .cc252-checklist span{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#EEF3FB;color:#5270A4;font-size:9px;font-weight:950}
  .cc252-checklist p{margin:2px 0 0;color:#405570;font-size:10.5px;line-height:1.55}

  @media(max-width:760px){
    .cc252-action-grid,.cc252-brief-grid,.cc252-pane-grid,.cc252-how-sequence{grid-template-columns:1fr}
    .cc252-answer{padding:17px}
    .cc252-answer-head h3{font-size:18px!important}
    .cc252-action-grid>div{min-height:0}
    .cc252-context-flow>summary span{display:grid;gap:2px}
    #contextResult .actions.cc252-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .cc252-brief-head{align-items:flex-start}
  }
  `;
  document.head.append(style);
}

let resultTimer=null;
let contextTimer=null;
function scheduleResult(){clearTimeout(resultTimer);resultTimer=setTimeout(prepareResult,45)}
function scheduleContext(delay=40){clearTimeout(contextTimer);contextTimer=setTimeout(patchContext,delay)}

function install(){
  installStyle();
  const result=$('searchResult');
  const context=$('contextResult');
  if(result)new MutationObserver(scheduleResult).observe(result,{childList:true,subtree:true});
  if(context)new MutationObserver(()=>scheduleContext(40)).observe(context,{childList:true,subtree:true});
  document.addEventListener('click',event=>{
    if(event.target.closest('#searchGo,#homeSearchBtn,[data-example]'))scheduleResult();
    if(event.target.closest('#analyze,.master-levels button'))scheduleContext(190);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&(event.target===$('searchInput')||event.target===$('homeSearch')))scheduleResult();
  });
  if(result?.children.length)scheduleResult();
  if(context?.innerHTML.trim())scheduleContext(190);
  
  
  
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
