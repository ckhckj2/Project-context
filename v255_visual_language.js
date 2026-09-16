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

function decorate(){
  const context=$('contextResult');
  const result=$('searchResult');
  decorateLabels(context);
  decorateLabels(result);
  window.CC_CONTEXT_CONTROLLER.prepare(context);
}

function install(){

  window.CC_RUNTIME.registerContext('visual',decorate);
  window.CC_RUNTIME.registerResult('visual',decorate);
}
window.CC_VISUAL_LANGUAGE={version:VERSION,classify,toggleDrawer:button=>window.CC_CONTEXT_CONTROLLER.toggleDrawer(button),decorate};

window.CC_BOOT.register('v255_visual_language',install);
})();
