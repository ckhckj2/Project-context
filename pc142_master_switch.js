(()=>{
const bar=document.getElementById("masterSwitch");
const frame=document.getElementById("app");
const buttons=[...document.querySelectorAll(".master-btn")];

function isCertified(){
  const lv=Number(localStorage.getItem("pc_level")||1);
  const unlocked=localStorage.getItem("pc_master_unlocked")==="1";
  const certified=localStorage.getItem("pc_master_certified")==="1";
  if(lv===5||unlocked){localStorage.setItem("pc_master_certified","1");return true;}
  return certified;
}
function ensureProgress(){
  if(localStorage.getItem("pc_progress_level"))return;
  const current=Number(localStorage.getItem("pc_level")||1);
  localStorage.setItem("pc_progress_level",String(isCertified()?1:current));
}
function render(){
  ensureProgress();
  if(!isCertified()){bar.classList.remove("show");return;}
  bar.classList.add("show");
  const lv=Number(localStorage.getItem("pc_level")||5);
  buttons.forEach(b=>b.classList.toggle("active",Number(b.dataset.level)===lv));
}
function forceCloseCurrentOverlay(){
  try{
    const d=frame.contentDocument;
    const ov=d?.getElementById("masterOverlay");
    ov?.classList.remove("show","pc157-show");
    d?.body?.classList.remove("pc159-master-overlay-open");
    d?.querySelector(".pc157-confetti")?.remove();
  }catch(_){ }
}
function setPreviewLevel(lv){
  forceCloseCurrentOverlay();
  localStorage.setItem("pc_master_certified","1");
  localStorage.setItem("pc_master_preview_level",String(lv));
  localStorage.setItem("pc_level",String(lv));
  localStorage.setItem("pc_master_unlocked",lv===5?"1":"0");
  if(lv===5)localStorage.setItem("pc_master_show_bling","1");
  else localStorage.removeItem("pc_master_show_bling");
  buttons.forEach(b=>b.classList.toggle("active",Number(b.dataset.level)===lv));
  frame.src="./project_context_v1_3_1_interactive.html?v=159&preview="+lv+"&t="+Date.now();
}
buttons.forEach(btn=>{
  btn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setPreviewLevel(Number(btn.dataset.level));});
});
frame.addEventListener("load",()=>setTimeout(render,60));
window.addEventListener("pageshow",render);
render();
})();