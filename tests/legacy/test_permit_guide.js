'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const sandbox={window:{}};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('review-rules.js','utf8'),sandbox);
const {GUIDE,REVIEWS,guideView,topic}=sandbox.window.CC_REVIEW_RULES;
const keys=Object.keys(REVIEWS).sort();
// Reading priority must never turn an unselected topic into a non-applicable one.
for(const type of Object.keys(GUIDE.types))for(const stage of Object.keys(GUIDE.stages)){
 const result=guideView(type,stage);
 assert.equal(result.priority.length,3);
 assert.deepEqual([...result.priority,...result.others].sort(),keys);
 assert.equal(new Set([...result.priority,...result.others]).size,9);
}
assert.notDeepEqual([...guideView('logistics').priority],[...guideView('public').priority]);
assert.notDeepEqual([...guideView('logistics','early').priority],[...guideView('logistics','site').priority]);
for(const value of ['__proto__','constructor','unknown','<img src=x onerror=alert(1)>',null]){
 const result=guideView(value,value);assert.equal(result.type,'general');assert.equal(result.stage,'all');
}
assert(Object.isFrozen(GUIDE.types.logistics.priority));
for(const key of keys){
 for(const field of ['why','check','scale','timing'])assert(GUIDE.topics[key][field].length>10,key+' '+field);
 // Every drill-down title must resolve to its own detail, not the overview or fallback.
 assert.equal(topic(REVIEWS[key].name)?.key,key,REVIEWS[key].name);
}
for(const q of ['인허가','인 허가','필요한 인허가 확인','물류센터 인허가 검토'])assert.equal(topic(q)?.kind,'guide');
assert.equal(topic('인허가와 건축심의 차이'),null,'comparison keeps its owner');
console.log('PASS permit guide: all topics retained across reading selections, safe unknown values, immutable content and working detail destinations');
