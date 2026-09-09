# 10-1 실행 구조 감사 — 척척 v2.1.71

기준 커밋: `14aea2a07cc05c47cb654fb1af01d4dc8f7322c4`
범위: index.html의 직접 로드 자산 70개와 진입 HTML, 실행 순서·등록 지점·주요 화면 수정 경로. 실행 코드 변경 없이 후속 정리의 기준을 만든다.
70개 자산 중 68개는 원격 blob SHA와 바이트 단위 일치했다. v2_data.js와 v219_ask_mascot.css는 원격 원문을 다시 확인했으며 로컬 끝줄 개행 1개만 다르다. index.html도 원격과 일치했다.

## 결론

검색 실행 순서와 저장 책임은 정리됐지만, 화면 생성과 콘텐츠 판단은 아직 충분히 분리되지 않았다. 새 UI 전면 교체 준비는 미완료다.
우선순위는 **내용을 결정하는 공통 모델 → 단일 화면 생성과 이벤트 → CSS 소유권**이다. 파일 합치기나 이름 변경만으로 해결할 수 없다.

## 재현 가능한 현황

`node tools/audit-runtime.cjs`로 직접 로드 목록과 정적 지표를 다시 산출한다.

| 항목 | 수 |
|---|---:|
| 직접 로드 JavaScript | 58 |
| 직접 로드 CSS | 12 |
| DOMContentLoaded를 참조하는 모듈 | 49 |
| style 요소 생성 코드가 있는 모듈 | 36 |
| setTimeout 호출 위치 | 8 |
| new MutationObserver 작성 위치 | 3 |
| 활성 JS/CSS의 !important 토큰 | 1703 |

위 수치는 정적 코드 위치 수다. 타이머 실행 횟수나 성능 측정값이 아니다. observer는 반복문에서 여러 인스턴스가 생성될 수 있다. !important 수 자체가 버그 수는 아니다.
직접 미로드 후보: v221_progressive.js, v239_unified_search_dispatch.js, v2_quiz.js. 전체 참조 확인 후 제거하며, v221_progressive.css는 현재 로드 중이므로 함께 지우면 안 된다.

## 현재 실행 흐름

### 초기 로딩

1. index.html의 기존 홈·검색·퀴즈 DOM과 12개 CSS가 먼저 파싱된다.
2. body 끝의 일반 script 태그가 순서대로 실행된다. 데이터, 퀴즈, 저장소, runtime 이후 v2_core.js가 실행된다.
3. core는 즉시 populate → updateMasterUI → renderQuizOverview → renderLevel → showView('home')를 호출한다.
4. 후속 모듈 대부분이 DOMContentLoaded에 등록한 install을 실행한다. 검색/맥락 슬롯 등록, CSS 삽입, 홈 DOM 이동·문구 교체가 여기서 이루어진다.
5. navigation/feedback observer와 일부 예약 작업이 이후 상태를 보정한다.

**확인된 사실:** 첫 HTML과 설치 완료 후 홈 DOM은 다르다. v249.prepareHome은 form과 검색 카드를 이동하고 details/grid를 새로 만든다. v212·v215·v216 등도 기본 화면을 가공한다.
**합리적 추정:** 초기 구화면 노출은 이 두 단계 생성과 관련될 가능성이 높다.
**미확인:** 실제 기기에서 어떤 프레임이 보였는지, 캐시와 다운로드 지연의 기여도. 이번 정적 감사로 초기 깜빡임이 해결됐다고 하지 않는다.

### 검색

입력/예제/Enter → app-runtime.handleSearch → classify → 선택한 renderer 1개 → RESULT_ORDER 후처리.
우선순위:
comparison → concept-comparison → ask → definition → judgement → permit-workflow → change → glossary → public → reviews → bim → precedent → specific → common → tools → expanded → fallback.
후처리:
copy → neutral → change-impact → bim → compact → focus → hierarchy → visual → feedback → navigation.

중복 슬롯 등록은 오류로 막는다. 검색 중 observer를 중단하는 구조는 유지할 가치가 있다.
그러나 각 renderer가 HTML을 만들고 v250.resultActions가 그 HTML의 class·문구를 다시 읽어 요약한다. 새 UI에서 class를 바꾸면 답변 요약까지 바뀔 수 있다.

### 업무 맥락

