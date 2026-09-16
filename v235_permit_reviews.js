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

function install(){
  addExamples();
  window.CC_RUNTIME.registerSearch('reviews',topic,(_,q)=>runQuery(q));
  window.CC_RUNTIME.registerContext('reviews',patchHow);
}
window.CC_BOOT.register('v235_permit_reviews',install);
})();
