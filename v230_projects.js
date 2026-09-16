(()=>{
'use strict';
const VERSION='2.1.30';
const store=window.CC_PROJECT_STORE;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let editingId=null,editingOriginal;
const editorExtensions=new Map();

const readProjects=()=>store.list();
const activeId=()=>store.activeId();
const activeProject=()=>store.active();
function notice(result){const node=$('cc230Status');if(node){node.hidden=result.ok;node.textContent=result.ok?'':store.message(result)}}
function typeLabel(id){const o=[...($('project')?.options||[])].find(x=>x.value===id);return o?o.textContent.trim():id||'유형 미정'}
function metaText(p){return [p.location&&`위치 ${p.location}`,p.scale&&`규모 ${p.scale}`,p.memo].filter(Boolean).join(' · ')}

function injectView(){
  if($('view-projects'))return;
  const level=$('view-level');if(!level)return;
  const s=document.createElement('section');s.id='view-projects';s.className='view';
  s.innerHTML=`<div class="cc230-page">
    <div class="cc230-head"><div><div class="kicker">MY PROJECTS · LOCAL ONLY</div><h2>내 프로젝트</h2><p>프로젝트를 저장해두면 유형·단계·규모 정보를 다시 입력하지 않고 바로 전환할 수 있어요.</p></div><button id="cc230New" class="primary">+ 새 프로젝트</button></div>
    <div class="cc230-local"><b>기밀정보 입력 금지</b><span>이 브라우저의 localStorage에 평문으로 저장됩니다. 고객 개인정보·계약정보·비공개 도면 링크는 입력하지 마세요.</span></div>
    <p id="cc230Status" role="alert" hidden></p>
    <div id="cc230Editor" class="cc230-editor" hidden></div>
    <div id="cc230List" class="cc230-list"></div>
  </div>`;
  level.parentNode.insertBefore(s,level);
}
function wireSidebar(){
  const btn=[...document.querySelectorAll('.cc-side-subnav button')].find(b=>/프로젝트/.test(b.textContent));
  if(btn)btn.dataset.view='projects';
}
function cloneOptions(source,selected){
  if(!source)return '';
  return [...source.children].map(node=>{
    if(node.tagName==='OPTGROUP')return `<optgroup label="${esc(node.label)}">${[...node.children].map(o=>`<option value="${esc(o.value)}" ${o.value===selected?'selected':''}>${esc(o.textContent)}</option>`).join('')}</optgroup>`;
    return `<option value="${esc(node.value)}" ${node.value===selected?'selected':''}>${esc(node.textContent)}</option>`;
  }).join('');
}
function openEditor(p=null){
  editingId=p?.id||null;
  editingOriginal=JSON.stringify(p);
  const box=$('cc230Editor');if(!box)return;
  const type=p?.typeId||$('project')?.value||'';
  const phase=p?.phase||$('phase')?.value||'잘 모르겠습니다';
  box.hidden=false;
  box.innerHTML=`<div class="cc230-editor-head"><div><small>${p?'PROJECT EDIT':'NEW PROJECT'}</small><b>${p?'프로젝트 정보 수정':'새 프로젝트 등록'}</b></div><button type="button" id="cc230Cancel">닫기 ×</button></div>
    <div class="cc230-form">
      <label class="wide"><span>프로젝트명 <em>필수</em></span><input id="cc230Name" maxlength="60" value="${esc(p?.name||'')}" placeholder="예: 대한항공 격납고"></label>
      <label><span>시설 유형</span><select id="cc230Type">${cloneOptions($('project'),type)}</select></label>
      <label><span>현재 단계</span><select id="cc230Phase">${cloneOptions($('phase'),phase)}</select></label>
      <label><span>위치 <small>선택</small></span><input id="cc230Location" maxlength="80" value="${esc(p?.location||'')}" placeholder="예: 인천광역시"></label>
      <label><span>규모 <small>선택</small></span><input id="cc230Scale" maxlength="100" value="${esc(p?.scale||'')}" placeholder="예: 연면적 3만㎡ / 지상 4층"></label>
      <label class="wide"><span>메모 <small>선택</small></span><textarea id="cc230Memo" maxlength="500" rows="3" placeholder="사업방식, 구조, 발주처 요구사항 등 필요한 정보만">${esc(p?.memo||'')}</textarea></label>
    </div>
    <div class="cc230-editor-actions"><span id="cc230SaveMsg"></span><button type="button" id="cc230Save" class="primary">${p?'수정 저장':'프로젝트 저장'}</button></div>`;
  $('cc230Cancel').onclick=closeEditor;
  $('cc230Save').onclick=saveEditor;
  editorExtensions.forEach(extension=>extension.render(p));
  document.dispatchEvent(new CustomEvent('cc:project-editor-rendered'));
  $('cc230Name')?.focus();
}
function closeEditor(){const b=$('cc230Editor');if(b){b.hidden=true;b.innerHTML=''}editingId=null}
function saveEditor(){
  const name=$('cc230Name')?.value.trim();const msg=$('cc230SaveMsg');
  if(!name){if(msg)msg.textContent='프로젝트명을 입력해주세요.';$('cc230Name')?.focus();return}
  const fields={name,typeId:$('cc230Type')?.value||'',phase:$('cc230Phase')?.value||'잘 모르겠습니다',location:$('cc230Location')?.value.trim()||'',scale:$('cc230Scale')?.value.trim()||'',memo:$('cc230Memo')?.value.trim()||''};
  editorExtensions.forEach(extension=>Object.assign(fields,extension.collect()));
  const result=store.save(editingId,fields,editingOriginal);
  if(!result.ok){if(msg)msg.textContent=store.message(result);return}
  notice({ok:true});
  const p=result.project;
  if(!activeProject())notice(store.activate(p.id));
  if(activeId()===p.id)applyProject(p);
  closeEditor();renderList();renderActiveUI();
}
function activate(id,goHome=true){
  const p=readProjects().find(x=>x.id===id);if(!p)return;
  const result=store.activate(id);notice(result);if(!result.ok)return;
  applyProject(p);renderList();renderActiveUI();
  if(goHome&&typeof showView==='function')showView('home');
}
function applyProject(p){
  const type=$('project');if(type&&[...type.options].some(o=>o.value===p.typeId))type.value=p.typeId;
  const phase=$('phase');if(phase&&[...phase.options].some(o=>o.value===p.phase))phase.value=p.phase;
  const meta=$('meta');if(meta)meta.value=metaText(p);
  window.CC_ACTIVE_PROJECT=Object.assign({},p);
}
function removeProject(id){
  const p=readProjects().find(x=>x.id===id);if(!p)return;
  if(!confirm(`“${p.name}” 프로젝트를 이 브라우저에서 삭제할까요?`))return;
  const result=store.remove(id);notice(result);if(!result.ok)return;
  const next=readProjects();
  if(activeId()===id){const selected=store.activate(next[0]?.id||'');notice(selected);if(selected.ok&&next[0])applyProject(next[0]);else window.CC_ACTIVE_PROJECT=null}
  renderList();renderActiveUI();
}
function renderList(){
  const root=$('cc230List');if(!root)return;
  const state=store.read();
  if(!state.ok){notice(state);root.replaceChildren();return}
  const items=readProjects();const active=activeId();
  if(!items.length){root.innerHTML=`<div class="cc230-empty"><b>아직 등록된 프로젝트가 없어요.</b><span>자주 하는 프로젝트부터 하나 등록해두면 홈 화면이 그 프로젝트 기준으로 바로 채워집니다.</span><button id="cc230EmptyNew">+ 첫 프로젝트 등록</button></div>`;$('cc230EmptyNew').onclick=()=>openEditor();return}
  root.innerHTML=`<div class="cc230-list-head"><b>저장된 프로젝트 <span>${items.length}</span></b><small>최근 수정 순</small></div>${items.slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).map(p=>`<article class="cc230-card ${p.id===active?'active':''}" data-pid="${esc(p.id)}">
    <div class="cc230-card-top"><div><small>${p.id===active?'● 현재 사용 중':'PROJECT'}</small><h3>${esc(p.name)}</h3></div><div class="cc230-card-actions"><button data-edit>수정</button><button data-delete>삭제</button></div></div>
    <div class="cc230-tags"><span>${esc(typeLabel(p.typeId))}</span><span>${esc(p.phase||'단계 미정')}</span>${p.location?`<span>${esc(p.location)}</span>`:''}</div>
    ${p.scale||p.memo?`<p>${esc([p.scale,p.memo].filter(Boolean).join(' · '))}</p>`:''}
    <button class="cc230-use" data-use ${p.id===active?'disabled':''}>${p.id===active?'현재 프로젝트':'이 프로젝트로 전환 →'}</button>
  </article>`).join('')}`;
  root.querySelectorAll('.cc230-card').forEach(card=>{
    const id=card.dataset.pid;
    card.querySelector('[data-use]').onclick=()=>activate(id,true);
    card.querySelector('[data-edit]').onclick=()=>openEditor(readProjects().find(x=>x.id===id));
    card.querySelector('[data-delete]').onclick=()=>removeProject(id);
  });
}
function ensureHomeBar(){
  if($('cc230HomeProject'))return $('cc230HomeProject');
  const hero=document.querySelector('#view-home .hero');if(!hero)return null;
  const bar=document.createElement('div');bar.id='cc230HomeProject';bar.className='cc230-home-project';
  const form=hero.querySelector('.form');hero.insertBefore(bar,form);return bar;
}
function ensureSearchBar(){
  if($('cc230SearchProject'))return $('cc230SearchProject');
  const box=document.querySelector('#view-search .searchbox');if(!box)return null;
  const bar=document.createElement('div');bar.id='cc230SearchProject';bar.className='cc230-search-project';box.insertAdjacentElement('afterend',bar);return bar;
}
function renderActiveUI(){
  const p=activeProject();const home=ensureHomeBar();const search=ensureSearchBar();
  if(home){home.hidden=!p;home.innerHTML=p?`<div><small>CURRENT PROJECT</small><b>${esc(p.name)}</b><span>${esc(typeLabel(p.typeId))} · ${esc(p.phase||'단계 미정')}</span></div><button data-view="projects">프로젝트 전환</button>`:''}
  if(search){search.hidden=!p;search.innerHTML=p?`<small>현재 프로젝트</small><b>${esc(p.name)}</b><span>${esc(typeLabel(p.typeId))} · ${esc(p.phase||'단계 미정')}${p.location?' · '+esc(p.location):''}</span>`:''}
  document.dispatchEvent(new CustomEvent('cc:projects-rendered'));
}
function renderContextProject(){
  const p=activeProject(),root=$('contextResult');if(!p||!root)return;
  root.querySelector('.cc230-context-project')?.remove();
  const banner=root.querySelector('.stage-banner');if(!banner)return;
  const box=document.createElement('div');box.className='cc230-context-project';box.innerHTML=`<small>저장된 프로젝트</small><b>${esc(p.name)}</b><span>${esc([p.location,p.scale].filter(Boolean).join(' · ')||'등록 정보 기준')}</span>`;
  banner.insertAdjacentElement('afterend',box);
}

function install(){
  injectView();wireSidebar();
  $('cc230New')?.addEventListener('click',()=>openEditor());
  const p=activeProject();if(p)applyProject(p);
  renderList();renderActiveUI();
  window.CC_RUNTIME.registerContext('project-label',renderContextProject);
  window.addEventListener('storage',event=>{
    if(event.key!==null&&!['cc_projects_v1','cc_active_project_v1'].includes(event.key))return;
    const current=activeProject();if(current)applyProject(current);else window.CC_ACTIVE_PROJECT=null;
    renderList();renderActiveUI();
  });

}
window.CC_PROJECTS_UI=Object.freeze({registerEditorExtension(id,extension){
  if(editorExtensions.has(id))throw new Error('Duplicate project editor extension: '+id);
  editorExtensions.set(id,extension);
}});
window.CC_BOOT.register('v230_projects',install);
})();
