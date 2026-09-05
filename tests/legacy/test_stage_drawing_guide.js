const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const source=fs.readFileSync('v257_stage_drawing_guide.js','utf8');
const sandbox={
  window:{},document:{readyState:'loading',addEventListener(){},getElementById(){return null}},
  setTimeout(){return 1},clearTimeout(){},MutationObserver:function(){},console
};
vm.createContext(sandbox);
vm.runInContext(source,sandbox);

const guide=sandbox.window.CC_STAGE_DRAWING_GUIDE;
assert(guide,'drawing guide API must exist');
assert.strictEqual(guide.version,'2.1.65');
assert.deepStrictEqual(Array.from(Object.keys(guide.stages)),['plan','middle','detail']);
assert.strictEqual(guide.stageFromPhase('계획설계'),'plan');
assert.strictEqual(guide.stageFromPhase('중간설계'),'middle');
assert.strictEqual(guide.stageFromPhase('실시설계'),'detail');
assert.strictEqual(guide.stageFromPhase('시공·현장 대응'),'detail');

for(const [key,stage] of Object.entries(guide.stages)){
  assert.strictEqual(stage.groups.length,4,`${key} must expose four compact drawing groups`);
  for(const group of stage.groups)assert(group.items.length>=4,`${key}/${group.title} needs representative items`);
}

assert(guide.projectExtras('공동주택').some(item=>item.includes('단위세대')));
assert(guide.projectExtras('물류창고').some(item=>item.includes('물류')));
assert(guide.projectExtras('박물관').some(item=>item.includes('운영')));
assert(source.includes('실제 납품·심의·허가 목록은 회사, 계약, 발주방식, 프로젝트 조건에 따라 달라집니다'));
assert(source.includes('과업지시서·계약'));
assert(source.includes('심의·허가 요구'));
assert(source.includes('협력분야 일정'));
assert(source.includes("style.id='cc264DrawingStyle'"),'drawing guide style id must not collide with the v2.1.57 foundation style');
assert(source.includes('프로젝트별·제출 전 추가 확인'),'secondary information must be progressively disclosed');
assert(source.includes('font-size:12px;line-height:1.5'),'drawing list text must match the readable context scale');
assert(!/locked|disabled\s*=/.test(source),'drawing guide must not lock information by level');
assert(!source.includes('translateY('),'drawing guide buttons must not use geometry motion');
assert(source.includes("if(!root||!root.innerHTML.trim())return;"),'empty results must not start a polling loop');
assert(source.includes("if(event.target.closest('#analyze,.master-levels button'))schedule(420);\n  },true);"),'context generation must be observed in capture phase');

console.log('v2.1.65 stage drawing guide checks passed');
