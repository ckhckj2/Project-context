const fs=require('fs');
const assert=require('assert');
const src=fs.readFileSync('v256_interaction_feedback.js','utf8');

assert(src.includes("const VERSION='2.1.62'"),'version must be 2.1.62');
assert(src.includes("['기존 승인','변경 내용','영향 범위','처리 절차']"),'change work must expose its four-stage reasoning flow');
assert(src.includes('cc260-current-phase'),'the selected project phase must receive a current marker');
assert(src.includes('button.cc-drawer-active:after{content:"열림"'),'drawers must expose a stable open state');
assert(src.includes('cc260-first-action'),'results must direct attention to the first action');
assert(src.includes('--cc260-quiz-progress'),'quiz progress must update visibly');
assert(src.includes('--cc260-project-progress'),'project registration must show completion progress');
assert(src.includes('@media(prefers-reduced-motion:reduce)'),'motion must respect accessibility preferences');
assert(src.includes('transition:background-color .16s ease,border-color .16s ease,color .16s ease'),'more buttons must not animate geometry');
assert(!src.includes('characterData:true,attributes:true'),'UI observers must not watch their own class and style mutations');
assert(src.includes('cc260Percent')&&src.includes('return;'),'project progress rendering must be idempotent');
assert(!src.includes("document.createElement('span')"),'UI polish must not fight the level module by injecting arrow nodes into action buttons');
assert(src.includes('button:hover:before{transform:translateY(-50%)!important}'),'touch hover must not scale action icons');
assert(!/localStorage\.(?:setItem|removeItem|clear)/.test(src),'UI feedback must not mutate saved project data');

console.log('v2.1.62 interaction feedback checks passed');
