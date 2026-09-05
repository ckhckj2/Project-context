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
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-view],[data-ask-context],#analyze'))setTimeout(syncNavigation,0);
  });
  document.querySelectorAll('.view').forEach(view=>{
    new MutationObserver(syncNavigation).observe(view,{attributes:true,attributeFilter:['class']});
  });
  syncNavigation();
}

function installStyle(){
  if($('cc257Style'))return;
  const style=document.createElement('style');
  style.id='cc257Style';
  style.textContent=`
  /* v2.1.57 — desktop readability, reliable navigation state, larger targets */
  :root{--cc257-text:#182B49;--cc257-body:#465B78;--cc257-muted:#63738A;--cc257-label:#426291;--cc257-line:#D8E1ED;--cc257-focus:#2F6FE4}
  body{color:var(--cc257-text)}
  button,summary,input,select,textarea{font-family:inherit}
  button,summary,[role="button"]{cursor:pointer}
  :where(button,summary,input,select,textarea,a,[role="button"]):focus-visible{outline:3px solid rgba(47,111,228,.42)!important;outline-offset:2px!important}

  .hero>.lead,.page-card>.lead,.cc251-search .search-card>.lead{color:var(--cc257-muted)!important}
  .cc212-nav-btn{min-height:54px!important;color:#455B78!important;font-size:14px!important}
  .cc212-nav-btn .cc212-nav-icon{width:25px!important;height:25px!important}
  .cc212-nav-btn:hover{background:#F3F7FD!important;color:#285FB5!important}
  .cc212-nav-btn.active{background:#E6F0FF!important;color:#1F63CF!important;box-shadow:inset 0 0 0 1px #D6E5FC!important}

  .cc251-fold>summary{min-height:54px!important}
  .cc251-fold>summary b{color:#263D60!important;font-size:13px!important}
  .cc251-fold>summary small{color:#65758C!important;font-size:10.5px!important;line-height:1.5!important}
  .cc251-fold>summary:hover{background:#F6F9FD!important}
  .cc251-home .cc251-structured>summary b{font-size:19px!important}
  .cc251-home .cc251-structured>summary small{color:#E5EFFF!important;font-size:11.5px!important}
  .cc251-home .cc-ask-title{color:#1D3D6B!important;font-size:16px!important}
  .cc251-home .cc-help-card{border-color:var(--cc257-line)!important;transition:border-color .16s ease,box-shadow .16s ease,background .16s ease!important}
  .cc251-home .cc-help-card>b{color:#1E3C66!important;font-size:13px!important;line-height:1.45!important}
  .cc251-home .cc-help-card:hover{border-color:#B8CBEB!important;background:#FBFDFF!important;box-shadow:0 7px 18px rgba(31,76,142,.08)!important}
  .cc251-home .cc251-popular-fold>summary b{font-size:11px!important}
  .cc251-home .cc251-popular-fold>summary small{font-size:10px!important}
  .cc251-popular-body button{min-height:36px;color:#50647F!important;font-size:11px!important}

  .cc251-search .searchbox input{font-size:14px!important;color:#243A59!important}
  .cc251-search .searchbox button{min-height:44px!important;font-size:12.5px!important}
  .cc251-search .cc251-quick-examples button{min-height:36px!important;color:#506179!important;font-size:11px!important}
  .cc237-search-back{min-height:42px!important;font-size:12.5px!important}

  .cc252-answer{padding:25px!important;border-color:var(--cc257-line)!important}
  .cc252-answer-head small{font-size:10.5px!important}
  .cc252-answer-head h3{font-size:23px!important;line-height:1.45!important}
  .cc252-action-grid{gap:11px!important}
  .cc252-action-grid>div{min-height:118px!important;padding:16px!important;border-color:#DDE5F0!important;background:#F7F9FC!important}
  .cc252-action-grid small{color:var(--cc257-label)!important;font-size:10.5px!important}
  .cc252-action-grid p{color:#374F70!important;font-size:13px!important;line-height:1.68!important}
  .cc252-detail-toggle{min-height:44px!important;color:#415B7D!important;font-size:12px!important}

  .cc252-context-flow>summary{min-height:52px!important}
  .cc252-context-flow>summary b{color:#294568!important;font-size:12.5px!important}
  .cc252-context-flow>summary small{color:#69798F!important;font-size:10.5px!important}
  .cc252-context-brief{padding:17px!important}
  .cc252-brief-head small{color:var(--cc257-label)!important;font-size:10px!important}
  .cc252-brief-head b{font-size:15.5px!important;line-height:1.45!important}
  .cc252-brief-head>span{color:#45638E!important;font-size:9.5px!important}
  .cc252-brief-grid>div,.cc252-pane-grid>div,.cc252-how-sequence>div{padding:13px!important}
  .cc252-brief-grid small,.cc252-pane-grid small,.cc252-how-sequence small{color:var(--cc257-label)!important;font-size:10px!important}
  .cc252-brief-grid p,.cc252-pane-grid p{color:#3D5574!important;font-size:12.5px!important;line-height:1.65!important}
  .cc252-how-sequence b{color:#314D70!important;font-size:12.5px!important;line-height:1.6!important}
  #contextResult .actions.cc252-actions>button{min-height:64px!important;padding:12px 13px!important;color:#284B7B!important;font-size:12px!important;transition:border-color .16s ease,background .16s ease,box-shadow .16s ease!important}
  #contextResult .actions.cc252-actions>button small{color:#496790!important;font-size:9.5px!important}
  #contextResult .actions.cc252-actions>button:hover{border-color:#AFC5E7!important;background:#F8FBFF!important;box-shadow:0 5px 14px rgba(37,77,137,.07)!important}
  #contextResult .actions.cc252-actions>button.cc-drawer-active{border-color:#79A1E0!important;background:#EAF3FF!important;box-shadow:inset 0 0 0 1px #C8DBF8!important}
  .cc252-pane-head{padding:18px!important}
  .cc252-pane-head small{font-size:10.5px!important}
  .cc252-pane-head b{font-size:18px!important;line-height:1.45!important}
  .cc252-pane-head span{color:#63738A!important;font-size:12px!important;line-height:1.6!important}
  .cc252-level-note{color:#5C6E85!important;font-size:11px!important;line-height:1.6!important}
  .cc252-deep-detail>summary{min-height:44px;color:#405B7E!important;font-size:12px!important}
  .cc252-checklist p{color:#3E5675!important;font-size:12px!important;line-height:1.6!important}

  .cc254-depth-head small{color:#536782!important;font-size:10px!important}
  .cc254-depth-head b{font-size:15.5px!important}
  .cc254-depth-head>span{font-size:9.5px!important}
  .cc254-depth-track>div{padding:10px!important}
  .cc254-depth-track i{font-size:9.5px!important}
  .cc254-depth-track b{color:#4C607C!important;font-size:10.5px!important;line-height:1.45!important}
  .cc254-depth-track small{color:#718096!important;font-size:9.5px!important;line-height:1.5!important}
  .cc254-depth-guide>p{color:#5F7087!important;font-size:10.5px!important;line-height:1.6!important}
  #contextResult.cc256-building:after{color:#526985!important;font-size:12px!important}

  #view-projects .lead,#view-level .lead{color:var(--cc257-muted)!important;font-size:14px!important;line-height:1.7!important}
  #view-projects label,#view-projects .cc230-label{color:#455A76!important;font-size:11.5px!important}
  #view-projects input,#view-projects select,#view-projects textarea{min-height:44px;color:#2F4665!important;font-size:13px!important}
  #view-projects textarea{min-height:86px!important;line-height:1.6!important}
  #view-projects small{color:#66778E}
  #view-projects button,#view-quiz button,#view-level button{min-height:44px}
  #view-quiz .level-step b,#view-level .level-step b{color:#263E61!important}
  #view-quiz .level-step span,#view-level .level-step span{color:#65758C!important}

  @media(max-width:760px){
    .cc212-nav-btn{font-size:13px!important}
    .cc251-home .cc-help-card>b{font-size:12px!important}
    .cc251-fold>summary small{font-size:10px!important}
    .cc252-answer{padding:18px!important}
    .cc252-answer-head h3{font-size:19px!important}
    .cc252-action-grid>div{min-height:0!important}
    .cc254-depth-track small{font-size:9px!important}
  }
  @media(prefers-reduced-motion:reduce){
    .cc251-home .cc-help-card,#contextResult .actions.cc252-actions>button{transition:none!important}
  }
  `;
  document.head.append(style);
}



function install(){
  installStyle();
  installNavigationFix();
  
  
  setTimeout(syncNavigation,450);
}

window.CC_UI_FOUNDATION={version:VERSION,syncNavigation};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
