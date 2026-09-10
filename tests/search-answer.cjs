'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const routes=new Map();
function element(){
 const classes=new Set();
 return {value:'',dataset:{},children:[],classList:{remove(...xs){xs.forEach(x=>classes.delete(x))},add(...xs){xs.forEach(x=>classes.add(x))},contains:x=>classes.has(x)},
 querySelector(){return null},querySelectorAll(){return []},addEventListener(){},prepend(){},append(){},scrollIntoView(){},
 set innerHTML(value){this.html=value;this.firstElementChild={};this.children=[this.firstElementChild]},get innerHTML(){return this.html||''}};
}
const output=element(),input=element();
const window={CC_PROJECT_STORE:{active:()=>null},CC_LEVEL_STORE:{state:()=>({view:1})},
 CC_RUNTIME:{registerSearch:(id,match,render)=>routes.set(id,{match,render})}};
const sandbox={window,document:{readyState:'loading',addEventListener(){},createElement:element,getElementById:id=>({searchResult:output,searchInput:input}[id]||null),querySelector(){return null},querySelectorAll(){return []}},console,viewLevel:()=>1};
vm.createContext(sandbox);
for(const f of ['level-policy.js','work-rules.js','bim-rules.js','review-rules.js','public-rules.js','search-answer.js','judgement-data.js','judgement-engine.js'])vm.runInContext(fs.readFileSync(f,'utf8'),sandbox,{filename:f});
const answer=window.CC_SEARCH_ANSWER;
assert.equal(answer.model('x',[['01 · 먼저',' a  b ']]).items[0].label,'먼저');
assert.equal(answer.model('x',[['먼저',' a  b ']]).items[0].body,'a b');
assert.equal(answer.model('x',[['빈 내용','']]).items.length,0,'never synthesize generic actions');
assert.throws(()=>answer.model('x',[['먼저','a']]).items.push({}),TypeError);
answer.write(output,'<div>one</div>',answer.model('one',[['first','one']]));
const previous=output.firstElementChild;
answer.write(output,'<div>choose</div>');
assert.equal(answer.read(output.firstElementChild),null,'a replacement without a summary cannot inherit the last answer');
assert.equal(answer.read(previous).title,'one');

// Exercise the real producers, including their direct/legacy entry points.
const scripts=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="\.\/(.*?)\?/g)].map(m=>m[1]);
for(const file of scripts){
 let source=fs.readFileSync(file,'utf8');
 if(file==='app-runtime.js'||!source.includes('registerSearch('))continue;
 const registrations=source.split('\n').filter(line=>line.includes('window.CC_RUNTIME.registerSearch(')).map(line=>line.slice(line.indexOf('window.CC_RUNTIME.registerSearch(')).replace(/;\}\s*$/,';')).join('\n');
 source=source.replace(/if\(document\.readyState==='loading'\)[\s\S]*?(?=\}\)\(\);\s*$)/,registrations+'\n');
 vm.runInContext(source,sandbox,{filename:file});
}
const cases=[
 ['comparison','변경허가와 변경신고의 차이가 뭐야?',true],
 ['concept-comparison','BIM과 Revit의 차이가 뭐야?',true],
 ['concept-comparison','처음 보는 A와 B의 차이가 뭐야?',false],
 ['ask','입면 디자인 검토는 누구에게 물어봐?',true],
 ['definition','변경허가가 뭐야?',true],
 ['judgement','기숙사로 계획해도 될까요?',true],
 ['permit-workflow','세움터 제출 전 자료 누락 체크리스트',true],
 ['change','공항 실시계획 변경업무',true],
 ['change','변경업무',false],
 ['glossary','QGIS가 뭐야?',true],
 ['public','공공건축심의 흐름',true],
 ['reviews','건축심의는 언제 확인해?',true],
 ['reviews','주요 심의 종류',true],
 ['reviews','인허가 실무 패키지',true],
 ['bim','Revit 중앙파일 작업',true],
 ['precedent','입면 사례 조사',true],
 ['specific','입면 디자인 검토 업무를 요청받았어요',true],
 ['common','법규검토 업무를 요청받았어요',true],
 ['common','QGIS 확인을 요청받았어요',false],
 ['tools','토지이음에서 뭘 봐요?',true],
 ['expanded','도면 코멘트 반영 여부 확인해달래',true],
 ['fallback','알 수 없는 업무',false]
];
for(const [id,query,hasSummary] of cases){
 const route=routes.get(id),data=route.match(query);assert(data,id+' must match '+query);
 input.value=query;
 route.render(data,query);
 const result=answer.read(output.firstElementChild);
 assert.equal(!!result,hasSummary,id+' '+query);
 if(result){assert(result.title&&result.items.length);assert(result.items.every(x=>x.body&&!/^\d+$/.test(x.body)),id+' summary must contain content, not counters');}
 if(id==='comparison')assert.equal(result.comparison.sides.length,2);
 if(id==='bim')assert(result.items[0].body.length>5);
 if(id==='judgement')assert.equal(result.items.length,1,'LV1 summary must not expose LV2 checks');
 if(id==='ask')assert.equal(result.items[2].label,'이렇게 질문');
}
for(const f of ['bim-rules.js','review-rules.js','public-rules.js'])assert(!/document\.|localStorage|setTimeout|MutationObserver/.test(fs.readFileSync(f,'utf8')),f+' must remain independent of browser state');
assert.equal(window.CC_BIM_RULES.context.taskKey('입면 검토'),'facade');
assert.equal(window.CC_BIM_RULES.search.taskKey('입면 검토'),'facade');
assert.equal(window.CC_REVIEW_RULES.topic('건축심의').key,'building');
assert.equal(window.CC_PUBLIC_RULES.intent('공공건축심의'),'review');
// Shared basic HOW must retain BIM supplementation even before LV3.
let attached=0;
const pane={querySelector:()=>null,appendChild(){attached++}};
sandbox.document.getElementById=id=>id==='contextResult'?{querySelector:()=>pane}:null;
window.CC_PROJECT_STORE.active=()=>({bimMode:'revit'});
let contextSource=fs.readFileSync('v233_bim_context.js','utf8');
contextSource=contextSource.replace("if(document.readyState==='loading')", "window.__testBimContext=patchHow;\nif(document.readyState==='loading')");
vm.runInContext(contextSource,sandbox);
for(const level of [1,2,3,4,5]){window.CC_LEVEL_STORE.state=()=>({view:level});window.__testBimContext();}
assert.equal(attached,5,'BIM basic context must remain available at every level');
console.log('PASS: '+cases.length+' real producer cases; comparison, level depth, clarification, node ownership, pure supplements');
