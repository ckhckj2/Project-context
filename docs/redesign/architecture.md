# 구현 구조와 인수 기준 (2~8단계용 설계)

2026-09-17: 책임별 공통 모듈·로컬 자동검사·CI 구성 작성은 [2단계 구현 기록](stage-2.md)을 따른다. 아래는 전체 단계의 설계 기준이며, 운영 CI 활성화까지 완료했다는 뜻이 아니다.

현재 존재하는 검사와 앞으로 구축할 검사를 구분한다. 1단계에서 CI나 운영 모듈을 변경하지 않는다.

## 제안하는 책임 경계

| 경로 | 책임 | 금지 의존 |
| --- | --- | --- |
| src/content/ | stable ID 기반 태스크·설명·분기 규칙·문항·출처 | DOM, 저장소, 네트워크 |
| src/domain/ | 경로 계산·조건 판단·레벨 공개·채점 | UI, localStorage, DOM |
| src/application/ | 사용자 명령 처리·상태 전이·트랜잭션 | DOM 세부 구조 |
| src/infrastructure/ | 저장 검증·오류/충돌·스키마 이전 | 화면 렌더링 |
| src/ui/ | 상태를 표현하고 명령을 전달 | 직접 저장·채점·업무 판단 |
| src/styles/ | 토큰·공통 컴포넌트·화면 범위 스타일 | 런타임 스타일시트 주입 |
| tests/ | 데이터 무결성·도메인·경계·사용자 흐름 검사 | 구현 그대로 복제한 무의미한 검사 |

화면 → application → domain/content 순으로 호출한다. 저장소는 application에 주입한다. 하나의 상태 변경은 한 곳에서 처리한다. 명시적인 함수/이벤트를 사용하고 DOM 관찰·setTimeout 재시도·전역 함수 덮어쓰기를 갱신 수단으로 사용하지 않는다.
프레임워크와 번들러는 이 문서에서 확정하지 않는다. 기존 순수 로직(work-model, work-rules, quiz-engine 등)은 검증된 계약을 재사용하고, 기존 DOM 종속 모듈은 기능별 교체 계획을 마련한다.

## 최소 데이터 계약 초안

- TaskDefinition: id, title, primaryTrack, relatedTracks, sourceRefs, actionSteps(stable id), prerequisites, completionCriteria, essentialNotices.
- Decision: id, prompt, options(value, label), unknownOption, effect; 선택 과정과 실행 노드 분리.
- Workflow: id, projectId(optional), contentRevision, context, selectedTaskIds, nodes, edges, stepStates, notes, status, revision, deletedAt.
- Edge: from, to, kind(prerequisite/parallel-related). 필수 선행과 단순 관련을 구분. 순환·자기 연결·없는 ID 거부.
- Learning: trackId → earnedLevel. Display: trackId → viewDepth (1 <= viewDepth <= earnedLevel). UI 변경이 획득/진행을 수정하지 않음.
- Question: id, primaryTrack, objectiveId, level, type, prompt, choices/orderedSteps/acceptedAnswers, explanation, distractorReasons, sourceRefs, reviewStatus.

질문 정답이나 로컬 성적을 위조 불가능한 인증으로 약속하지 않는다. 클라이언트 저장은 검증 가능한 학습 기록이지 자격 검증 서버가 아니다.
contentRevision 변경 시 저장 노드 ID 대응과 재검토 상태를 정의한다. 제목 문자열/배열 순번을 저장 ID로 쓰지 않는다.
실행 화면의 확대/접기/보기 깊이는 모델의 업무 포함/완료와 별도 상태로 둔다.

## 보안 요구와 검사 계획

