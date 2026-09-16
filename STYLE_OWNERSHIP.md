# 10-4 스타일 책임 — v2.1.75

기준 버전: dfc49d6 (v2.1.74). 런타임 CSS 36개 구간을 정적 CSS로 이전하고 파일 30개를 제거했다. 배포 상태는 로컬 검증과 별도로 확인한다.

## 스타일 소유권

| 파일 | 책임 |
| --- | --- |
| v2.css / v2_brand.css 및 기존 기능별 CSS | 기본 토큰·레이아웃·브랜드·탐색 |
| quiz.css | 퀴즈 레이아웃·선택지·radio 크기 |
| app-components.css | 기존 동적 스타일 36개 구간, 원래 cascade 순서 유지 |
| ui-resilience.css | 긴 프로젝트명으로 모바일 그리드가 넓어지는 문제 보정 |
| style-manifest.json | 이전 구간과 원래 모듈의 대응 목록 |

index.html이 CSS를 정적으로 한 번씩 로드한다. JavaScript는 스타일시트를 만들거나 로드 순서를 바꾸지 않는다. 진행률 등 값에 따른 개별 요소 스타일은 유지한다. 기존 선택자와 !important 우선순위는 보존했으며 전체 디자인 토큰 통합이나 모든 중복 선언 제거를 주장하지 않는다.

직접 로드 자산은 JS 69개, CSS 15개다. 스타일 생성 지점과 MutationObserver는 모두 0개다. 미사용 후보 24개, 중간 CSS 4개, 스타일 이전 후 비어 있는 모듈 2개를 제거했다. 삭제 파일은 Git 이력에서 복원할 수 있으며 기존 독립 HTML은 유지했다.

## 검증 명령과 범위

- `node tests/run.cjs`: 자동검사 27개. 기존 저장·레벨·판단·퀴즈·보안과 정적 CSS 소유권.
- `node tools/check-style-regression.cjs`: 390/768/1440px에서 기본 화면 7개와 LV1~5 맥락/HOW의 geometry·computed style 및 전체 CSS cascade 비교. 의도적인 ui-resilience.css 보정은 제외하고 조작 검사에서 확인한다.
- `node tools/check-browser-flows.cjs`: 같은 너비 3개와 모바일 일반 모션에서 전체 레벨·패널 반복 조작·문의 이동·프로젝트 편집/추가/재로딩·기존 필드 보존·퀴즈 복습/완료·포커스·입력 이스케이프·CSP·가로 넘침. CSS 누락, 저장 차단, 저장 손상 시 안내와 데이터 보존도 확인한다.
- `node tools/audit-runtime.cjs`, `node tools/audit-unused-assets.cjs`, `git diff --check`: 구조와 변경 형식 확인.

브라우저 검사는 로컬 서버와 독립 컨텍스트에서 실행하며 실제 사용자 데이터를 변경하지 않는다. 한글 글꼴을 설치한다. 폰트와 유한 애니메이션 종료 후 native smooth scroll도 고정하여 측정 오탐을 방지한다. Safari/iPad 실기기 검증은 수행하지 않았다.

## 브라우저 설치 장애 해결

Playwright CDN은 프록시 CONNECT timeout/HTTP 502로 실패했다. 시간 제한 증가만으로 해결되지 않았다. Google 공식 Chrome for Testing 원본의 같은 버전 151.0.7922.34를 설치해 해결했다. ZIP MD5 792047b3c2625d7d4b0fc7c4fc67d7ad가 서버 값과 일치했고 버전 출력과 Playwright 실행을 확인했다. 프록시나 보안 설정을 해제하지 않았다.

공식 원본: https://storage.googleapis.com/chrome-for-testing-public/151.0.7922.34/linux64/chrome-headless-shell-linux64.zip

기본 설치 위치가 아니면 CC_CHROMIUM_EXECUTABLE에 실행 파일 경로를 지정한다. 임시 환경이 초기화되면 브라우저와 검증용 한글 글꼴도 다시 설치한다.
