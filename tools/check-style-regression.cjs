// Real-browser comparison against the pre-10-4 commit. No production requests/writes.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const cp=require('node:child_process'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const baseline=process.env.CC_BASELINE_REV||'dfc49d6';
const properties=['display','position','width','height','padding','margin','color','backgroundColor',
 'fontFamily','fontSize','fontWeight','lineHeight','border','borderRadius','gridTemplateColumns',
 'gap','overflow','visibility','opacity','transform','minWidth','minHeight','maxWidth','maxHeight'];
const cache=new Map();
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const parts=decodeURIComponent(url.pathname).split('/').filter(Boolean),version=parts.shift();
  if(!['baseline','current'].includes(version))throw Error('unknown version');
  const file=parts.join('/')||'index.html';
  if(file.includes('..')||!/^[-\w./]+$/.test(file))throw Error('invalid asset');
  const key=version+'/'+file;
  if(!cache.has(key))cache.set(key,version==='baseline'
   ?cp.execFileSync('git',['show',baseline+':'+file],{cwd:root,stdio:['ignore','pipe','pipe']})
   :fs.readFileSync(path.join(root,file)));
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(cache.get(key));
 }catch(error){res.writeHead(404);res.end('Not found');}
});
async function snapshot(page){
 // Reduced motion does not disable every legacy transition. Sample settled frames.
 await page.evaluate(async()=>{
  await document.fonts.ready;
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const finite=document.getAnimations().filter(animation=>Number.isFinite(animation.effect?.getComputedTiming().endTime));
  let timer;
  try{await Promise.race([
   Promise.all(finite.map(animation=>animation.finished.catch(()=>{}))),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Animations did not settle: '+finite.map(a=>a.animationName+':'+a.playState).join(', '))),5000);})
  ]);}finally{clearTimeout(timer);}
  // Native smooth scrolling is not included in document.getAnimations().
  window.scrollTo({top:0,left:0,behavior:'instant'});
  await new Promise(resolve=>requestAnimationFrame(resolve));
 });
 return page.evaluate(properties=>{
  const nodes=[...document.querySelectorAll('body *')].filter(el=>el.getClientRects().length&& !['SCRIPT','STYLE','LINK'].includes(el.tagName));
  return nodes.map(el=>{
   const style=getComputedStyle(el),rect=el.getBoundingClientRect();
   return {tag:el.tagName,id:el.id,classes:el.className.baseVal??el.className,
    rect:[rect.x,rect.y,rect.width,rect.height].map(n=>Math.round(n*100)/100),
    styles:Object.fromEntries(properties.map(p=>[p,style[p]]))};
  });
 },properties);
}
async function capture(browser,origin,version,width){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',locale:'ko-KR'});
 // Both versions receive the same quiz shuffle, without modifying production code.
 await context.addInitScript(()=>{let seed=173;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 try{
  await page.goto(origin+'/'+version+'/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CC_BOOT?.diagnostics().state==='ready');
  const results={home:await snapshot(page)};
  for(const view of ['search','projects','level','quiz']){
   await page.evaluate(view=>window.showView(view),view);
   results[view]=await snapshot(page);
  }
  await page.evaluate(()=>{window.showView('search');window.CC_RUNTIME.search('건축허가');});
  results.searchAnswer=await snapshot(page);
  await page.evaluate(()=>{window.showView('quiz');window.CC_QUIZ_UI.start();});
  results.quizStarted=await snapshot(page);
  for(const level of [1,2,3,4,5]){
   await page.evaluate(level=>{
    CC_LEVEL_STORE.setItem('pc_master_certified','1');
    CC_LEVEL_STORE.setItem('pc_master_preview_level',String(level));
    updateMasterUI();hideMaster();showView('home');
    document.getElementById('task').value='도면 수정';
    document.getElementById('project').value='multi';
    document.getElementById('phase').value='실시설계';
    analyze();
   },level);
   results['context-level-'+level]=await snapshot(page);
   await page.locator('#contextResult [data-drawer="how"]').click();
   results['how-level-'+level]=await snapshot(page);
  }
  // Verify the stylesheet contents and cascade order independently of sampled views.
  // Intentional long-project-name fix is tested separately by check-browser-flows.
  results.cascade=await page.evaluate(()=>[...document.styleSheets].filter(sheet=>!sheet.href?.includes('/ui-resilience.css')).flatMap(sheet=>[...sheet.cssRules].map(rule=>rule.cssText)));
  assert.deepEqual(errors,[],version+' must boot and interact without JS errors');
  return results;
 }finally{await context.close();}
}
if(require.main===module)(async()=>{
 let browser;
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,...(process.env.CC_CHROMIUM_EXECUTABLE?{executablePath:process.env.CC_CHROMIUM_EXECUTABLE}:{})});
  for(const width of [390,768,1440]){
   const before=await capture(browser,origin,'baseline',width),after=await capture(browser,origin,'current',width);
   for(const key of Object.keys(before))assert.deepEqual(after[key],before[key],width+'px '+key+' differs');
   console.log('PASS',width+'px: 7 base views + context/HOW at all 5 levels + CSS cascade');
  }
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={server,snapshot};
