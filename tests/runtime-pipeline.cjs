'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script src="\.\/(.*?)\?/g)].map(m=>m[1]);
let input={value:''},output={children:[{}]},busy;
const handlers={},observers=[];
const contextRoot={children:[{}],setAttribute(_,value){busy=value}};
const sandbox={window:{},document:{readyState:'loading',getElementById:id=>({searchInput:input,searchResult:output,contextResult:contextRoot}[id]),addEventListener(type,fn){handlers[type]=fn}},MutationObserver:class{constructor(fn){this.callback=fn;observers.push(this)}observe(root,options){this.options=options;this.connected=true}disconnect(){this.connected=false}},console};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('app-runtime.js','utf8'),sandbox);
handlers.DOMContentLoaded();
const runtime=sandbox.window.CC_RUNTIME;

// Exercise actual classifiers without running UI installers or copying their rules.
for(const file of scripts){
  if(file==='app-runtime.js')continue;
  let source=fs.readFileSync(file,'utf8');
  assert(!/window\.runSearch\s*=/.test(source),file+': search entry must not be reassigned');
  if(['judgement-data.js','judgement-engine.js'].includes(file)){vm.runInContext(source,sandbox,{filename:file});continue;}
  if(!source.includes('registerSearch('))continue;
  const registrations=source.split('\n').filter(line=>line.includes('window.CC_RUNTIME.registerSearch(')).map(line=>{
    // v21 retains a compact installer on one line: take only the registration.
    const start=line.indexOf('window.CC_RUNTIME.registerSearch(');
    return line.slice(start).replace(/;\}\s*$/,';');
  }).join('\n');
  source=source.replace(/if\(document\.readyState==='loading'\)[\s\S]*?(?=\}\)\(\);\s*$)/,registrations+'\n');
  vm.runInContext(source,sandbox,{filename:file});
}
for(const item of sandbox.window.CC_JUDGEMENT_DATA)assert.equal(runtime.classify(item.title).id,'judgement',item.title);
const cases=[
 ['변경허가와 변경신고의 차이가 뭐야?','comparison'],
 ['BIM과 Revit의 차이가 뭐야?','concept-comparison'],
 ['처음 보는 A와 B의 차이가 뭐야?','concept-comparison'],
 ['입면 디자인 검토는 누구에게 물어봐?','ask'],
 ['변경허가가 뭐야?','definition'],
 ['BIM이 뭐야?','definition'],
 ['세움터 제출 전 자료 누락 체크리스트','permit-workflow'],
 ['공항 실시계획 변경업무','change'],
 ['정비사업 사업시행계획 변경','change'],
 ['공공건축심의 흐름','public'],
 ['건축심의는 언제 확인해?','reviews'],
 ['Revit 중앙파일 작업','bim'],
 ['입면 사례 조사','precedent'],
 ['입면 디자인 검토 업무를 요청받았어요. 무엇부터 확인하면 될까요?','specific'],
 ['QGIS 확인을 요청받았어요. 무엇부터 확인해?','common'],
 ['도로 검토를 요청받았어요','common'],
 ['법규검토 업무를 요청받았어요','common'],
 ['모델링 요청받았어요','specific'],
 ['기숙사로 계획해도 될까요?','judgement'],
 ['공항 안의 건물은 어떤 승인경로일까요?','judgement'],
 ['임대사업이면 승인경로가 달라지나요?','judgement'],
 ['알 수 없는 업무','fallback']
];
for(const [q,id] of cases)assert.equal(runtime.classify(q).id,id,q);
assert.equal(runtime.classify(' ').id,'empty');
assert.equal(runtime.diagnostics().routes.length,17,'every search provider registered');
assert.throws(()=>runtime.registerSearch('ask',()=>true,()=>{}),/Duplicate/);

// Composition uses dependencies, not registration/load timing.
const calls=[];
runtime.registerContext('depth',()=>calls.push('depth'));
runtime.registerContext('phase',()=>calls.push('phase'));
runtime.registerContext('how',()=>calls.push('how'));
runtime.renderContext();
assert.deepEqual(calls,['how','phase','depth']);
assert.equal(busy,'false');
runtime.registerResult('visual',()=>{assert.equal(observers[0].connected,false);calls.push('visual')});
runtime.refreshResult();
assert.equal(observers[0].connected,true);
assert.deepEqual(Object.keys(observers[0].options),['childList'],'nested disclosures never cause result rebuilds');
calls.length=0;runtime.refreshContextPresentation();
assert.deepEqual(calls,['depth'],'a phase-fit choice must not recreate base HOW or its gate');
console.log('PASS: '+cases.length+' real routing cases; deterministic composition, observer isolation, phase-fit preservation');
