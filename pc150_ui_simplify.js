(()=>{
const frame=document.getElementById('app');
if(!frame)return;

const PROJECTS=[
  ['주거·주거유사','detached','단독주택'],
  ['주거·주거유사','multi','공동주택'],
  ['주거·주거유사','dorm','기숙사'],
  ['주거·주거유사','officetel','오피스텔'],
  ['주거·주거유사','gosiwon','다중생활시설(고시원)'],
  ['주거·주거유사','senior','노인복지주택'],
  ['일반건축','neighborhood1','제1종 근린생활시설'],
  ['일반건축','neighborhood2','제2종 근린생활시설'],
  ['일반건축','office','업무시설'],
  ['일반건축','sales','판매시설'],
  ['일반건축','hotel','숙박시설'],
  ['일반건축','education','교육연구시설'],
  ['일반건축','medical','의료시설'],
  ['일반건축','culture','문화 및 집회시설'],
  ['일반건축','sports','운동시설'],
  ['일반건축','religion','종교시설'],
  ['일반건축','transport','운수시설'],
  ['일반건축','elderly','노유자시설'],
  ['산업·특수','fab','공장 / FAB'],
  ['산업·특수','logistics','창고 / 물류센터'],
  ['산업·특수','knowledge','지식산업센터'],
  ['산업·특수','airport','공항시설 / 격납고'],
  ['산업·특수','datacenter','데이터센터'],
  ['산업·특수','hazard','위험물·특수시설'],
  ['복합시설','mixed','복합시설']
];

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function install(attempt=0){
  const d=frame.contentDocument,w=frame.contentWindow;
  if(!d||!w||!d.querySelector('.app')||!d.getElementById('task')){
    if(attempt<12)setTimeout(()=>install(attempt+1),100);
    return;
  }
  if(d.getElementById('pc150Shell'))return;

  const app=d.querySelector('.app');
  d.body.classList.add('pc150');
  d.title='PROJECT CONTEXT — v1.5.0';

  const style=d.createElement('style');
  style.id='pc150Style';
  style.textContent=`
  body.pc150{background:#F6F7FB!important;color:#26324A;min-height:100vh}
  body.pc150>.app{max-width:none!important;margin:0!important;padding:0!important;min-height:100vh}
  body.pc150 .topbar,body.pc150>.app>.tabs,body.pc150 #project>.levels,body.pc150 #project>.hero,body.pc150>.app>.footer{display:none!important}
  body.pc150 #project{display:none!important}
  #pc150Shell{min-height:100vh;display:grid;grid-template-columns:218px minmax(0,1fr);background:#F6F7FB}
  .pc150-side{position:sticky;top:0;height:100vh;background:#fff;border-right:1px solid #E5E9F2;padding:24px 16px 18px;display:flex;flex-direction:column;z-index:30}
  .pc150-brand{display:flex;align-items:center;gap:10px;padding:4px 8px 28px;font-size:15px;font-weight:950;letter-spacing:-.35px;color:#26324A}
  .pc150-logo{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:#EEF2FF;color:#4C6FFF;font-size:16px}
  .pc150-version{display:inline-flex;margin-left:auto;font-size:8.5px;font-weight:950;color:#7C87A0;background:#F6F7FB;border:1px solid #E8EBF2;border-radius:999px;padding:4px 6px}
  .pc150-nav{display:grid;gap:6px}.pc150-nav button{appearance:none;border:0;background:transparent;border-radius:13px;min-height:46px;padding:0 13px;display:flex;align-items:center;gap:11px;text-align:left;font-size:12px;font-weight:900;color:#77819A;cursor:pointer;touch-action:manipulation}
  .pc150-nav button:hover{background:#F7F8FC;color:#4B5873}.pc150-nav button.active{background:#EEF2FF;color:#4C6FFF}.pc150-nav .ico{width:21px;text-align:center;font-size:15px}
  .pc150-level-card{margin-top:auto;border:1px solid #E5E9F2;border-radius:17px;padding:14px;background:#fff;box-shadow:0 8px 25px rgba(42,58,91,.05)}
  .pc150-level-card small{font-size:8.5px;font-weight:950;letter-spacing:.1em;color:#9AA3B5}.pc150-level-card b{display:block;margin:5px 0 10px;font-size:13px}.pc150-level-card button{width:100%;border:0;border-radius:10px;padding:9px;background:#F4F6FF;color:#4C6FFF;font-size:10.5px;font-weight:900}
  .pc150-main{min-width:0;padding:30px 34px 64px}.pc150-main-inner{max-width:1040px;margin:0 auto}
  .pc150-mobile-head{display:none}
  .pc150-hero{position:relative;overflow:hidden;background:#fff;border:1px solid #E5E9F2;border-radius:24px;padding:36px;box-shadow:0 14px 42px rgba(42,58,91,.065)}
  .pc150-hero:after{content:'';position:absolute;right:-30px;top:-48px;width:300px;height:260px;border-radius:44% 56% 62% 38%;background:radial-gradient(circle at 35% 35%,rgba(76,111,255,.16),rgba(76,111,255,.045) 55%,transparent 70%);pointer-events:none}
  .pc150-kicker{font-size:9.5px;font-weight:950;letter-spacing:.14em;color:#4C6FFF;margin-bottom:10px}.pc150-title{position:relative;z-index:1;margin:0;font-size:34px;line-height:1.18;letter-spacing:-1.25px;color:#202B42}.pc150-sub{position:relative;z-index:1;margin-top:10px;max-width:560px;font-size:12.5px;line-height:1.65;color:#7A849B}
  .pc150-form{position:relative;z-index:2;margin-top:28px;display:grid;gap:10px}.pc150-field{border:1px solid #E1E5EE;background:#fff;border-radius:15px;min-height:56px;display:grid;grid-template-columns:28px 170px 1fr 20px;align-items:center;padding:0 15px;gap:8px;transition:.16s ease}.pc150-field:focus-within{border-color:#B8C6FF;box-shadow:0 0 0 4px rgba(76,111,255,.06)}
  .pc150-field .num{width:24px;height:24px;border-radius:8px;background:#EEF2FF;color:#4C6FFF;display:grid;place-items:center;font-size:10px;font-weight:950}.pc150-field label{margin:0!important;font-size:11.5px!important;color:#3D485F!important}.pc150-field select{border:0!important;box-shadow:none!important;padding:0!important;background:#fff!important;text-align:right;font-size:12px;font-weight:900;color:#4D5870;min-width:0}.pc150-field .chev{font-size:12px;color:#9BA4B6;text-align:right}
  .pc150-primary{margin-top:2px;width:100%;border:0;border-radius:14px;padding:15px 18px;background:linear-gradient(90deg,#4C6FFF,#5362E5);color:#fff;font-size:13px;font-weight:950;box-shadow:0 10px 22px rgba(76,111,255,.2);touch-action:manipulation}
  .pc150-details-toggle{justify-self:start;border:0;background:transparent;color:#77819A;font-size:10.5px;font-weight:900;padding:5px 2px;cursor:pointer}.pc150-details{display:none;grid-template-columns:1fr 1fr;gap:9px;padding:11px 0 0}.pc150-details.show{display:grid}.pc150-mini-field{border:1px solid #E5E9F2;border-radius:13px;padding:10px 12px;background:#FAFBFD}.pc150-mini-field label{margin:0 0 5px!important;font-size:9.5px!important;color:#7E889E!important}.pc150-mini-field select,.pc150-mini-field input{border:0!important;padding:0!important;background:transparent!important;box-shadow:none!important;font-size:11px}
  .pc150-search{margin-top:14px;border:1px solid #E5E9F2;background:#FAFBFD;border-radius:14px;display:grid;grid-template-columns:25px 1fr auto;align-items:center;padding:0 13px;min-height:48px}.pc150-search span{color:#919AAD}.pc150-search input{border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important;font-size:11.5px}.pc150-search button{border:0;background:#EEF2FF;color:#4C6FFF;border-radius:9px;padding:7px 10px;font-size:9.5px;font-weight:950}
  .pc150-quick{margin-top:26px}.pc150-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.pc150-section-head b{font-size:13px}.pc150-section-head span{font-size:9.5px;color:#9AA3B4}.pc150-quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.pc150-quick button{border:1px solid #E5E9F2;background:#fff;border-radius:16px;padding:15px;text-align:left;min-height:82px;color:#26324A;box-shadow:0 7px 24px rgba(42,58,91,.04);touch-action:manipulation}.pc150-quick button small{display:block;font-size:8.5px;color:#9AA3B5;margin-bottom:7px}.pc150-quick button b{font-size:11.5px;line-height:1.4}.pc150-quick button em{display:block;margin-top:5px;font-size:9px;font-style:normal;color:#7E88A0}
  #pc150Workspace{display:none}.pc150-work-head{display:flex;align-items:center;gap:10px;margin-bottom:13px}.pc150-back{border:1px solid #E2E6EF;background:#fff;border-radius:11px;padding:9px 11px;font-size:10.5px;font-weight:900;color:#667188}.pc150-work-head b{font-size:14px}.pc150-work-head span{font-size:10px;color:#9AA3B5}
  body.pc150 #projectResult{margin:0!important}.pc150 #projectResult .result-head{display:none!important}.pc150 #projectResult>.soft-note{display:none!important}.pc150 #projectResult .stage-banner{margin-top:0!important;border-radius:18px!important;padding:16px!important}.pc150 #projectResult .lv1-map{margin-top:10px!important;border-radius:20px!important;padding:18px!important;box-shadow:0 10px 30px rgba(42,58,91,.045)}.pc150 #projectResult .keyword-wrap{display:none!important}.pc150 #projectResult .lv1-map-head{margin-bottom:14px}.pc150 #projectResult .lv1-actions{grid-template-columns:repeat(4,1fr)!important}.pc150 #projectResult .lv1-action{min-height:74px!important}.pc150 #projectResult .detail-drawer,.pc150 #projectResult .caution-pop{border-radius:15px!important}
  #pc150LegacyHost{display:none;max-width:960px;margin:0 auto}.pc150-legacy-back{display:flex;align-items:center;gap:10px;margin-bottom:12px}.pc150-legacy-back button{border:1px solid #E2E6EF;background:#fff;border-radius:11px;padding:9px 11px;font-size:10.5px;font-weight:900;color:#667188}.pc150-legacy-title{font-size:13px;font-weight:950}
  #pc150LegacyHost .panel{display:none!important;padding:0!important}#pc150LegacyHost .panel.active{display:block!important}#pc150LegacyHost .card{box-shadow:0 10px 32px rgba(42,58,91,.05)!important}#pc150LegacyHost .eyebrow{font-size:9px!important}#pc150LegacyHost h2{font-size:20px!important}
  .pc150-bottom{display:none}
  @media(max-width:900px){#pc150Shell{grid-template-columns:184px minmax(0,1fr)}.pc150-main{padding:24px 22px 60px}.pc150-field{grid-template-columns:26px 145px 1fr 18px}.pc150-title{font-size:30px}.pc150 #projectResult .lv1-actions{grid-template-columns:1fr 1fr!important}}
  @media(max-width:700px){body.pc150{padding-bottom:66px}#pc150Shell{display:block}.pc150-side{display:none}.pc150-main{padding:0 13px 20px}.pc150-main-inner{max-width:none}.pc150-mobile-head{display:flex;height:58px;align-items:center;justify-content:space-between;padding:0 3px}.pc150-mobile-brand{font-size:12.5px;font-weight:950;display:flex;align-items:center;gap:7px}.pc150-mobile-brand span{width:24px;height:24px;border-radius:8px;background:#EEF2FF;color:#4C6FFF;display:grid;place-items:center}.pc150-mobile-version{font-size:8.5px;color:#8B94A7;border:1px solid #E5E9F2;background:#fff;border-radius:999px;padding:5px 8px;font-weight:900}.pc150-hero{padding:25px 18px 20px;border-radius:20px}.pc150-title{font-size:27px;line-height:1.2}.pc150-sub{font-size:11.5px;margin-top:8px}.pc150-form{margin-top:21px}.pc150-field{grid-template-columns:26px 1fr 18px;grid-template-areas:'num label chev' 'num select chev';min-height:65px;padding:10px 12px;gap:2px 8px}.pc150-field .num{grid-area:num}.pc150-field label{grid-area:label;font-size:10px!important}.pc150-field select{grid-area:select;text-align:left;font-size:11.5px}.pc150-field .chev{grid-area:chev}.pc150-details{grid-template-columns:1fr}.pc150-search{margin-top:12px}.pc150-quick{margin-top:18px}.pc150-quick-grid{grid-template-columns:1fr 1fr}.pc150-quick button{min-height:74px;padding:13px}.pc150-quick button:nth-child(3){display:none}.pc150-bottom{position:fixed;display:grid;grid-template-columns:repeat(4,1fr);left:0;right:0;bottom:0;height:62px;background:rgba(255,255,255,.97);border-top:1px solid #E5E9F2;z-index:80;padding-bottom:env(safe-area-inset-bottom)}.pc150-bottom button{border:0;background:transparent;color:#8A94A8;font-size:8.5px;font-weight:900;display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;touch-action:manipulation}.pc150-bottom button span{font-size:16px}.pc150-bottom button.active{color:#4C6FFF}.pc150-work-head{padding-top:12px}.pc150 #projectResult .stage-banner{grid-template-columns:auto 1fr!important}.pc150 #projectResult .stage-task{grid-column:1/-1}.pc150 #projectResult .lv1-flow{gap:5px}.pc150 #projectResult .lv1-flow .node{font-size:9.7px;padding:7px 8px}.pc150 #projectResult .lv1-actions{grid-template-columns:1fr 1fr!important}.pc150 #projectResult .lv1-action{min-height:66px!important;padding:10px!important}.pc150-main #pc150LegacyHost{padding-top:12px}.pc150-main #pc150LegacyHost .card{padding:18px!important}.pc150-main #pc150LegacyHost .quiz-overview{grid-template-columns:1fr!important}}
  @media(max-width:390px){.pc150-title{font-size:24px}.pc150-quick-grid{grid-template-columns:1fr}.pc150-quick button:nth-child(2){display:none}.pc150 #projectResult .lv1-actions{grid-template-columns:1fr!important}}
  `;
  d.head.appendChild(style);

  const taskOptions=[...d.getElementById('task').options].map(o=>`<option value="${esc(o.value)}">${esc(o.textContent)}</option>`).join('');
  const projectGroups=[...new Set(PROJECTS.map(x=>x[0]))].map(group=>`<optgroup label="${esc(group)}">${PROJECTS.filter(x=>x[0]===group).map(x=>`<option value="${esc(x[1])}">${esc(x[2])}</option>`).join('')}</optgroup>`).join('');
  const phaseOptions=[...d.getElementById('phase').options].map(o=>`<option value="${esc(o.value)}">${esc(o.textContent)}</option>`).join('');

  const shell=d.createElement('div');
  shell.id='pc150Shell';
  shell.innerHTML=`
    <aside class="pc150-side">
      <div class="pc150-brand"><span class="pc150-logo">◇</span><span>프로젝트 맥락</span><span class="pc150-version">v1.5.0</span></div>
      <nav class="pc150-nav">
        <button class="active" data-pc150-nav="home"><span class="ico">⌂</span>홈</button>
        <button data-pc150-nav="term"><span class="ico">⌕</span>검색</button>
        <button data-pc150-nav="quiz"><span class="ico">▤</span>퀴즈</button>
        <button data-pc150-nav="level"><span class="ico">⬡</span>내 레벨</button>
      </nav>
      <div class="pc150-level-card"><small>CURRENT LEVEL</small><b id="pc150LevelText">${esc(d.getElementById('rankChip')?.textContent||'LV.1 · 신입사원')}</b><button type="button" data-pc150-go-quiz>승급 퀴즈 보기 →</button></div>
    </aside>
    <main class="pc150-main">
      <div class="pc150-main-inner">
        <div class="pc150-mobile-head"><div class="pc150-mobile-brand"><span>◇</span>프로젝트 맥락</div><div class="pc150-mobile-version">v1.5.0</div></div>
        <section id="pc150Home">
          <div class="pc150-hero">
            <div class="pc150-kicker">PROJECT CONTEXT</div>
            <h1 class="pc150-title">오늘은 어떤 업무를<br>도와드릴까요?</h1>
            <p class="pc150-sub">지금 하는 일과 프로젝트만 고르면, 필요한 맥락부터 보여드려요. 자세한 정보는 필요할 때 하나씩 열어보면 됩니다.</p>
            <div class="pc150-form">
              <div class="pc150-field"><span class="num">1</span><label for="pc150Task">지금 하는 업무</label><select id="pc150Task">${taskOptions}</select><span class="chev">⌄</span></div>
              <div class="pc150-field"><span class="num">2</span><label for="pc150Project">어떤 프로젝트인가요?</label><select id="pc150Project">${projectGroups}</select><span class="chev">⌄</span></div>
              <button class="pc150-details-toggle" id="pc150DetailsToggle" type="button">+ 단계·규모도 입력할래요</button>
              <div class="pc150-details" id="pc150Details"><div class="pc150-mini-field"><label for="pc150Phase">현재 설계 단계</label><select id="pc150Phase">${phaseOptions}</select></div><div class="pc150-mini-field"><label for="pc150Meta">규모·메모 (선택)</label><input id="pc150Meta" placeholder="예: 800세대 / 연면적 3만㎡"></div></div>
              <button class="pc150-primary" id="pc150Analyze" type="button">내 업무 맥락 보기 →</button>
            </div>
            <div class="pc150-search"><span>⌕</span><input id="pc150SearchInput" placeholder="모르는 용어나 업무를 검색해보세요"><button id="pc150SearchBtn" type="button">검색</button></div>
          </div>
          <div class="pc150-quick">
            <div class="pc150-section-head"><b>빠른 시작</b><span>자주 쓰는 업무부터</span></div>
            <div class="pc150-quick-grid">
              <button type="button" data-pc150-task="발주처 협의자료 작성"><small>CLIENT</small><b>발주처 협의자료 작성</b><em>요구사항·의사결정 정리</em></button>
              <button type="button" data-pc150-task="보고서 작성"><small>REPORT</small><b>보고서 작성</b><em>설계 근거와 변경사항 정리</em></button>
              <button type="button" data-pc150-task="인허가 자료 작성"><small>PERMIT</small><b>인허가 자료 작성</b><em>현재 절차와 다음 단계 확인</em></button>
            </div>
          </div>
        </section>
        <section id="pc150Workspace">
          <div class="pc150-work-head"><button class="pc150-back" type="button" id="pc150Back">← 처음으로</button><div><b>내 업무 맥락</b><br><span>한 번에 필요한 것만 보여줍니다.</span></div></div>
        </section>
        <section id="pc150LegacyHost">
          <div class="pc150-legacy-back"><button type="button" data-pc150-home>← 홈</button><span class="pc150-legacy-title" id="pc150LegacyTitle"></span></div>
        </section>
      </div>
    </main>
    <nav class="pc150-bottom">
      <button class="active" data-pc150-nav="home"><span>⌂</span>홈</button>
      <button data-pc150-nav="term"><span>⌕</span>검색</button>
      <button data-pc150-nav="quiz"><span>▤</span>퀴즈</button>
      <button data-pc150-nav="level"><span>⬡</span>내 레벨</button>
    </nav>`;
  app.prepend(shell);

  const projectResult=d.getElementById('projectResult');
  const workspace=d.getElementById('pc150Workspace');
  workspace.appendChild(projectResult);
  const legacyHost=d.getElementById('pc150LegacyHost');
  ['today','ask','term','quiz'].forEach(id=>{const p=d.getElementById(id);if(p)legacyHost.appendChild(p);});

  const oldSwitch=typeof w.switchTab==='function'?w.switchTab.bind(w):null;
  const titles={today:'오늘 받은 업무',ask:'누구에게 물어볼까?',term:'검색',quiz:'승급 퀴즈'};
  function updateNav(id){d.querySelectorAll('[data-pc150-nav]').forEach(b=>b.classList.toggle('active',b.dataset.pc150Nav===id||(id==='level'&&b.dataset.pc150Nav==='level')));}
  function showHome(){
    d.getElementById('pc150Home').style.display='';workspace.style.display='none';legacyHost.style.display='none';
    if(oldSwitch)oldSwitch('project');
    updateNav('home');
    d.defaultView.scrollTo({top:0,behavior:'smooth'});
  }
  function showWorkspace(){
    d.getElementById('pc150Home').style.display='none';workspace.style.display='block';legacyHost.style.display='none';updateNav('home');d.defaultView.scrollTo({top:0,behavior:'smooth'});
  }
  function showLegacy(id){
    if(!['today','ask','term','quiz'].includes(id))return showHome();
    d.getElementById('pc150Home').style.display='none';workspace.style.display='none';legacyHost.style.display='block';
    d.getElementById('pc150LegacyTitle').textContent=titles[id]||'';
    if(oldSwitch)oldSwitch(id); else d.querySelectorAll('#pc150LegacyHost .panel').forEach(p=>p.classList.toggle('active',p.id===id));
    updateNav(id==='quiz'?'quiz':id==='term'?'term':'home');
    d.defaultView.scrollTo({top:0,behavior:'smooth'});
  }
  if(oldSwitch){w.switchTab=function(id){if(id==='project')showHome();else showLegacy(id);};}

  function syncProject(id){
    const row=PROJECTS.find(x=>x[1]===id)||PROJECTS[1];
    const cat=[...d.querySelectorAll('#categoryButtons [data-cat]')].find(b=>b.dataset.cat===row[0]);
    if(cat)cat.click();
    const sub=[...d.querySelectorAll('#subtypeButtons [data-sub]')].find(b=>b.dataset.sub===row[1]);
    if(sub)sub.click();
  }
  function analyze(){
    const task=d.getElementById('pc150Task').value,project=d.getElementById('pc150Project').value,phase=d.getElementById('pc150Phase').value,meta=d.getElementById('pc150Meta').value;
    syncProject(project);
    d.getElementById('task').value=task;
    d.getElementById('phase').value=phase;
    d.getElementById('projectMeta').value=meta;
    d.getElementById('analyzeProjectBtn').click();
    setTimeout(()=>{
      const current=d.querySelector('#projectResult .stage-copy b')?.textContent||'';
      if(current) d.getElementById('pc150LegacyTitle').textContent=current;
      showWorkspace();
    },80);
  }

  d.getElementById('pc150Analyze').addEventListener('click',analyze);
  d.getElementById('pc150Back').addEventListener('click',showHome);
  d.getElementById('pc150DetailsToggle').addEventListener('click',()=>{
    const box=d.getElementById('pc150Details'),on=box.classList.toggle('show');
    d.getElementById('pc150DetailsToggle').textContent=on?'− 단계·규모 접기':'+ 단계·규모도 입력할래요';
  });
  d.querySelectorAll('[data-pc150-task]').forEach(b=>b.addEventListener('click',()=>{
    const sel=d.getElementById('pc150Task');
    if([...sel.options].some(o=>o.value===b.dataset.pc150Task))sel.value=b.dataset.pc150Task;
    sel.focus();
  }));
  function runSearch(){
    const q=d.getElementById('pc150SearchInput').value.trim();if(!q)return;
    const taskish=/(보고서|협의자료|도면|변경|심의|지구단위|업무)/.test(q);
    if(taskish){showLegacy('today');const inp=d.getElementById('todayInput');if(inp)inp.value=q;d.getElementById('todayBtn')?.click();}
    else{showLegacy('term');const inp=d.getElementById('termInput');if(inp)inp.value=q;d.getElementById('termBtn')?.click();}
  }
  d.getElementById('pc150SearchBtn').addEventListener('click',runSearch);
  d.getElementById('pc150SearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();runSearch();}});
  d.querySelectorAll('[data-pc150-nav]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.pc150Nav;
    if(id==='home')showHome(); else if(id==='term')showLegacy('term'); else showLegacy('quiz');
  }));
  d.querySelectorAll('[data-pc150-go-quiz]').forEach(b=>b.addEventListener('click',()=>showLegacy('quiz')));
  d.querySelectorAll('[data-pc150-home]').forEach(b=>b.addEventListener('click',showHome));

  const initialProject='multi';
  d.getElementById('pc150Project').value=initialProject;
  syncProject(initialProject);
  d.getElementById('pc150Phase').value='잘 모르겠습니다';
  showHome();
}

frame.addEventListener('load',()=>setTimeout(()=>install(0),180));
if(frame.contentDocument?.readyState==='complete')setTimeout(()=>install(0),180);
})();