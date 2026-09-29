(()=>{
'use strict';
const VERSION='2.1.15';

function fixedPhaseIndex(flow,phase){
  // A coarse project flow can omit design stages. Never invent an anchor by
  // falling back to a site/permit node or a fixed array position.
  const patterns={
    '사전기획 / 사업검토':/사전기획|사업(?:조건|성격|방식)|사업[·ㆍ\s/]*운영조건|대지조건|발주주체/,
    '기본계획':/기본계획|기본[·ㆍ\s/-]*(?:계획)?설계/,
    '계획설계':/계획설계/,
    '중간설계':/중간[·ㆍ\s/-]*(?:실시)?설계/,
    '실시설계':/실시설계/,
    '시공·현장 대응':/착공|공사|시공|시운전/
  };
  if(!Array.isArray(flow)||!Object.hasOwn(patterns,phase))return -1;
  return flow.findIndex(label=>patterns[phase].test(label));
}

// v2_core.js declares phaseIndex globally; replace it after core loads.
window.phaseIndex=fixedPhaseIndex;

function install(){
  
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
  if(fig) fig.remove();
}
window.CC_BOOT.register('v219_ask_mascot',install);
})();
