const fs=require('node:fs');
const vm=require('node:vm');

const path='v246_phase_context.js';
let source=fs.readFileSync(path,'utf8');
const end=source.lastIndexOf('})();');
source=source.slice(0,end)+"window.__phaseTest={PHASE_ORDER,PHASE_RULES,CHANGE_RULES,phaseRule};"+source.slice(end);

const window={CC_BOOT:{register(){}}};
const document={
  readyState:'loading',
  getElementById(){return null;},
  querySelectorAll(){return [];},
  addEventListener(){}
};
vm.runInNewContext(fs.readFileSync('work-rules.js','utf8'),{window});
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

// A project flow may omit the selected design stage; never relabel another job.
const assert=require('node:assert/strict');
const flowWindow={CC_BOOT:{register(){}}};
vm.runInNewContext(fs.readFileSync('v219_ask_mascot.js','utf8'),{window:flowWindow});
const match=flowWindow.phaseIndex;
const logistics=['사업성격 확인','입지·차량동선 검토','규모·법규 검토','계획설계','소방·교통 협의','허가/승인','공사','사용·준공'];
assert.equal(match(logistics,'계획설계'),3);
assert.equal(match(logistics,'중간설계'),-1);
assert.equal(match(logistics,'실시설계'),-1);
assert.equal(match(logistics,'잘 모르겠습니다'),-1);
assert.equal(match(['사업계획승인','실시계획승인','공사'],'실시설계'),-1);
assert.equal(match(['기본·계획설계','심의','중간·실시설계'],'기본계획'),0);
assert.equal(match(['기본·계획설계','심의','중간·실시설계'],'중간설계'),2);
assert.equal(match(['기본·계획설계','심의','중간·실시설계'],'실시설계'),2);
assert.equal(match(['중간설계','실시설계'],'중간설계'),0);
assert.equal(match(['중간설계','실시설계'],'실시설계'),1);
assert.equal(match(['입지·차량동선 검토','소방·교통 협의'],'계획설계'),-1);
for(const phase of ['__proto__','constructor','',null])assert.equal(match(logistics,phase),-1);
assert.equal(match([], '중간설계'),-1);
console.log('PASS flow matching: omitted stages remain unmatched; approval plans are not design stages');
