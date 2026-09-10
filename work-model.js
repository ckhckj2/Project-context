(()=>{
'use strict';
// A UI-independent answer model. Callers supply selection and saved project explicitly.
const rules=window.CC_WORK_RULES;
function copy(value){
 if(Array.isArray(value))return value.map(copy);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k,v])=>k!=='re'&&typeof v!=='function').map(([k,v])=>[k,copy(v)]));
 return value;
}
function fitAnswer(key,phase,mode){
 const {PREP,ACTUAL,ADMIN}=rules.fit,d=PREP[key];if(!d)return null;
 if(mode==='actual')return {how:{title:phase+(ADMIN.has(key)?' · 실제 절차 확인 후 수행':' · 실제 수행 기준 확인'),note:ADMIN.has(key)?'정확한 절차명·승인권자·현재 접수단계를 확인한 경우에만 진행하세요.':'업무 목적·최신 기준자료·검토자를 확인한 뒤 진행하세요.',steps:[...ACTUAL[key]]}};
 if(!['prep','check'].includes(mode))return null;
 return {why:{title:(mode==='prep'?'선행 준비 · ':'단계 맞춤 · ')+phase+'에서 먼저 확인할 내용',why:d.why,risk:d.risk,done:d.done,material:d.material,source:d.source,order:d.order},how:{title:phase+' · 현재 단계에 맞춘 확인 순서',note:ADMIN.has(key)?'고정 제출목록보다 적용 절차와 공식 확인처부터 좁히세요.':'업무명보다 지금 이 결과물이 지원할 결정을 먼저 확인하세요.',steps:[...d.steps],material:d.material,done:d.done}};
}
function resolve(input={}){
 const task=String(input.task||''),phase=String(input.phase||''),facilityId=String(input.facilityId||'');
 const base=copy(rules.task.taskRule(task)),d=rules.phase.phaseRule(task,phase);
 const fit=rules.fit.classify(task,phase);
 // An independent question or another selected facility must not borrow a saved approval route.
 const project=input.source==='context'&&input.project&&input.project.typeId===facilityId?input.project:null;
 const route=project?rules.route.judgement(project,task,phase):null;
 const level=window.CC_LEVEL_POLICY.resolve(input.levelValues);
 const model={input:{task,phase,facilityId,source:input.source==='context'?'context':'search'},level,base,fit:fit?{...fit}:null,route:copy(route),
  why:{title:task+'의 목적과 확인자료',why:base.why,material:base.material,done:base.done},
  how:{title:task+'의 수행 순서',steps:[...base.steps],material:base.material,owner:base.owner,done:base.done},
  detailedHow:copy(rules.how.howData(task)),phase:null};
 if(d){model.phase={...copy(d),howTitle:d.how(task)};Object.assign(model.why,{title:phase+' · '+task+'의 목적과 확인자료',why:d.whyText,risk:d.risk,done:d.doneText,material:d.material,source:d.source,order:d.order});Object.assign(model.how,{title:d.how(task),note:d.note,steps:[...d.howSteps],done:d.doneText,material:d.material});}
 if(fit&&fit.status!=='normal'&&input.fitMode){const answer=fitAnswer(fit.key,phase,input.fitMode);if(answer){Object.assign(model.why,answer.why);Object.assign(model.how,answer.how);}}
 if(route&&input.fitMode==='actual')Object.assign(model.how,{title:(route.known?rules.route.ROUTES[route.route]:'승인경로 미확인')+' · 프로젝트 기준 수행',note:'저장된 값은 출발점이며 실제 승인서·승인기관·최신 운영기준으로 다시 확인하세요.',steps:rules.route.contextSteps(route)});
 return model;
}
window.CC_WORK_MODEL=Object.freeze({resolve,fitAnswer});
})();
