(()=>{
'use strict';
const VERSION='2.1.36';
function install(){
  if(document.getElementById('cc236Style'))return;
  const s=document.createElement('style');
  s.id='cc236Style';
  s.textContent=`
/* v2.1.36 — grid alignment + collision fix + readability pass */

/* HOME GRID: 4-column help cards and 2-column lower cards share the same center line */
.cc-help-grid{gap:16px!important;margin-top:30px!important}
.cc-home-lower{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important;margin-top:16px!important;align-items:stretch!important}
.cc-flow-card,.cc-ask-card{height:100%!important;min-height:258px!important;box-sizing:border-box!important}
.cc-topic-strip{margin-top:16px!important}

/* HOME READABILITY */
.hero h1{font-size:39px!important;line-height:1.18!important;letter-spacing:-1.55px!important}
.hero>.lead{font-size:15px!important;line-height:1.7!important}
.field label{font-size:13.5px!important}
.field select{font-size:15px!important;line-height:1.35!important;color:#314663!important}
.form>.primary{font-size:14px!important}
.cc-accuracy-note{font-size:11.5px!important}
.details-toggle{font-size:11.5px!important}
.cc-help-card{padding:24px 23px 22px!important;min-height:238px!important}
.cc-help-card>b{font-size:18.5px!important;line-height:1.4!important;margin-bottom:14px!important}
.cc-help-card>span:not(.cc-help-icon){font-size:13.5px!important;line-height:1.72!important;color:#64758e!important}
.cc-flow-card{padding:22px 24px 20px!important}
.cc-flow-card .cc-card-head>b,.cc-ask-title{font-size:17px!important;line-height:1.4!important}
.cc-flow-card .cc-card-head>button{font-size:11.5px!important}
.cc-flow-line>div>small{font-size:9.5px!important}
.cc-flow-line>div>b{font-size:11.2px!important;line-height:1.4!important;max-width:88px!important}
.cc-flow-card>p{font-size:12px!important;line-height:1.65!important}
.cc-ask-card{padding:22px 24px 20px!important}
.cc-ask-card .home-search{max-width:100%!important}
.cc-ask-card .home-search input{font-size:13px!important;height:50px!important}
.cc-ask-card .home-search button{height:50px!important}
.cc-popular-questions{max-width:100%!important;margin-top:17px!important;gap:7px!important}
.cc-popular-questions small{font-size:10.5px!important}
.cc-popular-questions button{font-size:11.5px!important;line-height:1.5!important}
.cc-topic-strip>b{font-size:12.5px!important}
.cc-topic-strip>div button{font-size:10.5px!important;padding:8px 11px!important}
.cc-topic-strip>button{font-size:10.5px!important}

/* SEARCH PAGE */
.search-card{padding:28px!important}
.kicker{font-size:10.5px!important}
.search-card h2,.quiz-card h2,.level-card h2{font-size:31px!important}
.search-card>.lead,.quiz-card>.lead,.level-card>.lead{font-size:14px!important;line-height:1.72!important}
.cap{padding:15px 16px!important;min-height:76px!important}
.cap small{font-size:9.5px!important}
.cap b{font-size:13.5px!important;line-height:1.5!important}
.cap span{font-size:11.5px!important;line-height:1.5!important}
.searchbox input{font-size:14px!important;height:52px!important}
.searchbox button{font-size:12.5px!important;min-width:104px!important}
.examples{gap:8px!important;margin-top:12px!important}
.examples button{font-size:11px!important;padding:8px 11px!important}
.result-card{padding:24px!important}
.result-card .label{font-size:10px!important}
.result-card h3{font-size:22px!important;line-height:1.4!important}
.result-card>p{font-size:13.5px!important;line-height:1.72!important}
.result-cell small{font-size:10px!important}
.result-cell p{font-size:12px!important;line-height:1.65!important}
.script-box p{font-size:12.5px!important}

/* PERMIT / REVIEW PACKAGE: create breathing room between consecutive information boxes */
.cc235-review-card,.cc235-overview{padding:26px!important}
.cc235-top{gap:18px!important}
.cc235-top h3,.cc235-overview h3{font-size:24px!important;line-height:1.38!important;margin:6px 0 8px!important}
.cc235-top p,.cc235-overview>p{font-size:13.5px!important;line-height:1.72!important}
.cc235-top>span{font-size:10.5px!important;padding:7px 10px!important}
.cc235-project{gap:10px!important;margin-top:16px!important;padding:11px 13px!important;line-height:1.5!important;flex-wrap:wrap!important}
.cc235-project b{font-size:10.5px!important}
.cc235-project span{font-size:10.5px!important;line-height:1.55!important}
.cc235-core{gap:12px!important;margin-top:16px!important}
.cc235-core>div,.cc235-practice-grid>div{padding:15px!important;box-sizing:border-box!important}
.cc235-core small,.cc235-practice-grid small,.cc235-pick>small,.cc235-sources>small{font-size:9.5px!important}
.cc235-core p,.cc235-practice-grid p{font-size:11.5px!important;line-height:1.7!important;margin-top:7px!important}
.cc235-caution{gap:10px!important;margin-top:13px!important;padding:12px 13px!important}
.cc235-caution b{font-size:10.5px!important}
.cc235-caution span{font-size:11px!important;line-height:1.65!important}
.cc235-practice{margin-top:14px!important;padding:0 14px 14px!important}
.cc235-practice summary{font-size:11.5px!important;padding:13px 0!important}
.cc235-practice-grid{gap:12px!important}
.cc235-flow{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px!important;margin-top:18px!important;margin-bottom:18px!important;align-items:stretch!important}
.cc235-flow>div{padding:14px!important;min-height:118px!important;box-sizing:border-box!important;overflow:visible!important}
.cc235-flow i{width:24px!important;height:24px!important;font-size:9px!important}
.cc235-flow b{margin-top:8px!important;font-size:11.5px!important;line-height:1.45!important}
.cc235-flow span{margin-top:5px!important;font-size:10px!important;line-height:1.55!important}
.cc235-overview>.cc235-practice-grid{margin-top:0!important;margin-bottom:18px!important}
.cc235-pick{margin-top:18px!important}
.cc235-pick>div{gap:8px!important;margin-top:9px!important}
.cc235-pick button{font-size:10.5px!important;padding:8px 11px!important}
.cc235-sources{gap:9px!important;margin-top:14px!important;padding-top:13px!important}
.cc235-sources a{font-size:9.5px!important;padding:7px 9px!important}
.cc235-sources span{font-size:9.5px!important;line-height:1.55!important}
.cc235-how{padding:14px!important}
.cc235-how>small{font-size:9.5px!important}
.cc235-how>b{font-size:11.5px!important;line-height:1.55!important}
.cc235-how>div,.cc235-how button{font-size:10.5px!important;line-height:1.55!important}

/* LV2 / LV3 / BIM blocks */
.why-title{font-size:18px!important}
.detail-cell small{font-size:10px!important}
.detail-cell p{font-size:12.5px!important;line-height:1.7!important}
.context-note,.caution{font-size:12px!important;line-height:1.7!important}
.cc218-where-head b,.cc219-tools-head b,.cc219-tool-detail-head b{font-size:14.5px!important}
.cc219-tool-tabs button,.cc219-tool-caution span{font-size:11px!important}
.cc232-how-head small{font-size:9.5px!important}.cc232-how-head b{font-size:17px!important}.cc232-how-head span{font-size:11px!important}
.cc232-how-steps b{font-size:11.5px!important;line-height:1.55!important}.cc232-how-all p{font-size:12px!important}.cc232-how-grid small{font-size:9.5px!important}.cc232-how-grid p{font-size:11px!important}
.cc232-bim-head h3{font-size:24px!important}.cc232-bim-head p{font-size:13.5px!important}.cc232-four small,.cc232-start>small{font-size:10px!important}.cc232-four p{font-size:12px!important}.cc232-start b{font-size:11px!important}.cc232-bim-detail p{font-size:11px!important}.cc232-links a{font-size:10px!important}
.cc233-head small,.cc234-title small{font-size:9.5px!important}.cc233-head b,.cc234-title b{font-size:12.5px!important}.cc233-head>span,.cc234-title span{font-size:10.5px!important;line-height:1.5!important}.cc233-checks p,.cc233-meta p,.cc234-checks p,.cc234-meta p{font-size:10.5px!important;line-height:1.6!important}.cc233-meta small,.cc234-meta small{font-size:9.5px!important}

/* PROJECT PAGE */
.cc230-head h2{font-size:32px!important}.cc230-head p{font-size:13.5px!important;line-height:1.7!important}
.cc230-local b,.cc230-local span{font-size:11px!important;line-height:1.55!important}
.cc230-editor-head small{font-size:10px!important}.cc230-editor-head b{font-size:18px!important}
.cc230-form span{font-size:11.5px!important}.cc230-form input,.cc230-form select,.cc230-form textarea{font-size:13px!important;line-height:1.5!important}
.cc230-list-head b{font-size:14px!important}.cc230-list-head small{font-size:10px!important}
.cc232-bim-setting>span,.cc232-bim-setting select{font-size:10.5px!important}

/* SIDEBAR */
.nav button{font-size:13.5px!important}.cc-side-subnav button,.cc212-sub-nav button{font-size:12.5px!important}.level-mini b{font-size:14px!important}.level-mini button{font-size:11.5px!important}

@media(max-width:1050px){
  .cc-home-lower{grid-template-columns:1fr!important}
  .cc235-flow{grid-template-columns:repeat(3,minmax(0,1fr))!important}
}
@media(max-width:700px){
  .hero h1{font-size:30px!important}.hero>.lead{font-size:13.5px!important}
  .field label{font-size:12px!important}.field select{font-size:13.5px!important}
  .cc-help-grid{gap:11px!important;margin-top:20px!important}.cc-help-card{min-height:190px!important;padding:18px 17px!important}.cc-help-card>b{font-size:15.5px!important}.cc-help-card>span:not(.cc-help-icon){font-size:11.5px!important}
  .cc-flow-card,.cc-ask-card{min-height:228px!important;padding:18px!important}.cc-flow-card .cc-card-head>b,.cc-ask-title{font-size:14.5px!important}.cc-flow-card>p{font-size:10.8px!important}.cc-popular-questions button{font-size:10.5px!important}
  .search-card{padding:20px!important}.search-card h2,.quiz-card h2,.level-card h2{font-size:25px!important}.search-card>.lead{font-size:12.5px!important}.cap b{font-size:12.5px!important}.cap span{font-size:10.5px!important}.searchbox input{font-size:13px!important}
  .result-card{padding:18px!important}.result-card h3{font-size:19px!important}.result-card>p{font-size:12.5px!important}
  .cc235-review-card,.cc235-overview{padding:18px!important}.cc235-top h3,.cc235-overview h3{font-size:21px!important}.cc235-top p,.cc235-overview>p{font-size:12.5px!important}
  .cc235-flow{grid-template-columns:1fr!important;gap:8px!important;margin-bottom:14px!important}.cc235-flow>div{min-height:0!important;padding:13px!important}.cc235-practice-grid,.cc235-practice-grid.locked,.cc235-core{grid-template-columns:1fr!important;gap:9px!important}
  .cc235-project{display:grid!important;gap:4px!important}
  .cc230-head{display:grid!important}.cc230-head h2{font-size:27px!important}.cc230-head p{font-size:12.5px!important}.cc230-form{grid-template-columns:1fr!important}.cc230-form label.wide{grid-column:auto!important}
}
`;
  document.head.appendChild(s);
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
