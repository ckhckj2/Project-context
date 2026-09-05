(()=>{
'use strict';
const VERSION='2.1.8';
const ICONS=[
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.2" cy="10.2" r="5.7"/><path d="m14.5 14.5 4.7 4.7"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.2"/><path d="M7.5 3.8v3.5M16.5 3.8v3.5M4 9.2h16M7.5 12.4h3M13.5 12.4h3M7.5 16h3"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><path d="M10.8 6.2 6.5 18.8M13.2 6.2l4.3 12.6M8.1 14.2h7.8M5.3 19h13.4"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4M9 11.2h6M9 14.5h6M9 17.8h4.2"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.2 12 4l8.5 5.2M4.5 10.5h15M6.2 10.5v7M10.1 10.5v7M13.9 10.5v7M17.8 10.5v7M4.2 19.3h15.6"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13h14M6.5 11.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 5.5 5.5M9 6.8V10M15 6.8V10M4.5 13v3.5h15V13"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V5h9v4h5v11M8 8h2M8 11.5h2M8 15h2M13 12h2M13 15h2"/><path d="m14.3 18.2 1.7 1.7 3.5-3.8"/></svg>'
];
function install(){
  
  const flow=document.querySelector('.cc-flow-line');
  if(flow){
    const labels=['정보 수집','기획·계획','설계','도서 작성','인허가','시공·감리','준공·유지관리'];
    const items=[...flow.querySelectorAll(':scope>div')];
    items.forEach((item,i)=>{
      const label=item.querySelector('b');
      const icon=item.querySelector('span');
      if(label&&labels[i]) label.textContent=labels[i];
      if(icon&&ICONS[i]) icon.innerHTML=ICONS[i];
    });
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
