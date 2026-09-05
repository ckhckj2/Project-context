'use strict';
// Review indicators, not vulnerability verdicts. No dependency installation required.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="\.\/(.*?)\?/g)].map(m=>m[1]);
const rows=files.map(file=>{
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const count=re=>(source.match(re)||[]).length;
  return {file,lines:source.split('\n').length,observers:count(/new MutationObserver/g),globalListeners:count(/(?:document|window)\.addEventListener/g),htmlWrites:count(/(?:\.innerHTML\s*=|insertAdjacentHTML\()/g),storageAccess:count(/localStorage\./g),searchOverrides:count(/window\.runSearch\s*=/g)};
});
console.log(JSON.stringify({note:'Counts flag review scope; they do not prove bugs or vulnerabilities.',files:rows},null,2));
