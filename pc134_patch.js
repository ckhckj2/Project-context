(()=>{
const MASTER_KEY="나는야 건축 마스터";
const EASY=[
 {q:"현재 첫 레벨의 이름은?",a:["신입사원","신입","신입 사원","lv1","lv.1","1레벨","레벨1"],ok:"신입사원"},
 {q:"건축허가를 받아 공사를 끝낸 뒤 건축물을 사용하기 전에 받는 대표 절차는?",a:["사용승인","사용 승인","건축물사용승인","건축물 사용승인"],ok:"사용승인"},
 {q:"주택법상 사업계획승인을 받아 진행한 주택사업이 끝난 뒤 받는 대표 절차는?",a:["사용검사","사용 검사","주택사용검사","주택 사용검사"],ok:"사용검사"},
 {q:"주택법에서 주택건설사업의 계획을 승인받는 절차는?",a:["사업계획승인","사업계획 승인","사업승인","사업 승인","주택사업계획승인","주택 사업계획 승인"],ok:"사업계획승인"},
 {q:"대지의 용도지역·지구·구역 정보를 확인할 때 쓰는 대표 서비스는?",a:["토지이음","토지 이음"],ok:"토지이음"}
];
function norm(s){return String(s||"").trim().toLowerCase().replace(/[·ㆍ,./()[\]{}"'`~!@#$%^&*_=+?:;-]/g,"").replace(/\s+/g,"").replace(/(입니다|이에요|예요|이요|요)$/,"")}
function same(raw,arr){const n=norm(raw);return arr.some(v=>{const a=norm(v);return n===a||(a.length>=3&&n.includes(a))})}
function injectStyle(d){
 if(d.getElementById("pc134fix"))return;
 const st=d.createElement("style");st.id="pc134fix";st.textContent=`
 .stage-banner{margin-top:14px;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:15px 16px;border-radius:17px;background:linear-gradient(135deg,#EEF3FF,#F8FAFF);border:1px solid #D8E2FF}
 .stage-badge{width:44px;height:44px;border-radius:14px;background:#4C6FFF;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:950;box-shadow:0 8px 20px rgba(76,111,255,.18)}
 .stage-copy small{display:block;font-size:9px;letter-spacing:.11em;font-weight:900;color:#8592B1;margin-bottom:4px}.stage-copy b{font-size:14px}.stage-copy p{font-size:11px;color:#748099;margin-top:4px}
 .stage-task{padding:8px 10px;border-radius:999px;background:#fff;border:1px solid #DDE5F5;font-size:10.5px;font-weight:900;color:#5E6A83;white-space:nowrap}
 .lv1-flow .node.done{background:#F4F6F9!important;color:#9AA3B3!important;border-color:#E8EBF1!important}
 .lv1-flow .node.current-phase{position:relative;background:#4C6FFF!important;border-color:#4C6FFF!important;color:#fff!important;box-shadow:0 7px 18px rgba(76,111,255,.18)}
 .lv1-flow .node.current-phase:after{content:'NOW';position:absolute;top:-9px;right:7px;padding:2px 5px;border-radius:999px;background:#fff;color:#4C6FFF;border:1px solid #D6E0FF;font-size:7.5px;font-weight:950}
 .lv1-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}
 .lv1-action{border:1px solid #E5E9F2;background:#fff;border-radius:13px;padding:11px 12px;text-align:left;color:#637087;font-size:11px;font-weight:900;min-height:58px}
 .lv1-action small{display:block;font-size:8.5px;letter-spacing:.08em;color:#A0A7B6;margin-bottom:4px}
 .lv1-action.primary-link{background:#EEF2FF;border-color:#DCE5FF;color:#3E5FCC}.lv1-action.warn{background:#FFF9F0;border-color:#F0DEBD;color:#94631A}.lv1-action.locked{background:#FAFBFD;color:#A0A7B4}
 .detail-drawer{display:none;margin-top:10px;padding:15px;border:1px solid #E5E9F2;border-radius:15px;background:#fff}.detail-drawer.show{display:block}
 .detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.detail-cell{padding:11px 12px;border-radius:12px;background:#F8F9FC;border:1px solid #E5E9F2}.detail-cell small{display:block;font-size:8.5px;letter-spacing:.08em;font-weight:900;color:#9AA2B2;margin-bottom:5px}.detail-cell p{font-size:11px;color:#647088;line-height:1.55}
 .caution-pop{display:none;margin-top:10px;padding:14px;border-radius:14px;background:#FFF9F0;border:1px solid #F1DDB9;color:#7D5A1C;font-size:11.5px;line-height:1.65}.caution-pop.show{display:block}
 .keyword-list button{border:1px solid #E5E9F2;background:#fff;border-radius:999px;padding:7px 9px;font-size:10.5px;font-weight:850;color:#68718A}
 @media(max-width:900px){.lv1-actions{grid-template-columns:1fr 1fr}.detail-grid{grid-template-columns:1fr}}@media(max-width:600px){.stage-banner{grid-template-columns:auto 1fr}.stage-task{grid-column:1/-1}.lv1-actions{grid-template-columns:1fr}}
 `;
 d.head.appendChild(st);
}
function phaseIndex(nodes,phase){
 if(!phase||phase==="잘 모르겠습니다")return -1;
 const keys={"사전기획 / 사업검토":["사업조건","사업성격","입지","대지조건","운영조건"],"기본계획":["기본","규모","대지","계획"],"계획설계":["계획설계","계획","배치","동선"],"중간설계":["중간"],"실시설계":["실시"],"시공·현장 대응":["공사","시공","착공","시운전"]};
 let best=-1,score=0;
 nodes.forEach((n,i)=>(keys[phase]||[]).forEach((k,j)=>{if(n.includes(k)&&100-j>score){score=100-j;best=i}}));
 return best;
}
function patchResult(d,w){
 const r=d.getElementById("projectResult");if(!r||!r.classList.contains("show"))return;
 r.querySelector(".stage-banner")?.remove();
 r.querySelector("#ux134")?.remove();
 const head=[...r.querySelectorAll(".result-head b")].map(x=>x.textContent.trim());
 const project=head[0]||"프로젝트", phase=d.getElementById("phase")?.value||"잘 모르겠습니다", task=d.getElementById("task")?.value||"현재 업무";
 const map=r.querySelector(".lv1-map");if(!map)return;
 const nodes=[...map.querySelectorAll(".lv1-flow .node")], texts=nodes.map(x=>x.textContent.trim()), idx=phaseIndex(texts,phase);
 nodes.forEach((n,i)=>{n.classList.remove("done","current-phase");if(idx>=0&&i<idx)n.classList.add("done");if(i===idx)n.classList.add("current-phase")});
 const banner=d.createElement("div");banner.className="stage-banner";banner.innerHTML=`<div class="stage-badge">${phase==="잘 모르겠습니다"?"?":"NOW"}</div><div class="stage-copy"><small>지금 내가 있는 위치</small><b>${project} · ${phase==="잘 모르겠습니다"?"단계 미상":phase}</b><p>현재 맡은 업무를 전체 프로젝트 흐름 안에서 먼저 연결합니다.</p></div><div class="stage-task">${task}</div>`;r.insertBefore(banner,map);
 const caution=map.querySelector(".lv1-caution"), cautionText=caution?caution.textContent.replace("! 한 가지만 기억","").trim():"프로젝트 이름만으로 모든 인허가를 단정하지 않습니다.";if(caution)caution.style.display="none";
 const kw=map.querySelector(".keyword-list");if(kw){[...kw.querySelectorAll("span")].forEach(sp=>{const b=d.createElement("button");b.type="button";b.textContent=sp.textContent;b.onclick=()=>{w.switchTab("term");const inp=d.getElementById("termInput");if(inp)inp.value=b.textContent;if(w.showTerm)w.showTerm(b.textContent)};sp.replaceWith(b)})}
 const level=Number(w.localStorage.getItem("pc_level")||1),master=level===5||w.localStorage.getItem("pc_master_unlocked")==="1";if(master)w.localStorage.setItem("pc_master_unlocked","1");
 const prev=idx>0?texts[idx-1]:"프로젝트 시작 전 조건 확인",now=idx>=0?texts[idx]:"현재 단계를 선택하지 않았습니다",next=idx>=0&&idx<texts.length-1?texts[idx+1]:"준공·사용 이후 운영 단계";
 const ux=d.createElement("div");ux.id="ux134";ux.innerHTML=`<div class="lv1-actions"><button class="lv1-action primary-link" id="ba134"><small>01 · CONTEXT</small>전후로 어떤 일을 해요?</button><button class="lv1-action" id="ask134"><small>02 · ASK</small>누구에게 물어볼까?</button><button class="lv1-action warn" id="warn134"><small>03 · CAUTION</small>! 주의할 점</button><button class="lv1-action ${level<2&&!master?"locked":""}" id="deep134"><small>04 · ${level<2&&!master?"LOCKED":"DETAIL"}</small>${level<2&&!master?"왜·어디서 확인? 🔒":"왜·어디서 확인?"}</button></div><div id="baDrawer134" class="detail-drawer"><div class="detail-grid"><div class="detail-cell"><small>BEFORE</small><p>${prev}</p></div><div class="detail-cell"><small>NOW</small><p>${now} · ${task}</p></div><div class="detail-cell"><small>NEXT</small><p>${next}</p></div></div></div><div id="warnPop134" class="caution-pop"><b>! 한 가지만 기억</b><br>${cautionText}</div><div id="deepDrawer134" class="detail-drawer"><div class="detail-grid"><div class="detail-cell"><small>WHY</small><p>프로젝트 이름만 보지 말고 실제 용도·사업방식·대지조건을 함께 확인합니다.</p></div><div class="detail-cell"><small>WHERE</small><p>법령·공식 포털·기존 승인도서·관할기관 자료를 순서대로 확인합니다.</p></div><div class="detail-cell"><small>NEXT LEVEL</small><p>책임 단계에서는 실제 체크리스트와 협력업체 조정이 추가됩니다.</p></div></div></div>`;map.appendChild(ux);
 d.getElementById("ba134").onclick=()=>d.getElementById("baDrawer134").classList.toggle("show");
 d.getElementById("warn134").onclick=()=>d.getElementById("warnPop134").classList.toggle("show");
 d.getElementById("ask134").onclick=()=>{w.switchTab("ask");const inp=d.getElementById("askInput");if(inp){inp.value=`${project} 프로젝트에서 ${phase==="잘 모르겠습니다"?"현재 단계":phase}에 ${task} 업무를 하고 있어. 누구에게 먼저 물어보면 돼?`;inp.focus()}};
 d.getElementById("deep134").onclick=()=>{if(level<2&&!master){w.switchTab("quiz");return}d.getElementById("deepDrawer134").classList.toggle("show")};
}
function installQuiz(d,w){
 let qi=0,score=0;
 const start=d.getElementById("startQuizBtn"),submit=d.getElementById("qSubmit"),input=d.getElementById("qInput"),area=d.getElementById("quizArea");
 if(!start||!submit||!input||start.dataset.pc134)return;
 start.dataset.pc134="1";
 function render(){const q=EASY[qi];d.getElementById("qText").textContent=q.q;d.getElementById("qCount").textContent=`QUESTION ${String(qi+1).padStart(2,"0")} / 05`;d.getElementById("qScore").textContent=`${score} CORRECT`;const diff=[...d.querySelectorAll(".qmeta span")].find(x=>x.textContent.includes("난이도"));if(diff)diff.textContent="난이도 · VERY EASY";input.value="";const fb=d.getElementById("qFeedback");fb.className="feedback";fb.textContent="";input.focus()}
 start.addEventListener("click",e=>{e.stopImmediatePropagation();qi=0;score=0;area.classList.add("show");render()},true);
 submit.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();grade()},true);
 input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();grade()}},true);
 function grade(){const raw=input.value;if(norm(raw)===norm(MASTER_KEY)){w.localStorage.setItem("pc_level","5");w.localStorage.setItem("pc_master_unlocked","1");location.reload();return}const q=EASY[qi],fb=d.getElementById("qFeedback");if(same(raw,q.a)){score++;fb.className="feedback show ok";fb.innerHTML=`정답 · <b>${q.ok}</b>`;setTimeout(()=>{if(qi<4){qi++;render()}else{w.localStorage.setItem("pc_level",String(Math.max(2,Number(w.localStorage.getItem("pc_level")||1))));d.getElementById("qText").textContent="승급 완료!";d.getElementById("qScore").textContent="5 CORRECT";}},450)}else{fb.className="feedback show no";fb.textContent="아주 쉬운 복습 문제예요. 띄어쓰기·통상 약칭은 인정합니다. 화면에서 본 핵심 단어를 그대로 입력해보세요."}}
}
function install(){
 const f=document.getElementById("app"),d=f.contentDocument,w=f.contentWindow;if(!d||!w)return;
 injectStyle(d);
 const chip=[...d.querySelectorAll(".topchip")].find(x=>x.textContent.includes("v1.3.1"));if(chip)chip.textContent="v1.3.4 FIX";
 const desc=d.getElementById("quizDesc");if(desc&&Number(w.localStorage.getItem("pc_level")||1)===1)desc.textContent="신입은 무지막지하게 쉽게 갑니다. 방금 화면에서 본 핵심 단어 5개만 복습합니다.";
 installQuiz(d,w);
 const analyze=d.getElementById("analyzeProjectBtn");if(analyze&&!analyze.dataset.pc134){analyze.dataset.pc134="1";analyze.addEventListener("click",()=>setTimeout(()=>patchResult(d,w),0));}
}
document.getElementById("app").addEventListener("load",install);
})();