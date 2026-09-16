'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('app-components.css','utf8');
const manifest=require('../style-manifest.json');
const scripts=[...html.matchAll(/<script\b[^>]*src="\.\/([^?\"]+)/g)].map(m=>m[1]);
const links=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>m[0]);
assert.equal(links.filter(link=>link.includes('./app-components.css?')).length,1);
assert(html.indexOf('./app-components.css?')<html.indexOf('</head>'),'CSS must load before boot');
for(const script of scripts){
 const source=fs.readFileSync(script,'utf8');
 assert.doesNotMatch(source,/createElement\(['"]style['"]\)/,script+' must not inject CSS');
}
assert.equal(manifest.length,36,'all former runtime style blocks are covered');
assert.equal(new Set(manifest.map(item=>item.source)).size,manifest.length);
for(const item of manifest){
 const section=require('./component-style.cjs')(item.source);
 assert(section.trim().length>0,item.source+' has its own CSS section');
}
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(css,/@import|url\(\s*['"]?\s*(?:https?:)?\/\//,'no external CSS dependency');
const assets=[...html.matchAll(/(?:src|href)="\.\/([^?"#]+)(?:[^" ]*)"/g)].map(m=>m[1]);
for(const file of assets)assert(fs.existsSync(file),'missing entry-point asset: '+file);
assert.equal(new Set(assets).size,assets.length,'no duplicate entry-point loads');
assert.match(fs.readFileSync('quiz.css','utf8'),/#quizChoices input\[type="radio"\]/,'radio sizing stays scoped');
console.log('Static style ownership, feature sections and dependency checks passed');
