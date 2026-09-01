(()=>{
'use strict';
const VERSION='2.1.36';
function install(){document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
