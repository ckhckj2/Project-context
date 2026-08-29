(()=>{
const frame=document.getElementById('app');
if(!frame)return;
const VERSION='1.5.9';
function install(attempt=0){
  const d=frame.contentDocument;
  if(!d||!d.body||!d.getElementById('masterOverlay')){if(attempt<30)setTimeout(()=>install(attempt+1),100);return;}
  if(d.body.dataset.pc159)return;
  d.body.dataset.pc159='1';
  const st=d.createElement('style');
  st.id='pc159MasterGateStyle';
  st.textContent=`
    #masterOverlay{display:none!important;pointer-events:none!important;visibility:hidden!important}
    body.pc159-master-overlay-open #masterOverlay.show{display:flex!important;pointer-events:auto!important;visibility:visible!important}
  `;
  d.head.appendChild(st);
  const ov=d.getElementById('masterOverlay');
  const close=d.getElementById('closeMaster');
  let syncing=false;
  function level(){return Number(d.defaultView.localStorage.getItem('pc_level')||1);}
  function sync(){
    if(syncing)return;syncing=true;
    const lv=level();
    if(lv!==5){
      ov.classList.remove('show','pc157-show');
      d.body.classList.remove('pc159-master-overlay-open');
      d.querySelector('.pc157-confetti')?.remove();
    }else{
      d.body.classList.toggle('pc159-master-overlay-open',ov.classList.contains('show'));
    }
    syncing=false;
  }
  function closeOverlay(e){
    if(e){e.preventDefault();e.stopPropagation();}
    ov.classList.remove('show');
    d.body.classList.remove('pc159-master-overlay-open');
    d.querySelector('.pc157-confetti')?.remove();
  }
  close?.addEventListener('click',closeOverlay,true);
  ov.addEventListener('click',e=>{if(e.target===ov)closeOverlay(e);},true);
  new MutationObserver(sync).observe(ov,{attributes:true,attributeFilter:['class']});
  window.addEventListener('storage',sync);
  sync();
  d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>x.textContent='v'+VERSION);
  setInterval(()=>{sync();d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>{if(x.textContent!=='v'+VERSION)x.textContent='v'+VERSION;});},500);
}
frame.addEventListener('load',()=>install());
if(frame.contentDocument?.readyState==='complete')install();
})();