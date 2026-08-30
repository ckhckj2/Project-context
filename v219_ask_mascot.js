(()=>{
'use strict';
const VERSION='2.1.9';
const MASCOT=`<svg viewBox="0 0 180 170" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="cc219Body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B7BF5"/><stop offset="1" stop-color="#245FCB"/></linearGradient>
    <linearGradient id="cc219Clip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#74A0FF"/><stop offset="1" stop-color="#5D78DF"/></linearGradient>
  </defs>
  <ellipse class="cc219-shadow" cx="112" cy="159" rx="48" ry="7" fill="#BDD3F5" opacity=".34"/>
  <g fill="#8FB4FF" opacity=".9">
    <path d="M149 25h3v7h7v3h-7v7h-3v-7h-7v-3h7z"/>
    <path d="M164 58h2v5h5v2h-5v5h-2v-5h-5v-2h5z" opacity=".7"/>
    <path d="M54 73h2.5v6h6v2.5h-6v6H54v-6h-6v-2.5h6z" opacity=".55"/>
  </g>
  <g class="cc219-body">
    <ellipse cx="112" cy="122" rx="47" ry="42" fill="url(#cc219Body)"/>
    <ellipse cx="74" cy="126" rx="17" ry="27" fill="#2D6BDD" transform="rotate(18 74 126)"/>
    <ellipse cx="149" cy="126" rx="17" ry="27" fill="#2A65D2" transform="rotate(-18 149 126)"/>
    <ellipse cx="112" cy="82" rx="31" ry="33" fill="#FCFDFF"/>
    <path d="M77 69c2-26 15-40 35-40s33 14 35 40z" fill="#FFFFFF"/>
    <path d="M82 66h60c-3-18-14-29-30-29S85 48 82 66z" fill="#EAF1FF"/>
    <rect x="104" y="31" width="16" height="22" rx="5" fill="#2F72F1"/>
    <rect x="99" y="37" width="26" height="10" rx="5" fill="#2F72F1"/>
    <path d="M76 66h72c1 0 2 1 2 2v2c0 2-1 3-3 3H77c-2 0-3-1-3-3v-2c0-1 1-2 2-2z" fill="#FFFFFF"/>
    <circle cx="101" cy="82" r="3.2" fill="#17315C"/>
    <circle cx="123" cy="82" r="3.2" fill="#17315C"/>
    <path d="M104 94c5 5 11 5 16 0" fill="none" stroke="#17315C" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="95" cy="91" r="3" fill="#F0B7C5" opacity=".55"/>
    <circle cx="129" cy="91" r="3" fill="#F0B7C5" opacity=".55"/>
    <g transform="rotate(-7 115 135)">
      <rect x="92" y="111" width="48" height="52" rx="6" fill="url(#cc219Clip)"/>
      <rect x="105" y="106" width="22" height="9" rx="4.5" fill="#DCE8FF"/>
      <rect x="100" y="123" width="31" height="4" rx="2" fill="#DDE7FF" opacity=".92"/>
      <rect x="100" y="132" width="25" height="4" rx="2" fill="#DDE7FF" opacity=".82"/>
      <rect x="100" y="141" width="29" height="4" rx="2" fill="#DDE7FF" opacity=".72"/>
    </g>
    <ellipse cx="86" cy="138" rx="9" ry="7" fill="#3475E6" transform="rotate(20 86 138)"/>
    <ellipse cx="143" cy="137" rx="9" ry="7" fill="#2866D5" transform="rotate(-20 143 137)"/>
  </g>
</svg>`;
function install(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  const card=document.querySelector('.cc-ask-card');
  if(!card)return;
  const title=card.querySelector('.cc-ask-title');
  if(title) title.innerHTML='무엇이든 물어보세요, <b>척척</b>이 도와드릴게요!';
  const input=card.querySelector('#homeSearch');
  if(input) input.placeholder='예) 책임님께 업무를 요청받았어요. 어떻게 진행하면 좋을까요?';
  const qs=[...card.querySelectorAll('.cc-popular-questions button')];
  const labels=['# 법규 검토는 어떻게 하나요?','# QGIS 활용 방법이 궁금합니다.','# 지번 확인은 어디서 하나요?'];
  qs.forEach((q,i)=>{if(labels[i])q.textContent=labels[i]});
  const fig=card.querySelector('.cc-helper-figure');
  if(fig) fig.innerHTML=MASCOT;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
