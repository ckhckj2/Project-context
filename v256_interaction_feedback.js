(()=>{
'use strict';

const VERSION='2.1.60';
const $=id=>document.getElementById(id);
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();

function changeStrip(){
  const wrap=document.createElement('div');
  wrap.className='cc260-change-strip';
  wrap.setAttribute('aria-label','변경업무 판단 흐름');
  ['기존 승인','변경 내용','영향 범위','처리 절차'].forEach((label,index)=>{
    const item=document.createElement('div');
    item.innerHTML=`<i>${index+1}</i><b>${label}</b>`;
    wrap.append(item);
  });
  return wrap;
}

function decorateContext(){
  const root=$('contextResult');
  if(!root||!root.innerHTML.trim())return;
  const actions=root.querySelector('.actions.cc252-actions');
  actions?.querySelectorAll('[data-drawer]').forEach(button=>{
    if(button.querySelector('.cc260-chevron'))return;
    const arrow=document.createElement('span');
    arrow.className='cc260-chevron';
    arrow.setAttribute('aria-hidden','true');
    button.append(arrow);
  });

  const phase=clean($('phase')?.selectedOptions?.[0]?.textContent);
  root.querySelectorAll('.flow .node,.cc252-context-flow .node').forEach(node=>{
    node.classList.toggle('cc260-current-phase',Boolean(phase&&phase!=='잘 모르겠습니다'&&clean(node.textContent).includes(phase)));
  });

  const task=clean($('task')?.selectedOptions?.[0]?.textContent||$('task')?.value);
  if(/변경/.test(task)&&!root.querySelector('.cc260-change-strip')){
    const anchor=root.querySelector('.cc252-context-brief,.brief,.stage-banner');
    anchor?.insertAdjacentElement('afterend',changeStrip());
  }
  const first=root.querySelector('.cc252-brief-grid>div:first-child,.cc252-how-sequence>div:first-child');
  first?.classList.add('cc260-first-action');
}

function decorateSearch(){
  const root=$('searchResult');
  if(!root)return;
  const card=root.querySelector('.cc243-card');
  if(card&&!card.querySelector('.cc260-change-strip')){
    const anchor=card.querySelector('.cc243-summary,.cc243-tag');
    anchor?.insertAdjacentElement('afterend',changeStrip());
  }
  root.querySelector('.cc252-action-grid>div:first-child,.cc243-steps>div:first-of-type,.cc241-steps>div:first-child')?.classList.add('cc260-first-action');
}

function updateQuiz(){
  const area=$('quizArea');
  const count=$('qCount');
  if(area&&count){
    const nums=clean(count.textContent).match(/(\d+)\D+(\d+)/);
    if(nums){
      const value=Math.max(0,Math.min(100,Number(nums[1])/Number(nums[2])*100));
      area.style.setProperty('--cc260-quiz-progress',`${value}%`);
      area.classList.add('cc260-quiz-active');
    }
  }
  const feedback=$('qFeedback');
  if(feedback){
    const text=clean(feedback.textContent);
    feedback.classList.toggle('cc260-feedback-on',Boolean(text));
    feedback.classList.toggle('cc260-feedback-good',/정답|맞았|축하|통과/.test(text)&&!/오답|아니/.test(text));
  }
}

function updateProjectProgress(){
  const editor=$('cc230Editor');
  if(!editor||editor.hidden)return;
  let meter=editor.querySelector('.cc260-project-progress');
  if(!meter){
    meter=document.createElement('div');
    meter.className='cc260-project-progress';
    editor.querySelector('.cc230-editor-head')?.insertAdjacentElement('afterend',meter);
  }
  const required=[$('cc230Name'),$('cc230Type'),$('cc230Phase')];
  const optional=[$('cc230Location'),$('cc230Scale'),$('cc230Memo')];
  const complete=[...required,...optional].filter(input=>clean(input?.value)&&input?.value!=='잘 모르겠습니다').length;
  const percent=Math.round(complete/6*100);
  meter.style.setProperty('--cc260-project-progress',`${percent}%`);
  meter.innerHTML=`<span><b>등록 정보 ${percent}%</b><small>${complete<3?'필수 정보부터 입력하세요':'필수 정보 입력 완료'}</small></span><i></i>`;
}

let timer;
function refresh(delay=30){
  clearTimeout(timer);
  timer=setTimeout(()=>{decorateContext();decorateSearch();updateQuiz();updateProjectProgress();markVersion()},delay);
}

function installStyle(){
  if($('cc260Style'))return;
  const style=document.createElement('style');
  style.id='cc260Style';
  style.textContent=`
  /* v2.1.60 — restrained interaction feedback and visible progress */
  #contextResult .actions.cc252-actions>button{transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease!important}
  #contextResult .actions.cc252-actions>button:hover{transform:translateY(-2px)}
  #contextResult .actions.cc252-actions>button:active{transform:translateY(0) scale(.99)}
  .cc260-chevron{position:absolute;right:10px;bottom:9px;width:7px;height:7px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg);opacity:.65;transition:transform .18s ease}
  #contextResult .actions.cc252-actions>button.cc-drawer-active .cc260-chevron{transform:rotate(225deg);bottom:6px;opacity:1}
  #contextResult .actions.cc252-actions>button.cc-drawer-active:after{content:"열림 ↑"!important}

  .flow .node.cc260-current-phase,.cc252-context-flow .node.cc260-current-phase{position:relative;border-color:#5D8DD8!important;background:#EAF3FF!important;color:#24599F!important;box-shadow:0 0 0 3px rgba(53,111,199,.10)!important}
  .flow .node.cc260-current-phase:after,.cc252-context-flow .node.cc260-current-phase:after{content:"현재";position:absolute;right:-4px;top:-8px;padding:2px 6px;border-radius:999px;background:#356FC7;color:#fff;font-size:8px;font-weight:950}

  .cc260-change-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin:0 0 10px;padding:12px 14px;border:1px solid #DCE5F1;border-radius:14px;background:#F8FAFD}
  .cc260-change-strip>div{position:relative;display:flex;align-items:center;gap:8px;min-width:0;color:#526985}
  .cc260-change-strip>div:not(:last-child):after{content:"";position:absolute;right:-13px;width:8px;height:8px;border-top:1.5px solid #8EA4C0;border-right:1.5px solid #8EA4C0;transform:rotate(45deg)}
  .cc260-change-strip i{display:grid;place-items:center;flex:0 0 23px;width:23px;height:23px;border-radius:50%;background:#E2ECFA;color:#3567AD;font-size:9px;font-style:normal;font-weight:950}
  .cc260-change-strip b{font-size:10.5px;line-height:1.35}

  .cc260-first-action{position:relative;border-color:#AFC9ED!important;background:#F3F8FF!important;box-shadow:inset 3px 0 0 #4B7CC7!important}
  .cc260-first-action:after{content:"먼저";position:absolute;right:8px;top:8px;padding:2px 6px;border-radius:999px;background:#DCEAFF;color:#3463A9;font-size:8px;font-weight:950}
  .cc258-comparison-answer .cc258-compare-side{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
  .cc258-comparison-answer .cc258-compare-side:hover{z-index:1;transform:translateY(-2px);border-color:#9EBBE5!important;box-shadow:0 8px 18px rgba(39,79,139,.10)}

  #quizArea.cc260-quiz-active:before{content:"";display:block;width:var(--cc260-quiz-progress,0);height:4px;margin:0 0 10px;border-radius:999px;background:#4B78CF;transition:width .22s ease}
  #qFeedback.cc260-feedback-on{animation:cc260-feedback-in .2s ease-out both}
  #qFeedback.cc260-feedback-good{border-color:#B7DDBF!important;background:#F1FAF3!important;color:#326943!important}
  @keyframes cc260-feedback-in{from{opacity:.3;transform:translateY(4px)}to{opacity:1;transform:none}}

  .cc260-project-progress{display:grid;grid-template-columns:1fr 160px;align-items:center;gap:14px;margin:-3px 0 14px;padding:9px 11px;border-radius:11px;background:#F5F8FD}
  .cc260-project-progress span{display:flex;align-items:baseline;gap:7px}.cc260-project-progress b{color:#385B8E;font-size:10px}.cc260-project-progress small{color:#718198;font-size:9px}
  .cc260-project-progress>i{height:6px;border-radius:999px;background:linear-gradient(90deg,#4B78CF var(--cc260-project-progress),#DEE6F0 var(--cc260-project-progress));transition:background .2s ease}

  @media(max-width:700px){
    .cc260-change-strip{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.cc260-change-strip>div:not(:last-child):after{display:none}
    .cc260-project-progress{grid-template-columns:1fr}.cc260-project-progress span{justify-content:space-between}
    #contextResult .actions.cc252-actions>button:hover{transform:none}
  }
  @media(prefers-reduced-motion:reduce){
    #contextResult .actions.cc252-actions>button,.cc260-chevron,.cc258-comparison-answer .cc258-compare-side,#quizArea.cc260-quiz-active:before,.cc260-project-progress>i{transition:none!important}
    #qFeedback.cc260-feedback-on{animation:none!important}
  }
  `;
  document.head.append(style);
}

function markVersion(){
  document.querySelectorAll('.version').forEach(node=>node.textContent='v'+VERSION);
  document.documentElement.dataset.uiVersion=VERSION;
}

function install(){
  installStyle();
  ['contextResult','searchResult','quizArea','cc230Editor'].forEach(id=>{
    const root=$(id);if(root)new MutationObserver(()=>refresh()).observe(root,{childList:true,subtree:true,characterData:true,attributes:true});
  });
  document.addEventListener('click',event=>{
    if(event.target.closest('#analyze,#searchGo,#homeSearchBtn,[data-example],[data-drawer],#startQuiz,#qSubmit,#cc230New,#cc230Save'))refresh(80);
  });
  document.addEventListener('input',event=>{if(event.target.closest('#cc230Editor'))updateProjectProgress()});
  document.addEventListener('change',event=>{if(event.target.closest('#phase,#task,#cc230Editor'))refresh()});
  refresh(0);setTimeout(()=>refresh(0),700);setTimeout(markVersion,1400);
}

window.CC_INTERACTION_FEEDBACK={version:VERSION,refresh,decorateContext,decorateSearch};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
