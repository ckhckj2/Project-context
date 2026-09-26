# 척척 — 건축 실무, 물으면 척척

정적 웹앱이다. 기본 사용자 화면은 기존 척척(`index.html`, 배포본에서는 `legacy.html`)이고, 새 척척은 `app/index.html`에 개발 버전으로 보존한다. 시안은 `docs/redesign/preview/index.html`에 별도로 남아 있다.
기존 척척의 홈 또는 검색창에 `관리자 모드로 이동해줘`를 입력하면 개발 버전으로 이동한다. 개발 버전 상단에서 기존 척척으로 돌아올 수 있다. 이 명령은 페이지 이동일 뿐 관리자 권한이나 승급을 부여하지 않는다. 두 버전의 저장 기록은 각각 유지하며 자동으로 합치지 않는다.
기존 홈은 업무 선택과 검색으로 정리했다. 업무를 고르면 프로젝트·단계를 확인하고 기존 상세 안내로 이어진다. [홈 정리 2단계](docs/redesign/stable-home-stage-2.md)에 변경 범위와 검증을 기록한다.

기존 업무 맥락은 현재 위치·첫 행동·앞뒤 설계 단계를 우선 표시한다. [맥락 정리 3단계](docs/redesign/stable-context-stage-3.md)에 화면 범위와 보존 기준을 기록한다.

자연어 사례조사와 도면 수정 표현을 보완하고 태블릿·PC 기준선을 맞췄다. [검색 해석 4단계](docs/redesign/stable-search-stage-4.md)에 재현 사례·검증·지원 범위를 기록한다.

## 시작과 검사

Node.js 22 이상(검증 환경 24), Python 3, Chromium을 사용한다. 런타임 프레임워크나 외부 CDN은 없다. npm 패키지는 개발 검사에만 사용한다.

```sh
npm ci --ignore-scripts
npm run check
npx playwright install --with-deps chromium
npm run check:browser
npm run build:release
python -m http.server 8765 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8765/app/`를 연다. 업무 흐름 시안은 `http://127.0.0.1:8765/docs/redesign/preview/`에 남아 있다.
이미 설치한 Chromium을 쓸 때는 `CC_CHROMIUM_EXECUTABLE`(공통·운영 검사), `CHEOKCHEOK_BROWSER`(시안 검사)에 실행 파일의 절대 경로를 지정한다.

레벨별 화면 검토는 `http://127.0.0.1:8765/docs/redesign/level-preview.html`에서 한다. 검토용 LV5이며 실제 성취를 부여하지 않는다. 새 앱의 분야별 학습은 `app/index.html#/learn`에서 확인한다. 새 성취·풀이 기록은 이 브라우저에 저장한다. 업무는 첫 명시적 저장 후 자동 저장하며 `#/saved`에서 이어간다. [7단계 구현 기록](docs/redesign/stage-7.md)에 형식·충돌·복구 한계를 정리했다.

## 코드를 찾는 순서

