'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'project-store.js'),'utf8');
const KEY='cc_projects_v1',ACTIVE='cc_active_project_v1';
let writes=0,sequence=0,blocked=false,quota=false;
const memory=new Map();
const localStorage={getItem(key){if(blocked)throw new Error('denied');return memory.get(key)??null},setItem(key,value){if(quota)throw new Error('quota');writes++;memory.set(key,value)},removeItem(key){if(quota)throw new Error('quota');memory.delete(key)}};
const context={window:{},localStorage,crypto:{randomUUID:()=>String(++sequence)}};
vm.createContext(context);vm.runInContext(source,context);
const store=context.window.CC_PROJECT_STORE;
const first=store.save(null,{name:'같은 이름',approvalRoute:'airport',bimMode:'delivery'});
assert(first.ok);assert.equal(writes,1,'all fields saved in a single write');
const second=store.save(null,{name:'같은 이름',approvalRoute:'building'});
assert(second.ok);assert.notEqual(first.project.id,second.project.id);
const snapshot=JSON.stringify(first.project);
const edit=store.save(first.project.id,{name:'수정 이름'},snapshot);
assert(edit.ok);assert.equal(edit.project.bimMode,'delivery');assert.equal(edit.project.approvalRoute,'airport');
assert.equal(store.get(second.project.id).approvalRoute,'building','same name must never pick another record');
assert.equal(store.save(first.project.id,{name:'stale'},snapshot).reason,'conflict');
assert.equal(store.save('deleted',{name:'new'}).reason,'missing');
assert.equal(store.save(first.project.id,JSON.parse('{"__proto__":"bad"}')).reason,'invalid');
assert.equal(store.save(first.project.id,{memo:'x'.repeat(501)}).reason,'invalid');
assert(store.activate(first.project.id).ok);assert.equal(store.active().name,'수정 이름');
quota=true;
const before=memory.get(KEY);
assert.equal(store.save(first.project.id,{name:'must fail'}).reason,'unavailable');
assert.equal(store.remove(first.project.id).reason,'unavailable');assert.equal(memory.get(KEY),before);
assert.equal(store.activate(second.project.id).reason,'unavailable');assert.equal(store.activeId(),first.project.id);
quota=false;
// Preserve fields belonging to future modules and tolerate legacy optional fields.
memory.set(KEY,JSON.stringify([{id:'legacy',name:'old',future:{keep:true}}]));
assert(store.save('legacy',{memo:'note'}).ok);assert.equal(store.get('legacy').future.keep,true);
for(const value of ['{bad','{}','[null]','[{"id":"a","name":"one"},{"id":"a","name":"two"}]','[{"id":"a","name":1}]']){
  memory.set(KEY,value);const count=writes;
  assert.equal(store.read().reason,'corrupt');assert.equal(store.save(null,{name:'new'}).ok,false);assert.equal(writes,count);assert.equal(memory.get(KEY),value);
}
blocked=true;assert.equal(store.read().reason,'unavailable');assert.equal(store.active(),null);blocked=false;
memory.set(KEY,JSON.stringify([{id:'delete',name:'one'}]));assert(store.remove('delete').ok);assert.equal(store.list().length,0);
// Every consumer uses the shared store, with no delayed write or whole-body observer.
for(const file of ['v230_projects.js','v232_lv3_bim.js','v233_bim_context.js','v234_bim_search_fix.js','v235_permit_reviews.js','v248_project_route_judgement.js']){
  const code=fs.readFileSync(path.join(root,file),'utf8');
  assert(!/localStorage\.(?:setItem|removeItem)/.test(code),`${file}: persistence must have one owner`);
}
const routes=fs.readFileSync(path.join(root,'v248_project_route_judgement.js'),'utf8');
assert(!/persistExtra|MutationObserver|#cc230Save/.test(routes),'route module must not intercept saving or observe the whole page');
console.log('PASS project store: identity, one-write saving, preservation, stale edits, corrupt data, quota, blocked storage, ownership');
