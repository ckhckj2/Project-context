(()=>{
const TASK_OPTIONS=['발주처 협의자료 작성','보고서 작성'];
const REPHRASE=new Map([
 ['업무시설로 분류되는 대표적인 주거유사 시설은?','주거처럼 사용하기도 하는 시설 중 이름이 ‘○○텔’로 끝나는 대표 시설은?'],
 ['반도체 생산라인을 가진 시설을 프로젝트에서 흔히 뭐라고 부르나요?','반도체 생산라인이 있는 생산동을 현업에서 흔히 부르는 영어 3글자 이름은?'],
 ['여러 기업의 제조·업무 공간이 모인 산업시설 유형은?','여러 기업의 제조·업무 공간이 한 건물에 모여 있는 시설을 무엇이라고 하나요? ‘지식○○센터’입니다.'],
 ['위험물을 저장하거나 취급하는 프로젝트는 앱의 어떤 분류에 있나요?','앱 분류 중 이름에 ‘위험물’이 들어가는 항목은 무엇인가요?'],
 ['대지의 용도지역·지구·구역을 확인하는 대표 서비스는?','대지의 용도지역·지구·구역을 확인할 때 쓰는 대표 서비스로, 이름이 ‘토지○○’인 것은?'],
 ['건축 인허가 전자민원을 처리할 때 많이 쓰는 시스템은?','건축 인허가 전자민원 시스템으로 앱에 나온 ‘세○터’의 이름은?'],
 ['건축공사를 시작하기 전에 하는 대표 신고는?','공사를 시작한다는 뜻의 ‘착공’ 뒤에 ‘신고’를 붙인 대표 절차는?'],
 ['건축공사가 끝난 뒤 건축물을 사용하기 전에 받는 대표 절차는?','공사가 끝난 뒤 건물을 사용하기 전에 받는 ‘사용○○’ 절차는?'],
 ['공항개발사업에 해당하는지 판단하려면 시설 이름 외에 무엇을 확인해야 하나요?','공항 안의 시설이라고 해서 모두 같은 인허가 절차를 쓰는 것은 아닙니다. 시설 이름 외에 프로젝트가 어떤 방식으로 추진되는지, 즉 ‘사업○○’을 확인해야 합니다. 무엇일까요?'],
 ['의료시설 계획에서 건축 외에 반드시 함께 봐야 하는 핵심은 의료 무엇인가요?','의료시설은 공간만 계획하는 게 아니라 병원이 실제로 어떻게 운영되는지도 함께 봅니다. 이를 ‘의료 ○○’이라고 할까요?'],
 ['운수시설에서 건축설계와 함께 중요한 외부 협의 대상은?','운수시설은 철도·버스·공항 등 운영 주체와 협의가 필요한 경우가 많습니다. 건축설계 외에 어떤 기관들과 협의해야 하나요?'],
 ['일반 창고인지 물류터미널인지 먼저 구분할 때 가장 먼저 확인할 것은?','단순 보관 창고인지 물류터미널 사업인지 구분하려면 프로젝트의 성격이나 추진 방식을 먼저 봐야 합니다. 이를 한 단어로 쓰면?'],
 ['복합시설에서 가장 먼저 따로 나눠서 봐야 하는 것은 각각의 무엇인가요?','복합시설은 여러 기능이 섞여 있습니다. 검토를 시작할 때 각 공간의 무엇을 먼저 나눠서 봐야 하나요?'],
 ['FAB나 데이터센터처럼 프로젝트 명칭과 법적 용도가 다를 수 있을 때 확인해야 하는 것은?','FAB나 데이터센터라는 프로젝트 이름만으로 건축법상 분류가 정해지는 것은 아닙니다. 실제로 확인해야 하는 것은 건축법상 무엇인가요?']
]);
let installedDoc=null;

function addTaskOptions(d){
  const select=d.getElementById('task');
  if(!select)return;
  const existing=new Set([...select.options].map(o=>o.value||o.textContent.trim()));
  TASK_OPTIONS.forEach(label=>{
    if(existing.has(label))return;
    const o=d.createElement('option');o.value=label;o.textContent=label;select.appendChild(o);
  });
}
function clarifyQuestion(d){
  const q=d.getElementById('qText');if(!q)return;
  const original=q.textContent.trim();
  const revised=REPHRASE.get(original);
  if(revised && revised!==original)q.textContent=revised;
}
function markVersion(d){
  const chip=[...d.querySelectorAll('.topchip')].find(x=>/^v1\./.test(x.textContent.trim()));
  if(chip)chip.textContent='v1.5.1 · 5A FIX';
}
function sync(d){addTaskOptions(d);clarifyQuestion(d);markVersion(d);}
function install(){
  const f=document.getElementById('app'),d=f?.contentDocument;if(!d)return;
  sync(d);
  if(installedDoc===d)return;
  installedDoc=d;
  let last='';
  setInterval(()=>{
    if(!d.body)return;
    addTaskOptions(d);
    const now=d.getElementById('qText')?.textContent||'';
    if(now!==last){last=now;clarifyQuestion(d);last=d.getElementById('qText')?.textContent||last;}
    markVersion(d);
  },450);
}
const f=document.getElementById('app');
if(f){f.addEventListener('load',install);if(f.contentDocument?.readyState==='complete')install();}
})();