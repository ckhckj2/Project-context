(()=>{
'use strict';
const KEYS=new Set(['pc_progress_level','pc_level','pc_master_certified','pc_master_unlocked','pc_master_preview_level']);
const session=new Map();
let unavailable=false;
function showStatus(){
  if(!unavailable||!document.body)return;
  let status=document.getElementById('cc-level-storage-status');
  if(!status){
    status=document.createElement('p');
    status.id='cc-level-storage-status';
    status.setAttribute('role','status');
    status.className='lead';
    document.getElementById('quizDesc')?.after(status);
  }
  status.textContent='브라우저 저장이 제한되어 레벨 변경은 현재 열린 화면에서만 유지됩니다.';
}
function getItem(key){
  if(!KEYS.has(key))return null;
  if(session.has(key))return session.get(key);
  try{return localStorage.getItem(key);}
  catch{unavailable=true;showStatus();return null;}
}
function setItem(key,value){
  if(!KEYS.has(key))return false;
  const text=String(value);
  if(key.includes('certified')||key.includes('unlocked')){
    if(!['0','1'].includes(text))return false;
  }else if(!/^[1-5]$/.test(text))return false;
  try{localStorage.setItem(key,text);session.delete(key);return true;}
  catch{session.set(key,text);unavailable=true;showStatus();return false;}
}
window.CC_LEVEL_STORE=Object.freeze({getItem,setItem});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showStatus,{once:true});
})();
