(()=>{
'use strict';
const data=window.CC_JUDGEMENT_DATA;
const routeCases={housing:'housing',maintenance:'maintenance',airport:'airport',logistics:'logistics',industry:'fab',special:'special',multiple:'special'};
function topics(text='',typeId=''){
 const q=String(text).toLowerCase();
 const explicit=data.filter(c=>c.keywords.some(word=>q.includes(word.toLowerCase())));
 return explicit.length?explicit:data.filter(c=>c.types.includes(typeId));
}
function match(query){
 if(/누구|물어|문의|차이|비교|정의|뜻|뭐야|무엇인가/.test(query))return null;
 if(!/판단|애매|가능|달라지|어디까지|확정하면|같은 절차|무엇을.*정|될까|되나|해도|맞나|맞을|어느|어떤.*(경로|승인|기준)|모두|우선|충돌|갈등|단정|필요.*없|생략/.test(query))return null;
 return topics(query).length?{query}:null;
}
function evaluate(input={}){
 const explicit=topics(input.query);
 let found=explicit.length?explicit:topics('',input.typeId);
 if(!explicit.length&&routeCases[input.approvalRoute]){const routed=data.find(c=>c.id===routeCases[input.approvalRoute]);found=[routed,...found.filter(c=>c.id!==routed.id)];}
 if(!found.length)found=data.filter(c=>c.id===('법규 인허가 변경 심의'.split(' ').some(x=>String(input.task).includes(x))?'special':'design'));
 const c=found.find(x=>x.id===input.topicId)||found[0];
 const saved=!!input.approvalRoute&&input.approvalRoute!=='unknown';
 const unresolved=!saved||input.approvalRoute==='multiple'||input.approvalRoute==='special';
 const phase=String(input.phase||'단계 미정');
 const stage=/실시설계|시공/.test(phase)?'최종 도서·발주·시공 반영 전, 변경 권한과 재작업 영향을 확인':/중간설계/.test(phase)?'분야별 기준일·간섭·미회신 항목을 정리한 뒤 조정 결론 확인':'계획 가정과 나중에 확정할 조건을 구분하고 이번 의사결정 범위 확인';
 return {topic:c,topics:found,state:unresolved?'추가 조건 확인':'입력 조건에 따른 검토',evidence:saved?'저장된 승인경로는 사용자 입력이며 승인문서 확인을 대체하지 않습니다.':'원 승인경로가 확인되지 않았습니다. 시설명만으로 절차를 확정하지 않습니다.',stage,phase,task:String(input.task||'판단 검토'),level:Math.min(4,Math.max(1,Number(input.level)||1))};
}
const relatedCases={dorm:['rental','housing','mixed'],officetel:['rental','mixed','housing'],rental:['housing','dorm','officetel'],mixed:['housing','officetel','rental'],housing:['rental','mixed','maintenance'],maintenance:['housing','mixed','special'],airport:['special','design'],logistics:['fab','special','design'],fab:['logistics','special','design'],special:['design'],design:[]};
function contextTopics(input={}){
 // Facility context owns the first card. Cross-project learning never replaces it.
 const primary=topics('',input.typeId)[0]||evaluate({...input,query:'',approvalRoute:'unknown'}).topic;
 return {primary,related:(relatedCases[primary.id]||[]).map(id=>data.find(c=>c.id===id)).filter(Boolean)};
}
window.CC_JUDGEMENT=Object.freeze({topics,match,evaluate,contextTopics});
})();
