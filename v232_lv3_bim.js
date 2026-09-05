(()=>{
'use strict';
const VERSION='2.1.32';
const PROJECT_STORAGE='cc_projects_v1';
const ACTIVE_STORAGE='cc_active_project_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const MOBILE=()=>window.matchMedia('(max-width:700px)').matches;
const prevRunSearch=window.runSearch;

function level(){try{return typeof viewLevel==='function'?viewLevel():Number(localStorage.getItem('pc_level')||1)}catch(e){return 1}}
function readProjects(){try{const v=JSON.parse(localStorage.getItem(PROJECT_STORAGE)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
function writeProjects(v){try{localStorage.setItem(PROJECT_STORAGE,JSON.stringify(v));return true}catch(e){return false}}
function activeId(){try{return localStorage.getItem(ACTIVE_STORAGE)||''}catch(e){return ''}}
function activeProject(){const id=activeId();return readProjects().find(p=>p.id===id)||null}
function bimLabel(v){return ({none:'BIM 미사용/미정',revit:'Revit 협업',delivery:'BIM 납품 프로젝트',coordination:'BIM 코디네이션',other:'기타 BIM'})[v]||'BIM 미사용/미정'}

const HOW_RULES=[
  [/법규|법령|규모검토/,{title:'법규검토를 실행 가능한 체크리스트로 만드는 순서',steps:['대지·용도·규모·사업방식을 한 장에 고정','적용 가능 법·조례·지구단위 기준을 출처별로 수집','설계에 영향 있는 항목만 체크리스트화','애매한 항목은 근거와 질문을 함께 정리','검토일·근거 링크·담당 확인 여부를 남김'],check:'근거 조문/고시 · 적용조건 · 현재안 적합 여부 · 추가확인 필요 여부',collab:'사내 인허가/책임 → 필요한 쟁점만 관할기관',done:'누가 다시 봐도 “무슨 기준을 왜 적용했고 무엇이 미확정인지” 추적되면 완료'}],
  [/보고서|보고자료|발표자료|협의자료/,{title:'보고자료는 페이지를 만들기 전에 결정할 내용을 먼저 고정해요',steps:['이번 보고에서 결정받을 질문 1~3개 작성','최신 도면·수치·회의록 기준일 통일','결론이 먼저 보이게 페이지 구조 작성','이전안과 변경 이유를 근거와 연결','PM/책임 검토 후 배포본을 별도 저장'],check:'결론 · 근거 · 최신 수치 · 변경 이유 · 다음 결정사항',collab:'업무 요청자/PM → 필요한 기술근거만 협력업체',done:'자료를 본 사람이 추가 설명 없이 “무엇을 결정해야 하는지” 알면 완료'}],
  [/도면|평면|단면|입면|cad|캐드|레드라인/,{title:'도면 수정은 한 장만 고치지 말고 영향 범위를 먼저 잡아요',steps:['기준 도면 버전과 수정 지시 원문 확인','변경 위치와 이유를 표시','영향받는 평·단·입면/면적표/모델 목록화','관련 도면을 같은 기준일로 수정','출력 또는 비교뷰로 누락·정합성 확인'],check:'도면번호 · 기준일 · 변경이력 · 연동 도면 · 면적/표/모델 정합성',collab:'사내 담당 → 구조·설비 등 영향 분야',done:'변경 원인과 반영된 모든 도면을 역추적할 수 있으면 완료'}],
  [/qgis|큐지아이에스/i,{title:'QGIS 작업은 “무슨 레이어를 왜 보는지”부터 고정해요',steps:['조사 목적과 대상 지번 확정','공간데이터 출처·기준일·좌표계 확인','필요 레이어만 불러와 대지와 중첩','결과를 도면/표/이미지로 정리','중요 조건은 최신 공적자료로 재확인'],check:'데이터 출처 · 갱신일 · 좌표계 · 범례 · 공식 재확인 여부',collab:'GIS 사용 가능 인원/선임 → 법적 적용은 인허가 담당',done:'결과 이미지뿐 아니라 어떤 데이터로 확인했는지 출처가 남으면 완료'}],
  [/면적표|면적\s*(검토|산출|계산)|주차\s*(대수|산정|계산)/,{title:'숫자 업무는 산정기준과 도면 버전을 먼저 잠가요',steps:['산정 목적과 적용 기준 확인','최신 평면/면적 데이터를 같은 버전으로 고정','용도·층별로 계산 구조를 분리','중간합계와 총합을 역산 검증','보고자료·도면의 숫자와 마지막 대조'],check:'기준일 · 산정식 · 포함/제외 범위 · 근거 · 계획값과 요구값',collab:'산정기준은 책임/인허가 담당, 계획 영향은 PM과 공유',done:'숫자 하나를 눌렀을 때 근거와 원도면까지 따라갈 수 있으면 완료'}],
  [/사례|레퍼런스|파사드|입면.*디자인/,{title:'사례조사는 “예쁜 이미지 수집”보다 비교기준을 먼저 만들어요',steps:['우리 프로젝트의 용도·규모·매싱·목표 정의','같은 용도부터 유사 규모/구성으로 좁힘','프로젝트명·설계사·연도·규모 등 사실정보 확인','입면 전략/재료/분절 방식만 추출','우리 안에 적용 가능한 이유와 한계를 한 줄로 기록'],check:'출처 · 프로젝트 사실정보 · 비교 가능성 · 적용 포인트 · 한계',collab:'디자인 방향은 책임/PM, 기술 가능성은 외장·창호 등 협력업체',done:'각 사례가 “왜 참고할 가치가 있는지” 한 문장으로 설명되면 완료'}],
  [/인허가|건축허가|심의|착공|사용승인|사용검사/,{title:'인허가 업무는 원래 승인경로와 현재 제출단계를 먼저 확인해요',steps:['이 프로젝트의 원 승인/허가 경로 확인','현재 단계의 공식 제출요건과 관할 안내 확인','건축/협력업체 자료를 담당별로 목록화','도면·표·신청정보의 버전과 수치 통일','제출 전 누락·서명·파일명·최종본 여부 점검'],check:'원 승인경로 · 제출목록 · 담당자 · 마감 · 최신본 · 보완이력',collab:'사내 인허가/PM → 분야별 협력업체 → 필요한 쟁점만 관할기관',done:'제출목록과 실제 파일이 1:1로 대응하고 기준일이 통일되면 완료'}],
  [/구조|기계|전기|소방|설비|협력업체|협의/,{title:'협력업체 문의는 “질문 + 위치 + 기준파일 + 회신기한”을 한 번에 보내요',steps:['판단받을 질문을 한 문장으로 좁힘','도면에서 위치와 변경내용 표시','최신 기준파일과 필요한 조건 첨부','회신 희망일과 다음 의사결정 일정 공유','회신을 받은 뒤 영향 도면과 다른 분야까지 전파'],check:'질문 · 도면 위치 · 기준일 · 요청값 · 회신일 · 반영여부',collab:'사내 담당과 질문범위 정리 → 해당 기술분야 협력업체',done:'회신 내용이 도면/회의록/변경기록 중 하나에 남고 반영 여부가 표시되면 완료'}],
  [/bim|revit|레빗|모델링|중앙파일|워크셋|workset/i,{title:'BIM 작업은 모델을 열기 전에 프로젝트 운용기준부터 확인해요',steps:['BEP/사내 BIM 기준 또는 프로젝트 규칙 확인','중앙·로컬/클라우드 협업 방식과 권한 확인','레벨·그리드·좌표·링크 기준 확인','내 작업범위와 소유/워크셋 상태 확인','작업 후 동기화·간섭·뷰/도면 영향을 점검'],check:'모델 버전 · 좌표 · 링크 · 작업권한 · 동기화 · 경고/간섭 · 납품기준',collab:'프로젝트 BIM 담당 → 사내 BIM팀/운용 가능인원 → 관련 모델 작성자·협력업체',done:'다른 사람이 같은 모델을 열어도 기준·변경내용·협업상태를 이해할 수 있으면 완료'}]
];
const HOW_DEFAULT={title:'업무를 “입력 → 실행 → 검토 → 기록” 순으로 끝내보세요',steps:['업무 목적과 최종 산출물 확인','최신 기준자료와 기준일 고정','필요한 작업만 실행','관련 도면·수치·협업 영향 검토','결과와 미확정 사항을 기록하고 공유'],check:'업무 목적 · 기준자료 · 변경내용 · 검토자 · 다음 행동',collab:'업무 요청자/책임에게 범위를 맞춘 뒤 필요한 분야에만 질문',done:'다음 사람이 결과와 남은 쟁점을 바로 이어받을 수 있으면 완료'};
function howData(task){const hit=HOW_RULES.find(([re])=>re.test(task||''));return hit?hit[1]:HOW_DEFAULT}

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

const BIM_TOPICS=[
  {id:'central',re:/(중앙파일|central\s*file|로컬파일|local\s*file|worksharing|워크셰어)/i,name:'Revit 중앙·로컬 협업',what:'여러 사람이 같은 Revit 프로젝트를 편집할 때 중앙 모델과 각 사용자의 작업본을 통해 변경사항을 조정하는 협업 방식이에요.',why:'동시에 작업하면서 서로의 변경을 안전하게 합치고, 누가 무엇을 편집 중인지 관리하기 위해 사용합니다.',where:'프로젝트 BEP/BIM 기준 → 사내 Revit 운용기준 → 현재 중앙/클라우드 모델 위치 → Autodesk 도움말',who:'프로젝트 BIM 담당자 → 사내 BIM팀/운용 가능인원. 기능 자체가 처음이면 공식 도움말·교육영상으로 보완하세요.',start:['중앙/클라우드 협업 방식 확인','내가 열어야 할 파일과 작업권한 확인','동기화 규칙·저장 위치 확인'],caution:'프로젝트 규칙을 모른 채 중앙파일을 복사·이동·이름변경하거나 임의로 협업 설정을 바꾸지 마세요.'},
  {id:'workset',re:/(workset|워크셋)/i,name:'Workset',what:'Revit 협업 모델에서 요소와 작업범위를 나누고 가시성·소유 상태 등을 관리하는 단위예요.',why:'여러 사람이 같은 모델에서 작업할 때 작업범위와 모델 표시를 관리하는 데 사용합니다.',where:'프로젝트 BEP/사내 BIM 기준 → 현재 모델의 Workset 구성 → Autodesk Revit 도움말',who:'프로젝트 BIM 담당자 또는 해당 모델 운용 경험자에게 기존 Workset 규칙을 먼저 확인하세요.',start:['현재 프로젝트 Workset 목록 확인','내 작업요소가 어느 Workset에 들어가는지 확인','새 Workset 생성이 필요한지 담당자 확인'],caution:'개인 편의로 Workset을 새로 만들면 프로젝트 표준이 흐트러질 수 있습니다.'},
  {id:'coords',re:/(좌표|shared\s*coordinates|공유좌표|project\s*base\s*point|survey\s*point)/i,name:'Revit 좌표·공유좌표',what:'건축·구조·설비·토목 등 서로 다른 모델을 같은 실제 위치에 맞춰 연결하기 위한 위치 기준이에요.',why:'링크 모델이 어긋나지 않고 여러 분야가 같은 기준점에서 협업하도록 하기 위해 중요합니다.',where:'BEP/좌표 기준도 → 측량·토목 기준 → Revit 링크/좌표 설정 → Autodesk 도움말',who:'좌표를 바꾸기 전 프로젝트 BIM 담당자와 토목/측량 기준을 아는 담당자에게 확인하세요.',start:['현재 좌표 기준과 기준파일 확인','링크 모델 위치가 어떤 방식인지 확인','변경 필요 시 영향받는 모든 링크를 먼저 목록화'],caution:'좌표는 한 모델만의 설정이 아닙니다. 임의 변경하면 여러 링크 모델 전체가 어긋날 수 있습니다.'},
  {id:'link',re:/(revit\s*link|링크모델|링크\s*모델|rvt\s*링크)/i,name:'Revit 링크 모델',what:'다른 Revit 모델을 현재 모델 안에 참조로 불러와 함께 보는 방식이에요.',why:'건축·구조·MEP 모델을 분리 운용하면서도 위치와 간섭을 함께 확인하기 위해 사용합니다.',where:'BEP/모델 분할기준 → 링크 경로·좌표 규칙 → 현재 모델 관리 설정',who:'프로젝트 BIM 담당자와 해당 링크 모델 작성자/협력업체',start:['어떤 모델을 링크해야 하는지 확인','경로·좌표·버전 확인','링크 후 레벨/그리드/주요 간섭 위치 점검'],caution:'링크 파일을 직접 수정해야 하는지, 참조만 해야 하는지 역할을 먼저 구분하세요.'},
  {id:'ifc',re:/\bifc\b|아이에프씨/i,name:'IFC',what:'서로 다른 BIM 소프트웨어 사이에서 건물 모델 정보를 교환하기 위한 개방형 데이터 형식이에요.',why:'Revit 외 다른 프로그램이나 발주처·협력업체와 모델을 주고받을 때 활용됩니다.',where:'발주처 BIM 지침/BEP → 납품 요구 버전·속성 기준 → 내보내기 설정 → buildingSMART/프로그램 도움말',who:'납품 목적이면 BIM 담당자/발주처 기준 담당, 단순 변환 테스트면 사내 BIM 운용 가능인원',start:['왜 IFC가 필요한지 확인','요구 IFC 버전·속성·좌표 확인','샘플 export 후 뷰어에서 검수'],caution:'IFC는 그냥 “다른 확장자로 저장”하는 작업이 아닙니다. 납품 속성·분류·좌표 기준을 먼저 확인하세요.'},
  {id:'clash',re:/(clash|클래시|간섭검토|간섭\s*체크)/i,name:'Clash Detection · 간섭검토',what:'건축·구조·설비 모델이 물리적으로 충돌하거나 필요한 여유공간을 침범하는지 찾는 BIM 조정 작업이에요.',why:'시공 전에 충돌을 발견해 설계변경과 현장 재작업을 줄이기 위해 수행합니다.',where:'BEP/간섭검토 기준 → 통합모델 → 간섭 규칙/허용오차 → 이슈리스트',who:'BIM 코디네이터/사내 BIM팀 → 충돌 당사자인 건축·구조·설비 담당',start:['검토할 모델 버전 고정','검토 규칙과 허용오차 확인','이슈별 담당자·마감일 지정'],caution:'모든 충돌을 같은 중요도로 처리하지 말고 실제 시공·유지관리 영향이 있는 이슈를 분류하세요.'},
  {id:'bep',re:/\bbep\b|bim\s*(수행|실행)계획|bim\s*execution/i,name:'BEP · BIM 수행계획',what:'프로젝트에서 BIM을 누가, 어떤 기준과 파일구조·좌표·LOD·협업방식으로 운영할지 정리한 실행 문서예요.',why:'팀마다 제각각 모델링하지 않고 프로젝트 전체의 BIM 작업방식을 하나로 맞추기 위해 사용합니다.',where:'발주처 BIM 지침/과업지시서 → 프로젝트 BEP → 사내 BIM 표준',who:'프로젝트 BIM 매니저/코디네이터 또는 사내 BIM팀',start:['현재 승인된 BEP 버전 확인','내 역할·모델범위·납품물 확인','파일명·좌표·LOD·협업 규칙 표시'],caution:'BEP가 있다면 개인 습관보다 프로젝트 BEP가 우선입니다.'},
  {id:'lod',re:/\blod\b|모델\s*상세수준|상세수준/i,name:'LOD',what:'BIM 모델 요소가 프로젝트 단계별로 어느 정도의 형상·정보 신뢰도를 가져야 하는지 표현할 때 쓰는 개념이에요.',why:'필요 이상으로 모델링하거나, 반대로 의사결정에 필요한 정보가 부족한 상황을 줄이기 위해 씁니다.',where:'발주처 BIM 지침 · BEP · 단계별 납품요구조건',who:'프로젝트 BIM 담당자/발주처 BIM 기준 담당',start:['현재 단계와 납품목적 확인','요구 LOD/정보요건 확인','내 모델 요소 범위를 맞춤'],caution:'LOD 숫자만 보고 세부 요구를 추정하지 말고 프로젝트에서 정의한 기준을 확인하세요.'},
  {id:'family',re:/(패밀리|family|shared\s*parameter|공유매개변수|파라미터)/i,name:'Revit 패밀리·파라미터',what:'Revit에서 문·창호·가구·장비 같은 반복 객체와 그 속성정보를 정의하는 기본 구성요소예요.',why:'같은 객체를 일관되게 재사용하고 도면·스케줄·BIM 정보와 연결하기 위해 사용합니다.',where:'사내 패밀리 라이브러리/템플릿 → 프로젝트 파라미터 기준 → Autodesk 도움말',who:'사내 BIM팀/패밀리 관리자 또는 프로젝트 BIM 담당자',start:['기존 사내 패밀리 존재 여부 확인','필요 파라미터와 분류 확인','새로 만들기 전에 재사용 가능성 확인'],caution:'중복 패밀리와 제각각인 파라미터는 모델 성능과 납품 품질을 떨어뜨릴 수 있습니다.'},
  {id:'revit',re:/(revit|레빗)/i,name:'Autodesk Revit',what:'건축·구조·설비 모델과 도면·스케줄 정보를 하나의 BIM 모델에서 연동해 다루는 설계 소프트웨어예요.',why:'모델 변경을 여러 도면과 정보에 연결하고 분야 간 BIM 협업을 하기 위해 사용합니다.',where:'사내 Revit/BIM 기준 → 프로젝트 템플릿/BEP → Autodesk 공식 도움말·공식 교육 → 기능 학습용 교육영상',who:'프로젝트 BIM 담당자/사내 BIM팀/운용 가능인원. 단순 기능 학습은 공식 도움말이나 검증된 교육영상도 활용할 수 있어요.',start:['회사 라이선스·설치방식 확인','프로젝트 템플릿/BEP 확인','샘플 파일에서 기본 조작 후 실제 모델 작업'],caution:'회사 프로젝트에서는 개인 템플릿이나 임의 플러그인 사용 전에 사내 기준을 확인하세요.',links:[['Autodesk Revit','https://www.autodesk.com/products/revit/overview'],['Revit 도움말','https://help.autodesk.com/view/RVT/2026/ENU/']]},
  {id:'bim',re:/\bbim\b|빔\s*(업무|설계|모델)/i,name:'BIM',what:'건물의 3D 형상과 속성정보를 하나의 디지털 모델로 연결해 설계·협업·시공·운영에 활용하는 업무방식이에요.',why:'단순 3D 모델링보다 도면·수량·정보·분야 간 협업을 하나의 모델 체계에서 연결하기 위해 사용합니다.',where:'발주처 BIM 요구조건/과업지시서 → 프로젝트 BEP → 사내 BIM 기준 → 사용하는 프로그램 공식 도움말',who:'프로젝트 BIM 담당자 → 사내 BIM팀/운용 가능인원 → 관련 모델 작성자·협력업체. 기능 공부는 유튜브 등 교육자료를 보조로 활용하세요.',start:['우리 프로젝트가 BIM을 왜 쓰는지 확인','BEP·납품기준·협업방식 확인','내가 맡은 모델 범위와 책임 확인'],caution:'BIM은 Revit 프로그램 자체와 같은 뜻이 아닙니다. 프로젝트 운영방식과 정보기준까지 포함합니다.'}
];
function bimTopic(q){return BIM_TOPICS.find(x=>x.re.test(q||''))||null}
function renderBim(t){
  const out=$('searchResult');if(!out)return;
  const p=activeProject();const ctx=p?.bimMode&&p.bimMode!=='none'?`${p.name} · ${bimLabel(p.bimMode)}`:'';
  out.innerHTML=`<div class="result-card cc232-bim-card" data-cc221="1"><div class="label">BIM PRACTICE · 척척</div><div class="cc232-bim-head"><div><h3>${esc(t.name)}</h3><p>${esc(t.what)}</p></div>${ctx?`<span>${esc(ctx)}</span>`:''}</div>
    <div class="cc232-four"><div><small>WHY · 왜 써요?</small><p>${esc(t.why)}</p></div><div><small>WHERE · 어디서 확인해요?</small><p>${esc(t.where)}</p></div><div><small>WHO · 누구에게 물어봐요?</small><p>${esc(t.who)}</p></div></div>
    <div class="cc232-start"><small>처음이면 이렇게</small>${t.start.map((x,i)=>`<div><span>${i+1}</span><b>${esc(x)}</b></div>`).join('')}</div>
    <details class="cc232-bim-detail"><summary>주의사항${t.links?' · 공식 자료':''}</summary><p>${esc(t.caution)}</p>${t.links?`<div class="cc232-links">${t.links.map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(n)} ↗</a>`).join('')}</div>`:''}</details>
  </div>`;
}
function runSearch(){const q=$('searchInput')?.value.trim()||'';const t=bimTopic(q);if(t){renderBim(t);return}if(typeof prevRunSearch==='function')prevRunSearch()}
function intercept(e){
  const target=e.target;let q='';
  if(e.type==='click'&&target.closest('#searchGo'))q=$('searchInput')?.value||'';
  else if(e.type==='click'&&target.closest('#homeSearchBtn'))q=$('homeSearch')?.value||'';
  else if(e.type==='keydown'&&e.key==='Enter'&&(target.id==='searchInput'||target.id==='homeSearch'))q=target.value||'';
  else return;
  const t=bimTopic(q);if(!t)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(target.id==='homeSearch'||target.closest('#homeSearchBtn')){if(typeof showView==='function')showView('search');if($('searchInput'))$('searchInput').value=q}
  renderBim(t);
}
function addBimExamples(){
  const box=document.querySelector('#view-search .examples');if(!box||box.querySelector('[data-cc232-bim]'))return;
  [['BIM이 뭐야?','BIM이 뭐예요?'],['Revit 중앙파일 작업은 어떻게 해?','Revit 협업'],['Workset이 뭐야?','Workset'],['BEP가 뭐야?','BEP']].forEach(([q,label])=>{const b=document.createElement('button');b.type='button';b.dataset.cc232Bim='1';b.textContent=label;b.addEventListener('click',()=>{if($('searchInput'))$('searchInput').value=q;const t=bimTopic(q);if(t)renderBim(t)});box.appendChild(b)});
}

function enhanceProjectCards(){
  const root=$('cc230List');if(!root)return;
  root.querySelectorAll('.cc230-card').forEach(card=>{
    if(card.querySelector('.cc232-bim-setting'))return;
    const id=card.dataset.pid;const p=readProjects().find(x=>x.id===id);if(!p)return;
    const wrap=document.createElement('label');wrap.className='cc232-bim-setting';wrap.innerHTML=`<span>BIM 운용</span><select aria-label="${esc(p.name)} BIM 운용 설정"><option value="none">미사용 / 잘 모르겠음</option><option value="revit">Revit 협업</option><option value="coordination">BIM 코디네이션</option><option value="delivery">BIM 납품 프로젝트</option><option value="other">기타 BIM</option></select>`;
    const select=wrap.querySelector('select');select.value=p.bimMode||'none';
    select.addEventListener('change',()=>{
      const items=readProjects();const next=items.map(x=>x.id===id?Object.assign({},x,{bimMode:select.value,updatedAt:Date.now()}):x);writeProjects(next);
      if(id===activeId())window.CC_ACTIVE_PROJECT=Object.assign({},next.find(x=>x.id===id));
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
function scheduleProjectEnhance(){setTimeout(()=>{enhanceProjectCards();refreshActiveBimTag()},80)}

function installStyle(){
  if($('cc232Style'))return;const s=document.createElement('style');s.id='cc232Style';s.textContent=`
  .cc232-actions{flex-wrap:wrap}.cc232-how-btn small{color:#4d69f2}.cc232-how-pane{padding:0!important;background:transparent!important;border:0!important}.cc232-how-head{padding:16px 17px;border:1px solid #e0e7f2;border-radius:15px 15px 0 0;background:#fff}.cc232-how-head small{display:block;font-size:9px;font-weight:950;color:#4e67ef;letter-spacing:.08em}.cc232-how-head b{display:block;margin-top:4px;font-size:16px;color:#17365d}.cc232-how-head span{display:block;margin-top:5px;font-size:10px;color:#7a8799}.cc232-how-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px;border:1px solid #e0e7f2;border-top:0;background:#fbfcff}.cc232-how-steps>div{padding:11px;border-radius:11px;background:#fff}.cc232-how-steps small{display:block;font-size:8px;font-weight:950;color:#5a72f2}.cc232-how-steps b{display:block;margin-top:4px;font-size:10px;line-height:1.5;color:#2f496d}.cc232-how-detail{border:1px solid #e0e7f2;border-top:0;border-radius:0 0 15px 15px;background:#fff;padding:0 14px 12px}.cc232-how-detail summary{padding:11px 2px;cursor:pointer;font-size:10px;font-weight:900;color:#50637e}.cc232-how-all{display:grid;gap:6px}.cc232-how-all>div{display:grid;grid-template-columns:23px 1fr;gap:8px;align-items:start}.cc232-how-all span{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#eef2ff;color:#5368e9;font-size:9px;font-weight:950}.cc232-how-all p{margin:2px 0 0;font-size:11px;line-height:1.55;color:#405570}.cc232-how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.cc232-how-grid>div{padding:11px;border-radius:11px;background:#f6f8fc}.cc232-how-grid small{font-size:8px;font-weight:950;color:#6c7b91}.cc232-how-grid p{margin:4px 0 0;font-size:10px;line-height:1.55;color:#3e536e}.cc232-bim-note{display:flex;gap:8px;margin-top:10px;padding:10px 11px;border-radius:11px;background:#eef8f4}.cc232-bim-note b{font-size:9px;color:#2e765f}.cc232-bim-note span{font-size:10px;line-height:1.5;color:#4c6c61}.cc232-how-lock{padding:16px;border:1px solid #e1e6ef;border-radius:14px;background:#fbfcfe}.cc232-how-lock small,.cc232-how-lock b,.cc232-how-lock span{display:block}.cc232-how-lock small{font-size:9px;font-weight:950;color:#7a8798}.cc232-how-lock b{margin-top:4px;font-size:14px;color:#334b6b}.cc232-how-lock span{margin-top:5px;font-size:10px;color:#7f8b9c}
  .cc232-bim-card{padding:20px}.cc232-bim-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.cc232-bim-head h3{margin:3px 0 5px;font-size:23px;color:#112c51}.cc232-bim-head p{margin:0;max-width:760px;font-size:13px;line-height:1.6;color:#3c536f}.cc232-bim-head>span{padding:6px 9px;border-radius:999px;background:#edf3ff;color:#4d64df;font-size:9px;font-weight:900;white-space:nowrap}.cc232-four{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:14px}.cc232-four>div{padding:12px;border:1px solid #e2e8f2;border-radius:12px;background:#fff}.cc232-four small,.cc232-start>small{display:block;font-size:9px;font-weight:950;color:#65758d}.cc232-four p{margin:5px 0 0;font-size:11px;line-height:1.6;color:#3e536f}.cc232-start{margin-top:10px;padding:12px 13px;border-radius:13px;background:#f5f8ff}.cc232-start>div{display:grid;grid-template-columns:22px 1fr;gap:8px;align-items:center;margin-top:7px}.cc232-start span{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:#fff;color:#5368e9;font-size:9px;font-weight:950}.cc232-start b{font-size:10px;color:#354f72}.cc232-bim-detail{margin-top:10px;border-top:1px solid #edf0f5;padding-top:8px}.cc232-bim-detail summary{font-size:10px;font-weight:900;color:#62738a;cursor:pointer}.cc232-bim-detail p{font-size:10px;line-height:1.6;color:#6a7585}.cc232-links{display:flex;gap:6px;flex-wrap:wrap}.cc232-links a{padding:7px 10px;border:1px solid #dce4ef;border-radius:999px;text-decoration:none;color:#4561dd;font-size:9px;font-weight:900}.cc232-bim-setting{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;padding:9px 10px;border-radius:10px;background:#f7f9fc}.cc232-bim-setting>span{font-size:9px;font-weight:900;color:#62738b}.cc232-bim-setting select{max-width:170px;border:1px solid #dfe6ef;border-radius:8px;background:#fff;padding:6px 8px;font-size:9px;color:#415775}.cc232-active-bim{font-size:9px!important;color:#4f69e8!important;font-weight:900}
  @media(max-width:700px){.cc232-how-steps,.cc232-how-grid,.cc232-four{grid-template-columns:1fr}.cc232-how-pane{margin-top:7px}.cc232-bim-card{padding:16px}.cc232-bim-head{display:grid}.cc232-bim-head>span{justify-self:start}.cc232-bim-head h3{font-size:20px}.cc232-bim-setting{align-items:flex-start;flex-direction:column}.cc232-bim-setting select{max-width:none;width:100%}}
  `;document.head.appendChild(s)
}
function install(){
  window.runSearch=runSearch;
  installStyle();addBimExamples();
  document.addEventListener('click',e=>{
    if(e.target.closest('#analyze'))setTimeout(addHow,170);
    if(e.target.closest('[data-view="projects"],#cc230Save,[data-use],[data-edit],[data-delete],#cc230New,#cc230EmptyNew'))scheduleProjectEnhance();
    if(e.target.closest('.master-levels button'))setTimeout(addHow,120);
  });
  document.addEventListener('click',intercept,true);document.addEventListener('keydown',intercept,true);
  window.addEventListener('resize',()=>setTimeout(restoreHowDesktop,50),{passive:true});
  if($('contextResult')?.innerHTML.trim())setTimeout(addHow,100);
  scheduleProjectEnhance();refreshActiveBimTag();
  
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
