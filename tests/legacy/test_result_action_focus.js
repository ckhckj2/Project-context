const fs=require('fs');
const assert=require('assert');

const source=fs.readFileSync('v250_result_action_focus.js','utf8');

assert.match(source,/const VERSION='2\.1\.52'/,'version marker');
assert.match(source,/핵심 답변/,'answer-first summary');
assert.match(source,/cc252-action-grid/,'three-action result grid');
assert.match(source,/상세 답변 보기/,'progressive detail control');
assert.match(source,/cc252-context-flow/,'collapsed project flow');
assert.match(source,/레벨과 관계없이 먼저 확인/,'always-visible starter guidance');
assert.match(source,/기본 공개 · WHY \/ WHERE/,'LV1 why and material access');
assert.match(source,/기본 공개 · HOW/,'pre-LV3 execution access');
assert.match(source,/cc252-unified-how/,'single deep HOW sequence');
assert.match(source,/전체 실행 체크리스트 보기/,'LV3 depth fallback');
assert.match(source,/replace\(\/\^\\d\+/,'duplicate action-number cleanup');
assert.match(source,/bindDrawer/,'locked drawer override');
assert.match(source,/cc252Key/,'context mutation loop guard');
assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/,'UI stage must not mutate project storage');
assert.doesNotMatch(source,/function\s+runSearch\s*\(/,'UI stage must not replace routing');

console.log('v2.1.52 result and level-focus checks passed');
