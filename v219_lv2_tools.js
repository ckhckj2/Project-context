(()=>{
'use strict';
const VERSION='2.1.19';
const byId=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const previousRunSearch=window.runSearch;

const TOOLS={
  seumteo:{
    key:'세움터',
    label:'건축행정시스템 세움터',
    url:'https://www.eais.go.kr/',
    when:'건축허가·신고, 착공, 사용승인 등 건축행정 절차를 실제 접수·처리하거나 기존 제출·처리 이력을 확인할 때',
    what:'현재 신청/처리 상태, 기존 제출자료·보완 이력, 건축행정 관련 민원·발급 서비스 등',
    how:'① 지금 프로젝트의 인허가 경로와 관할청 확인 → ② 기존 접수·승인 이력 확인 → ③ 최신 건축도서와 협력업체 자료의 기준일 통일 → ④ 해당 절차의 제출요건을 확인한 뒤 전자접수',
    caution:'모든 프로젝트에 같은 업로드 목록이 적용되는 것은 아닙니다. 절차·관할청·프로젝트 조건에 따라 요구자료가 달라질 수 있으므로 PM/인허가 담당과 관할청 안내를 함께 확인하세요.'
  },
  eum:{
    key:'토지이음',
    label:'토지이음',
    url:'https://www.eum.go.kr/',
    when:'프로젝트 초기에 대지의 용도지역·지구·구역, 토지이용규제, 지구단위계획 적용 여부 등 입지 조건을 확인할 때',
    what:'토지이용계획, 용도지역·지구·구역, 행위제한 관련 정보, 도시계획 고시정보 등',
    how:'① 지번으로 대지 조회 → ② 용도지역·지구·구역 확인 → ③ 지구단위계획 등 추가 계획 적용 여부 확인 → ④ 설계에 영향 주는 항목만 체크리스트로 옮기기',
    caution:'토지이음 화면만으로 지구단위계획의 세부 건축기준을 끝내지 마세요. 최신 결정도서·변경고시는 관할 지자체의 공식 고시·공고와 결정도서 원문까지 다시 확인하는 것이 안전합니다.'
  },
  law:{
    key:'국가법령정보센터',
    label:'국가법령정보센터',
    url:'https://www.law.go.kr/',
    when:'적용 법령의 근거조문, 시행령·시행규칙, 별표·서식, 예외조건, 시행일과 개정이력을 확인할 때',
    what:'법률·대통령령·부령, 행정규칙, 별표·서식, 자치법규, 판례·해석례 등 공식 법령정보',
    how:'① 프로젝트의 법적 용도·사업방식부터 확정 → ② 법률 → 시행령 → 시행규칙 순으로 확인 → ③ 별표·서식·예외조항 확인 → ④ 현재 시행 중인 버전과 시행일 재확인 → ⑤ 필요한 경우 자치법규까지 연결',
    caution:'검색어에 걸린 조문 하나만 보고 결론내리지 마세요. 정의조항·적용대상·예외·부칙/시행일을 같이 봐야 하며, 실제 적용 여부는 프로젝트 조건과 함께 판단해야 합니다.'
  },
  local:{
    key:'지자체 포털',
    label:'관할 지자체 도시계획·고시/공고 포털',
    url:'',
    when:'지구단위계획 결정·변경, 도시관리계획, 지역별 조례·가이드라인, 심의 운영기준처럼 지역마다 달라지는 자료를 확인할 때',
    what:'최신 고시·공고, 결정도서·결정도, 지구단위계획 지침, 도시계획위원회/건축위원회 관련 안내, 지역 조례·가이드라인 등',
    how:'① 관할 시·군·구 확인 → ② 도시계획/고시·공고 메뉴에서 계획명·지번·구역명 검색 → ③ 가장 최근 변경고시와 첨부 결정도서 확인 → ④ 애매한 해석만 사내 검토 후 담당부서에 질의',
    caution:'지자체마다 포털 이름과 메뉴 구성이 다르고 오래된 자료가 검색 상단에 나올 수 있습니다. 반드시 고시일·변경이력·첨부파일의 최신성을 확인하세요.'
  }
};

function toolForQuery(q){
  if(/세움터|eais/i.test(q))return TOOLS.seumteo;
  if(/토지이음|eum|토지이용계획/i.test(q))return TOOLS.eum;
  if(/국가법령정보센터|법령정보센터|law\.go|법제처/i.test(q))return TOOLS.law;
  if(/지자체.*(?:포털|고시|공고|도시계획)|도시계획.*포털|결정도서|변경고시/i.test(q))return TOOLS.local;
  return null;
}
function toolCard(tool,compact=false){
  const link=tool.url?`<a class="cc219-tool-link" href="${tool.url}" target="_blank" rel="noopener noreferrer">공식 사이트 열기 ↗</a>`:'';
  return `<div class="cc219-tool-detail${compact?' compact':''}"><div class="cc219-tool-detail-head"><div><small>LV.2 · PRACTICAL TOOL</small><b>${safe(tool.label)}</b></div>${link}</div><div class="result-grid"><div class="result-cell"><small>언제 쓰나요?</small><p>${safe(tool.when)}</p></div><div class="result-cell"><small>무엇을 보나요?</small><p>${safe(tool.what)}</p></div><div class="result-cell"><small>어떤 순서로?</small><p>${safe(tool.how)}</p></div></div><div class="cc219-tool-caution"><b>주의</b><span>${safe(tool.caution)}</span></div></div>`;
}
function recommendedTools(task){
  const s=task||'';
  if(/지구단위|대지|법규|규모/.test(s))return ['eum','law','local'];
  if(/인허가|허가|착공|사용승인|사용검사|변경/.test(s))return ['seumteo','law','local'];
  if(/심의/.test(s))return ['local','law'];
  return ['eum','law','seumteo','local'];
}
function patchContext(){
  const root=byId('contextResult');
  if(!root||!root.innerHTML.trim())return;
  const lv=(typeof window.viewLevel==='function')?window.viewLevel():1;
  const whyPane=root.querySelector('[data-pane="why"]');
  if(!whyPane)return;

  whyPane.querySelectorAll('.detail-cell small').forEach(el=>{
    if(el.textContent.trim()==='DONE')el.textContent='완료 기준';
  });
  if(lv<2)return;

  let tools=whyPane.querySelector('.cc219-tools');
  if(!tools){
    const task=byId('task')?.value||'';
    const keys=recommendedTools(task);
    tools=document.createElement('div');
    tools.className='cc219-tools';
    tools.innerHTML=`<div class="cc219-tools-head"><div><small>PRACTICAL TOOLS</small><b>실무 사이트·도구 사용 가이드</b></div><span>필요할 때 하나씩 열어보세요.</span></div><div class="cc219-tool-tabs">${keys.map((k,i)=>`<button data-tool="${k}" class="${i===0?'active':''}">${safe(TOOLS[k].key)}</button>`).join('')}</div><div class="cc219-tool-body">${toolCard(TOOLS[keys[0]],true)}</div>`;
    whyPane.appendChild(tools);
    tools.querySelectorAll('[data-tool]').forEach(btn=>btn.addEventListener('click',()=>{
      tools.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b===btn));
      tools.querySelector('.cc219-tool-body').innerHTML=toolCard(TOOLS[btn.dataset.tool],true);
    }));
  }
}
function renderToolSearch(tool){
  const out=byId('searchResult');
  if(!out)return;
  out.innerHTML=`<div class="result-card cc219-search"><div class="label">PRACTICAL TOOL · 척척</div><h3>${safe(tool.label)}는 이렇게 보면 돼요</h3><p>도구 자체를 외우기보다, 지금 어떤 정보를 확인하려는지 먼저 정하고 필요한 화면만 보는 방식이 빠릅니다.</p>${toolCard(tool)}</div>`;
}
function runSearch(){
  const input=byId('searchInput');
  const q=input?.value.trim()||'';
  if(!q)return;
  const tool=toolForQuery(q);
  if(tool){renderToolSearch(tool);return;}
  if(typeof previousRunSearch==='function')previousRunSearch();
}
function installStyles(){
  if(document.getElementById('cc219ToolsStyle'))return;
  const style=document.createElement('style');
  style.id='cc219ToolsStyle';
  style.textContent=`
  .cc219-tools{margin-top:12px;padding:13px;border:1px solid #E2E8F4;border-radius:14px;background:#FBFCFF}
  .cc219-tools-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:9px}.cc219-tools-head small{display:block;font-size:8px;letter-spacing:.1em;font-weight:950;color:#7D8BA7;margin-bottom:3px}.cc219-tools-head b{font-size:12px;color:#33415E}.cc219-tools-head span{font-size:9px;color:#919BAE}
  .cc219-tool-tabs{display:flex;gap:6px;flex-wrap:wrap}.cc219-tool-tabs button{border:1px solid #DFE5F0;background:#fff;border-radius:999px;padding:7px 9px;font-size:9.5px;font-weight:900;color:#65728A}.cc219-tool-tabs button.active{background:#EEF3FF;border-color:#C9D8FF;color:#3566D6}
  .cc219-tool-body{margin-top:9px}.cc219-tool-detail{padding:13px;border:1px solid #DFE7F6;border-radius:14px;background:#fff}.cc219-tool-detail.compact{padding:11px}.cc219-tool-detail-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}.cc219-tool-detail-head small{display:block;font-size:8px;font-weight:950;letter-spacing:.1em;color:#7F8BA3;margin-bottom:3px}.cc219-tool-detail-head b{font-size:12px;color:#30405F}.cc219-tool-link{display:inline-flex;align-items:center;text-decoration:none;border:1px solid #D9E4FF;background:#F5F8FF;color:#3566D6;border-radius:999px;padding:7px 9px;font-size:9px;font-weight:950;white-space:nowrap}
  .cc219-tool-caution{display:grid;grid-template-columns:auto 1fr;gap:7px;margin-top:8px;padding:9px 10px;border:1px solid #F0DEBE;border-radius:11px;background:#FFF9EF}.cc219-tool-caution b{font-size:9px;color:#A56A19}.cc219-tool-caution span{font-size:9.5px;line-height:1.55;color:#7E6947}
  .cc219-search .cc219-tool-detail{margin-top:12px}.cc219-search .result-grid{margin-top:0}
  @media(max-width:700px){.cc219-tools-head{align-items:flex-start;flex-direction:column}.cc219-tool-detail-head{align-items:flex-start;flex-direction:column}.cc219-tool-link{align-self:flex-start}}
  `;
  document.head.appendChild(style);
}
function addSearchExamples(){
  const examples=document.querySelector('#view-search .examples');
  if(!examples||examples.querySelector('[data-cc219-tool]'))return;
  const items=[['세움터 어떻게 써요?','세움터'],['토지이음에서 뭘 봐요?','토지이음'],['국가법령정보센터에서 법규를 어떻게 찾아요?','법령정보'],['지자체 도시계획 포털에서는 뭘 확인해요?','지자체 포털']];
  items.forEach(([q,label])=>{const b=document.createElement('button');b.dataset.cc219Tool='1';b.textContent=label;b.addEventListener('click',()=>{const input=byId('searchInput');if(input)input.value=q;runSearch();});examples.appendChild(b);});
}
function install(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  installStyles();
  addSearchExamples();
  const analyzeBtn=byId('analyze');
  if(analyzeBtn)analyzeBtn.addEventListener('click',()=>setTimeout(patchContext,0));
  const context=byId('contextResult');
  if(context&&context.innerHTML.trim())patchContext();
  const go=byId('searchGo');
  if(go)go.addEventListener('click',()=>setTimeout(()=>{const tool=toolForQuery(byId('searchInput')?.value||'');if(tool)renderToolSearch(tool);},0));
  const input=byId('searchInput');
  if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter'){const tool=toolForQuery(input.value);if(tool){e.preventDefault();setTimeout(()=>renderToolSearch(tool),0);}}});
  window.runSearch=runSearch;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();