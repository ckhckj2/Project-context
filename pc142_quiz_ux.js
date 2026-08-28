(()=>{
const VERSION="1.4.2";

const NOVICE_HINTS=[
  {test:/첫 레벨|현재 첫 레벨/,hint:"앱을 처음 시작하면 가장 먼저 보이는 직급입니다."},
  {test:/전체 흐름 속에서 지금 내 위치|전체 흐름.*위치/,hint:"상단 탭 중 ‘프로젝트’와 ‘맥락’이라는 단어가 들어간 탭입니다."},
  {test:/모르는 건축 용어/,hint:"질문 문장 자체에 ‘용어’가 들어가 있습니다. 상단 탭 이름을 떠올려보세요."},
  {test:/어떤 사람이나 기관에 물어봐야/,hint:"상단 탭 중 ‘누구에게’로 시작하는 메뉴입니다."},
  {test:/설계 단계를 모르면/,hint:"모르는 상태를 그대로 선택해도 됩니다. ‘잘 …’로 시작합니다."},
  {test:/아파트.*분류|아파트·연립·다세대|여러 세대가 사는/,hint:"여러 세대가 함께 사는 주택을 묶어 부르는 가장 기본적인 말입니다."},
  {test:/학생이나 직원이 공동으로 생활/,hint:"학교나 회사에서 공동생활하는 숙소를 떠올려보세요."},
  {test:/업무시설로 분류되는.*주거유사/,hint:"주거처럼 쓰이기도 하지만 이름은 ‘○○텔’입니다."},
  {test:/고시원/,hint:"앱에서는 ‘다중○○시설’이라는 이름으로 표시합니다."},
  {test:/병원/,hint:"‘의료’라는 단어가 들어가는 시설 분류입니다."},
  {test:/호텔/,hint:"잠을 자는 곳이라는 뜻의 시설 분류를 떠올려보세요."},
  {test:/학교나 연구소/,hint:"‘교육’과 ‘연구’ 두 단어가 함께 들어갑니다."},
  {test:/역사나 여객터미널/,hint:"사람을 실어 나르는 ‘운수’와 관련된 시설입니다."},
  {test:/체육관/,hint:"운동하는 곳입니다. 그대로 시설명을 붙이면 됩니다."},
  {test:/반도체 생산라인/,hint:"반도체 생산동을 현업에서 흔히 부르는 영문 3글자 표현도 정답으로 인정합니다."},
  {test:/서버를 대규모/,hint:"‘데이터’를 모아 운영하는 시설입니다."},
  {test:/상품을 보관·출고|대형 창고/,hint:"‘창고’ 또는 ‘물류’라는 단어가 들어가면 됩니다."},
  {test:/여러 기업의 제조·업무 공간/,hint:"‘지식’ + ‘산업’ + ‘센터’입니다."},
  {test:/위험물을 저장하거나 취급/,hint:"문제에 나온 ‘위험물’이라는 단어를 그대로 사용해도 인정됩니다."},
  {test:/비행기를 보관·정비/,hint:"비행기를 넣어두는 큰 건물을 부르는 말입니다."},
  {test:/백화점이나 대형 매장/,hint:"물건을 ‘판매’하는 시설입니다."},
  {test:/사무실 중심 건물/,hint:"사무·업무를 하는 시설입니다."},
  {test:/교회·성당·사찰/,hint:"모두 종교 활동을 하는 시설입니다."},
  {test:/공연장이나 집회장/,hint:"‘문화’와 ‘집회’가 함께 들어가는 시설입니다."},
  {test:/두 가지 이상의 용도/,hint:"여러 용도가 섞여 있다는 뜻의 두 글자 ‘복합’을 떠올려보세요."},
  {test:/용도지역·지구·구역/,hint:"토지 정보를 ‘이어’ 보여주는 대표 서비스입니다."},
  {test:/건축 인허가 전자민원/,hint:"건축행정 전자민원 시스템 이름입니다. ‘세○터’."},
  {test:/공사를 시작하기 전에 하는 대표 신고/,hint:"공사를 ‘착공’하기 전에 하는 신고입니다."},
  {test:/공사가 끝난 뒤.*사용하기 전에/,hint:"건축물을 ‘사용’하기 전에 받는 ‘승인’입니다."}
];

function hintFor(text){
  const item=NOVICE_HINTS.find(x=>x.test.test(text||""));
  return item?item.hint:"정답은 지금 화면이나 프로젝트 분류에서 한 번 본 기본 단어입니다. 길게 설명하지 말고 한두 단어로 입력해보세요.";
}

function getLevel(d){
  const rank=(d.getElementById("quizRank")?.textContent||"").trim();
  if(rank.includes("신입")) return 1;
  if(rank.includes("선임")) return 2;
  if(rank.includes("책임")) return 3;
  if(rank.includes("수석")) return 4;
  return 5;
}

function installStyle(d){
  if(d.getElementById("pc142style"))return;
  const st=d.createElement("style");st.id="pc142style";st.textContent=`
    .novice-coach{margin:12px 0 0;padding:12px 13px;border:1px solid #DDE5FF;border-radius:14px;background:linear-gradient(135deg,#F7F9FF,#FBFCFF);color:#65718A;font-size:10.5px;line-height:1.55}
    .novice-coach b{color:#40516E}.novice-coach .coach-tag{display:inline-flex;margin-left:5px;padding:3px 7px;border-radius:999px;background:#EEF2FF;color:#4C64C9;font-size:8px;font-weight:950;letter-spacing:.06em}
    .quiz-steps142{display:flex;gap:6px;margin:10px 0 2px}.quiz-step142{height:6px;flex:1;border-radius:999px;background:#E8ECF4;transition:background .2s ease,transform .2s ease}.quiz-step142.done{background:#6B7BEA}.quiz-step142.now{background:#A9B5FF;transform:scaleY(1.25)}
    .hint-row142{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}.hint-btn142{appearance:none;-webkit-appearance:none;border:1px solid #DDE3EF;background:#fff;color:#65718A;border-radius:999px;padding:7px 10px;font-size:10px;font-weight:900;cursor:pointer;touch-action:manipulation}.hint-btn142:active{transform:translateY(1px)}
    .hint-box142{display:none;flex:1;min-width:180px;padding:8px 10px;border-radius:11px;background:#F8F9FC;border:1px solid #E6EAF1;color:#707A90;font-size:10px;line-height:1.5}.hint-box142.show{display:block}
    .wrong-help142{margin-top:7px;padding:8px 10px;border-radius:10px;background:#FFF9F0;border:1px solid #F1E1C4;color:#866525;font-size:10px;line-height:1.5}
    .promotion-box{position:relative;overflow:hidden;border:1px solid #DCE4FF!important;background:linear-gradient(180deg,#FFFFFF,#F8FAFF)!important}
    .promotion-box:before{content:"";position:absolute;inset:-35% -20% auto;height:150px;background:radial-gradient(circle at 50% 50%,rgba(76,111,255,.12),transparent 68%);pointer-events:none}
    .promotion-box .promote-title{font-size:24px!important;color:#31405E!important}
    .unlock-grid142{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:15px;text-align:left}
    .unlock-card142{padding:11px 12px;border-radius:13px;border:1px solid #E1E6F1;background:#fff}.unlock-card142 small{display:block;font-size:8px;letter-spacing:.09em;font-weight:950;color:#98A1B2;margin-bottom:5px}.unlock-card142 b{display:block;font-size:10.5px;color:#58657D}.unlock-card142.unlocked{border-color:#CDD9FF;background:#F7F9FF}.unlock-card142.unlocked b{color:#405FCD}
    .promote-note142{margin-top:10px;font-size:9.5px;color:#8C96A9;line-height:1.55}
    @media(max-width:650px){.unlock-grid142{grid-template-columns:1fr}.hint-box142{width:100%;flex-basis:100%}}
    @media(prefers-reduced-motion:reduce){.quiz-step142,.hint-btn142{transition:none!important}.quiz-step142.now{transform:none}}
  `;
  d.head.appendChild(st);
}

function updateSteps(d){
  const qbox=d.querySelector("#quizArea .qbox"); if(!qbox)return;
  let row=qbox.querySelector(".quiz-steps142");
  if(!row){row=d.createElement("div");row.className="quiz-steps142";row.innerHTML=Array.from({length:5},()=>'<span class="quiz-step142"></span>').join("");const qmeta=qbox.querySelector(".qmeta");if(qmeta)qmeta.insertAdjacentElement("afterend",row);}
  const text=d.getElementById("qCount")?.textContent||"";
  const m=text.match(/(\d+)\s*\/\s*0?5/); const current=m?Math.max(1,Math.min(5,Number(m[1]))):1;
  [...row.children].forEach((el,i)=>{el.classList.toggle("done",i<current-1);el.classList.toggle("now",i===current-1);});
}

function ensureCoach(d){
  if(getLevel(d)!==1)return;
  const card=d.querySelector(".rank-card"); if(!card||card.querySelector(".novice-coach"))return;
  const box=d.createElement("div");box.className="novice-coach";box.innerHTML='<b>신입 퀴즈는 시험보다 복습입니다.</b><span class="coach-tag">NO PENALTY</span><br>모르면 힌트를 바로 봐도 됩니다. 틀려도 같은 문제에서 다시 입력하면 되고, 띄어쓰기·통상 표현은 유연하게 인정합니다.';
  card.appendChild(box);
}

function ensureHint(d){
  if(getLevel(d)!==1)return;
  const qbox=d.querySelector("#quizArea .qbox"); if(!qbox || !d.getElementById("qText"))return;
  let row=qbox.querySelector(".hint-row142");
  if(!row){
    row=d.createElement("div");row.className="hint-row142";row.innerHTML='<button type="button" class="hint-btn142">힌트 보기</button><div class="hint-box142"></div>';
    const fb=d.getElementById("qFeedback");
    if(fb)fb.insertAdjacentElement("afterend",row); else qbox.appendChild(row);
    const btn=row.querySelector(".hint-btn142"),box=row.querySelector(".hint-box142");
    const open=()=>{box.textContent=hintFor(d.getElementById("qText")?.textContent||"");box.classList.add("show");btn.textContent="힌트 열림";};
    btn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();open();});
    btn.addEventListener("touchend",e=>{e.preventDefault();open();},{passive:false});
  }
  const box=row.querySelector(".hint-box142"),btn=row.querySelector(".hint-btn142");
  const q=d.getElementById("qText")?.textContent||"";
  if(row.dataset.question!==q){row.dataset.question=q;box.classList.remove("show");box.textContent="";btn.textContent="힌트 보기";}
}

