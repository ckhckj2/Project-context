const fs=require('node:fs');
const vm=require('node:vm');
let source=fs.readFileSync('v248_project_route_judgement.js','utf8');
const end=source.lastIndexOf('})();');
source=source.slice(0,end)+'window.__routeTest={BUSINESS,ROUTES,EXCEPTIONS,ROUTE_GUIDE,TYPE_HINT,taskKind,routeCandidate,exceptionText,judgement};'+source.slice(end);
const window={};
const document={readyState:'loading',addEventListener(){}};
vm.runInNewContext(source,{window,document,localStorage:{getItem(){return null}}});
const t=window.__routeTest;
function ok(value,message){if(!value)throw new Error(message)}
ok(Object.keys(t.BUSINESS).length===7,'business options');
ok(Object.keys(t.ROUTES).length===9,'route options');
ok(Object.keys(t.EXCEPTIONS).length===6,'exception options');
ok(t.judgement(null,'인허가 자료 작성','기본계획')===null,'no project should not judge');

const airport=t.judgement({typeId:'airport'},'인허가 자료 작성','기본계획');
ok(!airport.known,'old project route must remain unknown');
ok(airport.summary.includes('공항시설 시행허가·실시계획'),'airport candidate');
ok(airport.verdict==='판단 보류','unknown route verdict');

const housing=t.judgement({typeId:'multi',businessMode:'housing',approvalRoute:'housing',routeException:'none'},'변경업무 검토','중간설계');
ok(housing.known,'housing route known');
ok(housing.summary.includes('사업계획 변경승인'),'housing change route');
ok(housing.verdict==='일반 경로 가정','known no-exception verdict');

const publicProject=t.judgement({typeId:'office',businessMode:'public',approvalRoute:'building',routeException:'unknown'},'심의 보고자료 작성','계획설계');
ok(publicProject.summary.includes('공공발주 여부만으로'),'public procurement caution');
ok(publicProject.verdict==='조건부 판단','unknown exception verdict');

const changed=t.judgement({typeId:'airport',businessMode:'special',approvalRoute:'airport',routeException:'change'},'심의 보고자료 작성','시공·현장 대응');
ok(changed.exceptionSummary.includes('최초 절차와 다른 시점'),'late change exception');
ok(changed.verdict==='예외 경로 가능','exception verdict');
ok(changed.checks.length===3,'three judgement checks');

const fast=t.judgement({typeId:'fab',businessMode:'special',approvalRoute:'industry',routeException:'fast_track'},'협력업체 조정','실시설계');
ok(fast.exceptionSummary.includes('설계·인허가·시공이 병행'),'fast-track phase caution');
ok(t.taskKind('보고서 작성')==='other'&&t.taskKind('변경업무 검토')==='change','task kinds');
ok(source.includes('@media(max-width:800px)'),'responsive breakpoint');
ok(!source.includes(':has('),'avoid unsupported selector');
ok(!source.includes('CSS.escape'),'avoid unnecessary Safari selector dependency');
ok(source.includes('cc250RouteSig'),'mutation update must be idempotent');
console.log('PASS: project route judgement, migration safety, and responsive guard');
