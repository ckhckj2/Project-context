'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const tests=['tests/runtime-regression.cjs',...fs.readdirSync(path.join(__dirname,'legacy')).filter(file=>file.endsWith('.js')).map(file=>'tests/legacy/'+file)];
let failures=0;
for(const test of tests){
  const result=cp.spawnSync(process.execPath,[test],{cwd:root,encoding:'utf8'});
  if(result.status!==0){failures++;console.error('FAIL',test,result.stderr)}
  else console.log('PASS',test);
}
process.exitCode=failures?1:0;
