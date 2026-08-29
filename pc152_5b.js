(()=>{
const frame=document.getElementById('app');
if(!frame)return;

const TASK_GUIDES={
  '발주처 협의자료 작성':{
    title:'발주처가 결정할 수 있게 만드는 자료예요',
    steps:[
      ['1','무엇을 결정받을지 정리','요구사항·쟁점·선택해야 할 항목을 먼저 한 줄로 정리합니다.'],
      ['2','근거를 시각적으로 보여주기','최신 도면·다이어그램·비교안으로 왜 이 안인지 설명합니다.'],
      ['3','내부 검토 후 협의','선임·책임·PM에게 논리와 표현을 먼저 확인받고 발주처 협의로 넘깁니다.']
    ],
    ask:'발주처 협의자료 작성 중인데 무엇을 넣어야 할지 모르겠어. 누구에게 먼저 물어봐?'
  },
  '보고서 작성':{
    title:'보고서는 정보를 모으는 게 아니라 판단 근거를 정리하는 일이에요',
    steps:[
      ['1','보고 목적과 독자 확인','누가 무엇을 판단하려고 보는 보고서인지 먼저 확인합니다.'],
      ['2','최신 정보만 정리','최신 도면·결정사항·변경이력·근거자료를 한 기준으로 맞춥니다.'],
      ['3','결론부터 검토받기','핵심 메시지와 빠진 내용이 없는지 선임·책임·PM에게 먼저 확인받습니다.']
    ],
    ask:'보고서 작성 중인데 어떤 내용을 넣어야 할지 모르겠어. 누구에게 먼저 물어봐?'
  },
  '인허가 자료 작성':{
    title:'먼저 지금 어떤 행정절차의 자료인지 확인하세요',
    steps:[
      ['1','절차부터 확인','건축허가·심의·착공·변경 등 지금 대응하는 절차를 먼저 구분합니다.'],
      ['2','최신 도서와 협력자료 모으기','건축도서와 구조·기계·전기·소방 등 필요한 자료의 최신본을 맞춥니다.'],
      ['3','제출 기준 확인','사내 인허가 담당과 관할기관 요구사항을 확인해 누락을 줄입니다.']
    ],
    ask:'인허가 자료 작성 중인데 어떤 자료가 필요한지 모르겠어. 누구에게 먼저 물어봐?'
  }
};

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function getDoc(){return frame.contentDocument;}
function isAskQuery(q){return /(누구|물어|문의|담당자|어디에\s*(?:물어|문의)|어디로\s*(?:물어|문의)|확인받|질문할|질의할|선임에게|책임에게|pm에게|협력업체에게)/i.test(q);}

function showAskResult(d,q){
  const home=d.getElementById('pc150Home');
  const work=d.getElementById('pc150Workspace');
  const host=d.getElementById('pc150LegacyHost');
  if(!host)return false;
  if(home)home.style.display='none';
  if(work)work.style.display='none';
  host.style.display='block';
  host.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const ask=d.getElementById('ask');
  if(ask)ask.classList.add('active');
  const title=d.getElementById('pc150LegacyTitle');
  if(title)title.textContent='검색 결과 · 누구에게 물어볼까?';
  d.querySelectorAll('[data-pc150-nav]').forEach(b=>b.classList.toggle('active',b.dataset.pc150Nav==='term'));
  const input=d.getElementById('askInput');
  if(input)input.value=q;
  d.getElementById('askBtn')?.click();
  d.defaultView.scrollTo({top:0,behavior:'smooth'});
  return true;
}

function enhanceSearch(d){
  const input=d.getElementById('pc150SearchInput');
  const button=d.getElementById('pc150SearchBtn');
  if(!input||!button||button.dataset.pc152)return;
  button.dataset.pc152='1';
  input.placeholder='업무·용어·누구에게 물어볼지 검색해보세요';
  button.addEventListener('click',e=>{
    const q=input.value.trim();
    if(!q||!isAskQuery(q))return;
    e.preventDefault();e.stopImmediatePropagation();
    showAskResult(d,q);
  },true);
  input.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    const q=input.value.trim();
    if(!q||!isAskQuery(q))return;
    e.preventDefault();e.stopImmediatePropagation();
    showAskResult(d,q);
  },true);
}

