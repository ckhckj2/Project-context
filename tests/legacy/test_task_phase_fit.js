const fs=require('node:fs');
const vm=require('node:vm');
let source=fs.readFileSync('v247_task_phase_fit.js','utf8');
const end=source.lastIndexOf('})();');
source=source.slice(0,end)+'window.__fitTest={MATRIX,COPY,PREP,ACTUAL,classify};'+source.slice(end);
const window={};
const document={readyState:'loading',getElementById(){return null;},querySelectorAll(){return []},addEventListener(){}};
vm.runInNewContext(source,{window,document,localStorage:{getItem(){return null}},setTimeout});
const t=window.__fitTest;
const phases=['사전기획 / 사업검토','기본계획','계획설계','중간설계','실시설계','시공·현장 대응'];
if(Object.keys(t.MATRIX).length!==13)throw new Error('expected 13 tasks');
const taskLabels=['심의 보고자료 작성','인허가 자료 작성','변경업무 검토','발주처 협의자료 작성','보고서 작성','지구단위계획 조사','법규 검토','입면·디자인 검토','사례조사','모델링','CG·렌더링','도면 수정','협력업체 조정'];
for(const task of taskLabels)for(const phase of phases)if(!t.classify(task,phase))throw new Error('unclassified: '+task+' / '+phase);
for(const [key,item] of Object.entries(t.MATRIX)){
  if(Object.keys(item.phases).length!==phases.length)throw new Error(key+': incomplete phase matrix');
  for(const phase of phases)if(!item.phases[phase])throw new Error(key+': missing '+phase);
  if(!t.PREP[key]||t.PREP[key].steps.length!==3)throw new Error(key+': prep content missing');
  if(!t.ACTUAL[key]||t.ACTUAL[key].length!==3)throw new Error(key+': actual content missing');
  const used=new Set(Object.values(item.phases));
  for(const status of ['prep','conditional','mismatch'])if(used.has(status)&&!t.COPY[key]?.[status])throw new Error(key+': copy missing for '+status);
}
const expected=[
  ['심의 보고자료 작성','기본계획','prep'],
  ['심의 보고자료 작성','시공·현장 대응','mismatch'],
  ['인허가 자료 작성','기본계획','prep'],
  ['인허가 자료 작성','계획설계','conditional'],
  ['변경업무 검토','기본계획','conditional'],
  ['변경업무 검토','실시설계','normal'],
  ['발주처 협의자료 작성','시공·현장 대응','normal'],
  ['보고서 작성','사전기획 / 사업검토','normal'],
  ['지구단위계획 조사','계획설계','conditional'],
  ['지구단위계획 조사','시공·현장 대응','mismatch'],
  ['법규 검토','시공·현장 대응','conditional'],
  ['입면·디자인 검토','사전기획 / 사업검토','prep'],
  ['입면·디자인 검토','계획설계','normal'],
  ['사례조사','실시설계','conditional'],
  ['모델링','시공·현장 대응','conditional'],
  ['CG·렌더링','실시설계','conditional'],
  ['도면 수정','사전기획 / 사업검토','conditional'],
  ['협력업체 조정','기본계획','normal']
];
for(const [task,phase,status] of expected){
  const got=t.classify(task,phase)?.status;
  if(got!==status)throw new Error(task+' / '+phase+': '+got+' !== '+status);
}
const counts={normal:0,prep:0,conditional:0,mismatch:0};
for(const item of Object.values(t.MATRIX))for(const status of Object.values(item.phases))counts[status]++;
const wanted={normal:53,prep:5,conditional:18,mismatch:2};
for(const key of Object.keys(wanted))if(counts[key]!==wanted[key])throw new Error(key+': '+counts[key]+' !== '+wanted[key]);
if(!source.includes("scope:'all-13'")||!source.includes('단계에 맞게 다시 보기')||!source.includes('이 단계에서 실제 수행해요'))throw new Error('full-scope UI labels missing');
console.log('PASS: 13 tasks × 6 phases = 78 compatibility decisions',counts);
