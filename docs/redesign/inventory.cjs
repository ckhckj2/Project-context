'use strict';
// Read-only inventory of repository-owned definitions. Never run uploaded scripts.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'v2_data.js'),'utf8')+';window.snapshot={tasks:TASKS,phases:PHASES,facilities:PROJECTS,terms:Object.keys(TERMS)}',ctx);
vm.runInContext(fs.readFileSync(path.join(root,'quiz-bank.js'),'utf8'),ctx);
const trackNames={design:'도면·설계',permit:'법규·인허가',collaboration:'협업·전달'};
const topicTracks={permit:'permit',law:'permit',change:'permit',reviews:'permit',public:'permit',dorm:'permit',officetel:'permit',rental:'permit',mixed:'permit',housing:'permit',maintenance:'permit',airport:'permit',special:'permit',drawings:'design',bim:'design',design:'design',precedent:'design',site:'design',logistics:'design',fab:'design',coordination:'collaboration',purpose:'collaboration',project:'collaboration',phase:'collaboration',judgement:'collaboration'};
const overrides={'2-prep':'permit','3-prep':'permit','4-phase':'permit','2-dorm':'permit','2-rental':'permit','2-version':'permit','3-parking':'permit'};
const levels={
 '1-seum':2,'1-land':2,'1-pm':2,'1-approval':2,'1-version':2,'1-bim':2,'1-compare':2,
 '2-purpose':1,'2-drawings':1,'2-design':1,'2-change':4,'2-dorm':4,'2-rental':4,'2-public':4,'2-ask':3,
 '3-permit':2,'3-drawings':2,'3-facade':2,'3-report':2,'3-qgis':2,'3-precedent':2,'3-prep':4,'3-public':4,'3-owner':4
};
const objectives={1:'위치·목적',2:'수행 방법',3:'협업·연결',4:'조건별 판단',5:'전체 조율'};
const rows=ctx.window.CC_QUIZ_BANK.map(q=>{
 const track=overrides[q.id]||topicTracks[q.topic];if(!track)throw Error('Unmapped '+q.id);
 const proposedLevel=levels[q.id]||q.level;
 const format=/순서/.test(q.prompt)?'order':q.type==='short'?'short':'choice5';
 return {id:q.id,source:'quiz-bank.js',prompt:q.prompt,currentLevel:q.level,currentType:q.type,currentOptionCount:q.options?.length||0,proposedTrack:track,trackLabel:trackNames[track],proposedLevel,objective:objectives[proposedLevel],proposedType:format,status:'editorial-review-required',review:q.type==='short'?'핵심 용어 필요성 검토; 암기만으로 LV1 승급하지 않음':format==='order'?'선후관계에 유일한 정답이 있는지 검토; 병행 업무를 억지 정렬하지 않음':'5지선다용 현실적 오답·선택 이유 재작성; 단순 보기 수 추가 금지'};
});
const counts={};for(const r of rows){const key=r.proposedTrack+':'+r.proposedLevel;counts[key]=(counts[key]||0)+1;}
fs.writeFileSync(path.join(__dirname,'quiz-map.json'),JSON.stringify({status:'proposal-not-runtime-content',sourceCount:rows.length,counts,questions:rows},null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'source-inventory.json'),JSON.stringify({...ctx.window.snapshot,quiz:{total:rows.length,short:rows.filter(r=>r.currentType==='short').length,choice:rows.filter(r=>r.currentType==='choice').length,optionCounts:[...new Set(rows.filter(r=>r.currentType==='choice').map(r=>r.currentOptionCount))]}},null,2)+'\n');
console.log(JSON.stringify({tasks:ctx.window.snapshot.tasks.length,facilities:ctx.window.snapshot.facilities.length,questions:rows.length,counts}));
