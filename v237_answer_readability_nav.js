(()=>{
'use strict';
const VERSION='2.1.38';
const $=id=>document.getElementById(id);
let searchOrigin='';

function loadUnifiedSearchTypography(){
  if(document.querySelector('script[data-cc238]'))return;
  const s=document.createElement('script');
  s.src='./v238_search_typography_unify.js?v=2138';
  s.dataset.cc238='1';
  document.head.appendChild(s);
}

function installStyle(){
  if($('cc237Style'))return;
  const s=document.createElement('style');
  s.id='cc237Style';
  s.textContent=`
  /* Search answer readability — WHO/HOW router */
  .cc223-router{padding:27px!important}
  .cc223-router h3{max-width:920px!important;font-size:24px!important;line-height:1.45!important;margin:8px 0 12px!important;letter-spacing:-.35px!important}
  .cc223-context{margin:3px 0 16px!important;padding:8px 11px!important;font-size:11.5px!important;line-height:1.45!important}
  .cc223-core{gap:13px!important;margin-top:15px!important}
  .cc223-core>div{padding:16px 17px!important;border-radius:14px!important}
  .cc223-core small{margin-bottom:7px!important;font-size:10.5px!important;line-height:1.45!important}
  .cc223-core p{font-size:13.5px!important;line-height:1.75!important;font-weight:650!important}
  .cc223-chips{gap:8px!important}.cc223-chips span{padding:8px 11px!important;font-size:11.5px!important;line-height:1.4!important}
  .cc223-script p{font-size:14px!important;line-height:1.75!important;font-weight:800!important}
  .cc223-next{margin-top:13px!important;padding-top:12px!important}.cc223-next summary{font-size:12.5px!important;line-height:1.5!important}.cc223-next p{margin-top:9px!important;font-size:12.5px!important;line-height:1.7!important}
  .cc223-choice-grid{gap:11px!important;margin-top:16px!important}.cc223-choice-grid button{min-height:88px!important;padding:14px 15px!important;font-size:13px!important;line-height:1.45!important}.cc223-choice-grid small{font-size:10.5px!important;line-height:1.55!important}

  /* BIM adjustment blocks that are appended to ordinary search answers */
  .cc233-bim-adjust,.cc234-bim-search{margin-top:15px!important}
  .cc233-head,.cc234-title{padding:15px 16px!important;gap:15px!important}
  .cc233-head small,.cc234-title small{font-size:10.5px!important}
  .cc233-head b,.cc234-title b{font-size:14px!important;line-height:1.5!important}
  .cc233-head>span,.cc234-title span{font-size:11.5px!important;line-height:1.6!important}
  .cc233-checks,.cc234-checks{gap:9px!important;padding:13px!important}
  .cc233-checks>div,.cc234-checks>div{padding:11px!important;gap:9px!important}
  .cc233-checks p,.cc234-checks p{font-size:12.5px!important;line-height:1.7!important}
  .cc233-meta,.cc234-meta{gap:9px!important;padding:0 13px 13px!important}
  .cc233-meta>div,.cc234-meta>div{padding:11px 12px!important}
  .cc233-meta small,.cc234-meta small{font-size:10.5px!important}
  .cc233-meta p,.cc234-meta p{font-size:12px!important;line-height:1.65!important}

  /* Quiz LEVEL PATH */
  #view-quiz .quiz-top{gap:18px!important}
  #view-quiz .page-card{padding:28px!important}
  #view-quiz .level-path{gap:11px!important;margin-top:4px!important}
  #view-quiz .level-step{padding:15px 16px!important;border-radius:15px!important}
  #view-quiz .level-step b{font-size:13.5px!important;line-height:1.5!important;margin-bottom:4px!important}
  #view-quiz .level-step span{display:block!important;font-size:11.5px!important;line-height:1.65!important;color:#7b879b!important}
  #view-quiz .level-step.on span{color:#6075bd!important}
  #view-quiz .quiz-card>.lead{font-size:14.5px!important;line-height:1.75!important}

  /* Return to context button shown only when search was opened from context */
  .cc237-search-back{display:flex;align-items:center;gap:8px;width:max-content;margin:0 0 17px;padding:9px 12px;border:1px solid #dde4ef;border-radius:11px;background:#fff;color:#566a86;font-size:12px;font-weight:900;box-shadow:0 3px 10px rgba(42,58,91,.035)}
  .cc237-search-back:hover{border-color:#bfd0f6;background:#f8faff;color:#3e5fd2}
  .cc237-search-back[hidden]{display:none!important}

  @media(max-width:700px){
    .cc223-router{padding:19px!important}.cc223-router h3{font-size:20px!important}.cc223-core>div{padding:13px!important}.cc223-core p{font-size:12.5px!important}.cc223-script p{font-size:13px!important}.cc223-chips span{font-size:10.5px!important}
    .cc233-head,.cc234-title{display:grid!important}.cc233-head>span,.cc234-title span{text-align:left!important}.cc233-checks,.cc234-checks,.cc233-meta,.cc234-meta{grid-template-columns:1fr!important}.cc233-checks p,.cc234-checks p{font-size:11.5px!important}.cc233-meta p,.cc234-meta p{font-size:11.5px!important}
    #view-quiz .page-card{padding:20px!important}#view-quiz .level-step{padding:13px 14px!important}#view-quiz .level-step b{font-size:12.5px!important}#view-quiz .level-step span{font-size:10.8px!important}
    .cc237-search-back{font-size:11.5px!important;margin-bottom:13px!important}
  }
  `;
  document.head.appendChild(s);
}

function ensureBack(){
  const card=document.querySelector('#view-search .search-card');
  if(!card)return null;
  let btn=$('cc237SearchBack');
  if(!btn){
    btn=document.createElement('button');
    btn.type='button';
    btn.id='cc237SearchBack';
    btn.className='cc237-search-back';
    btn.textContent='← 내 업무 맥락으로 돌아가기';
    btn.hidden=true;
    btn.addEventListener('click',()=>{
      searchOrigin='';
      btn.hidden=true;
      if(typeof window.showView==='function')window.showView('context');
    });
    card.insertBefore(btn,card.firstChild);
  }
  return btn;
}
function syncBack(){
  const btn=ensureBack();if(!btn)return;
  const searchActive=$('view-search')?.classList.contains('active');
  btn.hidden=!(searchActive&&searchOrigin==='context');
}
function captureNavigation(e){
  const target=e.target;
  const contextActive=$('view-context')?.classList.contains('active');
  const toSearch=target.closest?.('[data-view="search"],[data-ask-context]');
  if(toSearch){
    searchOrigin=contextActive?'context':'';
    setTimeout(syncBack,80);
    return;
  }
  const toOther=target.closest?.('[data-view="home"],[data-view="quiz"],[data-view="level"],[data-view="projects"]');
  if(toOther)searchOrigin='';
}

function install(){
  installStyle();ensureBack();loadUnifiedSearchTypography();
  window.addEventListener('click',captureNavigation,true);
  document.addEventListener('click',()=>setTimeout(syncBack,90));
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();