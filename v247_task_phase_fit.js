(()=>{
'use strict';
const VERSION='2.1.48';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const STATUS={
  prep:['선행 준비 단계','prep'],conditional:['조건 확인 필요','conditional'],
  mismatch:['시점 재확인','mismatch'],normal:['통상 수행 가능','normal']
};
const MATRIX={
  review:{match:/심의.*(?:보고|자료)|심의 보고자료/,phases:{
    '사전기획 / 사업검토':'prep','기본계획':'prep','계획설계':'normal',
    '중간설계':'normal','실시설계':'conditional','시공·현장 대응':'mismatch'}},
  permit:{match:/인허가.*자료|허가자료/,phases:{
    '사전기획 / 사업검토':'prep','기본계획':'prep','계획설계':'conditional',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'conditional'}},
  change:{match:/변경업무|변경허가|변경신고|경미한 변경/,phases:{
    '사전기획 / 사업검토':'conditional','기본계획':'conditional','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'normal'}}
};
const COPY={
  review:{
    prep:['본 심의자료 작성보다 선행 확인일 가능성이 커요','이 단계에서는 심의 대상 여부·예상 시기·주요 쟁점과 요구자료를 먼저 확인하는 경우가 일반적입니다.'],
    conditional:['심의 종류와 현재 절차를 먼저 확인하세요','보완심의·재심의·변경심의라면 가능하지만 일반적인 최초 심의자료 작성 시점과는 다를 수 있습니다.'],
    mismatch:['일반적인 최초 심의자료 작성 시점과 맞지 않을 수 있어요','시공단계라면 변경·보완심의인지, 또는 단계 선택이 잘못됐는지 먼저 확인하세요.']},
  permit:{
    prep:['본 허가 제출자료보다 인허가 경로 확인이 먼저예요','이 단계에서는 메인 승인경로·승인권자·예상 시기·선행 심의와 요구자료를 먼저 정리하는 편이 일반적입니다.'],
    conditional:['어떤 인허가 절차인지 확인해야 답할 수 있어요','건축허가·사업계획승인·시행허가·부분허가·착공·사용승인 등에 따라 적정 시점과 자료가 달라집니다.'],
    mismatch:['현재 단계와 인허가 업무의 시점을 다시 확인하세요','시설명만으로 판단하지 말고 사업방식과 실제 승인경로를 먼저 확인해야 합니다.']},
  change:{
    prep:['행정상 변경절차보다 변경 가능성 검토에 가까울 수 있어요','기존 승인·허가가 아직 없다면 변경허가·변경신고가 아니라 계획안 변경 영향 검토일 가능성이 큽니다.'],
    conditional:['무엇을 기준으로 한 변경인지 먼저 확인하세요','내부 계획안 변경인지 기존 심의·허가·승인도서 변경인지에 따라 업무와 절차가 달라집니다.'],
    mismatch:['현재 변경의 기준도서와 승인경로를 다시 확인하세요','원래 어떤 절차로 결정·승인받았는지 알아야 다음 변경절차를 판단할 수 있습니다.']}
};
const PREP={
  review:{
    why:'본 제출자료를 완성하기 전에 심의 대상 여부와 시기, 계획에 미리 반영할 쟁점을 확인합니다.',
    risk:'대상과 시기를 잘못 잡으면 설계안이 굳은 뒤 큰 범위의 재검토가 생길 수 있어요.',
    done:'심의 종류·대상 여부·예상 시기·주요 쟁점·확인 담당이 정리되면 됩니다.',
    material:'사업방식·용도·규모·현재 계획안·관할 심의 운영기준·유사 심의자료',
    source:'관할기관 심의 안내/조례 → 프로젝트 인허가 계획 → 기존 유사사례 → PM·인허가 담당',
    order:'메인 승인경로 → 심의 대상 여부 → 예상 시기 → 주요 쟁점 → 요구자료 목차',
    steps:['프로젝트의 메인 승인경로와 선행 심의 확인','대상 여부·예상 접수시기·주요 쟁점 정리','확정 목록이 아닌 준비자료 초안과 확인 담당 기록']},
  permit:{
    why:'본 제출도서를 만들기 전에 프로젝트의 승인경로와 승인권자, 필요한 선행절차를 확인합니다.',
    risk:'시설명만 보고 건축허가로 단정하면 실제 사업계획승인·시행허가·특별법 경로를 놓칠 수 있어요.',
    done:'메인 승인경로·승인권자·선행절차·예상 일정·자료 확인처가 정리되면 됩니다.',
    material:'사업방식·용도/규모·과업지시서·기존 승인자료·인허가 일정 초안',
    source:'적용 법체계 → 관할기관 공식 안내 → 기존 프로젝트 승인자료 → PM·인허가 담당',
    order:'시설 유형 → 사업방식 → 적용 법체계 → 메인 승인경로 → 제출자료 확인처',
    steps:['시설 유형과 사업방식을 기준으로 승인경로 후보 정리','승인권자·선행 심의·예상 시기 확인','관할 공식 목록을 받기 위한 질문과 자료 초안 작성']},
  change:{
    why:'행정상 변경절차를 단정하기 전에 무엇을 기준으로 무엇이 바뀌는지 확인합니다.',
    risk:'승인 전 계획변경과 승인 후 변경허가·변경신고를 섞으면 잘못된 절차로 안내할 수 있어요.',
    done:'기준안·변경항목·기존 승인 여부·영향범위·확인 담당이 구분되면 됩니다.',
    material:'기존 결정안/승인도서·변경안·변경사유·변경 전후표·사업 승인경로',
    source:'프로젝트 결정기록 → 기존 심의/허가/승인 문서 → 관련 법령·관할 안내 → PM',
    order:'기준안 → 기존 승인 여부 → 변경 전후 비교 → 영향 추적 → 필요한 절차',
    steps:['변경 기준이 내부 계획안인지 승인도서인지 확인','변경 전후와 도면·법규·분야별 영향 표시','원 승인경로를 기준으로 필요한 절차를 담당자와 확인']}
};
const ACTUAL={
  review:['정확한 심의 종류와 최초·변경·보완 여부 확인','현재 단계에 접수하는 이유와 관할 요구목차 확인','최신 계획안과 협력업체 자료의 기준일을 맞춰 작성'],
  permit:['건축허가·사업계획승인·시행허가 등 정확한 절차명 확인','현재 단계에 제출하는 근거와 승인권자 요구목록 확인','건축·구조·기계·전기·소방 자료의 기준일과 누락 점검'],
  change:['원래 어떤 결정·심의·허가·승인을 받았는지 확인','변경 전후와 영향 도서를 같은 기준으로 비교','변경허가·변경신고·경미한 변경 여부를 담당자와 확정']
};
function selected(){return {task:$('task')?.value||'',phase:$('phase')?.value||''}}
function classify(task,phase){
  const pair=Object.entries(MATRIX).find(([,x])=>x.match.test(task||''));
  return pair&&pair[1].phases[phase]?{key:pair[0],status:pair[1].phases[phase]}:null;
}
function setPending(root,on){
  const a=root.querySelector('.actions');if(!a)return;
  a.classList.toggle('cc247-pending',on);a.setAttribute('aria-hidden',String(on));
}
function closeDrawers(root){
  root.querySelectorAll('.drawer.show').forEach(x=>x.classList.remove('show'));
  root.querySelectorAll('[data-drawer]').forEach(x=>{x.classList.remove('cc-drawer-active');x.setAttribute('aria-expanded','false')});
}
function stepsHTML(steps){return steps.map((x,i)=>'<div><small>0'+(i+1)+'</small><b>'+esc(x)+'</b></div>').join('')}
function applyPrep(root,key,phase){
  const d=PREP[key],why=root.querySelector('[data-pane="why"]'),how=root.querySelector('[data-pane="how"]');
  if(why){
    const title=why.querySelector('.why-title');if(title)title.innerHTML='<span class="cc247-mode">선행 준비</span>'+esc(phase)+'에서 먼저 확인할 내용';
    const first=why.querySelectorAll(':scope > .detail-grid .detail-cell p');
    [d.why,d.risk,d.done].forEach((x,i)=>{if(first[i])first[i].textContent=x});
    const where=why.querySelectorAll('.cc218-where .detail-cell p');
    [d.material,d.source,d.order].forEach((x,i)=>{if(where[i])where[i].textContent=x});
  }
  if(how){
    const title=how.querySelector('.cc232-how-head b');if(title)title.textContent=phase+' · 본 제출 전 확인 순서';
    const note=how.querySelector('.cc232-how-head span');if(note)note.textContent='고정 제출목록보다 적용 절차와 공식 확인처부터 좁히세요.';
    const top=how.querySelector('.cc232-how-steps');if(top)top.innerHTML=stepsHTML(d.steps);
  }
}
function applyActual(root,key,phase){
  const how=root.querySelector('[data-pane="how"]'),why=root.querySelector('[data-pane="why"]');
  if(how){
    const title=how.querySelector('.cc232-how-head b');if(title)title.textContent=phase+' · 실제 절차 확인 후 수행';
    const note=how.querySelector('.cc232-how-head span');if(note)note.textContent='정확한 절차명·승인권자·현재 접수단계를 확인한 경우에만 진행하세요.';
    const top=how.querySelector('.cc232-how-steps');if(top)top.innerHTML=stepsHTML(ACTUAL[key]);
  }
  if(why){
    why.querySelector('.cc247-exception-note')?.remove();
    const n=document.createElement('div');n.className='cc247-exception-note';
    n.innerHTML='<b>예외 절차 확인</b><span>사전심의·부분허가·변경/보완절차·특별법·패스트트랙 등은 프로젝트별로 다릅니다. PM/인허가 담당과 관할 공식 안내로 확인하세요.</span>';
    why.appendChild(n);
  }
}
function resolve(root,gate,key,phase,mode){
  setPending(root,false);gate.classList.add('resolved');gate.dataset.mode=mode;
  if(mode==='actual'){
    gate.querySelector('.cc247-title').textContent='실제 제출·변경 절차로 안내합니다';
    gate.querySelector('.cc247-body').textContent='예외 가능성을 열어두고 정확한 절차명과 승인권자 확인을 우선합니다.';
    applyActual(root,key,phase);
  }else{
    gate.querySelector('.cc247-title').textContent=mode==='prep'?'선행 준비 업무로 안내합니다':'먼저 절차와 시점을 확인하도록 안내합니다';
    gate.querySelector('.cc247-body').textContent='현재 단계에 맞춰 대상·경로·시기·확인처 중심으로 내용을 바꿨어요.';
    applyPrep(root,key,phase);
  }
  gate.querySelector('.cc247-choices')?.remove();
}
function goPhase(){
  if(typeof window.showView==='function')window.showView('home');else document.querySelector('[data-view="home"]')?.click();
  setTimeout(()=>$('phase')?.focus(),80);
}
function render(root,fit){
  root.querySelector('.cc247-fit-gate')?.remove();
  if(!fit||fit.status==='normal'){setPending(root,false);return}
  const phase=selected().phase,copy=COPY[fit.key][fit.status]||COPY[fit.key].conditional,state=STATUS[fit.status];
  const gate=document.createElement('section');gate.className='cc247-fit-gate '+state[1];
  gate.innerHTML='<div class="cc247-fit-copy"><small>'+esc(state[0])+' · '+esc(phase)+'</small><b class="cc247-title">'+esc(copy[0])+'</b><p class="cc247-body">'+esc(copy[1])+'</p></div><div class="cc247-choices"><button type="button" data-fit="prep">'+(fit.status==='prep'?'선행 준비로 보기':'아직 절차를 몰라요')+'</button><button type="button" data-fit="actual">'+(fit.status==='mismatch'?'변경·보완 절차예요':'실제 제출 절차예요')+'</button><button type="button" data-fit="phase">단계 다시 선택</button></div>';
  const stage=root.querySelector('.stage-banner');if(stage)stage.insertAdjacentElement('afterend',gate);else root.prepend(gate);
  closeDrawers(root);setPending(root,true);
  gate.querySelector('[data-fit="prep"]').onclick=()=>resolve(root,gate,fit.key,phase,fit.status==='prep'?'prep':'check');
  gate.querySelector('[data-fit="actual"]').onclick=()=>resolve(root,gate,fit.key,phase,'actual');
  gate.querySelector('[data-fit="phase"]').onclick=goPhase;
}
function enhance(){
  const root=$('contextResult');if(!root||!root.innerHTML.trim())return;
  const s=selected();render(root,classify(s.task,s.phase));
}
function style(){
  if($('cc247Style'))return;const s=document.createElement('style');s.id='cc247Style';
  s.textContent='.cc247-fit-gate{display:flex;justify-content:space-between;gap:18px;align-items:center;margin:12px 0;padding:14px 16px;border:1px solid #D8E5F7;border-radius:14px;background:#F4F8FE}.cc247-fit-gate.conditional{border-color:#E9DFC5;background:#FFF9EE}.cc247-fit-gate.mismatch{border-color:#EED7D7;background:#FFF5F5}.cc247-fit-copy{min-width:0}.cc247-fit-copy small{display:block;color:#3864B0;font-size:8.5px;font-weight:950}.cc247-fit-gate.conditional small{color:#8A672C}.cc247-fit-gate.mismatch small{color:#A55252}.cc247-fit-copy b{display:block;margin-top:4px;color:#314A6B;font-size:13px}.cc247-fit-copy p{margin:4px 0 0;color:#68788D;font-size:10px;line-height:1.5}.cc247-choices{display:flex;flex:0 0 auto;flex-wrap:wrap;justify-content:flex-end;gap:6px}.cc247-choices button{padding:7px 9px;border:1px solid #D7E0EC;border-radius:9px;background:#fff;color:#4F6380;font-size:9px;font-weight:900}.cc247-choices button:first-child{border-color:#8FB1E8;background:#EEF4FF;color:#2E5EB5}.cc247-fit-gate.resolved{padding:11px 14px}.actions.cc247-pending{display:none!important}.cc247-mode{display:inline-flex;margin-right:7px;padding:4px 7px;border-radius:999px;background:#EEF4FF;color:#3565BD;font-size:8.5px;font-weight:950}.cc247-exception-note{display:flex;gap:8px;margin-top:10px;padding:10px 12px;border:1px solid #E9DFC5;border-radius:11px;background:#FFF9EE}.cc247-exception-note b{flex:0 0 auto;color:#856227;font-size:9px}.cc247-exception-note span{color:#6F6553;font-size:9.5px;line-height:1.5}@media(max-width:760px){.cc247-fit-gate{align-items:stretch;flex-direction:column}.cc247-choices{justify-content:flex-start}.cc247-choices button{flex:1 1 auto}.cc247-exception-note{display:grid}}';
  document.head.appendChild(s);
}
function install(){
  style();document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
  document.addEventListener('click',e=>{if(e.target.closest('#analyze'))setTimeout(enhance,390);if(e.target.closest('.master-levels button'))setTimeout(enhance,320)});
  if($('contextResult')?.innerHTML.trim())setTimeout(enhance,430);
  window.CC_TASK_PHASE_FIT={version:VERSION,scope:'priority-3',statuses:Object.keys(STATUS)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
