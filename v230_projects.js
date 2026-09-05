(()=>{
'use strict';
const VERSION='2.1.30';
const STORAGE='cc_projects_v1';
const ACTIVE='cc_active_project_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let editingId=null;

function readProjects(){
  try{const v=JSON.parse(localStorage.getItem(STORAGE)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}
}
function writeProjects(items){try{localStorage.setItem(STORAGE,JSON.stringify(items));return true}catch(e){return false}}
function activeId(){try{return localStorage.getItem(ACTIVE)||''}catch(e){return ''}}
function setActiveId(id){try{id?localStorage.setItem(ACTIVE,id):localStorage.removeItem(ACTIVE)}catch(e){}}
function uid(){return (crypto&&crypto.randomUUID)?crypto.randomUUID():'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)}
function activeProject(){const id=activeId();return readProjects().find(p=>p.id===id)||null}
function typeLabel(id){const o=[...($('project')?.options||[])].find(x=>x.value===id);return o?o.textContent.trim():id||'유형 미정'}
function metaText(p){return [p.location&&`위치 ${p.location}`,p.scale&&`규모 ${p.scale}`,p.memo].filter(Boolean).join(' · ')}

function injectView(){
  if($('view-projects'))return;
  const level=$('view-level');if(!level)return;
  const s=document.createElement('section');s.id='view-projects';s.className='view';
  s.innerHTML=`<div class="cc230-page">
    <div class="cc230-head"><div><div class="kicker">MY PROJECTS · LOCAL ONLY</div><h2>내 프로젝트</h2><p>프로젝트를 저장해두면 유형·단계·규모 정보를 다시 입력하지 않고 바로 전환할 수 있어요.</p></div><button id="cc230New" class="primary">+ 새 프로젝트</button></div>
    <div class="cc230-local"><b>기밀정보 입력 금지</b><span>이 브라우저의 localStorage에 평문으로 저장됩니다. 고객 개인정보·계약정보·비공개 도면 링크는 입력하지 마세요.</span></div>
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
  setTimeout(()=>$('cc230Name')?.focus(),0);
}
function closeEditor(){const b=$('cc230Editor');if(b){b.hidden=true;b.innerHTML=''}editingId=null}
function saveEditor(){
  const name=$('cc230Name')?.value.trim();const msg=$('cc230SaveMsg');
  if(!name){if(msg)msg.textContent='프로젝트명을 입력해주세요.';$('cc230Name')?.focus();return}
  const items=readProjects();
  const old=items.find(x=>x.id===editingId);
  const p={...old,id:editingId||uid(),name,typeId:$('cc230Type')?.value||'',phase:$('cc230Phase')?.value||'잘 모르겠습니다',location:$('cc230Location')?.value.trim()||'',scale:$('cc230Scale')?.value.trim()||'',memo:$('cc230Memo')?.value.trim()||'',createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};
  const next=old?items.map(x=>x.id===p.id?p:x):[p,...items];
  if(!writeProjects(next)){if(msg)msg.textContent='브라우저 저장소를 사용할 수 없습니다.';return}
  if(!activeId())setActiveId(p.id);
  if(activeId()===p.id)applyProject(p);
  closeEditor();renderList();renderActiveUI();
}
function activate(id,goHome=true){
  const p=readProjects().find(x=>x.id===id);if(!p)return;
  setActiveId(id);applyProject(p);renderList();renderActiveUI();
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
  const next=readProjects().filter(x=>x.id!==id);writeProjects(next);
  if(activeId()===id){setActiveId(next[0]?.id||'');if(next[0])applyProject(next[0]);else window.CC_ACTIVE_PROJECT=null}
  renderList();renderActiveUI();
}
function renderList(){
  const root=$('cc230List');if(!root)return;
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
}
function renderContextProject(){
  const p=activeProject(),root=$('contextResult');if(!p||!root)return;
  root.querySelector('.cc230-context-project')?.remove();
  const banner=root.querySelector('.stage-banner');if(!banner)return;
  const box=document.createElement('div');box.className='cc230-context-project';box.innerHTML=`<small>저장된 프로젝트</small><b>${esc(p.name)}</b><span>${esc([p.location,p.scale].filter(Boolean).join(' · ')||'등록 정보 기준')}</span>`;
  banner.insertAdjacentElement('afterend',box);
}
function installStyle(){
  if($('cc230Style'))return;const s=document.createElement('style');s.id='cc230Style';s.textContent=`
  .cc230-page{max-width:980px;margin:0 auto;padding:28px 0 80px}.cc230-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.cc230-head h2{margin:5px 0 6px;font-size:30px;color:#10264b}.cc230-head p{margin:0;color:#718097;font-size:12px;line-height:1.6}.cc230-head .primary{width:auto;padding:12px 18px}.cc230-local{margin:18px 0;display:flex;gap:8px;align-items:center;padding:11px 13px;border-radius:12px;background:#f5f8fd;border:1px solid #e5ebf4}.cc230-local b{font-size:10px;color:#405a80}.cc230-local span{font-size:10px;color:#77859a}.cc230-editor{margin:16px 0 22px;padding:18px;border:1px solid #dfe7f3;border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(39,63,102,.07)}.cc230-editor-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.cc230-editor-head small{display:block;font-size:9px;font-weight:950;color:#5069ff;letter-spacing:.09em}.cc230-editor-head b{font-size:17px;color:#17355d}.cc230-editor-head button,.cc230-card-actions button{border:0;background:transparent;color:#7a8799;font-weight:850;cursor:pointer}.cc230-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}.cc230-form label{display:grid;gap:6px}.cc230-form label.wide{grid-column:1/-1}.cc230-form span{font-size:10px;font-weight:900;color:#50617a}.cc230-form em{font-style:normal;color:#5069ff}.cc230-form small{font-weight:700;color:#99a3b2}.cc230-form input,.cc230-form select,.cc230-form textarea{width:100%;box-sizing:border-box;border:1px solid #dfe5ef;border-radius:11px;background:#fbfcfe;padding:11px 12px;font:inherit;font-size:12px;color:#263c5b;outline:none}.cc230-form input:focus,.cc230-form select:focus,.cc230-form textarea:focus{border-color:#8fa5ff;box-shadow:0 0 0 3px rgba(80,105,255,.09)}.cc230-editor-actions{display:flex;justify-content:flex-end;gap:12px;align-items:center;margin-top:14px}.cc230-editor-actions span{font-size:10px;color:#b04b4b}.cc230-editor-actions .primary{width:auto;padding:10px 17px}.cc230-list-head{display:flex;justify-content:space-between;align-items:center;margin:22px 2px 10px}.cc230-list-head b{font-size:13px;color:#243d61}.cc230-list-head b span{color:#5069ff}.cc230-list-head small{font-size:9px;color:#939eae}.cc230-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.cc230-list-head,.cc230-empty{grid-column:1/-1}.cc230-card{border:1px solid #e2e8f1;border-radius:17px;background:#fff;padding:16px;box-shadow:0 5px 18px rgba(37,56,89,.04)}.cc230-card.active{border-color:#b9c9ff;background:#fbfcff;box-shadow:0 8px 25px rgba(80,105,255,.08)}.cc230-card-top{display:flex;justify-content:space-between;gap:10px}.cc230-card-top small{font-size:8px;font-weight:950;letter-spacing:.08em;color:#8491a4}.cc230-card.active .cc230-card-top small{color:#4e65ef}.cc230-card h3{margin:4px 0 8px;font-size:17px;color:#18365d}.cc230-card-actions{display:flex;gap:5px}.cc230-card-actions button{font-size:9px}.cc230-card-actions button[data-delete]{color:#ad7373}.cc230-tags{display:flex;flex-wrap:wrap;gap:5px}.cc230-tags span{padding:5px 8px;border-radius:999px;background:#f3f6fa;font-size:9px;font-weight:800;color:#5c6e86}.cc230-card p{margin:9px 0 0;font-size:10px;line-height:1.55;color:#778399}.cc230-use{width:100%;margin-top:13px;border:1px solid #d9e2ef;border-radius:10px;background:#fff;padding:9px;font-size:10px;font-weight:900;color:#3e5f8c;cursor:pointer}.cc230-card.active .cc230-use{background:#eef3ff;border-color:#d2dcff;color:#5268e5;cursor:default}.cc230-empty{padding:35px 20px;text-align:center;border:1px dashed #d8e0ec;border-radius:17px;background:#fbfcfe}.cc230-empty b,.cc230-empty span{display:block}.cc230-empty b{font-size:15px;color:#294467}.cc230-empty span{margin:6px auto 14px;max-width:460px;font-size:11px;line-height:1.6;color:#7c899a}.cc230-empty button{border:1px solid #cfdafe;border-radius:999px;background:#eff3ff;padding:9px 13px;color:#5069ee;font-size:10px;font-weight:900;cursor:pointer}.cc230-home-project{margin:12px auto 10px;max-width:760px;padding:10px 13px;border:1px solid #dfe7f3;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px}.cc230-home-project div{display:flex;gap:8px;align-items:baseline;min-width:0}.cc230-home-project small,.cc230-search-project small,.cc230-context-project small{font-size:8px;font-weight:950;color:#6277ed;letter-spacing:.08em}.cc230-home-project b{font-size:11px;color:#223f66}.cc230-home-project span,.cc230-search-project span,.cc230-context-project span{font-size:9px;color:#8490a1}.cc230-home-project button{border:0;background:transparent;color:#5069ee;font-size:9px;font-weight:900;cursor:pointer}.cc230-search-project{margin:8px 0 0;padding:8px 11px;border-radius:10px;background:#f6f8fc;display:flex;gap:7px;align-items:baseline}.cc230-search-project b{font-size:10px;color:#365274}.cc230-context-project{margin:9px 0 0;padding:10px 12px;border:1px solid #dfe7f3;border-radius:12px;background:#fbfcff;display:flex;gap:8px;align-items:baseline}.cc230-context-project b{font-size:11px;color:#294568}@media(max-width:700px){.cc230-page{padding:10px 0 80px}.cc230-head{align-items:center}.cc230-head h2{font-size:24px}.cc230-head p{font-size:11px}.cc230-head .primary{padding:10px 12px;font-size:10px}.cc230-local{align-items:flex-start;flex-direction:column}.cc230-form{grid-template-columns:1fr}.cc230-form label.wide{grid-column:auto}.cc230-list{grid-template-columns:1fr}.cc230-home-project{margin:10px 0;align-items:flex-start}.cc230-home-project div{display:grid;gap:2px}.cc230-search-project,.cc230-context-project{display:grid;gap:2px}.cc230-editor{padding:14px}}
  `;document.head.appendChild(s);
}
function install(){
  injectView();wireSidebar();installStyle();
  $('cc230New')?.addEventListener('click',()=>openEditor());
  const p=activeProject();if(p)applyProject(p);
  renderList();renderActiveUI();
  $('analyze')?.addEventListener('click',()=>setTimeout(renderContextProject,140));
  
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
