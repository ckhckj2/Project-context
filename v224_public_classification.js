(()=>{
'use strict';
const VERSION='2.1.24';
const GROUP='공공 프로젝트 · 발주/사업 성격';
const PUBLIC_PROJECTS=[
  {
    group:GROUP,id:'correctional',label:'교정시설',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','보안·운영 프로그램 정리','기본·계획설계','관계기관·운영부서 협의','심의·인허가(해당 시)','중간·실시설계','공사·감리','준공·인수'],
    caution:'“공공시설” 자체가 하나의 건축법상 용도나 별도 인허가 경로를 뜻하지는 않습니다. 교정시설은 보안구역, 수용·직원·방문 동선, 운영기준과 발주기관 요구조건을 초기부터 함께 확인하세요.'
  },
  {
    group:GROUP,id:'court',label:'법원·사법시설',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','재판·민원·업무 프로그램 정리','공개·비공개 동선 계획','기본·계획설계','관계부서 협의','심의·인허가(해당 시)','중간·실시설계','공사·감리','준공·인수'],
    caution:'법원·사법시설은 공개영역, 업무영역, 보안영역의 분리가 중요합니다. 시설명만으로 절차를 정하지 말고 발주주체·사업방식·과업지시서와 실제 건축법상 용도를 함께 확인하세요.'
  },
  {
    group:GROUP,id:'publicoffice',label:'행정청사·공공업무시설',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','민원·업무 프로그램 정리','기본·계획설계','사용부서·발주처 협의','심의·인허가(해당 시)','중간·실시설계','공사·감리','준공·인수'],
    caution:'공공청사라고 해서 민간 업무시설과 완전히 다른 건축인허가를 자동으로 적용하는 것은 아닙니다. 발주 절차와 건축 인허가를 구분하고, 민원·업무·보안·유지관리 요구를 함께 보세요.'
  },
  {
    group:GROUP,id:'publicmuseum',label:'박물관·미술관 등 문화시설',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','전시·수장·운영 프로그램 정리','기본·계획설계','전시·운영부서 협의','심의·인허가(해당 시)','중간·실시설계','전시설계·건축 조정','공사·감리','준공·인수'],
    caution:'박물관·미술관은 관람공간만 보지 말고 작품 반입, 수장, 온습도·조명, 보안, 운영 동선을 같이 검토하세요. 공공 발주 여부와 건축법상 세부 용도는 별개로 확인합니다.'
  },
  {
    group:GROUP,id:'publiclibrary',label:'도서관',
    flow:['발주주체·사업방식 확인','부지·과업조건 확인','열람·장서·운영 프로그램 정리','기본·계획설계','운영부서·발주처 협의','심의·인허가(해당 시)','중간·실시설계','공사·감리','준공·인수'],
    caution:'도서관은 열람공간뿐 아니라 장서, 서가하중, 자료이동, 어린이·일반 이용자, 운영·관리 동선을 함께 봅니다. 공공 프로젝트의 발주 절차와 건축 인허가 절차는 구분해서 확인하세요.'
  }
];
function addData(){
  if(typeof PROJECTS==='undefined')return;
  PUBLIC_PROJECTS.forEach(p=>{if(!PROJECTS.some(x=>x.id===p.id))PROJECTS.push(p);});
}
function addSelectOptions(){
  const select=document.getElementById('project');
  if(!select)return;
  let group=[...select.querySelectorAll('optgroup')].find(g=>g.label===GROUP);
  if(!group){group=document.createElement('optgroup');group.label=GROUP;select.appendChild(group);}
  PUBLIC_PROJECTS.forEach(p=>{
    if(!select.querySelector(`option[value="${p.id}"]`))group.appendChild(new Option(p.label,p.id));
  });
}
function install(){
  addData();
  addSelectOptions();
  document.querySelectorAll('.version').forEach(v=>v.textContent='v'+VERSION);
}
addData();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
