(()=>{
const VERSION="1.4.0";
const MASTER_KEY="나는야 건축 마스터";

const LEVEL_META={
  1:{name:"신입사원",next:"선임",count:5,difficulty:"VERY EASY",status:"live",desc:"방금 화면에서 본 핵심 용어를 그대로 확인하는 복습형 시험입니다."},
  2:{name:"선임",next:"책임",count:5,difficulty:"EASY",status:"placeholder",desc:"WHY / WHERE 콘텐츠 완성 후 실제 문제 5문항이 연결됩니다."},
  3:{name:"책임",next:"수석",count:5,difficulty:"MEDIUM",status:"placeholder",desc:"HOW 콘텐츠 완성 후 실제 문제 5문항이 연결됩니다."},
  4:{name:"수석",next:"건축 마스터",count:15,difficulty:"HARD",status:"placeholder",desc:"JUDGEMENT 콘텐츠 완성 후 최종 15문항이 연결됩니다."},
  5:{name:"건축 마스터",next:null,count:0,difficulty:"MASTER",status:"complete",desc:"모든 레벨 콘텐츠를 확인할 수 있는 마스터 상태입니다."}
};

const CONCEPTS={
  newbie:["신입사원","신입","신입 사원","lv1","lv.1","1레벨","레벨1"],
  useApproval:["사용승인","사용 승인","건축물사용승인","건축물 사용승인"],
  useInspection:["사용검사","사용 검사","주택사용검사","주택 사용검사"],
  businessPlanApproval:["사업계획승인","사업계획 승인","사업승인","사업 승인","주택사업계획승인","주택 사업계획 승인","주택사업승인","주택 사업 승인"],
  landEum:["토지이음","토지 이음"],
  buildingPermit:["건축허가","건축 허가","허가"],
  commencementReport:["착공신고","착공 신고"],
  districtUnitPlan:["지구단위계획","지구 단위 계획","지구단위 계획"]
};

const BANKS={
  1:[
    {q:"현재 첫 레벨의 이름은?",concept:"newbie",ok:"신입사원"},
    {q:"건축허가를 받아 공사를 끝낸 뒤 건축물을 사용하기 전에 받는 대표 절차는?",concept:"useApproval",ok:"사용승인"},
    {q:"주택법상 사업계획승인을 받아 진행한 주택사업이 끝난 뒤 받는 대표 절차는?",concept:"useInspection",ok:"사용검사"},
    {q:"주택법에서 주택건설사업의 계획을 승인받는 절차는?",concept:"businessPlanApproval",ok:"사업계획승인"},
    {q:"대지의 용도지역·지구·구역 정보를 확인할 때 쓰는 대표 서비스는?",concept:"landEum",ok:"토지이음"}
  ]
};

function norm(v){
  return String(v||"")
    .trim().toLowerCase()
    .replace(/[·ㆍ,./()[\]{}"'`~!@#$%^&*_=+?:;-]/g,"")
    .replace(/\s+/g,"")
    .replace(/^(정답은|답은|정답|답)/,"")
    .replace(/(입니다|이에요|예요|이요|라고생각합니다|라고생각해요|같습니다|같아요|요)$/ ,"");
}
function accepted(raw,concept){
  const n=norm(raw), variants=(CONCEPTS[concept]||[]).map(norm);
  if(!n)return false;
  if(variants.includes(n))return true;
  return variants.some(v=>v.length>=3 && (n===v+"입니다" || n.startsWith(v+"라고") || n===("정답은"+v)));
}

function storage(){
  try{return JSON.parse(localStorage.getItem("pc_quiz_engine_v140")||"{}")}catch(e){return{}}
}
function save(obj){localStorage.setItem("pc_quiz_engine_v140",JSON.stringify(obj))}
function getSession(level){
  const all=storage();
  return all[level]||{index:0,correct:0,active:false,passed:false};
}
function setSession(level,val){
  const all=storage();all[level]=val;save(all);
}
function certified(){
  return localStorage.getItem("pc_master_certified")==="1";
}
function effectiveLevel(){
  return Math.max(1,Math.min(5,Number(localStorage.getItem("pc_level")||1)));
}
function genuineLevel(){
  const saved=Number(localStorage.getItem("pc_progress_level")||0);
  if(saved>=1&&saved<=5)return saved;
  const current=effectiveLevel();
  const initial=certified()?1:current;
  localStorage.setItem("pc_progress_level",String(initial));
  return initial;
}
function setGenuineLevel(lv){
  localStorage.setItem("pc_progress_level",String(lv));
  if(!certified()){
    localStorage.setItem("pc_level",String(lv));
    localStorage.setItem("pc_master_unlocked",lv===5?"1":"0");
  }
}
function installStyle(d){
  if(d.getElementById("pc140style"))return;
  const st=d.createElement("style");st.id="pc140style";st.textContent=`
    .engine-status{margin-top:12px;padding:12px 13px;border-radius:14px;border:1px solid #E2E7F2;background:#FAFBFE;font-size:10.5px;color:#69758D;line-height:1.55}
    .engine-status b{color:#40506B}.engine-status.pending{background:#FFF9F0;border-color:#F0DFBE;color:#886526}
    .engine-badge{display:inline-flex;align-items:center;padding:4px 7px;margin-left:5px;border-radius:999px;background:#EEF2FF;color:#4B64C8;font-size:8.5px;font-weight:950;letter-spacing:.06em}
    .engine-path{margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
    .engine-path-card{padding:10px 11px;border:1px solid #E5E9F2;border-radius:12px;background:#fff}
    .engine-path-card small{display:block;font-size:8px;letter-spacing:.08em;color:#9AA2B2;font-weight:900;margin-bottom:4px}
    .engine-path-card b{display:block;font-size:10.5px;color:#5F6980}
    .engine-path-card span{display:block;margin-top:3px;font-size:9px;color:#9AA2B2}
    .engine-path-card.live{border-color:#CCD7FF;background:#F7F9FF}.engine-path-card.pending{background:#FBFBFC}
    .promotion-box{padding:24px 18px;text-align:center}
    .promotion-box .promote-kicker{font-size:9px;letter-spacing:.15em;font-weight:950;color:#8893AD}
    .promotion-box .promote-title{font-size:22px;font-weight:950;margin-top:8px;color:#33405A}
    .promotion-box .promote-desc{font-size:11.5px;line-height:1.65;color:#77819A;margin:9px auto 0;max-width:470px}
    .resume-note{margin-top:8px;font-size:9.5px;color:#929AAD}
    @media(max-width:800px){.engine-path{grid-template-columns:1fr 1fr}}
  `;d.head.appendChild(st);
}
function cloneInteractive(d,id){
  const old=d.getElementById(id);if(!old)return null;
  const neo=old.cloneNode(true);old.replaceWith(neo);return neo;
}
function renderPath(d){
  const wrap=d.querySelector(".quiz-overview .card:nth-child(2)");
  if(!wrap)return;
  const old=wrap.querySelector(".engine-path");if(old)old.remove();
  const grid=wrap.querySelector(".info-grid");if(grid)grid.style.display="none";
  const path=d.createElement("div");path.className="engine-path";
  path.innerHTML=[1,2,3,4].map(lv=>{
    const m=LEVEL_META[lv];
    return `<div class="engine-path-card ${m.status==="live"?"live":"pending"}"><small>LV.${lv} → ${lv===4?"LV.MAX":"LV."+(lv+1)}</small><b>${m.name} → ${m.next}</b><span>${m.count}문항 · ${m.difficulty}${m.status==="placeholder"?" · 문제은행 대기":""}</span></div>`;
  }).join("");
  wrap.appendChild(path);
}
function syncOverview(d,level){
  const m=LEVEL_META[level];
  const rank=d.getElementById("quizRank"),desc=d.getElementById("quizDesc"),progress=d.getElementById("quizProgress"),start=d.getElementById("startQuizBtn");
  if(rank)rank.textContent=m.name;
  if(desc)desc.textContent=m.desc;
  const diff=[...d.querySelectorAll(".qmeta span")].find(x=>x.textContent.includes("난이도"));
  if(diff)diff.textContent="난이도 · "+m.difficulty;
  if(progress){
    const sess=getSession(level);
    const pct=m.count?Math.round((Math.min(sess.index,m.count)/m.count)*100):(level===5?100:0);
    progress.style.width=pct+"%";
  }
  if(start){
    const sess=getSession(level);
    if(level===5){start.textContent="건축 마스터 · 전체 콘텐츠 확인";start.disabled=false}
    else if(m.status==="placeholder"){
      start.textContent="문제은행 준비중";
      start.disabled=true;
      start.style.opacity=".55";
    }else{
      start.disabled=false;start.style.opacity="";
      start.textContent=sess.active&&sess.index<m.count?"이어서 풀기 →":"퀴즈 풀기 →";
    }
  }
  const card=d.querySelector(".rank-card");
  if(card){
    card.querySelector(".engine-status")?.remove();
    const box=d.createElement("div");
    const master=certified();
    if(m.status==="placeholder"){
      box.className="engine-status pending";
      box.innerHTML=`<b>4A · 승급 엔진 준비 완료</b><span class="engine-badge">CONTENT PENDING</span><br>${m.name} 실제 문제는 ${level===2?"5단계 선임":level===3?"6단계 책임":"7단계 수석"} 콘텐츠와 함께 연결합니다.${master?" 마스터 테스트 모드에서는 레벨 잠금 상태만 미리볼 수 있습니다.":""}`;
    }else if(level===5){
      box.className="engine-status";
      box.innerHTML=`<b>ARCHITECTURE MASTER</b><span class="engine-badge">ALL CLEAR</span><br>마스터 테스트 모드에서 각 레벨 화면으로 내려가 잠금 상태를 확인할 수 있습니다.`;
    }else{
      const sess=getSession(level);
      box.className="engine-status";
      box.innerHTML=`<b>통과 기준 · ${m.count}/${m.count}</b><span class="engine-badge">${m.difficulty}</span><br>틀리면 같은 문제에서 다시 시도합니다. 새로고침해도 ${sess.active&&sess.index>0?`${sess.index+1}번 문제부터 이어집니다.`:"진행도가 저장됩니다."}`;
    }
    card.appendChild(box);
  }
}
function promotion(d,w,level){
  const area=d.getElementById("quizArea");if(!area)return;
  const next=LEVEL_META[level].next;
  area.classList.add("show");
  area.innerHTML=`<div class="qbox promotion-box"><div class="promote-kicker">PROMOTION COMPLETE</div><div class="promote-title">${next} 승급</div><div class="promote-desc">${LEVEL_META[level].count}문항을 모두 통과했습니다.${certified()?" 현재는 마스터 테스트 모드이므로 실제 개인 승급 기록은 변경하지 않았습니다.":" 다음 레벨 콘텐츠 접근 권한이 열렸습니다."}</div><button class="btn primary full" id="promoteContinue140" style="margin-top:16px">계속하기 →</button></div>`;
  d.getElementById("promoteContinue140")?.addEventListener("click",()=>{
    if(!certified() && level<5){
      localStorage.setItem("pc_level",String(level+1));
      localStorage.setItem("pc_master_unlocked",level+1===5?"1":"0");
    }
    w.location.reload();
  });
}
function activateQuiz(d,w,level){
  const bank=BANKS[level],m=LEVEL_META[level];
  if(!bank||m.status!=="live")return;
  let sess=getSession(level);
  if(sess.passed){sess={index:0,correct:0,active:true,passed:false};setSession(level,sess)}
  else{sess.active=true;setSession(level,sess)}
  const area=d.getElementById("quizArea");if(area)area.classList.add("show");
  renderQuestion(d,w,level);
}
function renderQuestion(d,w,level){
  const bank=BANKS[level],m=LEVEL_META[level],sess=getSession(level);
  if(sess.index>=bank.length){complete(d,w,level);return}
  const q=bank[sess.index];
  const count=d.getElementById("qCount"),score=d.getElementById("qScore"),text=d.getElementById("qText"),input=d.getElementById("qInput"),fb=d.getElementById("qFeedback"),progress=d.getElementById("quizProgress");
  if(count)count.textContent=`QUESTION ${String(sess.index+1).padStart(2,"0")} / ${String(m.count).padStart(2,"0")}`;
  if(score)score.textContent=`${sess.correct} CORRECT`;
  if(text)text.textContent=q.q;
  if(input){input.value="";input.placeholder="단답형으로 입력";setTimeout(()=>input.focus(),30)}
  if(fb){fb.className="feedback";fb.textContent=""}
  if(progress)progress.style.width=Math.round((sess.index/m.count)*100)+"%";
  const note=d.querySelector(".resume-note");if(note)note.remove();
  if(sess.index>0){
    const qbox=d.querySelector("#quizArea .qbox");
    if(qbox){const n=d.createElement("div");n.className="resume-note";n.textContent="진행도 자동 저장 중";qbox.appendChild(n)}
  }
}
function grade(d,w,level){
  const bank=BANKS[level],sess=getSession(level),q=bank?.[sess.index];
  if(!q)return;
  const input=d.getElementById("qInput"),fb=d.getElementById("qFeedback"),raw=input?.value||"";
  if(norm(raw)===norm(MASTER_KEY)){
    const genuine=genuineLevel();
    localStorage.setItem("pc_progress_level",String(genuine));
    localStorage.setItem("pc_master_certified","1");
    localStorage.setItem("pc_master_unlocked","1");
    localStorage.setItem("pc_level","5");
    localStorage.setItem("pc_master_preview_level","5");
    w.top.location.reload();
    return;
  }
  if(accepted(raw,q.concept)){
    sess.correct++;sess.index++;sess.active=true;setSession(level,sess);
    if(fb){fb.className="feedback show ok";fb.innerHTML=`정답 · <b>${q.ok}</b>`}
    setTimeout(()=>{if(sess.index>=bank.length)complete(d,w,level);else renderQuestion(d,w,level)},450);
  }else{
    if(fb){
      fb.className="feedback show no";
      fb.textContent="다시 한 번 입력해보세요. 띄어쓰기·통상 약칭·짧은 문장형 표현은 유연하게 인정하지만, 서로 다른 법정 절차는 같은 답으로 처리하지 않습니다.";
    }
  }
}
function complete(d,w,level){
  let sess=getSession(level);sess.passed=true;sess.active=false;sess.index=LEVEL_META[level].count;sess.correct=LEVEL_META[level].count;setSession(level,sess);
  if(!certified()){
    const target=Math.min(5,Math.max(genuineLevel(),level+1));
    setGenuineLevel(target);
  }
  const progress=d.getElementById("quizProgress");if(progress)progress.style.width="100%";
  promotion(d,w,level);
}
function installEngine(d,w){
  if(!d||!w)return;
  installStyle(d);
  const chip=[...d.querySelectorAll(".topchip")].find(x=>/v1\.3\.|v1\.4\./.test(x.textContent));
  if(chip)chip.textContent="v1.4.0 · 4A";
  renderPath(d);

  const level=effectiveLevel();
  genuineLevel();

  const start=cloneInteractive(d,"startQuizBtn");
  const submit=cloneInteractive(d,"qSubmit");
  const input=cloneInteractive(d,"qInput");

  syncOverview(d,level);

  if(start)start.addEventListener("click",e=>{
    e.preventDefault();
    if(level===5){if(w.switchTab)w.switchTab("project");return}
    if(LEVEL_META[level].status!=="live")return;
    activateQuiz(d,w,level);
  });
  if(submit)submit.addEventListener("click",e=>{e.preventDefault();grade(d,w,level)});
  if(input)input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();grade(d,w,level)}});

  const sess=getSession(level);
  if(LEVEL_META[level].status==="live" && sess.active && sess.index<LEVEL_META[level].count){
    d.getElementById("quizArea")?.classList.add("show");
    renderQuestion(d,w,level);
  }
}
function boot(){
  const frame=document.getElementById("app");if(!frame)return;
  const run=()=>setTimeout(()=>installEngine(frame.contentDocument,frame.contentWindow),180);
  frame.addEventListener("load",run);
  if(frame.contentDocument?.readyState==="complete")run();
}
boot();
})();