| 수정할 내용 | 위치 | 주의 |
| --- | --- | --- |
| 문제·채점·분야별 승급 | `src/content/assessment-bank.mjs`, `src/domain/assessment.mjs`, `src/application/learning-session.mjs` | 기존 퀴즈·성적과 분리; 화면은 `src/ui/learning-view.mjs` |
| 업무 흐름·조건·체크 | `src/application/execution-session.mjs`, `src/ui/execution-view.mjs` | 콘텐츠는 `execution-guides.mjs` / `execution-paths.mjs`; 첫 명시적 저장 전에는 임시 상태 |
| 홈·분류·지원 업무 검색 | `src/application/task-navigation.mjs`, `src/ui/task-navigation.mjs` | 내용은 `src/content/navigation.mjs`, 브라우저 연결은 `app/` |
| 업무 이름·stable ID·분야 | `src/content/catalog.mjs` | 현재 분류 초안. 제목을 바꿔도 ID는 유지 |
| 선행 관계·다음 업무·완료 조건 | `src/domain/workflow.mjs` | DOM·저장소 없이 입력→출력 |
| 획득 레벨 안에서 보기 깊이 선택 | `src/domain/learning.mjs` | 업무 실행·필수 주의는 레벨로 차단하지 않음 |
| 선택·체크·경로 제거 명령 | `src/application/work-session.mjs` | 상태 변경의 단일 소유자. 화면은 복사본만 받음 |
| 첫 저장·내 업무·휴지통·자동 저장 조정 | `src/application/progress-workspace.mjs`, `src/application/persistence-session.mjs` | 전용 키·첫 저장 이후만 업무 저장; 학습은 자동 저장 |
| 저장값 검증·실패 반환 | `src/infrastructure/validated-store.mjs` | 새 앱에 연결; 기존 운영 키는 변경하지 않음 |
| 안전한 텍스트·링크·대화상자 | `src/ui/` | 채점·직접 저장 금지 |
| 제목 굵기·공통 표현 | `src/styles/` | 제목 800, 화면 레이아웃과 분리 |
| 검토용 본문·배치 | `docs/redesign/preview/` | 대표 경로용. 제품 전체 구현으로 복사하지 않음 |
| 기존 운영 기능 | [ARCHITECTURE.md](ARCHITECTURE.md) | 이전 기능의 소유자와 계약 확인 |

## 변경할 때

먼저 [척척 개발 기준](AGENTS.md)을 읽는다. 사용자 지정 우선순위·최소 수정·위험도별 검사·완료 보고 기준을 모든 변경에 적용한다.

1. 위 표에서 책임을 찾고 해당 위치를 수정한다. 버전 번호가 붙은 덮어쓰기 파일을 추가하지 않는다.
2. `npm run check`로 포맷·의존 경계·보안 제한·도메인·저장 회귀·기존 기능을 검사한다.
3. 화면이나 공통 모듈 변경은 브라우저 검사와 육안 검토도 진행한다. 여백을 줄여 콘텐츠를 억지로 넣지 않는다.
4. 검사 예외를 자동 재생성해 통과시키지 않는다. 기존 운영 파일을 이관할 때는 기능별 대체와 회귀 근거를 남긴다.

`npm run build:site`는 기존 index와 별도의 개발 버전을 `dist/`에 복사한다. 필요한 정적 자산·모듈 의존성만 포함하며 저장소 전체·테스트·시안·옛 HTML 스냅샷은 제외한다. 패키지에 두 버전이 있어도 접속한 화면의 코드만 로드한다.
GitHub Actions의 검증을 거친 `main` 릴리스는 `dist-release/`를 Pages에 배포한다. 현재 배포 단위는 두 버전을 포함한 하나의 검증된 산출물이다. 완전히 독립된 개발 버전 배포 파이프라인은 이번 단계에 포함하지 않는다.

상세: [5단계 구현·검증 기록](docs/redesign/stage-5.md) · [4단계 구현·검증 기록](docs/redesign/stage-4.md) · [3단계 구현·검증 기록](docs/redesign/stage-3.md) · [2단계 기록](docs/redesign/stage-2.md) · [설계 합의](docs/redesign/decisions.md) · [보안 원칙](SECURITY.md)

## 기본 화면과 개발 버전 배포

`npm run build:release`는 `dist-release/`에 두 버전과 진입 페이지를 만든다. 기본 루트 주소와 `https://cheokkcheokk.github.io/`는 기존 척척으로 연결된다. `app/` 주소와 유효한 개발 화면 해시 링크는 계속 사용할 수 있다. 기존 프로젝트·성적·상세 안내 링크도 유지한다. 저장소의 개발 도구와 시안은 포함하지 않는다. [기존 척척 전환 1단계](docs/redesign/stable-entry-stage-1.md)에 범위와 검증을 기록한다.
