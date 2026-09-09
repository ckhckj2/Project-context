(()=>{
'use strict';
const $=id=>document.getElementById(id),engine=window.CC_QUIZ_ENGINE;
let installed=false,session=null,viewAtStart=null,choice=null,completed=false;
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function button(text,handler,className){const el=node('button',text,className);el.type='button';el.addEventListener('click',handler);return el;}
function refreshLearningViews(){updateMasterUI();renderLevel();if($('contextResult').children.length)analyze(false);window.CC_RUNTIME.refreshSearchForLevel();}
function reset(){session=null;choice=null;completed=false;$('quizArea').classList.remove('show');$('quizReturn')?.remove();}
function overview(){
 install();const lv=viewLevel();
 if(session&&viewAtStart!==lv)reset();
 $('quizRank').textContent=(lv===5?'LV.MAX':'LV.'+lv)+' · '+LEVELS[lv].name;
 $('quizDesc').textContent=certified()?'마스터 연습 모드 · 보기 레벨에 맞춰 복습하며 실제 승급 기록은 바뀌지 않습니다.':lv===4?'수석 판단 문제를 연습한 뒤 최종 마스터 도전에 도전하세요.':'5문항 중 4문항 정답이면 승급합니다. 오답은 해설과 관련 학습으로 복습하세요.';
 $('startQuiz').textContent=lv>=4?'수석 연습 5문항 →':'퀴즈 5문항 시작 →';
 $('quizMasterChallenge').hidden=lv<4;$('quizMasterChallenge').textContent=certified()?'마스터 종합 복습 8문항 →':'최종 마스터 도전 8문항 →';
 $('quizBankInfo').textContent='레벨별 16문항 · 총 64문항. 매 도전에서 주제를 골고루 출제하며 선택지 순서도 바뀝니다. 첫 제출만 채점하고, 오답 후에도 다음 문제로 진행할 수 있어요.';
 $('quizPath').replaceChildren(...[1,2,3,4].map(n=>{const card=node('div',undefined,'level-step'+(n===lv?' on':''));card.append(node('b','LV.'+n+' · '+LEVELS[n].name),node('span',['','WHAT · 쉬운 개념','WHY / WHERE · 이유와 확인처','HOW · 수행 순서와 협업','JUDGEMENT · 조건과 판단'][n]));return card;}));
}
function start(mode='level'){
 const lv=Math.min(4,viewLevel());if(mode==='master'&&lv<4)return;
 session=engine.create({level:mode==='master'?4:lv,mode,practice:certified()});viewAtStart=viewLevel();completed=false;
 $('quizReturn')?.remove();$('quizArea').classList.add('show');renderQuestion();
}
function renderQuestion(){
 const state=session.view(),q=state.question;choice=null;
 $('qCount').textContent='QUESTION '+String(state.index+1).padStart(2,'0')+' / '+String(state.total).padStart(2,'0');
 $('qDifficulty').textContent='LV.'+q.level+' · '+['','쉬운 개념','이유·확인처','수행·협업','상황 판단'][q.level];
 $('qScore').textContent=state.score+' / '+state.total+' 정답';$('qText').textContent=q.prompt;
 $('qFeedback').replaceChildren();$('qFeedback').className='feedback';$('qFeedback').removeAttribute('data-quiz-correct');
 $('qInput').value='';$('qInput').hidden=q.type!=='short';$('qInput').disabled=false;
 $('quizChoices').replaceChildren();$('quizChoices').hidden=q.type!=='choice';
 for(const option of q.options||[]){const label=node('label',undefined,'quiz-option'),radio=document.createElement('input');radio.type='radio';radio.name='quizAnswer';radio.value=option.id;radio.addEventListener('change',()=>{choice=option.id;});label.append(radio,node('span',option.text));$('quizChoices').append(label);}
 $('qSubmit').disabled=false;$('qSubmit').textContent='정답 확인';$('quizSkip').hidden=false;
 $('quizProgress').style.width=(state.index/state.total*100)+'%';
 $('qText').focus();
}
function correctText(q){return q.type==='short'?q.answer:q.options.find(x=>x.id===q.answer).text;}
function learn(question,container){
 if(question.learn.kind==='drawings'){
  const stage=window.CC_STAGE_DRAWING_GUIDE?.stages[question.learn.stage];if(!stage)return;
  const details=node('details',undefined,'quiz-lesson');details.append(node('summary',stage.label+' 도면 가이드 · 관련 학습'));
  details.append(node('p','실제 납품목록은 회사·계약·제출 목적에 따라 달라집니다.'));
  for(const group of stage.groups){details.append(node('h4',group.title));const list=node('ul');for(const item of group.items)list.append(node('li',item));details.append(list);}container.append(details);return;
 }
 container.append(button('관련 학습 보기 →',()=>{
  window.CC_RUNTIME.go(question.learn.query);
  $('quizReturn')?.remove();const back=button('← 풀던 퀴즈로 돌아가기',()=>showView('quiz'),'quiz-return');back.id='quizReturn';$('searchResult').before(back);
 }));
}
function submit(response){
 if(!session||completed)return;
 const state=session.view();
 if(state.phase==='feedback'){session.next();if(session.view().phase==='finished')finish();else renderQuestion();return;}
 if(state.phase!=='answer')return;
 const result=session.answer(response===undefined?(state.question.type==='short'?$('qInput').value:choice):response);
 if(!result.accepted){$('qFeedback').className='feedback show no';$('qFeedback').textContent=state.question.type==='short'?'답을 입력하거나 모르겠어요를 눌러주세요.':'답을 선택하거나 모르겠어요를 눌러주세요.';return;}
 const feedback=$('qFeedback');feedback.className='feedback show '+(result.correct?'ok':'no');feedback.dataset.quizCorrect=String(result.correct);feedback.replaceChildren(node('b',(result.correct?'정답 · ':'오답 · 정답은 ')+correctText(state.question)),node('p',state.question.explanation));learn(state.question,feedback);
 $('qInput').disabled=true;$('quizChoices').querySelectorAll('input').forEach(input=>{input.disabled=true;});
 $('qScore').textContent=session.view().score+' / '+state.total+' 정답';$('qSubmit').textContent=state.index===state.total-1?'결과 보기 →':'다음 문제 →';$('quizSkip').hidden=true;
 $('quizProgress').style.width=((state.index+1)/state.total*100)+'%';
}
function finish(){
 if(completed)return;completed=true;const result=session.result(),next=engine.promotion(result,actualLevel(),certified());
 const summary=node('div',undefined,'quiz-result');summary.append(node('h3',result.score+' / '+result.total+' 정답'),node('p',result.passed?'통과 기준을 충족했어요.':'해설을 복습한 뒤 다시 도전해보세요.'));
 if(next){setActualLevel(next);if(next===5){window.CC_LEVEL_STORE.setItem('pc_master_certified','1');window.CC_LEVEL_STORE.setItem('pc_master_preview_level','5');}viewAtStart=viewLevel();refreshLearningViews();summary.append(node('p',next===5?'건축 마스터 승급 완료!':'LV.'+next+' · '+LEVELS[next].name+' 승급 완료!'));}
 else summary.append(node('p',result.practice?'연습 결과입니다. 실제 승급 기록은 유지됩니다.':result.level===4&&result.mode==='level'?'마스터 승급은 종합 도전 8문항 중 7문항 정답으로 완료합니다.':'통과 기준: '+result.total+'문항 중 '+result.threshold+'문항 정답'));
 const wrong=result.responses.filter(r=>!r.correct);
 if(wrong.length){const review=node('details',undefined,'quiz-lesson');review.append(node('summary','틀린 문제 복습 · '+wrong.length+'개'));for(const response of wrong){const q=window.CC_QUIZ_BANK.find(x=>x.id===response.id),item=node('section');item.append(node('h4',q.prompt),node('p',q.explanation));learn(q,item);review.append(item);}summary.append(review);}
 summary.append(button(next?'현재 레벨에서 새로 풀기':'다시 도전',()=>start(result.mode==='master'?'master':'level')));
 $('qFeedback').replaceChildren(summary);$('qFeedback').className='feedback show '+(result.passed?'ok':'no');$('qFeedback').dataset.quizCorrect=String(result.passed);$('qText').textContent='이번 도전 결과';$('qInput').hidden=true;$('quizChoices').hidden=true;$('qSubmit').disabled=true;$('quizSkip').hidden=true;overview();if(next===5)showMaster();
}
function unlock(){
 const input=$('quizMasterKey'),status=$('quizMasterKeyStatus');
 if(engine.normalize(input.value)!==engine.normalize(MASTER_KEY)){status.textContent='마스터키를 확인해 주세요.';return;}
 reset();if(!window.CC_LEVEL_STORE.getItem('pc_progress_level'))setActualLevel(actualLevel());window.CC_LEVEL_STORE.setItem('pc_master_certified','1');window.CC_LEVEL_STORE.setItem('pc_master_preview_level','5');input.value='';status.textContent='마스터 미리보기를 열었어요. 기존 승급 기록은 유지됩니다.';refreshLearningViews();overview();showMaster();
}
function install(){
 if(installed)return;installed=true;
 const fieldset=node('fieldset');fieldset.id='quizChoices';fieldset.setAttribute('aria-label','답 선택');$('qInput').before(fieldset);$('qInput').setAttribute('aria-label','단답형 정답');$('qText').tabIndex=-1;$('qFeedback').setAttribute('role','status');
 const skip=button('모르겠어요 · 해설 보기',()=>submit('__skip'));skip.id='quizSkip';$('qSubmit').after(skip);
 const challenge=button('최종 마스터 도전 8문항 →',()=>start('master'),'primary quiz-start');challenge.id='quizMasterChallenge';$('startQuiz').after(challenge);
 const info=node('p',undefined,'lead');info.id='quizBankInfo';$('quizDesc').after(info);
 const tools=node('details',undefined,'quiz-tools');tools.innerHTML='<summary>마스터키 입력 · 테스트용</summary><label>마스터키 <input id="quizMasterKey" type="text" maxlength="80" autocomplete="off"></label><p id="quizMasterKeyStatus" role="status"></p>';tools.append(button('마스터키 적용',unlock));$('quizPath').parentElement.append(tools);
 $('quizMasterKey').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing&&event.keyCode!==229){event.preventDefault();unlock();}});
 $('startQuiz').addEventListener('click',()=>start());$('qSubmit').addEventListener('click',()=>submit());
 $('qInput').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing&&event.keyCode!==229){event.preventDefault();submit();}});
}
window.CC_QUIZ_UI=Object.freeze({overview,start,submit});
})();
