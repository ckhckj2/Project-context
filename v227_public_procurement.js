(()=>{
'use strict';
const VERSION='2.1.27';
const previousRunSearch=window.runSearch;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const PUBLIC_RE=/(공공건축|건축기획|사전검토|공공건축심의|설계공모|제안공모|입찰|과업지시서|과업내용서|나라장터|조달청|g2b|발주방식|공공\s*발주)/i;
const PUBLIC_HINT_IDS=new Set(['publicoffice','court','correctional','publiclibrary','publicmuseum','school']);

const LINKS={
  law:'https://www.law.go.kr/법령/건축서비스산업진흥법',
  g2b:'https://www.g2b.go.kr/',
  pps:'https://www.pps.go.kr/kor/content.do?key=00732'
};

function intent(q){
  if(/공공건축심의|심의위원회/.test(q))return 'review';
  if(/사전검토/.test(q))return 'precheck';
  if(/건축기획/.test(q))return 'planning';
  if(/설계공모|제안공모/.test(q))return 'competition';
  if(/과업지시서|과업내용서/.test(q))return 'brief';
  if(/나라장터|g2b/i.test(q))return 'g2b';
  if(/조달청/.test(q))return 'pps';
  if(/입찰|발주방식|공공\s*발주/.test(q))return 'procurement';
  return 'overview';
}
function copyFor(type){
  const base={
    overview:{title:'공공건축은 “건축기획 → 적용절차 확인 → 발주 → 설계” 순으로 보면 쉬워요',first:'발주기관과 사업방식을 먼저 확인하고, 건축기획·사전검토·공공건축심의 대상 여부를 차례로 확인하세요.',doc:'사업계획·건축기획 자료 · 공고문 · 과업지시서/설계지침서',next:'공모인지 입찰인지 발주방식을 확정한 뒤 해당 공고의 첨부문서를 기준으로 움직이세요.'},
    planning:{title:'건축기획은 설계를 발주하기 전에 “무엇을, 어떻게 발주할지” 정리하는 단계예요',first:'사업 규모·내용·기간·재원과 발주방식, 디자인관리·지속가능성 조건을 먼저 정리하세요.',doc:'사업계획서 · 건축기획 자료 · 예산/부지/운영 요구조건',next:'법정 대상이면 사전검토와 공공건축심의를 거친 뒤 설계 발주로 넘어갑니다.'},
    precheck:{title:'사전검토는 공공건축 사업계획을 설계 발주 전에 점검받는 절차예요',first:'먼저 우리 사업이 건축서비스법 시행령상 사전검토 대상인지 확인하세요.',doc:'공공건축 사업계획서 · 건축기획 자료',next:'사전검토 대상이면 공공건축지원센터 등에 요청하고, 완료 후 공공건축심의 대상 여부를 이어서 확인하세요.'},
    review:{title:'공공건축심의는 “설계안 심의”보다 앞단의 건축기획을 검토하는 절차예요',first:'설계비 추정가격과 사업 조건으로 심의 대상 여부부터 확인하세요.',doc:'건축기획 자료 · 사전검토 의견(해당 시) · 설계용역 과업내용',next:'심의 결과를 건축기획·과업내용에 반영한 뒤 설계공모 또는 입찰 공고로 넘어갑니다.'},
    competition:{title:'설계공모에서는 공고문과 설계지침서가 가장 먼저 볼 실무 기준이에요',first:'공모방식·참가자격·일정·제출물·심사기준부터 체크리스트로 옮기세요.',doc:'설계공모 공고문 · 설계지침서 · 과업내용서 · 질의응답/공지',next:'법정 우선 적용 대상인지 확인하고, 실제 참가·제출 기준은 해당 공고의 최신 문서를 따르세요.'},
    brief:{title:'과업지시서는 “이번 설계용역에서 어디까지 해야 하는지”를 확인하는 문서예요',first:'업무범위·성과품·일정·협의/보고·검토조건을 먼저 표시하세요.',doc:'과업지시서/과업내용서 · 설계지침서 · 계약조건 · 공고 첨부자료',next:'모호한 범위는 착수 전에 발주기관 질의 또는 사내 PM 검토로 해석을 고정하세요.'},
    g2b:{title:'나라장터에서는 공고 제목보다 첨부문서를 먼저 같이 봐야 해요',first:'공고번호·발주기관·공모/입찰 방식·마감일을 확인한 뒤 첨부파일을 모두 내려받아 최신본을 구분하세요.',doc:'입찰/공모 공고 · 과업지시서 · 설계지침서 · 참가자격 · 질의응답/변경공고',next:'변경공고가 있는지 마지막으로 다시 확인하고, 공고문과 첨부문서가 다르면 발주기관 문의사항으로 남기세요.'},
    pps:{title:'공공건축이라고 모두 조달청이 직접 발주·관리하는 것은 아니에요',first:'먼저 발주기관이 자체 발주인지, 조달청에 계약/맞춤형서비스 등을 요청한 사업인지 확인하세요.',doc:'발주기관 공고 · 나라장터 공고 · 조달청 관련 공고/설계공모 자료',next:'조달청 수행 사업이면 조달청 공고·운영기준을, 자체 발주면 해당 발주기관의 공고·지침을 우선하세요.'},
    procurement:{title:'입찰·공모 방식부터 확인해야 준비할 문서와 평가기준이 정해져요',first:'발주기관 → 계약/공모 방식 → 참가자격 → 평가기준 → 일정 순서로 공고를 읽으세요.',doc:'입찰/공모 공고문 · 과업지시서 · 설계지침서 · 계약조건',next:'설계공모인지 가격·기술평가 중심 입찰인지 구분한 뒤 그 방식의 제출요건만 체크하세요.'}
  };
  return base[type]||base.overview;
}
function stepFlow(){
  return `<div class="cc227-flow">
    <div><small>01</small><b>건축기획</b><span>사업·발주방식 정리</span></div>
    <i>→</i><div><small>02</small><b>사전검토</b><span>해당 시</span></div>
    <i>→</i><div><small>03</small><b>공공건축심의</b><span>해당 시</span></div>
    <i>→</i><div><small>04</small><b>발주방식 확정</b><span>공모·입찰 등</span></div>
    <i>→</i><div><small>05</small><b>공고·선정</b><span>나라장터 등</span></div>
    <i>→</i><div><small>06</small><b>계약·설계</b><span>과업기준 수행</span></div>
  </div>`;
}
function applicability(){
  return `<div class="cc227-detail-grid">
    <div><small>공공건축심의</small><b>설계비 추정가격 5천만원 이상 등</b><p>건축서비스산업 진흥법 시행령상 대상 여부를 확인합니다. 사전검토 대상 사업은 사전검토 완료 후 심의를 요청합니다.</p></div>
    <div><small>사업계획 사전검토</small><b>법정 대상 여부 확인</b><p>시행령 제20조가 제17조제1항의 대상과 예외를 연결합니다. 예비타당성·타당성조사 등 일부 사업은 예외가 있으므로 사업조건을 함께 봅니다.</p></div>
    <div><small>설계공모 우선 적용</small><b>설계비 추정가격 1억원 이상이 기본 축</b><p>시행령 제17조의 용도·규모와 제외용도가 있으므로 금액만으로 단정하지 않습니다.</p></div>
  </div>`;
}
function sourceLinks(){
  return `<div class="cc227-links">
    <a href="${LINKS.law}" target="_blank" rel="noopener noreferrer"><b>국가법령정보센터</b><span>건축서비스산업 진흥법·시행령 확인 ↗</span></a>
    <a href="${LINKS.g2b}" target="_blank" rel="noopener noreferrer"><b>나라장터</b><span>공고·첨부문서·변경공고 확인 ↗</span></a>
    <a href="${LINKS.pps}" target="_blank" rel="noopener noreferrer"><b>조달청 설계공모</b><span>공모방식·조달청 절차 확인 ↗</span></a>
  </div>`;
}
function renderSearch(q){
  const out=$('searchResult');if(!out)return;
  const c=copyFor(intent(q));
  out.innerHTML=`<div class="result-card cc227-search"><div class="label">PUBLIC PROJECT · 척척</div><h3>${esc(c.title)}</h3>
    <div class="cc227-quick"><div><small>지금 먼저</small><b>${esc(c.first)}</b></div><div><small>핵심 문서</small><b>${esc(c.doc)}</b></div><div><small>다음 확인</small><b>${esc(c.next)}</b></div></div>
    <button class="cc227-more" type="button" aria-expanded="false">발주·조달 흐름 자세히 보기 <span>▾</span></button>
    <div class="cc227-detail">${stepFlow()}${applicability()}<div class="cc227-note"><b>구분해서 보기</b><span>건축법상 ‘용도’와 공공기관의 ‘발주·조달 절차’는 다른 축입니다. 또 공공건축이라고 해서 모든 사업을 조달청이 직접 수행하는 것도 아닙니다. 실제 공고와 발주기관의 사업방식을 우선 확인하세요.</span></div>${sourceLinks()}</div>
  </div>`;
  bindMore(out);
}
function bindMore(root){
  root.querySelectorAll('.cc227-more').forEach(btn=>btn.addEventListener('click',()=>{
    const detail=btn.nextElementSibling;const open=!detail.classList.contains('open');
    detail.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'▴':'▾';
  }));
}
function runPublicSearch(){
  const q=$('searchInput')?.value.trim()||'';
  if(!q)return;
  if(PUBLIC_RE.test(q)){renderSearch(q);return;}
  if(typeof previousRunSearch==='function')previousRunSearch();
}
function routeHome(){
  const q=$('homeSearch')?.value.trim()||'';
  if(!PUBLIC_RE.test(q))return;
  if(typeof showView==='function')showView('search');
  const input=$('searchInput');if(input)input.value=q;
  renderSearch(q);
}
function addExample(){
  const examples=document.querySelector('#view-search .examples');
  if(!examples||examples.querySelector('[data-cc227]'))return;
  const b=document.createElement('button');b.dataset.cc227='1';b.textContent='공공건축 발주 흐름';
  b.addEventListener('click',()=>{const input=$('searchInput');if(input)input.value='공공건축 발주·설계공모 흐름이 어떻게 돼?';renderSearch(input?.value||'공공건축');});
  examples.appendChild(b);
}
function contextHint(){
  const root=$('contextResult');const select=$('project');if(!root||!select||!root.innerHTML.trim())return;
  root.querySelector('.cc227-context')?.remove();
  if(!PUBLIC_HINT_IDS.has(select.value))return;
  const anchor=root.querySelector('.cc226-legal,.cc225-legal,.stage-banner');if(!anchor)return;
  const box=document.createElement('div');box.className='cc227-context';
  box.innerHTML=`<div class="cc227-context-head"><div><small>PUBLIC PROCUREMENT</small><b>공공기관이 발주한 프로젝트라면</b><span>건축법상 용도와 별개로 건축기획·심의·발주절차를 확인해요.</span></div><button type="button" class="cc227-context-toggle" aria-expanded="false">공공발주 흐름 보기 <span>▾</span></button></div><div class="cc227-context-detail">${stepFlow()}<p>사전검토·공공건축심의·설계공모는 모든 공공사업에 동일하게 적용되는 절차가 아닙니다. 설계비·용도·사업조건과 예외를 확인한 뒤 적용하세요.</p></div>`;
  anchor.insertAdjacentElement('afterend',box);
  const btn=box.querySelector('.cc227-context-toggle');const detail=box.querySelector('.cc227-context-detail');
  btn.addEventListener('click',()=>{const open=!detail.classList.contains('open');detail.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'▴':'▾';});
}
function style(){
  if(document.getElementById('cc227Style'))return;
  const s=document.createElement('style');s.id='cc227Style';s.textContent=`
  .cc227-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.cc227-quick>div{padding:11px 12px;border:1px solid #E4EAF3;border-radius:12px;background:#FAFBFD}.cc227-quick>div:first-child{background:#F4F8FF;border-color:#D8E5FF}.cc227-quick small{display:block;margin-bottom:5px;font-size:9px;font-weight:950;color:#7D8AA0}.cc227-quick b{font-size:11.5px;line-height:1.55;color:#344761}
  .cc227-more,.cc227-context-toggle{border:1px solid #DCE5F2;background:#fff;color:#3F5F91;border-radius:10px;padding:9px 11px;font-size:10px;font-weight:900}.cc227-more{width:100%;margin-top:9px}.cc227-detail,.cc227-context-detail{display:none}.cc227-detail.open,.cc227-context-detail.open{display:block}
  .cc227-flow{display:flex;align-items:stretch;gap:6px;margin-top:12px;overflow-x:auto;padding:2px 0 7px}.cc227-flow>div{flex:1;min-width:102px;padding:10px;border:1px solid #E2E8F2;border-radius:11px;background:#fff}.cc227-flow>div small{display:block;font-size:8px;font-weight:950;color:#8C98AC}.cc227-flow>div b{display:block;margin:3px 0;font-size:10.5px;color:#314761}.cc227-flow>div span{font-size:8.8px;color:#7B879B}.cc227-flow>i{align-self:center;font-style:normal;color:#A4B0C1;font-size:10px}
  .cc227-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.cc227-detail-grid>div{padding:11px;border:1px solid #E5EAF2;border-radius:12px;background:#FAFBFD}.cc227-detail-grid small{display:block;font-size:8.5px;font-weight:950;color:#7D899E}.cc227-detail-grid b{display:block;margin:4px 0;font-size:10.8px;color:#324762}.cc227-detail-grid p{margin:0;font-size:9.5px;line-height:1.6;color:#66758B}
  .cc227-note{display:grid;grid-template-columns:auto 1fr;gap:8px;margin-top:9px;padding:10px 11px;border:1px solid #F0DFBE;border-radius:11px;background:#FFF9EF}.cc227-note b{font-size:9px;color:#A26A1D}.cc227-note span{font-size:9.7px;line-height:1.55;color:#75664D}
  .cc227-links{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.cc227-links a{display:block;text-decoration:none;padding:10px;border:1px solid #DFE7F3;border-radius:11px;background:#fff}.cc227-links b{display:block;font-size:10px;color:#2F4A70}.cc227-links span{display:block;margin-top:3px;font-size:8.8px;color:#74839A}
  .cc227-context{margin:9px 0 0;padding:11px 12px;border:1px solid #DCE7F7;border-radius:13px;background:#F8FBFF}.cc227-context-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.cc227-context-head small{display:block;font-size:8px;font-weight:950;letter-spacing:.08em;color:#7092C8}.cc227-context-head b{display:block;margin:2px 0;font-size:11.5px;color:#304D72}.cc227-context-head span{font-size:9.5px;color:#758399}.cc227-context-detail{padding-top:2px}.cc227-context-detail>p{margin:3px 0 0;font-size:9.5px;line-height:1.55;color:#718097}
  @media(max-width:700px){.cc227-quick,.cc227-detail-grid,.cc227-links{grid-template-columns:1fr}.cc227-context-head{align-items:flex-start;flex-direction:column}.cc227-context-toggle{width:100%}.cc227-flow>div{min-width:96px}.cc227-quick b{font-size:11px}}
  `;document.head.appendChild(s);
}
function install(){
  style();addExample();
  const analyze=$('analyze');if(analyze)analyze.addEventListener('click',()=>setTimeout(contextHint,180));
  const go=$('searchGo');if(go)go.addEventListener('click',()=>{const q=$('searchInput')?.value||'';if(PUBLIC_RE.test(q))setTimeout(()=>renderSearch(q),40);});
  const input=$('searchInput');if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter'&&PUBLIC_RE.test(input.value)){e.preventDefault();setTimeout(()=>renderSearch(input.value),40);}});
  const homeGo=$('homeSearchBtn');if(homeGo)homeGo.addEventListener('click',()=>{if(PUBLIC_RE.test($('homeSearch')?.value||''))setTimeout(routeHome,50);});
  const home=$('homeSearch');if(home)home.addEventListener('keydown',e=>{if(e.key==='Enter'&&PUBLIC_RE.test(home.value)){e.preventDefault();setTimeout(routeHome,50);}});
  document.addEventListener('click',e=>{const ex=e.target.closest('[data-example]');if(ex&&PUBLIC_RE.test(ex.dataset.example||''))setTimeout(()=>renderSearch(ex.dataset.example),80);});
  window.runSearch=runPublicSearch;
  if($('contextResult')?.innerHTML.trim())contextHint();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
