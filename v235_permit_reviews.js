(()=>{
'use strict';
const VERSION='2.1.35';
const store=window.CC_PROJECT_STORE;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function level(){return window.CC_LEVEL_STORE.state().view}
const activeProject=()=>store.active();

const {LAW,REVIEWS,topic}=window.CC_REVIEW_RULES;

function projectBanner(){
  const p=activeProject();
  if(!p)return '<div class="cc235-project"><b>프로젝트 정보가 없어요.</b><span>대상 여부를 확인할 때는 위치·용도·규모·사업방식·원 승인경로가 필요합니다.</span></div>';
  const bits=[p.name,p.location,p.scale].filter(Boolean).join(' · ');
  return `<div class="cc235-project"><b>현재 프로젝트 · ${esc(p.name)}</b><span>${esc(bits||'등록정보 기준')} · 등록정보만으로 심의 대상을 확정하지는 않습니다.</span></div>`;
}
function lawLink(key){const [name,url]=LAW[key]||['국가법령정보센터','https://www.law.go.kr/'];return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a>`}

function renderReview(key){
  const d=REVIEWS[key],out=$('searchResult');if(!d||!out)return;
  const lv=level();
  window.CC_SEARCH_ANSWER.write(out,`<article class="result-card cc235-review-card" data-cc221="1">
    <div class="cc235-top"><div><div class="label">REVIEW / APPROVAL · 척척</div><h3>${esc(d.name)}</h3><p>${esc(d.summary)}</p></div><span>${esc(d.tag)}</span></div>
    ${projectBanner()}
    <div class="cc235-core"><div><small>01 · 대상 여부를 어떻게 봐요?</small><p>${esc(d.apply)}</p></div><div><small>02 · 언제 확인해요?</small><p>${esc(d.when)}</p></div></div>
    <div class="cc235-caution"><b>먼저 기억할 점</b><span>${esc(d.caution)}</span></div>
    <details class="cc235-practice"><summary>${lv>=3?'LV.3 실무 준비자료 · 담당 · 완료 후 보기':'LV.3 실무 내용 🔒'}</summary>${lv>=3?`<div class="cc235-practice-grid"><div><small>준비자료</small>${d.materials.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div><div><small>누구와 확인?</small><p>${esc(d.who)}</p><small>심의·평가 후</small><p>${esc(d.after)}</p></div></div>`:`<div class="cc235-lock"><b>LV.3 · 책임부터 열립니다.</b><span>승급하면 준비자료, 협력업체 역할, 심의 후 반영·추적 방법까지 볼 수 있어요.</span></div>`}</details>
    <div class="cc235-sources"><small>공식 근거 시작점</small>${lawLink(d.law)}<span>정확한 대상·도서·접수시기는 시행령·시행규칙·관할기관 조례/안내의 최신본을 함께 확인하세요.</span></div>
  </article>`,window.CC_SEARCH_ANSWER.model(d.name,[['대상 여부',d.apply],['확인 시점',d.when],['주의',d.caution]]));
  
}

function reviewFlow(steps){return '<div class="cc235-flow">'+steps.map(([title,body],i)=>`<div><i>${i+1}</i><b>${esc(title)}</b><span>${esc(body)}</span></div>`).join('')+'</div>'}
function reviewButtons(){
  const entries=[['건축심의','건축심의 대상과 준비자료 알려줘'],['경관심의','경관심의 대상과 준비자료 알려줘'],['소방 관련','소방심의는 어떤 절차야?'],['교통영향','교통영향평가 언제 해?'],['환경','환경영향평가 어떤 경우 확인해?'],['교육환경','교육환경평가 언제 해?'],['재해영향','재해영향평가 언제 확인해?'],['BF','BF 인증 언제 확인해?'],['ZEB','ZEB 인증 언제 확인해?']];
  return entries.map(([n,q])=>`<button type="button" data-cc235-go="${esc(q)}">${esc(n)}</button>`).join('');
}
function renderOverview(){
  const out=$('searchResult');if(!out)return;
  window.CC_SEARCH_ANSWER.write(out,`<article class="result-card cc235-overview" data-cc221="1"><div class="label">REVIEW MAP · 척척</div><h3>${esc(window.CC_REVIEW_RULES.flows.overview.title)}</h3><p>프로젝트의 원 승인경로를 먼저 정한 뒤, 위치·용도·규모·사업방식에 따라 필요한 심의·평가 후보를 하나씩 확인하는 게 안전합니다.</p>${projectBanner()}
    ${reviewFlow(window.CC_REVIEW_RULES.flows.overview.steps)}
    <div class="cc235-pick"><small>하나씩 확인해보기</small><div>${reviewButtons()}</div></div>
    <div class="cc235-caution"><b>세움터는?</b><span>건축행정의 중요한 접점이지만 모든 심의·평가가 세움터 하나로 처리되는 것은 아닙니다. 심의·평가별 접수기관과 시스템을 따로 확인하세요.</span></div>
  </article>`,window.CC_SEARCH_ANSWER.model(window.CC_REVIEW_RULES.flows.overview.title,window.CC_REVIEW_RULES.flows.overview.steps));
  wireGo();
}
function renderPermit(){
  const out=$('searchResult');if(!out)return;const lv=level();
  window.CC_SEARCH_ANSWER.write(out,`<article class="result-card cc235-overview" data-cc221="1"><div class="label">LV.3 · PERMIT PRACTICE</div><h3>${esc(window.CC_REVIEW_RULES.flows.permit.title)}</h3><p>가장 먼저 <b>“이 프로젝트가 어떤 법적 경로로 승인되는지”</b>를 확인해야 심의·평가·제출자료가 제대로 연결됩니다.</p>${projectBanner()}
    ${reviewFlow(window.CC_REVIEW_RULES.flows.permit.steps)}
    <div class="cc235-practice-grid ${lv<3?'locked':''}"><div><small>${lv>=3?'LV.3 · 실제 시작 체크':'LV.3 · LOCKED'}</small>${lv>=3?'<p>• 기존 허가/승인 문서와 최신 회의록 찾기</p><p>• 관할기관 제출 안내의 최신본 확인</p><p>• 심의·평가·협의 담당과 마감일을 한 표로 정리</p><p>• 건축/구조/기계/전기/소방/토목 등 자료 담당자를 붙이기</p>':'<p>책임 레벨부터 제출자료 분해·보완관리까지 열립니다.</p>'}</div><div><small>세움터 사용</small><p>건축허가·신고·건축물대장 등 건축행정 업무에서 중요하지만, 프로젝트의 원 승인경로와 해당 업무가 세움터 처리 대상인지 먼저 확인하세요.</p><small>완료 기준</small><p>제출목록과 실제 파일이 1:1로 대응하고, 심의·평가 조건과 보완사항이 다음 도면/절차까지 추적되면 됩니다.</p></div></div>
    <div class="cc235-pick"><small>주요 심의·평가부터 확인</small><div>${reviewButtons()}</div></div>
  </article>`,window.CC_SEARCH_ANSWER.model(window.CC_REVIEW_RULES.flows.permit.title,window.CC_REVIEW_RULES.flows.permit.steps));wireGo();
}

function runQuery(q){const t=topic(q);if(!t)return false;if($('searchInput'))$('searchInput').value=q;if(t.kind==='overview')renderOverview();else if(t.kind==='permit')renderPermit();else renderReview(t.key);return true}
function wireGo(){document.querySelectorAll('[data-cc235-go]').forEach(b=>{if(b.dataset.wired)return;b.dataset.wired='1';b.addEventListener('click',()=>runQuery(b.dataset.cc235Go||''))})}

function patchHow(){
  const root=$('contextResult');if(!root)return;root.querySelector('.cc235-how')?.remove();if(level()<3)return;
  const task=$('task')?.value||'';if(!window.CC_REVIEW_RULES.supportsTask(task))return;
  const pane=root.querySelector('[data-pane="how"]');if(!pane)return;
  const box=document.createElement('div');box.className='cc235-how';box.innerHTML=`<small>PERMIT PRACTICE</small><b>${esc(window.CC_REVIEW_RULES.practice.title)}</b>${window.CC_REVIEW_RULES.practice.steps.map((step,i)=>`<div><span>${i+1}</span>${esc(step)}</div>`).join('')}<button type="button" data-cc235-open>인허가 실무 패키지에서 자세히 보기 →</button>`;pane.appendChild(box);box.querySelector('[data-cc235-open]').onclick=()=>{if(typeof showView==='function')showView('search');runQuery('인허가 실무 패키지')};
}

function addExamples(){const box=document.querySelector('#view-search .examples');if(!box||box.querySelector('[data-cc235-example]'))return;[['건축심의 대상이야?','건축심의'],['경관심의는 언제 해?','경관심의'],['소방심의는 어떤 절차야?','소방 관련'],['인허가 실무 패키지','인허가 실무']].forEach(([q,n])=>{const b=document.createElement('button');b.type='button';b.dataset.cc235Example='1';b.dataset.searchQuery=q;b.textContent=n;b.onclick=()=>runQuery(q);box.appendChild(b)})}
function installStyle(){if($('cc235Style'))return;const s=document.createElement('style');s.id='cc235Style';s.textContent=`
.cc235-review-card,.cc235-overview{padding:20px}.cc235-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.cc235-top h3,.cc235-overview h3{margin:4px 0 6px;font-size:22px;color:#17355d}.cc235-top p,.cc235-overview>p{margin:0;font-size:12px;line-height:1.65;color:#465c77}.cc235-top>span{padding:6px 9px;border-radius:999px;background:#edf3ff;color:#5067e5;font-size:9px;font-weight:900;white-space:nowrap}.cc235-project{display:flex;gap:8px;align-items:baseline;margin-top:12px;padding:9px 11px;border-radius:10px;background:#f6f8fc}.cc235-project b{font-size:9px;color:#40597c}.cc235-project span{font-size:9px;color:#7a8799}.cc235-core{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.cc235-core>div,.cc235-practice-grid>div{padding:12px;border:1px solid #e2e8f2;border-radius:12px;background:#fff}.cc235-core small,.cc235-practice-grid small,.cc235-pick>small,.cc235-sources>small{font-size:8px;font-weight:950;color:#62738b;letter-spacing:.04em}.cc235-core p,.cc235-practice-grid p{margin:5px 0 0;font-size:10px;line-height:1.6;color:#405570}.cc235-caution{display:flex;gap:8px;margin-top:9px;padding:10px 11px;border-radius:11px;background:#fff8e9}.cc235-caution b{font-size:9px;color:#9a6b18;white-space:nowrap}.cc235-caution span{font-size:9px;line-height:1.55;color:#735f3f}.cc235-practice{margin-top:10px;border:1px solid #e2e8f2;border-radius:12px;background:#fbfcfe;padding:0 12px 11px}.cc235-practice summary{padding:11px 0;cursor:pointer;font-size:10px;font-weight:900;color:#4f637e}.cc235-practice-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:8px}.cc235-practice-grid.locked{grid-template-columns:1fr 1fr}.cc235-lock{padding:12px;border-radius:10px;background:#f5f7fa}.cc235-lock b,.cc235-lock span{display:block}.cc235-lock b{font-size:10px;color:#40516a}.cc235-lock span{margin-top:4px;font-size:9px;color:#7d8999}.cc235-sources{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid #edf0f4}.cc235-sources a{padding:6px 8px;border:1px solid #dfe6ef;border-radius:999px;text-decoration:none;color:#4f66df;font-size:8px;font-weight:900}.cc235-sources span{font-size:8px;color:#8994a3}.cc235-flow{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:13px}.cc235-flow>div{padding:10px;border:1px solid #e2e8f2;border-radius:11px;background:#fff}.cc235-flow i{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#eef2ff;color:#5369e8;font-size:8px;font-style:normal;font-weight:950}.cc235-flow b,.cc235-flow span{display:block}.cc235-flow b{margin-top:6px;font-size:10px;color:#314b6e}.cc235-flow span{margin-top:3px;font-size:8px;line-height:1.45;color:#7a8798}.cc235-pick{margin-top:12px}.cc235-pick>div{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.cc235-pick button{border:1px solid #dce4ef;border-radius:999px;background:#fff;padding:7px 10px;color:#4c62d9;font-size:9px;font-weight:900;cursor:pointer}.cc235-how{margin-top:10px;padding:12px;border:1px solid #cfdcf7;border-radius:12px;background:#f6f9ff}.cc235-how>small{display:block;font-size:8px;font-weight:950;color:#5369e8}.cc235-how>b{display:block;margin:4px 0 8px;font-size:10px;color:#314b70}.cc235-how>div{display:grid;grid-template-columns:20px 1fr;gap:7px;align-items:center;margin-top:5px;font-size:9px;color:#50647f}.cc235-how>div span{display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#fff;color:#5268e6;font-size:8px;font-weight:950}.cc235-how button{margin-top:9px;border:0;background:transparent;color:#5067df;font-size:9px;font-weight:900;cursor:pointer;padding:0}
@media(max-width:700px){.cc235-review-card,.cc235-overview{padding:16px}.cc235-top{display:grid}.cc235-top>span{justify-self:start}.cc235-core,.cc235-practice-grid,.cc235-practice-grid.locked,.cc235-flow{grid-template-columns:1fr}.cc235-project{display:grid;gap:3px}.cc235-caution{align-items:flex-start}.cc235-flow{gap:6px}}
`;document.head.appendChild(s)}
function install(){
  installStyle();addExamples();
  window.CC_RUNTIME.registerSearch('reviews',topic,(_,q)=>runQuery(q));
  window.CC_RUNTIME.registerContext('reviews',patchHow);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
