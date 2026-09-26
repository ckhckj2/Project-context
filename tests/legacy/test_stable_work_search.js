'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const routes=new Map();
const output={classList:{remove(){}},set innerHTML(html){this.html=html;this.firstElementChild={}},get innerHTML(){return this.html}};
const window={CC_BOOT:{register(_id,install){install()}},CC_RUNTIME:{registerSearch:(id,match,render)=>routes.set(id,{match,render})}};
const sandbox={window,document:{getElementById(id){assert.equal(id,'searchResult','independent search must not borrow home/project fields');return output}},console};
vm.createContext(sandbox);
for(const file of ['level-policy.js','work-rules.js','work-model.js','search-answer.js','v217_precedent_search.js','v240_specific_intent_priority.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
const precedent=routes.get('precedent');
function answer(query){const data=precedent.match(query);assert(data,query);precedent.render(data,query);return window.CC_SEARCH_ANSWER.read(output.firstElementChild)}
for(const query of ['물류센터 입면사례 찾으래','물류 센터 파사드 레퍼런스 찾아오래','물류센터 입면사레 찾아오래']){
 const result=answer(query);assert.equal(result.title,'물류·창고시설 · 입면 사례조사');assert.match(result.items[1].body,/창호 모듈/);
}
assert.equal(answer('운수시설 중간설계 사례를 조사하래요').title,'운수시설 · 중간설계 · 사례조사');
assert.match(output.html,/중간설계에서의 조사/);
assert.match(answer('병원 평면 사례를 찾아주세요').items[1].body,/공간 관계·운영 동선/);
assert.doesNotMatch(answer('병원 평면 사례를 찾아주세요').items[1].body,/창호 모듈/);
assert.match(answer('학교 사전기획 배치 사례 조사').title,/사전기획 \/ 사업검토/);
assert.match(answer('도서관 실시설계 단면 레퍼런스').title,/도서관 · 실시설계 · 단면/);
assert.match(answer('입면 사례 조사').context,/용도 미입력 · 설계단계 미입력/);
assert.doesNotMatch(output.html,/공동주택|현재 프로젝트 규모·메모/);
assert.match(answer('계획설계인지 중간설계인지 모르겠는데 입면 사례').context,/설계단계가 둘 이상/);
assert.equal(answer('물류센터인지 공장인지 모르겠는데 중간설계 입면 사례'),null,'ambiguous use needs a choice before a tailored answer');
assert.equal((output.html.match(/data-search-query=/g)||[]).length,2);
const query=output.html.match(/data-search-query="([^"]+)/)[1];
assert.match(answer(query).title,/물류·창고시설 · 중간설계 · 입면/);
assert.match(answer('주상복합 트윈 타워 포디움 입면 사례').items[1].body,/트윈타워·2개동 구성 \+ 포디움/);
assert.equal(answer('법규검토 말고 입면 사례 조사').title,'입면 사례조사');
for(const query of ['입면 사례 말고 도면 수정','도면 고치래','사례금 지급','알 수 없는 지시'])assert.equal(precedent.match(query),null);
answer('<img src=x onerror=alert(1)> 물류센터 입면사례');assert.doesNotMatch(output.html,/<img|onerror/);
const specific=routes.get('specific');
for(const query of ['계획설계 도면 고치래','입면도를 고쳐달래','코멘트를 반영해달래','입면 사례 말고 도면을 수정해달래'])assert.equal(specific.match(query).id,'revision',query);
for(const query of ['보고용 자료 만들어달래','회의 자료 준비해달래'])assert.equal(specific.match(query).id,'report',query);
assert.equal(specific.match('도면 수정은 누구한테 물어봐?'),null,'WHO remains with its existing owner');
console.log('PASS: natural work phrases, explicit/unknown/ambiguous context, scope-specific guidance and independent search isolation');
