(()=>{
const frame=document.getElementById('app');
if(!frame)return;

const QUIZ_PATCHES=[
  {
    old:'프로젝트의 전체 흐름 속에서 지금 내 위치를 보는 탭은?',
    text:'홈에서 업무와 프로젝트를 고른 뒤, 전체 흐름 속 내 위치를 보려면 어떤 버튼을 누르나요?',
    aliases:['내 업무 맥락 보기','내업무맥락보기','업무 맥락 보기','맥락 보기'],
    legacy:'프로젝트 맥락',
    feedback:'내 업무 맥락 보기'
  },
  {
    old:'모르는 건축 용어를 찾아보는 탭은?',
    text:'모르는 건축 용어나 업무를 한 곳에서 찾을 때 사용하는 메뉴는?',
    aliases:['검색','통합검색','통합 검색'],
    legacy:'이 용어는 뭐야',
    feedback:'검색'
  },
  {
    old:'어떤 사람이나 기관에 물어봐야 할지 찾는 탭은?',
    text:'누구에게 물어봐야 할지 모를 때 사용하는 메뉴는?',
    aliases:['검색','통합검색','통합 검색'],
    legacy:'누구에게 물어볼까',
    feedback:'검색'
  }
];
function norm(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,'').replace(/[·ㆍ,./()[\]{}"'`~!@#$%^&*_=+?:;-]/g,'');}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function injectStyle(d){
  if(d.getElementById('pc155Style'))return;
  const st=d.createElement('style');st.id='pc155Style';st.textContent=`
  body.pc155-searchmode #ask .quick{display:none!important}
  body.pc155-searchmode #ask .eyebrow{font-size:0!important}
  body.pc155-searchmode #ask .eyebrow:after{content:'SMART SEARCH';font-size:9px;letter-spacing:.13em;font-weight:950;color:#4C6FFF}
  body.pc155-searchmode #ask h2{font-size:0!important}
  body.pc155-searchmode #ask h2:after{content:'검색 결과';font-size:21px;letter-spacing:-.5px;color:#26324A}
  body.pc155-searchmode #ask>div.card>p.muted{font-size:0!important}
  body.pc155-searchmode #ask>div.card>p.muted:after{content:'질문 내용을 읽고 사내·협력업체·관할기관 중 어디에 먼저 확인할지 안내합니다.';font-size:12px;color:#77819A;line-height:1.6}
  body.pc155-searchmode #askInput{min-height:82px!important;margin-top:13px}
  body.pc155-searchmode #askBtn{margin-top:10px!important}
  body.pc155-searchmode #askBtn{font-size:0!important}
  body.pc155-searchmode #askBtn:after{content:'다시 검색하기 →';font-size:12px}
  .pc155-level{display:none;max-width:800px;margin:0 auto;padding-top:12px}.pc155-level.show{display:block}
  .pc155-level-card{background:#fff;border:1px solid #E5E9F2;border-radius:22px;padding:25px;box-shadow:0 10px 32px rgba(42,58,91,.05)}
  .pc155-level-card small{font-size:9px;letter-spacing:.12em;font-weight:950;color:#4C6FFF}.pc155-level-card h2{margin:8px 0 8px;font-size:25px;letter-spacing:-.7px}.pc155-level-card p{font-size:12px;color:#77819A;line-height:1.65}
  .pc155-level-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:18px}.pc155-level-step{border:1px solid #E8EBF2;border-radius:14px;padding:12px;background:#FAFBFD}.pc155-level-step b{display:block;font-size:10.5px;margin-bottom:4px}.pc155-level-step span{font-size:9px;color:#8B95A9}.pc155-level-step.on{background:#EEF2FF;border-color:#DCE5FF;color:#3F5FCB}
  .pc155-level-actions{display:flex;gap:8px;margin-top:16px}.pc155-level-actions button{border:0;border-radius:11px;padding:10px 13px;font-size:10.5px;font-weight:900}.pc155-level-actions .quiz{background:#4C6FFF;color:#fff}.pc155-level-actions .home{background:#F4F6FA;color:#667188}
  @media(max-width:700px){.pc155-level-grid{grid-template-columns:1fr 1fr}.pc155-level-card{padding:19px}.pc155-level-actions{display:grid;grid-template-columns:1fr 1fr}.pc155-level-actions button{width:100%}}
  `;d.head.appendChild(st);
}

function levelMeta(lv){
  const names=['신입사원','선임','책임','수석','건축 마스터'];
  const subs=['WHAT · 큰 그림','WHY / WHERE · 이유와 찾는 곳','HOW · 실제 수행','JUDGEMENT · 예외 판단','ALL CLEAR'];
  return {name:names[lv-1]||names[0],sub:subs[lv-1]||subs[0]};
}
function installLevelPanel(d){
  if(d.getElementById('pc155Level'))return;
  const inner=d.querySelector('.pc150-main-inner');if(!inner)return;
  const panel=d.createElement('section');panel.id='pc155Level';panel.className='pc155-level';
  inner.appendChild(panel);
  function render(){
    const lv=Math.max(1,Math.min(5,Number(d.defaultView.localStorage.getItem('pc_level')||1)));
    const m=levelMeta(lv);
    const levels=[1,2,3,4].map(n=>`<div class="pc155-level-step ${n===lv?'on':''}"><b>LV.${n} · ${esc(levelMeta(n).name)}</b><span>${esc(levelMeta(n).sub)}</span></div>`).join('');
    panel.innerHTML=`<div class="pc155-level-card"><small>CURRENT LEVEL</small><h2>${lv===5?'LV.MAX':'LV.'+lv} · ${esc(m.name)}</h2><p>${esc(m.sub)} 단계입니다. 레벨이 올라가도 홈 화면의 기능은 늘어나지 않고, 같은 정보가 더 깊게 열리는 구조로 운영합니다.</p><div class="pc155-level-grid">${levels}</div><div class="pc155-level-actions"><button class="quiz" type="button" data-pc155-quiz>승급 퀴즈 보기 →</button><button class="home" type="button" data-pc155-home>홈으로</button></div></div>`;
    panel.querySelector('[data-pc155-quiz]')?.addEventListener('click',()=>{
      panel.classList.remove('show');
      const host=d.getElementById('pc150LegacyHost');if(host)host.style.display='block';
      host?.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
      d.getElementById('quiz')?.classList.add('active');
      const t=d.getElementById('pc150LegacyTitle');if(t)t.textContent='승급 퀴즈';
      d.querySelectorAll('[data-pc150-nav]').forEach(b=>b.classList.toggle('active',b.dataset.pc150Nav==='quiz'));
      d.defaultView.scrollTo({top:0,behavior:'smooth'});
    });
    panel.querySelector('[data-pc155-home]')?.addEventListener('click',()=>d.querySelector('[data-pc150-nav="home"]')?.click());
  }
  function show(){
    render();
    d.body.classList.remove('pc155-searchmode');
    const home=d.getElementById('pc150Home'),work=d.getElementById('pc150Workspace'),host=d.getElementById('pc150LegacyHost');
    if(home)home.style.display='none';if(work)work.style.display='none';if(host)host.style.display='none';
    panel.classList.add('show');
    d.querySelectorAll('[data-pc150-nav]').forEach(b=>b.classList.toggle('active',b.dataset.pc150Nav==='level'));
    d.defaultView.scrollTo({top:0,behavior:'smooth'});
  }
  d.querySelectorAll('[data-pc150-nav="level"]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();show();},true));
  d.querySelectorAll('[data-pc150-nav]').forEach(b=>{if(b.dataset.pc150Nav!=='level')b.addEventListener('click',()=>panel.classList.remove('show'),true);});
}

function searchMode(d){
  const ask=d.getElementById('ask');if(!ask)return;
  const observer=new MutationObserver(()=>{
    const host=d.getElementById('pc150LegacyHost');
    const active=ask.classList.contains('active')&&host&&getComputedStyle(host).display!=='none';
    d.body.classList.toggle('pc155-searchmode',!!active);
  });
  observer.observe(ask,{attributes:true,attributeFilter:['class']});
  const host=d.getElementById('pc150LegacyHost');if(host)observer.observe(host,{attributes:true,attributeFilter:['style']});
}

function quizQuality(d){
  const q=d.getElementById('qText'),input=d.getElementById('qInput'),submit=d.getElementById('qSubmit'),fb=d.getElementById('qFeedback');
  if(!q||!input||!submit||submit.dataset.pc155)return;submit.dataset.pc155='1';
  let current=null,typed='';
  function sync(){
    const raw=q.textContent.trim();
    const p=QUIZ_PATCHES.find(x=>x.old===raw||x.text===raw);
    current=p||null;if(p&&raw!==p.text)q.textContent=p.text;
  }
  const timer=setInterval(()=>{if(!d.body.isConnected){clearInterval(timer);return;}sync();},220);sync();
  function prep(){sync();typed=input.value;if(current&&current.aliases.some(a=>norm(a)===norm(typed)))input.value=current.legacy;}
  function restore(){const p=current,v=typed;if(!p)return;setTimeout(()=>{if(input&&v)input.value=v;if(fb&&/정답/.test(fb.textContent))fb.innerHTML=`정답 · <b>${esc(p.feedback)}</b>`;},25);}
  submit.addEventListener('click',()=>{prep();restore();},true);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){prep();restore();}},true);
}
function version(d){d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>x.textContent='v1.5.5');const chip=[...d.querySelectorAll('.topchip')].find(x=>/^v1\./.test(x.textContent.trim()));if(chip)chip.textContent='v1.5.5 · 5C';}
function install(attempt=0){
  const d=frame.contentDocument;if(!d||!d.getElementById('pc150Shell')){if(attempt<25)setTimeout(()=>install(attempt+1),100);return;}
  if(d.body.dataset.pc155)return;d.body.dataset.pc155='1';
  injectStyle(d);installLevelPanel(d);searchMode(d);quizQuality(d);version(d);
  setInterval(()=>version(d),700);
}
frame.addEventListener('load',()=>install());if(frame.contentDocument?.readyState==='complete')install();
})();