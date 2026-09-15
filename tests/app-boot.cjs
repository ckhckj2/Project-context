'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app-boot.js','utf8');
function fixture(readyState='loading'){
 const events={},status={textContent:''},document={readyState,documentElement:{dataset:{}},getElementById:()=>status,addEventListener:(name,fn)=>{events[name]=fn}};
 const window={addEventListener:(name,fn)=>{events[name]=fn}};
 vm.runInNewContext(source,{window,document,console:{error(){}}});
 return {boot:window.CC_BOOT,document,events,status};
}
const f=fixture(),calls=[];
f.boot.register('first',()=>calls.push(1));f.boot.register('second',()=>calls.push(2));
assert.throws(()=>f.boot.register('first',()=>{}));
f.boot.start();assert.deepEqual(calls,[]);assert.equal(f.document.documentElement.dataset.appState,undefined);
f.events.DOMContentLoaded();f.boot.start();f.events.DOMContentLoaded();
assert.deepEqual(calls,[1,2]);assert.equal(f.boot.diagnostics().state,'ready');
const broken=fixture('complete');
broken.boot.register('broken',()=>{throw Error('module failed')});broken.boot.register('later',()=>assert.fail('must stop'));
broken.boot.start();assert.equal(broken.document.documentElement.dataset.appState,'failed');assert.match(broken.status.textContent,/새로고침/);
const missing=fixture('complete');missing.events.error({target:{tagName:'SCRIPT'}});missing.status.textContent='';missing.boot.start();
assert.equal(missing.boot.diagnostics().state,'failed');assert.match(missing.status.textContent,/새로고침/);
console.log('Startup order, idempotence and failure recovery passed');
