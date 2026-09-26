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
   await page.selectOption('#task','도면 수정');await page.selectOption('#project','multi');await page.selectOption('#phase','실시설계');
   await page.locator('#analyze').click();
   assert.equal(await page.locator('#contextResult h1').innerText(),'도면 수정');
   assert.equal(await page.locator('.cc-context-position [aria-current="step"] b').innerText(),'실시설계');
   assert(await page.locator('.cc-context-position').isVisible(),'orientation must not require opening details');
   const first=page.locator('#contextResult .actions>button').first();
   assert.equal(await first.getAttribute('data-drawer'),'how');
   const primaryColor=await first.evaluate(el=>getComputedStyle(el).backgroundColor);
   assert.equal(primaryColor,'rgb(53, 89, 218)','one solid primary action');
   for(const pane of ['context','why','how','caution']){
    const button=page.locator('#contextResult [data-drawer="'+pane+'"]');
    for(let repeat=0;repeat<2;repeat++){
     await button.click();assert.equal(await button.getAttribute('aria-expanded'),'true');
     // Hover may change during the pane's smooth scroll. Both blue endpoints
     // and their transition remain one primary action, not a second emphasis.
     const blueCount=await page.locator('#contextResult .actions>button').evaluateAll(buttons=>buttons.filter(el=>{
      const [r,g,b]=getComputedStyle(el).backgroundColor.match(/\d+/g).map(Number);
      return r>=40&&r<=53&&g>=71&&g<=89&&b>=187&&b<=218;
     }).length);
     assert.equal(blueCount,1,'opening '+pane+' must retain exactly one blue primary action');
     assert.equal(await page.locator('#contextResult .drawer.show').count(),1);
     assert(await page.locator('#contextResult [data-pane="'+pane+'"] .cc252-pane-head, #contextResult [data-pane="'+pane+'"]' ).last().isVisible());
     await overflow(page,'level '+level+' '+pane);
     await button.click();assert.equal(await button.getAttribute('aria-expanded'),'false');
     assert.equal(await page.locator('#contextResult .drawer.show').count(),0);
    }
   }
   await page.locator('#contextResult [data-ask-context]').click();assert(await page.locator('#view-search').evaluate(el=>el.classList.contains('active')));
   assert((await page.locator('#searchResult').textContent()).trim().length>0);
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('pc_progress_level')),'2','preview must preserve actual progress');
  // Unknown/edge stages and both phase-fit choices must retain truthful orientation,
  // update the first action from the same model, and leave saved records untouched.
  const savedBefore=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('pc_')||key.startsWith('cc_'))));
  for(const phase of ['잘 모르겠습니다','사전기획 / 사업검토','시공·현장 대응']){
   await page.evaluate(()=>showView('home'));
   await page.selectOption('#task','사례조사');await page.selectOption('#phase',phase);await page.locator('#analyze').click();
   if(phase==='잘 모르겠습니다'){
    assert.equal(await page.locator('.cc-context-position [aria-current]').count(),0);
    await page.locator('.cc-context-position [data-view="home"]').click();
    assert(await page.locator('#view-home.active').isVisible());
   }else{
    assert.equal(await page.locator('.cc-context-position [aria-current] b').innerText(),phase);
   }
  }
  for(const mode of ['prep','actual']){
   await page.evaluate(()=>showView('home'));
   await page.selectOption('#project','transport');await page.selectOption('#phase','중간설계');await page.locator('#analyze').click();
   assert(await page.locator('.cc247-fit-gate').isVisible());
   assert.equal(await page.locator('#contextResult .actions').isVisible(),false,'unresolved fit must not expose inactive execution buttons');
   await page.locator('[data-fit="'+mode+'"]').click();
   assert(await page.locator('#contextResult .actions').isVisible());
   assert.equal(await page.locator('.cc-context-position').count(),1);
   const expected=await page.evaluate(()=>CC_WORK_CONTEXT.resolve(document.querySelector('.cc247-fit-gate').dataset.mode).how.steps[0]);
   assert.equal(await page.locator('.cc252-brief-grid>div:first-child p').innerText(),expected);
   const how=page.locator('#contextResult [data-drawer="how"]');
   await how.focus();await page.keyboard.press('Enter');
   assert.equal(await how.getAttribute('aria-expanded'),'true');
   assert(await page.locator('#contextResult [data-pane="how"]').isVisible());
   await overflow(page,'phase-fit '+mode);
  }
  assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('pc_')||key.startsWith('cc_')))),savedBefore,'reading context must preserve saved records');
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
async function searchAndAlignment(browser,url){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()));
 await context.addInitScript(legacy=>{
  localStorage.setItem('cc_projects_v1',JSON.stringify([legacy]));localStorage.setItem('cc_active_project_v1',legacy.id);
  localStorage.setItem('pc_progress_level','2');localStorage.setItem('pc_level','2');
 },legacy);
 try{
  await ready(page,url);
  const saved=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('pc_')||key.startsWith('cc_'))));
  await page.selectOption('#task','사례조사');await page.selectOption('#project','logistics');await page.selectOption('#phase','계획설계');
  await page.click('#detailsToggle');await page.fill('#meta','다른 프로젝트 메모 트윈타워 987세대');
  const selections=await page.evaluate(()=>['task','project','phase','meta'].map(id=>document.getElementById(id).value));
  const search=async q=>{await page.fill('#searchInput',q);await page.locator('#searchInput').press('Enter');};
  for(const width of [390,768,1024,1280,1440,1920]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(()=>showView('home'));await page.click('#analyze');
   const bounds=await page.evaluate(()=>['#view-context .back-row','#contextResult .stage-banner','.cc-context-position','#contextResult .cc252-context-brief','#contextResult .actions'].map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right}}));
   for(const rect of bounds){assert(Math.abs(rect.left-bounds[0].left)<1,width+' left alignment');assert(Math.abs(rect.right-bounds[0].right)<1,width+' right alignment');}
   await overflow(page,'context alignment '+width);
   if(process.env.CC_QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.CC_QA_SCREENSHOTS,'alignment-'+width+'.png'),fullPage:true});
   await page.evaluate(()=>showView('home'));await page.fill('#homeSearch','물류 센터 입면사례 찾으래');await page.click('#homeSearchBtn');
   assert.equal(await page.locator('.cc252-answer h3').innerText(),'물류·창고시설 · 입면 사례조사');
   assert.match(await page.locator('.cc252-answer-context').innerText(),/설계단계 미입력/);
   assert.equal(await page.locator('#cc230SearchProject').isVisible(),false,'unrelated saved project must not appear as the research context');
   assert.doesNotMatch(await page.locator('#searchResult').innerText(),/공동주택|987|다른 프로젝트/);
   assert(await page.locator('.cc217-answer .cc252-action-grid p').evaluateAll(items=>items.every(el=>el.scrollHeight<=el.clientHeight+1)),'guidance must not be clipped '+width);
   await overflow(page,'case-study answer '+width);
   if(process.env.CC_QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.CC_QA_SCREENSHOTS,'case-study-'+width+'.png'),fullPage:true});
   const detail=page.locator('.cc252-detail-toggle');await detail.click();assert.equal(await detail.getAttribute('aria-expanded'),'true');
   assert(await page.locator('.cc217-result').isVisible());await overflow(page,'case-study detail '+width);
   await detail.click();assert.equal(await detail.getAttribute('aria-expanded'),'false');
  }
  await search('운수시설 중간설계 사례를 조사하래요');assert.equal(await page.locator('.cc252-answer h3').innerText(),'운수시설 · 중간설계 · 사례조사');
  await search('병원 평면 사례 찾아오래');assert.match(await page.locator('.cc252-action-grid').innerText(),/공간 관계·운영 동선/);
  await search('물류센터인지 공장인지 모르겠는데 중간설계 입면 사례');
  assert.equal(await page.locator('#searchResult [data-search-query]').count(),2);
  const choice=page.getByRole('button',{name:'공장·FAB 사례 보기'});await choice.focus();await choice.press('Enter');
  assert.equal(await page.locator('.cc252-answer h3').innerText(),'공장·FAB · 중간설계 · 입면 사례조사');
  await search('입면 사례 말고 도면 고치래');assert.match(await page.locator('.cc252-answer h3').innerText(),/^도면 수정/);
  await search('알 수 없는 새로운 업무');assert(await page.locator('#cc230SearchProject').isVisible(),'saved-project indicator retained for other existing search providers');assert(await page.locator('.cc21-choices').isVisible(),'unsupported instructions retain clarification');
  await search('<img src=x onerror="window.qaXss=1"> 물류센터 입면사례');assert.equal(await page.locator('#searchResult img').count(),0);assert.equal(await page.evaluate(()=>window.qaXss),undefined);
  assert.deepEqual(await page.evaluate(()=>['task','project','phase','meta'].map(id=>document.getElementById(id).value)),selections,'search must not mutate home context');
  assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('pc_')||key.startsWith('cc_')))),saved,'search and context reading preserve saved records');
  assert.deepEqual(errors,[]);assert(requests.every(request=>new URL(request).origin===new URL(url).origin));
  console.log('PASS stage 4: 390/768/1024/1280/1440/1920 alignment, natural queries, ambiguity/keyboard, detail, no clipping, storage/context isolation, XSS and no external requests');
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
  await flows(browser,url,390,'no-preference');await searchAndAlignment(browser,url);await failures(browser,url);
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
