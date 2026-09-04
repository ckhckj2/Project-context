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
  const match=clean($('miniLevel')?.textContent).match(/LV\.(\d)/i);
  return Math.min(4,Math.max(1,match?Number(match[1]):1));
}

function bindOpenDrawer(button,pane){
  if(!button||!pane||button.dataset.cc254Unlocked==='1')return button;
  const clone=button.cloneNode(true);
  clone.classList.remove('locked');
  clone.disabled=false;
  clone.removeAttribute('disabled');
  clone.removeAttribute('aria-disabled');
  clone.dataset.cc254Unlocked='1';
  button.replaceWith(clone);
  clone.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    const root=$('contextResult');
    const open=!pane.classList.contains('show');
    root?.querySelectorAll('.drawer.show').forEach(item=>{if(item!==pane)item.classList.remove('show')});
    root?.querySelectorAll('.actions [data-drawer]').forEach(item=>{
      if(item!==clone){item.classList.remove('cc-drawer-active');item.setAttribute('aria-expanded','false')}
    });
    pane.classList.toggle('show',open);
    clone.classList.toggle('cc-drawer-active',open);
    clone.setAttribute('aria-expanded',String(open));
  });
  return clone;
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
  if(!root||!root.innerHTML.trim()){if(root?.classList.contains('cc256-building'))schedule(40);return}
  if(revealAt&&Date.now()<revealAt){schedule(Math.max(20,revealAt-Date.now()));return}
  const map=root.querySelector('.map');
  const brief=map?.querySelector(':scope>.cc252-context-brief');
  const actions=map?.querySelector(':scope>.actions');
  if(!map||!brief||!actions){if(root.classList.contains('cc256-building'))schedule(40);return}
  const level=currentLevel();
  const key=[level,clean($('task')?.value),clean($('phase')?.value),clean(root.querySelector('.stage-banner')?.textContent)].join('|');
  unlockInformationAreas(root);
  normalizeCopy(root,level);
  let guide=map.querySelector(':scope>.cc254-depth-guide');
  if(!guide||guide.dataset.cc254Key!==key){
    const next=depthGuide(level);
    next.dataset.cc254Key=key;
    guide?.remove();
    brief.after(next);
  }
  root.dataset.cc254Depth=String(level);
  const contextLevel=Number((root.dataset.cc252Key||'').split('|')[2]);
  const howButton=actions.querySelector('[data-drawer="how"]');
  const howPane=map.querySelector('[data-pane="how"]');
  const howReady=level>=3
    ? !!(howButton&&howPane&&!howPane.querySelector('.cc232-how-lock'))
    : !!(howButton?.dataset.cc252Unlocked&&howPane?.querySelector('.cc252-pane-head'));
  if(root.classList.contains('cc256-building')&&(!howReady||contextLevel!==level)){
    schedule(40);
    return;
  }
  finishAtomic(root);
}

let revealAt=0;
let failsafeTimer=null;
function beginAtomic(){
  const root=$('contextResult');
  revealAt=Date.now()+260;
  if(!root)return;
  root.classList.remove('cc256-ready');
  root.classList.add('cc256-building');
  root.setAttribute('aria-busy','true');
  delete root.dataset.cc246Phase;
  delete root.dataset.cc252Key;
  delete root.dataset.cc254Depth;
  clearTimeout(failsafeTimer);
  failsafeTimer=setTimeout(()=>{
    if(root.classList.contains('cc256-building')){
      patchContext();
      setTimeout(()=>finishAtomic(root),80);
    }
  },850);
}

function finishAtomic(root){
  if(!root?.classList.contains('cc256-building'))return;
  clearTimeout(failsafeTimer);
  root.classList.remove('cc256-building');
  root.classList.add('cc256-ready');
  root.setAttribute('aria-busy','false');
  setTimeout(()=>root.classList.remove('cc256-ready'),220);
}

