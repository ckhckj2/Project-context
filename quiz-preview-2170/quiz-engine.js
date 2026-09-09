(()=>{
'use strict';
const bank=window.CC_QUIZ_BANK;
function normalize(value){return String(value??'').normalize('NFKC').trim().toLowerCase().replace(/[\s·ㆍ,./()[\]{}"'`~!@#$%^&*_=+?:;\-]/g,'').replace(/(입니다|이에요|예요)$/,'');}
function shuffle(items,random=Math.random){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function select(level,count,random){
 const pool=shuffle(bank.filter(q=>q.level===level),random),seen=new Set(),first=[],rest=[];
 for(const q of pool){if(seen.has(q.topic))rest.push(q);else{seen.add(q.topic);first.push(q);}}
 const selected=[...first,...rest].slice(0,count);
 if(selected.length!==count)throw new Error('Insufficient quiz questions');
 return selected.map(q=>({...q,options:q.options?shuffle(q.options,random):undefined}));
}
function isCorrect(question,response){
 if(question.type==='choice')return response===question.answer;
 const answer=normalize(response);return question.aliases.some(alias=>normalize(alias)===answer);
}
function create({level,mode='level',practice=false},random=Math.random){
 if(![1,2,3,4].includes(level)||!['level','master'].includes(mode)||(mode==='master'&&level!==4))throw new Error('Invalid quiz mode');
 const questions=mode==='master'?[1,2,3,4].flatMap(n=>select(n,2,random)):select(level,5,random);
 let index=0,phase='answer',score=0;const responses=[];
 const view=()=>({level,mode,practice,index,phase,score,total:questions.length,question:questions[index],responses:[...responses],threshold:mode==='master'?7:4});
 return Object.freeze({
  view,
  answer(response){
   if(phase!=='answer')return {accepted:false,reason:'already-answered'};
   const q=questions[index],value=String(response??'').trim();
   if(!value)return {accepted:false,reason:'empty'};
   if(q.type==='choice'&&value!=='__skip'&&!q.options.some(o=>o.id===value))return {accepted:false,reason:'invalid'};
   const correct=value!=='__skip'&&isCorrect(q,value);
   responses.push({id:q.id,correct,response:value});if(correct)score++;
   phase='feedback';return {accepted:true,correct};
  },
  next(){if(phase!=='feedback')return false;if(index+1===questions.length)phase='finished';else{index++;phase='answer';}return true;},
  result(){if(phase!=='finished')return null;return {...view(),passed:score>=(mode==='master'?7:4)};}
 });
}
function promotion(result,actual,certified){
 if(!result||result.phase!=='finished'||!result.passed||result.practice||certified||actual!==result.level)return null;
 if(result.mode==='master')return actual===4?5:null;
 return actual<4?actual+1:null;
}
window.CC_QUIZ_ENGINE=Object.freeze({normalize,select,isCorrect,create,promotion});
})();
