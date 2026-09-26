const fs=require('fs');
const assert=require('assert');

const source=fs.readFileSync('v249_home_search_focus.js','utf8')+require('../component-style.cjs')('v249_home_search_focus.js');

assert.match(source,/const VERSION='2\.1\.51'/,'version marker');
assert.match(source,/cc251-quick-examples/,'six quick examples');
assert.match(source,/nth-child\(n\+7\)/,'quick-example visibility guard');
assert.match(source,/CC_BOOT\.register/,'central startup registration');
assert(!source.includes('markVersion'),'release labels are owned by index.html');
assert.match(source,/not\(\[open\]\)>:not\(summary\).*display:none!important/,'closed folds override legacy important displays');
assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/,'UI pass must not mutate stored project data');
assert.doesNotMatch(source,/function\s+runSearch\s*\(/,'UI pass must not replace search routing');

console.log('v2.1.51 home/search focus checks passed');
