(()=>{
'use strict';
const VERSION='2.1.1';
const $=id=>document.getElementById(id);

function setText(el,text){if(el)el.textContent=text}
function setExample(el,text,label){if(!el)return;el.dataset.example=text;if(label)setText(el,label)}
function replaceText(root){
  if(!root)return;
  const pairs=[
    ['상사가 어떤 레이어나 관계를 보라고 한 것인지','업무 요청에서 어떤 레이어나 관계를 확인해야 하는지'],
    ['일단 상사에게 되물을게','업무를 요청하신 분께 확인할게'],
    ['상사가 시킨 일을','요청받은 업무를'],
    ['상사가 시킨 일','요청받은 업무'],
    ['상사가 짧게 지시했어요','업무를 요청받았어요. 어떻게 시작할까요?'],
    ['상사에게','업무를 요청하신 분께'],
    ['상사가','업무를 요청하신 분이'],
    ['지시 문장만 보면','업무 요청만 보면'],
    ['업무지시','업무 요청']
  ];
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{let t=n.nodeValue;for(const [a,b] of pairs)t=t.split(a).join(b);n.nodeValue=t;});
}

function installCopy(){
  
  const lead=document.querySelector('#view-search .search-card>.lead');
  setText(lead,'업무를 요청받은 상황을 자연스럽게 적어보세요. 업무 의미, 먼저 볼 자료, 확인처와 협업할 사람까지 실무 맥락으로 풀어드립니다.');

  const caps=[...document.querySelectorAll('#view-search .caps .cap')];
  if(caps[0]){
    setExample(caps[0],'책임님께 법규검토 업무를 요청받았어요. 무엇부터 확인하면 될까요?');
    setText(caps[0].querySelector('small'),'01 · WORK REQUEST');
    setText(caps[0].querySelector('b'),'업무를 요청받았어요. 어떻게 시작할까요?');
    setText(caps[0].querySelector('span'),'법규검토 · 지번 · 면적표 · 도로 등');
  }
  if(caps[1]){
    setExample(caps[1],'QGIS 확인을 요청받았어요. 어떤 내용을 보면 될까요?');
    setText(caps[1].querySelector('small'),'02 · CLARIFY');
    setText(caps[1].querySelector('b'),'확인 범위가 조금 애매해요');
    setText(caps[1].querySelector('span'),'가능한 의미를 좁혀서 선택');
  }
  if(caps[2]){
    setExample(caps[2],'보고서 작성 중인데 누구에게 어떤 내용으로 문의하면 좋을까요?');
    setText(caps[2].querySelector('b'),'누구에게 어떻게 문의할까요?');
    setText(caps[2].querySelector('span'),'문의 대상 · 실제 질문 방향');
  }

  const search=$('searchInput');
  if(search)search.placeholder='예: 책임님께 법규검토 업무를 요청받았어요 / QGIS 확인을 요청받았어요';
  const examples=[...document.querySelectorAll('#view-search .examples button')];
  setExample(examples[0],'책임님께 법규검토 업무를 요청받았어요. 무엇부터 보면 될까요?','법규검토 요청받았어요');
  setExample(examples[1],'QGIS 확인을 요청받았어요. 어떤 내용을 보면 될까요?','QGIS 확인 요청');
  setExample(examples[2],'지번 확인을 요청받았어요. 어디서 확인하면 될까요?','지번 확인 요청');
  setExample(examples[3],'면적표 검토를 요청받았어요. 무엇부터 맞추면 될까요?','면적표 검토 요청');

  const home=$('homeSearch');
  if(home)home.placeholder='예) 책임님께 법규검토 업무를 요청받았어요. 무엇부터 확인하면 될까요?';
  const popular=[...document.querySelectorAll('.cc-popular-questions button')];
  setExample(popular[0],'법규검토 업무를 요청받았어요. 무엇부터 확인하면 될까요?','# 법규검토는 무엇부터?');
  setExample(popular[1],'QGIS 확인을 요청받았어요. 어떤 내용을 보면 될까요?','# QGIS에서는 무엇을 확인할까요?');
  setExample(popular[2],'지번 확인을 요청받았어요. 어디서 확인하면 될까요?','# 지번은 어디서 확인할까요?');

  const help=[...document.querySelectorAll('.cc-help-card')];
  if(help[0])help[0].dataset.example='발주처 협의자료 작성은 왜 하는 업무인가요?';
  if(help[1])help[1].dataset.example='보고서 작성 중인데 누구에게 어떤 내용으로 문의하면 좋을까요?';
  if(help[2])help[2].dataset.example='법규검토 업무를 요청받았어요. 어디서 무엇을 먼저 확인하면 될까요?';
  if(help[3])help[3].dataset.example='사업계획승인은 어떤 의미인가요?';

  replaceText(document.body);
}

function polishSearchResult(){replaceText($('searchResult'));}

document.addEventListener('click',e=>{
  if(e.target.closest('#view-search, #view-home'))setTimeout(polishSearchResult,0);
},true);
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&(e.target===$('searchInput')||e.target===$('homeSearch')))setTimeout(polishSearchResult,0);
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installCopy,{once:true});else installCopy();
})();
