(()=>{
'use strict';
const VERSION='2.1.12';
function install(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  const card=document.querySelector('.cc-ask-card');
  if(!card)return;
  const title=card.querySelector('.cc-ask-title');
  if(title) title.innerHTML='무엇이든 물어보세요, <b>척척</b>이 도와드릴게요!';
  const input=card.querySelector('#homeSearch');
  if(input) input.placeholder='예) 책임님께 업무를 요청받았어요. 어떻게 진행하면 좋을까요?';
  const qs=[...card.querySelectorAll('.cc-popular-questions button')];
  const labels=['# 법규 검토는 어떻게 하나요?','# QGIS 활용 방법이 궁금합니다.','# 지번 확인은 어디서 하나요?'];
  qs.forEach((q,i)=>{if(labels[i])q.textContent=labels[i]});
  const fig=card.querySelector('.cc-helper-figure');
  if(fig){
    fig.innerHTML='';
    fig.style.backgroundImage='url("./mascot_v2112.svg?v=2112")';
    fig.style.backgroundRepeat='no-repeat';
    fig.style.backgroundPosition='right bottom';
    fig.style.backgroundSize='contain';
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();