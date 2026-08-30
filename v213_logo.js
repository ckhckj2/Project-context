(()=>{
'use strict';
const VERSION='2.1.4';
function install(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  document.querySelectorAll('.cc-logo').forEach(logo=>logo.setAttribute('aria-label','척척 — 건축 실무, 물으면 척척'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
