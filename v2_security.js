(()=>{
'use strict';

const VERSION='1.1.0';
const INPUT_LIMITS={searchInput:500,homeSearch:500,meta:500,qInput:200,cc230Name:60,cc230Location:80,cc230Scale:100,cc230Memo:500};

function safeText(value,max=500){
  return String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').slice(0,max);
}

function safeJson(value,fallback=null){
  try{return JSON.parse(value)}catch{return fallback}
}

function safeExternalUrl(value){
  try{
    const url=new URL(value,location.href);
    return url.protocol==='https:'&&!url.username&&!url.password?url:null;
  }catch{return null}
}

function hardenLink(anchor){
  if(!anchor)return;
  if(anchor.target==='_blank'){
    anchor.rel='noopener noreferrer';
    anchor.referrerPolicy='no-referrer';
  }
  anchor.dataset.ccSecurity='1';
}

function applyInputLimits(root=document){
  Object.entries(INPUT_LIMITS).forEach(([id,max])=>{
    const input=root.getElementById?.(id)||root.querySelector?.(`#${id}`);
    if(input&&(input.maxLength<0||input.maxLength>max))input.maxLength=max;
  });
}

function protectNavigation(event){
  const anchor=event.target.closest?.('a[href]');
  if(!anchor)return;
  hardenLink(anchor);
  if(!safeExternalUrl(anchor.getAttribute('href'))){
    event.preventDefault();
    console.warn('척척 보안: 허용되지 않은 외부 링크를 차단했습니다.');
  }
}

function install(){
  document.querySelectorAll('a').forEach(hardenLink);
  applyInputLimits();
  document.addEventListener('click',protectNavigation,true);
  document.addEventListener('auxclick',protectNavigation,true);
  document.addEventListener('focusin',event=>{
    if(event.target.matches?.('input,textarea'))applyInputLimits(document);
  },true);
  document.addEventListener('securitypolicyviolation',event=>{
    console.warn('척척 CSP 차단:',event.violatedDirective);
  });
  document.documentElement.dataset.securityVersion=VERSION;
}

window.CC_SECURITY=Object.freeze({version:VERSION,safeText,safeJson,safeExternalUrl});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
