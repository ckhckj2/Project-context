(()=>{
'use strict';
const VERSION='2.1.42';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const PERMIT=/(세움터|인허가|건축\s*(?:허가|신고)|허가\s*(?:접수|신청|제출|도서|자료|서류|협력업체|협력사)|신고\s*(?:접수|신청|제출)|사용승인|착공신고)/i;
const EXECUTE=/(어떻게|절차|순서|흐름|무엇부터|뭐부터|준비|작성|취합|모아|요청|제출|접수|신청|체크|검토|확인|업무)/i;
const DEFINITION=/(뭐야|뭔데|뜻|정의|무엇인가|어떤\s*(?:사이트|시스템|절차))/i;
const WHO_ONLY=/(누구에게|누구한테|어디에\s*물어|뭐라고\s*(?:말|물어)|문의하면)/i;

const PACKAGES={
  start:{
    title:'인허가 접수는 제출 버튼보다 “이번 프로젝트의 승인 경로”를 고정하는 일부터 시작해요',
    intro:'세움터를 쓰는지부터 단정하지 말고, 원래 어떤 법과 절차로 승인받는 사업인지 먼저 확인하세요.',
    steps:[
      ['1','승인 경로 고정','건축허가·건축신고·주택법 사업계획승인·정비사업·특별법 절차 중 무엇인지 PM/인허가 담당과 확인합니다.'],
      ['2','최신 요구자료 확인','관할청 안내, 세움터 민원 화면, 사전협의 결과에서 이번 접수의 제출항목과 형식을 확인합니다.'],
      ['3','담당·마감 배분','건축이 작성할 자료와 구조·기계·전기·소방 등 협력분야 요청자료를 나누고 내부 회신일을 정합니다.'],
      ['4','공통 기준 배포','프로젝트명·주소·용도·규모·기준 도면·기준일·파일명 규칙을 한 번에 전달합니다.'],
      ['5','취합·대조 후 접수','분야별 최신본, 도면 간 수치, 서명·날인, 파일 형식과 누락을 확인한 뒤 권한 있는 담당자가 접수합니다.']
    ],
    done:'적용 절차, 최신 제출요구, 분야별 담당자·회신일, 기준 도면 버전, 미확정 항목이 한 장에서 추적되면 접수 준비가 된 상태예요.',
    caution:'모든 프로젝트에 같은 제출목록을 복사하지 마세요. 세움터에 보이는 항목만으로 충분하다고 단정하지 말고 관할청 요구와 사전협의 사항을 함께 봅니다.'
  },
  collect:{
    title:'협력업체 자료는 “분야별 목록”보다 “이번 접수에서 증명할 내용”을 기준으로 요청하세요',
    intro:'요청 전에 관할청·세움터 요구항목과 현재 설계 기준본을 먼저 고정해야 서로 다른 버전의 자료가 모이지 않아요.',
    steps:[
      ['1','요구항목을 분야로 배분','제출요구 각 항목의 작성·검토·서명 주체를 건축/구조/기계/전기/소방/토목/조경 등으로 지정합니다.'],
      ['2','요청서에 기준 명시','접수 목적, 기준 도면일, 프로젝트 공통정보, 원하는 파일형식, 회신일, 문의자를 적습니다.'],
      ['3','연결자료 함께 전달','배치·평면·면적표·코어 등 해당 분야 판단에 필요한 최신 건축 기준자료만 골라 전달합니다.'],
      ['4','회신 상태 관리','미요청/요청/회신/수정요청/최종 상태와 파일 버전을 한 표에서 관리합니다.'],
      ['5','분야 간 정합성 확인','구조 그리드, 샤프트·기계실, 전기실, 소방구획 등 건축도면과 연결되는 항목을 대조합니다.']
    ],
    done:'모든 요구항목에 담당분야·상태·최신 파일·기준일이 연결되고, 미회신 및 불일치 항목의 처리자가 정해지면 완료예요.',
    caution:'“허가자료 보내주세요”처럼 포괄적으로 요청하지 마세요. 다만 회사·관할청마다 목록이 다르므로 척척의 분야 예시는 고정 제출목록이 아닙니다.'
  },
  preflight:{
    title:'제출 전에는 파일 개수보다 “같은 프로젝트를 설명하고 있는지”를 확인하세요',
    intro:'개별 도면이 맞아도 기준일과 수치가 다르면 보완으로 이어질 수 있어요. 최종본 묶음 전체를 한 번에 대조합니다.',
    steps:[
      ['1','접수조건','민원 종류·관할청·신청인·대리인·권한·수수료·서명/날인 방식을 확인합니다.'],
      ['2','누락·형식','최신 요구목록과 실제 파일을 대조하고 파일명·확장자·용량·전자서명 등 형식을 확인합니다.'],
      ['3','공통정보','주소, 대지면적, 용도, 층수, 높이, 구조, 주차, 면적 합계가 신청서·개요·도면·계산서에서 일치하는지 봅니다.'],
      ['4','버전·정합성','건축과 각 협력분야의 기준 도면일을 맞추고 변경사항이 모든 관련 도서에 반영됐는지 확인합니다.'],
      ['5','미확정·기록','확정되지 않은 협의사항과 제출 후 보완 대응 담당자를 표시하고 접수본·접수번호·제출일을 보관합니다.']
    ],
    done:'최신 요구목록의 모든 항목이 제출본과 연결되고, 공통정보·버전 불일치가 해소되며, 남은 쟁점의 책임자까지 정해지면 제출할 수 있어요.',
    caution:'오류를 숨긴 채 우선 접수하지 마세요. 적용 여부가 불확실한 항목은 PM/인허가 담당과 판단한 기록을 남기고 필요하면 관할청에 쟁점을 좁혀 확인합니다.'
  }
};

function selectedContext(){
  return [$('#project')?.selectedOptions?.[0]?.textContent,$('#phase')?.selectedOptions?.[0]?.textContent].filter(x=>x&&x!=='잘 모르겠습니다').join(' · ');
}
function classify(q){
  if(!PERMIT.test(q)||!EXECUTE.test(q)||DEFINITION.test(q)||WHO_ONLY.test(q))return null;
  if(/협력|구조|기계|전기|소방|토목|조경|자료\s*(?:요청|취합|모아)|회신|분야별/i.test(q))return 'collect';
  if(/제출\s*전|접수\s*전|최종\s*(?:검토|체크)|누락|정합|버전|체크리스트/i.test(q))return 'preflight';
  return 'start';
}
function render(kind){
  const d=PACKAGES[kind],out=$('searchResult'); if(!d||!out)return false;
  const ctx=selectedContext();
  out.innerHTML=`<div class="result-card cc241-card" data-cc221="1"><div class="label">PERMIT HOW · LV3 · 척척</div><h3>${esc(d.title)}</h3>${ctx?`<div class="cc241-context">현재 선택 · ${esc(ctx)}</div>`:''}<p class="cc241-intro">${esc(d.intro)}</p><div class="cc241-steps">${d.steps.map(([n,t,b])=>`<div><em>${n}</em><section><b>${esc(t)}</b><p>${esc(b)}</p></section></div>`).join('')}</div><div class="cc241-done"><small>완료 기준</small><b>${esc(d.done)}</b></div><details class="cc241-caution"><summary>주의 · 프로젝트마다 달라지는 부분</summary><p>${esc(d.caution)}</p></details><div class="cc241-switch"><small>다른 인허가 실무 보기</small><button data-cc241="start">접수 흐름</button><button data-cc241="collect">자료 취합</button><button data-cc241="preflight">제출 전 검토</button></div></div>`;
  out.querySelectorAll('[data-cc241]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.cc241)));
  return true;
}
function route(q){const kind=classify(q);return kind?render(kind):false;}
function goFromHome(q){if(typeof window.showView==='function')window.showView('search');const i=$('searchInput');if(i)i.value=q;return route(q);}
function installStyle(){
  if($('#cc241Style'))return;const s=document.createElement('style');s.id='cc241Style';s.textContent=`
  .cc241-card h3{margin-bottom:8px!important}.cc241-context{display:inline-block;margin:0 0 9px;padding:5px 8px;border-radius:999px;background:#F2F6FC;color:#687A94;font-size:9px;font-weight:850}.cc241-intro{margin:0 0 12px;color:#596C86;font-size:11.5px;line-height:1.6}.cc241-steps{display:grid;gap:8px}.cc241-steps>div{display:grid;grid-template-columns:28px 1fr;gap:9px;padding:11px;border:1px solid #E1E8F2;border-radius:12px;background:#fff}.cc241-steps em{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#EAF2FF;color:#2F63CE;font-style:normal;font-size:10px;font-weight:950}.cc241-steps section b{display:block;color:#314866;font-size:12px}.cc241-steps section p{margin:4px 0 0;color:#667790;font-size:10.5px;line-height:1.55}.cc241-done{margin-top:9px;padding:11px 12px;border:1px solid #D7EBDD;border-radius:12px;background:#F4FAF6}.cc241-done small{display:block;margin-bottom:4px;color:#518065;font-size:9px;font-weight:950}.cc241-done b{color:#315E44;font-size:11px;line-height:1.55}.cc241-caution{margin-top:8px;border:1px solid #E5EAF2;border-radius:11px;background:#FBFCFE}.cc241-caution summary{padding:10px 12px;cursor:pointer;color:#586A82;font-size:10px;font-weight:900}.cc241-caution p{margin:0;padding:0 12px 11px;color:#68788D;font-size:10.5px;line-height:1.55}.cc241-switch{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:10px}.cc241-switch small{width:100%;color:#7B899C;font-size:9px;font-weight:900}.cc241-switch button{padding:7px 9px;border:1px solid #DCE5F2;border-radius:999px;background:#fff;color:#426086;font-size:9.5px;font-weight:900}.cc241-switch button:hover{border-color:#AFC5EC;background:#F5F8FF;color:#285CC8}@media(max-width:700px){.cc241-steps section b{font-size:11.5px}.cc241-steps section p{font-size:10px}}
  `;document.head.appendChild(s);
}
function install(){
  installStyle();
  const previous=window.runSearch;
  window.runSearch=function(){const q=$('searchInput')?.value.trim()||'';if(!route(q)&&typeof previous==='function')return previous();};
  document.addEventListener('click',e=>{
    const ex=e.target.closest('[data-example]');if(ex){const q=ex.dataset.example||'';if(classify(q)){e.preventDefault();e.stopImmediatePropagation();goFromHome(q);return;}}
    if(e.target.closest('#searchGo')){const q=$('searchInput')?.value.trim()||'';if(classify(q)){e.preventDefault();e.stopImmediatePropagation();route(q);return;}}
    if(e.target.closest('#homeSearchBtn')){const q=$('homeSearch')?.value.trim()||'';if(classify(q)){e.preventDefault();e.stopImmediatePropagation();goFromHome(q);return;}}
  },true);
  document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;if(e.target?.id==='searchInput'&&classify(e.target.value)){e.preventDefault();e.stopImmediatePropagation();route(e.target.value);}if(e.target?.id==='homeSearch'&&classify(e.target.value)){e.preventDefault();e.stopImmediatePropagation();goFromHome(e.target.value);}},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
