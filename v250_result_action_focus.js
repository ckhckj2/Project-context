(()=>{
'use strict';

const VERSION='2.1.52';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const short=(value,max=120)=>{const text=clean(value);return text.length>max?text.slice(0,max-1).trim()+'…':text};

const {DEFAULT_RULE,RULES,taskRule}=window.CC_WORK_RULES.task;
function currentLevel(){return window.CC_LEVEL_STORE.state().view}

function prepareResult(){
  const root=$('searchResult');
  if(!root||!root.children.length)return;
  const cards=[...root.querySelectorAll(':scope>.result-card')];
  if(!cards.length)return;
  const answer=window.CC_SEARCH_ANSWER.read(cards[0]);
  // Clarification/route selectors remain directly visible; never invent filler.
  if(!answer?.title||!answer.items.length)return;
  root.classList.add('cc252-result-root');
  cards.forEach(card=>card.classList.add('cc252-source-card'));
  if(root.querySelector(':scope>.cc252-answer'))return;

  const first=cards[0];
  const title=answer.title;
  const actions=answer.items.map(item=>({label:short(item.label,28),body:short(item.body,125)}));
  const summary=document.createElement('section');
  summary.className='cc252-answer';
  if(first.classList.contains('cc217-result'))summary.classList.add('cc217-answer');
  summary.innerHTML=`<div class="cc252-answer-head"><small>핵심 답변</small><h3>${esc(title)}</h3>${answer.context?`<p class="cc252-answer-context">${esc(answer.context)}</p>`:''}</div><div class="cc252-action-grid">${actions.map((item,index)=>`<div><small>0${index+1} · ${esc(item.label)}</small><p>${esc(item.body)}</p></div>`).join('')}</div><button type="button" class="cc252-detail-toggle" aria-expanded="false">상세 답변 보기 <span>↓</span></button>`;
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
  button.classList.remove('locked');
  button.dataset.cc252Unlocked='1';
  return button;
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

function install(){

  window.CC_RUNTIME.registerContext('focus',patchContext);
  window.CC_RUNTIME.registerResult('focus',prepareResult);
}
window.CC_BOOT.register('v250_result_action_focus',install);
})();
