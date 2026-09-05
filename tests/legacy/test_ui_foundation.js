const fs=require('node:fs');
const assert=require('node:assert');

const source=fs.readFileSync('v253_ui_foundation.js','utf8');

assert.match(source,/const VERSION='2\.1\.57'/,'version');
assert.match(source,/function syncNavigation\(\)/,'navigation state sync');
assert.match(source,/removeAttribute\('aria-current'\)/,'stale aria state removed');
assert.match(source,/setAttribute\('aria-current','page'\)/,'current page announced');
assert.match(source,/\.view\.active/,'active view is the source of truth');
assert.match(source,/:focus-visible/,'keyboard focus is visible');
assert.match(source,/min-height:44px/,'minimum desktop click target');
assert.match(source,/\.cc252-action-grid p[^}]*font-size:13px/s,'search summary readability');
assert.match(source,/\.cc252-brief-grid p[^}]*font-size:12\.5px/s,'context summary readability');
assert.match(source,/\.cc254-depth-track small[^}]*font-size:9\.5px/s,'tiny level copy increased');
assert.match(source,/@media\(max-width:760px\)/,'responsive guard');
assert.match(source,/@media\(prefers-reduced-motion:reduce\)/,'reduced-motion guard');
assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/,'UI layer must not mutate projects or levels');

console.log('v2.1.57 UI foundation checks passed');
