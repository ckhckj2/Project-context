(()=>{
'use strict';
const VERSION='2.1.36';
function install(){
  if(document.getElementById('cc236Style'))return;
  const s=document.createElement('style');
  s.id='cc236Style';
  s.textContent=`
/* v2.1.36 — readability-only pass. Grid/alignment/collision cleanup is deferred. */
body{font-size:14px!important}

/* HOME */
.hero h1{font-size:38px!important;line-height:1.18!important}
.hero>.lead{font-size:15px!important;line-height:1.75!important}
.field label{font-size:13.5px!important}
.field select{font-size:15px!important;line-height:1.4!important}
.form>.primary{font-size:14.5px!important}
.cc-accuracy-note,.details-toggle{font-size:12px!important}
.cc-help-card>b{font-size:18.5px!important;line-height:1.4!important}
.cc-help-card>span:not(.cc-help-icon){font-size:14px!important;line-height:1.75!important}
.cc-flow-card .cc-card-head>b,.cc-ask-title{font-size:17px!important;line-height:1.4!important}
.cc-flow-card .cc-card-head>button{font-size:11.5px!important}
.cc-flow-line>div>small{font-size:9.5px!important}
.cc-flow-line>div>b{font-size:11.5px!important;line-height:1.5!important}
.cc-flow-card>p{font-size:12px!important;line-height:1.7!important}
.cc-ask-card .home-search input{font-size:13.5px!important}
.cc-popular-questions small{font-size:10.5px!important}
.cc-popular-questions button,.cc-topic-strip button{font-size:11px!important;line-height:1.55!important}
.cc-topic-strip>b{font-size:12px!important}

/* SIDEBAR / CURRENT PROJECT */
.nav button{font-size:14px!important}
.cc-side-subnav button,.cc212-sub-nav button{font-size:12.5px!important}
.level-mini b{font-size:15px!important}
.level-mini button{font-size:12px!important}
.cc230-home-project small,.cc230-search-project small{font-size:9.5px!important}
.cc230-home-project b,.cc230-search-project b{font-size:12.5px!important}
.cc230-home-project span,.cc230-search-project span{font-size:10.5px!important;line-height:1.55!important}

/* SEARCH */
.kicker{font-size:11px!important}
.search-card h2,.quiz-card h2,.level-card h2{font-size:30px!important;line-height:1.25!important}
.search-card>.lead,.quiz-card>.lead,.level-card>.lead{font-size:14.5px!important;line-height:1.75!important}
.cap small{font-size:9.5px!important}
.cap b{font-size:13.5px!important;line-height:1.5!important}
.cap span{font-size:11.5px!important;line-height:1.55!important}
.searchbox input{font-size:14.5px!important}
.searchbox button{font-size:12.5px!important}
.examples button{font-size:11.5px!important}
.result-card .label{font-size:10px!important}
.result-card h3{font-size:21px!important;line-height:1.4!important}
.result-card>p{font-size:14px!important;line-height:1.75!important}
.result-cell small{font-size:10px!important}
.result-cell p{font-size:12.5px!important;line-height:1.7!important}
.script-box small{font-size:10px!important}
.script-box p{font-size:13px!important;line-height:1.7!important}

/* CONTEXT / WHY / HOW */
.back-row b{font-size:17px!important}
.stage-copy small{font-size:10.5px!important}
.stage-copy b{font-size:18px!important}
.stage-copy p{font-size:13.5px!important;line-height:1.65!important}
.stage-task{font-size:12.5px!important}
.map-head b{font-size:16px!important}
.map-head span{font-size:11.5px!important}
.flow .node{font-size:12.5px!important}
.actions button{font-size:13px!important;line-height:1.5!important}
.actions button small{font-size:10px!important}
.why-title{font-size:18px!important}
.detail-cell small{font-size:10.5px!important}
.detail-cell p{font-size:13px!important;line-height:1.7!important}
.context-note,.caution{font-size:12.5px!important;line-height:1.75!important}
.cc218-where-head small,.cc219-tools-head small,.cc219-tool-detail-head small{font-size:10px!important}
.cc218-where-head b,.cc219-tools-head b,.cc219-tool-detail-head b{font-size:15px!important}
.cc219-tools-head span{font-size:11.5px!important}
.cc219-tool-tabs button{font-size:11.5px!important}
.cc219-tool-link{font-size:11px!important}
.cc219-tool-caution b{font-size:10.5px!important}
.cc219-tool-caution span{font-size:12px!important;line-height:1.7!important}

/* LV3 HOW / BIM */
.cc232-how-head small,.cc232-four small,.cc232-start>small,.cc232-bim-detail summary{font-size:10.5px!important}
.cc232-how-head b{font-size:18px!important;line-height:1.45!important}
.cc232-how-head span{font-size:12px!important;line-height:1.6!important}
.cc232-how-steps b{font-size:12.5px!important;line-height:1.6!important}
.cc232-how-detail summary{font-size:12px!important}
.cc232-how-all p{font-size:12.5px!important;line-height:1.7!important}
.cc232-how-grid small{font-size:10px!important}
.cc232-how-grid p{font-size:12px!important;line-height:1.7!important}
.cc232-bim-note b{font-size:10.5px!important}
.cc232-bim-note span{font-size:12px!important;line-height:1.65!important}
.cc232-bim-head h3{font-size:24px!important}
.cc232-bim-head p{font-size:14px!important;line-height:1.7!important}
.cc232-bim-head>span{font-size:10.5px!important}
.cc232-four p{font-size:12.5px!important;line-height:1.7!important}
.cc232-start b{font-size:12px!important}
.cc232-bim-detail p{font-size:12px!important;line-height:1.7!important}
.cc232-links a{font-size:10.5px!important}
.cc232-bim-setting>span,.cc232-bim-setting select{font-size:11.5px!important}
.cc233-head small,.cc234-title small{font-size:9.5px!important}
.cc233-head b,.cc234-title b{font-size:13px!important}
.cc233-head>span,.cc234-title span{font-size:11px!important;line-height:1.55!important}
.cc233-checks p,.cc233-meta p,.cc234-checks p,.cc234-meta p{font-size:11.5px!important;line-height:1.65!important}
.cc233-meta small,.cc234-meta small{font-size:9.5px!important}

/* PERMIT / REVIEW */
.cc235-top h3,.cc235-overview h3{font-size:24px!important;line-height:1.4!important}
.cc235-top p,.cc235-overview>p{font-size:13.5px!important;line-height:1.75!important}
.cc235-top>span{font-size:10.5px!important}
.cc235-project b,.cc235-project span{font-size:10.5px!important;line-height:1.6!important}
.cc235-core small,.cc235-practice-grid small,.cc235-pick>small,.cc235-sources>small{font-size:9.5px!important}
.cc235-core p,.cc235-practice-grid p{font-size:12px!important;line-height:1.7!important}
.cc235-caution b{font-size:10.5px!important}
.cc235-caution span{font-size:11.5px!important;line-height:1.7!important}
.cc235-practice summary{font-size:12px!important}
.cc235-lock b{font-size:12px!important}
.cc235-lock span{font-size:11px!important;line-height:1.6!important}
.cc235-sources a,.cc235-sources span{font-size:10px!important;line-height:1.55!important}
.cc235-flow b{font-size:11.5px!important;line-height:1.5!important}
.cc235-flow span{font-size:10px!important;line-height:1.55!important}
.cc235-pick button{font-size:10.5px!important}
.cc235-how>small{font-size:9.5px!important}
.cc235-how>b{font-size:12.5px!important;line-height:1.55!important}
.cc235-how>div,.cc235-how button{font-size:11.5px!important;line-height:1.6!important}

/* PROJECT PAGE */
.cc230-head h2{font-size:32px!important}
.cc230-head p{font-size:13.5px!important;line-height:1.7!important}
.cc230-local b,.cc230-local span{font-size:11.5px!important;line-height:1.6!important}
.cc230-editor-head small{font-size:10px!important}
.cc230-editor-head b{font-size:19px!important}
.cc230-form span{font-size:11.5px!important}
.cc230-form input,.cc230-form select,.cc230-form textarea{font-size:13.5px!important;line-height:1.55!important}
.cc230-editor-actions span{font-size:11.5px!important}
.cc230-list-head b{font-size:14px!important}
.cc230-list-head small{font-size:10.5px!important}
.cc230-card h3{font-size:18px!important;line-height:1.4!important}
.cc230-card small,.cc230-card-actions button{font-size:10.5px!important}
.cc230-tags span,.cc230-card p,.cc230-use{font-size:11.5px!important;line-height:1.6!important}

/* QUIZ */
.rank-big{font-size:34px!important}
.qmeta{font-size:11.5px!important}
.qtext{font-size:19px!important;line-height:1.6!important}
#qInput{font-size:14px!important}

@media(max-width:700px){
  body{font-size:14px!important}
  .hero h1{font-size:30px!important}
  .hero>.lead{font-size:14px!important}
  .field label{font-size:13px!important}.field select{font-size:14px!important}
  .cc-help-card>b{font-size:16.5px!important}.cc-help-card>span:not(.cc-help-icon){font-size:13px!important}
  .cc-flow-card .cc-card-head>b,.cc-ask-title{font-size:15px!important}.cc-flow-line>div>b{font-size:10.5px!important}.cc-flow-card>p{font-size:11.5px!important}
  .cc-ask-card .home-search input{font-size:13px!important}.cc-popular-questions button{font-size:10.5px!important}
  .search-card h2,.quiz-card h2,.level-card h2{font-size:25px!important}
  .search-card>.lead,.quiz-card>.lead,.level-card>.lead{font-size:13.5px!important}
  .stage-copy b{font-size:17px!important}.stage-copy p{font-size:12.5px!important}.stage-task{font-size:12px!important}
  .map-head b{font-size:15px!important}.flow .node{font-size:11.5px!important}.actions button{font-size:12px!important}
  .why-title{font-size:17px!important}.detail-cell p{font-size:12.5px!important}.context-note{font-size:12px!important}
  .result-card h3{font-size:19px!important}.result-card>p{font-size:13px!important}.result-cell p{font-size:12px!important}
  .cc235-top h3,.cc235-overview h3{font-size:21px!important}.cc235-top p,.cc235-overview>p{font-size:12.5px!important}
  .cc230-head h2{font-size:27px!important}.cc230-head p{font-size:12.5px!important}
}
`;
  document.head.appendChild(s);
  
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
