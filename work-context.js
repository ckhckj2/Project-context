(()=>{
'use strict';
// The only selection adapter for work-model; domain modules never read these controls.
function resolve(fitMode){
 const value=id=>document.getElementById(id)?.value||'';
 return window.CC_WORK_MODEL.resolve({task:value('task'),phase:value('phase'),facilityId:value('project'),source:'context',project:window.CC_PROJECT_STORE?.active(),levelValues:window.CC_LEVEL_STORE.values(),fitMode});
}
window.CC_WORK_CONTEXT=Object.freeze({resolve});
})();
