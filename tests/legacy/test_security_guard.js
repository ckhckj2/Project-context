const fs=require('fs');
const assert=require('assert');

const security=fs.readFileSync('v2_security.js','utf8');
const ui=fs.readFileSync('v256_interaction_feedback.js','utf8');

assert(security.includes("url.protocol==='https:'"),'external navigation must allow HTTPS only');
assert(security.includes("anchor.rel='noopener noreferrer'"),'new tabs must not control the opener');
assert(security.includes("anchor.referrerPolicy='no-referrer'"),'external links must not leak the current URL');
assert(security.includes('INPUT_LIMITS'),'free-text inputs must have explicit size limits');
assert(security.includes('Object.freeze'),'security helpers must not be casually overwritten');
assert(!/\beval\s*\(|new Function\s*\(/.test(security),'security module must not evaluate strings as code');
assert(!ui.includes('attributes:true'),'UI observer must not create attribute-mutation feedback loops');

console.log('security posture and runtime stability checks passed');
