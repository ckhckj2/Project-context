'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {server,snapshot}=require('./check-style-regression.cjs');
const launch={headless:true,...(process.env.CC_CHROMIUM_EXECUTABLE?{executablePath:process.env.CC_CHROMIUM_EXECUTABLE}:{})};
const legacy={id:'qa-legacy',name:'기존 프로젝트',typeId:'multi',phase:'실시설계',bimMode:'delivery',approvalRoute:'housing',future:{keep:true},memo:'기존 메모'};
async function ready(page,url){await page.goto(url);await page.waitForFunction(()=>window.CC_BOOT?.diagnostics().state==='ready');}
async function overflow(page,label){
 await snapshot(page);
 const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 assert(dimensions.scroll<=dimensions.width+1,label+' horizontal overflow: '+JSON.stringify(dimensions));
}
async function flows(browser,url,width,motion){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:motion,locale:'ko-KR'});
 await context.addInitScript(legacy=>{
  let seed=173;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  if(!localStorage.getItem('qa-seeded')){
   localStorage.setItem('cc_projects_v1',JSON.stringify([legacy]));localStorage.setItem('cc_active_project_v1',legacy.id);
   localStorage.setItem('pc_progress_level','2');localStorage.setItem('pc_level','2');
   localStorage.setItem('pc_master_certified','1');localStorage.setItem('pc_master_preview_level','1');localStorage.setItem('qa-seeded','1');
  }
 },legacy);
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>requests.push(request.url()));
 try{
  await ready(page,url);await overflow(page,'home');
  await page.reload();await page.waitForFunction(()=>CC_BOOT.diagnostics().state==='ready');
  assert.equal(await page.locator('style').count(),0,'no runtime stylesheet creation');
  for(const level of [1,2,3,4,5]){
   await page.locator('#masterLevels [data-level="'+level+'"]').click();
   if(level===5)await page.locator('#closeMaster').click();
   await page.evaluate(()=>showView('home'));
   await page.locator('.cc251-structured > summary').click();
   await page.selectOption('#task','도면 수정');await page.selectOption('#project','multi');await page.selectOption('#phase','실시설계');
   await page.locator('#analyze').click();
   for(const pane of ['context','why','how','caution']){
    const button=page.locator('#contextResult [data-drawer="'+pane+'"]');
    for(let repeat=0;repeat<2;repeat++){
     await button.click();assert.equal(await button.getAttribute('aria-expanded'),'true');
     assert.equal(await page.locator('#contextResult .drawer.show').count(),1);
     assert(await page.locator('#contextResult [data-pane="'+pane+'"] .cc252-pane-head, #contextResult [data-pane="'+pane+'"]' ).last().isVisible());
     await overflow(page,'level '+level+' '+pane);
     await button.click();assert.equal(await button.getAttribute('aria-expanded'),'false');
     assert.equal(await page.locator('#contextResult .drawer.show').count(),0);
    }
   }
   await page.locator('#contextResult [data-ask-context]').click();assert(await page.locator('#view-search').evaluate(el=>el.classList.contains('active')));
   assert((await page.locator('#searchResult').textContent()).trim().length>0);
   await page.evaluate(()=>{const fold=document.querySelector('.cc251-structured');fold.open=false;});
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('pc_progress_level')),'2','preview must preserve actual progress');
  await page.evaluate(()=>showView('projects'));
  await page.locator('[data-pid="qa-legacy"] [data-edit]').click();
  await page.fill('#cc230Name','기존 프로젝트 수정');await page.fill('#cc230Memo','갱신된 메모');await page.click('#cc230Save');
  assert.deepEqual(await page.evaluate(()=>CC_PROJECT_STORE.get('qa-legacy').future),{keep:true});
  assert.equal(await page.evaluate(()=>CC_PROJECT_STORE.get('qa-legacy').bimMode),'delivery');
  await page.click('#cc230New');await page.fill('#cc230Name','<img src=x onerror="window.qaXss=1">');
  await page.fill('#cc230Memo','긴 메모 '.repeat(80));await page.selectOption('#cc230Type','airport');
  await page.selectOption('#cc250Route','airport');await page.click('#cc230Save');
  assert.equal(await page.evaluate(()=>CC_PROJECT_STORE.list().length),2);
  assert.equal(await page.locator('#cc230List img').count(),0,'project text must not become executable HTML');
  assert.equal(await page.evaluate(()=>window.qaXss),undefined);
  await overflow(page,'long project text');
  await page.reload();await page.waitForFunction(()=>CC_BOOT.diagnostics().state==='ready');
  assert.equal(await page.evaluate(()=>CC_PROJECT_STORE.list().length),2,'saved projects survive reload');
  assert.equal(await page.evaluate(()=>CC_PROJECT_STORE.get('qa-legacy').memo),'갱신된 메모');
  await page.evaluate(()=>{CC_LEVEL_STORE.setItem('pc_master_preview_level','1');updateMasterUI();showView('quiz');});
  await page.click('#startQuiz');
  await page.click('#qSubmit');assert.match(await page.locator('#qFeedback').textContent(),/입력|선택/);
  await page.click('#quizSkip');assert.equal(await page.locator('#qFeedback').getAttribute('data-quiz-correct'),'false');
  const learn=page.locator('#qFeedback button');
  if(await learn.count()){
   const question=await page.locator('#qText').textContent();await learn.first().click();await page.click('#quizReturn');
   assert.equal(await page.locator('#qText').textContent(),question);
  }
  await page.click('#qSubmit');
  for(let index=1;index<5;index++){await page.click('#quizSkip');await page.click('#qSubmit');}
  assert(await page.locator('.quiz-result').isVisible());
  assert.equal(await page.evaluate(()=>localStorage.getItem('pc_progress_level')),'2','practice must preserve actual grade');
  await page.evaluate(()=>{showView('search');CC_RUNTIME.search('건축허가');});await overflow(page,'search');
  await page.locator('#searchInput').focus();await page.keyboard.press('Tab');
  assert(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle!=='none'),'keyboard focus must be visible');
  assert(await page.evaluate(()=>['javascript:alert(1)','data:text/html,x','http://example.com','https://u:p@example.com'].every(url=>CC_SECURITY.safeExternalUrl(url)===null)));
  const csp=await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  assert(csp.includes("connect-src 'none'")&&csp.includes("script-src 'self'"));
  assert(requests.every(request=>new URL(request).origin===new URL(url).origin),'no external app requests');
  assert.deepEqual(errors,[]);
  if(process.env.CC_QA_SCREENSHOTS){fs.mkdirSync(process.env.CC_QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.CC_QA_SCREENSHOTS,'search-'+width+'-'+motion+'.png'),fullPage:true});}
  console.log('PASS flows',width,motion,': 5 levels, all panes twice, WHO, legacy/edit/create/reload, XSS, quiz, focus, CSP, overflow');
 }finally{await context.close();}
}
async function failures(browser,url){
 for(const mode of ['missing-css','blocked-storage','corrupt-storage']){
  const context=await browser.newContext();
  if(mode==='blocked-storage')await context.addInitScript(()=>{Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('Blocked','SecurityError');}});});
  if(mode==='corrupt-storage')await context.addInitScript(()=>localStorage.setItem('cc_projects_v1','{invalid'));
  const page=await context.newPage();
  if(mode==='missing-css')await page.route('**/app-components.css*',route=>route.abort());
  await page.goto(url);
  if(mode==='missing-css'){
   await page.waitForFunction(()=>CC_BOOT.diagnostics().state==='failed');assert(await page.locator('#appBootStatus').isVisible());
  }else{
   await page.waitForFunction(()=>CC_BOOT.diagnostics().state==='ready');await page.evaluate(()=>showView('projects'));
   await page.click('#cc230New');await page.fill('#cc230Name','저장 실패 검증');await page.click('#cc230Save');
   assert((await page.locator('#cc230SaveMsg').textContent()).length>0);assert(await page.locator('#cc230Editor').isVisible());
   if(mode==='corrupt-storage')assert.equal(await page.evaluate(()=>localStorage.getItem('cc_projects_v1')),'{invalid');
  }
  await context.close();console.log('PASS failure',mode);
 }
}
(async()=>{
 let browser;
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/current/';browser=await chromium.launch(launch);
  for(const width of [390,768,1440])await flows(browser,url,width,'reduce');
  await flows(browser,url,390,'no-preference');await failures(browser,url);
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
