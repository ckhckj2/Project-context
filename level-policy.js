(()=>{
'use strict';
// Values are supplied by the caller; this policy never reads a page or storage.
const valid=value=>{const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=5?n:null;};
function resolve(values={}){
 const actual=valid(values.pc_progress_level)||valid(values.pc_level)||1;
 const certified=values.pc_master_certified==='1'||values.pc_master_unlocked==='1'||actual===5;
 const view=certified?(valid(values.pc_master_preview_level)||5):actual;
 return Object.freeze({actual,certified,view,depth:Math.min(4,view)});
}
window.CC_LEVEL_POLICY=Object.freeze({resolve});
})();
