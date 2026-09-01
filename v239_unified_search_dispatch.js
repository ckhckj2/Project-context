(()=>{
'use strict';
const VERSION='2.1.41';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ASK=/(누구|물어|문의|담당자|질의|뭐라고\s*(?:말|물어)|확인받)/i;
const DEF=/(뭐야|뭔데|무엇|뜻|정의|어떤\s*(?:프로그램|사이트|기관|시스템|문서)|뭐하는)/i;
const BIM=/\bbim\b|revit|레빗|중앙파일|로컬파일|워크셋|workset|공유좌표|shared\s*coordinate|\bifc\b|clash|간섭검토|\bbep\b|\blod\b|패밀리|파라미터/i;
const PUBLIC=/공공건축|건축기획|사전검토|공공건축심의|설계공모|제안공모|나라장터|조달청|g2b|공공\s*발주|발주방식|입찰|과업지시서|과업내용서/i;
const GLOSSARY=/세움터|qgis|큐지아이에스|조달청|나라장터|토지이음|국가법령정보센터|법제처|지구단위계획|공공건축심의|건축심의|경관심의|bf\b|zeb\b|rfp\b|과업지시서|pm\b|감리|실시설계|ve\b|샵드로잉|레드라인|설계공모|인허가|착공신고|사용승인/i;
const SPEC=[
 ['revision',/도면\s*수정|수정\s*도면|코멘트\s*반영|의견\s*반영|지적사항\s*반영|레드라인|redline|revision/i,'도면 수정 요청받았어요'],
 ['permit-doc',/인허가\s*(?:자료|도서|서류)\s*(?:작성|정리|준비)|허가\s*(?:도서|자료|서류)|심의\s*(?:자료|도서)\s*(?:작성|정리|준비)/i,'인허가 자료 작성 요청받았어요'],
 ['precedent',/사례\s*조사|레퍼런스|reference|유사\s*사례|벤치마킹|precedent/i,'사례 조사 요청받았어요'],
 ['render',/cg|렌더링|렌더|투시도|조감도|perspective/i,'렌더링 요청받았어요'],
 ['model',/모델링|3d\s*모델|삼디\s*모델|매스\s*(?:모델|검토|짜|잡)|mass\s*(?:model|study)/i,'모델링 요청받았어요'],
 ['facade',/입면.*(?:디자|검토|계획)|파사드|facade|외관\s*디자인/i,'입면 디자인 검토 요청받았어요'],
 ['layout',/배치\s*(?:검토|계획|봐|보래|잡|짜)|대지\s*배치|동\s*배치|프로그램\s*배치/i,'배치 검토 요청받았어요'],
 ['circulation',/(?:보행|이용자|차량|주차|서비스|물류|하역|피난)?\s*동선\s*(?:검토|계획|봐|보래|정리)/i,'동선 검토 요청받았어요'],
 ['report',/보고서|보고자료|발주처\s*(?:보고|협의)\s*자료|회의\s*자료|발표\s*자료|ppt|피피티/i,'보고자료 작성 요청받았어요']
];
const COMMON=/법규\s*검토|법령\s*검토|지번|필지\s*(?:번호|경계)|건축물\s*대장|건물\s*대장|지적도|임야도|토지대장|면적표|면적\s*(?:검토|산출|계산)|주차\s*(?:대수|산정|계산|검토)|높이\s*(?:제한|검토)|최고\s*높이|고도\s*제한|qgis|큐지아이에스|도로\s*(?:검토|확인|폭)|접도|도시계획도로/i;
const REVIEW_DATA={
 building:{name:'건축심의',summary:'건축위원회 검토가 필요한 프로젝트인지 먼저 확인하고, 대상이면 관할 지자체의 심의 기준과 접수시기를 맞추는 업무예요.',first:'프로젝트 용도·규모·사업방식과 관할 지자체를 고정한 뒤, 건축심의 대상 여부와 최신 운영기준을 확인하세요.',where:'관할 지자체 건축위원회 안내·조례·운영기준 → 최신 심의도서 목차 → 회사 유사 프로젝트',who:'사내 PM/인허가 담당 → 필요한 분야 협력업체 → 관할 건축심의 담당부서',caution:'모든 건축물이 자동 대상은 아니며 지자체별 운영기준과 프로젝트 조건을 함께 봐야 합니다.'},
 landscape:{name:'경관심의',summary:'매스·스카이라인·입면·색채·외부공간이 주변 경관과 어떻게 관계하는지 검토하는 절차예요.',first:'대상지의 경관지구·중점경관관리구역 등 조건과 관할 지자체 경관조례·심의기준을 먼저 확인하세요.',where:'토지이음/도시계획 자료 → 지자체 경관조례·경관계획·심의안내 → 최신 심의도서 기준',who:'PM/디자인 책임 → 경관·외장 담당 → 관할 경관 담당부서',caution:'높이 하나만으로 대상 여부를 단정하지 말고 법정 대상과 지자체 기준을 함께 확인하세요.'},
 fire:{name:'소방 관련 심의·평가',summary:'현업에서 “소방심의”라고 묶어 부르더라도 실제로는 성능위주설계 검토·평가 등 프로젝트별 법정 절차를 구분해야 해요.',first:'용도·규모·높이·특수성을 기준으로 소방설계자와 적용 가능한 절차명을 먼저 확인하세요.',where:'소방 관련 법령·관할 소방본부/소방서 안내 → 프로젝트 소방설계 자료 → 건축·기계·전기 연계도면',who:'소방설계 협력업체 → 사내 PM/인허가 담당 → 관할 소방기관',caution:'“소방심의 대상”이라는 말만으로 시작하지 말고 실제 법정 절차명과 대상 여부부터 확인하세요.'},
 traffic:{name:'교통영향평가',summary:'사업이나 건축물이 주변 교통에 미치는 영향을 검토하고 출입·주차·도로계획의 개선사항을 정리하는 절차예요.',first:'사업유형·건축물 용도·규모·지역조건을 정리한 뒤 대상 여부를 확인하고 배치가 굳기 전에 교통 협력업체와 일정을 잡으세요.',where:'관련 법령·지자체 기준 → 배치/주차/차량출입 계획 → 주변 도로·교차로 자료',who:'교통영향평가 협력업체 → PM/토목·건축 담당 → 관할 교통 담당부서',caution:'건축물 규모 하나만으로 대상 여부를 단정하지 마세요.'},
 environment:{name:'환경영향평가 계열',summary:'전략·환경·소규모 환경영향평가는 서로 다른 절차이므로 사업 종류와 입지에 따라 어떤 체계가 적용되는지 먼저 구분해야 해요.',first:'원 승인경로, 사업 종류, 개발범위, 입지조건을 정리한 뒤 적용 가능한 환경평가 종류를 확인하세요.',where:'환경영향평가 관련 법령·관할 안내 → 사업계획/토지이용계획 → 환경 현황자료',who:'환경평가 전문업체/담당 → PM·토목 담당 → 승인기관/환경 협의기관',caution:'“환경심의”라는 한 단어로 묶지 말고 실제 절차명을 확인하세요.'},
 education:{name:'교육환경평가',summary:'학교와 교육환경에 영향을 줄 수 있는 일정한 사업에서 교육환경 조건을 검토하는 절차예요.',first:'사업유형과 대상지가 학교·교육환경보호구역과 어떤 관계인지 먼저 확인하세요.',where:'교육환경 관련 법령·교육청 안내 → 학교/보호구역 위치 → 일조·교통·소음·안전 검토자료',who:'교육환경평가 담당/전문업체 → PM → 관할 교육청',caution:'학교가 가깝다는 이유만으로 자동 대상이라고 단정하지 마세요.'},
 disaster:{name:'재해영향평가등',summary:'개발사업이 재해 위험과 방재계획에 미치는 영향을 검토하는 협의 절차예요.',first:'사업유형·개발면적·원 승인경로를 정리하고 재해영향평가등의 대상 여부를 확인하세요.',where:'자연재해 관련 법령·관할 기준 → 토지이용/배수/절성토 계획 → 방재 검토자료',who:'재해/토목 전문업체 → PM → 관할 방재 담당부서',caution:'건축허가 여부만으로 판단하지 말고 개발사업 성격과 승인경로를 함께 보세요.'},
 bf:{name:'BF 인증',summary:'장애물 없는 생활환경을 확보하기 위해 이동·접근·이용 조건을 검토하는 인증 체계예요.',first:'프로젝트가 의무 인증 대상인지와 인증 단계·일정을 먼저 확인하고, 초기 평면부터 접근성 조건을 반영하세요.',where:'BF 관련 법령·인증기관 안내 → 배치·평면·상세 → 접근성 체크리스트',who:'BF 컨설턴트/담당 → PM/건축 담당 → 인증기관',caution:'BF와 일반 장애인 편의시설 검토는 연결되지만 같은 절차로 단순화하면 안 됩니다.'},
 zeb:{name:'ZEB 인증',summary:'건축물의 에너지성능과 신재생에너지 등을 종합해 제로에너지 수준을 확인하는 인증 체계예요.',first:'프로젝트의 ZEB 적용 여부와 목표등급을 먼저 확인하고, 외피·설비·에너지 계획을 초기부터 함께 검토하세요.',where:'녹색건축 관련 법령·인증기준 → 에너지절약계획/시뮬레이션 → 건축·기계·전기 계획',who:'에너지/ZEB 컨설턴트 → PM·건축/설비 담당 → 인증기관',caution:'설계 말기에 서류만 맞추는 방식보다 초기 성능목표를 잡는 게 중요합니다.'}
};
function classify(q){
 q=String(q||'').trim();if(!q)return {id:'empty'};
 if(ASK.test(q))return {id:'ask'};
 const early=SPEC.find(([id,re])=>(id==='revision'||id==='permit-doc')&&re.test(q));if(early)return {id:'specific',kind:early[0],canonical:early[2]};
 if(/공공건축심의/i.test(q))return {id:'public'};
 if(/(?:심의|평가|인증)\s*(?:종류|전체|뭐가|무엇이)|주요\s*(?:심의|평가)/i.test(q))return {id:'review-map'};
 if(/인허가\s*실무\s*패키지|인허가\s*(?:전체|흐름|프로세스)/i.test(q))return {id:'permit-map'};
 if(/건축심의|건축위원회/i.test(q))return {id:'review-building'};
 if(/경관심의|경관위원회/i.test(q))return {id:'review-landscape'};
 if(/소방\s*(?:심의|관련|평가)|성능위주설계/i.test(q))return {id:'review-fire'};
 if(/교통영향평가/i.test(q))return {id:'review-traffic'};
 if(/환경영향평가|소규모\s*환경영향평가|전략환경영향평가/i.test(q))return {id:'review-environment'};
 if(/교육환경평가/i.test(q))return {id:'review-education'};
 if(/재해영향평가|재해영향성/i.test(q))return {id:'review-disaster'};
 if(/\bbf\b|장애물\s*없는\s*생활환경/i.test(q))return {id:'review-bf'};
 if(/\bzeb\b|제로에너지/i.test(q))return {id:'review-zeb'};
 if(BIM.test(q))return {id:'bim'};
 if(DEF.test(q)&&GLOSSARY.test(q))return {id:'glossary'};
 if(PUBLIC.test(q))return {id:'public'};
 const s=SPEC.find(([,re])=>re.test(q));if(s)return {id:'specific',kind:s[0],canonical:s[2]};
 if(COMMON.test(q))return {id:'common'};
 return {id:'fallback'};
}
function renderReview(key){const d=REVIEW_DATA[key],out=$('searchResult');if(!d||!out)return;out.innerHTML=`<div class="result-card cc241-review"><div class="label">REVIEW / APPROVAL · 척척</div><h3>${esc(d.name)}는 “대상 여부 → 일정 → 준비자료 → 반영” 순으로 보세요</h3><p>${esc(d.summary)}</p><div class="result-grid"><div class="result-cell"><small>01 · 먼저</small><p>${esc(d.first)}</p></div><div class="result-cell"><small>02 · 어디서</small><p>${esc(d.where)}</p></div><div class="result-cell"><small>03 · 누구와</small><p>${esc(d.who)}</p></div></div><div class="cc21-note"><b>주의</b><span>${esc(d.caution)}</span></div></div>`;}
function renderReviewMap(){const out=$('searchResult');if(!out)return;const items=[['건축심의','건축심의는 언제 확인해?'],['경관심의','경관심의는 언제 확인해?'],['소방 관련','소방 관련 심의는 어떻게 봐?'],['교통영향','교통영향평가는 뭐부터 확인해?'],['환경','환경영향평가는 어떻게 확인해?'],['교육환경','교육환경평가는 어떻게 확인해?'],['재해영향','재해영향평가는 어떻게 확인해?'],['BF','BF 인증은 어떻게 확인해?'],['ZEB','ZEB 인증은 어떻게 확인해?']];out.innerHTML=`<div class="result-card cc241-review"><div class="label">REVIEW MAP · 척척</div><h3>심의·평가는 먼저 “우리 프로젝트에 적용되는지”부터 좁혀보세요</h3><p>건축·경관·소방·교통·환경·교육환경·재해·BF·ZEB는 서로 다른 법정 체계와 담당기관을 가질 수 있어 한 번에 모두 대상이라고 보면 안 됩니다.</p><div class="cc241-picks">${items.map(([t,q])=>`<button type="button" data-cc241-query="${esc(q)}">${esc(t)} <span>→</span></button>`).join('')}</div></div>`;}
function renderPermitMap(){const out=$('searchResult');if(!out)return;out.innerHTML=`<div class="result-card cc241-review"><div class="label">LV.3 · PERMIT PRACTICE</div><h3>인허가 업무는 제출목록보다 “원 승인경로”부터 확인하세요</h3><p>같은 건축물이라도 일반 건축허가, 주택·정비사업, 공항·물류 등 사업방식에 따라 승인경로와 후속 절차가 달라질 수 있습니다.</p><div class="result-grid"><div class="result-cell"><small>01 · 원 승인경로</small><p>기존 허가/승인 문서와 사업방식을 확인해 이 프로젝트가 어떤 절차로 승인되는지 먼저 고정합니다.</p></div><div class="result-cell"><small>02 · 현재 단계</small><p>심의·평가 → 허가/승인 → 착공 → 사용승인/사용검사 → 변경 중 어디인지 확인합니다.</p></div><div class="result-cell"><small>03 · 담당/자료</small><p>건축·구조·기계·전기·소방·토목 등 자료를 담당별로 나누고 제출본의 기준일을 맞춥니다.</p></div></div><div class="cc241-picks"><button data-cc241-query="심의 종류가 뭐가 있어?">심의·평가 지도 →</button><button data-cc241-query="건축심의는 언제 확인해?">건축심의 →</button><button data-cc241-query="경관심의는 언제 확인해?">경관심의 →</button><button data-cc241-query="소방 관련 심의는 어떻게 봐?">소방 관련 →</button></div><div class="cc21-note"><b>세움터</b><span>세움터가 필요한 업무인지도 원 승인경로와 현재 단계 기준으로 확인하고, 모든 프로젝트에 동일한 제출목록을 적용하지 않습니다.</span></div></div>`;}
function runLegacy(original,canonical){const input=$('searchInput');if(!input||typeof window.runSearch!=='function')return;const keep=input.value;input.value=canonical||original;try{window.runSearch();}finally{input.value=keep||original;}}
function unifiedRun(q){q=String(q??$('searchInput')?.value??'').trim();if(!q)return;const r=classify(q);if(r.id.startsWith('review-'))return renderReview(r.id.replace('review-',''));if(r.id==='review-map')return renderReviewMap();if(r.id==='permit-map')return renderPermitMap();if(r.id==='specific')return runLegacy(q,r.canonical);return runLegacy(q,q);}
function eventQuery(e){const t=e.target;if(e.type==='click'&&t.closest?.('#searchGo'))return {q:$('searchInput')?.value||'',home:false};if(e.type==='keydown'&&e.key==='Enter'&&t.id==='searchInput')return {q:t.value||'',home:false};if(e.type==='click'&&t.closest?.('#homeSearchBtn'))return {q:$('homeSearch')?.value||'',home:true};if(e.type==='keydown'&&e.key==='Enter'&&t.id==='homeSearch')return {q:t.value||'',home:true};if(e.type==='click'){const custom=t.closest?.('[data-cc241-query]');if(custom)return {q:custom.dataset.cc241Query||'',home:false};const ex=t.closest?.('#view-home [data-example],#view-search .caps [data-example],#view-search .examples [data-example]');if(ex)return {q:ex.dataset.example||'',home:!!ex.closest('#view-home')};}return null;}
function capture(e){const hit=eventQuery(e);if(!hit||!String(hit.q).trim())return;e.preventDefault();e.stopImmediatePropagation();if(hit.home&&typeof window.showView==='function')window.showView('search');const input=$('searchInput');if(input)input.value=hit.q;unifiedRun(hit.q);}
function style(){if($('cc241Style'))return;const s=document.createElement('style');s.id='cc241Style';s.textContent=`.cc241-picks{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.cc241-picks button{border:1px solid #dce4f1;background:#fff;border-radius:999px;padding:9px 12px;font-weight:850;color:#39557a;cursor:pointer}.cc241-picks span{color:#5570ee}.cc241-review .cc21-note{margin-top:12px}`;document.head.appendChild(s);}
function install(){window.ccSearchRouterClassify=q=>classify(q).id+(classify(q).kind?':'+classify(q).kind:'');window.addEventListener('click',capture,true);window.addEventListener('keydown',capture,true);style();document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();