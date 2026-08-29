(()=>{
const frame=document.getElementById('app');
if(!frame)return;
const OLD=[
 '운수시설에서 건축설계와 함께 중요한 외부 협의 대상은?',
 '운수시설은 철도·버스·공항 등 운영 주체와 협의가 필요한 경우가 많습니다. 건축설계 외에 어떤 기관들과 협의해야 하나요?'
];
const NEW='철도역사 계획 중 승객 동선·운영시간처럼 건축팀이 임의로 정할 수 없는 운영조건이 생겼습니다. 이런 조건은 먼저 누구와 협의해야 할까요?';
const ALIASES=['철도 운영기관','철도운영기관','운영기관','철도 운영주체','철도운영주체','운영주체','철도 사업주체','철도사업주체','사업주체','철도운영자','철도 운영자','철도사업자','철도 사업자'];
function norm(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,'').replace(/[·ㆍ,./()[\]{}"'`~!@#$%^&*_=+?:;-]/g,'');}
function install(attempt=0){
 const d=frame.contentDocument;if(!d||!d.getElementById('qText')){if(attempt<20)setTimeout(()=>install(attempt+1),100);return;}
 if(d.body.dataset.pc154)return;d.body.dataset.pc154='1';
 const q=d.getElementById('qText'),input=d.getElementById('qInput'),submit=d.getElementById('qSubmit'),fb=d.getElementById('qFeedback');
 let patched=false,typed='';
 function sync(){const t=q.textContent.trim();patched=OLD.includes(t)||t===NEW;if(OLD.includes(t))q.textContent=NEW;}
 sync();
 const timer=setInterval(()=>{if(!d.body.isConnected){clearInterval(timer);return;}sync();},250);
 function prepare(){sync();if(!patched||!input)return;typed=input.value;if(ALIASES.some(a=>norm(a)===norm(typed)))input.value='관계기관';}
 function restoreFeedback(){if(!patched)return;setTimeout(()=>{if(input&&typed)input.value=typed;if(fb&&/정답/.test(fb.textContent)&&/관계기관/.test(fb.textContent))fb.innerHTML='정답 · <b>철도 운영기관 / 사업주체</b>';},20);}
 submit?.addEventListener('click',()=>{prepare();restoreFeedback();},true);
 input?.addEventListener('keydown',e=>{if(e.key==='Enter'){prepare();restoreFeedback();}},true);
 d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>x.textContent='v1.5.4');
}
frame.addEventListener('load',()=>install());if(frame.contentDocument?.readyState==='complete')install();
})();