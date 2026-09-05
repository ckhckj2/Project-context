const fs=require('node:fs');
const vm=require('node:vm');

const path='v246_phase_context.js';
let source=fs.readFileSync(path,'utf8');
const end=source.lastIndexOf('})();');
source=source.slice(0,end)+"window.__phaseTest={PHASE_ORDER,PHASE_RULES,CHANGE_RULES,phaseRule};"+source.slice(end);

const window={};
const document={
  readyState:'loading',
  getElementById(){return null;},
  querySelectorAll(){return [];},
  addEventListener(){}
};
vm.runInNewContext(source,{window,document,localStorage:{getItem(){return null;}},console,setTimeout});

const {PHASE_ORDER,phaseRule}=window.__phaseTest;
const tasks=['발주처 협의자료 작성','보고서 작성','인허가 자료 작성','지구단위계획 조사','법규 검토','심의 보고자료 작성','입면·디자인 검토','사례조사','모델링','CG·렌더링','도면 수정','협력업체 조정','변경업무 검토'];

function unique(rows,key){return new Set(rows.map(x=>JSON.stringify(x[key]))).size===PHASE_ORDER.length;}
for(const task of tasks){
  const rows=PHASE_ORDER.map(phase=>phaseRule(task,phase));
  for(const key of ['whyText','risk','doneText','material','order','howSteps']){
    if(!unique(rows,key))throw new Error(`${task}: ${key} is not phase-specific`);
  }
}
const changeRows=PHASE_ORDER.map(phase=>phaseRule('변경업무 검토',phase));
if(!changeRows.every(x=>x.howSteps.length===3))throw new Error('change-work HOW steps missing');
console.log(`PASS: ${tasks.length} tasks × ${PHASE_ORDER.length} phases = ${tasks.length*PHASE_ORDER.length} phase-aware combinations`);
