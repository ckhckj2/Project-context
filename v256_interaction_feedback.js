(()=>{
'use strict';

const VERSION='2.1.62';
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
  const phase=clean($('phase')?.selectedOptions?.[0]?.textContent);
  root.querySelectorAll('.flow .node,.cc252-context-flow .node').forEach(node=>{
    const current=Boolean(phase&&phase!=='잘 모르겠습니다'&&clean(node.textContent).includes(phase));
    if(node.classList.contains('cc260-current-phase')!==current)node.classList.toggle('cc260-current-phase',current);
  });

  const task=clean($('task')?.selectedOptions?.[0]?.textContent||$('task')?.value);
  if(/변경/.test(task)&&!root.querySelector('.cc260-change-strip')){
    const anchor=root.querySelector('.cc252-context-brief,.brief,.stage-banner');
    anchor?.insertAdjacentElement('afterend',changeStrip());
  }
  const first=root.querySelector('.cc252-brief-grid>div:first-child,.cc252-how-sequence>div:first-child');
  if(first&&!first.classList.contains('cc260-first-action'))first.classList.add('cc260-first-action');
}

function decorateSearch(){
  const root=$('searchResult');
  if(!root)return;
  const card=root.querySelector('.cc243-card');
  if(card&&!card.querySelector('.cc260-change-strip')){
    const anchor=card.querySelector('.cc243-summary,.cc243-tag');
    anchor?.insertAdjacentElement('afterend',changeStrip());
  }
  const first=root.querySelector('.cc252-action-grid>div:first-child,.cc243-steps>div:first-of-type,.cc241-steps>div:first-child');
  if(first&&!first.classList.contains('cc260-first-action'))first.classList.add('cc260-first-action');
}

function updateQuiz(){
  const area=$('quizArea');
  const count=$('qCount');
  if(area&&count){
    const nums=clean(count.textContent).match(/(\d+)\D+(\d+)/);
    if(nums){
      const value=Math.max(0,Math.min(100,Number(nums[1])/Number(nums[2])*100));
      const next=`${value}%`;
      if(area.style.getPropertyValue('--cc260-quiz-progress')!==next)area.style.setProperty('--cc260-quiz-progress',next);
      if(!area.classList.contains('cc260-quiz-active'))area.classList.add('cc260-quiz-active');
    }
  }
  const feedback=$('qFeedback');
  if(feedback){
    const text=clean(feedback.textContent);
    const on=Boolean(text),good=feedback.dataset.quizCorrect!==undefined?feedback.dataset.quizCorrect==='true':/정답|맞았|축하|통과/.test(text)&&!/오답|아니/.test(text);
    if(feedback.classList.contains('cc260-feedback-on')!==on)feedback.classList.toggle('cc260-feedback-on',on);
    if(feedback.classList.contains('cc260-feedback-good')!==good)feedback.classList.toggle('cc260-feedback-good',good);
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
  if(meter.dataset.cc260Percent===String(percent))return;
  meter.dataset.cc260Percent=String(percent);
  meter.style.setProperty('--cc260-project-progress',`${percent}%`);
  meter.innerHTML=`<span><b>등록 정보 ${percent}%</b><small>${complete<3?'필수 정보부터 입력하세요':'필수 정보 입력 완료'}</small></span><i></i>`;
}

function refresh(){updateQuiz();updateProjectProgress()}

function install(){

  window.CC_RUNTIME.registerContext('feedback',decorateContext);
  window.CC_RUNTIME.registerResult('feedback',decorateSearch);
  document.addEventListener('cc:project-editor-rendered',updateProjectProgress);
  document.addEventListener('cc:projects-rendered',updateProjectProgress);
  document.addEventListener('input',event=>{if(event.target.closest('#cc230Editor'))updateProjectProgress()});
  document.addEventListener('change',event=>{if(event.target.closest('#cc230Editor'))updateProjectProgress()});
  refresh(0);
}
window.CC_INTERACTION_FEEDBACK={version:VERSION,refresh,decorateContext,decorateSearch};
window.CC_BOOT.register('v256_interaction_feedback',install);
})();
