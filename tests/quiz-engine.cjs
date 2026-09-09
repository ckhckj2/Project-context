'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const env={window:{}};vm.createContext(env);
for(const file of ['quiz-bank.js','quiz-engine.js'])vm.runInContext(fs.readFileSync(file,'utf8'),env,{filename:file});
const bank=env.window.CC_QUIZ_BANK,engine=env.window.CC_QUIZ_ENGINE;
assert.equal(bank.length,64);assert.equal(new Set(bank.map(q=>q.id)).size,64);
for(const level of [1,2,3,4]){
 assert.equal(bank.filter(q=>q.level===level).length,16);
 const chosen=engine.select(level,5,()=>0);
 assert.equal(new Set(chosen.map(q=>q.id)).size,5);assert.equal(new Set(chosen.map(q=>q.topic)).size,5,'topic diversity');
}
for(const q of bank){
 assert(q.explanation&&q.learn);
 if(q.type==='choice'){assert(q.options.length>=3);assert.equal(new Set(q.options.map(o=>o.text)).size,q.options.length);assert(q.options.some(o=>o.id===q.answer));}
 else {assert(q.aliases.length);for(const alias of q.aliases)assert(engine.isCorrect(q,alias));}
}
const seum=bank.find(q=>q.id==='1-seum');
assert(engine.isCorrect(seum,' 세움 터 '));assert(engine.isCorrect(seum,'세움터입니다.'));
assert(!engine.isCorrect(seum,'세움터가 아닙니다'));assert(!engine.isCorrect(seum,'세움터 말고 토지이음'));assert(!engine.isCorrect(seum,''));
assert(engine.isCorrect(bank.find(q=>q.id==='1-pm'),'ｐｍ'));
assert.throws(()=>engine.create({level:1,mode:'master'}));assert.throws(()=>engine.create({level:5}));
const once=engine.create({level:1},()=>0);assert.equal(once.result(),null);assert.equal(once.next(),false);
assert.equal(once.answer('').accepted,false);const q=once.view().question;
assert(once.answer(q.type==='choice'?q.answer:q.aliases[0]).accepted);assert.equal(once.answer(q.answer).accepted,false);assert.equal(once.view().score,1);
function finish(level,correct,mode='level',practice=false){
 const session=engine.create({level,mode,practice},()=>0),levels=[];
 while(session.view().phase!=='finished'){
  const view=session.view();levels.push(view.question.level);
  session.answer(view.index<correct?(view.question.type==='choice'?view.question.answer:view.question.aliases[0]):'__skip');
  session.next();
 }
 assert.equal(session.answer('a0').accepted,false);assert.equal(session.next(),false);
 return {result:session.result(),levels};
}
for(const level of [1,2,3]){assert.equal(engine.promotion(finish(level,4).result,level,false),level+1);assert.equal(engine.promotion(finish(level,3).result,level,false),null);}
assert.equal(engine.promotion(finish(4,5).result,4,false),null,'LV4 practice is not final mastery');
const master=finish(4,7,'master');assert.equal(engine.promotion(master.result,4,false),5);
for(const lv of [1,2,3,4])assert.equal(master.levels.filter(n=>n===lv).length,2);
assert.equal(engine.promotion(finish(4,6,'master').result,4,false),null);
assert.equal(engine.promotion(master.result,3,false),null,'stale actual level cannot promote');
assert.equal(engine.promotion(master.result,4,true),null,'certified preview cannot alter progress');
assert.equal(engine.promotion(finish(1,5,'level',true).result,1,false),null);
assert.equal(bank.find(q=>q.id==='1-seum').options,undefined,'question bank not mutated');
env.document={readyState:'loading',addEventListener(){}};
vm.runInContext(fs.readFileSync('v257_stage_drawing_guide.js','utf8'),env);
for(const q of bank){if(q.learn.kind==='drawings')assert(env.window.CC_STAGE_DRAWING_GUIDE.stages[q.learn.stage]?.groups.length,'drawing lesson uses existing content: '+q.id);}
console.log('PASS: 64 questions, topic sampling, strict aliases, first-answer scoring, terminal states and master progression');
