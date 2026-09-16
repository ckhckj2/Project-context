(()=>{
'use strict';

const VERSION='2.1.56';
const $=id=>document.getElementById(id);
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const setText=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};

const DEPTHS=[
  {level:1,name:'핵심 실행',desc:'목적·첫 행동·자료·협업·완료기준'},
  {level:2,name:'근거·위험',desc:'공식 확인처·놓쳤을 때의 영향'},
  {level:3,name:'절차·협업',desc:'전체 체크리스트·분야별 조정'},
  {level:4,name:'판단·예외',desc:'복합조건·특별법·충돌 판단'}
];
const OPEN_AREAS=['context','how','why','who','caution'];

function currentLevel(){
  return window.CC_LEVEL_STORE.state().depth;
}

function bindOpenDrawer(button,pane){
  if(!button||!pane)return button;
  button.dataset.cc254Unlocked='1';
  return button;
}

function unlockInformationAreas(root){
  const map=root.querySelector('.map');
  const actions=map?.querySelector(':scope>.actions');
  if(!map||!actions)return;
  actions.querySelectorAll('[data-drawer]').forEach(button=>{
    const key=button.dataset.drawer;
    const pane=map.querySelector(`[data-pane="${key}"]`);
    button.classList.remove('locked');
    button.disabled=false;
    button.removeAttribute('disabled');
    button.removeAttribute('aria-disabled');
    if(pane)bindOpenDrawer(button,pane);
  });
  const ask=actions.querySelector('[data-ask-context]');
  if(ask){
    ask.classList.remove('locked');
    ask.disabled=false;
    ask.removeAttribute('disabled');
    ask.removeAttribute('aria-disabled');
  }
}

function normalizeActionShell(actions){
  if(!actions)return;
  const items=[
    [actions.querySelector('[data-drawer="context"]'),'<small>CONTEXT</small>앞뒤 업무'],
    [actions.querySelector('[data-drawer="how"]'),'<small>HOW</small>수행 순서'],
    [actions.querySelector('[data-drawer="why"]'),'<small>WHY / WHERE</small>목적·확인자료'],
    [actions.querySelector('[data-ask-context]'),'<small>WHO</small>누구에게 물어보기'],
    [actions.querySelector('[data-drawer="caution"]'),'<small>CAUTION</small>놓치기 쉬운 점']
  ];
  const ordered=[];
  for(const [button,html] of items){
    if(!button)continue;
    if(button.innerHTML!==html)button.innerHTML=html;
    ordered.push(button);
  }
  ordered.forEach((button,index)=>{
    const current=actions.children[index];
    if(current!==button)actions.insertBefore(button,current||null);
  });
}

function depthGuide(level){
  const current=DEPTHS[level-1];
  const guide=document.createElement('section');
  guide.className='cc254-depth-guide';
  guide.dataset.cc254Level=String(level);
  guide.innerHTML=`<div class="cc254-depth-head"><div><small>현재 답변 깊이</small><b>LV.${level} · ${current.name}</b></div><span>모든 정보영역 열림</span></div><div class="cc254-depth-track">${DEPTHS.map(item=>`<div class="${item.level===level?'is-current':item.level<level?'is-passed':'is-next'}"><i>${item.level}</i><span><b>LV.${item.level} ${item.name}</b><small>${item.desc}</small></span></div>`).join('')}</div><p>레벨이 오르면 메뉴가 새로 열리는 것이 아니라, 같은 메뉴 안의 근거·절차·판단정보가 더 구체적으로 표시됩니다.</p>`;
  return guide;
}

function normalizeCopy(root,level){
  const depth=DEPTHS[level-1];
  const brief=root.querySelector('.cc252-context-brief');
  if(brief){
    const eyebrow=brief.querySelector('.cc252-brief-head small');
    const badge=brief.querySelector('.cc252-brief-head>span');
    setText(eyebrow,'모든 레벨에서 바로 확인');
    setText(badge,`LV.${level} · ${depth.name}`);
  }

  root.querySelectorAll('.cc252-pane-head').forEach(head=>{
    const small=head.querySelector('small');
    const description=head.querySelector('span');
    const label=clean(small?.textContent);
    if(small){
      if(/WHY|WHERE/.test(label))setText(small,'현재 레벨 가이드 · WHY / WHERE');
      else if(/HOW/.test(label))setText(small,'현재 레벨 가이드 · HOW');
    }
    if(description&&/신입도 업무를 시작할 수 있는 최소 실행정보/.test(description.textContent)){
      setText(description,'현재 레벨에서 바로 실행할 수 있도록 핵심 순서와 확인기준을 정리했어요.');
    }
  });

  root.querySelectorAll('.cc252-level-note').forEach(note=>{
    const pane=note.closest('[data-pane]');
    if(pane?.dataset.pane==='why'){
      setText(note,'지금도 목적·자료·완료기준을 모두 볼 수 있어요. LV.2에서는 공식 확인처·위험·프로젝트 조건이 더 구체적으로 표시됩니다.');
    }else if(pane?.dataset.pane==='how'){
      setText(note,'지금도 수행순서·협업대상·완료기준을 모두 볼 수 있어요. LV.3에서는 전체 체크리스트·분야별 조정·예외조건이 더 구체적으로 표시됩니다.');
    }
  });
}

function patchContext(){
  const root=$('contextResult');
  if(!root||!root.innerHTML.trim())return;
  const map=root.querySelector('.map');
  const brief=map?.querySelector(':scope>.cc252-context-brief');
  const actions=map?.querySelector(':scope>.actions');
  if(!map||!brief||!actions)return;
  const level=currentLevel();
  const key=[level,clean($('task')?.value),clean($('phase')?.value),clean(root.querySelector('.stage-banner')?.textContent)].join('|');
  unlockInformationAreas(root);
  normalizeActionShell(actions);
  normalizeCopy(root,level);
  let guide=map.querySelector(':scope>.cc254-depth-guide');
  if(!guide||guide.dataset.cc254Key!==key){
    const next=depthGuide(level);
    next.dataset.cc254Key=key;
    guide?.remove();
    brief.after(next);
  }
  root.dataset.cc254Depth=String(level);
}

function install(){

  window.CC_RUNTIME.registerContext('depth',patchContext);
}
window.CC_LEVEL_DEPTH={version:VERSION,depths:DEPTHS.map(item=>({...item})),openAreas:[...OPEN_AREAS]};

window.CC_BOOT.register('v252_level_depth_progression',install);
})();