analyze: 선택 DOM에서 프로젝트·업무·단계·레벨 읽기 → 기본 contextResult HTML 생성 → renderContext의 순서대로 변경 → 필요 시 context 화면 이동.
순서:
why → tools → how → public-use → facility-use → public-flow → focus → phase → phase-fit → project-route → project-label → bim → reviews → depth → hierarchy → drawings → judgement → visual → feedback.
단계 부적합 선택 후에는 depth부터 presentation 일부만 다시 실행한다.

순서는 명시돼 있지만 여러 단계가 같은 WHY/HOW/버튼 DOM을 수정한다. context-view.js는 신구 class 두 벌을 동시에 쓰는 임시 호환 계약이다.

### 프로젝트·레벨·퀴즈

- 프로젝트: v230 editor → 등록 extension의 collect → project-store.save → UI 갱신/cc:projects-rendered. 저장 키와 기존 필드 보존을 유지한다.
- 레벨: level-store가 저장 실패를 처리한다. 실제 레벨/마스터 인증/미리보기의 의미는 아직 core 전역 함수에 있다.
- 퀴즈: bank → engine → ui. 순수 채점과 승급 판정은 재사용 가능하다. 진행 표시에는 v256 observer가 여전히 참여한다.
- 판단 사례: judgement-data → engine → ui. UI와 독립된 분류·평가와 프로젝트 불변성 규칙은 유지한다.

## 확인된 구조 문제와 처리 대상

| ID | 근거 | 영향 | 처리 단계 |
|---|---|---|---|
| A01 | core 즉시 초기화 + 49개 모듈의 DOMContentLoaded 참조 + v249 홈 재배치 | 최종 화면 생성 시점·책임 분산 | 10-3 |
| A02 | core.analyze가 LV1 WHY를 잠금으로 생성하고 v250/v252가 해제 | 현재 교육 원칙과 기본 생성 코드 불일치 | 10-2/3 |
| A03 | v250.bindDrawer, v252.bindOpenDrawer가 cloneNode/replaceWith, v255는 capture와 stopImmediatePropagation으로 최종 제어 | 이벤트 소유권 중복; 현재 제어기가 앞 단계 핸들러 실행을 차단하는 의존성 | 10-3 |
| A04 | v250.resultActions가 클래스와 렌더링된 글자를 파싱 | UI 변경이 내용 선택에 영향 | 10-2 |
| A05 | core/218/219/232/250/246/247/248의 업무·단계·레벨 규칙과 DOM 생성 혼재 | 같은 조건을 여러 곳에서 해석·덮어쓰기 | 10-2 |
| A06 | v253가 view class observer와 클릭 후 0ms 및 450ms 보정 사용 | showView와 활성 메뉴/접근성 상태 관리 분리 | 10-3 |
| A07 | v256가 quizArea·cc230Editor subtree/문자 변경을 감시해 30ms 후 다시 표시 갱신 | UI 변화에 따른 간접 실행; 퀴즈 상태와 표시 책임 분리 | 10-3 |
| A08 | CSS 12개 + style 생성 모듈 36개, 전역 규칙·중복 class·!important 누적 | 적용 우선순위 추적 어려움; 라디오 충돌과 같은 범위 누출 위험 | 10-4 |
| A09 | v232/235/246/248의 레벨 직접 localStorage 읽기 fallback | 공통 저장 실패 대응·미리보기 정책을 우회할 가능성. 정상 로드에서는 viewLevel 우선 | 10-2 |
| A10 | UI 버전 2.1.71, data-ui-version 2.1.67, 모듈 내부 과거 VERSION 및 서로 다른 cache query | 릴리스 추적 혼란. 다른 cache query만으로 오류라고 단정하지 않음 | 10-3/4 |

A03은 현재 버튼이 반드시 두 번 토글된다는 뜻이 아니다. v255 capture 제어기가 뒤 핸들러를 차단한다. 이 우회 구조 자체를 없애는 것이 목표다.
A05의 반복은 전부 삭제 대상이 아니다. 단계/프로젝트 보충의 역할을 보존하면서 동일 입력으로 결과 데이터를 먼저 완성해야 한다.

## 타이머·관찰자: 무조건 삭제하지 않을 것

