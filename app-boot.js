(()=>{
'use strict';
const steps=new Map(),completed=[];
let state='pending',failure='';
function fail(message){state='failed';failure=String(message);document.documentElement.dataset.appState='failed';const status=document.getElementById('appBootMessage');if(status)status.textContent='화면을 준비하지 못했어요. 새로고침해 주세요.';}
window.addEventListener('error',event=>{if(state==='ready')return;fail(event.target?.tagName==='SCRIPT'?'Script load failed':event.message||'Startup failed')},true);
function register(id,install){if(state!=='pending'||steps.has(id))throw new Error('Invalid startup registration: '+id);steps.set(id,install)}
function run(){
 if(state!=='pending')return;
 state='starting';
 try{for(const [id,install]of steps){install();completed.push(id)}if(state==='failed')return;state='ready';document.documentElement.dataset.appState='ready';}
 catch(error){fail(error.message);console.error('척척 초기화 실패',error)}
}
function start(){if(state==='failed'){fail(failure);return}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run()}
window.CC_BOOT=Object.freeze({register,start,diagnostics:()=>({state,failure,completed:completed.slice()})});
})();
