(()=>{
'use strict';
const VERSION='2.1.44';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const CHANGE=/(변경\s*(?:업무|허가|신고|승인|인가)|(?:허가|신고|승인|인가|인허가)\s*(?:사항\s*)?변경|사업계획\s*변경|사업시행계획\s*변경|실시계획\s*변경|공장설립[^\n]*변경|설계변경[^\n]*(?:허가|신고|승인|인가|인허가|행정|절차)|경미한\s*변경)/i;
const EXCLUDE=/용도\s*변경/i;
const WHO_ONLY=/(누구에게|누구한테|어디에\s*물어|뭐라고\s*(?:말|물어)|문의하면)/i;
const COMPARE=/(?:차이|비교|vs\.?|다른\s*점|어떻게\s*달라|뭐가\s*달라|둘\s*중)/i;

const SOURCES={
  building:['건축법 제16조 · 국가법령정보센터','https://www.law.go.kr/LSW/lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1026847027'],
  housing:['주택법 · 국가법령정보센터','https://www.law.go.kr/LSW/lsInfoP.do?lsId=001809'],
  renewal:['도시 및 주거환경정비법 제50조 · 국가법령정보센터','https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsId=009410&lsJoLnkSeq=1000999691&print=print'],
  airport:['공항시설법 · 국가법령정보센터','https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=205833'],
  logistics:['물류시설의 개발 및 운영에 관한 법률 제28조 · 국가법령정보센터','https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsId=000091&lsJoLnkSeq=1000262046&print=print'],
  industry:['산업집적활성화 및 공장설립에 관한 법률 제13조 · 국가법령정보센터','https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsId=001463&lsJoLnkSeq=900386495&print=print']
};

const GUIDES={
  building:{
    tag:'건축법 · 허가/신고사항 변경',
    classification:'인허가 실무 · 승인 후 변경관리',
    title:'변경허가·변경신고는 도면수정이 아니라 승인 후 변경관리 절차예요',
    summary:'기존 승인도서와 달라지는 설계를 합법적인 승인도서로 다시 연결하는 업무예요. 변경허가·변경신고·경미한 변경·사용승인 시 일괄신고 가능성을 변경 전에 구분합니다.',
    steps:[
      ['원 승인경로·기준본 고정','건축허가인지 건축신고인지 확인하고, 허가서·신고필증·승인도서·조건·협의의견 중 현재 유효한 기준본을 고정합니다.'],
      ['변경비교표 작성','배치·면적·높이·용도·구조·주차·피난·입면 등 바뀐 항목을 기존/변경으로 나누고 영향도서를 연결합니다.'],
      ['처리유형·선행시점 확인','변경의 종류와 면적 등 시행령 기준을 대조해 변경허가·변경신고·경미한 변경·일괄신고 중 무엇인지 사내 검토 후 허가권자와 확인합니다.']
    ],
    more:[
      ['연쇄 영향 확인','최초 허가 때 의제·협의된 소방, 구조, 개발행위, 도로, 경관 등 조건이 다시 영향을 받는지 확인합니다.'],
      ['도서·일정 동기화','건축과 협력분야의 기준일을 맞추고 변경절차 완료 전에 시공하거나 발주하면 안 되는 범위를 PM과 정리합니다.']
    ],
    caution:'“변경량이 작다”는 이유만으로 경미한 변경이라고 판단하지 마세요. 적용 조항과 허가권자 확인 없이 사용승인 때 처리할 수 있다고 단정해서도 안 됩니다.',
    source:'building'
  },
  housing:{
    tag:'주택법 · 사업계획 변경',
    title:'주택사업 변경은 건축허가 변경이 아니라 원 사업계획승인과 비교해야 해요',
    summary:'주택법상 승인받은 사업계획을 변경하면 원칙적으로 변경승인 여부를 검토하고, 법령상 경미한 사항인지와 입주자모집 이후 제한·동의 문제까지 함께 확인해야 해요.',
    steps:[
      ['원 사업계획승인 고정','사업계획승인서·승인도서·승인조건과 이후 변경승인 이력을 시간순으로 정리합니다.'],
      ['변경 영향 분해','세대수·주택형·면적·배치·동수·부대복리시설·사업주체·기간 등 달라진 항목과 계약·분양 영향을 구분합니다.'],
      ['변경승인/신고 경로 확인','주택법·시행령·시행규칙의 최신 기준과 승인권자 안내로 변경승인인지 경미한 사항 신고인지 확인합니다.']
    ],
    more:[
      ['이해관계 절차 확인','입주자모집 시점과 분양계약 내용에 따라 동의·통보·변경 제한이 연결되는지 사업주체·법무·PM과 확인합니다.'],
      ['승인도서 재동기화','건축·구조·기계·전기·소방·토목·조경 변경본과 사업계획 변경내용 증명자료의 기준일을 맞춥니다.']
    ],
    caution:'공동주택이라고 모두 주택법 사업계획승인 경로인 것은 아닙니다. 최초 승인 문서가 건축허가라면 건축법 경로부터 확인하세요.',
    source:'housing'
  },
  renewal:{
    tag:'정비사업 · 사업시행계획인가 변경',
    title:'정비사업 변경은 건축도면뿐 아니라 인가계획·조합절차까지 같이 움직여요',
    summary:'인가받은 사업시행계획을 변경하려면 변경인가 또는 경미한 변경신고 여부를 검토하고, 총회 의결 등 사업 내부 절차와 관리처분계획 영향도 함께 확인해야 해요.',
    steps:[
      ['원 인가와 변경이력 고정','사업시행계획인가서·인가도서·조건·고시·기존 변경인가/신고 이력을 한 기준선으로 정리합니다.'],
      ['변경 범위와 후속계획 비교','배치·세대·면적·정비기반시설·사업비·기간 등 변경이 사업시행계획과 관리처분계획에 미치는 영향을 표시합니다.'],
      ['변경인가/신고와 내부절차 확인','경미한 변경 해당 여부, 총회 의결·공람·고시 등 필요한 절차를 조합·정비사업 담당·인가권자 기준으로 확인합니다.']
    ],
    more:[
      ['관계부서 재협의 확인','기존 인가에서 의제되거나 협의된 각종 인허가·심의 조건 중 다시 협의할 항목을 추적합니다.'],
      ['인가 후 반영 관리','변경인가/신고 결과를 설계도서·사업비·분양자료·관리처분·시공도서에 어디까지 반영할지 담당자를 지정합니다.']
    ],
    caution:'정비계획 변경, 사업시행계획인가 변경, 관리처분계획 변경은 같은 절차가 아닙니다. 현재 무엇을 변경하는지 먼저 구분하세요.',
    source:'renewal'
  },
  airport:{
    tag:'특별법 · 공항시설 실시계획 변경',
    title:'공항사업 변경은 건축허가보다 기존 실시계획 승인 범위를 먼저 봐야 해요',
    summary:'공항시설법상 실시계획으로 승인된 사업이라면 변경승인 대상과 경미한 변경 여부, 기존 협의·고시·의제사항의 재검토 범위를 먼저 확인해야 해요.',
    steps:[
      ['실시계획 승인범위 확인','시행허가·실시계획 승인서, 고시, 승인도서, 조건과 사업시행자를 확인해 건축물이 어느 승인범위에 포함됐는지 봅니다.'],
      ['변경 전후 영향표 작성','시설 위치·규모·용도·사업기간·토지·공항운영·안전 관련 조건과 변경 도서를 연결합니다.'],
      ['변경승인 경로 사전협의','공항시설법상 변경승인/경미한 변경 가능성과 관계기관 재협의 범위를 사업 PM·인허가 담당·관할 항공청 기준으로 확인합니다.']
    ],
    more:[
      ['의제·협의 추적','최초 실시계획에서 함께 처리된 건축·소방·환경·교통·군/항공 안전 등 협의조건의 재검토 필요성을 확인합니다.'],
      ['고시·후속도서 반영','변경승인 후 고시, 승인조건, 실시설계·시공도서·공정표에 변경사항이 이어지는지 추적합니다.']
    ],
    caution:'공항 안에 있는 건축물이라고 모두 같은 변경절차를 쓰는 것은 아닙니다. 해당 시설이 어느 시행허가·실시계획에 포함됐는지부터 확인하세요.',
    source:'airport'
  },
  logistics:{
    tag:'특별법 · 물류시설/물류단지 변경',
    title:'물류시설 변경은 “물류창고”라는 시설명만으로 절차를 정할 수 없어요',
    summary:'일반 건축허가 대상 물류창고인지, 물류단지계획·물류단지개발실시계획으로 승인된 사업인지에 따라 변경 경로가 달라져요.',
    steps:[
      ['원 승인문서 식별','건축허가서인지 물류단지계획·개발실시계획 승인서인지, 또는 다른 개발사업 승인인지 먼저 확인합니다.'],
      ['변경이 닿는 승인층 구분','건축물 자체, 토지이용계획, 기반시설, 사업시행자, 사업기간 중 무엇이 달라지는지 나눕니다.'],
      ['해당 승인권자 경로 확인','건축허가 변경인지 물류단지계획/실시계획 변경승인인지, 중요·경미 변경 구분과 재협의 범위를 확인합니다.']
    ],
    more:[
      ['의제사항 영향 확인','개발실시계획에서 의제된 도시계획·개발행위·농지·산지·건축 등 인허가가 다시 영향을 받는지 확인합니다.'],
      ['단지와 건축도서 동기화','단지계획·토목·기반시설 자료와 건축·구조·설비 도서의 기준일 및 변경범위를 맞춥니다.']
    ],
    caution:'물류센터라는 용도만 보고 물류시설법을 적용하지 마세요. 최초 승인 경로가 일반 건축허가일 수도 있습니다.',
    source:'logistics'
  },
  industry:{
    tag:'특별법 · 산업단지/공장설립 변경',
    title:'산업시설 변경은 산업단지계획·공장설립승인·건축허가를 층별로 나눠 봐야 해요',
    summary:'산업단지 개발·실시계획, 입주계약, 공장설립승인, 건축허가가 함께 존재할 수 있으므로 이번 변경이 어느 승인층에 영향을 주는지 먼저 구분해야 해요.',
    steps:[
      ['승인 레이어 목록화','산업단지계획/실시계획, 입주계약, 공장설립승인, 건축허가 중 실제로 받은 문서를 시간순으로 정리합니다.'],
      ['변경 항목을 승인별 연결','부지·업종·공장/부대시설 면적·배치·기반시설·사업기간 변경이 어느 승인서와 도서에 걸리는지 표시합니다.'],
      ['변경승인/신고 조합 확인','산업단지 지정권자·관리기관·공장설립 승인권자·건축허가권자별로 필요한 변경절차와 선후행 관계를 확인합니다.']
    ],
    more:[
      ['입주·업종 조건 검토','산업단지 관리기본계획과 입주계약, 업종 제한이 변경계획과 맞는지 관리기관과 확인합니다.'],
      ['중복 제출 방지','각 승인에서 공통으로 쓰는 건축·토목·설비 자료의 기준본을 하나로 관리하고 기관별 요구형식만 분리합니다.']
    ],
    caution:'공장설립 변경승인을 받으면 모든 건축 변경절차가 자동으로 끝난다고 단정하지 마세요. 의제 범위와 개별 승인 관계를 확인해야 합니다.',
    source:'industry'
  }
};

function classify(q){
  q=String(q||'').trim();
  if(!q||!CHANGE.test(q)||EXCLUDE.test(q)||WHO_ONLY.test(q)||COMPARE.test(q))return null;
  if(/정비사업|재개발|재건축|사업시행계획/i.test(q))return 'renewal';
  if(/주택법|사업계획\s*(?:승인)?\s*변경|공동주택\s*사업계획/i.test(q))return 'housing';
  if(/공항|비행장|항공.*실시계획/i.test(q))return 'airport';
  if(/물류단지|물류시설|물류창고|물류센터/i.test(q))return 'logistics';
  if(/산업단지|산업시설|공장설립|공장\s*(?:신설|증설)|산집법/i.test(q))return 'industry';
  if(/건축\s*(?:허가|신고)|변경\s*(?:허가|신고)|허가사항|신고사항/i.test(q))return 'building';
  if(/특별법|실시계획/i.test(q))return 'special';
  return 'overview';
}
function contextText(){
  return [$('#project')?.selectedOptions?.[0]?.textContent,$('#phase')?.selectedOptions?.[0]?.textContent].filter(x=>x&&x!=='잘 모르겠습니다').join(' · ');
}
function routeButtons(items){
  return items.map(([key,title,sub])=>`<button type="button" data-cc243-route="${key}"><b>${esc(title)}</b><span>${esc(sub)}</span><em>→</em></button>`).join('');
}
function renderChooser(special=false){
  const out=$('searchResult');if(!out)return false;
  const items=special?[
    ['airport','공항·비행장','시행허가·실시계획 승인'],
    ['logistics','물류시설·물류단지','건축허가 또는 단지계획·실시계획'],
    ['industry','산업단지·공장','단지계획·공장설립·건축허가']
  ]:[
    ['building','건축허가·건축신고','건축법상 허가·신고사항'],
    ['housing','주택법 사업계획승인','주택건설사업 사업계획'],
    ['renewal','정비사업','사업시행계획인가'],
    ['special','특별법·개발사업','공항·물류·산업시설'],
    ['unknown','잘 모르겠어요','기존 승인서부터 찾기']
  ];
  out.innerHTML=`<div class="result-card cc243-chooser" data-cc221="1"><div class="label">CHANGE ROUTE · 척척</div><h3>${special?'어떤 특별법·개발사업의 변경인가요?':'변경업무는 원래 어떤 절차로 승인받았는지부터 골라주세요'}</h3><p>${special?'시설명보다 기존 실시계획·단지계획·승인서의 법적 근거가 기준입니다.':'같은 도면 변경도 건축허가, 주택법, 정비사업, 특별법 사업에 따라 절차가 달라져요.'}</p><div class="cc243-routes">${routeButtons(items)}</div></div>`;
  out.querySelectorAll('[data-cc243-route]').forEach(b=>b.addEventListener('click',()=>selectRoute(b.dataset.cc243Route)));
  return true;
}
function renderUnknown(){
  const out=$('searchResult');if(!out)return;
  out.innerHTML=`<div class="result-card cc243-card" data-cc221="1"><div class="label">CHANGE ROUTE · 척척</div><h3>변경 판단 전에 기존 승인서 한 장부터 찾으세요</h3><p>문서 제목과 승인기관을 확인하면 변경업무의 출발 법령을 좁힐 수 있어요.</p><div class="cc243-steps"><div><em>1</em><section><b>문서 제목</b><p>건축허가서·사업계획승인서·사업시행계획인가서·실시계획승인서 중 무엇인지 확인합니다.</p></section></div><div><em>2</em><section><b>근거법과 승인기관</b><p>승인서에 적힌 법률명, 조문, 승인기관, 승인일과 고시 여부를 표시합니다.</p></section></div><div><em>3</em><section><b>변경내용 한 줄</b><p>무엇이 기존 승인내용과 달라지는지 적어 PM/인허가 담당에게 원 경로부터 확인받습니다.</p></section></div></div><div class="cc243-done"><small>다음 단계</small><b>원 승인경로가 확인되면 해당 변경 가이드로 돌아오세요.</b></div></div>`;
}
function selectRoute(key){
  if(key==='special')return renderChooser(true);
  if(key==='unknown')return renderUnknown();
  return renderGuide(key);
}
function renderGuide(key){
  const d=GUIDES[key],out=$('searchResult');if(!d||!out)return false;
  const ctx=contextText(),source=SOURCES[d.source];
  out.innerHTML=`<div class="result-card cc243-card" data-cc221="1" data-cc243-guide="${esc(key)}"><div class="label">CHANGE HOW · LV3 · 척척</div><h3>${esc(d.title)}</h3>${ctx?`<div class="cc243-context">현재 선택 · ${esc(ctx)}</div>`:''}${d.classification?`<div class="cc243-classification">업무 분류 · ${esc(d.classification)}</div>`:''}<div class="cc243-tag">${esc(d.tag)}</div><p class="cc243-summary">${esc(d.summary)}</p><div class="cc243-steps"><small>지금 할 일</small>${d.steps.map(([t,b],i)=>`<div><em>${i+1}</em><section><b>${esc(t)}</b><p>${esc(b)}</p></section></div>`).join('')}</div><div class="cc243-done"><small>변경비교표 최소 항목</small><b>변경항목 · 기존 승인내용 · 변경내용 · 영향도서 · 협의대상 · 절차판단 · 처리시점</b></div><div class="cc243-more"><div class="cc243-more-steps">${d.more.map(([t,b],i)=>`<div><em>${i+4}</em><section><b>${esc(t)}</b><p>${esc(b)}</p></section></div>`).join('')}</div><div class="cc243-caution"><b>주의</b><span>${esc(d.caution)}</span></div><a class="cc243-source" href="${esc(source[1])}" target="_blank" rel="noopener noreferrer">${esc(source[0])} ↗</a></div><div class="cc243-switch"><small>다른 승인경로 보기</small><button data-cc243-back>승인경로 다시 선택</button></div></div>`;
  out.querySelector('[data-cc243-back]')?.addEventListener('click',()=>renderChooser(false));
  return true;
}
function renderQuery(q){
  const kind=classify(q);
  if(!kind)return false;
  if(kind==='overview')return renderChooser(false);
  if(kind==='special')return renderChooser(true);
  return renderGuide(kind);
}
function queryFromEvent(e){
  const t=e.target;
  if(e.type==='keydown'&&e.key==='Enter'&&(t.id==='searchInput'||t.id==='homeSearch'))return t.value||'';
  if(e.type==='click'){
    if(t.closest('#searchGo'))return $('searchInput')?.value||'';
    if(t.closest('#homeSearchBtn'))return $('homeSearch')?.value||'';
    const ex=t.closest('[data-example]');if(ex)return ex.dataset.example||'';
  }
  return '';
}
function intercept(e){
  const q=queryFromEvent(e);
  if(!q||!classify(q))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.target?.id==='homeSearch'||e.target?.closest?.('#homeSearchBtn')||e.target?.closest?.('[data-example]')){
    if(typeof window.showView==='function')window.showView('search');
    if($('searchInput'))$('searchInput').value=q;
  }
  renderQuery(q);
}
function installStyle(){
  if($('#cc243Style'))return;
  const s=document.createElement('style');s.id='cc243Style';s.textContent=`
  .cc243-chooser .cc242-toggle{display:none!important}.cc243-chooser>p{max-width:760px;color:#63738A;font-size:11.5px;line-height:1.6}.cc243-routes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:14px}.cc243-routes button{position:relative;display:grid;gap:4px;padding:13px 38px 13px 14px;border:1px solid #E0E7F1;border-radius:12px;background:#fff;text-align:left;cursor:pointer}.cc243-routes button:hover{border-color:#AEC5EF;background:#F6F9FF}.cc243-routes b{color:#334B6B;font-size:11.5px}.cc243-routes span{color:#77869A;font-size:9.5px;line-height:1.4}.cc243-routes em{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#3A69C3;font-style:normal;font-weight:950}
  .cc243-tag,.cc243-context,.cc243-classification{display:inline-block;margin:0 6px 9px 0;padding:5px 8px;border-radius:999px;background:#F1F5FB;color:#65758B;font-size:9px;font-weight:900}.cc243-classification{background:#EEF7F1;color:#44745A}.cc243-summary{margin:0 0 12px;color:#5D6F88;font-size:11.5px;line-height:1.6}.cc243-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.cc243-steps>small{grid-column:1/-1;color:#78879B;font-size:9px;font-weight:950}.cc243-steps>div,.cc243-more-steps>div{display:grid;grid-template-columns:25px 1fr;gap:8px;padding:10px 11px;border:1px solid #E1E7F1;border-radius:11px;background:#fff}.cc243-steps em,.cc243-more-steps em{display:grid;place-items:center;width:23px;height:23px;border-radius:50%;background:#EAF2FF;color:#3166CE;font-size:9px;font-style:normal;font-weight:950}.cc243-steps section b,.cc243-more-steps section b{display:block;color:#344A68;font-size:11.5px}.cc243-steps section p,.cc243-more-steps section p{margin:4px 0 0;color:#687991;font-size:10px;line-height:1.5}
  .cc243-card:not(.cc242-expanded) .cc243-steps section p{display:none}.cc243-card:not(.cc242-expanded) .cc243-more{display:none}.cc243-done{margin-top:9px;padding:10px 12px;border:1px solid #D8EBDD;border-radius:11px;background:#F4FAF6}.cc243-done small{display:block;margin-bottom:3px;color:#538069;font-size:9px;font-weight:950}.cc243-done b{color:#365F49;font-size:10.5px;line-height:1.5}.cc243-more{margin-top:9px}.cc243-more-steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.cc243-caution{display:flex;gap:9px;margin-top:8px;padding:10px 11px;border-radius:11px;background:#FFF9F2;border:1px solid #F1E4D3}.cc243-caution b{color:#90602A;font-size:9.5px}.cc243-caution span{color:#756553;font-size:10px;line-height:1.5}.cc243-source{display:inline-block;margin-top:8px;color:#3767BE;font-size:9.5px;font-weight:850;text-decoration:none}.cc243-switch{display:flex;align-items:center;gap:8px;margin-top:10px}.cc243-switch small{color:#7B899C;font-size:9px;font-weight:900}.cc243-switch button{padding:7px 9px;border:1px solid #DDE5F0;border-radius:999px;background:#fff;color:#506680;font-size:9.5px;font-weight:900}
  @media(max-width:800px){.cc243-routes,.cc243-steps,.cc243-more-steps{grid-template-columns:1fr}.cc243-steps>small{grid-column:auto}.cc243-card:not(.cc242-expanded) .cc243-steps>div:nth-child(n+3){display:none}.cc243-switch{align-items:flex-start;flex-direction:column}}
  `;document.head.appendChild(s);
}
function install(){
  installStyle();
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  const previous=window.runSearch;
  window.runSearch=function(){const q=$('searchInput')?.value.trim()||'';if(!renderQuery(q)&&typeof previous==='function')return previous();};
  window.addEventListener('click',intercept,true);
  window.addEventListener('keydown',intercept,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
