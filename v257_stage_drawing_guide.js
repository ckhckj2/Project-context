(()=>{
'use strict';

const VERSION='2.1.65';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();

const STAGES={
  plan:{
    label:'계획설계',
    code:'PLAN',
    purpose:'주요 설계방향을 비교하고 발주처·설계팀이 기준안을 합의하는 도면군이에요.',
    done:'배치·평면·단면·입면·면적이 같은 계획안을 기준으로 하고, 미확정 항목이 따로 표시되면 됩니다.',
    groups:[
      {title:'기본·관리',items:['도면목록·표지·범례','설계개요·층별/용도별 면적개요','위치도·현황 및 대지분석','법규·주차·조경 검토표(해당 시)']},
      {title:'공간계획',items:['대지종합계획·배치도','층별 평면도','주요 단면도','주요 입면도']},
      {title:'설계 설명',items:['조닝·동선·프로그램 다이어그램','주요 공간·유닛 검토도','입면·재료 콘셉트','대안 비교도·보고용 이미지(필요 시)']},
      {title:'초기 협업',items:['구조방식·기둥 그리드 검토','기계실·전기실·샤프트 공간 검토','피난·방화구획 개념 검토','토목·조경·외부동선 개념 검토']}
    ]
  },
  middle:{
    label:'중간설계',
    code:'COORDINATE',
    purpose:'계획안을 구조·기계·전기·소방 조건과 맞춰 실시설계가 가능한 기준안으로 발전시키는 도면군이에요.',
    done:'분야별 영향과 미결사항이 도면에 표시되고, 담당자·회신기한·실시설계 반영항목이 연결되면 됩니다.',
    groups:[
      {title:'기본·관리',items:['도면목록·일반사항·범례','설계개요·면적표·법규검토표','대지·배치·주차·조경 계획','심의·허가 조건 반영표(해당 시)']},
      {title:'건축 기본도면',items:['각층 평면도·지붕평면도','주요 단면도·입면도','계단·코어·주요실 확대검토','창호·마감·천장 계획 초안']},
      {title:'분야별 조정',items:['구조 그리드·부재·슬래브 조건','기계 장비·덕트·배관 공간','전기실·EPS·천장·간선 조건','피난·방화구획·제연·소방 조건']},
      {title:'상세 준비',items:['외벽·지붕·방수 개념단면','주요 내부입면·마감 검토','창호·문 일람표 초안','간섭·미결사항·변경 목록']}
    ]
  },
  detail:{
    label:'실시설계',
    code:'DOCUMENT',
    purpose:'결정된 설계와 분야별 조건을 시공·견적·인허가에 사용할 수 있는 일관된 최종 도서로 만드는 단계예요.',
    done:'도면·표·시방·계산서·협력분야 자료가 같은 기준일과 변경번호를 사용하고, 출력본 대조까지 끝나면 됩니다.',
    groups:[
      {title:'일반·관리',items:['도면목록·일반사항·범례','설계개요·법규·면적 관련 표','도면번호·참조·개정이력','심의·허가 조건 최종 반영표']},
      {title:'건축 전체도면',items:['대지·배치·주차·조경 관련 도면','각층·지붕·천장 평면도','전체 입면도·단면도','코어·계단·화장실·특수실 확대도']},
      {title:'상세·일람표',items:['외벽·창호·출입구·지붕·방수 상세','벽·바닥·천장·마감 상세','문·창호·루버·철물 일람표','실내재료마감표·주요실 내부입면']},
      {title:'조정·납품',items:['구조·기계·전기·소방 최종도서 대조','오프닝·슬리브·샤프트·장비조건 조정','시방·계산서·BIM·출력규칙(계약 시)','미결사항 종결·수치·버전·출력 검수']}
    ]
  }
};

const DEPTH={
  1:{label:'목록 확인',text:'대표 도면이 있는지 확인하고, 모르는 항목은 책임자에게 이번 제출 대상인지 표시해서 물어보세요.'},
  2:{label:'근거 확인',text:'각 도면이 왜 필요한지와 과업지시서·발주처·관할기관 중 어디에서 요구했는지 근거를 함께 남기세요.'},
  3:{label:'분야 조정',text:'건축 도면별로 연결되는 구조·기계·전기·소방 도서, 담당자, 회신기한과 완료기준을 함께 관리하세요.'},
  4:{label:'판단·예외',text:'계약 납품목록, 회사 표준, 심의·허가 요구가 충돌하면 제출 목적과 승인권자를 기준으로 우선순위를 판단하세요.'}
};

const CONFIRM_ORDER=[
  ['01','과업지시서·계약','이번 단계의 공식 납품범위 확인'],
  ['02','사내 기준·책임자','회사 표준과 이번 제출의 필수도서 확인'],
  ['03','심의·허가 요구','해당 절차의 최신 요구목록과 보완이력 확인'],
  ['04','협력분야 일정','구조·기계·전기·소방 회신도서와 마감일 연결']
];

function level(){
  const label=clean($('miniLevel')?.textContent);
  if(/LV\.MAX/i.test(label))return 4;
  const matched=label.match(/LV\.(\d)/i);
  return Math.min(4,Math.max(1,matched?Number(matched[1]):1));
}

function stageFromPhase(phase){
  if(phase==='중간설계')return 'middle';
  if(phase==='실시설계'||phase==='시공·현장 대응')return 'detail';
  return 'plan';
}

function phaseRelation(phase,stage){
  if(phase==='사전기획 / 사업검토'||phase==='기본계획')return `${phase} · 다음 계획설계 준비용`;
  if(phase==='시공·현장 대응')return `${phase} · 실시설계 도서 대조용`;
  if(!phase||phase==='잘 모르겠습니다')return `${STAGES[stage].label} 기준 · 현재 단계 확인 필요`;
  return `현재 선택 · ${phase}`;
}

function projectExtras(label){
  if(/공동주택|주택|기숙사|오피스텔|주거|고시원/.test(label)){
    return ['단위세대·주거동 코어·공용부 계획','주차·부대복리·피난·접근성 도면','세대타입·면적·창호 일람의 상호 정합성'];
  }
  if(/공장|산업|물류|창고|FAB|반도체|공항|격납고|운수/.test(label)){
    return ['공정·물류·차량·인원 동선도','장비배치·반입구·대공간 구조·하중 조건','방화구획·위험물·특수설비·보안구역 도면'];
  }
  if(/학교|교육|도서관|박물관|공연장|청사|법원|공공|연구|병원|의료/.test(label)){
    return ['운영 시나리오·이용자/관리자 동선도','무장애·피난·보안·특수공간 요구도면','공공발주·인증·심의별 추가 제출도서'];
  }
  return ['용도별 핵심실·운영동선 도면','주차·피난·접근성·법규 관련 도면','발주처 요구와 프로젝트 고유 설비 도면'];
}

function groupMarkup(group){
  return `<section class="cc257-group"><h4>${esc(group.title)}</h4><ul>${group.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></section>`;
}

function bodyMarkup(stageKey,phase,project){
  const stage=STAGES[stageKey];
  const depth=DEPTH[level()];
  const extras=projectExtras(project);
  return `
    <div class="cc257-tabs" role="tablist" aria-label="설계단계 선택">
      ${Object.entries(STAGES).map(([key,item])=>`<button type="button" role="tab" data-cc257-stage="${key}" aria-selected="${key===stageKey}" class="${key===stageKey?'is-active':''}"><small>${esc(item.code)}</small>${esc(item.label)}</button>`).join('')}
    </div>
    <div class="cc257-stage-head">
      <span>${esc(phaseRelation(phase,stageKey))}</span>
      <h3>${esc(stage.label)}에서 보통 준비하는 대표 도면군</h3>
      <p>${esc(stage.purpose)}</p>
    </div>
    <div class="cc257-groups">${stage.groups.map(groupMarkup).join('')}</div>
    <section class="cc257-complete">
      <small>이 단계의 완료 기준</small><b>${esc(stage.done)}</b>
    </section>
    <details class="cc257-more">
      <summary><span><small>MORE</small><b>프로젝트별·제출 전 추가 확인</b></span><em>필요할 때 보기</em></summary>
      <section class="cc257-project-extra">
        <div><small>PROJECT CHECK</small><b>${esc(project||'선택한 프로젝트')}에서 추가로 확인</b></div>
        <ul>${extras.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>
      </section>
      <section class="cc257-confirm">
        <p><b>참고 가이드</b> 실제 납품·심의·허가 목록은 회사, 계약, 발주방식, 프로젝트 조건에 따라 달라집니다.</p>
        <ol>${CONFIRM_ORDER.map(item=>`<li><i>${item[0]}</i><span><b>${esc(item[1])}</b><small>${esc(item[2])}</small></span></li>`).join('')}</ol>
      </section>
      <div class="cc257-depth"><small>LV.${level()} · ${esc(depth.label)}</small><p>${esc(depth.text)}</p></div>
    </details>
    `;
}

function shellMarkup(phase,stageKey){
  return `<summary><span class="cc257-summary-icon" aria-hidden="true">▤</span><span><small>DRAWING GUIDE</small><b>단계별 도면 가이드</b><em>${esc(phaseRelation(phase,stageKey))}</em></span><strong>목록 보기</strong></summary><div class="cc257-body"></div>`;
}

function renderGuide(guide,stageKey,phase,project){
  if(!guide||!Object.hasOwn(STAGES,stageKey))return;
  const body=guide.querySelector('.cc257-body');
  if(!body)return;
  const key=JSON.stringify([phase,project,level(),stageKey]);
  if(guide.dataset.cc257Key===key)return;
  const expanded=body.querySelector('.cc257-more')?.open||false;
  const focusedStage=body.contains(document.activeElement)?document.activeElement.dataset.cc257Stage:null;
  body.innerHTML=bodyMarkup(stageKey,phase,project);
  body.querySelector('.cc257-more').open=expanded;
  guide.dataset.cc257SelectedStage=stageKey;
  guide.dataset.cc257Key=key;
  if(focusedStage&&Object.hasOwn(STAGES,focusedStage))body.querySelector(`button[data-cc257-stage="${focusedStage}"]`)?.focus();
}

function enhance(){
  const root=$('contextResult');
  if(!root||!root.innerHTML.trim())return;
  const map=root.querySelector('.map');
  const actions=map?.querySelector(':scope>.actions');
  if(!map||!actions)return;
  const phase=clean($('phase')?.value);
  const project=clean($('project')?.selectedOptions?.[0]?.textContent||$('project')?.value);
  const stageKey=stageFromPhase(phase);
  let guide=map.querySelector(':scope>.cc257-drawing-guide');
  if(!guide){
    guide=document.createElement('details');
    guide.className='cc257-drawing-guide';
    guide.innerHTML=shellMarkup(phase,stageKey);
    map.append(guide);
  }
  renderGuide(guide,guide.dataset.cc257SelectedStage||stageKey,phase,project);

}

function install(){

  const root=$('contextResult');
  window.CC_RUNTIME.registerContext('drawings',enhance);
  root?.addEventListener('click',event=>{
    const tab=event.target.closest('button[data-cc257-stage]');
    if(tab){
      const guide=tab.closest('.cc257-drawing-guide');
      const phase=clean($('phase')?.value);
      const project=clean($('project')?.selectedOptions?.[0]?.textContent||$('project')?.value);
      renderGuide(guide,tab.dataset.cc257Stage,phase,project);

      return;
    }
  });

}

window.CC_STAGE_DRAWING_GUIDE={
  version:VERSION,
  stages:Object.fromEntries(Object.entries(STAGES).map(([key,value])=>[key,{label:value.label,groups:value.groups.map(group=>({title:group.title,items:[...group.items]}))}])),
  stageFromPhase,
  projectExtras
};

window.CC_BOOT.register('v257_stage_drawing_guide',install);
})();
