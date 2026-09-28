'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const scripts=[...html.matchAll(/<script src="\.\/(.*?)\?/g)].map(m=>m[1]);
const styleIds=new Map();
assert.equal(new Set(scripts).size,scripts.length,'scripts must load once');
for(const file of scripts){
  const source=read(file);
  new vm.Script(source,{filename:file});
  for(const match of source.matchAll(/(?:style|s)\.id\s*=\s*['"]([^'"]*(?:Style|style))['"]/g)){
    assert(!styleIds.has(match[1]),`${file}: duplicate style id ${match[1]} also in ${styleIds.get(match[1])}`);
    styleIds.set(match[1],file);
  }
  assert(!/querySelectorAll\(['"]\.version['"]\)|dataset\.uiVersion\s*=|markVersion/.test(source),`${file}: release labels belong to index.html`);
}
assert(!html.includes('</script>\\n<script'),'no literal newline text between scripts');
assert(html.includes("script-src 'self'"),'keep CSP script isolation');
assert(html.includes("connect-src 'none'"),'keep no-network data policy');
let preservedBadge;
const releaseBadge={textContent:'v2.1.65'};
const side={dataset:{},querySelector:selector=>selector==='.version'?releaseBadge:{replaceWith(node){preservedBadge=node}},querySelectorAll:()=>[]};
const sidebarContext={window:{CC_BOOT:{register(id,fn){fn()}}},document:{readyState:'complete',querySelector:selector=>selector==='.side'?side:null,getElementById:()=>null}};
vm.createContext(sidebarContext);vm.runInContext(read('v212_sidebar.js'),sidebarContext);
assert.equal(preservedBadge,releaseBadge,'sidebar must preserve the index release badge node');

// Exercise the standalone drawing view renderer without changing home fields.
let install,viewHandler,writes=0;
const extra={open:true};
const body={querySelector:()=>extra};
Object.defineProperty(body,'innerHTML',{set(){writes++}});
const guide={dataset:{},querySelector:()=>body};
const elements={drawingGuideContent:guide,drawingStage:{value:'middle',addEventListener(){}},drawingProject:{value:'multi',selectedOptions:[{textContent:'공동주택'}],addEventListener(){}},miniLevel:{textContent:'LV.MAX · 건축 마스터'}};
const sandbox={window:{CC_BOOT:{register(id,fn){install=fn}},CC_RUNTIME:{registerContext(){},registerView(id,fn){viewHandler=fn}}},document:{getElementById:id=>elements[id]}};
vm.createContext(sandbox);vm.runInContext(read('v257_stage_drawing_guide.js'),sandbox);install();
viewHandler('home');assert.equal(writes,0,'other views do not render the library');
viewHandler('drawings');assert.equal(writes,1);assert.equal(extra.open,true,'retain additional-check disclosure');
assert.equal(JSON.parse(guide.dataset.cc257Key)[2],4,'master retains depth');
viewHandler('drawings');assert.equal(writes,1,'same selection is stable');
elements.drawingStage.value='detail';viewHandler('drawings');assert.equal(writes,2);
elements.drawingStage.value='__proto__';viewHandler('drawings');assert.equal(writes,2,'reject invalid stage');

// Test URL policy at its boundary, including same-tab and middle-click paths.
const handlers={};
const securityContext={window:{CC_BOOT:{register(){}}},URL,location:{href:'https://ckhckj2.github.io/Project-context/'},console:{warn(){}},document:{readyState:'complete',querySelectorAll:()=>[],getElementById:()=>null,querySelector:()=>null,documentElement:{dataset:{}},addEventListener:(type,fn)=>{handlers[type]=fn}}};
securityContext.window.CC_BOOT.register=(id,fn)=>fn();
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
const projectContext={editingId:'p1',editingOriginal:JSON.stringify(original),editorExtensions:new Map([['route',{collect:()=>({approvalRoute:'building'})}]]),$:id=>id==='cc230Name'?{value:'after'}:{value:''},store:{save(id,fields,expected){assert.equal(id,'p1');assert.equal(expected,JSON.stringify(original));saved=[{...original,...fields}];return {ok:true,project:saved[0]}},message:()=> 'error'},activeId:()=> 'p1',activeProject:()=>original,applyProject(){},notice(){},closeEditor(){closed=true},renderList(){},renderActiveUI(){}};
vm.createContext(projectContext);vm.runInContext(saveFunction+';saveEditor();',projectContext);
assert.equal(saved[0].name,'after');
for(const key of ['bimMode','approvalRoute','businessMode','routeException','createdAt'])assert.equal(saved[0][key],original[key],`editing name must preserve ${key}`);
assert(closed);
closed=false;projectContext.store.save=()=>({ok:false,reason:'unavailable'});
vm.runInContext('saveEditor();',projectContext);
assert.equal(closed,false,'failed persistence must not close the editor');
console.log(`PASS: ${scripts.length} scripts parse; release ownership, disclosure dispatch, idempotence, master depth, URL policy, project field preservation`);
