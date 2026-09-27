(()=>{
'use strict';
const VERSION='2.1.35';
const store=window.CC_PROJECT_STORE;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function level(){return window.CC_LEVEL_STORE.state().view}
const activeProject=()=>store.active();

const {LAW,REVIEWS,GUIDE,guideView,topic}=window.CC_REVIEW_RULES;
let guideSelection={type:'general',stage:'all'};

function guideTopic(key){
  const d=REVIEWS[key],g=GUIDE.topics[key];
  return `<details class="cc235-guide-topic" data-permit-topic="${esc(key)}"><summary><span><small>${esc(g.kind)}</small><b>${esc(d.name)}</b></span><span class="cc235-guide-disclosure" aria-hidden="true">확인할 내용 <i>＋</i></span></summary><div class="cc235-guide-topic-body"><p class="cc235-guide-why">${esc(g.why)}</p><dl><div><dt>대상 확인 조건</dt><dd>${esc(g.check)}</dd></div><div><dt>확인할 수치·자료</dt><dd>${esc(g.scale)}</dd></div><div><dt>준비와 후속 업무</dt><dd>${esc(g.timing)}</dd></div></dl><p class="cc235-guide-caution">${esc(d.caution)}</p><button type="button" class="cc235-guide-link" data-cc235-go="${esc(d.name)}">${esc(d.name)} 상세 안내 보기 →</button></div></details>`;
}
function renderGuide(focusId){
  const out=$('searchResult');if(!out)return;
  const view=guideView(guideSelection.type,guideSelection.stage);
  guideSelection={type:view.type,stage:view.stage};
  const type=GUIDE.types[view.type],stage=GUIDE.stages[view.stage];
  const options=(items,selected)=>Object.entries(items).map(([key,item])=>`<option value="${esc(key)}"${key===selected?' selected':''}>${esc(item.label)}</option>`).join('');
  window.CC_SEARCH_ANSWER.write(out,`<article class="result-card cc235-guide" data-cc221="1"><header><small class="cc235-guide-eyebrow">인허가 검토 안내</small><h3>어떤 절차를 확인해야 할까요?</h3><p>프로젝트 유형과 시점을 골라, 검토할 이유와 준비할 내용을 살펴보세요.</p></header><p class="cc235-guide-scope"><b>검토 후보 안내</b> 대상 여부를 확정한 목록은 아니에요. 위치·규모·적용 시점과 관할 기준을 함께 확인하세요.</p><div class="cc235-guide-filters"><div><label for="cc235GuideType">프로젝트 유형</label><select id="cc235GuideType">${options(GUIDE.types,view.type)}</select></div><div><label for="cc235GuideStage">확인할 시점</label><select id="cc235GuideStage">${options(GUIDE.stages,view.stage)}</select></div></div><section class="cc235-guide-first"><small>먼저 확인할 일</small><h4>${esc(type.first)}</h4><p>${esc(type.why)}</p><details class="cc235-guide-scale"><summary>규모에서 확인할 항목 보기</summary><p>${esc(type.scale)}</p><p>‘3만㎡’처럼 면적 하나만으로는 대상 여부를 판단할 수 없어요. 어떤 면적인지와 해당 기준의 산정 범위를 함께 확인하세요.</p></details><button type="button" class="cc235-guide-link" data-cc235-go="인허가 실무 패키지">승인경로·준비 순서 보기 →</button></section><section class="cc235-guide-candidates" aria-labelledby="cc235GuideCandidates"><div class="cc235-guide-section-head"><h4 id="cc235GuideCandidates">${view.stage==='all'?'먼저 살펴볼 검토 후보':esc(stage.label)+'에서 살펴볼 검토 후보'}</h4><p>${esc(stage.action)}</p></div><p class="cc235-guide-stage-note">읽는 순서를 제안해요. 법정 접수기한이나 확정된 선후행 순서는 아니며, 이전에 놓친 절차도 확인하세요.</p><div>${view.priority.map(guideTopic).join('')}</div><details class="cc235-guide-more"><summary>그 밖의 검토 후보 ${view.others.length}개 보기</summary><p>선택한 유형·시점과 관계없이 적용 가능성을 확인할 항목이에요.</p>${view.others.map(guideTopic).join('')}</details></section><footer class="cc235-guide-footer"><p>주요 심의·평가·인증 9종을 안내해요. 개발행위·농지·산지·개별 시설법상 절차 등은 이 목록에 모두 포함되어 있지 않아요.</p><p>확인할 원문: 최신 법령·시행일·적용례·경과조치 / 시·군·구 조례 / 지구단위계획·특별계획구역 결정도서 / 관할기관 안내</p><small>안내 정리일 ${esc(GUIDE.edited)} · 개별 법령·조례의 최신 적용 기준을 검증한 날짜는 아니에요.</small></footer></article>`);
  wireGo();
  for(const [id,key] of [['cc235GuideType','type'],['cc235GuideStage','stage']])$(id).addEventListener('change',event=>{
    guideSelection={...guideSelection,[key]:event.target.value};renderGuide(id);
  });
  if(focusId)$(focusId)?.focus({preventScroll:true});
}
function guideBack(out){
  out.insertAdjacentHTML('beforeend','<button type="button" class="cc235-guide-back" data-cc235-go="인허가">← 인허가 검토 안내</button>');
}

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
  guideBack(out);wireGo();
}

function reviewFlow(steps){return '<div class="cc235-flow">'+steps.map(([title,body],i)=>`<div><i>${i+1}</i><b>${esc(title)}</b><span>${esc(body)}</span></div>`).join('')+'</div>'}
function reviewButtons(){
  const entries=[['건축심의','건축심의 대상과 준비자료 알려줘'],['경관심의','경관심의 대상과 준비자료 알려줘'],['소방 관련','소방심의는 어떤 절차야?'],['교통영향','교통영향평가 언제 해?'],['환경','환경영향평가 어떤 경우 확인해?'],['교육환경','교육환경평가 언제 해?'],['재해영향','재해영향평가 언제 확인해?'],['BF','BF 인증 언제 확인해?'],['ZEB','ZEB 인증 언제 확인해?']];
  return entries.map(([n,q])=>`<button type="button" data-cc235-go="${esc(q)}">${esc(n)}</button>`).join('');
}
function renderOverview(){
  renderGuide();
}
function renderPermit(){
  const out=$('searchResult');if(!out)return;const lv=level();
  window.CC_SEARCH_ANSWER.write(out,`<article class="result-card cc235-overview" data-cc221="1"><div class="label">LV.3 · PERMIT PRACTICE</div><h3>${esc(window.CC_REVIEW_RULES.flows.permit.title)}</h3><p>가장 먼저 <b>“이 프로젝트가 어떤 법적 경로로 승인되는지”</b>를 확인해야 심의·평가·제출자료가 제대로 연결됩니다.</p>${projectBanner()}
    ${reviewFlow(window.CC_REVIEW_RULES.flows.permit.steps)}
    <div class="cc235-practice-grid ${lv<3?'locked':''}"><div><small>${lv>=3?'LV.3 · 실제 시작 체크':'LV.3 · LOCKED'}</small>${lv>=3?'<p>• 기존 허가/승인 문서와 최신 회의록 찾기</p><p>• 관할기관 제출 안내의 최신본 확인</p><p>• 심의·평가·협의 담당과 마감일을 한 표로 정리</p><p>• 건축/구조/기계/전기/소방/토목 등 자료 담당자를 붙이기</p>':'<p>책임 레벨부터 제출자료 분해·보완관리까지 열립니다.</p>'}</div><div><small>세움터 사용</small><p>건축허가·신고·건축물대장 등 건축행정 업무에서 중요하지만, 프로젝트의 원 승인경로와 해당 업무가 세움터 처리 대상인지 먼저 확인하세요.</p><small>완료 기준</small><p>제출목록과 실제 파일이 1:1로 대응하고, 심의·평가 조건과 보완사항이 다음 도면/절차까지 추적되면 됩니다.</p></div></div>
    <div class="cc235-pick"><small>주요 심의·평가부터 확인</small><div>${reviewButtons()}</div></div>
  </article>`,window.CC_SEARCH_ANSWER.model(window.CC_REVIEW_RULES.flows.permit.title,window.CC_REVIEW_RULES.flows.permit.steps));guideBack(out);wireGo();
}

function runQuery(q){const t=topic(q);if(!t)return false;if($('searchInput'))$('searchInput').value=q;if(t.kind==='overview'||t.kind==='guide')renderOverview();else if(t.kind==='permit')renderPermit();else renderReview(t.key);return true}
function wireGo(){document.querySelectorAll('[data-cc235-go]').forEach(b=>{if(b.dataset.wired)return;b.dataset.wired='1';b.addEventListener('click',()=>runQuery(b.dataset.cc235Go||''))})}

function patchHow(){
  const root=$('contextResult');if(!root)return;root.querySelector('.cc235-how')?.remove();if(level()<3)return;
  const task=$('task')?.value||'';if(!window.CC_REVIEW_RULES.supportsTask(task))return;
  const pane=root.querySelector('[data-pane="how"]');if(!pane)return;
  const box=document.createElement('div');box.className='cc235-how';box.innerHTML=`<small>PERMIT PRACTICE</small><b>${esc(window.CC_REVIEW_RULES.practice.title)}</b>${window.CC_REVIEW_RULES.practice.steps.map((step,i)=>`<div><span>${i+1}</span>${esc(step)}</div>`).join('')}<button type="button" data-cc235-open>인허가 실무 패키지에서 자세히 보기 →</button>`;pane.appendChild(box);box.querySelector('[data-cc235-open]').onclick=()=>{if(typeof showView==='function')showView('search');runQuery('인허가 실무 패키지')};
}

function addExamples(){const box=document.querySelector('#view-search .examples');if(!box||box.querySelector('[data-cc235-example]'))return;[['인허가','인허가 검토 안내'],['건축심의 대상이야?','건축심의'],['경관심의는 언제 해?','경관심의'],['소방심의는 어떤 절차야?','소방 관련'],['인허가 실무 패키지','인허가 실무']].forEach(([q,n])=>{const b=document.createElement('button');b.type='button';b.dataset.cc235Example='1';b.dataset.searchQuery=q;b.textContent=n;b.onclick=()=>runQuery(q);box.appendChild(b)})}

function install(){
  addExamples();
  window.CC_RUNTIME.registerSearch('reviews',topic,(_,q)=>runQuery(q));
  window.CC_RUNTIME.registerContext('reviews',patchHow);
}
window.CC_BOOT.register('v235_permit_reviews',install);
})();
