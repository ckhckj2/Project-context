(()=>{
'use strict';
const VERSION='2.1.49';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const STATUS={
  prep:['선행 준비 단계','prep'],conditional:['조건 확인 필요','conditional'],
  mismatch:['시점 재확인','mismatch'],normal:['통상 수행 가능','normal']
};
const MATRIX={
  review:{match:/심의.*(?:보고|자료)|심의 보고자료/,phases:{
    '사전기획 / 사업검토':'prep','기본계획':'prep','계획설계':'normal',
    '중간설계':'normal','실시설계':'conditional','시공·현장 대응':'mismatch'}},
  permit:{match:/인허가.*자료|허가자료/,phases:{
    '사전기획 / 사업검토':'prep','기본계획':'prep','계획설계':'conditional',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'conditional'}},
  change:{match:/변경업무|변경허가|변경신고|경미한 변경/,phases:{
    '사전기획 / 사업검토':'conditional','기본계획':'conditional','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'normal'}},
  client:{match:/발주처.*협의자료/,phases:{
    '사전기획 / 사업검토':'normal','기본계획':'normal','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'normal'}},
  report:{match:/^보고서 작성$|일반.*보고서/,phases:{
    '사전기획 / 사업검토':'normal','기본계획':'normal','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'normal'}},
  district:{match:/지구단위.*조사/,phases:{
    '사전기획 / 사업검토':'normal','기본계획':'normal','계획설계':'conditional',
    '중간설계':'conditional','실시설계':'conditional','시공·현장 대응':'mismatch'}},
  law:{match:/법규.*검토/,phases:{
    '사전기획 / 사업검토':'normal','기본계획':'normal','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'conditional'}},
  facade:{match:/입면|파사드|디자인 검토/,phases:{
    '사전기획 / 사업검토':'prep','기본계획':'normal','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'conditional'}},
  precedent:{match:/사례조사|레퍼런스 조사/,phases:{
    '사전기획 / 사업검토':'normal','기본계획':'normal','계획설계':'normal',
    '중간설계':'conditional','실시설계':'conditional','시공·현장 대응':'conditional'}},
  model:{match:/모델링|3d 모델/i,phases:{
    '사전기획 / 사업검토':'normal','기본계획':'normal','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'conditional'}},
  render:{match:/cg|렌더링|투시도/i,phases:{
    '사전기획 / 사업검토':'normal','기본계획':'normal','계획설계':'normal',
    '중간설계':'normal','실시설계':'conditional','시공·현장 대응':'conditional'}},
  drawing:{match:/도면 수정|레드라인/,phases:{
    '사전기획 / 사업검토':'conditional','기본계획':'normal','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'normal'}},
  consultant:{match:/협력업체.*조정/,phases:{
    '사전기획 / 사업검토':'conditional','기본계획':'normal','계획설계':'normal',
    '중간설계':'normal','실시설계':'normal','시공·현장 대응':'normal'}}
};
const COPY={
  review:{
    prep:['본 심의자료 작성보다 선행 확인일 가능성이 커요','이 단계에서는 심의 대상 여부·예상 시기·주요 쟁점과 요구자료를 먼저 확인하는 경우가 일반적입니다.'],
    conditional:['심의 종류와 현재 절차를 먼저 확인하세요','보완심의·재심의·변경심의라면 가능하지만 일반적인 최초 심의자료 작성 시점과는 다를 수 있습니다.'],
    mismatch:['일반적인 최초 심의자료 작성 시점과 맞지 않을 수 있어요','시공단계라면 변경·보완심의인지, 또는 단계 선택이 잘못됐는지 먼저 확인하세요.']},
  permit:{
    prep:['본 허가 제출자료보다 인허가 경로 확인이 먼저예요','이 단계에서는 메인 승인경로·승인권자·예상 시기·선행 심의와 요구자료를 먼저 정리하는 편이 일반적입니다.'],
    conditional:['어떤 인허가 절차인지 확인해야 답할 수 있어요','건축허가·사업계획승인·시행허가·부분허가·착공·사용승인 등에 따라 적정 시점과 자료가 달라집니다.'],
    mismatch:['현재 단계와 인허가 업무의 시점을 다시 확인하세요','시설명만으로 판단하지 말고 사업방식과 실제 승인경로를 먼저 확인해야 합니다.']},
  change:{
    prep:['행정상 변경절차보다 변경 가능성 검토에 가까울 수 있어요','기존 승인·허가가 아직 없다면 변경허가·변경신고가 아니라 계획안 변경 영향 검토일 가능성이 큽니다.'],
    conditional:['무엇을 기준으로 한 변경인지 먼저 확인하세요','내부 계획안 변경인지 기존 심의·허가·승인도서 변경인지에 따라 업무와 절차가 달라집니다.'],
    mismatch:['현재 변경의 기준도서와 승인경로를 다시 확인하세요','원래 어떤 절차로 결정·승인받았는지 알아야 다음 변경절차를 판단할 수 있습니다.']},
  client:{conditional:['이번 협의에서 결정받을 항목을 먼저 확인하세요','단계보다 협의 목적·결정권자·최신 기준안이 답변을 좌우합니다.'],mismatch:['발주처 협의의 목적을 다시 확인하세요','단순 공유인지 선택·승인·지시를 받는 자리인지 구분해야 합니다.']},
  report:{conditional:['보고서의 독자와 결론을 먼저 확인하세요','같은 단계라도 내부검토·발주처 보고·공식 제출은 구성과 근거가 달라집니다.'],mismatch:['현재 보고서의 사용 목적을 다시 확인하세요','보고받는 사람과 결정사항이 없으면 자료의 범위를 정하기 어렵습니다.']},
  district:{
    conditional:['최초 조사보다 변경사항 재확인에 가까워요','초기 기준과 최신 결정·변경 고시를 대조해 현재 설계에 달라진 영향이 있는지 확인하세요.'],
    mismatch:['시공단계의 일반적인 최초 조사 시점은 아니에요','현장 변경·인허가 보완·위반 가능성 검토인지, 단계 선택이 잘못됐는지 먼저 확인하세요.']},
  law:{conditional:['일반 법규조사보다 현장 변경의 적합성 검토에 가까워요','승인도서와 현장 변경내용을 비교하고 시공 전에 추가 승인·협의가 필요한지 확인하세요.'],mismatch:['검토 대상과 기준일을 다시 확인하세요','초기 규모검토인지 변경·보완 검토인지에 따라 확인 범위가 달라집니다.']},
  facade:{
    prep:['완성된 입면안보다 디자인 기준을 잡는 단계예요','주변 맥락·발주처 요구·예산·구조와 설비 조건을 모아 다음 단계의 입면 방향을 정하세요.'],
    conditional:['입면 디자인보다 현장 구현 검토에 가까울 수 있어요','샘플·목업·대체재·시공상세가 승인된 디자인 의도와 맞는지 확인하세요.'],
    mismatch:['현재 입면 검토의 목적을 다시 확인하세요','새 디자인인지 현장 구현·대체재 승인인지 구분해야 합니다.']},
  precedent:{conditional:['넓은 사례조사보다 특정 쟁점 비교가 필요해요','현재 단계에서 결정하지 못한 재료·상세·공법·현장 대안에 범위를 좁혀 조사하세요.'],mismatch:['사례조사의 결정 목적을 다시 확인하세요','무엇을 선택하거나 해결하기 위한 조사인지 없으면 이미지 수집으로 끝날 수 있습니다.']},
  model:{conditional:['설계 모델링보다 현장 조정 모델에 가까울 수 있어요','RFI·시공상세·현장변경·준공기록 중 어떤 목적으로 모델을 수정하는지 확인하세요.'],mismatch:['현재 모델의 사용 목적을 다시 확인하세요','설계 검토용인지 현장 조정·준공용인지에 따라 기준정보가 달라집니다.']},
  render:{conditional:['표현 목적과 최신 설계 기준을 먼저 확인하세요','실시설계·현장단계의 이미지는 디자인 검토, 재료 승인, 홍보, 준공 기록 중 목적을 구분해야 합니다.'],mismatch:['렌더링의 의사결정 목적을 다시 확인하세요','예쁜 이미지보다 누가 무엇을 판단할 자료인지 먼저 정해야 합니다.']},
  drawing:{conditional:['수정할 기준도면이 있는지 먼저 확인하세요','사전기획이라면 도면 수정이 아니라 검토안 작성이나 기존자료 정리일 가능성이 있습니다.'],mismatch:['도면 수정의 기준과 목적을 다시 확인하세요','기준도면·변경지시·영향범위가 없으면 수정 결과를 검증할 수 없습니다.']},
  consultant:{conditional:['정식 조정보다 사전 요구조건 확인에 가까울 수 있어요','계약·담당분야·질문 목적이 정해지기 전이라면 필요한 입력조건과 확인 시점부터 정리하세요.'],mismatch:['협력업체 조정의 범위와 담당을 다시 확인하세요','누구에게 어떤 결정을 언제 받아야 하는지 먼저 특정해야 합니다.']}
};
const PREP={
  review:{
    why:'본 제출자료를 완성하기 전에 심의 대상 여부와 시기, 계획에 미리 반영할 쟁점을 확인합니다.',
    risk:'대상과 시기를 잘못 잡으면 설계안이 굳은 뒤 큰 범위의 재검토가 생길 수 있어요.',
    done:'심의 종류·대상 여부·예상 시기·주요 쟁점·확인 담당이 정리되면 됩니다.',
    material:'사업방식·용도·규모·현재 계획안·관할 심의 운영기준·유사 심의자료',
    source:'관할기관 심의 안내/조례 → 프로젝트 인허가 계획 → 기존 유사사례 → PM·인허가 담당',
    order:'메인 승인경로 → 심의 대상 여부 → 예상 시기 → 주요 쟁점 → 요구자료 목차',
    steps:['프로젝트의 메인 승인경로와 선행 심의 확인','대상 여부·예상 접수시기·주요 쟁점 정리','확정 목록이 아닌 준비자료 초안과 확인 담당 기록']},
  permit:{
    why:'본 제출도서를 만들기 전에 프로젝트의 승인경로와 승인권자, 필요한 선행절차를 확인합니다.',
    risk:'시설명만 보고 건축허가로 단정하면 실제 사업계획승인·시행허가·특별법 경로를 놓칠 수 있어요.',
    done:'메인 승인경로·승인권자·선행절차·예상 일정·자료 확인처가 정리되면 됩니다.',
    material:'사업방식·용도/규모·과업지시서·기존 승인자료·인허가 일정 초안',
    source:'적용 법체계 → 관할기관 공식 안내 → 기존 프로젝트 승인자료 → PM·인허가 담당',
    order:'시설 유형 → 사업방식 → 적용 법체계 → 메인 승인경로 → 제출자료 확인처',
    steps:['시설 유형과 사업방식을 기준으로 승인경로 후보 정리','승인권자·선행 심의·예상 시기 확인','관할 공식 목록을 받기 위한 질문과 자료 초안 작성']},
  change:{
    why:'행정상 변경절차를 단정하기 전에 무엇을 기준으로 무엇이 바뀌는지 확인합니다.',
    risk:'승인 전 계획변경과 승인 후 변경허가·변경신고를 섞으면 잘못된 절차로 안내할 수 있어요.',
    done:'기준안·변경항목·기존 승인 여부·영향범위·확인 담당이 구분되면 됩니다.',
    material:'기존 결정안/승인도서·변경안·변경사유·변경 전후표·사업 승인경로',
    source:'프로젝트 결정기록 → 기존 심의/허가/승인 문서 → 관련 법령·관할 안내 → PM',
    order:'기준안 → 기존 승인 여부 → 변경 전후 비교 → 영향 추적 → 필요한 절차',
    steps:['변경 기준이 내부 계획안인지 승인도서인지 확인','변경 전후와 도면·법규·분야별 영향 표시','원 승인경로를 기준으로 필요한 절차를 담당자와 확인']},
  client:{
    why:'이번 협의에서 발주처가 알아야 할 내용과 결정할 항목을 먼저 특정합니다.',risk:'공유·보고·승인 목적이 섞이면 자료가 길어지고 결론이 흐려질 수 있어요.',done:'독자·결정사항·선택지·후속 액션이 한 장에서 구분되면 됩니다.',
    material:'최신 기준안·이전 회의록·발주처 요구사항·선택지 비교자료',source:'발주처 요구 → PM 결정기록 → 최신 도면/수치 → 협력업체 회신',order:'독자 → 결정사항 → 선택지 → 근거 → 다음 액션',steps:['이번 협의의 독자와 결정받을 항목 확인','최신 기준안과 선택지를 같은 조건으로 비교','결론·결정주체·후속 일정 기록']},
  report:{
    why:'보고서가 지원해야 할 판단과 남겨야 할 기록을 먼저 정합니다.',risk:'자료를 먼저 모으면 핵심 결론보다 설명과 이미지가 많아질 수 있어요.',done:'결론·근거·변경이유·다음 행동이 같은 기준일로 맞으면 됩니다.',
    material:'최신 도면·수치·회의록·이전 보고서·변경이력',source:'보고 요청 → PM/책임 결정사항 → 최신 설계자료 → 검토 근거',order:'결론 → 핵심 근거 → 변경 전후 → 쟁점 → 다음 행동',steps:['보고 대상과 한 줄 결론 확인','결론을 뒷받침하는 최신 근거만 선별','결정사항과 후속 담당·기한 기록']},
  district:{
    why:'초기 조사결과와 최신 지구단위계획 결정·변경 내용을 다시 맞춥니다.',risk:'예전 자료를 그대로 쓰면 변경된 높이·용도·배치 조건을 놓칠 수 있어요.',done:'최신 결정도서·적용 조항·설계 영향·추가 확인사항이 구분되면 됩니다.',
    material:'초기 법규검토표·최신 고시·결정조서·결정도·시행지침',source:'토지이음 → 관할 지자체 최신 고시/결정도서 → 기존 검토이력',order:'대상구역 → 최신 고시일 → 적용 조항 → 기존안 차이 → 설계 영향',steps:['초기 검토자료의 기준일과 적용구역 확인','최신 결정·변경 고시와 조항 대조','달라진 조건과 영향 도면을 표시해 재확인']},
  law:{
    why:'현재 변경 또는 현장조건에 직접 영향을 받는 법규 항목을 다시 확인합니다.',risk:'초기 법규표만 보면 현장 변경이 피난·면적·방화·주차 등에 주는 영향을 놓칠 수 있어요.',done:'변경사항·적용 조항·승인도서 차이·추가 절차 확인사항이 연결되면 됩니다.',
    material:'승인도서·현장 변경안·기존 법규검토표·최신 법령/조례',source:'승인도서 → 변경 전후 → 최신 공식 법령 → 인허가 담당/관할 확인',order:'변경점 → 영향 조항 → 승인내용 차이 → 추가 승인 필요성',steps:['승인도서와 현장 변경내용 비교','영향받는 법규 조항과 도면 표시','시공 전 추가 승인·협의 필요성을 담당자와 확인']},
  facade:{
    why:'완성안을 만들기 전에 입면의 선택기준과 제약조건을 정합니다.',risk:'형태만 먼저 정하면 구조·설비·원가·유지관리 조건 때문에 크게 되돌릴 수 있어요.',done:'디자인 방향·비교기준·구현 제약·다음 단계 검토항목이 정리되면 됩니다.',
    material:'주변 맥락·발주처 요구·예산·구조/설비 조건·재료 사례',source:'프로젝트 목표 → 대지/주변 맥락 → 평단면 기준 → 구조·설비·원가 조건',order:'디자인 목표 → 비교기준 → 구현 제약 → 방향안 → 검토 쟁점',steps:['입면이 해결할 목표와 비교기준 정리','평단면·구조·설비·예산 제약 확인','다음 단계에서 발전시킬 방향과 쟁점 기록']},
  precedent:{
    why:'현재 단계의 미해결 쟁점을 판단할 수 있도록 사례 범위를 좁힙니다.',risk:'넓게 이미지만 모으면 실제 재료·상세·공법 선택으로 연결되지 않을 수 있어요.',done:'비교기준·우리 조건과의 차이·적용 가능한 결론이 정리되면 됩니다.',
    material:'현재 미결사항·성능/예산 조건·재료/상세 후보·유사 프로젝트',source:'프로젝트 쟁점 → 사내 사례 → 제조사 기술자료 → 실제 적용 프로젝트',order:'결정할 쟁점 → 비교기준 → 사례 차이 → 적용 가능성 → 결론',steps:['지금 결정하지 못한 한 가지 쟁점 특정','같은 기준으로 3~5개 사례 비교','우리 프로젝트에 적용할 점과 제외할 점 기록']},
  model:{
    why:'현재 단계에서 모델을 사용할 목적과 기준정보를 먼저 맞춥니다.',risk:'설계·시공·준공 모델이 섞이면 도면과 현장이 서로 다른 버전을 볼 수 있어요.',done:'모델 목적·기준일·LOD/표현범위·연결 도서가 구분되면 됩니다.',
    material:'최신 승인도서·RFI·시공상세·현장변경·분야별 모델',source:'모델 실행계획/업무지시 → 승인도서 → 최신 분야자료 → 변경이력',order:'사용 목적 → 기준일 → 모델 범위 → 충돌/변경 → 도서 반영',steps:['설계검토·현장조정·준공 중 모델 목적 확인','최신 승인도서와 변경정보 기준일 통일','모델 변경을 관련 도면과 이력에 연결']},
  render:{
    why:'이미지가 지원해야 할 의사결정과 최신 설계 기준을 먼저 확인합니다.',risk:'실제 설계와 다른 이미지는 재료 승인이나 현장 협의에서 잘못된 기대를 만들 수 있어요.',done:'표현 목적·시점·최신 모델·검토할 차이가 명확하면 됩니다.',
    material:'최신 모델/도면·재료표·검토 목적·승인된 디자인 기준',source:'요청자/검토자 → 최신 설계 기준 → 재료/조명 조건 → 이전 승인 이미지',order:'사용 목적 → 최신안 → 강조할 차이 → 표현 수준 → 검토',steps:['디자인검토·재료승인·홍보·기록 중 목적 확인','최신 모델과 승인 재료 기준 대조','판단할 부분만 보이도록 시점과 표현범위 설정']},
  drawing:{
    why:'무엇을 기준으로 어떤 결정을 반영하는 수정인지 먼저 확인합니다.',risk:'기준도면이나 변경지시 없이 수정하면 다른 도면과 불일치가 생길 수 있어요.',done:'기준도면·변경사유·영향도서·검토자가 확인되면 됩니다.',
    material:'기존 도면·검토안·변경지시·회의록·관련 모델',source:'업무지시 → 기준도면 → 결정기록 → 연관 도면/분야자료',order:'기준도면 → 변경사유 → 영향범위 → 수정 → 비교검수',steps:['수정할 기준도면과 변경지시 확인','사전 검토안인지 공식 도면 수정인지 구분','영향도서와 검토 담당을 기록한 뒤 작업']},
  consultant:{
    why:'정식 조정 전에 필요한 전문분야 입력조건과 확인 시점을 정합니다.',risk:'계약범위와 질문 목적이 없으면 회신을 받아도 계획에 적용하기 어려울 수 있어요.',done:'분야·질문·요청자료·회신시점·결정주체가 구분되면 됩니다.',
    material:'과업범위·기본 계획조건·예상 질문·분야별 입력자료',source:'계약/과업범위 → PM 협업계획 → 유사 프로젝트 → 분야별 담당자',order:'필요 분야 → 질문 목적 → 제공자료 → 회신시점 → 설계 반영',steps:['현재 단계에 필요한 전문분야와 입력조건 확인','질문·제공자료·원하는 회신형식을 정리','계약/담당과 회신시점을 PM과 확인']}
};
const ACTUAL={
  review:['정확한 심의 종류와 최초·변경·보완 여부 확인','현재 단계에 접수하는 이유와 관할 요구목차 확인','최신 계획안과 협력업체 자료의 기준일을 맞춰 작성'],
  permit:['건축허가·사업계획승인·시행허가 등 정확한 절차명 확인','현재 단계에 제출하는 근거와 승인권자 요구목록 확인','건축·구조·기계·전기·소방 자료의 기준일과 누락 점검'],
  change:['원래 어떤 결정·심의·허가·승인을 받았는지 확인','변경 전후와 영향 도서를 같은 기준으로 비교','변경허가·변경신고·경미한 변경 여부를 담당자와 확정'],
  client:['협의 목적·독자·결정받을 항목 확인','선택지와 근거를 같은 기준으로 비교','결정사항·담당·기한을 회의록과 설계에 연결'],
  report:['보고 대상과 한 줄 결론 확인','최신 도면·수치·변경이유로 결론 뒷받침','결정사항과 다음 행동을 기록'],
  district:['최신 결정·변경 고시와 적용구역 확인','초기 검토표와 최신 조항 대조','달라진 조건의 설계·인허가 영향 기록'],
  law:['현재 검토 목적과 기준일 확인','적용 조항과 도면·수치 근거 대조','미확정 해석과 공식 확인 필요사항 분리'],
  facade:['현재 단계의 디자인 결정과 구현 쟁점 확인','평단면·구조·설비·재료 조건 동시 대조','결정안과 미결사항을 다음 도서에 반영'],
  precedent:['결정할 쟁점과 비교기준 확인','조건이 비슷한 사례의 차이를 같은 표로 비교','적용할 점과 제외할 점을 설계 결정에 연결'],
  model:['모델 사용 목적·기준일·표현범위 확인','도면·분야모델·변경정보 정합성 검토','변경이력과 출력도서를 같은 버전으로 연결'],
  render:['이미지의 독자와 판단 목적 확인','최신 모델·재료·조명 기준 대조','검토할 차이가 바로 보이게 출력하고 피드백 기록'],
  drawing:['기준도면·변경사유·영향범위 확인','연관 평단입면·표·모델을 함께 수정','변경 전후 비교와 출력본으로 누락 검수'],
  consultant:['질문·제공자료·필요 회신을 명확히 작성','담당·회신기한·버전을 같은 표로 관리','합의조건을 최신 건축도면과 결정기록에 반영']
};
const ADMIN=new Set(['review','permit','change']);
function selected(){return {task:$('task')?.value||'',phase:$('phase')?.value||''}}
function classify(task,phase){
  const pair=Object.entries(MATRIX).find(([,x])=>x.match.test(task||''));
  return pair&&pair[1].phases[phase]?{key:pair[0],status:pair[1].phases[phase]}:null;
}
function setPending(root,on){
  const a=root.querySelector('.actions');if(!a)return;
  a.classList.toggle('cc247-pending',on);a.setAttribute('aria-hidden',String(on));
}
function closeDrawers(root){
  root.querySelectorAll('.drawer.show').forEach(x=>x.classList.remove('show'));
  root.querySelectorAll('[data-drawer]').forEach(x=>{x.classList.remove('cc-drawer-active');x.setAttribute('aria-expanded','false')});
}
function stepsHTML(steps){return steps.map((x,i)=>'<div><small>0'+(i+1)+'</small><b>'+esc(x)+'</b></div>').join('')}
function applyPrep(root,key,phase,mode){
  const d=PREP[key],why=root.querySelector('[data-pane="why"]'),how=root.querySelector('[data-pane="how"]');
  if(why){
    const label=mode==='prep'?'선행 준비':'단계 맞춤';
    const title=why.querySelector('.why-title');if(title)title.innerHTML='<span class="cc247-mode">'+label+'</span>'+esc(phase)+'에서 먼저 확인할 내용';
    const first=why.querySelectorAll(':scope > .detail-grid .detail-cell p');
    [d.why,d.risk,d.done].forEach((x,i)=>{if(first[i])first[i].textContent=x});
    const where=why.querySelectorAll('.cc218-where .detail-cell p');
    [d.material,d.source,d.order].forEach((x,i)=>{if(where[i])where[i].textContent=x});
  }
  if(how){
    const title=how.querySelector('.cc232-how-head b');if(title)title.textContent=phase+' · 현재 단계에 맞춘 확인 순서';
    const note=how.querySelector('.cc232-how-head span');if(note)note.textContent=ADMIN.has(key)?'고정 제출목록보다 적용 절차와 공식 확인처부터 좁히세요.':'업무명보다 지금 이 결과물이 지원할 결정을 먼저 확인하세요.';
    const top=how.querySelector('.cc232-how-steps');if(top)top.innerHTML=stepsHTML(d.steps);
  }
}
function applyActual(root,key,phase){
  const how=root.querySelector('[data-pane="how"]'),why=root.querySelector('[data-pane="why"]');
  if(how){
    const title=how.querySelector('.cc232-how-head b');if(title)title.textContent=phase+(ADMIN.has(key)?' · 실제 절차 확인 후 수행':' · 실제 수행 기준 확인');
    const note=how.querySelector('.cc232-how-head span');if(note)note.textContent=ADMIN.has(key)?'정확한 절차명·승인권자·현재 접수단계를 확인한 경우에만 진행하세요.':'업무 목적·최신 기준자료·검토자를 확인한 뒤 진행하세요.';
    const top=how.querySelector('.cc232-how-steps');if(top)top.innerHTML=stepsHTML(ACTUAL[key]);
  }
  if(why){
    why.querySelector('.cc247-exception-note')?.remove();
    const n=document.createElement('div');n.className='cc247-exception-note';
    n.innerHTML=ADMIN.has(key)?'<b>예외 절차 확인</b><span>사전심의·부분허가·변경/보완절차·특별법·패스트트랙 등은 프로젝트별로 다릅니다. PM/인허가 담당과 관할 공식 안내로 확인하세요.</span>':'<b>현재 단계 확인</b><span>이 단계에서 실제 수행하는 이유와 결과물의 사용처를 확인한 뒤 기존 답변을 적용하세요.</span>';
    why.appendChild(n);
  }
}
function resolve(root,gate,key,phase,mode){
  setPending(root,false);gate.classList.add('resolved');gate.dataset.mode=mode;
  if(mode==='actual'){
    gate.querySelector('.cc247-title').textContent=ADMIN.has(key)?'실제 제출·변경 절차로 안내합니다':'현재 단계에서 실제 수행하는 업무로 안내합니다';
    gate.querySelector('.cc247-body').textContent=ADMIN.has(key)?'예외 가능성을 열어두고 정확한 절차명과 승인권자 확인을 우선합니다.':'업무 목적과 최신 기준자료를 확인하는 순서부터 안내합니다.';
    applyActual(root,key,phase);
  }else{
    gate.querySelector('.cc247-title').textContent=mode==='prep'?'선행 준비 업무로 안내합니다':'현재 단계의 목적에 맞게 다시 안내합니다';
    gate.querySelector('.cc247-body').textContent=ADMIN.has(key)?'현재 단계에 맞춰 대상·경로·시기·확인처 중심으로 내용을 바꿨어요.':'현재 단계에서 결정해야 할 내용과 기준자료 중심으로 바꿨어요.';
    applyPrep(root,key,phase,mode);
  }
  gate.querySelector('.cc247-choices')?.remove();
}
function goPhase(){
  if(typeof window.showView==='function')window.showView('home');else document.querySelector('[data-view="home"]')?.click();
  setTimeout(()=>$('phase')?.focus(),80);
}
function render(root,fit){
  root.querySelector('.cc247-fit-gate')?.remove();
  if(!fit||fit.status==='normal'){setPending(root,false);return}
  const phase=selected().phase,copy=COPY[fit.key][fit.status]||COPY[fit.key].conditional,state=STATUS[fit.status];
  const actualLabel=ADMIN.has(fit.key)?(fit.status==='mismatch'?'변경·보완 절차예요':'실제 제출 절차예요'):'이 단계에서 실제 수행해요';
  const gate=document.createElement('section');gate.className='cc247-fit-gate '+state[1];
  gate.innerHTML='<div class="cc247-fit-copy"><small>'+esc(state[0])+' · '+esc(phase)+'</small><b class="cc247-title">'+esc(copy[0])+'</b><p class="cc247-body">'+esc(copy[1])+'</p></div><div class="cc247-choices"><button type="button" data-fit="prep">'+(fit.status==='prep'?'선행 준비로 보기':'단계에 맞게 다시 보기')+'</button><button type="button" data-fit="actual">'+actualLabel+'</button><button type="button" data-fit="phase">단계 다시 선택</button></div>';
  const stage=root.querySelector('.stage-banner');if(stage)stage.insertAdjacentElement('afterend',gate);else root.prepend(gate);
  closeDrawers(root);setPending(root,true);
  gate.querySelector('[data-fit="prep"]').onclick=()=>resolve(root,gate,fit.key,phase,fit.status==='prep'?'prep':'check');
  gate.querySelector('[data-fit="actual"]').onclick=()=>resolve(root,gate,fit.key,phase,'actual');
  gate.querySelector('[data-fit="phase"]').onclick=goPhase;
}
function enhance(){
  const root=$('contextResult');if(!root||!root.innerHTML.trim())return;
  const s=selected();render(root,classify(s.task,s.phase));
}
function style(){
  if($('cc247Style'))return;const s=document.createElement('style');s.id='cc247Style';
  s.textContent='.cc247-fit-gate{display:flex;justify-content:space-between;gap:18px;align-items:center;margin:12px 0;padding:14px 16px;border:1px solid #D8E5F7;border-radius:14px;background:#F4F8FE}.cc247-fit-gate.conditional{border-color:#E9DFC5;background:#FFF9EE}.cc247-fit-gate.mismatch{border-color:#EED7D7;background:#FFF5F5}.cc247-fit-copy{min-width:0}.cc247-fit-copy small{display:block;color:#3864B0;font-size:8.5px;font-weight:950}.cc247-fit-gate.conditional small{color:#8A672C}.cc247-fit-gate.mismatch small{color:#A55252}.cc247-fit-copy b{display:block;margin-top:4px;color:#314A6B;font-size:13px}.cc247-fit-copy p{margin:4px 0 0;color:#68788D;font-size:10px;line-height:1.5}.cc247-choices{display:flex;flex:0 0 auto;flex-wrap:wrap;justify-content:flex-end;gap:6px}.cc247-choices button{padding:7px 9px;border:1px solid #D7E0EC;border-radius:9px;background:#fff;color:#4F6380;font-size:9px;font-weight:900}.cc247-choices button:first-child{border-color:#8FB1E8;background:#EEF4FF;color:#2E5EB5}.cc247-fit-gate.resolved{padding:11px 14px}.actions.cc247-pending{display:none!important}.cc247-mode{display:inline-flex;margin-right:7px;padding:4px 7px;border-radius:999px;background:#EEF4FF;color:#3565BD;font-size:8.5px;font-weight:950}.cc247-exception-note{display:flex;gap:8px;margin-top:10px;padding:10px 12px;border:1px solid #E9DFC5;border-radius:11px;background:#FFF9EE}.cc247-exception-note b{flex:0 0 auto;color:#856227;font-size:9px}.cc247-exception-note span{color:#6F6553;font-size:9.5px;line-height:1.5}@media(max-width:760px){.cc247-fit-gate{align-items:stretch;flex-direction:column}.cc247-choices{justify-content:flex-start}.cc247-choices button{flex:1 1 auto}.cc247-exception-note{display:grid}}';
  document.head.appendChild(s);
}
function install(){
  style();
  document.addEventListener('click',e=>{if(e.target.closest('#analyze'))setTimeout(enhance,90);if(e.target.closest('.master-levels button'))setTimeout(enhance,90)});
  if($('contextResult')?.innerHTML.trim())setTimeout(enhance,110);
  const counts={normal:0,prep:0,conditional:0,mismatch:0};
  Object.values(MATRIX).forEach(x=>Object.values(x.phases).forEach(v=>counts[v]++));
  window.CC_TASK_PHASE_FIT={version:VERSION,scope:'all-13',tasks:Object.keys(MATRIX).length,decisions:Object.keys(MATRIX).length*6,statuses:Object.keys(STATUS),counts};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
