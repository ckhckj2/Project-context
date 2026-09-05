const fs=require('fs');
const assert=require('assert');

const source=fs.readFileSync('v249_home_search_focus.js','utf8');

assert.match(source,/const VERSION='2\.1\.51'/,'version marker');
assert.match(source,/cc251-structured/,'structured search fold');
assert.match(source,/내 업무 맥락 보기/,'practitioner-first context label');
assert.match(source,/cc251-entry-grid/,'desktop context and search priority grid');
assert.match(source,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'equal desktop entry ratio');
assert.match(source,/cc251-context-open/,'expanded context focus state');
assert.match(source,/cc251-popular-fold/,'popular questions fold');
assert.match(source,/cc251-flow-fold/,'workflow fold');
assert.match(source,/cc251-topic-fold/,'popular topics fold');
assert.match(source,/cc251-quick-examples/,'six quick examples');
assert.match(source,/nth-child\(n\+7\)/,'quick-example visibility guard');
assert.match(source,/DOMContentLoaded/,'late-load install guard');
assert(!source.includes('markVersion'),'release labels are owned by index.html');
assert.match(source,/not\(\[open\]\)>:not\(summary\).*display:none!important/,'closed folds override legacy important displays');
assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/,'UI pass must not mutate stored project data');
assert.doesNotMatch(source,/function\s+runSearch\s*\(/,'UI pass must not replace search routing');

console.log('v2.1.51 home/search focus checks passed');
