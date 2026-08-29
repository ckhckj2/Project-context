(()=>{
const frame=document.getElementById('app');
if(!frame)return;
const VERSION='1.6.0';

const WHY_RULES=[
  {re:/발주처|협의자료/i,data:{title:'발주처가 판단하고 결정할 수 있게 만드는 업무예요',why:'요구사항과 선택지를 한 화면에서 이해하게 만들고, 설계팀과 발주처가 같은 결론을 보고 움직이게 하기 위해 합니다.',risk:'핵심 쟁점이 흐리면 “자료는 봤는데 무엇을 결정했는지”가 남지 않아 같은 협의를 반복하게 됩니다.',done:'이번 협의에서 결정할 항목, 선택 근거, 다음 액션이 서로 같은 문장으로 정리되면 잘 끝난 상태입니다.'}},
  {re:/보고서|보고자료|발표자료/i,data:{title:'판단의 근거와 결정사항을 남기는 업무예요',why:'프로젝트가 길어져도 누가 무엇을 왜 결정했는지 추적할 수 있게 하고, 다음 보고와 설계 변경의 기준을 만들기 위해 합니다.',risk:'최신안·이전 결정·변경 이유가 섞이면 나중에 어느 정보가 기준인지 다시 확인하는 시간이 커집니다.',done:'결론이 먼저 보이고, 그 결론을 뒷받침하는 도면·수치·변경 이유가 같은 기준일로 맞춰져 있으면 좋습니다.'}},
  {re:/사례|레퍼런스|precedent|reference/i,data:{title:'사진을 모으는 게 아니라 선택 기준을 만드는 업무예요',why:'비슷한 프로젝트가 어떤 문제를 어떻게 풀었는지 비교해 우리 프로젝트의 방향을 설명할 근거를 만들기 위해 합니다.',risk:'예쁜 이미지 위주로 모으면 왜 참고해야 하는지 설명할 수 없고 실제 설계 결정으로 연결되지 않습니다.',done:'사례마다 “무엇을 참고할지 / 우리 조건과 무엇이 다른지”가 한 줄로 비교되면 실무에 쓸 수 있습니다.'}},
  {re:/입면|파사드|디자인/i,data:{title:'프로젝트의 조건을 하나의 설계 방향으로 묶는 업무예요',why:'발주처 요구, 주변 맥락, 기능, 구조·설비 조건처럼 서로 다른 요구를 실제 형태와 재료의 선택으로 정리하기 위해 합니다.',risk:'형태만 먼저 정하면 뒤에서 구조·설비·원가·발주처 요구와 충돌해 다시 설계할 가능성이 커집니다.',done:'왜 이 안인지 설명할 수 있고, 주요 제약조건을 반영한 상태에서 다음 검토자가 선택할 수 있으면 됩니다.'}},
  {re:/모델링|3d|bim/i,data:{title:'공간과 형상을 동시에 검증하고 공유하는 업무예요',why:'평면만으로 놓치기 쉬운 높이, 간섭, 공간감, 형태 관계를 확인하고 여러 사람이 같은 설계 상태를 보게 하기 위해 합니다.',risk:'모델과 도면의 기준이 다르면 CG·보고·협력업체 검토가 서로 다른 안을 기준으로 진행될 수 있습니다.',done:'현재 결정된 설계가 모델에 일관되게 반영되고, 도면·CG·협의의 공통 기준으로 쓸 수 있으면 좋습니다.'}},
  {re:/cg|렌더|투시도|이미지/i,data:{title:'설계안을 빠르게 이해시키고 결정받기 위한 표현 업무예요',why:'도면만으로 공간을 읽기 어려운 사람에게 설계 의도와 차이를 보여주고, 발주처나 내부 의사결정을 돕기 위해 합니다.',risk:'현재 설계와 다른 이미지를 만들면 예쁜 결과물보다 잘못된 기대와 재협의가 더 크게 남습니다.',done:'최신 설계와 맞고, 이번 검토에서 봐야 할 차이나 의도가 시각적으로 바로 읽히면 됩니다.'}},
  {re:/지구단위|법규|법령|규모검토|토지이음/i,data:{title:'디자인을 시작하기 전에 설계 가능한 범위를 정하는 업무예요',why:'대지와 사업에 적용되는 조건을 먼저 확인해 나중에 되돌릴 수 없는 규모·배치·용도 판단을 초기에 거르기 위해 합니다.',risk:'전제조건을 늦게 발견하면 이미 만든 배치나 면적계획을 크게 다시 해야 할 수 있습니다.',done:'적용 조건, 아직 확인이 필요한 조건, 그 조건이 설계에 미치는 영향이 구분되어 있으면 다음 설계 판단에 쓸 수 있습니다.'}},
  {re:/심의/i,data:{title:'설계안의 주요 쟁점을 공식 검토받고 다음 단계로 가기 위한 업무예요',why:'프로젝트에 따라 요구되는 계획적·기술적 쟁점을 설명하고, 보완해야 할 사항을 설계에 반영하기 위해 합니다.',risk:'자료가 설계 설명에만 치우치면 검토자가 실제로 판단해야 할 쟁점과 대응 근거가 보이지 않을 수 있습니다.',done:'검토 쟁점별로 현재안, 근거, 대응 방향이 연결되고 이후 반영할 사항이 명확하면 좋습니다.'}},
  {re:/인허가|건축허가|허가자료|착공|사용승인|사용검사/i,data:{title:'설계안을 행정 절차에서 검토 가능한 형태로 정리하는 업무예요',why:'현재 계획이 어떤 절차를 거치고 있는지 명확히 하고, 필요한 도서와 확인사항을 같은 기준으로 제출하기 위해 합니다.',risk:'절차와 기준일이 불분명하면 최신 도서 누락이나 서로 다른 버전 제출 같은 실수가 생기기 쉽습니다.',done:'현재 절차, 제출 기준, 최신 도서, 미확인 쟁점이 분리되어 다음 확인자가 바로 검토할 수 있으면 좋습니다.'}},
  {re:/변경허가|변경신고|경미한 변경|변경업무/i,data:{title:'변경이 기존 결정과 인허가에 어디까지 영향을 주는지 확인하는 업무예요',why:'작은 수정처럼 보여도 승인된 내용, 다른 도면, 협력업체 설계에 연쇄 영향을 줄 수 있어 변경 범위를 먼저 잡기 위해 합니다.',risk:'변경된 한 장만 고치면 다른 도면·분야·행정절차와 불일치가 남을 수 있습니다.',done:'변경 전후, 영향받는 도면·분야, 추가 확인할 절차가 한 번에 보이면 다음 조정이 쉬워집니다.'}},
  {re:/도면|평면|단면|입면 수정|cad|캐드/i,data:{title:'결정된 내용을 모든 설계 정보에 일관되게 반영하는 업무예요',why:'도면은 다른 사람과 분야가 실제로 작업하는 기준이기 때문에, 변경사항을 정확하게 전달하고 충돌을 줄이기 위해 수정합니다.',risk:'한 도면만 바뀌고 연관 도면이 남으면 협력업체·보고자료·모델이 서로 다른 설계를 기준으로 움직입니다.',done:'변경 이유와 영향 범위를 확인한 뒤 관련 평면·단면·입면·모델이 같은 상태로 맞으면 좋습니다.'}},
  {re:/협력업체|구조|기계|전기|소방|설비/i,data:{title:'전문분야 조건을 건축 계획 안에 실제로 들어오게 만드는 업무예요',why:'건축이 혼자 결정할 수 없는 구조·설비·소방 조건을 조기에 맞춰 공간과 도면의 충돌을 줄이기 위해 합니다.',risk:'각 분야가 따로 최적화되면 천장고, 코어, 샤프트, 구조체, 피난 같은 지점에서 뒤늦게 충돌합니다.',done:'질문과 결정사항의 담당자가 명확하고, 합의된 조건이 최신 건축도면에 반영되면 조정이 된 상태입니다.'}}
];

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function currentLevel(d){return Number(d.defaultView.localStorage.getItem('pc_level')||1);}
function whyData(task){
  const found=WHY_RULES.find(x=>x.re.test(String(task||'')));
  return found?found.data:{
    title:'이 업무의 목적은 “다음 사람이 판단할 수 있는 상태”를 만드는 거예요',
    why:'결과물 자체보다 프로젝트의 다음 결정·협의·도면 작업이 멈추지 않도록 필요한 정보를 정리하는 데 목적이 있습니다.',
    risk:'업무 목적을 모르고 형식만 맞추면 자료를 만든 뒤에도 다시 “그래서 뭘 결정해야 하지?”가 남을 수 있습니다.',
    done:'누가 이 결과물을 보고 무엇을 판단하는지, 다음 행동이 무엇인지 설명할 수 있으면 업무 맥락을 잡은 상태입니다.'
  };
}
function projectContext(project){
  const p=String(project||'');
  if(/공장|FAB/i.test(p))return '공정·유틸리티 조건이 건축 판단에 일찍 영향을 주는 프로젝트라, 업무 목적과 기준을 먼저 맞추는 게 특히 중요합니다.';
  if(/데이터센터/i.test(p))return '전력·냉각 같은 운영 인프라가 건축계획과 강하게 연결되므로, 결과물이 어떤 결정을 위한 것인지 먼저 확인하는 게 좋습니다.';
  if(/공항|격납고|운수시설/i.test(p))return '운영조건과 여러 주체의 협의가 건축설계와 함께 움직일 수 있어, 자료가 어떤 판단을 위한 것인지 명확히 하는 게 중요합니다.';
  if(/창고|물류/i.test(p))return '차량·물류 운영과 건축계획이 함께 움직이기 때문에 단순 도면 작업보다 업무가 연결되는 운영 판단을 같이 보는 게 좋습니다.';
  if(/공동주택|기숙사|오피스텔/i.test(p))return '세대·공용부·사업조건처럼 반복되는 기준이 많아, 현재 업무가 어떤 결정과 다음 단계에 연결되는지 놓치지 않는 게 중요합니다.';
  if(/복합/i.test(p))return '여러 용도와 요구가 섞이므로 한 업무가 어느 용도·의사결정에 영향을 주는지 구분해서 보는 게 중요합니다.';
  return '프로젝트 종류와 상관없이, 같은 업무도 “누가 무엇을 결정하려고 보는지”에 따라 필요한 내용과 깊이가 달라집니다.';
}

function injectStyle(d){
  if(d.getElementById('pc160Style'))return;
  const st=d.createElement('style');st.id='pc160Style';st.textContent=`
    .pc150-version,.pc150-mobile-version{font-size:0!important}.pc150-version:after,.pc150-mobile-version:after{content:'v1.6.0';font-size:8.5px!important}
    .pc160-why{display:none;margin-top:10px;border:1px solid #DDE5FF;background:linear-gradient(145deg,#FBFCFF,#F6F8FF);border-radius:16px;padding:16px}.pc160-why.show{display:block}
    .pc160-why-kicker{font-size:8.5px;letter-spacing:.12em;font-weight:950;color:#4C6FFF;margin-bottom:6px}.pc160-why h3{font-size:15px;margin:0 0 7px;color:#26324A;letter-spacing:-.25px}.pc160-why>p{font-size:11.2px;line-height:1.65;color:#657188;margin:0}
    .pc160-why-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.pc160-why-cell{border:1px solid #E6EAF3;background:rgba(255,255,255,.82);border-radius:13px;padding:11px}.pc160-why-cell small{display:block;font-size:8px;letter-spacing:.09em;font-weight:950;color:#929CAF;margin-bottom:5px}.pc160-why-cell p{font-size:10px;line-height:1.55;color:#657188;margin:0}.pc160-project-note{margin-top:8px;border-left:3px solid #DCE5FF;padding:7px 9px;font-size:9.8px;line-height:1.55;color:#788399}
    .pc160-coming{display:inline-flex;margin-top:10px;padding:6px 8px;border-radius:999px;background:#fff;border:1px solid #E5E9F2;color:#8D96A8;font-size:8.5px;font-weight:900}
    #deep134.pc160-open{background:#EEF2FF!important;border-color:#DCE5FF!important;color:#3F5FCB!important}
    @media(max-width:700px){.pc160-why-grid{grid-template-columns:1fr}.pc160-why{padding:14px}}
  `;d.head.appendChild(st);
}

function enhanceResult(d){
  const result=d.getElementById('projectResult');
  const deep=d.getElementById('deep134');
  const ux=d.getElementById('ux134');
  if(!result||!deep||!ux||!result.classList.contains('show'))return;
  ux.querySelector('.pc160-why')?.remove();
  const lv=currentLevel(d),master=lv===5||d.defaultView.localStorage.getItem('pc_master_unlocked')==='1';
  if(lv<2&&!master){return;}

  const task=d.getElementById('pc150Task')?.value||d.getElementById('task')?.value||'현재 업무';
  const project=d.getElementById('pc150Project')?.selectedOptions?.[0]?.textContent||[...result.querySelectorAll('.result-head b')][0]?.textContent||'현재 프로젝트';
  const data=whyData(task);

  deep.classList.remove('locked');deep.classList.add('pc160-open');
  deep.innerHTML='<small>04 · LV.2 WHY</small>왜 이 업무를 해요?';
  const old=d.getElementById('deepDrawer134');if(old)old.style.display='none';

  const box=d.createElement('div');box.className='pc160-why';
  box.innerHTML=`<div class="pc160-why-kicker">LV.2 · WHY</div><h3>${esc(data.title)}</h3><p>${esc(data.why)}</p><div class="pc160-why-grid"><div class="pc160-why-cell"><small>이 목적을 놓치면</small><p>${esc(data.risk)}</p></div><div class="pc160-why-cell"><small>잘 끝났다는 신호</small><p>${esc(data.done)}</p></div></div><div class="pc160-project-note"><b>${esc(project)}</b> · ${esc(projectContext(project))}</div><span class="pc160-coming">WHERE · 어디서 확인하는지는 6B에서 이어집니다</span>`;
  ux.appendChild(box);
  deep.onclick=()=>box.classList.toggle('show');
}

function install(attempt=0){
  const d=frame.contentDocument;
  if(!d||!d.body||!d.getElementById('pc150Shell')){if(attempt<30)setTimeout(()=>install(attempt+1),100);return;}
  if(d.body.dataset.pc160)return;d.body.dataset.pc160='1';
  injectStyle(d);
  const analyze=d.getElementById('pc150Analyze');
  analyze?.addEventListener('click',()=>setTimeout(()=>enhanceResult(d),120));
  d.querySelectorAll('[data-pc150-nav="home"]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>enhanceResult(d),80)));
  setTimeout(()=>enhanceResult(d),300);
}
frame.addEventListener('load',()=>install());
if(frame.contentDocument?.readyState==='complete')install();
})();