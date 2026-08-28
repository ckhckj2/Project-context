(()=>{
const LEVELS=[
  {lv:1,label:'신입사원',sub:'LV.1'},
  {lv:2,label:'선임',sub:'LV.2'},
  {lv:3,label:'책임',sub:'LV.3'},
  {lv:4,label:'수석',sub:'LV.4'},
  {lv:5,label:'건축 마스터',sub:'LV.MAX'}
];
function install(){
  const frame=document.getElementById('app');
  const d=frame?.contentDocument,w=frame?.contentWindow;
  if(!d||!w)return;

  const ls=w.localStorage;
  const current=Number(ls.getItem('pc_level')||1);
  const unlocked=ls.getItem('pc_master_unlocked')==='1';
  const certified=ls.getItem('pc_master_certified')==='1'||current===5||unlocked;
  if(current===5||unlocked)ls.setItem('pc_master_certified','1');
  if(!certified)return;

  if(!d.getElementById('pc135style')){
    const st=d.createElement('style');st.id='pc135style';st.textContent=`
      .master-preview-bar{margin:0 0 14px;padding:11px 12px;border:1px solid #E5D69F;border-radius:16px;background:linear-gradient(90deg,#FFFBEB,#F7F2FF);box-shadow:0 8px 24px rgba(119,92,24,.06);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .master-preview-copy{min-width:150px;margin-right:auto}.master-preview-copy small{display:block;font-size:8.5px;letter-spacing:.11em;font-weight:950;color:#9B8140;margin-bottom:3px}.master-preview-copy b{font-size:11.5px;color:#725C25}
      .master-preview-levels{display:flex;gap:6px;flex-wrap:wrap}.master-preview-btn{border:1px solid #E6E1D3;background:rgba(255,255,255,.78);color:#766F62;border-radius:999px;padding:7px 10px;font-size:10.5px;font-weight:900}.master-preview-btn.active{background:#5A62D7;color:#fff;border-color:#5A62D7;box-shadow:0 6px 15px rgba(90,98,215,.18)}.master-preview-btn.master.active{background:linear-gradient(135deg,#705BD2,#B58A2D);border-color:transparent}.master-preview-note{width:100%;font-size:9.5px;color:#9A8E72;line-height:1.45}
      @media(max-width:700px){.master-preview-copy{width:100%}.master-preview-levels{width:100%}.master-preview-btn{flex:1;text-align:center;min-width:92px}}
    `;d.head.appendChild(st);
  }

  d.getElementById('masterPreview135')?.remove();
  const bar=d.createElement('div');bar.id='masterPreview135';bar.className='master-preview-bar';
  bar.innerHTML=`<div class="master-preview-copy"><small>MASTER TEST MODE</small><b>레벨별 화면 미리보기</b></div><div class="master-preview-levels">${LEVELS.map(x=>`<button type="button" class="master-preview-btn ${x.lv===current?'active':''} ${x.lv===5?'master':''}" data-preview-level="${x.lv}">${x.sub} · ${x.label}</button>`).join('')}</div><div class="master-preview-note">마스터 자격은 유지됩니다. 신입·선임·책임·수석을 선택하면 해당 레벨 사용자가 보는 잠금/콘텐츠 상태를 그대로 미리보고, ‘건축 마스터’를 누르면 전체 언락 상태로 돌아옵니다.</div>`;
  const tabs=d.querySelector('.tabs');
  if(tabs)tabs.parentNode.insertBefore(bar,tabs);
  else d.querySelector('.app')?.prepend(bar);

  bar.querySelectorAll('[data-preview-level]').forEach(btn=>btn.addEventListener('click',()=>{
    const lv=Number(btn.dataset.previewLevel);
    ls.setItem('pc_master_certified','1');
    ls.setItem('pc_master_preview_level',String(lv));
    ls.setItem('pc_level',String(lv));
    if(lv===5)ls.setItem('pc_master_unlocked','1');
    else ls.setItem('pc_master_unlocked','0');
    window.location.reload();
  }));
}
const frame=document.getElementById('app');
if(frame){
  frame.addEventListener('load',()=>setTimeout(install,80));
  if(frame.contentDocument?.readyState==='complete')setTimeout(install,80);
}
})();