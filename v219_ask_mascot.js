(()=>{
'use strict';
const VERSION='2.1.15';

function fixedPhaseIndex(flow,phase){
  if(!phase||phase==='잘 모르겠습니다')return -1;
  const find=(re)=>flow.findIndex(x=>re.test(x));

  // Design-stage anchor: prefer an actual planning/design node, not site/permit keywords.
  let design=-1;
  const designRe=/(기본[·ㆍ\s/-]*계획설계|계획설계|배치|동선|공간\s*계획|설비\s*계획|방재\s*계획|계획)/;
  for(let i=0;i<flow.length;i++){
    const x=flow[i];
    if(designRe.test(x)&&!/(실시계획|사업계획승인|허가|승인|공사|착공|시공|사용|준공)/.test(x)){
      design=i;
      break;
    }
  }
  // Projects whose big-picture flow omits an explicit design node still need a stable context position.
  if(design<0){
    const permit=find(/건축허가|건축인허가|인허가|시행허가|허가|승인|심의/);
    design=permit>0?Math.max(0,permit-1):Math.min(2,flow.length-1);
  }

  const middle=find(/중간[·ㆍ\s/-]*실시설계|중간설계/);
  // Important: '실시계획' is an approval-plan term, not '실시설계'.
  const detail=find(/중간[·ㆍ\s/-]*실시설계|실시설계/);
  const construction=find(/착공|공사|시공|시운전/);

  if(phase==='사전기획 / 사업검토')return 0;
  if(phase==='기본계획'||phase==='계획설계')return design;
  if(phase==='중간설계')return middle>=0?middle:(detail>=0?detail:design);
  if(phase==='실시설계')return detail>=0?detail:design;
  if(phase==='시공·현장 대응')return construction>=0?construction:Math.max(0,flow.length-1);
  return -1;
}

// v2_core.js declares phaseIndex globally; replace it after core loads.
window.phaseIndex=fixedPhaseIndex;

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
  if(fig) fig.remove();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();