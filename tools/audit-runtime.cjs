// Read-only inventory of direct entry points. Not a security scanner.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="\.\/([^?\"]+)[^\"]*"/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="\.\/([^?\"]+)[^\"]*"/g)].map(m=>m[1]);
function inspect(file){
 const bytes=fs.readFileSync(path.join(root,file)),s=bytes.toString('utf8');
 const count=re=>[...s.matchAll(re)].length;
 return {file,bytes:bytes.length,sha:crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),
  domReady:count(/DOMContentLoaded/g),styleCreation:count(/createElement\(['"]style['"]\)/g),
  timeoutSites:count(/\bsetTimeout\s*\(/g),intervalSites:count(/\bsetInterval\s*\(/g),observerSites:count(/new MutationObserver\s*\(/g),
  cloneSites:count(/\.cloneNode\s*\(/g),importantTokens:count(/!important/g),
  registrations:[...s.matchAll(/\.register(Search|Context|Result)\(['"]([^'"]+)['"]/g)].map(m=>({kind:m[1],id:m[2]})),
  storageAccessSites:count(/\blocalStorage\.(?:getItem|setItem|removeItem)\s*\(/g)};
}
const rows=[...scripts,...styles].map(inspect),active=new Set([...scripts,...styles]);
const inactiveCandidates=fs.readdirSync(root).filter(f=>/\.(?:js|css)$/.test(f)&&!active.has(f));
console.log(JSON.stringify({scope:'Direct index.html assets; lexical counts are sites, not runtime executions. Unloaded candidates are not proven dead.',scripts,styles,totals:{scripts:scripts.length,styles:styles.length,domReadyModules:rows.filter(x=>x.domReady).length,styleCreatingModules:rows.filter(x=>x.styleCreation).length,timeoutSites:rows.reduce((a,x)=>a+x.timeoutSites,0),observerSites:rows.reduce((a,x)=>a+x.observerSites,0),importantTokens:rows.reduce((a,x)=>a+x.importantTokens,0)},rows,inactiveCandidates},null,2));