| 소유자 | 현재 목적 | 결정 |
|---|---|---|
| app-runtime | searchResult 직계 자식 변경 호환, 후처리 중 disconnect | 외부 DOM 직접 쓰기 소비자를 확인한 후 명시적 갱신으로 전환 |
| v253 | view class 변경 관찰, navigation 재동기화 | view 전환 단일 함수에서 갱신 |
| v256 | 퀴즈/프로젝트 진행 표시 | quiz 상태변경·프로젝트 render/input 이벤트에서 명시적 호출 |
| core | 5초 후 confetti 제거 | 정상적인 연출 수명 관리, 일괄 삭제 대상 아님 |
| v230/v247 | 편집기·단계 필드 focus 예약 | mount 이후 focus로 이전 |
| v248 | 프로젝트 화면 연 후 80ms 뒤 편집 버튼 재클릭 | openEditor(id) 같은 직접 진입점으로 교체 |
| v237 | 맥락 복귀 후 스크롤 예약 | 렌더 완료 경계로 이동, 사용자 이동 동작 보존 |

## 유지할 구조와 보안 경계

유지: runtime의 순서표/중복 등록 거부, project-store의 허용 필드·저장 오류·충돌 검사, level-store의 세션 fallback, quiz/judgement 순수 엔진, 단계 부적합 선택의 명시적 처리.
project-store의 read→비교→write는 원자적 트랜잭션이 아니므로 동시에 쓰는 탭을 완벽히 직렬화한다고 보장하지 않는다. list()는 읽기 실패를 빈 배열로 돌려주므로 UI에서 read() 오류와 빈 프로젝트를 구분할지 확인한다.

CSP는 script-src self, connect-src none 등을 사용한다. style-src unsafe-inline은 동적 스타일과 연결돼 있다. CSS 외부화 후 제거 가능 여부를 검증한다.
사용자 텍스트는 textContent 또는 이스케이프된 템플릿으로 제한하는 원칙을 유지한다. innerHTML 존재 수만으로 취약점을 판정하지 않는다. 전체 입력→출력 경로, 실제 보안 헤더, 배포 계정 권한/백업, Safari 검증 및 침투 테스트는 이번 감사의 완료 범위가 아니다.
마스터키는 학습 테스트 기능이며 사용자 인증이나 권한 보안 수단으로 취급하지 않는다.

## 후속 구현 계약

### 10-2 — 먼저 내용의 책임 분리

- 공통 입력: taskId, phaseId, facilityId, approvalRoute, bimMode, actualLevel, previewLevel. 독립 검색과 저장 프로젝트 맥락을 구분.
- 공통 출력: 제목·핵심 행동·WHY/확인처·HOW·주의·판단·완료기준·보충·관련 학습의 데이터 모델.
- 적용 순서: 일반업무 → 단계 → 단계 적합성 → 프로젝트 경로/시설 → BIM·심의 보충 → 레벨별 깊이. 기존 동작 대조 후 계약 확정.
- 화면 class/문구를 읽어 핵심 답변을 결정하지 않기. 기존 콘텐츠는 어댑터를 통해 점진 이전.
- 저장 키·알 수 없는 기존 필드·레벨 의미 보존. 전체 프로젝트 초기화 금지.

### 10-3 — 화면과 이벤트 단일 소유

- bootstrap 한 곳에서 데이터/등록 완료 → 상태 복원 → 최종 화면 mount → 이벤트 연결.
- 처음부터 최종 구조로 홈을 생성. 기존 화면을 그린 뒤 교체하는 경로 제거. 단순 body 숨기기로 완료 처리하지 않기.
- 맥락 pane 전환 1개 제어기, navigation 1개 제어기. clone/reclick 우회 제거.
- 퀴즈·프로젝트 진행 표시는 상태/이벤트에서 직접 갱신. observer 호환 계층은 마지막 소비자 제거 후 삭제.

### 10-4 — CSS와 사용하지 않는 코드 정리

- 기본 토큰/레이아웃/입력 컨트롤/기능별 스타일 소유권 명시. 텍스트 input·radio·checkbox 구분.
- 동적 style과 중복 덮어쓰기 이전 시 최종 computed style을 기준으로 비교.
- 미로드 JS의 실제 참조·테스트 의존 확인 후 제거. 파일명 번호 제거는 책임 분리 이후.
- 새 UI 준비 완료 조건: UI 교체가 내용 판단/저장/채점에 영향 없음, 초기화 한 경로, pane 이벤트 한 소유자, 남은 예외 목록 공개.

## 검증 기준선과 한계

