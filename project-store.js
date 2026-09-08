(()=>{
'use strict';
// One persistence boundary. Keep the existing keys and records; no automatic migration.
const KEY='cc_projects_v1',ACTIVE='cc_active_project_v1';
const LIMITS={name:60,typeId:100,phase:100,location:80,scale:100,memo:500,bimMode:40,businessMode:40,approvalRoute:40,routeException:40};
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const fail=reason=>({ok:false,reason});
function valid(items){
  if(!Array.isArray(items))return false;
  const ids=new Set();
  return items.every(p=>{
    if(!record(p)||typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.name!=='string')return false;
    ids.add(p.id);
    return Object.keys(LIMITS).every(key=>!own(p,key)||typeof p[key]==='string');
  });
}
function read(){
  try{
    const raw=localStorage.getItem(KEY);
    const items=raw===null?[]:JSON.parse(raw);
    return valid(items)?{ok:true,items,raw}:fail('corrupt');
  }catch(error){return fail(error instanceof SyntaxError?'corrupt':'unavailable')}
}
function list(){const state=read();return state.ok?state.items:[]}
function get(id){return list().find(p=>p.id===id)||null}
function activeId(){try{return localStorage.getItem(ACTIVE)||''}catch{return ''}}
function active(){return get(activeId())}
function write(state,items){
  if(!state.ok)return state;
  if(!valid(items))return fail('invalid');
  try{
    // Detect changes between reading and writing, including another tab's edits.
    if(localStorage.getItem(KEY)!==state.raw)return fail('conflict');
    localStorage.setItem(KEY,JSON.stringify(items));
    return {ok:true};
  }catch{return fail('unavailable')}
}
function save(id,fields,expected){
  const state=read();if(!state.ok)return state;
  if(!record(fields))return fail('invalid');
  const patch={};
  for(const [key,value] of Object.entries(fields)){
    if(!own(LIMITS,key)||typeof value!=='string'||value.length>LIMITS[key])return fail('invalid');
    patch[key]=value;
  }
  const old=id?state.items.find(p=>p.id===id):null;
  if(id&&!old)return fail('missing');
  if(expected!==undefined&&JSON.stringify(old)!==expected)return fail('conflict');
  const next={...old,...patch};
  if(!next.name?.trim())return fail('invalid');
  next.id=old?.id||('p_'+crypto.randomUUID());
  next.createdAt=old?.createdAt||Date.now();next.updatedAt=Date.now();
  const result=write(state,old?state.items.map(p=>p.id===id?next:p):[next,...state.items]);
  return result.ok?{ok:true,project:next}:result;
}
function activate(id){
  const state=read();if(!state.ok)return state;
  if(id&&!state.items.some(p=>p.id===id))return fail('missing');
  try{id?localStorage.setItem(ACTIVE,id):localStorage.removeItem(ACTIVE);return {ok:true}}catch{return fail('unavailable')}
}
function remove(id){
  const state=read();if(!state.ok)return state;
  if(!state.items.some(p=>p.id===id))return fail('missing');
  return write(state,state.items.filter(p=>p.id!==id));
}
function message(result){return ({corrupt:'저장된 프로젝트 정보를 읽을 수 없습니다. 기존 데이터를 보호하기 위해 저장을 중단했어요.',unavailable:'브라우저 저장소를 사용할 수 없습니다. 저장 공간과 브라우저 설정을 확인해주세요.',conflict:'다른 화면에서 프로젝트가 변경됐어요. 입력 내용을 복사한 뒤 최신 정보를 다시 열어주세요.',missing:'해당 프로젝트가 삭제되었거나 더 이상 존재하지 않습니다.',invalid:'프로젝트 입력값의 형식이나 길이를 확인해주세요.'})[result.reason]||'프로젝트 작업을 완료하지 못했습니다.'}
window.CC_PROJECT_STORE=Object.freeze({read,list,get,activeId,active,save,activate,remove,message});
})();
