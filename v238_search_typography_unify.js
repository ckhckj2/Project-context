(()=>{
'use strict';
const VERSION='2.1.38';
function install(){
  if(document.getElementById('cc238Style'))return;
  const s=document.createElement('style');
  s.id='cc238Style';
  s.textContent=`
  /* v2.1.38 — one typography baseline for the entire search page */
  #view-search .search-card{font-size:14px!important}
  #view-search .search-card>.lead{font-size:14.5px!important;line-height:1.75!important}
  #view-search .caps small{font-size:10px!important}
  #view-search .caps b{font-size:13.5px!important;line-height:1.5!important}
  #view-search .caps span{font-size:11.5px!important;line-height:1.55!important}
  #view-search .searchbox input{font-size:14.5px!important}
  #view-search .searchbox button{font-size:12.5px!important}
  #view-search .examples button{font-size:11.5px!important;line-height:1.45!important}
  #view-search .cc230-search-project small{font-size:10px!important}
  #view-search .cc230-search-project b{font-size:13px!important}
  #view-search .cc230-search-project span{font-size:11px!important;line-height:1.55!important}

  /* Baseline for every dynamically rendered answer card, regardless of module */
  #searchResult .result-card{font-size:13px!important}
  #searchResult .result-card>.label,
  #searchResult .result-card .label{font-size:10.5px!important;line-height:1.45!important}
  #searchResult .result-card h3{font-size:22px!important;line-height:1.42!important;letter-spacing:-.3px!important}
  #searchResult .result-card p{font-size:13px!important;line-height:1.72!important}
  #searchResult .result-card small{font-size:10.5px!important;line-height:1.5!important}
  #searchResult .result-card button,
  #searchResult .result-card a,
  #searchResult .result-card summary{font-size:11.5px!important;line-height:1.5!important}
  #searchResult .result-card li,
  #searchResult .result-card td,
  #searchResult .result-card th{font-size:12.5px!important;line-height:1.7!important}

  /* v2.1.28 common work answers */
  #searchResult .cc228-context{font-size:11.5px!important;line-height:1.5!important;padding:7px 10px!important}
  #searchResult .cc228-steps>small,
  #searchResult .cc228-line small{font-size:10.5px!important}
  #searchResult .cc228-steps b{font-size:13px!important;line-height:1.62!important}
  #searchResult .cc228-line b{font-size:12.5px!important;line-height:1.62!important}
  #searchResult .cc228-choice>p{font-size:13px!important;line-height:1.7!important}
  #searchResult .cc228-choices button{font-size:12px!important;line-height:1.5!important}

  /* v2.1.29 glossary answers */
  #searchResult .cc229-head small{font-size:10.5px!important}
  #searchResult .cc229-head h3{font-size:25px!important}
  #searchResult .cc229-head span{font-size:12px!important}
  #searchResult .cc229-summary{font-size:15.5px!important;line-height:1.65!important}
  #searchResult .cc229-grid small,
  #searchResult .cc229-related small{font-size:10.5px!important}
  #searchResult .cc229-grid p{font-size:13px!important;line-height:1.72!important}
  #searchResult .cc229-actions a,
  #searchResult .cc229-actions button,
  #searchResult .cc229-related button{font-size:11.5px!important;line-height:1.45!important}
  #searchResult .cc229-more summary{font-size:11.5px!important}
  #searchResult .cc229-caution{font-size:12.5px!important;line-height:1.7!important}

  /* WHO/HOW + BIM + permit/review keep hierarchy, but never drop back to tiny text */
  #searchResult .cc223-core small,
  #searchResult .cc232-four small,
  #searchResult .cc232-start>small,
  #searchResult .cc233-meta small,
  #searchResult .cc234-meta small,
  #searchResult .cc235-core small,
  #searchResult .cc235-practice-grid small,
  #searchResult .cc235-pick>small,
  #searchResult .cc235-sources>small{font-size:10.5px!important}
  #searchResult .cc223-core p,
  #searchResult .cc232-four p,
  #searchResult .cc232-bim-detail p,
  #searchResult .cc233-checks p,
  #searchResult .cc233-meta p,
  #searchResult .cc234-checks p,
  #searchResult .cc234-meta p,
  #searchResult .cc235-core p,
  #searchResult .cc235-practice-grid p{font-size:13px!important;line-height:1.72!important}
  #searchResult .cc235-flow b{font-size:12.5px!important;line-height:1.55!important}
  #searchResult .cc235-flow span{font-size:11.5px!important;line-height:1.6!important}
  #searchResult .cc235-project b{font-size:11.5px!important}
  #searchResult .cc235-project span{font-size:11.5px!important;line-height:1.6!important}

  @media(max-width:700px){
    #view-search .search-card>.lead{font-size:13.5px!important}
    #view-search .caps b{font-size:12.5px!important}
    #view-search .caps span{font-size:10.8px!important}
    #view-search .examples button{font-size:10.8px!important}
    #searchResult .result-card h3{font-size:20px!important}
    #searchResult .result-card p{font-size:12.5px!important}
    #searchResult .result-card small{font-size:10px!important}
    #searchResult .result-card button,#searchResult .result-card a,#searchResult .result-card summary{font-size:11px!important}
    #searchResult .cc228-steps b,#searchResult .cc229-grid p,#searchResult .cc223-core p,#searchResult .cc235-core p,#searchResult .cc235-practice-grid p{font-size:12.5px!important}
    #searchResult .cc229-summary{font-size:14.5px!important}
  }
  `;
  document.head.appendChild(s);
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();