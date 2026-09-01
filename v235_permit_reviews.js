(()=>{
'use strict';
const VERSION='2.1.35';
const PROJECT_STORAGE='cc_projects_v1';
const ACTIVE_STORAGE='cc_active_project_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const COMPARE=/(?:차이|비교|vs\\.?|다른\\s*점|어떻게\\s*달라|뭐가\\s*달라|둘\\s*중)/i;\n\nfunction level(){try{return typeof viewLevel==='function'?viewLevel():Number(localStorage.getItem('pc_level')||1)}catch(e){return 1}}
function readProjects(){try{const v=JSON.parse(localStorage.getItem(PROJECT_STORAGE)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
function activeProject(){try{const id=localStorage.getItem(ACTIVE_STORAGE)||'';return readProjects().find(p=>p.id===id)||null}catch(e){return null}}

const LAW={
  building:['건축법 제4조의2 · 건축위원회의 건축 심의 등','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1028913619'],
  landscape:['경관법 제28조 · 건축물의 경관 심의','https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1029761685'],
  fire:['소방시설법 시행규칙 제5조 · 성능위주설계 검토·평가','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1026018301'],
  traffic:['도시교통정비 촉진법 제15조·제16조 · 교통영향평가','https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=&chrClsCd=010202&efYd=20260603&lsiSeq=280121&urlMode=lsInfoP'],
  environment:['환경영향평가법 제43조 · 소규모 환경영향평가','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1027946277'],
  education:['교육환경 보호에 관한 법률 제6조 · 교육환경평가서의 승인 등','https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&chrClsCd=010202&efYd=20260123&lsiSeq=272863&urlMode=lsInfoP'],
  disaster:['자연재해대책법 제4조·제5조 · 재해영향평가등의 협의','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031974755'],
  bf:['장애인등편의법 제10조의2 · 장애물 없는 생활환경 인증','https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031592683'],
  zeb:['녹색건축물 조성 지원법 시행령 제12조 · 제로에너지건축물 인증 대상','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029826823']
};

const REVIEWS={
  building:{name:'건축심의',tag:'건축위원회',summary:'건축법상 일정한 건축물·대수선 등에 대해 건축위원회가 계획의 적정성을 검토하는 절차예요. 모든 건축물이 자동 대상은 아닙니다.',apply:'건축법·시행령에서 정한 대상인지 먼저 보고, 관할 지자체의 건축위원회 운영기준·조례·심의 안내에서 세부 대상과 접수시기를 다시 확인하세요.',when:'허가·승인 직전까지 미루기보다 배치·규모·동선·주요 계획이 바뀔 수 있는 시점에 대상 여부와 일정을 먼저 잡는 편이 안전합니다.',materials:['관할청 건축심의 체크리스트/심의도서 목차','최신 배치·평면·단면·입면 및 면적표','법규검토·주차·피난·교통 등 관련 검토자료','디자인/운영 쟁점과 이전 협의·보완 이력'],who:'사내 PM·인허가 담당 → 구조·설비·교통 등 관련 협력업체 → 관할 건축위원회 담당부서',after:'심의조건·의결사항을 항목별로 도면에 반영하고, 허가/승인 제출본과 동일한 기준일로 맞추세요.',caution:'건축심의 대상·도서·접수시기는 관할 지자체와 프로젝트 조건에 따라 달라질 수 있습니다. 과거 프로젝트 목록을 그대로 복사하지 마세요.',law:'building'},
  landscape:{name:'경관심의',tag:'경관위원회',summary:'건축물·개발사업·일부 사회기반시설의 경관 영향을 검토하는 절차예요. 건축물 경관심의는 경관지구, 중점경관관리구역, 공공건축 등과 지자체 조례가 중요합니다.',apply:'경관법 제28조의 건축물 유형에 해당하는지 확인한 뒤, 대상지의 경관지구·중점경관관리구역 여부와 관할 지자체 경관조례·경관계획·심의 운영기준을 확인하세요.',when:'매스·높이·스카이라인·입면·색채·외부공간 방향이 굳기 전에 대상 여부를 확인해야 재설계 위험을 줄일 수 있어요.',materials:['경관현황·주변맥락 분석','배치·매스·스카이라인·조망 검토','입면·재료·색채·야간경관 계획','공개공지·외부공간·보행동선 계획','관할청 경관심의 도서목차 및 체크리스트'],who:'PM/디자인 책임 → 경관·외장 등 관련 담당 → 관할 지자체 경관 담당부서',after:'의결·조건부 의견을 디자인 변경목록으로 관리하고 건축심의·허가도서와 서로 다른 안이 남지 않게 정리하세요.',caution:'“높은 건물이라서 경관심의”처럼 단순 규모만으로 단정하면 안 됩니다. 법정 대상과 지자체 조례 대상이 함께 작동할 수 있습니다.',law:'landscape'},
  fire:{name:'소방 관련 심의·평가',tag:'성능위주설계 등',summary:'현업에서 “소방심의”라고 부르기도 하지만 하나의 단일 법정 절차명은 아니에요. 프로젝트에 따라 성능위주설계 검토·평가, 소방 관련 위원회 심의·협의 등 실제 절차를 구분해야 합니다.',apply:'먼저 건축물 용도·규모·높이·특수성으로 성능위주설계 등 적용 가능성을 소방설계자와 확인하고, 소방시설법령·관할 소방본부/소방서 안내에서 실제 절차명과 대상을 확인하세요.',when:'피난계획·방화구획·제연·소방설비 공간이 건축계획을 크게 바꿀 수 있으므로 기본계획~중간설계에서 일찍 확인하는 게 좋습니다.',materials:['최신 건축 배치·평면·단면','피난·방화구획·수직동선 계획','소방설비 개념계획 및 성능위주설계 자료(해당 시)','구조·기계·전기와 연결되는 샤프트/기계실/전원 조건','관할기관 보완·검토 이력'],who:'프로젝트 소방설계 협력업체 → 사내 PM/인허가 담당 → 관할 소방서·소방본부',after:'검토·평가 결과와 보완사항을 건축·기계·전기·소방 도면에 동시에 반영하고 후속 허가/완공 단계까지 추적하세요.',caution:'“소방심의 대상”이라는 말만 듣고 시작하지 말고, 성능위주설계인지 다른 소방 절차인지 법정 명칭부터 확인하세요.',law:'fire'},
  traffic:{name:'교통영향평가',tag:'교통',summary:'개발사업이나 대통령령으로 정하는 건축물 등이 주변 교통에 미치는 영향을 평가하고 개선안을 검토하는 절차예요.',apply:'대상지역·사업·건축물 범위를 도시교통정비 촉진법과 시행령에서 확인하고, 지자체 조례가 별도 기준을 두는지도 확인하세요.',when:'출입구 위치, 차량동선, 주차계획, 대기공간이 배치와 직결되므로 배치가 굳기 전에 교통 협력업체와 대상 여부를 확인하세요.',materials:['배치도·차량출입구·주차계획','용도별 규모·연면적·세대/객실 등 사업자료','주변 도로·교차로·대중교통 현황','교통수요·동선·개선안 검토자료'],who:'교통영향평가 협력업체 → PM/토목·건축 담당 → 승인관청 교통 담당부서',after:'개선필요사항과 협의조건이 배치·주차·도로계획에 반영됐는지 허가/승인 도서와 대조하세요.',caution:'건축물 규모 하나만 보고 대상 여부를 단정하지 마세요. 대상지역·용도·사업종류와 지자체 조례를 함께 봐야 합니다.',law:'traffic'},
  environment:{name:'환경영향평가 계열',tag:'환경',summary:'전략환경영향평가·환경영향평가·소규모 환경영향평가는 서로 다른 절차예요. 일반 건축 프로젝트라고 해서 항상 환경영향평가 대상인 것은 아닙니다.',apply:'사업 종류·입지·개발면적·보전용도지역 여부와 원 승인경로를 먼저 확인하고, 어떤 환경평가 체계가 적용 가능한지 환경영향평가법·시행령에서 구분하세요.',when:'토지이용·부지조성·개발범위가 정해지는 초기 단계에서 대상 여부를 확인해야 일정 리스크를 줄일 수 있습니다.',materials:['사업개요·부지경계·토지이용계획','용도지역·보전지역 등 입지자료','개발면적·절성토·배수·녹지 등 계획','환경 현황 및 관계기관 협의자료'],who:'환경평가 전문업체/담당 → PM·토목 담당 → 승인기관 및 환경 협의기관',after:'협의조건을 토지이용·배수·녹지·공사계획 등에 반영하고 변경 시 재협의/변경절차 가능성을 확인하세요.',caution:'“환경심의”라는 한 단어로 묶지 말고 전략/본/소규모 환경영향평가 중 무엇인지 먼저 구분하세요.',law:'environment'},
  education:{name:'교육환경평가',tag:'교육환경',summary:'학교 설립, 일정한 도시·개발계획·정비사업 및 교육환경보호구역 관련 건축 등에서 교육환경에 미치는 영향을 평가해 교육감 승인을 받는 절차예요.',apply:'교육환경 보호에 관한 법률 제6조의 신청 주체·사업 유형에 해당하는지 확인하고, 학교·교육환경보호구역과 대상지 관계를 먼저 확인하세요.',when:'학교와의 거리·일조·교통·소음·안전 등이 배치에 영향을 줄 수 있어 초기 인허가 검토 때 후보로 올리는 게 좋습니다.',materials:['대상지·학교·보호구역 위치관계','배치·높이·일조·통학동선 자료','교통·소음·대기·안전 관련 검토자료','교육청/교육지원청 제출 안내자료'],who:'교육환경평가 담당/전문업체 → PM → 관할 교육청·교육지원청',after:'승인조건과 보완사항을 배치·동선·공사계획 등에 반영하고 후속 인허가 자료와 일치시키세요.',caution:'학교 근처라는 이유만으로 무조건 교육환경평가 대상이라고 단정하지 말고 법 제6조의 대상 사업·행위인지 확인하세요.',law:'education'},
  disaster:{name:'재해영향평가등의 협의',tag:'재해',summary:'자연재해에 영향을 미치는 일정한 행정계획이나 개발사업의 확정·허가 등에 앞서 재해영향을 검토·평가하고 협의하는 절차예요.',apply:'사업이 자연재해대책법 제5조 및 시행령 별표의 개발계획등 범위에 해당하는지, 원 승인/인가/허가 절차에서 협의 시점이 언제인지 확인하세요.',when:'부지조성·배수·저류·절성토 계획과 연결되므로 토목계획이 진행되는 초기부터 대상 가능성을 확인하세요.',materials:['사업개요·부지경계·토지이용','지형·유역·배수·우수계획','절성토·저류·침수·사면 등 재해 검토자료','원 승인경로 및 관계기관 협의 일정'],who:'재해영향평가 담당/토목 협력업체 → PM → 승인기관 및 재해 협의기관',after:'협의조건을 토목·배수·건축 배치에 반영하고 공사 단계의 이행관리 항목까지 전달하세요.',caution:'모든 건축허가가 재해영향평가 대상은 아닙니다. 개발사업 종류·범위와 시행령 별표를 확인하세요.',law:'disaster'},
  bf:{name:'BF · 장애물 없는 생활환경 인증',tag:'접근성',summary:'장애인·노인·임산부 등이 안전하고 편리하게 이용할 수 있도록 시설의 접근성과 이용환경을 평가하는 인증제도예요. 일부 시설은 의무인증 대상입니다.',apply:'시설주체·용도·공사유형·규모에 따라 의무인증시설인지 장애인등편의법과 시행령 별표에서 확인하세요.',when:'출입구·경사로·주차·화장실·승강기·객실 등 기본계획에 직접 영향을 주므로 평면이 굳기 전에 검토하세요.',materials:['배치·동선·주차·출입구 계획','평면·단면·상세 및 편의시설 치수','예비인증/본인증 일정과 체크리스트','관련 제품·설비 사양자료'],who:'BF 인증 담당/컨설턴트 → 건축 PM·설비 담당 → 인증기관',after:'예비인증 조건을 실시설계와 시공도서까지 추적해 본인증 단계에서 누락되지 않게 관리하세요.',caution:'BF와 건축법상 편의시설 검토를 같은 절차로 보지 마세요. 인증 의무 여부와 별개로 다른 접근성 기준도 적용될 수 있습니다.',law:'bf'},
  zeb:{name:'ZEB · 제로에너지건축물 인증',tag:'에너지',summary:'건축물의 에너지 성능을 높이고 신재생에너지 등을 활용해 에너지소요량을 낮추는 인증제도예요. 대상·의무 범위는 용도·규모·공공성 등 현재 법령을 확인해야 합니다.',apply:'녹색건축물 조성 지원법과 시행령·공동부령에서 프로젝트 용도와 규모가 인증·의무 대상인지 확인하세요.',when:'외피·창호·단열·설비·신재생 계획이 함께 움직이므로 중간설계 이후에 붙이는 업무가 아니라 초기 에너지 목표부터 잡는 게 좋습니다.',materials:['건축물 용도·면적·공공/민간 구분','외피·창호·단열 계획','기계·전기 에너지 시스템','신재생에너지 계획 및 에너지 모델링 자료'],who:'에너지/ZEB 컨설턴트 → 건축·기계·전기 담당 → 인증기관/관계기관',after:'설계인증 조건을 실시설계·시공·준공 단계까지 추적하고 변경으로 성능값이 달라졌는지 확인하세요.',caution:'“공공건축이면 무조건 같은 ZEB 등급”처럼 고정 규칙으로 보지 말고 최신 시행령·고시의 대상과 요구수준을 확인하세요.',law:'zeb'}
};

function topic(q){
  const s=String(q||'').trim();
  if(!s||COMPARE.test(s))return null;
  if(/심의\s*(종류|뭐|무엇|어떤)|어떤\s*심의|심의.*확인|심의.*대상.*한번|주요\s*심의/i.test(s))return {kind:'overview'};
  if(/건축\s*심의|건축위원회/i.test(s))return {kind:'review',key:'building'};
  if(/경관\s*심의|경관위원회/i.test(s))return {kind:'review',key:'landscape'};
  if(/소방\s*심의|성능위주설계|성능\s*위주/i.test(s))return {kind:'review',key:'fire'};
  if(/교통\s*영향\s*평가|교통영향평가/i.test(s))return {kind:'review',key:'traffic'};
  if(/교육\s*환경\s*평가|교육환경평가/i.test(s))return {kind:'review',key:'education'};
  if(/재해\s*영향|재해영향/i.test(s))return {kind:'review',key:'disaster'};
  if(/소규모\s*환경\s*영향|환경\s*영향\s*평가|환경영향평가/i.test(s))return {kind:'review',key:'environment'};
  if(/\bBF\b|비에프|장애물\s*없는\s*생활환경/i.test(s))return {kind:'review',key:'bf'};
  if(/\bZEB\b|제로\s*에너지|제로에너지/i.test(s))return {kind:'review',key:'zeb'};
  if(/인허가\s*(실무|업무|절차|패키지|뭐부터|무엇부터|시작)|심의\s*업무.*뭐부터/i.test(s))return {kind:'permit'};
  return null;
}

function projectBanner(){
  const p=activeProject();
  if(!p)return '<div class="cc235-project"><b>프로젝트 정보가 없어요.</b><span>대상 여부를 확인할 때는 위치·용도·규모·사업방식·원 승인경로가 필요합니다.</span></div>';
  const bits=[p.name,p.location,p.scale].filter(Boolean).join(' · ');
  return `<div class="cc235-project"><b>현재 프로젝트 · ${esc(p.name)}</b><span>${esc(bits||'등록정보 기준')} · 등록정보만으로 심의 대상을 확정하지는 않습니다.</span></div>`;
}
function lawLink(key){const [name,url]=LAW[key]||['국가법령정보센터','https://www.law.go.kr/'];return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a>`}

function renderReview(key){
  const d=REVIEWS[key],out=$('searchResult');if(!d||!out)return;
  const lv=level();
  out.innerHTML=`<article class="result-card cc235-review-card" data-cc221="1">
    <div class="cc235-top"><div><div class="label">REVIEW / APPROVAL · 척척</div><h3>${esc(d.name)}</h3><p>${esc(d.summary)}</p></div><span>${esc(d.tag)}</span></div>
    ${projectBanner()}
    <div class="cc235-core"><div><small>01 · 대상 여부를 어떻게 봐요?</small><p>${esc(d.apply)}</p></div><div><small>02 · 언제 확인해요?</small><p>${esc(d.when)}</p></div></div>
    <div class="cc235-caution"><b>먼저 기억할 점</b><span>${esc(d.caution)}</span></div>
    <details class="cc235-practice"><summary>${lv>=3?'LV.3 실무 준비자료 · 담당 · 완료 후 보기':'LV.3 실무 내용 🔒'}</summary>${lv>=3?`<div class="cc235-practice-grid"><div><small>준비자료</small>${d.materials.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div><div><small>누구와 확인?</small><p>${esc(d.who)}</p><small>심의·평가 후</small><p>${esc(d.after)}</p></div></div>`:`<div class="cc235-lock"><b>LV.3 · 책임부터 열립니다.</b><span>승급하면 준비자료, 협력업체 역할, 심의 후 반영·추적 방법까지 볼 수 있어요.</span></div>`}</details>
    <div class="cc235-sources"><small>공식 근거 시작점</small>${lawLink(d.law)}<span>정확한 대상·도서·접수시기는 시행령·시행규칙·관할기관 조례/안내의 최신본을 함께 확인하세요.</span></div>
  </article>`;
  cleanupForeignAdjustments();
}

function reviewButtons(){
  const entries=[['건축심의','건축심의 대상과 준비자료 알려줘'],['경관심의','경관심의 대상과 준비자료 알려줘'],['소방 관련','소방심의는 어떤 절차야?'],['교통영향','교통영향평가 언제 해?'],['환경','환경영향평가 어떤 경우 확인해?'],['교육환경','교육환경평가 언제 해?'],['재해영향','재해영향평가 언제 확인해?'],['BF','BF 인증 언제 확인해?'],['ZEB','ZEB 인증 언제 확인해?']];
  return entries.map(([n,q])=>`<button type="button" data-cc235-go="${esc(q)}">${esc(n)}</button>`).join('');
}
function renderOverview(){
  const out=$('searchResult');if(!out)return;
  out.innerHTML=`<article class="result-card cc235-overview" data-cc221="1"><div class="label">REVIEW MAP · 척척</div><h3>심의·평가를 한꺼번에 “대상”이라고 단정하지 마세요</h3><p>프로젝트의 원 승인경로를 먼저 정한 뒤, 위치·용도·규모·사업방식에 따라 필요한 심의·평가 후보를 하나씩 확인하는 게 안전합니다.</p>${projectBanner()}
    <div class="cc235-flow"><div><i>1</i><b>원 승인경로</b><span>건축허가·사업계획승인·특별법 사업 등</span></div><div><i>2</i><b>프로젝트 조건</b><span>위치·용도·규모·공공성·개발사업 여부</span></div><div><i>3</i><b>심의 후보</b><span>건축·경관·소방·교통·환경·교육·재해·BF·ZEB</span></div><div><i>4</i><b>관할 기준</b><span>법령 + 시행령 + 조례 + 기관 접수 안내</span></div><div><i>5</i><b>일정·도서 연결</b><span>누가 준비하고 무엇이 설계에 다시 반영되는지</span></div></div>
    <div class="cc235-pick"><small>하나씩 확인해보기</small><div>${reviewButtons()}</div></div>
    <div class="cc235-caution"><b>세움터는?</b><span>건축행정의 중요한 접점이지만 모든 심의·평가가 세움터 하나로 처리되는 것은 아닙니다. 심의·평가별 접수기관과 시스템을 따로 확인하세요.</span></div>
  </article>`;
  wireGo();cleanupForeignAdjustments();
}
function renderPermit(){
  const out=$('searchResult');if(!out)return;const lv=level();
  out.innerHTML=`<article class="result-card cc235-overview" data-cc221="1"><div class="label">LV.3 · PERMIT PRACTICE</div><h3>인허가 업무를 받으면 제출목록부터 만들지 마세요</h3><p>가장 먼저 <b>“이 프로젝트가 어떤 법적 경로로 승인되는지”</b>를 확인해야 심의·평가·제출자료가 제대로 연결됩니다.</p>${projectBanner()}
    <div class="cc235-flow"><div><i>1</i><b>원 승인·허가 경로 확인</b><span>건축허가/신고, 사업계획승인, 정비사업, 공항·물류 등 특별법 사업</span></div><div><i>2</i><b>현재 단계 확인</b><span>심의 → 허가·승인 → 착공 → 사용승인·사용검사 → 변경</span></div><div><i>3</i><b>심의·평가 후보 확인</b><span>대상 여부와 선후행·병행 관계를 일정에 올리기</span></div><div><i>4</i><b>자료를 담당별로 쪼개기</b><span>건축 기본자료 / 협력업체 / 행정자료 / 추가 요구자료</span></div><div><i>5</i><b>제출·보완·반영 추적</b><span>제출본 기준일 통일 → 보완 → 설계반영 → 다음 절차 연결</span></div></div>
    <div class="cc235-practice-grid ${lv<3?'locked':''}"><div><small>${lv>=3?'LV.3 · 실제 시작 체크':'LV.3 · LOCKED'}</small>${lv>=3?'<p>• 기존 허가/승인 문서와 최신 회의록 찾기</p><p>• 관할기관 제출 안내의 최신본 확인</p><p>• 심의·평가·협의 담당과 마감일을 한 표로 정리</p><p>• 건축/구조/기계/전기/소방/토목 등 자료 담당자를 붙이기</p>':'<p>책임 레벨부터 제출자료 분해·보완관리까지 열립니다.</p>'}</div><div><small>세움터 사용</small><p>건축허가·신고·건축물대장 등 건축행정 업무에서 중요하지만, 프로젝트의 원 승인경로와 해당 업무가 세움터 처리 대상인지 먼저 확인하세요.</p><small>완료 기준</small><p>제출목록과 실제 파일이 1:1로 대응하고, 심의·평가 조건과 보완사항이 다음 도면/절차까지 추적되면 됩니다.</p></div></div>
    <div class="cc235-pick"><small>주요 심의·평가부터 확인</small><div>${reviewButtons()}</div></div>
  </article>`;wireGo();cleanupForeignAdjustments();
}

function cleanupForeignAdjustments(){setTimeout(()=>{$('searchResult')?.querySelectorAll('.cc233-bim-search,.cc234-bim-search').forEach(x=>x.remove())},420)}
function runQuery(q){const t=topic(q);if(!t)return false;if($('searchInput'))$('searchInput').value=q;if(t.kind==='overview')renderOverview();else if(t.kind==='permit')renderPermit();else renderReview(t.key);return true}
function wireGo(){document.querySelectorAll('[data-cc235-go]').forEach(b=>{if(b.dataset.wired)return;b.dataset.wired='1';b.addEventListener('click',()=>runQuery(b.dataset.cc235Go||''))})}
function queryFromEvent(e){const t=e.target;if(e.type==='keydown'&&e.key==='Enter'&&(t.id==='searchInput'||t.id==='homeSearch'))return t.value||'';if(e.type==='click'){if(t.closest('#searchGo'))return $('searchInput')?.value||'';if(t.closest('#homeSearchBtn'))return $('homeSearch')?.value||'';const ex=t.closest('[data-example]');if(ex)return ex.dataset.example||'';}return''}
function intercept(e){const q=queryFromEvent(e);if(!q||!topic(q))return;e.preventDefault();e.stopImmediatePropagation();if(e.target.id==='homeSearch'||e.target.closest('#homeSearchBtn')){if(typeof showView==='function')showView('search')}runQuery(q)}

function patchHow(){
  const root=$('contextResult');if(!root)return;root.querySelector('.cc235-how')?.remove();if(level()<3)return;
  const task=$('task')?.value||'';if(!/(인허가|허가|심의|승인|착공|사용승인|사용검사)/.test(task))return;
  const pane=root.querySelector('[data-pane="how"]');if(!pane)return;
  const box=document.createElement('div');box.className='cc235-how';box.innerHTML=`<small>PERMIT PRACTICE</small><b>이 업무에서는 원 승인경로 → 심의·평가 → 제출단계 순으로 연결하세요.</b><div><span>1</span>기존 승인/허가 문서에서 법적 경로 확인</div><div><span>2</span>현재 단계와 선행 심의·평가 후보 확인</div><div><span>3</span>관할기관 최신 제출안내로 자료목록 확정</div><button type="button" data-cc235-open>인허가 실무 패키지에서 자세히 보기 →</button>`;pane.appendChild(box);box.querySelector('[data-cc235-open]').onclick=()=>{if(typeof showView==='function')showView('search');runQuery('인허가 실무 패키지')};
}

function addExamples(){const box=document.querySelector('#view-search .examples');if(!box||box.querySelector('[data-cc235-example]'))return;[['건축심의 대상이야?','건축심의'],['경관심의는 언제 해?','경관심의'],['소방심의는 어떤 절차야?','소방 관련'],['인허가 실무 패키지','인허가 실무']].forEach(([q,n])=>{const b=document.createElement('button');b.type='button';b.dataset.cc235Example='1';b.textContent=n;b.onclick=()=>runQuery(q);box.appendChild(b)})}
function installStyle(){if($('cc235Style'))return;const s=document.createElement('style');s.id='cc235Style';s.textContent=`
.cc235-review-card,.cc235-overview{padding:20px}.cc235-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.cc235-top h3,.cc235-overview h3{margin:4px 0 6px;font-size:22px;color:#17355d}.cc235-top p,.cc235-overview>p{margin:0;font-size:12px;line-height:1.65;color:#465c77}.cc235-top>span{padding:6px 9px;border-radius:999px;background:#edf3ff;color:#5067e5;font-size:9px;font-weight:900;white-space:nowrap}.cc235-project{display:flex;gap:8px;align-items:baseline;margin-top:12px;padding:9px 11px;border-radius:10px;background:#f6f8fc}.cc235-project b{font-size:9px;color:#40597c}.cc235-project span{font-size:9px;color:#7a8799}.cc235-core{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.cc235-core>div,.cc235-practice-grid>div{padding:12px;border:1px solid #e2e8f2;border-radius:12px;background:#fff}.cc235-core small,.cc235-practice-grid small,.cc235-pick>small,.cc235-sources>small{font-size:8px;font-weight:950;color:#62738b;letter-spacing:.04em}.cc235-core p,.cc235-practice-grid p{margin:5px 0 0;font-size:10px;line-height:1.6;color:#405570}.cc235-caution{display:flex;gap:8px;margin-top:9px;padding:10px 11px;border-radius:11px;background:#fff8e9}.cc235-caution b{font-size:9px;color:#9a6b18;white-space:nowrap}.cc235-caution span{font-size:9px;line-height:1.55;color:#735f3f}.cc235-practice{margin-top:10px;border:1px solid #e2e8f2;border-radius:12px;background:#fbfcfe;padding:0 12px 11px}.cc235-practice summary{padding:11px 0;cursor:pointer;font-size:10px;font-weight:900;color:#4f637e}.cc235-practice-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:8px}.cc235-practice-grid.locked{grid-template-columns:1fr 1fr}.cc235-lock{padding:12px;border-radius:10px;background:#f5f7fa}.cc235-lock b,.cc235-lock span{display:block}.cc235-lock b{font-size:10px;color:#40516a}.cc235-lock span{margin-top:4px;font-size:9px;color:#7d8999}.cc235-sources{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid #edf0f4}.cc235-sources a{padding:6px 8px;border:1px solid #dfe6ef;border-radius:999px;text-decoration:none;color:#4f66df;font-size:8px;font-weight:900}.cc235-sources span{font-size:8px;color:#8994a3}.cc235-flow{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:13px}.cc235-flow>div{padding:10px;border:1px solid #e2e8f2;border-radius:11px;background:#fff}.cc235-flow i{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#eef2ff;color:#5369e8;font-size:8px;font-style:normal;font-weight:950}.cc235-flow b,.cc235-flow span{display:block}.cc235-flow b{margin-top:6px;font-size:10px;color:#314b6e}.cc235-flow span{margin-top:3px;font-size:8px;line-height:1.45;color:#7a8798}.cc235-pick{margin-top:12px}.cc235-pick>div{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.cc235-pick button{border:1px solid #dce4ef;border-radius:999px;background:#fff;padding:7px 10px;color:#4c62d9;font-size:9px;font-weight:900;cursor:pointer}.cc235-how{margin-top:10px;padding:12px;border:1px solid #cfdcf7;border-radius:12px;background:#f6f9ff}.cc235-how>small{display:block;font-size:8px;font-weight:950;color:#5369e8}.cc235-how>b{display:block;margin:4px 0 8px;font-size:10px;color:#314b70}.cc235-how>div{display:grid;grid-template-columns:20px 1fr;gap:7px;align-items:center;margin-top:5px;font-size:9px;color:#50647f}.cc235-how>div span{display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#fff;color:#5268e6;font-size:8px;font-weight:950}.cc235-how button{margin-top:9px;border:0;background:transparent;color:#5067df;font-size:9px;font-weight:900;cursor:pointer;padding:0}
@media(max-width:700px){.cc235-review-card,.cc235-overview{padding:16px}.cc235-top{display:grid}.cc235-top>span{justify-self:start}.cc235-core,.cc235-practice-grid,.cc235-practice-grid.locked,.cc235-flow{grid-template-columns:1fr}.cc235-project{display:grid;gap:3px}.cc235-caution{align-items:flex-start}.cc235-flow{gap:6px}}
`;document.head.appendChild(s)}
function install(){installStyle();addExamples();window.addEventListener('click',intercept,true);window.addEventListener('keydown',intercept,true);document.addEventListener('click',e=>{if(e.target.closest('#analyze,.master-levels button,[data-drawer="how"]'))setTimeout(patchHow,260)});if($('contextResult')?.innerHTML.trim())setTimeout(patchHow,120);document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
