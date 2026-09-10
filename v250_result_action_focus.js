(()=>{
'use strict';

const VERSION='2.1.52';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const short=(value,max=120)=>{const text=clean(value);return text.length>max?text.slice(0,max-1).trim()+'…':text};

const {DEFAULT_RULE,RULES,taskRule}=window.CC_WORK_RULES.task;
function currentLevel(){return window.CC_LEVEL_STORE.state().view}

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
  const rule=window.CC_WORK_CONTEXT.resolve().base;
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


function install(){
  installStyle();
  window.CC_RUNTIME.registerContext('focus',patchContext);
  window.CC_RUNTIME.registerResult('focus',prepareResult);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