- 자유 입력/저장 문자열은 textContent 또는 동일한 안전한 텍스트 경로로 표시한다. HTML 템플릿에 삽입해야 하는 신뢰된 정적 콘텐츠와 사용자 입력을 분리한다.
- localStorage JSON은 읽을 때 스키마·자료형·길이·허용 키·stable ID·참조 관계를 검증한다. 알 수 없는 기존 필드는 무조건 삭제하지 않고 격리/호환 정책을 따른다. __proto__/constructor 등 위험 키를 객체 병합 대상으로 쓰지 않는다.
- 손상/용량 초과/접근 차단/탭 충돌 시 저장 성공으로 표시하지 않는다. 오류 전 원본을 덮어쓰지 않으며 복구 안내만 제공한다.
- 외부 스크립트·분석 추적·폰트 CDN을 추가하지 않는다. 파일 업로드/가져오기/백업/AI 요청 API는 없음. 운영 코드의 네트워크 경계를 검사한다.
- 외부 근거 링크는 HTTPS·허용 URL 구조를 검증하고 새 창은 noopener/noreferrer. 표시 문구나 저장값으로 임의 코드를 실행하지 않는다.
- 기존 CSP를 약화하지 않는다. 현재 style-src unsafe-inline은 기존 동적 속성 때문에 남아 있다. 새 컴포넌트는 클래스로 표현하고 제거 가능 여부는 전체 호환 검증 후 결정한다.
- 계정/호스팅/단말 침해를 앱 입력 검증으로 해결한다고 주장하지 않는다. 기밀 문서 저장소로 홍보하지 않는다.

## CI 배포 차단 계획

2단계에서 GitHub Actions의 검증 작업과 Pages 배포 의존성을 연결한다. 실패한 커밋이 다른 Pages 경로로 우회 배포되지 않도록 현재 배포 설정을 확인한다. 실제 워크플로/보호 설정을 적용한 뒤에만 `배포 차단 구현 완료`라고 기록한다.

필수 게이트:
1. 의존 경계 검사: UI의 직접 저장소 접근, domain의 DOM 접근, 외부 스크립트/동적 style 생성 등 위반 검출. 기존 이관 대상 예외는 파일/기한 명시, 무제한 예외 금지.
2. 데이터 무결성: 태스크·학습 목표·조건 분기·출처 참조 존재, 그래프 순환/고아/중복, 문제 선택지·정답·순서 배열 계약.
3. 도메인 회귀: 입력 불변성, unknown 처리, 단계/시설/승인 경로 분리, 다중 가지·합류, 상위 조건 변경 영향.
4. 저장 회귀: 과거 기록 보존, 손상/실패/탭 충돌, viewDepth와 earnedLevel 분리, 퀴즈 중단 복귀, 수동 완료.
5. 브라우저 회귀: 대표 신규/재방문 흐름, XSS 입력, CSP, 네트워크, 390/768/1440px, 키보드/확대/동작 줄이기.
6. 육안 검토: 한 화면의 주 목적·읽는 순서·여백·정보량·버튼 경쟁. 자동 검사가 디자인 품질을 대신하지 않는다.

## 접근성 계약

버블은 이름과 상태가 있는 button. 색 외에 `선택됨`/`지금`/`완료` 텍스트 또는 접근성 속성 사용. 선만으로 의미를 전달하지 않고 목록 읽기 순서와 상태 요약을 제공한다.
조건/모바일 상세는 표준 dialog 또는 동등한 포커스 관리. 열면 내부 포커스, Escape/닫기, 종료 후 원래 버튼 복귀. 뒤 배경 조작 차단. 시안의 동작을 실제 구현에서도 검증한다.
기본 조작 영역 44px 이상, 일반 텍스트 대비 4.5:1 목표, 200% 확대에서 기능 유지. prefers-reduced-motion이면 강제 이동/전환을 제거한다.

## 제3자 인수 문서

운영 진입점, 데이터 흐름, 폴더별 책임, stable ID 규칙, 저장 스키마/이전, 새 태스크·문제 추가 방법, 검사/로컬 실행/배포/롤백 명령, 오류 재현 예시를 README와 docs에 남긴다.
모듈 이름에 새 버전 번호를 붙여 기존 동작을 덮는 방식은 사용하지 않는다. 기능 교체가 검증되면 옛 진입점·CSS·이벤트도 함께 제거한다. 미완성 구조를 완성됐다고 서술하지 않는다.
