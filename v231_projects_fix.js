(()=>{
'use strict';
const VERSION='2.1.31';

function wireProjectNav(){
  const buttons=[...document.querySelectorAll('.cc212-sub-nav button,.cc-side-subnav button')];
  const btn=buttons.find(b=>/프로젝트/.test(b.textContent||''));
  if(!btn)return;
  btn.dataset.view='projects';
  if(btn.dataset.cc231Wired==='1')return;
  btn.dataset.cc231Wired='1';
  btn.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    if(typeof showView==='function')showView('projects');
  });
}

function installMobileShortcut(){
  const tools=document.querySelector('#view-home .cc-home-tools');
  if(!tools||tools.querySelector('[data-cc231-projects]'))return;
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='cc-help-btn cc231-project-shortcut';
  btn.dataset.cc231Projects='1';
  btn.textContent='프로젝트';
  btn.addEventListener('click',()=>{if(typeof showView==='function')showView('projects')});
  tools.insertBefore(btn,tools.lastElementChild);
}

function install(){
  wireProjectNav();
  installMobileShortcut();


}

window.CC_BOOT.register('v231_projects_fix',install);
})();