function injectStyle(d){
  if(d.getElementById('pc152Style'))return;
  const st=d.createElement('style');st.id='pc152Style';st.textContent=`
    .pc152-guide{margin:10px 0 0;border:1px solid #E2E7F1;background:#fff;border-radius:20px;padding:18px;box-shadow:0 10px 30px rgba(42,58,91,.045)}
    .pc152-guide-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.pc152-guide-head small{display:block;font-size:8.5px;letter-spacing:.11em;font-weight:950;color:#4C6FFF;margin-bottom:5px}.pc152-guide-head b{font-size:13px;line-height:1.45;color:#26324A}.pc152-guide-head button{border:0;background:#EEF2FF;color:#4C6FFF;border-radius:10px;padding:8px 10px;font-size:9.5px;font-weight:950;white-space:nowrap;touch-action:manipulation}
    .pc152-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pc152-step{border:1px solid #E8EBF2;background:#FAFBFD;border-radius:14px;padding:12px}.pc152-step i{font-style:normal;width:22px;height:22px;border-radius:8px;background:#EEF2FF;color:#4C6FFF;display:grid;place-items:center;font-size:9px;font-weight:950;margin-bottom:8px}.pc152-step b{display:block;font-size:10.5px;margin-bottom:5px}.pc152-step p{margin:0;font-size:9.8px;line-height:1.55;color:#77819A}
    @media(max-width:760px){.pc152-guide-head{display:block}.pc152-guide-head button{margin-top:10px}.pc152-steps{grid-template-columns:1fr}.pc152-step{display:grid;grid-template-columns:27px 1fr;column-gap:8px}.pc152-step i{grid-row:1/3;margin:0}.pc152-step b{margin:1px 0 3px}.pc152-step p{grid-column:2}}
  `;d.head.appendChild(st);
}

function addTaskGuide(d){
  const result=d.getElementById('projectResult');
  if(!result||!result.classList.contains('show'))return;
  result.querySelector('.pc152-guide')?.remove();
  const task=d.getElementById('pc150Task')?.value||d.getElementById('task')?.value||'';
  const g=TASK_GUIDES[task];
  const askBtn=d.getElementById('ask134');
  if(askBtn){
    askBtn.innerHTML='<small>02 · SEARCH</small>누구에게 물어봐요?';
    askBtn.onclick=()=>showAskResult(d,`${task||'현재 업무'} 중인데 막혔어. 누구에게 먼저 물어봐?`);
  }
  if(!g)return;
  const card=d.createElement('div');card.className='pc152-guide';
  card.innerHTML=`<div class="pc152-guide-head"><div><small>지금 해야 할 것 · 3 STEP</small><b>${esc(g.title)}</b></div><button type="button" data-pc152-ask>막히면 검색 →</button></div><div class="pc152-steps">${g.steps.map(s=>`<div class="pc152-step"><i>${esc(s[0])}</i><b>${esc(s[1])}</b><p>${esc(s[2])}</p></div>`).join('')}</div>`;
  const banner=result.querySelector('.stage-banner');
  if(banner?.nextSibling)result.insertBefore(card,banner.nextSibling);else result.prepend(card);
  card.querySelector('[data-pc152-ask]')?.addEventListener('click',()=>showAskResult(d,g.ask));
}

function updateVersion(d){
  d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>x.textContent='v1.5.2');
  const chip=[...d.querySelectorAll('.topchip')].find(x=>/^v1\./.test(x.textContent.trim()));if(chip)chip.textContent='v1.5.2 · 5B';
}

function install(attempt=0){
  const d=getDoc();
  if(!d||!d.getElementById('pc150Shell')){if(attempt<20)setTimeout(()=>install(attempt+1),100);return;}
  injectStyle(d);enhanceSearch(d);updateVersion(d);
  const analyze=d.getElementById('pc150Analyze');
  if(analyze&&!analyze.dataset.pc152){analyze.dataset.pc152='1';analyze.addEventListener('click',()=>setTimeout(()=>addTaskGuide(d),80));}
  const observer=new MutationObserver(()=>{updateVersion(d);const r=d.getElementById('projectResult');if(r?.classList.contains('show')&&!r.querySelector('.pc152-guide'))addTaskGuide(d);});
  const r=d.getElementById('projectResult');if(r)observer.observe(r,{childList:true,subtree:false,attributes:true,attributeFilter:['class']});
  setTimeout(()=>{updateVersion(d);enhanceSearch(d);addTaskGuide(d);},250);
}
frame.addEventListener('load',()=>install());
if(frame.contentDocument?.readyState==='complete')install();
})();