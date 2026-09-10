(()=>{
'use strict';
const VERSION='2.1.32';
const store=window.CC_PROJECT_STORE;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const MOBILE=()=>window.matchMedia('(max-width:700px)').matches;

function level(){return window.CC_LEVEL_STORE.state().view}
const readProjects=()=>store.list();
const activeId=()=>store.activeId();
const activeProject=()=>store.active();
function bimLabel(v){return ({none:'BIM 미사용/미정',revit:'Revit 협업',delivery:'BIM 납품 프로젝트',coordination:'BIM 코디네이션',other:'기타 BIM'})[v]||'BIM 미사용/미정'}

const {HOW_RULES,HOW_DEFAULT,howData}=window.CC_WORK_RULES.how;

function activeBimNote(){const p=activeProject();if(!p||!p.bimMode||p.bimMode==='none')return '';return `${p.name}은 ${bimLabel(p.bimMode)}로 저장되어 있습니다. 모델 작업 전 프로젝트 BIM 기준과 협업방식을 우선 확인하세요.`}
function restoreHowDesktop(){
  if(MOBILE())return;
  const root=$('contextResult');const actions=root?.querySelector('.actions');const pane=root?.querySelector('[data-pane="how"]');
  if(actions&&pane&&pane.parentElement===actions)actions.insertAdjacentElement('afterend',pane);
}
function addHow(){
  const root=$('contextResult');if(!root||!root.innerHTML.trim())return;
  const actions=root.querySelector('.actions');if(!actions)return;
  root.querySelector('[data-pane="how"]')?.remove();
  actions.querySelector('[data-drawer="how"]')?.remove();
  actions.classList.add('cc232-actions');
  const lv=level();const task=$('task')?.value||'';const d=howData(task);
  const btn=document.createElement('button');btn.type='button';btn.dataset.drawer='how';
  btn.className=lv<3?'locked cc232-how-btn':'cc232-how-btn';
  btn.innerHTML=lv<3?'<small>05 · LOCKED</small>어떻게 수행해요? 🔒':'<small>05 · HOW</small>어떻게 수행해요?';
  actions.appendChild(btn);
  const pane=document.createElement('div');pane.className='drawer cc232-how-pane';pane.dataset.pane='how';
  if(lv<3){
    pane.innerHTML='<div class="cc232-how-lock"><small>LV.3 · 책임</small><b>실행 방법은 LV.3부터 열립니다.</b><span>승급하면 업무별 실행 순서·체크리스트·협업·완료 기준을 볼 수 있어요.</span></div>';
  }else{
    const note=activeBimNote();
    pane.innerHTML=`<div class="cc232-how-head"><div><small>LV.3 · HOW</small><b>${esc(d.title)}</b></div><span>실행 순서부터 보고, 필요할 때 체크리스트를 펼치세요.</span></div>
      <div class="cc232-how-steps">${d.steps.slice(0,3).map((x,i)=>`<div><small>0${i+1}</small><b>${esc(x)}</b></div>`).join('')}</div>
      <details class="cc232-how-detail"><summary>전체 실행 체크리스트 보기</summary><div class="cc232-how-all">${d.steps.map((x,i)=>`<div><span>${i+1}</span><p>${esc(x)}</p></div>`).join('')}</div><div class="cc232-how-grid"><div><small>CHECK</small><p>${esc(d.check)}</p></div><div><small>WHO</small><p>${esc(d.collab)}</p></div><div><small>완료 기준</small><p>${esc(d.done)}</p></div></div>${note?`<div class="cc232-bim-note"><b>BIM 프로젝트 메모</b><span>${esc(note)}</span></div>`:''}</details>`;
  }
  actions.insertAdjacentElement('afterend',pane);
  btn.addEventListener('click',()=>{
    if(level()<3){if(typeof showView==='function')showView('quiz');return}
    const open=!pane.classList.contains('show');
    root.querySelectorAll('.drawer.show').forEach(p=>{if(p!==pane)p.classList.remove('show')});
    actions.querySelectorAll('[data-drawer]').forEach(b=>{if(b!==btn){b.classList.remove('cc-drawer-active');b.setAttribute('aria-expanded','false')}});
    pane.classList.toggle('show',open);btn.classList.toggle('cc-drawer-active',open);btn.setAttribute('aria-expanded',String(open));
    if(MOBILE()&&open)btn.insertAdjacentElement('afterend',pane);else if(!MOBILE())restoreHowDesktop();
  });
}

const {BIM_TOPICS,bimTopic}=window.CC_BIM_RULES.topics;

function renderBim(t){
  const out=$('searchResult');if(!out)return;
  const p=activeProject();const ctx=p?.bimMode&&p.bimMode!=='none'?`${p.name} · ${bimLabel(p.bimMode)}`:'';
  window.CC_SEARCH_ANSWER.write(out,`<div class="result-card cc232-bim-card" data-cc221="1"><div class="label">BIM PRACTICE · 척척</div><div class="cc232-bim-head"><div><h3>${esc(t.name)}</h3><p>${esc(t.what)}</p></div>${ctx?`<span>${esc(ctx)}</span>`:''}</div>
    <div class="cc232-four"><div><small>WHY · 왜 써요?</small><p>${esc(t.why)}</p></div><div><small>WHERE · 어디서 확인해요?</small><p>${esc(t.where)}</p></div><div><small>WHO · 누구에게 물어봐요?</small><p>${esc(t.who)}</p></div></div>
    <div class="cc232-start"><small>처음이면 이렇게</small>${t.start.map((x,i)=>`<div><span>${i+1}</span><b>${esc(x)}</b></div>`).join('')}</div>
    <details class="cc232-bim-detail"><summary>주의사항${t.links?' · 공식 자료':''}</summary><p>${esc(t.caution)}</p>${t.links?`<div class="cc232-links">${t.links.map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(n)} ↗</a>`).join('')}</div>`:''}</details>
  </div>`,window.CC_SEARCH_ANSWER.model(t.name,t.start.map(s=>['처음이면 이렇게',s])));
}

function addBimExamples(){
  const box=document.querySelector('#view-search .examples');if(!box||box.querySelector('[data-cc232-bim]'))return;
  [['BIM이 뭐야?','BIM이 뭐예요?'],['Revit 중앙파일 작업은 어떻게 해?','Revit 협업'],['Workset이 뭐야?','Workset'],['BEP가 뭐야?','BEP']].forEach(([q,label])=>{const b=document.createElement('button');b.type='button';b.dataset.cc232Bim='1';b.dataset.searchQuery=q;b.textContent=label;b.addEventListener('click',()=>{if($('searchInput'))$('searchInput').value=q;const t=bimTopic(q);if(t)renderBim(t)});box.appendChild(b)});
}

function enhanceProjectCards(){
  const root=$('cc230List');if(!root)return;
  root.querySelectorAll('.cc230-card').forEach(card=>{
    if(card.querySelector('.cc232-bim-setting'))return;
    const id=card.dataset.pid;const p=readProjects().find(x=>x.id===id);if(!p)return;
    const wrap=document.createElement('label');wrap.className='cc232-bim-setting';wrap.innerHTML=`<span>BIM 운용</span><select aria-label="${esc(p.name)} BIM 운용 설정"><option value="none">미사용 / 잘 모르겠음</option><option value="revit">Revit 협업</option><option value="coordination">BIM 코디네이션</option><option value="delivery">BIM 납품 프로젝트</option><option value="other">기타 BIM</option></select>`;
    const select=wrap.querySelector('select');select.value=p.bimMode||'none';
    select.addEventListener('change',()=>{
      const result=store.save(id,{bimMode:select.value});
      let status=card.querySelector('.cc232-save-status');
      if(!status){status=document.createElement('span');status.className='cc232-save-status';status.setAttribute('role','status');wrap.append(status)}
      status.textContent=result.ok?'':store.message(result);
      if(!result.ok){select.value=store.get(id)?.bimMode||p.bimMode||'none';return}
      if(id===activeId())window.CC_ACTIVE_PROJECT={...result.project};
      refreshActiveBimTag();
    });
    const use=card.querySelector('.cc230-use');if(use)card.insertBefore(wrap,use);else card.appendChild(wrap);
  });
}
function refreshActiveBimTag(){
  document.querySelectorAll('.cc232-active-bim').forEach(x=>x.remove());
  const p=activeProject();if(!p||!p.bimMode||p.bimMode==='none')return;
  const bar=$('cc230HomeProject');if(bar&&!bar.hidden){const s=document.createElement('span');s.className='cc232-active-bim';s.textContent=' · '+bimLabel(p.bimMode);bar.querySelector('div')?.appendChild(s)}
  const search=$('cc230SearchProject');if(search&&!search.hidden){const s=document.createElement('span');s.className='cc232-active-bim';s.textContent=' · '+bimLabel(p.bimMode);search.appendChild(s)}
}
function refreshProjects(){enhanceProjectCards();refreshActiveBimTag()}

function installStyle(){
  if($('cc232Style'))return;const s=document.createElement('style');s.id='cc232Style';s.textContent=`
  .cc232-actions{flex-wrap:wrap}.cc232-how-btn small{color:#4d69f2}.cc232-how-pane{padding:0!important;background:transparent!important;border:0!important}.cc232-how-head{padding:16px 17px;border:1px solid #e0e7f2;border-radius:15px 15px 0 0;background:#fff}.cc232-how-head small{display:block;font-size:9px;font-weight:950;color:#4e67ef;letter-spacing:.08em}.cc232-how-head b{display:block;margin-top:4px;font-size:16px;color:#17365d}.cc232-how-head span{display:block;margin-top:5px;font-size:10px;color:#7a8799}.cc232-how-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px;border:1px solid #e0e7f2;border-top:0;background:#fbfcff}.cc232-how-steps>div{padding:11px;border-radius:11px;background:#fff}.cc232-how-steps small{display:block;font-size:8px;font-weight:950;color:#5a72f2}.cc232-how-steps b{display:block;margin-top:4px;font-size:10px;line-height:1.5;color:#2f496d}.cc232-how-detail{border:1px solid #e0e7f2;border-top:0;border-radius:0 0 15px 15px;background:#fff;padding:0 14px 12px}.cc232-how-detail summary{padding:11px 2px;cursor:pointer;font-size:10px;font-weight:900;color:#50637e}.cc232-how-all{display:grid;gap:6px}.cc232-how-all>div{display:grid;grid-template-columns:23px 1fr;gap:8px;align-items:start}.cc232-how-all span{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#eef2ff;color:#5368e9;font-size:9px;font-weight:950}.cc232-how-all p{margin:2px 0 0;font-size:11px;line-height:1.55;color:#405570}.cc232-how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.cc232-how-grid>div{padding:11px;border-radius:11px;background:#f6f8fc}.cc232-how-grid small{font-size:8px;font-weight:950;color:#6c7b91}.cc232-how-grid p{margin:4px 0 0;font-size:10px;line-height:1.55;color:#3e536e}.cc232-bim-note{display:flex;gap:8px;margin-top:10px;padding:10px 11px;border-radius:11px;background:#eef8f4}.cc232-bim-note b{font-size:9px;color:#2e765f}.cc232-bim-note span{font-size:10px;line-height:1.5;color:#4c6c61}.cc232-how-lock{padding:16px;border:1px solid #e1e6ef;border-radius:14px;background:#fbfcfe}.cc232-how-lock small,.cc232-how-lock b,.cc232-how-lock span{display:block}.cc232-how-lock small{font-size:9px;font-weight:950;color:#7a8798}.cc232-how-lock b{margin-top:4px;font-size:14px;color:#334b6b}.cc232-how-lock span{margin-top:5px;font-size:10px;color:#7f8b9c}
  .cc232-bim-card{padding:20px}.cc232-bim-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.cc232-bim-head h3{margin:3px 0 5px;font-size:23px;color:#112c51}.cc232-bim-head p{margin:0;max-width:760px;font-size:13px;line-height:1.6;color:#3c536f}.cc232-bim-head>span{padding:6px 9px;border-radius:999px;background:#edf3ff;color:#4d64df;font-size:9px;font-weight:900;white-space:nowrap}.cc232-four{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:14px}.cc232-four>div{padding:12px;border:1px solid #e2e8f2;border-radius:12px;background:#fff}.cc232-four small,.cc232-start>small{display:block;font-size:9px;font-weight:950;color:#65758d}.cc232-four p{margin:5px 0 0;font-size:11px;line-height:1.6;color:#3e536f}.cc232-start{margin-top:10px;padding:12px 13px;border-radius:13px;background:#f5f8ff}.cc232-start>div{display:grid;grid-template-columns:22px 1fr;gap:8px;align-items:center;margin-top:7px}.cc232-start span{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:#fff;color:#5368e9;font-size:9px;font-weight:950}.cc232-start b{font-size:10px;color:#354f72}.cc232-bim-detail{margin-top:10px;border-top:1px solid #edf0f5;padding-top:8px}.cc232-bim-detail summary{font-size:10px;font-weight:900;color:#62738a;cursor:pointer}.cc232-bim-detail p{font-size:10px;line-height:1.6;color:#6a7585}.cc232-links{display:flex;gap:6px;flex-wrap:wrap}.cc232-links a{padding:7px 10px;border:1px solid #dce4ef;border-radius:999px;text-decoration:none;color:#4561dd;font-size:9px;font-weight:900}.cc232-bim-setting{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;padding:9px 10px;border-radius:10px;background:#f7f9fc}.cc232-bim-setting>span{font-size:9px;font-weight:900;color:#62738b}.cc232-bim-setting select{max-width:170px;border:1px solid #dfe6ef;border-radius:8px;background:#fff;padding:6px 8px;font-size:9px;color:#415775}.cc232-active-bim{font-size:9px!important;color:#4f69e8!important;font-weight:900}
  @media(max-width:700px){.cc232-how-steps,.cc232-how-grid,.cc232-four{grid-template-columns:1fr}.cc232-how-pane{margin-top:7px}.cc232-bim-card{padding:16px}.cc232-bim-head{display:grid}.cc232-bim-head>span{justify-self:start}.cc232-bim-head h3{font-size:20px}.cc232-bim-setting{align-items:flex-start;flex-direction:column}.cc232-bim-setting select{max-width:none;width:100%}}
  `;document.head.appendChild(s)
}
function install(){
  installStyle();addBimExamples();
  window.CC_RUNTIME.registerSearch('bim',bimTopic,renderBim);
  window.CC_RUNTIME.registerContext('how',addHow);
  document.addEventListener('cc:projects-rendered',refreshProjects);
  refreshProjects();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
