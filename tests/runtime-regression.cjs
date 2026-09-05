'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const scripts=[...html.matchAll(/<script src="\.\/(.*?)\?/g)].map(m=>m[1]);
assert.equal(new Set(scripts).size,scripts.length,'scripts must load once');
for(const file of scripts){
  const source=read(file);
  new vm.Script(source,{filename:file});
  assert(!/querySelectorAll\(['"]\.version['"]\)|dataset\.uiVersion\s*=|markVersion/.test(source),`${file}: release labels belong to index.html`);
}
assert(!html.includes('</script>\\n<script'),'no literal newline text between scripts');
assert(html.includes("script-src 'self'"),'keep CSP script isolation');
assert(html.includes("connect-src 'none'"),'keep no-network data policy');

// Exercise the real delegated handler and renderer with a small DOM fixture.
let install,clickHandler,writes=0;
const extra={open:true};
const body={contains:()=>false,querySelector:()=>extra};
Object.defineProperty(body,'innerHTML',{set(){writes++}});
const guide={dataset:{cc257SelectedStage:'middle'},querySelector:()=>body};
guide.closest=()=>guide;
const result={innerHTML:'',addEventListener(type,callback){if(type==='click')clickHandler=callback}};
const elements={contextResult:result,cc264DrawingStyle:{},miniLevel:{textContent:'LV.MAX · 건축 마스터'},phase:{value:'중간설계'},project:{selectedOptions:[{textContent:'공동주택'}]}};
const sandbox={window:{},document:{readyState:'loading',activeElement:null,getElementById:id=>elements[id],addEventListener(type,callback){if(type==='DOMContentLoaded')install=callback}},setTimeout:()=>1,clearTimeout(){},MutationObserver:class{observe(){}}};
vm.createContext(sandbox);
vm.runInContext(read('v257_stage_drawing_guide.js'),sandbox);
install();
const summary={closest:selector=>selector==='[data-cc257-stage]'?guide:null};
clickHandler({target:summary});
assert.equal(writes,0,'nested summary click must never replace its own DOM');
const tab={dataset:{cc257Stage:'middle'},closest:()=>guide};
clickHandler({target:{closest:()=>tab}});
assert.equal(writes,1);
assert.equal(extra.open,true,'preserve expanded additional checks');
assert.equal(JSON.parse(guide.dataset.cc257Key)[2],4,'master sees deepest content, not LV1');
clickHandler({target:{closest:()=>tab}});
assert.equal(writes,1,'same selection must not rerender');
tab.dataset.cc257Stage='detail';clickHandler({target:{closest:()=>tab}});
assert.equal(writes,2,'new stage must update');
tab.dataset.cc257Stage='__proto__';clickHandler({target:{closest:()=>tab}});
assert.equal(writes,2,'reject invalid stage keys');

// Test URL policy at its boundary, including same-tab and middle-click paths.
const handlers={};
const securityContext={window:{},URL,location:{href:'https://ckhckj2.github.io/Project-context/'},console:{warn(){}},document:{readyState:'complete',querySelectorAll:()=>[],getElementById:()=>null,querySelector:()=>null,documentElement:{dataset:{}},addEventListener:(type,fn)=>{handlers[type]=fn}}};
vm.createContext(securityContext);vm.runInContext(read('v2_security.js'),securityContext);
const policy=securityContext.window.CC_SECURITY;
for(const url of ['javascript:alert(1)','data:text/html,hi','http://example.com','https://user:secret@example.com'])assert.equal(policy.safeExternalUrl(url),null);
assert(policy.safeExternalUrl('https://www.eais.go.kr/'));
assert(policy.safeExternalUrl('#help'));
for(const type of ['click','auxclick']){
  let blocked=false;
  const anchor={dataset:{ccSecurity:'1'},target:'_self',getAttribute:()=> 'javascript:alert(1)'};
  handlers[type]({target:{closest:()=>anchor},preventDefault(){blocked=true}});
  assert(blocked,`${type}: protect same-tab navigation too`);
}
assert.equal(policy.safeJson('{bad',null),null);
assert.equal(policy.safeText('a\u0000b',1),'a');
const projectSource=read('v230_projects.js');
const saveFunction=projectSource.slice(projectSource.indexOf('function saveEditor(){'),projectSource.indexOf('function activate('));
const original={id:'p1',name:'before',bimMode:'delivery',approvalRoute:'building',businessMode:'public',routeException:'none',createdAt:123};
let saved,closed=false;
const projectContext={editingId:'p1',$:id=>id==='cc230Name'?{value:'after'}:{value:''},readProjects:()=>[original],writeProjects:items=>{saved=items;return true},activeId:()=>'',setActiveId(){},closeEditor(){closed=true},renderList(){},renderActiveUI(){}};
vm.createContext(projectContext);vm.runInContext(saveFunction+';saveEditor();',projectContext);
assert.equal(saved[0].name,'after');
for(const key of ['bimMode','approvalRoute','businessMode','routeException','createdAt'])assert.equal(saved[0][key],original[key],`editing name must preserve ${key}`);
assert(closed);
closed=false;projectContext.writeProjects=()=>false;
vm.runInContext('saveEditor();',projectContext);
assert.equal(closed,false,'failed persistence must not close the editor');
console.log(`PASS: ${scripts.length} scripts parse; release ownership, disclosure dispatch, idempotence, master depth, URL policy, project field preservation`);
