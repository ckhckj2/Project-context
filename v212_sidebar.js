(()=>{
'use strict';
const VERSION='2.1.2';
const ICONS={
  home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M3.5 10.2 12 3.6l8.5 6.6v9.2a1.6 1.6 0 0 1-1.6 1.6h-4.8v-6.2H9.9V21H5.1a1.6 1.6 0 0 1-1.6-1.6z"/></svg>',
  search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.6"/><path d="m15.6 15.6 4.7 4.7"/></svg>',
  quiz:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="2.2"/><path d="m8.1 9.2 1.6 1.6 3-3.2M8.1 15.1l1.6 1.6 3-3.2M14.8 9.5h1.3M14.8 15.4h1.3"/></svg>',
  level:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V13h3.2v7H4Zm6.4 0V7.5h3.2V20h-3.2Zm6.4 0V4h3.2v16h-3.2Z" class="fill"/></svg>',
  project:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.2h6l1.7 2h9.3v8.7a2.1 2.1 0 0 1-2.1 2.1H5.6a2.1 2.1 0 0 1-2.1-2.1z"/><path d="M3.5 9.2V6.1A2.1 2.1 0 0 1 5.6 4h3.2l1.8 2.1h7.8a2.1 2.1 0 0 1 2.1 2.1v1"/></svg>',
  recent:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 8.2V4.8m0 0h3.4m-3.4 0 2.7 2.7A7.6 7.6 0 1 1 5 13"/><path d="M12 7.8v4.6l3.1 1.8"/></svg>',
  person:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.2" r="3.2" class="fill"/><path class="fill" d="M5.2 20c.5-4 3-6.2 6.8-6.2s6.3 2.2 6.8 6.2z"/></svg>'
};
function navButton(view,icon,label){return `<button data-view="${view}" class="cc212-nav-btn"><span class="cc212-nav-icon">${ICONS[icon]}</span><span>${label}</span></button>`}
function install(){
  const side=document.querySelector('.side');
  if(!side||side.dataset.cc212==='1')return;
  const current=document.getElementById('miniLevel')?.textContent||'LV.1 · 신입사원';
  const active=document.querySelector('.view.active')?.id?.replace('view-','')||'home';
  side.dataset.cc212='1';
  side.innerHTML=`
    <div class="cc212-brand">
      <div class="cc212-brand-row">
        <div class="cc-logo" aria-label="척척"><div class="cc-wordmark">척척<span class="cc-rays"><i></i><i></i><i></i></span></div><span class="cc-smile"></span></div>
        <span class="version">v${VERSION}</span>
      </div>
      <div class="cc-tagline">건축 실무, 물으면 <b>척척</b></div>
    </div>
    <nav class="cc212-main-nav" id="sideNav">
      ${navButton('home','home','홈')}
      ${navButton('search','search','검색')}
      ${navButton('quiz','quiz','퀴즈')}
      ${navButton('level','level','내 레벨')}
    </nav>
    <div class="cc212-divider"></div>
    <nav class="cc212-sub-nav">
      ${navButton('home','project','프로젝트')}
      ${navButton('search','recent','최근 본 내용')}
    </nav>
    <div class="level-mini cc212-level-card">
      <div class="cc212-level-head">
        <span class="cc212-avatar">${ICONS.person}</span>
        <div class="cc212-level-copy"><small>CURRENT LEVEL</small><b id="miniLevel">${current}</b></div>
      </div>
      <button data-view="level">내 학습 현황 보기 <span>→</span></button>
    </div>`;
  side.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===active&&b.closest('.cc212-main-nav')));
  
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
