// Read-only: absence of literal references is not proof of no external consumers.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function audit(directory=root){
 const files=[];
 function walk(dir){
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
   if(item.name.startsWith('.')||item.name==='node_modules')continue;
   const full=path.join(dir,item.name);
   if(item.isDirectory())walk(full);
   else if(/\.(?:html|js|cjs|mjs|css|json)$/.test(item.name))files.push(path.relative(directory,full));
  }
 }
 walk(directory);
 const contents=new Map(files.map(file=>[file,fs.readFileSync(path.join(directory,file),'utf8')]));
 const html=contents.get('index.html')||'';
 const active=new Set([...html.matchAll(/(?:src|href)="\.\/([^?"#]+)/g)].map(m=>m[1]));
 const candidates=files.filter(file=>!file.includes(path.sep)&&/\.(?:js|css)$/.test(file)&&!active.has(file));
 return {scope:'Local literal references only. No deletion authorization; external URLs and historical consumers are unknown.',
  candidates:candidates.map(file=>({file,bytes:fs.statSync(path.join(directory,file)).size,
   references:files.filter(other=>other!==file&&contents.get(other).includes(file))}))};
}
if(require.main===module)console.log(JSON.stringify(audit(),null,2));
module.exports={audit};
