const fs=require('fs');
const assert=require('assert');

const files={
  phase:fs.readFileSync('v246_phase_context.js','utf8'),
  fit:fs.readFileSync('v247_task_phase_fit.js','utf8'),
  route:fs.readFileSync('v248_project_route_judgement.js','utf8'),
  focus:fs.readFileSync('v250_result_action_focus.js','utf8'),
  search:fs.readFileSync('v251_search_reliability.js','utf8'),
  depth:fs.readFileSync('v252_level_depth_progression.js','utf8')
};

assert.match(files.phase,/setTimeout\(enhance,40\)/,'phase context runs first');
assert.match(files.fit,/setTimeout\(enhance,90\)/,'phase fit runs second');
assert.match(files.route,/setTimeout\(enhanceContext,140\)/,'project route runs third');
assert.match(files.focus,/scheduleContext\(190\)/,'action focus finalizes the compact context');
assert.match(files.focus,/readyHow/,'late legacy HOW replacement is reconciled before settling');
assert.match(files.focus,/level>=3/,'responsibility and senior HOW use the native unlocked state');
assert.match(files.depth,/schedule\(230\)/,'level depth guide finalizes the pipeline');
assert.match(files.search,/renderRoute\(route\)\},25\)/,'reliable definitions and comparisons render immediately');
assert.doesNotMatch(files.depth,/schedule\((?:1050|1150)\)/,'old one-second depth delay removed');
assert.doesNotMatch(files.focus,/scheduleContext\((?:700|900)\)/,'old context redraw delays removed');
assert.doesNotMatch([files.focus,files.search,files.depth].join('\n'),/localStorage\.(?:setItem|removeItem|clear)/,'UI and search acceleration must not change stored project data');

console.log('v2.1.55 fast runtime pipeline checks passed');
