(()=>{
'use strict';
const VERSION='2.1.7';
function install(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  const flow=document.querySelector('.cc-flow-line');
  if(flow){
    const labels=['정보 수집','기획·계획','설계','도서 작성','인허가','시공·감리','준공·유지관리'];
    [...flow.querySelectorAll(':scope>div>b')].forEach((b,i)=>{if(labels[i])b.textContent=labels[i]});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
