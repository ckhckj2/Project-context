(()=>{
'use strict';
const VERSION='2.1.5';
const ICONS=[
`<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M7 5.5h18a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-8.8l-6.1 4.7v-4.7H7a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3Z"/><path fill="#fff" d="M14.7 19.5h2.6v2.7h-2.6Zm1.3-10c-2.4 0-4.1 1.3-4.4 3.5h2.8c.2-.9.8-1.4 1.8-1.4 1.1 0 1.8.6 1.8 1.5 0 .8-.4 1.2-1.5 1.9-1.2.8-1.8 1.8-1.7 3.2h2.5c0-.9.2-1.3 1.4-2.1 1.3-.9 2.1-1.9 2.1-3.3 0-2-1.8-3.3-4.8-3.3Z"/></svg>`,
`<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="10" r="4.2" fill="currentColor"/><circle cx="21.3" cy="11.1" r="3.3" fill="currentColor" opacity=".92"/><path fill="currentColor" d="M4.7 25.8c.5-5.2 3.1-8 7.4-8s6.9 2.8 7.4 8H4.7Z"/><path fill="currentColor" d="M18.1 18.4c1-.5 2.1-.7 3.3-.7 3.9 0 6.2 2.5 6.6 7.3h-6.4c-.3-2.9-1.5-5.1-3.5-6.6Z" opacity=".92"/></svg>`,
`<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M8 3.8h10.2L25 10.6v17.6H8z"/><path fill="#fff" d="M18.2 3.8v7h6.8z" opacity=".9"/><rect x="11.5" y="14" width="10" height="1.8" rx=".9" fill="#fff"/><rect x="11.5" y="18" width="10" height="1.8" rx=".9" fill="#fff"/><rect x="11.5" y="22" width="7.6" height="1.8" rx=".9" fill="#fff"/></svg>`,
`<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="13.6" cy="13.6" r="7.2" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="m19 19 7.2 7.2" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>`
];
const COPY=[
 ['왜 이 업무를 하나요?','업무의 목적, 배경, 핵심 포인트를 명확히 이해할 수 있습니다.'],
 ['누구에게 물어볼까요?','업무별 담당자와 협업 포인트, 문의 채널을 안내해 드립니다.'],
 ['어디서 확인하나요?','관련 도서·도면·법규·기준 등 신뢰할 수 있는 자료를 찾아드립니다.'],
 ['용어 찾기','어려운 건축 용어의 의미와 활용 맥락을 설명해 드립니다.']
];
function install(){
 const cards=[...document.querySelectorAll('.cc-help-grid .cc-help-card')];
 cards.forEach((card,i)=>{
   const icon=card.querySelector('.cc-help-icon');
   const title=card.querySelector(':scope>b');
   const desc=[...card.children].find(el=>el.tagName==='SPAN'&&!el.classList.contains('cc-help-icon'));
   if(icon)icon.innerHTML=ICONS[i]||'';
   if(title)title.textContent=COPY[i]?.[0]||title.textContent;
   if(desc)desc.textContent=COPY[i]?.[1]||desc.textContent;
 });
 
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
