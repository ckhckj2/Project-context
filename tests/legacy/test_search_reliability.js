const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const source=fs.readFileSync('v251_search_reliability.js','utf8');
const sandbox={
  window:{},
  document:{
    readyState:'loading',
    getElementById(){return null},
    addEventListener(){}
  },
  console,
  setTimeout(){return 0},
  MutationObserver:function(){},
  NodeFilter:{SHOW_TEXT:4}
};
vm.createContext(sandbox);
vm.runInContext(source,sandbox);

const api=sandbox.window.CC_SEARCH_RELIABILITY;
assert.equal(api.version,'2.1.53','version marker');

function ids(route){return Array.from(route.terms,item=>item.id)}

let route=api.routeQuery('변경허가와 변경신고의 차이가 뭐예요?');
assert.equal(route.type,'comparison');
assert.deepEqual(ids(route),['change_permit','change_report']);

route=api.routeQuery('건축허가와 사업계획승인은 뭐가 다른가요?');
assert.equal(route.type,'comparison');
assert.deepEqual(ids(route),['building_permit','housing_approval']);

route=api.routeQuery('BIM과 Revit의 차이를 알려줘');
assert.equal(route.type,'comparison');
assert.deepEqual(ids(route),['bim','revit']);

for(const [query,expected] of [
  ['BIM이 뭐예요?','bim'],
  ['QGIS가 뭐예요?','qgis'],
  ['세움터 뜻이 뭐야?','seumteo'],
  ['변경허가는 어떤 의미예요?','change_permit']
]){
  route=api.routeQuery(query);
  assert.equal(route.type,'definition',query);
  assert.equal(ids(route)[0],expected,query);
  assert.equal(route.persona,'neutral',query);
}

assert.equal(api.persona('건축주인데 BIM이 뭔지 궁금해요'),'owner');
assert.equal(api.persona('책임님께 QGIS 확인 업무를 요청받았어요'),'employee');
assert.equal(api.persona('QGIS가 뭐예요?'),'neutral');
route=api.routeQuery('책임님께 BIM이 뭔지 알아보라는 업무를 요청받았어요');
assert.equal(route.type,'definition');
assert.equal(route.persona,'employee');
assert.equal(api.routeQuery('입면 디자인 검토 업무를 맡았어요').type,'legacy');

assert.match(source,/comparison.*definition.*legacy/s,'comparison must precede definition and legacy routes');
assert.match(source,/data-cc253="comparison"/,'comparison renderer');
assert.match(source,/data-cc253="definition"/,'definition renderer');
assert.match(source,/건축주·비전공자 기준/,'owner-facing label');
assert.match(source,/프로젝트의 BIM 목적·요구사항 확인/,'BIM and Revit comparison action');
assert.match(source,/claimed\.click\(\)/,'legacy specific-task router bridge');
assert.match(source,/상사가 시킨 일을/,'legacy employee-copy repair');
assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/,'routing pass must not mutate project storage');

console.log('v2.1.53 search reliability checks passed');
