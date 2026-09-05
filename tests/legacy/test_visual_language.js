const fs=require('fs');
const assert=require('assert');

const src=fs.readFileSync('v255_visual_language.js','utf8');

assert(src.includes("const VERSION='2.1.59'"),'version must be 2.1.59');
assert(src.includes("event.target.closest('#contextResult .actions [data-drawer]')"),'all drawer buttons must share one delegated controller');
assert(src.includes('event.stopImmediatePropagation()'),'legacy duplicate click handlers must be bypassed');
assert(src.includes('},true);'),'drawer controller must bind during capture');
assert(src.includes("button.setAttribute('aria-controls',pane.id)"),'buttons must identify their controlled pane');
assert(src.includes("item.setAttribute('aria-expanded','false')"),'inactive buttons must reset accessibility state');
assert(src.includes("button.setAttribute('aria-expanded','true')"),'active button must expose its open state');
assert(src.includes("pane.classList.add('show','cc259-pane-reveal')"),'the selected pane must visibly open');
assert(src.includes('ensurePaneSlot(map,actions)'),'drawers must use a stable response slot');
assert(src.includes('slot.append(pane)'),'the opened pane must render inside the response slot');
assert(src.includes('position:relative!important'),'legacy positioned drawers must be normalized');
assert(src.includes('visibility:visible!important'),'the response slot must remain visible on responsive layouts');
assert(src.includes('button.cc-drawer-active{border-color:#2F67BC!important;background:#356FC7!important'),'only the opened button must receive the solid active color');
assert(src.includes('button[data-drawer="how"]:not(.cc-drawer-active)'),'HOW priority must remain distinct from its active state');
assert(src.includes('scrollIntoView'),'an opened pane below the viewport must be revealed');

for(const kind of ['now','material','source','people','steps','caution','done','impact','judgement','context']){
  assert(src.includes(`${kind}:`)||src.includes(`'${kind}'`),`semantic icon '${kind}' must exist`);
}
assert(src.includes('<svg viewBox="0 0 24 24"'),'icons must be code-native SVG pictograms');
assert(src.includes('data-ask-context'), 'WHO must receive its own pictogram');
assert(src.includes('@media(prefers-reduced-motion:reduce)'), 'motion must respect accessibility preferences');
assert(src.includes('if(decorateTimer)return'),'dynamic icon updates must not be starved by legacy mutation storms');
assert(!src.includes('markVersion'),'release labels are owned by index.html');
assert(!/localStorage\.(?:setItem|removeItem|clear)/.test(src),'visual patch must not mutate saved project data');

console.log('v2.1.59 visual language and drawer controller checks passed');
