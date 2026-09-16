'use strict';
const assert=require('node:assert/strict');
const {audit}=require('../tools/audit-unused-assets.cjs');
const report=audit(),names=report.candidates.map(item=>item.file);
assert(!names.includes('app-components.css'),'new linked CSS is active');
assert(!names.includes('v2_core.js'),'core is active');
assert(!require('node:fs').existsSync('v2_quiz.js'),'superseded quiz file was removed');
assert.equal(new Set(names).size,names.length,'no duplicate candidates');
for(const item of report.candidates){assert(item.bytes>=0);assert(!item.references.includes(item.file));}
console.log('Read-only unused asset audit passed');
