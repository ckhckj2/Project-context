(()=>{
const frame=document.getElementById('app');
if(!frame)return;
const VERSION='1.5.8';
function install(attempt=0){
  const d=frame.contentDocument;
  if(!d||!d.body||!d.getElementById('masterOverlay')){if(attempt<30)setTimeout(()=>install(attempt+1),100);return;}
  if(d.body.dataset.pc158)return;d.body.dataset.pc158='1';
  const st=d.createElement('style');st.id='pc158MasterFix';st.textContent=`
    #masterOverlay.pc157-show:not(.show){display:none!important;pointer-events:none!important;visibility:hidden!important}
    #masterOverlay.show.pc157-show{display:flex!important;pointer-events:auto!important;visibility:visible!important}
  `;d.head.appendChild(st);
  const ov=d.getElementById('masterOverlay');
  const close=d.getElementById('closeMaster');
  function closeOverlay(){
    ov.classList.remove('show');
    d.querySelector('.pc157-confetti')?.remove();
  }
  close?.addEventListener('click',()=>setTimeout(closeOverlay,0),true);
  ov.addEventListener('click',e=>{if(e.target===ov)closeOverlay();});
  if(!ov.classList.contains('show'))closeOverlay();
  d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>x.textContent='v'+VERSION);
  setInterval(()=>{d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>{if(x.textContent!=='v'+VERSION)x.textContent='v'+VERSION;});},700);
}
frame.addEventListener('load',()=>install());
if(frame.contentDocument?.readyState==='complete')install();
})();