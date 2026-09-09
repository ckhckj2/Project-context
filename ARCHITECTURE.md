# 척척 구조 — v2.1.67

## 현재 실행 경계

| 책임 | 소유자 | 계약 |
| --- | --- | --- |
| 검색 입력·예제·Enter·의도 우선순위 | app-runtime.js | registerSearch(id, match, render). 분류 뒤 한 renderer만 실행 |
| 업무 맥락 생성 | v2_core.js → app-runtime.js | 기본 DOM 생성 뒤 renderContext()를 동기적으로 실행 |
| 업무별·단계별·프로젝트별 콘텐츠 | 각 콘텐츠 모듈 | registerContext(id, fn). 정해진 순서로 자신의 내용을 작성 |
| 기본·상세 WHY/HOW 갱신 | context-view.js | 제목·보이는 수행 순서·완료 기준을 같은 계약으로 갱신 |
| 검색 결과 요약·BIM·시각 표현 | 결과 모듈 + app-runtime.js | registerResult(id, fn). 결과 생성 뒤 정해진 순서로 실행 |
| 업무 맥락 버튼 | v255_visual_language.js | 하나의 위임 핸들러와 고정 응답 영역 사용 |
| 프로젝트 저장·검증 | project-store.js | ID 기반 변경, 기존 필드 보존, 충돌·실패 반환 |
| 레벨 저장 | level-store.js | 기존 키 유지, 저장 거부 시 세션에서 유지하고 화면에 안내 |
| 버전 표시·자산 캐시 | index.html | 모듈이 화면 버전을 덮어쓰지 않음 |
| 외부 링크·입력 길이 | v2_security.js | 클릭 시 URL 재검사, HTTPS·자격증명 없는 주소, 입력 제한 |

## 이번 정리에서 제거한 구조

- runSearch를 여러 파일이 덮어쓰는 체인과 입력창 복제·버튼 ID 변경·재클릭 우회를 제거했다.
- 별도 검색 캡처 라우터 대신 비교 → 문의 → 정의 → 실무 → 용어/전문분야 → 구체업무 → 일반업무 순서를 한 파일에 명시했다.
- 업무 맥락의 각 모듈이 #analyze를 감시하면서 40~1050ms 뒤 내용을 수정하던 타이머를 제거했다.
- HOW를 먼저 만든 뒤 단계 규칙을 적용한다. 낮은 레벨의 기본정보 공개 후 단계 부적합 선택과 프로젝트 승인경로를 적용한다.
- 레벨 미리보기 변경은 기존 맥락을 새 레벨로 재구성한다. 메뉴 공개 여부가 아니라 설명 깊이가 달라진다.
- contextResult의 반복 MutationObserver를 제거했다. 도면 목록·추가 확인·drawer 클릭은 기본 콘텐츠를 재생성하지 않는다.
- searchResult는 루트의 childList만 한 observer가 감시한다. 결과 장식 중 observer를 끊어 자기 출력이 다시 갱신을 유발하지 않는다.
- 변경업무의 실제/선행 준비 선택 후에는 표현 단계만 갱신하며 선택창을 다시 만들지 않는다.
- v221_progressive.js와 v239_unified_search_dispatch.js는 현재 실행 경로에서 제외했다. 대체된 타이밍 기반 테스트는 실행 순서·의도 충돌 검사로 교체했다.

## 프로젝트 데이터 보존

cc_projects_v1 / cc_active_project_v1과 기존 필드를 유지한다. 자동 초기화·마이그레이션은 하지 않는다.
기본정보·승인경로는 editor extension 계약으로 한 번 저장한다. BIM도 동일한 ProjectStore를 사용한다.
잘못된 JSON·레코드·중복 ID·오래된 편집은 저장 오류로 반환하며 원문을 빈 목록으로 덮어쓰지 않는다.
localStorage는 다중 탭 트랜잭션/CAS를 제공하지 않으므로 비교 직후의 동시 쓰기까지 보장하지 않는다.
레벨 저장 실패의 세션 유지 동작은 프로젝트 저장 성공으로 처리하는 대체 동작이 아니다.

## 유지 규칙

1. 새 기능은 해당 콘텐츠 모듈과 runtime의 순서표에 등록한다. 새 전역 검색 가로채기·runSearch 재할당·추정 지연시간을 추가하지 않는다.
2. matcher는 질문을 분류하고 renderer는 DOM을 작성한다. 등록 순서 대신 runtime의 명시적 순서를 따른다.
3. contextResult를 observer로 보정하지 않는다. 상태 변화에서 renderContext 또는 필요한 표현 갱신을 호출한다.
4. 동작용 data 속성과 상태용 data 속성을 분리한다. native details/summary의 기본 동작을 유지한다.
5. 사용자·저장소 값은 escaping 또는 textContent로 표시한다. CSP 완화·eval·새 외부 통신을 추가하지 않는다.
6. 저장 구조를 바꾸면 기존 필드·손상 데이터·실패·다중 편집을 검사한다.
7. 배포는 관련 파일을 한 tree/commit으로 반영하며 강제 ref 변경을 하지 않는다.

## 검사

```sh
node tests/run.cjs
node tests/architecture-inventory.cjs
```

runtime-pipeline은 실제 콘텐츠 모듈의 classifier로 비교·문의·정의·BIM·공공·인허가·변경·구체업무·일반업무를 검사한다.
실행 순서, 중복 등록 거부, 검색 observer 분리, 단계 부적합 선택 보존도 검사한다.
project-store와 level-store 검사는 저장 차단·용량 초과·기존 필드 보존을 포함한다.
20개 자동검사 묶음을 통과했다. Chrome 미리보기에서 비교·입면 검색(버튼/Enter/예제), 맥락 drawer, 도면 추가 확인, 레벨 전환, 중간설계 HOW 및 기본계획 선행 준비 WHY/HOW를 확인했다.
실제 Safari/iPad 검증과 침투 테스트를 대체하는 검사라고 주장하지 않는다.

## 이번 정리의 완료 기준과 이후 범위

이번 선행 구조 정리는 검색 진입점·업무 맥락 실행 순서·저장 책임을 명시하는 단계다.
내용·표현 모듈의 v2xx 파일명은 기존 콘텐츠와 CSS 호환성을 위해 유지한다.
모든 콘텐츠 데이터의 별도 파일화와 누적 CSS의 통합은 8(LV4)·9(퀴즈) 이후 두 번째 구조 정리에서 다룬다.
로드맵은 8 → 9 → 10(후속 정리·회귀) → 11(일정표) 순서를 유지한다.

## 보안 범위

정적 사이트의 CSP 외부 통신 제한과 로컬 저장 원칙을 유지한다. localStorage는 암호화된 보관소가 아니다.
브라우저 코드만으로 사용자 PC의 랜섬웨어·악성 확장·GitHub 계정 탈취를 방어한다고 보장하지 않는다.
계정 2FA·배포 권한·백업·브랜치 보호 정책은 별도의 운영 점검 항목이다.
