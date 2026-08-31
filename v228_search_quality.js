(()=>{
'use strict';
const VERSION='2.1.28';
const previousRunSearch=window.runSearch;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ASK=/(누구|문의|물어|담당자|질의|확인받|뭐라고\s*말)/i;

const RULES=[
  {id:'legal',re:/법규\s*검토|법령\s*검토|적용\s*법규|관련\s*법규/i,title:'법규검토라면 먼저 “대지·용도·규모·사업방식” 4가지를 고정하세요',steps:['대상 지번과 용도지역·지구·구역을 확인합니다.','건축물의 실제 용도, 연면적·층수·높이 등 기본 규모를 적습니다.','일반 건축허가인지 주택·정비·공항·물류 등 별도 사업절차가 있는지 확인합니다.'],where:'토지이음 → 국가법령정보센터 → 지자체 조례·지구단위계획/고시 → 기존 인허가 자료',done:'적용 가능성이 있는 기준을 체크리스트로 만들고, 설계에 영향을 주는 항목과 추가 확인이 필요한 항목을 구분하면 1차 검토 완료입니다.',why:'법규검토는 건축법 한 권을 읽는 일이 아니라 프로젝트 조건에 맞는 법·조례·계획기준을 좁히는 작업입니다.',caution:'위치·규모·사업방식이 정해지지 않은 상태에서 조문부터 찾으면 적용되지 않는 기준을 섞기 쉽습니다.',who:'애매한 적용은 사내 인허가 담당/책임에게 1차 검토받고, 행정해석이 필요한 쟁점만 관할기관에 확인하세요.'},
  {id:'parcel',re:/지번\s*(확인|조사|봐|보래|체크)|필지\s*(번호|확인)|번지\s*확인/i,title:'지번 확인은 “어느 필지가 프로젝트 대지인지”를 확정하는 작업이에요',steps:['발주처 자료·기존 도면에서 기준 주소와 지번을 먼저 찾습니다.','토지이음·지적자료에서 같은 지번인지 확인하고 여러 필지인지 봅니다.','합필·분필 예정이나 인접 필지가 포함되는지 프로젝트 기준자료와 대조합니다.'],where:'토지이음 · 지적도/임야도 · 토지대장 · 발주처 대지자료 · 측량자료',done:'프로젝트에서 사용할 기준 지번 목록과 필지 구성이 하나로 정리되면 완료입니다.',why:'법규·면적·배치 검토는 모두 같은 대지를 기준으로 해야 하기 때문입니다.',caution:'도로명주소와 지번은 다르고, 온라인 지도 경계만으로 설계용 확정 경계를 판단하면 안 됩니다.',who:'필지 범위가 자료마다 다르면 책임/PM에게 기준 대지를 확인하고 필요하면 측량성과와 대조하세요.'},
  {id:'ledger',re:/건축물\s*대장|건물\s*대장/i,title:'건축물대장은 기존 건물의 “공적 현황”부터 잡는 데 사용해요',steps:['확인 목적을 정합니다: 용도 / 면적 / 층수 / 구조 / 사용승인 등.','대장에서 필요한 항목을 뽑아 기존 도면·현황자료와 비교합니다.','차이가 있으면 어느 자료를 설계 기준으로 쓸지 바로 표시합니다.'],where:'건축물대장 열람·발급 자료 · 기존 허가도서 · 현황도면 · 현장조사 자료',done:'대장상 정보와 현재 설계 전제의 일치·불일치 항목이 정리되면 완료입니다.',why:'기존건축물 프로젝트에서는 공적 정보와 실제 현황이 다를 수 있어 출발점을 맞춰야 합니다.',caution:'대장과 현장이 다르다고 임의로 어느 한쪽을 정답으로 정하지 마세요.',who:'불일치가 있으면 책임/PM에게 영향부터 공유하고 필요 시 관할 행정자료를 추가 확인하세요.'},
  {id:'cadastre',re:/지적도|임야도|토지대장|필지\s*경계|대지\s*경계/i,title:'지적·경계 확인은 배치와 접도 검토의 기준선을 만드는 작업이에요',steps:['프로젝트 기준 지번을 먼저 확정합니다.','지적 경계와 도로·인접 필지 관계를 확인합니다.','설계도면 경계와 측량성과가 있는 경우 서로 겹쳐 차이를 확인합니다.'],where:'지적도/임야도 · 토지대장 · 현황측량/경계측량 자료 · 발주처 대지자료',done:'설계에서 사용할 기준 경계와 아직 확정되지 않은 경계를 구분해 표시하면 완료입니다.',why:'경계가 달라지면 배치·이격·접도·면적 검토가 연쇄적으로 바뀔 수 있습니다.',caution:'GIS나 지도 화면의 선은 개략 검토용일 수 있습니다. 확정이 필요한 경계는 신뢰 가능한 측량자료를 봅니다.',who:'공적 경계와 설계도면이 다르면 책임/PM과 측량자료 기준을 먼저 맞추세요.'},
  {id:'area',re:/면적표|면적\s*(검토|체크|맞춰|산출|계산)/i,title:'면적표 검토는 “같은 숫자가 모든 도면에서 같은 기준으로 계산됐는지” 맞추는 작업이에요',steps:['기준 도면 버전과 면적 산정 기준을 먼저 고정합니다.','층별·용도별 면적과 합계가 평면도/코어/외곽선 변경과 맞는지 확인합니다.','연면적·용적률 산정용 면적처럼 목적이 다른 숫자를 섞지 않았는지 분리합니다.'],where:'최신 평면도 · 기존 면적표 · 허가/승인 면적표(해당 시) · 변경 코멘트',done:'도면·면적표·보고자료의 숫자가 같은 기준일과 같은 버전으로 맞으면 완료입니다.',why:'면적 숫자는 보고·법규·사업성·인허가에 동시에 쓰여 작은 불일치도 여러 자료로 번집니다.',caution:'면적이 바뀌었는데 합계만 맞추지 말고 변경 원인과 영향을 같이 기록하세요.',who:'산정 기준이나 포함/제외 범위가 애매하면 책임/PM 또는 인허가 담당에게 기준을 먼저 확인하세요.'},
  {id:'parking',re:/주차\s*(대수|계산|산정|검토)|법정\s*주차/i,title:'주차대수는 숫자부터 계산하지 말고 “용도별 적용기준”부터 나누세요',steps:['건축물의 실제 용도와 용도별 면적을 정리합니다.','해당 지역 조례와 관련 기준에서 용도별 설치기준을 확인합니다.','용도별 산정값을 합산하고 계획 주차대수·장애인주차 등 별도 기준과 대조합니다.'],where:'국가법령정보센터 · 해당 지자체 주차 조례 · 최신 면적표 · 배치/주차계획',done:'법정 산정 근거, 산정식, 요구대수, 계획대수를 한 표에서 추적할 수 있으면 완료입니다.',why:'복합용도에서는 용도별 기준이 달라 단일 비율로 계산하면 오류가 생기기 쉽습니다.',caution:'조례·용도·면적 변경에 따라 결과가 달라질 수 있으니 기존 프로젝트 숫자를 그대로 복사하지 마세요.',who:'용도구분이나 감면·특례 적용이 애매하면 사내 법규/인허가 담당에게 먼저 확인하세요.'},
  {id:'height',re:/높이\s*(제한|검토)|최고\s*높이|고도\s*제한/i,title:'높이 검토는 “어떤 기준이 높이를 제한하는지” 출처를 분리해서 봐야 해요',steps:['지구단위계획·용도지구·도시계획에서 높이 제한이 있는지 확인합니다.','건축법·조례상 높이 관련 기준과 대지·도로 조건을 함께 확인합니다.','공항·문화재·경관 등 프로젝트 위치에 따른 별도 제한 가능성을 확인합니다.'],where:'토지이음 · 지구단위계획 결정도서 · 국가법령정보센터 · 지자체 조례/고시 · 해당 기관 자료',done:'적용되는 높이 기준별 근거와 현재 계획높이의 여유/초과 여부가 정리되면 완료입니다.',why:'높이는 하나의 법 조항이 아니라 도시계획·건축·특별 기준이 겹쳐 결정될 수 있습니다.',caution:'지도나 이전 보고서의 숫자만 믿지 말고 최신 결정도서와 공식 기준을 확인하세요.',who:'서로 다른 기준이 충돌하거나 적용 여부가 애매하면 인허가 담당 검토 후 관할기관에 쟁점을 좁혀 문의하세요.'}
];

const QGIS_BRANCHES={
  parcel:{title:'QGIS에서 필지·경계를 확인하는 작업이에요',steps:['프로젝트 기준 지번과 좌표계를 확인합니다.','지적 관련 레이어를 불러와 대상 필지를 특정합니다.','설계도면·측량자료와 겹쳐 위치와 경계 차이를 확인합니다.'],where:'회사/공공 GIS 데이터 · 지적 관련 레이어 · 공적 지적자료 · 측량자료',done:'대상 필지와 주변 필지 관계가 보이고, 설계도면과 다른 부분이 표시되면 완료입니다.',why:'QGIS는 여러 공간정보를 겹쳐 관계를 빠르게 보는 도구입니다.',caution:'QGIS 화면만으로 법적 경계를 확정하지 않습니다.',who:'좌표나 경계가 안 맞으면 임의 이동하지 말고 GIS 기준과 측량자료를 선임에게 확인하세요.'},
  plan:{title:'QGIS에서 용도지역·도시계획 레이어를 겹쳐 보는 작업이에요',steps:['대상 필지를 먼저 고정합니다.','용도지역·지구·구역·도시계획 관련 레이어의 출처와 기준일을 확인합니다.','대지와 겹치는 범위를 본 뒤 토지이음·최신 고시/결정도서로 재확인합니다.'],where:'공공 공간데이터/지자체 GIS → 토지이음 → 최신 고시·결정도서',done:'대지에 걸리는 도시계획 조건과 공식 재확인이 필요한 항목이 구분되면 완료입니다.',why:'GIS는 여러 도시계획 조건의 공간관계를 빠르게 파악하는 데 유용합니다.',caution:'GIS 레이어는 갱신 시점이 다를 수 있으므로 최종 적용 판단은 최신 공식 자료로 합니다.',who:'경계나 적용 여부가 애매하면 선임/인허가 담당과 결정도서를 먼저 확인하세요.'},
  context:{title:'QGIS로 주변 현황을 구조적으로 조사하는 작업이에요',steps:['무엇을 찾는 조사인지 정합니다: 교통·학교·공원·시설·지형 등.','조사 반경과 필요한 레이어만 선택합니다.','도면/보고서에 쓸 항목만 추려 위치·거리·분포를 정리합니다.'],where:'공공 공간데이터 · 회사 GIS · 항공사진/지도 · 현장조사 자료',done:'프로젝트 판단에 필요한 주변 요소가 범위와 함께 한 화면/표로 정리되면 완료입니다.',why:'주변정보를 많이 모으는 것보다 설계 판단에 필요한 관계를 보여주는 게 목적입니다.',caution:'출처와 기준일이 다른 레이어를 같은 최신정보처럼 다루지 마세요.',who:'보고용이면 책임/선임에게 조사 범위와 표현기준을 먼저 확인하세요.'}
};

const ROAD_BRANCHES={
  access:{title:'도로 검토 중 “접도·건축 가능성”을 보는 작업이에요',steps:['대지에 접한 도로를 특정합니다.','도로의 법적 성격과 실제 현황을 구분해 확인합니다.','대지경계와 접한 상태가 계획·인허가에 미치는 영향을 표시합니다.'],where:'지적자료 · 토지이음/도시계획자료 · 기존 허가도서 · 측량자료',done:'어느 도로를 기준으로 접도 검토하는지와 추가 행정확인 필요 여부가 정리되면 완료입니다.',why:'현장에서 길처럼 보이는 것과 법적 검토상 도로인지는 같은 문제가 아닙니다.',caution:'법적 도로 인정 여부가 애매하면 도면만 보고 단정하지 마세요.',who:'사내 인허가 담당 검토 후 필요한 쟁점만 관할기관에 확인하세요.'},
  width:{title:'도로폭 확인은 “어디부터 어디까지를 폭으로 볼지” 기준을 먼저 잡아야 해요',steps:['대지 전면도로와 확인 구간을 특정합니다.','현황측량·지적자료·기존 도면의 폭을 비교합니다.','자료별 차이가 있으면 설계 기준으로 사용할 수치를 표시합니다.'],where:'현황측량 · 지적자료 · 기존 배치도 · 현장사진',done:'검토 구간별 도로폭과 사용한 기준자료가 명확하면 완료입니다.',why:'도로폭은 배치·차량동선·일부 법규검토의 전제가 됩니다.',caution:'온라인 지도에서 잰 값은 확정치로 사용하지 않습니다.',who:'자료마다 값이 다르면 책임/PM과 설계 기준 수치를 먼저 정하세요.'},
  plan:{title:'도시계획도로 여부와 대지에 미치는 영향을 확인하는 작업이에요',steps:['대상 대지를 토지이음에서 확인합니다.','도시계획시설 도로의 결정 여부·위치·폭을 확인합니다.','최신 고시·결정도서에서 실제 선형과 변경 여부를 재확인합니다.'],where:'토지이음 → 지자체 도시계획 포털/고시 → 최신 결정도서',done:'계획도로의 결정상태와 대지 저촉 여부, 설계 영향이 표시되면 완료입니다.',why:'계획도로는 현재 보이는 도로와 별개의 도시계획 조건일 수 있습니다.',caution:'오래된 도면이나 GIS 레이어만으로 결정상태를 확정하지 마세요.',who:'저촉 범위 해석이 애매하면 도시계획 담당과 확인할 쟁점을 사내에서 먼저 정리하세요.'}
};

function selectedContext(){
  return [document.getElementById('project')?.selectedOptions?.[0]?.textContent,document.getElementById('phase')?.value].filter(x=>x&&x!=='잘 모르겠습니다').join(' · ');
}
function renderCard(d,label='WORK GUIDE'){
  const out=$('searchResult');if(!out)return;
  const ctx=selectedContext();
  out.innerHTML=`<div class="result-card cc228-card" data-cc221="1"><div class="label">${esc(label)} · 척척</div><h3>${esc(d.title)}</h3>${ctx?`<div class="cc228-context">현재 선택 · ${esc(ctx)}</div>`:''}<div class="cc228-steps"><small>바로 시작</small>${d.steps.map((s,i)=>`<div><em>${i+1}</em><b>${esc(s)}</b></div>`).join('')}</div><div class="cc228-line"><small>어디서 확인</small><b>${esc(d.where)}</b></div><div class="cc228-line done"><small>완료 기준</small><b>${esc(d.done)}</b></div><details class="cc228-detail"><summary>왜 이렇게 하나요? · 주의사항 · 문의처</summary><div><small>WHY</small><p>${esc(d.why)}</p></div><div><small>주의</small><p>${esc(d.caution)}</p></div><div><small>누구에게</small><p>${esc(d.who)}</p></div></details></div>`;
}
function renderChoice(kind){
  const out=$('searchResult');if(!out)return;
  const isQ=kind==='qgis';
  const opts=isQ?
    [['필지·지적 경계','qgis:parcel'],['용도지역·도시계획','qgis:plan'],['주변 현황·시설','qgis:context']]:
    [['접도·건축 가능 여부','road:access'],['현황 도로폭','road:width'],['도시계획도로','road:plan']];
  out.innerHTML=`<div class="result-card cc228-card cc228-choice" data-cc221="1"><div class="label">CLARIFY · 척척</div><h3>${isQ?'QGIS에서 무엇을 확인하라는 요청인지 먼저 좁혀볼게요':'“도로 검토”가 어떤 의미인지 먼저 좁혀볼게요'}</h3><p>${isQ?'QGIS는 도구라서 어떤 레이어·관계를 보라는지에 따라 작업 순서가 달라집니다.':'접도, 현황 폭, 도시계획도로는 서로 다른 자료와 기준을 봅니다.'}</p><div class="cc228-choices">${opts.map(([t,v])=>`<button data-cc228-choice="${v}">${t}<span>→</span></button>`).join('')}<button data-cc228-choice="clarify:${kind}">잘 모르겠어요<span>→</span></button></div></div>`;
  out.querySelectorAll('[data-cc228-choice]').forEach(b=>b.addEventListener('click',()=>handleChoice(b.dataset.cc228Choice)));
}
function handleChoice(v){
  const [kind,key]=v.split(':');
  if(kind==='qgis')return renderCard(QGIS_BRANCHES[key],'QGIS GUIDE');
  if(kind==='road')return renderCard(ROAD_BRANCHES[key],'ROAD GUIDE');
  const q=key==='qgis'?{title:'요청자에게 “QGIS에서 무엇을 확인하면 될까요?”라고 범위를 한 번만 좁혀 물어보세요',steps:['필지·경계인지','용도지역·도시계획인지','주변 현황 조사인지 세 가지 중 무엇인지 확인합니다.'],where:'업무 요청 내용 · 기존 유사 산출물',done:'확인 대상 레이어와 결과물 형태가 정해지면 시작하면 됩니다.',why:'도구 이름만으로는 결과물을 특정할 수 없습니다.',caution:'목적을 모른 채 레이어를 많이 올리는 작업부터 시작하지 마세요.',who:'업무를 요청한 선임/책임에게 확인하세요.'}:{title:'도로 검토의 목적을 한 번만 확인하면 작업이 크게 줄어요',steps:['접도 검토인지','현황 도로폭 확인인지','도시계획도로 확인인지 물어봅니다.'],where:'업무 요청 내용 · 기존 배치/법규검토 자료',done:'검토 대상과 기준자료가 정해지면 시작하면 됩니다.',why:'도로라는 말이 실무에서 여러 검토를 뜻하기 때문입니다.',caution:'서로 다른 도로 개념을 한 결과로 섞지 마세요.',who:'업무를 요청한 선임/책임에게 확인하세요.'};
  renderCard(q,'CLARIFY');
}
function matchRule(q){return RULES.find(r=>r.re.test(q));}
function isCommon(q){return !!matchRule(q)||/qgis|큐지아이에스|큐지아이/i.test(q)||/도로\s*(확인|검토|조사|봐|보래|체크)/i.test(q);}
function renderCommon(q){
  if(!q||ASK.test(q))return false;
  if(/qgis|큐지아이에스|큐지아이/i.test(q)){
    if(/지적|필지|경계/i.test(q)){renderCard(QGIS_BRANCHES.parcel,'QGIS GUIDE');return true;}
    if(/용도지역|도시계획|지구단위/i.test(q)){renderCard(QGIS_BRANCHES.plan,'QGIS GUIDE');return true;}
    if(/주변|현황|시설|반경/i.test(q)){renderCard(QGIS_BRANCHES.context,'QGIS GUIDE');return true;}
    renderChoice('qgis');return true;
  }
  if(/도로\s*(확인|검토|조사|봐|보래|체크)|접도|도로폭|현황도로|도시계획도로/i.test(q)){
    if(/접도|건축법상\s*도로/i.test(q)){renderCard(ROAD_BRANCHES.access,'ROAD GUIDE');return true;}
    if(/도로폭|도로\s*폭|현황\s*도로/i.test(q)){renderCard(ROAD_BRANCHES.width,'ROAD GUIDE');return true;}
    if(/도시계획도로/i.test(q)){renderCard(ROAD_BRANCHES.plan,'ROAD GUIDE');return true;}
    renderChoice('road');return true;
  }
  const r=matchRule(q);if(!r)return false;
  renderCard(r);return true;
}
function runQuality(){
  const q=$('searchInput')?.value.trim()||'';
  if(renderCommon(q))return;
  if(typeof previousRunSearch==='function')previousRunSearch();
}
function routeHome(q){
  if(typeof showView==='function')showView('search');
  const input=$('searchInput');if(input)input.value=q;
  renderCommon(q);
}
function installStyle(){
  if(document.getElementById('cc228Style'))return;
  const s=document.createElement('style');s.id='cc228Style';s.textContent=`
  .cc228-card h3{margin-bottom:8px!important}.cc228-context{display:inline-block;margin:0 0 10px;padding:5px 8px;border-radius:999px;background:#F2F6FC;color:#687A94;font-size:9px;font-weight:850}
  .cc228-steps{display:grid;gap:7px;margin:10px 0}.cc228-steps>small,.cc228-line small{font-size:9px;font-weight:950;color:#77869C;letter-spacing:.03em}.cc228-steps>div{display:grid;grid-template-columns:24px 1fr;gap:8px;align-items:start;padding:10px 11px;border:1px solid #E3E9F3;border-radius:11px;background:#fff}.cc228-steps em{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#EDF3FF;color:#3165D4;font-style:normal;font-size:9px;font-weight:950}.cc228-steps b{font-size:12px;line-height:1.5;color:#30435F}
  .cc228-line{display:grid;grid-template-columns:88px 1fr;gap:10px;margin-top:7px;padding:10px 11px;border-radius:11px;background:#F7F9FC;border:1px solid #E5EAF2}.cc228-line b{font-size:11.5px;line-height:1.5;color:#41546F}.cc228-line.done{background:#F5FAF7;border-color:#DCEEE2}.cc228-line.done b{color:#2E6847}
  .cc228-detail{margin-top:9px;border:1px solid #E1E7F0;border-radius:11px;background:#FBFCFE}.cc228-detail summary{cursor:pointer;list-style:none;padding:10px 12px;font-size:10px;font-weight:900;color:#52647D}.cc228-detail summary::-webkit-details-marker{display:none}.cc228-detail summary:after{content:' ▾';float:right}.cc228-detail[open] summary:after{content:' ▴'}.cc228-detail>div{padding:0 12px 10px}.cc228-detail small{font-size:8.5px;font-weight:950;color:#7A899F}.cc228-detail p{margin:3px 0 0;font-size:10.5px;line-height:1.55;color:#5C6D85}
  .cc228-choice>p{font-size:11px;line-height:1.55;color:#66758C}.cc228-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px}.cc228-choices button{display:flex;justify-content:space-between;align-items:center;padding:11px 12px;border:1px solid #DEE5F0;border-radius:11px;background:#fff;color:#354A68;font-size:10.5px;font-weight:900;text-align:left}.cc228-choices button:hover{border-color:#B9CDF7;background:#F7FAFF;color:#285CC8}
  @media(max-width:700px){.cc228-line{grid-template-columns:1fr;gap:3px}.cc228-choices{grid-template-columns:1fr}.cc228-steps b{font-size:11px}.cc228-line b{font-size:11px}}
  `;document.head.appendChild(s);
}
function install(){
  installStyle();document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  window.runSearch=runQuality;
  document.addEventListener('click',e=>{
    const ex=e.target.closest('[data-example]');
    if(ex){const q=ex.dataset.example||'';if(isCommon(q)&&!ASK.test(q)){e.preventDefault();e.stopImmediatePropagation();routeHome(q);return;}}
    if(e.target.closest('#searchGo')){const q=$('searchInput')?.value.trim()||'';if(isCommon(q)&&!ASK.test(q)){e.preventDefault();e.stopImmediatePropagation();renderCommon(q);return;}}
    if(e.target.closest('#homeSearchBtn')){const q=$('homeSearch')?.value.trim()||'';if(isCommon(q)&&!ASK.test(q)){e.preventDefault();e.stopImmediatePropagation();routeHome(q);return;}}
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    if(e.target?.id==='searchInput'){const q=e.target.value.trim();if(isCommon(q)&&!ASK.test(q)){e.preventDefault();e.stopImmediatePropagation();renderCommon(q);}}
    if(e.target?.id==='homeSearch'){const q=e.target.value.trim();if(isCommon(q)&&!ASK.test(q)){e.preventDefault();e.stopImmediatePropagation();routeHome(q);}}
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
