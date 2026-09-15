(()=>{
'use strict';
const VERSION='2.1.4';
function install(){
  
  document.querySelectorAll('.cc-logo').forEach(logo=>logo.setAttribute('aria-label','척척 — 건축 실무, 물으면 척척'));
}
window.CC_BOOT.register('v213_logo',install);
})();
