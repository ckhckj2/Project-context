'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const sandbox={window:{}};vm.createContext(sandbox);
for(const file of ['level-policy.js','work-rules.js','work-model.js']){
 const source=fs.readFileSync(file,'utf8');
 assert(!/\bdocument\b|\blocalStorage\b|\bsetTimeout\s*\(|\bMutationObserver\b/.test(source),file+' must be UI independent');
 vm.runInContext(source,sandbox,{filename:file});
}
const {CC_WORK_RULES:r,CC_WORK_MODEL:m,CC_LEVEL_POLICY:l}=sandbox.window;
const tasks=['발주처 협의자료 작성','보고서 작성','인허가 자료 작성','지구단위계획 조사','법규 검토','심의 보고자료 작성','입면·디자인 검토','사례조사','모델링','CG·렌더링','도면 수정','협력업체 조정','변경업무 검토'];
let combinations=0;
for(const task of tasks)for(const phase of r.phase.PHASE_ORDER)for(let lv=1;lv<=5;lv++){
 const a=m.resolve({task,phase,levelValues:{pc_level:String(lv)}});
 assert.equal(a.how.steps.length,3);assert(a.why.why&&a.why.material&&a.how.done);
 assert.equal(a.level.depth,Math.min(4,lv));
 assert.equal(a.why.why,r.phase.phaseRule(task,phase).whyText);
 const saved=a.how.steps[0];a.how.steps[0]='external mutation';
 assert.equal(m.resolve({task,phase}).how.steps[0],saved,'answers cannot mutate shared rules');combinations++;
}
const project={typeId:'airport',approvalRoute:'airport',businessMode:'special',routeException:'change'};
const input={task:'변경업무 검토',phase:'기본계획',facilityId:'airport',source:'context',project,fitMode:'actual'};
const before=JSON.stringify(input),a=m.resolve(input);assert.equal(JSON.stringify(input),before);
assert.equal(a.route.route,'airport');assert(a.how.title.includes('공항'));
assert.equal(m.resolve({...input,source:'search'}).route,null,'independent query must not borrow saved route');
assert.equal(m.resolve({...input,facilityId:'multi'}).route,null,'different selected facility must not borrow saved route');
const prep=m.resolve({task:'인허가 자료 작성',phase:'기본계획',fitMode:'prep'});
assert.equal(prep.fit.status,'prep');assert(prep.why.title.includes('선행 준비'));assert(prep.how.note.includes('고정 제출목록보다'));
assert.equal(m.fitAnswer('unknown','기본계획','prep'),null);
assert.equal(l.resolve({pc_level:'2',pc_master_certified:'1',pc_master_preview_level:'5'}).depth,4);
assert.equal(l.resolve({pc_level:'2',pc_master_preview_level:'4'}).view,2);
assert.equal(l.resolve({pc_level:'bad',pc_progress_level:'99'}).actual,1);
assert.equal(m.resolve({task:'모르는 업무',phase:'모르는 단계'}).phase,null);
console.log('PASS '+combinations+' work/phase/level combinations, isolated project context, immutable outputs and pure level policy');
