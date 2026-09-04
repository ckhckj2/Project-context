(()=>{
'use strict';

const VERSION='2.1.59';
const $=id=>document.getElementById(id);
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();

const ICONS={
  now:'<path d="M5 4v16M5 5h11l-2.6 4L16 13H5"/>',
  material:'<path d="M3.5 6.5h6l1.7 2H20.5v9.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M3.5 9h17"/>',
  source:'<path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11z"/><circle cx="12" cy="10" r="2"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20v-1.4A5.5 5.5 0 0 1 9 13h0a5.5 5.5 0 0 1 5.5 5.6V20M15 5.5a3 3 0 0 1 0 5.8M16 14a5 5 0 0 1 4.5 5v1"/>',
  steps:'<path d="m4 6 1.5 1.5L8.5 4.5M11 6h9M4 12l1.5 1.5 3-3M11 12h9M4 18l1.5 1.5 3-3M11 18h9"/>',
  caution:'<path d="M10.3 3.6 2.7 18a2 2 0 0 0 1.8 2.9h15a2 2 0 0 0 1.8-2.9L13.7 3.6a2 2 0 0 0-3.4 0z"/><path d="M12 9v5M12 18h.01"/>',
  done:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.7L16.5 9"/>',
  impact:'<path d="M5 4v5a3 3 0 0 0 3 3h8M13 8l4 4-4 4M5 20v-2"/>',
  judgement:'<path d="M12 3v18M6 6h12M4 6 1.8 12h4.4zM20 6l-2.2 6h4.4zM8 21h8"/>',
  context:'<path d="M4 7h12M4 17h12M7 4 4 7l3 3M17 14l3 3-3 3"/>'
};

function classify(label){
  const text=clean(label).toUpperCase();
  if(/완료|DONE/.test(text))return 'done';
  if(/변경.*영향|영향|IMPACT/.test(text))return 'impact';
  if(/판단|예외|결정|JUDG/.test(text))return 'judgement';
  if(/주의|놓치|위험|CAUTION|RISK/.test(text))return 'caution';
  if(/협업|누구|담당|WHO/.test(text))return 'people';
  if(/확인처|어디서|WHERE|공식/.test(text))return 'source';
  if(/자료|기준|원문|CHECK/.test(text))return 'material';
  if(/순서|실행|절차|HOW/.test(text))return 'steps';
  if(/지금|먼저|핵심|START/.test(text))return 'now';
  if(/맥락|CONTEXT|앞뒤/.test(text))return 'context';
  return '';
}

function makeIcon(kind){
  const span=document.createElement('span');
  span.className=`cc259-icon cc259-icon-${kind}`;
  span.setAttribute('aria-hidden','true');
  span.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[kind]}</svg>`;
  return span;
}

function decorateLabels(root){
  if(!root)return;
  const selector=[
    '.cc252-brief-grid>div>small',
    '.cc252-action-grid>div>small',
    '.cc252-pane-grid>div>small',
    '.cc252-how-sequence>div>small',
    '.cc258-compare-first>small'
  ].join(',');
  root.querySelectorAll(selector).forEach(label=>{
    if(label.dataset.cc259Icon)return;
    const kind=classify(label.textContent);
    if(!kind)return;
    label.dataset.cc259Icon=kind;
    label.classList.add('cc259-semantic-label');
    label.parentElement?.classList.add(`cc259-kind-${kind}`);
    label.prepend(makeIcon(kind));
  });
}

function ensureActionA11y(root){
  const actions=root?.querySelector('.map>.actions');
  if(!actions)return;
  actions.querySelectorAll('[data-drawer]').forEach(button=>{
    const key=button.dataset.drawer;
    const pane=root.querySelector(`[data-pane="${key}"]`);
    if(!pane)return;
    pane.id=pane.id||`cc259-pane-${key}`;
    button.type='button';
    button.setAttribute('aria-controls',pane.id);
    if(!button.hasAttribute('aria-expanded'))button.setAttribute('aria-expanded','false');
  });
}

function revealPane(pane){
  requestAnimationFrame(()=>{
    const rect=pane.getBoundingClientRect();
    if(rect.top>window.innerHeight-72||rect.bottom<72){
      const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      pane.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    }
  });
}

function ensurePaneSlot(map,actions){
  let slot=map.querySelector(':scope>.cc259-active-pane-slot');
  if(!slot){
    slot=document.createElement('section');
    slot.className='cc259-active-pane-slot';
    slot.setAttribute('aria-live','polite');
  }
  if(actions.nextElementSibling!==slot)actions.after(slot);
  return slot;
}

function toggleDrawer(button){
  const root=button.closest('#contextResult');
  const map=button.closest('.map');
  const actions=button.closest('.actions');
  const key=button.dataset.drawer;
  const pane=map?.querySelector(`[data-pane="${key}"]`);
  if(!root||!map||!actions||!pane)return;
  const open=!pane.classList.contains('show');
  const slot=ensurePaneSlot(map,actions);

  map.querySelectorAll('.drawer.show').forEach(item=>item.classList.remove('show'));
  map.querySelectorAll('.actions [data-drawer]').forEach(item=>{
    item.classList.remove('cc-drawer-active');
    item.setAttribute('aria-expanded','false');
  });
  if(open){
    slot.querySelectorAll(':scope>.drawer').forEach(item=>map.append(item));
    slot.append(pane);
    pane.classList.add('show','cc259-pane-reveal');
    button.classList.add('cc-drawer-active');
    button.setAttribute('aria-expanded','true');
    revealPane(pane);
  }
}

function installDrawerController(){
  document.addEventListener('click',event=>{
    const button=event.target.closest('#contextResult .actions [data-drawer]');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    toggleDrawer(button);
  },true);
}

function decorate(){
  const context=$('contextResult');
  const result=$('searchResult');
  decorateLabels(context);
  decorateLabels(result);
  ensureActionA11y(context);
}

function installStyle(){
  if($('cc259Style'))return;
  const style=document.createElement('style');
  style.id='cc259Style';
  style.textContent=`
  /* v2.1.59 — semantic pictograms; one reliable context action controller */
  #contextResult .actions.cc252-actions>button{padding-left:48px!important;overflow:hidden}
  #contextResult .actions.cc252-actions>button:before{content:"";position:absolute;left:12px;top:50%;width:25px;height:25px;transform:translateY(-50%);border-radius:8px;background-color:#E8EFF8;background-position:center;background-repeat:no-repeat;background-size:16px;transition:transform .16s ease,background-color .16s ease}
  #contextResult .actions.cc252-actions>button[data-drawer="context"]:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234B6B96' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 7h12M4 17h12M7 4 4 7l3 3M17 14l3 3-3 3'/%3E%3C/svg%3E")}
  #contextResult .actions.cc252-actions>button[data-drawer="how"]:before{background-color:rgba(255,255,255,.17);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 1.5 1.5L8.5 4.5M11 6h9M4 12l1.5 1.5 3-3M11 12h9M4 18l1.5 1.5 3-3M11 18h9'/%3E%3C/svg%3E")}
  #contextResult .actions.cc252-actions>button[data-drawer="why"]:before{background-color:#EAE9FA;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235F59A7' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2M12 17h.01'/%3E%3C/svg%3E")}
  #contextResult .actions.cc252-actions>button[data-ask-context]:before{background-color:#E7F3EC;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233B7855' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='9' cy='8' r='3'/%3E%3Cpath d='M3.5 20v-1.5A5.5 5.5 0 0 1 9 13a5.5 5.5 0 0 1 5.5 5.5V20M15 5.5a3 3 0 0 1 0 5.8M16 14a5 5 0 0 1 4.5 5v1'/%3E%3C/svg%3E")}
  #contextResult .actions.cc252-actions>button[data-drawer="caution"]:before{background-color:#FBF0DA;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23906C2E' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10.3 3.6 2.7 18a2 2 0 0 0 1.8 2.9h15a2 2 0 0 0 1.8-2.9L13.7 3.6a2 2 0 0 0-3.4 0zM12 9v5M12 18h.01'/%3E%3C/svg%3E")}
  #contextResult .actions.cc252-actions>button:hover:before{transform:translateY(-50%) scale(1.07)}
  #contextResult .actions.cc252-actions>button.cc-drawer-active:before{box-shadow:0 0 0 2px rgba(47,111,228,.14)}
  #contextResult .actions.cc252-actions>button[data-drawer="how"]:not(.cc-drawer-active){border-color:#9EBBE8!important;background:#EDF4FF!important;color:#28558F!important;box-shadow:none!important}
  #contextResult .actions.cc252-actions>button[data-drawer="how"]:not(.cc-drawer-active) small{color:#426899!important}
  #contextResult .actions.cc252-actions>button[data-drawer="how"]:not(.cc-drawer-active):before{background-color:#DDEAFF;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233467B1' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 1.5 1.5L8.5 4.5M11 6h9M4 12l1.5 1.5 3-3M11 12h9M4 18l1.5 1.5 3-3M11 18h9'/%3E%3C/svg%3E")}
  #contextResult .actions.cc252-actions>button.cc-drawer-active{border-color:#2F67BC!important;background:#356FC7!important;color:#fff!important;box-shadow:0 6px 14px rgba(42,95,178,.17)!important}
  #contextResult .actions.cc252-actions>button.cc-drawer-active small{color:#E7F0FF!important}
  #contextResult .actions.cc252-actions>button.cc-drawer-active:before{background-color:rgba(255,255,255,.18)}
  #contextResult .actions.cc252-actions+.drawer.show{margin-top:0!important;margin-bottom:9px!important}
  #contextResult .cc259-active-pane-slot{display:block;min-width:0;margin:0 0 9px}
  #contextResult .cc259-active-pane-slot:empty{display:none}
  #contextResult .cc259-active-pane-slot>.drawer{position:relative!important;inset:auto!important;transform:none!important;float:none!important;width:100%!important;max-width:none!important;height:auto!important;max-height:none!important;margin:0!important;visibility:visible!important;opacity:1!important;z-index:auto!important}
  #contextResult .cc259-active-pane-slot>.drawer.show{display:block!important}

  .cc259-semantic-label{display:flex!important;align-items:center;gap:7px!important;line-height:1.35!important}
  .cc259-icon{display:grid;place-items:center;flex:0 0 23px;width:23px;height:23px;margin:-3px 0;border-radius:7px;background:#EAF1FB;color:#3F68A4}
  .cc259-icon svg{width:14px;height:14px}
  .cc259-icon-material{background:#EEEBFB;color:#625AA8}
  .cc259-icon-source{background:#E5F3F2;color:#31756F}
  .cc259-icon-people{background:#E7F3EC;color:#397754}
  .cc259-icon-steps{background:#E7EFFF;color:#356BC0}
  .cc259-icon-caution{background:#FBF0DA;color:#906C2E}
  .cc259-icon-done{background:#E7F4EA;color:#39744A}
  .cc259-icon-impact{background:#FBEAE6;color:#A05442}
  .cc259-icon-judgement{background:#ECE9FA;color:#6358A6}
  .cc259-icon-context{background:#EAF0F6;color:#526C8C}
  .cc252-brief-grid>div[class*="cc259-kind-"],.cc252-action-grid>div[class*="cc259-kind-"],.cc252-pane-grid>div[class*="cc259-kind-"]{transition:transform .16s ease,border-color .16s ease,background .16s ease}
  .cc252-brief-grid>div[class*="cc259-kind-"]:hover,.cc252-action-grid>div[class*="cc259-kind-"]:hover,.cc252-pane-grid>div[class*="cc259-kind-"]:hover{transform:translateY(-1px);background:#FCFDFF!important}
  #contextResult .drawer.cc259-pane-reveal.show{animation:cc259-pane-in .18s ease-out both}
  @keyframes cc259-pane-in{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:none}}

  @media(max-width:900px){#contextResult .actions.cc252-actions>button{padding-left:51px!important}}
  @media(max-width:620px){
    #contextResult .actions.cc252-actions>button{min-height:68px!important}
    .cc259-icon{flex-basis:22px;width:22px;height:22px}
  }
  @media(prefers-reduced-motion:reduce){
    #contextResult .actions.cc252-actions>button:before,.cc252-brief-grid>div[class*="cc259-kind-"],.cc252-action-grid>div[class*="cc259-kind-"],.cc252-pane-grid>div[class*="cc259-kind-"]{transition:none!important}
    #contextResult .drawer.cc259-pane-reveal.show{animation:none!important}
  }
  `;
  document.head.append(style);
}

let decorateTimer=null;
function scheduleDecorate(delay=55){
  if(decorateTimer)return;
  decorateTimer=setTimeout(()=>{decorateTimer=null;decorate()},delay);
}

function markVersion(){
  document.querySelectorAll('.version').forEach(node=>node.textContent='v'+VERSION);
  document.documentElement.dataset.uiVersion=VERSION;
}

function install(){
  installStyle();
  installDrawerController();
  const context=$('contextResult');
  const result=$('searchResult');
  if(context)new MutationObserver(()=>scheduleDecorate()).observe(context,{childList:true,subtree:true});
  if(result)new MutationObserver(()=>scheduleDecorate()).observe(result,{childList:true,subtree:true});
  document.addEventListener('click',event=>{
    if(event.target.closest('#analyze,.master-levels button,#searchGo,#homeSearchBtn,[data-example]'))scheduleDecorate(250);
  });
  decorate();
  markVersion();
  setTimeout(()=>{decorate();markVersion()},700);
  setTimeout(markVersion,1300);
}

window.CC_VISUAL_LANGUAGE={version:VERSION,classify,toggleDrawer,decorate};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
