(()=>{
'use strict';
const $=id=>document.getElementById(id),engine=window.CC_JUDGEMENT;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function level(){return typeof viewLevel==='function'?viewLevel():1}
function conditions(query=''){
 const p=window.CC_PROJECT_STORE.active();
 const type=$('project')?.value||'';
 // Home overrides can describe a different facility; never borrow its saved route.
 const same=!query&&p?.typeId===type;
 return {query,typeId:query?'':type,phase:query?'':$('phase')?.value,task:query?'':$('task')?.value,approvalRoute:same?p.approvalRoute:'unknown',level:level()};
}
function body(model){
 const c=model.topic;
 const links=c.laws.map(name=>'<a target="_blank" rel="noopener noreferrer" href="https://www.law.go.kr/'+(/건축기준$/.test(name)?'행정규칙/':'법령/')+encodeURIComponent(name)+'">'+esc(name)+'</a>').join(' · ');
 const branch=model.level>=4?'<h4>조건이 달라지면 판단도 달라져요</h4><div class="cc268-table-wrap"><table><thead><tr><th scope="col">확인한 조건</th><th scope="col">다음 판단·조치</th></tr></thead><tbody>'+c.branches.map(row=>'<tr><td>'+esc(row[0])+'</td><td>'+esc(row[1])+'</td></tr>').join('')+'</tbody></table></div><h4>협의할 때 이렇게 정리하세요</h4><p>'+esc(c.ask)+'</p><p class="cc268-note">결정 기록: 확인한 문서·기준일 → 채택한 대안과 이유 → 미확인 조건 → 결정권자·재검토 시점</p>':'';
 return '<p>'+esc(c.summary)+'</p><div class="result-grid cc268-checks">'+c.checks.slice(0,model.level===1?1:3).map((x,i)=>'<div class="result-cell"><small>'+String(i+1).padStart(2,'0')+' · 확인 조건</small><p>'+esc(x)+'</p></div>').join('')+'</div>'+(model.level>=2?'<h4>놓치기 쉬운 판단</h4><p>'+esc(c.risk)+'</p>':'')+(model.level>=3?'<h4>현재 단계에서 결정할 범위</h4><p>'+esc(model.stage)+'</p><p>최신 기준자료와 대안별 영향을 정리하고 PM·관련 분야·필요한 승인기관의 확인 결과를 도서에 연결하세요.</p>':'')+branch+'<p class="cc268-note">'+esc(model.evidence)+'</p>'+(links?'<div class="cc268-sources">공식 기준 확인 · '+links+'<p>현행·시행예정 여부와 프로젝트 적용 시점, 관할 기준을 원문에서 확인하세요.</p></div>':'')+(model.level<4?'<p class="cc268-note">기본 판단은 모든 레벨에 공개됩니다. LV4에서는 조건별 분기와 협의·결정 기록까지 구체화됩니다.</p>':'');
}
function context(){
 const root=$('contextResult');if(!root?.children.length)return;
 const input=conditions(),selection=engine.contextTopics(input),model=engine.evaluate({...input,query:selection.primary.title}),old=root.querySelector('.cc268-context');
 const sig=JSON.stringify(input)+'|'+(root.querySelector('.cc247-fit-gate')?.dataset.mode||'');
 if(old?.dataset.signature===sig)return;
 const open=old?.open||false;old?.remove();
 const box=document.createElement('details');box.className='cc268-context';box.dataset.signature=sig;box.open=open;
 box.innerHTML='<summary><span>JUDGEMENT · 판단과 예외</span><b>'+esc(model.topic.title)+'</b><em>조건 확인</em></summary><div class="cc268-body"><span class="cc268-status">'+esc(model.state)+'</span>'+(root.querySelector('.cc247-fit-gate')?'<p class="cc268-note">위에서 선택한 선행 준비·실제 절차의 구분을 먼저 확인하세요. 아래는 그 판단에 필요한 조건입니다.</p>':'')+body(model)+'</div>';
 const bodyNode=box.querySelector('.cc268-body');
 const scope=document.createElement('p');scope.className='cc268-note';scope.textContent='현재 선택한 용도 기준의 검토 가이드입니다. 실제 적용 여부는 사업조건과 승인문서로 확인하세요.';bodyNode.prepend(scope);
 const buttons=items=>items.map(c=>'<button type="button" data-search-query="'+esc(c.title)+'">'+esc(c.title)+'</button>').join('');
 if(selection.related.length){const related=document.createElement('section');related.className='cc268-related';related.innerHTML='<h4>함께 검토할 수 있는 사례</h4><p class="cc268-note">관련 조건을 비교하는 학습 사례예요. 현재 프로젝트에 자동 적용되지 않습니다.</p>'+buttons(selection.related);bodyNode.appendChild(related);}
 const library=document.createElement('details');library.className='cc268-library cc268-related';library.innerHTML='<summary>다른 프로젝트 판단 사례 보기</summary><p class="cc268-note">전체 학습 사례입니다. 선택하면 독립 검색으로 열리며 현재 프로젝트의 용도·승인경로는 바뀌지 않습니다.</p>'+buttons(window.CC_JUDGEMENT_DATA);bodyNode.appendChild(library);
 (root.querySelector('.map')||root).appendChild(box);
}
function render(match,query){
 const input=conditions(query),model=engine.evaluate(input),root=$('searchResult');
 root.classList.remove('cc252-result-root','cc252-detail-open');
 root.innerHTML='<article class="result-card cc268-search"><small>JUDGEMENT · 독립 학습 사례 · 현재 프로젝트에 자동 적용되지 않음</small><h3>'+esc(model.topic.summary)+'</h3>'+body(model)+(model.topics.length>1?'<div class="cc268-related"><h4>함께 확인할 판단</h4>'+model.topics.filter(c=>c.id!==model.topic.id).map(c=>'<button type="button" data-search-query="'+esc(c.title)+'">'+esc(c.title)+'</button>').join(''):'')+'</article>';
 const notice=document.createElement('p');notice.className='cc268-note';notice.textContent='독립 학습 사례 · 현재 프로젝트에 자동 적용되지 않습니다.';root.prepend(notice);
}
function install(){
 window.CC_RUNTIME.registerSearch('judgement',engine.match,render);
 window.CC_RUNTIME.registerContext('judgement',context);
 const style=document.createElement('style');style.id='cc268JudgementStyle';style.textContent=`
 .cc268-chooser{display:grid;gap:7px;margin:12px 0;font-size:13px;color:#536b8e}.cc268-chooser select{width:100%;min-height:44px;border:1px solid #d9e3f1;border-radius:8px;padding:10px;background:#fff;color:#263e60;font:inherit}.cc268-context{margin:14px 0;border:1px solid #d9e3f1;border-radius:14px;background:#fff;overflow:hidden}.cc268-context summary{display:flex;align-items:center;flex-wrap:wrap;gap:8px 14px;padding:16px;cursor:pointer;min-height:48px}.cc268-context summary span{font-size:12px;font-weight:800;color:#456cb0}.cc268-context summary b{font-size:15px;color:#263e60}.cc268-context summary em{margin-left:auto;font-size:12px;font-style:normal;color:#61738e}.cc268-context summary:focus-visible,.cc268-related button:focus-visible{outline:3px solid #467bd1;outline-offset:-3px}.cc268-body{padding:0 18px 18px}.cc268-body p,.cc268-search p{font-size:14px!important;line-height:1.75!important}.cc268-body h4,.cc268-search h4{margin:20px 0 8px;font-size:15px;color:#304d74}.cc268-checks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.cc268-checks>div{padding:12px;background:#f5f8fc;border-radius:10px}.cc268-checks small,.cc268-status{font-size:12px;color:#476da5;font-weight:800}.cc268-table-wrap{overflow-x:auto}.cc268-table-wrap table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.7}.cc268-table-wrap th,.cc268-table-wrap td{padding:12px;text-align:left;border-bottom:1px solid #e1e8f2;vertical-align:top}.cc268-table-wrap th{background:#f2f6fc}.cc268-note{color:#68788f}.cc268-sources{margin-top:14px;font-size:13px}.cc268-sources a{display:inline-block;padding:6px 0;color:#315fa8}.cc268-related button{display:inline-block;padding:12px;margin:4px;border:1px solid #d9e3f1;border-radius:9px;background:#f5f8fc;color:#315b93;cursor:pointer;min-height:44px}@media(max-width:700px){.cc268-checks{grid-template-columns:1fr}.cc268-context summary{display:grid}.cc268-context summary em{margin-left:0}.cc268-body{padding:0 14px 14px}}
 `;document.head.appendChild(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
