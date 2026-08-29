(()=>{
const frame=document.getElementById('app');
if(!frame)return;
const VERSION='1.5.6';

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function isAsk(q){return /(누구|물어|문의|담당자|어디에\s*(?:물어|문의)|어디로\s*(?:물어|문의)|확인받|질문할|질의할|어떻게\s*물어|뭐라고\s*물어)/i.test(q);}
function isTerm(q){return /(무슨\s*뜻|뜻이|뜻\?|뭐야|무엇이야|용어|정의|의미)/i.test(q)&&!/(하래|시키|업무|작성|수정|검토|찾아보|확인하래)/i.test(q);}
function isTask(q){return /(상사|선임|책임|팀장|pm|시키|하래|해오래|업무|작성|수정|정리|검토|찾아보|조사|어떻게\s*시작|뭘\s*해야|무슨\s*일)/i.test(q);}

const TASK_ROUTES=[
 {re:/발주처|협의자료|보고서|보고자료|발표자료/i,title:'의사결정용 자료를 만드는 업무예요',meaning:'자료를 예쁘게 만드는 것보다 누가 무엇을 결정해야 하는지와 그 근거를 정리하는 일이 핵심입니다.',first:'먼저 자료의 목적·독자·이번 협의에서 결정받을 항목을 한 줄씩 적습니다.',where:'최신 도면·이전 보고자료·발주처 요구사항·변경이력',ask:'선임/책임/PM에게 “이번 자료에서 발주처가 결정해야 하는 핵심이 무엇인지, 꼭 넣어야 할 기준자료가 있는지” 먼저 확인하세요.'},
 {re:/지구단위|토지이음|용도지역|용도지구|용도구역/i,title:'대지의 계획 조건을 찾아 설계의 전제조건을 정리하는 업무예요',meaning:'디자인 전에 이 대지에서 가능한 용도·규모·배치·높이 등 도시계획 조건을 확인하라는 뜻입니다.',first:'토지이음에서 기본 정보를 보고, 최신 지구단위계획 결정·변경 고시와 결정도서를 확보합니다.',where:'토지이음 → 지자체 최신 고시/결정도서',ask:'해석이 애매하면 선임/책임에게 검토받은 뒤 관할 도시계획 담당부서에 구체적인 조항과 대지조건을 붙여 질의하세요.'},
 {re:/도면|평면|단면|입면|cad|캐드|모델링/i,title:'도면 변경의 영향 범위를 확인하는 업무예요',meaning:'선을 고치는 것보다 변경이 구조·설비·피난·면적·입면 등에 미치는 영향을 같이 보는 게 중요합니다.',first:'변경 전후를 표시하고 어떤 분야가 영향을 받는지 먼저 체크합니다.',where:'최신 기준도면/모델 · 협력도면 · 변경이력',ask:'변경 목적과 범위를 선임/책임에게 먼저 확인하고, 구조·기계·전기·소방 등 영향 분야만 해당 협력업체에 질문하세요.'},
 {re:/변경허가|변경신고|경미|변경\s*업무/i,title:'기존 승인 내용과 이번 변경의 행정 영향부터 보는 업무예요',meaning:'변경량이 작아 보여도 기존 인허가 경로에 따라 처리 방식이 달라질 수 있습니다.',first:'기존 허가·승인도서와 변경안을 비교해 무엇이 달라졌는지 표로 정리합니다.',where:'기존 승인/허가도서 · 변경비교표 · 근거법',ask:'사내 인허가 담당/PM에게 원 인허가 경로를 확인한 뒤, 공식 판단이 필요한 쟁점만 관할기관에 질의하세요.'},
 {re:/인허가|허가자료|심의자료|착공|사용승인|사용검사/i,title:'현재 어떤 행정절차를 대응하는지부터 특정하는 업무예요',meaning:'같은 도면이라도 허가·심의·착공·사용승인 등 단계에 따라 필요한 자료와 확인 대상이 달라집니다.',first:'현재 절차명, 제출기한, 최신 도서 기준일을 먼저 확인합니다.',where:'기존 인허가 문서 · 세움터/발주처 지시 · 사내 제출목록',ask:'사내 인허가 담당/PM에게 현재 제출 단계와 필수자료 목록을 먼저 확인하세요.'}
];
function taskData(q){return TASK_ROUTES.find(x=>x.re.test(q))||{title:'상사가 시킨 일을 “목적 → 필요한 자료 → 다음 행동”으로 풀어보세요',meaning:'지시 문장만 보면 막막할 수 있으니, 결과물의 목적과 누가 확인하는 자료인지부터 파악하는 게 좋습니다.',first:'“최종 결과물이 무엇인지, 언제까지인지, 참고할 기존 자료가 있는지” 세 가지를 먼저 확인합니다.',where:'업무지시 · 기존 프로젝트 자료 · 최신 도면/모델',ask:'선임/책임에게 “제가 이해한 업무 목적이 맞는지, 먼저 볼 기준자료가 무엇인지” 확인하고 시작하세요.'};}
function askScript(q){
 if(/보고서|보고자료|협의자료|발주처/i.test(q))return '“이번 자료의 목적과 발주처가 결정해야 할 핵심 항목을 제가 먼저 정리하려고 합니다. 기존 자료 중 기준으로 볼 파일과 꼭 포함해야 할 내용이 있을까요?”';
 if(/구조|기둥|슬래브|내력벽|보\s*(위치|크기|춤|단면)/i.test(q))return '“현재 이 부분의 위치/형상 변경을 검토 중입니다. 구조적으로 검토가 필요한 범위와 제가 같이 보내야 할 도면·조건이 무엇인지 확인 부탁드립니다.”';
 if(/인허가|허가|변경신고|변경허가|사용승인|사업계획/i.test(q))return '“현재 변경사항이 기존 승인 범위에 영향을 주는지 확인하려고 합니다. 기존 허가도서 기준으로 어떤 절차부터 검토해야 하는지 봐주실 수 있을까요?”';
 return '“현재 이 업무에서 제가 판단이 안 되는 부분은 ○○입니다. 제가 먼저 확인해야 할 자료와, 다음에 누구와 협의하면 되는지 알려주실 수 있을까요?”';
}

function injectStyle(d){
 if(d.getElementById('pc156Style'))return;
 const s=d.createElement('style');s.id='pc156Style';s.textContent=`
 .pc156-hub{display:none;max-width:900px;margin:0 auto;padding-top:12px}.pc156-hub.show{display:block}.pc156-card{background:#fff;border:1px solid #E5E9F2;border-radius:22px;padding:27px;box-shadow:0 10px 32px rgba(42,58,91,.05)}
 .pc156-kicker{font-size:9px;letter-spacing:.13em;font-weight:950;color:#4C6FFF}.pc156-card h2{margin:7px 0 7px;font-size:25px;letter-spacing:-.7px}.pc156-lead{font-size:12px;color:#77819A;line-height:1.65}.pc156-caps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0 14px}.pc156-cap{border:1px solid #E5E9F2;background:#FAFBFD;border-radius:14px;padding:13px;text-align:left;cursor:pointer}.pc156-cap small{display:block;font-size:8px;font-weight:950;color:#8C96AA;margin-bottom:5px}.pc156-cap b{display:block;font-size:10.5px;line-height:1.45;color:#344057}.pc156-cap span{display:block;margin-top:4px;font-size:9px;color:#8993A7;line-height:1.45}
 .pc156-searchbox{display:grid;grid-template-columns:1fr auto;gap:8px;border:1px solid #DDE3EE;border-radius:15px;padding:7px;background:#fff}.pc156-searchbox input{border:0!important;box-shadow:none!important;padding:8px 10px!important;font-size:12px}.pc156-searchbox button{border:0;border-radius:10px;background:#4C6FFF;color:#fff;padding:0 18px;font-size:10.5px;font-weight:950}.pc156-examples{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.pc156-examples button{border:1px solid #E5E9F2;background:#fff;border-radius:999px;padding:7px 9px;font-size:9.5px;color:#69748B;font-weight:850}
 .pc156-result{margin-top:12px}.pc156-result-card{background:#fff;border:1px solid #E5E9F2;border-radius:19px;padding:18px}.pc156-result-card .label{font-size:8.5px;letter-spacing:.11em;font-weight:950;color:#4C6FFF}.pc156-result-card h3{font-size:16px;margin:6px 0 7px}.pc156-result-card>p{font-size:11px;color:#6F7A91;line-height:1.6}.pc156-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.pc156-cell{background:#FAFBFD;border:1px solid #E8EBF2;border-radius:13px;padding:11px}.pc156-cell small{display:block;font-size:8px;font-weight:950;color:#919BAE;margin-bottom:5px}.pc156-cell p{font-size:9.8px;line-height:1.55;color:#647087;margin:0}.pc156-next{margin-top:10px;border:0;border-radius:11px;background:#EEF2FF;color:#4C6FFF;padding:9px 11px;font-size:9.8px;font-weight:950}
 .pc156-ask-script{margin-top:10px;padding:13px 14px;border:1px solid #DDE5FF;background:#F7F9FF;border-radius:14px}.pc156-ask-script small{display:block;font-size:8px;letter-spacing:.1em;font-weight:950;color:#4C6FFF;margin-bottom:5px}.pc156-ask-script p{margin:0;font-size:10.5px;line-height:1.6;color:#596783}
 @media(max-width:700px){.pc156-card{padding:19px}.pc156-caps{grid-template-columns:1fr}.pc156-searchbox{grid-template-columns:1fr}.pc156-searchbox button{padding:11px}.pc156-grid{grid-template-columns:1fr}}
 `;d.head.appendChild(s);
}

function install(attempt=0){
 const d=frame.contentDocument;if(!d||!d.getElementById('pc150Shell')){if(attempt<25)setTimeout(()=>install(attempt+1),100);return;}
 if(d.getElementById('pc156Hub'))return;
 injectStyle(d);
 const inner=d.querySelector('.pc150-main-inner');if(!inner)return;
 const hub=d.createElement('section');hub.id='pc156Hub';hub.className='pc156-hub';hub.innerHTML=`<div class="pc156-card"><div class="pc156-kicker">SMART SEARCH</div><h2>무엇이 궁금한가요?</h2><p class="pc156-lead">한 검색창에서 상사가 시킨 업무의 의미, 누구에게 어떻게 물어볼지, 모르는 용어까지 찾을 수 있어요.</p><div class="pc156-caps"><button class="pc156-cap" data-kind="task"><small>01 · TODAY'S TASK</small><b>상사가 시킨 일이 뭔지 모르겠어요</b><span>업무 목적 · 먼저 할 일 · 볼 자료</span></button><button class="pc156-cap" data-kind="ask"><small>02 · WHO / HOW</small><b>누구에게, 어떻게 물어봐야 해요?</b><span>문의 대상 · 실제 질문 문장</span></button><button class="pc156-cap" data-kind="term"><small>03 · TERM</small><b>이 용어가 무슨 뜻이에요?</b><span>용어 뜻 · 같이 볼 개념</span></button></div><div class="pc156-searchbox"><input id="pc156Input" placeholder="예: 책임님이 지구단위계획 찾아보래. 뭘 먼저 해야 해?"><button id="pc156Go" type="button">검색 →</button></div><div class="pc156-examples"><button data-q="책임님이 지구단위계획부터 찾아보래. 뭘 먼저 해야 해?">상사가 시킨 일</button><button data-q="보고서 작성 중인데 누구한테 뭐라고 물어봐?">누구에게 물어볼까</button><button data-q="사업계획승인이 뭐야?">용어 뜻</button></div><div id="pc156Result" class="pc156-result"></div></div>`;inner.appendChild(hub);
 const input=hub.querySelector('#pc156Input'),result=hub.querySelector('#pc156Result');
 let forced=null;
 function hideOthers(){
   d.body.classList.remove('pc155-searchmode');
   ['pc150Home','pc150Workspace','pc150LegacyHost','pc155Level'].forEach(id=>{const n=d.getElementById(id);if(n)n.style.display='none';});
 }
 function showHub(){hideOthers();hub.classList.add('show');d.querySelectorAll('[data-pc150-nav]').forEach(b=>b.classList.toggle('active',b.dataset.pc150Nav==='term'));d.defaultView.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>input.focus(),50);}
 function showLegacy(id,q){
   hub.classList.remove('show');const host=d.getElementById('pc150LegacyHost');if(!host)return;host.style.display='block';host.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));d.getElementById(id)?.classList.add('active');
   const title=d.getElementById('pc150LegacyTitle');if(title)title.textContent=id==='term'?'검색 결과 · 용어':id==='ask'?'검색 결과 · 문의 대상':'검색 결과 · 오늘 받은 업무';
   if(id==='term'){const el=d.getElementById('termInput');if(el)el.value=q;d.getElementById('termBtn')?.click();}
   if(id==='ask'){const el=d.getElementById('askInput');if(el)el.value=q;d.getElementById('askBtn')?.click();setTimeout(()=>{const out=d.getElementById('askAnswer');if(out){out.querySelector('.pc156-ask-script')?.remove();const c=d.createElement('div');c.className='pc156-ask-script';c.innerHTML=`<small>이렇게 물어보세요</small><p>${esc(askScript(q))}</p>`;out.appendChild(c);}},50);}
   d.defaultView.scrollTo({top:0,behavior:'smooth'});
 }
 function showTask(q){
   const x=taskData(q);result.innerHTML=`<div class="pc156-result-card"><div class="label">TODAY'S TASK · 업무 해석</div><h3>${esc(x.title)}</h3><p>${esc(x.meaning)}</p><div class="pc156-grid"><div class="pc156-cell"><small>먼저 할 일</small><p>${esc(x.first)}</p></div><div class="pc156-cell"><small>먼저 볼 자료</small><p>${esc(x.where)}</p></div><div class="pc156-cell"><small>막히면 이렇게</small><p>${esc(x.ask)}</p></div></div><button class="pc156-next" type="button" data-ask-next>이 업무, 누구에게 어떻게 물어볼까? →</button></div>`;
   result.querySelector('[data-ask-next]')?.addEventListener('click',()=>showLegacy('ask',q+' 누구에게 어떻게 물어봐야 해?'));
 }
 function run(){
   const q=input.value.trim();if(!q)return;
   const kind=forced||(isAsk(q)?'ask':isTerm(q)?'term':isTask(q)?'task':'term');forced=null;
   if(kind==='ask')showLegacy('ask',q);else if(kind==='task')showTask(q);else showLegacy('term',q);
 }
 hub.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{forced=b.dataset.kind;input.placeholder=b.dataset.kind==='task'?'예: 팀장님이 보고자료 정리하래. 뭘 먼저 해야 하지?':b.dataset.kind==='ask'?'예: 보고서 작성 중인데 누구한테 뭐라고 물어봐?':'예: 사업계획승인이 뭐야?';input.focus();}));
 hub.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.q;run();}));
 hub.querySelector('#pc156Go').addEventListener('click',run);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}});
 d.querySelectorAll('[data-pc150-nav="term"]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showHub();},true));
 d.querySelectorAll('[data-pc150-nav]').forEach(b=>{if(b.dataset.pc150Nav!=='term')b.addEventListener('click',()=>hub.classList.remove('show'),true);});
 const homeInput=d.getElementById('pc150SearchInput'),homeBtn=d.getElementById('pc150SearchBtn');
 if(homeInput)homeInput.placeholder='업무 · 누구에게/어떻게 물어볼지 · 용어를 검색하세요';
 if(homeBtn&&!homeBtn.dataset.pc156){homeBtn.dataset.pc156='1';homeBtn.addEventListener('click',e=>{const q=homeInput?.value.trim();if(!q)return;e.preventDefault();e.stopImmediatePropagation();showHub();input.value=q;run();},true);}
 if(homeInput&&!homeInput.dataset.pc156){homeInput.dataset.pc156='1';homeInput.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const q=homeInput.value.trim();if(!q)return;e.preventDefault();e.stopImmediatePropagation();showHub();input.value=q;run();},true);}
 function pin(){d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>{if(x.textContent!=='v'+VERSION)x.textContent='v'+VERSION;});}
 pin();setInterval(pin,300);
}
frame.addEventListener('load',()=>install());if(frame.contentDocument?.readyState==='complete')install();
})();