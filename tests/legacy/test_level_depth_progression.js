const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const source=fs.readFileSync('v252_level_depth_progression.js','utf8');
const sandbox={
  window:{},
  document:{readyState:'loading',getElementById(){return null},addEventListener(){}},
  console,
  setTimeout(){return 0},
  clearTimeout(){},
  MutationObserver:function(){}
};
vm.createContext(sandbox);
vm.runInContext(source,sandbox);

const api=sandbox.window.CC_LEVEL_DEPTH;
assert.equal(api.version,'2.1.56');
assert.deepEqual(Array.from(api.depths,item=>item.name),['핵심 실행','근거·위험','절차·협업','판단·예외']);
assert.deepEqual(Array.from(api.openAreas),['context','how','why','who','caution']);

assert.match(source,/모든 정보영역 열림/,'all areas are visibly open');
assert.match(source,/메뉴가 새로 열리는 것이 아니라/,'depth-not-unlock explanation');
assert.match(source,/모든 레벨에서 바로 확인/,'always-available context label');
assert.match(source,/지금도 목적·자료·완료기준을 모두 볼 수 있어요/,'LV1 WHY completeness');
assert.match(source,/지금도 수행순서·협업대상·완료기준을 모두 볼 수 있어요/,'LV1 HOW completeness');
assert.match(source,/bindOpenDrawer/,'drawer unlock behavior');
assert.match(source,/function normalizeActionShell/,'consistent action shell');
assert.match(source,/if\(current!==button\)actions\.insertBefore\(button,current\|\|null\)/,'only repair action order when needed');
assert.doesNotMatch(source,/actions\.append\(button\)/,'stable action order must not create a mutation loop');
assert.match(source,/cc256-building/,'atomic loading state');
assert.match(source,/cc256-ready/,'single completed reveal');
assert.match(source,/aria-busy/,'loading state accessibility');
assert.match(source,/prefers-reduced-motion/,'motion accessibility');
assert.match(source,/removeAttribute\('aria-disabled'\)/,'aria lock removal');
assert.match(source,/@media\(max-width:760px\)/,'responsive guard');
assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/,'depth UI must not mutate stored projects');

console.log('v2.1.56 atomic level-depth checks passed');
