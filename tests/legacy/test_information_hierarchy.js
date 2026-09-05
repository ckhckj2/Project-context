const fs=require('fs');
const assert=require('assert');

const src=fs.readFileSync('v254_information_hierarchy.js','utf8');

assert(src.includes("const VERSION='2.1.58'"),'version must be 2.1.58');
assert(src.includes("document.createElement('details')"),'depth guide must become a native disclosure');
assert(src.includes("fold.className='cc254-depth-guide cc258-depth-fold'"),'fold must retain the legacy depth-guide hook');
assert(src.includes("fold.dataset.cc254Key=guide.dataset.cc254Key"),'fold must preserve the level renderer key');
assert(src.includes('brief.after(actions)'),'actions must follow the current-task brief');
assert(src.includes("const paneSlot=map.querySelector(':scope>.cc259-active-pane-slot')"),'hierarchy must detect the stable response slot');
assert(src.includes('actions.after(paneSlot)'),'the response slot must remain directly below its button row');
assert(src.includes('const guideAnchor=paneSlot||openPane||actions'),'collapsed level depth must follow opened content or the action row');
assert(src.includes('guide.after(flow)'),'optional project flow must follow the main hierarchy');
assert(src.includes('repeat(5,minmax(0,1fr))'),'desktop context actions must use one five-item row');
assert(src.includes('button[data-drawer="how"]'),'HOW must have explicit visual priority');
assert(src.includes("source.classList.contains('cc245-card')"),'comparison cards must use their semantic source');
assert(src.includes("index?'right':'left'")&&src.includes('.cc258-compare-right'),'comparison must retain distinct left and right sides');
assert(src.includes('.cc258-vs'),'comparison must display a dedicated VS marker');
assert(src.includes('-webkit-line-clamp:2'),'standard summaries must expose fewer lines');
assert(src.includes("root.classList.remove('cc252-detail-open')"),'a new query must reset the previous detail-open state');
assert(src.includes('MutationObserver'),'dynamic context and search content must be repatched');
assert(src.includes('if(contextTimer)return'),'context updates must be throttled so legacy mutation storms cannot starve the patch');
assert(src.includes('@media(max-width:900px)'),'tablet layout must be handled');
assert(src.includes('@media(max-width:620px)'),'mobile comparison layout must be handled');
assert(src.includes('@media(prefers-reduced-motion:reduce)'),'reduced-motion preference must be respected');
assert(!/localStorage\.(?:setItem|removeItem|clear)/.test(src),'UI hierarchy patch must not mutate saved project data');

console.log('UI information hierarchy tests passed');
