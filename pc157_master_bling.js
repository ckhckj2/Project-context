(()=>{
const frame=document.getElementById('app');
if(!frame)return;
const VERSION='1.5.7';

function injectStyle(d){
  if(d.getElementById('pc157Style'))return;
  const st=d.createElement('style');st.id='pc157Style';st.textContent=`
  body.pc157-master{background:radial-gradient(circle at 12% 0%,rgba(245,190,60,.14),transparent 26%),radial-gradient(circle at 90% 8%,rgba(126,92,220,.14),transparent 24%),#F7F6FB!important}
  body.pc157-master .pc150-side{background:linear-gradient(180deg,#FFFDF5 0%,#FFFFFF 28%,#FAF8FF 100%)}
  body.pc157-master .pc150-logo{background:linear-gradient(135deg,#FFE8A3,#EEE5FF)!important;color:#7651C6!important;box-shadow:0 6px 16px rgba(168,126,31,.16)}
  body.pc157-master .pc150-level-card{border-color:#E8D69B!important;background:linear-gradient(145deg,#FFF9DD,#F7F1FF)!important;box-shadow:0 10px 30px rgba(118,82,174,.10)!important}
  body.pc157-master .pc150-level-card small{color:#A47A19!important}body.pc157-master .pc150-level-card b{color:#6F51B7!important}
  .pc157-master-card{position:relative;overflow:hidden!important;text-align:center!important;border:1px solid #E5D18C!important;background:linear-gradient(145deg,#FFF7CB 0%,#FFFDF3 24%,#F1E9FF 68%,#EAF3FF 100%)!important;box-shadow:0 24px 70px rgba(92,66,160,.18)!important;padding:34px 28px!important}
  .pc157-master-card:before{content:'';position:absolute;inset:-65%;background:conic-gradient(from 20deg,transparent 0 17%,rgba(255,255,255,.85) 21%,transparent 25% 50%,rgba(255,255,255,.55) 54%,transparent 60%);animation:pc157spin 7s linear infinite;pointer-events:none}
  .pc157-master-card>*{position:relative;z-index:1}.pc157-crown{font-size:66px;line-height:1;filter:drop-shadow(0 10px 14px rgba(137,98,0,.22));animation:pc157float 1.8s ease-in-out infinite;margin-bottom:7px}.pc157-legend{font-size:9px;letter-spacing:.22em;font-weight:1000;color:#9B751D;margin-bottom:6px}.pc157-master-card h2{font-size:36px!important;letter-spacing:5px!important;margin:5px 0 4px!important;color:#513A96!important;text-shadow:0 2px 0 rgba(255,255,255,.8)}
  .pc157-max{font-size:11px;font-weight:1000;letter-spacing:.16em;color:#B07C19;margin-bottom:12px}.pc157-master-copy{font-size:12px!important;color:#756A83!important;margin:0 auto!important;max-width:620px}.pc157-stamps{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:18px 0}.pc157-stamps span{border:1px solid rgba(124,91,194,.18);background:rgba(255,255,255,.66);border-radius:999px;padding:7px 10px;font-size:9px;font-weight:950;color:#7256A8}.pc157-master-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.pc157-master-actions button{border:0;border-radius:12px;padding:11px 15px;font-size:10.5px;font-weight:950;touch-action:manipulation}.pc157-replay{color:#fff;background:linear-gradient(135deg,#7757D3,#C49526);box-shadow:0 9px 22px rgba(113,81,188,.2)}.pc157-home{background:rgba(255,255,255,.72);color:#6C617B;border:1px solid rgba(121,94,166,.14)!important}
  .pc157-confetti{position:fixed;inset:0;z-index:10050;pointer-events:none;overflow:hidden}.pc157-confetti i{position:absolute;top:-9vh;left:var(--x);width:9px;height:15px;border-radius:3px;background:var(--c);transform:rotate(var(--r));animation:pc157fall var(--d) cubic-bezier(.18,.72,.34,1) var(--delay) forwards;opacity:.96}
  #masterOverlay.pc157-show{display:flex!important;z-index:10040!important;background:radial-gradient(circle at center,rgba(61,45,99,.50),rgba(24,23,40,.80))!important;backdrop-filter:blur(8px)!important}
  #masterOverlay.pc157-show .master-box{width:min(700px,94vw)!important;padding:42px 30px 34px!important;border-radius:32px!important;background:linear-gradient(145deg,#FFF5B8,#FFFDF5 28%,#EEE5FF 67%,#E7F2FF)!important;border:2px solid rgba(255,230,145,.95)!important;box-shadow:0 34px 110px rgba(22,18,43,.42),0 0 0 7px rgba(255,255,255,.12)!important}
  #masterOverlay.pc157-show .master-box:before{inset:-70%!important;background:conic-gradient(from 0deg,transparent 0 18%,rgba(255,255,255,.9) 22%,transparent 27% 50%,rgba(255,255,255,.65) 55%,transparent 60%)!important;animation:pc157spin 5s linear infinite!important}
  #masterOverlay.pc157-show .master-crown{font-size:74px!important;animation:pc157float 1.5s ease-in-out infinite!important}#masterOverlay.pc157-show .master-title{font-size:39px!important;letter-spacing:7px!important;color:#4F3790!important;margin:9px 0 7px!important}#masterOverlay.pc157-show .master-sub{font-size:13px!important;color:#6E6579!important;line-height:1.7!important}#masterOverlay.pc157-show #closeMaster{background:linear-gradient(135deg,#7355D0,#C69A2A)!important;box-shadow:0 10px 24px rgba(107,76,181,.25)!important}
  .pc157-overlay-badge{display:inline-block;margin:8px 0 2px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.58);border:1px solid rgba(157,119,28,.22);font-size:9px;font-weight:1000;letter-spacing:.15em;color:#98731D}.pc157-overlay-stars{font-size:18px;letter-spacing:8px;margin-top:12px;animation:pc157pulse 1s ease-in-out infinite alternate}
  @keyframes pc157spin{to{transform:rotate(360deg)}}@keyframes pc157float{50%{transform:translateY(-7px) rotate(-2deg)}}@keyframes pc157pulse{to{transform:scale(1.06);filter:brightness(1.15)}}@keyframes pc157fall{0%{transform:translate3d(0,-12vh,0) rotate(var(--r));opacity:1}100%{transform:translate3d(var(--drift),112vh,0) rotate(calc(var(--r) + 720deg));opacity:.9}}
  @media(max-width:700px){.pc157-master-card{padding:28px 17px!important}.pc157-master-card h2{font-size:29px!important;letter-spacing:3px!important}.pc157-crown{font-size:56px}#masterOverlay.pc157-show .master-title{font-size:31px!important;letter-spacing:4px!important}.pc157-master-actions{display:grid;grid-template-columns:1fr}.pc157-master-actions button{width:100%}}
  @media(prefers-reduced-motion:reduce){.pc157-master-card:before,#masterOverlay.pc157-show .master-box:before,.pc157-crown,#masterOverlay.pc157-show .master-crown,.pc157-overlay-stars,.pc157-confetti i{animation:none!important}.pc157-confetti{display:none!important}}
  `;d.head.appendChild(st);
}

function confetti(d){
  d.querySelector('.pc157-confetti')?.remove();
  const layer=d.createElement('div');layer.className='pc157-confetti';
  const colors=['#F3B82F','#7657D4','#4C6FFF','#E77373','#38A984','#FFDA68'];
  for(let i=0;i<46;i++){
    const p=d.createElement('i');
    const x=(i*37%101),r=(i*53%360),dur=(2.6+(i%9)*.17).toFixed(2),delay=((i%11)*.045).toFixed(2),drift=((i%2?1:-1)*(20+(i%7)*6));
    p.style.cssText=`--x:${x}%;--r:${r}deg;--d:${dur}s;--delay:${delay}s;--drift:${drift}px;--c:${colors[i%colors.length]}`;
    layer.appendChild(p);
  }
  d.body.appendChild(layer);setTimeout(()=>layer.remove(),5000);
}

function decorateOverlay(d){
  const ov=d.getElementById('masterOverlay');if(!ov)return;
  ov.classList.add('pc157-show');
  const crown=ov.querySelector('.master-crown');if(crown)crown.textContent='👑✨';
  const eyebrow=ov.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='PROJECT CONTEXT · LEGENDARY ALL CLEAR';
  const title=ov.querySelector('.master-title');if(title)title.textContent='건 축 마 스 터';
  const sub=ov.querySelector('.master-sub');if(sub)sub.textContent='축하합니다. 이제 적어도 “누구한테 물어봐야 하지?”는 압니다. 이제부터는 모르면 검색하고, 애매하면 확인하고, 혼자 단정하지 않습니다.';
  const content=ov.querySelector('.master-content');
  if(content&&!content.querySelector('.pc157-overlay-badge')){
    const badge=d.createElement('div');badge.className='pc157-overlay-badge';badge.textContent='LV.MAX · ARCHITECTURE MASTER';
    title?.insertAdjacentElement('beforebegin',badge);
    const stars=d.createElement('div');stars.className='pc157-overlay-stars';stars.textContent='✦ ✧ ✦ ✧ ✦';
    sub?.insertAdjacentElement('afterend',stars);
  }
  const close=ov.querySelector('#closeMaster');if(close)close.textContent='간지 유지하고 계속하기 →';
}
function showFanfare(d){
  if(Number(d.defaultView.localStorage.getItem('pc_level')||1)!==5)return;
  const ov=d.getElementById('masterOverlay');if(!ov)return;
  decorateOverlay(d);ov.classList.add('show','pc157-show');confetti(d);
}

function decorateLevel(d){
  const lv=Number(d.defaultView.localStorage.getItem('pc_level')||1);
  d.body.classList.toggle('pc157-master',lv===5);
  if(lv!==5)return;
  const panel=d.getElementById('pc155Level');if(!panel||!panel.classList.contains('show'))return;
  const card=panel.querySelector('.pc155-level-card');if(!card||card.dataset.pc157)return;
  card.dataset.pc157='1';card.classList.add('pc157-master-card');
  card.innerHTML=`<div class="pc157-crown">👑✨</div><div class="pc157-legend">PROJECT CONTEXT · LEGENDARY CLASS</div><h2>건 축 마 스 터</h2><div class="pc157-max">LV.MAX · ARCHITECTURE MASTER</div><p class="pc157-master-copy">축하합니다. 이제 적어도 “누구한테 물어봐야 하지?”는 압니다.<br>모르면 검색 · 애매하면 확인 · 혼자 단정 금지.</p><div class="pc157-stamps"><span>WHAT ✓</span><span>WHY / WHERE ✓</span><span>HOW ✓</span><span>JUDGEMENT ✓</span></div><div class="pc157-master-actions"><button type="button" class="pc157-replay">🎺 마스터 입장 연출 다시보기</button><button type="button" class="pc157-home">아무렇지 않은 척 홈으로</button></div>`;
  card.querySelector('.pc157-replay')?.addEventListener('click',()=>showFanfare(d));
  card.querySelector('.pc157-home')?.addEventListener('click',()=>d.querySelector('[data-pc150-nav="home"]')?.click());
}

function pinVersion(d){
  d.querySelectorAll('.pc150-version,.pc150-mobile-version').forEach(x=>{if(x.textContent!=='v'+VERSION)x.textContent='v'+VERSION;});
}
function install(attempt=0){
  const d=frame.contentDocument;if(!d||!d.getElementById('pc150Shell')){if(attempt<30)setTimeout(()=>install(attempt+1),100);return;}
  if(d.body.dataset.pc157)return;d.body.dataset.pc157='1';
  injectStyle(d);pinVersion(d);decorateOverlay(d);decorateLevel(d);
  d.querySelectorAll('[data-pc150-nav="level"]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>decorateLevel(d),30),true));
  const panel=d.getElementById('pc155Level');if(panel)new MutationObserver(()=>setTimeout(()=>decorateLevel(d),0)).observe(panel,{attributes:true,attributeFilter:['class'],childList:true,subtree:false});
  const ov=d.getElementById('masterOverlay');if(ov)new MutationObserver(()=>{if(ov.classList.contains('show')){decorateOverlay(d);confetti(d);}}).observe(ov,{attributes:true,attributeFilter:['class']});
  const wants=localStorage.getItem('pc_master_show_bling')==='1';if(wants){localStorage.removeItem('pc_master_show_bling');setTimeout(()=>showFanfare(d),220);}
  setInterval(()=>{pinVersion(d);d.body.classList.toggle('pc157-master',Number(d.defaultView.localStorage.getItem('pc_level')||1)===5);},300);
}
frame.addEventListener('load',()=>install());if(frame.contentDocument?.readyState==='complete')install();
})();