function enhanceWrong(d){
  if(getLevel(d)!==1)return;
  const fb=d.getElementById("qFeedback"); if(!fb)return;
  if(!fb.classList.contains("no")){fb.querySelector(".wrong-help142")?.remove();return;}
  if(fb.querySelector(".wrong-help142"))return;
  const extra=d.createElement("div");extra.className="wrong-help142";extra.textContent="힌트: "+hintFor(d.getElementById("qText")?.textContent||"");
  fb.appendChild(extra);
}

function enhancePromotion(d){
  const area=d.getElementById("quizArea"); if(!area)return;
  const box=area.querySelector(".promotion-box"); if(!box || box.dataset.b142==="1")return;
  box.dataset.b142="1";
  const title=box.querySelector(".promote-title");
  const isMasterTest=(box.querySelector(".promote-kicker")?.textContent||"").includes("MASTER");
  if(!isMasterTest && title && title.textContent.includes("선임")){
    title.textContent="LV.2 · 선임 UNLOCKED";
    const desc=box.querySelector(".promote-desc");
    if(desc)desc.textContent="신입 퀴즈 5문제를 완료했습니다. 이제 선임 단계의 ‘왜 필요한가 / 어디서 확인하는가’ 콘텐츠가 열립니다.";
    const grid=d.createElement("div");grid.className="unlock-grid142";grid.innerHTML=`
      <div class="unlock-card142 unlocked"><small>UNLOCK 01</small><b>왜 이 절차가 필요해?</b></div>
      <div class="unlock-card142 unlocked"><small>UNLOCK 02</small><b>어디서 확인해?</b></div>
      <div class="unlock-card142"><small>NEXT</small><b>5단계 · 선임 콘텐츠</b></div>`;
    const button=box.querySelector("#continue141");
    if(button){button.textContent="선임 화면 확인하기 →";button.insertAdjacentElement("beforebegin",grid);}
    const note=d.createElement("div");note.className="promote-note142";note.textContent="승급 기록은 이 브라우저에 저장됩니다. 새로고침해도 유지됩니다.";box.appendChild(note);
  }
}

function sync(d){
  installStyle(d);ensureCoach(d);updateSteps(d);ensureHint(d);enhanceWrong(d);enhancePromotion(d);
  const chip=[...d.querySelectorAll(".topchip")].find(x=>/^v1\./.test(x.textContent.trim()));
  if(chip)chip.textContent="v1.4.2 · 4B";
}

function install(){
  const frame=document.getElementById("app"),d=frame?.contentDocument;if(!d)return;
  sync(d);
  if(d.body && !d.body.dataset.pc142observe){
    d.body.dataset.pc142observe="1";
    const obs=new MutationObserver(()=>sync(d));
    obs.observe(d.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["class"]});
  }
}

const frame=document.getElementById("app");
if(frame){
  frame.addEventListener("load",()=>setTimeout(install,420));
  if(frame.contentDocument?.readyState==="complete")setTimeout(install,420);
}
})();