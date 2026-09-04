(()=>{
'use strict';

const VERSION='2.1.63';
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
  const matched=clean($('miniLevel')?.textContent).match(/LV\.(\d)/i);
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
    <section class="cc257-project-extra">
      <div><small>PROJECT CHECK</small><b>${esc(project||'선택한 프로젝트')}에서 추가로 확인</b></div>
      <ul>${extras.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>
    </section>
    <section class="cc257-complete">
      <small>이 단계의 완료 기준</small><b>${esc(stage.done)}</b>
    </section>
    <details class="cc257-confirm">
      <summary><span><small>FINAL CHECK</small><b>이 목록을 그대로 제출하면 안 되는 이유</b></span><em>확인 순서 보기</em></summary>
      <p>이 목록은 일반적인 참고 가이드입니다. 실제 납품·심의·허가 목록은 회사, 계약, 발주방식, 프로젝트 조건에 따라 달라집니다.</p>
      <ol>${CONFIRM_ORDER.map(item=>`<li><i>${item[0]}</i><span><b>${esc(item[1])}</b><small>${esc(item[2])}</small></span></li>`).join('')}</ol>
    </details>
    <div class="cc257-depth"><small>LV.${level()} · ${esc(depth.label)}</small><p>${esc(depth.text)}</p></div>`;
}

function shellMarkup(phase,stageKey){
  return `<summary><span class="cc257-summary-icon" aria-hidden="true">▤</span><span><small>DRAWING GUIDE</small><b>단계별 도면 가이드</b><em>${esc(phaseRelation(phase,stageKey))}</em></span><strong>펼쳐보기</strong></summary><div class="cc257-body"></div>`;
}

function renderGuide(guide,stageKey,phase,project){
  const body=guide.querySelector('.cc257-body');
  if(!body)return;
  body.innerHTML=bodyMarkup(stageKey,phase,project);
  guide.dataset.cc257Stage=stageKey;
  guide.dataset.cc257Key=[phase,project,level(),stageKey].join('|');
}

function enhance(){
  const root=$('contextResult');
  if(!root||!root.innerHTML.trim())return;
  if(root.classList.contains('cc256-building')){schedule(90);return;}
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
    actions.before(guide);
  }
  const expected=[phase,project,level(),guide.dataset.cc257Stage||stageKey].join('|');
  if(guide.dataset.cc257Key!==expected)renderGuide(guide,guide.dataset.cc257Stage||stageKey,phase,project);
}

let timer=null;
function schedule(delay=80){clearTimeout(timer);timer=setTimeout(enhance,delay);}

function installStyle(){
  if($('cc257Style'))return;
  const style=document.createElement('style');
  style.id='cc257Style';
  style.textContent=`
  .cc257-drawing-guide{margin:0 0 10px;border:1px solid #D7E1EF;border-radius:16px;background:#fff;overflow:hidden}
  .cc257-drawing-guide>summary{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:11px;padding:14px 16px;cursor:pointer;list-style:none;background:#F9FBFE}
  .cc257-drawing-guide>summary::-webkit-details-marker{display:none}
  .cc257-summary-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#E7F0FC;color:#3567AD;font-size:17px}
  .cc257-drawing-guide>summary span:nth-child(2){display:block;min-width:0}
  .cc257-drawing-guide>summary small,.cc257-drawing-guide>summary b,.cc257-drawing-guide>summary em{display:block}
  .cc257-drawing-guide>summary small{color:#5275A6;font-size:8px;font-weight:950;letter-spacing:.08em}
  .cc257-drawing-guide>summary b{margin-top:2px;color:#203F69;font-size:13px}
  .cc257-drawing-guide>summary em{margin-top:3px;color:#75859B;font-size:8.5px;font-style:normal}
  .cc257-drawing-guide>summary strong{padding:5px 8px;border-radius:999px;background:#EAF0F8;color:#526A88;font-size:8px;white-space:nowrap}
  .cc257-drawing-guide[open]>summary strong{background:#DDEBFC;color:#315F9E}.cc257-drawing-guide[open]>summary strong{font-size:0}.cc257-drawing-guide[open]>summary strong:after{content:'접기';font-size:8px}
  .cc257-body{padding:14px 16px 16px;border-top:1px solid #E4EAF2}
  .cc257-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:13px}
  .cc257-tabs button{min-height:42px;padding:7px 9px;border:1px solid #DCE4EF;border-radius:10px;background:#F8FAFC;color:#5C6E84;font:inherit;font-size:9px;font-weight:900;cursor:pointer;transform:none!important;animation:none!important;transition:background-color .15s ease,border-color .15s ease,color .15s ease!important}
  .cc257-tabs button small{display:block;margin-bottom:2px;color:#94A0B0;font-size:7px;letter-spacing:.07em}
  .cc257-tabs button.is-active{border-color:#85A9DD;background:#EAF3FF;color:#285A9E;box-shadow:inset 0 0 0 1px #C9DCF6}
  .cc257-tabs button.is-active small{color:#4F75AA}
  .cc257-stage-head>span{display:inline-flex;padding:4px 7px;border-radius:999px;background:#EAF3FF;color:#3566A9;font-size:8px;font-weight:900}
  .cc257-stage-head h3{margin:8px 0 4px;color:#203E66;font-size:15px;line-height:1.35}
  .cc257-stage-head p{margin:0;color:#667890;font-size:9.5px;line-height:1.55}
  .cc257-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
  .cc257-group{padding:11px 12px;border:1px solid #E2E8F0;border-radius:12px;background:#FBFCFE}
  .cc257-group h4{margin:0 0 7px;color:#385B88;font-size:9px}
  .cc257-group ul,.cc257-project-extra ul{margin:0;padding:0;list-style:none}
  .cc257-group li,.cc257-project-extra li{position:relative;padding:3px 0 3px 12px;color:#4E6076;font-size:9px;line-height:1.45}
  .cc257-group li:before,.cc257-project-extra li:before{content:'✓';position:absolute;left:0;top:3px;color:#5A84BE;font-size:8px;font-weight:950}
  .cc257-project-extra{display:grid;grid-template-columns:165px 1fr;gap:12px;margin-top:8px;padding:11px 12px;border:1px solid #DEE8F5;border-radius:12px;background:#F5F9FE}
  .cc257-project-extra small,.cc257-project-extra b{display:block}.cc257-project-extra small{color:#6B86AA;font-size:7px;font-weight:950;letter-spacing:.07em}.cc257-project-extra b{margin-top:3px;color:#315A8D;font-size:9px;line-height:1.45}
  .cc257-complete{display:grid;grid-template-columns:110px 1fr;gap:10px;margin-top:8px;padding:10px 12px;border-radius:11px;background:#EEF7F0}
  .cc257-complete small{color:#49775A;font-size:8px;font-weight:950}.cc257-complete b{color:#3F6650;font-size:9px;line-height:1.5}
  .cc257-confirm{margin-top:8px;border:1px solid #E4E7EC;border-radius:11px;background:#fff}
  .cc257-confirm>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;cursor:pointer;list-style:none}.cc257-confirm>summary::-webkit-details-marker{display:none}
  .cc257-confirm>summary small,.cc257-confirm>summary b{display:block}.cc257-confirm>summary small{color:#98732F;font-size:7px;font-weight:950;letter-spacing:.07em}.cc257-confirm>summary b{margin-top:2px;color:#5D5E61;font-size:9px}.cc257-confirm>summary em{color:#6E7D91;font-size:8px;font-style:normal;white-space:nowrap}
  .cc257-confirm>p{margin:0 12px 9px;padding:9px 10px;border-radius:8px;background:#FFF8E9;color:#735D36;font-size:8.5px;line-height:1.5}
  .cc257-confirm ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:0;padding:0 12px 12px;list-style:none}
  .cc257-confirm li{display:grid;grid-template-columns:24px 1fr;gap:7px;align-items:start;padding:8px;border:1px solid #E8EBF0;border-radius:9px}.cc257-confirm i{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#EAF0F8;color:#476A99;font-size:7px;font-style:normal;font-weight:950}.cc257-confirm b,.cc257-confirm small{display:block}.cc257-confirm b{color:#4B5E75;font-size:8.5px}.cc257-confirm small{margin-top:2px;color:#7F8B9A;font-size:7.5px;line-height:1.4}
  .cc257-depth{display:grid;grid-template-columns:110px 1fr;gap:10px;margin-top:8px;padding:9px 12px;border-radius:10px;background:#F3F0FB}.cc257-depth small{color:#635AA2;font-size:8px;font-weight:950}.cc257-depth p{margin:0;color:#615D76;font-size:8.5px;line-height:1.5}
  @media(max-width:700px){.cc257-groups{grid-template-columns:1fr}.cc257-project-extra,.cc257-complete,.cc257-depth{grid-template-columns:1fr;gap:5px}.cc257-confirm ol{grid-template-columns:1fr}}
  @media(max-width:430px){.cc257-drawing-guide>summary{grid-template-columns:34px 1fr;padding:12px}.cc257-drawing-guide>summary strong{grid-column:2;justify-self:start}.cc257-body{padding:12px}.cc257-tabs button{padding:7px 4px;font-size:8px}}
  @media(prefers-reduced-motion:reduce){.cc257-tabs button{transition:none!important}}
  `;
  document.head.append(style);
}

function markVersion(){
  document.querySelectorAll('.version').forEach(node=>node.textContent='v'+VERSION);
  document.documentElement.dataset.uiVersion=VERSION;
}

function install(){
  installStyle();
  const root=$('contextResult');
  if(root)new MutationObserver(()=>schedule()).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-cc257-stage]');
    if(tab){
      const guide=tab.closest('.cc257-drawing-guide');
      const phase=clean($('phase')?.value);
      const project=clean($('project')?.selectedOptions?.[0]?.textContent||$('project')?.value);
      renderGuide(guide,tab.dataset.cc257Stage,phase,project);
      return;
    }
    if(event.target.closest('#analyze,.master-levels button'))schedule(420);
  },true);
  if(root?.innerHTML.trim())schedule(240);
  markVersion();setTimeout(markVersion,800);setTimeout(markVersion,1500);
}

window.CC_STAGE_DRAWING_GUIDE={
  version:VERSION,
  stages:Object.fromEntries(Object.entries(STAGES).map(([key,value])=>[key,{label:value.label,groups:value.groups.map(group=>({title:group.title,items:[...group.items]}))}])),
  stageFromPhase,
  projectExtras
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
