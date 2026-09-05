const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert');

function expose(file,expression,globals={}){
  let source=fs.readFileSync(file,'utf8');
  const end=source.lastIndexOf('})();');
  source=source.slice(0,end)+`window.__matrixTest=${expression};`+source.slice(end);
  const window={};
  const document={
    readyState:'loading',
    getElementById(){return null},
    querySelector(){return null},
    querySelectorAll(){return []},
    addEventListener(){}
  };
  vm.runInNewContext(source,{
    window,document,console,
    localStorage:{getItem(){return null}},
    setTimeout(){return 0},clearTimeout(){},
    MutationObserver:function(){},
    ...globals
  });
  return window.__matrixTest;
}

const fit=expose('v247_task_phase_fit.js','{MATRIX,classify}');
const depth=expose('v252_level_depth_progression.js','window.CC_LEVEL_DEPTH');

const tasks=[
  '심의 보고자료 작성','인허가 자료 작성','변경업무 검토','발주처 협의자료 작성',
  '보고서 작성','지구단위계획 조사','법규 검토','입면·디자인 검토','사례조사',
  '모델링','CG·렌더링','도면 수정','협력업체 조정'
];
const phases=['사전기획 / 사업검토','기본계획','계획설계','중간설계','실시설계','시공·현장 대응'];
const levels=[1,2,3,4];
const expectedAreas=['context','how','why','who','caution'];

assert.equal(Object.keys(fit.MATRIX).length,tasks.length,'task matrix coverage');
assert.deepEqual(Array.from(depth.openAreas),expectedAreas,'all information areas must remain open');
assert.equal(depth.depths.length,levels.length,'one depth definition per level');

let checked=0;
for(const task of tasks){
  for(const phase of phases){
    const decision=fit.classify(task,phase);
    assert.ok(decision,`missing phase decision: ${task} / ${phase}`);
    assert.ok(['normal','prep','conditional','mismatch'].includes(decision.status),`invalid status: ${task} / ${phase}`);
    for(const level of levels){
      const levelDepth=depth.depths[level-1];
      assert.ok(levelDepth?.name,`missing depth: LV${level}`);
      assert.ok(levelDepth?.desc,`missing depth guidance: LV${level}`);
      assert.equal(depth.openAreas.length,5,`information area regression: ${task} / ${phase} / LV${level}`);
      checked++;
    }
  }
}

assert.equal(checked,312,'complete level/task/phase matrix');
assert.equal(new Set(Array.from(depth.depths,item=>item.name)).size,4,'level depth labels must be distinct');
console.log(`PASS: ${tasks.length} tasks × ${phases.length} phases × ${levels.length} levels = ${checked} combinations`);
