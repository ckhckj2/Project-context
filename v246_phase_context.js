(()=>{
'use strict';
const VERSION='2.1.47';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const PHASE_ORDER=['사전기획 / 사업검토','기본계획','계획설계','중간설계','실시설계','시공·현장 대응'];

const PHASE_RULES={
  '사전기획 / 사업검토':{
    why:t=>`${t}가 사업 성립조건과 초기 의사결정에 어떤 영향을 주는지 먼저 확인합니다.`,
    risk:'전제조건을 놓치면 설계 착수 뒤 사업범위와 목표를 다시 잡을 수 있어요.',
    done:'적용조건·핵심 가정·추가 확인사항이 구분되면 됩니다.',
    material:'과업지시서·사업조건·대지정보·발주처 요구사항·기존 검토자료',
    source:'계약/과업자료 → 발주처 회의록 → 공적 대지자료 → 사내 유사 프로젝트',
    order:'사업목표 확인 → 적용조건 정리 → 불확실한 항목 표시 → 설계 착수조건 합의',
    how:t=>`${t}의 사업 전제부터 고정하는 순서`,
    steps:['결과물이 필요한 의사결정을 확인','사업조건과 미확정 가정을 한 장에 정리','설계 착수 전에 확인할 담당자와 기한 지정'],
    note:'도면을 만들기 전에 사업조건과 미확정 사항을 분리하세요.'
  },
  '기본계획':{
    why:t=>`${t}를 통해 규모·배치·법규 등 계획의 출발기준을 고정합니다.`,
    risk:'기준과 가정이 섞이면 계획설계에서 큰 범위의 재검토가 생길 수 있어요.',
    done:'계획설계에 넘길 기준값과 미확정 항목이 구분되면 됩니다.',
    material:'사업조건·대지/법규 검토·규모안·배치 초안·발주처 요구사항',
    source:'프로젝트 기준자료 → 최신 공적자료 → 사내 기본계획안 → 발주처 결정사항',
    order:'기준조건 고정 → 대안 비교 → 영향 큰 항목 확인 → 계획설계 기준안 기록',
    how:t=>`${t}의 기본조건을 계획 기준으로 만드는 순서`,
    steps:['현재 단계에서 확정할 기준과 보류할 조건 구분','규모·배치·법규에 미치는 영향 비교','계획설계 기준안과 미확정 목록을 함께 기록'],
    note:'정교한 표현보다 다음 설계의 기준이 흔들리지 않게 만드는 단계예요.'
  },
  '계획설계':{
    why:t=>`${t}를 통해 배치·평면·입면 등 주요 설계방향을 서로 맞춥니다.`,
    risk:'주요 결정의 근거가 없으면 중간설계에서 분야별 조건과 충돌할 수 있어요.',
    done:'선택한 계획안과 결정 근거, 다음 단계의 검토 쟁점이 남으면 됩니다.',
    material:'최신 계획안·평면/단면/입면·면적표·회의록·주요 법규/심의 조건',
    source:'승인된 계획안 → 최신 설계도면 → 발주처/PM 결정사항 → 관련 기준자료',
    order:'기준안 확인 → 대안과 변경점 비교 → 주요 수치 정합성 확인 → 결정사항 고정',
    how:t=>`${t}를 주요 설계안과 연결하는 순서`,
    steps:['승인받을 계획 쟁점과 기준안 확인','배치·평면·입면·면적 영향 함께 검토','결정안과 중간설계에서 풀 쟁점을 구분해 기록'],
    note:'한 장의 결과보다 주요 설계요소가 같은 방향을 보는지가 중요해요.'
  },
  '중간설계':{
    why:t=>`${t}를 구조·기계·전기·소방 등 분야별 조건과 조정해 실행 가능한 안으로 발전시킵니다.`,
    risk:'협력업체 조건과 인허가 쟁점을 늦게 반영하면 실시설계 도서가 연쇄 수정될 수 있어요.',
    done:'분야별 영향·담당·회신기한과 실시설계 반영사항이 정리되면 됩니다.',
    material:'계획설계 결정안·분야별 최신 도면/회신·심의/인허가 조건·조정회의록',
    source:'승인 계획안 → 협력업체 최신 회신 → 심의/인허가 자료 → 설계조정 기록',
    order:'기준안 잠금 → 분야별 영향 확인 → 충돌·미결사항 조정 → 실시설계 반영목록 작성',
    how:t=>`${t}의 분야별 영향을 조정하는 순서`,
    steps:['계획설계 기준안과 변경사항 고정','구조·기계·전기·소방 영향과 담당자 지정','회신 결과를 실시설계 반영목록으로 전환'],
    note:'내 분야만 끝내기보다 다른 분야의 영향과 회신 상태까지 닫아야 해요.'
  },
  '실시설계':{
    why:t=>`${t}의 결정사항을 실제 도면·표·시방·수량에 빠짐없이 반영합니다.`,
    risk:'도서 간 버전과 수치가 다르면 인허가 보완이나 현장 재작업으로 이어질 수 있어요.',
    done:'관련 도서가 같은 기준일로 맞고 변경이력을 역추적할 수 있으면 됩니다.',
    material:'최종 결정안·실시설계 도면·계산서/면적표·시방서·협력업체 최종 회신',
    source:'도면관리표/배포본 → 분야별 최종도서 → 인허가 조건 → 변경·검토 이력',
    order:'최종 기준안 확인 → 영향 도서 목록화 → 도면·표·시방 동시 반영 → 출력본 대조',
    how:t=>`${t}를 최종 도서에 닫는 순서`,
    steps:['최종 결정과 적용 기준일 확인','영향받는 도면·표·시방·모델을 목록화','출력/비교본으로 누락과 버전 불일치 검수'],
    note:'수정 자체보다 모든 납품도서가 같은 결정을 반영했는지가 완료 기준이에요.'
  },
  '시공·현장 대응':{
    why:t=>`${t}가 승인도서·현장조건·준공도서에 미치는 영향을 통제합니다.`,
    risk:'승인 없이 먼저 시공하거나 기록이 누락되면 재시공·책임소재·준공 문제가 생길 수 있어요.',
    done:'시공 전 승인 여부와 현장 반영, 준공도서 기록까지 연결되면 됩니다.',
    material:'승인/허가도서·현장 질의/RFI·감리/발주처 지시·시공도·변경이력',
    source:'승인도서 → 공식 현장문서 → 감리/발주처 회신 → 시공상세도와 준공도서',
    order:'현장차이 확인 → 시공 전 승인 필요성 판단 → 공식 지시/회신 확보 → 준공도서 반영',
    how:t=>`${t}를 현장 승인과 기록으로 닫는 순서`,
    steps:['승인도서와 현장조건의 차이 표시','시공 전에 승인·협의가 필요한지 확인','공식 회신과 현장 반영결과를 준공도서까지 연결'],
    note:'말로 합의한 변경도 반드시 공식 기록과 최종 도서에 남겨야 해요.'
  }
};

const CHANGE_RULES={
  '사전기획 / 사업검토':{why:'변경 가능성이 사업성·대지조건·사업방식에 미치는 영향을 미리 확인합니다.',done:'변경 가능 항목, 영향 큰 조건, 향후 승인경로 확인사항이 구분되면 됩니다.',material:'사업조건·대지자료·기존 검토안·변경 가능 항목·사업방식 자료',order:'사업 전제 확인 → 변경 가능성 표시 → 사업성/법규 영향 구분 → 향후 승인경로 확인',steps:['기존 사업조건과 검토 기준 확인','바뀔 가능성이 있는 항목과 영향 범위 표시','향후 적용될 원 승인경로와 확인 담당 지정']},
  '기본계획':{why:'기존 결정 또는 승인 전제를 기준으로 변경이 규모·배치·용도·법규에 미치는 영향을 검토합니다.',done:'변경 전후 기준과 계획설계에서 유지할 조건이 표로 정리되면 됩니다.',material:'기존 결정안·변경안·사업조건·규모/배치 검토표·승인 이력(있는 경우)',order:'원 기준 확인 → 변경 전후 비교 → 규모·법규 영향 표시 → 계획설계 기준 기록',steps:['기존 결정안과 변경안을 같은 기준으로 비교','배치·면적·높이·용도·법규 영향 표시','계획설계에 넘길 변경 기준과 미확정 사항 기록']},
  '계획설계':{why:'변경안이 주요 설계방향과 예정된 심의·인허가 경로를 흔드는지 확인합니다.',done:'변경 전후 도면, 변경사유, 주요 영향과 필요한 절차 확인사항이 정리되면 됩니다.',material:'기준 계획안·변경 전후 평/단/입면·면적표·변경사유·예정 심의/인허가 조건',order:'기준안 잠금 → 변경점 도면 표시 → 설계/행정 영향 구분 → 결정 및 협의사항 기록',steps:['기준 계획안과 변경안을 겹쳐 차이 표시','평·단·입면·면적과 심의/인허가 영향 검토','변경사유와 다음 단계 협의사항을 결정기록에 반영']},
  '중간설계':{why:'변경이 분야별 설계와 진행 중인 심의·허가자료에 미치는 영향을 동시에 조정합니다.',done:'분야별 수정항목·담당·회신기한과 변경절차 검토결과가 연결되면 됩니다.',material:'원 승인/제출도서·변경 전후 도면·분야별 최신 회신·심의/허가 보완이력',order:'원 승인경로 확인 → 분야별 영향 목록화 → 변경절차 검토 → 회신과 실시설계 일정 연결',steps:['원 승인경로와 현재 제출단계 확인','구조·기계·전기·소방 영향과 수정도서 목록화','변경절차·협력업체 회신·실시설계 반영일정 조정']},
  '실시설계':{why:'변경 결정과 행정절차를 모든 최종 도서에 같은 버전으로 반영합니다.',done:'변경 도면·계산서·시방·협력업체 자료가 제출목록과 1:1로 대응하면 됩니다.',material:'원 승인도서·최종 변경안·변경 전후표·실시설계 도서목록·협력업체 최종본',order:'원 승인도서 대조 → 변경절차 확정 → 영향 도서 동시 반영 → 제출본 수치/버전 검수',steps:['원 승인도서와 최종 변경결정 대조','영향받는 도면·표·계산서·시방·모델 목록화','변경허가/신고 자료와 실시도서의 수치·버전 최종 검수']},
  '시공·현장 대응':{why:'현장 변경을 시공 전에 적법한 절차와 공식 승인으로 통제하고 준공도서까지 남깁니다.',done:'변경 승인·현장지시·시공결과·준공도서가 하나의 이력으로 추적되면 됩니다.',material:'승인/허가도서·현장 변경요청·RFI·감리/발주처 회신·시공상세도·준공도서',order:'현장차이 표시 → 시공 전 변경절차 확인 → 공식 승인/지시 확보 → 시공·준공도서 반영',steps:['현장 변경과 승인도서 차이를 즉시 표시','변경허가·변경신고·경미한 변경 여부를 시공 전 확인','공식 회신·시공지시·준공도서 반영을 같은 변경번호로 관리']}
};

function level(){try{return typeof viewLevel==='function'?viewLevel():Number(localStorage.getItem('pc_level')||1)}catch(e){return 1}}
function selected(){return {task:$('task')?.value||'',phase:$('phase')?.value||'',project:$('project')?.selectedOptions?.[0]?.textContent?.trim()||''}}
function phaseRule(task,phase){
  const base=PHASE_RULES[phase];if(!base)return null;
  const change=/변경업무|변경허가|변경신고|경미한 변경/.test(task)?CHANGE_RULES[phase]:null;
  return Object.assign({},base,change||{},{whyText:change?.why||base.why(task),doneText:change?.done||base.done,howSteps:change?.steps||base.steps});
}
function updateFlow(root,phase){
  const now=root.querySelector('.flow .node.now');
  if(now){const original=now.dataset.cc246Original||now.textContent.trim();now.dataset.cc246Original=original;now.textContent=`${phase} · ${original}`;}
  const copy=root.querySelector('.stage-copy p');const {task}=selected();
  if(copy)copy.textContent=`이 단계에서 ${task}의 목적·확인자료·실행순서를 나눠 봅니다.`;
}
function updateContext(root,phase,task){
  const pane=root.querySelector('[data-pane="context"]');const cells=pane?.querySelectorAll('.detail-cell p');if(!cells||cells.length<3)return;
  const i=PHASE_ORDER.indexOf(phase);if(i<0)return;
  cells[0].textContent=i>0?PHASE_ORDER[i-1]:'사업조건·대지·요구사항 확인';
  cells[1].textContent=`${phase} · ${task}`;
  cells[2].textContent=i<PHASE_ORDER.length-1?PHASE_ORDER[i+1]:'준공·사용승인 및 운영 인계';
}
function updateWhy(root,task,phase,rule){
  if(level()<2)return;
  const pane=root.querySelector('[data-pane="why"]');if(!pane)return;
  const title=pane.querySelector('.why-title');if(title&&!title.dataset.cc246Base)title.dataset.cc246Base=title.textContent.trim();
  if(title)title.innerHTML=`<span class="cc246-phase-label">${esc(phase)}</span>${esc(title.dataset.cc246Base||task)}`;
  const first=pane.querySelectorAll(':scope > .detail-grid .detail-cell p');
  if(first.length>=3){first[0].textContent=rule.whyText;first[1].textContent=rule.risk;first[2].textContent=rule.doneText;}
  const where=pane.querySelectorAll('.cc218-where .detail-cell p');
  if(where.length>=3){where[0].textContent=rule.material;where[1].textContent=rule.source;where[2].textContent=rule.order;}
}
function updateHow(root,task,phase,rule){
  if(level()<3)return;
  const pane=root.querySelector('[data-pane="how"]');if(!pane)return;
  const title=pane.querySelector('.cc232-how-head b');if(title)title.textContent=rule.how(task);
  const note=pane.querySelector('.cc232-how-head span');if(note)note.textContent=rule.note;
  const top=pane.querySelector('.cc232-how-steps');
  if(top)top.innerHTML=rule.howSteps.map((x,i)=>`<div><small>0${i+1}</small><b>${esc(x)}</b></div>`).join('');
  let phaseBox=pane.querySelector('.cc246-how-phase');
  if(!phaseBox){phaseBox=document.createElement('div');phaseBox.className='cc246-how-phase';const details=pane.querySelector('.cc232-how-detail');if(details)details.insertAdjacentElement('beforebegin',phaseBox);else pane.appendChild(phaseBox);}
  phaseBox.innerHTML=`<small>${esc(phase)} · 완료 기준</small><b>${esc(rule.doneText)}</b>`;
}
function enhance(){
  const root=$('contextResult');if(!root||!root.innerHTML.trim())return;
  const {task,phase}=selected();const rule=phaseRule(task,phase);if(!rule)return;
  updateFlow(root,phase);updateContext(root,phase,task);updateWhy(root,task,phase,rule);updateHow(root,task,phase,rule);
  root.dataset.cc246Phase=phase;
}
function style(){
  if($('cc246Style'))return;const s=document.createElement('style');s.id='cc246Style';s.textContent=`
  .cc246-phase-label{display:inline-flex;margin:0 7px 4px 0;padding:4px 7px;border-radius:999px;background:#EEF4FF;color:#3565BD;font-size:8.5px;font-weight:950;vertical-align:middle}.cc246-how-phase{display:flex;gap:8px;align-items:flex-start;padding:10px 13px;border:1px solid #DCE7F7;border-top:0;background:#F3F7FE}.cc246-how-phase small{flex:0 0 auto;color:#3765B7;font-size:8.5px;font-weight:950}.cc246-how-phase b{color:#435B79;font-size:10px;line-height:1.5}.flow .node.now{max-width:190px;line-height:1.35}
  @media(max-width:700px){.cc246-how-phase{display:grid;gap:4px}.flow .node.now{max-width:none}}
  `;document.head.appendChild(s);
}
function install(){
  style();document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  document.addEventListener('click',e=>{
    if(e.target.closest('#analyze'))setTimeout(enhance,280);
    if(e.target.closest('.master-levels button'))setTimeout(enhance,230);
  });
  if($('contextResult')?.innerHTML.trim())setTimeout(enhance,320);
  window.CC_PHASE_CONTEXT={version:VERSION,phases:PHASE_ORDER.length,phaseAware:true};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
