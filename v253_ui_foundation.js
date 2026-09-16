(()=>{
'use strict';

const VERSION='2.1.57';
const $=id=>document.getElementById(id);

function activeView(){
  return document.querySelector('.view.active')?.id?.replace(/^view-/,'')||'home';
}

function syncNavigation(){
  const view=activeView();
  const main=[...document.querySelectorAll('.cc212-main-nav .cc212-nav-btn,#sideNav [data-view]')];
  const sub=[...document.querySelectorAll('.cc212-sub-nav .cc212-nav-btn,.cc-side-subnav [data-view]')];
  [...new Set([...main,...sub])].forEach(button=>{
    button.classList.remove('active');
    button.removeAttribute('aria-current');
  });
  const target=view==='projects'
    ? sub.find(button=>button.dataset.view==='projects'||/프로젝트/.test(button.textContent||''))
    : main.find(button=>button.dataset.view===view);
  if(target){
    target.classList.add('active');
    target.setAttribute('aria-current','page');
  }
}

function installNavigationFix(){
  window.CC_RUNTIME.registerView('navigation',syncNavigation);
  syncNavigation();
}

function install(){

  installNavigationFix();

}

window.CC_UI_FOUNDATION={version:VERSION,syncNavigation};

window.CC_BOOT.register('v253_ui_foundation',install);
})();