현재 `node tests/run.cjs`의 22개 묶음 모두 통과했다. 이는 구조가 깨끗하다는 증거가 아니라 변경 전 기능 기준선이다.
사용자 보고 버그를 기준으로 새로고침 첫 화면, 긴 선택지, 맥락 전 pane 반복 클릭, 단계/용도/레벨 변경, 오답 학습 복귀, 저장 실패/기존 데이터 보존을 후속 회귀 항목으로 유지한다.
이번 단계에서 브라우저 성능 수치나 Safari/iPad 실기기 결과를 새로 측정하지 않았다. 퀴즈 난이도 사용자 검증은 대기 상태다.

## 전체 활성 스크립트: 실제 로드 순서와 등록 소유자

| 순서 | 파일 | runtime 슬롯 또는 역할 단서 |
|---|---|---|
| 1 | v2_security.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 2 | v2_data.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 3 | quiz-bank.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 4 | quiz-engine.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 5 | quiz-ui.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 6 | level-store.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 7 | app-runtime.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 8 | context-view.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 9 | v2_core.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 10 | v21_search.js | Search:fallback |
| 11 | v211_polish.js | Result:copy |
| 12 | v212_sidebar.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 13 | v213_logo.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 14 | v215_help_cards.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 15 | v216_flow.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 16 | v219_ask_mascot.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 17 | v216_search_expand.js | Search:expanded |
| 18 | v217_precedent_search.js | Search:precedent |
| 19 | v218_lv2_context.js | Context:why |
| 20 | v219_lv2_tools.js | Context:tools, Search:tools |
| 21 | v220_typography.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 22 | v223_ask_router.js | Search:ask |
| 23 | v224_public_classification.js | Context:public-use |
| 24 | v226_facility_first.js | Context:facility-use |
| 25 | v227_public_procurement.js | Context:public-flow, Search:public |
| 26 | v228_search_quality.js | Search:common |
| 27 | v229_glossary.js | Search:glossary |
| 28 | project-store.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 29 | v230_projects.js | Context:project-label |
| 30 | v231_projects_fix.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 31 | v232_lv3_bim.js | Search:bim, Context:how |
| 32 | v233_bim_context.js | Context:bim |
| 33 | v234_bim_search_fix.js | Result:bim |
| 34 | v245_comparison_router.js | Search:comparison, Search:concept-comparison |
| 35 | v235_permit_reviews.js | Search:reviews, Context:reviews |
| 36 | v236_ui_readability.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 37 | v237_answer_readability_nav.js | Result:navigation |
| 38 | v238_search_typography_unify.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 39 | v240_specific_intent_priority.js | Search:specific |
| 40 | v241_permit_workflow.js | Search:permit-workflow |
| 41 | v242_compact_search_ui.js | Result:compact |
| 42 | v243_change_workflow.js | Search:change |
| 43 | v244_change_impact.js | Result:change-impact |
| 44 | v246_phase_context.js | Context:phase |
| 45 | v247_task_phase_fit.js | Context:phase-fit |
| 46 | v248_project_route_judgement.js | Context:project-route |
| 47 | v249_home_search_focus.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 48 | v250_result_action_focus.js | Context:focus, Result:focus |
| 49 | v251_search_reliability.js | Search:definition, Result:neutral |
| 50 | v252_level_depth_progression.js | Context:depth |
| 51 | v253_ui_foundation.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 52 | v254_information_hierarchy.js | Context:hierarchy, Result:hierarchy |
| 53 | v255_visual_language.js | Context:visual, Result:visual |
| 54 | v256_interaction_feedback.js | Context:feedback, Result:feedback |
| 55 | v257_stage_drawing_guide.js | Context:drawings |
| 56 | judgement-data.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 57 | judgement-engine.js | runtime 슬롯 없음; 데이터·저장·초기화·UI 공통 모듈 |
| 58 | judgement-ui.js | Search:judgement, Context:judgement |

## 활성 CSS

- v2.css
- v2_brand.css
- v211_ui.css
- v212_sidebar.css
- v213_logo.css
- v215_help_cards.css
- v216_flow.css
- v219_ask_mascot.css
- v220_typography.css
- v221_progressive.css
- v223_ask_router.css
- quiz.css

미등록 공통 모듈을 불필요한 파일로 해석하면 안 된다. 상세 지표와 SHA는 audit-runtime.cjs 출력으로 추적한다.