function installStyle(){
  if($('cc254Style'))return;
  const style=document.createElement('style');
  style.id='cc254Style';
  style.textContent=`
  /* v2.1.56 — atomic context reveal; every area open; level changes depth */
  #contextResult .actions [data-drawer],#contextResult .actions [data-ask-context]{opacity:1!important;filter:none!important;pointer-events:auto!important}
  #contextResult.cc256-building{position:relative;min-height:250px;overflow:hidden}
  #contextResult.cc256-building>*{visibility:hidden!important}
  #contextResult.cc256-building:before{content:"";position:absolute;z-index:3;left:50%;top:88px;width:24px;height:24px;margin-left:-12px;border:2px solid #DCE6F4;border-top-color:#3E73C8;border-radius:50%;animation:cc256-spin .7s linear infinite}
  #contextResult.cc256-building:after{content:"업무 맥락을 정리하고 있어요";position:absolute;z-index:3;left:0;right:0;top:126px;text-align:center;color:#60738F;font-size:10px;font-weight:850}
  #contextResult.cc256-ready{animation:cc256-reveal .18s ease-out both}
  @keyframes cc256-spin{to{transform:rotate(360deg)}}
  @keyframes cc256-reveal{from{opacity:.35;transform:translateY(3px)}to{opacity:1;transform:none}}
  .cc254-depth-guide{margin:0 0 10px;padding:15px 16px;border:1px solid #D9E3F1;border-radius:15px;background:#fff}
  .cc254-depth-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .cc254-depth-head small{display:block;color:#6E7F97;font-size:8.5px;font-weight:900}
  .cc254-depth-head b{display:block;margin-top:3px;color:#203F69;font-size:14px}
  .cc254-depth-head>span{padding:5px 8px;border-radius:999px;background:#EAF4ED;color:#39724B;font-size:8px;font-weight:950}
  .cc254-depth-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:12px}
  .cc254-depth-track>div{display:grid;grid-template-columns:23px 1fr;gap:7px;align-items:start;padding:9px;border:1px solid #E5EAF1;border-radius:10px;background:#FAFBFD}
  .cc254-depth-track i{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#EDF1F6;color:#77869B;font-size:8px;font-style:normal;font-weight:950}
  .cc254-depth-track b,.cc254-depth-track small{display:block}
  .cc254-depth-track b{color:#5D6D82;font-size:8.5px;line-height:1.35}
  .cc254-depth-track small{margin-top:3px;color:#99A3B1;font-size:7.5px;line-height:1.4}
  .cc254-depth-track .is-current{border-color:#AFC8EF;background:#F0F6FF;box-shadow:inset 0 0 0 1px #D8E6FA}
  .cc254-depth-track .is-current i{background:#2F6FD1;color:#fff}
  .cc254-depth-track .is-current b{color:#244F8D}
  .cc254-depth-track .is-passed{background:#F5F8FC}
  .cc254-depth-track .is-passed i{background:#DAE7F8;color:#3665A6}
  .cc254-depth-guide>p{margin:10px 1px 0;color:#718095;font-size:8.5px;line-height:1.55}
  .cc252-pane-head small{color:#4569A8!important}
  .cc252-level-note{color:#61738D!important;background:#F8FAFD!important}
  @media(max-width:760px){
    .cc254-depth-track{grid-template-columns:repeat(2,minmax(0,1fr))}
    .cc254-depth-head{align-items:flex-start}
  }
  @media(max-width:420px){
    .cc254-depth-track{grid-template-columns:1fr 1fr}
    .cc254-depth-track small{display:none}
  }
  @media(prefers-reduced-motion:reduce){#contextResult.cc256-building:before{animation:none}#contextResult.cc256-ready{animation:none}}
  `;
  document.head.append(style);
}

let timer=null;
function schedule(delay=40){clearTimeout(timer);timer=setTimeout(patchContext,delay)}

function install(){
  installStyle();
  const context=$('contextResult');
  if(context)new MutationObserver(()=>schedule(40)).observe(context,{childList:true,subtree:true});
  document.addEventListener('click',event=>{
    if(event.target.closest('#analyze,.master-levels button')){beginAtomic();schedule(270)}
  },true);
  if(context?.innerHTML.trim())schedule(230);
  const markVersion=()=>document.querySelectorAll('.version').forEach(node=>node.textContent='v'+VERSION);
  markVersion();setTimeout(markVersion,40);
  document.documentElement.dataset.uiVersion=VERSION;
}

window.CC_LEVEL_DEPTH={version:VERSION,depths:DEPTHS.map(item=>({...item})),openAreas:[...OPEN_AREAS]};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
