(()=>{
'use strict';
const VERSION='2.1.46';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const COMPARE=/(?:차이|비교|vs\.?|다른\s*점|어떻게\s*달라|뭐가\s*달라|구분해|둘\s*중)/i;

const SOURCES={
  act16:['건축법 제16조','https://law.go.kr/LSW/lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1026847027'],
  decree12:['건축법 시행령 제12조','https://www.law.go.kr/LSW/lumLsLinkPop.do?lspttninfSeq=105443'],
  act11:['건축법 제11조','https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=900055356'],
  act14:['건축법 제14조','https://www.law.go.kr/LSW/lsLinkProc.do?chrClsCd=010202&joLnkStr=%EC%A0%9C14%EC%A1%B0%EC%A0%9C1%ED%95%AD&joNo=001400000&lsId=001823&lsNm=%EA%B1%B4%EC%B6%95%EB%B2%95&mode=2&print=print'],
  review:['건축법 제4조의2','https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000559812']
};

const PAIRS=[
  {
    key:'change-permit-report',terms:[/변경\s*허가/i,/변경\s*신고/i],
    left:'변경허가',right:'변경신고',
    title:'둘 다 승인 후 변경관리지만, 변경의 종류와 범위에 따라 처리 강도가 달라요',
    one:['허가권자의 허가를 받은 뒤 변경','관할 행정청에 변경내용을 신고'],
    rows:[
      ['기본 의미','변경 전에 다시 허가받는 절차','변경 전에 신고하는 절차'],
      ['대표 기준','신축·증축·개축에 해당하는 변경 부분의 바닥면적 합계가 85㎡ 초과','그 밖의 경우. 다만 신고대상 건축물 등 별도 예외 확인'],
      ['먼저 확인','기존 승인도서, 변경 종류·부분·면적','기존 승인도서, 변경 종류·부분·면적']
    ],
    first:'원래 승인받은 도서와 변경안을 겹쳐 배치·면적·높이·층수·위치·용도·구조의 차이를 표로 만드세요.',
    caution:'“큰 변경=허가, 작은 변경=신고”만으로 판단하면 안 됩니다. 변경신고, 경미한 변경, 사용승인 시 일괄신고는 서로 다른 처리유형이에요.',
    sources:['act16','decree12']
  },
  {
    key:'report-minor',terms:[/변경\s*신고/i,/경미한\s*변경/i],
    left:'변경신고',right:'경미한 변경',
    title:'변경신고는 신고가 필요하고, 경미한 변경은 건축법 제16조상 허가·신고 예외예요',
    one:['변경 전 신고 대상','제16조상 변경허가·신고 예외'],
    rows:[
      ['행정처리','변경신고 필요','제16조에 따른 변경허가·신고 불필요'],
      ['법령상 구분','시행령 제12조제1항의 신고 대상','신축·증축·개축·재축·이전·대수선·용도변경에 해당하지 않는 변경'],
      ['주의','일괄신고와도 별개','다른 법령·협의·도서반영까지 면제된다는 뜻은 아님']
    ],
    first:'변경 내용이 법령상 건축행위·대수선·용도변경에 해당하는지부터 확인하세요.',
    caution:'현장에서 변경량이 작아 보인다는 이유만으로 “경미한 변경”이라고 부르면 안 됩니다.',
    sources:['act16','decree12']
  },
  {
    key:'report-batch',terms:[/변경\s*신고/i,/(?:일괄\s*신고|사용\s*승인[^\n]*신고)/i],
    left:'변경신고',right:'사용승인 때 일괄신고',
    title:'차이는 신고 여부가 아니라 신고 시점과 적용 가능한 범위예요',
    one:['원칙적으로 변경 전에 신고','법정 요건 충족 시 사용승인 때 모아 신고'],
    rows:[
      ['처리시점','변경 전에 처리','사용승인 신청 때 처리 가능'],
      ['적용범위','시행령상 변경신고 대상','시행령 제12조제3항에 열거된 범위만'],
      ['실무판단','변경안 시행 전 절차 확정','요건·누적변경·관련 협의 영향 확인']
    ],
    first:'면적뿐 아니라 동수·층수·높이·위치와 대규모 건축물 제한을 함께 대조하세요.',
    caution:'“나중에 준공 때 처리하면 된다”는 관행만 믿지 말고 적용 조항과 허가권자 확인을 남기세요.',
    sources:['act16','decree12']
  },
  {
    key:'building-permit-report',terms:[/건축\s*허가/i,/건축\s*신고/i],
    left:'건축허가',right:'건축신고',
    title:'건축허가가 원칙이고, 법에서 정한 일정 범위는 신고로 허가를 갈음해요',
    one:['허가권자의 허가','법정 대상은 신고로 허가 갈음'],
    rows:[
      ['법적 구조','건축·대수선의 원칙적 절차','건축법 제14조 각 호에 해당할 때 적용'],
      ['처리방식','신청 후 허가','미리 신고하면 건축허가를 받은 것으로 봄'],
      ['먼저 확인','용도·규모·층수·지역·건축행위','제14조 대상과 제외구역·추가조건']
    ],
    first:'프로젝트의 위치, 용도, 규모, 층수와 신축·증축·개축 등 건축행위를 먼저 고정하세요.',
    caution:'신청자가 편한 방식을 선택하는 제도가 아닙니다. 법정 요건으로 경로가 결정돼요.',
    sources:['act11','act14']
  },
  {
    key:'review-permit',terms:[/건축\s*심의/i,/건축\s*허가/i],
    left:'건축심의',right:'건축허가',
    title:'심의는 위원회의 검토이고, 허가는 공사를 위한 행정적 승인 절차예요',
    one:['위원회가 계획의 쟁점을 검토','허가권자가 법정 요건을 확인해 허가'],
    rows:[
      ['목적','대상 건축계획의 전문적 검토','건축행위의 법적 승인'],
      ['관계','대상 프로젝트에서는 허가 전 선행 가능','필요한 심의결과와 관계법령을 반영해 처리'],
      ['결과','심의의결·조건·보완사항','건축허가서·허가조건·승인도서']
    ],
    first:'프로젝트가 건축심의 대상인지와 심의가 허가 전 어느 시점에 필요한지 관할 기준으로 확인하세요.',
    caution:'심의를 통과했다고 건축허가까지 받은 것은 아니며, 심의대상은 법령·조례·프로젝트 조건에 따라 달라집니다.',
    sources:['review','act11']
  },
  {
    key:'building-landscape-review',terms:[/건축\s*심의/i,/경관\s*심의/i],
    left:'건축심의',right:'경관심의',
    title:'검토하는 위원회와 핵심 관점이 달라요',
    one:['건축위원회 · 건축계획과 법정 쟁점','경관위원회 · 주변 경관과의 조화'],
    rows:[
      ['주요 관점','건축계획·안전·피난·교통 등 해당 안건','배치·스카이라인·입면·색채·외부공간'],
      ['근거','건축법·건축조례 등','경관법·경관조례·경관계획 등'],
      ['실무','대상·시기·도서목차 확인','경관구역·대상·시기·표현자료 확인']
    ],
    first:'두 심의의 대상 여부와 접수 순서, 공동심의 가능 여부를 관할 지자체 기준으로 확인하세요.',
    caution:'둘 중 하나를 받으면 다른 하나가 자동 면제된다고 단정하면 안 됩니다.',
    sources:['review']
  }
];

function comparison(q){
  q=String(q||'').trim();
  if(!q||!COMPARE.test(q))return null;
  return PAIRS.find(p=>p.terms.every(re=>re.test(q)))||{key:'unknown'};
}
function links(keys){
  return keys.map(k=>SOURCES[k]).filter(Boolean).map(([name,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a>`).join('');
}
function renderPair(d){
  const out=$('searchResult');if(!out)return false;
  out.innerHTML=`<div class="result-card cc245-card" data-cc221="1"><div class="label">COMPARE · 척척</div><h3>${esc(d.title)}</h3><div class="cc245-head"><div><small>${esc(d.left)}</small><b>${esc(d.one[0])}</b></div><em>VS</em><div><small>${esc(d.right)}</small><b>${esc(d.one[1])}</b></div></div><div class="cc245-table"><div class="cc245-tr cc245-th"><span>구분</span><span>${esc(d.left)}</span><span>${esc(d.right)}</span></div>${d.rows.map(r=>`<div class="cc245-tr"><b>${esc(r[0])}</b><span>${esc(r[1])}</span><span>${esc(r[2])}</span></div>`).join('')}</div><div class="cc245-first"><small>먼저 확인</small><b>${esc(d.first)}</b></div><div class="cc245-more"><div class="cc245-caution"><b>주의</b><span>${esc(d.caution)}</span></div><div class="cc245-sources">${links(d.sources)}</div></div><div class="cc245-suggest"><small>다른 비교</small><button data-cc245-query="변경신고와 경미한 변경의 차이가 뭐야?">변경신고 vs 경미한 변경</button><button data-cc245-query="건축허가와 건축신고의 차이가 뭐야?">건축허가 vs 건축신고</button></div></div>`;
  wire(out);return true;
}
function renderUnknown(){
  const out=$('searchResult');if(!out)return false;
  out.innerHTML=`<div class="result-card cc245-card cc245-unknown" data-cc221="1"><div class="label">COMPARE · 척척</div><h3>비교 질문은 인식했지만, 아직 검증된 비교 조합이 아니에요</h3><p>관련 없는 일반 답변을 만들지 않고 비교할 두 용어를 다시 좁힐게요.</p><div class="cc245-known"><button data-cc245-query="변경허가와 변경신고의 차이가 뭐야?">변경허가 vs 변경신고</button><button data-cc245-query="변경신고와 경미한 변경의 차이가 뭐야?">변경신고 vs 경미한 변경</button><button data-cc245-query="건축허가와 건축신고의 차이가 뭐야?">건축허가 vs 건축신고</button><button data-cc245-query="건축심의와 경관심의의 차이가 뭐야?">건축심의 vs 경관심의</button></div><div class="cc245-caution"><b>답변 원칙</b><span>법적 기준이 다른 용어는 정의·판단기준·처리시점·실무 출발점을 확인한 조합부터 제공합니다.</span></div></div>`;
  wire(out);return true;
}
function wire(root){
  root.querySelectorAll('[data-cc245-query]').forEach(b=>b.addEventListener('click',()=>{
    const q=b.dataset.cc245Query;if($('searchInput'))$('searchInput').value=q;render(q);
  }));
}
function render(q){const d=comparison(q);return !d?false:d.key==='unknown'?renderUnknown():renderPair(d)}
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
  const q=queryFromEvent(e);if(!q||!comparison(q))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.target?.id==='homeSearch'||e.target?.closest?.('#homeSearchBtn')||e.target?.closest?.('[data-example]')){
    if(typeof window.showView==='function')window.showView('search');
    if($('searchInput'))$('searchInput').value=q;
  }
  render(q);
}
function installStyle(){
  if($('#cc245Style'))return;const s=document.createElement('style');s.id='cc245Style';s.textContent=`
  .cc245-card .cc242-toggle{display:none!important}.cc245-card>h3{max-width:820px!important}.cc245-head{display:grid;grid-template-columns:1fr 34px 1fr;gap:8px;align-items:stretch;margin:12px 0}.cc245-head>div{display:grid;gap:4px;padding:11px 12px;border-radius:11px;background:#F4F7FB}.cc245-head small{color:#3565BD;font-size:9px;font-weight:950}.cc245-head b{color:#3B516E;font-size:11px;line-height:1.45}.cc245-head em{align-self:center;color:#9AA6B7;font-size:9px;font-style:normal;font-weight:950;text-align:center}.cc245-table{overflow:hidden;border:1px solid #E0E7F0;border-radius:11px}.cc245-tr{display:grid;grid-template-columns:100px 1fr 1fr}.cc245-tr>*{padding:9px 10px;border-top:1px solid #E8EDF3;color:#5D6E84;font-size:9.5px;line-height:1.45}.cc245-tr>*+*{border-left:1px solid #E8EDF3}.cc245-tr>b{color:#4A607D}.cc245-th>*{border-top:0;background:#F7F9FC;color:#758399;font-size:8.5px;font-weight:950}.cc245-first{display:flex;gap:10px;margin-top:9px;padding:10px 11px;border:1px solid #D8EBDD;border-radius:11px;background:#F4FAF6}.cc245-first small{flex:0 0 auto;color:#4E7C61;font-size:9px;font-weight:950}.cc245-first b{color:#42634E;font-size:10px;line-height:1.5}.cc245-more{margin-top:8px}.cc245-caution{display:flex;gap:9px;padding:9px 11px;border-radius:10px;background:#FFF9F2}.cc245-caution b{flex:0 0 auto;color:#8A612F;font-size:9px}.cc245-caution span{color:#756654;font-size:9.5px;line-height:1.5}.cc245-sources{display:flex;flex-wrap:wrap;gap:8px;margin-top:7px}.cc245-sources a{color:#3B69BC;font-size:9px;font-weight:850;text-decoration:none}.cc245-suggest{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px}.cc245-suggest small{color:#7E8C9E;font-size:8.5px;font-weight:950}.cc245-suggest button,.cc245-known button{padding:6px 8px;border:1px solid #DDE5EF;border-radius:999px;background:#fff;color:#536983;font-size:9px;font-weight:850}.cc245-known{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}.cc245-unknown>p{color:#65768C;font-size:11px}.cc245-card.cc242-card:not(.cc242-expanded) .cc245-more{display:none}
  @media(max-width:700px){.cc245-head{grid-template-columns:1fr}.cc245-head em{padding:1px}.cc245-tr{grid-template-columns:78px 1fr 1fr}.cc245-tr>*{padding:8px 7px;font-size:8.8px}.cc245-first{display:grid;gap:4px}}
  `;document.head.appendChild(s);
}
function install(){
  installStyle();setTimeout(()=>document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION),0);
  const previous=window.runSearch;
  window.runSearch=function(){const q=$('searchInput')?.value.trim()||'';if(!render(q)&&typeof previous==='function')return previous();};
  window.addEventListener('click',intercept,true);window.addEventListener('keydown',intercept,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
